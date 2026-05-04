# RPG Storyboard — Product Brief

## One-Sentence Thesis

A visual authoring tool for RPG video game narrative, quest, scene, encounter, and branch design — treats game structure as a branching, implementable board, not a flat wiki, a dialogue spreadsheet, or a generic diagram.

---

## The Gap

| Tool Type            | What it does well                            | What it fails at                              |
|----------------------|----------------------------------------------|-----------------------------------------------|
| Storyboard apps      | Visual, frame-based narrative sequencing     | No RPG vocabulary. No game-state awareness.   |
| Dialogue editors     | Branching dialogue trees                     | Single-interaction scope. No quest flow.      |
| Game design wikis    | Lore depth, cross-linking, search            | No visual flow. Implementation logic buried.  |
| Spreadsheets         | Systematic, queryable                        | No spatial layout. No branch visualization.   |
| Engine editors       | Directly implementable                       | Narrative structure buried in implementation. |

RPG storyboarding lives in the gap: **visual like a storyboard, branching like a quest, deep enough to hand off to an engine**.

---

## Target User

**A game designer, writer, or developer working on an RPG video game.**

They need to:
- Visualize quest structure and branching game-state flow on a single canvas
- Design implementable beats with enough depth to hand off to an engine or dev pass
- Track narrative logic (entry conditions, state changes, consequence flags) alongside story content
- Move from narrative intent to implementation spec without switching tools

They do not need:
- Real-time multiplayer during a design session
- A full world-building database before they can design one quest
- AI-generated art or content
- A session-runner or live game management tool

**This is not a tabletop tool.** There is no GM, no session prep, no initiative tracker, no VTT. The target output is implementable game content, not playable session notes.

---

## Core Interaction Loop

```
Board → click frame → implementation spec → follow connection → next frame
```

The board is the primary workspace. Frame pages give each beat full implementation depth. The loop should feel like reading an annotated design document with a navigation layer — not opening a wiki.

A designer should be able to:
1. Open a storyboard for a quest
2. Understand the full narrative and branch structure from the canvas alone
3. Click any frame to see its complete implementation spec
4. Follow connections directly to adjacent frames without returning to the board

---

## RPG Frame Vocabulary

These are the seven frame types. Each one names a specific **function in a playable RPG quest or scene**. They are not generic rectangles.

| Type            | Purpose                                                           | Visual Cue |
|-----------------|-------------------------------------------------------------------|------------|
| **Hook**        | Entry point or loose thread — quest opener or future-thread seed  | Yellow     |
| **Scene**       | Narrative or location beat — the "where and what"                 | Blue       |
| **Choice**      | Player decision point — branches the board, sets state flags      | Purple     |
| **Encounter**   | Combat, puzzle, social conflict, or high-stakes obstacle          | Red        |
| **Reveal**      | Information, twist, clue, or game-state unlock delivered          | Orange     |
| **NPC Beat**    | Character interaction or relationship moment with branch logic    | Green      |
| **Consequence** | World-state outcome — what changes after a choice or event        | Gray       |

---

## Implementation Spec — What Every Beat Page Carries

A beat page is not just story notes. It is a spec a developer can build from.

| Section              | Content                                                                  |
|----------------------|--------------------------------------------------------------------------|
| In-Game Text         | What the player sees, reads, or hears — direct content                   |
| Designer Notes       | Intent, tone, design rationale — author-only                             |
| Entry Conditions     | Game-state flags that must be set before this beat can fire              |
| Exit Conditions      | What must be true for this beat to resolve and the next to unlock        |
| State Changes        | Flags, variables, or world-state values this beat sets or modifies       |
| Required Assets      | Art, audio, dialogue, props, and interactions needed to implement        |
| Test Criteria        | Pass/fail checks that verify correct implementation                      |
| Implementation Checklist | Ordered task list for the dev or production pass                   |

The canvas is the planning surface. The beat pages are the implementation spec. The connections are game-state logic made visible.

---

## Templates

Templates generate full boards with RPG-aware frames, connections, and game-state content. They are thinking structures, not blank starting points. Every generated frame carries entry conditions, state changes, required assets, and test criteria.

### Quest Flow
For a single linear quest arc with one branching point.
```
Hook → Scene → Choice → Encounter → Reveal → [Consequence A | Consequence B] → Future Thread
```

### Quest Branch
For a quest with a major player choice that fans into three distinct paths and reconverges.
```
Hook → NPC Beat → Choice → [Path A | Path B | Path C] → Consequence Frames → Convergence
```

