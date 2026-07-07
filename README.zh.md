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


---

这是一个用于创作交互式叙事作品的视觉化故事结构搭建平台，可以用来设计任务、战役、过场动画以及连接它们的制作逻辑。

三大业务领域，统一平台。

| 垂直的。 | 领域；域名。 |
|---|---|
| `rpg-storyboard` | 角色扮演游戏任务/游戏剧情——可直接用于实施的创作工具。 |
| `marketing-storyboard` | 活动启动——确保准备就绪，并明确关键环节。 |
| `cinematic-storyboard` | 预告片/过场动画/解说视频——制作分镜脚本。 |

这三款产品都是正式版，而不是演示版本。它们之间也没有互相导入或共享任何内容。

---

## 什么是故事板操作系统？

一个结构化的设计板，用于构建**可实现的叙事流程**。画布上的每个框架都代表一个关键环节，包含以下内容：

*   进入和退出条件
*   状态变化（标志、变量、世界状态）
*   制作阶段所需的资源
*   测试标准，包括通过/失败的检查
*   实施清单

该图表展示的是游戏状态的流程，而不仅仅是故事的情节。连接线具有意义——它们代表着选择的分支、结果的发展轨迹、情节的主线以及备选路径。设计师可以通过查看该图表来了解游戏的实际运作方式。

## 故事板操作系统并非以下这些

- 一种通用的流程图或白板工具
- 一种会话引导器或游戏主持人辅助工具
- 一个世界观构建的维基百科或背景资料数据库
- 一个仅用于编辑对话树的编辑器
- 一个战役准备应用程序

如果读者会将这款产品误认为是上述任何一种，那就说明该产品的定位已经发生了偏差。

---

## RPG故事板（第二阶段）的作用是什么？

在完成第二阶段后，设计师可以在浏览器中完成整个项目的设计流程，从开始到最终交付，无需切换其他软件。

| 能力；胜任力 | 他们能得到什么。 |
|---|---|
| **Project creation** | 从模板创建一个命名项目；看板上的位置和编辑内容会保存在本地存储中。 |
| **Visual board** | 在 Konva 画布上，任务流程和游戏状态分支逻辑并排显示。 |
| **Beat editing** | 可以直接在界面上编辑任何节拍的标题、摘要以及所有实现规范字段。 |
| **Progress tracking** | 按照每个阶段的计划，逐项检查已完成的任务和测试标准；确保状态在重新加载时得以保留。 |
| **Game-state signal** | 无需离开工作区即可为每个帧添加徽章（状态、规范/部分/草稿）。 |
| **Implementation readiness** | 每个进度条显示“准备就绪”、“部分完成”、“草稿”或“已阻止”的状态，并标明缺少的项目。 |
| **Project handoff** | 从实际项目状态重新生成——包括已编辑的内容、每个节拍的进度以及来源信息。 |
| **Quest handoff** | 用于模板预览板的静态 Markdown 和 JSON 导出功能。 |
| **Templates** | 三种角色扮演游戏（RPG）的创作起点，以及包含节奏感元素的场景设计和背后的考量。 |
| **Board operations** | 缩放、平移、自动适应屏幕、重置、键盘快捷键——适用于笔记本电脑的导航功能。 |

该面板是一个内容创作界面。节拍检查器是一个可编辑的实现规范。交接文档是从实际项目状态生成的，而不是静态快照。

### 第一阶段的功能（目前仍然存在）

第一阶段确立了只读预览功能，包括：画布渲染、游戏状态信号、实现准备模型、任务交接导出、模板库和面板导航。第二阶段将保留并扩展所有第一阶段的功能。

---

## 包裹；套餐

| 包裹；套装；方案 | 它拥有什么。 |
|---|---|
| `@storyboard-os/core` | 通用的故事板基本元素：帧、连接（不区分类型）、注释、模板、结构验证器。各个领域拥有各自的连接词汇表。 |
| `@storyboard-os/rpg-domain` | 角色扮演游戏创作合同：框架类型、内容字段、模板、准备模型、交付生成器、《收费站账本》演示任务。 |
| `@storyboard-os/marketing-domain` | 营销活动实施合同：框架类型（受众、信息、接触点、素材、审批、启动活动、衡量指标）、启动准备模型、关键路径、审批环节、衡量循环、活动简报导出、演示活动。 |
| `@storyboard-os/cinematic-domain` | 电影制作合同：包含九种镜头类型、摄影语言、视觉特效/音频/连续性要求、制作信号（包括进度、工作量、复杂程度、受阻镜头）、制作简报交接、三个模板以及演示预告片片段。 |
| `@storyboard-os/canvas` | Konva 画布渲染器：框架、连接线、选择功能、拖动功能、类型标签、连接线标签、缩放/平移视口。同时，还会传递领域配置信息。 |
| `@storyboard-os/routing` | 可配置的网址辅助函数：用于生成“论坛”和“框架”路由。无需任何依赖项。 |

