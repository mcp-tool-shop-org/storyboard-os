<p align="center">
  <a href="README.ja.md">日本語</a> | <a href="README.zh.md">中文</a> | <a href="README.es.md">Español</a> | <a href="README.fr.md">Français</a> | <a href="README.hi.md">हिन्दी</a> | <a href="README.it.md">Italiano</a> | <a href="README.pt-BR.md">Português (BR)</a>
</p>

<p align="center">
  <img src="https://raw.githubusercontent.com/mcp-tool-shop-org/brand/main/logos/storyboard-os/readme.png" alt="Storyboard OS — Visual Stories. Structured. Implemented." width="550" />
</p>

<p align="center">
  <a href="https://github.com/mcp-tool-shop-org/storyboard-os/actions/workflows/ci.yml"><img src="https://github.com/mcp-tool-shop-org/storyboard-os/actions/workflows/ci.yml/badge.svg" alt="CI" /></a>
  <a href="LICENSE"><img src="https://img.shields.io/badge/license-MIT-blue.svg" alt="MIT License" /></a>
</p>


---

A visual story-structure authoring platform for interactive narrative — quests, campaigns, cinematics, and the production logic that connects them.

**Three verticals, one platform:**

| Vertical | Domain |
|---|---|
| `rpg-storyboard` | RPG quest / game narrative — implementation-ready authoring |
| `marketing-storyboard` | Campaign launch — launch readiness + critical path |
| `cinematic-storyboard` | Trailer / cutscene / explainer — production storyboarding |

All three are products, not demos. None imports from the others.

---

## What Storyboard OS Is

A structured board for designing **implementable narrative**. Every frame on the canvas is a beat with:
- Entry and exit conditions
- State changes (flags, variables, world-state)
- Required assets for the production pass
- Test criteria with pass/fail checks
- Implementation checklist

The board visualizes game-state flow, not just story sequence. Connections carry meaning — choice branches, consequence arcs, sequence spines, fallback paths. A designer can read the board and understand what the game actually does.

## What Storyboard OS Is Not

- A generic diagramming or whiteboard tool
- A session runner or GM aid
- A worldbuilding wiki or lore database
- A dialogue-tree-only editor
- A campaign prep app

If a reader could mistake this for any of those, the product has drifted.

---

## What rpg-storyboard Does (Phase 2)

After Phase 2, a designer can author a complete project from start to handoff without leaving the browser:

| Capability | What they get |
|---|---|
| **Project creation** | Create a named project from a template; board positions and edits persist in localStorage |
| **Visual board** | Quest flow and game-state branch logic side by side on a Konva canvas |
| **Beat editing** | Edit any beat's title, summary, and all implementation-spec fields directly on the board |
| **Progress tracking** | Check off implementation checklist items and test criteria per beat; state survives reload |
| **Game-state signal** | Per-frame badges (STATE, SPEC/PARTIAL/DRAFT) without leaving the board |
| **Implementation readiness** | Each beat shows READY/PARTIAL/DRAFT/BLOCKED status + what's missing |
| **Project handoff** | Regenerated from live project state — includes edited content, per-beat progress, provenance |
| **Quest handoff** | Static Markdown + JSON export for template preview boards |
| **Templates** | Three RPG production starting points with beat-type sequences and rationale |
| **Board operations** | Zoom, pan, fit-to-board, reset, keyboard shortcuts — laptop-usable navigation |

The board is an authoring surface. The beat inspector is an editable implementation spec. The handoff is a document generated from real project state — not a static snapshot.

### Phase 1 capabilities (still present)

Phase 1 established the read-only preview vertical: canvas rendering, game-state signal, implementation readiness model, quest handoff export, template gallery, and board navigation. All Phase 1 capabilities are preserved and extended by Phase 2.

---

## Packages

| Package | What it owns |
|---|---|
| `@storyboard-os/core` | Generic storyboard primitives: frame, connection (generic over type), annotation, template, structural validator. Domains own their connection vocabularies. |
| `@storyboard-os/rpg-domain` | RPG game-authoring contract: frame types, content fields, templates, readiness model, handoff generator, Tollhouse Ledger demo quest. |
| `@storyboard-os/marketing-domain` | Marketing campaign-implementation contract: frame types (audience, message, touchpoint, asset, approval, launch_event, measurement), launch readiness model, critical path, approval gates, measurement loops, campaign brief export, demo campaign. |
| `@storyboard-os/cinematic-domain` | Cinematic production contract: 9 frame types, camera language, VFX/audio/continuity requirements, production signals (health, burden, complexity, blocked shots), production brief handoff, 3 templates, demo trailer sequence. |
| `@storyboard-os/canvas` | Konva canvas renderer: frames, connections, selection, drag, type badges, connection labels, zoom/pan viewport. Domain config passed in. |
| `@storyboard-os/routing` | Configurable URL helpers: board and frame route generation. No dependencies. |

