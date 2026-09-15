// ─── storyboard-core / density.ts ─────────────────────────────────────────────
//
// Yoghourdjian et al. 2020 (arXiv:2008.07944): path-finding on node-link
// diagrams becomes hard past ~50 nodes at higher density and ~100 even at low
// density. This module measures; it does not hide edges, nest, or filter.
//
// ─────────────────────────────────────────────────────────────────────────────

/** Warn when visible node count reaches this (Yoghourdjian higher-density cliff). */
export const DENSITY_SOFT_CAP = 50;

/** Over when visible node count reaches this (Yoghourdjian low-density cliff). */
export const DENSITY_HARD_CAP = 100;

export type BoardDensityLevel = 'ok' | 'warn' | 'over';

export interface BoardDensity {
  frameCount: number;
  connectionCount: number;
  /** connections / frames; 0 when there are no frames. */
  edgeRatio: number;
  level: BoardDensityLevel;
}

export interface BoardDensityInput {
  frames?: readonly unknown[] | null;
  connections?: readonly unknown[] | null;
}

function count(list: readonly unknown[] | null | undefined): number {
  return Array.isArray(list) ? list.length : 0;
}

/**
 * Pure density measure for a board's visible node/edge counts.
 * Caps are node counts (frames). Does not mutate or filter the graph.
 */
export function measureBoardDensity(input: BoardDensityInput): BoardDensity {
  const frameCount = count(input?.frames);
  const connectionCount = count(input?.connections);
  const edgeRatio = frameCount === 0 ? 0 : connectionCount / frameCount;
  let level: BoardDensityLevel = 'ok';
  if (frameCount >= DENSITY_HARD_CAP) {
    level = 'over';
  } else if (frameCount >= DENSITY_SOFT_CAP) {
    level = 'warn';
  }
  return { frameCount, connectionCount, edgeRatio, level };
}
