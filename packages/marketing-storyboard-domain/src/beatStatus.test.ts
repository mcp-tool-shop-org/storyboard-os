// ─── marketing-domain / beatStatus.test.ts ───────────────────────────────────

import { describe, it, expect } from 'vitest';
import { getCampaignBeatStatus, getCampaignReadiness, BLOCKING_REASONS } from './beatStatus';
import type { StoryboardFrame, Storyboard, MarketingFrameContent } from './schema';

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

function fullContent(): MarketingFrameContent {
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
    };
}

describe('getCampaignBeatStatus', () => {
    describe('blocking rules', () => {
        it('blocks conversion frame without conversionGoal', () => {
            const frame = makeFrame('conversion', { ...fullContent(), conversionGoal: undefined });
            const status = getCampaignBeatStatus(frame);
            expect(status.level).toBe('blocked');
            expect(status.missing).toContain('no_conversion_goal');
        });

        it('blocks conversion frame with empty conversionGoal', () => {
            const frame = makeFrame('conversion', { ...fullContent(), conversionGoal: '   ' });
            const status = getCampaignBeatStatus(frame);
            expect(status.level).toBe('blocked');
        });

        it('blocks asset frame without requiredAssets', () => {
            const frame = makeFrame('asset', { ...fullContent(), requiredAssets: [] });
            const status = getCampaignBeatStatus(frame);
            expect(status.level).toBe('blocked');
            expect(status.missing).toContain('no_required_assets');
        });

        it('blocks approval frame without approvalRequirements', () => {
            const frame = makeFrame('approval', { ...fullContent(), approvalRequirements: [] });
            const status = getCampaignBeatStatus(frame);
            expect(status.level).toBe('blocked');
            expect(status.missing).toContain('no_approval_requirements');
        });

        it('blocks measurement frame without metrics', () => {
            const frame = makeFrame('measurement', { ...fullContent(), metrics: [] });
            const status = getCampaignBeatStatus(frame);
            expect(status.level).toBe('blocked');
            expect(status.missing).toContain('no_metrics');
        });

        it('blocks touchpoint frame without channel', () => {
            const frame = makeFrame('touchpoint', { ...fullContent(), channel: '' });
            const status = getCampaignBeatStatus(frame);
            expect(status.level).toBe('blocked');
            expect(status.missing).toContain('no_channel');
        });

        it('blocks message frame without messageClaim', () => {
            const frame = makeFrame('message', { ...fullContent(), messageClaim: '' });
            const status = getCampaignBeatStatus(frame);
            expect(status.level).toBe('blocked');
            expect(status.missing).toContain('no_message_claim');
        });
    });

    describe('ready state', () => {
        it('returns ready for fully-specified conversion frame', () => {
            const frame = makeFrame('conversion', fullContent());
            const status = getCampaignBeatStatus(frame);
            expect(status.level).toBe('ready');
            expect(status.missing.filter(r => !r.startsWith('no_proof') && !r.startsWith('no_launch'))).toHaveLength(0);
        });

        it('returns ready for fully-specified audience frame', () => {
            const frame = makeFrame('audience', fullContent());
            const status = getCampaignBeatStatus(frame);
            expect(status.level).toBe('ready');
        });

        it('returns ready for fully-specified touchpoint frame', () => {
            const frame = makeFrame('touchpoint', fullContent());
            const status = getCampaignBeatStatus(frame);
            expect(status.level).toBe('ready');
        });

        it('returns ready for fully-specified launch_event frame', () => {
            const frame = makeFrame('launch_event', fullContent());
            const status = getCampaignBeatStatus(frame);
            expect(status.level).toBe('ready');
        });
    });

    describe('partial and draft states', () => {
        it('returns partial when some spec gaps exist', () => {
            const frame = makeFrame('audience', {
                objective: 'Test',
                audienceSegment: 'Segment',
                customerStateBefore: ['Before'],
                customerStateAfter: ['After'],
                // missing testCriteria, implementationChecklist
            });
            const status = getCampaignBeatStatus(frame);
            expect(status.level).toBe('partial');
        });

        it('returns draft when most spec gaps exist', () => {
            const frame = makeFrame('audience', {});
            const status = getCampaignBeatStatus(frame);
            expect(status.level).toBe('draft');
        });
    });

    describe('counts', () => {
        it('reports assetCount', () => {
            const frame = makeFrame('audience', { requiredAssets: ['A', 'B', 'C'] });
            const status = getCampaignBeatStatus(frame);
            expect(status.assetCount).toBe(3);
        });

        it('reports metricsCount', () => {
            const frame = makeFrame('audience', { metrics: ['M1', 'M2'] });
            const status = getCampaignBeatStatus(frame);
            expect(status.metricsCount).toBe(2);
        });

        it('reports checklistCount', () => {
            const frame = makeFrame('audience', { implementationChecklist: ['T1'] });
            const status = getCampaignBeatStatus(frame);
            expect(status.checklistCount).toBe(1);
        });
    });
});

describe('BLOCKING_REASONS', () => {
    it('contains all six blocking reasons', () => {
        expect(BLOCKING_REASONS.has('no_conversion_goal')).toBe(true);
        expect(BLOCKING_REASONS.has('no_required_assets')).toBe(true);
        expect(BLOCKING_REASONS.has('no_approval_requirements')).toBe(true);
        expect(BLOCKING_REASONS.has('no_metrics')).toBe(true);
        expect(BLOCKING_REASONS.has('no_channel')).toBe(true);
        expect(BLOCKING_REASONS.has('no_message_claim')).toBe(true);
    });

    it('does not contain non-blocking reasons', () => {
        expect(BLOCKING_REASONS.has('no_objective')).toBe(false);
        expect(BLOCKING_REASONS.has('no_proof_points')).toBe(false);
    });
});

describe('getCampaignReadiness', () => {
    it('returns correct counts for a mixed storyboard', () => {
        const storyboard: Storyboard = {
            id: 'test',
            title: 'Test',
            frames: [
                makeFrame('conversion', fullContent()),
                makeFrame('asset', { ...fullContent(), requiredAssets: [] }),
                makeFrame('audience', {}),
            ],
            connections: [],
        };

        const readiness = getCampaignReadiness(storyboard);
        expect(readiness.total).toBe(3);
        expect(readiness.ready).toBe(1);
        expect(readiness.blocked).toBe(1);
        expect(readiness.draft).toBe(1);
        expect(readiness.readyFraction).toBeCloseTo(1 / 3);
    });

    it('returns 0 readyFraction for empty storyboard', () => {
        const storyboard: Storyboard = { id: 'test', title: 'Test', frames: [], connections: [] };
        const readiness = getCampaignReadiness(storyboard);
        expect(readiness.total).toBe(0);
        expect(readiness.readyFraction).toBe(0);
    });

    it('byFrame map has entry for every frame', () => {
        const storyboard: Storyboard = {
            id: 'test',
            title: 'Test',
            frames: [makeFrame('audience', fullContent()), makeFrame('message', fullContent())],
            connections: [],
        };
        const readiness = getCampaignReadiness(storyboard);
        expect(readiness.byFrame.size).toBe(2);
    });
});