## Apps

| App | What it is |
|---|---|
| `rpg-storyboard` | Astro RPG game-authoring product. Owns: RPG canvas config, frame inspector, handoff pages, template gallery, route setup, page layout. |
| `marketing-storyboard` | Astro campaign-implementation storyboard. Owns: marketing canvas config, campaign board, frame inspector, launch readiness badge, critical path emphasis, launch blockers panel, campaign brief handoff. |
| `cinematic-storyboard` | Astro cinematic production storyboard. Owns: cinematic canvas config, sequence board, frame inspector (camera/VFX/audio/continuity), production signal panel (health/burden/complexity), production brief handoff. |

---

## Architecture

The packages form a clean dependency chain:

```
apps/rpg-storyboard
  → @storyboard-os/rpg-domain       (RPG game-authoring contract)
  → @storyboard-os/canvas           (Konva renderer, domain-configurable)
  → @storyboard-os/routing          (URL helpers)

apps/marketing-storyboard
  → @storyboard-os/marketing-domain  (marketing campaign-implementation contract)
  → @storyboard-os/canvas            (same canvas, different config)
  → @storyboard-os/routing           (URL helpers)

apps/cinematic-storyboard
  → @storyboard-os/cinematic-domain  (cinematic production contract)
  → @storyboard-os/canvas            (same canvas, different config)
  → @storyboard-os/routing           (URL helpers)

@storyboard-os/rpg-domain
  → @storyboard-os/core              (generic primitives)

@storyboard-os/marketing-domain
  → @storyboard-os/core              (generic primitives)

@storyboard-os/cinematic-domain
  → @storyboard-os/core              (generic primitives)

@storyboard-os/canvas
  → (no platform deps — pure Konva + React)

@storyboard-os/routing
  → (no deps — pure string helpers)

@storyboard-os/core
  → (no deps)
```

A fourth vertical would create its own domain package and reuse `@storyboard-os/core`, `@storyboard-os/canvas`, and `@storyboard-os/routing` without touching any existing domain package. Three verticals have now proven this pattern: zero changes to canvas, core, or routing.

See [`docs/architecture.md`](docs/architecture.md) for full detail.

---

## Quick Start

<!-- AUTOGEN-NOTE: Snapshot values (649 tests, 54 pages) below are manually updated.
     Verify with: pnpm test (test count), pnpm -r build (page count).
     See docs/snapshot-checklist.md for every location that holds these snapshots. -->

```bash
pnpm install
pnpm dev        # starts rpg-storyboard at localhost:4321
pnpm test       # runs all package + app tests (649 tests)
pnpm build      # builds all 3 apps (54 pages)
pnpm verify     # test + build in one command (ship gate)
```

Requirements: Node ≥ 20, pnpm ≥ 9.

Test scope is automatically filtered to `@storyboard-os/*` packages and `rpg-storyboard` — it does not pick up sibling workspaces in the parent directory.

---

## Trust Model

Storyboard OS is a **local-only browser application** — no server, no accounts, no network egress.

- **Data touched:** Project data (beat specs, board positions, checklist progress) in browser `localStorage` on the user's machine only.
- **Data NOT touched:** No credentials, no payment info, no personal data beyond what the designer types into beat spec fields.
- **No network requests at runtime.** The app is a static site. After the initial page load, zero network calls are made.
- **No telemetry.** Nothing is collected or transmitted.

See [`SECURITY.md`](SECURITY.md) for the full trust model and vulnerability reporting.

---

## Status

<!-- AUTOGEN-NOTE: Snapshot values below (649 tests, 54 pages, 6 packages, 3 apps) are
     manually updated. Verify with:
       pnpm test                       # tests passing
       pnpm -r build                   # pages built (count from Astro output)
       ls packages/ | wc -l            # package count
       ls apps/ | wc -l                # app count
     See docs/snapshot-checklist.md for every doc location that holds these. -->

