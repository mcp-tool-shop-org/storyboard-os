# Changelog

## Phase 1 — RPG Storyboard Spine

_Completed 2026-05-04_

Storyboard OS now has a reusable storyboard platform spine and one production-grade vertical: rpg-storyboard. The vertical supports RPG video game quest authoring through visual boards, game-state signal, readiness status, implementation handoff, domain templates, and usable board navigation.

### 1E — Board Operations · `170efed`

Canvas package:
- `viewport.ts` — pure math for zoom/pan/fit: `ViewState`, `fitViewToFrames`, `centerOnFrame`, `zoomAtPoint`, `zoomFromCenter`, `clampScale` (27 new tests)
- `StoryboardCanvas` — `forwardRef` exposing `ViewportHandle` (`fitToFrames`, `resetView`, `zoomIn`, `zoomOut`, `centerOnFrame`, `getScale`)
- `ResizeObserver`-based container sizing — canvas fills parent, no explicit `width`/`height` props
- Manual background-drag pan — `e.target !== stage` guard prevents conflict with frame-card dragging
- Ctrl/Cmd + scroll wheel → zoom at cursor; plain scroll → pan; `autoFit` prop
- Exports: `ViewState`, `ViewportHandle`, `DEFAULT_VIEW_STATE`

App:
- `ViewControls` — Fit / 1:1 / − / scale% / + overlay in canvas lower-right corner
- Keyboard shortcuts: `F` fit, `0` reset, `+`/`=` zoom in, `−` zoom out, `Escape` deselect
- `CANVAS_WIDTH`/`CANVAS_HEIGHT` removed — canvas fills its container

### 1D — Template Gallery · `a43a612`

- `/templates` gallery — three RPG template cards with beat-type sequences, production rationale, beat count, Preview Board / Preview Handoff CTAs
- Landing page (`/`) — entry cards for Tollhouse Ledger and Templates; product description
- `templatePreviews.ts` — stable template storyboard IDs shared across board, frame, and handoff routes
- `getStaticPaths()` expanded to include template preview storyboards (38 pages total, up from 10)

### 1C — Quest Handoff Export · `43ccc24`

- `generateHandoff(storyboard)` — `QuestHandoff` with beats in topological order (Kahn's algorithm, cycle-safe)
- `generateMarkdown(handoff)` — developer-readable Markdown with checkboxes, state changes, player text, spec-issues section
- `/storyboards/[id]/handoff` Astro page — SSG rendered, Markdown + JSON download buttons
- 39 new tests in `handoff.test.ts`

### 1B — Implementation Readiness · `1021cb9`

- `getBeatStatus(frame)` — `BeatStatusLevel` (`ready | partial | draft | blocked`), missing reasons, coverage counts
- `getStoryboardReadiness(storyboard)` — board-level counts and `readyFraction`
- `BLOCKING_REASONS` — `ReadonlySet<MissingSpecReason>` for domain violation classification
- Board header: readiness count chips (non-zero levels only)
- Frame inspector: status chip, coverage stats, blockers vs. spec gaps
- 55 new tests in `beatStatus.test.ts`

### 1A — Branch + State Visibility · `405c4ee`

- `getFrameSignal(frame)` — domain helper: `stateChangeSummary`, `branchConditionSummary`, readiness, spec flags
- `getFrameBadges(frame)` — `FrameBadgeDescriptor[]`: `STATE` (blue) and `SPEC`/`PARTIAL`/`DRAFT` badges
- `CanvasBadge` type added to `@storyboard-os/canvas` — rendered without RPG knowledge
- `strokeWidth` per connection type — heavier strokes for game-state branches
- Connection click-to-select + `ConnectionPanel`
- 36 new tests in `frameSignals.test.ts`

---

## Phase 0M — Monorepo Migration

_Completed before Phase 1_

Extracted the reusable platform layer into `@storyboard-os/*` packages. The RPG authoring proof stayed intact at every step.

Packages created: `@storyboard-os/core`, `@storyboard-os/rpg-domain`, `@storyboard-os/canvas`, `@storyboard-os/routing`.

138 tests passing · 10 pages built.

---

## Phase 0R — Repair and Re-Anchor

_Completed before 0M_

All 8 Tollhouse Ledger frames given specific flag names, asset lists, and test criteria. Templates rebuilt to generate game-state-aware boards with `requiredAssets`, `testCriteria`, `stateChanges` on every appropriate frame. Tabletop-drift terminology removed and blocked by validator.

69 tests passing.

---

## Phase 0A–0F — RPG Authoring Proof

_Initial build_

Canvas renders frames and connections. Beat pages carry implementation-spec content. Three templates pass structural validation. Tollhouse Ledger demo quest implemented (8 beats, two consequence branches).

45 tests passing · 10 pages built.
