// ─── marketing-domain / frameSignals.test.ts ─────────────────────────────────

import { describe, it, expect } from 'vitest';
import { getMarketingFrameSignal, getMarketingCardLine, getMarketingFrameBadges, getSegmentPathCount, marketingColors } from './frameSignals';
import { statusColors, statusLabels } from '@storyboard-os/core';
import type { StoryboardFrame, MarketingFrameContent } from './schema';

function makeFrame(
    type: string,
    content: Partial<MarketingFrameContent> | null = {},
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

function fullContent(overrides: Partial<MarketingFrameContent> = {}): MarketingFrameContent {
    return {
        objective: 'Test objective',
        audienceSegment: 'Test segment',
        customerStateBefore: ['Before state'],
        customerStateAfter: ['After state'],
        channel: 'Email',
        messageClaim: 'Test claim',
        proofPoints: ['Proof 1'],
        objectionsHandled: ['Objection 1'],
        requiredAssets: ['Asset 1'],
        approvalRequirements: ['Approval 1'],
        launchDependencies: ['Dependency 1'],
        conversionGoal: 'Signup',
        metrics: ['Metric 1'],
        testCriteria: ['Criterion 1'],
        implementationChecklist: ['Task 1'],
        ownerNotes: 'Notes',
        ...overrides,
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

    it('getMarketingCardLine prefers channel, then customer state, then objective (F-6c0112b3)', () => {
        expect(getMarketingCardLine(makeFrame('touchpoint', { channel: 'GitHub README' })))
            .toBe('GitHub README');
        expect(getMarketingCardLine(makeFrame('audience', {
            customerStateAfter: ['Aware the board exists', 'Wants to try it'],
        }))).toBe('Aware the board exists (+1)');
        expect(getMarketingCardLine(makeFrame('message', {
            objective: 'Lock the single claim\nMore detail on the next line',
        }))).toBe('Lock the single claim');
        expect(getMarketingCardLine(makeFrame('message', {}))).toBe('');
    });

    it('computes readiness: ready when beat status is ready', () => {
        const frame = makeFrame('audience', fullContent());
        const signal = getMarketingFrameSignal(frame);
        expect(signal.readiness).toBe('ready');
    });

    it('computes readiness: partial when beat status is partial', () => {
        // ≤3 non-advisory spec gaps → partial (missing proofPoints/launchDependencies are advisory)
        const frame = makeFrame('audience', {
            objective: 'Test',
            audienceSegment: 'Segment',
            customerStateBefore: ['Before'],
            customerStateAfter: ['After'],
            // missing testCriteria + implementationChecklist (+ advisory) → 2 gaps → partial
        });
        const signal = getMarketingFrameSignal(frame);
        expect(signal.readiness).toBe('partial');
    });

    it('computes readiness: incomplete when no fields present (draft → incomplete)', () => {
        const frame = makeFrame('audience', {});
        const signal = getMarketingFrameSignal(frame);
        expect(signal.readiness).toBe('incomplete');
    });

    // F-2ac558f8 / RPG F-a6959b0e: signal.readiness must follow getCampaignBeatStatus.
    it('is incomplete (not ready) for a blocked conversion with full checklist score', () => {
        const frame = makeFrame('conversion', {
            objective: 'Drive signups',
            audienceSegment: 'Warm leads',
            customerStateBefore: ['Aware'],
            customerStateAfter: ['Converted'],
            implementationChecklist: ['Wire CTA'],
            requiredAssets: ['Landing hero'],
            testCriteria: ['CTA click tracked'],
            proofPoints: ['Proof'],
            launchDependencies: ['Landing live'],
            // no conversionGoal → getCampaignBeatStatus blocked
        });
        expect(getMarketingFrameSignal(frame).readiness).toBe('incomplete');
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
        const badges = getMarketingFrameBadges(frame);
        expect(badges.some(b => b.text === 'STATE')).toBe(true);
    });

    it('includes GATE badge when approvalRequirements present', () => {
        const frame = makeFrame('approval', { approvalRequirements: ['Legal sign-off'] });
        const badges = getMarketingFrameBadges(frame);
        expect(badges.some(b => b.text === 'GATE')).toBe(true);
    });

    it('includes SPEC badge when beat status is ready', () => {
        const frame = makeFrame('audience', fullContent());
        const badges = getMarketingFrameBadges(frame);
        expect(badges.some(b => b.text === 'SPEC')).toBe(true);
    });

    it('includes PARTIAL badge when beat status is partial', () => {
        const frame = makeFrame('audience', {
            objective: 'Test',
            audienceSegment: 'Segment',
            customerStateBefore: ['Before'],
            customerStateAfter: ['After'],
            // missing testCriteria, implementationChecklist → partial
        });
        const badges = getMarketingFrameBadges(frame);
        expect(badges.some(b => b.text === 'PARTIAL')).toBe(true);
    });

    it('includes DRAFT badge when beat status is draft', () => {
        const frame = makeFrame('audience', {});
        const badges = getMarketingFrameBadges(frame);
        expect(badges.some(b => b.text === 'DRAFT')).toBe(true);
    });

    it('conversion without conversionGoal must not emit a SPEC badge (F-3073a6a5)', () => {
        // Checklist + assets + tests + objective would previously paint SPEC via
        // computeReadiness while getCampaignBeatStatus correctly returns blocked.
        const frame = makeFrame('conversion', fullContent({ conversionGoal: undefined }));
        const badges = getMarketingFrameBadges(frame);
        expect(badges.some(b => b.text === 'SPEC')).toBe(false);
        expect(badges.some(b => b.text === statusLabels.blocked)).toBe(true);
    });

    it('conversion without conversionGoal emits BLOCKED even with a full implementation score', () => {
        const frame = makeFrame('conversion', {
            objective: 'Drive signups',
            implementationChecklist: ['Wire CTA'],
            requiredAssets: ['Landing hero'],
            testCriteria: ['CTA click tracked'],
            // no conversionGoal
        });
        const badges = getMarketingFrameBadges(frame);
        expect(badges.some(b => b.text === 'SPEC')).toBe(false);
        expect(badges.some(b => b.text === 'BLOCKED')).toBe(true);
    });
});

// ─── marketingColors contract (VP-001 / VP-002 refactor guard) ────────────────

describe('marketingColors', () => {
    it('GATE is amber #F59E0B, NOT red (VP-002 — red is reserved for blocked)', () => {
        expect(marketingColors.gate).toBe('#F59E0B');
        expect(marketingColors.gate).not.toBe(statusColors.blocked);
        expect(marketingColors.gate).not.toBe('#EF4444');
    });

    it('critical is #EAB308', () => {
        expect(marketingColors.critical).toBe('#EAB308');
    });

    it('shared swatches source from core statusColors', () => {
        expect(marketingColors.state).toBe(statusColors.state);
        expect(marketingColors.ready).toBe(statusColors.spec);
        expect(marketingColors.partial).toBe(statusColors.partial);
        expect(marketingColors.draft).toBe(statusColors.draft);
    });

    it('the GATE badge output uses the amber gate color, not red', () => {
        const frame = makeFrame('approval', { approvalRequirements: ['Legal sign-off'] });
        const gate = getMarketingFrameBadges(frame).find(b => b.text === 'GATE');
        expect(gate).toBeDefined();
        expect(gate!.color).toBe(marketingColors.gate);
        expect(gate!.color).not.toBe(statusColors.blocked);
    });

    it('a ready frame renders the canonical SPEC label + spec color', () => {
        const frame = makeFrame('audience', fullContent());
        const badge = getMarketingFrameBadges(frame).find(b => b.text === statusLabels.ready);
        expect(badge).toBeDefined();
        expect(badge!.color).toBe(statusColors.spec);
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
