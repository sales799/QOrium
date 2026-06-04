import { drizzle } from "drizzle-orm/postgres-js";
import { and, desc, eq, inArray, sql } from "drizzle-orm";
import postgres from "postgres";
import {
  assessmentQuestions,
  assessments,
  attempts,
  answers,
  auditLog,
  makeAuditRecord,
  questions,
  scaleWedgeSessions,
  skills,
  type AuditRecord
} from "@qorium/db";
import { libraryQuestions, skillNodes, type LibraryQuestion, type QuestionType, type SkillNode } from "@qorium/taxonomy";

export interface Assessment {
  id: string;
  orgId: string;
  title: string;
  candidateEmail: string;
  questions: LibraryQuestion[];
  expiresAt: string;
  createdAt: string;
}

export interface Attempt {
  id: string;
  assessmentId: string;
  candidateEmail: string;
  answers: Array<{ questionId: string; response: unknown; grade?: number; confidence?: number; reasoning?: string; reasoningTraceRef?: string }>;
  submittedAt: string;
}

export type AuditActor = { type: "system" | "recruiter" | "candidate" | "worker"; id: string };
export type ScaleWedgeModule = "cognitive" | "job-simulation" | "video-response" | "scheduling" | "live-room" | "reference-check";
export type ScaleWedgeEvent = { type: string; payload: unknown; createdAt: string };

export interface ScaleWedgeModuleInfo {
  module: ScaleWedgeModule;
  title: string;
  status: "live_on_demand";
  claimSafe: false;
  runtimePath: string;
  guardrail: string;
}

export interface ScaleWedgeSession {
  id: string;
  module: ScaleWedgeModule;
  candidateEmail: string;
  status: "live_on_demand";
  runtime: Record<string, unknown>;
  events: ScaleWedgeEvent[];
  createdAt: string;
  updatedAt: string;
}

export interface QoriumRepository {
  getSkillStats(): Promise<{ total: number; categories: number; skills: number; subSkills: number }>;
  listSkills(limit: number, offset: number): Promise<{ data: SkillNode[]; nextCursor: string | null }>;
  getLibraryCards(): Promise<Array<{ skill: SkillNode; questionCount: number }>>;
  listLibraryQuestions(skillId?: string): Promise<LibraryQuestion[]>;
  createAssessment(input: {
    orgId: string;
    title: string;
    candidateEmail: string;
    skillIds: string[];
    questionsPerSkill: number;
    expiresAt: Date;
  }): Promise<Assessment>;
  getSkill(id: string): Promise<SkillNode | null>;
  createAssessmentFromSkill(input: {
    orgId: string;
    skillId: string;
    title: string;
    candidateEmail: string;
    questionLimit: number;
    expiresAt: Date;
  }): Promise<Assessment | null>;
  getAssessment(id: string, orgId: string): Promise<Assessment | null>;
  createAttempt(input: {
    orgId: string;
    assessmentId: string;
    candidateEmail: string;
    answers: Attempt["answers"];
  }): Promise<Attempt>;
  getAttempt(id: string, orgId: string): Promise<Attempt | null>;
  audit(event: string, payload: unknown, refs?: Record<string, string>, actor?: AuditActor, orgId?: string): Promise<AuditRecord>;
  getAuditSample(limit?: number): Promise<AuditRecord[]>;
  listScaleWedgeModules(): Promise<ScaleWedgeModuleInfo[]>;
  createScaleWedgeSession(input: {
    module: ScaleWedgeModule;
    candidateEmail: string;
    payload: Record<string, unknown>;
  }): Promise<ScaleWedgeSession>;
  getScaleWedgeSession(id: string): Promise<ScaleWedgeSession | null>;
  appendScaleWedgeEvent(id: string, event: Omit<ScaleWedgeEvent, "createdAt">): Promise<ScaleWedgeSession | null>;
  close(): Promise<void>;
}

