<p align="center">
  <a href="README.ja.md">日本語</a> | <a href="README.zh.md">中文</a> | <a href="README.es.md">Español</a> | <a href="README.fr.md">Français</a> | <a href="README.hi.md">हिन्दी</a> | <a href="README.it.md">Italiano</a> | <a href="README.pt-BR.md">Português (BR)</a>
</p>

<p align="center">
  <img src="https://raw.githubusercontent.com/mcp-tool-shop-org/brand/main/logos/storyboard-os/readme.png" alt="Storyboard OS" width="400" />
</p>

<p align="center">
  <a href="https://github.com/mcp-tool-shop-org/storyboard-os/actions/workflows/ci.yml"><img src="https://github.com/mcp-tool-shop-org/storyboard-os/actions/workflows/ci.yml/badge.svg" alt="CI" /></a>
  <a href="https://www.npmjs.com/package/@storyboard-os/canvas"><img src="https://img.shields.io/npm/v/@storyboard-os/canvas.svg" alt="npm" /></a>
  <a href="../../LICENSE"><img src="https://img.shields.io/badge/license-MIT-blue.svg" alt="MIT License" /></a>
</p>

<p align="center"><strong>Domain-configurable Konva canvas renderer for Storyboard OS.</strong></p>

---

# @storyboard-os/canvas

A Konva-powered canvas renderer for interactive storyboard authoring. Renders frames, connections, selection, drag, type badges, and connection labels. Has **no knowledge of RPG, screenplay, or any other domain vocabulary** — all visual configuration is injected by the consuming app.

A second vertical (screenplay, tabletop, game-map) passes its own config and gets a fully functional canvas without modifying this package.

---

## Peer dependencies

```bash
npm install react react-konva konva
# react >= 18, react-konva >= 18, konva >= 9
```

---

## Install

```bash
npm install @storyboard-os/canvas
# or
pnpm add @storyboard-os/canvas
```

---

## Quick start

```tsx
import StoryboardCanvas from '@storyboard-os/canvas';
import type { StoryboardCanvasConfig } from '@storyboard-os/canvas';
import { useRef } from 'react';
import type { ViewportHandle } from '@storyboard-os/canvas';

// 1. Define your domain config — canvas renders these without knowing what they mean
const MY_CONFIG: StoryboardCanvasConfig = {
  frameTypeStyles: {
    hook:       { bg: '#1a1500', accent: '#EAB308', label: 'HOOK' },
    scene:      { bg: '#0a1628', accent: '#3B82F6', label: 'SCENE' },
    choice:     { bg: '#14092e', accent: '#8B5CF6', label: 'CHOICE' },
    encounter:  { bg: '#1a0a0a', accent: '#EF4444', label: 'ENCOUNTER' },
    reveal:     { bg: '#1a0e00', accent: '#F97316', label: 'REVEAL' },
    npc_beat:   { bg: '#0a1a0e', accent: '#22C55E', label: 'CHARACTER BEAT' },
    consequence:{ bg: '#111318', accent: '#6B7280', label: 'CONSEQUENCE' },
  },
  connectionTypeStyles: {
    sequence:    { stroke: '#94a3b8', strokeWidth: 1.5 },
    choice:      { stroke: '#8B5CF6', dash: [8, 4], strokeWidth: 2.5 },
    consequence: { stroke: '#EF4444', strokeWidth: 2.5 },
    optional:    { stroke: '#64748b', dash: [6, 4], strokeWidth: 1.5 },
    fallback:    { stroke: '#F97316', dash: [6, 4], strokeWidth: 2 },
  },
};

// 2. Wire up the canvas
const canvasRef = useRef<ViewportHandle>(null);

<div style={{ width: '100%', height: '100vh' }}>
  <StoryboardCanvas
    ref={canvasRef}
    frames={storyboard.frames}
    connections={storyboard.connections}
    config={MY_CONFIG}
    autoFit
    onSelectFrame={(id) => setSelected(id)}
    onFramePositionChange={(frameId, pos) => persistPosition(frameId, pos)}
  />
</div>

// 3. Control viewport programmatically
<button onClick={() => canvasRef.current?.fitToFrames()}>Fit</button>
<button onClick={() => canvasRef.current?.resetView()}>1:1</button>
<button onClick={() => canvasRef.current?.zoomIn()}>+</button>
<button onClick={() => canvasRef.current?.zoomOut()}>−</button>
```

---

## C2 card contract

On-card surface is **type badge, title, one-line beat, readiness**. The inspector (implementation spec, `content.*` fields) lives in the consuming app, not in this package.

- `cardBeatLine(summary)` truncates to a single sentence/line. FrameCard applies it as a seawall; the three `*StoryboardCanvas` wrappers should use it when mapping domain copy onto `CanvasFrame.summary`.
- FrameCard title and summary Text nodes are each capped at one line (`TITLE_MAX_HEIGHT` / mirrored summary height). Badges stay at `BADGE_MAX_ROWS = 2` (readiness row, not spec dump).
- `CanvasFrame` has no `content` field. **This canvas does not accept `content.*` fields** — pass them to an app inspector, not to `StoryboardCanvas`.
- There is no inspector component here (that would be app-shell).

