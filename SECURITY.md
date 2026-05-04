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

Storyboard OS is a **local-only browser application**. It has no server, no accounts, and no network egress.

- **Data touched:** Project data (title, beat specs, board positions, checklist progress) stored in browser `localStorage` on the user's own machine. No data leaves the browser.
- **Data NOT touched:** No credentials, no authentication tokens, no payment information, no personal information beyond what the user types into beat spec fields.
- **Network requests:** None at runtime. The app is served as static HTML/JS files. After the initial page load, no network calls are made.
- **Permissions required:** Browser `localStorage` access only. No camera, microphone, location, or file system access.
- **No telemetry:** Nothing is collected or transmitted. No analytics, no error reporting, no usage tracking.

## Scope

Because storyboard-os has no server-side component, the attack surface is limited:

- **XSS via user-authored content:** Beat spec fields accept plain text. If rendered as HTML without sanitization, an attacker with access to a user's localStorage (e.g., on a shared machine) could inject scripts. Spec content is rendered as text, not HTML.
- **localStorage tampering:** Data in localStorage is accessible to any JavaScript running on the same origin. Storyboard-os reads and trusts its own localStorage data; malformed data causes graceful error states, not crashes.
- **Dependency vulnerabilities:** Standard npm dependency supply-chain risk. Dependabot monitors for updates.