const scaleWedgeModules: ScaleWedgeModuleInfo[] = [
  {
    module: "cognitive",
    title: "Cognitive / aptitude adaptive runtime",
    status: "live_on_demand",
    claimSafe: false,
    runtimePath: "/api/v1/scale-wedges/cognitive/sessions",
    guardrail: "Use honest model-estimated IRT until reference-panel calibration exists."
  },
  {
    module: "job-simulation",
    title: "Job simulation runtime",
    status: "live_on_demand",
    claimSafe: false,
    runtimePath: "/api/v1/scale-wedges/job-simulation/sessions",
    guardrail: "Publish claims only after three role simulations have live pilot evidence."
  },
  {
    module: "video-response",
    title: "Video response and transcription runtime",
    status: "live_on_demand",
    claimSafe: false,
    runtimePath: "/api/v1/scale-wedges/video-response/sessions",
    guardrail: "Store media through India-resident object storage; grade transcript, not appearance."
  },
  {
    module: "scheduling",
    title: "Interview scheduling runtime",
    status: "live_on_demand",
    claimSafe: false,
    runtimePath: "/api/v1/scale-wedges/scheduling/sessions",
    guardrail: "Use ICS fallback until Google/Microsoft OAuth is live."
  },
  {
    module: "live-room",
    title: "Live coding room runtime",
    status: "live_on_demand",
    claimSafe: false,
    runtimePath: "/api/v1/scale-wedges/live-room/sessions",
    guardrail: "Reuse sandbox execution and persist transcript events before enabling public rooms."
  },
  {
    module: "reference-check",
    title: "Async reference checking runtime",
    status: "live_on_demand",
    claimSafe: false,
    runtimePath: "/api/v1/scale-wedges/reference-check/sessions",
    guardrail: "Never name or expose referees externally without explicit consent."
  }
];

export function createRepository(): QoriumRepository {
  if (process.env.DATABASE_URL) return new PostgresRepository(process.env.DATABASE_URL);
  return new MemoryRepository();
}

class MemoryRepository implements QoriumRepository {
  private readonly assessmentStore = new Map<string, Assessment>();
  private readonly attemptStore = new Map<string, Attempt>();
  private readonly scaleWedgeStore = new Map<string, ScaleWedgeSession>();
  private readonly auditStore: AuditRecord[] = [];

  async getSkillStats() {
    const byKind = skillNodes.reduce<Record<string, number>>((acc, node) => {
      acc[node.kind] = (acc[node.kind] ?? 0) + 1;
      return acc;
    }, {});

    return {
      total: skillNodes.length,
      categories: byKind.category ?? 0,
      skills: byKind.skill ?? 0,
      subSkills: byKind.sub_skill ?? 0
    };
  }

  async listSkills(limit: number, offset: number) {
    return {
      data: skillNodes.slice(offset, offset + limit),
      nextCursor: offset + limit < skillNodes.length ? String(offset + limit) : null
    };
  }

  async getLibraryCards() {
    return skillNodes
      .filter((node) => node.kind === "skill")
      .slice(0, 25)
      .map((skill) => ({
        skill,
        questionCount: libraryQuestions.filter((question) => question.skillId === skill.id).length
      }));
  }

  async listLibraryQuestions(skillId?: string) {
    return skillId ? libraryQuestions.filter((question) => question.skillId === skillId) : libraryQuestions;
  }

  async createAssessment(input: {
    orgId: string;
    title: string;
    candidateEmail: string;
    skillIds: string[];
    questionsPerSkill: number;
    expiresAt: Date;
  }) {
    const selected = input.skillIds.flatMap((skillId) =>
      libraryQuestions.filter((question) => question.skillId === skillId).slice(0, input.questionsPerSkill)
    );
    return this.saveAssessment(input.orgId, input.title, input.candidateEmail, selected, input.expiresAt);
  }

  async getSkill(id: string) {
    return skillNodes.find((node) => node.id === id) ?? null;
  }

  async createAssessmentFromSkill(input: {
    orgId: string;
    skillId: string;
    title: string;
    candidateEmail: string;
    questionLimit: number;
    expiresAt: Date;
  }) {
    const skill = await this.getSkill(input.skillId);
    if (!skill) return null;
    const selected = libraryQuestions.filter((question) => question.skillId === input.skillId).slice(0, input.questionLimit);
    return this.saveAssessment(input.orgId, input.title, input.candidateEmail, selected, input.expiresAt);
  }

  async getAssessment(id: string, orgId: string) {
    const assessment = this.assessmentStore.get(id) ?? null;
    return assessment?.orgId === orgId ? assessment : null;
  }

