// ─── rpg-domain / frameSignals.ts ────────────────────────────────────────────
//
// Domain helpers that extract game-state and branch-logic signals from RPG
// frames for use in canvas badges, hover previews, and connection panels.
//
// These helpers live in the domain package (not in the canvas) because they
// understand RPG content fields. The canvas only sees the resulting badge
// descriptors — it never knows what stateChanges or entryConditions mean.
//
// ─────────────────────────────────────────────────────────────────────────────

import type { StoryboardFrame, FrameContent } from './schema';
import { statusColors, statusLabels } from '@storyboard-os/core';
import type { StoryboardConnection } from '@storyboard-os/core';
import { getBeatStatus } from './beatStatus';
import type { BeatStatusLevel } from './beatStatus';

// ─── RPG badge colors ─────────────────────────────────────────────────────────
// RPG has no domain-specific badge colors beyond the shared status set — the
// STATE badge is the shared `state` blue and the readiness badges are the shared
// spec/partial/draft/blocked swatches. `rpgColors` re-exports those under the
// domain's name so app legends/inspectors import the SAME const the badges are
// built from and can never drift from the card. Canvas readiness badges come
// from getBeatStatus (not computeReadiness alone) so a choice/consequence/reveal
// that fails domain rules shows BLOCKED, not a contradictory SPEC/PARTIAL.

export const rpgColors = {
  state:   statusColors.state,
  ready:   statusColors.spec,
  partial: statusColors.partial,
  draft:   statusColors.draft,
  blocked: statusColors.blocked,
} as const;

const RPG_STATUS_LABEL: Record<BeatStatusLevel, string> = {
  ready:   statusLabels.ready,   // 'SPEC'
  partial: statusLabels.partial, // 'PARTIAL'
  draft:   statusLabels.draft,   // 'DRAFT'
  blocked: statusLabels.blocked, // 'BLOCKED'
};

const RPG_STATUS_COLOR: Record<BeatStatusLevel, string> = {
  ready:   rpgColors.ready,
  partial: rpgColors.partial,
  draft:   rpgColors.draft,
  blocked: rpgColors.blocked,
};

// ─── Types ────────────────────────────────────────────────────────────────────

/** How complete a frame's implementation spec is. */
export type FrameReadiness = 'ready' | 'partial' | 'incomplete';

/**
 * Computed signals for one RPG frame. Summarizes game-state and
 * branch-logic so the canvas can display meaningful badges without
 * reading RPG content fields directly.
 */
export interface FrameSignal {
  /** One-line summary of what game-state this frame changes, or null if none. */
  stateChangeSummary: string | null;

  /** One-line summary of entry conditions required for this frame, or null. */
  branchConditionSummary: string | null;

  /** Implementation readiness of this frame's spec. */
  readiness: FrameReadiness;

  /** True if the frame has at least one testCriteria entry. */
  hasTestCoverage: boolean;

  /** True if the frame has at least one requiredAssets entry. */
  hasRequiredAssets: boolean;

  /** True if the frame has at least one implementationChecklist item. */
  hasImplementationChecklist: boolean;

  /** True if this frame modifies game state (has at least one stateChange). */
  isStateful: boolean;
}

/**
 * A small label chip descriptor for canvas rendering.
 * The canvas renders it; the domain generates it.
 */
export interface FrameBadgeDescriptor {
  /** Short uppercase label, e.g. "STATE", "SPEC", "DRAFT". */
  text: string;
  /** Hex color for the badge border and text. */
  color: string;
}

// ─── Internal helpers ─────────────────────────────────────────────────────────

/**
 * Map authoritative getBeatStatus levels onto the coarser FrameReadiness union.
 * Domain blockers (choice/consequence/reveal rules) must not report as 'ready'
 * just because the checklist/assets/tests score is high.
 */
function readinessFromBeatStatus(level: BeatStatusLevel): FrameReadiness {
  switch (level) {
    case 'ready':
      return 'ready';
    case 'partial':
      return 'partial';
    case 'draft':
    case 'blocked':
      return 'incomplete';
    default: {
      const _exhaustive: never = level;
      void _exhaustive;
      return 'incomplete';
    }
  }
}

