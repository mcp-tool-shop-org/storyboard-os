#!/usr/bin/env node
/**
 * Packed-tarball contents proof for the six @storyboard-os/* publish targets.
 *
 * npm/pnpm silently drop `files` entries that are missing on disk, so a
 * files field is not proof the tarball carries README, LICENSE, or dist.
 * After build:packages: fail if any required path is missing on disk, then
 * `pnpm pack --dry-run` and require those same paths in the printed listing.
 */
import { spawnSync } from 'node:child_process';
import { existsSync, readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..', '..');

const PACKAGES = [
  'packages/storyboard-core',
  'packages/storyboard-routing',
  'packages/storyboard-canvas',
  'packages/rpg-storyboard-domain',
  'packages/marketing-storyboard-domain',
  'packages/cinematic-storyboard-domain',
];

const REQUIRED = [
  'README.md',
  'LICENSE',
  'dist/index.js',
  'dist/index.cjs',
  'dist/index.d.ts',
];

const PACK_TIMEOUT_MS = 60_000;

function normalizePackPath(raw) {
  if (typeof raw !== 'string') return null;
  const path = raw
    .replace(/\r$/, '')
    .replace(/\\/g, '/')
    .replace(/^npm notice\s+/i, '')
    .replace(/^\d+(?:\.\d+)?[kKmMgGtT]?[iI]?[bB]\s+/, '')
    .replace(/^\.\//, '')
    .replace(/^package\//, '')
    .trim();
  if (!path || path === '.') return null;
  return path;
}

/** Paths between "Tarball Contents" and "Tarball Details" in pack --dry-run output. */
function packedPathsFromListing(listing) {
  const paths = new Set();
  let inContents = false;
  for (const raw of String(listing).split(/\r?\n/)) {
    const stripped = raw.replace(/^npm notice\s+/i, '').trim();
    if (/^Tarball Contents\b/i.test(stripped)) {
      inContents = true;
      continue;
    }
    if (/^Tarball Details\b/i.test(stripped)) {
      inContents = false;
      continue;
    }
    if (!inContents) continue;
    const path = normalizePackPath(stripped);
    if (path && !path.includes(' ')) paths.add(path);
  }
  return paths;
}

function inTarball(fileSet, path) {
  return fileSet.has(path) || fileSet.has(`package/${path}`);
}

function runPackDryRun(dir) {
  const result = spawnSync('pnpm pack --dry-run', {
    cwd: dir,
    encoding: 'utf8',
    timeout: PACK_TIMEOUT_MS,
    shell: true,
  });
  const listing = `${result.stdout ?? ''}\n${result.stderr ?? ''}`;
  if (result.error) {
    const timedOut = result.error.code === 'ETIMEDOUT';
    throw new Error(
      timedOut
        ? `pnpm pack --dry-run timed out after ${PACK_TIMEOUT_MS}ms`
        : `pnpm pack --dry-run failed: ${result.error.message}`,
    );
  }
  if (result.status !== 0) {
    throw new Error(
      listing.trim() || `pnpm pack --dry-run exited ${result.status}`,
    );
  }
  return listing;
}

const failures = [];

for (const rel of PACKAGES) {
  const dir = join(root, rel);
  const pkgJsonPath = join(dir, 'package.json');
  if (!existsSync(pkgJsonPath)) {
    failures.push({ name: rel, missing: [`package.json not found at ${rel}`] });
    console.log(`FAIL  ${rel} — package.json not found`);
    continue;
  }

  const pkg = JSON.parse(readFileSync(pkgJsonPath, 'utf8'));
  const name = pkg.name ?? rel;
  const missing = [];

  const missingOnDisk = REQUIRED.filter((f) => !existsSync(join(dir, f)));
  if (missingOnDisk.length > 0) {
    missing.push(...missingOnDisk.map((f) => `${f} (on disk)`));
    console.log(`FAIL  ${name} — missing on disk: ${missingOnDisk.join(', ')}`);
  }

  let listing;
  try {
    listing = runPackDryRun(dir);
  } catch (err) {
    missing.push(String(err.message ?? err).split('\n')[0]);
    failures.push({ name, missing });
    console.log(`FAIL  ${name} — ${String(err.message ?? err).split('\n')[0]}`);
    continue;
  }

  const fileSet = packedPathsFromListing(listing);
  if (fileSet.size === 0) {
    missing.push('could not parse Tarball Contents from pnpm pack --dry-run');
    failures.push({ name, missing });
    console.log(`FAIL  ${name} — empty/unparsed pack listing`);
    console.log(listing.trim());
    continue;
  }

  const missingInTarball = REQUIRED.filter((f) => !inTarball(fileSet, f));
  if (missingInTarball.length > 0) {
    missing.push(...missingInTarball.map((f) => `${f} (tarball)`));
    console.log(
      `FAIL  ${name} — tarball missing: ${missingInTarball.join(', ')}`,
    );
    console.log(listing.trim());
  }

  if (missing.length > 0) {
    failures.push({ name, missing });
    continue;
  }

  console.log(`ok    ${name} — ${REQUIRED.join(', ')} on disk and in tarball`);
}

if (failures.length > 0) {
  console.error(
    `\n${failures.length} package(s) failed packed-tarball contents proof:`,
  );
  for (const f of failures) {
    console.error(`  - ${f.name}: ${f.missing.join(', ')}`);
  }
  console.error(
    '\nHint: npm/pnpm silently drop `files` entries that do not exist on disk.\n' +
      'Run `pnpm run build:packages` first; each of the six @storyboard-os/*\n' +
      'package dirs must contain README.md, LICENSE, dist/index.js,\n' +
      'dist/index.cjs, and dist/index.d.ts, and `pnpm pack --dry-run` must\n' +
      'list those paths.',
  );
  process.exit(1);
}

console.log(
  `\nALL ${PACKAGES.length} @storyboard-os/* packages carry ${REQUIRED.join(' + ')} on disk and in the packed tarball.`,
);
