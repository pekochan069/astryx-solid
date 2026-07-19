import { mkdir, writeFile } from "node:fs/promises";
import { resolve } from "node:path";

const root = resolve(import.meta.dirname, "../../..");
const ledger = await Bun.file(resolve(root, "docs/parity/dispositions.json")).json();
const args = process.argv.slice(2);
const value = (flag: string) => {
  const index = args.indexOf(flag);
  return index === -1 ? null : args[index + 1];
};
const batch = value("--batch");
const packageName = value("--package");
const batches = Object.keys(ledger.batches);
const packages = [...new Set(ledger.dispositions.map((item: { package: string }) => item.package))];

function fail(message: string, code = 2): never {
  console.error(message);
  process.exit(code);
}

if (batch && !batches.includes(batch)) fail(`Unknown batch: ${batch}`);
if (packageName && !packages.includes(packageName)) fail(`Unknown package: ${packageName}`);
if (batch && packageName && !ledger.batches[batch].packages.includes(packageName)) {
  fail(`Package ${packageName} is not part of batch ${batch}`);
}

const selectedBatch = batch ?? (packageName ? null : "control-plane");
const gates = ["ledger", "core", "packed-consumer"];

if (args.includes("--list")) {
  console.log(JSON.stringify({ batch: selectedBatch, package: packageName, gates }));
  process.exit(0);
}

const artifacts = resolve(root, "artifacts/parity");
await mkdir(artifacts, { recursive: true });

type GateResult = {
  name: string;
  status: "passed" | "failed";
  durationMs: number;
  command?: string;
  error?: string;
};

async function validateLedger() {
  if (ledger.schemaVersion !== 1 || ledger.baseline.length !== 40)
    throw new Error("Invalid ledger header");
  const selected = ledger.dispositions.filter(
    (item: { batch: string; package: string }) =>
      (!selectedBatch || item.batch === selectedBatch) &&
      (!packageName || item.package === packageName),
  );
  if (selected.length === 0) throw new Error("Selection has no dispositions");
  const allowed = new Set(["implemented", "approved-incompatible", "not-applicable"]);
  for (const item of selected) {
    for (const field of ["source", "batch", "package", "disposition", "rationale", "approval"]) {
      if (!item[field]) throw new Error(`${item.source ?? "Disposition"} is missing ${field}`);
    }
    if (!allowed.has(item.disposition)) throw new Error(`${item.source} has invalid disposition`);
    if (!item.evidence?.length) throw new Error(`${item.source} has no evidence`);
    for (const evidence of item.evidence) {
      if (!(await Bun.file(resolve(root, evidence.split("#")[0])).exists())) {
        throw new Error(`${item.source} evidence does not exist: ${evidence}`);
      }
    }
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
  "packed-consumer": ["bun", "packages/verification/src/packed-consumer.ts"],
};

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
        stdout: "inherit",
        stderr: "inherit",
      });
      if ((await child.exited) !== 0) throw new Error(`${name} gate failed`);
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
