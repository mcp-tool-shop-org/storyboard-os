# Operator Playbook

> Single runbook for releasing, extending, and recovering Storyboard OS.
> Companion to the [handbook](../site/src/content/docs/handbook/index.md) and
> [architecture](../site/src/content/docs/handbook/architecture.md) pages.
> Closed roadmap §3 (F-DS-205) — 2026-09-14.

Three verticals ship today: **rpg-storyboard**, **marketing-storyboard**, and
**cinematic-storyboard**. Only the RPG app persists projects in browser
`localStorage`. Marketing and cinematic are static demo boards (SSG) with
export handoffs — no browser store today.

---

## 1. Add a fourth vertical

Do not import from existing domain packages. Reuse core, canvas, and routing
only. Worked pattern: marketing and cinematic each shipped with zero changes to
`@storyboard-os/core`, `@storyboard-os/canvas`, or `@storyboard-os/routing`.

### Checklist

1. **Domain package** — `packages/<name>-storyboard-domain/`
   - Frame type union + content schema on `@storyboard-os/core` generics
   - Own connection vocabulary (`StoryboardConnection<YourConnectionType>`) —
     replace core defaults; do not extend RPG’s set
   - Templates, validation, beat/readiness signals, handoff generators
   - At least one demo board fixture
   - Unit tests; `package.json` `files` includes `dist`, `README.md`, `LICENSE`
2. **App shell** — `apps/<name>-storyboard/`
   - Astro SSG app; pass a vertical-specific `StoryboardCanvasConfig`
   - Frame inspector reading *this* domain’s content fields
   - Board + handoff routes (pick a base path: `/campaigns`, `/sequences`, …)
   - `createStoryboardRoutes({ storyboardBasePath: '…' })` from routing
   - ErrorBoundary + noscript fallback (copy an existing app’s pattern)
3. **Workspace wiring**
   - Add to `pnpm-workspace.yaml` / root scripts (`dev:<name>`, build chain)
   - Root `verify` must typecheck, test, and build the new app
4. **Docs / site**
   - Handbook index + getting-started first-run path
   - Architecture package map + dependency rules row
   - `site/src/site-config.ts` feature blurb if the landing claims three verticals
   - CHANGELOG entry; bump only if you publish packages
5. **Publish surface** (if the domain is public npm)
   - Add a `pnpm publish` step to `.github/workflows/publish.yml`
   - Keep `engines.node` at `>=22.13.0`

### Non-goals for a Phase-0 vertical

Durable `localStorage` projects are **not** required to prove a vertical.
RPG has them; marketing/cinematic Phase 0 shipped as static boards + handoff.
Editable persisted projects for cinematic remain roadmap §1.

---

## 2. Patch / minor release sequence

Order is load-bearing. Translations must land **before** tag and publish so the
GitHub release commit is not stuck with stale README locales.

1. Land product + English docs (README, CHANGELOG, handbook, SECURITY as needed).
2. Bump versions in root and every published `packages/*/package.json` together.
3. Run `pnpm verify` (packages build + typecheck + tests + app builds).
4. **Refresh translations** (polyglot pass) for `README.md` → `README.*.md`.
   Stage English + translated READMEs in the **same** release commit.
5. Commit with org noreply author. Do not put personal mailboxes, home paths,
   or live endpoints in tracked files.
6. Tag `vX.Y.Z` matching `packages/storyboard-core/package.json` version.
7. Push commit + tag; create the GitHub release (`gh release create` or UI).
8. Publish is triggered by `on: release` in `publish.yml` (six
   `@storyboard-os/*` packages, `--provenance`). Confirm each package version
   appears on npm.

### Version policy quick reference

| Change | Bump | Notes |
|--------|------|--------|
| Bugfix, docs, packaging hygiene | patch | e.g. 1.2.1 LICENSE-in-tarball |
| Additive API / new vertical package | minor | no breaking type removals |
| Remove / rename exported types or error codes | major (or clearly documented breaking minor only when intentional) | see §4 |

---

## 3. Publish failure — rerun protocol

`publish.yml` is **atomic per package step** and **re-runnable**:

- Trigger: `release: published` **or** `workflow_dispatch` with required `tag`
  input (e.g. `v1.2.1`). No default tag — prevents accidental republish.
- Concurrency group serializes runs; `cancel-in-progress: false` so a mid-publish
  cancel cannot leave a partial set.
- Each package step checks `pnpm view @storyboard-os/<pkg>@$VERSION` and
  **skips** if that version already exists on npm.

### If a run fails halfway

1. Read the Actions log: note which package step failed and whether earlier
   packages already published.
2. Fix the underlying issue on a new commit if the tagged tree itself is wrong
   (wrong `files`, missing LICENSE, verify failure). You cannot mutate an
   immutable npm version — bump patch if the tarball content must change.
3. If the tag tree is good and the failure was transient (network, registry):
   re-run via **workflow_dispatch** with the same `tag`. Already-published
   packages skip; remaining packages publish.
