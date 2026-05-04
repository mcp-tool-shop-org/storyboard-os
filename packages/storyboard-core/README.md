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
type StoryboardConnectionType =
  | 'sequence'      // linear progression
  | 'choice'        // player-driven branch
  | 'consequence'   // outcome arc driven by state change
  | 'optional'      // conditional / skippable path
  | 'fallback';     // alternate route if primary is blocked

interface StoryboardConnection {
  id: string;
  fromFrameId: string;
  toFrameId: string;
  type: StoryboardConnectionType;
  label?: string;
}
```

### Storyboard

A collection of frames and connections with an ID and title.

```ts
interface Storyboard<TFrame extends AnyStoryboardFrame = AnyStoryboardFrame> {
  id: string;
  title: string;
  description?: string;
  templateId?: string;
  frames: TFrame[];
  connections: StoryboardConnection[];
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

| Code | Meaning |
|---|---|
| `EMPTY_STORYBOARD` | No frames in the storyboard |
| `DUPLICATE_FRAME_ID` | Two frames share the same ID |
| `MISSING_TITLE` | Frame has no title |
| `MISSING_TYPE` | Frame has no type |
| `MISSING_SUMMARY` | Frame has no summary |
| `INVALID_DIMENSIONS` | Frame width or height below 40px minimum |
| `BROKEN_CONNECTION_FROM` | Connection `fromFrameId` references a non-existent frame |
| `BROKEN_CONNECTION_TO` | Connection `toFrameId` references a non-existent frame |

Domain packages call `validateStoryboard` first, then layer their own domain rules on top. `@storyboard-os/rpg-domain` exports `validateRpgStoryboard` which does exactly this.

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

// 4. Build your domain package — validateStoryboard handles the structural layer
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
