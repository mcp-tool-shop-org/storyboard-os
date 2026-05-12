// ─── storyboard-core / validate.ts ────────────────────────────────────────────
//
// Generic structural validator. Checks invariants that hold for any storyboard
// regardless of domain: duplicate IDs, broken connection references, missing
// required fields, invalid dimensions.
//
// Domain-specific validation rules belong in the domain package.
//
// The validator is the *runtime* entry point for untrusted input — it must not
// throw on shape violations, it must return structured errors.
//
// ─────────────────────────────────────────────────────────────────────────────

import type { Storyboard, AnyStoryboardFrame, AnyStoryboardConnection } from './schema';

// Codes emitted by `validateStoryboard` itself. Verticals (rpg/marketing/cinematic
// domains) emit additional vertical-prefixed codes (e.g., `RPG_MISSING_STATE_CHANGES`,
// `CINEMATIC_SHOT_MISSING_VISUAL_DESCRIPTION`) that the open-union extension below
// admits without losing autocomplete on the known set.
export type KnownStoryboardValidationCode =
  | 'INVALID_STORYBOARD_SHAPE'
  | 'EMPTY_STORYBOARD'
  | 'DUPLICATE_FRAME_ID'
  | 'MISSING_TITLE'
  | 'MISSING_TYPE'
  | 'MISSING_SUMMARY'
  | 'MISSING_FRAME_SIZE'
  | 'MISSING_FRAME_POSITION'
  | 'INVALID_FRAME_DIMENSION'
  | 'INVALID_FRAME_POSITION'
  | 'DUPLICATE_CONNECTION_ID'
  | 'SELF_LOOP_CONNECTION'
  | 'DUPLICATE_CONNECTION_EDGE'
  | 'BROKEN_CONNECTION_FROM'
  | 'BROKEN_CONNECTION_TO';

// Open extension union: known codes preserve autocomplete, vertical packages
// may add their own snake_case_upper codes via the `(string & {})` escape hatch.
export type StoryboardValidationCode = KnownStoryboardValidationCode | (string & {});

export interface StoryboardValidationError {
  code: StoryboardValidationCode;
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
  storyboard: Storyboard<AnyStoryboardFrame, AnyStoryboardConnection>,
): StoryboardValidationResult {
  const errors: StoryboardValidationError[] = [];

  // Shape guard: validator is the runtime entry point for untrusted input.
  // Reject null/undefined or missing arrays with a structured error instead of
  // letting a TypeError leak.
  if (storyboard == null || typeof storyboard !== 'object') {
    errors.push({
      code: 'INVALID_STORYBOARD_SHAPE',
      message: 'Storyboard is null, undefined, or not an object.',
    });
    return { valid: false, errors };
  }

  if (!Array.isArray(storyboard.frames) || !Array.isArray(storyboard.connections)) {
    errors.push({
      code: 'INVALID_STORYBOARD_SHAPE',
      message: 'Storyboard is missing required `frames` or `connections` array.',
    });
    return { valid: false, errors };
  }

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

    // Shape-level guards before dereferencing nested fields. The TS type says
    // these exist, but at runtime the validator must not throw on a malformed
    // input — return a structured error instead.
    if (frame.size == null) {
      errors.push({
        code: 'MISSING_FRAME_SIZE',
        message: 'Frame is missing required `size` field.',
        frameId: frame.id,
      });
    } else if (
      !Number.isFinite(frame.size.width) ||
      !Number.isFinite(frame.size.height) ||
      frame.size.width < MIN_FRAME_DIMENSION ||
      frame.size.height < MIN_FRAME_DIMENSION
    ) {
      // Covers NaN, Infinity, and below-minimum dimensions. `NaN < 40` and
      // `Infinity < 40` are both false, so the finite-check is load-bearing.
      errors.push({
        code: 'INVALID_FRAME_DIMENSION',
        message: `Frame dimensions ${frame.size.width}x${frame.size.height} are invalid (must be finite and >= ${MIN_FRAME_DIMENSION}px).`,
        frameId: frame.id,
      });
    }

    if (frame.position == null) {
      errors.push({
        code: 'MISSING_FRAME_POSITION',
        message: 'Frame is missing required `position` field.',
        frameId: frame.id,
      });
    } else if (!Number.isFinite(frame.position.x) || !Number.isFinite(frame.position.y)) {
      // NaN/Infinity in position coordinates poisons downstream canvas math
      // (control points, midpoints, hit boxes). Reject the same way we reject
      // non-finite dimensions — the validator is the seawall.
      errors.push({
        code: 'INVALID_FRAME_POSITION',
        message: `Frame position (${frame.position.x}, ${frame.position.y}) is invalid (x and y must be finite numbers).`,
        frameId: frame.id,
      });
    }
  }

  const seenConnectionIds = new Set<string>();
  const seenEdges = new Map<string, string>();

  for (const conn of storyboard.connections) {
    if (seenConnectionIds.has(conn.id)) {
      errors.push({
        code: 'DUPLICATE_CONNECTION_ID',
        message: `Duplicate connection id: "${conn.id}".`,
        connectionId: conn.id,
      });
    }
    seenConnectionIds.add(conn.id);

    if (conn.fromFrameId === conn.toFrameId) {
      errors.push({
        code: 'SELF_LOOP_CONNECTION',
        message: `Connection "${conn.id}" loops a frame to itself ("${conn.fromFrameId}").`,
        connectionId: conn.id,
      });
    }

    const edgeKey = `${conn.fromFrameId}|${conn.toFrameId}`;
    if (seenEdges.has(edgeKey)) {
      errors.push({
        code: 'DUPLICATE_CONNECTION_EDGE',
        message: `Connection "${conn.id}" duplicates edge from "${conn.fromFrameId}" to "${conn.toFrameId}" (already covered by "${seenEdges.get(edgeKey)}").`,
        connectionId: conn.id,
      });
    } else {
      seenEdges.set(edgeKey, conn.id);
    }

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
