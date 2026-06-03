import { mkdtemp, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { spawn } from "node:child_process";

export type SandboxLanguage = "javascript" | "python" | "java";

export interface SandboxResult {
  stdout: string;
  stderr: string;
  exitCode: number | null;
  durationMs: number;
  timedOut: boolean;
  memoryMb: number;
}

export async function runCode(language: SandboxLanguage, source: string, stdin = ""): Promise<SandboxResult> {
  const dir = await mkdtemp(join(tmpdir(), "qorium-sandbox-"));
  try {
    if (language === "javascript") {
      return await runProcess("node", ["--eval", source], stdin);
    }
    if (language === "python") {
      const file = join(dir, "main.py");
      await writeFile(file, source);
      return await runProcess("python3", [file], stdin);
    }
    const file = join(dir, "Main.java");
    await writeFile(file, source);
    const compiled = await runProcess("javac", [file], "", 10_000);
    if (compiled.exitCode !== 0) {
      if (compiled.stderr.includes("Unable to locate a Java Runtime")) {
        return await runDockerJava(source, stdin);
      }
      return compiled;
    }
    return await runProcess("java", ["-cp", dir, "Main"], stdin);
  } finally {
    await rm(dir, { recursive: true, force: true });
  }
}

function runDockerJava(source: string, stdin: string) {
  const encodedSource = Buffer.from(source, "utf8").toString("base64");
  return runProcess(
    "docker",
    [
      "run",
      "--rm",
      "-i",
      "-e",
      `QORIUM_JAVA_SOURCE_B64=${encodedSource}`,
      "eclipse-temurin:21-jdk",
      "sh",
      "-lc",
      "mkdir -p /work && printf '%s' \"$QORIUM_JAVA_SOURCE_B64\" | base64 -d > /work/Main.java && javac /work/Main.java && java -cp /work Main"
    ],
    stdin,
    120_000
  );
}

function runProcess(command: string, args: string[], stdin: string, timeoutMs = 10_000): Promise<SandboxResult> {
  const started = Date.now();
  const child = spawn(command, args, {
    stdio: ["pipe", "pipe", "pipe"],
    env: { PATH: process.env.PATH ?? "" }
  });
  let stdout = "";
  let stderr = "";
  let timedOut = false;
  const timer = setTimeout(() => {
    timedOut = true;
    child.kill("SIGKILL");
  }, timeoutMs);
  child.stdout.on("data", (chunk) => {
    stdout += chunk.toString();
  });
  child.stderr.on("data", (chunk) => {
    stderr += chunk.toString();
  });
  child.stdin.on("error", (err) => {
    const code = (err as NodeJS.ErrnoException).code;
    if (code !== "EPIPE") {
      stderr += String(err);
    }
  });
  child.stdin.end(stdin);
  return new Promise((resolve) => {
    child.on("error", (err) => {
      clearTimeout(timer);
      resolve({
        stdout,
        stderr: `${stderr}${String(err)}`,
        exitCode: 1,
        durationMs: Date.now() - started,
        timedOut,
        memoryMb: 256
      });
    });
    child.on("close", (exitCode) => {
      clearTimeout(timer);
      resolve({
        stdout,
        stderr,
        exitCode,
        durationMs: Date.now() - started,
        timedOut,
        memoryMb: 256
      });
    });
  });
}
