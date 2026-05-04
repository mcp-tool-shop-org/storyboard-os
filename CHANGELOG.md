# Changelog

## [1.0.2] — 2026-05-04

### Added

#### Cinematic Phase 0 — Production Storyboard Vertical

Third vertical proving multi-domain architecture. Zero changes to canvas, core, or routing.

**C-0A — Domain Package (80 tests)**
- `@storyboard-os/cinematic-domain` — 9 frame types, camera language (angle/movement/framing), VFX/audio/continuity requirements, 7 cinematic connection types, 3 templates, frame signals, beat status, validation, handoff export, demo trailer sequence
- Frame types: sequence, shot, camera_move, action, dialogue, transition, vfx, audio, edit_beat
- Connection types: sequence, match_cut, cutaway, reaction, transition, continuity, parallel_action, fallback

**C-0B — App Vertical (9 pages)**
- `apps/cinematic-storyboard` — Astro sequence board with cinematic canvas config, frame inspector (camera/VFX/audio/continuity), connection panel with cinematic grammar, production brief handoff page

**C-0C — Production Signal Layer (12 tests)**
- `getSequenceProductionSignals()` — continuity risk, VFX burden, audio burden, camera complexity, duration rollup, blocked shots, production health (green/yellow/red), pressure summary
- App: ProductionSignalPanel with collapsible sections, HealthBadge in header, P keyboard shortcut

**C-0D — Closeout**
- Architecture docs updated with three-vertical proof
- `docs/cinematic-storyboard.md` — product overview with deliberate exclusions
- `docs/cinematic-phase-0-closeout.md` — phase closeout with acceptance gates
- README updated with all three verticals
- Landing page updated with cinematic vertical
- CHANGELOG updated

### Changed
- Total: 603 tests, 54 pages, 6 packages, 3 apps (was 511/45/5/2)

---

## [1.0.1] — 2026-05-04

### Added

#### Marketing Phase 0 — Campaign Implementation Storyboard

Second vertical proving multi-domain architecture. Zero changes to canvas, core, or routing.

**M-0A — Domain Package (124 tests)**
- `@storyboard-os/marketing-domain` — 9 frame types, full content schema, 3 templates, frame signals, beat status, validation, handoff export, demo campaign
- Frame types: audience, message, touchpoint, asset, approval, launch_event, conversion, follow_up, measurement

**M-0B — App Vertical (3 pages)**
- `apps/marketing-storyboard` — Astro campaign board with marketing canvas config, frame inspector, campaign brief handoff

**M-0C — Launch Readiness Signal Layer (19 tests)**
- `getCampaignLaunchReadiness()` — overall launch readiness with level, critical path, and blockers
- `getCampaignCriticalPath()` — longest path to launch_event via topological sort
- `getApprovalGateSignals()` — per-approval: status, blocks-launch flag, requirements presence
- `getMeasurementLoopSignals()` — per-measurement: metrics, incoming/outgoing connections, loop detection
- App: launch readiness badge in header, CRITICAL badge on critical-path frames, launch blockers panel

**M-0D — Closeout**
- Architecture docs updated with multi-vertical proof
- `docs/marketing-storyboard.md` — product overview
- `docs/marketing-phase-0-closeout.md` — phase closeout with acceptance gates
- README updated with both verticals

#### Infrastructure
- Starlight handbook: 5 pages (index, getting-started, authoring workflow, architecture, reference) with Pagefind search
- Translations: 35 README files across 7 languages (ja, zh, es, fr, hi, it, pt-BR) via TranslateGemma 12B
- Landing page: handbook CTA connected, version badge updated

### Fixed
- Landing page secondaryCta restored to `#features` (was accidentally overwritten with handbook link)
- Ollama model path updated from stale F:\AI-Models to E:\OpenWebUI\models

---

## Phase 2 — Durable Local Authoring

_Completed 2026-05-04_

Phase 2 turns rpg-storyboard from a read-only preview vertical into a durable local authoring workflow. Designers can create projects from templates, rearrange boards, edit beat specs, track implementation and test progress, and regenerate handoffs from saved project state.

### 2E — Project Handoff from Saved State · `aff6add`

Domain:
- `generateProjectHandoff(project)` — `ProjectHandoff` with project identity, edited beat content, readiness summary, and per-beat checklist/test-criterion completion state. Delegates beat ordering and spec extraction to `generateHandoff`, overlays progress from `getFrameProgress`.
- `generateProjectMarkdown(handoff)` — developer-readable Markdown with `[x]`/`[ ]` progress markers per item; includes project ID, template provenance, progress counts header.
- `ProjectHandoffBeat`, `ProjectHandoff` types — extend the quest handoff shape with project metadata and progress overlays.
- 18 new tests in `handoff.test.ts`: metadata, edited content propagation, progress without spec mutation, Markdown rendering.

