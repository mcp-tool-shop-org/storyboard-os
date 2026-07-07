// ─── contentGuards.test.ts — DM-002 ──────────────────────────────────────────
//
// The core validator does not reject a frame whose `content` is null or
// missing, and the app load path does not validate before use. Every domain
// entry function that dereferences `frame.content` must therefore tolerate
// null/undefined content: return the draft/empty-status result, never throw.
//
// ─────────────────────────────────────────────────────────────────────────────

import { describe, it, expect } from 'vitest';
import { getBeatStatus, getStoryboardReadiness } from './beatStatus';
import { getFrameSignal, getFrameBadges } from './frameSignals';
import {
  generateHandoff,
  generateMarkdown,
  generateProjectHandoff,
  generateProjectMarkdown,
} from './handoff';
import { getProjectProgress, updateFrameContent } from './project';
import type { RpgStoryboardProject } from './project';
import { validateRpgStoryboard } from './validate';
import type { Storyboard, StoryboardFrame, FrameContent } from './schema';

// ─── Fixtures ─────────────────────────────────────────────────────────────────

function makeFrame(
  id: string,
  type: StoryboardFrame['type'],
  content: unknown,
): StoryboardFrame {
  return {
    id,
    type,
    title: `Frame ${id}`,
    summary: `Summary for ${id}`,
    position: { x: 0, y: 0 },
    size: { width: 180, height: 140 },
    content: content as FrameContent,
    annotations: [],
  };
}

/** Frame whose content is explicitly null (corrupt localStorage shape). */
function nullContentFrame(type: StoryboardFrame['type'] = 'scene'): StoryboardFrame {
  return makeFrame('null-content', type, null);
}

/** Frame whose content key is entirely absent. */
function missingContentFrame(type: StoryboardFrame['type'] = 'scene'): StoryboardFrame {
  const frame = makeFrame('missing-content', type, {});
  delete (frame as unknown as Record<string, unknown>)['content'];
  return frame;
}

function makeBoard(frames: StoryboardFrame[]): Storyboard {
  return { id: 'board-1', title: 'Test Board', frames, connections: [] };
}

function makeProject(frames: StoryboardFrame[]): RpgStoryboardProject {
  const now = new Date().toISOString();
  return {
    id: 'proj-1',
    title: 'Test Project',
    createdAt: now,
    updatedAt: now,
    storyboard: makeBoard(frames),
    progress: { frames: {} },
  };
}

// ─── beatStatus ───────────────────────────────────────────────────────────────

describe('DM-002 — beatStatus tolerates null/missing content', () => {
  it('getBeatStatus returns draft for a scene frame with null content', () => {
    const status = getBeatStatus(nullContentFrame('scene'));
    expect(status.level).toBe('draft');
    expect(status.assetCount).toBe(0);
    expect(status.checklistCount).toBe(0);
  });

  it('getBeatStatus returns draft for a scene frame with missing content', () => {
    const status = getBeatStatus(missingContentFrame('scene'));
    expect(status.level).toBe('draft');
  });

  it('getBeatStatus does not throw for a choice frame with null content', () => {
    expect(() => getBeatStatus(nullContentFrame('choice'))).not.toThrow();
    // Choice frames require stateChanges — null content means blocked, not a crash.
    expect(getBeatStatus(nullContentFrame('choice')).level).toBe('blocked');
  });

  it('getStoryboardReadiness does not throw on a board with null-content frames', () => {
    const board = makeBoard([nullContentFrame('scene'), missingContentFrame('hook')]);
    expect(() => getStoryboardReadiness(board)).not.toThrow();
    expect(getStoryboardReadiness(board).draft).toBe(2);
  });
});

// ─── frameSignals ─────────────────────────────────────────────────────────────

describe('DM-002 — frameSignals tolerates null/missing content', () => {
  it('getFrameSignal returns empty signal for null content', () => {
    const signal = getFrameSignal(nullContentFrame());
    expect(signal.readiness).toBe('incomplete');
    expect(signal.stateChangeSummary).toBeNull();
    expect(signal.branchConditionSummary).toBeNull();
    expect(signal.isStateful).toBe(false);
  });

  it('getFrameSignal returns empty signal for missing content', () => {
    expect(() => getFrameSignal(missingContentFrame())).not.toThrow();
    expect(getFrameSignal(missingContentFrame()).readiness).toBe('incomplete');
  });

  it('getFrameBadges returns DRAFT badge for null content', () => {
    const badges = getFrameBadges(nullContentFrame());
    expect(badges.some(b => b.text === 'DRAFT')).toBe(true);
  });
});

// ─── handoff ──────────────────────────────────────────────────────────────────

describe('DM-002 — handoff tolerates null/missing content', () => {
  it('generateHandoff does not throw and yields empty spec arrays', () => {
    const handoff = generateHandoff(makeBoard([nullContentFrame(), missingContentFrame('hook')]));
    expect(handoff.beats).toHaveLength(2);
    for (const beat of handoff.beats) {
      expect(beat.stateChanges).toEqual([]);
      expect(beat.implementationChecklist).toEqual([]);
      expect(beat.testCriteria).toEqual([]);
    }
  });

  it('generateMarkdown renders a null-content board without throwing', () => {
    const handoff = generateHandoff(makeBoard([nullContentFrame()]));
    expect(() => generateMarkdown(handoff)).not.toThrow();
  });

  it('generateProjectHandoff + markdown tolerate null-content frames', () => {
    const project = makeProject([nullContentFrame(), missingContentFrame('hook')]);
    const handoff = generateProjectHandoff(project);
    expect(handoff.beats).toHaveLength(2);
    expect(() => generateProjectMarkdown(handoff)).not.toThrow();
  });
});

// ─── project ──────────────────────────────────────────────────────────────────

describe('DM-002 — project progress tolerates null/missing content', () => {
  it('getProjectProgress does not throw and reports zero totals', () => {
    const project = makeProject([nullContentFrame(), missingContentFrame('hook')]);
    const summary = getProjectProgress(project);
    expect(summary.totalChecklist).toBe(0);
    expect(summary.totalTests).toBe(0);
  });

  it('updateFrameContent does not throw when patching a null-content frame', () => {
    const project = makeProject([nullContentFrame()]);
    expect(() =>
      updateFrameContent(project, 'null-content', { designerNotes: 'now has notes' }),
    ).not.toThrow();
  });
});

// ─── validate (DM-003) ────────────────────────────────────────────────────────

describe('DM-003 — validator returns structured error on null/missing content', () => {
  it('does not throw and reports RPG_MISSING_CONTENT for null content', () => {
    const board = makeBoard([nullContentFrame('choice')]);
    let result!: ReturnType<typeof validateRpgStoryboard>;
    expect(() => { result = validateRpgStoryboard(board); }).not.toThrow();
    expect(result.valid).toBe(false);
    const err = result.errors.find(e => e.code === 'RPG_MISSING_CONTENT');
    expect(err).toBeDefined();
    expect(err!.frameId).toBe('null-content');
  });

  it('does not throw for missing content and continues validating other frames', () => {
    const board = makeBoard([
      missingContentFrame('scene'),
      makeFrame('empty-choice', 'choice', {}), // valid object content, missing stateChanges
    ]);
    let result!: ReturnType<typeof validateRpgStoryboard>;
    expect(() => { result = validateRpgStoryboard(board); }).not.toThrow();
    const codes = result.errors.map(e => e.code);
    expect(codes).toContain('RPG_MISSING_CONTENT');
    expect(codes).toContain('RPG_MISSING_STATE_CHANGES'); // loop continued past the bad frame
  });
});
