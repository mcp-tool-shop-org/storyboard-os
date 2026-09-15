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
import { DEFAULT_SCHEMA_VERSION } from './schema';

// Codes emitted by `validateStoryboard` itself. Verticals (rpg/marketing/cinematic
// domains) emit additional vertical-prefixed codes (e.g., `RPG_MISSING_STATE_CHANGES`,
// `CINEMATIC_SHOT_MISSING_VISUAL_DESCRIPTION`) that the open-union extension below
// admits without losing autocomplete on the known set.
export type KnownStoryboardValidationCode =
  | 'INVALID_STORYBOARD_SHAPE'
  | 'EMPTY_STORYBOARD'
  | 'INVALID_SCHEMA_VERSION'
  | 'INVALID_FRAME_ID'
  | 'DUPLICATE_FRAME_ID'
  | 'MISSING_TITLE'
  | 'MISSING_TYPE'
  | 'MISSING_SUMMARY'
  | 'MISSING_FRAME_SIZE'
  | 'MISSING_FRAME_POSITION'
  | 'INVALID_FRAME_DIMENSION'
  | 'INVALID_FRAME_POSITION'
  | 'INVALID_CONNECTION_ID'
  | 'DUPLICATE_CONNECTION_ID'
  | 'SELF_LOOP_CONNECTION'
  | 'DUPLICATE_CONNECTION_EDGE'
  | 'BROKEN_CONNECTION_FROM'
  | 'BROKEN_CONNECTION_TO'
  | 'UNKNOWN_PARENT_FRAME_ID'
  | 'SELF_PARENT_FRAME'
  | 'PARENT_CYCLE';

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

