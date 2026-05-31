import { makeAuditRecord, type AuditRecord } from "@qorium/db";
import { libraryQuestions, skillNodes, type LibraryQuestion } from "@qorium/taxonomy";

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
  answers: Array<{ questionId: string; response: unknown; grade?: number; confidence?: number; reasoning?: string }>;
  submittedAt: string;
}

export const store = {
  skills: skillNodes,
  library: libraryQuestions,
  assessments: new Map<string, Assessment>(),
  attempts: new Map<string, Attempt>(),
  audit: [] as AuditRecord[]
};

type AuditActor = { type: "system" | "recruiter" | "candidate" | "worker"; id: string };

export function audit(event: string, payload: unknown, refs: Record<string, string> = {}, actor: AuditActor = { type: "system", id: "api" }) {
  const record = makeAuditRecord({
    orgId: "demo-org",
    event,
    actor,
    payload,
    refs
  });
  store.audit.push(record);
  return record;
}
