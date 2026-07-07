// ─── storyboard-core / tokens.test.ts ─────────────────────────────────────────
//
// Guards the shared design-token contract that every domain + app consumes:
//   1. The module shape is stable (the exact token names app agents code against).
//   2. No two status colors collide (a card badge and its legend can never map
//      two different states to the same swatch).
//   3. The AA-critical text colors are the CORRECTED values — a regression back
//      to the failing #475569 / #334155 hexes (HU-003 / HU-004) fails the build.
//
// ─────────────────────────────────────────────────────────────────────────────

import { describe, it, expect } from 'vitest';
import { statusColors, statusLabels, surfaces, textColors, typeScale, spacing } from './tokens';

const HEX = /^#[0-9a-fA-F]{6}$/;

// ─── Module shape ─────────────────────────────────────────────────────────────

describe('token module shape', () => {
  it('statusColors has exactly the six shared status colors', () => {
    expect(Object.keys(statusColors).sort()).toEqual(
      ['accent', 'blocked', 'draft', 'partial', 'spec', 'state'].sort(),
    );
    for (const value of Object.values(statusColors)) {
      expect(value).toMatch(HEX);
    }
  });

  it('statusColors carries the canonical shared hexes', () => {
    expect(statusColors.state).toBe('#3B82F6');
    expect(statusColors.spec).toBe('#22C55E');
    expect(statusColors.partial).toBe('#F97316');
    expect(statusColors.draft).toBe('#6B7280');
    expect(statusColors.blocked).toBe('#EF4444');
    expect(statusColors.accent).toBe('#8B5CF6');
  });

  it('statusLabels standardizes "ready" to SPEC everywhere (VP-005)', () => {
    expect(statusLabels).toEqual({
      ready: 'SPEC',
      partial: 'PARTIAL',
      draft: 'DRAFT',
      blocked: 'BLOCKED',
    });
  });

  it('surfaces has two named navies plus a border rule (VP-006)', () => {
    expect(surfaces.bgPage).toBe('#0b1120');
    expect(surfaces.bgChrome).toBe('#0f172a');
    expect(surfaces.border).toBe('rgba(255,255,255,0.07)');
    // The page backdrop must be strictly darker than the chrome above it.
    expect(surfaces.bgPage).not.toBe(surfaces.bgChrome);
  });

  it('typeScale exposes a font stack, size ramp, and three named trackings (VP-007)', () => {
    expect(typeScale.fontFamily).toContain('system-ui');
    expect(typeScale.xs).toBe('11px');
    expect(typeScale.sm).toBe('12px');
    expect(typeScale.base).toBe('13px');
    expect(typeScale.md).toBe('14px');
    expect(typeScale.lg).toBe('16px');
    expect(typeScale.xl).toBe('20px');
    expect(Object.keys(typeScale.tracking).sort()).toEqual(['label', 'tight', 'wide']);
  });

  it('spacing exposes a ramp plus the two canonical panel widths (VP-008)', () => {
    expect(spacing.xs).toBe('4px');
    expect(spacing.sm).toBe('8px');
    expect(spacing.md).toBe('12px');
    expect(spacing.lg).toBe('18px');
    expect(spacing.xl).toBe('24px');
    expect(spacing.panelWidth.narrow).toBe('300px');
    expect(spacing.panelWidth.wide).toBe('380px');
  });
});

// ─── No status-color collisions ───────────────────────────────────────────────

describe('status color uniqueness', () => {
  it('no two status colors share a hex', () => {
    const values = Object.values(statusColors);
    const unique = new Set(values.map(v => v.toLowerCase()));
    expect(unique.size).toBe(values.length);
  });
});

// ─── AA-critical text colors (HU-003 / HU-004 regression guard) ───────────────

describe('text colors are the WCAG-AA-corrected values', () => {
  it('secondary is the corrected #94a3b8, NOT the failing #475569 (~2.4:1)', () => {
    expect(textColors.secondary).toBe('#94a3b8');
    expect(textColors.secondary.toLowerCase()).not.toBe('#475569');
  });

  it('heading is the corrected #f1f5f9, NOT the near-invisible #334155 (~1.5:1)', () => {
    expect(textColors.heading).toBe('#f1f5f9');
    expect(textColors.heading.toLowerCase()).not.toBe('#334155');
  });

  it('primary and muted are present and valid hexes', () => {
    expect(textColors.primary).toBe('#e2e8f0');
    expect(textColors.muted).toBe('#64748b');
    expect(textColors.primary).toMatch(HEX);
    expect(textColors.muted).toMatch(HEX);
  });
});
