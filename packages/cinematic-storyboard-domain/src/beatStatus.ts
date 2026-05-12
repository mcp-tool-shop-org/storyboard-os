// ─── Cinematic Domain — Beat Status ──────────────────────────────────────────
//
// Authoritative cinematic readiness model.
//
// The domain decides what "ready" means — not the app, not the canvas.
// getCinematicBeatStatus() encodes the domain rules for every cinematic
// frame type:
//   - shot         requires visualDescription
//   - camera_move  requires cameraMovement
//   - action       requires actionNotes
//   - dialogue     requires dialogue lines
//   - transition   requires editNotes
//   - vfx          requires vfxRequirements
//   - audio        requires audioRequirements
//   - edit_beat    requires durationEstimate
//   - all types    require a full implementation spec to reach 'ready'
//
// Threshold and blocked-logic parity with RPG/Marketing domains:
//   - 'blocked' if any type-required field is missing (regardless of spec score)
//   - 'draft'   if spec score is 0 AND no blocker
//   - 'ready'   if spec score >= 3 AND no blocker
//   - 'partial' otherwise
//
// ─────────────────────────────────────────────────────────────────────────────

import type { StoryboardFrame, CinematicFrameType, Storyboard } from './schema';

export type CinematicBeatStatusLevel = 'ready' | 'partial' | 'draft' | 'blocked';

export interface CinematicBeatStatus {
  level: CinematicBeatStatusLevel;
  /** Missing field/rule reasons (e.g. `no_visualDescription`, `no_spec`). */
  missingReasons: string[];
  /** Number of entries in `requiredAssets`. */
  assetCount: number;
  /** Number of shot-level production hints (camera + framing + duration). */
  shotCount: number;
  /** Number of entries in `implementationChecklist`. */
  checklistCount: number;
  /** Number of entries in `testCriteria`. */
  testCriteriaCount: number;
  /**
   * True if this frame type carries domain-specific blocking requirements
   * (any type except `sequence`).
   */
  hasDomainRequirements: boolean;
}

// ─── Type-specific blocking fields ──────────────────────────────────────────

const BLOCKING_FIELDS: Record<CinematicFrameType, (keyof StoryboardFrame['content'])[]> = {
  sequence: [],
  shot: ['visualDescription'],
  camera_move: ['cameraMovement'],
  action: ['actionNotes'],
  dialogue: ['dialogue'],
  transition: ['editNotes'],
  vfx: ['vfxRequirements'],
  audio: ['audioRequirements'],
  edit_beat: ['durationEstimate'],
};

// ─── Spec fields that contribute to readiness ────────────────────────────────

const SPEC_FIELDS: (keyof StoryboardFrame['content'])[] = [
  'intent',
  'visualDescription',
  'cameraAngle',
  'cameraMovement',
  'framing',
  'durationEstimate',
  'requiredAssets',
  'continuityRequirements',
  'implementationChecklist',
  'testCriteria',
];

// ─── Shot-level hint fields (cinematic analog of "checklist items") ──────────

const SHOT_HINT_FIELDS: (keyof StoryboardFrame['content'])[] = [
  'cameraAngle',
  'cameraMovement',
  'framing',
  'durationEstimate',
];

function isNonEmpty(value: unknown): boolean {
  if (value === undefined || value === null || value === '') return false;
  if (Array.isArray(value)) return value.length > 0;
  return true;
}

// ─── Per-frame beat status ───────────────────────────────────────────────────

/**
 * Level derivation rules (cinematic):
 *   - 'blocked' if any type-required field is missing
 *   - 'draft'   if spec score is 0 AND no blocker (including unknown frame
 *               types, which carry no domain requirements)
 *   - 'ready'   if spec score >= 3 AND no blocker
 *   - 'partial' otherwise
 *
 * Unknown frame types are tolerated defensively: BLOCKING_FIELDS lookup falls
 * back to an empty array (matches validate.ts behavior). The function never
 * throws on untrusted input.
 */
export function getCinematicBeatStatus(frame: StoryboardFrame): CinematicBeatStatus {
  const content = frame.content;
  const missingReasons: string[] = [];

  // Check type-specific blocking fields. Defensive fallback to [] keeps
  // unknown frame types from triggering a TypeError on the lookup —
  // mirrors the structural-shape guard in validate.ts.
  const blocking = BLOCKING_FIELDS[frame.type] ?? [];
  let hasBlocker = false;
  for (const field of blocking) {
    if (!isNonEmpty(content[field])) {
      hasBlocker = true;
      missingReasons.push(`no_${field}`);
    }
  }

  // Count spec depth
  const specScore = SPEC_FIELDS.filter(f => isNonEmpty(content[f])).length;

  // Side counts for parity with RPG/Marketing BeatStatus shape
  const assetCount        = content.requiredAssets?.length ?? 0;
  const checklistCount    = content.implementationChecklist?.length ?? 0;
  const testCriteriaCount = content.testCriteria?.length ?? 0;
  const shotCount         = SHOT_HINT_FIELDS.filter(f => isNonEmpty(content[f])).length;
  const hasDomainRequirements = blocking.length > 0;

  // Determine level
  //
  // Parity with RPG/Marketing:
  //   - any blocking field missing → 'blocked' (even on an otherwise empty frame)
  //   - spec score 0 AND no blocker → 'draft'
  //   - spec score ≥ 3 AND no blocker → 'ready'
  //   - else → 'partial'
  //
  // The previous threshold (>= 4) and the previous blocked rule
  // (hasBlocker && specScore > 0) diverged from the other verticals. An empty
  // frame with a missing type-required field used to come back 'draft'; it now
  // correctly comes back 'blocked'.
  let level: CinematicBeatStatusLevel;
  if (hasBlocker) {
    level = 'blocked';
  } else if (specScore === 0) {
    level = 'draft';
    missingReasons.push('no_spec');
  } else if (specScore >= 3) {
    level = 'ready';
  } else {
    level = 'partial';
  }

  return {
    level,
    missingReasons,
    assetCount,
    shotCount,
    checklistCount,
    testCriteriaCount,
    hasDomainRequirements,
  };
}

// ─── Storyboard-level readiness ──────────────────────────────────────────────

export interface CinematicReadinessSummary {
  total: number;
  ready: number;
  partial: number;
  draft: number;
  blocked: number;
  /** Fraction of frames at 'ready' level (0.0–1.0). */
  readyFraction: number;
  /** Per-frame status index, keyed by frame id. */
  byFrame: Map<string, CinematicBeatStatus>;
}

export function getSequenceReadiness(storyboard: Storyboard): CinematicReadinessSummary {
  const byFrame = new Map<string, CinematicBeatStatus>();
  let ready = 0, partial = 0, draft = 0, blocked = 0;

  for (const frame of storyboard.frames) {
    const status = getCinematicBeatStatus(frame);
    byFrame.set(frame.id, status);
    switch (status.level) {
      case 'ready':   ready++;   break;
      case 'partial': partial++; break;
      case 'draft':   draft++;   break;
      case 'blocked': blocked++; break;
    }
  }

  const total = storyboard.frames.length;
  return {
    total,
    ready,
    partial,
    draft,
    blocked,
    readyFraction: total > 0 ? ready / total : 0,
    byFrame,
  };
}
