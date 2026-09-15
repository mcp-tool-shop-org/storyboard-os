# Roadmap

> Captured at the close of the v1.1.0 dogfood-swarm hardening pass (2026-05-12).
> Every item here is a deferral noted during Stages A–D — work that was
> deliberately scoped out of v1.1.0 because it required either substantive new
> code (Feature Pass scope) or a coordination decision the swarm shouldn't make
> unilaterally. Items are grouped by theme, not by priority — pick the next
> milestone by reading the **Why deferred** lines.

---

## 1. Cinematic vertical — playlist / reel (C5)

**Findings:** F-5ee88c75 (HIGH) — Feature Pass C5. Replaces the v1.1.0 wording that specified an RPG project clone.

**Where:** `packages/cinematic-storyboard-domain/` and `apps/cinematic-storyboard/`

**Current state:**
- **Sequences are the authored unit.** The cinematic app serves `/sequences/:id` boards (demo trailer + templates) as SSG, with per-sequence production-brief handoff. There is no cinematic project store and no `localStorage`.
- RPG ships durable `RpgStoryboardProject` + `/projects/*` + `projectStorage.ts`. Marketing's *package* has campaign-project helpers; the marketing *app* routes under `/campaigns` and does not persist. Cinematic must not copy either of those as the grouping model.

**Intended shape (Unreal Sequencer grain):** a **sequence** stays the authored board (shots, camera, continuity, production signals, `/sequences/:id` + handoff). A **playlist / reel** is a thin folder that owns many sequences: an ordered list of sequence ids, optional take labels, optional reel-level brief. The reel is SSG-loaded like today's boards. A take is a label, not a persist fork.

```ts
// Intended SequencePlaylist — domain JSON, not a Storyboard clone
{
  schemaVersion: number, // BOARD_SCHEMA_VERSION as the migration hook
  id: string,
  title: string,
  description?: string,
  items: Array<{ sequenceId: string; take?: string }>,
  // optional reel-level brief — not a per-frame progress overlay
}
```

**In scope when the domain lands:**
- Domain `SequencePlaylist` factory + one demo reel that references existing sequence ids
- Landing renders reel order; `/sequences/:id` remains the authored board
- SSG `getStaticPaths` over reel ids (authored JSON, same load path as today's sequences)
- Optional take label on an item; optional reel-level brief

**Out of scope (rejected clone — do not build):**
- `CinematicStoryboardProject` wrapping a cloned `Storyboard`
- `projectStorage.ts` / `localStorage` / quota / `NEWER_SCHEMA` / progress overlay
- `pages/projects/{index,new,board,handoff}.astro`
- `generateCinematicProjectHandoff`
- `@storyboard-os/routing` `projectRoute` (RPG-shaped)
- App-shell extraction — C6 waits on playlist parity; do not invent a third persist stack to "catch up" with RPG

Handbook: [Cinematic playlist](../site/src/content/docs/handbook/cinematic-playlist.md) (intended-shape now; grows when the domain lands).

**Why deferred from v1.1.0:** Feature Pass scope. The earlier spec cloned RPG projects; that is the wrong product.

**Effort estimate:** small domain JSON + SSG landing. Not a third localStorage stack.

---

## 2. Cross-app canvas-shell refactor

**Finding:** F-AP-206 (MED quality)

**Where:** `apps/{rpg,marketing,cinematic}-storyboard/src/components/`

**Current state:** Each app has its own near-identical `*StoryboardCanvas.tsx` wrapping the shared `@storyboard-os/canvas`. The v1.1.0 swarm added a per-app `ErrorBoundary.tsx` to each — three copies of structurally identical components. Wave 1 + Wave 5 audits also flagged subtle drift: selection-clear logic, ViewControls wiring, CtrlBtn hover styling, and now `ErrorBoundary` fallback markup.

**Scope:** Promote the shared shell to a new internal package, e.g. `packages/storyboard-app-shell/`, exporting:
- `<AppShell>` — wraps `<ErrorBoundary>` + canvas-loading-state + `<noscript>` + the page-header/footer chrome
- Domain-themable props (accent color, vocabulary labels, handoff route resolver)
- The per-app vocabularies stay in their respective domain packages

**Why deferred:** Three working copies with documented drift is acceptable for v1.1.0; consolidating is a refactor with its own test surface and would have doubled Stage C scope. C6 waits on playlist parity (item 1) so the abstraction is informed by three real implementations, not two. Do not extract an app-shell package in this pass.

**Effort estimate:** ~1–2 days. Net code reduction; no behavior change.

---

## 3. Operator playbook for the three-vertical architecture — CLOSED

**Finding:** F-DS-205 (MED proactive)

**Closed 2026-09-14** by [`docs/operator-playbook.md`](./operator-playbook.md): fourth-vertical checklist, patch/minor release sequence (commit → translations → tag → publish), publish.yml rerun protocol, breaking-change coordination (cinematic v1.1.0 worked example), connection/frame-type extension notes, and RPG-only localStorage recovery (quota / NEWER_SCHEMA / corrupt records). Linked from the handbook index.

---

## 4. CI / security hardening backlog

| Finding | Severity | Item | Why deferred |
|---|---|---|---|
| F-CT-004 / F-CT-206 | MED | SHA-pin all GitHub Actions (currently floating @v3/@v4/@v6 tags) | Dependabot github-actions ecosystem was added in v1.1.0 — let dependabot drive the SHA-pin adoption rather than a manual bulk pin |
| F-CT-211 | LOW | Dependabot groups all npm updates into a single PR — security PRs can stall behind major bumps | Split into patch/security/major groups |
| Shipcheck soft gap | — | `[npm]` SBOM generation — no CycloneDX/SPDX attached to releases | Tooling decision (which SBOM generator); not a Dependabot blocker because npm `--provenance` provides comparable supply-chain signal |

**Why deferred (as a group):** None blocks ship. All are accumulated polish where the gap is "we don't do X yet" rather than "we do X wrong."

> **Closed by the 2026-07 dogfood swarm** (removed from this table): F-CT-208 (astro version split — apps migrated to astro 5.18.1), F-CT-209 (marketing/cinematic test scripts — vitest rigs added), F-CT-210 (workspace-protocol drift — standardized to `workspace:^`). Dependency scanning is now enforced in CI (`pnpm audit --prod --audit-level=high`).
>
> **Closed by the astro 7 bump** (in-tree; apps pin `astro ^7.3.1`): Astro SSR advisories row — `auditConfig.ignoreGhsas` entries for `GHSA-2pvr-wf23-7pc7` and `GHSA-8hv8-536x-4wqp` removed from `pnpm-workspace.yaml`; CI audit runs unsuppressed.

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
- F-VR-208..219 (mix) — Wave 1 carryovers including drift in handoff output format, level-label conventions, error-code naming. None individually justifies a wave; collectively worth a "cross-vertical drift sweep" once cinematic playlist/reel lands.

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
