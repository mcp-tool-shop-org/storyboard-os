// ─── cinematic-domain / templates.test.ts ────────────────────────────────────

import { describe, it, expect } from 'vitest';
import {
  CINEMATIC_TEMPLATES,
  getCinematicTemplate,
  createCinematicStoryboard,
} from './templates';
import { validateCinematicStoryboard } from './validate';
import { getCinematicBeatStatus } from './beatStatus';
import type { CinematicFrameType } from './schema';

const VALID_FRAME_TYPES: CinematicFrameType[] = [
  'sequence', 'shot', 'camera_move', 'action', 'dialogue',
  'transition', 'vfx', 'audio', 'edit_beat',
];

describe('CINEMATIC_TEMPLATES', () => {
  it('has exactly three templates', () => {
    expect(CINEMATIC_TEMPLATES).toHaveLength(3);
  });

  it('each template has a unique id', () => {
    const ids = CINEMATIC_TEMPLATES.map(t => t.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('each template has name and rationale', () => {
    for (const template of CINEMATIC_TEMPLATES) {
      expect(template.name.length).toBeGreaterThan(0);
      expect(template.rationale.length).toBeGreaterThan(0);
    }
  });

  for (const template of CINEMATIC_TEMPLATES) {
    describe(`template: ${template.id}`, () => {
      const storyboard = template.createStoryboard();

      it('has 6 frames', () => {
        expect(storyboard.frames).toHaveLength(6);
      });

      it('has at least 5 connections', () => {
        expect(storyboard.connections.length).toBeGreaterThanOrEqual(5);
      });

      it('frameCount matches actual frame count', () => {
        expect(template.frameCount).toBe(storyboard.frames.length);
      });

      it('all frames have valid types', () => {
        for (const frame of storyboard.frames) {
          expect(VALID_FRAME_TYPES).toContain(frame.type);
        }
      });

      it('all frames have unique ids', () => {
        const ids = storyboard.frames.map(f => f.id);
        expect(new Set(ids).size).toBe(ids.length);
      });

      it('passes validation', () => {
        const result = validateCinematicStoryboard(storyboard);
        expect(result.valid).toBe(true);
      });

      it('no frames are in "blocked" state (all type-required fields present)', () => {
        for (const frame of storyboard.frames) {
          const status = getCinematicBeatStatus(frame);
          expect(status.level).not.toBe('blocked');
        }
      });

      it('all frames are "ready" (production-specced)', () => {
        for (const frame of storyboard.frames) {
          const status = getCinematicBeatStatus(frame);
          expect(status.level).toBe('ready');
        }
      });

      it('all connections reference existing frame ids', () => {
        const ids = new Set(storyboard.frames.map(f => f.id));
        for (const conn of storyboard.connections) {
          expect(ids.has(conn.fromFrameId)).toBe(true);
          expect(ids.has(conn.toFrameId)).toBe(true);
        }
      });
    });
  }
});

describe('getCinematicTemplate', () => {
  it('returns template by id', () => {
    const t = getCinematicTemplate('trailer_flow');
    expect(t.name).toBe('Trailer Flow');
  });

  it('throws for unknown id', () => {
    expect(() => getCinematicTemplate('nope' as any)).toThrow();
  });
});

describe('createCinematicStoryboard', () => {
  it('creates a storyboard from template id', () => {
    const sb = createCinematicStoryboard('cutscene_sequence');
    expect(sb.frames.length).toBe(6);
    expect(sb.title).toContain('Cutscene');
  });
});