  async createAttempt(input: { orgId: string; assessmentId: string; candidateEmail: string; answers: Attempt["answers"] }) {
    const assessment = await this.getAssessment(input.assessmentId, input.orgId);
    if (!assessment) throw new Error("Assessment not found for tenant");
    const attempt: Attempt = {
      id: crypto.randomUUID(),
      assessmentId: input.assessmentId,
      candidateEmail: input.candidateEmail,
      answers: input.answers,
      submittedAt: new Date().toISOString()
    };
    this.attemptStore.set(attempt.id, attempt);
    return attempt;
  }

  async getAttempt(id: string, orgId: string) {
    const attempt = this.attemptStore.get(id) ?? null;
    if (!attempt) return null;
    return (await this.getAssessment(attempt.assessmentId, orgId)) ? attempt : null;
  }

  async audit(event: string, payload: unknown, refs: Record<string, string> = {}, actor: AuditActor = { type: "system", id: "api" }, orgId = "demo-org") {
    const record = makeAuditRecord({ orgId, event, actor, payload, refs });
    this.auditStore.push(record);
    return record;
  }

  async getAuditSample(limit = 10) {
    return this.auditStore.slice(-limit);
  }

  async listScaleWedgeModules() {
    return scaleWedgeModules;
  }

  async createScaleWedgeSession(input: { module: ScaleWedgeModule; candidateEmail: string; payload: Record<string, unknown> }) {
    const now = new Date().toISOString();
    const id = crypto.randomUUID();
    const session: ScaleWedgeSession = {
      id,
      module: input.module,
      candidateEmail: input.candidateEmail,
      status: "live_on_demand",
      runtime: buildScaleWedgeRuntime(input.module, input.payload, id),
      events: [],
      createdAt: now,
      updatedAt: now
    };
    this.scaleWedgeStore.set(session.id, session);
    return session;
  }

  async getScaleWedgeSession(id: string) {
    return this.scaleWedgeStore.get(id) ?? null;
  }

  async appendScaleWedgeEvent(id: string, event: Omit<ScaleWedgeEvent, "createdAt">) {
    const session = this.scaleWedgeStore.get(id);
    if (!session) return null;
    const updated: ScaleWedgeSession = {
      ...session,
      events: [...session.events, { ...event, createdAt: new Date().toISOString() }],
      updatedAt: new Date().toISOString()
    };
    this.scaleWedgeStore.set(id, updated);
    return updated;
  }

  async close() {
    // No resources to release for the local fallback.
  }

  private saveAssessment(orgId: string, title: string, candidateEmail: string, selected: LibraryQuestion[], expiresAt: Date) {
    const assessment: Assessment = {
      id: crypto.randomUUID(),
      orgId,
      title,
      candidateEmail,
      questions: selected,
      expiresAt: expiresAt.toISOString(),
      createdAt: new Date().toISOString()
    };
    this.assessmentStore.set(assessment.id, assessment);
    return assessment;
  }
}

type Database = ReturnType<typeof drizzle>;

class PostgresRepository implements QoriumRepository {
  private readonly client: postgres.Sql;
  private readonly db: Database;
  private seeded: Promise<void> | null = null;

  constructor(databaseUrl: string) {
    this.client = postgres(databaseUrl, { max: 5 });
    this.db = drizzle(this.client);
  }

  async getSkillStats() {
    await this.ensureSeeded();
    const rows = await this.db
      .select({ kind: skills.kind, count: sql<number>`count(*)::int` })
      .from(skills)
      .groupBy(skills.kind);
    const byKind = Object.fromEntries(rows.map((row) => [row.kind, row.count]));
    return {
      total: rows.reduce((sum, row) => sum + row.count, 0),
      categories: byKind.category ?? 0,
      skills: byKind.skill ?? 0,
      subSkills: byKind.sub_skill ?? 0
    };
  }

  async listSkills(limit: number, offset: number) {
    await this.ensureSeeded();
    const rows = await this.db.select().from(skills).limit(limit + 1).offset(offset);
    const data = rows.slice(0, limit).map(dbSkillToNode);
    return {
      data,
      nextCursor: rows.length > limit ? String(offset + limit) : null
    };
  }

