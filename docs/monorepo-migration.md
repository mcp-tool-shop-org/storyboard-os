# Monorepo Migration — 0M Log

## Why the Migration Happened

After Phase 0 + 0R, `rpg-storyboard` proved its domain contract: every frame carries entry conditions, state changes, required assets, and test criteria. A second vertical (screenplay, tabletop, production storyboarding) could reuse the canvas, the routing helpers, and the structural validation — but not the RPG game-authoring vocabulary.

The migration extracted the reusable platform layer into `@storyboard-os/*` packages without weakening the RPG product. The RPG vertical preserved its full domain contract. The packages got domain-neutral boundaries.

**Hard constraint throughout:** The RPG authoring proof had to stay intact at every step. Tests and build had to remain green after each phase. No step reduced the RPG app's capabilities.

---

## Before

```
E:/rpg-storyboard/
  src/
    lib/storyboard/
      schema.ts       ← RPG types mixed with generic primitives
      templates.ts    ← RPG templates with duplicated CreateStoryboardInput
      validate.ts     ← exported from app directly
      routes.ts       ← hardcoded /storyboards/ base path
    components/
      StoryboardCanvas.tsx      ← RPG styles hardcoded
      storyboard/
        FrameCard.tsx           ← FRAME_STYLES keyed to RPG types
        ConnectionLayer.tsx     ← CONN_STYLES hardcoded
        FrameInspector.tsx      ← RPG content fields
    data/
      demo-project.json         ← demo data, no typed export
    pages/
      index.astro
      storyboards/[storyboardId].astro
      storyboards/[storyboardId]/frames/[frameId].astro
  docs/
    product-brief.md
    phase-0-closeout.md
```

**45 tests → 69 tests after 0R. All in the app.**

---

## After

```
storyboard-os/
  packages/
    storyboard-core/          ← @storyboard-os/core
    rpg-storyboard-domain/    ← @storyboard-os/rpg-domain
    storyboard-canvas/        ← @storyboard-os/canvas
    storyboard-routing/       ← @storyboard-os/routing
  apps/
    rpg-storyboard/           ← Astro RPG product shell
  docs/
    architecture.md
    product-brief.md
    rpg-storyboard.md
    phase-0-closeout.md
    monorepo-migration.md
  README.md
```

**138 tests across domain package + app. Both must stay green.**

---

## Phase Log

### 0M-1 — Monorepo Shell

Created `storyboard-os/` as the monorepo root with:
- `pnpm-workspace.yaml` covering `apps/*` and `packages/*`
- Root `package.json` with workspace scripts and `pnpm.onlyBuiltDependencies` for esbuild + sharp
- `.npmrc` with `shamefully-hoist=false`
- Stub `package.json` files for four packages: `storyboard-core`, `rpg-storyboard-domain`, `storyboard-canvas`, `storyboard-routing`

Key fix: pnpm 10 blocks post-install scripts by default. The `onlyBuiltDependencies` config was required before Astro's build would work.

### 0M-2 — App Moved

Moved `E:/rpg-storyboard/` into `storyboard-os/apps/rpg-storyboard/`. Verified 69/69 tests still passing and build still producing 10 pages.

Key fix: PowerShell/robocopy treats `[storyboardId]` as a glob pattern. Used `Copy-Item -LiteralPath` for the dynamic route directories. First build attempt produced 1 page (only index); after the explicit copy fix it produced the correct 10.

### 0M-3 — Core Extracted

Created `@storyboard-os/core` with generic primitives: `StoryboardFrame<TFrameType, TContent, TAnnotationType>`, `Storyboard<TFrame>`, `StoryboardProject`, `StoryboardConnection`, `StoryboardTemplateDefinition`, and `validateStoryboard()`.

The app's `schema.ts` became a thin domain adapter: imported core generics with `as CoreFrame` aliases, exported concrete RPG types under the same names. The app's `validate.ts` became a re-export from core. Zero downstream app file changes.

Key decision: the package exports `.ts` source directly (`"exports": { ".": "./src/index.ts" }`). Vite follows workspace symlinks and transpiles TypeScript from linked packages through the normal bundling pipeline. No `tsconfig` paths or Vite aliases needed.

Cleaned two comment-only RPG references from `storyboard-core` so the grep gate was clean.

### 0M-4 — RPG Domain Extracted

