# Phase 1 Closeout — RPG Storyboard

_Phase 1 commits: 405c4ee → 1021cb9 → 43ccc24 → a43a612 → 170efed → (1F)_

> **_Snapshot values in this doc (test count, page count, package count, app count) reflect the state at Phase 1 closeout. They are a historical record; current totals live in the root README.md._**

---

## What Phase 1 Is

Phase 1 converts the Phase 0 RPG authoring proof into a usable product. The spine:

```
1A — Game-state signal on the canvas
1B — Implementation readiness per beat
1C — Quest handoff export
1D — Template gallery
1E — Board operations (zoom, pan, fit)
```

Each phase addressed a specific designer workflow gap identified in the Phase 0 dogfood. None of them added features for the sake of completeness. Each one removed a friction point that blocked real usage.

---

## Phase 1A — Branch + State Visibility

**Commit:** `405c4ee`

**Problem:** The board showed frames and connections but gave no game-state signal. A designer had to open each beat individually to know whether it modified state or how complete the spec was.

**What landed:**
- `getFrameSignal(frame)` — domain helper returning `stateChangeSummary`, `branchConditionSummary`, readiness flags, spec coverage
- `getFrameBadges(frame)` — `FrameBadgeDescriptor[]`: `STATE` badge (blue) when a frame modifies state; `SPEC`/`PARTIAL`/`DRAFT` readiness badge
- `CanvasBadge` type in `@storyboard-os/canvas` — the canvas renders badges without knowing what `STATE` or `SPEC` mean
- `strokeWidth` per connection type — `choice`/`consequence` connections visually heavier than `sequence`
- Connection click-to-select + `ConnectionPanel` showing flow, condition/result label, and type description

**Architecture invariant:** `getFrameBadges()` lives in `@storyboard-os/rpg-domain`. The canvas receives `CanvasBadge[]` and renders them. No RPG concept crossed the package boundary.

**Tests:** 36 new tests in `frameSignals.test.ts`.

---

## Phase 1B — Implementation Readiness per Beat

**Commit:** `1021cb9`

**Problem:** The board showed frames but gave no answer to "can this be implemented?" A designer had no way to know which beats needed more work without reading every page.

**What landed:**
- `getBeatStatus(frame)` — authoritative readiness computation in the domain. Returns `BeatStatusLevel` (`ready | partial | draft | blocked`), `missing: MissingSpecReason[]`, and coverage counts
- `getStoryboardReadiness(storyboard)` — board-level summary: counts by level, `readyFraction`, `byFrame` index
- `BLOCKING_REASONS` — `ReadonlySet<MissingSpecReason>` — `{ 'no_state_changes', 'no_entry_or_state_change' }` — runtime classification for domain violations vs. spec gaps
- Domain rules: `choice`/`consequence` require `stateChanges`; `reveal` requires `entryConditions` OR `stateChanges`; score = 0 → always `draft` (never `blocked` on an empty frame)
- Header shows non-zero readiness counts as colored chips (READY/PARTIAL/BLOCKED/DRAFT)
- `FrameInspector` shows status chip, coverage stats, blockers (red ⚠), spec gaps (gray –)

**Architecture invariant:** The domain decides what "ready" means. The app renders the result. Readiness logic does not live in the UI.

**Tests:** 55 new tests in `beatStatus.test.ts`.

---

## Phase 1C — Quest Handoff Export

**Commit:** `43ccc24`

**Problem:** The board was a planning surface but produced nothing a developer could implement from. There was no way to export the quest spec without manually reading every page.

