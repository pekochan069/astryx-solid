import { readdir, writeFile } from "node:fs/promises";
import { relative, resolve } from "node:path";

const root = resolve(import.meta.dirname, "../../..");
const dist = resolve(root, "packages/core/dist");
const snapshot = resolve(import.meta.dirname, "../fixtures/core-public-signatures.json");

async function collect(directory: string, signatures: Record<string, string>) {
  for (const entry of await readdir(directory, { withFileTypes: true })) {
    const path = resolve(directory, entry.name);
    if (entry.isDirectory()) await collect(path, signatures);
    else if (entry.name.endsWith(".d.ts"))
      signatures[relative(dist, path)] = await Bun.file(path).text();
  }
}

const signatures: Record<string, string> = {};
await collect(dist, signatures);
const serialized = `${JSON.stringify(signatures, Object.keys(signatures).sort(), 2)}\n`;

if (process.env.UPDATE_PUBLIC_SIGNATURES === "1") {
  await writeFile(snapshot, serialized);
} else if (
  !(await Bun.file(snapshot).exists()) ||
  (await Bun.file(snapshot).text()) !== serialized
) {
  throw new Error(
    "Core public signatures changed. Review the generated declarations and run UPDATE_PUBLIC_SIGNATURES=1 bun packages/verification/src/public-signatures.ts to accept them.",
  );
}
