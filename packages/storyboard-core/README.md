<p align="center">
  <a href="README.ja.md">日本語</a> | <a href="README.zh.md">中文</a> | <a href="README.es.md">Español</a> | <a href="README.fr.md">Français</a> | <a href="README.hi.md">हिन्दी</a> | <a href="README.it.md">Italiano</a> | <a href="README.pt-BR.md">Português (BR)</a>
</p>

<p align="center">
  <img src="https://raw.githubusercontent.com/mcp-tool-shop-org/brand/main/logos/storyboard-os/readme.png" alt="Storyboard OS" width="400" />
</p>

<p align="center">
  <a href="https://github.com/mcp-tool-shop-org/storyboard-os/actions/workflows/ci.yml"><img src="https://github.com/mcp-tool-shop-org/storyboard-os/actions/workflows/ci.yml/badge.svg" alt="CI" /></a>
  <a href="https://www.npmjs.com/package/@storyboard-os/core"><img src="https://img.shields.io/npm/v/@storyboard-os/core.svg" alt="npm" /></a>
  <a href="../../LICENSE"><img src="https://img.shields.io/badge/license-MIT-blue.svg" alt="MIT License" /></a>
</p>

<p align="center"><strong>Generic storyboard primitives. No domain vocabulary.</strong></p>

---

# @storyboard-os/core

The structural foundation of the Storyboard OS platform. Defines the generic types that all domain packages specialize — frames, connections, annotations, storyboards, templates, and structural validation.

`@storyboard-os/core` has **no dependencies** and contains **no domain-specific vocabulary**. It does not know what an RPG quest, a screenplay scene, or a campaign map is. Domain packages import these generics and specialize them with their own content schemas and frame types.

---

## Install

```bash
npm install @storyboard-os/core
# or
pnpm add @storyboard-os/core
```

---

## What it provides

### Frame

A `StoryboardFrame` is one narrative beat — the atomic unit of any storyboard.

```ts
interface StoryboardFrame<
  TFrameType extends string = string,
  TContent = unknown,
  TAnnotationType extends string = string,
> {
  id: string;
  type: TFrameType;
  title: string;
  summary: string;
  position: { x: number; y: number };
  size: { width: number; height: number };
  content: TContent;
  annotations: FrameAnnotation<TAnnotationType>[];
  parentFrameId?: string; // optional; one nest level
}
```

Domains bind the type parameters:
```ts
// In @storyboard-os/rpg-domain:
type StoryboardFrame = CoreFrame<StoryboardFrameType, FrameContent, FrameAnnotationType>;
```

### Annotation

Per-frame authoring notes, typed by domain.

```ts
interface FrameAnnotation<TAnnotationType extends string = string> {
  id: string;
  type: TAnnotationType;
  text: string;
}
```

### Connection

Connections are first-class entities — not buried in `frame.links`. The connection type drives visual rendering (stroke weight, dash pattern) and carries semantic meaning.

```ts
// Core provides a default connection vocabulary for RPG use:
type StoryboardConnectionType =
  | 'sequence'      // linear progression
  | 'choice'        // player-driven branch
  | 'consequence'   // outcome arc driven by state change
  | 'optional'      // conditional / skippable path
  | 'fallback';     // alternate route if primary is blocked

// Generic over connection type — domains own their vocabulary:
interface StoryboardConnection<TConnectionType extends string = StoryboardConnectionType> {
  id: string;
  fromFrameId: string;
  toFrameId: string;
  type: TConnectionType;
  label?: string;
}

// Convenience alias for unspecialized use (e.g. in the validator):
type AnyStoryboardConnection = StoryboardConnection<string>;
```

Domains define their own connection grammar:
```ts
// Cinematic: match_cut | cutaway | reaction | transition | continuity | parallel_action
type StoryboardConnection = CoreConnection<CinematicConnectionType>;

// Marketing: dependency | approval | choice | consequence | optional
type StoryboardConnection = CoreConnection<MarketingConnectionType>;
```

### Storyboard

A collection of frames and connections with an ID and title. Generic over both frame and connection type.

