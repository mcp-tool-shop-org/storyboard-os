// ─── launchBlockers.test.ts ───────────────────────────────────────────────────
//
// AP-006 #4 receipts: the Launch Blockers panel previously filtered pending
// approvals with `s.status === 'pending'` — a status level that does not
// exist in CampaignBeatStatusLevel ('ready'|'partial'|'draft'|'blocked') —
// so pending approvals NEVER appeared. categorizeApprovalSignals encodes the
// truthful mapping; these tests pin it.
// ─────────────────────────────────────────────────────────────────────────────

import { describe, it, expect } from 'vitest';
import type { ApprovalGateSignal, StoryboardFrame } from '@storyboard-os/marketing-domain';
import {
    launchRpgStoryboardCampaign,
    getApprovalGateSignals,
    getCampaignLaunchReadiness,
    type MeasurementLoopSignal,
} from '@storyboard-os/marketing-domain';
import {
    categorizeApprovalSignals,
    hasOpenMeasurementLoops,
    shouldShowLaunchBlockersPanel,
    collectBlockedBeatEntries,
    launchBlockersPanelHasContent,
} from './launchBlockers';

function signal(overrides: Partial<ApprovalGateSignal>): ApprovalGateSignal {
    return {
        frameId: 'gate-1',
        title: 'Legal review',
        status: 'ready',
        missing: [],
        blocksLaunch: false,
        hasApprovalRequirements: true,
        ...overrides,
    };
}

// ─── Pure categorization rules ────────────────────────────────────────────────

describe('categorizeApprovalSignals', () => {
    it('puts status=blocked gates in blocked', () => {
        const s = signal({ status: 'blocked', hasApprovalRequirements: false });
        const { blocked, pending } = categorizeApprovalSignals([s]);
        expect(blocked).toEqual([s]);
        expect(pending).toEqual([]);
    });

    it('puts partial gates with approval requirements in pending', () => {
        const s = signal({ status: 'partial' });
        const { blocked, pending } = categorizeApprovalSignals([s]);
        expect(pending).toEqual([s]);
        expect(blocked).toEqual([]);
    });

    it('puts draft gates with approval requirements in pending', () => {
        const s = signal({ status: 'draft' });
        expect(categorizeApprovalSignals([s]).pending).toEqual([s]);
    });

    it('never reports ready gates as blocked or pending', () => {
        const s = signal({ status: 'ready' });
        const { blocked, pending } = categorizeApprovalSignals([s]);
        expect(blocked).toEqual([]);
        expect(pending).toEqual([]);
    });

    it('never reports a gate without approval requirements as pending', () => {
        // Cannot occur for approval frames under current domain rules (missing
        // requirements ⇒ blocked), but the helper must not claim "pending
        // approval" when there is nothing defined to approve.
        const s = signal({ status: 'partial', hasApprovalRequirements: false });
        expect(categorizeApprovalSignals([s]).pending).toEqual([]);
    });

    it('buckets are disjoint and drawn from the input', () => {
        const signals = [
            signal({ frameId: 'a', status: 'blocked', hasApprovalRequirements: false }),
            signal({ frameId: 'b', status: 'partial' }),
            signal({ frameId: 'c', status: 'draft' }),
            signal({ frameId: 'd', status: 'ready' }),
        ];
        const { blocked, pending } = categorizeApprovalSignals(signals);
        expect(blocked.map(s => s.frameId)).toEqual(['a']);
        expect(pending.map(s => s.frameId)).toEqual(['b', 'c']);
        const overlap = blocked.filter(s => pending.includes(s));
        expect(overlap).toEqual([]);
    });

    it('handles an empty signal list', () => {
        expect(categorizeApprovalSignals([])).toEqual({ blocked: [], pending: [] });
    });
});

// ─── Against the real demo campaign ───────────────────────────────────────────

describe('categorizeApprovalSignals — demo campaign fixture', () => {
    const signals = getApprovalGateSignals(launchRpgStoryboardCampaign);
    const { blocked, pending } = categorizeApprovalSignals(signals);

    it('produces one signal per approval frame', () => {
        const approvalFrames = launchRpgStoryboardCampaign.frames.filter(f => f.type === 'approval');
        expect(signals).toHaveLength(approvalFrames.length);
    });

    it('every blocked entry has status blocked', () => {
        for (const s of blocked) expect(s.status).toBe('blocked');
    });

    it('every pending entry is partial/draft with requirements defined', () => {
        for (const s of pending) {
            expect(['partial', 'draft']).toContain(s.status);
            expect(s.hasApprovalRequirements).toBe(true);
        }
    });

    it('no gate lands in both buckets', () => {
        const blockedIds = new Set(blocked.map(s => s.frameId));
        for (const s of pending) expect(blockedIds.has(s.frameId)).toBe(false);
    });
});

// ─── Open-loop visibility gate (F-d6c0bd9d) ───────────────────────────────────

function loopSignal(overrides: Partial<MeasurementLoopSignal>): MeasurementLoopSignal {
    return {
        frameId: 'meas-1',
        title: 'Post-launch metrics',
        hasMetrics: true,
        metricsCount: 2,
        hasIncomingConnection: false,
        hasOutgoingConnection: false,
        isLoop: false,
        ...overrides,
    };
}

