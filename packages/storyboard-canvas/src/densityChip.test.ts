import { describe, it, expect } from 'vitest';
import {
  CANVAS_DENSITY_SOFT_CAP,
  CANVAS_DENSITY_HARD_CAP,
  canvasDensityLevel,
  densityChipLabel,
} from './densityChip';

describe('canvasDensityLevel', () => {
  it('locks caps at 50 / 100', () => {
    expect(CANVAS_DENSITY_SOFT_CAP).toBe(50);
    expect(CANVAS_DENSITY_HARD_CAP).toBe(100);
  });

  it('is ok for empty and just-below-soft boards', () => {
    expect(canvasDensityLevel(0)).toBe('ok');
    expect(canvasDensityLevel(49)).toBe('ok');
  });

  it('warns at the soft cap and stays warn until the hard cap', () => {
    expect(canvasDensityLevel(50)).toBe('warn');
    expect(canvasDensityLevel(99)).toBe('warn');
  });

  it('is over at the hard cap', () => {
    expect(canvasDensityLevel(100)).toBe('over');
    expect(canvasDensityLevel(250)).toBe('over');
  });
});

describe('densityChipLabel', () => {
  it('names level plus visible counts', () => {
    expect(densityChipLabel('warn', 60, 12)).toBe(
      'Density warn · 60 frames · 12 edges',
    );
  });
});
