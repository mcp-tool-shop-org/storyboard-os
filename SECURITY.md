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

Storyboard OS is a **local-only browser application** shipped as three verticals — `rpg-storyboard`, `marketing-storyboard`, and `cinematic-storyboard`. All three share the same trust model: no server, no accounts, no network egress.

- **Data touched (all three verticals):** Project and storyboard data stored in browser `localStorage` on the user's own machine. No data leaves the browser.
  - **RPG vertical:** quest titles, beat specs, board positions, checklist progress, state-change descriptions, designer notes, player-visible text
  - **Marketing vertical:** campaign briefs, audience segment descriptions, messaging claims, channel details, approval requirements, measurement metrics, checklist progress
  - **Cinematic vertical:** sequence and shot descriptions, camera angles and movements, dialogue, action notes, VFX/audio requirements, edit notes, continuity requirements, checklist progress
- **Data NOT touched:** No credentials, no authentication tokens, no payment information, no personal information beyond what the user types into spec fields. No project data is ever uploaded.
- **Network requests:** None at runtime, in any vertical. Each app is served as static HTML/JS files. After the initial page load, no network calls are made.
- **Permissions required:** Browser `localStorage` access only. No camera, microphone, location, or file system access.
- **No telemetry:** Nothing is collected or transmitted by any vertical. No analytics, no error reporting, no usage tracking.

## Scope

Because no vertical has a server-side component, the attack surface is identical across all three and limited to:

- **XSS via user-authored content:** Spec fields in every vertical (beat specs, campaign briefs, shot descriptions, dialogue, designer / author / production notes) accept plain text. If rendered as HTML without sanitization, an attacker with access to a user's localStorage (e.g., on a shared machine) could inject scripts. All spec content is rendered as text, not HTML, in all three apps.
- **localStorage tampering:** Data in localStorage is accessible to any JavaScript running on the same origin. Each storyboard app reads and trusts its own localStorage data; malformed data causes graceful error states, not crashes. Verticals do not share localStorage namespaces, so corrupting one does not affect the others.
- **Dependency vulnerabilities:** Standard npm dependency supply-chain risk across the shared packages (`@storyboard-os/core`, `canvas`, `routing`, `rpg-domain`, `marketing-domain`, `cinematic-domain`) and the three app shells. Dependabot monitors for updates.

## Per-vertical considerations

The trust model and attack surface are the same across all three verticals, but the **content** that operators put into spec fields differs by domain. The risks below are operator-side data-handling concerns, not application vulnerabilities — they apply if a user commits exported pack files, project JSON dumps, or handoff briefs to a public repository.

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
- `.gitignore` exported sequence JSON, handoff Markdown, and any localStorage dumps that include scripted dialogue or shot descriptions
- Treat downloaded production briefs as confidential; do not share with vendors or contractors without an NDA in place and a copy of the brief stored only in a private channel
- Strip or rewrite dialogue and visual descriptions before showcasing a board in public talks, marketing material, or documentation contributed back upstream

### RPG vertical

The RPG schema generally carries game-design content rather than personal or copyrighted third-party material, so the risk profile is lower. Still:

- Quest names, beat summaries, and player-visible text are often the author's or studio's IP for an unreleased game — treat them with the same care you would treat any other unreleased game-design document
- If the project storyboard references licensed IP (e.g., a contracted licensed property), keep the repository private until release

### All verticals

Across every vertical, the application **never uploads** anything — every concern above is about what an operator chooses to commit, share, or publish. The defaults are private: localStorage on one machine, zero network egress. The recommendations here exist because exported handoff briefs and committed pack files are easy to forget about once they leave the browser.
