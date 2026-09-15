// ─── Cinematic Domain — Production Signals (0C) ──────────────────────────────
//
// Answers: "What makes this sequence hard to shoot, animate, edit, or hand off?"
//
// Computes continuity risk, VFX/audio burden, camera complexity, duration rollup,
// blocked shots, and an overall production health level.
//
// ─────────────────────────────────────────────────────────────────────────────

import type { Storyboard, StoryboardFrame, StoryboardConnection, CinematicShotSize } from './schema';
import { CINEMATIC_CAMERA_MOVES } from './schema';
import { getCinematicBeatStatus } from './beatStatus';

// ─── Types ────────────────────────────────────────────────────────────────────

export interface ContinuityRisk {
  frameId: string;
  frameTitle: string;
  requirements: string[];
  linkedFrameIds: string[];
}

export interface VfxBurdenSummary {
  totalFramesWithVfx: number;
  totalRequirements: number;
  shots: Array<{ frameId: string; frameTitle: string; items: string[] }>;
}

export interface AudioBurdenSummary {
  totalFramesWithAudio: number;
  totalRequirements: number;
  shots: Array<{ frameId: string; frameTitle: string; items: string[] }>;
}

export interface CameraComplexityShot {
  frameId: string;
  frameTitle: string;
  /** Structured Sequencer move token. */
  movement: string;
  shotSize?: CinematicShotSize;
  angle?: string;
  framing?: string;
}

export interface CameraComplexitySummary {
  totalComplexShots: number;
  /** Explicit static / none / locked-off language only — not missing or unknown. */
  totalStaticShots: number;
  /** Missing or empty cameraMovement. */
  totalUnspecifiedShots: number;
  /** Non-empty free text that is neither static nor a known complex token. */
  totalUnknownShots: number;
  /** Sample strings for unclassified camera copy (panel / pressure). */
  unknownMovementSamples: string[];
  complexShots: CameraComplexityShot[];
}

export interface DurationRollup {
  estimatedLowSeconds: number;
  estimatedHighSeconds: number;
  formatted: string;
  coveredFrames: number;
  /** Empty / whitespace durationEstimate only — not unparsable non-empty values. */
  uncoveredFrames: number;
  /** Non-empty estimates that did not parse after broadening. */
  unparsableSamples: string[];
}

export interface BlockedShot {
  frameId: string;
  frameTitle: string;
  reasons: string[];
}

export type SequenceHealthLevel = 'green' | 'yellow' | 'red';

export interface ProductionSignals {
  health: SequenceHealthLevel;
  healthReason: string;
  continuityRisks: ContinuityRisk[];
  vfxBurden: VfxBurdenSummary;
  audioBurden: AudioBurdenSummary;
  cameraComplexity: CameraComplexitySummary;
  durationRollup: DurationRollup;
  blockedShots: BlockedShot[];
  pressureSummary: string[];
}

// ─── Duration parsing (shared with handoff) ───────────────────────────────────
//
// Accepts: "3s", "3-5s", "3 seconds", "3 sec", bare "90", "1:30" (m:ss).

/**
 * Parse a free-text duration estimate into a [low, high] second range.
 * Returns null when empty or unparsable.
 */
export function parseDurationRange(est: string | undefined): [number, number] | null {
  if (!est) return null;
  const raw = est.trim();
  if (!raw) return null;

  // m:ss or mm:ss (optionally ranged "1:00-1:30")
  const clockRange = raw.match(
    /^(\d{1,2}):([0-5]\d)(?:\s*-\s*(\d{1,2}):([0-5]\d))?$/,
  );
  if (clockRange) {
    const low = parseInt(clockRange[1], 10) * 60 + parseInt(clockRange[2], 10);
    const high = clockRange[3]
      ? parseInt(clockRange[3], 10) * 60 + parseInt(clockRange[4], 10)
      : low;
    return [low, high];
  }

  // "3s", "3-5s", "3 seconds", "3-5 sec", "3 second"
  const unitRange = raw.match(
    /^(\d+(?:\.\d+)?)\s*(?:-\s*(\d+(?:\.\d+)?))?\s*(?:seconds?|secs?|s)\b/i,
  );
  if (unitRange) {
    const low = parseFloat(unitRange[1]);
    const high = unitRange[2] ? parseFloat(unitRange[2]) : low;
    return [low, high];
  }

  // Bare number → seconds
  const bare = raw.match(/^(\d+(?:\.\d+)?)$/);
  if (bare) {
    const n = parseFloat(bare[1]);
    return [n, n];
  }

  return null;
}

