import { createHash } from "node:crypto";

export * from "./schema.js";

export interface AuditEvent {
  orgId: string;
  event: string;
  actor: { type: "system" | "recruiter" | "candidate" | "worker"; id: string };
  payload: unknown;
  refs?: Record<string, string>;
}

export interface AuditRecord {
  id: string;
  orgId: string;
  event: string;
  actorType: AuditEvent["actor"]["type"];
  actorId: string;
  payloadHash: string;
  refs: Record<string, string>;
  createdAt: string;
}

export function makeAuditRecord(input: AuditEvent): AuditRecord {
  return {
    id: crypto.randomUUID(),
    orgId: input.orgId,
    event: input.event,
    actorType: input.actor.type,
    actorId: input.actor.id,
    payloadHash: createHash("sha256").update(canonicalJson(input.payload)).digest("hex"),
    refs: input.refs ?? {},
    createdAt: new Date().toISOString()
  };
}

function canonicalJson(value: unknown) {
  return JSON.stringify(value, Object.keys(value as object).sort());
}
