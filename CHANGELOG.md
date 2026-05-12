# Changelog

## [1.1.0] — 2026-05-12

### Dogfood Swarm Hardening Pass

10-phase parallel-agent swarm covering Stage A (bug/security), Stage B (proactive health), Stage C (humanization), and Stage D (visual polish) across all 5 domains: `core-infra`, `verticals`, `apps`, `docs-site`, `ci-tooling`. Tests: 609 → 660 (+51).

### Fixed (HIGH)

**core-infra**
- `StoryboardCanvas` positions state now reconciles with the `frames` prop on change — prunes orphan positions, seeds new ids, preserves dragged positions (F-CI-001)
- `@storyboard-os/routing` route builders URL-encode every id segment via `encodeURIComponent` — fixes path-traversal vector (`boardRoute('../admin')`) and id-collision class (F-CI-002)
- `@storyboard-os/routing` ships its first test suite (16 tests for normalization, encoding, traversal vectors, collision class) and runtime `vitest` config (F-CI-003)
- `validateStoryboard` is hardened against null/undefined input, missing `frame.size` / `frame.position`, NaN/Infinity dimensions and positions, duplicate connection ids, self-loops, and duplicate edges. New error codes: `INVALID_STORYBOARD_SHAPE`, `MISSING_FRAME_SIZE`, `MISSING_FRAME_POSITION`, `INVALID_FRAME_DIMENSION`, `INVALID_FRAME_POSITION`, `DUPLICATE_CONNECTION_ID`, `SELF_LOOP_CONNECTION`, `DUPLICATE_CONNECTION_EDGE` (F-CI-004, F-CI-005, F-CI-006, F-CI-013, F-CI-201)
- `StoryboardValidationCode` exported as an open union (`KnownStoryboardValidationCode | (string & {})`) — known codes preserve autocomplete; verticals add their own prefixed codes (F-CI-203)
- `ConnectionLayer` skips rendering connections with non-finite coordinates and emits a single `console.warn` — protects the canvas from poisoning (F-CI-208)

**verticals**
- Cinematic `handoff.ts` now topologically sorts frames before emitting (parity with RPG/Marketing) — out-of-order frame arrays no longer produce out-of-order briefs (F-VR-001)
- Cinematic `validate.ts` returns the shared `StoryboardValidationError` shape (`{code, message, frameId?}`) instead of legacy `{frameId, reason}` — **BREAKING** for consumers of cinematic validation result (F-VR-003)
- Cinematic `BeatStatus` extended with `assetCount`, `shotCount`, `checklistCount`, `testCriteriaCount`, `hasDomainRequirements` (parity with RPG/Marketing); `CinematicReadinessSummary` adds `byFrame: Map` and `readyFraction` (F-VR-004)
- Cinematic level threshold lowered from `>= 4` to `>= 3` and `blocked` rule simplified — matches RPG/Marketing semantics. RPG level derivation also adjusted so empty type-required frames return `blocked` (F-VR-005, F-VR-206)
- Cinematic templates use a module-level monotonic counter for frame + connection ids — two invocations no longer collide (F-VR-006, F-VR-204)
- All cinematic templates set `templateId` on the returned Storyboard (F-VR-007)
- Cinematic `getCinematicBeatStatus` tolerates unknown frame types (defensive `?? []` lookup, returns `draft` with `hasDomainRequirements: false`) (F-VR-202)
- Marketing + RPG `validateStoryboard` guard a non-array `frames` field — return structured error instead of `TypeError` (F-VR-203)
- `getCinematicTemplate` returns `undefined` for unknown ids (parity with RPG/Marketing); `createCinematicStoryboard` retains throw behavior (F-VR-205)

**apps**
- React falsy-zero render bug eliminated across all `?.length || ?.length` conditionals in rpg and marketing apps (F-AP-001, F-AP-008)
- Unit-less `gap: 10` CSS replaced with `gap: 10px` in rpg + marketing handoff pages (F-AP-002, F-AP-003)
- Marketing campaign handoff humanizes blocker enum codes (`no_message_claim` → "Message claim missing") via local `BLOCKER_LABELS` map; restructures `.beat-blocker` inside `.beat-body` (F-AP-004)
- RPG handoff Top-Issues panel + ProjectHandoffPage humanize reason codes via `REASON_LABELS` / `REASON_SHORT_LABELS` (F-AP-101)
- Cinematic FrameInspector humanizes missing-reason codes via `REASON_LABELS` (F-AP-202)
- `projectStorage.writeAll` returns a structured `WriteResult` with `code: 'QUOTA_EXCEEDED' | 'WRITE_FAILED'`; save chip surfaces a red failure state with the error message instead of silently showing "Saved" (F-AP-201)
- React error boundaries wrap each app's canvas component — Konva mount failures show a graceful fallback with a link to the SSG handoff brief instead of a blank page (F-AP-203)

