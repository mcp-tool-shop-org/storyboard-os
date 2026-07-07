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

// ─── Finiteness guards (F-CV-001) ─────────────────────────────────────────────
// A single NaN/Infinity reaching stage.scale() or stage.position() blanks the
// ENTIRE Stage — Konva bakes the poisoned transform into the canvas matrix and
// every node vanishes. ConnectionLayer already guards this threat class
// per-connection (F-CI-208); these helpers guard the viewport math so that no
// exported function can emit a non-finite ViewState, whatever the caller feeds it.

function isFiniteRect(f: FrameRect): boolean {
  return (
    Number.isFinite(f.position.x) &&
    Number.isFinite(f.position.y) &&
    Number.isFinite(f.size.width) &&
    Number.isFinite(f.size.height)
  );
}

function isFiniteView(v: ViewState): boolean {
  return Number.isFinite(v.scale) && Number.isFinite(v.x) && Number.isFinite(v.y);
}

// ─── Core math ────────────────────────────────────────────────────────────────

/**
 * Clamp scale to [min, max].
 *
 * F-CV-001: NaN survives Math.max/Math.min (`Math.max(min, NaN) === NaN`), so
 * without an explicit guard a poisoned scale would flow through every zoom/fit
 * path into stage.scale() and blank the Stage. Recovery semantics:
 *   NaN       → min  (conservative "zoomed out but everything visible")
 *   -Infinity → min  (natural clamp: "too small")
 *   +Infinity → max  (natural clamp: "too big" — handled by Math.min below)
 */
export function clampScale(
  scale: number,
  min: number = MIN_SCALE,
  max: number = MAX_SCALE,
): number {
  if (Number.isNaN(scale)) return min;
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
  // F-CV-001: container dims come from ResizeObserver in the component layer
  // (finite there by construction), but this is exported API — a non-finite
  // container would put NaN into x/y below even with healthy frames.
  if (!Number.isFinite(containerWidth) || !Number.isFinite(containerHeight)) {
    return DEFAULT_VIEW_STATE;
  }

  // F-CV-001: one frame with NaN/Infinity position or size would poison the
  // min/max fold (the `contentW <= 0` guard below does NOT fire on NaN) and
  // blank the whole Stage. Mirror the per-connection guard in ConnectionLayer
  // (F-CI-208): fit to the healthy frames, ignore the poisoned ones.
  const usable = frames.filter(isFiniteRect);
  if (usable.length === 0) return DEFAULT_VIEW_STATE;

  let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
  for (const f of usable) {
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
  // F-CV-001: a poisoned frame or container has no meaningful center — recover
  // to the default view instead of emitting non-finite x/y.
  if (
    !isFiniteRect(frame) ||
    !Number.isFinite(containerWidth) ||
    !Number.isFinite(containerHeight)
  ) {
    return DEFAULT_VIEW_STATE;
  }

  // F-CV-001: preserve any finite caller scale exactly (the documented
  // "preserving the current scale" contract); route non-finite scale through
  // clampScale so the x/y math below stays finite.
  const scale = Number.isFinite(currentScale) ? currentScale : clampScale(currentScale);

  const cx = frame.position.x + frame.size.width / 2;
  const cy = frame.position.y + frame.size.height / 2;

  return {
    scale,
    x: containerWidth / 2 - cx * scale,
    y: containerHeight / 2 - cy * scale,
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
  // F-CV-001: the anchor math below divides by current.scale. Inside this
  // package the component layer only feeds back transforms this module
  // produced (finite, >= MIN_SCALE > 0), but this is exported API — a
  // non-finite or zero incoming state would emit non-finite x/y and blank the
  // Stage. A broken state has no usable anchor: recover to the default view.
  if (!isFiniteView(current) || current.scale === 0) {
    return DEFAULT_VIEW_STATE;
  }
  // F-CV-001: a non-finite gesture (pointer or factor) cannot be applied to a
  // healthy state — ignore the gesture and keep the current view.
  if (
    !Number.isFinite(pointerX) ||
    !Number.isFinite(pointerY) ||
    !Number.isFinite(factor)
  ) {
    return { ...current };
  }

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
