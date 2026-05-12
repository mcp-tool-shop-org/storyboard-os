<p align="center">
  <a href="README.ja.md">日本語</a> | <a href="README.zh.md">中文</a> | <a href="README.es.md">Español</a> | <a href="README.fr.md">Français</a> | <a href="README.hi.md">हिन्दी</a> | <a href="README.it.md">Italiano</a> | <a href="README.pt-BR.md">Português (BR)</a>
</p>

<p align="center">
  <img src="https://raw.githubusercontent.com/mcp-tool-shop-org/brand/main/logos/storyboard-os/readme.png" alt="Storyboard OS — Visual Stories. Structured. Implemented." width="400" />
</p>

<p align="center">
  <a href="https://github.com/mcp-tool-shop-org/storyboard-os/actions/workflows/ci.yml"><img src="https://github.com/mcp-tool-shop-org/storyboard-os/actions/workflows/ci.yml/badge.svg" alt="CI" /></a>
  <a href="LICENSE"><img src="https://img.shields.io/badge/license-MIT-blue.svg" alt="MIT License" /></a>
</p>


---

一个用于交互式叙事的视觉化故事结构创作平台，涵盖任务、活动、电影片段以及连接它们的制作逻辑。

**三大应用领域，一个平台：**

| 应用领域 | 领域 |
|---|---|
| `rpg-storyboard` | 角色扮演游戏任务/游戏叙事——可直接实施的创作 |
| `marketing-storyboard` | 活动发布——发布准备状态 + 关键路径 |
| `cinematic-storyboard` | 预告片/剪辑/说明视频——制作分镜 |

这三个都是产品，而不是演示。它们之间不互相导入数据。

---

## 什么是 Storyboard OS

一个结构化的面板，用于设计**可实施的叙事**。画布上的每个框架都是一个情节，包含：
- 进入和退出条件
- 状态变化（标志、变量、世界状态）
- 制作阶段所需的资源
- 测试标准，包括通过/失败的判断
- 实施检查清单

该面板可视化的是游戏状态流程，而不仅仅是故事顺序。连接具有意义——选择分支、因果关系、情节主线、备选方案。设计师可以通过阅读该面板，了解游戏实际的运作方式。

## 什么是 Storyboard OS 不具备的功能

- 泛用的图表或白板工具
- 会话运行器或游戏管理员辅助工具
- 世界构建维基或 Lore 数据库
- 仅支持对话树的编辑器
- 活动准备应用程序

如果用户将此产品误认为是上述任何一种，则说明产品方向偏离了。

---

## rpg-storyboard 的功能（第二阶段）

在第二阶段，设计师可以在不离开浏览器的情况下，从头开始完成整个项目，并交付给相关人员：

| 功能 | 用户可以获得 |
|---|---|
| **Project creation** | 从模板创建命名项目；面板位置和编辑内容保存在 localStorage 中 |
| **Visual board** | 任务流程和游戏状态分支逻辑在 Konva 画布上并排显示 |
| **Beat editing** | 可以直接在面板上编辑每个情节的标题、摘要以及所有实施规范字段 |
| **Progress tracking** | 可以为每个情节勾选实施检查清单项目和测试标准；状态在重新加载后仍然有效 |
| **Game-state signal** | 每个情节显示状态徽章（状态：已完成、部分完成/草稿） |
| **Implementation readiness** | 每个情节显示状态（已完成/部分完成/草稿/已阻塞）以及缺少的内容 |
| **Project handoff** | 从实时项目状态重新生成，包括已编辑的内容、每个情节的进度、来源信息 |
| **Quest handoff** | 静态 Markdown + JSON 导出，用于模板预览面板 |
| **Templates** | 三个角色扮演游戏制作的起点，包含情节类型序列和原理说明 |
| **Board operations** | 缩放、平移、适应面板、重置、键盘快捷键——适用于笔记本电脑的导航 |

面板是一个创作表面。情节检查器是一个可编辑的实施规范。交付成果是一个从真实项目状态生成的文档，而不是静态快照。

### 第一阶段的功能（仍然存在）

第一阶段建立了只读预览功能：画布渲染、游戏状态信号、实施准备模型、任务交付导出、模板库以及面板导航。所有第一阶段的功能都已保留并在第二阶段中得到扩展。

---

## 软件包

