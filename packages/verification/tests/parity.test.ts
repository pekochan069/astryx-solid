import { describe, expect, it } from "bun:test";

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