  async getLibraryCards() {
    await this.ensureSeeded();
    const skillRows = await this.db.select().from(skills).where(eq(skills.kind, "skill")).limit(25);
    const counts = await this.questionCounts(skillRows.map((skill) => skill.id));
    return skillRows.map((skill) => ({
      skill: dbSkillToNode(skill),
      questionCount: counts.get(skill.id) ?? 0
    }));
  }

  async listLibraryQuestions(skillId?: string) {
    await this.ensureSeeded();
    const rows = skillId
      ? await this.db.select().from(questions).where(eq(questions.skillId, skillId))
      : await this.db.select().from(questions);
    return rows.map(dbQuestionToLibraryQuestion);
  }

  async createAssessment(input: {
    orgId: string;
    title: string;
    candidateEmail: string;
    skillIds: string[];
    questionsPerSkill: number;
    expiresAt: Date;
  }) {
    await this.ensureSeeded();
    const selected = (
      await Promise.all(input.skillIds.map((skillId) =>
        this.db.select().from(questions).where(eq(questions.skillId, skillId)).limit(input.questionsPerSkill)
      ))
    ).flat();
    return this.withTenant(input.orgId, (db) =>
      this.insertAssessment(db, input.orgId, input.title, input.candidateEmail, selected.map(dbQuestionToLibraryQuestion), input.expiresAt)
    );
  }

  async getSkill(id: string) {
    await this.ensureSeeded();
    const [skill] = await this.db.select().from(skills).where(eq(skills.id, id)).limit(1);
    return skill ? dbSkillToNode(skill) : null;
  }

  async createAssessmentFromSkill(input: {
    orgId: string;
    skillId: string;
    title: string;
    candidateEmail: string;
    questionLimit: number;
    expiresAt: Date;
  }) {
    await this.ensureSeeded();
    const skill = await this.getSkill(input.skillId);
    if (!skill) return null;
    const selected = await this.db.select().from(questions).where(eq(questions.skillId, input.skillId)).limit(input.questionLimit);
    return this.withTenant(input.orgId, (db) =>
      this.insertAssessment(db, input.orgId, input.title, input.candidateEmail, selected.map(dbQuestionToLibraryQuestion), input.expiresAt)
    );
  }

  async getAssessment(id: string, orgId: string) {
    await this.ensureSeeded();
    return this.withTenant(orgId, async (db) => {
    const [assessment] = await db
      .select()
      .from(assessments)
      .where(and(eq(assessments.id, id), eq(assessments.orgId, orgId)))
      .limit(1);
    if (!assessment) return null;
    const questionRows = await db
      .select({ question: questions })
      .from(assessmentQuestions)
      .innerJoin(questions, eq(assessmentQuestions.questionId, questions.id))
      .where(eq(assessmentQuestions.assessmentId, assessment.id))
      .orderBy(assessmentQuestions.position);
    return {
      id: assessment.id,
      orgId: assessment.orgId,
      title: assessment.title,
      candidateEmail: assessment.candidateEmail,
      questions: questionRows.map((row) => dbQuestionToLibraryQuestion(row.question)),
      expiresAt: assessment.expiresAt.toISOString(),
      createdAt: assessment.createdAt.toISOString()
    };
    });
  }

  async createAttempt(input: { orgId: string; assessmentId: string; candidateEmail: string; answers: Attempt["answers"] }) {
    return this.withTenant(input.orgId, async (db) => {
    const [assessment] = await db
      .select({ id: assessments.id })
      .from(assessments)
      .where(and(eq(assessments.id, input.assessmentId), eq(assessments.orgId, input.orgId)))
      .limit(1);
    if (!assessment) throw new Error("Assessment not found for tenant");
    const [attempt] = await db
      .insert(attempts)
      .values({ assessmentId: input.assessmentId, candidateEmail: input.candidateEmail, submittedAt: new Date() })
      .returning();
    if (!attempt) throw new Error("Failed to persist attempt");
    if (input.answers.length > 0) {
      await db.insert(answers).values(input.answers.map((answer) => ({
        attemptId: attempt.id,
        questionId: answer.questionId,
        response: answer.response,
        grade: answer.grade,
        confidence: answer.confidence,
        reasoningTraceRef: answer.reasoningTraceRef ?? answer.reasoning
      })));
    }
    return {
      id: attempt.id,
      assessmentId: attempt.assessmentId,
      candidateEmail: attempt.candidateEmail,
      answers: input.answers,
      submittedAt: attempt.submittedAt?.toISOString() ?? new Date().toISOString()
    };
    });
  }

