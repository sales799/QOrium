import { integer, jsonb, pgEnum, pgTable, real, text, timestamp, uuid } from "drizzle-orm/pg-core";

export const questionType = pgEnum("question_type", ["mcq", "multi_select", "short_answer", "code_question"]);
export const auditActorType = pgEnum("audit_actor_type", ["system", "recruiter", "candidate", "worker"]);

export const skills = pgTable("skill", {
  id: text("id").primaryKey(),
  parentId: text("parent_id"),
  kind: text("kind").notNull(),
  name: text("name").notNull(),
  slug: text("slug").notNull(),
  tags: jsonb("tags").$type<string[]>().notNull().default([])
});

export const skillAliases = pgTable("skill_alias", {
  id: uuid("id").defaultRandom().primaryKey(),
  skillId: text("skill_id").notNull().references(() => skills.id),
  alias: text("alias").notNull()
});

export const assessments = pgTable("assessment", {
  id: uuid("id").defaultRandom().primaryKey(),
  orgId: text("org_id").notNull().default("demo-org"),
  title: text("title").notNull(),
  candidateEmail: text("candidate_email").notNull().default("candidate@example.com"),
  status: text("status").notNull().default("draft"),
  expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow()
});

export const assessmentQuestions = pgTable("assessment_question", {
  assessmentId: uuid("assessment_id").notNull().references(() => assessments.id),
  questionId: text("question_id").notNull().references(() => questions.id),
  position: integer("position").notNull()
});

export const sections = pgTable("section", {
  id: uuid("id").defaultRandom().primaryKey(),
  assessmentId: uuid("assessment_id").notNull().references(() => assessments.id),
  title: text("title").notNull(),
  position: integer("position").notNull()
});

export const questions = pgTable("question", {
  id: text("id").primaryKey(),
  sectionId: uuid("section_id").references(() => sections.id),
  skillId: text("skill_id").notNull().references(() => skills.id),
  type: questionType("type").notNull(),
  stem: text("stem").notNull(),
  options: jsonb("options").$type<string[]>(),
  correctAnswer: jsonb("correct_answer"),
  explanation: text("explanation").notNull(),
  irtA: real("irt_a").notNull().default(1),
  irtB: real("irt_b").notNull().default(0),
  irtC: real("irt_c").notNull().default(0.25)
});

export const attempts = pgTable("attempt", {
  id: uuid("id").defaultRandom().primaryKey(),
  assessmentId: uuid("assessment_id").notNull().references(() => assessments.id),
  candidateEmail: text("candidate_email").notNull(),
  submittedAt: timestamp("submitted_at", { withTimezone: true })
});

export const answers = pgTable("answer", {
  id: uuid("id").defaultRandom().primaryKey(),
  attemptId: uuid("attempt_id").notNull().references(() => attempts.id),
  questionId: text("question_id").notNull().references(() => questions.id),
  response: jsonb("response").notNull(),
  grade: real("grade"),
  confidence: real("confidence"),
  reasoningTraceRef: text("reasoning_trace_ref")
});

export const auditLog = pgTable("audit_log", {
  id: uuid("id").defaultRandom().primaryKey(),
  orgId: text("org_id").notNull(),
  event: text("event").notNull(),
  actorType: auditActorType("actor_type").notNull(),
  actorId: text("actor_id").notNull(),
  payloadHash: text("payload_hash").notNull(),
  refs: jsonb("refs").$type<Record<string, string>>().notNull().default({}),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow()
});
