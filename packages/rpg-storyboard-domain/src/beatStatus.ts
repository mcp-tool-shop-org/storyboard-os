// ─── rpg-domain / beatStatus.ts ──────────────────────────────────────────────
//
// Authoritative RPG readiness model.
//
// The domain decides what "ready" means — not the app, not the canvas.
// getBeatStatus() encodes the domain rules for every RPG frame type:
//   - choice / consequence  require stateChanges
//   - reveal               requires entryConditions or stateChanges
//   - all types            require a full implementation spec to reach 'ready'
//
// getStoryboardReadiness() aggregates across a whole storyboard so the board
// header can display production-pass coverage at a glance.
//
// ─────────────────────────────────────────────────────────────────────────────

import type { StoryboardFrame, Storyboard, FrameContent } from './schema';

// ─── Types ────────────────────────────────────────────────────────────────────

/** Implementation status of a single RPG beat. */
export type BeatStatusLevel = 'ready' | 'partial' | 'draft' | 'blocked';

/**
 * A specific missing field or violated rule.
 *
 * Two categories:
 * - **Blocking** (`no_state_changes`, `no_entry_or_state_change`) — domain
 *   rule violations. The beat cannot function correctly without these.
 *   A frame with any blocker in `missing` will have level `'blocked'`.
 * - **Spec gaps** (`no_designer_notes`, `no_required_assets`, …) — missing
 *   implementation-spec fields. Removing all spec gaps produces level `'ready'`.
 * - **Advisory** (`no_stakes`, `no_possible_outcomes`) — good-to-have fields.
 *   Check `BLOCKING_REASONS` to classify a reason at runtime.
 */
export type MissingSpecReason =
  // ── Blocking: domain rule violations ──────────────────────────────────────
  | 'no_state_changes'           // required for choice / consequence frames
  | 'no_entry_or_state_change'   // required for reveal frames
  // ── Spec gaps: implementation completeness ────────────────────────────────
  | 'no_designer_notes'
  | 'no_required_assets'
  | 'no_test_criteria'
  | 'no_implementation_checklist'
  // ── Advisory: contextual depth ────────────────────────────────────────────
  | 'no_stakes'
  | 'no_possible_outcomes';

/**
 * The set of MissingSpecReasons that block a beat from being valid.
 * Use `BLOCKING_REASONS.has(reason)` to distinguish blockers from gaps.
 */
export const BLOCKING_REASONS: ReadonlySet<MissingSpecReason> = new Set<MissingSpecReason>([
  'no_state_changes',
  'no_entry_or_state_change',
]);

/**
 * Full implementation status for one RPG beat.
 */
export interface BeatStatus {
  /** Overall implementation status level. */
  level: BeatStatusLevel;

  /**
   * All missing fields / violated rules for this frame.
   * Filter by `BLOCKING_REASONS.has(r)` to separate domain violations
   * from spec completeness gaps.
   */
  missing: MissingSpecReason[];

  /** Number of entries in `requiredAssets`. */
  assetCount: number;

  /** Number of entries in `testCriteria`. */
  testCriteriaCount: number;

  /** Number of entries in `implementationChecklist`. */
  checklistCount: number;

  /**
   * True if this frame type carries domain-specific requirements
   * (choice / consequence / reveal). False for hook / scene / encounter / npc_beat.
   */
  hasDomainRequirements: boolean;
}

/**
 * Board-level readiness summary for display in the canvas header.
 */
export interface StoryboardReadinessSummary {
  total: number;
  ready: number;
  partial: number;
  draft: number;
  blocked: number;
  /** Fraction of frames at 'ready' level (0.0–1.0). */
  readyFraction: number;
  /** Per-frame status index, keyed by frame id. */
  byFrame: Map<string, BeatStatus>;
}

// ─── Domain rule helpers ──────────────────────────────────────────────────────

const STATE_REQUIRED_TYPES: ReadonlySet<string> = new Set(['choice', 'consequence']);
const REVEAL_TYPE = 'reveal';
const DOMAIN_REQUIREMENT_TYPES: ReadonlySet<string> = new Set([
  'choice', 'consequence', 'reveal',
]);

// ─── Internal scoring ─────────────────────────────────────────────────────────