// ─── Public API ───────────────────────────────────────────────────────────────

/**
 * Extract a FrameSignal from an RPG frame.
 *
 * The signal summarizes what a canvas renderer or hover preview needs to know
 * about the frame's game-state footprint and implementation completeness —
 * without exposing the full FrameContent to the canvas.
 *
 * `readiness` is derived from getBeatStatus (same authority as badges /
 * inspector), mapped onto the coarser FrameReadiness union
 * (blocked/draft → incomplete).
 */
export function getFrameSignal(frame: StoryboardFrame): FrameSignal {
  // Untrusted load paths can hand us a frame with null/missing content —
  // normalize to an empty spec instead of throwing (DM-002).
  const content = (frame.content ?? {}) as FrameContent;
  const stateChanges = content.stateChanges ?? [];
  const entryConditions = content.entryConditions ?? [];

  const isStateful = stateChanges.length > 0;

  let stateChangeSummary: string | null = null;
  if (stateChanges.length === 1) {
    stateChangeSummary = stateChanges[0];
  } else if (stateChanges.length > 1) {
    stateChangeSummary = `${stateChanges.length} state changes`;
  }

  let branchConditionSummary: string | null = null;
  if (entryConditions.length === 1) {
    branchConditionSummary = entryConditions[0];
  } else if (entryConditions.length > 1) {
    branchConditionSummary = `${entryConditions.length} entry conditions`;
  }

  const beatStatus = getBeatStatus(frame);

  return {
    stateChangeSummary,
    branchConditionSummary,
    readiness: readinessFromBeatStatus(beatStatus.level),
    hasTestCoverage: (content.testCriteria?.length ?? 0) > 0,
    hasRequiredAssets: (content.requiredAssets?.length ?? 0) > 0,
    hasImplementationChecklist: (content.implementationChecklist?.length ?? 0) > 0,
    isStateful,
  };
}

/**
 * Generate badge descriptors for a frame's canvas card.
 *
 * Returns:
 * - A STATE badge (blue) if the frame modifies game state.
 * - A readiness badge from getBeatStatus: SPEC / PARTIAL / DRAFT / BLOCKED.
 *   BLOCKED replaces SPEC/PARTIAL/DRAFT when domain rules fail (choice /
 *   consequence missing stateChanges, reveal missing entry/state).
 *
 * The caller (app adapter) maps these to CanvasBadge[] before passing to
 * the canvas package. The canvas never sees FrameContent.
 */
export function getFrameBadges(frame: StoryboardFrame): FrameBadgeDescriptor[] {
  const signal = getFrameSignal(frame);
  const badges: FrameBadgeDescriptor[] = [];

  if (signal.isStateful) {
    badges.push({ text: 'STATE', color: rpgColors.state });
  }

  // Authoritative readiness — same source as header counts + inspector.
  const status = getBeatStatus(frame);
  switch (status.level) {
    case 'ready':
    case 'partial':
    case 'draft':
    case 'blocked':
      badges.push({
        text: RPG_STATUS_LABEL[status.level],
        color: RPG_STATUS_COLOR[status.level],
      });
      break;
    default: {
      // Exhaustiveness guard (PR-003): if BeatStatusLevel grows a new arm, this
      // is a compile error. At runtime, warn and fall back to DRAFT rather than
      // silently dropping the badge (which would miscount readiness).
      const _exhaustive: never = status.level;
      console.warn('[rpg] unhandled BeatStatusLevel value:', _exhaustive);
      badges.push({ text: statusLabels.draft, color: rpgColors.draft });
      break;
    }
  }

  return badges;
}

/**
 * Count the outgoing (branching) connections from a specific frame.
 *
 * Useful for displaying branch counts on choice frames in the canvas or
 * connection panel without passing the entire storyboard down.
 */
export function getChoiceBranchCount(
  frameId: string,
  connections: StoryboardConnection[],
): number {
  return connections.filter(c => c.fromFrameId === frameId).length;
}
