import { createHash } from "node:crypto";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";

export interface ReasoningTracePayload {
  assessmentId: string;
  questionId: string;
  score: number;
  confidence: number;
  reasoning: string;
  grader: string;
  createdAt: string;
}

export class ReasoningTraceStore {
  private readonly rootDir: string;
  private readonly baseUrl: string;

  constructor(rootDir = process.env.QORIUM_REASONING_TRACE_DIR ?? "artifacts/reasoning-traces", baseUrl = process.env.QORIUM_REASONING_TRACE_BASE_URL ?? "") {
    this.rootDir = resolve(rootDir);
    this.baseUrl = baseUrl.replace(/\/+$/, "");
  }

  async write(payload: ReasoningTracePayload) {
    const body = `${JSON.stringify(payload, null, 2)}\n`;
    const hash = createHash("sha256").update(body).digest("hex");
    const key = [
      safeSegment(payload.assessmentId),
      safeSegment(payload.questionId),
      `${hash}.json`
    ].join("/");
    const path = resolve(this.rootDir, key);
    await mkdir(dirname(path), { recursive: true });
    await writeFile(path, body, { mode: 0o600 });
    return this.baseUrl ? `${this.baseUrl}/${key}` : `file://${path}`;
  }

  async readReasoning(ref: string) {
    if (!ref.startsWith("file://")) return null;
    const path = resolve(ref.slice("file://".length));
    if (!path.startsWith(this.rootDir)) return null;
    const body = JSON.parse(await readFile(path, "utf8")) as Partial<ReasoningTracePayload>;
    return typeof body.reasoning === "string" ? body.reasoning : null;
  }
}

export function createReasoningTraceStore() {
  return new ReasoningTraceStore();
}

function safeSegment(value: string) {
  return value.replace(/[^a-zA-Z0-9._-]/g, "_").slice(0, 128);
}
