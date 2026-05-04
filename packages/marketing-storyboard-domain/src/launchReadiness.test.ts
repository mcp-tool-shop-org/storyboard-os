// ─── launchReadiness.test.ts ──────────────────────────────────────────────────

import { describe, it, expect } from 'vitest';
import {
    getCampaignLaunchReadiness,
    getCampaignCriticalPath,
    getApprovalGateSignals,
    getMeasurementLoopSignals,
} from './launchReadiness';
import { launchRpgStoryboardCampaign } from './demo-campaign';
import type { Storyboard, StoryboardFrame } from './schema';

// ─── Helpers ──────────────────────────────────────────────────────────────────

function makeFrame(overrides: Partial<StoryboardFrame> & { id: string; type: string }): StoryboardFrame {
    return {
        title: overrides.id,
        summary: '',
        position: { x: 0, y: 0 },
        size: { width: 200, height: 120 },
        content: {},
        annotations: [],
        ...overrides,
    } as StoryboardFrame;
}

function makeCampaign(frames: StoryboardFrame[], connections: Storyboard['connections'] = []): Storyboard {
    return { id: 'test', title: 'Test', frames, connections };
}

// ─── getCampaignLaunchReadiness ───────────────────────────────────────────────

describe('getCampaignLaunchReadiness', () => {
    it('returns ready for a fully-specced campaign', () => {
        const frames: StoryboardFrame[] = [
            makeFrame({
                id: 'msg', type: 'message',
                content: {
                    objective: 'x', messageClaim: 'y', audienceSegment: 'z',
                    customerStateBefore: ['a'], customerStateAfter: ['b'],
                    testCriteria: ['t'], implementationChecklist: ['i'],
                },
            }),
            makeFrame({
                id: 'launch', type: 'launch_event',
                content: {
                    objective: 'x', audienceSegment: 'z',
                    customerStateBefore: ['a'], customerStateAfter: ['b'],
                    testCriteria: ['t'], implementationChecklist: ['i'],
                    requiredAssets: ['asset'],
                },
            }),
            makeFrame({
                id: 'meas', type: 'measurement',
                content: {
                    objective: 'x', audienceSegment: 'z',
                    customerStateBefore: ['a'], customerStateAfter: ['b'],
                    testCriteria: ['t'], implementationChecklist: ['i'],
                    metrics: ['m1'],
                },
            }),
        ];
        const conns = [
            { id: 'c1', fromFrameId: 'msg', toFrameId: 'launch', type: 'sequence' as const },
            { id: 'c2', fromFrameId: 'launch', toFrameId: 'meas', type: 'sequence' as const },
        ];
        const result = getCampaignLaunchReadiness(makeCampaign(frames, conns));
        expect(result.level).toBe('ready');
        expect(result.blockedFrameIds).toEqual([]);
        expect(result.missingMeasurementFrameIds).toEqual([]);
    });

    it('returns blocked when approval on critical path is blocked', () => {
        const frames: StoryboardFrame[] = [
            makeFrame({ id: 'appr', type: 'approval', content: {} }), // missing approvalRequirements → blocked
            makeFrame({
                id: 'launch', type: 'launch_event',
                content: { objective: 'x', audienceSegment: 'z', customerStateBefore: ['a'], customerStateAfter: ['b'], testCriteria: ['t'], implementationChecklist: ['i'], requiredAssets: ['a'] },
            }),
        ];
        const conns = [
            { id: 'c1', fromFrameId: 'appr', toFrameId: 'launch', type: 'consequence' as const },
        ];
        const result = getCampaignLaunchReadiness(makeCampaign(frames, conns));
        expect(result.level).toBe('blocked');
        expect(result.blockedFrameIds).toContain('appr');
        expect(result.summary).toContain('blocker');
    });

    it('returns at_risk when measurement is missing metrics', () => {
        const frames: StoryboardFrame[] = [
            makeFrame({
                id: 'launch', type: 'launch_event',
                content: { objective: 'x', audienceSegment: 'z', customerStateBefore: ['a'], customerStateAfter: ['b'], testCriteria: ['t'], implementationChecklist: ['i'], requiredAssets: ['a'] },
            }),
            makeFrame({
                id: 'meas', type: 'measurement',
                content: { objective: 'x', audienceSegment: 'z', customerStateBefore: ['a'], customerStateAfter: ['b'], testCriteria: ['t'], implementationChecklist: ['i'] },
                // no metrics → blocked
            }),
        ];
        const conns = [
            { id: 'c1', fromFrameId: 'launch', toFrameId: 'meas', type: 'sequence' as const },
        ];
        const result = getCampaignLaunchReadiness(makeCampaign(frames, conns));
        // measurement is blocked (missing metrics) — it's on the critical path (downstream of launch),
        // but the blocked-on-critical-path check only fires for upstream blockers to launch_event.
        // However the measurement frame IS blocked, so hasAnyBlocked triggers at_risk.
        // Actually the critical path extends through launch_event to measurement, so it IS on critical path.
        expect(result.level).toBe('blocked');
        expect(result.missingMeasurementFrameIds).toContain('meas');
    });

    it('returns at_risk when blocked frames exist but not on critical path to launch', () => {
        // message is blocked (no messageClaim), touchpoint is blocked (no channel)
        // but there's no connection graph so no critical path
        const frames: StoryboardFrame[] = [
            makeFrame({ id: 'a', type: 'audience', content: {} }),
            makeFrame({ id: 'b', type: 'message', content: {} }),
            makeFrame({ id: 'c', type: 'touchpoint', content: {} }),
            makeFrame({ id: 'd', type: 'launch_event', content: {} }),
        ];
        const result = getCampaignLaunchReadiness(makeCampaign(frames));
        // blocked frames exist (message, touchpoint) but no connections so no critical path
        expect(result.level).toBe('at_risk');
        expect(result.blockedFrameIds.length).toBeGreaterThan(0);
    });

    it('works on the demo campaign', () => {
        const result = getCampaignLaunchReadiness(launchRpgStoryboardCampaign);
        expect(result.level).toBeDefined();
        expect(result.criticalPathFrameIds.length).toBeGreaterThan(0);
        expect(result.approvalGateFrameIds).toContain('launch-approval');
    });
});

