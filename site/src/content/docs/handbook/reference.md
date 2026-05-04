---
title: Reference
description: Frame types, connection types, readiness model, and full package API.
sidebar:
  order: 4
---

## Frame types

Seven types. Each names a specific function in a playable RPG quest or scene.

| Type | Function | Canvas color |
|---|---|---|
| `hook` | Entry point or open thread — quest opener or future-thread seed | Yellow `#EAB308` |
| `scene` | Narrative or location beat — the "where and what" | Blue `#3B82F6` |
| `choice` | Player decision point — branches the board, sets state flags | Purple `#8B5CF6` |
| `encounter` | Combat, puzzle, social conflict, or high-stakes obstacle | Red `#EF4444` |
| `reveal` | Information, twist, clue, or game-state unlock delivered | Orange `#F97316` |
| `npc_beat` | Character interaction with dialogue branch logic | Green `#22C55E` |
| `consequence` | World-state outcome — what changes after a choice or event | Gray `#6B7280` |

**Domain rules (enforced by `validateRpgStoryboard`):**
- `choice` and `consequence` frames must carry at least one `stateChanges` entry
- `reveal` frames must carry at least one `entryCondition` or `stateChange`
- No frame content may contain tabletop-drift terms

---

## Connection types

Connections carry game-state meaning. Stroke weight distinguishes game-state branches from narrative sequence at a glance.

| Type | Meaning | Canvas style |
|---|---|---|
| `sequence` | Linear progression — beat A leads to beat B | Solid gray, 1.5px |
| `choice` | Player-driven branch — one of N paths opens | Dashed purple, 2.5px |
| `consequence` | Outcome arc — state change drives the next beat | Solid red, 2.5px |
| `optional` | Conditional or skippable path | Dashed dark, 1.5px |
| `fallback` | Alternate route if primary path is blocked | Dashed orange, 2px |

---

## Implementation readiness

`getBeatStatus(frame)` in `@storyboard-os/rpg-domain` is the authoritative source of readiness. The app renders the result; the domain decides it.

| Level | Meaning |
|---|---|
| `ready` | All spec sections present. Spec score ≥ 3 (designerNotes, requiredAssets, testCriteria, implementationChecklist). No domain violations. |
| `partial` | Some spec present but incomplete. Spec score 1–2. |
| `draft` | No spec present (score = 0). Exists structurally but carries no implementation depth. |
| `blocked` | Domain violation: `choice`/`consequence` missing `stateChanges`, or `reveal` missing both `entryConditions` and `stateChanges`. |

:::note
An empty `choice` frame (score = 0) is `draft`, not `blocked`. A frame must have at least some content before domain rules apply.
:::

### Missing spec reasons

```ts
type MissingSpecReason =
  | 'no_state_changes'            // blocking: choice/consequence/reveal domain rule
  | 'no_entry_or_state_change'    // blocking: reveal domain rule
  | 'no_designer_notes'           // spec gap
  | 'no_required_assets'          // spec gap
  | 'no_test_criteria'            // spec gap
  | 'no_implementation_checklist' // spec gap
  | 'no_stakes'                   // advisory
  | 'no_possible_outcomes';       // advisory
```

`BLOCKING_REASONS` (exported from `@storyboard-os/rpg-domain`) is the runtime set of blocking reasons. The app uses it to distinguish blockers (red ⚠) from spec gaps (gray –) in the inspector.

---

## `@storyboard-os/rpg-domain` API

### Canvas signals

```ts
getFrameSignal(frame)
// → { stateChangeSummary, branchConditionSummary, readiness, specCoverage }

getFrameBadges(frame)
// → FrameBadgeDescriptor[]  (STATE badge + SPEC/PARTIAL/DRAFT/BLOCKED readiness badge)

getChoiceBranchCount(frame, connections)
// → number
```

### Readiness