```
Phase 2 complete + Marketing Phase 0 complete + Cinematic Phase 0 complete + Core Hardening 1A
649/649 tests passing
54/54 pages built
6 packages · 3 apps
```

| Phase | Description | Status |
|---|---|---|
| 0A–0F | RPG authoring proof — canvas, beat pages, templates, demo quest | ✅ |
| 0R | Repair + re-anchor — every frame carries game-state spec | ✅ |
| 0M | Monorepo migration — core, domain, canvas, routing extracted | ✅ |
| 1A | Branch + state visibility on the canvas | ✅ |
| 1B | Implementation readiness per beat | ✅ |
| 1C | Quest handoff export | ✅ |
| 1D | Template gallery | ✅ |
| 1E | Board operations — zoom, pan, fit, viewport controls | ✅ |
| 1F | Release closeout — docs, changelog, architecture notes | ✅ |
| 2A | Project creation from templates — localStorage persistence | ✅ |
| 2B | Persistent board positions per project | ✅ |
| 2C | Editable beat content — spec fields persist across reload | ✅ |
| 2D | Checklist / progress persistence — separate from spec text | ✅ |
| 2E | Project handoff — regenerated from saved project state | ✅ |
| 2F | Release closeout — docs, changelog, architecture notes | ✅ |
| M-0A | Marketing domain package — schema, signals, templates, validation, demo campaign | ✅ |
| M-0B | Marketing app vertical — Astro campaign board, frame inspector, handoff | ✅ |
| M-0C | Launch readiness signal layer — critical path, approval gates, measurement loops | ✅ |
| M-0D | Marketing closeout — docs, changelog, architecture proof | ✅ |
| C-0A | Cinematic domain package — schema, camera language, VFX/audio, templates, validation, demo | ✅ |
| C-0B | Cinematic app vertical — Astro sequence board, frame inspector, production brief | ✅ |
| C-0C | Production signal layer — health, VFX/audio burden, camera complexity, blocked shots | ✅ |
| C-0D | Cinematic closeout — docs, changelog, architecture proof | ✅ |
| H-1A | Core Hardening — generic connection types, domains own their vocabulary | ✅ |

---

## Demo

**The Tollhouse Ledger** — three factions want the same hidden ledger. The player decides who wins, who loses, and what the region looks like next. Eight beats with complete game-state spec: flag names, asset requirements, pass/fail test criteria, implementation checklists.

Every frame in the demo is implementable as a quest in an RPG engine without supplementary documentation.

Route: `/storyboards/quest-01`

---

## Docs

- [`docs/architecture.md`](docs/architecture.md) — package separation, dependency rules, canvas viewport model, project storage boundary, extensibility
- [`docs/product-brief.md`](docs/product-brief.md) — what rpg-storyboard is, target user, drift warnings, acceptance gates
- [`docs/rpg-storyboard.md`](docs/rpg-storyboard.md) — RPG game-authoring contract, full authoring loop (Phase 2), readiness model, handoff export
- [`docs/marketing-storyboard.md`](docs/marketing-storyboard.md) — Marketing campaign-implementation contract, launch readiness model, critical path, exclusions
- [`docs/cinematic-storyboard.md`](docs/cinematic-storyboard.md) — Cinematic production storyboard, production signals, camera language, deliberate exclusions
- [`docs/cinematic-phase-0-closeout.md`](docs/cinematic-phase-0-closeout.md) — Cinematic Phase 0 spine narrative, acceptance gates, proof
- [`docs/marketing-phase-0-closeout.md`](docs/marketing-phase-0-closeout.md) — Marketing Phase 0 spine narrative, acceptance gates, proof
- [`docs/phase-2-closeout.md`](docs/phase-2-closeout.md) — Phase 2 spine narrative, architecture integrity record, deliberate exclusions
- [`docs/phase-1-closeout.md`](docs/phase-1-closeout.md) — Phase 1 spine narrative and architecture integrity record
- [`docs/phase-0-closeout.md`](docs/phase-0-closeout.md) — Phase 0 dogfood verdict and original Phase 1 backlog
- [`docs/monorepo-migration.md`](docs/monorepo-migration.md) — 0M migration log: what moved, why, and the resulting architecture
- [`CHANGELOG.md`](CHANGELOG.md) — release history