  async getAttempt(id: string, orgId: string) {
    return this.withTenant(orgId, async (db) => {
    const [attemptRow] = await db
      .select({ attempt: attempts })
      .from(attempts)
      .innerJoin(assessments, eq(attempts.assessmentId, assessments.id))
      .where(and(eq(attempts.id, id), eq(assessments.orgId, orgId)))
      .limit(1);
    const attempt = attemptRow?.attempt;
    if (!attempt) return null;
    const answerRows = await db.select().from(answers).where(eq(answers.attemptId, id));
    return {
      id: attempt.id,
      assessmentId: attempt.assessmentId,
      candidateEmail: attempt.candidateEmail,
      answers: answerRows.map((answer) => ({
        questionId: answer.questionId,
        response: answer.response,
        grade: answer.grade ?? undefined,
        confidence: answer.confidence ?? undefined,
        reasoningTraceRef: answer.reasoningTraceRef ?? undefined
      })),
      submittedAt: attempt.submittedAt?.toISOString() ?? new Date().toISOString()
    };
    });
  }

  async audit(event: string, payload: unknown, refs: Record<string, string> = {}, actor: AuditActor = { type: "system", id: "api" }, orgId = "demo-org") {
    const record = makeAuditRecord({ orgId, event, actor, payload, refs });
    await this.withTenant(orgId, async (db) => {
    await db.insert(auditLog).values({
      id: record.id,
      orgId: record.orgId,
      event: record.event,
      actorType: record.actorType,
      actorId: record.actorId,
      payloadHash: record.payloadHash,
      refs: record.refs,
      createdAt: new Date(record.createdAt)
    });
    });
    return record;
  }

  async getAuditSample(limit = 10) {
    const rows = await this.db.select().from(auditLog).orderBy(desc(auditLog.createdAt)).limit(limit);
    return rows.reverse().map((row) => ({
      id: row.id,
      orgId: row.orgId,
      event: row.event,
      actorType: row.actorType,
      actorId: row.actorId,
      payloadHash: row.payloadHash,
      refs: row.refs,
      createdAt: row.createdAt.toISOString()
    }));
  }

  async listScaleWedgeModules() {
    return scaleWedgeModules;
  }

  async createScaleWedgeSession(input: { module: ScaleWedgeModule; candidateEmail: string; payload: Record<string, unknown> }) {
    const id = crypto.randomUUID();
    const [session] = await this.db
      .insert(scaleWedgeSessions)
      .values({
        id,
        module: input.module,
        candidateEmail: input.candidateEmail,
        status: "live_on_demand",
        runtime: buildScaleWedgeRuntime(input.module, input.payload, id),
        events: []
      })
      .returning();
    if (!session) throw new Error("Failed to persist scale wedge session");
    return dbScaleWedgeSessionToSession(session);
  }

  async getScaleWedgeSession(id: string) {
    const [session] = await this.db.select().from(scaleWedgeSessions).where(eq(scaleWedgeSessions.id, id)).limit(1);
    return session ? dbScaleWedgeSessionToSession(session) : null;
  }

  async appendScaleWedgeEvent(id: string, event: Omit<ScaleWedgeEvent, "createdAt">) {
    const current = await this.getScaleWedgeSession(id);
    if (!current) return null;
    const events = [...current.events, { ...event, createdAt: new Date().toISOString() }];
    const [updated] = await this.db
      .update(scaleWedgeSessions)
      .set({ events, updatedAt: new Date() })
      .where(eq(scaleWedgeSessions.id, id))
      .returning();
    return updated ? dbScaleWedgeSessionToSession(updated) : null;
  }

  async close() {
    await this.client.end({ timeout: 5 });
  }

