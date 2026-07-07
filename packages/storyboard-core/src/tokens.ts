// ─── storyboard-core / tokens.ts ──────────────────────────────────────────────
//
// Shared design-token layer. The single source of truth for cross-domain visual
// constants — status colors, badge labels, surfaces, text colors, type scale,
// and spacing. Domain packages import the shared status set from here and add
// their own domain-specific colors on top; app adapters import these SAME tokens
// for legends and inspectors so a card badge and its legend can never disagree.
//
// Plain `as const` objects, no dependencies. Consumers get literal types.
//
// ─────────────────────────────────────────────────────────────────────────────

// ─── Status colors ────────────────────────────────────────────────────────────
// The six shared status colors. `state`/`spec`/`partial`/`draft`/`blocked` are
// the readiness-and-graph palette every vertical renders; `accent` is the shared
// highlight hue. Domain-specific badge colors (marketing GATE, cinematic VFX,
// …) live in each domain's own color const, never here.

export const statusColors = {
  state:   '#3B82F6', // blue   — frame carries a state transition
  spec:    '#22C55E', // green  — fully specced ("SPEC" / ready)
  partial: '#F97316', // orange — partially specced
  draft:   '#6B7280', // gray   — empty shell / draft
  blocked: '#EF4444', // red    — domain rule violation (RESERVED for blocked)
  accent:  '#8B5CF6', // violet — shared highlight / selection
} as const;

// ─── Status labels ────────────────────────────────────────────────────────────
// Canonical badge text for each readiness level. VP-005: the "ready" state is
// labeled 'SPEC' EVERYWHERE — cinematic, marketing, and rpg all render this same
// text, so a "ready" beat never shows "READY" in one vertical and "SPEC" in
// another. Keyed by the readiness level name the domains use.

export const statusLabels = {
  ready:   'SPEC',
  partial: 'PARTIAL',
  draft:   'DRAFT',
  blocked: 'BLOCKED',
} as const;

// ─── Surfaces ─────────────────────────────────────────────────────────────────
// VP-006: two named navies with a rule. `bgPage` is the deepest layer (the
// canvas / page backdrop); `bgChrome` is one step lighter for chrome that sits
// ON the page (panels, toolbars, headers). `border` is the hairline that
// separates chrome from page.

export const surfaces = {
  bgPage:   '#0b1120', // deepest — page / canvas backdrop
  bgChrome: '#0f172a', // one step up — panels, toolbars, chrome on the page
  border:   'rgba(255,255,255,0.07)', // hairline separator
} as const;

// ─── Text colors ──────────────────────────────────────────────────────────────
// WCAG-AA-compliant on the dark navy surfaces (bgPage #0b1120). HU-003 / HU-004:
// the previous `secondary` (#475569 ≈ 2.4:1) and `heading` (#334155 ≈ 1.5:1)
// FAILED contrast; these corrected values replace them. Approx contrast ratios
// vs #0b1120 are noted on the two load-bearing values as a regression guard.

export const textColors = {
  primary:   '#e2e8f0', // body text — high contrast
  secondary: '#94a3b8', // ≈ 7.0:1 on #0b1120 (AA — replaces failing #475569 ~2.4:1)
  muted:     '#64748b', // least-important text — ≥ 3:1 (AA large only)
  heading:   '#f1f5f9', // ≈ 15.8:1 on #0b1120 (replaces near-invisible #334155 ~1.5:1)
  onError:   '#ffffff', // text on a `blocked`/error fill
} as const;

// ─── Type scale ───────────────────────────────────────────────────────────────
// VP-007: one ramp kills the 8 ad-hoc letter-spacings scattered across the apps.
// `fontFamily` is a real system stack; `tracking` holds the only three named
// letter-spacings anyone should reach for.

export const typeScale = {
  fontFamily:
    'system-ui, -apple-system, "Segoe UI", Roboto, Helvetica, Arial, sans-serif',
  xs:   '11px',
  sm:   '12px',
  base: '13px',
  md:   '14px',
  lg:   '16px',
  xl:   '20px',
  tracking: {
    tight: '-0.01em', // large headings
    label: '0.04em',  // uppercase badge / label text
    wide:  '0.08em',  // wide-set eyebrow / section kickers
  },
} as const;

// ─── Spacing ──────────────────────────────────────────────────────────────────
// VP-008: one spacing ramp plus the two canonical side-panel widths.

export const spacing = {
  xs: '4px',
  sm: '8px',
  md: '12px',
  lg: '18px',
  xl: '24px',
  panelWidth: {
    narrow: '300px',
    wide:   '380px',
  },
} as const;

// ─── Types ──────────────────────────────────────────────────────────────────
// Literal-preserving types for consumers that want to key off token names.

export type StatusColorName = keyof typeof statusColors;
export type StatusLabelKey = keyof typeof statusLabels;
export type SurfaceName = keyof typeof surfaces;
export type TextColorName = keyof typeof textColors;
