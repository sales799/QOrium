import { readdirSync, readFileSync, statSync } from "node:fs";
import { extname, join } from "node:path";

const root = process.cwd();
const ignoredSegments = new Set([
  ".git",
  ".next",
  ".turbo",
  "node_modules",
  "test-results"
]);

const ignoredFiles = new Set([
  "pnpm-lock.yaml",
  "tsconfig.tsbuildinfo"
]);

const scannedExtensions = new Set([
  ".cjs",
  ".css",
  ".env",
  ".example",
  ".js",
  ".json",
  ".md",
  ".mjs",
  ".sql",
  ".ts",
  ".tsx",
  ".txt",
  ".yaml",
  ".yml"
]);

const patterns = [
  { name: "OpenAI API key", regex: /sk-(proj-)?[A-Za-z0-9_-]{32,}/g },
  { name: "Anthropic API key", regex: /sk-ant-[A-Za-z0-9_-]{32,}/g },
  { name: "AWS access key", regex: /AKIA[0-9A-Z]{16}/g },
  { name: "Private key block", regex: /-----BEGIN (?:RSA |EC |OPENSSH |PGP )?PRIVATE KEY-----/g },
  { name: "GitHub token", regex: /gh[pousr]_[A-Za-z0-9_]{36,}/g },
  { name: "Slack token", regex: /xox[baprs]-[A-Za-z0-9-]{20,}/g }
];

const files = walk(root)
  .filter((file) => !file.split("/").some((segment) => ignoredSegments.has(segment)))
  .filter((file) => !ignoredFiles.has(file.split("/").at(-1) ?? ""))
  .filter((file) => scannedExtensions.has(extname(file)) || file.endsWith(".env.example"));

const findings = [];
for (const file of files) {
  const body = readFileSync(join(root, file), "utf8");
  for (const pattern of patterns) {
    const matches = body.matchAll(pattern.regex);
    for (const match of matches) {
      const prefix = body.slice(0, match.index ?? 0);
      const line = prefix.split("\n").length;
      findings.push(`${file}:${line} ${pattern.name}`);
    }
  }
}

if (findings.length > 0) {
  console.error("Secret scan failed:");
  for (const finding of findings) console.error(`- ${finding}`);
  process.exit(1);
}

console.log(`Secret scan OK across ${files.length} tracked/untracked text files.`);

function walk(directory, prefix = "") {
  const entries = readdirSync(directory);
  const files = [];
  for (const entry of entries) {
    if (ignoredSegments.has(entry)) continue;
    const relative = prefix ? `${prefix}/${entry}` : entry;
    const absolute = join(directory, entry);
    const stat = statSync(absolute);
    if (stat.isDirectory()) files.push(...walk(absolute, relative));
    if (stat.isFile()) files.push(relative);
  }
  return files;
}
