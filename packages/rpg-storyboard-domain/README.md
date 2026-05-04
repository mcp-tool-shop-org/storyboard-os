<p align="center">
  <a href="README.ja.md">日本語</a> | <a href="README.zh.md">中文</a> | <a href="README.es.md">Español</a> | <a href="README.fr.md">Français</a> | <a href="README.hi.md">हिन्दी</a> | <a href="README.it.md">Italiano</a> | <a href="README.pt-BR.md">Português (BR)</a>
</p>

<p align="center">
  <img src="https://raw.githubusercontent.com/mcp-tool-shop-org/brand/main/logos/storyboard-os/readme.png" alt="Storyboard OS" width="400" />
</p>

<p align="center">
  <a href="https://github.com/mcp-tool-shop-org/storyboard-os/actions/workflows/ci.yml"><img src="https://github.com/mcp-tool-shop-org/storyboard-os/actions/workflows/ci.yml/badge.svg" alt="CI" /></a>
  <a href="https://www.npmjs.com/package/@storyboard-os/rpg-domain"><img src="https://img.shields.io/npm/v/@storyboard-os/rpg-domain.svg" alt="npm" /></a>
  <a href="../../LICENSE"><img src="https://img.shields.io/badge/license-MIT-blue.svg" alt="MIT License" /></a>
</p>

<p align="center"><strong>RPG game-authoring contract for the Storyboard OS platform.</strong></p>

---

# @storyboard-os/rpg-domain

The RPG game-authoring domain package. Everything an RPG game designer, writer, or developer needs to design implementable quest and scene narrative — frame types, content schema, templates, validation rules, canvas signals, readiness model, handoff generation, and project persistence helpers.

**Target user:** A game designer or developer working on an RPG video game who needs to design beats with enough depth to hand off to an engine or production pass.

**Not for:** Tabletop session prep, GM tools, VTTs, campaign notes, or dialogue-only editors. The validator enforces this — frames containing tabletop-drift terminology fail validation.

---

## Install

```bash
npm install @storyboard-os/rpg-domain
# or
pnpm add @storyboard-os/rpg-domain
```

---

## Frame types

Seven types. Each names a specific function in a playable RPG quest or scene.

| Type | Function | Suggested color |
|---|---|---|
| `hook` | Entry point or open thread — quest opener or future-thread seed | `#EAB308` |
| `scene` | Narrative or location beat — the "where and what" | `#3B82F6` |
| `choice` | Player decision point — branches the board, sets state flags | `#8B5CF6` |
| `encounter` | Combat, puzzle, social conflict, or high-stakes obstacle | `#EF4444` |
| `reveal` | Information, twist, clue, or game-state unlock delivered | `#F97316` |
| `npc_beat` | Character interaction with dialogue branch logic | `#22C55E` |
| `consequence` | World-state outcome — what changes after a choice or event | `#6B7280` |

**Domain rules enforced by `validateRpgStoryboard`:**
- `choice` and `consequence` frames must carry at least one `stateChanges` entry
- `reveal` frames must carry at least one `entryCondition` or `stateChange`
- Frame content may not contain tabletop-drift terms

---

## Content schema

Every RPG frame carries a `FrameContent` object with implementation depth, not just story notes.

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

A frame without `entryConditions`, `stateChanges`, `requiredAssets`, and `testCriteria` is a story note, not a game spec. The guardrail tests enforce this on every template-generated frame.

---

## Templates

Three RPG production starting points. Every template-generated frame carries entry conditions, state changes, required assets, and test criteria. Templates are thinking structures, not blank starting points.

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

### Quest Flow (`quest_flow`) — 8 frames

```
Opening Hook → Establishing Scene → Character Contact → Key Choice
  → The Obstacle → The Reveal → The Consequence → Future Thread
```

Linear quest with one major player-driven branch. Best for first drafts — forces every beat to carry state logic from the start.

### Quest Branch (`quest_branch`) — 7 frames

