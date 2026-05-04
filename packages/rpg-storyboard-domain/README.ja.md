<p align="center">
  <a href="README.md">English</a> | <a href="README.zh.md">中文</a> | <a href="README.es.md">Español</a> | <a href="README.fr.md">Français</a> | <a href="README.hi.md">हिन्दी</a> | <a href="README.it.md">Italiano</a> | <a href="README.pt-BR.md">Português (BR)</a>
</p>

<p align="center">
  <img src="https://raw.githubusercontent.com/mcp-tool-shop-org/brand/main/logos/storyboard-os/readme.png" alt="Storyboard OS" width="400" />
</p>

<p align="center">
  <a href="https://github.com/mcp-tool-shop-org/storyboard-os/actions/workflows/ci.yml"><img src="https://github.com/mcp-tool-shop-org/storyboard-os/actions/workflows/ci.yml/badge.svg" alt="CI" /></a>
  <a href="https://www.npmjs.com/package/@storyboard-os/rpg-domain"><img src="https://img.shields.io/npm/v/@storyboard-os/rpg-domain.svg" alt="npm" /></a>
  <a href="../../LICENSE"><img src="https://img.shields.io/badge/license-MIT-blue.svg" alt="MIT License" /></a>
</p>

<p align="center"><strong>RPGゲーム制作用パッケージ。Storyboard OSプラットフォーム向け。</strong></p>

---

# @storyboard-os/rpg-domain

RPGゲーム制作ドメインパッケージ。RPGゲームのデザイナー、ライター、または開発者が、実装可能なクエストやシーンのストーリーを設計するために必要なすべての機能を提供します。フレームの種類、コンテンツスキーマ、テンプレート、検証ルール、キャンバスの信号、準備完了モデル、ハンドオフ生成機能、およびプロジェクトの永続化支援機能が含まれます。

**対象ユーザー:** RPGビデオゲームの開発者またはデザイナーで、エンジンに渡したり、制作段階に進めるために、十分な深みのある構成要素を設計する必要がある方。

**対象外:** テーブルトークRPGの準備、ゲームマスターツール、バーチャルテーブルトップ（VTT）、キャンペーンノート、または会話のみを編集するツール。検証機能がこれを強制します。テーブルトークRPG特有の用語を含むフレームは、検証に失敗します。

---

## インストール

```bash
npm install @storyboard-os/rpg-domain
# or
pnpm add @storyboard-os/rpg-domain
```

---

## フレームの種類

7種類。それぞれが、プレイ可能なRPGのクエストまたはシーンにおける特定の機能を指します。

| 種類 | 機能 | 推奨される色 |
|---|---|---|
| `hook` | 開始点または未解決の要素 — クエストの導入部分または今後の展開のヒント | `#EAB308` |
| `scene` | ストーリーまたはロケーションの構成要素 — 「どこで、何が」 | `#3B82F6` |
| `choice` | プレイヤーの意思決定ポイント — ストーリーの分岐点となり、状態フラグを設定します。 | `#8B5CF6` |
| `encounter` | 戦闘、パズル、社会的対立、または高難易度の障害 | `#EF4444` |
| `reveal` | 情報、伏線、手がかり、またはゲームの状態の変化を提供 | `#F97316` |
| `npc_beat` | キャラクターとのインタラクションと、それに関連する選択肢 | `#22C55E` |
| `consequence` | 世界の状況の変化 — 選択またはイベントによって何が変わるか | `#6B7280` |

`validateRpgStoryboard`によって適用されるルール:
- `choice`（選択肢）と`consequence`（結果）のフレームには、少なくとも1つの`stateChanges`（状態変化）エントリが必要です。
- `reveal`（明示）のフレームには、少なくとも1つの`entryCondition`（開始条件）または`stateChange`（状態変化）が必要です。
- フレームの内容には、テーブルトークRPG特有の用語を含めることはできません。

---

## コンテンツスキーマ

すべてのRPGフレームには、実装の深さを示す`FrameContent`オブジェクトが含まれています。単なるストーリーのメモではありません。

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

`entryConditions`（開始条件）、`stateChanges`（状態変化）、`requiredAssets`（必要なアセット）、および`testCriteria`（テスト基準）のないフレームは、ゲームの仕様ではなく、単なるストーリーのメモです。ガードレールテストは、テンプレートで生成されたすべてのフレームに対してこれを強制します。

---

## テンプレート

RPG制作の開始点となる3つのテンプレート。テンプレートで生成されたすべてのフレームには、開始条件、状態変化、必要なアセット、およびテスト基準が含まれています。テンプレートは、空の開始点ではなく、思考の構造です。

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

### クエストフロー (`quest_flow`) — 8フレーム

```
Opening Hook → Establishing Scene → Character Contact → Key Choice
  → The Obstacle → The Reveal → The Consequence → Future Thread
```

主要なプレイヤー主導の分岐を持つ、直線的なクエスト。初期段階の設計に最適です。すべての構成要素に、最初から状態ロジックを持たせるように促します。

### クエストブランチ (`quest_branch`) — 7フレーム

```
Inciting Situation → Decision Point → [Path A | Path B | Path C]
  → Convergence Point → Fallout Thread
```

