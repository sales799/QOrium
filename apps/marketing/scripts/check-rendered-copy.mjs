import { readdir, readFile, stat } from 'node:fs/promises';
import path from 'node:path';

const appRoot = path.resolve(new URL('..', import.meta.url).pathname);
const renderedRoot = path.join(appRoot, '.next', 'server', 'app');

const bannedPhrases = [
  'the site',
  'this page',
  'the redesign',
  'the homepage now',
  'this strip',
  'this section',
  'we redesigned',
  'turns into a scannable proof system',
  'flag off',
  'module hidden',
  'feature-state',
  'not yet rendered',
  'without rendering',
  'back-office language',
  'coming soon',
  'beta',
  'conversion story',
  'buyer routing',
  'lead story',
  'proof system',
  'eight-dimension moat',
  'role-graph organization',
  'i/o-psych validation path',
  'world-class',
  'cutting-edge',
  'seamless',
  'leverage',
  'unlock',
  'robust',
  'next-gen',
];

const bannedRegexes = [
  ...bannedPhrases.map((phrase) => ({
    label: phrase,
    regex: new RegExp(`\\b${escapeRegExp(phrase).replaceAll('\\ ', '\\s+')}\\b`, 'i'),
  })),
  { label: 'route into', regex: /\broute\w*\s+\S{0,40}\s*into\b/i },
  { label: 'we redesigned', regex: /\bwe\s+redesigned\b/i },
];

function escapeRegExp(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

async function exists(filePath) {
  try {
    await stat(filePath);
    return true;
  } catch {
    return false;
  }
}

async function collectHtmlFiles(dir) {
  const entries = await readdir(dir, { withFileTypes: true });
  const files = [];

  for (const entry of entries) {
    const entryPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      files.push(...(await collectHtmlFiles(entryPath)));
    } else if (entry.name.endsWith('.html')) {
      files.push(entryPath);
    }
  }

  return files;
}

function snippet(source, index) {
  return source
    .slice(Math.max(0, index - 90), Math.min(source.length, index + 140))
    .replace(/\s+/g, ' ')
    .trim();
}

function visitorCopy(html) {
  return html
    .replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, ' ')
    .replace(/<style\b[^>]*>[\s\S]*?<\/style>/gi, ' ')
    .replace(/<code\b[^>]*>[\s\S]*?<\/code>/gi, ' ');
}

if (!(await exists(renderedRoot))) {
  throw new Error(`Rendered app directory not found: ${renderedRoot}. Run next build first.`);
}

const htmlFiles = await collectHtmlFiles(renderedRoot);
const failures = [];

for (const file of htmlFiles) {
  const html = visitorCopy(await readFile(file, 'utf8'));
  for (const check of bannedRegexes) {
    const match = check.regex.exec(html);
    if (match) {
      failures.push({
        file: path.relative(appRoot, file),
        phrase: check.label,
        snippet: snippet(html, match.index),
      });
    }
  }
}

if (failures.length > 0) {
  console.error('Rendered copy gate failed. Visitor-visible banned phrases found:');
  for (const failure of failures) {
    console.error(`- ${failure.file}: "${failure.phrase}"`);
    console.error(`  ${failure.snippet}`);
  }
  process.exit(1);
}

console.log(`Rendered copy gate passed across ${htmlFiles.length} HTML files.`);
