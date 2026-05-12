// ─── cinematic-domain / validate.test.ts ─────────────────────────────────────

import { describe, it, expect } from 'vitest';
import { validateCinematicStoryboard } from './validate';
import type { Storyboard, StoryboardFrame, CinematicFrameContent } from './schema';

function makeFrame(
  id: string,
  type: string,
  content: Partial<CinematicFrameContent> = {},
): StoryboardFrame {
  return {
    id,
    type: type as any,
    title: `Frame ${id}`,
    summary: `Summary for ${id}`,
    position: { x: 0, y: 0 },
    size: { width: 220, height: 140 },
    content: content as CinematicFrameContent,
    annotations: [],
  };
}

function makeStoryboard(frames: StoryboardFrame[]): Storyboard {
  return { id: 'test', title: 'Test', frames, connections: [] };
}

describe('validateCinematicStoryboard', () => {
  describe('structural validation (from core)', () => {
    it('reports empty storyboard', () => {
      const result = validateCinematicStoryboard({ id: 'x', title: 'X', frames: [], connections: [] });
      expect(result.valid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
      expect(result.errors.some(e => e.code === 'EMPTY_STORYBOARD')).toBe(true);
    });

    it('reports duplicate frame IDs', () => {
      const sb = makeStoryboard([
        makeFrame('dup', 'shot', { visualDescription: 'x' }),
        makeFrame('dup', 'sequence'),
      ]);
      const result = validateCinematicStoryboard(sb);
      expect(result.valid).toBe(false);
      const dup = result.errors.find(e => e.code === 'DUPLICATE_FRAME_ID');
      expect(dup).toBeDefined();
      expect(dup?.frameId).toBe('dup');
      expect(dup?.message.toLowerCase()).toContain('duplicate');
    });
  });

  describe('domain validation', () => {
    it('fails when shot missing visualDescription', () => {
      const sb = makeStoryboard([makeFrame('s1', 'shot', {})]);
      const result = validateCinematicStoryboard(sb);
      expect(result.valid).toBe(false);
      const err = result.errors.find(e => e.code === 'CINEMATIC_SHOT_MISSING_VISUAL_DESCRIPTION');
      expect(err).toBeDefined();
      expect(err?.frameId).toBe('s1');
      expect(err?.message).toContain('visualDescription');
    });

    it('fails when camera_move missing cameraMovement', () => {
      const sb = makeStoryboard([makeFrame('c1', 'camera_move', {})]);
      const result = validateCinematicStoryboard(sb);
      expect(result.valid).toBe(false);
      const err = result.errors.find(e => e.code === 'CINEMATIC_CAMERA_MOVE_MISSING_MOVEMENT');
      expect(err).toBeDefined();
      expect(err?.frameId).toBe('c1');
    });

    it('fails when dialogue missing dialogue array', () => {
      const sb = makeStoryboard([makeFrame('d1', 'dialogue', {})]);
      const result = validateCinematicStoryboard(sb);
      expect(result.valid).toBe(false);
      const err = result.errors.find(e => e.code === 'CINEMATIC_DIALOGUE_MISSING_LINES');
      expect(err).toBeDefined();
      expect(err?.frameId).toBe('d1');
    });

    it('fails when action missing actionNotes', () => {
      const sb = makeStoryboard([makeFrame('a1', 'action', {})]);
      const result = validateCinematicStoryboard(sb);
      expect(result.valid).toBe(false);
      const err = result.errors.find(e => e.code === 'CINEMATIC_ACTION_MISSING_NOTES');
      expect(err).toBeDefined();
      expect(err?.frameId).toBe('a1');
    });

    it('fails when transition missing editNotes', () => {
      const sb = makeStoryboard([makeFrame('t1', 'transition', {})]);
      const result = validateCinematicStoryboard(sb);
      expect(result.valid).toBe(false);
      const err = result.errors.find(e => e.code === 'CINEMATIC_TRANSITION_MISSING_EDIT_NOTES');
      expect(err).toBeDefined();
      expect(err?.frameId).toBe('t1');
    });

    it('fails when vfx missing vfxRequirements', () => {
      const sb = makeStoryboard([makeFrame('v1', 'vfx', {})]);
      const result = validateCinematicStoryboard(sb);
      expect(result.valid).toBe(false);
      const err = result.errors.find(e => e.code === 'CINEMATIC_VFX_MISSING_REQUIREMENTS');
      expect(err).toBeDefined();
      expect(err?.frameId).toBe('v1');
    });

    it('fails when audio missing audioRequirements', () => {
      const sb = makeStoryboard([makeFrame('au1', 'audio', {})]);
      const result = validateCinematicStoryboard(sb);
      expect(result.valid).toBe(false);
      const err = result.errors.find(e => e.code === 'CINEMATIC_AUDIO_MISSING_REQUIREMENTS');
      expect(err).toBeDefined();
      expect(err?.frameId).toBe('au1');
    });

    it('fails when edit_beat missing durationEstimate', () => {
      const sb = makeStoryboard([makeFrame('e1', 'edit_beat', {})]);
      const result = validateCinematicStoryboard(sb);
      expect(result.valid).toBe(false);
      const err = result.errors.find(e => e.code === 'CINEMATIC_EDIT_BEAT_MISSING_DURATION');
      expect(err).toBeDefined();
      expect(err?.frameId).toBe('e1');
    });

    it('passes with valid frames', () => {
      const sb = makeStoryboard([
        makeFrame('s1', 'shot', { visualDescription: 'Visual' }),
        makeFrame('s2', 'sequence'),
        makeFrame('d1', 'dialogue', { dialogue: ['Hello'] }),
        makeFrame('c1', 'camera_move', { cameraMovement: 'Pan' }),
        makeFrame('a1', 'action', { actionNotes: ['Run'] }),
        makeFrame('t1', 'transition', { editNotes: 'Cut to black' }),
        makeFrame('v1', 'vfx', { vfxRequirements: ['Particles'] }),
        makeFrame('au1', 'audio', { audioRequirements: ['Music'] }),
        makeFrame('e1', 'edit_beat', { durationEstimate: '3s' }),
      ]);
      const result = validateCinematicStoryboard(sb);
      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('returns errors with the shared StoryboardValidationError shape', () => {
      const sb = makeStoryboard([makeFrame('s1', 'shot', {})]);
      const result = validateCinematicStoryboard(sb);
      expect(result.valid).toBe(false);
      // Shape parity with rpg / marketing domains: code + message + frameId.
      const err = result.errors[0];
      expect(typeof err.code).toBe('string');
      expect(typeof err.message).toBe('string');
      expect(err.frameId).toBeDefined();
      // No legacy `reason` field.
      expect((err as any).reason).toBeUndefined();
    });
  });
});
