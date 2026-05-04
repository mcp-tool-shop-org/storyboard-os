# Marketing Storyboard — Product Overview

## What It Is

A campaign implementation storyboard. Every frame on the board is a campaign beat with concrete implementation requirements: objectives, audience segments, customer state transitions, required assets, test criteria, and implementation checklists.

The board answers one question cold: **Can this campaign ship, and what blocks it?**

The launch readiness model derives its answer from spec completeness and graph structure — not from human-assigned status fields, dates, or ownership.

---

## What It Is NOT

| This tool is not | Why the boundary exists |
|---|---|
| A marketing planner | Planning is upstream. This picks up after the plan exists. |
| A content calendar | Calendar is a view, not a domain concept. |
| A project management tool | No owners, no due dates, no workflow stages. |
| A CRM or automation layer | No contacts, no triggers, no integrations. |
| A brand guidelines repository | Brand lives elsewhere. This is execution. |

If a reader could mistake this for any of those tools, the product has drifted.

---

## Frame Types

| Type | Purpose |
|---|---|
| `audience` | Who the campaign targets. Segments, customer state before/after. |
| `message` | What the campaign says. Core claim, differentiation. |
| `touchpoint` | Where the message appears. Channel, format, placement. |
| `asset` | What needs to be produced. Creative requirements, specs. |
| `approval` | What must be signed off. Approval requirements that gate launch. |
| `launch_event` | The ship moment. Required assets, go/no-go signal. |
| `conversion` | What happens after. Conversion criteria, fallback paths. |
| `follow_up` | Post-launch continuation. Re-engagement, nurture. |
| `measurement` | How success is measured. Metrics, feedback loops. |

Every frame carries: `objective`, `audienceSegment`, `customerStateBefore`, `customerStateAfter`, `testCriteria`, `implementationChecklist`. Type-specific fields add domain depth.

---

## Connection Types

| Type | Meaning |
|---|---|
| `sequence` | This beat follows the previous one in campaign flow. |
| `dependency` | This beat cannot start until the upstream beat is resolved. |
| `approval` | This beat requires formal approval before downstream work begins. |
| `optional` | This path is optional — the campaign can proceed without it. |

Connections carry structural meaning. The critical path algorithm traverses them to find the longest path to `launch_event`.

---

## Launch Readiness Model

The domain computes launch readiness from the campaign graph:

### `getCampaignLaunchReadiness(campaign)`

Returns a `LaunchReadinessSummary`:
- **level**: `ready | at_risk | blocked | draft`
- **criticalPathFrameIds**: frames on the longest path to launch
- **blockedFrameIds**: frames missing type-specific requirements
- **approvalGateFrameIds**: approval frames that gate launch
- **missingMeasurementFrameIds**: measurement frames without metrics
- **summary**: human-readable sentence

### `getCampaignCriticalPath(campaign)`

Returns an ordered array of frame IDs representing the longest path from root through `launch_event` to terminal nodes. Uses topological sort (Kahn's algorithm) for longest-path computation.

### `getApprovalGateSignals(campaign)`

Returns per-approval-frame signals:
- Whether the approval blocks launch (reachable to `launch_event`)
- Whether approval requirements are defined
- Status: `ready | pending | blocked`

### `getMeasurementLoopSignals(campaign)`

Returns per-measurement-frame signals:
- Whether metrics are defined
- Whether there's an incoming connection (something feeds it data)
- Whether there's an outgoing connection (feedback loop back to campaign)
- Whether it forms a closed loop

---

## App Surface

The `apps/marketing-storyboard` Astro app renders:

| Surface | What the user sees |
|---|---|
| Campaign board | Full Konva canvas with marketing frame types, connection types, domain badges |
| Header badge | Launch readiness level: READY / AT RISK / BLOCKED / DRAFT |
| Critical path emphasis | "CRITICAL" badge on frames in the critical path |
| Launch blockers panel | Right rail showing: blocked approvals, pending approvals, missing metrics, open measurement loops |
| Frame inspector | All marketing content fields for the selected frame |
| Campaign brief | Markdown + JSON handoff for the execution team |

---

## Architecture

```
apps/marketing-storyboard
  → @storyboard-os/marketing-domain  (campaign-implementation contract)
  → @storyboard-os/canvas            (Konva renderer — same component, different config)
  → @storyboard-os/routing           (URL helpers)

@storyboard-os/marketing-domain
  → @storyboard-os/core              (generic primitives only)
```

Zero imports from `@storyboard-os/rpg-domain`. Zero modifications to `@storyboard-os/canvas`. The canvas renders marketing frames using the same domain-configurable pattern it uses for RPG frames — different `StoryboardCanvasConfig`, same renderer.

---

## Demo Campaign

**"Launch rpg-storyboard as First Storyboard OS Vertical"** — a 12-frame campaign with full implementation spec. Covers audience definition, core messaging, touchpoints, asset production, approval gates, launch event, conversion tracking, follow-up, and measurement. Used as the test fixture for all domain logic and as the campaign rendered on the board.

Route: `/campaigns/campaign-01`
