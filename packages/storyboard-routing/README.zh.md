<p align="center">
  <a href="README.ja.md">日本語</a> | <a href="README.md">English</a> | <a href="README.es.md">Español</a> | <a href="README.fr.md">Français</a> | <a href="README.hi.md">हिन्दी</a> | <a href="README.it.md">Italiano</a> | <a href="README.pt-BR.md">Português (BR)</a>
</p>

<p align="center">
  <img src="https://raw.githubusercontent.com/mcp-tool-shop-org/brand/main/logos/storyboard-os/readme.png" alt="Storyboard OS" width="400" />
</p>

<p align="center">
  <a href="https://github.com/mcp-tool-shop-org/storyboard-os/actions/workflows/ci.yml"><img src="https://github.com/mcp-tool-shop-org/storyboard-os/actions/workflows/ci.yml/badge.svg" alt="CI" /></a>
  <a href="https://www.npmjs.com/package/@storyboard-os/routing"><img src="https://img.shields.io/npm/v/@storyboard-os/routing.svg" alt="npm" /></a>
  <a href="../../LICENSE"><img src="https://img.shields.io/badge/license-MIT-blue.svg" alt="MIT License" /></a>
</p>

<p align="center"><strong>Storyboard OS 应用的可配置 URL 辅助工具。无任何依赖。</strong></p>

---

# @storyboard-os/routing

用于构建在 Storyboard OS 平台上的应用的 URL 构建辅助工具。它可以通过单个配置文件生成板、框架和项目的 URL。纯字符串到字符串转换，不依赖任何框架，不涉及 DOM，没有副作用。

每个应用都提供自己的基础路径。另一个具有不同 URL 结构的应用程序会使用不同的配置文件，并且永远不会与第一个应用程序冲突。

---

## 安装

```bash
npm install @storyboard-os/routing
# or
pnpm add @storyboard-os/routing
```

---

## 用法

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

工厂会从 `storyboardBasePath` 中移除尾随斜杠。

```ts
createStoryboardRoutes({ storyboardBasePath: '/storyboards/' })
  .boardRoute('quest-01')
// → '/storyboards/quest-01'   (trailing slash removed)
```

---

## API

### `createStoryboardRoutes(config)`

返回一个绑定到给定基础路径的 `StoryboardRoutes` 对象。

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

`projectRoute` 不受 `storyboardBasePath` 的影响，项目始终位于 `/projects` 目录下。只有板和框架的路由才使用配置的基础路径。

---

## 多个应用，多个配置文件

每个应用都创建自己的路由工厂。它们不共享任何状态：

```ts
// rpg-storyboard app
const rpgRoutes = createStoryboardRoutes({ storyboardBasePath: '/storyboards' });

// A hypothetical screenplay app
const screenplayRoutes = createStoryboardRoutes({ storyboardBasePath: '/scenes' });

rpgRoutes.boardRoute('quest-01')       // '/storyboards/quest-01'
screenplayRoutes.boardRoute('act-1')   // '/scenes/act-1'
```

---

## 精简的重定向导出模式

通常，应用程序会重定向一个预配置的实例，以便页面组件从应用程序层导入，而不是直接从包中导入：

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

这可以保持内部导入的稳定性，因为当包版本更新时，只需要更新重定向文件。

---

## 架构位置

```
@storyboard-os/routing       ← you are here
  └── (no dependencies)

apps/rpg-storyboard
  └── @storyboard-os/routing
```

`@storyboard-os/routing` 没有从平台或任何领域包中的任何导入。它是一个纯粹的实用工具，它所做的唯一事情就是根据您提供的配置连接字符串。

---

## 信任模型

`@storyboard-os/routing` 是一个纯粹的字符串操作库。它没有运行时副作用，没有 I/O，没有网络访问，也没有任何依赖。所有函数都是同步的，并且具有引用透明性。

---

<p align="center">Part of <a href="https://github.com/mcp-tool-shop-org/storyboard-os">storyboard-os</a> · Built by <a href="https://mcp-tool-shop.github.io/">MCP Tool Shop</a></p>
