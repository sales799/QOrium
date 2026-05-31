import cors from "@fastify/cors";
import Fastify, { type FastifyReply } from "fastify";
import { signAssessmentLink, verifyAssessmentToken } from "@qorium/auth";
import { gradeAnswer } from "@qorium/grader-worker";
import { getLibraryCards, getSkillStats } from "@qorium/taxonomy";
import { z } from "zod";
import { audit, store, type Assessment, type Attempt } from "./store.js";

const createAssessmentSchema = z.object({
  title: z.string().min(3),
  candidateEmail: z.string().email(),
  skillIds: z.array(z.string()).min(1).max(25)
});

const submitSchema = z.object({
  candidateEmail: z.string().email(),
  answers: z.array(z.object({ questionId: z.string(), response: z.unknown() })).min(1)
});

export function buildServer() {
  const app = Fastify({ logger: true });
  void app.register(cors, { origin: true });
  const buckets = new Map<string, { resetAt: number; count: number }>();

  app.addHook("onRequest", async (request, reply) => {
    reply.header("X-Frame-Options", "DENY");
    reply.header("X-Content-Type-Options", "nosniff");
    reply.header("Referrer-Policy", "strict-origin-when-cross-origin");
    const key = request.ip;
    const now = Date.now();
    const bucket = buckets.get(key);
    const current = bucket && bucket.resetAt > now ? bucket : { resetAt: now + 1000, count: 0 };
    current.count += 1;
    buckets.set(key, current);
    reply.header("X-RateLimit-Limit", "20");
    reply.header("X-RateLimit-Remaining", String(Math.max(20 - current.count, 0)));
    if (current.count > 20) {
      reply.header("Retry-After", "1");
      return reply.code(429).send({ error: "Rate limit exceeded" });
    }
  });

  app.get("/health", async () => ({ ok: true, service: "qorium-api", version: "phase1" }));

  app.get("/api/v1/skills", async (request) => {
    const query = request.query as { stats?: string; limit?: string; cursor?: string };
    if (query.stats === "true") return getSkillStats();
    const limit = Math.min(Number(query.limit ?? 50), 100);
    const offset = Number(query.cursor ?? 0);
    return {
      data: store.skills.slice(offset, offset + limit),
      nextCursor: offset + limit < store.skills.length ? String(offset + limit) : null
    };
  });

  app.get("/api/v1/library/cards", async () => getLibraryCards());

  app.get("/api/v1/library/questions", async (request) => {
    const query = request.query as { skillId?: string };
    return {
      data: query.skillId ? store.library.filter((question) => question.skillId === query.skillId) : store.library
    };
  });

  app.post("/api/v1/assessments", async (request, reply) => {
    const input = createAssessmentSchema.parse(request.body);
    const questions = input.skillIds.flatMap((skillId) => store.library.filter((question) => question.skillId === skillId).slice(0, 2));
    const id = crypto.randomUUID();
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
    const assessment: Assessment = {
      id,
      orgId: "demo-org",
      title: input.title,
      candidateEmail: input.candidateEmail,
      questions,
      expiresAt: expiresAt.toISOString(),
      createdAt: new Date().toISOString()
    };
    store.assessments.set(id, assessment);
    const token = signAssessmentLink({ assessmentId: id, exp: expiresAt.getTime() });
    audit("assessment.created", input, { assessmentId: id }, { type: "recruiter", id: "demo-recruiter" });
    return reply.code(201).send({ assessment, shareUrl: `/candidate/${token}`, token });
  });

  app.post("/api/v1/assessments/clone", async (request, reply) => {
    const input = z.object({ skillId: z.string(), candidateEmail: z.string().email().default("candidate@example.com") }).parse(request.body);
    const skill = store.skills.find((node) => node.id === input.skillId);
    if (!skill) return reply.code(404).send({ error: "Skill not found" });
    const questions = store.library.filter((question) => question.skillId === input.skillId).slice(0, 10);
    const id = crypto.randomUUID();
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
    const assessment: Assessment = {
      id,
      orgId: "demo-org",
      title: `${skill.name} assessment`,
      candidateEmail: input.candidateEmail,
      questions,
      expiresAt: expiresAt.toISOString(),
      createdAt: new Date().toISOString()
    };
    store.assessments.set(id, assessment);
    const token = signAssessmentLink({ assessmentId: id, exp: expiresAt.getTime() });
    audit("assessment.cloned_from_library", input, { assessmentId: id, skillId: input.skillId }, { type: "recruiter", id: "demo-recruiter" });
    return reply.code(201).send({ assessment, shareUrl: `/candidate/${token}`, token });
  });

  app.get("/api/v1/assessments/by-token/:token", async (request, reply) => {
    const { token } = request.params as { token: string };
    return readAssessmentByToken(token, reply);
  });

  app.get("/api/v1/assessments/by-token", async (request, reply) => {
    const { token } = z.object({ token: z.string() }).parse(request.query);
    return readAssessmentByToken(token, reply);
  });

  function readAssessmentByToken(token: string, reply: FastifyReply) {
    try {
      const payload = verifyAssessmentToken(token);
      const assessment = store.assessments.get(payload.assessmentId);
      if (!assessment) return reply.code(404).send({ error: "Assessment not found" });
      return { assessment };
    } catch (error) {
      return reply.code(401).send({ error: error instanceof Error ? error.message : "Invalid token" });
    }
  }

  app.post("/api/v1/attempts/:token/submit", async (request, reply) => {
    const { token } = request.params as { token: string };
    return submitAttempt(token, request.body, reply);
  });

  app.post("/api/v1/attempts/submit", async (request, reply) => {
    const body = z.object({ token: z.string() }).passthrough().parse(request.body);
    return submitAttempt(body.token, request.body, reply);
  });

  async function submitAttempt(token: string, body: unknown, reply: FastifyReply) {
    const input = submitSchema.parse(body);
    let assessment: Assessment | undefined;
    try {
      assessment = store.assessments.get(verifyAssessmentToken(token).assessmentId);
    } catch (error) {
      return reply.code(401).send({ error: error instanceof Error ? error.message : "Invalid token" });
    }
    if (!assessment) return reply.code(404).send({ error: "Assessment not found" });

    const graded = [];
    for (const answer of input.answers) {
      const question = assessment.questions.find((item) => item.id === answer.questionId);
      if (!question) continue;
      const result = await gradeAnswer({ question, response: answer.response });
      graded.push({ ...answer, grade: result.score, confidence: result.confidence, reasoning: result.reasoning });
      audit("answer.graded", { questionId: question.id, score: result.score, confidence: result.confidence }, { assessmentId: assessment.id, questionId: question.id }, { type: "worker", id: "grade-answer" });
    }

    const attempt: Attempt = {
      id: crypto.randomUUID(),
      assessmentId: assessment.id,
      candidateEmail: input.candidateEmail,
      answers: graded,
      submittedAt: new Date().toISOString()
    };
    store.attempts.set(attempt.id, attempt);
    audit("attempt.submitted", { answerCount: graded.length }, { assessmentId: assessment.id, attemptId: attempt.id }, { type: "candidate", id: input.candidateEmail });
    return reply.code(201).send({ attempt });
  }

  app.get("/api/v1/attempts/:id/result", async (request, reply) => {
    const { id } = request.params as { id: string };
    const attempt = store.attempts.get(id);
    if (!attempt) return reply.code(404).send({ error: "Attempt not found" });
    const average = attempt.answers.reduce((sum, answer) => sum + (answer.grade ?? 0), 0) / Math.max(attempt.answers.length, 1);
    return { attempt, result: { score: Number(average.toFixed(2)), confidenceBand: average >= 0.75 ? "high" : average >= 0.45 ? "medium" : "low" } };
  });

  app.get("/api/v1/audit-log/sample", async () => ({ data: store.audit.slice(-10) }));

  return app;
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const port = Number(process.env.PORT ?? 4100);
  const app = buildServer();
  void app.listen({ port, host: "0.0.0.0" });
}
