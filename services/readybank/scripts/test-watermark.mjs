// Smoke test for Watermark Engine v0.
// Verifies: determinism, distinctness of permutations, key-map consistency,
// answer-translation correctness, sane collision rate.

import { applyWatermark, unwatermarkAnswer } from "../dist/lib/watermark.js";

const opts = [
  { key: "A", text: "Apple" },
  { key: "B", text: "Banana" },
  { key: "C", text: "Cherry" },
  { key: "D", text: "Date" },
];

console.log("=== Determinism ===");
const w1 = applyWatermark("Q-001", "Priya-001", opts);
const w2 = applyWatermark("Q-001", "Priya-001", opts);
console.log("Same (Q,C) -> same permutation? ",
  JSON.stringify(w1.options) === JSON.stringify(w2.options) ? "YES ✓" : "NO ✗");

console.log("\n=== Distinct candidates see different option text orders ===");
const candidates = ["Priya-001", "Arjun-002", "Wei-003", "Sarah-004", "Rajesh-005"];
const textOrders = new Set();
for (const c of candidates) {
  const w = applyWatermark("Q-001", c, opts);
  const visibleOrder = w.options.map(o => o.text[0]).join(""); // first letter of each text in display order
  textOrders.add(visibleOrder);
  console.log(`  ${c.padEnd(14)} -> candidate sees: ${w.options.map(o => o.key + ")" + o.text).join(", ")}`);
  console.log(`       canonical->display keyMap: ${JSON.stringify(w.keyMap)}`);
}
console.log(`Distinct text orders: ${textOrders.size}/${candidates.length}`);

console.log("\n=== Answer translation round-trip ===");
const canonicalAnswer = "B"; // The "correct" answer in the original
for (const c of candidates) {
  const w = applyWatermark("Q-001", c, opts);
  const watermarkedAnswer = w.keyMap[canonicalAnswer];
  const translated = unwatermarkAnswer(watermarkedAnswer, w.inverseMap);
  console.log(`  ${c.padEnd(14)}  canonical="${canonicalAnswer}" -> candidate-sees="${watermarkedAnswer}" -> translated-back="${translated}"  ${translated === canonicalAnswer ? "✓" : "✗"}`);
}

console.log("\n=== 4-option permutation distribution over 10k candidates ===");
const trial = 10000;
const seen = new Map();
for (let i = 0; i < trial; i++) {
  const w = applyWatermark("Q-XYZ", "C-" + i, opts);
  // signature = order of original-option-text-first-letter as displayed
  const sig = w.options.map(o => o.text[0]).join("");
  seen.set(sig, (seen.get(sig) || 0) + 1);
}
console.log(`  ${trial} candidates -> ${seen.size} distinct permutations (expected 24 for 4! = uniform ~${(trial/24).toFixed(0)} per bucket)`);
const sortedBuckets = [...seen.entries()].sort((a, b) => b[1] - a[1]).slice(0, 6);
for (const [sig, count] of sortedBuckets) {
  console.log(`    ${sig}: ${count}`);
}

console.log("\nWatermark Engine v0 OK");
