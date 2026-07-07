# Ship Gate

> No repo is "done" until every applicable line is checked.
> Copy this into your repo root. Check items off per-release.

**Tags:** `[all]` every repo · `[npm]` `[pypi]` `[vsix]` `[desktop]` `[container]` published artifacts · `[mcp]` MCP servers · `[cli]` CLI tools

---

## A. Security Baseline

- [x] `[all]` SECURITY.md exists (report email, supported versions, response timeline) (2026-05-04)
- [x] `[all]` README includes threat model paragraph (data touched, data NOT touched, permissions required) (2026-05-04)
- [x] `[all]` No secrets, tokens, or credentials in source or diagnostics output (2026-05-04)
- [x] `[all]` No telemetry by default — state it explicitly even if obvious (2026-05-04)

### Default safety posture

- [ ] `[cli|mcp|desktop]` SKIP: not a CLI, MCP server, or desktop app — browser-only static site
- [ ] `[mcp]` SKIP: not an MCP server

## B. Error Handling

- [x] `[all]` Errors follow the Structured Error Shape: `code`, `message`, `hint`, `cause?`, `retryable?` (2026-05-04)
- [ ] `[cli]` SKIP: not a CLI tool
- [ ] `[mcp]` SKIP: not an MCP server
- [ ] `[desktop]` SKIP: not a desktop app — browser-only; errors surface as inline UI states (notFound, loading) rather than OS-level error dialogs
- [ ] `[vscode]` SKIP: not a VS Code extension

## C. Operator Docs

- [x] `[all]` README is current: what it does, install, usage, supported platforms + runtime versions (2026-05-04)
- [x] `[all]` CHANGELOG.md (Keep a Changelog format) (2026-05-04)
- [x] `[all]` LICENSE file present and repo states support status (2026-05-04)
- [ ] `[cli|mcp|desktop]` SKIP: not a CLI, MCP server, or desktop app
- [ ] `[complex]` SKIP: no background daemons or operational modes requiring HANDBOOK.md

## D. Shipping Hygiene

- [x] `[all]` `verify` script exists (test + build + smoke in one command) (2026-05-04)
- [x] `[all]` Version in manifest matches git tag (2026-05-04)
- [x] `[all]` Dependency scanning runs in CI — `pnpm audit --prod --audit-level=high` gates every run (ci.yml); two SSR-only astro advisories are documented-and-ignored in `pnpm-workspace.yaml` (structurally unreachable in static output) (2026-07-07)
- [x] `[all]` Automated dependency update mechanism exists (2026-05-04)
- [x] `[npm]` Six `@storyboard-os/*` packages publish to npm publicly via `.github/workflows/publish.yml` on release (core, routing, rpg-domain, canvas, marketing-domain, cinematic-domain) (2026-05-12)
- [x] `[npm]` `engines.node` is set in root and per-package `package.json` (`>=20`) (2026-05-12)
- [x] `[npm]` Lockfile committed (`pnpm-lock.yaml`); CI installs with `--frozen-lockfile` (2026-05-12)
- [x] `[npm]` README and LICENSE shipped inside each package tarball via `files` field (2026-05-12)
- [x] `[npm]` npm provenance — `publish.yml` passes `--provenance` on all six `pnpm publish` steps; npm records the GitHub build attestation for every package (2026-05-12)
- [ ] `[npm]` SBOM generation — no SBOM (CycloneDX / SPDX) is produced or attached to the GitHub release (2026-05-12)
- [ ] `[vsix]` SKIP: not a VS Code extension
- [ ] `[desktop]` SKIP: not a desktop app

## E. Identity (soft gate — does not block ship)

- [x] `[all]` Logo in README header (2026-05-04)
- [x] `[all]` Translations (polyglot-mcp, 7 languages — ja, zh, es, fr, hi, it, pt-BR) (2026-05-04)
- [x] `[org]` Landing page (@mcptoolshop/site-theme) (2026-05-04) — https://mcp-tool-shop-org.github.io/storyboard-os/
- [x] `[all]` GitHub repo metadata: description, homepage, topics (2026-05-04)

---

## Gate Rules

**Hard gate (A–D):** Must pass before any version is tagged or published.
If a section doesn't apply, mark `SKIP:` with justification — don't leave it unchecked.

**Soft gate (E):** Should be done. Product ships without it, but isn't "whole."

**Checking off:**
```
- [x] `[all]` SECURITY.md exists (2026-02-27)
```

**Skipping:**
```
- [ ] `[pypi]` SKIP: not a Python project
```
