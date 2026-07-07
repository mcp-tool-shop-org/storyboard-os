// ─── Cinematic Domain — Validation ───────────────────────────────────────────
//
// Cinematic domain validation. Runs the generic structural check from
// @storyboard-os/core and adds cinematic-specific invariants:
//
//   • shot frames must have a visualDescription
//   • camera_move frames must have a cameraMovement
//   • action frames must have actionNotes
//   • dialogue frames must have dialogue lines
//   • transition frames must have editNotes
//   • vfx frames must have vfxRequirements
//   • audio frames must have audioRequirements
//   • edit_beat frames must have a durationEstimate
//
// Returns the shared `StoryboardValidationError` shape from @storyboard-os/core
// so consumers can pattern-match by `code` across all three verticals.
//
// ─────────────────────────────────────────────────────────────────────────────

import {
  validateStoryboard,
  type StoryboardValidationError,
  type StoryboardValidationResult,
} from '@storyboard-os/core';
import type { Storyboard, StoryboardFrame, CinematicFrameType } from './schema';

export type { StoryboardValidationError, StoryboardValidationResult };
export { validateStoryboard };

// ─── Type-specific required fields ───────────────────────────────────────────

interface RequiredFieldRule {
  field: keyof StoryboardFrame['content'];
  code: string;
}

const TYPE_REQUIRED_FIELDS: Record<CinematicFrameType, RequiredFieldRule[]> = {
  sequence:    [],
  shot:        [{ field: 'visualDescription', code: 'CINEMATIC_SHOT_MISSING_VISUAL_DESCRIPTION' }],
  camera_move: [{ field: 'cameraMovement',    code: 'CINEMATIC_CAMERA_MOVE_MISSING_MOVEMENT' }],
  action:      [{ field: 'actionNotes',       code: 'CINEMATIC_ACTION_MISSING_NOTES' }],
  dialogue:    [{ field: 'dialogue',          code: 'CINEMATIC_DIALOGUE_MISSING_LINES' }],
  transition:  [{ field: 'editNotes',         code: 'CINEMATIC_TRANSITION_MISSING_EDIT_NOTES' }],
  vfx:         [{ field: 'vfxRequirements',   code: 'CINEMATIC_VFX_MISSING_REQUIREMENTS' }],
  audio:       [{ field: 'audioRequirements', code: 'CINEMATIC_AUDIO_MISSING_REQUIREMENTS' }],
  edit_beat:   [{ field: 'durationEstimate',  code: 'CINEMATIC_EDIT_BEAT_MISSING_DURATION' }],
};

function isNonEmpty(value: unknown): boolean {
  if (value === undefined || value === null || value === '') return false;
  if (Array.isArray(value)) return value.length > 0;
  return true;
}

// ─── Validate ─────────────────────────────────────────────────────────────────

export function validateCinematicStoryboard(
  storyboard: Storyboard,
): StoryboardValidationResult {
  // Run generic structural validation first.
  const base = validateStoryboard(storyboard);
  const errors: StoryboardValidationError[] = [...base.errors];

  // Domain-specific structural validation depends on `storyboard.frames` being
  // a proper array. If the structural validator already rejected the shape,
  // skip the domain pass to avoid a TypeError.
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
        code: 'CINEMATIC_MISSING_CONTENT',
        message: `Frame "${frameId ?? '(unknown id)'}" has null or non-object content.`,
        frameId,
      });
      continue;
    }

    const required = TYPE_REQUIRED_FIELDS[frame.type];
    if (!required) continue;
    for (const { field, code } of required) {
      if (!isNonEmpty(frame.content[field])) {
        errors.push({
          code,
          message: `${frame.type} frame "${frame.id}" missing required field: ${field}`,
          frameId: frame.id,
        });
      }
    }
  }

  return { valid: errors.length === 0, errors };
}
