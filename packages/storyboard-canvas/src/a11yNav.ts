// ─── storyboard-canvas / a11yNav.ts ──────────────────────────────────────────
//
// HU-001: pure keyboard-navigation math for the accessible frame list.
//
// The DOM overlay lives in StoryboardCanvas.tsx (React + refs, not unit-
// testable in this node-env vitest setup — the package ships no jsdom). This
// module isolates the ONE piece of that overlay that IS pure logic: given the
// pressed key, the currently-focused index, and the frame count, what index
// should focus move to? That makes the roving-tabindex behaviour testable in
// the same style as viewport.ts, independent of any DOM.
//
// No React, no DOM, no Konva — index arithmetic only.
//
// ─────────────────────────────────────────────────────────────────────────────

/** Keys this module knows how to act on. Anything else returns "no move". */
export type NavKey =
  | 'ArrowDown'
  | 'ArrowUp'
  | 'ArrowRight'
  | 'ArrowLeft'
  | 'Home'
  | 'End';

const NAV_KEYS: ReadonlySet<string> = new Set<NavKey>([
  'ArrowDown',
  'ArrowUp',
  'ArrowRight',
  'ArrowLeft',
  'Home',
  'End',
]);

/** True if `key` is one this module will move focus for. */
export function isNavKey(key: string): key is NavKey {
  return NAV_KEYS.has(key);
}

/**
 * Compute the next focused frame index for a roving-tabindex list.
 *
 * The list is presented as a single vertical column, so:
 *   - ArrowDown / ArrowRight → next item
 *   - ArrowUp   / ArrowLeft  → previous item
 *   - Home                   → first item
 *   - End                    → last item
 *
 * Movement CLAMPS at the ends (it does not wrap) — the WAI-ARIA listbox pattern
 * permits either, and clamping is the less surprising default for a spatial
 * board list where wrapping from last-back-to-first can disorient.
 *
 * Robustness (mirrors viewport.ts's finite-guard discipline):
 *   - count <= 0                    → returns -1 (no valid target; empty board)
 *   - non-finite / out-of-range cur → treated as "no current selection", so
 *     the first meaningful key lands on a sensible end (Down/Home → 0,
 *     Up/End → last).
 *   - unknown key                   → returns `current` clamped into range
 *     (a benign no-op — caller should gate on isNavKey first).
 *
 * @param key     The pressed key.
 * @param current The currently focused index (may be -1 / NaN when nothing focused).
 * @param count   Number of frames in the list.
 * @returns       The next index in [0, count-1], or -1 when count <= 0.
 */
export function nextFrameIndex(
  key: string,
  current: number,
  count: number,
): number {
  if (!Number.isFinite(count) || count <= 0) return -1;
  const last = count - 1;

  // Normalize a possibly-unset / poisoned current index.
  const cur = Number.isInteger(current) && current >= 0 && current <= last
    ? current
    : -1;

  switch (key) {
    case 'Home':
      return 0;
    case 'End':
      return last;
    case 'ArrowDown':
    case 'ArrowRight':
      // From "nothing focused" (-1), Down lands on the first item.
      return cur < 0 ? 0 : Math.min(last, cur + 1);
    case 'ArrowUp':
    case 'ArrowLeft':
      // From "nothing focused" (-1), Up lands on the last item.
      return cur < 0 ? last : Math.max(0, cur - 1);
    default:
      // Unknown key: no movement. Return a valid index (0 when unset).
      return cur < 0 ? 0 : cur;
  }
}
