// ─── Cinematic Domain — Frame Signals (Canvas Badges) ────────────────────────

import type { StoryboardFrame } from './schema';
import { getCinematicBeatStatus } from './beatStatus';

export interface CinematicFrameBadge {
  text: string;
  color: string;
}

// ─── Badge colors ─────────────────────────────────────────────────────────────

const STATUS_COLORS: Record<string, string> = {
  ready: '#22C55E',
  partial: '#F97316',
  draft: '#6B7280',
  blocked: '#EF4444',
};

const STATUS_LABELS: Record<string, string> = {
  ready: 'SPEC',
  partial: 'PARTIAL',
  draft: 'DRAFT',
  blocked: 'BLOCKED',
};

// ─── Signal functions ─────────────────────────────────────────────────────────

function isNonEmpty(value: unknown): boolean {
  if (value === undefined || value === null || value === '') return false;
  if (Array.isArray(value)) return value.length > 0;
  return true;
}

export function getCinematicFrameBadges(frame: StoryboardFrame): CinematicFrameBadge[] {
  const badges: CinematicFrameBadge[] = [];
  // Untrusted load paths can hand us a frame with null/missing content —
  // normalize to an empty spec instead of throwing (DM-002).
  const content = (frame.content ?? {}) as StoryboardFrame['content'];

  // Camera badge — frame has camera language defined
  if (isNonEmpty(content.cameraAngle) || isNonEmpty(content.cameraMovement) || isNonEmpty(content.framing)) {
    badges.push({ text: 'CAM', color: '#3B82F6' });
  }

  // VFX badge
  if (isNonEmpty(content.vfxRequirements)) {
    badges.push({ text: 'VFX', color: '#A855F7' });
  }

  // Audio badge
  if (isNonEmpty(content.audioRequirements)) {
    badges.push({ text: 'SFX', color: '#06B6D4' });
  }

  // Readiness badge
  const status = getCinematicBeatStatus(frame);
  badges.push({
    text: STATUS_LABELS[status.level],
    color: STATUS_COLORS[status.level],
  });

  return badges;
}

export interface CinematicFrameSignal {
  cameraSummary: string | null;
  durationEstimate: string | null;
  hasVfx: boolean;
  hasAudio: boolean;
  hasContinuity: boolean;
  readiness: string;
}

export function getCinematicFrameSignal(frame: StoryboardFrame): CinematicFrameSignal {
  // Normalize null/missing content to an empty spec (DM-002).
  const content = (frame.content ?? {}) as StoryboardFrame['content'];
  const parts: string[] = [];
  if (content.cameraAngle) parts.push(content.cameraAngle);
  if (content.cameraMovement) parts.push(content.cameraMovement);
  if (content.framing) parts.push(content.framing);

  return {
    cameraSummary: parts.length > 0 ? parts.join(' · ') : null,
    durationEstimate: content.durationEstimate ?? null,
    hasVfx: isNonEmpty(content.vfxRequirements),
    hasAudio: isNonEmpty(content.audioRequirements),
    hasContinuity: isNonEmpty(content.continuityRequirements),
    readiness: getCinematicBeatStatus(frame).level,
  };
}
