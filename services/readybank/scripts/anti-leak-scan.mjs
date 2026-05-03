// Anti-Leak Engine v0 — Serper.dev-backed crawler for leaked questions.
// Per Constitution SO-9 (24h anti-leak rotation).
//
// What it does (v0):
//   1. Fetch released questions
//   2. For each, take a 12-word phrase from the body
//   3. Query Serper.dev (or skip if no API key) for that phrase
//   4. Score: 0 if no hits; 0.5 if 1-2 hits on known leak hosts; 1.0 if >=3 hits
//   5. Insert content.leak_alerts row for any question with similarity >= 0.5
//
// Mock mode: emits one alert against the first question with similarity 0.0
// to prove the pipeline + alert format works without external calls.
//
// Usage: node --env-file=.env anti-leak-scan.mjs [--mock] [--limit N]

import { createPool } from "@qorium/db";

const args = process.argv.slice(2);
const isMock = args.includes("--mock") || !process.env.SERPER_API_KEY;
const limitIdx = args.indexOf("--limit");
const limit = limitIdx >= 0 ? parseInt(args[limitIdx + 1], 10) : 50;

const LEAK_HOSTS = [
  "reddit.com", "leetcode.com/discuss", "gist.github.com",
  "pastebin.com", "hackerrank.com/community", "codility.com/forum",
  "stackoverflow.com", "geeksforgeeks.org",
];

function severityFor(score) {
  if (score >= 0.9) return "critical";
  if (score >= 0.7) return "high";
  if (score >= 0.4) return "medium";
  return "low";
}

const c = createPool({ applicationName: "anti-leak-scan" });

console.log("[anti-leak] mode=" + (isMock ? "MOCK" : "LIVE") + " limit=" + limit);

const qres = await c.query(
  "SELECT id, body_md, body_json, watermark_id FROM content.questions WHERE status='released' LIMIT $1",
  [limit]
);
console.log("[anti-leak] examining " + qres.rowCount + " released questions");

let alertsRaised = 0;
let questionsScanned = 0;
for (const q of qres.rows) {
  const phrase = (q.body_md || "").split(/\s+/).slice(0, 12).join(" ").trim();
  if (phrase.length < 20) continue;
  questionsScanned++;

  let hits = [], score = 0;
  if (isMock) {
    if (alertsRaised === 0) {
      hits = [{ title: "MOCK pipeline verification", url: "https://example.invalid/mock", host: "example.invalid" }];
      score = 0.5; // mid mock so we exercise the insert path
    }
  } else {
    try {
      const resp = await fetch("https://google.serper.dev/search", {
        method: "POST",
        headers: { "X-API-KEY": process.env.SERPER_API_KEY, "Content-Type": "application/json" },
        body: JSON.stringify({ q: '"' + phrase + '"', num: 10 }),
      });
      if (resp.ok) {
        const data = await resp.json();
        hits = (data.organic || [])
          .filter(r => LEAK_HOSTS.some(host => (r.link || "").includes(host)))
          .map(r => ({ title: r.title, url: r.link, host: new URL(r.link).hostname }));
        if (hits.length >= 3) score = 1.0;
        else if (hits.length >= 1) score = 0.5;
      } else {
        console.error("[anti-leak] Serper.dev returned " + resp.status + " for q=" + q.id);
      }
    } catch (e) {
      console.error("[anti-leak] fetch failed:", e.message);
    }
  }

  if (score >= 0.5) {
    try {
      await c.query(
        "INSERT INTO content.leak_alerts (question_id, source_url, evidence_jsonb, similarity_score, severity, detected_at, status) VALUES ($1, $2, $3, $4, $5, NOW(), 'detected')",
        [
          q.id,
          hits[0]?.url || "unknown",
          JSON.stringify({ hits: hits.slice(0, 5), phrase, mock: isMock }),
          score.toFixed(3),
          severityFor(score),
        ]
      );
      alertsRaised++;
      console.log("  ALERT q=" + q.id.slice(0, 8) + " score=" + score + " sev=" + severityFor(score) + " hits=" + hits.length);
    } catch (e) {
      console.error("[anti-leak] insert failed:", e.message);
    }
  }
}

console.log("[anti-leak] scanned=" + questionsScanned + " alerts=" + alertsRaised);
await c.end();
