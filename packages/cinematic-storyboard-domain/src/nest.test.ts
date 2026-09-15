// ─── cinematic-domain / nest.test.ts ──────────────────────────────────────────
//
// Sequence headers group shots (parentSequenceId). Cutaway/reaction fans
// collapse under the parent shot. One nest level. Filter is a visible-set.
// ─────────────────────────────────────────────────────────────────────────────

import { describe, it, expect } from 'vitest';
import { DENSITY_SOFT_CAP } from '@storyboard-os/core';
import {
  indexCinematicNest,
  visibleCinematicBoard,
  collapsedChildBadgeText,
  FAN_CONNECTION_TYPES,
  CINEMATIC_NEST_MAX_DEPTH,
} from './nest';
import { createCinematicStoryboard } from './templates';
import type { Storyboard, StoryboardFrame, StoryboardConnection, CinematicFrameContent } from './schema';

function makeFrame(
  id: string,
  type: string,
  extra: Partial<StoryboardFrame> = {},
): StoryboardFrame {
  return {
    id,
    type: type as StoryboardFrame['type'],
    title: extra.title ?? id,
    summary: extra.summary ?? id,
    position: extra.position ?? { x: 0, y: 0 },
    size: extra.size ?? { width: 220, height: 140 },
    content: (extra.content ?? { intent: id }) as CinematicFrameContent,
    annotations: extra.annotations ?? [],
    parentSequenceId: extra.parentSequenceId,
  };
}

function makeBoard(
  frames: StoryboardFrame[],
  connections: StoryboardConnection[] = [],
): Storyboard {
  return { id: 'nest-test', title: 'Nest Test', frames, connections };
}

describe('FAN_CONNECTION_TYPES', () => {
  it('collapses cutaway and reaction only — not parallel_action', () => {
    expect(FAN_CONNECTION_TYPES).toEqual(['cutaway', 'reaction']);
    expect(CINEMATIC_NEST_MAX_DEPTH).toBe(1);
  });
});

describe('indexCinematicNest', () => {
  it('groups shots under a sequence header via parentSequenceId', () => {
    const seq = makeFrame('seq-1', 'sequence');
    const a = makeFrame('shot-a', 'shot', { parentSequenceId: 'seq-1' });
    const b = makeFrame('shot-b', 'shot', { parentSequenceId: 'seq-1' });
    const loose = makeFrame('loose', 'shot');
    const index = indexCinematicNest(makeBoard([seq, a, b, loose]));
    expect(index.childrenByParent.get('seq-1')).toEqual(['shot-a', 'shot-b']);
    expect(index.parentByChild.get('shot-a')).toBe('seq-1');
    expect(index.kindByParent.get('seq-1')).toBe('sequence');
    expect(index.parentByChild.has('loose')).toBe(false);
  });

  it('nests cutaway/reaction targets under the parent shot', () => {
    const parent = makeFrame('hero', 'shot');
    const cut = makeFrame('insert', 'shot');
    const react = makeFrame('react', 'shot');
    const index = indexCinematicNest(makeBoard([parent, cut, react], [
      { id: 'c1', fromFrameId: 'hero', toFrameId: 'insert', type: 'cutaway' },
      { id: 'c2', fromFrameId: 'hero', toFrameId: 'react', type: 'reaction' },
    ]));
    expect(index.childrenByParent.get('hero')).toEqual(['insert', 'react']);
    expect(index.kindByParent.get('hero')).toBe('fan');
  });

  it('parentSequenceId wins over a fan edge (one parent, one nest level)', () => {
    const seq = makeFrame('seq-1', 'sequence');
    const child = makeFrame('child', 'shot', { parentSequenceId: 'seq-1' });
    const index = indexCinematicNest(makeBoard([seq, child], [
      { id: 'c1', fromFrameId: 'seq-1', toFrameId: 'child', type: 'cutaway' },
    ]));
    expect(index.parentByChild.get('child')).toBe('seq-1');
    expect(index.kindByParent.get('seq-1')).toBe('sequence');
  });

  it('does not nest parallel_action as a fan', () => {
    const a = makeFrame('a', 'shot');
    const b = makeFrame('b', 'edit_beat');
    const index = indexCinematicNest(makeBoard([a, b], [
      { id: 'c1', fromFrameId: 'a', toFrameId: 'b', type: 'parallel_action' },
    ]));
    expect(index.parentByChild.has('b')).toBe(false);
  });
});