```ts
getBeatStatus(frame)
// → BeatStatusLevel: 'ready' | 'partial' | 'draft' | 'blocked'

getStoryboardReadiness(storyboard)
// → StoryboardReadinessSummary: { total, ready, partial, draft, blocked, byFrame }

BLOCKING_REASONS
// → ReadonlySet<MissingSpecReason>
```

### Templates

```ts
STORYBOARD_TEMPLATES
// → StoryboardTemplateDefinition[] — all three production templates

getStoryboardTemplate(id: StoryboardTemplateId)
// → StoryboardTemplateDefinition

createStoryboardFromTemplate(templateId)
// → Storyboard with all frames fully specified
```

### Project domain helpers

All functions are **pure and immutable** — they return a new project and never mutate input.

```ts
createProject(input: CreateProjectInput)
// → RpgStoryboardProject

updateFramePosition(project, frameId, position)
// → RpgStoryboardProject

updateFrameBasics(project, frameId, patch: FrameBasicsPatch)
// → RpgStoryboardProject  (title, summary only — never spec fields)

updateFrameContent(project, frameId, content: Partial<FrameContent>)
// → RpgStoryboardProject

setChecklistItemComplete(project, frameId, itemIndex, complete)
// → RpgStoryboardProject  (writes to progress, never to spec)

setTestCriterionComplete(project, frameId, itemIndex, complete)
// → RpgStoryboardProject  (writes to progress, never to spec)

getFrameProgress(project, frameId)
// → FrameProgress  (safe: returns empty record if no data yet)

getProjectProgress(project)
// → ProjectProgressSummary: { totalChecklist, doneChecklist, totalTests, doneTests }
```

### Handoff generation

**Template boards (quest handoff):**

```ts
generateHandoff(storyboard)
// → QuestHandoff: readiness summary + beats in topological order

generateMarkdown(handoff)
// → Markdown string for developer handoff document
```

**Project boards (project handoff):**

```ts
generateProjectHandoff(project)
// → ProjectHandoff: project identity + edited content + progress overlay

generateProjectMarkdown(handoff)
// → Markdown with [x]/[ ] per item, project header, progress summary
```

### Validation

```ts
validateRpgStoryboard(storyboard)
// → ValidationResult: { valid, errors[] }
// Runs core structural rules + RPG domain rules (stateChanges, entryConditions, tabletop-drift)
```

---

## `@storyboard-os/core` API

```ts
validateStoryboard(storyboard)
// → ValidationResult  (structural rules only — no domain knowledge)
```

Generic types: `StoryboardFrame<TFrameType, TContent, TAnnotationType>`, `Storyboard<TFrame>`, `StoryboardProject<TStoryboard>`, `StoryboardConnection`, `StoryboardTemplateDefinition<TId, TStoryboard>`

---

## `@storyboard-os/routing` API

```ts
const routes = createStoryboardRoutes({ storyboardBasePath: '/storyboards' });
routes.boardRoute(storyboardId)
routes.frameRoute(storyboardId, frameId)
routes.projectRoute(projectId)
```

---

## `@storyboard-os/canvas` API

```tsx
<StoryboardCanvas
  frames={CanvasFrame[]}
  connections={CanvasConnection[]}
  config={StoryboardCanvasConfig}
  ref={ViewportHandle}
  autoFit={boolean}
  onFrameClick={(id) => void}
  onConnectionClick={(id) => void}
  onFrameDragEnd={(id, position) => void}
/>
```

**Viewport handle:**

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

**Standalone viewport math** (pure functions, no React/Konva):

```ts
fitViewToFrames(frames, containerSize, padding)
centerOnFrame(frame, containerSize, currentScale)
zoomAtPoint(currentState, delta, point)
zoomFromCenter(currentState, delta, containerSize)
clampScale(scale)  // enforces [MIN_SCALE=0.1, MAX_SCALE=4]
```

---

## Keyboard shortcuts

| Key | Action |
|---|---|
| `F` | Fit all frames to viewport |
| `0` | Reset view (scale 1, origin) |
| `+` / `=` | Zoom in |
| `-` | Zoom out |
| `Escape` | Deselect frame / connection |
