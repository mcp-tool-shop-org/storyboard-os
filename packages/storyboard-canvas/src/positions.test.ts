import { describe, it, expect } from 'vitest';
import {
  DEFAULT_FRAME_SIZE,
  ensureFinitePosition,
  ensureFiniteSize,
  reconcilePositions,
  shouldAutoFit,
} from './positions';
import type { PositionMap } from './types';

describe('reconcilePositions', () => {
  it('seeds new ids from frame.position', () => {
    const result = reconcilePositions(
      {},
      [{ id: 'f1', position: { x: 10, y: 20 } }],
      {},
    );
    expect(result.changed).toBe(true);
    expect(result.positions).toEqual({ f1: { x: 10, y: 20 } });
    expect(result.propBaselines).toEqual({ f1: { x: 10, y: 20 } });
  });

  it('prunes orphan ids removed from frames', () => {
    const prev: PositionMap = {
      f1: { x: 0, y: 0 },
      gone: { x: 9, y: 9 },
    };
    const baselines: PositionMap = {
      f1: { x: 0, y: 0 },
      gone: { x: 9, y: 9 },
    };
    const result = reconcilePositions(
      prev,
      [{ id: 'f1', position: { x: 0, y: 0 } }],
      baselines,
    );
    expect(result.changed).toBe(true);
    expect(result.positions).toEqual({ f1: { x: 0, y: 0 } });
    expect(result.positions.gone).toBeUndefined();
  });

  it('preserves local drag when prop baseline is unchanged', () => {
    const prev: PositionMap = { f1: { x: 100, y: 100 } };
    const baselines: PositionMap = { f1: { x: 0, y: 0 } };
    const result = reconcilePositions(
      prev,
      [{ id: 'f1', position: { x: 0, y: 0 } }],
      baselines,
    );
    expect(result.changed).toBe(false);
    expect(result.positions).toBe(prev);
    expect(result.positions.f1).toEqual({ x: 100, y: 100 });
  });

  it('adopts frame.position when it differs from the prop baseline (undo/reset)', () => {
    const prev: PositionMap = { f1: { x: 100, y: 100 } };
    const baselines: PositionMap = { f1: { x: 0, y: 0 } };
    const result = reconcilePositions(
      prev,
      [{ id: 'f1', position: { x: 50, y: 60 } }],
      baselines,
    );
    expect(result.changed).toBe(true);
    expect(result.positions.f1).toEqual({ x: 50, y: 60 });
    expect(result.propBaselines.f1).toEqual({ x: 50, y: 60 });
  });

  it('adopts parent-persisted drag coordinates and updates baseline', () => {
    const prev: PositionMap = { f1: { x: 100, y: 100 } };
    const baselines: PositionMap = { f1: { x: 0, y: 0 } };
    const result = reconcilePositions(
      prev,
      [{ id: 'f1', position: { x: 100, y: 100 } }],
      baselines,
    );
    // Positions equal to prev → may still mark changed only if values differ;
    // coordinates match so changed is false, but baselines advance.
    expect(result.positions.f1).toEqual({ x: 100, y: 100 });
    expect(result.propBaselines.f1).toEqual({ x: 100, y: 100 });
  });

  it('forceResync re-seeds every id from frame.position', () => {
    const prev: PositionMap = { f1: { x: 100, y: 100 } };
    const baselines: PositionMap = { f1: { x: 100, y: 100 } };
    const result = reconcilePositions(
      prev,
      [{ id: 'f1', position: { x: 100, y: 100 } }],
      baselines,
      true,
    );
    expect(result.changed).toBe(true);
    expect(result.positions.f1).toEqual({ x: 100, y: 100 });
  });

  it('forceResync resets dragged coords back to the prop value', () => {
    const prev: PositionMap = { f1: { x: 999, y: 999 } };
    const baselines: PositionMap = { f1: { x: 0, y: 0 } };
    const result = reconcilePositions(
      prev,
      [{ id: 'f1', position: { x: 0, y: 0 } }],
      baselines,
      true,
    );
    expect(result.changed).toBe(true);
    expect(result.positions.f1).toEqual({ x: 0, y: 0 });
  });

  it('seeds non-finite frame.position as {x:0,y:0}', () => {
    const result = reconcilePositions(
      {},
      [{ id: 'poison', position: { x: Number.NaN, y: 10 } }],
      {},
    );
    expect(result.positions.poison).toEqual({ x: 0, y: 0 });
    expect(result.propBaselines.poison).toEqual({ x: 0, y: 0 });
  });

  it('adopts {x:0,y:0} when parent pushes Infinity coordinates', () => {
    const prev: PositionMap = { f1: { x: 10, y: 10 } };
    const baselines: PositionMap = { f1: { x: 10, y: 10 } };
    const result = reconcilePositions(
      prev,
      [{ id: 'f1', position: { x: Number.POSITIVE_INFINITY, y: 0 } }],
      baselines,
    );
    expect(result.positions.f1).toEqual({ x: 0, y: 0 });
  });
});