/** Mid-point seconds for a duration estimate, or null if unparsable. */
export function parseDurationSeconds(est: string | undefined): number | null {
  const range = parseDurationRange(est);
  if (!range) return null;
  return (range[0] + range[1]) / 2;
}

function formatDuration(low: number, high: number): string {
  if (low === high) return `${low}s`;
  return `${low}–${high}s`;
}

// ─── Signal Computations ──────────────────────────────────────────────────────

function computeContinuityRisks(storyboard: Storyboard): ContinuityRisk[] {
  const risks: ContinuityRisk[] = [];

  // Build map of continuity connections for each frame
  const continuityLinks = new Map<string, Set<string>>();
  for (const conn of storyboard.connections) {
    if (conn.type === 'continuity') {
      if (!continuityLinks.has(conn.fromFrameId)) continuityLinks.set(conn.fromFrameId, new Set());
      if (!continuityLinks.has(conn.toFrameId)) continuityLinks.set(conn.toFrameId, new Set());
      continuityLinks.get(conn.fromFrameId)!.add(conn.toFrameId);
      continuityLinks.get(conn.toFrameId)!.add(conn.fromFrameId);
    }
  }

  for (const frame of storyboard.frames) {
    // `?.` guards frames whose content is null/missing (DM-002).
    const reqs = frame.content?.continuityRequirements;
    const links = continuityLinks.get(frame.id);
    if ((reqs && reqs.length > 0) || links) {
      risks.push({
        frameId: frame.id,
        frameTitle: frame.title,
        requirements: reqs ?? [],
        linkedFrameIds: links ? Array.from(links) : [],
      });
    }
  }

  return risks;
}

function computeVfxBurden(storyboard: Storyboard): VfxBurdenSummary {
  const shots: VfxBurdenSummary['shots'] = [];
  let totalReqs = 0;

  for (const frame of storyboard.frames) {
    const vfx = frame.content?.vfxRequirements;
    if (vfx && vfx.length > 0) {
      shots.push({ frameId: frame.id, frameTitle: frame.title, items: vfx });
      totalReqs += vfx.length;
    }
  }

  return { totalFramesWithVfx: shots.length, totalRequirements: totalReqs, shots };
}

function computeAudioBurden(storyboard: Storyboard): AudioBurdenSummary {
  const shots: AudioBurdenSummary['shots'] = [];
  let totalReqs = 0;

  for (const frame of storyboard.frames) {
    const audio = frame.content?.audioRequirements;
    if (audio && audio.length > 0) {
      shots.push({ frameId: frame.id, frameTitle: frame.title, items: audio });
      totalReqs += audio.length;
    }
  }

  return { totalFramesWithAudio: shots.length, totalRequirements: totalReqs, shots };
}

/** `arc` is the orbit/arc shot. Accept `orbit` as the same moving-camera token. */
const MOVING_MOVES = new Set<string>(
  CINEMATIC_CAMERA_MOVES.filter(m => m !== 'static').concat(['orbit']),
);

type CameraMovementKind = 'complex' | 'static' | 'unspecified' | 'unknown';

/**
 * Classify from structured `move`, not regex-on-prose `cameraMovement`.
 * `orbit` aliases `arc`. Invalid tokens are unknown, not static.
 */
export function classifyCameraMove(move: string | undefined): CameraMovementKind {
  if (!move || !move.trim()) return 'unspecified';
  const token = move.trim().toLowerCase();
  if (token === 'static') return 'static';
  if (MOVING_MOVES.has(token)) return 'complex';
  return 'unknown';
}

