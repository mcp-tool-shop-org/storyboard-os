<p align="center">
  <a href="README.md">English</a> | <a href="README.zh.md">中文</a> | <a href="README.es.md">Español</a> | <a href="README.fr.md">Français</a> | <a href="README.hi.md">हिन्दी</a> | <a href="README.it.md">Italiano</a> | <a href="README.pt-BR.md">Português (BR)</a>
</p>

<p align="center">
  <img src="https://raw.githubusercontent.com/mcp-tool-shop-org/brand/main/logos/storyboard-os/readme.png" alt="Storyboard OS" width="400" />
</p>

<p align="center">
  <a href="https://github.com/mcp-tool-shop-org/storyboard-os/actions/workflows/ci.yml"><img src="https://github.com/mcp-tool-shop-org/storyboard-os/actions/workflows/ci.yml/badge.svg" alt="CI" /></a>
  <a href="https://www.npmjs.com/package/@storyboard-os/routing"><img src="https://img.shields.io/npm/v/@storyboard-os/routing.svg" alt="npm" /></a>
  <a href="../../LICENSE"><img src="https://img.shields.io/badge/license-MIT-blue.svg" alt="MIT License" /></a>
</p>

<p align="center"><strong>Storyboard OS アプリケーション向けの、設定可能な URL ヘルパー。依存関係はゼロです。</strong></p>

---

# @storyboard-os/routing

Storyboard OS プラットフォーム上で構築されたアプリケーション向けの、URL 構築ヘルパー。単一の設定から、ボード、フレーム、プロジェクトの URL を生成します。純粋な文字列 → 文字列の変換であり、フレームワークの依存関係、DOM、副作用はありません。

各アプリケーションは、独自のベースパスを提供します。異なる URL 構造を持つ別のアプリケーションは、異なる設定を使用し、最初のアプリケーションとの競合は発生しません。

---

## インストール

```bash
npm install @storyboard-os/routing
# or
pnpm add @storyboard-os/routing
```

---

## 使用方法

```ts
import { createStoryboardRoutes } from '@storyboard-os/routing';

// Create a route factory for your app's URL structure
const routes = createStoryboardRoutes({ storyboardBasePath: '/storyboards' });

// Board — the canvas view
routes.boardRoute('quest-01')
// → '/storyboards/quest-01'

// Frame — the beat detail page
routes.frameRoute('quest-01', 'hook-arrival')
// → '/storyboards/quest-01/frames/hook-arrival'

// Project — a user-authored project board
routes.projectRoute('my-project-id')
// → '/projects/my-project-id'
```

ファクトリは、`storyboardBasePath` から末尾のスラッシュを削除します。

```ts
createStoryboardRoutes({ storyboardBasePath: '/storyboards/' })
  .boardRoute('quest-01')
// → '/storyboards/quest-01'   (trailing slash removed)
```

---

## API

### `createStoryboardRoutes(config)`

指定されたベースパスにバインドされた `StoryboardRoutes` オブジェクトを返します。

```ts
function createStoryboardRoutes(config: StoryboardRouteConfig): StoryboardRoutes;

interface StoryboardRouteConfig {
  /** Base path for board and frame URLs. Example: '/storyboards'. */
  storyboardBasePath: string;
}

interface StoryboardRoutes {
  /** Board canvas URL: `<base>/<storyboardId>` */
  boardRoute(storyboardId: string): string;

  /** Beat detail page URL: `<base>/<storyboardId>/frames/<frameId>` */
  frameRoute(storyboardId: string, frameId: string): string;

  /** Project board URL: `/projects/<projectId>` (always at /projects) */
  projectRoute(projectId: string): string;
}
```

`projectRoute` は `storyboardBasePath` の影響を受けません。プロジェクトは常に `/projects` に存在します。ストーリーボードとフレームのルートのみが、設定されたベースを使用します。

---

## 複数のアプリケーション、複数の設定

各アプリケーションは、独自のルートファクトリを作成します。それらは状態を共有することはありません。

```ts
// rpg-storyboard app
const rpgRoutes = createStoryboardRoutes({ storyboardBasePath: '/storyboards' });

// A hypothetical screenplay app
const screenplayRoutes = createStoryboardRoutes({ storyboardBasePath: '/scenes' });

rpgRoutes.boardRoute('quest-01')       // '/storyboards/quest-01'
screenplayRoutes.boardRoute('act-1')   // '/scenes/act-1'
```

---

## シンプルな再エクスポートパターン

通常、アプリケーションは、あらかじめ設定されたインスタンスを再エクスポートします。これにより、ページコンポーネントは、パッケージから直接インポートするのではなく、アプリケーションレイヤーからインポートします。

```ts
// apps/rpg-storyboard/src/lib/routes.ts
import { createStoryboardRoutes } from '@storyboard-os/routing';

export const routes = createStoryboardRoutes({ storyboardBasePath: '/storyboards' });
```

```ts
// anywhere in the app
import { routes } from '../lib/routes';

const href = routes.boardRoute(storyboard.id);
```

これにより、パッケージのバージョンが進化しても、内部インポートが安定します。更新が必要なのは、再エクスポートファイルのみです。

---

## アーキテクチャの位置

```
@storyboard-os/routing       ← you are here
  └── (no dependencies)

apps/rpg-storyboard
  └── @storyboard-os/routing
```

`@storyboard-os/routing` は、プラットフォームやドメインパッケージからのインポートを一切含んでいません。これは純粋なユーティリティであり、提供された設定に従って文字列を連結する機能のみを備えています。

---

## 信頼モデル

`@storyboard-os/routing` は、純粋な文字列操作ライブラリです。実行時の副作用、I/O、ネットワークアクセス、依存関係はありません。すべての関数は同期であり、参照的に透明です。

---

<p align="center">Part of <a href="https://github.com/mcp-tool-shop-org/storyboard-os">storyboard-os</a> · Built by <a href="https://mcp-tool-shop.github.io/">MCP Tool Shop</a></p>
