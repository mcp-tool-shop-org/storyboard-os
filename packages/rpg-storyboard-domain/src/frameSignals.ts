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
import type { StoryboardConnection } from '@storyboard-os/core';

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

function computeReadiness(content: FrameContent): FrameReadiness {
  const score = [
    (content.implementationChecklist?.length ?? 0) > 0,
    (content.requiredAssets?.length ?? 0) > 0,
    (content.testCriteria?.length ?? 0) > 0,
    !!content.designerNotes,
  ].filter(Boolean).length;

  if (score >= 3) return 'ready';
  if (score >= 1) return 'partial';
  return 'incomplete';
}

// ─── Public API ───────────────────────────────────────────────────────────────

/**
 * Extract a FrameSignal from an RPG frame.
 *
 * The signal summarizes what a canvas renderer or hover preview needs to know
 * about the frame's game-state footprint and implementation completeness —
 * without exposing the full FrameContent to the canvas.
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

  return {
    stateChangeSummary,
    branchConditionSummary,
    readiness: computeReadiness(content),
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
 * - A readiness badge: SPEC (green), PARTIAL (orange), or DRAFT (gray).
 *
 * The caller (app adapter) maps these to CanvasBadge[] before passing to
 * the canvas package. The canvas never sees FrameContent.
 */
export function getFrameBadges(frame: StoryboardFrame): FrameBadgeDescriptor[] {
  const signal = getFrameSignal(frame);
  const badges: FrameBadgeDescriptor[] = [];

  if (signal.isStateful) {
    badges.push({ text: 'STATE', color: '#3B82F6' });
  }

  switch (signal.readiness) {
    case 'ready':
      badges.push({ text: 'SPEC', color: '#22C55E' });
      break;
    case 'partial':
      badges.push({ text: 'PARTIAL', color: '#F97316' });
      break;
    case 'incomplete':
      badges.push({ text: 'DRAFT', color: '#6B7280' });
      break;
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
