# Cinematic Storyboard — Product Overview

## What It Is

A cinematic production storyboard. Every frame on the board is a shot with concrete production requirements: camera language, VFX/audio requirements, continuity constraints, asset lists, and implementation checklists.

The board answers one question cold: **What makes this sequence hard to shoot, animate, edit, or hand off?**

The production signal model derives its answer from spec completeness and graph structure — not from manually assigned status fields, timelines, or external tracking.

---

## What It Is NOT

| This tool is not | Why the boundary exists |
|---|---|
| A production scheduling tool | Scheduling is downstream. This captures what needs doing, not when. |
| A crew planner / call sheet | People assignment is not frame semantics. |
| An asset management system | File hosting is infrastructure, not domain logic. |
| A budget / cost estimator | Finance is a separate concern. |
| A render pipeline integration | Execution infrastructure lives elsewhere. |
| A shot review workflow | Readiness comes from spec depth, not approval stages. |

If a reader could mistake this for any of those tools, the product has drifted.

---

## Frame Types

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

Every frame carries: `intent`, `visualDescription`, `cameraAngle`, `cameraMovement`, `framing`, `durationEstimate`, `continuityRequirements`, `requiredAssets`, `vfxRequirements`, `audioRequirements`, `editNotes`, `implementationChecklist`, `testCriteria`. Type-specific blocking fields enforce domain depth.

---

## Connection Types

| Type | Meaning |
|---|---|
| `sequence` | Standard sequence — hard cut or default transition. |
| `match_cut` | Visual/audio element matches between shots — graphic continuity. |
| `cutaway` | Interrupts main action to show a related detail. |
| `reaction` | Shows response to the previous shot. |
| `transition` | Motivated visual bridge (dissolve, wipe, designed). |
| `continuity` | These shots must maintain spatial/temporal continuity. |
| `parallel_action` | Simultaneous events — intercut or split screen. |
| `fallback` | Alternative path if the primary shot isn't achievable. |

Connections carry cinematic grammar. The production signal system uses `continuity` connections to compute continuity risk.

---

## Production Signals (Phase 0C)

The domain computes production pressure from the sequence graph:

| Signal | What it answers |
|---|---|
| **Health level** (green / yellow / red) | Can this sequence ship or is it blocked? |
| **Continuity risk** | Which shots have continuity requirements or linked continuity connections? |
| **VFX burden** | How many VFX requirements exist and across how many shots? |
| **Audio burden** | How many audio requirements exist and across how many shots? |
| **Camera complexity** | How many shots have camera movement vs static setups? |
| **Duration rollup** | What's the estimated total runtime and how many shots lack timing? |
| **Blocked shots** | Which shots are missing critical spec fields for their type? |
| **Pressure summary** | Natural language explanation of production difficulty. |

### Health derivation

- **Red:** Any blocked shots (missing type-critical fields despite partial spec).
- **Yellow:** Missing duration estimates, high continuity risk (>2 shots), or heavy VFX burden (>5 items).
- **Green:** No blockers and no yellow-level warnings.

---

## Beat Status Model

Per-frame readiness is computed from spec completeness:

| Level | Criteria |
|---|---|
| `ready` | ≥4 spec fields populated, no type-blocking fields missing |
| `partial` | 1–3 spec fields populated, no blockers |
| `draft` | Zero spec fields populated |
| `blocked` | Type-blocking field missing with some other spec present |

Type-blocking fields:
- `shot` → `visualDescription`
- `camera_move` → `cameraMovement`
- `action` → `actionNotes`
- `dialogue` → `dialogue`
- `transition` → `editNotes`
- `vfx` → `vfxRequirements`
- `audio` → `audioRequirements`
- `edit_beat` → `durationEstimate`

---

## Production Brief Handoff

`generateProductionBrief(storyboard)` produces a structured handoff document:

- Per-shot: title, type, intent, visual description, camera language, framing, duration, dialogue, action notes, continuity requirements, required assets, VFX, audio, edit notes, checklist, test criteria, status
- Sequence-level: total shots, total duration (range), readiness summary
- Export: Markdown and JSON

The handoff is designed for an editor, animator, or video producer to receive a sequence they didn't design and understand what to build.

---

## Templates

| Template | Shots | Purpose |
|---|---|---|
| `trailer_flow` | 6 | Linear trailer structure: hook → problem → demos → meta → CTA |
| `cutscene_sequence` | 5 | In-game cutscene with dramatic arc |
| `explainer_video` | 5 | Educational flow: problem → solution → proof → CTA |

Every template frame ships with production-depth spec — not blank starting points.

---

## Demo Sequence

**Storyboard OS Launch Trailer** — 8 shots with complete production spec: camera angles, movements, framing, VFX requirements, audio requirements, continuity constraints, required assets, implementation checklists, and test criteria. Dogfoods the cinematic domain by planning its own product trailer.

Route: `/sequences/demo-launch-trailer`

---

## What Cinematic Phase 0 Intentionally Excludes

These are not bugs or backlog items — they are deliberate scope boundaries:

1. **Production scheduling** — no timelines, milestones, or due dates. That's a different tool.
2. **Crew / cast management** — no people, roles, or call sheets. Frame semantics don't know about humans.
3. **Asset management** — `requiredAssets` is a spec list, not a file manager. Hosting lives elsewhere.
4. **Budget estimation** — no cost fields. Finance is orthogonal to shot readiness.
5. **Render pipeline** — no engine integration, no render farm dispatch. Execution is downstream.
6. **Review workflows** — no "pending review" or "director approved" states. Readiness = spec depth.
7. **Collaboration** — no multi-user, no comments, no real-time sync. Local-only, single-author.
8. **Durable projects** — cinematic Phase 0 uses template-based static boards. Editable projects may come in a future phase (as RPG Phase 2 did).

The cinematic vertical answers **"What is this sequence and what makes it hard?"** — not "Who is doing it, when is it due, and what does it cost?"