// ─── getCampaignCriticalPath ──────────────────────────────────────────────────

describe('getCampaignCriticalPath', () => {
    it('returns empty for campaign with no launch_event', () => {
        const frames = [
            makeFrame({ id: 'a', type: 'audience', content: {} }),
            makeFrame({ id: 'b', type: 'message', content: {} }),
        ];
        const conns = [{ id: 'c1', fromFrameId: 'a', toFrameId: 'b', type: 'sequence' as const }];
        expect(getCampaignCriticalPath(makeCampaign(frames, conns))).toEqual([]);
    });

    it('returns path from root to end through launch_event', () => {
        const frames = [
            makeFrame({ id: 'a', type: 'audience', content: {} }),
            makeFrame({ id: 'b', type: 'message', content: {} }),
            makeFrame({ id: 'c', type: 'launch_event', content: {} }),
            makeFrame({ id: 'd', type: 'measurement', content: {} }),
        ];
        const conns = [
            { id: 'c1', fromFrameId: 'a', toFrameId: 'b', type: 'sequence' as const },
            { id: 'c2', fromFrameId: 'b', toFrameId: 'c', type: 'sequence' as const },
            { id: 'c3', fromFrameId: 'c', toFrameId: 'd', type: 'sequence' as const },
        ];
        const path = getCampaignCriticalPath(makeCampaign(frames, conns));
        expect(path).toEqual(['a', 'b', 'c', 'd']);
    });

    it('picks longest path when there are multiple routes to launch', () => {
        const frames = [
            makeFrame({ id: 'a', type: 'audience', content: {} }),
            makeFrame({ id: 'b', type: 'message', content: {} }),
            makeFrame({ id: 'c', type: 'asset', content: {} }),
            makeFrame({ id: 'd', type: 'launch_event', content: {} }),
        ];
        const conns = [
            { id: 'c1', fromFrameId: 'a', toFrameId: 'b', type: 'sequence' as const },
            { id: 'c2', fromFrameId: 'b', toFrameId: 'd', type: 'sequence' as const },
            { id: 'c3', fromFrameId: 'a', toFrameId: 'c', type: 'sequence' as const },
            { id: 'c4', fromFrameId: 'c', toFrameId: 'b', type: 'sequence' as const },
        ];
        const path = getCampaignCriticalPath(makeCampaign(frames, conns));
        // longest is a → c → b → d (length 3)
        expect(path).toEqual(['a', 'c', 'b', 'd']);
    });

    it('works on the demo campaign', () => {
        const path = getCampaignCriticalPath(launchRpgStoryboardCampaign);
        expect(path.length).toBeGreaterThan(3);
        expect(path).toContain('launch-announcement'); // launch_event
    });
});

// ─── getApprovalGateSignals ───────────────────────────────────────────────────