```
Inciting Situation → Decision Point → [Path A | Path B | Path C]
  → Convergence Point → Fallout Thread
```

Three divergent paths with distinct costs and payoffs. Best for player decisions that create genuinely different gameplay, not the same sequence with different paint.

### Cutscene Beat (`cutscene_beat`) — 5 frames

```
Establishing Frame → Character Beat → The Revelation
  → Player Response → The Shift
```

A dramatic authored moment that preserves player agency. The player response frame is mandatory — without it the sequence is a cutscene in the worst sense.

---

## Validation

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

RPG-specific error codes include `CHOICE_MISSING_STATE_CHANGES`, `CONSEQUENCE_MISSING_STATE_CHANGES`, `REVEAL_MISSING_ENTRY_OR_STATE`, and `TABLETOP_DRIFT_TERM`.

---

## Canvas signals

These functions produce display data from frame content without requiring any canvas or React code. The canvas package renders the results; the domain computes them.

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

## Implementation readiness model

`getBeatStatus` is the authoritative source of what "ready" means. The app renders the result; the domain decides it.

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

### Status levels

| Level | Meaning |
|---|---|
| `ready` | All spec sections present. Spec score ≥ 3 (designerNotes, requiredAssets, testCriteria, implementationChecklist). No domain violations. |
| `partial` | Some spec present but incomplete. Spec score 1–2. |
| `draft` | No spec (score = 0). Frame exists structurally but carries no implementation depth. |
| `blocked` | Domain violation: `choice`/`consequence` missing `stateChanges`, or `reveal` missing both `entryConditions` and `stateChanges`. |

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

## Handoff export

```ts
import { generateHandoff, generateMarkdown } from '@storyboard-os/rpg-domain';

// For template preview boards — static storyboard data
const handoff = generateHandoff(storyboard);
const markdown = generateMarkdown(handoff);
```

Beats are ordered topologically using Kahn's algorithm — upstream dependencies before downstream outcomes. Cycles are detected and remaining frames appended without crashing.

Each `HandoffBeat` includes: status, missing reasons, all spec fields, outgoing branches with type and label, and incoming beat IDs. The handoff header shows total/ready/partial/draft/blocked counts and `blockedBeatIds` / `partialBeatIds` for immediate triage.

---

## Project domain helpers

For durable authoring projects — create a project, edit spec content, and track progress separately from spec text.

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

**Progress invariant:** `implementationChecklist` and `testCriteria` spec strings are never modified by progress functions. Completion state lives separately in `project.progress.frames`. The spec can be edited independently of progress, and the handoff can be regenerated at any time from the current state of both.

### Project handoff

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

## Demo quest — The Tollhouse Ledger

A fully-specced 8-beat quest. Every frame carries specific flag names, asset requirements, and test criteria — usable as a reference implementation or a live demo.

```ts
import { tollhouseLedgerProject } from '@storyboard-os/rpg-domain';

const storyboard = tollhouseLedgerProject.storyboard;
console.log(storyboard.frames.length); // 8

const hook = storyboard.frames[0];
hook.content.stateChanges;   // ['Sets: quest_tollhouse_active = true']
hook.content.requiredAssets; // ['Ruined tollhouse exterior environment', ...]
hook.content.testCriteria;   // ['Player can observe the abandoned caravan without dialogue trigger', ...]
```

**Scenario:** The player arrives at a war-scarred tollhouse. Three factions want the same hidden ledger. The player decides who gets it, who loses, and what the region looks like next. Eight beats with two consequence branches.

---

## Trust model

`@storyboard-os/rpg-domain` is a pure TypeScript library. It has no runtime side effects, no I/O, no network access, and no browser or Node.js APIs. All functions accept data and return data. Nothing is stored, logged, or transmitted by this package — persistence is the responsibility of the consuming app.

---

<p align="center">Part of <a href="https://github.com/mcp-tool-shop-org/storyboard-os">storyboard-os</a> · Built by <a href="https://mcp-tool-shop.github.io/">MCP Tool Shop</a></p>