function specScore(content: FrameContent): number {
  return [
    !!content.designerNotes,
    (content.requiredAssets?.length ?? 0) > 0,
    (content.testCriteria?.length ?? 0) > 0,
    (content.implementationChecklist?.length ?? 0) > 0,
  ].filter(Boolean).length;
}

// ─── Public API ───────────────────────────────────────────────────────────────

/**
 * Compute the implementation status of a single RPG frame.
 *
 * Level derivation (parity with marketing/cinematic, F-VR-206):
 * - `blocked` — has at least one domain rule violation (missing type-required
 *               field). Applies regardless of spec score, so an empty
 *               choice/consequence/reveal frame is `blocked`, not `draft`.
 * - `draft`   — spec score is 0 AND no blocker. An empty shell of a
 *               non-domain-required type (hook, scene, encounter, npc_beat).
 * - `ready`   — spec score ≥ 3, all domain requirements satisfied.
 * - `partial` — otherwise.
 *
 * Prior to Wave 6, empty domain-required frames returned `draft` rather than
 * `blocked` (the "empty shell" carve-out). That diverged from marketing and
 * cinematic, so the carve-out was removed: missing type-required fields now
 * blocks at score 0 too.
 */
export function getBeatStatus(frame: StoryboardFrame): BeatStatus {
  const content = frame.content as FrameContent;
  const missing: MissingSpecReason[] = [];

  // ── Domain rule checks ────────────────────────────────────────────────────

  if (STATE_REQUIRED_TYPES.has(frame.type)) {
    if ((content.stateChanges?.length ?? 0) === 0) {
      missing.push('no_state_changes');
    }
  }

  if (frame.type === REVEAL_TYPE) {
    const hasEntry = (content.entryConditions?.length ?? 0) > 0;
    const hasState = (content.stateChanges?.length ?? 0) > 0;
    if (!hasEntry && !hasState) {
      missing.push('no_entry_or_state_change');
    }
  }

  // ── Spec completeness checks ──────────────────────────────────────────────

  if (!content.designerNotes)                         missing.push('no_designer_notes');
  if ((content.requiredAssets?.length ?? 0) === 0)   missing.push('no_required_assets');
  if ((content.testCriteria?.length ?? 0) === 0)     missing.push('no_test_criteria');
  if ((content.implementationChecklist?.length ?? 0) === 0) missing.push('no_implementation_checklist');

  // ── Advisory checks ───────────────────────────────────────────────────────

  if (!content.stakes)                               missing.push('no_stakes');
  if ((content.possibleOutcomes?.length ?? 0) === 0) missing.push('no_possible_outcomes');

  // ── Level derivation ──────────────────────────────────────────────────────

  const score = specScore(content);
  const hasBlocker = missing.some(r => BLOCKING_REASONS.has(r));

  let level: BeatStatusLevel;

  if (hasBlocker) {
    // Has at least one domain rule violation — blocked regardless of spec
    // score. Parity with marketing + cinematic (Wave 6, F-VR-206).
    level = 'blocked';
  } else if (score === 0) {
    // Empty shell of a non-domain-required type (hook / scene / encounter /
    // npc_beat) — not even enough content to be in progress.
    level = 'draft';
  } else if (score >= 3) {
    level = 'ready';
  } else {
    level = 'partial';
  }

  return {
    level,
    missing,
    assetCount:       content.requiredAssets?.length ?? 0,
    testCriteriaCount: content.testCriteria?.length ?? 0,
    checklistCount:   content.implementationChecklist?.length ?? 0,
    hasDomainRequirements: DOMAIN_REQUIREMENT_TYPES.has(frame.type),
  };
}

/**
 * Aggregate readiness across all frames in a storyboard.
 *
 * Returns counts per level and a `byFrame` index for per-frame lookup
 * without re-running the full computation at render time.
 */
export function getStoryboardReadiness(storyboard: Storyboard): StoryboardReadinessSummary {
  const byFrame = new Map<string, BeatStatus>();
  let ready = 0, partial = 0, draft = 0, blocked = 0;

  for (const frame of storyboard.frames) {
    const status = getBeatStatus(frame);
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
    readyFraction: total === 0 ? 0 : ready / total,
    byFrame,
  };
}
