import { describe, it, expect } from 'vitest';
import {
  applyCanvasVisibility,
  childIds,
  toIdSet,
} from './visibility';
import type { CanvasConnection, CanvasFrame } from './types';

function frame(
  id: string,
  parentFrameId?: string,
): CanvasFrame {
  return {
    id,
    type: 'scene',
    title: id,
    summary: id,
    position: { x: 0, y: 0 },
    size: { width: 200, height: 120 },
    ...(parentFrameId !== undefined ? { parentFrameId } : {}),
  };
}

function conn(
  id: string,
  fromFrameId: string,
  toFrameId: string,
  type = 'sequence',
): CanvasConnection {
  return { id, fromFrameId, toFrameId, type };
}

const frames = [
  frame('root'),
  frame('choice'),
  frame('fan-a', 'choice'),
  frame('fan-b', 'choice'),
  frame('after'),
];

const connections = [
  conn('c-root', 'root', 'choice'),
  conn('c-a', 'choice', 'fan-a', 'choice'),
  conn('c-b', 'choice', 'fan-b', 'choice'),
  conn('c-after', 'choice', 'after'),
  conn('c-opt', 'root', 'after', 'optional'),
];

describe('toIdSet', () => {
  it('treats absent / empty as show-all', () => {
    expect(toIdSet(undefined).size).toBe(0);
    expect(toIdSet(null).size).toBe(0);
    expect(toIdSet([]).size).toBe(0);
  });

  it('accepts a Set or an array', () => {
    expect([...toIdSet(['a', 'b'])].sort()).toEqual(['a', 'b']);
    expect(toIdSet(new Set(['a'])).has('a')).toBe(true);
  });
});

describe('childIds', () => {
  it('returns direct children only', () => {
    expect(childIds(frames, 'choice')).toEqual(['fan-a', 'fan-b']);
    expect(childIds(frames, 'root')).toEqual([]);
  });
});

describe('applyCanvasVisibility — default show-all', () => {
  it('paints every frame and edge when no hide sets are passed', () => {
    const visible = applyCanvasVisibility({ frames, connections });
    expect(visible.frames.map(f => f.id)).toEqual(frames.map(f => f.id));
    expect(visible.connections.map(c => c.id)).toEqual(connections.map(c => c.id));
  });
});

describe('applyCanvasVisibility — nest', () => {
  it('hides children of collapsed parents and skips their edges', () => {
    const visible = applyCanvasVisibility({
      frames,
      connections,
      collapsedIds: ['choice'],
    });
    expect(visible.frames.map(f => f.id)).toEqual(['root', 'choice', 'after']);
    expect(visible.connections.map(c => c.id).sort()).toEqual(
      ['c-after', 'c-opt', 'c-root'].sort(),
    );
    expect(visible.childCountById.choice).toBe(2);
  });

  it('does not auto-collapse: empty collapsedIds keeps the fan', () => {
    const visible = applyCanvasVisibility({
      frames,
      connections,
      collapsedIds: [],
    });
    expect(visible.frames).toHaveLength(frames.length);
  });
});

describe('applyCanvasVisibility — filter', () => {
  it('drops hiddenFrameIds even when they are not nested', () => {
    const visible = applyCanvasVisibility({
      frames,
      connections,
      hiddenFrameIds: ['after'],
    });
    expect(visible.frames.map(f => f.id)).not.toContain('after');
    expect(visible.connections.some(c => c.toFrameId === 'after')).toBe(false);
  });

  it('accepts hiddenFrameIds as a Set', () => {
    const visible = applyCanvasVisibility({
      frames,
      connections,
      hiddenFrameIds: new Set(['fan-a']),
    });
    expect(visible.frames.map(f => f.id)).not.toContain('fan-a');
    expect(visible.connections.map(c => c.id)).not.toContain('c-a');
  });

  it('hides connection types without deleting graph data', () => {
    const visible = applyCanvasVisibility({
      frames,
      connections,
      hiddenConnectionTypes: new Set(['optional', 'choice']),
    });
    expect(visible.frames).toHaveLength(frames.length);
    expect(visible.connections.map(c => c.id).sort()).toEqual(
      ['c-after', 'c-root'].sort(),
    );
  });

  it('filter is not collapse: a hidden parent does not hide its children', () => {
    const visible = applyCanvasVisibility({
      frames,
      connections,
      hiddenFrameIds: ['choice'],
    });
    expect(visible.frames.map(f => f.id)).toEqual(['root', 'fan-a', 'fan-b', 'after']);
  });
});
