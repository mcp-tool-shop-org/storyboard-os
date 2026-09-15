import { describe, it, expect } from 'vitest';
import {
  childIds,
  collapseFan,
  expandFan,
  visibleFrames,
} from './nest';
import type { AnyStoryboardFrame, Storyboard } from './schema';

function makeFrame(
  id: string,
  parentFrameId?: string,
): AnyStoryboardFrame {
  return {
    id,
    type: 'scene',
    title: `Frame ${id}`,
    summary: `Summary for ${id}`,
    position: { x: 0, y: 0 },
    size: { width: 200, height: 140 },
    content: {},
    annotations: [],
    ...(parentFrameId !== undefined ? { parentFrameId } : {}),
  };
}

function board(
  frames: AnyStoryboardFrame[],
  collapsedIds?: string[],
): Storyboard {
  return {
    id: 'sb',
    title: 'Nest',
    frames,
    connections: [],
    ...(collapsedIds !== undefined ? { collapsedIds } : {}),
  };
}

describe('childIds', () => {
  const frames = [
    makeFrame('parent'),
    makeFrame('a', 'parent'),
    makeFrame('b', 'parent'),
    makeFrame('other'),
    makeFrame('orphan', 'missing'),
  ];

  it('returns direct children in board order', () => {
    expect(childIds(frames, 'parent')).toEqual(['a', 'b']);
    expect(childIds(board(frames), 'parent')).toEqual(['a', 'b']);
  });

  it('is empty for a leaf or unknown root', () => {
    expect(childIds(frames, 'a')).toEqual([]);
    expect(childIds(frames, 'ghost')).toEqual([]);
    expect(childIds(frames, '')).toEqual([]);
  });
});

describe('collapseFan / expandFan', () => {
  it('adds id to collapsedIds without mutating the original board or frames', () => {
    const original = board([makeFrame('p'), makeFrame('c', 'p')]);
    const framesRef = original.frames;
    const next = collapseFan(original, 'p');

    expect(next).not.toBe(original);
    expect(next.collapsedIds).toEqual(['p']);
    expect(original.collapsedIds).toBeUndefined();
    expect(next.frames).toBe(framesRef);
    expect(next.frames[1].parentFrameId).toBe('p');
  });

  it('is idempotent when the id is already collapsed', () => {
    const original = board([makeFrame('p')], ['p']);
    expect(collapseFan(original, 'p')).toBe(original);
  });

  it('removes id on expand and no-ops when it is not collapsed', () => {
    const collapsed = board([makeFrame('p'), makeFrame('q')], ['p', 'q']);
    const expanded = expandFan(collapsed, 'p');
    expect(expanded.collapsedIds).toEqual(['q']);
    expect(expandFan(expanded, 'p')).toBe(expanded);
  });

  it('does not invent a collapse for an empty id', () => {
    const original = board([makeFrame('p')]);
    expect(collapseFan(original, '')).toBe(original);
  });
});

describe('visibleFrames', () => {
  const frames = [
    makeFrame('root'),
    makeFrame('choice'),
    makeFrame('fan-a', 'choice'),
    makeFrame('fan-b', 'choice'),
    makeFrame('after'),
  ];

  it('shows every frame when collapsedIds is absent (no auto-collapse)', () => {
    expect(visibleFrames(board(frames)).map(f => f.id)).toEqual(
      frames.map(f => f.id),
    );
  });

  it('hides direct children of a collapsed parent and keeps the parent', () => {
    const visible = visibleFrames(board(frames, ['choice']));
    expect(visible.map(f => f.id)).toEqual(['root', 'choice', 'after']);
  });

  it('does not hide siblings of the collapsed parent', () => {
    const visible = visibleFrames(board(frames, ['choice']));
    expect(visible.map(f => f.id)).toContain('root');
    expect(visible.map(f => f.id)).toContain('after');
  });

  it('hides a grandchild when an ancestor is collapsed', () => {
    const deep = [
      makeFrame('a'),
      makeFrame('b', 'a'),
      makeFrame('c', 'b'),
    ];
    expect(visibleFrames(board(deep, ['a'])).map(f => f.id)).toEqual(['a']);
  });

  it('does not throw on a parent cycle', () => {
    const cyclic = [
      { ...makeFrame('a'), parentFrameId: 'b' },
      { ...makeFrame('b'), parentFrameId: 'a' },
    ];
    expect(visibleFrames(board(cyclic, ['a'])).map(f => f.id)).toEqual(['a']);
  });
});