```ts
import { cardBeatLine } from '@storyboard-os/canvas';

const frames = storyboard.frames.map(f => ({
  ...f,
  summary: cardBeatLine(f.summary),
  // do not spread f.content onto the canvas frame
}));
```

A density **level chip** may appear at warn (≥50 frames) / over (≥100 frames). Nest and filter are separate **controlled** props (`collapsedIds`, `hiddenFrameIds`, `hiddenConnectionTypes`); default is show-all. Fans are never auto-collapsed on load.

## Props

```ts
interface Props {
  /** Frames to render. Domain types are structurally compatible with CanvasFrame. No content.* fields. */
  frames: CanvasFrame[];

  /** Connections to render. Domain types are structurally compatible with CanvasConnection. */
  connections: CanvasConnection[];

  /** All visual configuration for frame types and connection types. */
  config: StoryboardCanvasConfig;

  /** Currently selected frame ID. Controlled externally. */
  selectedFrameId?: string | null;

  /** Called when a frame card is clicked (passes ID) or background is clicked (passes null). */
  onSelectFrame?: (frameId: string | null) => void;

  /** Currently selected connection ID. Controlled externally. */
  selectedConnectionId?: string | null;

  /** Called when a connection arrow is clicked. */
  onSelectConnection?: (connectionId: string | null) => void;

  /** Called whenever zoom or pan state changes. Use for displaying scale in parent controls. */
  onViewStateChange?: (v: ViewState) => void;

  /**
   * Fit all frames on first ready measure with at least one frame present.
   * An empty async load does not consume the one-shot guard. Default: false.
   */
  autoFit?: boolean;

  /**
   * Called once per completed frame drag with the frame's new canvas-space position.
   * Use this to persist layout changes. Template preview boards can omit this.
   */
  onFramePositionChange?: (frameId: string, position: { x: number; y: number }) => void;

  /**
   * Bump to force re-seed of internal drag positions from `frames[].position`
   * (reset-layout / undo batches without remounting). When swapping boards,
   * prefer remounting with `key={storyboard.id}` so viewport + positions reset.
   */
  positionEpoch?: number | string;

  /** Author-owned collapsed parent ids. Default: all expanded. */
  collapsedIds?: readonly string[];

  /** Toggle a parent id in the author's collapsed set. */
  onToggleCollapse?: (id: string) => void;

  /** Non-hierarchical hide set. Default: show-all. */
  hiddenFrameIds?: ReadonlySet<string> | readonly string[];

  /** Hide connections by type. Default: show-all. */
  hiddenConnectionTypes?: ReadonlySet<string> | readonly string[];
}
```

### Position reconcile

Internal drag state is reconciled against `frames[].position` on every frames update:

- New ids are seeded; removed ids are pruned.
- When a frame's `position` prop changes relative to the last-seen baseline, the prop value is adopted (parent-driven undo/redo / reset-layout).
- When the prop baseline is unchanged, local drag coordinates are kept.

If you replace board data in place with overlapping ids and identical coordinates, remount the canvas (`key={storyboard.id}`) or bump `positionEpoch` — otherwise the prior drag map wins.

---

## Domain config

The `StoryboardCanvasConfig` is the only thing the canvas needs to know about your domain.

```ts
interface StoryboardCanvasConfig {
  /**
   * Per-frame-type styles. Keys are your domain's frame type strings.
   * Any type not present falls back to defaultFrameStyle.
   */
  frameTypeStyles: Record<string, CanvasFrameStyle>;

  /**
   * Per-connection-type styles. Keys are connection type strings.
   * Any type not present falls back to defaultConnectionStyle.
   */
  connectionTypeStyles?: Record<string, CanvasConnectionStyle>;

  /** Fallback when a frame type has no entry. */
  defaultFrameStyle?: CanvasFrameStyle;

  /** Fallback when a connection type has no entry. */
  defaultConnectionStyle?: CanvasConnectionStyle;
}

interface CanvasFrameStyle {
  bg: string;      // card background color
  accent: string;  // type-bar fill and card border
  label: string;   // short uppercase type label, e.g. "SCENE"
}

interface CanvasConnectionStyle {
  stroke: string;
  dash?: number[];       // e.g. [8, 4] for dashed
  strokeWidth?: number;  // default 1.5; use higher values for game-state branches
}
```

---

## Frame badges

Domains can attach badge chips to frame cards without the canvas knowing what they mean.

```ts
interface CanvasFrame {
  id: string;
  type: string;
  title: string;
  summary: string;
  position: { x: number; y: number };
  size: { width: number; height: number };
  parentFrameId?: string;  // optional — one nest level
  badges?: CanvasBadge[];  // optional — rendered at the bottom of the card
}

interface CanvasBadge {
  text: string;  // short uppercase label, e.g. "STATE", "SPEC", "DRAFT"
  color: string; // hex color for the badge border and label text
}
```