describe('hasOpenMeasurementLoops / shouldShowLaunchBlockersPanel', () => {
    it('detects measurement frames with metrics but no feedback loop', () => {
        expect(hasOpenMeasurementLoops([loopSignal({ isLoop: false })])).toBe(true);
        expect(hasOpenMeasurementLoops([loopSignal({ isLoop: true })])).toBe(false);
        expect(hasOpenMeasurementLoops([loopSignal({ hasMetrics: false, isLoop: false })])).toBe(false);
    });

    it('shows the panel when the only issue is an open measurement loop', () => {
        expect(shouldShowLaunchBlockersPanel({
            blockedFrameIds: [],
            missingMeasurementFrameIds: [],
            pendingApprovals: [],
            measurementSignals: [loopSignal({ hasMetrics: true, isLoop: false })],
        })).toBe(true);
    });

    it('hides the panel when there are no blockers, pending approvals, or open loops', () => {
        expect(shouldShowLaunchBlockersPanel({
            blockedFrameIds: [],
            missingMeasurementFrameIds: [],
            pendingApprovals: [],
            measurementSignals: [loopSignal({ hasMetrics: true, isLoop: true })],
        })).toBe(false);
    });

    it('still shows for blocked frames / missing metrics / pending approvals', () => {
        expect(shouldShowLaunchBlockersPanel({
            blockedFrameIds: ['conv-1'],
            missingMeasurementFrameIds: [],
            pendingApprovals: [],
            measurementSignals: [],
        })).toBe(true);
        expect(shouldShowLaunchBlockersPanel({
            blockedFrameIds: [],
            missingMeasurementFrameIds: ['meas-1'],
            pendingApprovals: [],
            measurementSignals: [],
        })).toBe(true);
        expect(shouldShowLaunchBlockersPanel({
            blockedFrameIds: [],
            missingMeasurementFrameIds: [],
            pendingApprovals: [signal({ status: 'partial' })],
            measurementSignals: [],
        })).toBe(true);
    });
});

// ─── Blocked beats section (F-e2528549) ───────────────────────────────────────
// Visibility gated on blockedFrameIds must paint those beats — previously the
// panel mounted then returned null when only non-approval/non-measurement
// frames were blocked.

function makeFrame(overrides: Partial<StoryboardFrame> & { id: string; type: StoryboardFrame['type'] }): StoryboardFrame {
    return {
        title: overrides.title ?? overrides.id,
        summary: '',
        position: { x: 0, y: 0 },
        size: { width: 200, height: 120 },
        content: {},
        annotations: [],
        ...overrides,
    } as StoryboardFrame;
}

describe('collectBlockedBeatEntries / launchBlockersPanelHasContent', () => {
    it('lists blocked conversion/message beats with humanized blockers', () => {
        const frames = [
            makeFrame({ id: 'conv-1', type: 'conversion', title: 'Signup CTA', content: {} }),
            makeFrame({ id: 'msg-1', type: 'message', title: 'Core claim', content: {} }),
        ];
        const entries = collectBlockedBeatEntries(frames, ['conv-1', 'msg-1']);
        expect(entries).toHaveLength(2);
        expect(entries[0]).toMatchObject({ frameId: 'conv-1', title: 'Signup CTA' });
        expect(entries[0].details.some(d => /conversion/i.test(d))).toBe(true);
        expect(entries[1].details.some(d => /message claim/i.test(d))).toBe(true);
    });

    it('excludes frames already covered by approval/measurement sections', () => {
        const frames = [
            makeFrame({ id: 'appr-1', type: 'approval', title: 'Legal', content: {} }),
            makeFrame({ id: 'conv-1', type: 'conversion', title: 'CTA', content: {} }),
        ];
        const entries = collectBlockedBeatEntries(frames, ['appr-1', 'conv-1'], {
            excludeFrameIds: ['appr-1'],
        });
        expect(entries.map(e => e.frameId)).toEqual(['conv-1']);
    });

    it('keeps panel content non-empty when visibility is true for blocked-only boards', () => {
        const frames = [
            makeFrame({ id: 'conv-1', type: 'conversion', title: 'Signup CTA', content: {} }),
            makeFrame({
                id: 'launch',
                type: 'launch_event',
                content: {
                    objective: 'x', audienceSegment: 'z',
                    customerStateBefore: ['a'], customerStateAfter: ['b'],
                    testCriteria: ['t'], implementationChecklist: ['i'],
                    requiredAssets: ['a'],
                },
            }),
        ];
        const readiness = getCampaignLaunchReadiness({
            id: 't', title: 'T', frames, connections: [],
        });
        expect(readiness.blockedFrameIds).toContain('conv-1');

        const show = shouldShowLaunchBlockersPanel({
            blockedFrameIds: readiness.blockedFrameIds,
            missingMeasurementFrameIds: readiness.missingMeasurementFrameIds,
            pendingApprovals: [],
            measurementSignals: [],
        });
        expect(show).toBe(true);

        const blockedBeats = collectBlockedBeatEntries(frames, readiness.blockedFrameIds);
        expect(launchBlockersPanelHasContent({
            blockedBeats,
            blockedApprovals: [],
            pendingApprovals: [],
            measurementSignals: [],
        })).toBe(true);
        expect(blockedBeats.some(b => b.frameId === 'conv-1')).toBe(true);
    });

    it('panel has content for open loops without blocked frames', () => {
        expect(launchBlockersPanelHasContent({
            blockedBeats: [],
            blockedApprovals: [],
            pendingApprovals: [],
            measurementSignals: [loopSignal({ hasMetrics: true, isLoop: false })],
        })).toBe(true);
    });

    it('panel has no content when everything is clean', () => {
        expect(launchBlockersPanelHasContent({
            blockedBeats: [],
            blockedApprovals: [],
            pendingApprovals: [],
            measurementSignals: [loopSignal({ hasMetrics: true, isLoop: true })],
        })).toBe(false);
    });
});
