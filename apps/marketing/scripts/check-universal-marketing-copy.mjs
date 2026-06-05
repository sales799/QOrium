import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join, relative } from 'node:path';

const banned = [
  'this page',
  'redesign',
  'proof architecture',
  'feature-state',
  'coming soon',
  'empirically calibrated',
  'certified',
];

const root = new URL('..', import.meta.url).pathname;
const sourceRoot = join(root, 'src');
const files = [];

function walk(dir) {
  for (const entry of readdirSync(dir)) {
    const path = join(dir, entry);
    const stat = statSync(path);
    if (stat.isDirectory()) {
      walk(path);
      continue;
    }
    if (!/\.(ts|tsx|md|mdx)$/.test(path) || /\.test\.tsx?$/.test(path)) continue;
    files.push(relative(root, path));
  }
}

walk(sourceRoot);

const failures = [];

function lineAllowedForPhrase(line, phrase) {
  const trimmed = line.trim();
  if (trimmed.startsWith('//') || trimmed.startsWith('*') || trimmed.startsWith('/*')) return true;

  if (phrase === 'certified' || phrase === 'empirically calibrated') {
    return /\b(never|not|does not|do not|until|no)\b/i.test(line);
  }

  return false;
}

for (const file of files) {
  const text = readFileSync(join(root, file), 'utf8');
  const lines = text.split('\n');

  for (const phrase of banned) {
    for (const [index, line] of lines.entries()) {
      if (!line.toLowerCase().includes(phrase)) continue;
      if (lineAllowedForPhrase(line, phrase)) continue;
      failures.push(`${file}:${index + 1}: banned phrase "${phrase}"`);
    }
  }

  if (/\/solutions\/role\/[^'")\s]+-\d+/.test(text)) {
    failures.push(`${file}: duplicate role suffix route reference`);
  }

  if (/siteConfig\.url\}\/vs\//.test(text) || /href: '\/vs\//.test(text)) {
    failures.push(`${file}: legacy /vs canonical reference`);
  }
}

if (failures.length > 0) {
  console.error(failures.join('\n'));
  process.exit(1);
}

console.log(`Universal marketing copy audit passed (${files.length} files).`);
