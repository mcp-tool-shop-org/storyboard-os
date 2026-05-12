# Phase 0 Closeout — RPG Storyboard

_Spike dates: Phase 0A–0F_
_Tech: Astro 4 + TypeScript + Konva.js + react-konva_

> **_Snapshot values in this doc (test count, page count, package count, app count) reflect the state at Phase 0 closeout. They are a historical record; current totals live in the root README.md._**

---

## What This Tool Is

An RPG game authoring storyboard. Not a campaign manager. Not a session prep tool. Not a TTRPG aid.

The target user is a **game designer, writer, or developer** working on an RPG video game — someone who needs to:
- Visualize quest structure and branching game-state flow
- Design implementable beats with enough depth to hand off to an engine or dev pass
- Track narrative logic (entry conditions, state changes, consequence flags) alongside story content

The canvas is the planning surface. The beat pages are the implementation spec. The connections are game-state logic made visible.

---

## Dogfood Walk — Tollhouse Ledger (Phase 0F)

**Scenario:** Designer walks *Quest 01: The Ruined Tollhouse* — a short quest sequence with three competing factions, one ledger, and two consequence branches.
**Test path:** Board view → click frame → read beat page → follow connection → repeat for full quest arc.

**Correct verdict:** A designer could understand and implement the Tollhouse Ledger as a quest sequence in an RPG engine from this tool alone.

### Beats visited

| Beat | Type | Verdict |
|---|---|---|
| The Caravan Arrives Damaged | hook | ✅ Environmental storytelling spec is implementable |
| The Wounded Tollkeeper | npc_beat | ✅ Dialogue branching conditions are explicit |
| Who Do You Trust? | choice | ✅ State change flags defined, pressure design noted |
| Ambush at the Tollhouse | encounter | ✅ Objective (ledger control) clear, scale notes present |
| What the Ledger Actually Says | reveal | ✅ Branch to both consequences clear, state changes defined |
| Consequence A: The Ledger Goes Public | consequence | ✅ World-state flags implementable |
| Consequence B: The Ledger Is Hidden | consequence | ✅ Faction standing changes specified |
| Savan Has a Copy | hook | ✅ Future quest entry condition seeded |

---

## What Worked

### Information architecture
- **Designer Notes / Author Notes separation** — content the player sees (In-Game Text) vs. content only the designer reads (Designer Notes, Author Notes) is immediately visually distinct. Correct color tinting.
- **State Changes section** — game logic lives on the same page as narrative content. Not in a separate system. A designer can read the quest flow and the flag changes in one pass.
- **Implementation Checklist** — actionable per-beat. Not aspirational notes, but concrete tasks.
- **Possible Outcomes** — the designer can see what the beat can produce before deciding how to implement it.
- **Author Notes (🔒)** — spoilers, hidden state, and future threads clearly separated from implementable content.

### Navigation
- **INCOMING / OUTGOING split** — at the branching point (`reveal-ledger`) the designer sees exactly which game-state outcomes lead where.
- **Connection labels** — `expose it →`, `bury it →`, `ledger secured →` — carry game logic meaning, not just narrative arrows.
- **Beat type badges** — CHARACTER BEAT, ENCOUNTER, CHOICE, CONSEQUENCE — scannable game vocabulary.

### Structure
- **First-class connections** — branch logic is not buried in frame data. It is its own entity on the board, visible at a glance.
- **Single data model** — canvas and beat pages read from the same JSON. No drift between the visual structure and the implementation spec.
- **45/45 tests green** — all three templates validate, no broken connection references, cross-template invariants hold.

---

## What Felt Flat

### Beat pages
1. **No Prev / Next navigation between beats.** Moving linearly through a quest requires: read beat → Back to Board → click next beat. Two unnecessary clicks on every linear transition. Under implementation pressure this is friction.
2. **State changes are strings, not structured data.** `"Sets: ledger_public = true"` is readable but not queryable. A designer can't ask "which beats modify faction_standing?" without reading every page.
3. **Implementation Checklist state doesn't persist.** Checking an item is local to the browser tab — reload clears it. For a real implementation pass this is useless.
4. **Connection cards show no summary.** The designer sees the beat type and title, but not the one-line summary before navigating. Hover preview would save constant back-and-forth.

### Canvas
5. **No zoom or pan controls.** A 2400 × 840 canvas on a 1440px monitor has no scale handle. The board is not scrollable across its full width without horizontal scroll.
6. **Frame cards clip long titles.** An `npc_beat` with a long title shows two lines then clips. The summary under it is cut entirely on the card — summary is canvas-only in the inspector, not on the card itself.
7. **No "current beat" marker.** During an active implementation pass the designer can't mark which beat they are currently building.
8. **Templates have no UI.** `createStoryboardFromTemplate()` is wired to code only. There is no "New quest from template" button. The templates are invisible to any user who isn't reading the source.

