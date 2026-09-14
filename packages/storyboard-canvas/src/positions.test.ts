import { describe, it, expect } from 'vitest';
import { reconcilePositions, shouldAutoFit } from './positions';
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
