// ─── cinematic-domain / beatStatus.test.ts ───────────────────────────────────

import { describe, it, expect } from 'vitest';
import { getCinematicBeatStatus, getSequenceReadiness } from './beatStatus';
import type { StoryboardFrame, CinematicFrameContent, Storyboard } from './schema';

function makeFrame(
  type: string,
  content: Partial<CinematicFrameContent> = {},
): StoryboardFrame {
  return {
    id: `frame-${type}`,
    type: type as any,
    title: `Test ${type}`,
    summary: `A test ${type} frame`,
    position: { x: 0, y: 0 },
    size: { width: 220, height: 140 },
    content: content as CinematicFrameContent,
    annotations: [],
  };
}

function fullContent(): CinematicFrameContent {
  return {
    intent: 'Test intent',
    visualDescription: 'Test visual',
    cameraAngle: 'Medium shot',
    cameraMovement: 'Pan left',
    framing: 'Rule of thirds',
    durationEstimate: '5s',
    requiredAssets: ['Asset 1'],
    continuityRequirements: ['Lighting consistent'],
    implementationChecklist: ['Record shot'],
    testCriteria: ['Looks good'],
  };
}

describe('getCinematicBeatStatus', () => {
  describe('blocking rules', () => {
    it('blocks shot frame without visualDescription', () => {
      const frame = makeFrame('shot', { intent: 'test', durationEstimate: '3s' });
      const status = getCinematicBeatStatus(frame);
      expect(status.level).toBe('blocked');
      expect(status.missingReasons).toContain('no_visualDescription');
    });

    it('blocks camera_move without cameraMovement', () => {
      const frame = makeFrame('camera_move', { intent: 'test', durationEstimate: '3s' });
      const status = getCinematicBeatStatus(frame);
      expect(status.level).toBe('blocked');
      expect(status.missingReasons).toContain('no_cameraMovement');
    });

    it('blocks dialogue without dialogue array', () => {
      const frame = makeFrame('dialogue', { intent: 'test', durationEstimate: '3s' });
      const status = getCinematicBeatStatus(frame);
      expect(status.level).toBe('blocked');
      expect(status.missingReasons).toContain('no_dialogue');
    });

    it('blocks action without actionNotes', () => {
      const frame = makeFrame('action', { intent: 'test', durationEstimate: '3s' });
      const status = getCinematicBeatStatus(frame);
      expect(status.level).toBe('blocked');
      expect(status.missingReasons).toContain('no_actionNotes');
    });

    it('blocks transition without editNotes', () => {
      const frame = makeFrame('transition', { intent: 'test', durationEstimate: '3s' });
      const status = getCinematicBeatStatus(frame);
      expect(status.level).toBe('blocked');
      expect(status.missingReasons).toContain('no_editNotes');
    });

    it('blocks vfx without vfxRequirements', () => {
      const frame = makeFrame('vfx', { intent: 'test', durationEstimate: '3s' });
      const status = getCinematicBeatStatus(frame);
      expect(status.level).toBe('blocked');
      expect(status.missingReasons).toContain('no_vfxRequirements');
    });

    it('blocks audio without audioRequirements', () => {
      const frame = makeFrame('audio', { intent: 'test', durationEstimate: '3s' });
      const status = getCinematicBeatStatus(frame);
      expect(status.level).toBe('blocked');
      expect(status.missingReasons).toContain('no_audioRequirements');
    });

    it('blocks edit_beat without durationEstimate', () => {
      const frame = makeFrame('edit_beat', { intent: 'test', visualDescription: 'test' });
      const status = getCinematicBeatStatus(frame);
      expect(status.level).toBe('blocked');
      expect(status.missingReasons).toContain('no_durationEstimate');
    });

    // F-VR-005: parity with RPG/Marketing — an empty frame whose type has a
    // blocking field must come back 'blocked', not 'draft'.
    it('blocks empty shot frame (no spec at all) — F-VR-005 parity', () => {
      const frame = makeFrame('shot', {});
      const status = getCinematicBeatStatus(frame);
      expect(status.level).toBe('blocked');
      expect(status.missingReasons).toContain('no_visualDescription');
    });

    it('blocks empty dialogue frame (no spec at all) — F-VR-005 parity', () => {
      const frame = makeFrame('dialogue', {});
      const status = getCinematicBeatStatus(frame);
      expect(status.level).toBe('blocked');
      expect(status.missingReasons).toContain('no_dialogue');
    });

    it('blocks empty edit_beat frame (no spec at all) — F-VR-005 parity', () => {
      const frame = makeFrame('edit_beat', {});
      const status = getCinematicBeatStatus(frame);
      expect(status.level).toBe('blocked');
      expect(status.missingReasons).toContain('no_durationEstimate');
    });
  });

  describe('draft detection', () => {
    it('returns draft when frame has no blocker and no spec fields', () => {
      // `sequence` has no blocking field — so an empty `sequence` is draft, not blocked.
      const frame = makeFrame('sequence', {});
      const status = getCinematicBeatStatus(frame);
      expect(status.level).toBe('draft');
    });
  });

  describe('partial detection', () => {
    it('returns partial with 1-2 spec fields and no blocker', () => {
      const frame = makeFrame('shot', {
        visualDescription: 'Has visual',
        intent: 'Has intent',
      });
      const status = getCinematicBeatStatus(frame);
      expect(status.level).toBe('partial');
    });
  });

  describe('ready detection — F-VR-005 threshold parity', () => {
    it('returns ready when >= 3 spec fields and no blocker', () => {
      // Exactly 3 spec fields — must be 'ready' under the new threshold,
      // matching RPG/Marketing.
      const frame = makeFrame('shot', {
        visualDescription: 'x',
        intent: 'y',
        cameraAngle: 'wide',
      });
      const status = getCinematicBeatStatus(frame);
      expect(status.level).toBe('ready');
    });

    it('returns ready with a full spec', () => {
      const frame = makeFrame('shot', fullContent());
      const status = getCinematicBeatStatus(frame);
      expect(status.level).toBe('ready');
    });

    it('sequence frames with >= 3 spec fields are ready (no blockers)', () => {
      const frame = makeFrame('sequence', fullContent());
      const status = getCinematicBeatStatus(frame);
      expect(status.level).toBe('ready');
    });
  });

  describe('BeatStatus shape parity — F-VR-004', () => {
    it('exposes parallel counts to RPG/Marketing BeatStatus', () => {
      const frame = makeFrame('shot', {
        visualDescription: 'x',
        cameraAngle: 'wide',
        cameraMovement: 'pan',
        framing: 'thirds',
        durationEstimate: '3s',
        requiredAssets: ['set', 'prop'],
        implementationChecklist: ['record'],
        testCriteria: ['looks good', 'sounds good'],
      });
      const status = getCinematicBeatStatus(frame);

      expect(status.assetCount).toBe(2);
      expect(status.checklistCount).toBe(1);
      expect(status.testCriteriaCount).toBe(2);
      // shotCount covers cameraAngle/cameraMovement/framing/durationEstimate
      expect(status.shotCount).toBe(4);
      expect(status.hasDomainRequirements).toBe(true); // 'shot' has blocking field
    });

    it('hasDomainRequirements is false for sequence frames', () => {
      const frame = makeFrame('sequence', { intent: 'opener' });
      const status = getCinematicBeatStatus(frame);
      expect(status.hasDomainRequirements).toBe(false);
    });

    it('counts default to 0 on empty content', () => {
      const frame = makeFrame('sequence', {});
      const status = getCinematicBeatStatus(frame);
      expect(status.assetCount).toBe(0);
      expect(status.shotCount).toBe(0);
      expect(status.checklistCount).toBe(0);
      expect(status.testCriteriaCount).toBe(0);
    });
  });

  describe('does not block when type has no blockers but spec is present', () => {
    it('sequence with some spec is partial, not blocked', () => {
      const frame = makeFrame('sequence', { intent: 'x', durationEstimate: '2s' });
      const status = getCinematicBeatStatus(frame);
      expect(status.level).toBe('partial');
    });
  });
});

