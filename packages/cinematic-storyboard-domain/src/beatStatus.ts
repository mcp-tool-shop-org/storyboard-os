// ─── Cinematic Domain — Beat Status ──────────────────────────────────────────

import type { StoryboardFrame, CinematicFrameType, Storyboard } from './schema';

export type CinematicBeatStatusLevel = 'ready' | 'partial' | 'draft' | 'blocked';

export interface CinematicBeatStatus {
  level: CinematicBeatStatusLevel;
  missingReasons: string[];
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

function isNonEmpty(value: unknown): boolean {
  if (value === undefined || value === null || value === '') return false;
  if (Array.isArray(value)) return value.length > 0;
  return true;
}

// ─── Per-frame beat status ───────────────────────────────────────────────────

export function getCinematicBeatStatus(frame: StoryboardFrame): CinematicBeatStatus {
  const content = frame.content;
  const missingReasons: string[] = [];

  // Check type-specific blocking fields
  const blocking = BLOCKING_FIELDS[frame.type];
  let hasBlocker = false;
  for (const field of blocking) {
    if (!isNonEmpty(content[field])) {
      hasBlocker = true;
      missingReasons.push(`no_${field}`);
    }
  }

  // Count spec depth
  const specScore = SPEC_FIELDS.filter(f => isNonEmpty(content[f])).length;

  // Determine level
  if (hasBlocker && specScore > 0) {
    return { level: 'blocked', missingReasons };
  }
  if (specScore === 0) {
    return { level: 'draft', missingReasons: ['no_spec'] };
  }
  if (specScore >= 4) {
    return { level: 'ready', missingReasons };
  }
  return { level: 'partial', missingReasons };
}

// ─── Storyboard-level readiness ──────────────────────────────────────────────

export interface CinematicReadinessSummary {
  total: number;
  ready: number;
  partial: number;
  draft: number;
  blocked: number;
}

export function getSequenceReadiness(storyboard: Storyboard): CinematicReadinessSummary {
  const summary: CinematicReadinessSummary = { total: 0, ready: 0, partial: 0, draft: 0, blocked: 0 };
  for (const frame of storyboard.frames) {
    summary.total++;
    const status = getCinematicBeatStatus(frame);
    summary[status.level]++;
  }
  return summary;
}