App:
- `ProjectHandoffPage.tsx` — client-only React page for `/projects/handoff?id=`. Reads `?id=`, calls `getProject`, calls `generateProjectHandoff`, renders sticky topbar, hero, progress summary, readiness summary, beat cards with per-item completion visuals, and spec issues. Download buttons for Markdown and JSON.
- `/projects/handoff` Astro shell — static wrapper for the client-only page.
- `StoryboardCanvas.tsx` — replaced `showHandoff: boolean` with `handoffHref: string`. Template boards default to `/storyboards/${id}/handoff`; project boards pass `/projects/handoff?id=${project.id}`.
- `ProjectBoard.tsx` — passes `handoffHref` instead of `showHandoff`.

### 2D — Checklist / Progress Persistence · `7fdf39a`

Domain:
- `FrameProgress`, `ProjectProgress`, `ProjectProgressSummary` types — progress stored as `Record<string, boolean>` keyed by string index, entirely separate from spec content.
- `setChecklistItemComplete(project, frameId, index, complete)` — returns updated project without touching `implementationChecklist` spec strings.
- `setTestCriterionComplete(project, frameId, index, complete)` — same invariant for test criteria.
- `getFrameProgress(project, frameId)` — returns frame completion state (safe: returns empty record if no progress yet).
- `getProjectProgress(project)` — returns `ProjectProgressSummary` with `totalChecklist`, `doneChecklist`, `totalTests`, `doneTests` across all frames.
- `createProject` now initializes `progress: { frames: {} }`.
- 13 new tests in `project.test.ts`.

App:
- `projectStorage.ts` — `migrate(project)` backfills `progress: { frames: {} }` on projects saved before 2D. Called on every `readAll()`.
- `FrameInspector.tsx` — `ProgressChecklist` component renders interactive checkboxes per item; checked items show ✓ and strikethrough; header shows X/Y count.
- `StoryboardCanvas.tsx` — `ProgressCounts` component in header shows checklist and test completion counts. Passes `frameProgress`, `onChecklistChange`, `onTestCriterionChange` to inspector.
- `ProjectBoard.tsx` — `handleProgressChange` calls `setChecklistItemComplete` or `setTestCriterionComplete` → `persistAndNotify`.

### 2C — Editable Beat Content · `71bb708`

Domain:
- `FrameBasicsPatch` type — optional `title` and `summary` for non-destructive edits.
- `updateFrameBasics(project, frameId, patch)` — applies title/summary patch without touching content.
- `updateFrameContent(project, frameId, content)` — applies a `Partial<FrameContent>` patch (merge, not replace).
- 14 new tests in `project.test.ts`.

App:
- `BeatEditPanel.tsx` — inline edit form: one textarea per content field, array fields stored as one-per-line strings, `arrToLines`/`linesToArr` helpers, Save/Cancel buttons.
- `FrameInspector.tsx` — `onEditClick` prop; "Edit Beat ✎" button when provided; "Open Frame Page →" demotes to secondary style.
- `StoryboardCanvas.tsx` — `editingFrameId` state; shows `BeatEditPanel` when editing, `FrameInspector` otherwise; `onFrameContentChange` prop.
- `ProjectBoard.tsx` — `handleFrameContentChange` applies `updateFrameBasics` then `updateFrameContent` → `persistAndNotify`.

### 2B — Persistent Board Positions · `689563e`

- `updateFramePosition(project, frameId, position)` — pure domain helper; returns updated project with new `{x, y}`.
- `ProjectBoard.tsx` — `handlePositionChange` wired to `onFramePositionChange`; calls `updateFramePosition` → `persistAndNotify`.
- Save status chip ("Saved ✓", 2s auto-dismiss) in `StoryboardCanvas` header.
- `projectRef` pattern — mutable ref mirrors latest project; stale-closure-free callbacks.

### 2A — Project Creation from Templates · `d906417`

- `createProject(input)` — creates `RpgStoryboardProject` with `id`, `title`, `description`, `sourceTemplateId`, `storyboard` (from template), `progress: { frames: {} }`, `createdAt`/`updatedAt`.
- `RpgStoryboardProject`, `CreateProjectInput`, `FramePosition`, `FrameBasicsPatch`, `FrameProgress`, `ProjectProgress`, `ProjectProgressSummary` types.
- `projectStorage.ts` — `saveProject`, `getProject`, `listProjects`, `deleteProject` over `localStorage`, with `migrate()` for backward compat.
- `/projects` page — project list with "New Project" flow: template picker modal → `createProject` → `saveProject` → redirect to board.
- `/projects/board` page — `ProjectBoard.tsx` loads project by `?id=`, renders `StoryboardCanvas` with project storyboard.
- `/projects/handoff` page — client-only shell for handoff view (wired in 2E).

---

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
