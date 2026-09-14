// ─── storyboard-canvas / positions.ts ─────────────────────────────────────────
//
// Pure helpers for reconciling internal drag PositionMap with frames[].position
// from props. Kept free of React so unit tests can lock the semantics without
// mounting Konva.
//
// ─────────────────────────────────────────────────────────────────────────────

import type { CanvasFrame, PositionMap } from './types';

export type PropPositionMap = PositionMap;

export interface ReconcilePositionsResult {
  positions: PositionMap;
  /** Last-seen `frames[].position` values, used to detect parent-driven updates. */
  propBaselines: PropPositionMap;
  changed: boolean;
}

function samePoint(
  a: { x: number; y: number } | undefined,
  b: { x: number; y: number } | undefined,
): boolean {
  if (!a || !b) return false;
  return a.x === b.x && a.y === b.y;
}

/**
 * Reconcile internal positions with the frames prop.
 *
 * - New frame ids are seeded from `frame.position`.
 * - Orphan ids (removed frames) are pruned.
 * - When `frame.position` differs from the last-seen prop baseline for that id,
 *   the prop value is adopted (undo/redo, reset-layout, parent refresh).
 * - When the prop baseline is unchanged, the prior map entry is kept so local
 *   drag state is not stolen.
 * - When `forceResync` is true (e.g. `positionEpoch` changed), every id is
 *   re-seeded from `frame.position`.
 *
 * Consumers replacing an entire board with overlapping ids but identical
 * coordinates should remount (`key={storyboard.id}`) or bump `positionEpoch`.
 */
export function reconcilePositions(
  prev: PositionMap,
  frames: ReadonlyArray<Pick<CanvasFrame, 'id' | 'position'>>,
  propBaselines: PropPositionMap,
  forceResync = false,
): ReconcilePositionsResult {
  const next: PositionMap = {};
  const nextBaselines: PropPositionMap = {};
  let changed = forceResync;

  if (Object.keys(prev).length !== frames.length) {
    changed = true;
  }

  for (const f of frames) {
    const propPos = { ...f.position };
    nextBaselines[f.id] = propPos;

    const prevPos = prev[f.id];
    const baseline = propBaselines[f.id];

    if (!prevPos || forceResync) {
      next[f.id] = propPos;
      if (!prevPos || !samePoint(prevPos, propPos)) changed = true;
      continue;
    }

    // Missing baseline (first observe) or parent changed frames[].position →
    // adopt the authoritative prop value.
    if (!baseline || !samePoint(baseline, propPos)) {
      next[f.id] = propPos;
      if (!samePoint(prevPos, propPos)) changed = true;
      continue;
    }

    // Baseline unchanged: keep local/drag state.
    next[f.id] = prevPos;
  }

  if (!changed) {
    for (const id of Object.keys(prev)) {
      if (next[id] === undefined) {
        changed = true;
        break;
      }
    }
  }

  return {
    positions: changed ? next : prev,
    propBaselines: nextBaselines,
    changed,
  };
}

/**
 * Whether the autoFit effect should run a (re)fit.
 * Waits for a measured container and at least one frame so an empty first
 * measure does not consume the one-shot guard.
 */
export function shouldAutoFit(options: {
  autoFit: boolean;
  hasFitted: boolean;
  containerWidth: number;
  containerHeight: number;
  frameCount: number;
}): boolean {
  if (!options.autoFit || options.hasFitted) return false;
  if (options.containerWidth <= 0 || options.containerHeight <= 0) return false;
  if (options.frameCount <= 0) return false;
  return true;
}
