import { buildServer as buildApi } from "../apps/api/src/server.js";
import { runCode } from "../apps/sandbox-bridge/src/runner.js";
import { GET as securityTxt } from "../apps/web/src/app/.well-known/security.txt/route.js";

const api = buildApi();

void main().catch(async (error) => {
  await api.close();
  throw error;
});

async function main() {
const stats = await api.inject({ method: "GET", url: "/api/v1/skills?stats=true" });
assertEqual(stats.statusCode, 200, "skills stats");
const statsBody = JSON.parse(stats.body) as { total: number };
if (statsBody.total < 150) throw new Error(`Expected >=150 skill nodes, got ${statsBody.total}`);

const cards = await api.inject({ method: "GET", url: "/api/v1/library/cards" });
assertEqual(cards.statusCode, 200, "library cards");
if ((JSON.parse(cards.body) as unknown[]).length !== 25) throw new Error("Expected 25 library cards");

const assessment = await api.inject({
  method: "POST",
  url: "/api/v1/assessments",
  payload: {
    title: "Smoke assessment",
    candidateEmail: "candidate@example.com",
    skillIds: ["engineering.java", "engineering.react"]
  }
});
assertEqual(assessment.statusCode, 201, "assessment create");
const created = JSON.parse(assessment.body) as { token: string; assessment: { questions: Array<{ id: string }> } };

const readback = await api.inject({ method: "GET", url: `/api/v1/assessments/by-token?token=${encodeURIComponent(created.token)}` });
assertEqual(readback.statusCode, 200, "assessment token readback");

const submit = await api.inject({
  method: "POST",
  url: "/api/v1/attempts/submit",
  payload: {
    token: created.token,
    candidateEmail: "candidate@example.com",
    answers: created.assessment.questions.map((question) => ({ questionId: question.id, response: 0 }))
  }
});
assertEqual(submit.statusCode, 201, "attempt submit");
const submitted = JSON.parse(submit.body) as { attempt: { id: string } };

const result = await api.inject({ method: "GET", url: `/api/v1/attempts/${submitted.attempt.id}/result` });
assertEqual(result.statusCode, 200, "attempt result");
const resultBody = JSON.parse(result.body) as { attempt: { answers: Array<{ reasoning?: string; reasoningTraceRef?: string }> } };
if (!resultBody.attempt.answers.every((answer) => answer.reasoningTraceRef)) throw new Error("Expected persisted reasoning trace refs");
if (!resultBody.attempt.answers.every((answer) => answer.reasoning)) throw new Error("Expected hydrated reasoning text");

const audit = await api.inject({ method: "GET", url: "/api/v1/audit-log/sample" });
assertEqual(audit.statusCode, 200, "audit sample");
if ((JSON.parse(audit.body) as { data: unknown[] }).data.length < 2) throw new Error("Expected audit rows");

const security = securityTxt();
assertEqual(security.status, 200, "security.txt");
if (!security.headers.get("content-type")?.includes("text/plain")) throw new Error("security.txt must be text/plain");
const securityText = await security.text();
for (const field of ["Contact:", "Expires:", "Preferred-Languages:", "Canonical:"]) {
  if (!securityText.includes(field)) throw new Error(`security.txt missing ${field}`);
}

const js = await runCode("javascript", "console.log('1,2,Fizz')");
if (!js.stdout.includes("Fizz")) throw new Error(`JavaScript sandbox failed: ${JSON.stringify(js)}`);
const python = await runCode("python", "print('1,2,Fizz')");
if (!python.stdout.includes("Fizz")) throw new Error(`Python sandbox failed: ${JSON.stringify(python)}`);
const java = await runCode("java", "class Main { public static void main(String[] args) { System.out.println(\"1,2,Fizz\"); } }");
if (!java.stdout.includes("Fizz")) throw new Error(`Java sandbox failed: ${JSON.stringify(java)}`);

await api.close();
console.log("Smoke OK: stats, library, assessment, grading, audit, JS/Python/Java sandbox.");
}

function assertEqual(actual: number, expected: number, label: string) {
  if (actual !== expected) throw new Error(`${label}: expected ${expected}, got ${actual}`);
}
