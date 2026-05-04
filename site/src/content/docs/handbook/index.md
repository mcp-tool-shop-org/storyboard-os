---
title: Storyboard OS Handbook
description: Visual story-structure authoring platform for implementable game narrative.
sidebar:
  order: 0
---

Storyboard OS is a visual authoring tool for game narrative. It turns story structure into implementation specs a developer can build from — not just notes, but entry conditions, state changes, required assets, test criteria, and a checklist for the dev pass.

The first vertical is **rpg-storyboard**: RPG quest and scene authoring for video game designers.

## What makes it different

Most narrative tools capture story. Storyboard OS captures game-state. Every frame on the board carries:

- **Entry conditions** — what game flags must be true before this beat fires
- **State changes** — what the beat sets or modifies in the game world
- **Required assets** — art, audio, dialogue, animations needed to ship
- **Test criteria** — pass/fail checks that verify correct implementation
- **Implementation checklist** — ordered tasks for the dev or production pass

A frame without those fields is a story note. Storyboard OS makes the distinction visible: `SPEC` / `PARTIAL` / `DRAFT` badges show implementation depth at a glance without opening a single inspector.

## Two workflows

| Workflow | Entry point | Purpose |
|---|---|---|
| **Project boards** (durable) | `/projects` | Design, edit, track progress, generate handoffs |
| **Template preview** (read-only) | `/templates` | Browse production templates and demo quest |

Project boards persist across reload. No backend, no accounts, no server — everything lives in localStorage.

## The handoff

When the board is ready, click **Handoff →** in the header. The project handoff regenerates from live state:

- Project identity and template provenance
- Progress summary: checklist done/total, tests done/total
- All beats in topological quest order (Kahn's algorithm — upstream dependencies before downstream outcomes)
- Each beat shows edited content, readiness status, and `[x]` / `[ ]` completion

Download as **Markdown** (developer-readable) or **JSON** (engine-ingestible).

## Next steps

- [Getting Started](./getting-started/) — install and run in under two minutes
- [Authoring Workflow](./usage/) — the full design loop from project creation to handoff
- [Architecture](./architecture/) — package map, dependency rules, adding a second vertical
- [Reference](./reference/) — frame types, connection types, readiness model, API
