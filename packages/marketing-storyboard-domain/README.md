<p align="center">
  <img src="https://raw.githubusercontent.com/mcp-tool-shop-org/brand/main/logos/storyboard-os/readme.png" alt="Storyboard OS" width="400" />
</p>

<p align="center">
  <a href="https://github.com/mcp-tool-shop-org/storyboard-os/actions/workflows/ci.yml"><img src="https://github.com/mcp-tool-shop-org/storyboard-os/actions/workflows/ci.yml/badge.svg" alt="CI" /></a>
  <a href="https://www.npmjs.com/package/@storyboard-os/marketing-domain"><img src="https://img.shields.io/npm/v/@storyboard-os/marketing-domain.svg" alt="npm" /></a>
  <a href="./LICENSE"><img src="https://img.shields.io/badge/license-MIT-blue.svg" alt="MIT License" /></a>
</p>

<p align="center"><strong>Campaign-implementation contract for the Storyboard OS platform.</strong></p>

---

# @storyboard-os/marketing-domain

The marketing campaign-implementation domain package. Everything a growth marketer, campaign manager, or marketing engineer needs to design a **launch-ready** campaign as a board of implementable beats — frame types, content schema, templates, validation rules, canvas signals, launch-readiness model, critical-path analysis, and campaign-brief handoff.

**Target user:** Someone planning a marketing campaign who needs each beat to carry enough spec — audience, message, channel, assets, approval gates, and measurement — to hand off to execution without a follow-up meeting.

**Not for:** Generic content calendars, social-post schedulers, ad-account managers, or CRM pipelines. This models the *implementation logic* of a launch — what has to be true, in what order, for the campaign to ship.

This package depends only on [`@storyboard-os/core`](https://www.npmjs.com/package/@storyboard-os/core) and imports from no other vertical.

---

## Install

```bash
pnpm add @storyboard-os/marketing-domain
# or
npm i @storyboard-os/marketing-domain
```

Requires Node ≥ 20. Ships ESM + CJS + type declarations.

## Frame types

Nine `MarketingFrameType` values model the moving parts of a campaign:

| Type | What it captures |
|---|---|
| `audience` | A segment and its customer-state transition (before → after) |
| `message` | A claim or positioning beat aimed at a segment |
| `touchpoint` | A channel moment (email, ad, landing page, …) |
| `asset` | A required deliverable for the production pass |
| `approval` | An approval gate — who must sign off before launch |
| `launch_event` | A dated launch milestone on the critical path |
| `conversion` | A conversion goal the campaign drives toward |
| `follow_up` | A post-touch nurture or retargeting beat |
| `measurement` | A metric + measurement loop that closes the feedback cycle |

## What it provides

```ts
import {
  MARKETING_TEMPLATES, getMarketingTemplate, createCampaignFromTemplate,
  validateMarketingStoryboard,
  getMarketingFrameSignal, getMarketingFrameBadges, marketingColors,
  getCampaignBeatStatus, getCampaignReadiness,
  getCampaignLaunchReadiness, getCampaignCriticalPath,
  getApprovalGateSignals, getMeasurementLoopSignals,
  generateCampaignHandoff, generateCampaignMarkdown, HANDOFF_FORMAT_VERSION,
  createCampaignProject, getProjectProgress,
} from '@storyboard-os/marketing-domain';
```

- **Templates** — `MARKETING_TEMPLATES`, `getMarketingTemplate(id)`, `createCampaignFromTemplate(...)`: campaign starting points with typed beat sequences.
- **Validation** — `validateMarketingStoryboard(board)` returns a structured `StoryboardValidationResult` (`{ valid, errors }`); it never throws on malformed input. Marketing-specific error codes extend the core open union.
- **Frame signals** — `getMarketingFrameSignal(frame)` / `getMarketingFrameBadges(frame)` derive per-frame state, readiness, and canvas badges; `marketingColors` is the canonical badge palette (shared status swatches from core + `gate` amber and `critical`).
- **Readiness model** — `getCampaignBeatStatus(frame)` classifies a beat as `ready | partial | draft | blocked`; `getCampaignReadiness(board)` rolls the beats up into a campaign readiness summary.
- **Launch readiness** — `getCampaignLaunchReadiness`, `getCampaignCriticalPath`, `getApprovalGateSignals`, and `getMeasurementLoopSignals` surface what blocks launch: gated approvals (blocked vs pending), the critical path to the launch event, and open measurement loops.
- **Handoff** — `generateCampaignHandoff(board)` and `generateCampaignMarkdown(board)` (plus the project-level `generateProjectCampaignHandoff` / `…Markdown`) emit a campaign-implementation brief carrying `HANDOFF_FORMAT_VERSION` for downstream consumers. User text is neutralized before interpolation.
- **Project helpers** — `createCampaignProject`, `updateFrameContent`, `setChecklistItemComplete`, `getProjectProgress`, … manage a persisted campaign project (used by the marketing-storyboard app's localStorage layer).
- **Demo** — `launchRpgStoryboardCampaign` is a complete example campaign for tests and previews.

## Trust model

Pure data + functions — no I/O, no network, no persistence. All state (frames, connections, progress) is passed in and returned; where the app persists a project, that happens in the app layer, not here. The validator is the runtime seawall: it returns structured errors rather than throwing on malformed input.

---

Part of **[Storyboard OS](https://github.com/mcp-tool-shop-org/storyboard-os)** — a visual story-structure platform with three verticals (`rpg-domain`, `marketing-domain`, `cinematic-domain`) over a shared `core`, `canvas`, and `routing`. See the [handbook](https://mcp-tool-shop-org.github.io/storyboard-os/) for the full architecture.
