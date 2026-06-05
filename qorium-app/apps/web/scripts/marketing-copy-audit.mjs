import { readFileSync } from "node:fs";
import { resolve } from "node:path";

const root = resolve(import.meta.dirname, "..");
const files = [
  resolve(root, "src/marketing/data.ts"),
  resolve(root, "src/marketing/MarketingPage.tsx")
];

const bannedPhrases = [
  "this page",
  "the redesign",
  "the homepage now",
  "this section",
  "we redesigned",
  "rebuild",
  "MVP website",
  "sitemap routes",
  "proof architecture",
  "feature-state",
  "founder-locked",
  "coming soon",
  "conversion story",
  "buyer routing",
  "sales-ready",
  "world-class",
  "cutting-edge",
  "next-gen",
  "supercharge"
];

const deprecatedPathPatterns = [
  /\/features(?:\/|")/,
  /\/product\/assessment-library/,
  /\/product\/api/,
  /\/vs\//
];

const failures = [];

for (const file of files) {
  const source = readFileSync(file, "utf8");
  const lower = source.toLowerCase();

  for (const phrase of bannedPhrases) {
    if (lower.includes(phrase.toLowerCase())) {
      failures.push(`${file}: banned public-copy phrase "${phrase}"`);
    }
  }
}

const dataSource = readFileSync(resolve(root, "src/marketing/data.ts"), "utf8");
const allMarketingPathsBody = (dataSource.split("export function allMarketingPaths()")[1] ?? "").split(
  "export function getPageData"
)[0];

for (const pattern of deprecatedPathPatterns) {
  if (pattern.test(allMarketingPathsBody)) {
    failures.push(`allMarketingPaths still appears to emit deprecated path pattern ${pattern}`);
  }
}

if (failures.length) {
  console.error("Marketing copy audit failed:");
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

console.log("Marketing copy audit passed.");
