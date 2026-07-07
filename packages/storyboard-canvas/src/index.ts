export { default as StoryboardCanvas } from './StoryboardCanvas';
export type { ViewportHandle } from './StoryboardCanvas';

export { default as FrameCard } from './FrameCard';
export { default as ConnectionLayer } from './ConnectionLayer';
export { default as AccessibleFrameList } from './AccessibleFrameList';

export type {
  CanvasFrameStyle,
  CanvasConnectionStyle,
  StoryboardCanvasConfig,
  CanvasFrame,
  CanvasConnection,
  CanvasBadge,
  PositionMap,
} from './types';

export type { ViewState } from './viewport';
export { DEFAULT_VIEW_STATE, MIN_SCALE, MAX_SCALE } from './viewport';

// VP-011: single source of truth for the neutral fallback styles. App canvas
// configs should reference these instead of hand-copying the same literals into
// each `defaultFrameStyle` / `defaultConnectionStyle`.
export { DEFAULT_FRAME_STYLE, DEFAULT_CONNECTION_STYLE } from './defaults';

// HU-001: pure roving-tabindex navigation logic, exported for reuse/testing.
export { nextFrameIndex, isNavKey } from './a11yNav';
export type { NavKey } from './a11yNav';