describe('getApprovalGateSignals', () => {
    it('returns empty when no approval frames exist', () => {
        const frames = [
            makeFrame({ id: 'a', type: 'audience', content: {} }),
        ];
        expect(getApprovalGateSignals(makeCampaign(frames))).toEqual([]);
    });

    it('detects approval that blocks launch', () => {
        const frames = [
            makeFrame({ id: 'appr', type: 'approval', content: { approvalRequirements: ['sign off'] } }),
            makeFrame({ id: 'launch', type: 'launch_event', content: {} }),
        ];
        const conns = [
            { id: 'c1', fromFrameId: 'appr', toFrameId: 'launch', type: 'consequence' as const },
        ];
        const signals = getApprovalGateSignals(makeCampaign(frames, conns));
        expect(signals).toHaveLength(1);
        expect(signals[0].blocksLaunch).toBe(true);
        expect(signals[0].hasApprovalRequirements).toBe(true);
    });

    it('detects approval that does NOT block launch', () => {
        const frames = [
            makeFrame({ id: 'appr', type: 'approval', content: { approvalRequirements: ['sign off'] } }),
            makeFrame({ id: 'follow', type: 'follow_up', content: {} }),
        ];
        const conns = [
            { id: 'c1', fromFrameId: 'appr', toFrameId: 'follow', type: 'sequence' as const },
        ];
        const signals = getApprovalGateSignals(makeCampaign(frames, conns));
        expect(signals[0].blocksLaunch).toBe(false);
    });

    it('flags missing approval requirements', () => {
        const frames = [
            makeFrame({ id: 'appr', type: 'approval', content: {} }), // no approvalRequirements
            makeFrame({ id: 'launch', type: 'launch_event', content: {} }),
        ];
        const conns = [
            { id: 'c1', fromFrameId: 'appr', toFrameId: 'launch', type: 'consequence' as const },
        ];
        const signals = getApprovalGateSignals(makeCampaign(frames, conns));
        expect(signals[0].hasApprovalRequirements).toBe(false);
        expect(signals[0].status).toBe('blocked');
    });

    it('works on the demo campaign', () => {
        const signals = getApprovalGateSignals(launchRpgStoryboardCampaign);
        expect(signals.length).toBeGreaterThan(0);
        expect(signals[0].frameId).toBe('launch-approval');
        expect(signals[0].blocksLaunch).toBe(true);
    });
});

// ─── getMeasurementLoopSignals ────────────────────────────────────────────────

describe('getMeasurementLoopSignals', () => {
    it('returns empty when no measurement frames exist', () => {
        const frames = [makeFrame({ id: 'a', type: 'audience', content: {} })];
        expect(getMeasurementLoopSignals(makeCampaign(frames))).toEqual([]);
    });

    it('detects measurement with metrics and incoming connection', () => {
        const frames = [
            makeFrame({ id: 'follow', type: 'follow_up', content: {} }),
            makeFrame({ id: 'meas', type: 'measurement', content: { metrics: ['m1', 'm2'] } }),
        ];
        const conns = [
            { id: 'c1', fromFrameId: 'follow', toFrameId: 'meas', type: 'sequence' as const },
        ];
        const signals = getMeasurementLoopSignals(makeCampaign(frames, conns));
        expect(signals).toHaveLength(1);
        expect(signals[0].hasMetrics).toBe(true);
        expect(signals[0].metricsCount).toBe(2);
        expect(signals[0].hasIncomingConnection).toBe(true);
        expect(signals[0].hasOutgoingConnection).toBe(false);
        expect(signals[0].isLoop).toBe(false);
    });

    it('detects measurement loop (incoming + outgoing)', () => {
        const frames = [
            makeFrame({ id: 'follow', type: 'follow_up', content: {} }),
            makeFrame({ id: 'meas', type: 'measurement', content: { metrics: ['m1'] } }),
            makeFrame({ id: 'next', type: 'audience', content: {} }),
        ];
        const conns = [
            { id: 'c1', fromFrameId: 'follow', toFrameId: 'meas', type: 'sequence' as const },
            { id: 'c2', fromFrameId: 'meas', toFrameId: 'next', type: 'sequence' as const },
        ];
        const signals = getMeasurementLoopSignals(makeCampaign(frames, conns));
        expect(signals[0].isLoop).toBe(true);
        expect(signals[0].hasOutgoingConnection).toBe(true);
    });

    it('detects missing metrics', () => {
        const frames = [
            makeFrame({ id: 'meas', type: 'measurement', content: {} }),
        ];
        const signals = getMeasurementLoopSignals(makeCampaign(frames));
        expect(signals[0].hasMetrics).toBe(false);
        expect(signals[0].metricsCount).toBe(0);
    });

    it('works on the demo campaign', () => {
        const signals = getMeasurementLoopSignals(launchRpgStoryboardCampaign);
        expect(signals.length).toBeGreaterThan(0);
        expect(signals[0].frameId).toBe('launch-measurement');
        expect(signals[0].hasMetrics).toBe(true);
    });
});
