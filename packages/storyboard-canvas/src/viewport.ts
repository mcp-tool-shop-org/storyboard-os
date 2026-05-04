// ─── storyboard-canvas / viewport.ts ──────────────────────────────────────────
//
// Pure math utilities for canvas viewport operations.
// No React, no Konva — geometry only.
// All functions are referentially transparent and fully unit-testable.
//
// ─────────────────────────────────────────────────────────────────────────────

/** Current zoom / pan state for the canvas viewport. */
export interface ViewState {
  /** Uniform scale factor (1 = 100%). */
  scale: number;
  /** Stage x-offset in CSS pixels. */
  x: number;
  /** Stage y-offset in CSS pixels. */
  y: number;
}

export const DEFAULT_VIEW_STATE: ViewState = { scale: 1, x: 0, y: 0 };

export const MIN_SCALE = 0.1;
export const MAX_SCALE = 4;

// ─── Minimal frame shape ──────────────────────────────────────────────────────
// Viewport math only needs position + size.
// CanvasFrame is structurally compatible; pass frame arrays directly.

interface FrameRect {
  position: { x: number; y: number };
  size: { width: number; height: number };
}

// ─── Core math ────────────────────────────────────────────────────────────────

/** Clamp scale to [min, max]. */
export function clampScale(
  scale: number,
  min: number = MIN_SCALE,
  max: number = MAX_SCALE,
): number {
  return Math.max(min, Math.min(max, scale));
}

/**
 * Compute a ViewState that fits all frames within the container with padding.
 * Returns DEFAULT_VIEW_STATE when frames is empty or has zero extent.
 */
export function fitViewToFrames(
  frames: FrameRect[],
  containerWidth: number,
  containerHeight: number,
  padding = 40,
): ViewState {
  if (frames.length === 0) return DEFAULT_VIEW_STATE;

  let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
  for (const f of frames) {
    minX = Math.min(minX, f.position.x);
    minY = Math.min(minY, f.position.y);
    maxX = Math.max(maxX, f.position.x + f.size.width);
    maxY = Math.max(maxY, f.position.y + f.size.height);
  }

  const contentW = maxX - minX;
  const contentH = maxY - minY;
  if (contentW <= 0 || contentH <= 0) return DEFAULT_VIEW_STATE;

  const availW = Math.max(1, containerWidth - padding * 2);
  const availH = Math.max(1, containerHeight - padding * 2);

  const scale = clampScale(Math.min(availW / contentW, availH / contentH));

  // Center the content bounding box in the container
  const x = (containerWidth - contentW * scale) / 2 - minX * scale;
  const y = (containerHeight - contentH * scale) / 2 - minY * scale;

  return { scale, x, y };
}

/**
 * Compute a ViewState that centers a specific frame in the container,
 * preserving the current scale.
 */
export function centerOnFrame(
  frame: FrameRect,
  containerWidth: number,
  containerHeight: number,
  currentScale: number,
): ViewState {
  const cx = frame.position.x + frame.size.width / 2;
  const cy = frame.position.y + frame.size.height / 2;

  return {
    scale: currentScale,
    x: containerWidth / 2 - cx * currentScale,
    y: containerHeight / 2 - cy * currentScale,
  };
}

/**
 * Compute a new ViewState after a zoom gesture at a specific screen position.
 * The content point under the pointer stays visually fixed after zoom.
 *
 * @param current  - Current view state
 * @param pointerX - Cursor x in screen pixels (relative to Stage top-left)
 * @param pointerY - Cursor y in screen pixels (relative to Stage top-left)
 * @param factor   - Zoom factor (e.g. 1.1 to zoom in, 1/1.1 to zoom out)
 */
export function zoomAtPoint(
  current: ViewState,
  pointerX: number,
  pointerY: number,
  factor: number,
): ViewState {
  const newScale = clampScale(current.scale * factor);

  // Content coordinate that was under the pointer before zoom
  const contentX = (pointerX - current.x) / current.scale;
  const contentY = (pointerY - current.y) / current.scale;

  // Reposition so that same content coordinate stays under the pointer
  return {
    scale: newScale,
    x: pointerX - contentX * newScale,
    y: pointerY - contentY * newScale,
  };
}

/**
 * Zoom in or out from the center of the container.
 * Convenience wrapper around zoomAtPoint.
 *
 * @param factor - Zoom factor (e.g. 1.2 to zoom in, 1/1.2 to zoom out)
 */
export function zoomFromCenter(
  current: ViewState,
  containerWidth: number,
  containerHeight: number,
  factor: number,
): ViewState {
  return zoomAtPoint(current, containerWidth / 2, containerHeight / 2, factor);
}