4. Do not delete and recreate a GitHub release tag lightly — prefer dispatch
   rerun against the existing tag.

### Preflight the operator should confirm

- Tag matches core version (`v` + `packages/storyboard-core` version).
- `pnpm verify` was green on that commit.
- npm provenance / `id-token: write` permission still present on the workflow.

---

## 4. Breaking-change coordination

Use the cinematic-domain v1.1.0 changes as the worked example:

- Removed `CinematicValidationError` / `CinematicValidationResult` shape —
  consumers moved from `error.reason` to `error.code` + `error.message`.
- Extended `CinematicBeatStatus` with new non-optional fields — literal
  constructors broke; read-only callers were fine.
- `getCinematicTemplate(unknownId)` returned `undefined` instead of throw.
- Core renamed `INVALID_DIMENSIONS` → `INVALID_FRAME_DIMENSION`.

### Before merging a breaking surface

1. List every removed or renamed export in CHANGELOG under a **BREAKING** subhead.
2. Prefer additive evolution (`code` alongside deprecated `reason`) for one
   minor when external consumers exist; remove in the next major.
3. Grep apps + packages in-repo for call sites; fix in the same PR.
4. Update handbook Reference / vertical docs in the same commit as the API change.
5. Roadmap §7-style “consumer migration notes” if the change spans packages.
6. Tag messaging: say what breaks in the GitHub release body, not only in git history.

### Connection / frame-type extension (non-breaking when additive)

- Add a frame or connection **type string** inside one domain → minor, update
  that domain’s canvas config + validation + tests.
- Do **not** add domain vocabulary to `@storyboard-os/core`.
- Do **not** share connection enums across domains; each vertical owns its grammar.

---

## 5. RPG store recovery (localStorage)

**Applies only to `apps/rpg-storyboard`.** Storage key: `rpg-sb:projects`.
Envelope shape: `{ schemaVersion, projects[] }` (`CURRENT_SCHEMA_VERSION` = 1).
Marketing and cinematic have no project store — skip this section for those apps.

Public API: `saveProject` / `getProject` / `listProjects` / `deleteProject` /
`getLastReadWarning`. Writes return `WriteResult`; reads may set a `ReadWarning`.

### QUOTA_EXCEEDED

**Symptom:** Save chip / create-project form shows a quota failure; `WriteResult`
`code: 'QUOTA_EXCEEDED'`.

**Cause:** Browser localStorage cap (often ~5–10 MB), too many large projects,
or private-mode quirks misreported as quota on some browsers.

**Recovery:**

1. Open `/projects`, delete boards you no longer need (each delete is also a
   `WriteResult` — if delete itself fails, continue with DevTools).
2. Export handoffs (Markdown/JSON) for anything you must keep.
3. DevTools → Application → Local Storage → origin → remove other large keys
   if present; last resort clear `rpg-sb:projects` after export.
4. Retry save. If every `setItem` fails (Safari private mode), use a normal
   browser profile — the app cannot persist there.

### NEWER_SCHEMA

**Symptom:** Banner / `getLastReadWarning().code === 'NEWER_SCHEMA'` after
opening an older deploy against data written by a newer build.

**Behavior:** Records return best-effort; the raw store is **not** downgraded
or wiped. Soft-sanitization drops only crash-shaped frames/connections.

**Recovery:**

1. Prefer reopening the **newer** deploy that wrote the store.
2. Do not manually edit `schemaVersion` downward in DevTools.
3. If you must stay on the older build: export what you can from the newer
   build, then create fresh projects on the older build.

### Corrupt store / dropped records

| Warning | Meaning | Recovery |
|---------|---------|----------|
| `STORE_UNREADABLE` | Root JSON unusable (not array, not envelope). Storage left untouched. | Export nothing from the API. In DevTools, copy the raw value elsewhere, then clear `rpg-sb:projects` and recreate. |
| `RECORDS_DROPPED` | Some records failed validation; omitted from the list but still in storage. | Note `dropped` count. Valid projects still load. To purge bad records: export good projects via handoff, clear the key, re-import by recreating from templates + paste. |

**Dev signal:** `[projectStorage]` `console.warn` lines fire on drop / unreadable
/ migration / newer-schema — useful when the UI banner is dismissed.

### Safe operator habits

- Treat handoff Markdown/JSON as the durable backup, not localStorage.
- After a major browser clear or profile switch, expect an empty project list.
- Never paste raw localStorage dumps containing unpublished quest IP into public
  issues without scrubbing (see SECURITY.md).

---

## 6. Day-to-day commands

```bash
pnpm install
pnpm dev              # RPG app
pnpm dev:marketing    # marketing app
pnpm dev:cinematic    # cinematic app
pnpm verify           # ship gate: build packages + check + test + build apps
```

Requirements: **Node ≥ 22.13**, pnpm ≥ 10.

First-run paths for each vertical: handbook
[Getting Started](../site/src/content/docs/handbook/getting-started.md).
