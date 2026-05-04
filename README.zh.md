<p align="center">
  <a href="README.ja.md">日本語</a> | <a href="README.md">English</a> | <a href="README.es.md">Español</a> | <a href="README.fr.md">Français</a> | <a href="README.hi.md">हिन्दी</a> | <a href="README.it.md">Italiano</a> | <a href="README.pt-BR.md">Português (BR)</a>
</p>

<p align="center">
  <img src="https://raw.githubusercontent.com/mcp-tool-shop-org/brand/main/logos/storyboard-os/readme.png" alt="Storyboard OS — Visual Stories. Structured. Implemented." width="400" />
</p>

<p align="center">
  <a href="https://github.com/mcp-tool-shop-org/storyboard-os/actions/workflows/ci.yml"><img src="https://github.com/mcp-tool-shop-org/storyboard-os/actions/workflows/ci.yml/badge.svg" alt="CI" /></a>
  <a href="LICENSE"><img src="https://img.shields.io/badge/license-MIT-blue.svg" alt="MIT License" /></a>
</p>

<p align="center">Built by <a href="https://mcp-tool-shop.github.io/">MCP Tool Shop</a></p>

---

一个用于交互式叙事的可视化故事结构创作平台，包括任务、分支、场景、遭遇、后果，以及连接它们的游戏状态逻辑。

**rpg-storyboard** 是第一个垂直模块：一个用于 RPG 电子游戏任务和场景设计的创作工具。它不是一个演示版或原型。它是这个平台构建的目标。

---

## 什么是 Storyboard OS

一个结构化的面板，用于设计**可实现的叙事内容**。画布上的每个框架代表一个情节，包含：
- 进入和退出条件
- 状态变化（标志、变量、世界状态）
- 制作阶段所需的资源
- 测试标准，包括通过/失败的判断
- 实施检查清单

该面板可视化的是游戏状态流程，而不仅仅是故事顺序。连接具有意义——选择分支、后果弧线、情节主线、备选路径。设计师可以通过阅读面板来理解游戏实际的运作方式。

## 什么是 Storyboard OS 不具备的功能

- 泛用的图表或白板工具
- 会话运行器或游戏主持人辅助工具
- 世界构建维基或 Lore 数据库
- 仅支持对话树的编辑器
- 战役准备应用程序

如果读者将此产品误认为上述任何一种，则说明产品已经偏离了最初的设计方向。

---

## rpg-storyboard 的功能（第二阶段）

在第二阶段，设计师可以在不离开浏览器的情况下，完成从项目开始到交付的整个流程：

| 功能 | 他们将获得什么 |
|---|---|
| **Project creation** | 从模板创建命名项目；面板位置和编辑内容保存在 localStorage 中 |
| **Visual board** | 任务流程和游戏状态分支逻辑在 Konva 画布上并排显示 |
| **Beat editing** | 可以直接在面板上编辑任何情节的标题、摘要以及所有实施规范字段 |
| **Progress tracking** | 为每个情节勾选实施检查清单项目和测试标准；状态在重新加载后仍然有效 |
| **Game-state signal** | 每个情节显示状态（READY/PARTIAL/DRAFT）徽章，无需离开面板 |
| **Implementation readiness** | 每个情节显示 READY/PARTIAL/DRAFT/BLOCKED 状态，以及缺少的内容 |
| **Project handoff** | 从实时项目状态重新生成，包括编辑内容、每个情节的进度、来源信息 |
| **Quest handoff** | 用于模板预览面板的静态 Markdown + JSON 导出 |
| **Templates** | 三个 RPG 制作起点，包含情节类型序列和原理说明 |
| **Board operations** | 缩放、平移、适应面板、重置、键盘快捷键——适用于笔记本电脑的导航 |

面板是一个创作表面。情节检查器是一个可编辑的实施规范。交付物是一个从实际项目状态生成的文档，而不是静态快照。

### 第一阶段的功能（仍然存在）

第一阶段建立了只读预览功能：画布渲染、游戏状态信号、实施准备模型、任务交付导出、模板库和面板导航。所有第一阶段的功能都已保留并在第二阶段中得到扩展。

---

## 包 (Packages)

| 包 (Package) | 它包含的内容 |
|---|---|
| `@storyboard-os/core` | 通用的故事板基本元素：框架、连接、注释、模板、结构验证器。不包含任何领域特定的词汇。 |
| `@storyboard-os/rpg-domain` | RPG 游戏创作合约：框架类型、内容字段、模板、准备模型、交付生成器、Tollhouse Ledger 演示任务。 |
| `@storyboard-os/canvas` | Konva 画布渲染器：框架、连接、选择、拖动、状态徽章、连接标签、缩放/平移视图。传递领域配置。 |
| `@storyboard-os/routing` | 可配置的 URL 辅助工具：面板和框架路由生成。没有依赖项。 |

## 应用程序 (Apps)

| 应用程序 (App) | 它的作用 |
|---|---|
| `rpg-storyboard` | Astro RPG 游戏创作产品。包含：RPG 画布配置、情节检查器、交付页面、模板库、路由设置、页面布局。 |

