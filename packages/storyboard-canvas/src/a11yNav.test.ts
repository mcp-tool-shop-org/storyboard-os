import { describe, it, expect } from 'vitest';
import { nextFrameIndex, isNavKey } from './a11yNav';

// ─── isNavKey ─────────────────────────────────────────────────────────────────

describe('isNavKey', () => {
  it('recognizes the six navigation keys', () => {
    expect(isNavKey('ArrowDown')).toBe(true);
    expect(isNavKey('ArrowUp')).toBe(true);
    expect(isNavKey('ArrowRight')).toBe(true);
    expect(isNavKey('ArrowLeft')).toBe(true);
    expect(isNavKey('Home')).toBe(true);
    expect(isNavKey('End')).toBe(true);
  });

  it('rejects non-navigation keys', () => {
    expect(isNavKey('Enter')).toBe(false);
    expect(isNavKey(' ')).toBe(false);
    expect(isNavKey('Escape')).toBe(false);
    expect(isNavKey('a')).toBe(false);
    expect(isNavKey('Tab')).toBe(false);
  });
});

// ─── nextFrameIndex — forward movement ─────────────────────────────────────────

describe('nextFrameIndex — forward (Down / Right)', () => {
  it('moves to the next item', () => {
    expect(nextFrameIndex('ArrowDown', 0, 5)).toBe(1);
    expect(nextFrameIndex('ArrowRight', 2, 5)).toBe(3);
  });

  it('clamps at the last item (no wrap)', () => {
    expect(nextFrameIndex('ArrowDown', 4, 5)).toBe(4);
    expect(nextFrameIndex('ArrowRight', 4, 5)).toBe(4);
  });

  it('lands on the first item when nothing is focused', () => {
    expect(nextFrameIndex('ArrowDown', -1, 5)).toBe(0);
  });
});

// ─── nextFrameIndex — backward movement ────────────────────────────────────────

describe('nextFrameIndex — backward (Up / Left)', () => {
  it('moves to the previous item', () => {
    expect(nextFrameIndex('ArrowUp', 3, 5)).toBe(2);
    expect(nextFrameIndex('ArrowLeft', 1, 5)).toBe(0);
  });

  it('clamps at the first item (no wrap)', () => {
    expect(nextFrameIndex('ArrowUp', 0, 5)).toBe(0);
    expect(nextFrameIndex('ArrowLeft', 0, 5)).toBe(0);
  });

  it('lands on the last item when nothing is focused', () => {
    expect(nextFrameIndex('ArrowUp', -1, 5)).toBe(4);
  });
});

// ─── nextFrameIndex — Home / End ───────────────────────────────────────────────

describe('nextFrameIndex — Home / End', () => {
  it('Home jumps to the first item', () => {
    expect(nextFrameIndex('Home', 3, 5)).toBe(0);
    expect(nextFrameIndex('Home', 0, 5)).toBe(0);
  });

  it('End jumps to the last item', () => {
    expect(nextFrameIndex('End', 1, 5)).toBe(4);
    expect(nextFrameIndex('End', 4, 5)).toBe(4);
  });
});

// ─── nextFrameIndex — degenerate / poisoned input ──────────────────────────────

describe('nextFrameIndex — edge cases', () => {
  it('returns -1 for an empty list', () => {
    expect(nextFrameIndex('ArrowDown', -1, 0)).toBe(-1);
    expect(nextFrameIndex('Home', 0, 0)).toBe(-1);
    expect(nextFrameIndex('End', 0, 0)).toBe(-1);
  });

  it('returns -1 for a non-finite count', () => {
    expect(nextFrameIndex('ArrowDown', 0, NaN)).toBe(-1);
    expect(nextFrameIndex('ArrowDown', 0, Infinity)).toBe(-1);
  });

  it('handles a single-item list', () => {
    expect(nextFrameIndex('ArrowDown', 0, 1)).toBe(0);
    expect(nextFrameIndex('ArrowUp', 0, 1)).toBe(0);
    expect(nextFrameIndex('Home', 0, 1)).toBe(0);
    expect(nextFrameIndex('End', 0, 1)).toBe(0);
  });

  it('normalizes an out-of-range current index', () => {
    // current beyond the end is treated as "unset"
    expect(nextFrameIndex('ArrowDown', 99, 5)).toBe(0);
    expect(nextFrameIndex('ArrowUp', 99, 5)).toBe(4);
  });

  it('normalizes a NaN current index', () => {
    expect(nextFrameIndex('ArrowDown', NaN, 5)).toBe(0);
    expect(nextFrameIndex('ArrowUp', NaN, 5)).toBe(4);
  });

  it('returns a valid in-range index for an unknown key (benign no-op)', () => {
    expect(nextFrameIndex('Enter', 2, 5)).toBe(2);
    expect(nextFrameIndex('x', -1, 5)).toBe(0);
  });
});
