<p align="center">
  <a href="README.ja.md">日本語</a> | <a href="README.md">English</a> | <a href="README.es.md">Español</a> | <a href="README.fr.md">Français</a> | <a href="README.hi.md">हिन्दी</a> | <a href="README.it.md">Italiano</a> | <a href="README.pt-BR.md">Português (BR)</a>
</p>

<p align="center">
  <img src="https://raw.githubusercontent.com/mcp-tool-shop-org/brand/main/logos/storyboard-os/readme.png" alt="Storyboard OS" width="400" />
</p>

<p align="center">
  <a href="https://github.com/mcp-tool-shop-org/storyboard-os/actions/workflows/ci.yml"><img src="https://github.com/mcp-tool-shop-org/storyboard-os/actions/workflows/ci.yml/badge.svg" alt="CI" /></a>
  <a href="https://www.npmjs.com/package/@storyboard-os/rpg-domain"><img src="https://img.shields.io/npm/v/@storyboard-os/rpg-domain.svg" alt="npm" /></a>
  <a href="../../LICENSE"><img src="https://img.shields.io/badge/license-MIT-blue.svg" alt="MIT License" /></a>
</p>

<p align="center"><strong>RPG 游戏创作工具，适用于 Storyboard OS 平台。</strong></p>

---

# @storyboard-os/rpg-domain

RPG 游戏创作领域包。 包含 RPG 游戏设计师、作者或开发者所需的所有内容，用于设计可执行的任务和场景叙事，包括：框架类型、内容模式、模板、验证规则、画布信号、准备状态模型、交付生成以及项目持久化辅助功能。

**目标用户：** 正在开发 RPG 电子游戏的，需要设计具有足够深度的游戏流程，以便传递给游戏引擎或进行制作的 游戏设计师或开发者。

**不适用于：** 桌游准备、游戏主持人工具、虚拟桌面工具、战役笔记或仅用于对话编辑。 验证器会强制执行这一点——包含桌游相关术语的框架将无法通过验证。

---

## 安装

```bash
npm install @storyboard-os/rpg-domain
# or
pnpm add @storyboard-os/rpg-domain
```

---

## 框架类型

七种类型。 每种类型代表可玩 RPG 任务或场景中的一个特定功能。

| 类型 | 功能 | 建议颜色 |
|---|---|---|
| `hook` | 起始点或开放线索——任务的开端或未来发展的线索 | `#EAB308` |
| `scene` | 叙事或场景——“在哪里”和“是什么” | `#3B82F6` |
| `choice` | 玩家决策点——分支流程，设置状态标志 | `#8B5CF6` |
| `encounter` | 战斗、谜题、社交冲突或高风险障碍 | `#EF4444` |
| `reveal` | 提供信息、转折、线索或游戏状态解锁 | `#F97316` |
| `npc_beat` | 角色互动，包含对话分支逻辑 | `#22C55E` |
| `consequence` | 世界状态结果——选择或事件发生后，发生了什么变化 | `#6B7280` |

**`validateRpgStoryboard` 验证器强制执行的规则：**
- `choice`（选择）和 `consequence`（结果）框架必须包含至少一个 `stateChanges`（状态变化）条目。
- `reveal`（揭示）框架必须包含至少一个 `entryCondition`（进入条件）或 `stateChange`（状态变化）。
- 框架内容不得包含桌游相关术语。

---

## 内容模式

每个 RPG 框架都包含一个 `FrameContent` 对象，其中包含实现细节，而不仅仅是故事笔记。

```ts
interface FrameContent {
  designerNotes?: string;          // Intent, tone, design rationale — author-facing
  playerVisibleText?: string;      // What the player actually sees or hears
  authorOnlyNotes?: string;        // Spoilers, hidden logic — never shown in-game
  stakes?: string;                 // What is at risk if this beat fails or is skipped
  entryConditions?: string[];      // Game-state flags that must be true before this fires
  exitConditions?: string[];       // What must be true for this beat to resolve
  stateChanges?: string[];         // Flags / variables / world-state this beat sets
  involvedCharacters?: string[];   // Named characters present or referenced
  involvedFactions?: string[];     // Factions with stakes in this beat
  possibleOutcomes?: string[];     // All distinct results this beat can produce
  requiredAssets?: string[];       // Art, audio, props, dialogue, animations needed
  testCriteria?: string[];         // Pass/fail checks that verify correct implementation
  implementationChecklist?: string[]; // Ordered task list for the dev or production pass
}
```

如果没有 `entryConditions`（进入条件）、`stateChanges`（状态变化）、`requiredAssets`（所需资源）和 `testCriteria`（测试标准），一个框架就只是一个故事笔记，而不是游戏规范。 模板生成的每个框架都会进行这些检查。

---

## 模板

三个 RPG 制作的起始模板。 每个模板生成的框架都包含进入条件、状态变化、所需资源和测试标准。 模板是思考结构，而不是空白的起始点。

