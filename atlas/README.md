# storyboard-os: how it works

Mapped at 2026-09-25 from commit 6714e4a.

## What this is

14 parts, mostly TypeScript (172 files) and JavaScript (6). Work enters through 3 doors; the busiest is CI, which reaches 11 parts. It publishes to npm.

## What changed since the last map

This is the first map.

## What comes in

1. **CI.** On a pull request; on a push to main touching 11 paths. Runs .github/scripts/check-pack-contents.mjs, .github/scripts/check-site-dist.mjs, apps/cinematic-storyboard/astro.config.mjs and 103 more; checks packages/cinematic-storyboard-domain/src/index.ts, packages/marketing-storyboard-domain/src/index.ts, packages/rpg-storyboard-domain/src/index.ts and 3 more.
2. **Publish to npm.** When a release is published; or by hand. Runs .github/scripts/check-pack-contents.mjs, packages/cinematic-storyboard-domain/package.json, packages/marketing-storyboard-domain/package.json and 105 more; checks packages/cinematic-storyboard-domain/src/index.ts, packages/marketing-storyboard-domain/src/index.ts, packages/rpg-storyboard-domain/src/index.ts and 3 more.
3. **Deploy site to GitHub Pages.** On a push to main touching 6 paths; or by hand. Runs .github/scripts/check-site-dist.mjs, site/astro.config.mjs and site/src/.

## What happens through CI

1. The workflow runs .github/scripts/check-pack-contents.mjs and .github/scripts/check-site-dist.mjs in .github, apps/cinematic-storyboard/astro.config.mjs and apps/cinematic-storyboard/src/ in the site, 13 files in cinematic-storyboard-domain, apps/marketing-storyboard/astro.config.mjs and apps/marketing-storyboard/src/ in the site, 10 files in marketing-storyboard-domain, and 60 files in 6 more parts; it checks packages/cinematic-storyboard-domain/src/index.ts in cinematic-storyboard-domain, packages/marketing-storyboard-domain/src/index.ts in marketing-storyboard-domain, packages/rpg-storyboard-domain/src/index.ts in rpg-storyboard-domain, packages/storyboard-canvas/src/index.ts in storyboard-canvas, packages/storyboard-core/src/index.ts in storyboard-core and packages/storyboard-routing/src/index.ts in storyboard-routing.

## Who reads the results

CI writes nothing this map can see.

## The other doors

**Publish to npm** runs .github/scripts/check-pack-contents.mjs, packages/cinematic-storyboard-domain/package.json, packages/marketing-storyboard-domain/package.json and 105 more, checks packages/cinematic-storyboard-domain/src/index.ts, packages/marketing-storyboard-domain/src/index.ts, packages/rpg-storyboard-domain/src/index.ts and 3 more, publishes to npm, and uploads storyboard-os.cdx.json to the release.

**Deploy site to GitHub Pages** runs .github/scripts/check-site-dist.mjs, site/astro.config.mjs and site/src/, and deploys the site.

## What breaks what

- **storyboard-core** is imported by 6 parts (the site, cinematic-storyboard-domain, the site, marketing-storyboard-domain, the site, rpg-storyboard-domain) and sits on the path of 2 doors.
- **storyboard-canvas** is imported by 3 parts (the site, the site, the site) and sits on the path of 2 doors.
- **cinematic-storyboard-domain** is imported by 1 part (the site) and sits on the path of 2 doors.
- **marketing-storyboard-domain** is imported by 1 part (the site) and sits on the path of 2 doors.
- **rpg-storyboard-domain** is imported by 1 part (the site) and sits on the path of 2 doors.
- **storyboard-routing** is imported by 1 part (the site) and sits on the path of 2 doors.
- **.github** is imported by no other part and sits on the path of 3 doors.
- **the site** is imported by no other part and sits on the path of 2 doors.

## What tends to change together

- **packages/marketing-storyboard-domain/src/frameSignals.ts** and **packages/marketing-storyboard-domain/src/handoff.ts** changed together in 5 of 6 commits, inside the marketing-storyboard-domain part.
- **packages/storyboard-canvas/src/StoryboardCanvas.tsx** and **packages/storyboard-canvas/src/index.ts** changed together in 5 of 6 commits, inside the storyboard-canvas part.
- **apps/rpg-storyboard/src/components/StoryboardCanvas.tsx** and **packages/rpg-storyboard-domain/src/index.ts** changed together in 9 of 12 commits, and the site imports the rpg-storyboard-domain part.
- **apps/rpg-storyboard/src/components/projects/ProjectBoard.tsx** and **packages/rpg-storyboard-domain/src/project.test.ts** changed together in 4 of 6 commits, and the site imports the rpg-storyboard-domain part.
- **packages/marketing-storyboard-domain/src/frameSignals.test.ts** and **packages/marketing-storyboard-domain/src/handoff.test.ts** changed together in 4 of 6 commits, inside the marketing-storyboard-domain part.

2 files changed together with their own tests, as expected.

Confidence is low: fewer than 20 source files reach 10 revisions in the window.

Window: 180 days; a pair counts from 3 shared commits, since 3 source files reach 10 revisions; the floor rises to 10 when 25 do.

## What no test touches

Every code part is imported by at least one test.

## Written but never read

No place this map can see is written, so none goes unread.

## Helpers that look duplicated

These are candidates from names and call order, not a judgement.

- **getFrameProgress** is exported by packages/marketing-storyboard-domain/src/project.ts (marketing-storyboard-domain) and packages/rpg-storyboard-domain/src/project.ts (rpg-storyboard-domain); the two look alike.
- **getProjectProgress** is exported by packages/marketing-storyboard-domain/src/project.ts (marketing-storyboard-domain) and packages/rpg-storyboard-domain/src/project.ts (rpg-storyboard-domain); the two look alike.
- **humanizeConnectionType** is exported by packages/cinematic-storyboard-domain/src/labels.ts (cinematic-storyboard-domain) and packages/marketing-storyboard-domain/src/labels.ts (marketing-storyboard-domain); the two look alike.
- **humanizeFrameType** is exported by packages/cinematic-storyboard-domain/src/labels.ts (cinematic-storyboard-domain) and packages/marketing-storyboard-domain/src/labels.ts (marketing-storyboard-domain); the two look alike.
- **humanizeMissingReason** is exported by packages/cinematic-storyboard-domain/src/labels.ts (cinematic-storyboard-domain) and packages/marketing-storyboard-domain/src/labels.ts (marketing-storyboard-domain); the two look alike.

And 5 more pairs.

## Generated, never hand-edited

Nothing in this repository writes to a tracked place this map can see.

## Hand-authored

People write .github/, apps/cinematic-storyboard/, apps/marketing-storyboard/, apps/rpg-storyboard/, assets/, docs/, the repository root and site/. Nothing in this repository writes to them.

## Where to start

.github/workflows/ci.yml → .github/scripts/check-pack-contents.mjs

Read those in order to follow one pull request end to end.

## What this map cannot see

- 1 read uses a path built at run time and is not named here.
- 15 reads go to a path their caller passes, not to this repository.
- Statistics confidence is low: fewer than 20 source files reach 10 revisions in the window.

Regenerate with `npx --yes @dogfood-lab/atlas map`.
