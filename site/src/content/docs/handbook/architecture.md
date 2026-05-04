---
title: Architecture
description: Package map, dependency rules, and how to add a second vertical.
sidebar:
  order: 3
---

## Principle

Each package owns one concern and does not import from packages above it.

The split between **domain-neutral infrastructure** and **domain-specific authoring contract** is intentional and load-bearing. The platform can grow without each new vertical inheriting another domain's vocabulary. Each vertical can evolve without being trapped inside generic library code.

Three verticals have proven this architecture: RPG, marketing, and cinematic all shipped without modifying canvas, core, or routing. Core Hardening 1A then extracted generic connection types — domains now own their connection vocabularies without casts.

## Package map

```
apps/rpg-storyboard
  ├── @storyboard-os/rpg-domain
  │     └── @storyboard-os/core
  ├── @storyboard-os/canvas
  └── @storyboard-os/routing

apps/marketing-storyboard
  ├── @storyboard-os/marketing-domain
  │     └── @storyboard-os/core
  ├── @storyboard-os/canvas
  └── @storyboard-os/routing

apps/cinematic-storyboard
  ├── @storyboard-os/cinematic-domain
  │     └── @storyboard-os/core
  ├── @storyboard-os/canvas
  └── @storyboard-os/routing
```

## Dependency rules

| Package | May import from |
|---|---|
| `@storyboard-os/core` | Nothing |
| `@storyboard-os/canvas` | `react`, `react-konva`, `konva` |
| `@storyboard-os/routing` | Nothing |
| `@storyboard-os/rpg-domain` | `@storyboard-os/core` only |
| `@storyboard-os/marketing-domain` | `@storyboard-os/core` only |
| `@storyboard-os/cinematic-domain` | `@storyboard-os/core` only |
| `apps/rpg-storyboard` | `rpg-domain`, `canvas`, `routing` |
| `apps/marketing-storyboard` | `marketing-domain`, `canvas`, `routing` |
| `apps/cinematic-storyboard` | `cinematic-domain`, `canvas`, `routing` |

The three domain packages do not import from each other. Cross-package imports in the wrong direction break the isolation and must not be added.

---

## `@storyboard-os/core`

Generic storyboard primitives. No domain vocabulary.

```ts
StoryboardFrame<TFrameType, TContent, TAnnotationType>
StoryboardConnection<TConnectionType>   // generic — domains own their connection vocabulary
Storyboard<TFrame, TConnection>         // generic over both frame and connection
StoryboardProject<TStoryboard>
StoryboardTemplateDefinition<TId, TStoryboard>
AnyStoryboardConnection                 // convenience alias: StoryboardConnection<string>
validateStoryboard()                    // structural rules only — accepts any connection type
```

Does not know: RPG, quest, scene, choice, encounter, consequence, stateChanges, requiredAssets, factions, or any domain concept.

**Connection vocabulary pattern:** Each domain defines its own connection type union:

```ts
// RPG uses core defaults: sequence | choice | consequence | optional | fallback
// Cinematic defines its own:
type CinematicConnectionType = 'sequence' | 'match_cut' | 'cutaway' | 'reaction' | ...;
type StoryboardConnection = CoreConnection<CinematicConnectionType>;
```

**Extension pattern:** Domain packages import and specialize the core generics:

```ts
// @storyboard-os/rpg-domain/schema.ts
export type StoryboardFrame = CoreFrame<
  StoryboardFrameType,
  FrameContent,
  FrameAnnotationType
>;
```

---

## `@storyboard-os/rpg-domain`

The RPG game-authoring contract. Everything an RPG designer needs, nothing a screenplay designer would.

Does not import from any app, `@storyboard-os/canvas`, or `@storyboard-os/routing`. Imports from `@storyboard-os/core` only.

**Key exports:** frame types, content schema, templates, validation, canvas signals, readiness model, handoff generation, project domain helpers. See the [Reference](./reference/) page for the full API.

### Project domain helpers — design rules

All `update*` and `set*` helpers are **pure and immutable**: they accept a project, return a new project, and bump `updatedAt`. They never mutate input.

**Progress / spec separation** is enforced by type: `implementationChecklist` and `testCriteria` are spec strings — their content is never modified by progress functions. Completion state lives in `project.progress.frames[frameId]` as `Record<string, boolean>` keyed by string index.

---

## `@storyboard-os/marketing-domain`

The marketing campaign-implementation contract. Answers: **Can this campaign ship, and what blocks it?**

Does not import from any app, `@storyboard-os/canvas`, `@storyboard-os/routing`, or `@storyboard-os/rpg-domain`. Imports from `@storyboard-os/core` only.

**Frame types:** audience, message, touchpoint, asset, approval, launch_event, conversion, follow_up, measurement

**Key exports:**
- Frame signals: `getMarketingFrameBadges()`, `getMarketingFrameSignal()`
- Beat status: `getMarketingBeatStatus()`, `getCampaignReadiness()`
- Launch readiness: `getCampaignLaunchReadiness()`, `getCampaignCriticalPath()`
- Approval gates: `getApprovalGateSignals()`
- Measurement loops: `getMeasurementLoopSignals()`
- Templates: product_launch, brand_awareness, content_campaign
- Handoff: `generateCampaignBrief()`, `generateCampaignMarkdown()`

### What the marketing domain is NOT

| Excluded | Why |
|---|---|
| Due dates | Execution scheduling belongs in PM tools |
| Owner assignment | People management is not frame semantics |
| Workflow stages | Status derives from spec completeness, not role-based gates |
| Content calendar | Calendar is presentation, not domain logic |

