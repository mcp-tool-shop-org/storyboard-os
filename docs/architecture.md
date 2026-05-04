# Storyboard OS — Architecture

## Principle

Each package owns one concern and does not import from packages above it.

The split between **domain-neutral infrastructure** and **domain-specific authoring contract** is intentional and load-bearing. The platform can grow without each new vertical inheriting RPG vocabulary. The RPG vertical can evolve without being trapped inside generic library code.

---

## Package Map

```
apps/rpg-storyboard
  ├── @storyboard-os/rpg-domain
  │     └── @storyboard-os/core
  ├── @storyboard-os/canvas
  └── @storyboard-os/routing
```

Nothing in `@storyboard-os/core`, `@storyboard-os/canvas`, or `@storyboard-os/routing` imports from `@storyboard-os/rpg-domain` or any app. The domain and app import from the platform; the platform does not import from the domain.

---

## `@storyboard-os/core`

**Owns:** Generic storyboard primitives. No domain vocabulary.

```ts
StoryboardFrame<TFrameType, TContent, TAnnotationType>
Storyboard<TFrame>
StoryboardProject<TStoryboard>
StoryboardConnection
StoryboardTemplateDefinition<TId, TStoryboard>
validateStoryboard()  // structural rules only
```

**Does not know:** RPG, quest, scene, choice, encounter, consequence, stateChanges, requiredAssets, factions, or any domain concept.

**Extension pattern:** Domain packages import core generics and specialize them:
```ts
// @storyboard-os/rpg-domain/schema.ts
export type StoryboardFrame = CoreFrame<StoryboardFrameType, FrameContent, FrameAnnotationType>;
```

---

## `@storyboard-os/rpg-domain`

**Owns:** The RPG game-authoring contract. Everything an RPG designer needs, nothing a screenplay designer would.

```ts
StoryboardFrameType   // hook | scene | choice | encounter | reveal | npc_beat | consequence
FrameContent          // designerNotes, playerVisibleText, entryConditions, stateChanges,
                      // requiredAssets, testCriteria, implementationChecklist, ...
FrameAnnotationType   // designer_note | player_visible | author_only | danger | timing | branch_note
StoryboardTemplateId  // quest_flow | quest_branch | cutscene_beat

// Templates
STORYBOARD_TEMPLATES, getStoryboardTemplate(), createStoryboardFromTemplate()

// Validation
validateRpgStoryboard()    // RPG domain rules on top of core structural validation

// Canvas signals (Phase 1A)
getFrameSignal()           // stateChangeSummary, branchConditionSummary, readiness, spec coverage
getFrameBadges()           // FrameBadgeDescriptor[] — STATE badge, SPEC/PARTIAL/DRAFT readiness badge
getChoiceBranchCount()

// Readiness model (Phase 1B)
getBeatStatus()            // BeatStatusLevel: ready | partial | draft | blocked
getStoryboardReadiness()   // StoryboardReadinessSummary: counts by level, byFrame map
BLOCKING_REASONS           // ReadonlySet<MissingSpecReason> for domain violations

// Handoff export (Phase 1C)
generateHandoff()          // QuestHandoff: ordered beats, branches, readiness summary
generateMarkdown()         // Markdown string for dev handoff

// Project domain helpers (Phase 2)
createProject()            // RpgStoryboardProject from CreateProjectInput
updateFramePosition()      // pure: new project with updated frame position
updateFrameBasics()        // pure: new project with updated title/summary (FrameBasicsPatch)
updateFrameContent()       // pure: new project with Partial<FrameContent> merged
setChecklistItemComplete() // pure: new project with checklist item toggled (never mutates spec)
setTestCriterionComplete() // pure: new project with test criterion toggled (never mutates spec)
getFrameProgress()         // FrameProgress for one frame (safe: empty if no record yet)
getProjectProgress()       // ProjectProgressSummary: total/done counts across all frames

// Project handoff (Phase 2E)
generateProjectHandoff()   // ProjectHandoff: project identity + edited content + progress overlay
generateProjectMarkdown()  // Markdown with [x]/[ ] per item, project header, progress summary

// Demo quest
tollhouseLedgerProject     // Tollhouse Ledger demo quest
```

**Does not import from:** any app, `@storyboard-os/canvas`, or `@storyboard-os/routing`.

**Imports from:** `@storyboard-os/core` only.

### Project domain helpers — design rules

All `update*` and `set*` functions are **pure and immutable**: they accept a project, return a new project, and bump `updatedAt`. They never mutate input.