### Cutscene Beat
For an authored narrative moment — cinematic scene, plot delivery, or NPC confrontation.
```
Establishing Frame → NPC Beat → Reveal → Player Response → Consequence
```

---

## Demo Scenario — Phase 0 Dogfood

**The Tollhouse Ledger**

> The player arrives at a war-scarred tollhouse. Three factions want the same hidden ledger — a document that could prove war crimes, shift trade routes, or buy someone's silence. The player decides who gets it, who loses, and what the region looks like next.

Quest includes:
- Opening Hook (environmental storytelling — empty road, abandoned caravan)
- NPC Beat (wounded tollkeeper with a story he doesn't want to tell)
- Choice (three factions, one ledger, escalating pressure)
- Encounter (three-way ambush — objective is ledger control, not clearance)
- Reveal (ledger implicates Orvyn — the old man in the room)
- Consequence A (ledger goes public — region destabilizes, roads go dark)
- Consequence B (ledger is buried — faction gains leverage over the player)
- Future Thread (Savan has a partial copy — Quest 02 entry condition set)

**Correct verdict:** A designer could understand and implement the Tollhouse Ledger as a quest sequence in an RPG engine from this tool alone.

Every frame carries: entry conditions with specific flag names, state changes with exact variable assignments, required assets with implementation detail, and test criteria with pass/fail checks.

---

## Phase 0 Non-Goals

Do not build any of the following in Phase 0:

- Tabletop session runner or GM aid
- Battle maps, initiative tracking, or VTT integration
- Collaboration or multiplayer editing
- Login, accounts, or cloud sync
- AI image or content generation
- Full world-building database or lore wiki
- NPC relationship graph (Phase 3 consideration)
- Export to PDF or Markdown
- Mobile-optimized layout
- Asset marketplace

None of these prove the core interaction. All of them invite drift.

---

## Tech Stack

| Layer     | Choice      | Reason                                                              |
|-----------|-------------|---------------------------------------------------------------------|
| Shell     | Astro       | Real pages, real routes, static-first, no framework sprawl         |
| Canvas    | Konva.js    | Event-driven, interactive, drag/select/click without SVG overhead  |
| Language  | TypeScript  | Schema integrity on frame data, template generation, annotation types |
| Data      | JSON files  | Human-readable, no DB required for Phase 0 proof                   |

Astro is the shell. Konva is the board engine. Do not invert this.

---

## Drift Warnings

| Drift                          | Detection Signal                                                           |
|--------------------------------|----------------------------------------------------------------------------|
| Tabletop / TTRPG framing       | Language like "session prep", "GM notes", "at the table", "campaign prep"  |
| Generic whiteboard             | Frames have no RPG type system or game-state fields                        |
| Obsidian / wiki clone          | Canvas is secondary to notes or pages                                      |
| Dialogue editor only           | Tool handles dialogue trees but not quest flow or state changes             |
| AI-generation first            | Spectacle before interaction truth                                         |
| Export-first                   | PDF/Markdown output before the loop is proven                              |
| Too many entity types          | More than 7 frame types before Phase 0 closes                              |
| Frame pages without game logic | Beat pages look like story notes, not implementation specs                 |

**Primary check:** Can a cold reader confirm this tool produces output a developer could implement directly as RPG game content? If not, the product has drifted.

---

## Acceptance Gates

| Phase | Gate                                                                                                |
|-------|-----------------------------------------------------------------------------------------------------|
| 0A    | Product brief defines the product as RPG video game authoring — no tabletop language                |
| 0B    | One demo project generates a full board and three linked frame pages from JSON                      |
| 0C    | Designer understands quest flow and branch logic from the canvas without opening any frame page     |
| 0D    | Every canvas frame opens a matching implementation spec page; every page links back to the board    |
| 0E    | Choosing a template produces RPG-specific frames with game-state content, not blank boxes           |
| 0F    | A designer could implement the Tollhouse Ledger as a quest in an RPG engine from this tool alone    |
| 1A    | All terminology corrected — no tabletop or session-prep language in any file                        |
| 0R    | Every frame carries entry conditions, state changes, required assets, and test criteria             |

---

## Phase 0 Close Condition

Phase 0 is complete when:

1. The board-to-page-to-board loop works end-to-end.
2. The Tollhouse Ledger scenario is implementable — every frame carries full game-state spec.
3. A cold reader calls this an RPG game authoring tool, not a session prep tool or diagram app.

That is the interaction truth. Everything else is Phase 1.
