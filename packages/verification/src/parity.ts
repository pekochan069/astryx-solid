import { once } from "node:events";
import { mkdir, open, realpath, writeFile } from "node:fs/promises";
import { isAbsolute, relative, resolve } from "node:path";

import { matchesInventoryPattern } from "./inventory-pattern.js";

const root = resolve(import.meta.dirname, "../../..");
const canonicalRoot = await realpath(root);
const ledger = await Bun.file(resolve(root, "docs/parity/dispositions.json")).json();

const args = process.argv.slice(2);
const selectors = new Map<string, string>();

for (let index = 0; index < args.length; index++) {
  const flag = args[index];

  if (flag === "--list") continue;
  if (flag !== "--batch" && flag !== "--package") fail(`Unknown option: ${flag}`);
  if (selectors.has(flag)) fail(`Duplicate option: ${flag}`);

  const selected = args[++index];

  if (!selected || selected.startsWith("--")) fail(`Missing value for ${flag}`);

  selectors.set(flag, selected);
}

const batch = selectors.get("--batch") ?? null;
const packageName = selectors.get("--package") ?? null;

const batches = Object.keys(ledger.batches);
const packages = [...new Set(batches.flatMap((name) => ledger.batches[name].packages))];

function fail(message: string, code = 2): never {
  console.error(message);

  process.exit(code);
}

if (batch && !batches.includes(batch)) fail(`Unknown batch: ${batch}`);
if (packageName && !packages.includes(packageName)) fail(`Unknown package: ${packageName}`);
if (batch && packageName && !ledger.batches[batch].packages.includes(packageName)) {
  fail(`Package ${packageName} is not part of batch ${batch}`);
}

const selectedBatch = batch ?? null;
const selectedBatches = batch
  ? [batch]
  : packageName
    ? Object.keys(ledger.batches).filter((name) =>
        ledger.batches[name].packages.includes(packageName),
      )
    : Object.keys(ledger.batches);
const gates = [...new Set(selectedBatches.flatMap((name) => ledger.batches[name].gates))];

if (args.includes("--list")) {
  console.log(JSON.stringify({ batch: selectedBatch, package: packageName, gates }));
  process.exit(0);
}

const artifacts = resolve(process.env.ASTRYX_PARITY_ARTIFACTS ?? resolve(root, "artifacts/parity"));
await mkdir(artifacts, { recursive: true });

type GateResult = {
  name: string;
  status: "passed" | "failed";
  durationMs: number;
  error?: string;
};

type Inventory = {
  packages: { target: { name: string; path: string }[] };
};

type LedgerDisposition = {
  source?: string;
  batch: string;
  package: string;
  disposition: string;
  rationale?: string;
  approval?: string;
  surfaces?: string[];
  classification?: string[];
  affectedSurfaces?: string[];
  migrationGuidance?: string[];
  evidence?: string[];
};

async function validateCurrentPackageExports(
  inventory: Inventory,
  inventoryPatterns: string[],
  packageNames: string[],
  requireCurrentExports: boolean,
  expected: Set<string>,
) {
  for (const packageName of packageNames) {
    const packageEntry = inventory.packages.target.find(
      (entry: { name: string }) => entry.name === packageName,
    );

    if (!packageEntry) continue;

    const currentPackage = await Bun.file(resolve(root, packageEntry.path)).json();
    const currentExports = Object.keys(currentPackage.exports ?? {});

    if (requireCurrentExports) {
      const uncovered = currentExports.filter(
        (value) => !inventoryPatterns.some((pattern) => matchesInventoryPattern(value, pattern)),
      );

      if (uncovered.length) {
        throw new Error(`Current exports missing inventory patterns: ${uncovered.join(", ")}`);
      }
    }

    for (const currentExport of currentExports) {
      if (inventoryPatterns.some((pattern) => matchesInventoryPattern(currentExport, pattern))) {
        expected.add(currentExport);
      }
    }
  }
}

function requireText(value: unknown, source: string, field: string) {
  if (typeof value !== "string" || value.length === 0) {
    throw new Error(`${source} is missing ${field}`);
  }

  return value;
}

