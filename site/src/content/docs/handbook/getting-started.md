---
title: Getting Started
description: Install, run, and open a first board in each vertical in under two minutes.
sidebar:
  order: 1
---

## Prerequisites

- Node.js ≥ 22.13
- pnpm 10+

## Install

```bash
git clone https://github.com/mcp-tool-shop-org/storyboard-os
cd storyboard-os
pnpm install
```

## Run (pick a vertical)

| Vertical | Command | Default URL |
|---|---|---|
| **RPG** (durable projects) | `pnpm dev` | [http://localhost:4321](http://localhost:4321) |
| **Marketing** (static campaign boards) | `pnpm dev:marketing` | Astro prints the local URL on start |
| **Cinematic** (static sequence boards) | `pnpm dev:cinematic` | Astro prints the local URL on start |

Only one `pnpm dev*` process is needed for the vertical you are trying. Marketing and cinematic do **not** use localStorage — they ship SSG demo boards plus handoff export. RPG is the vertical with template → project → persist.

## Verify the build

```bash
pnpm verify
```

<!-- AUTOGEN-NOTE: Snapshot values (937 tests, 54 pages) below are manually updated.
     Verify with: pnpm test (test count), pnpm -r build (page count).
     See docs/snapshot-checklist.md for every doc location that holds these snapshots. -->

Runs all 937 tests + builds all 54 pages across all three apps. This is the gate before any commit.

---

## First run — marketing (`/campaigns`)

1. Start the app: `pnpm dev:marketing`.
2. Open the index — it lists the demo campaign and any template-derived boards.
3. Open the demo campaign board: **`/campaigns/campaign-01`** (“Launch rpg-storyboard as First Storyboard OS Vertical”).
4. Inspect frames for launch-readiness signals (approval gates, critical path, measurement loops).
5. Open **`/campaigns/campaign-01/handoff`** and download the campaign brief as Markdown or JSON.

No project list and no browser persistence — edits are not saved across reload in this Phase-0 app. Treat the handoff export as the deliverable.

---

## First run — cinematic (`/sequences`)

1. Start the app: `pnpm dev:cinematic`.
2. Open the index — demo trailer plus template sequences.
3. Open the demo sequence board: **`/sequences/demo-launch-trailer`** (“Storyboard OS Launch Trailer”).
4. Use the production signal panel (health, continuity risk, VFX/audio burden, camera complexity).
5. Open **`/sequences/demo-launch-trailer/handoff`** and download the production brief as Markdown or JSON.

Same persistence note as marketing: static boards today; editable localStorage projects for cinematic are future work (roadmap §1).

---

## First run — RPG (durable projects)

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

Hit **Save** — the panel closes, the board updates, localStorage persists (RPG only).

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

### Explore the demo quest

The Tollhouse Ledger demo is available at `/storyboards/quest-01` — a complete RPG quest with three-faction pressure, branching outcomes, and specific flag names throughout. Use it to understand what "full spec depth" looks like before building your own.

---

## Operator runbook

Release sequence, fourth-vertical checklist, publish rerun, and RPG store recovery live in [`docs/operator-playbook.md`](https://github.com/mcp-tool-shop-org/storyboard-os/blob/main/docs/operator-playbook.md).
