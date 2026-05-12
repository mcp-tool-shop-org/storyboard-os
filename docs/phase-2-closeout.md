# Phase 2 Closeout — Durable Local Authoring

_Completed 2026-05-04_

> **_Snapshot values in this doc (test count, page count, package count, app count) reflect the state at Phase 2 closeout. They are a historical record; current totals live in the root README.md._**

---

## What Phase 2 Is

Phase 2 turns rpg-storyboard from a read-only preview vertical into a durable local authoring workflow.

After Phase 2, a designer can create a project from a template, rearrange the board, edit beat specs, track implementation and test progress, and regenerate a handoff from saved project state — all in a single browser session, with no backend, no accounts, and no server.

The handoff is no longer a static export from the demo/template layer. It is the bridge from a living authoring project to an implementation pass.

---

## Phase 2 Spine

| Sub-phase | Commit | Description |
|---|---|---|
| 2A | `d906417` | Project creation from templates — localStorage persistence |
| 2B | `689563e` | Persistent board positions per project |
| 2C | `71bb708` | Editable beat content — spec fields persist across reload |
| 2D | `7fdf39a` | Checklist / progress persistence — separate from spec text |
| 2E | `aff6add` | Project handoff — regenerated from saved project state |
| 2F | _(this commit)_ | Release closeout — docs, changelog, architecture notes |

---

## Acceptance Gates

| Gate | Status |
|---|---|
| A created project saves board positions across page reload | ✅ |
| A created project beat can be edited, refreshed, reopened, and still contain the updated implementation spec | ✅ |
| A created project remembers checklist and test-criteria completion across refresh, without modifying the underlying spec text | ✅ |
| The project handoff shows edited content and progress completion without mutating spec strings | ✅ |
| Template preview boards (`/storyboards/*`) remain read-only and unaffected by Phase 2 changes | ✅ |
| 368/368 tests passing · 42/42 pages built | ✅ |

---

## Architecture Integrity

### What stayed clean

**Progress / spec separation.** The biggest Phase 2 design decision was keeping `implementationChecklist` and `testCriteria` as spec text — strings that are never modified by progress tracking. Completion state lives in `project.progress.frames[frameId]` as `Record<string, boolean>` keyed by string index. The spec and the completion record are in different locations in the data model and can only be written by different functions.

This matters because: if the spec were mutated to fake progress (e.g., prepending `[x]` to checklist strings), the handoff would lose the ability to regenerate cleanly and the spec would become corrupted after round-trips. The invariant was enforced in the test suite from the first commit.

**Immutable domain functions.** Every `update*` and `set*` function in `@storyboard-os/rpg-domain` is pure and returns a new project object. No mutation. `updatedAt` bumps on every change. The app layer calls these and then persists the result — domain and storage are never entangled.

**Handoff layering without duplication.** `generateProjectHandoff` reuses all the beat-ordering and spec-extraction logic from `generateHandoff` (topological sort, Kahn's algorithm, branch extraction) by calling it and then mapping over the result to add project metadata and progress. Zero code duplication.

**Storage boundary.** `projectStorage.ts` is the only file that reads from or writes to `localStorage`. All components receive data as props. `ProjectBoard` is the only component that calls `saveProject`, and it does so through the single `persistAndNotify` helper.

**Template boards unchanged.** `/storyboards/*` pages are SSG — they render at build time, have no `?id=` parameter, and no connection to `localStorage`. `StoryboardCanvas` replaced `showHandoff: boolean` with `handoffHref: string`; template boards default to `/storyboards/${id}/handoff`, which continues to work as before.

### Domain neutrality preserved

The domain neutrality checks from Phase 1 still hold:

- `@storyboard-os/canvas` has no knowledge of RPG vocabulary, projects, or progress.
- `@storyboard-os/core` has no knowledge of anything in Phase 2.
- `@storyboard-os/routing` is unchanged.

The canvas package's `StoryboardCanvas` (the Konva renderer in `packages/storyboard-canvas`) received no Phase 2 changes. The `StoryboardCanvas.tsx` adapter in `apps/rpg-storyboard/src/components/` received all the Phase 2 wiring — the distinction between the platform canvas and the app adapter held throughout.

---

## What Was Deliberately Excluded

Phase 2 is a **local-only** authoring workflow. The following were considered and excluded from scope:

| Excluded | Reason |
|---|---|
| Backend / server persistence | No backend exists. localStorage is the correct scope for a local tool. |
| User accounts | Would require a backend. Not in scope. |
| Collaboration / sharing | Multi-user authoring requires a backend. Not in scope. |
| Import / export of project JSON | Useful but not needed for core authoring workflow. Left for Phase 3. |
| Rich text in beat fields | Plain text is sufficient for implementation specs. Avoids serialization complexity. |
| Undo / redo | Would require command history. Not in scope for Phase 2. |
| Project deletion UI | Delete is a destructive action that needs careful UX treatment. Left for Phase 3. |
| Mobile / touch support | Konva canvas interaction is pointer-device oriented. Not addressed. |

These exclusions are intentional, not oversights. The goal of Phase 2 was to close the authoring loop, not to ship a complete product.

---

## Test Coverage

| Package | Tests |
|---|---|
| `@storyboard-os/canvas` | 27 (viewport math) |
| `@storyboard-os/rpg-domain` | 272 (schema, templates, signals, readiness, handoff, project) |
| `apps/rpg-storyboard` | 69 (template guardrails) |
| **Total** | **368** |

Tests added in Phase 2:
- `project.test.ts`: 55 tests total. Phase 2C added 14 (updateFrameBasics, updateFrameContent). Phase 2D added 14 more (createProject progress init, setChecklistItemComplete, setTestCriterionComplete, getFrameProgress, getProjectProgress).
- `handoff.test.ts`: 57 tests total. Phase 2E added 18 (generateProjectHandoff metadata, edited content, progress, generateProjectMarkdown).

---

## No Tabletop Language

The tabletop-drift guardrails from Phase 0R remain active and are not relaxed by Phase 2.

Checked terms: `gm notes`, `prep session`, `at the table`, `tabletop`, `campaign prep`, `run a session`.

These are tested in `templates.test.ts` and would fail CI if introduced.

---

## Phase 3 Considerations

Phase 2 does not define Phase 3. Based on Phase 2 dogfood and known gaps:

- **Project import / export** — share a project JSON file between machines without a backend.
- **Project deletion UI** — with confirmation; currently deletion requires clearing localStorage manually.
- **Undo history** — design-time safety net for accidental spec overwrites.
- **Beat reorder on board** — drag-to-reorder in the inspector or board header for linear templates.
- **State graph visualization** — connection arrows that carry flag names from `stateChanges`.

None of these are Phase 3 commitments. They are known open threads.