function requireItems(value: string[] | undefined, error: string) {
  if (!value?.length) throw new Error(error);

  return value;
}

async function validateDisposition(
  item: LedgerDisposition,
  allowed: Set<string>,
  assigned: Set<string>,
) {
  const source = requireText(item.source, "Disposition", "source");
  const approval = requireText(item.approval, source, "approval");

  const textFields: Array<"batch" | "package" | "disposition" | "rationale"> = [
    "batch",
    "package",
    "disposition",
    "rationale",
  ];
  for (const field of textFields) requireText(item[field], source, field);

  if (!allowed.has(item.disposition)) throw new Error(`${source} has invalid disposition`);

  const surfaces = requireItems(item.surfaces, `${source} has no assigned surfaces`);
  for (const surface of surfaces) {
    if (assigned.has(surface)) throw new Error(`${surface} has multiple dispositions`);
    assigned.add(surface);
  }

  if (item.disposition !== "implemented") {
    const exceptionFields: Array<"classification" | "affectedSurfaces" | "migrationGuidance"> = [
      "classification",
      "affectedSurfaces",
      "migrationGuidance",
    ];
    for (const field of exceptionFields) {
      requireItems(item[field], `${source} exception is missing ${field}`);
    }
    if (!approval.startsWith("https://github.com/")) {
      throw new Error(`${source} exception has no linked approval`);
    }
    if (
      item.batch === "core-styling-theme" &&
      !/^https:\/\/github\.com\/[^/]+\/[^/]+\/issues\/\d+#issuecomment-\d+$/.test(approval)
    ) {
      throw new Error(`${source} exception has no linked human approval comment`);
    }
  }

  const evidencePaths = requireItems(item.evidence, `${source} has no evidence`);
  for (const evidence of evidencePaths) {
    if (evidence.includes("#")) throw new Error(`${source} evidence anchors are unsupported`);

    const evidencePath = resolve(root, evidence);
    let repoPath: string;

    try {
      repoPath = relative(canonicalRoot, await realpath(evidencePath));
    } catch {
      throw new Error(`${item.source} evidence does not exist in the repository: ${evidence}`);
    }

    if (isAbsolute(repoPath) || repoPath.startsWith("..")) {
      throw new Error(`${item.source} evidence does not exist in the repository: ${evidence}`);
    }
  }
}

async function validateLedger() {
  if (ledger.schemaVersion !== 1 || ledger.baseline.length !== 40) {
    throw new Error("Invalid ledger header");
  }

  const selected: LedgerDisposition[] = ledger.dispositions.filter(
    (item: LedgerDisposition) =>
      (!selectedBatch || item.batch === selectedBatch) &&
      (!packageName || item.package === packageName),
  );

  if (selected.length === 0) throw new Error("Selection has no dispositions");

  const allowed = new Set(["implemented", "approved-incompatible", "not-applicable"]);
  const assigned = new Set<string>();

  for (const item of selected) await validateDisposition(item, allowed, assigned);

  const inventory = await Bun.file(
    resolve(root, "docs/wayfinder/issue-3-parity-inventory.json"),
  ).json();

  if (ledger.baseline !== inventory.source.commit) {
    throw new Error("Ledger baseline does not match inventory source commit");
  }

  const inventoryPatterns = selectedBatches.flatMap(
    (name) => ledger.batches[name].inventoryPatterns,
  );
  const expected = new Set<string>();

  const collect = (value: unknown) => {
    if (
      typeof value === "string" &&
      inventoryPatterns.some((pattern: string) => matchesInventoryPattern(value, pattern))
    ) {
      expected.add(value);
    } else if (Array.isArray(value)) {
      value.forEach(collect);
    } else if (value && typeof value === "object") {
      Object.values(value).forEach(collect);
    }
  };

  collect(inventory);

  await validateCurrentPackageExports(
    inventory,
    inventoryPatterns,
    [...new Set(selectedBatches.flatMap((name) => ledger.batches[name].packages))],
    selectedBatches.some((name) => ledger.batches[name].requireCurrentExports),
    expected,
  );

  const missing = [...expected].filter((surface) => !assigned.has(surface));
  const unknown = [...assigned].filter((surface) => !expected.has(surface));

  if (missing.length || unknown.length) {
    throw new Error(
      `Inventory mismatch; missing: ${missing.join(", ") || "none"}; unknown: ${unknown.join(", ") || "none"}`,
    );
  }
}