## 应用程序

| 应用程序。 | 它是什么。 |
|---|---|
| `rpg-storyboard` | 一款用于创作角色扮演游戏（RPG）的游戏制作工具。它包含以下功能：RPG画布配置、帧检查器、素材管理页面、模板库、流程设置和页面布局。 |
| `marketing-storyboard` | “星云”活动实施流程图。包含：营销画布配置、活动看板、框架检查器、发布准备状态指示、关键路径强调、发布障碍面板以及活动简报交接等内容。 |
| `cinematic-storyboard` | 《星际》电影制作的故事板。包含：电影画面配置、场景流程图、镜头检查器（用于检查相机、特效、音频和连续性）、制作信号面板（显示项目健康状况、工作量和复杂程度）以及制作简报交接。 |

---

## 架构

这些软件包构成了一个清晰的依赖关系链：

```
apps/rpg-storyboard
  → @storyboard-os/rpg-domain       (RPG game-authoring contract)
  → @storyboard-os/canvas           (Konva renderer, domain-configurable)
  → @storyboard-os/routing          (URL helpers)

apps/marketing-storyboard
  → @storyboard-os/marketing-domain  (marketing campaign-implementation contract)
  → @storyboard-os/canvas            (same canvas, different config)
  → @storyboard-os/routing           (URL helpers)

apps/cinematic-storyboard
  → @storyboard-os/cinematic-domain  (cinematic production contract)
  → @storyboard-os/canvas            (same canvas, different config)
  → @storyboard-os/routing           (URL helpers)

@storyboard-os/rpg-domain
  → @storyboard-os/core              (generic primitives)

@storyboard-os/marketing-domain
  → @storyboard-os/core              (generic primitives)

@storyboard-os/cinematic-domain
  → @storyboard-os/core              (generic primitives)

@storyboard-os/canvas
  → (no platform deps — pure Konva + React)

@storyboard-os/routing
  → (no deps — pure string helpers)

@storyboard-os/core
  → (no deps)
```

再增加一个垂直模块，它将创建自己的领域包，并重复使用 `@storyboard-os/core`、`@storyboard-os/canvas` 和 `@storyboard-os/routing`，而无需修改任何现有的领域包。目前已有三个垂直模块证明了这种模式：对画布、核心或路由均未进行任何更改。

请参阅[`docs/architecture.md`](docs/architecture.md)，以获取完整详细信息。

---

## 快速入门

<!-- 注意：以下快照值（937 个测试用例，54 页）是手动更新的。请通过以下命令进行验证：pnpm test（测试用例数量）、pnpm -r build（页面数量）。有关包含这些快照的所有位置的信息，请参阅 docs/snapshot-checklist.md。-->

```bash
pnpm install
pnpm dev        # starts rpg-storyboard at localhost:4321
pnpm test       # runs all package + app tests (937 tests)
pnpm build      # builds all 3 apps (54 pages)
pnpm verify     # typecheck + test + build in one command (ship gate)
```

要求：Node 版本需为 20 或更高，pnpm 版本需为 10 或更高。

测试范围会自动过滤到 `@storyboard-os/*` 包和 `rpg-storyboard` ——它不会选取父目录中的同级工作区。

---

## 信任模型

Storyboard OS 是一个**仅本地的浏览器应用程序**——没有服务器，没有账户，没有网络连接。

- **涉及的数据：**项目数据（关卡规范、版块位置、检查清单进度），仅存储在用户机器上的浏览器 `localStorage` 中。
- **未涉及的数据：**不涉及任何凭据、支付信息或超出设计师在关卡规范字段中输入的内容之外的个人数据。
- **运行时无网络请求。**该应用程序是一个静态网站。初始页面加载后，不会进行任何网络调用。
- **没有遥测数据。**没有任何内容会被收集或传输。

有关完整的信任模型和漏洞报告，请参阅 [`SECURITY.md`](SECURITY.md)。

---

## 状态

<!-- AUTOGEN-NOTE: 以下快照值（937 个测试、54 个页面、6 个包、3 个应用程序）是手动更新的。请使用以下命令进行验证：
pnpm test                       # 测试通过
pnpm -r build                   # 构建页面（从 Astro 输出中计数）
ls packages/ | wc -l            # 包数量
ls apps/ | wc -l                # 应用程序数量
有关包含这些内容的每个文档位置，请参阅 docs/snapshot-checklist.md。 -->

