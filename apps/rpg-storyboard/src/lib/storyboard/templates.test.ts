import { describe, it, expect } from 'vitest';
import {
  STORYBOARD_TEMPLATES,
  getStoryboardTemplate,
  createStoryboardFromTemplate,
} from './templates';
import { validateStoryboard } from './validate';

const INPUT = { id: 'test', title: 'Test Board', description: 'Vitest fixture' };

// ─── Registry ────────────────────────────────────────────────────────────────

describe('STORYBOARD_TEMPLATES', () => {
  it('defines all three templates', () => {
    const ids = STORYBOARD_TEMPLATES.map(t => t.id);
    expect(ids).toContain('quest_flow');
    expect(ids).toContain('quest_branch');
    expect(ids).toContain('cutscene_beat');
    expect(ids).toHaveLength(3);
  });

  it('each template has required metadata fields', () => {
    for (const t of STORYBOARD_TEMPLATES) {
      expect(t.id).toBeTruthy();
      expect(t.name).toBeTruthy();
      expect(t.description).toBeTruthy();
      expect(typeof t.frameCount).toBe('number');
      expect(t.bestFor).toBeTruthy();
      expect(typeof t.createStoryboard).toBe('function');
    }
  });
});

// ─── getStoryboardTemplate ────────────────────────────────────────────────────

describe('getStoryboardTemplate', () => {
  it('returns the template by id', () => {
    const t = getStoryboardTemplate('quest_flow');
    expect(t).toBeDefined();
    expect(t?.id).toBe('quest_flow');
  });

  it('returns undefined for an unknown id', () => {
    const t = getStoryboardTemplate('nonexistent' as never);
    expect(t).toBeUndefined();
  });
});

// ─── createStoryboardFromTemplate ────────────────────────────────────────────

