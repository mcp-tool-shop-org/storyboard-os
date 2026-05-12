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
    expect(t).toBeDefined();
    expect(t?.name).toBe('Trailer Flow');
  });

  // F-VR-205 API drift fix: cinematic now matches marketing+rpg parity.
  // getCinematicTemplate returns undefined for an unknown id; the throwing
  // behavior moved to createCinematicStoryboard, which still throws.
  it('returns undefined for unknown id — F-VR-205 parity', () => {
    const t = getCinematicTemplate('nope' as any);
    expect(t).toBeUndefined();
  });
});

describe('createCinematicStoryboard', () => {
  it('creates a storyboard from template id', () => {
    const sb = createCinematicStoryboard('cutscene_sequence');
    expect(sb.frames.length).toBe(6);
    expect(sb.title).toContain('Cutscene');
  });

  it('throws on an unknown template id — F-VR-205', () => {
    expect(() => createCinematicStoryboard('fake' as any)).toThrow('Unknown cinematic template');
  });

  // F-VR-204: frame ids must be unique per invocation, just like connection ids.
  // Two calls to the same template used to produce frames with identical ids
  // (e.g. two 'trailer-hook' frames), which would collide if both storyboards
  // lived in the same canvas or project.
  it('produces unique frame ids across repeated invocations — F-VR-204', () => {
    const a = createCinematicStoryboard('trailer_flow');
    const b = createCinematicStoryboard('trailer_flow');
    const idsA = new Set(a.frames.map(f => f.id));
    const idsB = new Set(b.frames.map(f => f.id));
    for (const id of idsA) {
      expect(idsB.has(id)).toBe(false);
    }
  });

  it('produces unique frame ids across different templates in one process — F-VR-204', () => {
    const trailer = createCinematicStoryboard('trailer_flow');
    const cutscene = createCinematicStoryboard('cutscene_sequence');
    const explainer = createCinematicStoryboard('explainer_video');
    const all = [
      ...trailer.frames.map(f => f.id),
      ...cutscene.frames.map(f => f.id),
      ...explainer.frames.map(f => f.id),
    ];
    expect(new Set(all).size).toBe(all.length);
  });

  it('produces unique connection ids across repeated invocations', () => {
    const a = createCinematicStoryboard('cutscene_sequence');
    const b = createCinematicStoryboard('cutscene_sequence');
    const idsA = new Set(a.connections.map(c => c.id));
    const idsB = new Set(b.connections.map(c => c.id));
    for (const id of idsA) {
      expect(idsB.has(id)).toBe(false);
    }
  });
});
