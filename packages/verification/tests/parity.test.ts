import { describe, expect, it } from "bun:test";
import { chmod, mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { resolve } from "node:path";

const root = new URL("../../..", import.meta.url).pathname;

async function list(...args: string[]) {
  const process = Bun.spawn(["bun", "packages/verification/src/parity.ts", "--list", ...args], {
    cwd: root,
    stdout: "pipe",
    stderr: "pipe",
  });
  const [stdout, stderr, exitCode] = await Promise.all([
    new Response(process.stdout).text(),
    new Response(process.stderr).text(),
    process.exited,
  ]);
  return { stdout, stderr, exitCode };
}

describe("root parity command", () => {
  it("selects the control-plane batch", async () => {
    const result = await list("--batch", "control-plane");

    expect(result.exitCode).toBe(0);
    expect(JSON.parse(result.stdout)).toEqual({
      batch: "control-plane",
      package: null,
      gates: ["ledger", "core", "packed-consumer", "docs", "browser"],
    });
  });

  it("defaults to the aggregate selection", async () => {
    const result = await list();

    expect(result.exitCode).toBe(0);
    expect(JSON.parse(result.stdout).batch).toBeNull();
  });

  it("rejects a selector without a value", async () => {
    const result = await list("--batch");

    expect(result.exitCode).toBe(2);
    expect(result.stderr).toContain("Missing value for --batch");
  });

  it("selects a known package", async () => {
    const result = await list("--package", "@astryx-solid/core");

    expect(result.exitCode).toBe(0);
    expect(JSON.parse(result.stdout).package).toBe("@astryx-solid/core");
  });

  it("selects the Build package and its applicable gates", async () => {
    const result = await list("--package", "@astryx-solid/build");

    expect(result.exitCode).toBe(0);
    expect(JSON.parse(result.stdout)).toEqual({
      batch: null,
      package: "@astryx-solid/build",
      gates: ["ledger", "build", "packed-build"],
    });
  });

  it("retains subprocess output when a gate fails", async () => {
    const bin = await mkdtemp(resolve(tmpdir(), "astryx-fake-bun-"));
    const artifacts = await mkdtemp(resolve(tmpdir(), "astryx-parity-artifacts-"));
    const fakeBun = resolve(bin, "bun");
    await writeFile(
      fakeBun,
      `#!/bin/sh\ncase "$*" in *packed-build-consumer*) echo useful-diagnostic >&2; exit 42;; esac\nexec "$REAL_BUN" "$@"\n`,
    );
    await chmod(fakeBun, 0o755);

    try {
      const child = Bun.spawn(
        [
          process.execPath,
          "packages/verification/src/parity.ts",
          "--package",
          "@astryx-solid/build",
        ],
        {
          cwd: root,
          env: {
            ...process.env,
            ASTRYX_PARITY_ARTIFACTS: artifacts,
            PATH: `${bin}:${process.env.PATH}`,
            REAL_BUN: process.execPath,
          },
          stdout: "pipe",
          stderr: "pipe",
        },
      );
      const [exitCode] = await Promise.all([
        child.exited,
        new Response(child.stdout).text(),
        new Response(child.stderr).text(),
      ]);
      expect(exitCode).toBe(1);
      expect(await readFile(resolve(artifacts, "packed-build.stderr.log"), "utf8")).toContain(
        "useful-diagnostic",
      );
      expect(
        JSON.parse(await readFile(resolve(artifacts, "packed-build.json"), "utf8")).error,
      ).toContain("packed-build.stderr.log");
    } finally {
      await Promise.all([
        rm(bin, { recursive: true, force: true }),
        rm(artifacts, { recursive: true, force: true }),
      ]);
    }
  });

  it("rejects unknown selectors", async () => {
    const packageResult = await list("--package", "@astryx-solid/unknown");
    const batchResult = await list("--batch", "unknown");
    const optionResult = await list("--bacth", "control-plane");

    expect(packageResult.exitCode).toBe(2);
    expect(packageResult.stderr).toContain("Unknown package");
    expect(batchResult.exitCode).toBe(2);
    expect(batchResult.stderr).toContain("Unknown batch");
    expect(optionResult.exitCode).toBe(2);
    expect(optionResult.stderr).toContain("Unknown option");
  });

  it("rejects duplicate selectors", async () => {
    const result = await list("--batch", "control-plane", "--batch", "control-plane");

    expect(result.exitCode).toBe(2);
    expect(result.stderr).toContain("Duplicate option");
  });
});