| 软件包 | 包含内容 |
|---|---|
| `@storyboard-os/core` | 通用的分镜基本元素：框架、连接（类型通用）、注释、模板、结构验证器。每个领域拥有自己的连接词汇表。 |
| `@storyboard-os/rpg-domain` | 角色扮演游戏创作合同：框架类型、内容字段、模板、准备状态模型、交付生成器、Tollhouse Ledger 演示任务。 |
| `@storyboard-os/marketing-domain` | 营销活动实施合同：框架类型（受众、信息、触点、资源、审批、发布活动、衡量）、发布准备状态模型、关键路径、审批门禁、衡量循环、活动简报导出、演示活动。 |
| `@storyboard-os/cinematic-domain` | 电影制作合同：9种帧类型，相机语言，视觉特效/音频/连贯性要求，制作信号（健康状况、负担、复杂度、已拍摄镜头），制作简报传递，3个模板，演示预告片序列。 |
| `@storyboard-os/canvas` | Konva画布渲染器：帧、连接、选择、拖动、类型标签、连接标签、缩放/平移视图。 域名配置已传入。 |
| `@storyboard-os/routing` | 可配置的URL辅助函数：看板和帧路由生成。 无任何依赖。 |

## 应用程序

| 应用程序 | 简介 |
|---|---|
| `rpg-storyboard` | Astro RPG游戏创作产品。 包含：RPG画布配置、帧检查器、简报页面、模板库、路由设置、页面布局。 |
| `marketing-storyboard` | Astro战役实施故事板。 包含：营销画布配置、战役看板、帧检查器、发布准备状态、关键路径强调、发布障碍面板、战役简报传递。 |
| `cinematic-storyboard` | Astro电影制作故事板。 包含：电影画布配置、序列看板、帧检查器（相机/视觉特效/音频/连贯性）、制作信号面板（健康状况/负担/复杂度）、制作简报传递。 |

---

## 架构

这些包形成一个清晰的依赖链：

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

第四个垂直模块将创建自己的域名包，并重用 `@storyboard-os/core`、`@storyboard-os/canvas` 和 `@storyboard-os/routing`，而不会修改任何现有的域名包。 三个垂直模块已经证明了这种模式：对画布、核心或路由没有任何更改。

请参阅 [`docs/architecture.md`](docs/architecture.md) 以获取完整详细信息。

---

## 快速开始

<!-- AUTOGEN-NOTE: 以下快照值（649个测试，54个页面）是手动更新的。
请使用以下命令验证：pnpm test (测试数量)，pnpm -r build (页面数量)。
请参阅 docs/snapshot-checklist.md，了解包含这些快照的每个位置。 -->

```bash
pnpm install
pnpm dev        # starts rpg-storyboard at localhost:4321
pnpm test       # runs all package + app tests (649 tests)
pnpm build      # builds all 3 apps (54 pages)
pnpm verify     # test + build in one command (ship gate)
```

要求：Node ≥ 20, pnpm ≥ 9。

测试范围会自动过滤到 `@storyboard-os/*` 包和 `rpg-storyboard`，它不会拾取父目录中的兄弟工作区。

---

## 信任模型

Storyboard OS 是一个**仅本地运行的浏览器应用程序**，没有服务器，没有帐户，没有网络出站连接。

- **访问的数据：** 项目数据（关卡规范、看板位置、检查列表进度）仅存储在用户机器上的浏览器 `localStorage` 中。
- **未访问的数据：** 没有凭据，没有支付信息，没有超出设计师在关卡规范字段中输入的任何个人数据。
- **没有运行时网络请求。** 该应用程序是一个静态站点。 在初始页面加载后，不会进行任何网络调用。
- **没有遥测。** 不会收集或传输任何数据。

请参阅 [`SECURITY.md`](SECURITY.md) 以获取完整的信任模型和漏洞报告。

---

## 状态

<!-- AUTOGEN-NOTE: 以下快照值（649个测试，54个页面，6个包，3个应用程序）是
手动更新的。 请使用以下命令验证：
pnpm test                       # 测试通过
pnpm -r build                   # 页面构建 (从 Astro 输出中计算)
ls packages/ | wc -l            # 包数量
ls apps/ | wc -l                # 应用程序数量
请参阅 docs/snapshot-checklist.md，了解包含这些的每个文档位置。 -->

```
Phase 2 complete + Marketing Phase 0 complete + Cinematic Phase 0 complete + Core Hardening 1A
649/649 tests passing
54/54 pages built
6 packages · 3 apps
```

