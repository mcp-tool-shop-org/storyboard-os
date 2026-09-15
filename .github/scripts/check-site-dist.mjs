#!/usr/bin/env node
/**
 * Post-build proof for the handbook/landing artifact.
 *
 * `astro build` succeeding does not prove public assets landed in dist or
 * that HTML carries the /storyboard-os/ base prefix. Fail closed on miss.
 */
import { existsSync, readdirSync, readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..', '..');
const dist = join(root, 'site', 'dist');

const REQUIRED_FILES = [
  'index.html',
  'favicon.svg',
  'apple-touch-icon.png',
  'og.png',
];

const BASE_NEEDLE = '/storyboard-os/';

if (!existsSync(dist)) {
  console.error('ERROR: site/dist does not exist — run `pnpm --filter site build` first');
  process.exit(1);
}

const missing = REQUIRED_FILES.filter((f) => !existsSync(join(dist, f)));
if (missing.length > 0) {
  console.error(`ERROR: site/dist missing required files: ${missing.join(', ')}`);
  process.exit(1);
}
for (const f of REQUIRED_FILES) {
  console.log(`ok    site/dist/${f}`);
}

function* walkHtml(dir) {
  let entries;
  try {
    entries = readdirSync(dir, { withFileTypes: true });
  } catch (err) {
    throw new Error(`cannot read ${dir}: ${err.message ?? err}`);
  }
  for (const ent of entries) {
    const p = join(dir, ent.name);
    if (ent.isDirectory()) yield* walkHtml(p);
    else if (ent.isFile() && ent.name.endsWith('.html')) yield p;
  }
}

let hits = 0;
let htmlCount = 0;
for (const file of walkHtml(dist)) {
  htmlCount += 1;
  const text = readFileSync(file, 'utf8');
  if (text.includes(BASE_NEEDLE)) hits += 1;
}

if (htmlCount === 0) {
  console.error('ERROR: no HTML files under site/dist');
  process.exit(1);
}
if (hits === 0) {
  console.error(
    `ERROR: built HTML does not reference ${BASE_NEEDLE} (${htmlCount} html file(s) scanned)`,
  );
  process.exit(1);
}

console.log(`ok    ${hits}/${htmlCount} HTML file(s) reference ${BASE_NEEDLE}`);
console.log('site/dist artifact proof passed');
