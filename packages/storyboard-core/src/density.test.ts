import { describe, it, expect } from 'vitest';
import {
  DENSITY_SOFT_CAP,
  DENSITY_HARD_CAP,
  measureBoardDensity,
} from './density';

function nFrames(n: number): unknown[] {
  return Array.from({ length: n }, (_, i) => ({ id: `f${i}` }));
}

function nConnections(n: number): unknown[] {
  return Array.from({ length: n }, (_, i) => ({ id: `c${i}` }));
}

describe('density caps', () => {
  it('locks Yoghourdjian soft/hard caps at 50 and 100', () => {
    expect(DENSITY_SOFT_CAP).toBe(50);
    expect(DENSITY_HARD_CAP).toBe(100);
  });
});

describe('measureBoardDensity', () => {
  it('returns zeros and ok for an empty board', () => {
    expect(measureBoardDensity({ frames: [], connections: [] })).toEqual({
      frameCount: 0,
      connectionCount: 0,
      edgeRatio: 0,
      level: 'ok',
    });
  });

  it('treats missing arrays as empty', () => {
    expect(measureBoardDensity({})).toEqual({
      frameCount: 0,
      connectionCount: 0,
      edgeRatio: 0,
      level: 'ok',
    });
  });

  it('is ok just below the soft cap', () => {
    const result = measureBoardDensity({
      frames: nFrames(DENSITY_SOFT_CAP - 1),
      connections: nConnections(10),
    });
    expect(result.frameCount).toBe(49);
    expect(result.connectionCount).toBe(10);
    expect(result.edgeRatio).toBeCloseTo(10 / 49);
    expect(result.level).toBe('ok');
  });

  it('warns at the soft cap', () => {
    const result = measureBoardDensity({
      frames: nFrames(DENSITY_SOFT_CAP),
      connections: [],
    });
    expect(result.frameCount).toBe(50);
    expect(result.connectionCount).toBe(0);
    expect(result.edgeRatio).toBe(0);
    expect(result.level).toBe('warn');
  });

  it('stays warn just below the hard cap', () => {
    const result = measureBoardDensity({
      frames: nFrames(DENSITY_HARD_CAP - 1),
      connections: nConnections(1),
    });
    expect(result.level).toBe('warn');
    expect(result.frameCount).toBe(99);
  });

  it('is over at the hard cap', () => {
    const result = measureBoardDensity({
      frames: nFrames(DENSITY_HARD_CAP),
      connections: nConnections(200),
    });
    expect(result.frameCount).toBe(100);
    expect(result.connectionCount).toBe(200);
    expect(result.edgeRatio).toBe(2);
    expect(result.level).toBe('over');
  });
});
