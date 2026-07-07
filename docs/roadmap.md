# Roadmap

> Captured at the close of the v1.1.0 dogfood-swarm hardening pass (2026-05-12).
> Every item here is a deferral noted during Stages A–D — work that was
> deliberately scoped out of v1.1.0 because it required either substantive new
> code (Feature Pass scope) or a coordination decision the swarm shouldn't make
> unilaterally. Items are grouped by theme, not by priority — pick the next
> milestone by reading the **Why deferred** lines.

---

## 1. Cinematic vertical — project model + app routes

**Findings:** F-VR-002 (HIGH cross-vertical-drift) + F-VR-201 (HIGH proactive carryover)

**Where:** `packages/cinematic-storyboard-domain/` and `apps/cinematic-storyboard/`

**Current state:**
- `packages/rpg-storyboard-domain` exports `RpgStoryboardProject`, `createProject`, `getProjectProgress`, `generateProjectHandoff` and the rpg app has full `apps/rpg-storyboard/src/pages/projects/{index,new,board,handoff}.astro` routes plus a `projectStorage.ts` localStorage layer.
- `packages/marketing-storyboard-domain` exports `MarketingStoryboardProject`, `createCampaignProject`, `getProjectProgress`, `generateProjectCampaignHandoff` — the marketing **package** has parity with rpg — but the marketing **app** routes everything under `campaigns/` and never exposes a project list. Whether "campaigns" *is* marketing's project equivalent (terminology mismatch) or whether the marketing app is itself missing a project list is a product decision, not a code one.
- `packages/cinematic-storyboard-domain` exports no project type at all. The cinematic app only has `sequences/` routes.

**Scope to close the gap:**

### Package-side (cinematic-domain)
Mirror the rpg-domain footprint (which is the canonical reference):

- `CinematicStoryboardProject` — project envelope wrapping a `Storyboard<CinematicStoryboardFrame, CinematicStoryboardConnection>` with metadata (id, name, createdAt, updatedAt, schemaVersion)
- `ProjectProgress` — per-frame checklist + testCriteria + assetCount completion state, mirroring rpg's `ProjectProgress`
- `createCinematicProject(input: CreateCinematicProjectInput): CinematicStoryboardProject` — constructor; should accept either a `templateId` (string) or a bare `Storyboard` and stamp metadata
- `getCinematicProjectProgress(project): CinematicProjectProgressSummary` — returns aggregate readiness + per-frame fractions, parity with `getProjectProgress` in rpg
- `generateCinematicProjectHandoff(project)` — handoff brief generator that wraps the existing sequence-level `generateProductionBrief` with project-level context (project name, total duration estimate aggregated across frames, readiness summary)
- Demo project — at least one `demo-cinematic-project.ts` for app-level testing (mirroring `demo-project.ts` in rpg)
- Tests covering each new export

### App-side (cinematic-storyboard)
Mirror `apps/rpg-storyboard/src/`:

