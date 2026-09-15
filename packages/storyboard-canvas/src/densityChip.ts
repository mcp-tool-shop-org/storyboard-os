// ─── storyboard-canvas / densityChip.ts ───────────────────────────────────────
//
// Level chip for StoryboardCanvas. Caps match @storyboard-os/core
// DENSITY_SOFT_CAP / DENSITY_HARD_CAP (Yoghourdjian). The chip is chrome only:
// it must not auto-hide edges, nest, or filter the graph.
//
// ─────────────────────────────────────────────────────────────────────────────

/** Warn when visible node count reaches this. Keep in lockstep with core. */
export const CANVAS_DENSITY_SOFT_CAP = 50;

/** Over when visible node count reaches this. Keep in lockstep with core. */
export const CANVAS_DENSITY_HARD_CAP = 100;

export type CanvasDensityLevel = 'ok' | 'warn' | 'over';

export function canvasDensityLevel(frameCount: number): CanvasDensityLevel {
  const n = typeof frameCount === 'number' && Number.isFinite(frameCount) ? frameCount : 0;
  if (n >= CANVAS_DENSITY_HARD_CAP) return 'over';
  if (n >= CANVAS_DENSITY_SOFT_CAP) return 'warn';
  return 'ok';
}

export function densityChipLabel(
  level: CanvasDensityLevel,
  frameCount: number,
  connectionCount: number,
): string {
  return `Density ${level} · ${frameCount} frames · ${connectionCount} edges`;
}
