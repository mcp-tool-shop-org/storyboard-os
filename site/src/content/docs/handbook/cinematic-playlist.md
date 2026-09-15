---
title: Cinematic playlist
description: Intended C5 reel — ordered sequence ids, optional take labels, SSG-loaded. Sequences stay the authored unit.
sidebar:
  order: 5
---

A cinematic **sequence** is the authored unit. A **playlist / reel** is a thin folder that owns many sequences. This page is the intended shape (Feature Pass C5). It can ship in the handbook now and grow when the domain lands. It is **not** an RPG project clone.

## Sequencer grain

Unreal Sequencer: a Level Sequence is the container; shots are sub-sequence assets assembled under a master; takes version a shot. Mapped here:

| Sequencer | Storyboard OS cinematic |
|---|---|
| Shot / sub-sequence asset | `/sequences/:id` board — the authored sequence |
| Master / reel that assembles shots | Playlist — ordered sequence ids |
| Take | Optional **label** on a playlist item, not a persist fork |

The sequence board, inspector, production signals, and production-brief handoff do not move onto the reel. The reel does not become a second edit surface.

## Intended document

SSG-loaded authored JSON, same load path as today's demo + template sequences. `BOARD_SCHEMA_VERSION` is the migration hook. No browser store.

```ts
interface SequencePlaylist {
  schemaVersion: number;
  id: string;
  title: string;
  description?: string;
  items: Array<{
    sequenceId: string;
    take?: string; // label only — not a copy of the sequence
  }>;
}
```

Optional **reel-level brief** (a short production rollup for the folder) may sit beside the playlist. It does not replace per-sequence `generateProductionBrief`.

When this lands:

1. One demo reel references existing sequence ids (demo trailer + templates).
2. The cinematic landing page renders **reel order**.
3. `/sequences/:id` stays the authored board.
4. SSG `getStaticPaths` walks reel ids the same way it walks sequence ids today.

## What this is not

| Rejected | Why |
|---|---|
| `CinematicStoryboardProject` | RPG project envelope wrapping a cloned `Storyboard` |
| `localStorage` / `projectStorage.ts` | RPG-only persist. Cinematic boards are SSG. |
| `/projects/{index,new,board,handoff}` | RPG app routes. Cinematic stays on `/sequences`. |
| `generateCinematicProjectHandoff` | Handoff stays per-sequence; reel brief is optional and thin |
| Progress overlay / checklist completion store | Sequence readiness is spec depth, not a project.progress map |
| App-shell extraction | C6 waits on playlist parity |

Marketing `/campaigns` is also not the template. Campaigns are the marketing authored unit (one board). A cinematic reel is a **list of already-authored sequences**, not a campaign-shaped storyboard.

## Today (before the domain lands)

- Open a sequence: `/sequences/demo-launch-trailer` after `pnpm dev:cinematic`.
- Inspect shots, read production signals, export the production brief — [Cinematic sequences](./cinematic-storyboard/).
- Persistence: none. Edits are not saved across reload. The deliverable is the handoff export.
- Getting started no longer points cinematic persist at a localStorage project model. See [Getting Started](./getting-started/).

Roadmap: [`docs/roadmap.md`](https://github.com/mcp-tool-shop-org/storyboard-os/blob/main/docs/roadmap.md) §1.