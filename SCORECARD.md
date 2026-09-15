# Scorecard

> Pre/post assessment for storyboard-os. Ship-gate line items live in
> [`SHIP_GATE.md`](SHIP_GATE.md) — this file does not invent shipcheck totals.

**Repo:** mcp-tool-shop-org/storyboard-os  
**Date:** 2026-09-15  
**Type tags:** `[npm]` (six `@storyboard-os/*` packages) · browser-static apps · docs site  
**Release line scored:** 1.3.0 (Phase 10 full treatment)

## Pre-Remediation Assessment

Scored from public root docs + SHIP_GATE state **before** this amend’s doc fixes
(blank scorecard, RPG-only getting-started, over-broad localStorage trust model,
stale Node ≥ 20, missing operator playbook). Category scores are judgmental
1–10 rubrics — **not** a substitute for running `npx @mcptoolshop/shipcheck`.
For the authoritative checkbox gate, see SHIP_GATE.md.

| Category | Score | Notes |
|----------|-------|-------|
| A. Security | 7/10 | SECURITY.md + README threat model present; trust model wrongly claimed localStorage for all three verticals; XSS/dependency scope otherwise sound |
| B. Error Handling | 8/10 | Validator Result shape documented; RPG WriteResult/ReadWarning exist in app code; not a CLI/MCP retry envelope product |
| C. Operator Docs | 5/10 | README/CHANGELOG/LICENSE strong; getting-started RPG-only; operator playbook absent; Node floor drifted vs `engines.node` |
| D. Shipping Hygiene | 9/10 | verify script, provenance publish, frozen lockfile, audit gate, CycloneDX SBOM on release — see SHIP_GATE.md |
| E. Identity (soft) | 9/10 | Logo, translations, Pages landing, org noreply report path; keep home paths / personal mailboxes out of tracked files |
| **Overall** | **37/50** | |

## Key Gaps (closed in 1.2.x / 1.3.0 unless noted)

1. Operator playbook — shipped (`docs/operator-playbook.md`).
2. Trust model overclaim — corrected (RPG-only persistence).
3. Getting-started RPG-centric — marketing `/campaigns` and cinematic `/sequences` + `/reels` first-run paths.
4. Node floor drift — root and six packages `engines.node` `>=22.13.0`.
5. npm Trusted Publishing — `publish.yml` uses environment `npm-publish` and OIDC `id-token`; registry auth still `NODE_AUTH_TOKEN` until Trusted Publisher is bound on npmjs.com.
6. Handbook catalog-id lag (F-374b0ed0) — closed this treatment: live template ids and `/reels/demo-launch-reel`.

## Post-Remediation (v1.3.0 Phase 10)

Category scores are rubric estimates; checkbox truth remains SHIP_GATE.md.
`npx @mcptoolshop/shipcheck@1.0.7 audit` — 23 checked, 11 skipped, 0 unchecked, 100% pass (A–D).

| Category | Before | After |
|----------|--------|-------|
| A. Security | 7/10 | 9/10 |
| B. Error Handling | 8/10 | 8/10 |
| C. Operator Docs | 5/10 | 9/10 |
| D. Shipping Hygiene | 8/10 | **9/10** |
| E. Identity (soft) | 9/10 | 9/10 |
| **Overall** | **37/50** | **44/50** |

### Still open

- npm Trusted Publisher bind on npmjs.com (operator-side; `NODE_AUTH_TOKEN` stays until then).
- Codecov upload (Phase 4 coverage badge) — not wired; `pnpm test` remains the floor.
- App-shell (C6), polyglot README locale refresh runs as part of this treatment.
- CLI/MCP/desktop/vscode rows remain `SKIP` (browser-static product).