Created `@storyboard-os/rpg-domain` with the full RPG game-authoring contract:
- `schema.ts` — RPG concrete types built on `@storyboard-os/core` generics
- `templates.ts` — `QUEST_FLOW`, `QUEST_BRANCH`, `CUTSCENE_BEAT` definitions; removed duplicated `CreateStoryboardInput` interface
- `validate.ts` — `validateRpgStoryboard()` with domain rules (choice/consequence require stateChanges, reveal requires entry/state, no tabletop drift terms); re-exports `validateStoryboard` from core
- `demo-project.ts` + `demo-project.json` — Tollhouse Ledger exported as `tollhouseLedgerProject: StoryboardProject`
- `templates.test.ts` — all 69 tests moved from app; imports updated
- `index.ts` — barrel

App pages updated to import `tollhouseLedgerProject` from `@storyboard-os/rpg-domain` instead of raw JSON. App lib files became thin re-exports.

Root test script updated from `pnpm --filter rpg-storyboard test` to `pnpm -r test`.

Test count: 138/138 (69 domain + 69 app).

### 0M-5 — Routing Extracted

Created `@storyboard-os/routing` with `createStoryboardRoutes({ storyboardBasePath })` factory returning `boardRoute()`, `frameRoute()`, and `projectRoute()`. Zero dependencies.

App's `routes.ts` became a one-line adapter:
```ts
const routes = createStoryboardRoutes({ storyboardBasePath: '/storyboards' });
export const boardRoute = routes.boardRoute.bind(routes);
export const frameRoute = routes.frameRoute.bind(routes);
```

No downstream page changes needed.

### 0M-6 — Canvas Extracted

Created `@storyboard-os/canvas` with:
- `StoryboardCanvas` — Konva Stage renderer, manages position state + drag, emits `onSelectFrame`
- `FrameCard` — Konva Group, takes resolved `style: CanvasFrameStyle` from parent
- `ConnectionLayer` — Konva Group, looks up styles from `config.connectionTypeStyles`
- `types.ts` — `StoryboardCanvasConfig`, `CanvasFrameStyle`, `CanvasConnectionStyle`, `CanvasFrame`, `CanvasConnection`

The canvas package has no imports from `@storyboard-os/core`, `@storyboard-os/rpg-domain`, or any app.

App's `StoryboardCanvas.tsx` became the RPG layout adapter:
- Defines `RPG_CANVAS_CONFIG` with frame type styles and connection type styles
- Renders the full layout: header + `KonvaBoard` (from package) + `FrameInspector` + legend footer
- `FrameInspector` stays in the app — it reads RPG content fields

Deleted the app's dead `FrameCard.tsx` and `ConnectionLayer.tsx` sub-components. `FrameInspector.tsx` stayed untouched.

### 0M-7 — Docs and Repo Identity

Moved app-level docs to repo root `docs/`. Wrote:
- `README.md` — platform identity, not a generic diagramming framework
- `docs/architecture.md` — package dependency rules, extension pattern, second-vertical guide
- `docs/rpg-storyboard.md` — RPG game-authoring contract: state model, frame vocabulary, templates, demo quest
- `docs/monorepo-migration.md` — this file
- `docs/product-brief.md` — moved from app/docs
- `docs/phase-0-closeout.md` — moved from app/docs, updated with 0M completion gate

---

## Key Design Decisions

### Generic TypeScript generics without naming conflicts
Core exports `StoryboardFrame<TFrameType, TContent, TAnnotationType>`. The RPG domain imports it as `CoreFrame`, then exports `type StoryboardFrame = CoreFrame<StoryboardFrameType, FrameContent, FrameAnnotationType>`. App code imports from `./schema` under the same names as before. Zero downstream changes required.

### Canvas config injection over hardcoded styles
`FRAME_STYLES` was hardcoded to RPG types in the original `FrameCard.tsx`. Extracted as `StoryboardCanvasConfig.frameTypeStyles`. The canvas renders any domain's frame types without knowing what they mean. A second vertical passes its own config.

### App adapter pattern
The app's `schema.ts`, `templates.ts`, `validate.ts`, and `routes.ts` are thin re-export adapters. They exist so app-internal imports don't need to change when the underlying package location changes. The indirection is deliberate.

### FrameInspector stays in the app
`FrameInspector.tsx` reads `frame.content.stateChanges`, `frame.content.involvedFactions`, etc. These are RPG content fields. They belong in the app, not in a reusable package. The canvas package does not know about inspector panels.

---

## Migration Outcome

```
138/138 tests passing
10/10 pages built
@storyboard-os/core          → 0 RPG references
@storyboard-os/canvas        → 0 domain references
@storyboard-os/routing       → 0 dependencies
@storyboard-os/rpg-domain    → full game-authoring contract preserved
apps/rpg-storyboard          → thin shell, renders RPG domain through platform packages
```
