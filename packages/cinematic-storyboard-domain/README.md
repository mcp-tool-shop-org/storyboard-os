<p align="center">
  <img src="https://raw.githubusercontent.com/mcp-tool-shop-org/brand/main/logos/storyboard-os/readme.png" alt="Storyboard OS" width="400" />
</p>

<p align="center">
  <a href="https://github.com/mcp-tool-shop-org/storyboard-os/actions/workflows/ci.yml"><img src="https://github.com/mcp-tool-shop-org/storyboard-os/actions/workflows/ci.yml/badge.svg" alt="CI" /></a>
  <a href="https://www.npmjs.com/package/@storyboard-os/cinematic-domain"><img src="https://img.shields.io/npm/v/@storyboard-os/cinematic-domain.svg" alt="npm" /></a>
  <a href="./LICENSE"><img src="https://img.shields.io/badge/license-MIT-blue.svg" alt="MIT License" /></a>
</p>

<p align="center"><strong>Cinematic production contract for the Storyboard OS platform.</strong></p>

---

# @storyboard-os/cinematic-domain

The cinematic production domain package. Everything a director, previs artist, or cinematic designer needs to storyboard a **producible** sequence — frame types, camera/VFX/audio/continuity schema, templates, validation rules, canvas signals, production-signal analysis, and a production-brief handoff.

**Target user:** Someone boarding a trailer, cutscene, or explainer who needs each shot to carry enough spec — camera language, VFX/audio requirements, continuity, duration — to hand off to a production pass.

**Not for:** Video editors, NLE timelines, asset-management tools, or shot-tracking spreadsheets. This models the *production logic* of a sequence — what each shot demands and where the burden and risk concentrate — not the edit itself.

This package depends only on [`@storyboard-os/core`](https://www.npmjs.com/package/@storyboard-os/core) and imports from no other vertical.

---

## Install

```bash
pnpm add @storyboard-os/cinematic-domain
# or
npm i @storyboard-os/cinematic-domain
```

Requires Node ≥ 20. Ships ESM + CJS + type declarations.

## Frame types

Nine `CinematicFrameType` values model a sequence:

| Type | What it captures |
|---|---|
| `sequence` | A sequence header grouping shots |
| `shot` | A single shot with camera, subject, and spec |
| `camera_move` | A camera-language beat (dolly, pan, crane, …) |
| `action` | On-screen action / blocking |
| `dialogue` | A spoken line and its delivery |
| `transition` | A cut, dissolve, or transition between shots |
| `vfx` | A visual-effects requirement |
| `audio` | An audio / SFX / score requirement |
| `edit_beat` | An editorial beat — pacing or continuity note |

## What it provides

```ts
import {
  CINEMATIC_TEMPLATES, getCinematicTemplate, createCinematicStoryboard,
  validateCinematicStoryboard,
  getCinematicFrameBadges, getCinematicFrameSignal, cinematicColors,
  getCinematicBeatStatus, getSequenceReadiness,
  getSequenceProductionSignals,
  generateProductionBrief, generateProductionMarkdown, HANDOFF_FORMAT_VERSION,
  storyboardOsLaunchTrailer,
} from '@storyboard-os/cinematic-domain';
```

- **Templates** — `CINEMATIC_TEMPLATES`, `getCinematicTemplate(id)`, `createCinematicStoryboard(...)`: production starting points with typed shot sequences. `getCinematicTemplate` returns `undefined` for an unknown id (it does not throw).
- **Validation** — `validateCinematicStoryboard(board)` returns a structured `StoryboardValidationResult` (`{ valid, errors }`) and never throws on malformed input. Cinematic-specific error codes extend the core open union.
- **Frame signals** — `getCinematicFrameSignal(frame)` / `getCinematicFrameBadges(frame)` derive per-shot state and canvas badges; `cinematicColors` is the canonical badge palette (shared status swatches from core + `vfx`, `camera`, `sfx`).
- **Readiness model** — `getCinematicBeatStatus(frame)` classifies a shot's readiness; `getSequenceReadiness(board)` rolls the shots up into a sequence readiness summary.
- **Production signals** — `getSequenceProductionSignals(board)` surfaces sequence **health**, **VFX** and **audio** burden, **camera-complexity** hotspots, **continuity risk**, **blocked shots**, and a **duration rollup** — the "where is the pain" view for a producer.
- **Handoff** — `generateProductionBrief(board)` and `generateProductionMarkdown(board)` emit a production brief carrying `HANDOFF_FORMAT_VERSION` for downstream consumers. User text is neutralized before interpolation.
- **Demo** — `storyboardOsLaunchTrailer` is a complete example sequence for tests and previews.

## Trust model

Pure data + functions — no I/O, no network, no persistence. All state (frames, connections) is passed in and returned. The validator is the runtime seawall: it returns structured errors rather than throwing on malformed input.

---

Part of **[Storyboard OS](https://github.com/mcp-tool-shop-org/storyboard-os)** — a visual story-structure platform with three verticals (`rpg-domain`, `marketing-domain`, `cinematic-domain`) over a shared `core`, `canvas`, and `routing`. See the [handbook](https://mcp-tool-shop-org.github.io/storyboard-os/) for the full architecture.