**Progress / spec separation** is enforced by type: `implementationChecklist` and `testCriteria` are spec strings — their content is never modified by progress functions. Completion state lives in `project.progress.frames[frameId]` as `Record<string, boolean>` keyed by string index. The spec and the completion record are in different locations in the data model and can only be written by different functions.

**Backward compatibility:** `migrate()` in `projectStorage.ts` (app layer) backfills `progress: { frames: {} }` on projects saved before Phase 2D. Called automatically on every `readAll()`. The domain never assumes the presence of progress — `getFrameProgress` returns a safe empty record if no data exists.

---

## `@storyboard-os/canvas`

**Owns:** Konva rendering. Frames, connections, selection, drag, type badges, connection labels. All visual config and viewport control comes from the app via config and ref handle.

### Rendering surface

```ts
StoryboardCanvas   // Konva Stage renderer — accepts frames, connections, config, viewport ref
FrameCard          // Konva Group for one frame card — style injected by parent
ConnectionLayer    // Konva Group for all connections — styles from config

StoryboardCanvasConfig  // frameTypeStyles + connectionTypeStyles + fallbacks
CanvasFrame             // minimal frame shape: id, type, title, summary, position, size, badges?
CanvasConnection        // minimal connection shape: id, fromFrameId, toFrameId, type, label?
CanvasBadge             // { text: string; color: string } — rendered without domain knowledge
```

**Config injection:** The app/domain provides `StoryboardCanvasConfig` with per-type styles:
```ts
const RPG_CANVAS_CONFIG: StoryboardCanvasConfig = {
  frameTypeStyles: {
    hook:   { bg: '#1a1500', accent: '#EAB308', label: 'HOOK' },
    choice: { bg: '#14092e', accent: '#8B5CF6', label: 'CHOICE' },
    // ...
  },
  connectionTypeStyles: {
    sequence:    { stroke: '#475569', strokeWidth: 1.5 },
    choice:      { stroke: '#8B5CF6', dash: [8, 4], strokeWidth: 2.5 },
    // ...
  },
};
```

A second vertical passes its own config. The canvas renders it without knowing what the types mean.

### Viewport model (Phase 1E)

The canvas owns its own viewport state — zoom, pan, fit. The app controls it via an imperative ref handle.

```ts
// Viewport state (pure math, no React/Konva)
interface ViewState { scale: number; x: number; y: number; }
DEFAULT_VIEW_STATE  // { scale: 1, x: 0, y: 0 }
fitViewToFrames()   // compute scale + offset to fit all frames with padding
centerOnFrame()     // compute offset to center one frame at current scale
zoomAtPoint()       // zoom toward a screen point (pointer stays visually fixed)
zoomFromCenter()    // zoom from container center
clampScale()        // enforce [MIN_SCALE=0.1, MAX_SCALE=4]

// Imperative handle — app calls these to control the viewport
interface ViewportHandle {
  fitToFrames(): void;                  // fit current frame positions to container
  resetView(): void;                    // scale=1, x=0, y=0
  zoomIn(): void;                       // ×1.2 from center
  zoomOut(): void;                      // ÷1.2 from center
  centerOnFrame(frame: CanvasFrame): void;
  getScale(): number;
}
```

**Interaction model:**
- Background drag → pan (manual `onMouseDown/Move` on Stage, guards `e.target !== stage` so frame-card dragging is unaffected)
- Ctrl/Cmd + scroll wheel → zoom at cursor
- Plain scroll → pan (natural two-finger trackpad)
- `autoFit` prop → fit all frames on first container measurement

**Container sizing:** `StoryboardCanvas` wraps itself in a container div and uses `ResizeObserver` to measure it. The Stage fills the container; no explicit `width`/`height` props are required.

**Viewport math is tested separately** (`viewport.test.ts` — 27 tests) because the pure functions have no DOM or Konva dependencies.

**Does not import from:** `@storyboard-os/core`, `@storyboard-os/rpg-domain`, or any app.

**Dependencies:** `react`, `react-konva`, `konva` (rendering stack only).

---

## `@storyboard-os/routing`

**Owns:** URL construction helpers. One factory function, three route builders.

```ts
createStoryboardRoutes({ storyboardBasePath: '/storyboards' })
  → boardRoute(storyboardId)             → '/storyboards/quest-01'
  → frameRoute(storyboardId, frameId)    → '/storyboards/quest-01/frames/hook-1'
  → projectRoute(projectId)             → '/projects/tollhouse-ledger'
```

**Does not import from:** anything. Zero dependencies.

**Config:** Apps pass their own base path. A second app with a different URL structure gets a different config.

