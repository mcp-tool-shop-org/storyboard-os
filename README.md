# Storyboard OS

A visual story-structure authoring platform for interactive narrative — quests, branches, scenes, encounters, consequences, and the game-state logic that connects them.

**rpg-storyboard** is the first vertical: a game-authoring tool for RPG video game quest and scene design. It is not a demo or a prototype. It is the product this platform was built to run.

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

## Packages

| Package | What it owns |
|---|---|
| `@storyboard-os/core` | Generic storyboard primitives: frame, connection, annotation, template, structural validator. No domain vocabulary. |
| `@storyboard-os/rpg-domain` | RPG game-authoring contract: frame types, content fields, templates, RPG validation rules, Tollhouse Ledger demo quest. |
| `@storyboard-os/canvas` | Konva canvas renderer: frames, connections, selection, drag, type badges, connection labels. Domain config passed in. |
| `@storyboard-os/routing` | Configurable URL helpers: board and frame route generation. No dependencies. |

## Apps

| App | What it is |
|---|---|
| `rpg-storyboard` | Astro RPG game-authoring product. Owns: RPG canvas config, frame inspector, Astro pages, route setup, page layout. |

---

## Architecture

The packages form a clean dependency chain:

```
apps/rpg-storyboard
  → @storyboard-os/rpg-domain  (RPG game-authoring contract)
  → @storyboard-os/canvas      (Konva renderer, domain-configurable)
  → @storyboard-os/routing     (URL helpers)

@storyboard-os/rpg-domain
  → @storyboard-os/core        (generic primitives)

@storyboard-os/canvas
  → (no platform deps — pure Konva + React)

@storyboard-os/routing
  → (no deps — pure string helpers)

@storyboard-os/core
  → (no deps)
```

A second vertical (e.g. `apps/screenplay-storyboard`) would create its own domain package and reuse `@storyboard-os/core`, `@storyboard-os/canvas`, and `@storyboard-os/routing` without touching `@storyboard-os/rpg-domain`.

See [`docs/architecture.md`](docs/architecture.md) for full detail.

---

## Quick Start

```bash
pnpm install
pnpm dev        # starts rpg-storyboard at localhost:4321
pnpm test       # runs all package + app tests
pnpm build      # builds rpg-storyboard
```

Requirements: Node ≥ 20, pnpm ≥ 9.

---

## Status

```
Phase 0 + 0R + 0M: Complete
138/138 tests passing
10/10 pages built
```

| Phase | Description | Status |
|---|---|---|
| 0A–0F | RPG authoring proof — canvas, beat pages, templates, demo quest | ✅ |
| 0R | Repair + re-anchor — every frame carries game-state spec | ✅ |
| 0M | Monorepo migration — core, domain, canvas, routing extracted | ✅ |
| 1A | Branch + state visibility on the canvas | Queued |

---

## Demo

**The Tollhouse Ledger** — three factions want the same hidden ledger. The player decides who wins, who loses, and what the region looks like next. Eight beats with complete game-state spec: flag names, asset requirements, pass/fail test criteria, implementation checklists.

Every frame in the demo is implementable as a quest in an RPG engine without supplementary documentation.

---

## Docs

- [`docs/architecture.md`](docs/architecture.md) — package separation, dependency rules, extensibility
- [`docs/product-brief.md`](docs/product-brief.md) — what rpg-storyboard is, target user, drift warnings, acceptance gates
- [`docs/rpg-storyboard.md`](docs/rpg-storyboard.md) — RPG game-authoring contract: frame vocabulary, templates, state model
- [`docs/phase-0-closeout.md`](docs/phase-0-closeout.md) — Phase 0 dogfood verdict and Phase 1 backlog
- [`docs/monorepo-migration.md`](docs/monorepo-migration.md) — 0M migration log: what moved, why, and the resulting architecture