### Concept gaps
9. **No print or export view.** Designers often work across tools. A clean PDF-ready or Markdown export of the full quest spec would let this feed into engine documentation.
10. **State changes are not connected to each other.** `consequence-expose` sets `ledger_public = true` but there is nothing connecting that flag to the `future-thread` beat's entry condition. The relationship exists in text; the board doesn't visualize it.

---

## Must-Become Phase 1

The spine proves something useful. Phase 1 makes it usable in a real implementation workflow.

Ranked by designer workflow impact:

| Priority | Feature | Why |
|---|---|---|
| P0 | **Sequential Prev / Next beat navigation** | Linear quest reading without board round-trips |
| P0 | **Canvas zoom + pan controls** | Laptop-usable board navigation |
| P1 | **"New quest from template" UI** | Templates are invisible today |
| P1 | **Structured state change fields** | Query-able game logic, not prose strings |
| P1 | **Persistent implementation checklist** | State survives reload |
| P2 | **Beat summary hover on connection cards** | Faster navigation during review |
| P2 | **Current-beat marker** | Track implementation progress on board |
| P2 | **Print / Markdown export** | Quest spec as handoff document |
| P3 | **State graph visualization** — connections that carry flags | Board shows not just story flow but game-state changes |
| P3 | **Test criteria pass/fail tracking** | QA integration |

---

## Phase 0 Acceptance Gates

| Gate | Status |
|---|---|
| 0A: Product brief with game design vocabulary and demo scenario | ✅ |
| 0B: TypeScript schema compiles, demo JSON validates | ✅ |
| 0C: Konva canvas renders frames + connections | ✅ |
| 0D: Astro beat pages with full implementation-spec content | ✅ |
| 0E: Three templates pass validateStoryboard(), 45/45 tests | ✅ |
| 0F: Designer could implement Tollhouse Ledger from this tool | ✅ |
| **1A: Terminology corrected — nothing implies tabletop** | ✅ |
| **0R: Every frame carries entry conditions, state changes, required assets, test criteria** | ✅ |
| **0M: Monorepo migration — core, domain, canvas, routing extracted as @storyboard-os/* packages** | ✅ |

**Phase 0 + 1A + 0R + 0M: Complete.**

---

## Phase 0R — Repair and Re-Anchor

Phase 0R ran after the terminology pass (1A) revealed that renaming was necessary but not sufficient. The real test: could a writer or designer hand this to an RPG implementation pass and have enough structure to build the quest?

### What 0R did

| Sub-task | Description | Status |
|---|---|---|
| 0R-1 | Product Brief Rewrite — RPG video game authoring framing, no tabletop language | ✅ |
| 0R-2 | Demo Quest Hardening — all 8 frames in demo-project.json carry specific flag names, asset lists, and test criteria | ✅ |
| 0R-3 | Template Rebuild — all 3 templates generate game-state-aware boards with requiredAssets, testCriteria, stateChanges on every appropriate frame | ✅ |
| 0R-4 | Frame Page Reorientation — section order changed to implementation-spec order: Player Visible → Designer Notes → Entry/Exit Conditions → State Changes → Required Assets → Test Criteria → Checklist → (Narrative Context) → Annotations → Connections | ✅ |
| 0R-5 | Guardrail Tests — 8 new tests that would fail if the app drifts back to tabletop or drops implementation-spec content | ✅ |

### Test count after 0R

**69/69 tests passing** (up from 45 pre-0R, then +8 guardrail tests written first as failures, then satisfied).

---

---

## Phase 0M — Monorepo Migration

Phase 0M extracted the reusable platform layer into `@storyboard-os/*` packages. The RPG authoring proof stayed intact at every step — tests and build were green after each phase. No capabilities were removed.

### What 0M did

| Phase | Description | Status |
|---|---|---|
| 0M-1 | Monorepo shell — pnpm workspace, root scripts, package stubs | ✅ |
| 0M-2 | App moved — `rpg-storyboard` into `apps/`, 69/69 tests, 10/10 pages | ✅ |
| 0M-3 | Core extracted — `@storyboard-os/core` with generic primitives + structural validator | ✅ |
| 0M-4 | RPG domain extracted — `@storyboard-os/rpg-domain` with schema, templates, validation, demo data, tests | ✅ |
| 0M-5 | Routing extracted — `@storyboard-os/routing` with configurable URL helpers | ✅ |
| 0M-6 | Canvas extracted — `@storyboard-os/canvas` with domain-configurable Konva renderer | ✅ |
| 0M-7 | Docs — root README, architecture, rpg-storyboard, migration log | ✅ |

### Test count after 0M

**138/138 tests passing** — 69 in `@storyboard-os/rpg-domain`, 69 in `apps/rpg-storyboard`.

---

## The Correct North Star

> This is an RPG game authoring storyboard. Every phase must improve the designer's ability to turn narrative structure into implementable game content.

Not: session prep. Not: GM tools. Not: campaign notes.

The canvas is a game design artifact. The beat pages are implementation specs. The connections are game-state logic. Phase 1 deepens all three.
