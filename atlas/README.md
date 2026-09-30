# storyboard-os: how it works

Mapped at 2026-09-30 from commit 736766f by Atlas 1.24.0.

## What this is

14 parts, mostly TypeScript (175 files), Astro (19), JavaScript (6) and CSS (2). Work enters through 9 doors; the busiest is CI, which reaches 11 parts. It publishes @storyboard-os/cinematic-domain (packages/cinematic-storyboard-domain), @storyboard-os/marketing-domain (packages/marketing-storyboard-domain), @storyboard-os/rpg-domain (packages/rpg-storyboard-domain), @storyboard-os/canvas (packages/storyboard-canvas), @storyboard-os/core (packages/storyboard-core) and @storyboard-os/routing (packages/storyboard-routing) to npm. It deploys a site to GitHub Pages. People import @storyboard-os/canvas, @storyboard-os/cinematic-domain, @storyboard-os/core, @storyboard-os/marketing-domain, @storyboard-os/routing and @storyboard-os/rpg-domain.

## What changed since 2026-09-25 (6714e4a)

- CI's push trigger now also names `codecov.yml`.
- Publish to npm no longer runs packages/cinematic-storyboard-domain/package.json, packages/marketing-storyboard-domain/package.json, packages/rpg-storyboard-domain/package.json and 3 more.
- @storyboard-os/cinematic-domain (packages/cinematic-storyboard-domain/package.json) is a new package. It loads packages/cinematic-storyboard-domain/schema/production-brief.json and packages/cinematic-storyboard-domain/src/index.ts.
- And 5 more changes to doors.
- packages/cinematic-storyboard-domain/package.json is now also read by .github/workflows/publish.yml.
- packages/marketing-storyboard-domain/package.json is now also read by .github/workflows/publish.yml.
- packages/rpg-storyboard-domain/package.json is now also read by .github/workflows/publish.yml.
- And 3 more new writers and readers of places.
- 4 files added and 17 changed content, across 11 parts.

## What comes in

1. **CI.** On a pull request to main; on a push to main touching 12 paths. Runs .github/scripts/check-pack-contents.mjs, .github/scripts/check-site-dist.mjs, apps/cinematic-storyboard/astro.config.mjs and 103 more; builds packages/cinematic-storyboard-domain/src/index.ts, packages/marketing-storyboard-domain/src/index.ts, packages/rpg-storyboard-domain/src/index.ts and 3 more.
2. **Publish to npm.** When a release is published; or by hand. Runs .github/scripts/check-pack-contents.mjs, apps/cinematic-storyboard/astro.config.mjs, apps/cinematic-storyboard/src/ and 90 more; builds packages/cinematic-storyboard-domain/src/index.ts, packages/marketing-storyboard-domain/src/index.ts, packages/rpg-storyboard-domain/src/index.ts and 3 more.
3. **Deploy site to GitHub Pages.** On a push to main touching 6 paths; or by hand. Runs .github/scripts/check-site-dist.mjs, site/astro.config.mjs and site/src/.
4. **@storyboard-os/cinematic-domain** (the package people import). Loads packages/cinematic-storyboard-domain/src/index.ts and packages/cinematic-storyboard-domain/schema/production-brief.json.
5. **@storyboard-os/marketing-domain** (the package people import). Loads packages/marketing-storyboard-domain/src/index.ts and packages/marketing-storyboard-domain/schema/campaign-handoff.schema.json.
6. **@storyboard-os/rpg-domain** (the package people import). Loads packages/rpg-storyboard-domain/src/index.ts, packages/rpg-storyboard-domain/schema/project-handoff.json and packages/rpg-storyboard-domain/schema/quest-handoff.json.
7. **@storyboard-os/canvas** (the package people import). Loads packages/storyboard-canvas/src/index.ts.
8. **@storyboard-os/core** (the package people import). Loads packages/storyboard-core/src/index.ts and packages/storyboard-core/schema/storyboard.schema.json.
9. **@storyboard-os/routing** (the package people import). Loads packages/storyboard-routing/src/index.ts.

