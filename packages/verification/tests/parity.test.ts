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
      gates: ["ledger", "core", "packed-consumer"],
    });
  });

  it("rejects an unknown package", async () => {
    const result = await list("--package", "@astryx-solid/unknown");

    expect(result.exitCode).toBe(2);
    expect(result.stderr).toContain("Unknown package");
  });
});