function computeCameraComplexity(storyboard: Storyboard): CameraComplexitySummary {
  const complexShots: CameraComplexityShot[] = [];
  let staticShots = 0;
  let unspecifiedShots = 0;
  let unknownShots = 0;
  const unknownMovementSamples: string[] = [];

  for (const frame of storyboard.frames) {
    const rawMove = frame.content?.move as string | undefined;
    const kind = classifyCameraMove(rawMove);
    if (kind === 'complex') {
      const movement = rawMove?.trim().toLowerCase() === 'orbit' ? 'arc' : String(rawMove);
      complexShots.push({
        frameId: frame.id,
        frameTitle: frame.title,
        movement,
        shotSize: frame.content?.shotSize,
        angle: frame.content?.cameraAngle,
        framing: frame.content?.framing,
      });
    } else if (kind === 'static') {
      staticShots++;
    } else if (kind === 'unspecified') {
      unspecifiedShots++;
    } else {
      unknownShots++;
      const sample = String(rawMove).trim();
      if (unknownMovementSamples.length < 5 && !unknownMovementSamples.includes(sample)) {
        unknownMovementSamples.push(sample);
      }
    }
  }

  return {
    totalComplexShots: complexShots.length,
    totalStaticShots: staticShots,
    totalUnspecifiedShots: unspecifiedShots,
    totalUnknownShots: unknownShots,
    unknownMovementSamples,
    complexShots,
  };
}

function computeDurationRollup(storyboard: Storyboard): DurationRollup {
  let totalLow = 0;
  let totalHigh = 0;
  let covered = 0;
  let uncovered = 0;
  const unparsableSamples: string[] = [];

  for (const frame of storyboard.frames) {
    const est = frame.content?.durationEstimate;
    const trimmed = typeof est === 'string' ? est.trim() : '';
    const range = parseDurationRange(est);
    if (range) {
      totalLow += range[0];
      totalHigh += range[1];
      covered++;
    } else if (!trimmed) {
      // Empty / whitespace only — truly missing. Unparsable non-empty values
      // (TBD, "a beat") must not inflate uncoveredFrames / "untimed" / missing copy.
      uncovered++;
    } else if (unparsableSamples.length < 5 && !unparsableSamples.includes(trimmed)) {
      unparsableSamples.push(trimmed);
    }
  }

  return {
    estimatedLowSeconds: totalLow,
    estimatedHighSeconds: totalHigh,
    formatted: totalLow > 0 ? formatDuration(totalLow, totalHigh) : 'Unknown',
    coveredFrames: covered,
    uncoveredFrames: uncovered,
    unparsableSamples,
  };
}

function computeBlockedShots(storyboard: Storyboard): BlockedShot[] {
  const blocked: BlockedShot[] = [];

  for (const frame of storyboard.frames) {
    const status = getCinematicBeatStatus(frame);
    if (status.level === 'blocked') {
      blocked.push({
        frameId: frame.id,
        frameTitle: frame.title,
        reasons: status.missingReasons,
      });
    }
  }

  return blocked;
}

// ─── Pressure Summary ─────────────────────────────────────────────────────────