## What happens through CI

1. The workflow runs .github/scripts/check-pack-contents.mjs and .github/scripts/check-site-dist.mjs in .github, apps/cinematic-storyboard/astro.config.mjs and apps/cinematic-storyboard/src/ in cinematic-storyboard, 13 files in cinematic-storyboard-domain, apps/marketing-storyboard/astro.config.mjs and apps/marketing-storyboard/src/ in marketing-storyboard, 10 files in marketing-storyboard-domain, and 60 files in 6 more parts; it builds packages/cinematic-storyboard-domain/src/index.ts in cinematic-storyboard-domain, packages/marketing-storyboard-domain/src/index.ts in marketing-storyboard-domain, packages/rpg-storyboard-domain/src/index.ts in rpg-storyboard-domain, packages/storyboard-canvas/src/index.ts in storyboard-canvas, packages/storyboard-core/src/index.ts in storyboard-core and packages/storyboard-routing/src/index.ts in storyboard-routing.
2. It uploads coverage to Codecov.

## Who reads the results

CI writes nothing this map can see.

## The other doors

**Publish to npm** runs .github/scripts/check-pack-contents.mjs, apps/cinematic-storyboard/astro.config.mjs, apps/cinematic-storyboard/src/ and 90 more, builds packages/cinematic-storyboard-domain/src/index.ts, packages/marketing-storyboard-domain/src/index.ts, packages/rpg-storyboard-domain/src/index.ts and 3 more, publishes @storyboard-os/cinematic-domain (packages/cinematic-storyboard-domain), @storyboard-os/marketing-domain (packages/marketing-storyboard-domain), @storyboard-os/rpg-domain (packages/rpg-storyboard-domain), @storyboard-os/canvas (packages/storyboard-canvas), @storyboard-os/core (packages/storyboard-core) and @storyboard-os/routing (packages/storyboard-routing) to npm, and uploads storyboard-os.cdx.json to the release.

**Deploy site to GitHub Pages** runs .github/scripts/check-site-dist.mjs, site/astro.config.mjs and site/src/, and deploys the site.

**@storyboard-os/cinematic-domain** (the package people import) loads packages/cinematic-storyboard-domain/src/index.ts and packages/cinematic-storyboard-domain/schema/production-brief.json, and reaches storyboard-core.

**@storyboard-os/marketing-domain** (the package people import) loads packages/marketing-storyboard-domain/src/index.ts and packages/marketing-storyboard-domain/schema/campaign-handoff.schema.json, and reaches storyboard-core.

**@storyboard-os/rpg-domain** (the package people import) loads packages/rpg-storyboard-domain/src/index.ts, packages/rpg-storyboard-domain/schema/project-handoff.json and packages/rpg-storyboard-domain/schema/quest-handoff.json, and reaches storyboard-core.

**@storyboard-os/canvas** (the package people import) loads packages/storyboard-canvas/src/index.ts.

**@storyboard-os/core** (the package people import) loads packages/storyboard-core/src/index.ts and packages/storyboard-core/schema/storyboard.schema.json.

**@storyboard-os/routing** (the package people import) loads packages/storyboard-routing/src/index.ts.

## What breaks what

- **storyboard-core** is imported by 6 parts (cinematic-storyboard, cinematic-storyboard-domain, marketing-storyboard, marketing-storyboard-domain, rpg-storyboard, rpg-storyboard-domain) and sits on the path of 6 doors.
- **storyboard-canvas** is imported by 3 parts (cinematic-storyboard, marketing-storyboard, rpg-storyboard) and sits on the path of 3 doors.
- **cinematic-storyboard-domain** is imported by 1 part (cinematic-storyboard) and sits on the path of 3 doors.
- **marketing-storyboard-domain** is imported by 1 part (marketing-storyboard) and sits on the path of 3 doors.
- **rpg-storyboard-domain** is imported by 1 part (rpg-storyboard) and sits on the path of 3 doors.
- **storyboard-routing** is imported by 1 part (rpg-storyboard) and sits on the path of 3 doors.
- **.github** is imported by no other part and sits on the path of 3 doors.
- **cinematic-storyboard** is imported by no other part and sits on the path of 2 doors.

