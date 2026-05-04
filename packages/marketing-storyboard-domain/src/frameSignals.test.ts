// ─── marketing-domain / frameSignals.test.ts ─────────────────────────────────

import { describe, it, expect } from 'vitest';
import { getMarketingFrameSignal, getMarketingFrameBadges, getSegmentPathCount } from './frameSignals';
import type { StoryboardFrame, MarketingFrameContent } from './schema';

function makeFrame(
  type: string,
  content: Partial<MarketingFrameContent> = {},
): StoryboardFrame {
  return {
    id: `frame-${type}`,
    type: type as any,
    title: `Test ${type}`,
    summary: `A test ${type} frame`,
    position: { x: 0, y: 0 },
    size: { width: 260, height: 160 },
    content: content as MarketingFrameContent,
    annotations: [],
  };
}

describe('getMarketingFrameSignal', () => {
  it('returns customerStateSummary from first customerStateAfter entry', () => {
    const frame = makeFrame('audience', {
      customerStateAfter: ['Aware of product', 'Interested'],
    });
    const signal = getMarketingFrameSignal(frame);
    expect(signal.customerStateSummary).toBe('Aware of product (+1)');
  });

  it('returns null customerStateSummary when no customerStateAfter', () => {
    const frame = makeFrame('audience', {});
    const signal = getMarketingFrameSignal(frame);
    expect(signal.customerStateSummary).toBeNull();
  });

  it('returns channelSummary from channel field', () => {
    const frame = makeFrame('touchpoint', { channel: 'Email' });
    const signal = getMarketingFrameSignal(frame);
    expect(signal.channelSummary).toBe('Email');
  });

  it('returns null channelSummary when no channel', () => {
    const frame = makeFrame('touchpoint', {});
    const signal = getMarketingFrameSignal(frame);
    expect(signal.channelSummary).toBeNull();
  });

  it('computes readiness: ready when 3+ fields present', () => {
    const frame = makeFrame('audience', {
      objective: 'Test',
      implementationChecklist: ['Task'],
      requiredAssets: ['Asset'],
      testCriteria: ['Criterion'],
    });
    const signal = getMarketingFrameSignal(frame);
    expect(signal.readiness).toBe('ready');
  });

  it('computes readiness: partial when 1-2 fields present', () => {
    const frame = makeFrame('audience', { objective: 'Test' });
    const signal = getMarketingFrameSignal(frame);
    expect(signal.readiness).toBe('partial');
  });

  it('computes readiness: incomplete when no fields present', () => {
    const frame = makeFrame('audience', {});
    const signal = getMarketingFrameSignal(frame);
    expect(signal.readiness).toBe('incomplete');
  });

  it('reports hasMetrics', () => {
    const frame = makeFrame('measurement', { metrics: ['M1'] });
    expect(getMarketingFrameSignal(frame).hasMetrics).toBe(true);
  });

  it('reports hasConversionGoal', () => {
    const frame = makeFrame('conversion', { conversionGoal: 'Signup' });
    expect(getMarketingFrameSignal(frame).hasConversionGoal).toBe(true);
  });
});

describe('getMarketingFrameBadges', () => {
  it('includes STATE badge when customerStateAfter present', () => {
    const frame = makeFrame('audience', { customerStateAfter: ['Aware'] });
    const badges = getMarketingFrameBadges(frame, []);
    expect(badges.some(b => b.text === 'STATE')).toBe(true);
  });

  it('includes GATE badge when approvalRequirements present', () => {
    const frame = makeFrame('approval', { approvalRequirements: ['Legal sign-off'] });
    const badges = getMarketingFrameBadges(frame, []);
    expect(badges.some(b => b.text === 'GATE')).toBe(true);
  });

  it('includes SPEC badge when ready', () => {
    const frame = makeFrame('audience', {
      objective: 'Test',
      implementationChecklist: ['Task'],
      requiredAssets: ['Asset'],
      testCriteria: ['Criterion'],
    });
    const badges = getMarketingFrameBadges(frame, []);
    expect(badges.some(b => b.text === 'SPEC')).toBe(true);
  });

  it('includes PARTIAL badge when partial', () => {
    const frame = makeFrame('audience', { objective: 'Test' });
    const badges = getMarketingFrameBadges(frame, []);
    expect(badges.some(b => b.text === 'PARTIAL')).toBe(true);
  });

  it('includes DRAFT badge when incomplete', () => {
    const frame = makeFrame('audience', {});
    const badges = getMarketingFrameBadges(frame, []);
    expect(badges.some(b => b.text === 'DRAFT')).toBe(true);
  });
});

describe('getSegmentPathCount', () => {
  it('returns count of choice-type outgoing connections for audience frames', () => {
    const frame = makeFrame('audience', {});
    frame.id = 'aud-1';
    const connections = [
      { id: 'c1', fromFrameId: 'aud-1', toFrameId: 'msg-1', type: 'choice' as const },
      { id: 'c2', fromFrameId: 'aud-1', toFrameId: 'msg-2', type: 'choice' as const },
      { id: 'c3', fromFrameId: 'aud-1', toFrameId: 'msg-3', type: 'sequence' as const },
    ];
    expect(getSegmentPathCount(frame, connections)).toBe(2);
  });

  it('returns 0 for non-audience frames', () => {
    const frame = makeFrame('message', {});
    expect(getSegmentPathCount(frame, [])).toBe(0);
  });
});