**What landed:**
- `generateHandoff(storyboard)` — produces `QuestHandoff`: beats in topological order (Kahn's algorithm, cycle-safe), per-beat spec fields, outgoing branches with labels, incoming frame IDs, readiness summary, blocked/partial ID lists
- `generateMarkdown(handoff)` — developer-readable Markdown: `- [ ]` checkboxes, backtick-quoted state changes, blockquote player text, spec-issues section
- `/storyboards/[id]/handoff` Astro page — SSG-rendered, dark-themed, beat cards with inline anchor IDs, download buttons via `<script define:vars>` + `Blob`/`URL.createObjectURL`
- JSON download alongside Markdown — engine-ingestible

**Architecture invariant:** Handoff generation lives entirely in `@storyboard-os/rpg-domain`. The Astro page calls domain functions at build time and renders the result. No handoff logic in the UI.

**Tests:** 39 new tests in `handoff.test.ts`. Includes Tollhouse Ledger smoke test, topological order verification (linear/branch/diamond/cycle/empty/disconnected), Markdown format checks.

---

## Phase 1D — Template Gallery

**Commit:** `a43a612`

**Problem:** Three RPG authoring templates existed in code but were invisible to any user who wasn't reading the source. There was no "new quest from template" entry point.

**What landed:**
- `/templates` gallery page — three cards with: name, `bestFor` description, beat count, production rationale, beat-type sequence (colored chips from the generated storyboard's frame array), "Preview Board →" and "Preview Handoff →" CTAs
- `templatePreviews.ts` — shared helper with stable storyboard IDs (`template-quest-flow`, `template-quest-branch`, `template-cutscene-beat`) so all three pages (board, frame, handoff) generate the same IDs
- Landing page (`/`) — replaced redirect with proper entry: two entry cards (Tollhouse Ledger, Templates), product description, explicit "not tabletop" framing
- `getStaticPaths()` expanded in `[storyboardId].astro`, `[frameId].astro`, and `handoff.astro` to include all template preview storyboards

**Build growth:** 10 pages → 38 pages.

---

## Phase 1E — Board Operations

**Commit:** `170efed`

**Problem:** A 2400×840 canvas on a laptop screen with only scroll-to-navigate was the founding usability gap from Phase 0 dogfood. The board was technically correct but operationally unusable for dense branching quests.

**What landed:**

Canvas package (`@storyboard-os/canvas`):
- `viewport.ts` — pure math: `ViewState`, `fitViewToFrames`, `centerOnFrame`, `zoomAtPoint`, `zoomFromCenter`, `clampScale`. No React, no Konva. Referentially transparent, independently testable.
- `ViewportHandle` — imperative ref handle: `fitToFrames()`, `resetView()`, `zoomIn()`, `zoomOut()`, `centerOnFrame()`, `getScale()`
- `ResizeObserver` inside `StoryboardCanvas` — canvas fills its container; no explicit `width`/`height` props needed
- Manual background-drag pan — `onMouseDown` checks `e.target !== stage` so frame-card dragging is completely unaffected
- Ctrl/Cmd + scroll → zoom at cursor; plain scroll → pan
- `autoFit` prop — fits all frames on first container measurement

App (`apps/rpg-storyboard`):
- `ViewControls.tsx` — Fit / 1:1 / − / `{n}%` / + overlay in canvas lower-right corner
- Keyboard shortcuts: `F` fit, `0` reset, `+`/`=` zoom in, `−` zoom out, `Escape` deselect
- `CANVAS_WIDTH`/`CANVAS_HEIGHT` constants removed — canvas fills its container

**Key architectural decision:** Stage `draggable` (Konva built-in) was rejected because it creates a drag conflict with frame-card dragging — both nodes enter `dragStatus: 'ready'` from the same `mousedown`. Manual pointer tracking with `e.target !== stage` guard is the correct approach.

**Tests:** 27 new tests in `viewport.test.ts` — all pure math, no DOM or Konva dependencies.

---

## Architecture Integrity

At Phase 1 close, the core invariants hold:

**No RPG vocabulary in canvas or core:**
```bash
grep -r "rpg-domain\|quest\|npc_beat\|stateChange\|entryCondition" packages/storyboard-canvas/src/
# → (no output)
```

**No tabletop language in domain or app source:**
```bash
grep -r "tabletop\|gm notes\|at the table\|campaign prep" packages/ apps/rpg-storyboard/src/
# → only appears in validate.ts as a blocklist, and in product docs as explicit exclusions
```

**Dependency direction:**
- `@storyboard-os/canvas` imports nothing from `@storyboard-os/rpg-domain`
- `@storyboard-os/core` imports nothing
- `@storyboard-os/routing` imports nothing
- `@storyboard-os/rpg-domain` imports from `@storyboard-os/core` only

**Domain decides, app renders:**
- `getBeatStatus()` in domain → readiness level. App renders the chip.
- `getFrameBadges()` in domain → `FrameBadgeDescriptor[]`. App maps to `CanvasBadge[]`. Canvas renders without knowing what `STATE` means.
- `generateHandoff()` in domain → `QuestHandoff`. App page renders the HTML.

---

## Proof

```
295/295 tests passing
  27 — @storyboard-os/canvas (viewport math)
 199 — @storyboard-os/rpg-domain (frameSignals, beatStatus, templates, handoff)
  69 — apps/rpg-storyboard

38/38 pages built
   4 storyboard board pages  (quest-01, 3 templates)
  27 frame detail pages
   4 handoff pages
   1 template gallery
   1 landing page
   1 demo redirect (legacy /storyboards/quest-01)
```

---

## What Phase 1 Did Not Do

These items were deliberately excluded to keep Phase 1 focused:

- **Persistent checklist state** — checking off implementation tasks does not survive reload. Requires persistence layer (Phase 2 candidate).
- **Structured state-change fields** — state changes are strings. A designer cannot query "which beats modify faction_standing?" without reading every page.
- **Sequential Prev/Next beat navigation** — moving linearly through a quest still requires board round-trips. The board + handoff together serve this need for now.
- **Current-beat marker** — no way to mark a beat as "in progress" during an implementation pass.
- **State graph visualization** — connections carry game-state meaning in text but the board doesn't draw the flag-dependency graph.

These are all valid Phase 2 candidates, not Phase 1 failures. Phase 1 established the spine; Phase 2 can deepen the operational loop.

---

## North Star

> This is an RPG game authoring storyboard. Every phase must improve the designer's ability to turn narrative structure into implementable game content.

Not: session prep. Not: GM tools. Not: campaign notes.

The canvas is a game design artifact. The beat inspector is an implementation spec. The handoff is a document a developer can implement from. Phase 1 made all three usable. Phase 2 deepens the implementation loop.