In `rpg-storyboard`, `getFrameBadges(frame, connections)` from `@storyboard-os/rpg-domain` produces these badges. The canvas renders them without needing to know what "STATE" or "SPEC" means.

---

## Viewport handle

`StoryboardCanvas` is a `forwardRef` component. Pass a `ref` to get the `ViewportHandle`:

```ts
interface ViewportHandle {
  /** Fit all frames (at their current dragged positions) into the viewport. */
  fitToFrames(): void;

  /** Reset to scale=1, x=0, y=0. */
  resetView(): void;

  /** Zoom in 20% from the container center. */
  zoomIn(): void;

  /** Zoom out 20% from the container center. */
  zoomOut(): void;

  /** Center the viewport on a specific frame at the current scale. */
  centerOnFrame(frame: CanvasFrame): void;

  /** Fit only these frames (visible/collapsed set) at the readable-scale floor. */
  focusSubgraph(frames: CanvasFrame[]): void;

  /** Return the current scale factor (1 = 100%). */
  getScale(): number;
}
```

---

## Viewport interaction model

| Gesture | Effect |
|---|---|
| Drag background | Pan |
| Ctrl/Cmd + scroll wheel | Zoom at cursor position |
| Plain scroll | Pan (natural two-finger trackpad) |
| Frame drag | Reposition frame; triggers `onFramePositionChange` on release |
| Click frame | Selects frame; triggers `onSelectFrame` |
| Frames list — Arrow / Home / End | Move between frames (and selectable connections). Tab lands on the list; it is one tab stop (roving tabindex). |
| Frames list — Enter / Space | Selects the active frame and centers it (`onSelectFrame`); or selects the active connection (`onSelectConnection`) |
| Click connection | Selects connection; triggers `onSelectConnection`. Same path as Enter/Space on that connection in the frames list when `onSelectConnection` is provided. |
| Click background | Deselects; triggers `onSelectFrame(null)` |

`StoryboardCanvas` mounts an `AccessibleFrameList` overlay (arrow keys + Enter/Space) so every consuming app inherits keyboard frame activation. When `onSelectConnection` is provided, connection rows are appended to the same list — there is no separate connections surface. Pointer click on a connection remains available; it is not pointer-only.

The background-drag guard (`e.target !== stage`) prevents pan from triggering when a frame card is being dragged.

---

## Container sizing

`StoryboardCanvas` uses a `ResizeObserver` to measure its container and fills it completely. Do not pass explicit `width` or `height` props — just give the container a size:

```tsx
// Fill a panel
<div style={{ width: '100%', height: '100%' }}>
  <StoryboardCanvas ... />
</div>

// Fill the viewport
<div style={{ width: '100vw', height: '100vh' }}>
  <StoryboardCanvas ... />
</div>
```

---

## Viewport math — standalone utilities

The viewport math functions are pure and have no React or Konva dependencies. They are exported for apps that need to compute layout or positioning outside the canvas component.

```ts
import {
  fitViewToFrames,
  centerOnFrame,
  zoomAtPoint,
  zoomFromCenter,
  clampScale,
  DEFAULT_VIEW_STATE,
  MIN_SCALE,  // 0.1 — wheel-zoom floor
  MIN_READABLE_SCALE, // 11/26 — auto-fit floor (type-bar vs xs)
  MAX_SCALE,  // 4
} from '@storyboard-os/canvas';

// Auto-fit uses the readable floor and reports overflow instead of shrinking past it
const { view, overflow } = fitViewToFrames(frames, containerWidth, containerHeight, padding);

// Zoom toward a screen point (pointer stays visually fixed)
const zoomed = zoomAtPoint(currentView, pointerX, pointerY, zoomFactor);

// Enforce scale bounds
const clamped = clampScale(rawScale); // clamps to [0.1, 4]
```

Viewport math tests in `viewport.test.ts` run without DOM or Konva, making them fast and reliable in CI.

---

## Architecture position

```
@storyboard-os/canvas        ← you are here
  └── react, react-konva, konva  (peer deps)

apps/rpg-storyboard
  ├── @storyboard-os/canvas
  └── @storyboard-os/rpg-domain  (provides config + badge data)
```

`@storyboard-os/canvas` does **not** import from `@storyboard-os/core`, `@storyboard-os/rpg-domain`, or any app. Domain config flows in through props; the canvas never reaches up into the domain layer.

The canonical verification: searching for `rpg-domain`, `quest`, `npc_beat`, or `stateChange` in this package's source should return nothing.

---

## Trust model

`@storyboard-os/canvas` is a React component library. It has no network access, no localStorage reads or writes, no server-side effects, and no telemetry. All persistence is the responsibility of the consuming app via `onFramePositionChange`.

---

<p align="center">Part of <a href="https://github.com/mcp-tool-shop-org/storyboard-os">storyboard-os</a> · Built by <a href="https://mcp-tool-shop.github.io/">MCP Tool Shop</a></p>
