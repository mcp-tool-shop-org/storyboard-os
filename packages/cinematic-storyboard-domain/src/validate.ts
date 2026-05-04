// ─── Cinematic Domain — Validation ───────────────────────────────────────────

import { validateStoryboard } from '@storyboard-os/core';
import type { Storyboard, StoryboardFrame, CinematicFrameType } from './schema';

export interface CinematicValidationResult {
  valid: boolean;
  errors: CinematicValidationError[];
}

export interface CinematicValidationError {
  frameId: string;
  reason: string;
}

// ─── Type-specific required fields ───────────────────────────────────────────

const TYPE_REQUIRED_FIELDS: Record<CinematicFrameType, (keyof StoryboardFrame['content'])[]> = {
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

function isNonEmpty(value: unknown): boolean {
  if (value === undefined || value === null || value === '') return false;
  if (Array.isArray(value)) return value.length > 0;
  return true;
}

// ─── Validate ─────────────────────────────────────────────────────────────────

export function validateCinematicStoryboard(storyboard: Storyboard): CinematicValidationResult {
  const coreResult = validateStoryboard(storyboard);
  const errors: CinematicValidationError[] = [];

  if (!coreResult.valid) {
    errors.push(...coreResult.errors.map(e => ({
      frameId: 'frameId' in e ? (e as { frameId: string }).frameId : '',
      reason: e.message,
    })));
  }

  for (const frame of storyboard.frames) {
    const required = TYPE_REQUIRED_FIELDS[frame.type];
    for (const field of required) {
      if (!isNonEmpty(frame.content[field])) {
        errors.push({
          frameId: frame.id,
          reason: `${frame.type} frame missing required field: ${field}`,
        });
      }
    }
  }

  return { valid: errors.length === 0, errors };
}
