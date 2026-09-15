---
title: Cinematic playlist
description: Shipped C5 reel — ordered sequence ids, optional take labels, SSG at /reels/demo-launch-reel. Sequences stay the authored unit.
sidebar:
  order: 5
---

A cinematic **sequence** is the authored unit. A **playlist / reel** is a thin folder that owns many sequences. This page documents the **shipped** `SequencePlaylist` (Feature Pass C5). It is **not** an RPG project clone.

## Sequencer grain

Unreal Sequencer: a Level Sequence is the container; shots are sub-sequence assets assembled under a master; takes version a shot. Mapped here:

| Sequencer | Storyboard OS cinematic |
|---|---|
| Shot / sub-sequence asset | `/sequences/:id` board — the authored sequence |
| Master / reel that assembles shots | Playlist — ordered sequence ids |
| Take | Optional **label** on a playlist item, not a persist fork |

The sequence board, inspector, production signals, and production-brief handoff do not move onto the reel. The reel is not a second edit surface.

## Shipped document

SSG-loaded authored JSON, same catalog path as demo + template sequences. `BOARD_SCHEMA_VERSION` is the migration hook. No browser store.

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

Factory: `createSequencePlaylist` in `@storyboard-os/cinematic-domain`. Demo reel: `storyboardOsDemoReel` (`id: demo-launch-reel`).

## Live SSG catalog

`pnpm dev:cinematic` (or the Pages cinematic app) serves:

| Route | What it is |
|---|---|
| `/reels/demo-launch-reel` | Demo reel — launch trailer + three templates, playback order |
| `/sequences/demo-launch-trailer` | Authored demo sequence |
| `/sequences/template-trailer-flow` | Gold template `trailer_flow` |
| `/sequences/template-cutscene-sequence` | Gold template `cutscene_sequence` |
| `/sequences/template-explainer-video` | Gold template `explainer_video` |
| `/sequences/:id/handoff` | Per-sequence production brief (Markdown + JSON `formatVersion` 3) |

The cinematic landing page renders **reel order**. `/sequences/:id` stays the authored board. `getStaticPaths` walks reel ids the same way it walks sequence ids.

A take on a reel item is a **label** (`take: 'A'` on the demo trailer). It is not a persist fork and not a copy of the sequence.

## What this is not

| Rejected | Why |
|---|---|
| `CinematicStoryboardProject` | RPG project envelope wrapping a cloned `Storyboard` |
| `localStorage` / `projectStorage.ts` | RPG-only persist. Cinematic boards are SSG. |
| `/projects/{index,new,board,handoff}` | RPG app routes. Cinematic stays on `/sequences` and `/reels`. |
| `generateCinematicProjectHandoff` | Handoff stays per-sequence; reel brief is optional and thin |
| Progress overlay / checklist completion store | Sequence readiness is spec depth, not a `project.progress` map |
| App-shell extraction | C6 waits on playlist parity |

Marketing `/campaigns` is also not the template. Campaigns are the marketing authored unit (one board). A cinematic reel is a **list of already-authored sequences**, not a campaign-shaped storyboard.

Camera language on shots is structured Sequencer fields (`shotSize` / `lensMm` / `fovDeg` / `move`). It is not a 35° sprite-orbit / azimuth / turnaround vocabulary.

See [Cinematic sequences](./cinematic-storyboard/) and [Getting Started](./getting-started/).
