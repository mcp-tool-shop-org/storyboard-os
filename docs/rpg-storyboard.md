# rpg-storyboard — RPG Game Authoring Vertical

## What It Is

A visual authoring tool for RPG video game narrative, quest, scene, encounter, and branch design. The board shows game structure. Every frame page is an implementation spec a developer can build from.

**Target user:** A game designer, writer, or developer working on an RPG video game — someone who needs to design implementable beats and hand them off to an engine or dev pass.

**Not for:** Tabletop session prep, GM aids, VTTs, campaign notes, or dialogue-only editors.

---

## The Authoring Loop (Phase 2 — Durable Projects)

After Phase 2, a designer has a complete local authoring workflow without a backend:

1. **Create a project** — `/projects` → "New Project" → pick a template → name it → board opens.

2. **Read the board** — the canvas shows game-state signal without opening any inspector:
   - `STATE` badge (blue) — frame modifies game flags or variables
   - `SPEC` / `PARTIAL` / `DRAFT` badge (green / orange / gray) — implementation depth at a glance

3. **Rearrange the board** — drag any frame; position saves automatically. Save status chip shows "Saved ✓" and dismisses after 2 seconds.

4. **Edit a beat** — click a frame → "Edit Beat ✎" → inline form opens with all spec fields. Title, summary, designer notes, player text, conditions, state changes, assets, outcomes, checklist, test criteria. Save → panel closes, board updates, localStorage persists.

5. **Inspect a beat** — click any frame to open the inspector:
   - `READY` / `PARTIAL` / `DRAFT` / `BLOCKED` status chip
   - Coverage counts: assets · tests · tasks
   - Blockers (domain violations — choice/consequence/reveal without required fields)
   - Spec gaps (missing designerNotes, assets, criteria, checklist)

6. **Track progress** — click checklist items and test criteria in the inspector to mark them done. State persists across reload. Spec text is never modified; only the completion record changes.

7. **Navigate the board** — board operations:
   - `F` → fit all frames to screen
   - `0` → reset to 100%
   - `+` / `-` → zoom in/out
   - `Escape` → deselect
   - Drag background → pan
   - Ctrl/Cmd + scroll → zoom at cursor
   - Plain scroll → pan (natural trackpad)
   - ViewControls overlay (lower-right) for mouse access

8. **Inspect connections** — click any arrow to open the connection panel: type, source/target, condition/result label, type description.