## What tends to change together

- **packages/marketing-storyboard-domain/src/frameSignals.ts** and **packages/marketing-storyboard-domain/src/handoff.ts** changed together in 5 of 6 commits, inside the marketing-storyboard-domain part.
- **packages/storyboard-canvas/src/StoryboardCanvas.tsx** and **packages/storyboard-canvas/src/index.ts** changed together in 5 of 6 commits, inside the storyboard-canvas part.
- **apps/rpg-storyboard/src/components/StoryboardCanvas.tsx** and **packages/rpg-storyboard-domain/src/index.ts** changed together in 9 of 12 commits, and the rpg-storyboard part imports the rpg-storyboard-domain part.
- **apps/rpg-storyboard/src/components/projects/ProjectBoard.tsx** and **packages/rpg-storyboard-domain/src/project.test.ts** changed together in 4 of 6 commits, and the rpg-storyboard part imports the rpg-storyboard-domain part.
- **packages/marketing-storyboard-domain/src/frameSignals.test.ts** and **packages/marketing-storyboard-domain/src/handoff.test.ts** changed together in 4 of 6 commits, inside the marketing-storyboard-domain part.

2 files changed together with their own tests, as expected.

Confidence is low: fewer than 25 source files reach 10 revisions in the window.

Window: 180 days; a pair counts from 3 shared commits, since 3 source files reach 10 revisions; the floor rises to 10 when 25 do.

## What no test touches

Every code part is imported by at least one test.

## Written but never read

No place this map can see is written, so none goes unread.

## Helpers that look duplicated

These are candidates from names and call order, not a judgement.

- **getFrameProgress** is exported by packages/marketing-storyboard-domain/src/project.ts (marketing-storyboard-domain) and packages/rpg-storyboard-domain/src/project.ts (rpg-storyboard-domain); the two look alike.
- **getProjectProgress** is exported by packages/marketing-storyboard-domain/src/project.ts (marketing-storyboard-domain) and packages/rpg-storyboard-domain/src/project.ts (rpg-storyboard-domain); the two look alike.
- **getStaticPaths** is exported by 3 parts (cinematic-storyboard, marketing-storyboard and rpg-storyboard); with the same name in this many parts it is most likely a shared contract, not a copy.
- **humanizeConnectionType** is exported by packages/cinematic-storyboard-domain/src/labels.ts (cinematic-storyboard-domain) and packages/marketing-storyboard-domain/src/labels.ts (marketing-storyboard-domain); the two look alike.
- **humanizeFrameType** is exported by packages/cinematic-storyboard-domain/src/labels.ts (cinematic-storyboard-domain) and packages/marketing-storyboard-domain/src/labels.ts (marketing-storyboard-domain); the two look alike.

And 6 more pairs.

## Generated, never hand-edited

Nothing in this repository writes to a tracked place this map can see.

## Hand-authored

People write .github/, apps/cinematic-storyboard/, apps/marketing-storyboard/, apps/rpg-storyboard/, assets/, docs/, the repository root and site/. Nothing in this repository writes to them.

## Where to start

.github/workflows/ci.yml → packages/cinematic-storyboard-domain/src/index.ts → packages/cinematic-storyboard-domain/src/beatStatus.ts → packages/cinematic-storyboard-domain/src/schema.ts → packages/storyboard-core/src/density.ts

Read those in order to follow one pull request end to end.

## What this map cannot see

- 1 read uses a path built at run time and is not named here.
- 15 reads go to a path their caller passes, not to this repository.
- Statistics confidence is low: fewer than 25 source files reach 10 revisions in the window.

Regenerate with `npx --yes @dogfood-lab/atlas map`.
