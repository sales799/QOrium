import { drizzle } from "drizzle-orm/postgres-js";
import { desc, eq, inArray, sql } from "drizzle-orm";
import postgres from "postgres";
import {
  assessmentQuestions,
  assessments,
  attempts,
  answers,
  auditLog,
  makeAuditRecord,
  questions,
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

export interface QoriumRepository {
  getSkillStats(): Promise<{ total: number; categories: number; skills: number; subSkills: number }>;
  listSkills(limit: number, offset: number): Promise<{ data: SkillNode[]; nextCursor: string | null }>;
  getLibraryCards(): Promise<Array<{ skill: SkillNode; questionCount: number }>>;
  listLibraryQuestions(skillId?: string): Promise<LibraryQuestion[]>;
  createAssessment(input: {
    title: string;
    candidateEmail: string;
    skillIds: string[];
    questionsPerSkill: number;
    expiresAt: Date;
  }): Promise<Assessment>;
  getSkill(id: string): Promise<SkillNode | null>;
  createAssessmentFromSkill(input: {
    skillId: string;
    title: string;
    candidateEmail: string;
    questionLimit: number;
    expiresAt: Date;
  }): Promise<Assessment | null>;
  getAssessment(id: string): Promise<Assessment | null>;
  createAttempt(input: {
    assessmentId: string;
    candidateEmail: string;
    answers: Attempt["answers"];
  }): Promise<Attempt>;
  getAttempt(id: string): Promise<Attempt | null>;
  audit(event: string, payload: unknown, refs?: Record<string, string>, actor?: AuditActor): Promise<AuditRecord>;
  getAuditSample(limit?: number): Promise<AuditRecord[]>;
  close(): Promise<void>;
}

export function createRepository(): QoriumRepository {
  if (process.env.DATABASE_URL) return new PostgresRepository(process.env.DATABASE_URL);
  return new MemoryRepository();
}

class MemoryRepository implements QoriumRepository {
  private readonly assessmentStore = new Map<string, Assessment>();
  private readonly attemptStore = new Map<string, Attempt>();
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
    title: string;
    candidateEmail: string;
    skillIds: string[];
    questionsPerSkill: number;
    expiresAt: Date;
  }) {
    const selected = input.skillIds.flatMap((skillId) =>
      libraryQuestions.filter((question) => question.skillId === skillId).slice(0, input.questionsPerSkill)
    );
    return this.saveAssessment(input.title, input.candidateEmail, selected, input.expiresAt);
  }

  async getSkill(id: string) {
    return skillNodes.find((node) => node.id === id) ?? null;
  }

  async createAssessmentFromSkill(input: {
    skillId: string;
    title: string;
    candidateEmail: string;
    questionLimit: number;
    expiresAt: Date;
  }) {
    const skill = await this.getSkill(input.skillId);
    if (!skill) return null;
    const selected = libraryQuestions.filter((question) => question.skillId === input.skillId).slice(0, input.questionLimit);
    return this.saveAssessment(input.title, input.candidateEmail, selected, input.expiresAt);
  }

  async getAssessment(id: string) {
    return this.assessmentStore.get(id) ?? null;
  }

  async createAttempt(input: { assessmentId: string; candidateEmail: string; answers: Attempt["answers"] }) {
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

  async getAttempt(id: string) {
    return this.attemptStore.get(id) ?? null;
  }

  async audit(event: string, payload: unknown, refs: Record<string, string> = {}, actor: AuditActor = { type: "system", id: "api" }) {
    const record = makeAuditRecord({ orgId: "demo-org", event, actor, payload, refs });
    this.auditStore.push(record);
    return record;
  }

  async getAuditSample(limit = 10) {
    return this.auditStore.slice(-limit);
  }

  async close() {
    // No resources to release for the local fallback.
  }

  private saveAssessment(title: string, candidateEmail: string, selected: LibraryQuestion[], expiresAt: Date) {
    const assessment: Assessment = {
      id: crypto.randomUUID(),
      orgId: "demo-org",
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
    return this.insertAssessment(input.title, input.candidateEmail, selected.map(dbQuestionToLibraryQuestion), input.expiresAt);
  }

  async getSkill(id: string) {
    await this.ensureSeeded();
    const [skill] = await this.db.select().from(skills).where(eq(skills.id, id)).limit(1);
    return skill ? dbSkillToNode(skill) : null;
  }

  async createAssessmentFromSkill(input: {
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
    return this.insertAssessment(input.title, input.candidateEmail, selected.map(dbQuestionToLibraryQuestion), input.expiresAt);
  }

  async getAssessment(id: string) {
    await this.ensureSeeded();
    const [assessment] = await this.db.select().from(assessments).where(eq(assessments.id, id)).limit(1);
    if (!assessment) return null;
    const questionRows = await this.db
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
  }

  async createAttempt(input: { assessmentId: string; candidateEmail: string; answers: Attempt["answers"] }) {
    const [attempt] = await this.db
      .insert(attempts)
      .values({ assessmentId: input.assessmentId, candidateEmail: input.candidateEmail, submittedAt: new Date() })
      .returning();
    if (!attempt) throw new Error("Failed to persist attempt");
    if (input.answers.length > 0) {
      await this.db.insert(answers).values(input.answers.map((answer) => ({
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
  }

  async getAttempt(id: string) {
    const [attempt] = await this.db.select().from(attempts).where(eq(attempts.id, id)).limit(1);
    if (!attempt) return null;
    const answerRows = await this.db.select().from(answers).where(eq(answers.attemptId, id));
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
  }

  async audit(event: string, payload: unknown, refs: Record<string, string> = {}, actor: AuditActor = { type: "system", id: "api" }) {
    const record = makeAuditRecord({ orgId: "demo-org", event, actor, payload, refs });
    await this.db.insert(auditLog).values({
      id: record.id,
      orgId: record.orgId,
      event: record.event,
      actorType: record.actorType,
      actorId: record.actorId,
      payloadHash: record.payloadHash,
      refs: record.refs,
      createdAt: new Date(record.createdAt)
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

  async close() {
    await this.client.end({ timeout: 5 });
  }

  private async insertAssessment(title: string, candidateEmail: string, selected: LibraryQuestion[], expiresAt: Date) {
    const [assessment] = await this.db
      .insert(assessments)
      .values({ title, candidateEmail, expiresAt, status: "draft" })
      .returning();
    if (!assessment) throw new Error("Failed to persist assessment");
    if (selected.length > 0) {
      await this.db.insert(assessmentQuestions).values(selected.map((question, index) => ({
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
    correctAnswer: row.correctAnswer
  };
}

function toDbQuestionType(type: QuestionType) {
  return type.replace(/-/g, "_") as "mcq" | "multi_select" | "short_answer" | "code_question";
}

function fromDbQuestionType(type: "mcq" | "multi_select" | "short_answer" | "code_question"): QuestionType {
  return type.replace(/_/g, "-") as QuestionType;
}

function kindOrder(kind: SkillNode["kind"]) {
  return kind === "category" ? 0 : kind === "skill" ? 1 : 2;
}