---

## `apps/rpg-storyboard`

**Owns:** The RPG product shell. Everything that is RPG-specific and not reusable across verticals.

```
RPG canvas config    → frame styles, connection styles, strokeWidth per type
FrameInspector       → reads RPG content fields, shows readiness status, missing spec reasons
BeatEditPanel        → inline edit form for all spec fields; array fields as one-per-line textareas
ViewControls         → zoom+/-, Fit, 1:1 buttons — calls canvas ViewportHandle
StoryboardCanvas.tsx → app adapter: wires RPG config, readiness, canvasRef, keyboard shortcuts,
                       edit mode, progress, handoffHref
ProjectBoard.tsx     → loads project from localStorage by ?id=; handles position, content, progress
ProjectHandoffPage   → client-only page; reads ?id=, generates ProjectHandoff, renders + downloads
Astro pages          → [storyboardId].astro, [frameId].astro, handoff.astro, templates/index.astro
                       projects/index.astro, projects/board.astro, projects/handoff.astro
Page layout          → header bar, inspector panel, connection panel, legend footer, footer hint
Handoff page         → SSG Markdown/JSON export for template boards
Template gallery     → /templates — three cards with beat-type sequences and production rationale
Demo data            → imports tollhouseLedgerProject from @storyboard-os/rpg-domain
```

### Project storage boundary (Phase 2)

`src/lib/storyboard/projectStorage.ts` is the **only** place in the app that reads from and writes to `localStorage`. All other components receive project data as props or call these four functions:

```ts
saveProject(project)         // serialize + write to localStorage
getProject(id)               // read + deserialize + migrate
listProjects()               // read all + migrate
deleteProject(id)            // remove from localStorage
```

`migrate(project)` runs inside `getProject` and `listProjects`. It is the sole backward-compatibility layer — all migration logic lives here, nowhere else.

**Components do not touch localStorage directly.** `ProjectBoard` is the only component that calls `saveProject`; it does so through the `persistAndNotify` helper which updates the ref, triggers a re-render, saves, and sets save-status in one atomic sequence.

### `persistAndNotify` pattern

`ProjectBoard` maintains a `projectRef` (mutable ref) alongside the `project` state. All callbacks read from `projectRef.current` rather than the state to avoid stale closures. `persistAndNotify` is the single shared write path:

```ts
const persistAndNotify = (updated: RpgStoryboardProject) => {
  projectRef.current = updated;   // keep ref current for next callback
  setProject(updated);            // trigger re-render
  saveProject(updated);           // persist to localStorage
  setSaveStatus('saved');         // show chip
  // auto-dismiss after 2 seconds
};
```

This pattern is used by all three mutation callbacks: position change, content change, and progress change.

**Keyboard shortcuts (Phase 1E):**

| Key | Action |
|---|---|
| `F` | Fit board to viewport |
| `0` | Reset view (scale 1, origin) |
| `+` / `=` | Zoom in |
| `-` | Zoom out |
| `Escape` | Deselect frame / connection |

**Thin re-exports:** `src/lib/storyboard/schema.ts`, `templates.ts`, `validate.ts`, and `routes.ts` are thin adapters that re-export from the domain and routing packages. Downstream page files import from the app's lib layer, not directly from the packages — this keeps internal imports stable as packages evolve.

---

## Adding a Second Vertical

A second vertical (e.g. `apps/screenplay-storyboard`) would:

1. Create `packages/screenplay-domain` implementing its own frame types, content fields, and templates on top of `@storyboard-os/core` generics
2. Create an app that passes its own `StoryboardCanvasConfig` to `@storyboard-os/canvas`
3. Create its own frame inspector reading its domain content fields
4. Call `createStoryboardRoutes({ storyboardBasePath: '/scenes' })` from `@storyboard-os/routing`

It would not touch `@storyboard-os/rpg-domain` at all. The canvas viewport, connection selection, badge rendering, and frame drag all work without modification.

---

## Dependency Rules (enforced by convention)

| Package | May import from |
|---|---|
| `@storyboard-os/core` | Nothing |
| `@storyboard-os/canvas` | `react`, `react-konva`, `konva` |
| `@storyboard-os/routing` | Nothing |
| `@storyboard-os/rpg-domain` | `@storyboard-os/core` |
| `apps/rpg-storyboard` | All `@storyboard-os/*` packages |

Cross-package imports in the wrong direction break the isolation and must not be added.

The canonical verification: `grep -r "rpg-domain\|quest\|npc_beat\|stateChange" packages/storyboard-canvas/src/` should return nothing.
