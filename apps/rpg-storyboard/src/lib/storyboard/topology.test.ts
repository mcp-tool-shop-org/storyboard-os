import { describe, it, expect } from 'vitest';
import { addBeatBlocked, densityBanner, topologyOpBanner } from './topology';
import type { BoardDensity } from '@storyboard-os/core';

function density(level: BoardDensity['level'], frameCount: number): BoardDensity {
  return { frameCount, connectionCount: 0, edgeRatio: 0, level };
}

describe('addBeatBlocked', () => {
  it('blocks only at over', () => {
    expect(addBeatBlocked(density('ok', 8))).toBe(false);
    expect(addBeatBlocked(density('warn', 50))).toBe(false);
    expect(addBeatBlocked(density('over', 100))).toBe(true);
  });
});

describe('densityBanner', () => {
  it('is silent below the soft cap', () => {
    expect(densityBanner(density('ok', 8))).toBeNull();
  });

  it('warns at the soft cap without blocking', () => {
    const banner = densityBanner(density('warn', 50));
    expect(banner?.tone).toBe('warn');
    expect(banner?.text).toMatch(/50/);
  });

  it('errors at the hard cap', () => {
    const banner = densityBanner(density('over', 100));
    expect(banner?.tone).toBe('error');
    expect(banner?.text).toMatch(/100/);
  });
});

describe('topologyOpBanner', () => {
  it('surfaces a failed mutator as an error', () => {
    expect(topologyOpBanner({ ok: false, message: 'A beat cannot connect to itself.' })).toEqual({
      text: 'A beat cannot connect to itself.',
      tone: 'error',
    });
  });

  it('surfaces a density warning from a successful add', () => {
    expect(topologyOpBanner({ ok: true, warning: 'Board density is high (50 frames).' })?.tone).toBe('warn');
  });

  it('is silent on a clean success', () => {
    expect(topologyOpBanner({ ok: true })).toBeNull();
  });
});
