// ─── Cinematic Domain — Production Signals (0C) ──────────────────────────────
//
// Answers: "What makes this sequence hard to shoot, animate, edit, or hand off?"
//
// Computes continuity risk, VFX/audio burden, camera complexity, duration rollup,
// blocked shots, and an overall production health level.
//
// ─────────────────────────────────────────────────────────────────────────────

import type { Storyboard, StoryboardFrame, StoryboardConnection } from './schema';
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
  movement: string;
  angle?: string;
  framing?: string;
}

export interface CameraComplexitySummary {
  totalComplexShots: number;
  totalStaticShots: number;
  complexShots: CameraComplexityShot[];
}

export interface DurationRollup {
  estimatedLowSeconds: number;
  estimatedHighSeconds: number;
  formatted: string;
  coveredFrames: number;
  uncoveredFrames: number;
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

// ─── Helpers ──────────────────────────────────────────────────────────────────

function parseDurationRange(est: string | undefined): [number, number] | null {
  if (!est) return null;
  const match = est.match(/(\d+)(?:\s*-\s*(\d+))?\s*s/i);
  if (!match) return null;
  const low = parseInt(match[1], 10);
  const high = match[2] ? parseInt(match[2], 10) : low;
  return [low, high];
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

function computeCameraComplexity(storyboard: Storyboard): CameraComplexitySummary {
  const complexShots: CameraComplexityShot[] = [];
  let staticShots = 0;

  for (const frame of storyboard.frames) {
    const movement = frame.content?.cameraMovement;
    if (movement) {
      complexShots.push({
        frameId: frame.id,
        frameTitle: frame.title,
        movement,
        angle: frame.content?.cameraAngle,
        framing: frame.content?.framing,
      });
    } else {
      staticShots++;
    }
  }

  return { totalComplexShots: complexShots.length, totalStaticShots: staticShots, complexShots };
}

function computeDurationRollup(storyboard: Storyboard): DurationRollup {
  let totalLow = 0;
  let totalHigh = 0;
  let covered = 0;
  let uncovered = 0;

  for (const frame of storyboard.frames) {
    const range = parseDurationRange(frame.content?.durationEstimate);
    if (range) {
      totalLow += range[0];
      totalHigh += range[1];
      covered++;
    } else {
      uncovered++;
    }
  }

  return {
    estimatedLowSeconds: totalLow,
    estimatedHighSeconds: totalHigh,
    formatted: totalLow > 0 ? formatDuration(totalLow, totalHigh) : 'Unknown',
    coveredFrames: covered,
    uncoveredFrames: uncovered,
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

function buildPressureSummary(signals: Omit<ProductionSignals, 'pressureSummary' | 'health' | 'healthReason'>): string[] {
  const lines: string[] = [];

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

  const { totalComplexShots, totalStaticShots } = signals.cameraComplexity;
  const total = totalComplexShots + totalStaticShots;
  if (total > 0 && totalComplexShots / total > 0.5) {
    lines.push(`Camera-heavy: ${totalComplexShots}/${total} shots have camera movement.`);
  }

  if (signals.durationRollup.uncoveredFrames > 0) {
    lines.push(`${signals.durationRollup.uncoveredFrames} shot${signals.durationRollup.uncoveredFrames > 1 ? 's' : ''} missing duration estimate — timing risk.`);
  }

  return lines;
}

// ─── Health Level ─────────────────────────────────────────────────────────────

function computeHealth(signals: Omit<ProductionSignals, 'health' | 'healthReason' | 'pressureSummary'>): { health: SequenceHealthLevel; healthReason: string } {
  // Red: any blocked shots
  if (signals.blockedShots.length > 0) {
    return { health: 'red', healthReason: `${signals.blockedShots.length} blocked shot${signals.blockedShots.length > 1 ? 's' : ''}` };
  }

  // Yellow conditions
  const yellowReasons: string[] = [];

  if (signals.durationRollup.uncoveredFrames > 0) {
    yellowReasons.push('missing duration estimates');
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
  const continuityRisks = computeContinuityRisks(storyboard);
  const vfxBurden = computeVfxBurden(storyboard);
  const audioBurden = computeAudioBurden(storyboard);
  const cameraComplexity = computeCameraComplexity(storyboard);
  const durationRollup = computeDurationRollup(storyboard);
  const blockedShots = computeBlockedShots(storyboard);

  const partial = { continuityRisks, vfxBurden, audioBurden, cameraComplexity, durationRollup, blockedShots };
  const { health, healthReason } = computeHealth(partial);
  const pressureSummary = buildPressureSummary(partial);

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
