---
title: Cinematic sequences
description: Production storyboard — production signals, inspect a shot, export a brief. Sequences are the authored unit.
sidebar:
  order: 4
---

A cinematic production storyboard. Every frame is a shot with camera language, VFX/audio requirements, continuity constraints, asset lists, and implementation checklists.

The board answers one question cold: **What makes this sequence hard to shoot, animate, edit, or hand off?**

Production signals are derived from spec completeness and graph structure — not from manually assigned status, timelines, or external tracking.

:::note
GitHub companion: [`docs/cinematic-storyboard.md`](https://github.com/mcp-tool-shop-org/storyboard-os/blob/main/docs/cinematic-storyboard.md). Grouping many sequences is a **playlist / reel**, not an RPG project — [Cinematic playlist](./cinematic-playlist/).
:::

## What it is not

| This tool is not | Why the boundary exists |
|---|---|
| A production scheduling tool | Scheduling is downstream. This captures what needs doing, not when. |
| A crew planner / call sheet | People assignment is not frame semantics. |
| An asset management system | File hosting is infrastructure, not domain logic. |
| A budget / cost estimator | Finance is a separate concern. |
| A render pipeline integration | Execution infrastructure lives elsewhere. |
| A shot review workflow | Readiness comes from spec depth, not approval stages. |
| An RPG-style project store | Sequences are authored; a reel is an ordered list of sequence ids. |

## Frame types

| Type | Purpose |
|---|---|
| `sequence` | A container grouping multiple shots into an act or section. |
| `shot` | A single camera setup — the primary production unit. |
| `camera_move` | A frame defined by its camera movement (crane, dolly, steadicam). |
| `action` | On-screen physical action that must be choreographed or animated. |
| `dialogue` | Lines delivered by characters — VO, on-camera, or subtitle. |
| `transition` | A designed visual bridge between shots (dissolve, wipe, motivated cut). |
| `vfx` | A frame defined primarily by its visual effects requirements. |
| `audio` | A frame defined primarily by its audio design (music hit, ambient, foley). |
| `edit_beat` | A pacing marker — timing, rhythm, montage, or editorial structure. |

Every frame carries `intent`, `visualDescription`, camera language, `durationEstimate`, `continuityRequirements`, `requiredAssets`, VFX/audio, `editNotes`, `implementationChecklist`, `testCriteria`. Type-specific blocking fields enforce domain depth. Full lists stay in the inspector — [Card vs inspector](./architecture/#card-vs-inspector).

## Connection types

| Type | Meaning |
|---|---|
| `sequence` | Standard sequence — hard cut or default transition. |
| `match_cut` | Visual/audio element matches between shots. |
| `cutaway` | Interrupts main action to show a related detail. |
| `reaction` | Shows response to the previous shot. |
| `transition` | Motivated visual bridge (dissolve, wipe, designed). |
| `continuity` | These shots must maintain spatial/temporal continuity. |
| `parallel_action` | Simultaneous events — intercut or split screen. |
| `fallback` | Alternative path if the primary shot isn't achievable. |

Continuity **connections** feed the continuity-risk signal.

## Authoring loop (`/sequences`)

Boards are static SSG demos. There is no `localStorage`. The authored unit is the **sequence**. Grouping many sequences is a shipped **playlist / reel** — [Cinematic playlist](./cinematic-playlist/).

### 1. Open a sequence

`pnpm dev:cinematic`, then **`/sequences/demo-launch-trailer`** (“Storyboard OS Launch Trailer”). Also live: `/sequences/template-trailer-flow`, `/sequences/template-cutscene-sequence`, `/sequences/template-explainer-video`, and the reel `/reels/demo-launch-reel`.

### 2. Read production signals

The **Signals** panel (header toggle, or `P`) is the sequence-level answer:

| Signal | What it answers |
|---|---|
| **Health** (green / yellow / red) | Can this sequence ship, or is it blocked? |
| **Continuity risk** | Shots with continuity requirements or `continuity` connections |
| **VFX / audio burden** | How many requirements, across how many shots |
| **Camera complexity** | Moving-camera shots vs static setups |
| **Duration rollup** | Estimated runtime; shots lacking timing |
| **Blocked shots** | Missing type-required spec fields |
| **Pressure summary** | Natural-language production difficulty |

Health (`computeHealth` inside `getSequenceProductionSignals`):

- **Red:** any blocked shot (`getCinematicBeatStatus` level `blocked`).
- **Yellow:** empty sequence, missing/unparsable durations, high continuity risk, or heavy VFX burden.
- **Green:** at least one frame, no blocked shots, no yellow warnings. An empty sequence is **yellow**, not green.

### 3. Inspect a beat

Click a shot. The inspector holds the full spec the card must not:

- Readiness chip and missing type-required fields
- Intent, visual description, camera angle / movement / framing, duration
- Dialogue, action notes, continuity, required assets
- VFX, audio, edit notes, checklist, test criteria

On-card surface is type badge, title, one implementable line (intent when present), readiness (CAM / VFX / SFX / SPEC). Camera essays, VFX lists, and checklists stay off the Konva card.

### 4. Navigate

Pointer gestures and keyboard work on every vertical. The **board list** (top-left, ARIA listbox) is the accessible equivalent of the Konva stage — Arrow Up/Down through frames **and** connections, Enter/Space to activate. Full table: [Getting Started](./getting-started/#navigate-the-board).

### 5. Export a production brief

Open **`/sequences/demo-launch-trailer/handoff`** (or **Handoff →**). Download **Markdown** (editor / animator / producer document) or **JSON** (schema-validated shot list). JSON `formatVersion` is **3** (structured camera) — [Handoff JSON contract](./handoff-json/).

Engine-native files (Godot `.tres`, Unreal `.uasset`) are **compile adapters** after this JSON, never the authoring source.

## Beat status

`getCinematicBeatStatus(frame)` is the authority. The app renders it.

| Level | Criteria |
|---|---|
| `ready` | Spec score ≥ 3 **and** no type-blocking field missing |
| `partial` | Spec score 1–2 **and** no type blocker |
| `draft` | Spec score 0 **and** no type blocker |
| `blocked` | Any type-required field missing, **regardless of spec score** |

Type-blocking fields (`sequence` has none): `shot` → `visualDescription`; `camera_move` → `cameraMovement`; `action` → `actionNotes`; `dialogue` → `dialogue`; `transition` → `editNotes`; `vfx` → `vfxRequirements`; `audio` → `audioRequirements`; `edit_beat` → `durationEstimate`.

## Templates

| Template | Shots | Purpose |
|---|---|---|
| `trailer_flow` | 6 | Linear trailer: hook → problem → demos → meta → CTA |
| `cutscene_sequence` | 5 | In-game cutscene with dramatic arc |
| `explainer_video` | 5 | Educational flow: problem → solution → proof → CTA |

## Demo sequence

**Storyboard OS Launch Trailer** — 8 shots with camera, VFX, audio, continuity, assets, checklists, and tests.

Route: `/sequences/demo-launch-trailer`
