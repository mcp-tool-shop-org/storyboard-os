# Scorecard

> Pre/post assessment for storyboard-os. Ship-gate line items live in
> [`SHIP_GATE.md`](SHIP_GATE.md) — this file does not invent shipcheck totals.

**Repo:** mcp-tool-shop-org/storyboard-os  
**Date:** 2026-09-14  
**Type tags:** `[npm]` (six `@storyboard-os/*` packages) · browser-static apps · docs site  
**Release line scored:** 1.2.x (tree at docs-site humanization amend)

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

## Key Gaps

1. **Operator playbook missing** — release/fourth-vertical/store recovery scattered across phase closeouts (roadmap §3 / F-DS-205).
2. **Trust model overclaim** — SECURITY + README said all verticals use localStorage; only RPG does.
3. **Getting-started / landing RPG-centric** — no marketing `/campaigns` or cinematic `/sequences` first-run path; site-config implied durable projects for every vertical.
4. **Node floor drift** — root `engines.node` is `>=22.13.0`; README/handbook/SHIP_GATE still said 20.
5. **npm Trusted Publishing** — `publish.yml` uses environment `npm-publish` and OIDC `id-token`; registry auth still `NODE_AUTH_TOKEN` until Trusted Publisher is bound on npmjs.com.

## Remediation Priority

| Priority | Item | Estimated effort |
|----------|------|-----------------|
| 1 | Ship `docs/operator-playbook.md`; close roadmap §3; link from handbook | half day |
| 2 | Correct SECURITY + README trust model (RPG-only persistence) | under 1 hour |
| 3 | Getting-started + site-config: marketing/cinematic first-run; soften durable-project copy | under 1 hour |
| 4 | Align Node ≥ 22.13 in README, handbook, SHIP_GATE; fill this scorecard | under 1 hour |
| 5 | SBOM on release (tracked in SHIP_GATE / roadmap §4) — tooling decision, not this amend | separate |

## Post-Remediation

After this docs-site humanization amend (2026-09-14). Again: category scores are
rubric estimates; checkbox truth remains SHIP_GATE.md. Translated README Node
lines intentionally deferred (Phase 10 polyglot).

| Category | Before | After |
|----------|--------|-------|
| A. Security | 7/10 | 9/10 |
| B. Error Handling | 8/10 | 8/10 |
| C. Operator Docs | 5/10 | 9/10 |
| D. Shipping Hygiene | 8/10 | 8/10 |
| E. Identity (soft) | 9/10 | 9/10 |
| **Overall** | **37/50** | **43/50** |

### Still open (see SHIP_GATE.md)

- `[npm]` SBOM generation — CycloneDX JSON attached on GitHub release via `publish.yml` (2026-09-15).
- CLI/MCP/desktop/vscode rows remain `SKIP` (browser-static product).
- README.`*` locale Node lines await Phase 10 polyglot refresh.