function buildPressureSummary(
  signals: Omit<ProductionSignals, 'pressureSummary' | 'health' | 'healthReason'>,
  frameCount: number,
): string[] {
  const lines: string[] = [];

  if (frameCount === 0) {
    lines.push('Empty sequence — no shots to produce.');
    return lines;
  }

  if (signals.blockedShots.length > 0) {
    lines.push(`${signals.blockedShots.length} shot${signals.blockedShots.length > 1 ? 's' : ''} blocked — missing critical spec fields.`);
  }

  if (signals.continuityRisks.length > 0) {
    lines.push(`${signals.continuityRisks.length} shot${signals.continuityRisks.length > 1 ? 's' : ''} carry continuity risk — must match across cuts.`);
  }

  if (signals.vfxBurden.totalRequirements > 3) {
    lines.push(`High VFX burden: ${signals.vfxBurden.totalRequirements} requirements across ${signals.vfxBurden.totalFramesWithVfx} shots.`);
  } else if (signals.vfxBurden.totalFramesWithVfx > 0) {
    lines.push(`VFX in ${signals.vfxBurden.totalFramesWithVfx} shot${signals.vfxBurden.totalFramesWithVfx > 1 ? 's' : ''} (${signals.vfxBurden.totalRequirements} items).`);
  }

  if (signals.audioBurden.totalRequirements > 3) {
    lines.push(`Heavy audio: ${signals.audioBurden.totalRequirements} requirements across ${signals.audioBurden.totalFramesWithAudio} shots.`);
  } else if (signals.audioBurden.totalFramesWithAudio > 0) {
    lines.push(`Audio in ${signals.audioBurden.totalFramesWithAudio} shot${signals.audioBurden.totalFramesWithAudio > 1 ? 's' : ''} (${signals.audioBurden.totalRequirements} items).`);
  }

  const {
    totalComplexShots,
    totalStaticShots,
    totalUnspecifiedShots,
    totalUnknownShots,
  } = signals.cameraComplexity;
  const total = totalComplexShots + totalStaticShots + totalUnspecifiedShots + totalUnknownShots;
  if (total > 0 && totalComplexShots / total > 0.5) {
    lines.push(`Camera-heavy: ${totalComplexShots}/${total} shots have camera movement.`);
  }
  if (totalUnknownShots > 0) {
    lines.push(
      `${totalUnknownShots} shot${totalUnknownShots > 1 ? 's' : ''} with unclassified camera movement — review copy.`,
    );
  }

  if (signals.durationRollup.uncoveredFrames > 0) {
    lines.push(`${signals.durationRollup.uncoveredFrames} shot${signals.durationRollup.uncoveredFrames > 1 ? 's' : ''} missing duration estimate — timing risk.`);
  }
  if (signals.durationRollup.unparsableSamples.length > 0) {
    lines.push(
      `${signals.durationRollup.unparsableSamples.length} duration estimate${signals.durationRollup.unparsableSamples.length > 1 ? 's' : ''} could not be parsed (use Ns, N-Ms, N seconds, or m:ss).`,
    );
  }

  return lines;
}

// ─── Health Level ─────────────────────────────────────────────────────────────

function computeHealth(
  signals: Omit<ProductionSignals, 'health' | 'healthReason' | 'pressureSummary'>,
  frameCount: number,
): { health: SequenceHealthLevel; healthReason: string } {
  if (frameCount === 0) {
    return { health: 'yellow', healthReason: 'empty sequence' };
  }

  // Red: any blocked shots
  if (signals.blockedShots.length > 0) {
    return { health: 'red', healthReason: `${signals.blockedShots.length} blocked shot${signals.blockedShots.length > 1 ? 's' : ''}` };
  }

  // Yellow conditions
  const yellowReasons: string[] = [];

  if (signals.durationRollup.uncoveredFrames > 0) {
    yellowReasons.push('missing duration estimates');
  }
  if (signals.durationRollup.unparsableSamples.length > 0) {
    yellowReasons.push('unparsable duration estimates');
  }
  if (signals.continuityRisks.length > 2) {
    yellowReasons.push('high continuity risk');
  }
  if (signals.vfxBurden.totalRequirements > 5) {
    yellowReasons.push('heavy VFX');
  }

  if (yellowReasons.length > 0) {
    return { health: 'yellow', healthReason: yellowReasons.join(', ') };
  }

  return { health: 'green', healthReason: 'Production-ready' };
}

// ─── Main Entry Point ─────────────────────────────────────────────────────────

export function getSequenceProductionSignals(storyboard: Storyboard): ProductionSignals {
  const frameCount = storyboard.frames.length;
  const continuityRisks = computeContinuityRisks(storyboard);
  const vfxBurden = computeVfxBurden(storyboard);
  const audioBurden = computeAudioBurden(storyboard);
  const cameraComplexity = computeCameraComplexity(storyboard);
  const durationRollup = computeDurationRollup(storyboard);
  const blockedShots = computeBlockedShots(storyboard);

  const partial = { continuityRisks, vfxBurden, audioBurden, cameraComplexity, durationRollup, blockedShots };
  const { health, healthReason } = computeHealth(partial, frameCount);
  const pressureSummary = buildPressureSummary(partial, frameCount);

  return {
    health,
    healthReason,
    continuityRisks,
    vfxBurden,
    audioBurden,
    cameraComplexity,
    durationRollup,
    blockedShots,
    pressureSummary,
  };
}