// Human-readable runtime type for error messages. `typeof null === 'object'`
// would mislead, so null and arrays get their own labels.
function describeType(value: unknown): string {
  if (value === null) return 'null';
  if (Array.isArray(value)) return 'array';
  return typeof value;
}

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

  if (typeof storyboard.id !== 'string' || !storyboard.id.trim()) {
    errors.push({
      code: 'INVALID_STORYBOARD_SHAPE',
      message: 'Storyboard is missing required `id` string.',
    });
  }

  if (typeof storyboard.title !== 'string' || !storyboard.title.trim()) {
    errors.push({
      code: 'INVALID_STORYBOARD_SHAPE',
      message: 'Storyboard is missing required `title` string.',
    });
  }

  // schemaVersion is additive: absent means version 1 so existing fixtures
  // stay valid. Reject only a *present* non-integer / non-positive value.
  // A required-version era can tighten this to missing → INVALID_SCHEMA_VERSION.
  if (Object.hasOwn(storyboard, 'schemaVersion') && storyboard.schemaVersion !== undefined) {
    const version = storyboard.schemaVersion;
    if (
      typeof version !== 'number' ||
      !Number.isInteger(version) ||
      version < DEFAULT_SCHEMA_VERSION
    ) {
      errors.push({
        code: 'INVALID_SCHEMA_VERSION',
        message: `schemaVersion must be an integer >= ${DEFAULT_SCHEMA_VERSION} (got ${describeType(version)}${typeof version === 'number' ? ` ${version}` : ''}).`,
      });
    }
  }

  if (storyboard.frames.length === 0) {
    errors.push({ code: 'EMPTY_STORYBOARD', message: 'Storyboard has no frames.' });
    return { valid: false, errors };
  }

  const seenIds = new Set<string>();
  const frameIds = new Set<string>();

  for (const [frameIndex, frame] of storyboard.frames.entries()) {
    // Per-element shape guard: a null/primitive/array element would make every
    // field dereference below throw. Same no-throw contract as the top-level
    // shape guard — report the offending index and move on.
    if (frame == null || typeof frame !== 'object' || Array.isArray(frame)) {
      errors.push({
        code: 'INVALID_STORYBOARD_SHAPE',
        message: `frames[${frameIndex}] is null or not an object.`,
      });
      continue;
    }

    // Non-string / empty ids never enter the id sets: `frameIds.has(undefined)`
    // or `frameIds.has("")` would otherwise "match" a connection whose ref is
    // the same empty value, silently masking the broken reference. Field
    // errors below carry frameId only when it is a non-empty string.
    let frameId: string | undefined;
    if (typeof frame.id !== 'string') {
      errors.push({
        code: 'INVALID_FRAME_ID',
        message: `frames[${frameIndex}] has a non-string id (got ${describeType(frame.id)}).`,
      });
    } else if (!frame.id.trim()) {
      errors.push({
        code: 'INVALID_FRAME_ID',
        message: `frames[${frameIndex}] has an empty id.`,
      });
    } else {
      frameId = frame.id;
      if (seenIds.has(frameId)) {
        errors.push({
          code: 'DUPLICATE_FRAME_ID',
          message: `Duplicate frame id: "${frameId}".`,
          frameId,
        });
      }
      seenIds.add(frameId);
      frameIds.add(frameId);
    }

    // Type-guard before calling string methods. Optional chaining only guards
    // null/undefined — a number/array/object/boolean title would still throw
    // on `.trim()`, and the validator must never throw on malformed input.
    if (typeof frame.title !== 'string' || !frame.title.trim()) {
      errors.push({ code: 'MISSING_TITLE', message: 'Frame is missing a title.', frameId });
    }

    // Match title/summary: truthy non-strings (e.g. 42) and whitespace-only
    // strings must not pass — AccessibleFrameList.humanizeType calls .replace.
    if (typeof frame.type !== 'string' || !frame.type.trim()) {
      errors.push({ code: 'MISSING_TYPE', message: 'Frame is missing a type.', frameId });
    }

    if (typeof frame.summary !== 'string' || !frame.summary.trim()) {
      errors.push({ code: 'MISSING_SUMMARY', message: 'Frame is missing a summary.', frameId });
    }

    // Shape-level guards before dereferencing nested fields. The TS type says
    // these exist, but at runtime the validator must not throw on a malformed
    // input — return a structured error instead.
    if (frame.size == null) {
      errors.push({
        code: 'MISSING_FRAME_SIZE',
        message: 'Frame is missing required `size` field.',
        frameId,
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
        frameId,
      });
    }

    if (frame.position == null) {
      errors.push({
        code: 'MISSING_FRAME_POSITION',
        message: 'Frame is missing required `position` field.',
        frameId,
      });
    } else if (!Number.isFinite(frame.position.x) || !Number.isFinite(frame.position.y)) {
      // NaN/Infinity in position coordinates poisons downstream canvas math
      // (control points, midpoints, hit boxes). Reject the same way we reject
      // non-finite dimensions — the validator is the seawall.
      errors.push({
        code: 'INVALID_FRAME_POSITION',
        message: `Frame position (${frame.position.x}, ${frame.position.y}) is invalid (x and y must be finite numbers).`,
        frameId,
      });
    }
  }

  // Nest: unknown parent, self-parent, cycles. One nest level is enough;
  // deeper trees are still checked for cycles so a walk cannot hang.
  const parentOf = new Map<string, string>();
  for (const [frameIndex, frame] of storyboard.frames.entries()) {
    if (frame == null || typeof frame !== 'object' || Array.isArray(frame)) continue;
    if (!Object.hasOwn(frame, 'parentFrameId') || frame.parentFrameId === undefined) {
      continue;
    }

    const frameId =
      typeof frame.id === 'string' && frame.id.trim() ? frame.id : undefined;
    const parentId = frame.parentFrameId;
    const frameLabel = frameId ?? `frames[${frameIndex}]`;

    if (typeof parentId !== 'string') {
      errors.push({
        code: 'UNKNOWN_PARENT_FRAME_ID',
        message: `${frameLabel} has a non-string parentFrameId (got ${describeType(parentId)}).`,
        frameId,
      });
      continue;
    }
    if (!parentId.trim()) {
      errors.push({
        code: 'UNKNOWN_PARENT_FRAME_ID',
        message: `${frameLabel} has an empty parentFrameId.`,
        frameId,
      });
      continue;
    }
    if (frameId !== undefined && parentId === frameId) {
      errors.push({
        code: 'SELF_PARENT_FRAME',
        message: `Frame "${frameId}" lists itself as parentFrameId.`,
        frameId,
      });
      continue;
    }
    if (!frameIds.has(parentId)) {
      errors.push({
        code: 'UNKNOWN_PARENT_FRAME_ID',
        message: `${frameLabel} references unknown parentFrameId "${parentId}".`,
        frameId,
      });
      continue;
    }
    if (frameId !== undefined) parentOf.set(frameId, parentId);
  }

  const inCycle = new Set<string>();
  for (const startId of parentOf.keys()) {
    const path: string[] = [];
    const indexOf = new Map<string, number>();
    let current: string | undefined = startId;
    while (current && parentOf.has(current)) {
      const seenAt = indexOf.get(current);
      if (seenAt !== undefined) {
        for (const id of path.slice(seenAt)) inCycle.add(id);
        break;
      }
      indexOf.set(current, path.length);
      path.push(current);
      current = parentOf.get(current);
    }
  }
  for (const frame of storyboard.frames) {
    if (frame == null || typeof frame !== 'object' || Array.isArray(frame)) continue;
    if (typeof frame.id === 'string' && inCycle.has(frame.id)) {
      errors.push({
        code: 'PARENT_CYCLE',
        message: `Frame "${frame.id}" participates in a parentFrameId cycle.`,
        frameId: frame.id,
      });
    }
  }

  const seenConnectionIds = new Set<string>();
  const seenEdges = new Map<string, string>();

  for (const [connIndex, conn] of storyboard.connections.entries()) {
    // Per-element shape guard — same contract as the frames loop above.
    if (conn == null || typeof conn !== 'object' || Array.isArray(conn)) {
      errors.push({
        code: 'INVALID_STORYBOARD_SHAPE',
        message: `connections[${connIndex}] is null or not an object.`,
      });
      continue;
    }

    // Non-string / empty connection ids never enter the id sets: two connections
    // with `id: undefined` or `id: ""` would otherwise collide as a bogus
    // DUPLICATE_CONNECTION_ID (same failure mode CR-003 fixed for frames).
    // Field errors below carry connectionId only when it is a non-empty string.
    let connectionId: string | undefined;
    if (typeof conn.id !== 'string') {
      errors.push({
        code: 'INVALID_CONNECTION_ID',
        message: `connections[${connIndex}] has a non-string id (got ${describeType(conn.id)}).`,
      });
    } else if (!conn.id.trim()) {
      errors.push({
        code: 'INVALID_CONNECTION_ID',
        message: `connections[${connIndex}] has an empty id.`,
      });
    } else {
      connectionId = conn.id;
      if (seenConnectionIds.has(connectionId)) {
        errors.push({
          code: 'DUPLICATE_CONNECTION_ID',
          message: `Duplicate connection id: "${connectionId}".`,
          connectionId,
        });
      }
      seenConnectionIds.add(connectionId);
    }
    const connLabel = connectionId ?? `connections[${connIndex}]`;

    // Refs are only meaningful as non-empty strings. Identity-based checks
    // (self-loop, duplicate edge) are gated on both refs being usable —
    // otherwise `undefined === undefined` or `"" === ""` reads as a self-loop
    // and empty edge keys collide, reporting nonsense on malformed input.
    const fromRef =
      typeof conn.fromFrameId === 'string' && conn.fromFrameId.trim()
        ? conn.fromFrameId
        : undefined;
    const toRef =
      typeof conn.toFrameId === 'string' && conn.toFrameId.trim()
        ? conn.toFrameId
        : undefined;

    if (fromRef !== undefined && toRef !== undefined) {
      if (fromRef === toRef) {
        errors.push({
          code: 'SELF_LOOP_CONNECTION',
          message: `Connection "${connLabel}" loops a frame to itself ("${fromRef}").`,
          connectionId,
        });
      }

      const edgeKey = `${fromRef}|${toRef}`;
      if (seenEdges.has(edgeKey)) {
        errors.push({
          code: 'DUPLICATE_CONNECTION_EDGE',
          message: `Connection "${connLabel}" duplicates edge from "${fromRef}" to "${toRef}" (already covered by "${seenEdges.get(edgeKey)}").`,
          connectionId,
        });
      } else {
        seenEdges.set(edgeKey, connLabel);
      }
    }

    // Non-string / empty refs get their own broken-ref message instead of
    // relying on `frameIds.has(...)` — a non-string or empty frame id in the
    // set would otherwise "match" and mask the broken reference entirely.
    if (typeof conn.fromFrameId !== 'string') {
      errors.push({
        code: 'BROKEN_CONNECTION_FROM',
        message: `Connection "${connLabel}" has a non-string fromFrameId (got ${describeType(conn.fromFrameId)}); expected a frame id.`,
        connectionId,
      });
    } else if (!conn.fromFrameId.trim()) {
      errors.push({
        code: 'BROKEN_CONNECTION_FROM',
        message: `Connection "${connLabel}" has an empty fromFrameId; expected a frame id.`,
        connectionId,
      });
    } else if (!frameIds.has(conn.fromFrameId)) {
      errors.push({
        code: 'BROKEN_CONNECTION_FROM',
        message: `Connection "${connLabel}" references unknown fromFrameId "${conn.fromFrameId}".`,
        connectionId,
      });
    }
    if (typeof conn.toFrameId !== 'string') {
      errors.push({
        code: 'BROKEN_CONNECTION_TO',
        message: `Connection "${connLabel}" has a non-string toFrameId (got ${describeType(conn.toFrameId)}); expected a frame id.`,
        connectionId,
      });
    } else if (!conn.toFrameId.trim()) {
      errors.push({
        code: 'BROKEN_CONNECTION_TO',
        message: `Connection "${connLabel}" has an empty toFrameId; expected a frame id.`,
        connectionId,
      });
    } else if (!frameIds.has(conn.toFrameId)) {
      errors.push({
        code: 'BROKEN_CONNECTION_TO',
        message: `Connection "${connLabel}" references unknown toFrameId "${conn.toFrameId}".`,
        connectionId,
      });
    }
  }

  return { valid: errors.length === 0, errors };
}
