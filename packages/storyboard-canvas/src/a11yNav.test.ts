import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, it, expect } from 'vitest';
import { nextFrameIndex, isNavKey } from './a11yNav';

// ─── AccessibleFrameList landmark labels ──────────────────────────────────────
// Source pin: package vitest is node-env (no jsdom), so DOM render is out of
// reach — assert nav + listbox names mirror headerLabel().

function readSrc(name: string): string {
  return readFileSync(
    join(dirname(fileURLToPath(import.meta.url)), name),
    'utf8',
  );
}

describe('AccessibleFrameList aria labels', () => {
  it('mirrors headerLabel() on the nav landmark and listbox', () => {
    const src = readSrc('AccessibleFrameList.tsx');
    expect(src).toContain('const listName = headerLabel(frameCount, connectionCount)');
    expect(src).toContain('aria-label={listName}');
    expect(src.match(/aria-label=\{listName\}/g)?.length).toBe(2);
    expect(src).not.toContain('aria-label="Frame navigation"');
    expect(src).not.toContain('aria-label="Storyboard frames"');
  });

  it('paints the chrome header with secondary at 12px, not muted at 10px', () => {
    const src = readSrc('AccessibleFrameList.tsx');
    expect(src).toMatch(/HEADER_STYLE[\s\S]*fontSize: 12/);
    expect(src).toMatch(/HEADER_STYLE[\s\S]*color: '#94a3b8'/);
    expect(src).not.toMatch(/HEADER_STYLE[\s\S]*color: '#64748b'/);
  });

  it('uses config type labels (not humanizeType of the raw key)', () => {
    const src = readSrc('AccessibleFrameList.tsx');
    expect(src).toContain('accessibleFrameName(item.frame, typeLabelFor)');
    expect(src).not.toMatch(/humanizeType\(frame\.type\)/);
  });

  it('lists connections in the same listbox when onActivateConnection is set', () => {
    const src = readSrc('AccessibleFrameList.tsx');
    expect(src).toContain('onActivateConnection');
    expect(src).toContain("kind: 'connection'");
    expect(src).toContain('accessibleConnectionName');
    expect(src).toContain('connectionTypeLabelFor');
  });

  it('uses secondary text and opaque empty-board panel', () => {
    const src = readSrc('AccessibleFrameList.tsx');
    expect(src).toMatch(/EMPTY_STYLE[\s\S]*color: '#94a3b8'/);
    expect(src).toContain('focusWithin || isEmpty');
  });
});

describe('StoryboardCanvas a11y wiring', () => {
  it('hides the Stage from the accessibility tree', () => {
    const src = readSrc('StoryboardCanvas.tsx');
    expect(src).toContain('aria-hidden="true"');
    expect(src).toMatch(/<div aria-hidden="true"[\s\S]*<Stage/);
  });

  it('does not expose the keyboard-help span in browse order', () => {
    const src = readSrc('StoryboardCanvas.tsx');
    expect(src).toMatch(/id=\{descId\}[^>]*aria-hidden="true"/);
  });

  it('passes a connection type-label resolver into the frames list', () => {
    const src = readSrc('StoryboardCanvas.tsx');
    expect(src).toContain('connectionTypeLabelFor={humanizeType}');
  });
});

describe('package index viewport math re-exports', () => {
  it('re-exports the README viewport math names from index.ts', () => {
    const src = readSrc('index.ts');
    for (const name of [
      'fitViewToFrames',
      'centerOnFrame',
      'zoomAtPoint',
      'zoomFromCenter',
      'clampScale',
    ]) {
      expect(src).toContain(name);
    }
  });
});

describe('FrameCard seawall', () => {
  it('uses shared title, badge, and size guards', () => {
    const src = readSrc('FrameCard.tsx');
    expect(src).toContain('ensureFiniteSize(frame.size, frame.id)');
    expect(src).toContain('frameDisplayTitle(frame.title)');
    expect(src).toContain('badgesWithText(frame.badges)');
  });

  it('caps title height so wrap+ellipsis truncates, and sizes badges at xs', () => {
    const src = readSrc('FrameCard.tsx');
    expect(src).toContain('height={titleMaxHeight}');
    expect(src).toContain('BADGE_FONT_SIZE = 11');
    expect(src).toContain('typeBarLabelFill(style.accent, style.bg)');
  });
});

describe('ConnectionLayer unselected labels', () => {
  it('paints resting labels with secondary, not muted', () => {
    const src = readSrc('ConnectionLayer.tsx');
    expect(src).toContain("fill={isSelected ? '#cbd5e1' : '#94a3b8'}");
    expect(src).not.toContain("'#64748b'");
  });
});

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