describe('visibleCinematicBoard', () => {
  it('default view is sequence headers + ungrouped shots', () => {
    const seq = makeFrame('seq-1', 'sequence', { title: 'Act I' });
    const child = makeFrame('shot-a', 'shot', { parentSequenceId: 'seq-1', title: 'Hook' });
    const loose = makeFrame('loose', 'shot', { title: 'CTA' });
    const view = visibleCinematicBoard(makeBoard([seq, child, loose]));
    expect(view.frames.map(f => f.id)).toEqual(['seq-1', 'loose']);
    expect(view.hiddenIds.has('shot-a')).toBe(true);
  });

  it('expanding a sequence header reveals its children', () => {
    const seq = makeFrame('seq-1', 'sequence');
    const child = makeFrame('shot-a', 'shot', { parentSequenceId: 'seq-1' });
    const view = visibleCinematicBoard(makeBoard([seq, child]), { expandedIds: ['seq-1'] });
    expect(view.frames.map(f => f.id)).toEqual(['seq-1', 'shot-a']);
    expect(collapsedChildBadgeText(view.index, 'seq-1', ['seq-1'])).toBeNull();
  });

  it('collapses cutaway/reaction fans under the parent shot until expanded', () => {
    const hero = makeFrame('hero', 'shot');
    const insert = makeFrame('insert', 'shot');
    const board = makeBoard([hero, insert], [
      { id: 'c1', fromFrameId: 'hero', toFrameId: 'insert', type: 'cutaway' },
    ]);
    const collapsed = visibleCinematicBoard(board);
    expect(collapsed.frames.map(f => f.id)).toEqual(['hero']);
    expect(collapsedChildBadgeText(collapsed.index, 'hero', [])).toBe('+1');
    const expanded = visibleCinematicBoard(board, { expandedIds: ['hero'] });
    expect(expanded.frames.map(f => f.id)).toEqual(['hero', 'insert']);
  });

  it('hides edges whose endpoints are nested away', () => {
    const hero = makeFrame('hero', 'shot');
    const insert = makeFrame('insert', 'shot');
    const board = makeBoard([hero, insert], [
      { id: 'c1', fromFrameId: 'hero', toFrameId: 'insert', type: 'cutaway' },
    ]);
    const view = visibleCinematicBoard(board);
    expect(view.connections).toHaveLength(0);
  });

  it('type filter is a visible-set, not extra cards', () => {
    const seq = makeFrame('seq-1', 'sequence');
    const shot = makeFrame('s1', 'shot');
    const vfx = makeFrame('v1', 'vfx');
    const view = visibleCinematicBoard(makeBoard([seq, shot, vfx]), { typeFilter: ['shot'] });
    expect(view.frames.map(f => f.id)).toEqual(['s1']);
    expect(view.frames.some(f => f.type === 'sequence')).toBe(false);
  });

  it('measures density on the visible set (soft-cap helper, does not auto-hide expand)', () => {
    const frames = Array.from({ length: DENSITY_SOFT_CAP }, (_, i) => makeFrame(`f${i}`, 'shot'));
    const view = visibleCinematicBoard(makeBoard(frames));
    expect(view.density.frameCount).toBe(DENSITY_SOFT_CAP);
    expect(view.density.level).toBe('warn');
    expect(view.frames).toHaveLength(DENSITY_SOFT_CAP);
  });

  it('cutscene template hides the reaction shot until the reveal parent is expanded', () => {
    const sb = createCinematicStoryboard('cutscene_sequence');
    const reveal = sb.frames.find(f => f.title === 'Reveal');
    const reaction = sb.frames.find(f => f.title === 'Reaction Shot');
    expect(reveal).toBeDefined();
    expect(reaction).toBeDefined();
    const collapsed = visibleCinematicBoard(sb);
    expect(collapsed.frames.some(f => f.id === reaction!.id)).toBe(false);
    expect(collapsed.frames.some(f => f.id === reveal!.id)).toBe(true);
    const expanded = visibleCinematicBoard(sb, { expandedIds: [reveal!.id] });
    expect(expanded.frames.some(f => f.id === reaction!.id)).toBe(true);
  });
});
