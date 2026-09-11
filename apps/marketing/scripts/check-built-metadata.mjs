import { readdir, readFile } from 'node:fs/promises';
import { resolve, relative } from 'node:path';
const root = resolve('.next/server/app');
async function htmlFiles(directory) {
  const entries = await readdir(directory, { withFileTypes: true });
  const nested = await Promise.all(
    entries.map((entry) =>
      entry.isDirectory()
        ? htmlFiles(resolve(directory, entry.name))
        : entry.name.endsWith('.html')
          ? [resolve(directory, entry.name)]
          : [],
    ),
  );
  return nested.flat();
}
function attribute(tag, name) {
  return tag.match(new RegExp(`\\b${name}=["']([^"']*)["']`, 'i'))?.[1]?.replaceAll('&amp;', '&');
}
const failures = [];
const checked = [];
const skipped = [];
for (const file of await htmlFiles(root)) {
  const html = await readFile(file, 'utf8');
  const tags = html.match(/<(?:link|meta)\b[^>]*>/gi) ?? [];
  const canonical = tags
    .filter((tag) => attribute(tag, 'rel') === 'canonical')
    .map((tag) => attribute(tag, 'href'));
  const social = tags
    .filter((tag) => attribute(tag, 'property') === 'og:url')
    .map((tag) => attribute(tag, 'content'));
  const route = relative(root, file);
  if (!canonical.length) {
    skipped.push(route);
    continue;
  }
  checked.push(route);
  if (canonical.length !== 1 || social.length !== 1 || canonical[0] !== social[0])
    failures.push({ route, canonical, social });
}
if (checked.length < 10)
  failures.push({
    error: 'Expected at least ten built canonical pages; run a complete production build first',
  });
console.log(
  JSON.stringify({ checked: checked.length, skippedWithoutCanonical: skipped, failures }, null, 2),
);
if (failures.length) process.exitCode = 1;
