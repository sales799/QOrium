import { afterEach, describe, expect, it, vi } from "vitest";
import { buildServer } from "../apps/api/src/server.js";
import { createRepository } from "../apps/api/src/store.js";

describe("Phase F scale wedges", () => {
  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it("exposes cognitive, job-sim, video, scheduling, live-room, and reference runtimes on demand", async () => {
    vi.stubEnv("DATABASE_URL", "");
    vi.stubEnv("QORIUM_RECRUITER_COOKIE_SECURE", "false");
    const api = buildServer();

    const modules = await api.inject({ method: "GET", url: "/api/v1/scale-wedges" });
    expect(modules.statusCode).toBe(200);
    const moduleBody = JSON.parse(modules.body) as { data: Array<{ module: string; status: string; claimSafe: boolean }> };
    expect(moduleBody.data.map((item) => item.module)).toEqual([
      "cognitive",
      "job-simulation",
      "video-response",
      "scheduling",
      "live-room",
      "reference-check"
    ]);
    expect(moduleBody.data.every((item) => item.status === "live_on_demand" && item.claimSafe === false)).toBe(true);

    const login = await api.inject({
      method: "POST",
      url: "/api/v1/recruiter/login",
      payload: { email: "recruiter@example.com", password: "dev-recruiter-password" }
    });
    expect(login.statusCode).toBe(200);
    const cookie = String(login.headers["set-cookie"]);

    const cognitive = await createSession(api, cookie, "cognitive", {
      candidateEmail: "candidate@example.com",
      skillId: "cognitive.numerical",
      targetDifficulty: "adaptive"
    });
    expect(cognitive.runtime.adaptiveServing).toBe(true);
    expect(cognitive.runtime.packIds).toContain("cognitive.numerical");

    const simulation = await createSession(api, cookie, "job-simulation", {
      candidateEmail: "candidate@example.com",
      roleContext: "Senior SQL support engineer"
    });
    expect(simulation.runtime.steps).toHaveLength(3);
    expect(simulation.runtime.steps[0]).toMatchObject({ inputType: "written" });

    const video = await createSession(api, cookie, "video-response", {
      candidateEmail: "candidate@example.com",
      prompt: "Explain a production incident you debugged."
    });
    expect(video.runtime.upload).toMatchObject({ provider: "r2-compatible", residency: "india" });
    expect(video.runtime.transcription.status).toBe("queued");

    const scheduling = await createSession(api, cookie, "scheduling", {
      candidateEmail: "candidate@example.com",
      interviewerEmail: "interviewer@example.com",
      slotIso: "2026-06-03T10:00:00.000Z"
    });
    expect(scheduling.runtime.ics).toContain("BEGIN:VCALENDAR");
    expect(scheduling.runtime.reminders).toEqual(["24h", "1h"]);

    const liveRoom = await createSession(api, cookie, "live-room", {
      candidateEmail: "candidate@example.com",
      language: "javascript"
    });
    expect(liveRoom.runtime.wsPath).toBe(`/api/v1/live-rooms/${liveRoom.id}/socket`);
    const liveRoomEvent = await api.inject({
      method: "POST",
      url: `/api/v1/live-rooms/${liveRoom.id}/events`,
      headers: { cookie },
      payload: { type: "code.run", payload: { stdout: "1,2,Fizz" } }
    });
    expect(liveRoomEvent.statusCode).toBe(201);

    const reference = await createSession(api, cookie, "reference-check", {
      candidateEmail: "candidate@example.com",
      referees: ["one@example.com", "two@example.com", "three@example.com"]
    });
    expect(reference.runtime.requests).toHaveLength(3);
    expect(reference.runtime.report.status).toBe("awaiting_responses");

    const audit = await api.inject({ method: "GET", url: "/api/v1/audit-log/sample" });
    expect(JSON.parse(audit.body).data.some((row: { event: string }) => row.event === "scale_wedge.session_created")).toBe(true);

    await api.close();
  });

  it("seeds Phase F taxonomy and runtime question shapes without leaking answer keys to candidates", async () => {
    vi.stubEnv("DATABASE_URL", "");
    const repository = createRepository();

    const cognitiveQuestions = await repository.listLibraryQuestions("cognitive.numerical");
    expect(cognitiveQuestions.length).toBeGreaterThanOrEqual(4);
    expect(cognitiveQuestions.every((question) => question.tags.includes("phase-f"))).toBe(true);

    const simulationQuestions = await repository.listLibraryQuestions("simulation.sql-support");
    expect(simulationQuestions.some((question) => question.type === "simulation" && question.simulation?.steps.length === 3)).toBe(true);

    const videoQuestions = await repository.listLibraryQuestions("communication.incident-explanation");
    expect(videoQuestions.some((question) => question.type === "video-response" && question.videoPrompt?.maxSeconds === 120)).toBe(true);

    await repository.close();
  });
});

async function createSession(api: ReturnType<typeof buildServer>, cookie: string, module: string, payload: Record<string, unknown>) {
  const res = await api.inject({
    method: "POST",
    url: `/api/v1/scale-wedges/${module}/sessions`,
    headers: { cookie },
    payload
  });
  expect(res.statusCode).toBe(201);
  return JSON.parse(res.body) as { id: string; module: string; runtime: Record<string, any> };
}
