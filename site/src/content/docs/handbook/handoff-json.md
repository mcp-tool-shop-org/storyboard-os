---
title: Handoff JSON contract
description: Portable Markdown + schema-validated JSON. formatVersion discriminators, C4 fields, engine-native adapters.
sidebar:
  order: 8
---

Feature Pass C4 locks **Markdown + schema-validated JSON** as the portable handoff. Godot `.tres`, Unreal `.uasset`, and world-forge packs are **compile adapters** — never the authoring source of truth.

This page is the on-disk contract. TypeScript call signatures live on [Reference](./reference/). Published schemas are copies of the Wave 1 domain files (not a second schema).

## Published schemas

| Artifact | `formatVersion` | Schema file | `$id` |
|---|---|---|---|
| RPG `QuestHandoff` | `1` (const) | [`docs/schemas/quest-handoff.json`](https://github.com/mcp-tool-shop-org/storyboard-os/blob/main/docs/schemas/quest-handoff.json) | `https://storyboard-os.dev/schemas/rpg/quest-handoff.json` |
| RPG `ProjectHandoff` | `1` (const) | [`docs/schemas/project-handoff.json`](https://github.com/mcp-tool-shop-org/storyboard-os/blob/main/docs/schemas/project-handoff.json) | `https://storyboard-os.dev/schemas/rpg/project-handoff.json` |
| Marketing `CampaignHandoff` | `1` (const) | [`docs/schemas/campaign-handoff.schema.json`](https://github.com/mcp-tool-shop-org/storyboard-os/blob/main/docs/schemas/campaign-handoff.schema.json) | package schema URI under `packages/marketing-storyboard-domain/schema/` |
| Cinematic `ProductionBrief` | `2` (const in the published file) | [`docs/schemas/production-brief.json`](https://github.com/mcp-tool-shop-org/storyboard-os/blob/main/docs/schemas/production-brief.json) | `https://github.com/mcp-tool-shop-org/storyboard-os/schemas/cinematic/production-brief.json` |

Pages also serves the same bytes from `/storyboard-os/schemas/` (copied into `site/public/schemas/`). Domain packages remain the authoring originals; if they disagree, the package file wins and this copy must be refreshed.

## `formatVersion` discriminators

`formatVersion` is the **handoff artifact** discriminator. It is independent of board `schemaVersion` / `BOARD_SCHEMA_VERSION` (those version the authored board or playlist, not the export).

| Value | Artifact | Importer rule |
|---|---|---|
| `1` | RPG quest + project handoff; marketing campaign handoff | Reject any other integer. RPG/marketing schemas pin `const: 1`. |
| `2` | Cinematic `ProductionBrief` as published | Connections array + optional `missingReasons` on shots. `camera` is `string \| null` (angle + movement joined). Reject v1 cinematic payloads. |
| `3` (this Feature Pass, cinematic domain) | Structured camera on `ProductionBriefShot` | **May land this wave.** `camera` becomes an object (shot size, optional lens/FOV, move) instead of a concatenated string. Do not block consumers on cinematic landing — **switch on `formatVersion`**. Treat unknown versions as reject, not coerce. |

Always read `formatVersion` (and `$schema` when present) before walking beats. Do not infer the vertical from filename alone.

## C4 field set

Every portable beat/shot carries implementation depth. C4 names the shared spine; verticals add extras. Arrays are present even when empty.

| C4 field | RPG quest/project beat | Marketing campaign beat | Cinematic shot |
|---|---|---|---|
| `entryConditions` | required string[] | — (use `customerStateBefore`) | — (use `continuity`) |
| `stateChanges` | required string[] | — (use `customerStateAfter`) | — |
| `requiredAssets` | required string[] | required string[] | required string[] (`requiredAssets`) |
| `testCriteria` | required string[] | required string[] | required string[] |
| `implementationChecklist` | required string[] | required string[] | required string[] (`checklist` on the brief) |

Per-vertical extras (not optional for a complete beat, but not the C4 spine):

- **RPG:** `exitConditions`, characters/factions, outcomes, annotations, branches; project handoff adds `checklistProgress` / `testProgress`.
- **Marketing:** `proofPoints`, `approvalRequirements`, `launchDependencies`, `metrics`, plus campaign-level `launch` (critical path, gates, open loops).
- **Cinematic:** `camera`, `framing`, `duration`, `dialogue`, `actionNotes`, `continuity`, `vfx`, `audio`, `editNotes`, sequence-level `connections` + `readySummary`.

## Markdown vs JSON

| | Markdown | JSON |
|---|---|---|
| Audience | Developers, producers, tickets, wikis | Engines, importers, schema validators |
| Guarantee | Readable document; humanized labels (`SPEC`, shot types) | Machine-checkable shape; raw enums; `formatVersion` |
| Authority | Twin of the JSON, not a second source | **The** portable contract. Validate against the published schema. |
| What it is not | Not a schema. Not `.tres`. | Not the Konva graph. Not an engine resource. |

RPG project Markdown overlays `[x]` / `[ ]` from live `localStorage` progress. Marketing and cinematic Markdown is SSG from the authored board — no progress overlay.

## Engine-native is an adapter

Godot `.tres`, Unreal Sequencer / `.uasset`, world-forge packs, HubSpot, ICS — **compile after** the JSON schema gate. They are never:

- the file the designer authors
- the file the handoff page downloads as the source of truth
- a reason to skip `formatVersion`

A Godot exporter, if one ships later, reads validated JSON (or the domain object that stamped it) and emits `.tres`. It must not become the canonical store. This handbook does not ship an exporter.

## Generators

| Vertical | JSON | Markdown |
|---|---|---|
| RPG template board | `generateHandoff(storyboard)` | `generateMarkdown(handoff)` |
| RPG project | `generateProjectHandoff(project)` | `generateProjectMarkdown(handoff)` |
| Marketing | `generateCampaignHandoff(board)` | `generateCampaignMarkdown(handoff)` |
| Cinematic | `generateProductionBrief(storyboard)` | `generateProductionMarkdown(brief)` |

First-run download URLs: [Getting Started](./getting-started/). Authoring loops: [RPG](./usage/), [Marketing](./marketing-storyboard/), [Cinematic](./cinematic-storyboard/).