```ts
import { STORYBOARD_TEMPLATES, createStoryboardFromTemplate } from '@storyboard-os/rpg-domain';

const template = STORYBOARD_TEMPLATES.find(t => t.id === 'quest_flow');
console.log(template.name);       // 'Quest Flow'
console.log(template.frameCount); // 8
console.log(template.bestFor);    // 'First draft of any new quest...'

const storyboard = createStoryboardFromTemplate('quest_flow', {
  id: 'my-quest',
  title: 'The Ruined Tollhouse',
  description: 'Three factions want the same ledger.',
});
```

### 任务流程 (`quest_flow`) — 8 个框架

```
Opening Hook → Establishing Scene → Character Contact → Key Choice
  → The Obstacle → The Reveal → The Consequence → Future Thread
```

线性任务，包含一个主要由玩家驱动的分支。 适用于初稿——强制每个环节从一开始就包含状态逻辑。

### 任务分支 (`quest_branch`) — 7 个框架

```
Inciting Situation → Decision Point → [Path A | Path B | Path C]
  → Convergence Point → Fallout Thread
```

三个不同的路径，具有不同的成本和收益。 适用于玩家决策，旨在创造真正不同的游戏体验，而不是仅仅改变外观。

### 过场动画片段 (`cutscene_beat`) — 5 个框架

```
Establishing Frame → Character Beat → The Revelation
  → Player Response → The Shift
```

一个精心设计的、保留玩家自主性的戏剧性时刻。 玩家响应框架是强制性的——如果没有它，这个序列就变成了最糟糕的过场动画。

---

## 验证

```ts
import { validateStoryboard, validateRpgStoryboard } from '@storyboard-os/rpg-domain';

// Structural validation only (from @storyboard-os/core)
const structural = validateStoryboard(storyboard);

// RPG domain rules layered on top
const rpg = validateRpgStoryboard(storyboard);

if (!rpg.valid) {
  rpg.errors.forEach(e => console.error(e.code, e.message, e.frameId));
}
```

RPG 相关的错误代码包括：`CHOICE_MISSING_STATE_CHANGES`（选择缺少状态变化）、`CONSEQUENCE_MISSING_STATE_CHANGES`（结果缺少状态变化）、`REVEAL_MISSING_ENTRY_OR_STATE`（揭示缺少进入条件或状态变化）以及 `TABLETOP_DRIFT_TERM`（包含桌游相关术语）。

---

## 画布信号

这些函数可以从框架内容中生成显示数据，而无需任何画布或 React 代码。 画布组件负责渲染结果；领域负责计算结果。

```ts
import { getFrameSignal, getFrameBadges, getChoiceBranchCount } from '@storyboard-os/rpg-domain';

const signal = getFrameSignal(frame);
signal.stateChangeSummary;     // e.g. "Sets 2 flags"
signal.branchConditionSummary; // e.g. "3 outgoing branches"
signal.readiness;              // 'full' | 'partial' | 'none'
signal.hasStateChanges;        // boolean
signal.specScore;              // 0–4

const badges = getFrameBadges(frame, connections);
// → [{ text: 'STATE', color: '#3B82F6' }, { text: 'SPEC', color: '#22C55E' }]
// Rendered by @storyboard-os/canvas without needing to know what they mean
```

---

## 实现准备状态模型

`getBeatStatus` 是确定“已准备好”的权威来源。 应用程序会显示结果；领域决定其状态。

```ts
import { getBeatStatus, getStoryboardReadiness, BLOCKING_REASONS } from '@storyboard-os/rpg-domain';

const status = getBeatStatus(frame);

status.level;             // 'ready' | 'partial' | 'draft' | 'blocked'
status.missing;           // MissingSpecReason[]
status.assetCount;        // number of requiredAssets entries
status.testCriteriaCount; // number of testCriteria entries
status.checklistCount;    // number of implementationChecklist entries

// Distinguish domain violations (blockers) from spec gaps
const blockers = status.missing.filter(r => BLOCKING_REASONS.has(r));
const gaps     = status.missing.filter(r => !BLOCKING_REASONS.has(r));
```

### 状态级别

| 级别 | 含义 |
|---|---|
| `ready` | 所有规范部分都已呈现。规范评分 ≥ 3（包括：设计说明、所需资源、测试标准、实施检查清单）。没有违反任何领域规则。 |
| `partial` | 部分规范已呈现，但内容不完整。规范评分 1–2。 |
| `draft` | 没有规范（评分 = 0）。框架结构存在，但缺乏实施细节。 |
| `blocked` | 领域违规：`choice`/`consequence` 缺少 `stateChanges`，或者 `reveal` 缺少 `entryConditions` 和 `stateChanges`。 |

```ts
// Board-level readiness summary
const summary = getStoryboardReadiness(storyboard);
summary.total;         // total frame count
summary.ready;         // frames at 'ready'
summary.partial;       // frames at 'partial'
summary.draft;         // frames at 'draft'
summary.blocked;       // frames at 'blocked'
summary.readyFraction; // ready / total (0–1)
summary.byFrame;       // Map<frameId, BeatStatus>
```

---

## 交付导出

