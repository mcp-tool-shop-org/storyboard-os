// ─── storyboard-canvas / defaults.ts ─────────────────────────────────────────
//
// VP-011: single source of truth for the neutral fallback styles.
//
// Before this file, three string-identical copies existed:
//   - DEFAULT_STYLE        (FrameCard.tsx)
//   - DEFAULT_FRAME_STYLE  (StoryboardCanvas.tsx)
//   - DEFAULT_CONN_STYLE   (ConnectionLayer.tsx)
// …plus a fourth copy inside each app's canvas config (`defaultFrameStyle` /
// `defaultConnectionStyle`). The app copies can't be edited from this package,
// but every internal consumer now imports THESE constants, and both are
// re-exported from the package index so app authors can drop their hand-written
// literals and reference the canonical values instead.
//
// ─────────────────────────────────────────────────────────────────────────────

import type { CanvasFrameStyle, CanvasConnectionStyle } from './types';

/**
 * Neutral fallback style for a frame whose type has no configured entry.
 * Used internally by StoryboardCanvas (config.defaultFrameStyle fallback) and
 * FrameCard (prop default). Exported so app configs can reuse it verbatim.
 */
export const DEFAULT_FRAME_STYLE: CanvasFrameStyle = {
  bg: '#0e1018',
  accent: '#475569',
  label: 'FRAME',
};

/**
 * Neutral fallback style for a connection whose type has no configured entry.
 * Used internally by ConnectionLayer. Exported so app configs can reuse it.
 */
export const DEFAULT_CONNECTION_STYLE: CanvasConnectionStyle = {
  stroke: '#475569',
};