```ts
interface Storyboard<
  TFrame extends AnyStoryboardFrame = AnyStoryboardFrame,
  TConnection extends AnyStoryboardConnection = StoryboardConnection,
> {
  id: string;
  title: string;
  description?: string;
  templateId?: string;
  schemaVersion?: number; // additive; omit = 1
  $schema?: string;
  frames: TFrame[];
  connections: TConnection[];
  collapsedIds?: string[]; // author-owned; absent = all expanded
  canvasWidth?: number;
  canvasHeight?: number;
}
```

### Project

A shallow container for one or more storyboards. Not a domain database — just enough structure to group related storyboards under a name.

```ts
interface StoryboardProject<TStoryboard extends Storyboard = Storyboard> {
  id: string;
  title: string;
  description?: string;
  schemaVersion?: number; // additive; omit = 1
  storyboards: TStoryboard[];
}
```

### Template

A factory for creating domain-specific storyboards from a starting point.

```ts
interface StoryboardTemplateDefinition<
  TId extends string = string,
  TStoryboard extends Storyboard = Storyboard,
> {
  id: TId;
  name: string;
  description: string;
  frameCount: number;
  bestFor: string;
  createStoryboard: (input: CreateStoryboardInput) => TStoryboard;
}

interface CreateStoryboardInput {
  id: string;
  title: string;
  description?: string;
}
```

---

## JSON Schema (C4)

The portable envelope is published as JSON Schema 2020-12 at `schema/storyboard.schema.json` and exported as `@storyboard-os/core/schema/storyboard.json`. The envelope is closed (`additionalProperties: false`) and requires `id`, `title`, `frames`, and `connections`. Domain content belongs in `frames[].content` — this file has no RPG, marketing, or cinematic fields.

`validateStoryboard` remains the no-throw runtime seawall. **Do not add Ajv** (or any validator) as a runtime dependency of this package; consumers may run Ajv against the published file.

```ts
import { STORYBOARD_JSON_SCHEMA_ID, DEFAULT_SCHEMA_VERSION } from '@storyboard-os/core';
// import schema from '@storyboard-os/core/schema/storyboard.json' assert { type: 'json' };
```

`schemaVersion` is additive (default `1`). Absent is accepted as version 1 so existing fixtures stay valid. The published schema's `const` / `minimum` is `1`.

## Board density

`measureBoardDensity({ frames, connections })` returns `{ frameCount, connectionCount, edgeRatio, level }` with `level` `'ok' | 'warn' | 'over'`. Caps are `DENSITY_SOFT_CAP = 50` and `DENSITY_HARD_CAP = 100` (Yoghourdjian). The helper measures; it does not hide edges, nest, or filter.

## Nest (one level)

Optional `parentFrameId` on a frame groups children under a parent. Collapse is a board-level `collapsedIds: string[]` so toggling a fan does not mutate frame records. Absent `collapsedIds` means all expanded — nothing auto-collapses.

```ts
import { childIds, collapseFan, expandFan, visibleFrames } from '@storyboard-os/core';

childIds(storyboard, 'choice');          // direct children
const hidden = collapseFan(storyboard, 'choice');
const shown = expandFan(hidden, 'choice');
visibleFrames(hidden);                   // parent stays; children drop
```

`validateStoryboard` rejects unknown `parentFrameId`, self-parent, and parent cycles. There is no RPG-specific fan type in core.

## Structural validation

`validateStoryboard` checks invariants that hold for **any** storyboard regardless of domain: duplicate frame IDs, broken connection references, missing required fields, and invalid frame dimensions.

```ts
import { validateStoryboard } from '@storyboard-os/core';

const result = validateStoryboard(storyboard);

if (!result.valid) {
  for (const error of result.errors) {
    console.error(error.code, error.message, error.frameId ?? error.connectionId);
  }
}
```

### Error codes

`StoryboardValidationCode` is exported as a TypeScript open union — known codes preserve autocomplete; vertical packages may add prefixed codes (e.g., `RPG_MISSING_STATE_CHANGES`, `CINEMATIC_SHOT_MISSING_VISUAL_DESCRIPTION`).

