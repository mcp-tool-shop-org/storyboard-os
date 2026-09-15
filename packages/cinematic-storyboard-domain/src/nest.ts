// ─── Cinematic Domain — Sequence nest / visible-card set ──────────────────────
//
// Sequence type is a group header (one nest level — Nielsen). Default canvas
// view: sequence headers + ungrouped shots. Expanding a header reveals children.
// Cutaway / reaction fans collapse under the parent shot. Filter-by-type is a
// visible-set, not extra cards. Soft-cap is measured via measureBoardDensity
// (Yoghourdjian ~50 / ~100); this module nests, it does not auto-hide an
// author's expand.
//
// Core visibleFrames is not used here — cinematic owns parentSequenceId and
// the visible-set filter until a domain-neutral nest API is consumed by the
// canvas wrapper.
//
// ─────────────────────────────────────────────────────────────────────────────

import { measureBoardDensity, type BoardDensity } from '@storyboard-os/core';
import type { Storyboard, StoryboardFrame, StoryboardConnection } from './schema';

/** Connection types that nest as a one-level fan under the parent shot. */
export const FAN_CONNECTION_TYPES = ['cutaway', 'reaction'] as const;

export type CinematicFanConnectionType = (typeof FAN_CONNECTION_TYPES)[number];

export type CinematicNestKind = 'sequence' | 'fan';

/** Nielsen: parent + children. Grandchildren are not a second nest UI. */
export const CINEMATIC_NEST_MAX_DEPTH = 1;

export interface CinematicNestIndex {
  /** child id → parent id (at most one parent). */
  parentByChild: Map<string, string>;
  /** parent id → child ids in board order. */
  childrenByParent: Map<string, string[]>;
  kindByParent: Map<string, CinematicNestKind>;
}

export interface VisibleCinematicOptions {
  /** Parent ids whose children are revealed. Default: none (headers + ungrouped). */
  expandedIds?: Iterable<string> | null;
  /**
   * When set, only these frame types stay in the visible set.
   * Filter lives in inspector/Signals — never as extra cards.
   */
  typeFilter?: Iterable<string> | null;
}

export interface VisibleCinematicBoard {
  frames: StoryboardFrame[];
  connections: StoryboardConnection[];
  hiddenIds: Set<string>;
  expandedIds: Set<string>;
  index: CinematicNestIndex;
  /** Density of the *visible* card set (soft-cap measurement). */
  density: BoardDensity;
}

function isFanType(type: string): type is CinematicFanConnectionType {
  return (FAN_CONNECTION_TYPES as readonly string[]).includes(type);
}

function explicitSequenceParent(frame: StoryboardFrame): string | undefined {
  const id = frame.parentSequenceId;
  return typeof id === 'string' && id.trim().length > 0 ? id : undefined;
}

/**
 * Build the one-level nest index.
 * parentSequenceId wins; otherwise an incoming cutaway/reaction edge.
 * A frame already claimed as a sequence child is not also a fan child.
 */
export function indexCinematicNest(storyboard: Storyboard): CinematicNestIndex {
  const frames = Array.isArray(storyboard?.frames) ? storyboard.frames : [];
  const connections = Array.isArray(storyboard?.connections) ? storyboard.connections : [];
  const frameIds = new Set(frames.map(f => f.id));
  const parentByChild = new Map<string, string>();
  const kindByParent = new Map<string, CinematicNestKind>();

  for (const frame of frames) {
    if (frame == null || typeof frame !== 'object') continue;
    const parentId = explicitSequenceParent(frame);
    if (!parentId || parentId === frame.id || !frameIds.has(parentId)) continue;
    parentByChild.set(frame.id, parentId);
    if (!kindByParent.has(parentId)) kindByParent.set(parentId, 'sequence');
  }

  for (const conn of connections) {
    if (!conn || !isFanType(conn.type)) continue;
    const childId = conn.toFrameId;
    const parentId = conn.fromFrameId;
    if (!childId || !parentId) continue;
    if (childId === parentId) continue;
    if (!frameIds.has(childId) || !frameIds.has(parentId)) continue;
    if (parentByChild.has(childId)) continue;
    parentByChild.set(childId, parentId);
    if (!kindByParent.has(parentId)) kindByParent.set(parentId, 'fan');
  }

  const childrenByParent = new Map<string, string[]>();
  for (const frame of frames) {
    const parentId = parentByChild.get(frame.id);
    if (!parentId) continue;
    const list = childrenByParent.get(parentId);
    if (list) list.push(frame.id);
    else childrenByParent.set(parentId, [frame.id]);
  }

  return { parentByChild, childrenByParent, kindByParent };
}

export function cinematicNestChildIds(index: CinematicNestIndex, parentId: string): string[] {
  return index.childrenByParent.get(parentId) ?? [];
}

function typeFilterSet(typeFilter: VisibleCinematicOptions['typeFilter']): Set<string> | null {
  if (typeFilter == null) return null;
  const set = new Set(Array.from(typeFilter).filter(t => typeof t === 'string' && t.length > 0));
  return set.size === 0 ? null : set;
}

function expandedSet(expandedIds: VisibleCinematicOptions['expandedIds']): Set<string> {
  if (expandedIds == null) return new Set();
  return new Set(Array.from(expandedIds).filter(id => typeof id === 'string' && id.length > 0));
}

/**
 * Default view: sequence headers + ungrouped shots. Expanding a parent reveals
 * its children (one nest level). Type filter intersects the nest-visible set.
 */
export function visibleCinematicBoard(
  storyboard: Storyboard,
  options: VisibleCinematicOptions = {},
): VisibleCinematicBoard {
  const frames = Array.isArray(storyboard?.frames) ? storyboard.frames : [];
  const connections = Array.isArray(storyboard?.connections) ? storyboard.connections : [];
  const index = indexCinematicNest(storyboard);
  const expandedIds = expandedSet(options.expandedIds);
  const types = typeFilterSet(options.typeFilter);

  const visible: StoryboardFrame[] = [];
  const hiddenIds = new Set<string>();

  for (const frame of frames) {
    if (frame == null || typeof frame !== 'object') continue;
    const parentId = index.parentByChild.get(frame.id);
    if (parentId && !expandedIds.has(parentId)) {
      hiddenIds.add(frame.id);
      continue;
    }
    if (types && !types.has(frame.type)) {
      hiddenIds.add(frame.id);
      continue;
    }
    visible.push(frame);
  }

  const visibleIds = new Set(visible.map(f => f.id));
  const visibleConnections = connections.filter(
    c => c && visibleIds.has(c.fromFrameId) && visibleIds.has(c.toFrameId),
  );

  return {
    frames: visible,
    connections: visibleConnections,
    hiddenIds,
    expandedIds,
    index,
    density: measureBoardDensity({ frames: visible, connections: visibleConnections }),
  };
}

/** +N chip text for a collapsed parent. Empty when expanded or childless. */
export function collapsedChildBadgeText(
  index: CinematicNestIndex,
  parentId: string,
  expandedIds: Iterable<string> | null | undefined,
): string | null {
  const n = cinematicNestChildIds(index, parentId).length;
  if (n === 0) return null;
  const expanded = expandedSet(expandedIds);
  if (expanded.has(parentId)) return null;
  return `+${n}`;
}
