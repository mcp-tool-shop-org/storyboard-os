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

STORYBOARD_TEMPLATES, getStoryboardTemplate(), createStoryboardFromTemplate()
validateRpgStoryboard()    // RPG domain rules on top of core structural validation
tollhouseLedgerProject     // Tollhouse Ledger demo quest
```

**Does not import from:** any app, `@storyboard-os/canvas`, or `@storyboard-os/routing`.

**Imports from:** `@storyboard-os/core` only.

---

## `@storyboard-os/canvas`

**Owns:** Konva rendering. Frames, connections, selection, drag, type badges, connection labels. All visual config comes in from outside.

```ts
StoryboardCanvas   // Konva Stage renderer — accepts frames, connections, config
FrameCard          // Konva Group for one frame card — style injected by parent
ConnectionLayer    // Konva Group for all connections — styles from config

StoryboardCanvasConfig  // frameTypeStyles + connectionTypeStyles + fallbacks
CanvasFrame             // minimal frame shape the canvas needs (id, type, title, summary, position, size)
CanvasConnection        // minimal connection shape
```

**Config injection:** The app/domain provides `StoryboardCanvasConfig` with per-type styles:
```ts
const RPG_CANVAS_CONFIG: StoryboardCanvasConfig = {
  frameTypeStyles: {
    hook:      { bg: '#1a1500', accent: '#EAB308', label: 'HOOK' },
    choice:    { bg: '#14092e', accent: '#8B5CF6', label: 'CHOICE' },
    // ...
  },
  connectionTypeStyles: {
    sequence:    { stroke: '#475569' },
    choice:      { stroke: '#8B5CF6', dash: [8, 4] },
    // ...
  },
};
```

A second vertical passes its own config. The canvas renders it without knowing what the types mean.

**Does not import from:** `@storyboard-os/core`, `@storyboard-os/rpg-domain`, or any app.

**Dependencies:** `react`, `react-konva`, `konva` (rendering stack only).

---

## `@storyboard-os/routing`

**Owns:** URL construction helpers. One factory function, three route builders.

```ts
createStoryboardRoutes({ storyboardBasePath: '/storyboards' })
  → boardRoute(storyboardId)    → '/storyboards/quest-01'
  → frameRoute(storyboardId, frameId) → '/storyboards/quest-01/frames/hook-1'
  → projectRoute(projectId)     → '/projects/tollhouse-ledger'
```

**Does not import from:** anything. Zero dependencies.

**Config:** Apps pass their own base path. A second app with a different URL structure gets a different config.

---

## `apps/rpg-storyboard`

**Owns:** The RPG product shell. Everything that is RPG-specific and not reusable across verticals.

```
RPG canvas config (frame styles + connection styles)
FrameInspector — reads RPG content fields (stateChanges, requiredAssets, etc.)
Route setup    — creates routes with storyboardBasePath = '/storyboards'
Astro pages    — [storyboardId].astro, [frameId].astro, index.astro
Page layout    — header bar, inspector panel, legend footer
Demo data      — imports tollhouseLedgerProject from @storyboard-os/rpg-domain
```

**Thin re-exports:** `src/lib/storyboard/schema.ts`, `templates.ts`, `validate.ts`, and `routes.ts` are thin adapters that re-export from the domain and routing packages under the same names. No downstream page files needed to change during the migration.

---

## Adding a Second Vertical

A second vertical (e.g. `apps/screenplay-storyboard`) would:

1. Create `packages/screenplay-domain` implementing its own frame types, content fields, and templates on top of `@storyboard-os/core` generics
2. Create an app that passes its own `StoryboardCanvasConfig` to `@storyboard-os/canvas`
3. Create its own frame inspector reading its domain content fields
4. Call `createStoryboardRoutes({ storyboardBasePath: '/scenes' })` from `@storyboard-os/routing`

It would not touch `@storyboard-os/rpg-domain` at all.

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