  private async insertAssessment(db: Database, orgId: string, title: string, candidateEmail: string, selected: LibraryQuestion[], expiresAt: Date) {
    const [assessment] = await db
      .insert(assessments)
      .values({ orgId, title, candidateEmail, expiresAt, status: "draft" })
      .returning();
    if (!assessment) throw new Error("Failed to persist assessment");
    if (selected.length > 0) {
      await db.insert(assessmentQuestions).values(selected.map((question, index) => ({
        assessmentId: assessment.id,
        questionId: question.id,
        position: index
      })));
    }
    return {
      id: assessment.id,
      orgId: assessment.orgId,
      title: assessment.title,
      candidateEmail: assessment.candidateEmail,
      questions: selected,
      expiresAt: assessment.expiresAt.toISOString(),
      createdAt: assessment.createdAt.toISOString()
    };
  }

  private async withTenant<T>(orgId: string, work: (db: Database) => Promise<T>) {
    return this.db.transaction(async (tx) => {
      await tx.execute(sql`select set_config('app.current_tenant_id', ${orgId}, true)`);
      return work(tx as unknown as Database);
    });
  }

  private async questionCounts(skillIds: string[]) {
    if (skillIds.length === 0) return new Map<string, number>();
    const rows = await this.db
      .select({ skillId: questions.skillId, count: sql<number>`count(*)::int` })
      .from(questions)
      .where(inArray(questions.skillId, skillIds))
      .groupBy(questions.skillId);
    return new Map(rows.map((row) => [row.skillId, row.count]));
  }

  private ensureSeeded() {
    this.seeded ??= this.seed();
    return this.seeded;
  }

  private async seed() {
    const orderedSkills = [...skillNodes].sort((left, right) => kindOrder(left.kind) - kindOrder(right.kind));
    for (const skill of orderedSkills) {
      await this.db.insert(skills).values({
        id: skill.id,
        parentId: skill.parentId,
        kind: skill.kind,
        name: skill.name,
        slug: skill.slug,
        tags: skill.tags
      }).onConflictDoNothing();
    }
    for (const question of libraryQuestions) {
      await this.db.insert(questions).values({
        id: question.id,
        skillId: question.skillId,
        type: toDbQuestionType(question.type),
        stem: question.stem,
        options: question.options,
        correctAnswer: question.correctAnswer,
        bodyJson: questionBodyJson(question),
        explanation: question.explanation,
        irtA: question.irt.a,
        irtB: question.irt.b,
        irtC: question.irt.c
      }).onConflictDoNothing();
    }
  }
}

function dbSkillToNode(row: typeof skills.$inferSelect): SkillNode {
  return {
    id: row.id,
    parentId: row.parentId,
    kind: row.kind as SkillNode["kind"],
    name: row.name,
    slug: row.slug,
    tags: row.tags
  };
}

function dbQuestionToLibraryQuestion(row: typeof questions.$inferSelect): LibraryQuestion {
  const body = row.bodyJson as Partial<LibraryQuestion>;
  return {
    id: row.id,
    skillId: row.skillId,
    type: fromDbQuestionType(row.type),
    difficulty: 1,
    stem: row.stem,
    explanation: row.explanation,
    irt: { a: row.irtA, b: row.irtB, c: row.irtC },
    tags: [],
    options: row.options ?? undefined,
    correctAnswer: row.correctAnswer,
    rubric: body.rubric,
    languageHints: body.languageHints,
    starterCode: body.starterCode,
    testExpectation: body.testExpectation,
    simulation: body.simulation,
    videoPrompt: body.videoPrompt
  };
}

function toDbQuestionType(type: QuestionType) {
  return type.replace(/-/g, "_") as "mcq" | "multi_select" | "short_answer" | "code_question" | "simulation" | "video_response";
}

function fromDbQuestionType(type: "mcq" | "multi_select" | "short_answer" | "code_question" | "simulation" | "video_response"): QuestionType {
  return type.replace(/_/g, "-") as QuestionType;
}

function kindOrder(kind: SkillNode["kind"]) {
  return kind === "category" ? 0 : kind === "skill" ? 1 : 2;
}

function questionBodyJson(question: LibraryQuestion) {
  return {
    ...(question.rubric ? { rubric: question.rubric } : {}),
    ...(question.languageHints ? { languageHints: question.languageHints } : {}),
    ...(question.starterCode ? { starterCode: question.starterCode } : {}),
    ...(question.testExpectation ? { testExpectation: question.testExpectation } : {}),
    ...(question.simulation ? { simulation: question.simulation } : {}),
    ...(question.videoPrompt ? { videoPrompt: question.videoPrompt } : {})
  };
}

