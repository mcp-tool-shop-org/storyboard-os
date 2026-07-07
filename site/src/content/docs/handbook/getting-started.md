---
title: Getting Started
description: Install, run, and create your first project in under two minutes.
sidebar:
  order: 1
---

## Prerequisites

- Node.js 20+
- pnpm 9+

## Install

```bash
git clone https://github.com/mcp-tool-shop-org/storyboard-os
cd storyboard-os
pnpm install
```

## Run

```bash
pnpm dev
```

Open [http://localhost:4321](http://localhost:4321). The app is running.

## Verify the build

```bash
pnpm verify
```

<!-- AUTOGEN-NOTE: Snapshot values (937 tests, 54 pages) below are manually updated.
     Verify with: pnpm test (test count), pnpm -r build (page count).
     See docs/snapshot-checklist.md for every doc location that holds these snapshots. -->

Runs all 937 tests + builds all 54 pages across all three apps. This is the gate before any commit.

---

## Your first project

### 1. Open the template gallery

Navigate to `/templates`. Three production templates are listed, each with a beat-type sequence and design rationale.

Pick **Quest Flow** for a complete quest spine. It generates 8 frames with full implementation depth: entry conditions, state changes, required assets, test criteria, and a dev checklist on every frame.

### 2. Create the project

Click **New Project** on `/projects`. Select your template, give it a name. The board opens with all frames placed.

### 3. Read the board

The canvas shows game-state signal without opening anything:

- **STATE badge** (blue) — this frame modifies game flags or variables
- **SPEC badge** (green) — fully specified: designer notes, assets, tests, checklist present
- **PARTIAL badge** (orange) — some spec present but incomplete
- **DRAFT badge** (gray) — no spec depth yet; exists structurally only

### 4. Edit a beat

Click any frame, then **Edit Beat ✎**. The inline form exposes all spec fields:

- Title and summary
- Designer notes, player-visible text, author-only notes
- Entry conditions, exit conditions, state changes
- Involved characters and factions
- Possible outcomes, required assets, test criteria
- Implementation checklist

Hit **Save** — the panel closes, the board updates, localStorage persists.

### 5. Navigate the board

| Action | Gesture / Key |
|---|---|
| Pan | Drag background |
| Zoom at cursor | Ctrl/Cmd + scroll |
| Pan (trackpad) | Two-finger scroll |
| Fit to screen | `F` |
| Reset to 100% | `0` |
| Zoom in/out | `+` / `-` |
| Deselect | `Escape` |

### 6. Generate a handoff

Click **Handoff →** in the header. The handoff regenerates from live project state — edited content, readiness status, and `[x]` / `[ ]` completion on every checklist item and test criterion. Download as Markdown or JSON.

---

## Explore the demo quest

The Tollhouse Ledger demo is available at `/storyboards/quest-01` — a complete RPG quest with three-faction pressure, branching outcomes, and specific flag names throughout. Use it to understand what "full spec depth" looks like before building your own.