```
Phase 2 + Marketing Phase 0 + Cinematic Phase 0 + Core Hardening 1A + v1.2.0 Health Hardening
937/937 tests passing
54/54 pages built
6 packages · 3 apps
```

| 阶段 | 描述 | 状态 |
|---|---|---|
| 0A–0F | RPG 创作概念验证——画布、关卡页面、模板、演示任务 | ✅ |
| 0R | 修复 + 重新锚定——每个帧都包含游戏状态规范 | ✅ |
| 0M | 单仓库迁移——核心、领域、画布、路由已提取 | ✅ |
| 1A | 画布上的分支和状态可见性 | ✅ |
| 1B | 每个关卡的实现准备情况 | ✅ |
| 1C | 任务交付导出 | ✅ |
| 1D | 模板库 | ✅ |
| 1E | 版块操作——缩放、平移、适应、视口控制 | ✅ |
| 1F | 发布收尾——文档、变更日志、架构说明 | ✅ |
| 2A | 从模板创建项目——localStorage 持久化 | ✅ |
| 2B | 每个项目的持久版块位置 | ✅ |
| 2C | 可编辑的关卡内容——规范字段在重新加载后保持不变 | ✅ |
| 2D | 检查清单/进度持久化——与规范文本分离 | ✅ |
| 2E | 项目交付——从已保存的项目状态重新生成 | ✅ |
| 2F | 发布收尾——文档、变更日志、架构说明 | ✅ |
| M-0A | 营销领域包——模式、信号、模板、验证、演示活动 | ✅ |
| M-0B | 营销应用程序垂直方向——Astro 活动版块、帧检查器、交付 | ✅ |
| M-0C | 发布准备信号层——关键路径、审批关卡、衡量循环 | ✅ |
| M-0D | 营销收尾——文档、变更日志、架构证明 | ✅ |
| C-0A | 电影领域包——模式、摄像机语言、VFX/音频、模板、验证、演示 | ✅ |
| C-0B | 电影应用程序垂直方向——Astro 序列版块、帧检查器、制作简报 | ✅ |
| C-0C | 制作信号层——健康状况、VFX/音频负担、摄像机复杂性、受阻镜头 | ✅ |
| C-0D | 电影收尾——文档、变更日志、架构证明 | ✅ |
| H-1A | 核心强化——通用连接类型，领域拥有自己的词汇表 | ✅ |
| v1.2.0 | 健康强化——验证器无异常抛出、存储弹性 + localStorage 模式版本控制、设计令牌层、键盘/屏幕阅读器画布访问、astro 5 + CI 依赖审计关卡 | ✅ |

---

## 演示

**收费站账本**——三个派系都想要同一个隐藏的账本。玩家决定谁赢，谁输，以及该地区接下来会是什么样子。八个关卡，包含完整的游戏状态规范：旗帜名称、资源需求、通过/失败测试标准、实施检查清单。

演示中的每个帧都可以实现为 RPG 引擎中的一个任务，无需补充文档。

路线：`/storyboards/quest-01`

---

## 文档

- [`docs/architecture.md`](docs/architecture.md)——包分离、依赖规则、画布视口模型、项目存储边界、可扩展性
- [`docs/product-brief.md`](docs/product-brief.md)——rpg-storyboard 是什么，目标用户、漂移警告、验收关卡
- [`docs/rpg-storyboard.md`](docs/rpg-storyboard.md)——RPG 游戏创作协议、完整的创作循环（阶段 2）、准备模型、交付导出
- [`docs/marketing-storyboard.md`](docs/marketing-storyboard.md)——营销活动实施协议、发布准备模型、关键路径、排除项
- [`docs/cinematic-storyboard.md`](docs/cinematic-storyboard.md)——电影制作故事板、制作信号、摄像机语言、有意的排除项
- [`docs/cinematic-phase-0-closeout.md`](docs/cinematic-phase-0-closeout.md)——电影阶段 0 主线叙事、验收关卡、证明
- [`docs/marketing-phase-0-closeout.md`](docs/marketing-phase-0-closeout.md)——营销阶段 0 主线叙事、验收关卡、证明
- [`docs/phase-2-closeout.md`](docs/phase-2-closeout.md)——阶段 2 主线叙事、架构完整性记录、有意的排除项
- [`docs/phase-1-closeout.md`](docs/phase-1-closeout.md)——阶段 1 主线叙事和架构完整性记录
- [`docs/phase-0-closeout.md`](docs/phase-0-closeout.md)——阶段 0 用户测试结果和原始阶段 1 待办事项列表
- [`docs/monorepo-migration.md`](docs/monorepo-migration.md)——0M 迁移日志：哪些内容已移动、原因以及由此产生的架构
- [`CHANGELOG.md`](CHANGELOG.md)——发布历史记录
