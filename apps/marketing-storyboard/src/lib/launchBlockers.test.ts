// ─── launchBlockers.test.ts ───────────────────────────────────────────────────
//
// AP-006 #4 receipts: the Launch Blockers panel previously filtered pending
// approvals with `s.status === 'pending'` — a status level that does not
// exist in CampaignBeatStatusLevel ('ready'|'partial'|'draft'|'blocked') —
// so pending approvals NEVER appeared. categorizeApprovalSignals encodes the
// truthful mapping; these tests pin it.
// ─────────────────────────────────────────────────────────────────────────────

import { describe, it, expect } from 'vitest';
import type { ApprovalGateSignal } from '@storyboard-os/marketing-domain';
import {
    launchRpgStoryboardCampaign,
    getApprovalGateSignals,
} from '@storyboard-os/marketing-domain';
import { categorizeApprovalSignals } from './launchBlockers';

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
