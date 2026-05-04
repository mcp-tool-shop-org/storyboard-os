<p align="center">
  <a href="README.md">English</a> | <a href="README.zh.md">中文</a> | <a href="README.es.md">Español</a> | <a href="README.fr.md">Français</a> | <a href="README.hi.md">हिन्दी</a> | <a href="README.it.md">Italiano</a> | <a href="README.pt-BR.md">Português (BR)</a>
</p>

<p align="center">
  <img src="https://raw.githubusercontent.com/mcp-tool-shop-org/brand/main/logos/storyboard-os/readme.png" alt="Storyboard OS" width="400" />
</p>

<p align="center">
  <a href="https://github.com/mcp-tool-shop-org/storyboard-os/actions/workflows/ci.yml"><img src="https://github.com/mcp-tool-shop-org/storyboard-os/actions/workflows/ci.yml/badge.svg" alt="CI" /></a>
  <a href="https://www.npmjs.com/package/@storyboard-os/core"><img src="https://img.shields.io/npm/v/@storyboard-os/core.svg" alt="npm" /></a>
  <a href="../../LICENSE"><img src="https://img.shields.io/badge/license-MIT-blue.svg" alt="MIT License" /></a>
</p>

<p align="center"><strong>汎用的なストーリーボードの基本要素。特定の分野に特化した用語は含まれていません。</strong></p>

---

# `@storyboard-os/core`

Storyboard OSプラットフォームの構造的な基盤。すべての分野のパッケージで利用される汎用的な型を定義します。具体的には、フレーム、接続、注釈、ストーリーボード、テンプレート、および構造検証が含まれます。

`@storyboard-os/core` は**依存関係がなく**、**特定の分野に特化した用語は一切含まれていません**。RPGのクエスト、映画のシーン、またはキャンペーンマップといったものが何かを理解していません。分野ごとのパッケージは、これらの汎用的な要素をインポートし、独自のコンテンツスキーマやフレームタイプでカスタマイズします。

---

## インストール

```bash
npm install @storyboard-os/core
# or
pnpm add @storyboard-os/core
```

---

## 提供するもの

### フレーム

`StoryboardFrame` は、ストーリーボードの最小単位である、物語の1つの要素を表します。

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

各分野は、この型のパラメータを定義します。
```ts
// In @storyboard-os/rpg-domain:
type StoryboardFrame = CoreFrame<StoryboardFrameType, FrameContent, FrameAnnotationType>;
```

### 注釈

各フレームに関連付けられた、分野ごとに分類された作成者によるメモ。

```ts
interface FrameAnnotation<TAnnotationType extends string = string> {
  id: string;
  type: TAnnotationType;
  text: string;
}
```

### 接続

接続は、`frame.links` の中に埋もれているのではなく、独立したエンティティです。接続のタイプは、視覚的なレンダリング（線の太さ、破線パターン）を制御し、意味的な情報を持ちます。

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

### ストーリーボード

IDとタイトルを持つ、フレームと接続の集合。

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

### プロジェクト

1つ以上のストーリーボードをまとめるための、シンプルなコンテナ。特定の分野のデータベースではなく、関連するストーリーボードをグループ化するための、最低限の構造を提供します。

```ts
interface StoryboardProject<TStoryboard extends Storyboard = Storyboard> {
  id: string;
  title: string;
  description?: string;
  storyboards: TStoryboard[];
}
```

### テンプレート

特定の分野に特化したストーリーボードを、初期設定から作成するためのファクトリ。

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

## 構造検証

`validateStoryboard` は、どの分野のストーリーボードにも共通する不変条件をチェックします。具体的には、フレームIDの重複、接続参照の破損、必須フィールドの欠落、および無効なフレームのサイズなどが含まれます。

```ts
import { validateStoryboard } from '@storyboard-os/core';

const result = validateStoryboard(storyboard);

if (!result.valid) {
  for (const error of result.errors) {
    console.error(error.code, error.message, error.frameId ?? error.connectionId);
  }
}
```

### エラーコード

| コード | 意味 |
|---|---|
| `EMPTY_STORYBOARD` | ストーリーボードにフレームが含まれていません |
| `DUPLICATE_FRAME_ID` | 2つのフレームが同じIDを共有しています |
| `MISSING_TITLE` | フレームにタイトルがありません |
| `MISSING_TYPE` | フレームにタイプがありません |
| `MISSING_SUMMARY` | フレームに概要がありません |
| `INVALID_DIMENSIONS` | フレームの幅または高さが40px未満です |
| `BROKEN_CONNECTION_FROM` | 接続の `fromFrameId` が存在しないフレームを参照しています |
| `BROKEN_CONNECTION_TO` | 接続の `toFrameId` が存在しないフレームを参照しています |

分野ごとのパッケージは、まず `validateStoryboard` を呼び出し、その後、独自の分野ルールを適用します。`@storyboard-os/rpg-domain` は `validateRpgStoryboard` をエクスポートしており、これはまさにその処理を行います。

---

## プラットフォームの拡張

`@storyboard-os/core` の上に、別の機能を追加するには：

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

## アーキテクチャの位置

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

`@storyboard-os/core` は、依存関係のチェーンの最下部に位置します。プラットフォームから何もインポートしません。下位のパッケージは上位からインポートしますが、下位から上位へのインポートは行いません。

---

## 信頼モデル

`@storyboard-os/core` は、純粋なTypeScriptライブラリです。実行時の副作用、I/O、ネットワークアクセス、およびその他の副作用はありません。`validateStoryboard` 関数は、渡されたストーリーボードオブジェクトを読み取り、プレーンな結果オブジェクトを返します。何も保存、ログ記録、または送信されません。

---

<p align="center">Part of <a href="https://github.com/mcp-tool-shop-org/storyboard-os">storyboard-os</a> · Built by <a href="https://mcp-tool-shop.github.io/">MCP Tool Shop</a></p>
