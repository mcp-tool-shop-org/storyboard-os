---
title: Marketing campaigns
description: Campaign implementation storyboard — launch readiness, inspect a beat, Launch Blockers, export a brief.
sidebar:
  order: 3
---

A campaign implementation storyboard. Every frame is a campaign beat with concrete implementation requirements: objectives, audience segments, customer-state transitions, required assets, test criteria, and checklists.

The board answers one question cold: **Can this campaign ship, and what blocks it?**

Launch readiness is derived from spec completeness and graph structure — not from human-assigned status, dates, or ownership.

:::note
GitHub companion: [`docs/marketing-storyboard.md`](https://github.com/mcp-tool-shop-org/storyboard-os/blob/main/docs/marketing-storyboard.md). This handbook page is the Pages authoring loop.
:::

## What it is not

| This tool is not | Why the boundary exists |
|---|---|
| A marketing planner | Planning is upstream. This picks up after the plan exists. |
| A content calendar | Calendar is a view, not a domain concept. |
| A project management tool | No owners, no due dates, no workflow stages. |
| A CRM or automation layer | No contacts, no triggers, no integrations. |
| A brand guidelines repository | Brand lives elsewhere. This is execution. |

## Frame types

| Type | Purpose |
|---|---|
| `audience` | Who the campaign targets. Segments, customer state before/after. |
| `message` | What the campaign says. Core claim, differentiation. |
| `touchpoint` | Where the message appears. Channel, format, placement. |
| `asset` | What needs to be produced. Creative requirements, specs. |
| `approval` | What must be signed off. Requirements that gate launch. |
| `launch_event` | The ship moment. Required assets, go/no-go signal. |
| `conversion` | What happens after. Conversion criteria, fallback paths. |
| `follow_up` | Post-launch continuation. Re-engagement, nurture. |
| `measurement` | How success is measured. Metrics, feedback loops. |

Every frame carries `objective`, `audienceSegment`, `customerStateBefore`, `customerStateAfter`, `testCriteria`, `implementationChecklist`. Type-specific fields add domain depth. Full field lists stay in the inspector — see [Card vs inspector](./architecture/#card-vs-inspector).

## Connection types

| Type | Meaning |
|---|---|
| `sequence` | This beat follows the previous one in campaign flow. |
| `choice` | Audience-segment path — one of N segments opens. |
| `dependency` | This beat cannot start until the upstream beat is resolved. |
| `approval` | This beat requires formal approval before downstream work begins. |
| `consequence` | Outcome arc — a result of an upstream beat. |
| `optional` | This path is optional — the campaign can proceed without it. |

The critical-path algorithm traverses these edges to find the longest path to `launch_event`.

## Authoring loop (`/campaigns`)

Boards are static SSG demos. There is no `localStorage` and no project list. Treat the handoff export as the deliverable.

### 1. Open a campaign

`pnpm dev:marketing`, then **`/campaigns/campaign-01`** (“Launch rpg-storyboard as First Storyboard OS Vertical”). The index lists the demo plus template-derived boards.

### 2. Read launch readiness

The header badge is the campaign-level answer: **READY / AT RISK / BLOCKED / DRAFT**, from `getCampaignLaunchReadiness`. Frames on the longest path to `launch_event` carry a **CRITICAL** badge. Do not treat that badge as a due date.

`getCampaignCriticalPath` is topological (Kahn) longest-path, not a calendar.

### 3. Inspect a beat

Click a frame. The inspector holds the full spec the card must not:

- Readiness chip (`SPEC` / `PARTIAL` / `DRAFT` / `BLOCKED`) and coverage
- Customer state before/after, channel, message claim, proof points
- Required assets, approval requirements, launch dependencies
- Conversion goal, metrics, test criteria, implementation checklist
- Blockers (domain violations) vs spec gaps

On-card surface is type badge, title, one implementable line, readiness. Wiki prose stays in the inspector.

### 4. Use the Launch Blockers panel

The right rail lists what actually blocks ship:

- Blocked approval gates (requirements missing)
- Pending approval gates (defined, not yet ready)
- Measurement frames without metrics
- Open measurement loops (metrics exist, no feedback edge)
- Other blocked beats (type-required fields missing)

The panel mounts when any of those are present. Click a listed beat to select it on the board.

### 5. Navigate

Pointer gestures and keyboard work on every vertical. The **board list** (top-left, ARIA listbox) is the accessible equivalent of the Konva stage — Arrow Up/Down through frames **and** connections, Enter/Space to activate. Full table: [Getting Started](./getting-started/#navigate-the-board).

### 6. Export a campaign brief

Open **`/campaigns/campaign-01/handoff`** (or **Handoff →** on the board). Download **Markdown** (execution-team document) or **JSON** (schema-validated machine contract). JSON shape: [Handoff JSON contract](./handoff-json/).

There is no live project store — Markdown and JSON are generated from the authored demo or template board at build time.

## Launch readiness model

| Call | What it answers |
|---|---|
| `getCampaignLaunchReadiness(campaign)` | Level, critical path, blocked ids, approval gates, missing measurement, summary sentence |
| `getCampaignCriticalPath(campaign)` | Ordered frame ids, longest path through `launch_event` |
| `getApprovalGateSignals(campaign)` | Per-approval: blocksLaunch, requirements present, `ready \| pending \| blocked` |
| `getMeasurementLoopSignals(campaign)` | Per-measurement: hasMetrics, incoming feed, outgoing loop |

## Demo campaign

**Launch rpg-storyboard as First Storyboard OS Vertical** — 12 frames covering audience, messaging, touchpoints, assets, approval gates, launch, conversion, follow-up, and measurement.

Route: `/campaigns/campaign-01`