describe('getSequenceReadiness', () => {
  it('aggregates frame statuses', () => {
    const storyboard: Storyboard = {
      id: 'test',
      title: 'Test',
      frames: [
        makeFrame('shot', fullContent()),
        makeFrame('sequence', {}),
        makeFrame('dialogue', { intent: 'test', durationEstimate: '3s' }),
      ],
      connections: [],
    };
    const summary = getSequenceReadiness(storyboard);
    expect(summary.total).toBe(3);
    expect(summary.ready).toBe(1);
    expect(summary.draft).toBe(1);
    expect(summary.blocked).toBe(1);
  });

  it('exposes byFrame map and readyFraction — F-VR-004 parity', () => {
    // makeFrame keys by type — use distinct types so the Map has 4 entries.
    const storyboard: Storyboard = {
      id: 'test',
      title: 'Test',
      frames: [
        makeFrame('shot', fullContent()),
        makeFrame('sequence', fullContent()),
        makeFrame('dialogue', { dialogue: ['hi'], intent: 'x' }),
        makeFrame('edit_beat', {}),
      ],
      connections: [],
    };
    const summary = getSequenceReadiness(storyboard);

    expect(summary.byFrame).toBeInstanceOf(Map);
    expect(summary.byFrame.size).toBe(4);
    // Map keys round-trip frame ids; values are full BeatStatus records.
    const first = summary.byFrame.get('frame-shot');
    expect(first?.level).toBe('ready');
    expect(typeof first?.assetCount).toBe('number');

    // readyFraction = ready / total
    expect(summary.readyFraction).toBeCloseTo(summary.ready / summary.total, 6);
  });

  it('readyFraction is 0 on empty storyboards (no division by zero)', () => {
    const storyboard: Storyboard = {
      id: 'empty',
      title: 'Empty',
      frames: [],
      connections: [],
    };
    const summary = getSequenceReadiness(storyboard);
    expect(summary.total).toBe(0);
    expect(summary.readyFraction).toBe(0);
  });
});
