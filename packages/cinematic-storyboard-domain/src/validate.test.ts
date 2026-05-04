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
    });

    it('reports duplicate frame IDs', () => {
      const sb = makeStoryboard([
        makeFrame('dup', 'shot', { visualDescription: 'x' }),
        makeFrame('dup', 'sequence'),
      ]);
      const result = validateCinematicStoryboard(sb);
      expect(result.valid).toBe(false);
      expect(result.errors.some(e => e.reason.toLowerCase().includes('duplicate'))).toBe(true);
    });
  });

  describe('domain validation', () => {
    it('fails when shot missing visualDescription', () => {
      const sb = makeStoryboard([makeFrame('s1', 'shot', {})]);
      const result = validateCinematicStoryboard(sb);
      expect(result.valid).toBe(false);
      expect(result.errors.some(e => e.reason.includes('visualDescription'))).toBe(true);
    });

    it('fails when camera_move missing cameraMovement', () => {
      const sb = makeStoryboard([makeFrame('c1', 'camera_move', {})]);
      const result = validateCinematicStoryboard(sb);
      expect(result.valid).toBe(false);
      expect(result.errors.some(e => e.reason.includes('cameraMovement'))).toBe(true);
    });

    it('fails when dialogue missing dialogue array', () => {
      const sb = makeStoryboard([makeFrame('d1', 'dialogue', {})]);
      const result = validateCinematicStoryboard(sb);
      expect(result.valid).toBe(false);
      expect(result.errors.some(e => e.reason.includes('dialogue'))).toBe(true);
    });

    it('fails when action missing actionNotes', () => {
      const sb = makeStoryboard([makeFrame('a1', 'action', {})]);
      const result = validateCinematicStoryboard(sb);
      expect(result.valid).toBe(false);
      expect(result.errors.some(e => e.reason.includes('actionNotes'))).toBe(true);
    });

    it('fails when transition missing editNotes', () => {
      const sb = makeStoryboard([makeFrame('t1', 'transition', {})]);
      const result = validateCinematicStoryboard(sb);
      expect(result.valid).toBe(false);
      expect(result.errors.some(e => e.reason.includes('editNotes'))).toBe(true);
    });

    it('fails when vfx missing vfxRequirements', () => {
      const sb = makeStoryboard([makeFrame('v1', 'vfx', {})]);
      const result = validateCinematicStoryboard(sb);
      expect(result.valid).toBe(false);
      expect(result.errors.some(e => e.reason.includes('vfxRequirements'))).toBe(true);
    });

    it('fails when audio missing audioRequirements', () => {
      const sb = makeStoryboard([makeFrame('au1', 'audio', {})]);
      const result = validateCinematicStoryboard(sb);
      expect(result.valid).toBe(false);
      expect(result.errors.some(e => e.reason.includes('audioRequirements'))).toBe(true);
    });

    it('fails when edit_beat missing durationEstimate', () => {
      const sb = makeStoryboard([makeFrame('e1', 'edit_beat', {})]);
      const result = validateCinematicStoryboard(sb);
      expect(result.valid).toBe(false);
      expect(result.errors.some(e => e.reason.includes('durationEstimate'))).toBe(true);
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
  });
});
