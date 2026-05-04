<p align="center">
  <a href="README.ja.md">日本語</a> | <a href="README.md">English</a> | <a href="README.es.md">Español</a> | <a href="README.fr.md">Français</a> | <a href="README.hi.md">हिन्दी</a> | <a href="README.it.md">Italiano</a> | <a href="README.pt-BR.md">Português (BR)</a>
</p>

<p align="center">
  <img src="https://raw.githubusercontent.com/mcp-tool-shop-org/brand/main/logos/storyboard-os/readme.png" alt="Storyboard OS" width="400" />
</p>

<p align="center">
  <a href="https://github.com/mcp-tool-shop-org/storyboard-os/actions/workflows/ci.yml"><img src="https://github.com/mcp-tool-shop-org/storyboard-os/actions/workflows/ci.yml/badge.svg" alt="CI" /></a>
  <a href="https://www.npmjs.com/package/@storyboard-os/core"><img src="https://img.shields.io/npm/v/@storyboard-os/core.svg" alt="npm" /></a>
  <a href="../../LICENSE"><img src="https://img.shields.io/badge/license-MIT-blue.svg" alt="MIT License" /></a>
</p>

<p align="center"><strong>通用的故事板基本元素。不包含任何特定领域的词汇。</strong></p>

---

# @storyboard-os/core

Storyboard OS 平台的基础架构。它定义了所有领域模块都会使用的通用类型，包括：帧、连接、注释、故事板、模板以及结构验证。

`@storyboard-os/core` **没有依赖项**，并且**不包含任何特定领域的词汇**。它不知道什么是角色扮演游戏任务、剧本场景或战役地图。领域模块会导入这些通用类型，并使用自己的内容模式和帧类型进行定制。

---

## 安装

```bash
npm install @storyboard-os/core
# or
pnpm add @storyboard-os/core
```

---

## 它提供的功能

### 帧

`StoryboardFrame` 是一个叙事片段，是任何故事板的原子单元。

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

领域模块会绑定类型参数。
```ts
// In @storyboard-os/rpg-domain:
type StoryboardFrame = CoreFrame<StoryboardFrameType, FrameContent, FrameAnnotationType>;
```

### 注释

每个帧的作者备注，由领域模块定义。

```ts
interface FrameAnnotation<TAnnotationType extends string = string> {
  id: string;
  type: TAnnotationType;
  text: string;
}
```

### 连接

连接是首类实体，而不是隐藏在 `frame.links` 中。连接类型驱动视觉渲染（笔画粗细、虚线模式），并携带语义信息。

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

### 故事板

包含 ID 和标题的帧和连接的集合。

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

### 项目

一个浅层容器，用于存储一个或多个故事板。它不是一个领域数据库，而只是提供足够的结构，可以将相关的故事板组织在名称下。

```ts
interface StoryboardProject<TStoryboard extends Storyboard = Storyboard> {
  id: string;
  title: string;
  description?: string;
  storyboards: TStoryboard[];
}
```

### 模板

用于从起始点创建特定领域的故事板的工厂。

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

## 结构验证

`validateStoryboard` 检查适用于**任何**故事板的不变条件，无论领域如何：重复的帧 ID、损坏的连接引用、缺少必需字段以及无效的帧尺寸。

```ts
import { validateStoryboard } from '@storyboard-os/core';

const result = validateStoryboard(storyboard);

if (!result.valid) {
  for (const error of result.errors) {
    console.error(error.code, error.message, error.frameId ?? error.connectionId);
  }
}
```

### 错误代码

| 代码 | 含义 |
|---|---|
| `EMPTY_STORYBOARD` | 故事板中没有帧 |
| `DUPLICATE_FRAME_ID` | 两个帧具有相同的 ID |
| `MISSING_TITLE` | 帧没有标题 |
| `MISSING_TYPE` | 帧没有类型 |
| `MISSING_SUMMARY` | 帧没有摘要 |
| `INVALID_DIMENSIONS` | 帧的宽度或高度小于 40 像素的最小值 |
| `BROKEN_CONNECTION_FROM` | 连接的 `fromFrameId` 引用了不存在的帧 |
| `BROKEN_CONNECTION_TO` | 连接的 `toFrameId` 引用了不存在的帧 |

领域模块首先调用 `validateStoryboard`，然后在其之上添加自己的领域规则。`@storyboard-os/rpg-domain` 导出了 `validateRpgStoryboard`，它执行的就是这个操作。

---

## 扩展平台

要在 `@storyboard-os/core` 之上构建第二个模块：

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

## 架构位置

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

`@storyboard-os/core` 位于依赖链的底部。它不从平台导入任何内容。下游模块会向上导入，它们永远不会向下导入。

---

## 信任模型

`@storyboard-os/core` 是一个纯 TypeScript 库。它没有运行时效果，没有 I/O，没有网络访问，也没有副作用。`validateStoryboard` 函数读取您传入的故事板对象，并返回一个纯结果对象。没有任何内容被存储、记录或传输。

---

<p align="center">Part of <a href="https://github.com/mcp-tool-shop-org/storyboard-os">storyboard-os</a> · Built by <a href="https://mcp-tool-shop.github.io/">MCP Tool Shop</a></p>
