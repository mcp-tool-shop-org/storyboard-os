// ─── contentGuards.test.ts — DM-002 ──────────────────────────────────────────
//
// The core validator does not reject a frame whose `content` is null or
// missing, and the app load path does not validate before use. Every domain
// entry function that dereferences `frame.content` must therefore tolerate
// null/undefined content: return the draft/empty-status result, never throw.
//
// ─────────────────────────────────────────────────────────────────────────────

import { describe, it, expect } from 'vitest';
import { getCinematicBeatStatus, getSequenceReadiness } from './beatStatus';
import { getCinematicFrameBadges, getCinematicFrameSignal } from './frameSignals';
import { generateProductionBrief, generateProductionMarkdown } from './handoff';
import { getSequenceProductionSignals } from './productionSignals';
import { validateCinematicStoryboard } from './validate';
import type { Storyboard, StoryboardFrame, CinematicFrameContent } from './schema';

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
    size: { width: 200, height: 150 },
    content: content as CinematicFrameContent,
    annotations: [],
  };
}

/** Frame whose content is explicitly null (corrupt localStorage shape). */
function nullContentFrame(type: StoryboardFrame['type'] = 'sequence'): StoryboardFrame {
  return makeFrame('null-content', type, null);
}

/** Frame whose content key is entirely absent. */
function missingContentFrame(type: StoryboardFrame['type'] = 'sequence'): StoryboardFrame {
  const frame = makeFrame('missing-content', type, {});
  delete (frame as Record<string, unknown>)['content'];
  return frame;
}

function makeBoard(frames: StoryboardFrame[]): Storyboard {
  return { id: 'board-1', title: 'Test Board', frames, connections: [] };
}

// ─── beatStatus ───────────────────────────────────────────────────────────────

describe('DM-002 — beatStatus tolerates null/missing content', () => {
  it('getCinematicBeatStatus returns draft for a sequence frame with null content', () => {
    const status = getCinematicBeatStatus(nullContentFrame('sequence'));
    expect(status.level).toBe('draft');
    expect(status.assetCount).toBe(0);
    expect(status.checklistCount).toBe(0);
  });

  it('getCinematicBeatStatus returns draft for a sequence frame with missing content', () => {
    expect(() => getCinematicBeatStatus(missingContentFrame('sequence'))).not.toThrow();
    expect(getCinematicBeatStatus(missingContentFrame('sequence')).level).toBe('draft');
  });

  it('getCinematicBeatStatus does not throw for a shot frame with null content', () => {
    expect(() => getCinematicBeatStatus(nullContentFrame('shot'))).not.toThrow();
    // Shot frames require visualDescription — null content means blocked, not a crash.
    expect(getCinematicBeatStatus(nullContentFrame('shot')).level).toBe('blocked');
  });

  it('getSequenceReadiness does not throw on a board with null-content frames', () => {
    const board = makeBoard([nullContentFrame('sequence'), missingContentFrame('sequence')]);
    expect(() => getSequenceReadiness(board)).not.toThrow();
    expect(getSequenceReadiness(board).draft).toBe(2);
  });
});

// ─── frameSignals ─────────────────────────────────────────────────────────────

describe('DM-002 — frameSignals tolerates null/missing content', () => {
  it('getCinematicFrameSignal returns empty signal for null content', () => {
    const signal = getCinematicFrameSignal(nullContentFrame());
    expect(signal.cameraSummary).toBeNull();
    expect(signal.durationEstimate).toBeNull();
    expect(signal.hasVfx).toBe(false);
    expect(signal.hasAudio).toBe(false);
    expect(signal.hasContinuity).toBe(false);
  });

  it('getCinematicFrameSignal returns empty signal for missing content', () => {
    expect(() => getCinematicFrameSignal(missingContentFrame())).not.toThrow();
    expect(getCinematicFrameSignal(missingContentFrame()).cameraSummary).toBeNull();
  });

  it('getCinematicFrameBadges returns DRAFT badge for null content', () => {
    const badges = getCinematicFrameBadges(nullContentFrame());
    expect(badges.some(b => b.text === 'DRAFT')).toBe(true);
  });
});

// ─── productionSignals ────────────────────────────────────────────────────────

describe('DM-002 — productionSignals tolerates null/missing content', () => {
  it('getSequenceProductionSignals does not throw on a board with null-content frames', () => {
    const board = makeBoard([nullContentFrame('sequence'), missingContentFrame('sequence')]);
    expect(() => getSequenceProductionSignals(board)).not.toThrow();
  });

  it('reports empty burdens for null-content frames', () => {
    const signals = getSequenceProductionSignals(makeBoard([nullContentFrame('sequence')]));
    expect(signals.vfxBurden.totalFramesWithVfx).toBe(0);
    expect(signals.audioBurden.totalFramesWithAudio).toBe(0);
    expect(signals.continuityRisks).toEqual([]);
    expect(signals.durationRollup.uncoveredFrames).toBe(1);
  });
});

// ─── handoff ──────────────────────────────────────────────────────────────────

describe('DM-002 — handoff tolerates null/missing content', () => {
  it('generateProductionBrief does not throw and yields empty spec fields', () => {
    const brief = generateProductionBrief(
      makeBoard([nullContentFrame('sequence'), missingContentFrame('sequence')]),
    );
    expect(brief.shots).toHaveLength(2);
    for (const shot of brief.shots) {
      expect(shot.dialogue).toEqual([]);
      expect(shot.checklist).toEqual([]);
      expect(shot.vfx).toEqual([]);
      expect(shot.visualDescription).toBeNull();
    }
  });

  it('generateProductionMarkdown renders a null-content board without throwing', () => {
    const brief = generateProductionBrief(makeBoard([nullContentFrame('sequence')]));
    expect(() => generateProductionMarkdown(brief)).not.toThrow();
  });
});

// ─── validate (DM-003) ────────────────────────────────────────────────────────

describe('DM-003 — validator returns structured error on null/missing content', () => {
  it('does not throw and reports CINEMATIC_MISSING_CONTENT for null content on a sequence frame', () => {
    // A sequence frame has no type-required fields — before the guard, null
    // content sailed through this validator silently.
    const board = makeBoard([nullContentFrame('sequence')]);
    let result!: ReturnType<typeof validateCinematicStoryboard>;
    expect(() => { result = validateCinematicStoryboard(board); }).not.toThrow();
    expect(result.valid).toBe(false);
    const err = result.errors.find(e => e.code === 'CINEMATIC_MISSING_CONTENT');
    expect(err).toBeDefined();
    expect(err!.frameId).toBe('null-content');
  });

  it('does not throw for a null-content shot frame and continues validating other frames', () => {
    const board = makeBoard([
      nullContentFrame('shot'),
      makeFrame('empty-shot', 'shot', {}), // valid object content, missing visualDescription
    ]);
    let result!: ReturnType<typeof validateCinematicStoryboard>;
    expect(() => { result = validateCinematicStoryboard(board); }).not.toThrow();
    const codes = result.errors.map(e => e.code);
    expect(codes).toContain('CINEMATIC_MISSING_CONTENT');
    expect(codes).toContain('CINEMATIC_SHOT_MISSING_VISUAL_DESCRIPTION'); // loop continued
  });

  it('reports missing content for a frame whose content key is absent', () => {
    const board = makeBoard([missingContentFrame('sequence')]);
    const result = validateCinematicStoryboard(board);
    expect(result.errors.some(e => e.code === 'CINEMATIC_MISSING_CONTENT')).toBe(true);
  });
});
