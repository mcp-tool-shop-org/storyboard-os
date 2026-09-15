// ─── storyboard-core / nest.ts ────────────────────────────────────────────────
//
// Domain-neutral one-level nest. parentFrameId groups children under a parent;
// collapsedIds lives on the board so collapse does not mutate frame records.
// No RPG "consequence fan" type — any frame may parent any other frame.
//
// ─────────────────────────────────────────────────────────────────────────────

import type { AnyStoryboardFrame, Storyboard } from './schema';

export interface NestableFrame {
  id: string;
  parentFrameId?: string;
}

function isUsableId(value: unknown): value is string {
  return typeof value === 'string' && value.trim().length > 0;
}

function framesOf(
  storyboardOrFrames:
    | Pick<Storyboard<AnyStoryboardFrame>, 'frames'>
    | readonly NestableFrame[]
    | null
    | undefined,
): readonly NestableFrame[] {
  if (Array.isArray(storyboardOrFrames)) return storyboardOrFrames;
  if (storyboardOrFrames != null && typeof storyboardOrFrames === 'object' && 'frames' in storyboardOrFrames) {
    const frames = (storyboardOrFrames as Pick<Storyboard<AnyStoryboardFrame>, 'frames'>).frames;
    if (Array.isArray(frames)) return frames;
  }
  return [];
}

/**
 * Direct children of `rootId` (one nest level). Order follows `frames`.
 */
export function childIds(
  storyboardOrFrames:
    | Pick<Storyboard<AnyStoryboardFrame>, 'frames'>
    | readonly NestableFrame[],
  rootId: string,
): string[] {
  if (!isUsableId(rootId)) return [];
  const out: string[] = [];
  for (const frame of framesOf(storyboardOrFrames)) {
    if (
      frame != null &&
      typeof frame === 'object' &&
      isUsableId(frame.id) &&
      frame.parentFrameId === rootId
    ) {
      out.push(frame.id);
    }
  }
  return out;
}

/**
 * Add `id` to `collapsedIds` without mutating the board or any frame record.
 * No-op when `id` is already collapsed or not a usable string.
 */
export function collapseFan<T extends Pick<Storyboard, 'collapsedIds'>>(
  storyboard: T,
  id: string,
): T {
  if (storyboard == null || typeof storyboard !== 'object' || !isUsableId(id)) {
    return storyboard;
  }
  const current = Array.isArray(storyboard.collapsedIds)
    ? storyboard.collapsedIds.filter(isUsableId)
    : [];
  if (current.includes(id)) return storyboard;
  return { ...storyboard, collapsedIds: [...current, id] };
}

/**
 * Remove `id` from `collapsedIds`. No-op when it is not collapsed.
 */
export function expandFan<T extends Pick<Storyboard, 'collapsedIds'>>(
  storyboard: T,
  id: string,
): T {
  if (storyboard == null || typeof storyboard !== 'object' || !isUsableId(id)) {
    return storyboard;
  }
  const current = Array.isArray(storyboard.collapsedIds)
    ? storyboard.collapsedIds
    : [];
  if (!current.includes(id)) return storyboard;
  return { ...storyboard, collapsedIds: current.filter(item => item !== id) };
}

/**
 * Frames that are not hidden by a collapsed ancestor.
 * The collapsed parent itself stays visible. Default (absent/empty
 * collapsedIds) is show-all — authors commit collapse; nothing auto-collapses.
 */
export function visibleFrames<T extends AnyStoryboardFrame>(
  storyboard: Pick<Storyboard<T>, 'frames' | 'collapsedIds'>,
): T[] {
  if (storyboard == null || typeof storyboard !== 'object') return [];
  const frames = Array.isArray(storyboard.frames) ? storyboard.frames : [];
  const collapsed = new Set(
    Array.isArray(storyboard.collapsedIds)
      ? storyboard.collapsedIds.filter(isUsableId)
      : [],
  );
  if (collapsed.size === 0) return frames.slice();

  const byId = new Map<string, T>();
  for (const frame of frames) {
    if (frame != null && typeof frame === 'object' && isUsableId(frame.id)) {
      byId.set(frame.id, frame);
    }
  }

  function hiddenByCollapse(frame: T): boolean {
    const startId = isUsableId(frame.id) ? frame.id : undefined;
    const seen = new Set<string>();
    let parentId = isUsableId(frame.parentFrameId) ? frame.parentFrameId : undefined;
    while (parentId) {
      // A collapsed parent stays visible; a cycle back to self is not an ancestor.
      if (startId !== undefined && parentId === startId) break;
      if (collapsed.has(parentId)) return true;
      if (seen.has(parentId)) break;
      seen.add(parentId);
      const parent = byId.get(parentId);
      parentId =
        parent && isUsableId(parent.parentFrameId) ? parent.parentFrameId : undefined;
    }
    return false;
  }

  return frames.filter(frame => frame != null && !hiddenByCollapse(frame));
}
