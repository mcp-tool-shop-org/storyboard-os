---
title: Storyboard OS Handbook
description: Visual story-structure authoring platform for implementable game narrative.
sidebar:
  order: 0
---

Storyboard OS is a visual authoring platform for implementable structure. It turns design into implementation specs a team can build from — not just notes, but entry conditions, state changes, required assets, test criteria, and a checklist for the production pass.

Three verticals ship today:
- **rpg-storyboard** — RPG quest and scene authoring for video game designers
- **marketing-storyboard** — campaign implementation storyboard for marketing teams
- **cinematic-storyboard** — production storyboard for trailers, cutscenes, explainers, and game cinematics

## What makes it different

Most narrative tools capture story. Storyboard OS captures game-state. Every frame on the board carries:

- **Entry conditions** — what game flags must be true before this beat fires
- **State changes** — what the beat sets or modifies in the game world
- **Required assets** — art, audio, dialogue, animations needed to ship
- **Test criteria** — pass/fail checks that verify correct implementation
- **Implementation checklist** — ordered tasks for the dev or production pass

A frame without those fields is a story note. Storyboard OS makes the distinction visible: `SPEC` / `PARTIAL` / `DRAFT` badges show implementation depth at a glance without opening a single inspector. The card itself stays thin — type, title, one implementable line, readiness. Full spec lives in the inspector. See [Card vs inspector](./architecture/#card-vs-inspector).

## Three workflows

### rpg-storyboard

| Workflow | Entry point | Purpose |
|---|---|---|
| **Project boards** (durable) | `/projects` | Design, edit, track progress, generate handoffs |
| **Template preview** (read-only) | `/templates` | Browse production templates and demo quest |

Project boards persist across reload. No backend, no accounts, no server — everything lives in localStorage.

### marketing-storyboard

| Workflow | Entry point | Purpose |
|---|---|---|
| **Campaign board** | `/campaigns/:id` | Full campaign canvas with launch readiness signals |
| **Campaign brief** | `/campaigns/:id/handoff` | Markdown + JSON export for execution team |

The marketing board answers: Can this campaign ship, and what blocks it? Boards are static SSG demos — no localStorage persistence in this vertical today.

### cinematic-storyboard

| Workflow | Entry point | Purpose |
|---|---|---|
| **Sequence board** | `/sequences/:id` | Full cinematic canvas with production signals (health, burden, complexity) |
| **Production brief** | `/sequences/:id/handoff` | Markdown + JSON export for production team |

The cinematic board answers: What makes this sequence hard to shoot, animate, edit, or hand off? Same as marketing: static SSG demos today. Sequences are the authored unit; grouping them is a [playlist / reel](./cinematic-playlist/), not an RPG `localStorage` project.

## The handoff

**Handoff →** opens that vertical's export page. Only RPG regenerates from a live project store. Per-vertical first-run URLs: [Getting Started](./getting-started/).

### RPG — live project export

On an RPG project board, **Handoff →** regenerates from live `localStorage` state:

- Project identity and template provenance
- Progress summary: checklist done/total, tests done/total
- All beats in topological quest order (Kahn's algorithm — upstream dependencies before downstream outcomes)
- Each beat shows edited content, readiness status, and `[x]` / `[ ]` completion

Download as **Markdown** (developer-readable) or **JSON** (schema-validated, `formatVersion` 1). Contract: [Handoff JSON contract](./handoff-json/). Engine-native files are compile adapters, never the authoring source.

### Marketing and cinematic — SSG briefs

Marketing `/campaigns/:id/handoff` and cinematic `/sequences/:id/handoff` are static SSG campaign / production briefs. There is no project store and no progress overlay — Markdown and JSON are generated from the authored demo or template board at build time, then offered as a download. Cinematic JSON is `formatVersion` **3** (structured camera). Importers must switch on the discriminator.

## Next steps

- [Getting Started](./getting-started/) — install and first-run paths for RPG, marketing, and cinematic
- [Authoring Workflow](./usage/) — the RPG design loop from project creation to handoff
- [Marketing campaigns](./marketing-storyboard/) — launch readiness, inspect a beat, Launch Blockers, export a brief
- [Cinematic sequences](./cinematic-storyboard/) — production signals, inspect a shot, export a brief
- [Cinematic playlist](./cinematic-playlist/) — shipped reel (`/reels/demo-launch-reel`); not an RPG project clone
- [Architecture](./architecture/) — package map, card vs inspector, density cap, no-AI-auto-wire
- [Reference](./reference/) — frame types, connection types, readiness model, API
- [Handoff JSON contract](./handoff-json/) — `formatVersion`, C4 fields, Markdown vs JSON, engine adapters
- [Operator playbook](https://github.com/mcp-tool-shop-org/storyboard-os/blob/main/docs/operator-playbook.md) — fourth vertical, release/publish rerun, breaking changes, RPG store recovery