**docs-site**
- `SHIP_GATE.md` corrected: npm publication status now describes the actual `publish.yml` behavior (6 packages publish publicly, provenance now enabled). Duplicate SKIP rows deduped (F-DS-008, F-DS-101, F-DS-104)
- README + handbook test counts updated to 660. `site-config.ts` version badge now reads from root `package.json` dynamically — no future manual update needed (F-DS-102, F-DS-202)
- Handbook `reference.md` documents marketing + cinematic API surface (was rpg-only); RPG connections table notes that core defaults are replaced by verticals (F-DS-013, F-DS-014)
- `SECURITY.md` threat model generalized across all three verticals; new "Per-vertical considerations" subsection flags marketing PII risk (`audienceSegment`, free-text fields) and cinematic IP risk (`dialogue`, `visualDescription`) with operator practices (F-DS-015, F-DS-206)
- `docs/architecture.md` dependency table covers all 3 domain packages + 3 apps; canonical-grep section covers all 3 vertical vocabularies; "Adding a Fourth Vertical" guide includes the connection-type extensibility step (F-DS-010, F-DS-011, F-DS-012)
- 404 page restored (`disable404Route` removed from Starlight config) (F-DS-204)
- New `docs/snapshot-checklist.md` indexes every location holding a snapshot value (test counts, package counts, version badge) with grep + recompute commands (F-DS-201)

**ci-tooling**
- `ci.yml` and `publish.yml` use `pnpm run build:packages` instead of explicit per-package lists — cinematic-domain no longer drifts (F-CT-001, F-DS-009)
- `publish.yml` has workflow-level `permissions: { contents: read, id-token: write }`; every `pnpm publish` step ships `--provenance` (F-CT-002, F-CT-007)
- `publish.yml` is now atomic + re-runnable: each step queries npm before publishing and skips if the version already exists; a summary step prints the per-package status (F-CT-201)
- `publish.yml` validates the `tag` input against `^v[0-9]+\.[0-9]+\.[0-9]+(-.*)?$`, removes the unsafe `v1.0.0` default, and explicitly checks out the resolved tag (F-CT-202)
- `publish.yml` runs `pnpm run build:packages && pnpm test && pnpm build` as a trust-but-verify gate before any publish step (F-CT-203)
- `ci.yml` adds `permissions: { contents: read }`, expands `on.push.paths` to include root config files + `site/**`, sets `timeout-minutes` (F-CT-003, F-CT-005, F-CT-204, F-CT-205)
- Dependabot now tracks the `github-actions` ecosystem (F-CT-207)
- Tag-vs-version consistency check + post-publish smoke verify added to `publish.yml` (F-CT-212, F-CT-215)

### Added (Stage D — Visual Polish)
- `<noscript>` fallback on every canvas page in all 3 apps with a styled card linking to the JS-free handoff brief (F-AP-204)
- CSS-only canvas loading state (per-app accent: rpg purple, marketing green, cinematic cyan) hidden once Konva hydrates (F-AP-205)
- Content-Security-Policy meta tag on every static page across all 3 apps (F-AP-208)
- Universal `:focus-visible` outline for keyboard navigation

### Changed
- Total: 660 tests (was 609), 54 pages, 6 packages, 3 apps
- `StoryboardValidationCode` widened to an open union so verticals can extend with prefixed codes
- `@storyboard-os/cinematic-domain` validation result shape is now structurally compatible with RPG/Marketing — see Breaking notes below

### Breaking
- `@storyboard-os/cinematic-domain`: `CinematicValidationError` and `CinematicValidationResult` are removed; consumers must migrate to `StoryboardValidationError` / `StoryboardValidationResult` re-exported from `@storyboard-os/core`. Codes (`error.reason`) become `error.code` (machine-readable, uppercase snake_case) + `error.message` (human-readable). Frame-id moves from `error.frameId` (unchanged field name) to the same field.
- `@storyboard-os/cinematic-domain`: `CinematicBeatStatus` shape extended with non-optional fields (`assetCount`, `shotCount`, `checklistCount`, `testCriteriaCount`). Code that *constructs* `CinematicBeatStatus` literals (rather than calling `getCinematicBeatStatus`) requires an update; read-only consumers are unaffected.
- `@storyboard-os/cinematic-domain`: `getCinematicTemplate(id)` now returns `undefined` for unknown ids instead of throwing. Use `createCinematicStoryboard(id)` if you want the prior throw-on-unknown behavior.
- `@storyboard-os/core`: error code `INVALID_DIMENSIONS` renamed to `INVALID_FRAME_DIMENSION`. Consumers that switched on the old name need to update.

### Notes
- F-VR-002 (cinematic missing `project.ts`) deferred to a future release — current cinematic-storyboard app is template-only, no project-storage routes.
- README translations refreshed via TranslateGemma 12B (zero API cost).

---

## [1.0.3] — 2026-05-04

### Added

#### Core Hardening 1A — Generic Connection Types

Cinematic Phase 0 exposed a real pressure seam: core's `StoryboardConnectionType` was a fixed union that forced `as any` casts in domains with their own connection grammar. Core now supports domain-specific connection vocabularies as a first-class generic.

- `StoryboardConnection<TConnectionType>` — generic over connection type (default: core's 5-type union)
- `Storyboard<TFrame, TConnection>` — second generic param for domain-owned connection types
- `AnyStoryboardConnection` convenience alias for unspecialized use
- `validateStoryboard()` accepts any connection vocabulary — structural validation only
- Cinematic domain: `CoreConnection<CinematicConnectionType>` — no cast
- Marketing domain: `MarketingConnectionType` + `CoreConnection<MarketingConnectionType>` — no cast
- RPG domain unchanged — uses core defaults
- 6 new core tests proving custom vocabularies validate without casts

### Changed
- Total: 609 tests, 54 pages, 6 packages, 3 apps (was 603)
- Removed `as any` casts: cinematic validate, cinematic canvas, marketing demo-campaign

---

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
