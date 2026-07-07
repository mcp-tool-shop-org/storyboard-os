# Snapshot Checklist

Storyboard OS surfaces several "current-state" snapshots in user-facing docs and the marketing site — test counts, page counts, package count, app count, and the version string in the landing-page hero badge. These values are **manually maintained** (the site does not currently have a `verify-docs` script). This checklist exists so the next maintainer can find every snapshot location quickly and update them together.

When you change anything that affects these numbers — adding a test, adding a page, bumping a package, shipping a new vertical, releasing a new version — walk this list end-to-end.

## How to compute the current values

```bash
# All from repo root.
pnpm test                       # total test count (sum across packages + apps)
pnpm -r build                   # full build; Astro logs page count per app
ls packages | wc -l             # package count (currently 6: core, rpg-domain,
                                #   marketing-domain, cinematic-domain, canvas, routing)
ls apps | wc -l                 # app count (currently 3: rpg-storyboard,
                                #   marketing-storyboard, cinematic-storyboard)
node -p "require('./package.json').version"   # root version
```

Tip: page count is "all `dist/**/*.html` files across the 3 app builds." `find apps -path '*/dist/*.html' | wc -l` after `pnpm build` is a quick check.

## Where the snapshots live

The list is grouped by file. For each location, the table shows what string to grep for (use this to confirm you have the right line after a future refactor) and which value(s) appear there.

### Root README — `README.md`

| Section | Grep | Values |
|---|---|---|
| Quick Start code block | `pnpm test       # runs all package` | test count |
| Quick Start code block | `pnpm build      # builds all 3 apps` | page count, app count |
| Status block | `937/937 tests passing` | test count |
| Status block | `54/54 pages built` | page count |
| Status block | `6 packages · 3 apps` | package count, app count |

The AUTOGEN-NOTE HTML comments above each location remind you to update; they also document the verify commands inline.

### Root CHANGELOG — `CHANGELOG.md`

| Section | Grep | Values |
|---|---|---|
| `[1.0.3]` → Changed | `609 tests, 54 pages, 6 packages, 3 apps` | all four (historical — leave as-is) |
| `[1.0.2]` → Changed | `603 tests, 54 pages, 6 packages, 3 apps` | all four (historical — leave as-is) |

CHANGELOG entries are **historical** by design — they record the snapshot **at the time of that release**. **Do not retroactively update past CHANGELOG entries.** When you ship a new release, append a new entry with the new totals.

### Site landing page — `site/src/site-config.ts`

| Section | Grep | Values |
|---|---|---|
| `hero.badge` | `Open source · v` (now sourced from root `package.json`) | version |
| `hero.previews` → Verify card | `937 tests · 54 pages · 3 apps` | test count, page count, app count |
| `sections[0].features[last]` → title | `937 tests, three verticals` | test count |
| `sections[2].cards` → Verify before ship | `937 tests + full build` and `6 packages · 3 apps · 54 pages` | all four |

The version badge auto-reads from root `package.json` via a JSON import at build time — bump `package.json` `version` and the hero badge follows automatically. Other snapshots in this file still require manual updates; AUTOGEN-NOTE comments above each block document the verify commands.

### Handbook — `site/src/content/docs/handbook/getting-started.md`

| Section | Grep | Values |
|---|---|---|
| "Verify the build" prose | `Runs all 937 tests + builds all 54 pages` | test count, page count |

### Phase closeout docs — `docs/*-closeout.md`

| File | Grep | Values | Update? |
|---|---|---|---|
| `docs/cinematic-phase-0-closeout.md` | `603 tests, 54 pages, 6 packages, 3 apps` | all four | **NO — historical at Cinematic Phase 0** |
| `docs/cinematic-phase-0-closeout.md` | `Tests:     603/603` (proof summary) | test count | **NO — historical** |
| `docs/marketing-phase-0-closeout.md` | `511 tests, 45 pages, 5 packages, 2 apps` | all four | **NO — historical at Marketing Phase 0** |
| `docs/phase-2-closeout.md`, `docs/phase-1-closeout.md`, `docs/phase-0-closeout.md` | any test/page counts | varies | **NO — historical** |

Each closeout doc carries a top-of-file blockquote that explicitly frames its snapshot values as historical. **Do not retroactively update closeout docs.** They are a record of the state at the time the phase shipped.

## Adding a new snapshot

If you find yourself adding another doc page that quotes one of these numbers, **add an entry to this checklist as part of the same commit**, plus an AUTOGEN-NOTE HTML comment near the snapshot location with a one-liner shell snippet to verify it. The discipline is: every snapshot location must be discoverable from this file. If it isn't, the next release will leave a stale number on a page nobody knew to update.

## Why no verify script

A programmatic verify script would have to know how to count pages across three Astro builds, sum tests across multiple package test suites in different runners, and check version strings in multiple file formats. That belongs in `ci-tooling/` and is out of scope for the docs surface. The AUTOGEN-NOTE + checklist pattern is the explicit interim: it documents intent and surfaces the verify commands inline, without touching CI.
