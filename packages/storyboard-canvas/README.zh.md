<p align="center">
  <a href="README.ja.md">日本語</a> | <a href="README.md">English</a> | <a href="README.es.md">Español</a> | <a href="README.fr.md">Français</a> | <a href="README.hi.md">हिन्दी</a> | <a href="README.it.md">Italiano</a> | <a href="README.pt-BR.md">Português (BR)</a>
</p>

<p align="center">
  <img src="https://raw.githubusercontent.com/mcp-tool-shop-org/brand/main/logos/storyboard-os/readme.png" alt="Storyboard OS" width="400" />
</p>

<p align="center">
  <a href="https://github.com/mcp-tool-shop-org/storyboard-os/actions/workflows/ci.yml"><img src="https://github.com/mcp-tool-shop-org/storyboard-os/actions/workflows/ci.yml/badge.svg" alt="CI" /></a>
  <a href="https://www.npmjs.com/package/@storyboard-os/canvas"><img src="https://img.shields.io/npm/v/@storyboard-os/canvas.svg" alt="npm" /></a>
  <a href="../../LICENSE"><img src="https://img.shields.io/badge/license-MIT-blue.svg" alt="MIT License" /></a>
</p>

<p align="center"><strong>用于 Storyboard OS 的可配置领域相关的 Konva 画布渲染器。</strong></p>

---

# @storyboard-os/canvas

一个基于 Konva 的画布渲染器，用于交互式故事板创作。它渲染帧、连接线、选择状态、拖动操作、类型标签以及连接线标签。**它不了解 RPG、剧本或其他任何领域的特定术语**——所有视觉配置都由使用该组件的应用程序注入。

另一个垂直方向的应用（例如，剧本、桌面游戏、游戏地图）可以传递自己的配置，从而获得一个完全可用的画布，而无需修改此包。

---

## 依赖项

```bash
npm install react react-konva konva
# react >= 18, react-konva >= 18, konva >= 9
```

---

## 安装

```bash
npm install @storyboard-os/canvas
# or
pnpm add @storyboard-os/canvas
```

---

## 快速开始

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
    sequence:    { stroke: '#475569', strokeWidth: 1.5 },
    choice:      { stroke: '#8B5CF6', dash: [8, 4], strokeWidth: 2.5 },
    consequence: { stroke: '#EF4444', strokeWidth: 2.5 },
    optional:    { stroke: '#334155', dash: [6, 4], strokeWidth: 1.5 },
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

## 属性

```ts
interface Props {
  /** Frames to render. Domain types are structurally compatible with CanvasFrame. */
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

  /** Fit all frames to the viewport on first mount. Default: false. */
  autoFit?: boolean;

  /**
   * Called once per completed frame drag with the frame's new canvas-space position.
   * Use this to persist layout changes. Template preview boards can omit this.
   */
  onFramePositionChange?: (frameId: string, position: { x: number; y: number }) => void;
}
```

---

## 领域配置

`StoryboardCanvasConfig` 是画布需要了解的关于您领域的唯一信息。

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

## 帧标签

领域可以向帧卡片添加标签，而画布不需要知道这些标签的含义。

```ts
interface CanvasFrame {
  id: string;
  type: string;
  title: string;
  summary: string;
  position: { x: number; y: number };
  size: { width: number; height: number };
  badges?: CanvasBadge[];  // optional — rendered at the bottom of the card
}

interface CanvasBadge {
  text: string;  // short uppercase label, e.g. "STATE", "SPEC", "DRAFT"
  color: string; // hex color for the badge border and label text
}
```

在 `rpg-storyboard` 中，`getFrameBadges(frame, connections)` 函数（来自 `@storyboard-os/rpg-domain`）会生成这些标签。画布会渲染它们，而无需知道 "STATE" 或 "SPEC" 的含义。

---

## 视口句柄

`StoryboardCanvas` 是一个 `forwardRef` 组件。传递一个 `ref` 以获取 `ViewportHandle`。

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

  /** Return the current scale factor (1 = 100%). */
  getScale(): number;
}
```

---

## 视口交互模型

| 手势 | 效果 |
|---|---|
| 背景拖动 | 平移 |
| Ctrl/Cmd + 滚动轮 | 在光标位置缩放 |
| 普通滚动 | 平移（自然双指触摸板操作） |
| 帧拖动 | 重新定位帧；触发 `onFramePositionChange` 事件。 |
| 点击帧 | 选择帧；触发 `onSelectFrame` 事件。 |
| 点击连接线 | 选择连接线；触发 `onSelectConnection` 事件。 |
| 点击背景 | 取消选择；触发 `onSelectFrame(null)` 事件。 |

背景拖动保护机制 (`e.target !== stage`) 阻止在拖动帧卡片时触发平移操作。

---

## 容器大小

`StoryboardCanvas` 使用 `ResizeObserver` 来测量其容器的大小，并完全填充它。不要传递显式的 `width` 或 `height` 属性，只需为容器设置大小即可。

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

## 视口数学 — 独立的实用工具

视口数学函数是纯函数，不依赖于 React 或 Konva。 它们被导出，供需要计算布局或在画布组件外部进行定位的应用程序使用。

```ts
import {
  fitViewToFrames,
  centerOnFrame,
  zoomAtPoint,
  zoomFromCenter,
  clampScale,
  DEFAULT_VIEW_STATE,
  MIN_SCALE,  // 0.1
  MAX_SCALE,  // 4
} from '@storyboard-os/canvas';

// Compute the ViewState that fits all frames within a container
const view = fitViewToFrames(frames, containerWidth, containerHeight, padding);

// Zoom toward a screen point (pointer stays visually fixed)
const zoomed = zoomAtPoint(currentView, pointerX, pointerY, zoomFactor);

// Enforce scale bounds
const clamped = clampScale(rawScale); // clamps to [0.1, 4]
```

`viewport.test.ts` 中的所有 27 个视口数学测试都在没有 DOM 或 Konva 的情况下运行，这使得它们在 CI 环境中快速且可靠。

---

## 架构位置

```
@storyboard-os/canvas        ← you are here
  └── react, react-konva, konva  (peer deps)

apps/rpg-storyboard
  ├── @storyboard-os/canvas
  └── @storyboard-os/rpg-domain  (provides config + badge data)
```

`@storyboard-os/canvas` **不** 从 `@storyboard-os/core`、`@storyboard-os/rpg-domain` 或任何应用程序中导入内容。 领域配置通过属性传递；画布永远不会深入到领域层。

一个重要的验证方法：在此包的源代码中搜索 `rpg-domain`、`quest`、`npc_beat` 或 `stateChange` 应该返回空结果。

---

## 信任模型

`@storyboard-os/canvas` 是一个 React 组件库。 它没有网络访问权限，没有本地存储的读写操作，没有服务器端效果，也没有任何遥测功能。 所有持久化操作都是由使用该组件的应用程序通过 `onFramePositionChange` 事件来负责的。

---

<p align="center">Part of <a href="https://github.com/mcp-tool-shop-org/storyboard-os">storyboard-os</a> · Built by <a href="https://mcp-tool-shop.github.io/">MCP Tool Shop</a></p>