describe('createStoryboardFromTemplate', () => {
  it('throws on an unknown template id', () => {
    expect(() => createStoryboardFromTemplate('bad_id' as never, INPUT)).toThrow();
  });

  // ── Quest Flow ──────────────────────────────────────────────────────────────

  describe('quest_flow', () => {
    const sb = createStoryboardFromTemplate('quest_flow', INPUT);

    it('produces 8 frames', () => {
      expect(sb.frames).toHaveLength(8);
    });

    it('sets templateId', () => {
      expect(sb.templateId).toBe('quest_flow');
    });

    it('passes validateStoryboard', () => {
      const result = validateStoryboard(sb);
      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('includes the RPG-required frame types', () => {
      const types = sb.frames.map(f => f.type);
      expect(types).toContain('hook');
      expect(types).toContain('scene');
      expect(types).toContain('npc_beat');
      expect(types).toContain('choice');
      expect(types).toContain('encounter');
      expect(types).toContain('reveal');
      expect(types).toContain('consequence');
    });

    it('has a linear sequence of connections', () => {
      expect(sb.connections.length).toBe(7);
      const sequenceConns = sb.connections.filter(c => c.type === 'sequence');
      expect(sequenceConns.length).toBeGreaterThanOrEqual(4);
    });

    it('has no broken connection references', () => {
      const result = validateStoryboard(sb);
      const brokenErrors = result.errors.filter(e => e.code.startsWith('BROKEN'));
      expect(brokenErrors).toHaveLength(0);
    });

    it('every frame has a non-empty title, summary, and designerNotes', () => {
      for (const frame of sb.frames) {
        expect(frame.title.trim()).not.toBe('');
        expect(frame.summary.trim()).not.toBe('');
        expect(frame.content.designerNotes?.trim()).not.toBe('');
      }
    });

    it('frame count matches template metadata', () => {
      const tmpl = getStoryboardTemplate('quest_flow')!;
      expect(sb.frames).toHaveLength(tmpl.frameCount);
    });
  });

  // ── Quest Branch ────────────────────────────────────────────────────────────

  describe('quest_branch', () => {
    const sb = createStoryboardFromTemplate('quest_branch', INPUT);

    it('produces 7 frames', () => {
      expect(sb.frames).toHaveLength(7);
    });

    it('sets templateId', () => {
      expect(sb.templateId).toBe('quest_branch');
    });

    it('passes validateStoryboard', () => {
      const result = validateStoryboard(sb);
      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('has at least 3 choice-typed connections', () => {
      const choiceConns = sb.connections.filter(c => c.type === 'choice');
      expect(choiceConns.length).toBeGreaterThanOrEqual(3);
    });

    it('has a choice frame with 3 outgoing connections', () => {
      const choiceFrame = sb.frames.find(f => f.type === 'choice');
      expect(choiceFrame).toBeDefined();
      const outgoing = sb.connections.filter(c => c.fromFrameId === choiceFrame!.id);
      expect(outgoing.length).toBeGreaterThanOrEqual(3);
    });

    it('all three paths connect to a convergence frame', () => {
      const consecConns = sb.connections.filter(c => c.type === 'consequence');
      expect(consecConns.length).toBeGreaterThanOrEqual(3);
    });

    it('has no broken connection references', () => {
      const result = validateStoryboard(sb);
      const brokenErrors = result.errors.filter(e => e.code.startsWith('BROKEN'));
      expect(brokenErrors).toHaveLength(0);
    });

    it('frame count matches template metadata', () => {
      const tmpl = getStoryboardTemplate('quest_branch')!;
      expect(sb.frames).toHaveLength(tmpl.frameCount);
    });
  });

  // ── Cutscene Beat ───────────────────────────────────────────────────────────

  describe('cutscene_beat', () => {
    const sb = createStoryboardFromTemplate('cutscene_beat', INPUT);

    it('produces 5 frames', () => {
      expect(sb.frames).toHaveLength(5);
    });

    it('sets templateId', () => {
      expect(sb.templateId).toBe('cutscene_beat');
    });

    it('passes validateStoryboard', () => {
      const result = validateStoryboard(sb);
      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('includes a choice frame for player response', () => {
      const types = sb.frames.map(f => f.type);
      expect(types).toContain('choice');
    });

    it('includes a reveal frame', () => {
      const types = sb.frames.map(f => f.type);
      expect(types).toContain('reveal');
    });

    it('includes an npc_beat frame', () => {
      const types = sb.frames.map(f => f.type);
      expect(types).toContain('npc_beat');
    });

    it('ends with a consequence frame', () => {
      const last = sb.frames[sb.frames.length - 1];
      expect(last.type).toBe('consequence');
    });

    it('has no broken connection references', () => {
      const result = validateStoryboard(sb);
      const brokenErrors = result.errors.filter(e => e.code.startsWith('BROKEN'));
      expect(brokenErrors).toHaveLength(0);
    });

    it('frame count matches template metadata', () => {
      const tmpl = getStoryboardTemplate('cutscene_beat')!;
      expect(sb.frames).toHaveLength(tmpl.frameCount);
    });
  });

  // ── Cross-template invariants ────────────────────────────────────────────────

  describe('all templates', () => {
    const templateIds = ['quest_flow', 'quest_branch', 'cutscene_beat'] as const;

    for (const tid of templateIds) {
      it(`${tid}: each frame has position and valid size`, () => {
        const sb = createStoryboardFromTemplate(tid, INPUT);
        for (const frame of sb.frames) {
          expect(typeof frame.position.x).toBe('number');
          expect(typeof frame.position.y).toBe('number');
          expect(frame.size.width).toBeGreaterThan(0);
          expect(frame.size.height).toBeGreaterThan(0);
        }
      });

      it(`${tid}: no duplicate frame IDs`, () => {
        const sb = createStoryboardFromTemplate(tid, INPUT);
        const ids = sb.frames.map(f => f.id);
        const unique = new Set(ids);
        expect(unique.size).toBe(ids.length);
      });

      it(`${tid}: all frames have at least one annotation`, () => {
        const sb = createStoryboardFromTemplate(tid, INPUT);
        for (const frame of sb.frames) {
          expect(frame.annotations.length).toBeGreaterThan(0);
        }
      });

      it(`${tid}: storyboard id matches input id`, () => {
        const sb = createStoryboardFromTemplate(tid, INPUT);
        expect(sb.id).toBe(INPUT.id);
      });

      it(`${tid}: canvas-renderable without adapter`, () => {
        const sb = createStoryboardFromTemplate(tid, INPUT);
        expect(Array.isArray(sb.frames)).toBe(true);
        expect(Array.isArray(sb.connections)).toBe(true);
      });

      // ── 0R GUARDRAIL TESTS ────────────────────────────────────────────────

      it(`${tid}: every frame has implementationChecklist with at least one item`, () => {
        const sb = createStoryboardFromTemplate(tid, INPUT);
        for (const frame of sb.frames) {
          expect(frame.content.implementationChecklist).toBeDefined();
          expect(frame.content.implementationChecklist!.length).toBeGreaterThan(0);
        }
      });

      it(`${tid}: every frame has requiredAssets with at least one item`, () => {
        const sb = createStoryboardFromTemplate(tid, INPUT);
        for (const frame of sb.frames) {
          expect(frame.content.requiredAssets).toBeDefined();
          expect(frame.content.requiredAssets!.length).toBeGreaterThan(0);
        }
      });

      it(`${tid}: every connection has a non-empty label`, () => {
        const sb = createStoryboardFromTemplate(tid, INPUT);
        for (const conn of sb.connections) {
          expect(conn.label).toBeDefined();
          expect(conn.label!.trim()).not.toBe('');
        }
      });

      it(`${tid}: choice frames have stateChanges defined`, () => {
        const sb = createStoryboardFromTemplate(tid, INPUT);
        const choiceFrames = sb.frames.filter(f => f.type === 'choice');
        for (const frame of choiceFrames) {
          expect(frame.content.stateChanges).toBeDefined();
          expect(frame.content.stateChanges!.length).toBeGreaterThan(0);
        }
      });

      it(`${tid}: consequence frames have stateChanges defined`, () => {
        const sb = createStoryboardFromTemplate(tid, INPUT);
        const consecFrames = sb.frames.filter(f => f.type === 'consequence');
        for (const frame of consecFrames) {
          expect(frame.content.stateChanges).toBeDefined();
          expect(frame.content.stateChanges!.length).toBeGreaterThan(0);
        }
      });

      it(`${tid}: reveal frames have stateChanges or entryConditions`, () => {
        const sb = createStoryboardFromTemplate(tid, INPUT);
        const revealFrames = sb.frames.filter(f => f.type === 'reveal');
        for (const frame of revealFrames) {
          const hasState = (frame.content.stateChanges?.length ?? 0) > 0;
          const hasConds = (frame.content.entryConditions?.length ?? 0) > 0;
          expect(hasState || hasConds).toBe(true);
        }
      });

      it(`${tid}: testCriteria defined on at least half of frames`, () => {
        const sb = createStoryboardFromTemplate(tid, INPUT);
        const withCriteria = sb.frames.filter(
          f => (f.content.testCriteria?.length ?? 0) > 0
        );
        expect(withCriteria.length).toBeGreaterThanOrEqual(
          Math.ceil(sb.frames.length / 2)
        );
      });

      it(`${tid}: no frame content contains tabletop drift terms`, () => {
        const driftTerms = ['gm notes', 'prep session', 'at the table', 'tabletop', 'campaign prep', 'run a session'];
        const sb = createStoryboardFromTemplate(tid, INPUT);
        for (const frame of sb.frames) {
          const contentStr = JSON.stringify(frame.content).toLowerCase();
          for (const term of driftTerms) {
            expect(contentStr, `Frame "${frame.id}" contains drift term "${term}"`).not.toContain(term);
          }
        }
      });
    }
  });
});