---

## 架构

这些包形成一个清晰的依赖链：

```
apps/rpg-storyboard
  → @storyboard-os/rpg-domain  (RPG game-authoring contract)
  → @storyboard-os/canvas      (Konva renderer, domain-configurable)
  → @storyboard-os/routing     (URL helpers)

@storyboard-os/rpg-domain
  → @storyboard-os/core        (generic primitives)

@storyboard-os/canvas
  → (no platform deps — pure Konva + React)

@storyboard-os/routing
  → (no deps — pure string helpers)

@storyboard-os/core
  → (no deps)
```

一个第二个垂直模块（例如 `apps/screenplay-storyboard`）会创建自己的域包，并重用 `@storyboard-os/core`、`@storyboard-os/canvas` 和 `@storyboard-os/routing`，而不会修改 `@storyboard-os/rpg-domain`。

请参阅 [`docs/architecture.md`](docs/architecture.md) 以获取完整详情。

---

## 快速开始

```bash
pnpm install
pnpm dev        # starts rpg-storyboard at localhost:4321
pnpm test       # runs all package + app tests (368 tests)
pnpm build      # builds rpg-storyboard (42 pages)
pnpm verify     # test + build in one command (ship gate)
```

要求：Node ≥ 20，pnpm ≥ 9。

测试范围会自动过滤到 `@storyboard-os/*` 包和 `rpg-storyboard`，它不会包含位于父目录中的其他工作区。

---

## 信任模型

Storyboard OS 是一个**仅在本地运行的浏览器应用程序**，没有服务器，没有账户，没有网络连接。

- **涉及的数据：** 项目数据（节拍规范、板位、检查清单进度），仅存储在用户机器上的浏览器 `localStorage` 中。
- **未涉及的数据：** 没有凭证，没有支付信息，没有超出设计师在节拍规范字段中输入的个人数据。
- **没有运行时网络请求。** 该应用程序是一个静态站点。 在初始页面加载后，不会进行任何网络调用。
- **没有遥测。** 不会收集或传输任何数据。

请参阅 [`SECURITY.md`](SECURITY.md) 以获取完整的信任模型和漏洞报告。

---

## 状态

```
Phase 2 complete
368/368 tests passing
42/42 pages built
```

| 阶段 | 描述 | 状态 |
|---|---|---|
| 0A–0F | RPG 内容创作验证：画布、节拍页面、模板、演示任务 | ✅ |
| 0R | 修复 + 重新锚定：每个帧都包含游戏状态规范 | ✅ |
| 0M | 单仓库迁移：核心、域、画布、路由被提取 | ✅ |
| 1A | 画布上的分支 + 状态可见性 | ✅ |
| 1B | 每个节拍的实施准备度 | ✅ |
| 1C | 任务交付导出 | ✅ |
| 1D | 模板库 | ✅ |
| 1E | 板操作：缩放、平移、适应、视口控制 | ✅ |
| 1F | 发布完成：文档、更新日志、架构说明 | ✅ |
| 2A | 从模板创建项目：localStorage 持久化 | ✅ |
| 2B | 每个项目的持久板位 | ✅ |
| 2C | 可编辑的节拍内容：规范字段在重新加载时保持不变 | ✅ |
| 2D | 检查清单 / 进度持久化：与规范文本分开 | ✅ |
| 2E | 项目交付：从保存的项目状态重新生成 | ✅ |
| 2F | 发布完成：文档、更新日志、架构说明 | ✅ |

---

## 演示

**The Tollhouse Ledger（托尔豪斯账本）**：三个派系想要同一个隐藏的账本。 玩家决定谁获胜，谁失败，以及该地区将呈现什么样。 八个节拍，包含完整的游戏状态规范：旗帜名称、资源需求、通过/失败测试标准、实施检查清单。

演示中的每个帧都可以作为 RPG 引擎中的任务进行实施，而无需额外的文档。

路由：`/storyboards/quest-01`

---

## 文档

- [`docs/architecture.md`](docs/architecture.md) — 包分离、依赖规则、画布视口模型、项目存储边界、可扩展性
- [`docs/product-brief.md`](docs/product-brief.md) — rpg-storyboard 的定义、目标用户、潜在风险、验收标准
- [`docs/rpg-storyboard.md`](docs/rpg-storyboard.md) — RPG 游戏创作合同、完整的创作流程（第二阶段）、准备模型、交付导出
- [`docs/phase-2-closeout.md`](docs/phase-2-closeout.md) — 第二阶段的故事主线、架构完整性记录、有意排除的内容
- [`docs/phase-1-closeout.md`](docs/phase-1-closeout.md) — 第一阶段的故事主线和架构完整性记录
- [`docs/phase-0-closeout.md`](docs/phase-0-closeout.md) — 第一阶段的内部测试结果和原始第一阶段待办事项列表
- [`docs/monorepo-migration.md`](docs/monorepo-migration.md) — 单仓库迁移日志：哪些内容被移动了，原因是什么，以及由此产生的架构
- [`CHANGELOG.md`](CHANGELOG.md) — 发布历史
