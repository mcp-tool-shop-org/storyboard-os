// ─── rpg-storyboard-domain / validate.ts ─────────────────────────────────────
//
// RPG domain validation. Runs the generic structural check from @storyboard-os/core
// and adds RPG-specific invariants:
//
//   • choice frames must have at least one stateChanges entry
//   • consequence frames must have at least one stateChanges entry
//   • reveal frames must have at least one entryCondition or stateChange
//   • no frame content may contain tabletop-drift terminology
//
// ─────────────────────────────────────────────────────────────────────────────

import {
  validateStoryboard,
  type StoryboardValidationError,
  type StoryboardValidationResult,
} from '@storyboard-os/core';
import type { Storyboard, FrameContent } from './schema';

export type { StoryboardValidationError, StoryboardValidationResult };
export { validateStoryboard };

// ─── Tabletop drift guard ─────────────────────────────────────────────────────

const TABLETOP_DRIFT_TERMS = [
  'gm notes',
  'prep session',
  'at the table',
  'tabletop',
  'campaign prep',
  'run a session',
] as const;

// ─── RPG domain validator ─────────────────────────────────────────────────────

export function validateRpgStoryboard(
  storyboard: Storyboard,
): StoryboardValidationResult {
  // Run generic structural validation first.
  const base = validateStoryboard(storyboard);
  const errors: StoryboardValidationError[] = [...base.errors];

  // Domain-specific structural validation depends on `storyboard.frames` being
  // a proper array. If the structural validator already rejected the shape,
  // skip the domain pass to avoid a TypeError. Mirrors the cinematic guard.
  if (!Array.isArray(storyboard?.frames)) {
    return { valid: errors.length === 0, errors };
  }

  for (const frame of storyboard.frames) {
    // Null/non-object frame elements are already reported by the structural
    // validator (INVALID_STORYBOARD_SHAPE) — skip them here.
    if (frame == null || typeof frame !== 'object' || Array.isArray(frame)) continue;

    // Null / missing / non-object content: structured error, never a throw (DM-003).
    const rawContent: unknown = frame.content;
    if (rawContent == null || typeof rawContent !== 'object' || Array.isArray(rawContent)) {
      const frameId = typeof frame.id === 'string' ? frame.id : undefined;
      errors.push({
        code: 'RPG_MISSING_CONTENT',
        message: `Frame "${frameId ?? '(unknown id)'}" has null or non-object content.`,
        frameId,
      });
      continue;
    }

    const content = rawContent as FrameContent;
    const contentStr = JSON.stringify(content).toLowerCase();

    // choice / consequence frames must carry stateChanges.
    if (frame.type === 'choice' || frame.type === 'consequence') {
      if (!content.stateChanges || content.stateChanges.length === 0) {
        errors.push({
          code: 'RPG_MISSING_STATE_CHANGES',
          message: `Frame "${frame.id}" (type: ${frame.type}) must have at least one stateChanges entry.`,
          frameId: frame.id,
        });
      }
    }

    // reveal frames must have at least one entry condition or state change.
    if (frame.type === 'reveal') {
      const hasEntry = (content.entryConditions?.length ?? 0) > 0;
      const hasState = (content.stateChanges?.length ?? 0) > 0;
      if (!hasEntry && !hasState) {
        errors.push({
          code: 'RPG_REVEAL_MISSING_CONDITIONS',
          message: `Reveal frame "${frame.id}" must have at least one entryCondition or stateChange.`,
          frameId: frame.id,
        });
      }
    }

    // Guard against tabletop-drift terminology.
    for (const term of TABLETOP_DRIFT_TERMS) {
      if (contentStr.includes(term)) {
        errors.push({
          code: 'RPG_TABLETOP_DRIFT',
          message: `Frame "${frame.id}" contains tabletop-drift term: "${term}".`,
          frameId: frame.id,
        });
      }
    }
  }

  return { valid: errors.length === 0, errors };
}