---

## `@storyboard-os/cinematic-domain`

The cinematic production storyboard contract. Answers: **What makes this sequence hard to shoot, animate, edit, or hand off?**

Does not import from any app, `@storyboard-os/canvas`, `@storyboard-os/routing`, or any other domain package. Imports from `@storyboard-os/core` only.

**Frame types:** sequence, shot, camera_move, action, dialogue, transition, vfx, audio, edit_beat

**Connection types (domain-owned):** sequence, match_cut, cutaway, reaction, transition, continuity, parallel_action, fallback

**Key exports:**
- Frame signals: `getCinematicFrameBadges()`, `getCinematicFrameSignal()`
- Beat status: `getCinematicBeatStatus()`
- Production signals: `getSequenceProductionSignals()` — continuity risk, VFX/audio burden, camera complexity, production health
- Templates: trailer_flow, cutscene_sequence, explainer_video
- Validation: `validateCinematicStoryboard()`
- Handoff: `generateProductionBrief()`, `generateProductionMarkdown()`

### What the cinematic domain is NOT

| Excluded | Why |
|---|---|
| Scheduling / shot days | Production management belongs in PM tools |
| Cast / crew assignment | People are not frame semantics |
| Budget tracking | Finance is infrastructure, not domain logic |
| Final render pipeline | Render is execution, not authoring |

---

## `@storyboard-os/canvas`

Konva rendering. Frames, connections, selection, drag, type badges, connection labels. All visual config and viewport control comes from the app via props and a ref handle.

Does not import from `@storyboard-os/core`, `@storyboard-os/rpg-domain`, `@storyboard-os/marketing-domain`, `@storyboard-os/cinematic-domain`, or any app. It renders whatever config the app passes.

**Config injection:** The app provides `StoryboardCanvasConfig` with per-type styles:

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
  },
};
```

A second vertical passes its own config. The canvas renders it without knowing what the types mean.

**Viewport control:** The app holds an imperative `ViewportHandle` ref:

```ts
interface ViewportHandle {
  fitToFrames(): void;
  resetView(): void;
  zoomIn(): void;
  zoomOut(): void;
  centerOnFrame(frame: CanvasFrame): void;
  getScale(): number;
}
```

The canvas owns its own viewport state internally. The app drives it via this handle — not by passing zoom/pan props.

---

## `@storyboard-os/routing`

URL construction helpers. Zero dependencies.

```ts
const routes = createStoryboardRoutes({ storyboardBasePath: '/storyboards' });
routes.boardRoute('quest-01')           // → '/storyboards/quest-01'
routes.frameRoute('quest-01', 'hook-1') // → '/storyboards/quest-01/frames/hook-1'
routes.projectRoute('tollhouse-ledger') // → '/projects/tollhouse-ledger'
```

Apps pass their own base path. A second app with a different URL structure gets a different config.

---

## `apps/rpg-storyboard`

The RPG product shell. Everything that is RPG-specific and not reusable across verticals.

Key components:

- **`StoryboardCanvas.tsx`** — app adapter: wires RPG config, readiness, canvasRef, keyboard shortcuts, edit mode, progress, handoffHref
- **`ProjectBoard.tsx`** — loads project from localStorage by `?id=`; handles position, content, and progress updates via `persistAndNotify`
- **`BeatEditPanel`** — inline edit form for all spec fields; array fields as one-per-line textareas
- **`FrameInspector`** — reads RPG content fields, shows readiness status and missing spec reasons
- **`ProjectHandoffPage`** — client-only page; reads `?id=`, generates `ProjectHandoff`, renders and enables download

### Project storage boundary

`src/lib/storyboard/projectStorage.ts` is the **only** place in the app that touches localStorage:

```ts
saveProject(project)   // serialize + write
getProject(id)         // read + deserialize + migrate
listProjects()         // read all + migrate
deleteProject(id)      // remove
```

`migrate(project)` runs inside every read. It is the sole backward-compatibility layer — all migration logic lives here, nowhere else. Components do not touch localStorage directly.

### `persistAndNotify` pattern

`ProjectBoard` maintains a `projectRef` alongside `project` state to avoid stale closures. All write callbacks go through one shared path:

```ts
const persistAndNotify = (updated: RpgStoryboardProject) => {
  projectRef.current = updated;  // keep ref current for next callback
  setProject(updated);           // trigger re-render
  saveProject(updated);          // persist to localStorage
  setSaveStatus('saved');        // show chip, dismiss after 2 seconds
};
```

---

## Adding a new vertical

A new vertical (e.g. `apps/screenplay-storyboard`) would:

1. Create `packages/screenplay-domain` — its own frame types, content fields, connection vocabulary, and templates built on `@storyboard-os/core` generics
2. Define its own connection type: `type ScreenplayConnectionType = 'sequence' | 'flashback' | 'montage' | ...`
3. Create an app that passes its own `StoryboardCanvasConfig` to `@storyboard-os/canvas`
4. Write its own frame inspector reading its domain content fields
5. Call `createStoryboardRoutes({ storyboardBasePath: '/scenes' })` from `@storyboard-os/routing`

It would not touch `@storyboard-os/rpg-domain`, `@storyboard-os/marketing-domain`, or `@storyboard-os/cinematic-domain`. The canvas viewport, connection selection, badge rendering, and frame drag all work without modification.

Three verticals have proven this pattern: zero infrastructure changes required for any new vertical.