| Code | Meaning |
|---|---|
| `INVALID_STORYBOARD_SHAPE` | Input is null/undefined or missing `id`/`title`/`frames`/`connections`, or a null/non-object element inside those arrays |
| `EMPTY_STORYBOARD` | No frames in the storyboard |
| `INVALID_SCHEMA_VERSION` | `schemaVersion` is present but not an integer ≥ 1 |
| `INVALID_FRAME_ID` | Frame `id` is missing, empty/whitespace-only, or not a string |
| `DUPLICATE_FRAME_ID` | Two frames share the same ID |
| `MISSING_TITLE` | Frame has no title (missing, empty, or non-string) |
| `MISSING_TYPE` | Frame has no type (missing, empty/whitespace-only, or non-string) |
| `MISSING_SUMMARY` | Frame has no summary (missing, empty, or non-string) |
| `MISSING_FRAME_SIZE` | Frame is missing its `size` object |
| `MISSING_FRAME_POSITION` | Frame is missing its `position` object |
| `INVALID_FRAME_DIMENSION` | Frame width or height is NaN/Infinity or below the 40px minimum |
| `INVALID_FRAME_POSITION` | Frame `position.x` or `position.y` is NaN/Infinity |
| `INVALID_CONNECTION_ID` | Connection `id` is missing, empty/whitespace-only, or not a string |
| `DUPLICATE_CONNECTION_ID` | Two connections share the same ID |
| `SELF_LOOP_CONNECTION` | Connection's `fromFrameId` equals its `toFrameId` |
| `DUPLICATE_CONNECTION_EDGE` | Two connections describe the same `from → to` edge |
| `BROKEN_CONNECTION_FROM` | Connection `fromFrameId` is non-string or references a non-existent frame |
| `BROKEN_CONNECTION_TO` | Connection `toFrameId` is non-string or references a non-existent frame |
| `UNKNOWN_PARENT_FRAME_ID` | `parentFrameId` is non-string, empty, or not a frame on the board |
| `SELF_PARENT_FRAME` | Frame lists itself as `parentFrameId` |
| `PARENT_CYCLE` | `parentFrameId` walk loops |

Domain packages call `validateStoryboard` first, then layer their own domain rules on top. `@storyboard-os/rpg-domain` exports `validateRpgStoryboard` which does exactly this — and emits additional `RPG_*` codes (e.g., `RPG_MISSING_STATE_CHANGES`).

---

## Extending the platform

To build a second vertical on top of `@storyboard-os/core`:

```ts
// 1. Define your frame type union
type ScreenplayFrameType = 'scene' | 'beat' | 'sequence' | 'act_break';

// 2. Define your content shape
interface ScreenplayContent {
  sceneHeading: string;
  action: string;
  dialogue: string[];
  characterPresent: string[];
}

// 3. Specialize the generic frame type
import type { StoryboardFrame as CoreFrame } from '@storyboard-os/core';
type ScreenplayFrame = CoreFrame<ScreenplayFrameType, ScreenplayContent, 'note' | 'revision'>;

// 4. Optionally define custom connection types
type ScreenplayConnectionType = 'sequence' | 'flashback' | 'parallel' | 'montage';
type ScreenplayConnection = CoreConnection<ScreenplayConnectionType>;
type ScreenplayStoryboard = CoreStoryboard<ScreenplayFrame, ScreenplayConnection>;

// 5. Build your domain package — validateStoryboard handles the structural layer
```

---

## Architecture position

```
@storyboard-os/core          ← you are here
  └── (no dependencies)

@storyboard-os/rpg-domain
  └── @storyboard-os/core

@storyboard-os/canvas
  └── (no platform deps — pure Konva + React)

apps/rpg-storyboard
  └── all @storyboard-os/* packages
```

`@storyboard-os/core` is at the bottom of the dependency chain. It imports nothing from the platform. Downstream packages import up — they never import down.

---

## Trust model

`@storyboard-os/core` is a pure TypeScript library. It has no runtime effects, no I/O, no network access, and no side effects. The `validateStoryboard` function reads the storyboard object you pass in and returns a plain result object. Nothing is stored, logged, or transmitted.

---

<p align="center">Part of <a href="https://github.com/mcp-tool-shop-org/storyboard-os">storyboard-os</a> · Built by <a href="https://mcp-tool-shop.github.io/">MCP Tool Shop</a></p>