9. **Generate handoff** — click "Handoff →" in the header to open `/projects/handoff?id=...`. The project handoff:
   - Regenerated from live project state — not a static export
   - Shows project identity, template provenance, creation and modification dates
   - Progress summary: checklist done/total, tests done/total across all beats
   - All beats in topological quest order (Kahn's algorithm, cycle-safe)
   - Each beat shows edited content, readiness status, checklist/test completion as `[x]`/`[ ]`
   - Download as Markdown (developer-readable) or JSON (engine-ingestible)

---

## The Preview Loop (Phase 1 — Template Boards)

Template preview boards (`/storyboards/*`) are read-only. No project is created.

1. **Choose a starting point** — `/templates` shows three RPG production templates. Or open the Tollhouse Ledger demo at `/storyboards/quest-01`.

2. **Read the board** — same canvas signal as project boards.

3. **Inspect a beat** — same inspector, without edit or progress controls.

4. **Deep-read a beat** — click "Open Frame Page →" in the inspector to navigate to `/storyboards/[id]/frames/[frameId]`. Full implementation spec: player text, designer notes, entry/exit conditions, state changes, required assets, test criteria, checklist, annotations, connections.

5. **Export handoff** — click "Handoff →" to open `/storyboards/[id]/handoff`. Static SSG page — not regenerated from project state.

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
| `sequence` | Linear progression — beat A leads to beat B | Solid gray, 1.5px |
| `choice` | Player-driven branch — one of N paths opens | Dashed purple, 2.5px |
| `consequence` | Outcome arc — state change drives the next beat | Solid red, 2.5px |
| `optional` | Conditional or skippable path | Dashed dark, 1.5px |
| `fallback` | Alternate route if primary path is blocked | Dashed orange, 2px |

Stroke weight distinguishes game-state branches (`choice`, `consequence`) from narrative sequence at a glance. This is configuration passed from the app to the canvas — the canvas has no knowledge of what the types mean.

---

## Implementation Readiness Model

`getBeatStatus(frame)` in `@storyboard-os/rpg-domain` is the authoritative source of what "ready" means. The app renders the result; the domain decides it.

### Status levels

| Level | Meaning |
|---|---|
| `ready` | All spec sections present. Spec score ≥ 3 (designerNotes, requiredAssets, testCriteria, implementationChecklist). No domain violations. |
| `partial` | Some spec present but incomplete. Spec score 1–2. |
| `draft` | No spec present (score = 0). The beat exists structurally but carries no implementation depth. |
| `blocked` | Domain violation: a `choice`/`consequence` frame missing `stateChanges`, or a `reveal` missing both `entryConditions` and `stateChanges`. Content is present but violates RPG contract. |

Note: an empty `choice` frame (score = 0) is `draft`, not `blocked`. A frame must have at least some content before domain rules apply.

### Missing reasons

```ts
type MissingSpecReason =
  | 'no_state_changes'          // blocking: choice/consequence/reveal domain rule
  | 'no_entry_or_state_change'  // blocking: reveal domain rule
  | 'no_designer_notes'         // spec gap
  | 'no_required_assets'        // spec gap
  | 'no_test_criteria'          // spec gap
  | 'no_implementation_checklist' // spec gap
  | 'no_stakes'                 // advisory
  | 'no_possible_outcomes';     // advisory
```

`BLOCKING_REASONS` (exported from `@storyboard-os/rpg-domain`) is the runtime set `{ 'no_state_changes', 'no_entry_or_state_change' }`. The app uses it to distinguish blockers (red ⚠) from spec gaps (gray –) in the inspector.

---

## Quest Handoff Export (Template Boards)

`generateHandoff(storyboard)` returns a `QuestHandoff` object. `generateMarkdown(handoff)` converts it to a developer-readable Markdown string.

### Beat ordering

Beats are ordered topologically using Kahn's algorithm — the sequence a developer would implement them: upstream dependencies before downstream outcomes. Cycles are detected and remaining frames appended without crashing.

### Per-beat content

Every `HandoffBeat` includes:
- Status and missing reasons
- All spec fields (conditions, state changes, assets, checklist, criteria)
- `outgoingBranches` — type, label, destination ID and title
- `incomingFromIds` — which beats lead here

### Readiness summary

The handoff header shows: `total`, `ready`, `partial`, `draft`, `blocked` counts and `readyFraction`. `blockedBeatIds` and `partialBeatIds` are listed at the top so the developer knows immediately what needs attention before implementation.

---

## Project Handoff Export (Durable Projects)

`generateProjectHandoff(project)` returns a `ProjectHandoff` — the bridge between the authoring project and the implementation pass.

### What makes it different from quest handoff

The project handoff layers three things on top of the quest handoff:

| Layer | Source |
|---|---|
| Project identity | `project.id`, `project.title`, `project.sourceTemplateId`, `createdAt`/`updatedAt` |
| Edited beat content | `project.storyboard` — beat spec after all `updateFrameBasics`/`updateFrameContent` calls |
| Progress state | `project.progress` — checklist and test completion records, never mixed with spec text |

### Progress invariant

Checklist items and test criteria in the handoff are the spec strings from `implementationChecklist` and `testCriteria`. Completion state (`checklistProgress`, `testProgress` arrays of booleans) is read from `project.progress.frames[frameId]`.

This means the handoff can be regenerated at any point during implementation and will accurately reflect:
- The current authored spec (including any edits made since project creation)
- The current completion state (without any mutation of spec strings)

### `generateProjectMarkdown(handoff)`

Produces a Markdown document with:
- Project identity header (ID, title, template, dates)
- Progress summary (X/Y checklist done, X/Y tests done)
- Readiness summary
- All beats with `[x]` / `[ ]` per item

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

Browse at `/templates`. Each card shows the beat-type sequence, beat count, production rationale, and links to Preview Board and Preview Handoff.

### Quest Flow (`quest_flow`) — 8 frames

A complete quest spine: hook to future thread.

```
Opening Hook → Establishing Scene → Character Contact → Key Choice
  → The Obstacle → The Reveal → The Consequence → Future Thread
```

Design intent: linear quest with one major player-driven branch. The choice sets a flag that determines the encounter type. The reveal recontextualizes something from the opening. The consequence echoes forward into the next quest.

**Best for:** First draft of any new quest. Forces every beat to carry state logic from the start.

### Quest Branch (`quest_branch`) — 7 frames

A branching quest with three divergent paths and a convergence point.

```
Inciting Situation → Decision Point → [Path A | Path B | Path C]
  → Convergence Point → Fallout Thread
```

Design intent: three paths with distinct costs and payoffs. Path A is fast and expensive. Path B is slow and informed. Path C is lateral and uncertain. All three arrive at convergence with different resources, information, and leverage.

**Best for:** Player decisions that should create genuinely different gameplay, not the same sequence with different paint.

### Cutscene Beat (`cutscene_beat`) — 5 frames

A dramatic authored moment that preserves player agency.

```
Establishing Frame → Character Beat → The Revelation
  → Player Response → The Shift
```

Design intent: the player response frame is mandatory. Without it the sequence is a cutscene in the worst sense. The shift records the lasting game-state change this moment produces.

**Best for:** Defining moments — the information that changes everything, the loss that matters.

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

Every frame has specific flag names (`quest_tollhouse_active`, `orvyn_trust_level`, `ledger_state`, `savan_escaped`), asset requirements with implementation detail, and test criteria with pass/fail checks.

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

These tests run in `packages/rpg-storyboard-domain`. They must stay green. If a template change drops implementation depth below the guardrail threshold, the tests fail before the build runs.