const commands: Record<string, string[]> = {
  core: [
    "bun",
    "run",
    "--filter",
    "@astryx-solid/core",
    "check",
    "&&",
    "bun",
    "run",
    "--filter",
    "@astryx-solid/core",
    "test",
    "&&",
    "bun",
    "run",
    "--filter",
    "@astryx-solid/core",
    "build",
  ],
  "core-signatures": ["bun", "packages/verification/src/public-signatures.ts"],
  "packed-consumer": ["bun", "packages/verification/src/packed-consumer.ts"],
  "core-behavior": [
    "bun",
    "--conditions=browser",
    "test",
    "--preload",
    "./packages/core/tests/setup.ts",
    "packages/core/tests/theme/theme.test.ts",
    "packages/core/tests/i18n/i18n.test.ts",
  ],
  build: [
    "bun",
    "run",
    "--filter",
    "@astryx-solid/build",
    "check",
    "&&",
    "bun",
    "run",
    "--filter",
    "@astryx-solid/build",
    "test",
    "&&",
    "bun",
    "run",
    "--filter",
    "@astryx-solid/build",
    "build",
  ],
  "packed-build": ["bun", "packages/verification/src/packed-build-consumer.ts"],
  docs: ["bun", "run", "--filter", "@astryx-solid/docs", "build"],
  browser: ["bun", "run", "--filter", "@astryx-solid/docs", "test:browser"],
};

async function captureOutput(
  stream: ReadableStream<Uint8Array>,
  path: string,
  target: NodeJS.WriteStream,
) {
  const file = await open(path, "w");
  const reader = stream.getReader();

  try {
    for (let chunk = await reader.read(); !chunk.done; chunk = await reader.read()) {
      await file.write(chunk.value);

      if (!target.write(chunk.value)) await once(target, "drain");
    }
  } finally {
    await file.close();
  }
}

const results: GateResult[] = [];

for (const name of gates) {
  const started = performance.now();
  let result: GateResult;

  try {
    if (name === "ledger") {
      await validateLedger();
    } else {
      const command = commands[name];
      const shell = command.includes("&&");

      const child = Bun.spawn(shell ? ["bash", "-lc", command.join(" ")] : command, {
        cwd: root,
        stdout: "pipe",
        stderr: "pipe",
      });

      const [exitCode] = await Promise.all([
        child.exited,
        captureOutput(child.stdout, resolve(artifacts, `${name}.stdout.log`), process.stdout),
        captureOutput(child.stderr, resolve(artifacts, `${name}.stderr.log`), process.stderr),
      ]);

      if (exitCode !== 0) {
        throw new Error(`${name} gate failed; see ${name}.stdout.log and ${name}.stderr.log`);
      }
    }

    result = { name, status: "passed", durationMs: Math.round(performance.now() - started) };
  } catch (error) {
    result = {
      name,
      status: "failed",
      durationMs: Math.round(performance.now() - started),
      error: error instanceof Error ? error.message : String(error),
    };
  }

  results.push(result);
  await writeFile(resolve(artifacts, `${name}.json`), `${JSON.stringify(result, null, 2)}\n`);

  if (result.status === "failed") break;
}

const report = {
  schemaVersion: 1,
  baseline: ledger.baseline,
  selection: { batch: selectedBatch, package: packageName },
  status:
    results.length === gates.length && results.every((gate) => gate.status === "passed")
      ? "passed"
      : "failed",
  generatedAt: new Date().toISOString(),
  gates: results,
};

await writeFile(resolve(artifacts, "report.json"), `${JSON.stringify(report, null, 2)}\n`);
console.log(`Parity ${report.status}: ${artifacts}/report.json`);
process.exit(report.status === "passed" ? 0 : 1);