異なるコストと報酬を持つ、3つの分岐。プレイヤーの意思決定によって、本当に異なるゲームプレイを実現するために最適です。同じシーケンスに異なる要素を追加するだけではありません。

### カットシーンビート (`cutscene_beat`) — 5フレーム

```
Establishing Frame → Character Beat → The Revelation
  → Player Response → The Shift
```

プレイヤーの主体性を維持する、ドラマチックな演出。プレイヤーの反応フレームは必須です。これがないと、カットシーンとして機能してしまいます。

---

## 検証

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

RPG固有のエラーコードには、`CHOICE_MISSING_STATE_CHANGES`（選択肢に状態変化がない）、`CONSEQUENCE_MISSING_STATE_CHANGES`（結果に状態変化がない）、`REVEAL_MISSING_ENTRY_OR_STATE`（明示に開始条件または状態変化がない）、および`TABLETOP_DRIFT_TERM`（テーブルトークRPG特有の用語が含まれている）などがあります。

---

## キャンバスの信号

これらの関数は、フレームの内容から表示データを生成し、キャンバスやReactコードを必要としません。キャンバスパッケージが結果をレンダリングし、ドメインが計算します。

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

## 実装準備完了モデル

`getBeatStatus`が、「準備完了」の意味を定義する唯一のソースです。アプリが結果を表示し、ドメインがそれを決定します。

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

### ステータスレベル

| レベル | 意味 |
|---|---|
| `ready` | すべての仕様項目が記載されています。仕様スコアが3以上（designerNotes、requiredAssets、testCriteria、implementationChecklist）。ドメイン違反はありません。 |
| `partial` | 一部の仕様項目が記載されているが、不完全です。仕様スコアが1～2。 |
| `draft` | 仕様項目がありません（スコア=0）。構造的にはフレームが存在しますが、実装に関する詳細がありません。 |
| `blocked` | ドメイン違反：`choice`/`consequence`に`stateChanges`が欠けている、または`reveal`に`entryConditions`と`stateChanges`の両方が欠けている。 |

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

## ハンドオフのエクスポート

```ts
import { generateHandoff, generateMarkdown } from '@storyboard-os/rpg-domain';

// For template preview boards — static storyboard data
const handoff = generateHandoff(storyboard);
const markdown = generateMarkdown(handoff);
```

ビートは、Kahnのアルゴリズムを使用してトポロジカルに順序付けされています。依存関係が下流の結果よりも前に配置されます。サイクルが検出され、クラッシュすることなく残りのフレームが追加されます。

各`HandoffBeat`には、ステータス、欠落している理由、すべての仕様項目、タイプとラベルを持つアウトゴーイングブランチ、およびインカミングビートIDが含まれます。ハンドオフヘッダーには、合計数/準備完了数/一部完了数/ドラフト数/ブロック数、および即時のトリアージのための`blockedBeatIds` / `partialBeatIds`が表示されます。

---

## プロジェクトのドメイン関連機能

永続的な作成プロジェクトの場合：プロジェクトを作成し、仕様内容を編集し、仕様テキストとは別に進捗状況を追跡します。

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

**進捗に関する制約：** `implementationChecklist`と`testCriteria`の仕様文字列は、進捗関連の関数によって変更されることはありません。完了状態は`project.progress.frames`に個別に保存されます。仕様は進捗とは独立して編集でき、ハンドオフはいつでも、仕様と進捗の両方の現在の状態から再生成できます。

### プロジェクトのハンドオフ

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

## デモクエスト：The Tollhouse Ledger

完全に仕様が定義された8ビートのクエストです。各フレームには、特定のフラグ名、アセット要件、およびテスト基準が記載されており、リファレンス実装またはライブデモとして使用できます。

```ts
import { tollhouseLedgerProject } from '@storyboard-os/rpg-domain';

const storyboard = tollhouseLedgerProject.storyboard;
console.log(storyboard.frames.length); // 8

const hook = storyboard.frames[0];
hook.content.stateChanges;   // ['Sets: quest_tollhouse_active = true']
hook.content.requiredAssets; // ['Ruined tollhouse exterior environment', ...]
hook.content.testCriteria;   // ['Player can observe the abandoned caravan without dialogue trigger', ...]
```

**シナリオ：** プレイヤーは、戦争で荒廃した料金所（tollhouse）に到着します。3つの派閥が同じ隠された帳簿を求めています。プレイヤーは、誰が帳簿を手に入れるか、誰が失うか、そしてこの地域が次にどうなるかを決定します。2つの結果分岐を持つ8つのビートで構成されています。

---

## 信頼モデル

`@storyboard-os/rpg-domain`は、純粋なTypeScriptライブラリです。実行時の副作用、I/O、ネットワークアクセス、およびブラウザまたはNode.jsのAPIはありません。すべての関数は、データを受け取り、データを返します。このパッケージは、何も保存、ログ記録、または送信しません。永続性は、使用するアプリケーションの責任です。

---

<p align="center">Part of <a href="https://github.com/mcp-tool-shop-org/storyboard-os">storyboard-os</a> · Built by <a href="https://mcp-tool-shop.github.io/">MCP Tool Shop</a></p>
