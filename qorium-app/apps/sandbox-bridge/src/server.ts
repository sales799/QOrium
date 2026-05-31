import cors from "@fastify/cors";
import Fastify from "fastify";
import { z } from "zod";
import { runCode } from "./runner.js";

const requestSchema = z.object({
  language: z.enum(["javascript", "python", "java"]),
  source: z.string().min(1).max(20_000),
  stdin: z.string().max(10_000).default("")
});

export function buildServer() {
  const app = Fastify({ logger: true });
  void app.register(cors, { origin: true });

  app.get("/health", async () => ({ ok: true, service: "qorium-sandbox-bridge", limits: { wallClockMs: 10_000, memoryMb: 256 } }));
  app.post("/run", async (request) => {
    const input = requestSchema.parse(request.body);
    return runCode(input.language, input.source, input.stdin);
  });

  return app;
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const app = buildServer();
  void app.listen({ port: Number(process.env.PORT ?? 4102), host: "0.0.0.0" });
}
