// ─── storyboard-canvas / visibility.ts ────────────────────────────────────────
//
// Controlled visible-set for nest (collapsedIds) and filter (hiddenFrameIds /
// hiddenConnectionTypes). Default is show-all. The author/app owns the sets;
// nothing is inferred from density or auto-collapsed on load.
//
// ─────────────────────────────────────────────────────────────────────────────

import type { CanvasConnection, CanvasFrame } from './types';

export type IdCollection = ReadonlySet<string> | readonly string[] | null | undefined;

function isUsableId(value: unknown): value is string {
  return typeof value === 'string' && value.trim().length > 0;
}

export function toIdSet(ids: IdCollection): Set<string> {
  if (!ids) return new Set();
  if (ids instanceof Set) {
    const out = new Set<string>();
    for (const id of ids) {
      if (isUsableId(id)) out.add(id);
    }
    return out;
  }
  return new Set([...ids].filter(isUsableId));
}

/** Direct children of `rootId` (one nest level), in `frames` order. */
export function childIds(frames: readonly CanvasFrame[], rootId: string): string[] {
  if (!isUsableId(rootId) || !Array.isArray(frames)) return [];
  const out: string[] = [];
  for (const frame of frames) {
    if (isUsableId(frame?.id) && frame.parentFrameId === rootId) out.push(frame.id);
  }
  return out;
}

function hiddenByCollapse(
  frame: CanvasFrame,
  byId: ReadonlyMap<string, CanvasFrame>,
  collapsed: ReadonlySet<string>,
): boolean {
  const startId = isUsableId(frame.id) ? frame.id : undefined;
  const seen = new Set<string>();
  let parentId = isUsableId(frame.parentFrameId) ? frame.parentFrameId : undefined;
  while (parentId) {
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

export interface CanvasVisibilityInput {
  frames: readonly CanvasFrame[];
  connections: readonly CanvasConnection[];
  collapsedIds?: IdCollection;
  hiddenFrameIds?: IdCollection;
  hiddenConnectionTypes?: IdCollection;
}

export interface CanvasVisibility {
  frames: CanvasFrame[];
  connections: CanvasConnection[];
  visibleIds: Set<string>;
  /** Direct children not in hiddenFrameIds, keyed by parent id. */
  childCountById: Record<string, number>;
}

/**
 * Apply nest then filter so FrameCard, ConnectionLayer, and AccessibleFrameList
 * consume the same visible set. Edges whose from/to is hidden, or whose type is
 * in hiddenConnectionTypes, are dropped.
 */
export function applyCanvasVisibility(input: CanvasVisibilityInput): CanvasVisibility {
  const frames = Array.isArray(input?.frames) ? input.frames : [];
  const connections = Array.isArray(input?.connections) ? input.connections : [];
  const collapsed = toIdSet(input?.collapsedIds);
  const hiddenFrames = toIdSet(input?.hiddenFrameIds);
  const hiddenTypes = toIdSet(input?.hiddenConnectionTypes);

  const byId = new Map<string, CanvasFrame>();
  for (const frame of frames) {
    if (isUsableId(frame?.id)) byId.set(frame.id, frame);
  }

  const childCountById: Record<string, number> = {};
  for (const frame of frames) {
    if (!isUsableId(frame?.id) || hiddenFrames.has(frame.id)) continue;
    const parentId = frame.parentFrameId;
    if (isUsableId(parentId)) {
      childCountById[parentId] = (childCountById[parentId] ?? 0) + 1;
    }
  }

  const visibleFrames = frames.filter(frame => {
    if (!isUsableId(frame?.id)) return false;
    if (hiddenFrames.has(frame.id)) return false;
    return !hiddenByCollapse(frame, byId, collapsed);
  });
  const visibleIds = new Set(visibleFrames.map(f => f.id));

  const visibleConnections = connections.filter(conn => {
    if (!conn || !isUsableId(conn.id)) return false;
    if (hiddenTypes.has(conn.type)) return false;
    return visibleIds.has(conn.fromFrameId) && visibleIds.has(conn.toFrameId);
  });

  return {
    frames: visibleFrames,
    connections: visibleConnections,
    visibleIds,
    childCountById,
  };
}