function buildScaleWedgeRuntime(module: ScaleWedgeModule, payload: Record<string, unknown>, sessionId = crypto.randomUUID()) {
  const candidateEmail = String(payload.candidateEmail ?? "candidate@example.com");
  if (module === "cognitive") {
    const skillId = String(payload.skillId ?? "cognitive.numerical");
    return {
      adaptiveServing: true,
      packIds: [skillId],
      targetDifficulty: payload.targetDifficulty ?? "adaptive",
      questionTypes: ["mcq"],
      irtLabel: "model_estimated",
      candidateEmail
    };
  }
  if (module === "job-simulation") {
    const roleContext = String(payload.roleContext ?? "IT staffing operations analyst");
    return {
      roleContext,
      scenario: "Handle a realistic role task with evidence, decision, and rollout reasoning.",
      steps: [
        { id: "triage", prompt: "Identify the first signals you would inspect.", inputType: "written", rubric: ["evidence", "failure mode"] },
        { id: "decision", prompt: "Make the defensible decision and explain the trade-off.", inputType: "written", rubric: ["trade-off", "risk"] },
        { id: "rollout", prompt: "Describe the safest implementation or escalation path.", inputType: "written", rubric: ["implementation", "rollback"] }
      ],
      grader: "m4_reasoning_trace"
    };
  }
  if (module === "video-response") {
    return {
      prompt: String(payload.prompt ?? "Explain a production incident you debugged."),
      maxSeconds: 120,
      upload: {
        provider: "r2-compatible",
        residency: "india",
        uploadUrl: `on-demand://qorium-video/${crypto.randomUUID()}`
      },
      transcription: { provider: "whisper", status: "queued" },
      grader: "m4_transcript_only"
    };
  }
  if (module === "scheduling") {
    const slotIso = String(payload.slotIso ?? new Date(Date.now() + 60 * 60 * 1000).toISOString());
    const interviewerEmail = String(payload.interviewerEmail ?? "interviewer@example.com");
    return {
      slotIso,
      interviewerEmail,
      reminders: ["24h", "1h"],
      ics: buildIcs(candidateEmail, interviewerEmail, slotIso),
      oauthMode: "ics_fallback_until_google_ms_oauth"
    };
  }
  if (module === "live-room") {
    return {
      roomId: sessionId,
      language: String(payload.language ?? "javascript"),
      wsPath: `/api/v1/live-rooms/${sessionId}/socket`,
      sandboxBridge: "http://localhost:4102/run",
      transcriptStatus: "persisting_events"
    };
  }
  const referees = Array.isArray(payload.referees) ? payload.referees.map(String).slice(0, 5) : ["referee@example.com"];
  return {
    requests: referees.map((email, index) => ({
      id: `ref-${index + 1}`,
      email,
      status: "pending_consent",
      questionnaire: ["role_context", "work_quality", "reliability", "rehire_signal"]
    })),
    report: { status: "awaiting_responses", sections: ["summary", "risk_flags", "strengths"] }
  };
}

function buildIcs(candidateEmail: string, interviewerEmail: string, slotIso: string) {
  const start = new Date(slotIso);
  const end = new Date(start.getTime() + 30 * 60 * 1000);
  const format = (date: Date) => date.toISOString().replace(/[-:]/g, "").replace(/\.\d{3}Z$/, "Z");
  return [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//QOrium//Interview Scheduling//EN",
    "BEGIN:VEVENT",
    `UID:${crypto.randomUUID()}@qorium.online`,
    `DTSTART:${format(start)}`,
    `DTEND:${format(end)}`,
    `SUMMARY:QOrium interview with ${candidateEmail}`,
    `ATTENDEE:mailto:${candidateEmail}`,
    `ATTENDEE:mailto:${interviewerEmail}`,
    "END:VEVENT",
    "END:VCALENDAR"
  ].join("\r\n");
}

function dbScaleWedgeSessionToSession(row: typeof scaleWedgeSessions.$inferSelect): ScaleWedgeSession {
  return {
    id: row.id,
    module: row.module as ScaleWedgeModule,
    candidateEmail: row.candidateEmail,
    status: "live_on_demand",
    runtime: row.runtime,
    events: row.events,
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString()
  };
}