- `lib/storyboard/projectStorage.ts` — localStorage layer returning the `WriteResult` type added in v1.1.0 (don't regress F-AP-201 on this new code)
- `pages/projects/index.astro` — project list with empty state
- `pages/projects/new.astro` — new-project form (pick template, name)
- `pages/projects/board.astro` — wraps the existing `CinematicStoryboardCanvas` for project boards
- `pages/projects/handoff.astro` — project-level handoff brief (aggregates sequence briefs)
- Routing: `routes.ts` in `@storyboard-os/routing` may need a `cinematicProjectRoute(projectId)` helper if it's currently rpg-shaped
- Reuse the v1.1.0 `ErrorBoundary` + canvas loading state + noscript fallback patterns
- Site nav update if Starlight handbook has a top-level cinematic section

**Why deferred:** Both halves are required for a useful feature. Adding only the package would publish a half-feature; adding only the app routes would be impossible without the package. This is real Feature Pass scope, not bug-fix scope.

**Open question for the maintainer:** does the marketing app's `campaigns/` *replace* `projects/` for marketing, or is marketing also missing app-level project list pages? Answer determines whether the cinematic implementation adds a third UI pattern or copies one of the existing two.

**Effort estimate:** ~1 day package + 2–3 days app integration. Could ship as v1.2.0 (additive minor — no breaking changes).

---

## 2. Cross-app canvas-shell refactor

**Finding:** F-AP-206 (MED quality)

**Where:** `apps/{rpg,marketing,cinematic}-storyboard/src/components/`

**Current state:** Each app has its own near-identical `*StoryboardCanvas.tsx` wrapping the shared `@storyboard-os/canvas`. The v1.1.0 swarm added a per-app `ErrorBoundary.tsx` to each — three copies of structurally identical components. Wave 1 + Wave 5 audits also flagged subtle drift: selection-clear logic, ViewControls wiring, CtrlBtn hover styling, and now `ErrorBoundary` fallback markup.

**Scope:** Promote the shared shell to a new internal package, e.g. `packages/storyboard-app-shell/`, exporting:
- `<AppShell>` — wraps `<ErrorBoundary>` + canvas-loading-state + `<noscript>` + the page-header/footer chrome
- Domain-themable props (accent color, vocabulary labels, handoff route resolver)
- The per-app vocabularies stay in their respective domain packages

**Why deferred:** Three working copies with documented drift is acceptable for v1.1.0; consolidating is a refactor with its own test surface and would have doubled Stage C scope. Best done after the cinematic vertical reaches feature parity (item 1) so the abstraction is informed by three real implementations, not two.

**Effort estimate:** ~1–2 days. Net code reduction; no behavior change.

---

## 3. Operator playbook for the three-vertical architecture

**Finding:** F-DS-205 (MED proactive)

**Where:** `site/src/content/docs/handbook/` or `docs/`

**Current state:** Release/onboard/test runbooks are scattered across `docs/phase-{0,1,2}-closeout.md`, `docs/marketing-phase-0-closeout.md`, `docs/cinematic-phase-0-closeout.md`, and the handbook getting-started page. No single doc walks an operator through "I have a new vertical to add" or "I'm releasing a patch — what's the sequence?"

**Scope:** A single `docs/operator-playbook.md` covering:
- Adding a fourth vertical (already partially covered in `docs/architecture.md`; deepen it)
- Releasing a patch or minor (commit → translation refresh → tag → release-triggers-publish)
- Adding a new connection or frame type to an existing vertical
- Troubleshooting publish failures (which `publish.yml` is now atomic + re-runnable; document the rerun protocol)
- Coordinating breaking changes (use the cinematic-domain v1.1.0 changes as the worked example)

**Why deferred:** Docs work is cheap but discovering the right shape requires watching at least one real "second user" do an operation — premature playbooks fossilize the wrong workflow.

**Effort estimate:** ~half a day once the workflow has been exercised once or twice post-v1.1.0.

---

## 4. CI / security hardening backlog

| Finding | Severity | Item | Why deferred |
|---|---|---|---|
| F-CT-004 / F-CT-206 | MED | SHA-pin all GitHub Actions (currently floating @v3/@v4/@v6 tags) | Dependabot github-actions ecosystem was added in v1.1.0 — let dependabot drive the SHA-pin adoption rather than a manual bulk pin |
| F-CT-211 | LOW | Dependabot groups all npm updates into a single PR — security PRs can stall behind major bumps | Split into patch/security/major groups |
| Astro SSR advisories | MED | Remove the two `auditConfig.ignoreGhsas` entries in `pnpm-workspace.yaml` (`GHSA-2pvr-wf23-7pc7` host-header SSRF, `GHSA-8hv8-536x-4wqp` slot-name XSS) once the apps adopt astro 6 — both are patched there. Ignored today because both are SSR/server-island-only and structurally unreachable in static `astro build` output. | Blocked on the astro 5→6 major; revisit at that bump (this is the tracked trigger the ignore-list comment points to) |
| Shipcheck soft gap | — | `[npm]` SBOM generation — no CycloneDX/SPDX attached to releases | Tooling decision (which SBOM generator); not a Dependabot blocker because npm `--provenance` provides comparable supply-chain signal |

**Why deferred (as a group):** None blocks ship. All are accumulated polish where the gap is "we don't do X yet" rather than "we do X wrong."

> **Closed by the 2026-07 dogfood swarm** (removed from this table): F-CT-208 (astro version split — apps migrated to astro 5.18.1), F-CT-209 (marketing/cinematic test scripts — vitest rigs added), F-CT-210 (workspace-protocol drift — standardized to `workspace:^`). Dependency scanning is now enforced in CI (`pnpm audit --prod --audit-level=high`).

---

## 5. Test-coverage gaps explicitly left open

These are spots where production code was hardened in v1.1.0 but tests for the new behavior weren't added (hook lockouts in Stage C):

- `packages/marketing-storyboard-domain/src/validate.test.ts` — missing tests for the new `Array.isArray(frames)` guard (F-VR-203 production fix landed, tests did not)
- `packages/rpg-storyboard-domain/` — no `validate.test.ts` file exists; one should be created mirroring the marketing/cinematic shape
- `packages/cinematic-storyboard-domain/src/beatStatus.test.ts` — missing tests for the unknown-frame-type defensive guard (F-VR-202)
- `packages/storyboard-canvas/` — F-CI-208 (ConnectionLayer non-finite guard) landed in production but has no test, and the canvas package generally has low component-test coverage (F-CI-015)

**Why deferred:** Production code is correct; the gap is regression-protection, not behavior. A future "test-completion" pass can close all of these in a single domain-wide pull.

---

## 6. Smaller items left in the backlog

These are MED/LOW findings logged during Stage A or Stage B that weren't worth a follow-up wave on their own:

**core-infra**
- F-CI-204 (MED) — `@storyboard-os/routing` has `boardRoute(id)` but no symmetric `parseBoardRoute(path)` reverse helper. Add when a consumer actually needs it.
- F-CI-205 / F-CI-206 (MED) — `StoryboardCanvas` positions reconciliation handles add/remove cleanly but two edge cases remain: (a) deleted-then-re-added frame ID resurrects a stale dragged position; (b) the one-shot `autoFit` doesn't refire when the storyboard prop swaps in place. Real but rare.
- F-CI-207 (MED) — no runtime `VERSION` export on any of the 3 core packages. Useful when a consumer wants to log "storyboard-os v1.1.0 mounted."
- F-CI-209 (MED) — `CanvasBadge` / `CanvasFrameStyle` shape has no extensibility seam for verticals to add custom badge categories. Address when a fourth vertical lands.

**verticals**
- F-VR-208..219 (mix) — Wave 1 carryovers including drift in handoff output format, level-label conventions, error-code naming. None individually justifies a wave; collectively worth a "cross-vertical drift sweep" once cinematic project.ts lands.

**apps**
- F-AP-207 (LOW) — stale hash links in the rpg app scroll nowhere on navigation.
- F-AP-211 (LOW) — `URL.revokeObjectURL` for Blob downloads duplicated 3× across apps; consolidate when the app-shell refactor (item 2) happens.
- F-AP-212 (LOW) — `ProjectBoard` mount race: silent fallthrough when localStorage and URL hash disagree about the active project.
- F-AP-213 (MED) — zero `console.warn` / `console.error` across `apps/**/src/` outside the one added in `ConnectionLayer.tsx`. Build a small `apps/_shared/diagnostics.ts` (or move to the app-shell package from item 2).

**docs-site**
- F-DS-207 (LOW) — handbook slugs aren't versioned (no `/handbook/v1/...`). Address before v2.0 ships.
- F-DS-208 (LOW) — no test asserting that doc-stated commands (`pnpm verify`, `pnpm test`, `pnpm dev`) actually exist in `package.json`. Pairs naturally with item 3's playbook work.

---

## 7. Downstream consumer migration notes for v1.1.0

The v1.1.0 CHANGELOG documents these breaking changes; restating here so they're discoverable from the roadmap entry-point too:

- `@storyboard-os/cinematic-domain` — `CinematicValidationError` and `CinematicValidationResult` removed. Consumers reading `error.reason` must migrate to `error.code` (machine-readable, uppercase snake_case) + `error.message` (human-readable). Field `frameId` is unchanged.
- `@storyboard-os/cinematic-domain` — `CinematicBeatStatus` shape extended with non-optional fields (`assetCount`, `shotCount`, `checklistCount`, `testCriteriaCount`). Code that constructs `CinematicBeatStatus` literals breaks; read-only consumers are unaffected.
- `@storyboard-os/cinematic-domain` — `getCinematicTemplate(unknownId)` now returns `undefined` instead of throwing. Use `createCinematicStoryboard(unknownId)` if you want the prior throw-on-unknown behavior.
- `@storyboard-os/core` — error code `INVALID_DIMENSIONS` renamed to `INVALID_FRAME_DIMENSION`. The `StoryboardValidationCode` type is now an open union (`KnownStoryboardValidationCode | (string & {})`) — strict `switch`-on-code consumers should switch on `KnownStoryboardValidationCode` if exhaustiveness matters.

---

## 8. Deferred visual polish from the 2026-07 dogfood swarm (Stage C/D)

The 2026-07 swarm landed the correctness-bearing pre-feature work — a shared design-token layer (`@storyboard-os/core` `tokens.ts` + per-domain color consts), keyboard/screen-reader canvas navigation (`AccessibleFrameList`), localStorage schema versioning + migration ladder, enum exhaustiveness guards, handoff format versioning, checklist checkboxes, contrast fixes (rpg + marketing), and the two wrong-legend color bugs (marketing GATE amber, cinematic VFX purple) + the READY→SPEC label. These bounded polish items were scoped out (two app agents hit a usage limit mid-wave) and are safe to pick up incrementally — none is a correctness gap:

- **HU-007** — remember view state across reloads (selected frame, zoom/pan, last-open project) in the rpg app. Self-contained; use a dedicated `rpg-sb:viewstate` key, guarded restore.
- **VP-014** — carry the marketing site's `SO` wordmark + accent + a "Handbook" link into the three app headers so app and site read as one product.
- **VP-009** — responsive header: the chip cluster overflows ~1024–1100px and the fixed 380px inspector panels don't collapse; add a breakpoint so the board stays usable at 1280px.
- **Cinematic tokenization** — the cinematic app consumes the new tokens only for the VFX legend fix; finish repointing its remaining hardcoded status/type hex + the failing muted-text contrast colors to `cinematicColors`/`statusColors`/`textColors` (rpg + marketing already did this).
- **Marketing color-parity test** — add a unit test asserting the marketing legend GATE color `=== marketingColors.gate` and cinematic VFX `=== cinematicColors.vfx`, so a card-vs-legend divergence can never silently return.
- **VP-007/008** — apply the new `typeScale`/`spacing` tokens across the remaining ad-hoc letter-spacing + panel-width literals not touched this pass.

**Why deferred:** all are visual/UX refinement on top of an already-green tree; the token module now exists, so each is a bounded consume-the-token change rather than net-new design.

## How this roadmap was written

This document was generated as the close-out artifact of the v1.1.0 dogfood swarm. Findings IDs (F-CI-xxx, F-VR-xxx, F-AP-xxx, F-DS-xxx, F-CT-xxx) reference the audit JSON in `E:/AI/dogfood-labs/swarms/swarm-1778573977-3171/wave-{1,3,5}/` on the rig that ran the swarm. The CHANGELOG entry for v1.1.0 is the authoritative record of what *did* land; this roadmap is the record of what was deliberately scoped out.

When you address an item, delete its section from this file rather than checking it off — the roadmap stays current by shrinking.
