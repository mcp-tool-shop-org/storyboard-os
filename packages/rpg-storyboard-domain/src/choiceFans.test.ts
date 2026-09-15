// ─── choiceFans.test.ts ──────────────────────────────────────────────────────
//
// F-b0fe9ec9: nest/collapse outgoing choice→consequence fans under the parent
// choice; expand in place. Optional type/readiness filter. Not playlist grouping.
//
// ─────────────────────────────────────────────────────────────────────────────

import { describe, it, expect } from 'vitest';
import { createStoryboardFromTemplate } from './templates';
import { listChoiceFans, visibleRpgBoard } from './choiceFans';
import type { Storyboard, StoryboardFrame } from './schema';
import type { StoryboardConnection } from '@storyboard-os/core';

const INPUT = { id: 'test', title: 'Test Board', description: 'Vitest fixture' };

function makeFrame(
  id: string,
  type: StoryboardFrame['type'],
  extras: Partial<StoryboardFrame> = {},
): StoryboardFrame {
  return {
    id,
    type,
    title: extras.title ?? id,
    summary: extras.summary ?? `Summary ${id}`,
    position: extras.position ?? { x: 0, y: 0 },
    size: extras.size ?? { width: 180, height: 140 },
    content: extras.content ?? (type === 'choice' || type === 'consequence'
      ? { stateChanges: ['flag = true'] }
      : {}),
    annotations: extras.annotations ?? [],
  };
}

function makeBoard(frames: StoryboardFrame[], connections: StoryboardConnection[]): Storyboard {
  return { id: 'board', title: 'Board', frames, connections };
}

describe('listChoiceFans (F-b0fe9ec9)', () => {
  it('nests quest_branch path-a/b/c under the decision choice, not the shared convergence', () => {
    const sb = createStoryboardFromTemplate('quest_branch', INPUT);
    const fans = listChoiceFans(sb);
    expect(fans).toHaveLength(1);
    const fan = fans[0];
    const choice = sb.frames.find(f => f.type === 'choice')!;
    expect(fan.parentId).toBe(choice.id);
    expect(fan.memberIds).toHaveLength(3);
    expect(fan.memberIds.sort()).toEqual([
      'test-path-a',
      'test-path-b',
      'test-path-c',
    ].sort());
    expect(fan.memberIds).not.toContain('test-convergence');
    expect(fan.memberIds).not.toContain('test-fallout-hook');
  });

  it('quest_flow has no choice fan (linear sequence, not a branch)', () => {
    const sb = createStoryboardFromTemplate('quest_flow', INPUT);
    expect(listChoiceFans(sb)).toHaveLength(0);
  });

  it('does not treat a single outgoing choice edge as a fan', () => {
    const board = makeBoard(
      [
        makeFrame('c', 'choice'),
        makeFrame('a', 'scene'),
      ],
      [{ id: 'e1', fromFrameId: 'c', toFrameId: 'a', type: 'choice' }],
    );
    expect(listChoiceFans(board)).toHaveLength(0);
  });
});

describe('visibleRpgBoard — collapse / expand in place (F-b0fe9ec9)', () => {
  it('hides fan members while collapsed and keeps the parent + convergence', () => {
    const sb = createStoryboardFromTemplate('quest_branch', INPUT);
    const view = visibleRpgBoard(sb, { expandedFanIds: [] });
    const ids = view.frames.map(f => f.id);
    expect(ids).toContain('test-decision-point');
    expect(ids).toContain('test-convergence');
    expect(ids).toContain('test-inciting-situation');
    expect(ids).toContain('test-fallout-hook');
    expect(ids).not.toContain('test-path-a');
    expect(ids).not.toContain('test-path-b');
    expect(ids).not.toContain('test-path-c');
    expect(view.frames).toHaveLength(4);
    expect(view.hiddenIds.sort()).toEqual(['test-path-a', 'test-path-b', 'test-path-c'].sort());
  });

  it('expand in place restores the path cards at their original positions', () => {
    const sb = createStoryboardFromTemplate('quest_branch', INPUT);
    const choice = sb.frames.find(f => f.type === 'choice')!;
    const collapsed = visibleRpgBoard(sb, { expandedFanIds: [] });
    const expanded = visibleRpgBoard(sb, { expandedFanIds: [choice.id] });
    expect(expanded.frames).toHaveLength(sb.frames.length);
    expect(expanded.hiddenIds).toHaveLength(0);
    const pathA = sb.frames.find(f => f.id === 'test-path-a')!;
    const visiblePathA = expanded.frames.find(f => f.id === 'test-path-a')!;
    expect(visiblePathA.position).toEqual(pathA.position);
    expect(collapsed.frames.find(f => f.id === 'test-path-a')).toBeUndefined();
  });

  it('drops connections whose endpoints are hidden', () => {
    const sb = createStoryboardFromTemplate('quest_branch', INPUT);
    const view = visibleRpgBoard(sb, { expandedFanIds: [] });
    expect(view.connections.every(
      c => view.frames.some(f => f.id === c.fromFrameId) && view.frames.some(f => f.id === c.toFrameId),
    )).toBe(true);
    expect(view.connections.some(c => c.toFrameId === 'test-path-a')).toBe(false);
  });

  it('filters by type without using cinematic playlist grouping', () => {
    const sb = createStoryboardFromTemplate('quest_branch', INPUT);
    const choice = sb.frames.find(f => f.type === 'choice')!;
    const view = visibleRpgBoard(sb, {
      expandedFanIds: [choice.id],
      typeFilter: 'hook',
    });
    expect(view.frames.every(f => f.type === 'hook')).toBe(true);
    expect(view.frames.length).toBeGreaterThan(0);
  });

  it('filters by readiness after nest', () => {
    const sb = createStoryboardFromTemplate('quest_flow', INPUT);
    const view = visibleRpgBoard(sb, { readinessFilter: 'ready' });
    expect(view.frames.length).toBeGreaterThan(0);
    expect(view.frames.length).toBeLessThanOrEqual(sb.frames.length);
  });
});
