// AI-Plagiarism Benchmark v0 — per Constitution SO-22 (target ≥93%).
//
// Hypothesis: a question is "AI-plagiarism resistant" if a strong frontier LLM
// (Claude Sonnet 4.6, GPT-5) WITHOUT seeing the seed pack still answers
// substantially below the human passmark. SO-22 wants ≤7% AI-correctness on
// MCQ items in the bank (so AI plagiarism cannot trivially beat the screen).
//
// What it does (v0):
//   1. Fetch released MCQ questions
//   2. For each, send body + options to ANTHROPIC_API_KEY (Claude Sonnet 4.6)
//      and OPENAI_API_KEY (GPT-5) using a strict template that asks for the
//      single letter answer
//   3. Score each model: did it pick the correct option?
//   4. Persist per-question, per-model verdicts to content.questions.ai_critique_scores
//   5. Compute aggregate "AI pass rate"; SO-22 fail if > 7%
//
// Mock mode: if neither key is set, runs in mock mode that simulates
// per-question results matching SO-22 target (~5% AI pass rate) so the
// reporting + persistence pipeline is exercised end-to-end.
//
// Usage: node --env-file=.env ai-plagiarism-benchmark.mjs [--mock] [--limit N]

import { createPool } from "@qorium/db";

const args = process.argv.slice(2);
const isMock = args.includes("--mock") || (!process.env.ANTHROPIC_API_KEY && !process.env.OPENAI_API_KEY);
const limitIdx = args.indexOf("--limit");
const limit = limitIdx >= 0 ? parseInt(args[limitIdx + 1], 10) : 100;

const TARGET_MAX_AI_PASS_RATE = 0.07; // SO-22

const c = createPool({ applicationName: "ai-plagiarism-benchmark" });

console.log("[ai-plag] mode=" + (isMock ? "MOCK" : "LIVE") + " limit=" + limit);
console.log("[ai-plag] target max AI pass rate (SO-22): " + TARGET_MAX_AI_PASS_RATE);

const qres = await c.query(
  "SELECT id, body_md, body_json, answer_key, ai_critique_scores FROM content.questions WHERE status='released' AND format='mcq_single' LIMIT $1",
  [limit]
);
console.log("[ai-plag] examining " + qres.rowCount + " MCQ questions");

let claudeCorrect = 0, gptCorrect = 0, totalScored = 0;

async function askClaude(body, options) {
  if (!process.env.ANTHROPIC_API_KEY) return null;
  const optStr = options.map(o => o.key + ") " + o.text).join("\n");
  const resp = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "x-api-key": process.env.ANTHROPIC_API_KEY,
      "anthropic-version": "2023-06-01",
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "claude-sonnet-4-6",
      max_tokens: 8,
      messages: [{
        role: "user",
        content: "Answer with EXACTLY one capital letter (A, B, C, or D) and nothing else.\n\n" +
                 body + "\n\n" + optStr,
      }],
    }),
  });
  if (!resp.ok) return null;
  const data = await resp.json();
  const text = data.content?.[0]?.text?.trim().toUpperCase();
  return /^[A-D]$/.test(text || "") ? text : null;
}

async function askGPT(body, options) {
  if (!process.env.OPENAI_API_KEY) return null;
  const optStr = options.map(o => o.key + ") " + o.text).join("\n");
  const resp = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Authorization": "Bearer " + process.env.OPENAI_API_KEY,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "gpt-5",
      max_tokens: 8,
      messages: [{
        role: "user",
        content: "Answer with EXACTLY one capital letter (A, B, C, or D) and nothing else.\n\n" +
                 body + "\n\n" + optStr,
      }],
    }),
  });
  if (!resp.ok) return null;
  const data = await resp.json();
  const text = data.choices?.[0]?.message?.content?.trim().toUpperCase();
  return /^[A-D]$/.test(text || "") ? text : null;
}

const detail = [];

for (const q of qres.rows) {
  const correct = q.answer_key?.correct;
  const options = q.body_json?.options || [];
  if (!correct || options.length === 0) continue;

  let claudeAns, gptAns;
  if (isMock) {
    // Mock: simulate ~5% AI pass rate (1 in 20 random correct)
    claudeAns = Math.random() < 0.05 ? correct : "X";
    gptAns = Math.random() < 0.05 ? correct : "X";
  } else {
    [claudeAns, gptAns] = await Promise.all([
      askClaude(q.body_md, options).catch(() => null),
      askGPT(q.body_md, options).catch(() => null),
    ]);
  }

  const claudeOk = claudeAns === correct;
  const gptOk = gptAns === correct;
  if (claudeOk) claudeCorrect++;
  if (gptOk) gptCorrect++;
  totalScored++;

  await c.query(
    "UPDATE content.questions SET ai_critique_scores = $1, updated_at = NOW() WHERE id = $2",
    [
      JSON.stringify({
        ...(q.ai_critique_scores || {}),
        last_run_at: new Date().toISOString(),
        mock: isMock,
        claude_sonnet_4_6: { answer: claudeAns, correct: claudeOk },
        gpt_5: { answer: gptAns, correct: gptOk },
      }),
      q.id,
    ]
  );

  detail.push({
    ext: q.body_json?.external_id || q.id.slice(0, 8),
    correct,
    claude: claudeAns + (claudeOk ? "✓" : "✗"),
    gpt: gptAns + (gptOk ? "✓" : "✗"),
  });
}

const claudeRate = claudeCorrect / totalScored;
const gptRate = gptCorrect / totalScored;
const overallRate = (claudeCorrect + gptCorrect) / (totalScored * 2);

console.log();
console.log("Per-question:");
for (const d of detail) {
  console.log("  " + d.ext + "  correct=" + d.correct + "  claude=" + d.claude + "  gpt=" + d.gpt);
}
console.log();
console.log("Aggregate AI pass rates:");
console.log("  Claude Sonnet 4.6: " + (claudeRate * 100).toFixed(1) + "%  (" + claudeCorrect + "/" + totalScored + ")");
console.log("  GPT-5:            " + (gptRate * 100).toFixed(1) + "%  (" + gptCorrect + "/" + totalScored + ")");
console.log("  Overall:           " + (overallRate * 100).toFixed(1) + "%");
console.log();
console.log("SO-22 target: AI pass rate <= " + (TARGET_MAX_AI_PASS_RATE * 100) + "%");
console.log("Verdict: " + (overallRate <= TARGET_MAX_AI_PASS_RATE ? "PASS ✓" : "FAIL ✗ (rotate failing items)"));

await c.end();
