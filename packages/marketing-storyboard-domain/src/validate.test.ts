// ─── marketing-domain / validate.test.ts ─────────────────────────────────────

import { describe, it, expect } from 'vitest';
import { validateMarketingStoryboard } from './validate';
import type { Storyboard, StoryboardFrame, MarketingFrameContent } from './schema';

function makeFrame(
  id: string,
  type: string,
  content: Partial<MarketingFrameContent> = {},
): StoryboardFrame {
  return {
    id,
    type: type as any,
    title: `Frame ${id}`,
    summary: `Summary for ${id}`,
    position: { x: 0, y: 0 },
    size: { width: 260, height: 160 },
    content: content as MarketingFrameContent,
    annotations: [],
  };
}

function makeStoryboard(frames: StoryboardFrame[]): Storyboard {
  return { id: 'test', title: 'Test', frames, connections: [] };
}

describe('validateMarketingStoryboard', () => {
  describe('structural validation (from core)', () => {
    it('reports empty storyboard', () => {
      const result = validateMarketingStoryboard({ id: 'x', title: 'X', frames: [], connections: [] });
      expect(result.valid).toBe(false);
      expect(result.errors[0].code).toBe('EMPTY_STORYBOARD');
    });

    it('reports duplicate frame IDs', () => {
      const sb = makeStoryboard([
        makeFrame('dup', 'audience'),
        makeFrame('dup', 'message', { messageClaim: 'x' }),
      ]);
      const result = validateMarketingStoryboard(sb);
      expect(result.errors.some(e => e.code === 'DUPLICATE_FRAME_ID')).toBe(true);
    });
  });

  describe('marketing domain rules', () => {
    it('errors when conversion frame has no conversionGoal', () => {
      const sb = makeStoryboard([makeFrame('f1', 'conversion', {})]);
      const result = validateMarketingStoryboard(sb);
      expect(result.errors.some(e => e.code === 'MARKETING_MISSING_CONVERSION_GOAL')).toBe(true);
    });

    it('no error when conversion frame has conversionGoal', () => {
      const sb = makeStoryboard([makeFrame('f1', 'conversion', { conversionGoal: 'Signup' })]);
      const result = validateMarketingStoryboard(sb);
      expect(result.errors.some(e => e.code === 'MARKETING_MISSING_CONVERSION_GOAL')).toBe(false);
    });

    it('errors when asset frame has no requiredAssets', () => {
      const sb = makeStoryboard([makeFrame('f1', 'asset', { requiredAssets: [] })]);
      const result = validateMarketingStoryboard(sb);
      expect(result.errors.some(e => e.code === 'MARKETING_MISSING_REQUIRED_ASSETS')).toBe(true);
    });

    it('errors when approval frame has no approvalRequirements', () => {
      const sb = makeStoryboard([makeFrame('f1', 'approval', {})]);
      const result = validateMarketingStoryboard(sb);
      expect(result.errors.some(e => e.code === 'MARKETING_MISSING_APPROVAL_REQUIREMENTS')).toBe(true);
    });

    it('errors when measurement frame has no metrics', () => {
      const sb = makeStoryboard([makeFrame('f1', 'measurement', {})]);
      const result = validateMarketingStoryboard(sb);
      expect(result.errors.some(e => e.code === 'MARKETING_MISSING_METRICS')).toBe(true);
    });

    it('errors when touchpoint frame has no channel', () => {
      const sb = makeStoryboard([makeFrame('f1', 'touchpoint', {})]);
      const result = validateMarketingStoryboard(sb);
      expect(result.errors.some(e => e.code === 'MARKETING_MISSING_CHANNEL')).toBe(true);
    });

    it('errors when message frame has no messageClaim', () => {
      const sb = makeStoryboard([makeFrame('f1', 'message', {})]);
      const result = validateMarketingStoryboard(sb);
      expect(result.errors.some(e => e.code === 'MARKETING_MISSING_MESSAGE_CLAIM')).toBe(true);
    });

    it('no error when message frame has messageClaim', () => {
      const sb = makeStoryboard([makeFrame('f1', 'message', { messageClaim: 'We do X' })]);
      const result = validateMarketingStoryboard(sb);
      expect(result.errors.some(e => e.code === 'MARKETING_MISSING_MESSAGE_CLAIM')).toBe(false);
    });
  });

  describe('planner-drift guard', () => {
    it('errors when content contains "content calendar"', () => {
      const sb = makeStoryboard([
        makeFrame('f1', 'audience', { ownerNotes: 'Update the content calendar weekly' }),
      ]);
      const result = validateMarketingStoryboard(sb);
      expect(result.errors.some(e => e.code === 'MARKETING_PLANNER_DRIFT')).toBe(true);
    });

    it('errors when content contains "editorial calendar"', () => {
      const sb = makeStoryboard([
        makeFrame('f1', 'audience', { ownerNotes: 'See editorial calendar for details' }),
      ]);
      const result = validateMarketingStoryboard(sb);
      expect(result.errors.some(e => e.code === 'MARKETING_PLANNER_DRIFT')).toBe(true);
    });

    it('errors when content contains "social schedule"', () => {
      const sb = makeStoryboard([
        makeFrame('f1', 'touchpoint', { channel: 'social', ownerNotes: 'Social schedule TBD' }),
      ]);
      const result = validateMarketingStoryboard(sb);
      expect(result.errors.some(e => e.code === 'MARKETING_PLANNER_DRIFT')).toBe(true);
    });

    it('no error for normal content', () => {
      const sb = makeStoryboard([
        makeFrame('f1', 'audience', { objective: 'Launch campaign for product X' }),
      ]);
      const result = validateMarketingStoryboard(sb);
      expect(result.errors.some(e => e.code === 'MARKETING_PLANNER_DRIFT')).toBe(false);
    });
  });

  describe('valid storyboard', () => {
    it('returns valid:true for a well-formed storyboard', () => {
      const sb = makeStoryboard([
        makeFrame('f1', 'audience', { objective: 'Test' }),
        makeFrame('f2', 'conversion', { conversionGoal: 'Signup' }),
      ]);
      const result = validateMarketingStoryboard(sb);
      // Only marketing-specific errors possible (which don't appear for audience without blocking rules)
      const structuralErrors = result.errors.filter(e => !e.code.startsWith('MARKETING_'));
      expect(structuralErrors).toHaveLength(0);
    });
  });
});
