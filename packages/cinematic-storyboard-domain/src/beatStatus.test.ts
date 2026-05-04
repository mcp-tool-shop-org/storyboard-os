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
  });

  describe('draft detection', () => {
    it('returns draft when no spec fields are populated', () => {
      const frame = makeFrame('sequence', {});
      const status = getCinematicBeatStatus(frame);
      expect(status.level).toBe('draft');
    });
  });

  describe('partial detection', () => {
    it('returns partial when some spec fields present but < 4', () => {
      const frame = makeFrame('shot', {
        visualDescription: 'Has visual',
        intent: 'Has intent',
        durationEstimate: '3s',
      });
      const status = getCinematicBeatStatus(frame);
      expect(status.level).toBe('partial');
    });
  });

  describe('ready detection', () => {
    it('returns ready when >= 4 spec fields', () => {
      const frame = makeFrame('shot', fullContent());
      const status = getCinematicBeatStatus(frame);
      expect(status.level).toBe('ready');
    });

    it('sequence frames with 4+ spec fields are ready (no blockers)', () => {
      const frame = makeFrame('sequence', fullContent());
      const status = getCinematicBeatStatus(frame);
      expect(status.level).toBe('ready');
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
});