| 阶段 | 描述 | 状态 |
|---|---|---|
| 0A–0F | RPG创作验证 — 画布、关卡页面、模板、演示任务 | ✅ |
| 0R | 修复 + 重新锚定 — 每个帧都包含游戏状态规范 | ✅ |
| 0M | 单体仓库迁移 — 核心、域名、画布、路由提取 | ✅ |
| 1A | 画布上的分支 + 状态可见性 | ✅ |
| 1B | 每个关卡的实施准备状态 | ✅ |
| 1C | 任务简报导出 | ✅ |
| 1D | 模板库 | ✅ |
| 1E | 看板操作 — 缩放、平移、适应、视图控制 | ✅ |
| 1F | 发布阶段的收尾工作——文档、更新日志、架构说明 | ✅ |
| 2A | 从模板创建项目——本地存储持久化 | ✅ |
| 2B | 每个项目都具有持久化的界面布局。 | ✅ |
| 2C | 可编辑的场景内容——规格字段在重新加载后仍然存在。 | ✅ |
| 2D | 检查清单/进度持久化——与规格文本分开。 | ✅ |
| 2E | 项目交接——从保存的项目状态重新生成。 | ✅ |
| 2F | 发布阶段的收尾工作——文档、更新日志、架构说明 | ✅ |
| M-0A | 营销领域包——包含：Schema、信号、模板、验证、演示活动。 | ✅ |
| M-0B | 营销应用模块——包括：Astro 广告板、帧检查器、项目交接功能。 | ✅ |
| M-0C | 发布准备信号层——包括：关键路径、审批环节、测量循环。 | ✅ |
| M-0D | 营销阶段的收尾工作——文档、更新日志、架构验证。 | ✅ |
| C-0A | 电影领域包——包含：Schema、镜头语言、视觉特效/音频、模板、验证、演示。 | ✅ |
| C-0B | 电影应用模块——包括：Astro 镜头板、帧检查器、制作简报。 | ✅ |
| C-0C | 制作信号层——包括：健康状况、视觉特效/音频负担、镜头复杂度、已阻塞的镜头。 | ✅ |
| C-0D | 电影阶段的收尾工作——文档、更新日志、架构验证。 | ✅ |
| H-1A | 核心安全加固——通用连接类型，每个领域拥有自己的术语。 | ✅ |

---

## 演示

**《托尔豪斯账簿》**——三个派系想要得到同一个隐藏的账簿。玩家决定谁获胜，谁失败，以及该地区将呈现什么样。包含八个场景，每个场景都具有完整的游戏状态规范：标志名称、资源需求、通过/失败测试标准、实施检查清单。

演示中的每个帧都可以作为 RPG 引擎中的一个任务来实现，无需额外的文档。

路径：`/storyboards/quest-01`

---

## 文档

- [`docs/architecture.md`](docs/architecture.md) — 包的划分、依赖规则、画布视口模型、项目存储边界、可扩展性
- [`docs/product-brief.md`](docs/product-brief.md) — RPG 故事板是什么、目标用户、潜在风险提示、验收标准
- [`docs/rpg-storyboard.md`](docs/rpg-storyboard.md) — RPG 游戏创作规范、完整的创作流程（第二阶段）、准备模型、项目交接导出
- [`docs/marketing-storyboard.md`](docs/marketing-storyboard.md) — 营销活动实施规范、发布准备模型、关键路径、排除项
- [`docs/cinematic-storyboard.md`](docs/cinematic-storyboard.md) — 电影制作故事板、制作信号、镜头语言、明确排除项
- [`docs/cinematic-phase-0-closeout.md`](docs/cinematic-phase-0-closeout.md) — 电影第一阶段的核心叙事、验收标准、验证
- [`docs/marketing-phase-0-closeout.md`](docs/marketing-phase-0-closeout.md) — 营销第一阶段的核心叙事、验收标准、验证
- [`docs/phase-2-closeout.md`](docs/phase-2-closeout.md) — 第二阶段的核心叙事、架构完整性记录、明确排除项
- [`docs/phase-1-closeout.md`](docs/phase-1-closeout.md) — 第一阶段的核心叙事和架构完整性记录
- [`docs/phase-0-closeout.md`](docs/phase-0-closeout.md) — 零阶段的内部测试结果和原始第一阶段的任务列表
- [`docs/monorepo-migration.md`](docs/monorepo-migration.md) — 单仓库迁移日志：哪些内容被移动了、原因是什么、以及由此产生的架构
- [`CHANGELOG.md`](CHANGELOG.md) — 发布历史
