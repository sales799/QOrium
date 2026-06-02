import { describe, expect, it } from "vitest";

import { runCode } from "../apps/sandbox-bridge/src/runner.js";

describe("sandbox runner", () => {
  it("runs Java source through the Docker fallback when local Java is unavailable", async () => {
    const result = await runCode(
      "java",
      'class Main { public static void main(String[] args) { System.out.println("1,2,Fizz"); } }'
    );

    expect(result.exitCode).toBe(0);
    expect(result.stdout).toContain("Fizz");
  }, 180_000);
});
