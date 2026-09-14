# Security Policy

## Supported Versions

| Version | Supported |
|---------|-----------|
| 1.x     | Yes       |

## Reporting a Vulnerability

Email: **64996768+mcp-tool-shop@users.noreply.github.com**

Include:
- Description of the vulnerability
- Steps to reproduce
- Version affected
- Potential impact

### Response timeline

| Action | Target |
|--------|--------|
| Acknowledge report | 48 hours |
| Assess severity | 7 days |
| Release fix | 30 days |

## Trust Model

Storyboard OS is a **local-only browser application** shipped as three verticals — `rpg-storyboard`, `marketing-storyboard`, and `cinematic-storyboard`. Shared posture: no server, no accounts, no network egress, no telemetry.

**Persistence differs by vertical:**

| Vertical | Persistence today | Data in browser |
|----------|-------------------|-----------------|
| **rpg-storyboard** | Yes — `localStorage` key `rpg-sb:projects` | Quest titles, beat specs, board positions, checklist/test progress, designer notes, player-visible text |
| **marketing-storyboard** | None — SSG demo / template boards | No project store; campaign content is build-time static |
| **cinematic-storyboard** | None — SSG demo / template boards | No project store; sequence content is build-time static |

Editable localStorage-backed projects for cinematic remain future work (see roadmap §1). Do not assume marketing or cinematic read or trust a browser store.

- **Data NOT touched (all verticals):** No credentials, no authentication tokens, no payment information, no personal information beyond what an operator types into editable RPG fields or authors into static demo content. No project data is ever uploaded.
- **Network requests:** None at runtime, in any vertical. Each app is served as static HTML/JS. After the initial page load, no network calls are made.
- **Permissions required:** RPG needs browser `localStorage` access to persist projects. Marketing and cinematic need no special permissions beyond loading the static site. No camera, microphone, location, or file-system access in any vertical.
- **No telemetry:** Nothing is collected or transmitted by any vertical. No analytics, no error reporting, no usage tracking.

## Scope

Attack surface common to all three verticals:

- **XSS via authored content:** Spec fields (beat specs, campaign briefs, shot descriptions, dialogue, notes) are plain text. If rendered as HTML without sanitization, malicious content could execute. All spec content is rendered as text, not HTML, in all three apps. For RPG, an attacker with access to the same-origin `localStorage` could plant hostile strings; for marketing/cinematic the content is in the shipped static bundle / domain fixtures.
- **Dependency vulnerabilities:** Standard npm supply-chain risk across shared packages (`@storyboard-os/core`, `canvas`, `routing`, `rpg-domain`, `marketing-domain`, `cinematic-domain`) and the three app shells. Dependabot monitors for updates.

**RPG-only persistence surface:**

- **localStorage tampering:** Data under `rpg-sb:projects` is readable by any JavaScript on the same origin. The RPG app validates records on read (`WriteResult` / `ReadWarning`); malformed records are dropped from the in-memory list with a notice, not used to blank the whole registry. Marketing and cinematic do not share this namespace and have no store to corrupt.
- **Store resilience:** Quota exceeded, `NEWER_SCHEMA` (store written by a newer build), and corrupt roots/records are handled in `apps/rpg-storyboard` `projectStorage.ts`. Recovery steps: [`docs/operator-playbook.md`](docs/operator-playbook.md) §5.

## Per-vertical considerations

The **content** operators put into spec fields (or commit as exported packs) differs by domain. The risks below are operator-side data-handling concerns, not application vulnerabilities — they apply if a user commits exported pack files, project JSON dumps, or handoff briefs to a public repository.

### Marketing vertical

The marketing schema accepts free-text fields that often carry information regulated or sensitive in real-world campaign work:

- `audienceSegment` — may contain CRM segment names, audience codes, internal targeting taxonomy, or vendor segment identifiers that reveal customer-list structure
- `customerStateBefore` / `customerStateAfter` — narrative descriptions may include identifying details about real customers, account types, or internal cohort definitions
- Campaign-brief free-text (messaging claims, channel notes, approval requirements, measurement metrics) may carry unannounced launch dates, embargoed messaging, pricing, or PII embedded in example copy

**Recommended operator practice for marketing:**
- Keep campaign storyboards in a **private** repository while a campaign is in flight
- `.gitignore` any exported project JSON or handoff Markdown that contains real audience descriptors or customer identifiers
- Treat downloaded campaign briefs as confidential; do not paste them into public issue trackers, support tickets, or shared chat channels without scrubbing
- Use anonymized placeholder names (`Segment A`, `Customer Persona 1`) rather than real CRM segment IDs in any storyboard that may be shared externally

### Cinematic vertical

The cinematic schema accepts free-text fields that often carry **copyrighted or production-confidential** content:

- `dialogue` — verbatim script excerpts, often the author's or studio's IP
- `visualDescription` / `framing` — shot-level descriptions of unreleased visual material
- `requiredAssets`, `vfxRequirements`, `audioRequirements`, `continuityRequirements` — production specifics that, if public, can reveal unannounced effects, brand collaborations, or plot points

**Recommended operator practice for cinematic:**
- Keep cinematic storyboards in a **private** repository for any pre-release production
- `.gitignore` exported sequence JSON and handoff Markdown that include scripted dialogue or shot descriptions
- Treat downloaded production briefs as confidential; do not share with vendors or contractors without an NDA in place and a copy of the brief stored only in a private channel
- Strip or rewrite dialogue and visual descriptions before showcasing a board in public talks, marketing material, or documentation contributed back upstream

### RPG vertical

The RPG schema generally carries game-design content rather than personal or copyrighted third-party material, so the risk profile is lower. Still:

- Quest names, beat summaries, and player-visible text are often the author's or studio's IP for an unreleased game — treat them with the same care you would treat any other unreleased game-design document
- If the project storyboard references licensed IP (e.g., a contracted licensed property), keep the repository private until release
- `.gitignore` localStorage dumps / exported project JSON when they contain unpublished quest IP

### All verticals

Across every vertical, the application **never uploads** anything — every concern above is about what an operator chooses to commit, share, or publish. Defaults are private: RPG data stays in one browser profile; marketing/cinematic demos are static; zero network egress. The recommendations here exist because exported handoff briefs and committed pack files are easy to forget about once they leave the browser.