describe('ensureFinitePosition', () => {
  it('returns a copy of finite coordinates', () => {
    expect(ensureFinitePosition({ x: -12, y: 34 })).toEqual({ x: -12, y: 34 });
  });

  it('falls back to origin for NaN', () => {
    expect(ensureFinitePosition({ x: Number.NaN, y: 1 })).toEqual({ x: 0, y: 0 });
  });

  it('falls back to origin for Infinity', () => {
    expect(ensureFinitePosition({ x: 1, y: Number.NEGATIVE_INFINITY })).toEqual({
      x: 0,
      y: 0,
    });
  });

  it('falls back to origin for null/undefined', () => {
    expect(ensureFinitePosition(null)).toEqual({ x: 0, y: 0 });
    expect(ensureFinitePosition(undefined)).toEqual({ x: 0, y: 0 });
  });
});

describe('ensureFiniteSize', () => {
  it('returns a copy of finite dimensions', () => {
    expect(ensureFiniteSize({ width: 220, height: 140 })).toEqual({
      width: 220,
      height: 140,
    });
  });

  it('falls back to DEFAULT_FRAME_SIZE for NaN', () => {
    expect(ensureFiniteSize({ width: Number.NaN, height: 140 })).toEqual(
      DEFAULT_FRAME_SIZE,
    );
  });

  it('falls back to DEFAULT_FRAME_SIZE for Infinity', () => {
    expect(
      ensureFiniteSize({ width: 220, height: Number.POSITIVE_INFINITY }),
    ).toEqual(DEFAULT_FRAME_SIZE);
  });

  it('falls back to DEFAULT_FRAME_SIZE for null/undefined', () => {
    expect(ensureFiniteSize(null)).toEqual(DEFAULT_FRAME_SIZE);
    expect(ensureFiniteSize(undefined)).toEqual(DEFAULT_FRAME_SIZE);
  });
});

describe('shouldAutoFit', () => {
  it('returns false when autoFit is disabled', () => {
    expect(
      shouldAutoFit({
        autoFit: false,
        hasFitted: false,
        containerWidth: 800,
        containerHeight: 600,
        frameCount: 3,
      }),
    ).toBe(false);
  });

  it('returns false when the one-shot guard has already fired', () => {
    expect(
      shouldAutoFit({
        autoFit: true,
        hasFitted: true,
        containerWidth: 800,
        containerHeight: 600,
        frameCount: 3,
      }),
    ).toBe(false);
  });

  it('returns false when the container is not yet measured', () => {
    expect(
      shouldAutoFit({
        autoFit: true,
        hasFitted: false,
        containerWidth: 0,
        containerHeight: 600,
        frameCount: 3,
      }),
    ).toBe(false);
  });

  it('returns false when frames are still empty (do not consume the one-shot)', () => {
    expect(
      shouldAutoFit({
        autoFit: true,
        hasFitted: false,
        containerWidth: 800,
        containerHeight: 600,
        frameCount: 0,
      }),
    ).toBe(false);
  });

  it('returns true on first ready measure with frames present', () => {
    expect(
      shouldAutoFit({
        autoFit: true,
        hasFitted: false,
        containerWidth: 800,
        containerHeight: 600,
        frameCount: 2,
      }),
    ).toBe(true);
  });
});
