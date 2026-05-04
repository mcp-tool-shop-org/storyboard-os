---
title: Authoring Workflow
description: The complete design loop from project creation to developer handoff.
sidebar:
  order: 2
---

## The full authoring loop

This is how a complete design session runs. Each step builds on the last; the board is always the source of truth.

### 1. Create a project

Go to `/projects` → **New Project** → pick a template → name it → the board opens.

Templates generate complete boards — every frame already has entry conditions, state changes, required assets, test criteria, and a checklist. You're editing and refining, not starting from a blank frame.

### 2. Read the board

The canvas shows implementation readiness at a glance:

| Badge | Color | Meaning |
|---|---|---|
| `STATE` | Blue | Frame sets or modifies game flags/variables |
| `SPEC` | Green | Full spec depth — notes, assets, tests, checklist present |
| `PARTIAL` | Orange | Some spec but incomplete — spec score 1–2 |
| `DRAFT` | Gray | No spec depth; exists structurally only |
| `BLOCKED` | Red | Domain violation — see [Readiness Model](/storyboard-os/handbook/reference/#implementation-readiness) |

A glance tells you which beats still need work before handoff.

### 3. Rearrange the board

Drag any frame to reposition it. Position saves automatically — the save status chip shows **Saved ✓** and dismisses after 2 seconds. Arrangement is design: group related beats, spread branches, put the hook at the top.

### 4. Edit a beat

Click a frame → **Edit Beat ✎**. The inline edit form opens with all spec fields:

**Identity**
- `Title` — the beat's name on the board
- `Summary` — one-line description visible on the frame card

**Authoring context**
- `Designer Notes` — intent, tone, design rationale (author-facing)
- `Player-Visible Text` — what the player actually sees or hears
- `Author-Only Notes` — spoilers, hidden logic, future-thread seeds

**Game-state contract**
- `Entry Conditions` — flags that must be true before this beat fires
- `Exit Conditions` — what must be true to resolve
- `State Changes` — what this beat sets or modifies in the world
- `Involved Characters` / `Involved Factions`
- `Possible Outcomes`
- `Stakes` — what's at risk if this beat fails or is skipped

**Implementation fields**
- `Required Assets` — art, audio, animations, dialogue, props
- `Test Criteria` — pass/fail checks for correct implementation
- `Implementation Checklist` — ordered tasks for the dev or production pass

Hit **Save** → panel closes, board updates.

:::tip
`choice` and `consequence` frames **require** at least one `State Changes` entry. `reveal` frames require at least one entry condition or state change. Frames that violate these rules get a `BLOCKED` badge — fix them before handoff.
:::

### 5. Inspect a beat

Click any frame to open the inspector panel (read mode, not edit mode):

- Readiness chip: `READY` / `PARTIAL` / `DRAFT` / `BLOCKED`
- Coverage counts: assets · tests · tasks
- **Blockers** — domain violations listed in red (e.g. choice frame missing stateChanges)
- **Spec gaps** — missing optional fields listed in gray

Use the inspector to triage before handoff: which beats are blocked, which are partial, which are ready.

### 6. Track progress

In the inspector, click any checklist item or test criterion to mark it done. The completion state persists across reload.

**Spec text is never modified by progress.** The `implementationChecklist` and `testCriteria` arrays are spec strings — immutable. Completion state lives separately in `project.progress.frames[frameId]`. The board always shows both: what the spec says, and how far along you are.

### 7. Navigate and pan

The board supports full viewport control:

| Action | Gesture / Key |
|---|---|
| Pan | Drag background |
| Zoom at cursor | Ctrl/Cmd + scroll |
| Pan (trackpad) | Two-finger scroll |
| Fit all frames | `F` |
| Reset to 100% | `0` |
| Zoom in | `+` or `=` |
| Zoom out | `-` |
| Deselect | `Escape` |

ViewControls overlay (lower-right corner) gives mouse access to Fit, 1:1, Zoom+/-.

### 8. Inspect connections

Click any arrow to open the connection panel: type, source and target frames, condition/result label, type description. Connections are first-class — they carry game-state meaning, not just visual arrows. A `choice` arrow is a player-driven branch; a `consequence` arrow is an outcome arc.

### 9. Generate the handoff

Click **Handoff →** in the header. The project handoff page (`/projects/handoff?id=...`) regenerates from live project state:

- Project identity: ID, title, template provenance, created/updated timestamps
- **Progress summary** — checklist done/total, tests done/total across all beats
- **Readiness summary** — ready/partial/draft/blocked counts
- **All beats** in topological quest order (Kahn's algorithm — upstream before downstream, cycle-safe)
- Each beat shows edited content, readiness status, and `[x]` / `[ ]` per checklist item and test criterion

**Download as Markdown** — developer-readable, GitHub-renderable, can go straight into a dev ticket or wiki.

**Download as JSON** — engine-ingestible structure with full typed data.

---

## Template preview workflow

Template boards at `/storyboards/*` are read-only. No project is created. Use them to:

- Browse the three production templates at `/templates`
- Open the Tollhouse Ledger demo at `/storyboards/quest-01`
- Click **Open Frame Page →** in the inspector to read the full spec for any beat
- Export the static handoff from `/storyboards/[id]/handoff`

The preview workflow is for understanding and choosing — the authoring workflow above is for building.
