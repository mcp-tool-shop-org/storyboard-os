# rpg-storyboard — RPG Game Authoring Vertical

## What It Is

A visual authoring tool for RPG video game narrative, quest, scene, encounter, and branch design. The board shows game structure. Every frame page is an implementation spec a developer can build from.

**Target user:** A game designer, writer, or developer working on an RPG video game — someone who needs to design implementable beats and hand them off to an engine or dev pass.

**Not for:** Tabletop session prep, GM aids, VTTs, campaign notes, or dialogue-only editors.

---

## The Game-Authoring Contract

Every frame in `@storyboard-os/rpg-domain` carries implementation depth, not just story notes.

### Per-frame content fields

| Field | Purpose |
|---|---|
| `designerNotes` | Intent, tone, design rationale — author-facing |
| `playerVisibleText` | What the player actually sees or hears |
| `authorOnlyNotes` | Spoilers, hidden logic, future seeds — never shown in-game |
| `stakes` | What is at risk if this beat fails or is skipped |
| `entryConditions` | Game-state flags that must be true before this beat fires |
| `exitConditions` | What must be true for this beat to resolve |
| `stateChanges` | Flags, variables, or world-state this beat sets or modifies |
| `involvedCharacters` | Named characters present or referenced in this beat |
| `involvedFactions` | Factions with stakes in this beat's outcome |
| `possibleOutcomes` | All distinct results this beat can produce |
| `requiredAssets` | Art, audio, props, dialogue, animations needed to implement |
| `testCriteria` | Pass/fail checks that verify correct implementation |
| `implementationChecklist` | Ordered task list for the dev or production pass |

A frame without `entryConditions`, `stateChanges`, `requiredAssets`, and `testCriteria` is a story note, not a game spec. The guardrail tests enforce this on every template-generated frame.

---

## Frame Types

Seven types. Each names a specific function in a playable RPG quest or scene.

| Type | Function | Canvas Color |
|---|---|---|
| `hook` | Entry point or open thread — quest opener or future-thread seed | Yellow `#EAB308` |
| `scene` | Narrative or location beat — the "where and what" | Blue `#3B82F6` |
| `choice` | Player decision point — branches the board, sets state flags | Purple `#8B5CF6` |
| `encounter` | Combat, puzzle, social conflict, or high-stakes obstacle | Red `#EF4444` |
| `reveal` | Information, twist, clue, or game-state unlock delivered | Orange `#F97316` |
| `npc_beat` | Character interaction with dialogue branch logic | Green `#22C55E` |
| `consequence` | World-state outcome — what changes after a choice or event | Gray `#6B7280` |

**Domain rules (enforced by `validateRpgStoryboard`):**
- `choice` and `consequence` frames must carry at least one `stateChanges` entry
- `reveal` frames must carry at least one `entryCondition` or `stateChange`
- No frame content may contain tabletop-drift terms

---

## Connection Types

Connections are first-class entities. They carry game-state meaning, not just arrows.

| Type | Meaning | Canvas Style |
|---|---|---|
| `sequence` | Linear progression — beat A leads to beat B | Solid gray |
| `choice` | Player-driven branch — one of N paths opens | Dashed purple |
| `consequence` | Outcome arc — state change drives the next beat | Solid red |
| `optional` | Conditional or skippable path | Dashed dark |
| `fallback` | Alternate route if primary path is blocked | Dashed orange |

---

## Annotation Types

Per-frame annotations for authoring context.

| Type | Purpose |
|---|---|
| `designer_note` | Design intent — why this beat is structured this way |
| `player_visible` | What the player experiences at this beat |
| `author_only` | Spoilers, hidden state, future-thread seeds |
| `danger` | Warning about a common implementation mistake |
| `timing` | Target play time or pacing guidance |
| `branch_note` | Notes about this beat's outgoing branch logic |

---

## Templates

Templates generate complete boards. Every generated frame carries entry conditions, state changes, required assets, and test criteria. Templates are thinking structures, not blank starting points.

### Quest Flow (`quest_flow`) — 8 frames

A complete quest spine: hook to future thread.

```
Opening Hook → Establishing Scene → Character Contact → Key Choice
  → The Obstacle → The Reveal → The Consequence → Future Thread
```

Design intent: linear quest with one major player-driven branch. The choice sets a flag that determines the encounter type. The reveal recontextualizes something from the opening. The consequence echoes forward into the next quest.

### Quest Branch (`quest_branch`) — 7 frames

A branching quest with three divergent paths and a convergence point.

```
Inciting Situation → Decision Point → [Path A | Path B | Path C]
  → Convergence Point → Fallout Thread
```

Design intent: three paths with distinct costs and payoffs. Path A is fast and expensive. Path B is slow and informed. Path C is lateral and uncertain. All three arrive at the same convergence with different resources, information, and leverage.

### Cutscene Beat (`cutscene_beat`) — 5 frames

A dramatic authored moment that preserves player agency.

```
Establishing Frame → Character Beat → The Revelation
  → Player Response → The Shift
```

Design intent: the player response frame is mandatory. Without it the sequence is a cinematic in the worst sense. The shift records the lasting game-state change this moment produces.

---

## Demo Quest — The Tollhouse Ledger

Exported from `@storyboard-os/rpg-domain` as `tollhouseLedgerProject`.

**Scenario:** The player arrives at a war-scarred tollhouse. Three factions want the same hidden ledger — a document that proves war crimes, shifts trade routes, or buys someone's silence. The player decides who gets it, who loses, and what the region looks like next.

**Quest structure:**
1. The Caravan Arrives Damaged — environmental hook, empty road, abandoned caravan
2. The Wounded Tollkeeper — NPC with dialogue branches, trust-state system, wound as interactive element
3. Who Do You Trust? — three-faction pressure sequence, escalating timer, no clean answer
4. Ambush at the Tollhouse — three-way conflict, ledger is the objective (not clearance)
5. What the Ledger Actually Says — in-engine readable document, Orvyn's name on page eleven
6. Consequence A: The Ledger Goes Public — region destabilizes, roads go dark, Orvyn arrested
7. Consequence B: The Ledger Is Hidden — faction gains leverage, world repairs visually, weight is there
8. Savan Has a Copy — future thread, Quest 02 entry condition, Velthari contact opened

Every frame in the demo has specific flag names (`quest_tollhouse_active`, `orvyn_trust_level`, `ledger_state`, `savan_escaped`), asset requirements with implementation detail, and test criteria with pass/fail checks.

---

## Guardrail Tests

`@storyboard-os/rpg-domain/src/templates.test.ts` — 69 tests.

Key guardrails (run on every template, every frame):
- Every frame has `implementationChecklist` with at least one item
- Every frame has `requiredAssets` with at least one item
- Every connection has a non-empty label
- `choice` frames have `stateChanges` defined
- `consequence` frames have `stateChanges` defined
- `reveal` frames have `stateChanges` or `entryConditions`
- `testCriteria` defined on at least half of all frames
- No frame content contains tabletop-drift terms (`gm notes`, `prep session`, `at the table`, `tabletop`, `campaign prep`, `run a session`)

These tests run in `packages/rpg-storyboard-domain` and in `apps/rpg-storyboard`. Both must stay green.