```ts
import { generateHandoff, generateMarkdown } from '@storyboard-os/rpg-domain';

// For template preview boards — static storyboard data
const handoff = generateHandoff(storyboard);
const markdown = generateMarkdown(handoff);
```

流程节点按照拓扑顺序排列，使用 Kahn 算法，即先处理依赖于当前节点的节点，再处理当前节点影响的节点。循环会被检测到，剩余的流程节点会被追加，而不会导致程序崩溃。

每个 `HandoffBeat` 包含：状态、缺失原因、所有规范字段、所有出站分支（包括类型和标签）、以及所有入站流程节点 ID。交付头信息显示总数、已完成数、部分完成数、草稿数和被阻塞数，以及 `blockedBeatIds` / `partialBeatIds`，方便快速评估。

---

## 项目领域辅助工具

对于需要长期维护的项目，可以创建项目，分别编辑规范内容和跟踪进度，从而实现独立管理。

```ts
import {
  createProject,
  updateFrameBasics,
  updateFrameContent,
  updateFramePosition,
  setChecklistItemComplete,
  setTestCriterionComplete,
  getFrameProgress,
  getProjectProgress,
} from '@storyboard-os/rpg-domain';

// Create a project from a template
const project = createProject({
  title: 'The Ruined Tollhouse',
  description: 'Three factions want the same ledger.',
  sourceTemplateId: 'quest_flow',
});

// All update functions are pure — they return a new project object
const updated = updateFrameBasics(project, 'hook-1', { title: 'The Caravan Arrives' });
const edited  = updateFrameContent(updated, 'hook-1', {
  designerNotes: 'Environmental storytelling — no dialogue in this beat.',
  entryConditions: ['quest_tollhouse_active === true'],
  requiredAssets: ['ruined tollhouse exterior', 'abandoned caravan prop'],
});

// Track progress separately from spec text (spec strings are never modified)
const p1 = setChecklistItemComplete(edited, 'hook-1', 0, true);
const p2 = setTestCriterionComplete(p1, 'hook-1', 0, true);

// Read back progress
const frameProgress = getFrameProgress(p2, 'hook-1');
frameProgress.checklist;    // { "0": true, ... }
frameProgress.testCriteria; // { "0": true, ... }

const summary = getProjectProgress(p2);
summary.totalChecklist; // total checklist items across all frames
summary.doneChecklist;  // completed items
summary.totalTests;     // total test criteria across all frames
summary.doneTests;      // completed criteria
```

**进度不变性：** `implementationChecklist` 和 `testCriteria` 规范字符串永远不会被进度函数修改。完成状态独立存储在 `project.progress.frames` 中。规范可以独立于进度进行编辑，并且可以随时从当前状态重新生成交付文件。

### 项目交付

```ts
import { generateProjectHandoff, generateProjectMarkdown } from '@storyboard-os/rpg-domain';

// For durable projects — includes edited content + progress
const handoff = generateProjectHandoff(project);

handoff.projectId;       // project.id
handoff.title;           // project.title
handoff.sourceTemplateId;
handoff.generatedAt;
handoff.progress;        // ProjectProgressSummary
handoff.beats;           // ProjectHandoffBeat[] — spec + completion arrays

// Each ProjectHandoffBeat extends HandoffBeat with:
// checklistProgress: boolean[]   — one entry per checklist item
// testProgress: boolean[]        — one entry per test criterion

const markdown = generateProjectMarkdown(handoff);
// Produces Markdown with [x]/[ ] per item, project identity header, progress summary
```

---

## 演示任务：The Tollhouse Ledger

这是一个包含 8 个流程节点的完整规范任务。每个流程节点都包含特定的标志名称、资源需求和测试标准，可以作为参考实现或演示示例。

```ts
import { tollhouseLedgerProject } from '@storyboard-os/rpg-domain';

const storyboard = tollhouseLedgerProject.storyboard;
console.log(storyboard.frames.length); // 8

const hook = storyboard.frames[0];
hook.content.stateChanges;   // ['Sets: quest_tollhouse_active = true']
hook.content.requiredAssets; // ['Ruined tollhouse exterior environment', ...]
hook.content.testCriteria;   // ['Player can observe the abandoned caravan without dialogue trigger', ...]
```

**场景：** 玩家到达一座饱受战争摧残的收费站。三个派系都想要同一本隐藏的账簿。玩家决定谁能得到它，谁会失去它，以及该地区接下来会变成什么样子。包含 8 个流程节点，以及两个结果分支。

---

## 信任模型

`@storyboard-os/rpg-domain` 是一个纯 TypeScript 库。它没有运行时副作用，没有 I/O 操作，没有网络访问，也没有浏览器或 Node.js API。所有函数都接受数据并返回数据。此包不会存储、记录或传输任何数据，持久化是调用应用程序的责任。

---

<p align="center">Part of <a href="https://github.com/mcp-tool-shop-org/storyboard-os">storyboard-os</a> · Built by <a href="https://mcp-tool-shop.github.io/">MCP Tool Shop</a></p>
