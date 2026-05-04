// ─── storyboard-core / validate.ts ────────────────────────────────────────────
//
// Generic structural validator. Checks invariants that hold for any storyboard
// regardless of domain: duplicate IDs, broken connection references, missing
// required fields, invalid dimensions.
//
// Domain-specific validation rules belong in the domain package.
//
// ─────────────────────────────────────────────────────────────────────────────

import type { Storyboard, AnyStoryboardFrame } from './schema';

export interface StoryboardValidationError {
  code: string;
  message: string;
  frameId?: string;
  connectionId?: string;
}

export interface StoryboardValidationResult {
  valid: boolean;
  errors: StoryboardValidationError[];
}

const MIN_FRAME_DIMENSION = 40;

export function validateStoryboard(
  storyboard: Storyboard<AnyStoryboardFrame>,
): StoryboardValidationResult {
  const errors: StoryboardValidationError[] = [];

  if (storyboard.frames.length === 0) {
    errors.push({ code: 'EMPTY_STORYBOARD', message: 'Storyboard has no frames.' });
    return { valid: false, errors };
  }

  const seenIds = new Set<string>();
  const frameIds = new Set<string>();

  for (const frame of storyboard.frames) {
    if (seenIds.has(frame.id)) {
      errors.push({
        code: 'DUPLICATE_FRAME_ID',
        message: `Duplicate frame id: "${frame.id}".`,
        frameId: frame.id,
      });
    }
    seenIds.add(frame.id);
    frameIds.add(frame.id);

    if (!frame.title?.trim()) {
      errors.push({ code: 'MISSING_TITLE', message: 'Frame is missing a title.', frameId: frame.id });
    }

    if (!frame.type) {
      errors.push({ code: 'MISSING_TYPE', message: 'Frame is missing a type.', frameId: frame.id });
    }

    if (!frame.summary?.trim()) {
      errors.push({ code: 'MISSING_SUMMARY', message: 'Frame is missing a summary.', frameId: frame.id });
    }

    if (frame.size.width < MIN_FRAME_DIMENSION || frame.size.height < MIN_FRAME_DIMENSION) {
      errors.push({
        code: 'INVALID_DIMENSIONS',
        message: `Frame dimensions ${frame.size.width}x${frame.size.height} are below minimum ${MIN_FRAME_DIMENSION}px.`,
        frameId: frame.id,
      });
    }
  }

  for (const conn of storyboard.connections) {
    if (!frameIds.has(conn.fromFrameId)) {
      errors.push({
        code: 'BROKEN_CONNECTION_FROM',
        message: `Connection "${conn.id}" references unknown fromFrameId "${conn.fromFrameId}".`,
        connectionId: conn.id,
      });
    }
    if (!frameIds.has(conn.toFrameId)) {
      errors.push({
        code: 'BROKEN_CONNECTION_TO',
        message: `Connection "${conn.id}" references unknown toFrameId "${conn.toFrameId}".`,
        connectionId: conn.id,
      });
    }
  }

  return { valid: errors.length === 0, errors };
}
