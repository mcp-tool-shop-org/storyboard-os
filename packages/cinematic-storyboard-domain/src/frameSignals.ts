// ─── Cinematic Domain — Frame Signals (Canvas Badges) ────────────────────────

import type { StoryboardFrame } from './schema';
import { getCinematicBeatStatus } from './beatStatus';
import type { CinematicBeatStatusLevel } from './beatStatus';
import { statusColors, statusLabels } from '@storyboard-os/core';

export interface CinematicFrameBadge {
  text: string;
  color: string;
}

// ─── Cinematic badge colors ───────────────────────────────────────────────────
// The single source for cinematic badge colors. Shared readiness swatches come
// from core; the domain-specific production badges (CAM / VFX / SFX) live here,
// each reconciled to exactly ONE value — the value the card badge renders.
//   - VP-003: VFX is PURPLE #A855F7 (the card value). The legend/inspector that
//     drew VFX pink (#EC4899) was wrong; everyone now imports `cinematicColors.vfx`.
//   - `camera` and `audio` are reconciled to the card badge's hexes so a shot
//     card and the legend can never disagree.

export const cinematicColors = {
  camera:  '#3B82F6', // blue   — CAM badge (shared `state` hue, kept explicit here)
  vfx:     '#A855F7', // purple — VFX badge (VP-003: the CARD value, NOT pink #EC4899)
  sfx:     '#06B6D4', // cyan   — SFX / audio badge
  audio:   '#06B6D4', // alias of sfx — one reconciled value for audio
  ready:   statusColors.spec,
  partial: statusColors.partial,
  draft:   statusColors.draft,
  blocked: statusColors.blocked,
} as const;

// Readiness level → color/label, sourced from the shared token layer so the
// cinematic readiness badge matches rpg + marketing exactly (VP-005).
const STATUS_COLORS: Record<CinematicBeatStatusLevel, string> = {
  ready:   cinematicColors.ready,
  partial: cinematicColors.partial,
  draft:   cinematicColors.draft,
  blocked: cinematicColors.blocked,
};

const STATUS_LABELS: Record<CinematicBeatStatusLevel, string> = {
  ready:   statusLabels.ready,   // 'SPEC'
  partial: statusLabels.partial, // 'PARTIAL'
  draft:   statusLabels.draft,   // 'DRAFT'
  blocked: statusLabels.blocked, // 'BLOCKED'
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
    badges.push({ text: 'CAM', color: cinematicColors.camera });
  }

  // VFX badge (purple — VP-003; the legend must import cinematicColors.vfx too)
  if (isNonEmpty(content.vfxRequirements)) {
    badges.push({ text: 'VFX', color: cinematicColors.vfx });
  }

  // Audio badge
  if (isNonEmpty(content.audioRequirements)) {
    badges.push({ text: 'SFX', color: cinematicColors.sfx });
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
