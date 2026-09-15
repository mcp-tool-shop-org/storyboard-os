// ─── rpg-domain / choiceFans.ts ──────────────────────────────────────────────
//
// C2 density: nest outgoing choice→consequence fans under the parent choice
// and expand them in place. Not cinematic playlist grouping (C5).
//
// Core nest API (`visibleFrames`) may land in parallel. Prefer it when present;
// otherwise filter on the RPG graph (choice/consequence edges + content.parentFrameId).
//
// ─────────────────────────────────────────────────────────────────────────────

import * as core from '@storyboard-os/core';
import type { StoryboardConnection } from '@storyboard-os/core';
import type { FrameContent, Storyboard, StoryboardFrame, StoryboardFrameType } from './schema';
import { getBeatStatus, type BeatStatusLevel } from './beatStatus';

const FAN_EDGE_TYPES: ReadonlySet<string> = new Set(['choice', 'consequence']);

export interface ChoiceFan {
  parentId: string;
  parentTitle: string;
  /** Frames hidden while this fan is collapsed. Expand restores original positions. */
  memberIds: string[];
}

export interface RpgBoardViewOptions {
  /** Fan parent ids expanded in place. All other fans stay collapsed. */
  expandedFanIds?: readonly string[];
  typeFilter?: StoryboardFrameType | 'all';
  readinessFilter?: BeatStatusLevel | 'all';
}

export interface RpgBoardView {
  frames: StoryboardFrame[];
  connections: StoryboardConnection[];
  fans: ChoiceFan[];
  hiddenIds: string[];
}

function contentOf(frame: StoryboardFrame): FrameContent {
  return (frame.content ?? {}) as FrameContent;
}

function uniqueIds(ids: Iterable<string>): string[] {
  return [...new Set(ids)];
}

/**
 * Outgoing choice/consequence destinations of a choice frame, plus frames that
 * stamp `content.parentFrameId` at that choice. Shared convergence (incoming
 * from outside the fan) is not a member — it stays on the board when collapsed.
 */
export function listChoiceFans(storyboard: Storyboard): ChoiceFan[] {
  const frames = Array.isArray(storyboard?.frames) ? storyboard.frames : [];
  const connections = Array.isArray(storyboard?.connections) ? storyboard.connections : [];
  const frameIds = new Set(frames.map(f => f.id));
  const fans: ChoiceFan[] = [];

  for (const frame of frames) {
    if (frame?.type !== 'choice') continue;

    const outgoing = connections.filter(
      c =>
        c.fromFrameId === frame.id &&
        FAN_EDGE_TYPES.has(c.type) &&
        frameIds.has(c.toFrameId) &&
        c.toFrameId !== frame.id,
    );

    const members = new Set<string>();
    for (const edge of outgoing) members.add(edge.toFrameId);
    for (const other of frames) {
      if (other.id === frame.id) continue;
      if (contentOf(other).parentFrameId === frame.id) members.add(other.id);
    }

    if (members.size < 2) continue;

    fans.push({
      parentId: frame.id,
      parentTitle: frame.title,
      memberIds: [...members],
    });
  }

  return fans;
}

function hiddenByCollapsedFans(
  fans: ChoiceFan[],
  expandedFanIds: ReadonlySet<string>,
): Set<string> {
  const hidden = new Set<string>();
  for (const fan of fans) {
    if (expandedFanIds.has(fan.parentId)) continue;
    for (const id of fan.memberIds) hidden.add(id);
  }
  return hidden;
}

/**
 * Probe `@storyboard-os/core` for a parallel-landing `visibleFrames` helper.
 * Unknown signatures fall back to the RPG graph — never throw.
 */
function coreVisibleFrameIds(
  storyboard: Storyboard,
  collapsedParentIds: readonly string[],
): string[] | undefined {
  const candidate = (core as Record<string, unknown>).visibleFrames;
  if (typeof candidate !== 'function') return undefined;
  try {
    const result = (candidate as (input: unknown, options?: unknown) => unknown)(
      storyboard,
      { collapsedParentIds },
    );
    if (Array.isArray(result)) {
      const ids = result
        .map(item => (typeof item === 'string' ? item : (item as { id?: string })?.id))
        .filter((id): id is string => typeof id === 'string' && id.length > 0);
      return ids.length > 0 ? ids : undefined;
    }
    if (result && typeof result === 'object' && Array.isArray((result as { frames?: unknown }).frames)) {
      const ids = ((result as { frames: Array<{ id?: string } | string> }).frames)
        .map(item => (typeof item === 'string' ? item : item?.id))
        .filter((id): id is string => typeof id === 'string' && id.length > 0);
      return ids.length > 0 ? ids : undefined;
    }
  } catch {
    return undefined;
  }
  return undefined;
}

function passesFilters(
  frame: StoryboardFrame,
  typeFilter: StoryboardFrameType | 'all',
  readinessFilter: BeatStatusLevel | 'all',
): boolean {
  if (typeFilter !== 'all' && frame.type !== typeFilter) return false;
  if (readinessFilter !== 'all' && getBeatStatus(frame).level !== readinessFilter) {
    return false;
  }
  return true;
}

/**
 * Frames and connections the RPG canvas should pass to Konva.
 * Collapsed fans hide members in place; expand restores the same positions.
 */
export function visibleRpgBoard(
  storyboard: Storyboard,
  options: RpgBoardViewOptions = {},
): RpgBoardView {
  const frames = Array.isArray(storyboard?.frames) ? storyboard.frames : [];
  const connections = Array.isArray(storyboard?.connections) ? storyboard.connections : [];
  const fans = listChoiceFans(storyboard);
  const expanded = new Set(options.expandedFanIds ?? []);
  const typeFilter = options.typeFilter ?? 'all';
  const readinessFilter = options.readinessFilter ?? 'all';

  const collapsedParentIds = fans
    .filter(fan => !expanded.has(fan.parentId))
    .map(fan => fan.parentId);

  const graphHidden = hiddenByCollapsedFans(fans, expanded);
  const coreIds = coreVisibleFrameIds(storyboard, collapsedParentIds);
  const nestHidden = new Set<string>();
  if (coreIds) {
    const coreSet = new Set(coreIds);
    for (const frame of frames) {
      if (!coreSet.has(frame.id)) nestHidden.add(frame.id);
    }
  } else {
    for (const id of graphHidden) nestHidden.add(id);
  }

  const visibleFrames = frames.filter(
    frame => !nestHidden.has(frame.id) && passesFilters(frame, typeFilter, readinessFilter),
  );
  const visibleIds = new Set(visibleFrames.map(f => f.id));
  const visibleConnections = connections.filter(
    c => visibleIds.has(c.fromFrameId) && visibleIds.has(c.toFrameId),
  );

  const hiddenIds = uniqueIds(
    frames.filter(f => !visibleIds.has(f.id)).map(f => f.id),
  );

  return {
    frames: visibleFrames,
    connections: visibleConnections,
    fans,
    hiddenIds,
  };
}
