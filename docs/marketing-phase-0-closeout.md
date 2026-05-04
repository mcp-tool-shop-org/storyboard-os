# Marketing Phase 0 Closeout — Campaign Implementation Storyboard

_Completed 2026-05-04_

---

## What Marketing Phase 0 Is

Marketing Phase 0 proves multi-vertical architecture by shipping a complete second domain on the Storyboard OS platform. The marketing vertical is a **campaign implementation storyboard** — it answers "Can this campaign ship, and what blocks it?" using the same canvas, core, and routing infrastructure that the RPG vertical uses.

It is not a marketing planner, content calendar, or project management tool. Those are different products.

---

## Phase 0 Spine

| Sub-phase | Description |
|---|---|
| M-0A | Marketing domain package — schema, frame types, signals, templates, validation, handoff, demo campaign |
| M-0B | Marketing app vertical — Astro campaign board, frame inspector, campaign brief page |
| M-0C | Launch readiness signal layer — critical path, approval gates, measurement loops |
| M-0D | Closeout — docs, changelog, architecture proof _(this commit)_ |

---

## Acceptance Gates

| Gate | Status |
|---|---|
| Domain exports launch readiness rollup | ✅ |
| Domain exports critical path helper | ✅ |
| Domain exports approval gate signals | ✅ |
| Domain exports measurement loop signals | ✅ |
| Marketing board header shows launch readiness level | ✅ |
| Critical path is visually emphasized on board | ✅ |
| Approval blockers visible without opening frame pages | ✅ |
| Measurement closure visible without opening frame pages | ✅ |
| Launch blockers panel lists concrete missing requirements | ✅ |
| No workflow-stage, owner, date, or content-calendar concepts added | ✅ |
| No RPG imports in marketing app or domain | ✅ |
| Canvas remains domain-neutral (zero changes) | ✅ |
| `pnpm verify` passes — 511 tests, 45 pages, 5 packages, 2 apps | ✅ |

---

## What Shipped

### M-0A — Domain Package (124 tests)

- `@storyboard-os/marketing-domain` — standalone domain package with zero coupling to RPG
- 9 frame types: audience, message, touchpoint, asset, approval, launch_event, conversion, follow_up, measurement
- Full content schema: objective, audienceSegment, customerStateBefore/After, messageClaim, channel, requiredAssets, approvalRequirements, metrics, testCriteria, implementationChecklist
- 3 templates: product_launch, brand_awareness, content_campaign
- Frame signals: getMarketingFrameBadges, getMarketingFrameSignal
- Beat status: getMarketingBeatStatus, getCampaignReadiness
- Validation: validateMarketingStoryboard (domain rules on top of core)
- Handoff: generateCampaignBrief, generateCampaignMarkdown
- Demo campaign: 12-frame "Launch rpg-storyboard" campaign

### M-0B — App Vertical (3 pages)

- `apps/marketing-storyboard` — Astro SSG application
- Campaign board page with full Konva canvas using marketing-specific config
- Frame inspector showing all marketing content fields and beat status
- Campaign brief handoff page with Markdown + JSON export
- Campaign index page
- Marketing-specific connection types: sequence, dependency, approval, optional
- Marketing-specific frame type colors and badges

### M-0C — Launch Readiness Signal Layer (19 tests)

- `getCampaignLaunchReadiness(campaign)` — overall readiness rollup with level, critical path, and blockers
- `getCampaignCriticalPath(campaign)` — longest path to launch_event via topological sort
- `getApprovalGateSignals(campaign)` — per-approval status, blocks-launch flag, requirements check
- `getMeasurementLoopSignals(campaign)` — per-measurement metrics presence, loop detection
- App: LaunchReadinessBadge in header (READY / AT RISK / BLOCKED / DRAFT)
- App: CRITICAL badge on critical-path frames
- App: LaunchBlockersPanel right rail (approval blockers, pending approvals, missing metrics, open loops)

---

## Architecture Integrity

### What stayed clean

**Canvas untouched.** Zero changes to `@storyboard-os/canvas`. The marketing app passes a different `StoryboardCanvasConfig` with marketing frame type styles and connection type styles. The canvas renders them identically to RPG frames.

**Core untouched.** Zero changes to `@storyboard-os/core`. The marketing domain imports and specializes the same generic primitives: `StoryboardFrame<TFrameType, TContent, TAnnotationType>`, `Storyboard<TFrame>`.

**Routing untouched.** Zero changes to `@storyboard-os/routing`.

**No cross-domain imports.** `@storyboard-os/marketing-domain` does not import from `@storyboard-os/rpg-domain`. `apps/marketing-storyboard` does not import from `@storyboard-os/rpg-domain` or `apps/rpg-storyboard`. The demo campaign mentions "rpg-storyboard" as content (because the demo campaign is about launching rpg-storyboard), but there are no code dependencies.

**RPG vertical unaffected.** The RPG app continues to build 42 pages with 272 domain tests. No regression.

### Multi-vertical proof

This is the structural evidence that the platform supports multiple domains:

```
5 packages built independently
2 apps built independently
0 cross-domain imports
0 infrastructure changes for second vertical
511 tests — no shared test fixtures between domains
```

---

## What Was Deliberately Excluded

| Excluded concept | Rationale |
|---|---|
| Due dates / timelines | Execution scheduling belongs in project management tools (Asana, Linear, etc.) |
| Owner assignment | People management is not frame semantics — it's org structure |
| Workflow stages (draft → review → approved) | Status derives from spec completeness, not human-assigned state |
| Content calendar | Calendar is a presentation format, not campaign domain logic |
| Conversion funnel analytics | Analytics belongs in measurement tools, not authoring tools |
| Asset file storage | File management is infrastructure, not implementation spec |
| CRM integration | Audience data lives in CRM tools, not campaign storyboards |
| Approval workflows (routing, escalation) | Approval gates are structural; workflow automation is orchestration |

The line is: **What does the campaign implementation spec need to be complete?** Anything that answers a different question belongs in a different tool.

---

## Test + Build Proof

```
Packages: 5 (core, rpg-domain, marketing-domain, canvas, routing)
Tests: 511 (core: 0 runtime, rpg-domain: 272, marketing-domain: 143, canvas: 27, rpg-app: 69)
Pages: 45 (rpg-storyboard: 42, marketing-storyboard: 3)
Apps: 2 (rpg-storyboard, marketing-storyboard)
CI: green
```
