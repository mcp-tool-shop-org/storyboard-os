// ─── contentGuards.test.ts — DM-002 ──────────────────────────────────────────
//
// The core validator does not reject a frame whose `content` is null or
// missing, and the app load path does not validate before use. Every domain
// entry function that dereferences `frame.content` must therefore tolerate
// null/undefined content: return the draft/empty-status result, never throw.
//
// ─────────────────────────────────────────────────────────────────────────────

import { describe, it, expect } from 'vitest';
import { getCampaignBeatStatus, getCampaignReadiness } from './beatStatus';
import { getMarketingFrameSignal, getMarketingFrameBadges } from './frameSignals';
import { generateCampaignHandoff, generateCampaignMarkdown } from './handoff';
import {
    getCampaignLaunchReadiness,
    getApprovalGateSignals,
    getMeasurementLoopSignals,
} from './launchReadiness';
import { getProjectProgress, updateFrameContent } from './project';
import type { MarketingStoryboardProject } from './project';
import { validateMarketingStoryboard } from './validate';
import type { Storyboard, StoryboardFrame, MarketingFrameContent } from './schema';

// ─── Fixtures ─────────────────────────────────────────────────────────────────

function makeFrame(
    id: string,
    type: StoryboardFrame['type'],
    content: unknown,
): StoryboardFrame {
    return {
        id,
        type,
        title: `Frame ${id}`,
        summary: `Summary for ${id}`,
        position: { x: 0, y: 0 },
        size: { width: 260, height: 160 },
        content: content as MarketingFrameContent,
        annotations: [],
    };
}

/** Frame whose content is explicitly null (corrupt localStorage shape). */
function nullContentFrame(type: StoryboardFrame['type'] = 'audience'): StoryboardFrame {
    return makeFrame('null-content', type, null);
}

/** Frame whose content key is entirely absent. */
function missingContentFrame(type: StoryboardFrame['type'] = 'audience'): StoryboardFrame {
    const frame = makeFrame('missing-content', type, {});
    delete (frame as unknown as Record<string, unknown>)['content'];
    return frame;
}

function makeBoard(frames: StoryboardFrame[]): Storyboard {
    return { id: 'board-1', title: 'Test Board', frames, connections: [] };
}

function makeProject(frames: StoryboardFrame[]): MarketingStoryboardProject {
    const now = new Date().toISOString();
    return {
        id: 'proj-1',
        title: 'Test Project',
        createdAt: now,
        updatedAt: now,
        storyboard: makeBoard(frames),
        progress: { frames: {} },
    };
}

// ─── beatStatus ───────────────────────────────────────────────────────────────

describe('DM-002 — beatStatus tolerates null/missing content', () => {
    it('getCampaignBeatStatus returns draft for an audience frame with null content', () => {
        const status = getCampaignBeatStatus(nullContentFrame('audience'));
        expect(status.level).toBe('draft');
        expect(status.assetCount).toBe(0);
        expect(status.checklistCount).toBe(0);
    });

    it('getCampaignBeatStatus returns draft for an audience frame with missing content', () => {
        expect(() => getCampaignBeatStatus(missingContentFrame('audience'))).not.toThrow();
        expect(getCampaignBeatStatus(missingContentFrame('audience')).level).toBe('draft');
    });

    it('getCampaignBeatStatus does not throw for a conversion frame with null content', () => {
        expect(() => getCampaignBeatStatus(nullContentFrame('conversion'))).not.toThrow();
        // Conversion frames require conversionGoal — null content means blocked, not a crash.
        expect(getCampaignBeatStatus(nullContentFrame('conversion')).level).toBe('blocked');
    });

    it('getCampaignReadiness does not throw on a board with null-content frames', () => {
        const board = makeBoard([nullContentFrame('audience'), missingContentFrame('message')]);
        expect(() => getCampaignReadiness(board)).not.toThrow();
    });
});

// ─── frameSignals ─────────────────────────────────────────────────────────────

describe('DM-002 — frameSignals tolerates null/missing content', () => {
    it('getMarketingFrameSignal returns empty signal for null content', () => {
        const signal = getMarketingFrameSignal(nullContentFrame());
        expect(signal.readiness).toBe('incomplete');
        expect(signal.customerStateSummary).toBeNull();
        expect(signal.channelSummary).toBeNull();
        expect(signal.hasMetrics).toBe(false);
    });

    it('getMarketingFrameSignal returns empty signal for missing content', () => {
        expect(() => getMarketingFrameSignal(missingContentFrame())).not.toThrow();
        expect(getMarketingFrameSignal(missingContentFrame()).readiness).toBe('incomplete');
    });

    it('getMarketingFrameBadges returns DRAFT badge for null content', () => {
        const badges = getMarketingFrameBadges(nullContentFrame());
        expect(badges.some(b => b.text === 'DRAFT')).toBe(true);
    });
});

// ─── handoff ──────────────────────────────────────────────────────────────────

describe('DM-002 — handoff tolerates null/missing content', () => {
    it('generateCampaignHandoff does not throw and yields empty spec arrays', () => {
        const handoff = generateCampaignHandoff(
            makeBoard([nullContentFrame(), missingContentFrame('message')]),
        );
        expect(handoff.beats).toHaveLength(2);
        for (const beat of handoff.beats) {
            expect(beat.requiredAssets).toEqual([]);
            expect(beat.implementationChecklist).toEqual([]);
            expect(beat.metrics).toEqual([]);
        }
    });

    it('generateCampaignMarkdown renders a null-content board without throwing', () => {
        const handoff = generateCampaignHandoff(makeBoard([nullContentFrame()]));
        expect(() => generateCampaignMarkdown(handoff)).not.toThrow();
    });
});

// ─── launchReadiness ──────────────────────────────────────────────────────────

describe('DM-002 — launchReadiness tolerates null/missing content', () => {
    it('getCampaignLaunchReadiness does not throw with a null-content measurement frame', () => {
        const board = makeBoard([nullContentFrame('measurement'), missingContentFrame('launch_event')]);
        expect(() => getCampaignLaunchReadiness(board)).not.toThrow();
        const result = getCampaignLaunchReadiness(board);
        expect(result.missingMeasurementFrameIds).toContain('null-content');
    });

    it('getApprovalGateSignals does not throw with a null-content approval frame', () => {
        const board = makeBoard([nullContentFrame('approval')]);
        expect(() => getApprovalGateSignals(board)).not.toThrow();
        expect(getApprovalGateSignals(board)[0].hasApprovalRequirements).toBe(false);
    });

    it('getMeasurementLoopSignals does not throw with a null-content measurement frame', () => {
        const board = makeBoard([nullContentFrame('measurement')]);
        expect(() => getMeasurementLoopSignals(board)).not.toThrow();
        expect(getMeasurementLoopSignals(board)[0].hasMetrics).toBe(false);
        expect(getMeasurementLoopSignals(board)[0].metricsCount).toBe(0);
    });
});

// ─── project ──────────────────────────────────────────────────────────────────

describe('DM-002 — project progress tolerates null/missing content', () => {
    it('getProjectProgress does not throw and reports zero totals', () => {
        const project = makeProject([nullContentFrame(), missingContentFrame('message')]);
        const summary = getProjectProgress(project);
        expect(summary.totalChecklist).toBe(0);
        expect(summary.totalTests).toBe(0);
    });

    it('updateFrameContent does not throw when patching a null-content frame', () => {
        const project = makeProject([nullContentFrame()]);
        expect(() =>
            updateFrameContent(project, 'null-content', { objective: 'now has one' }),
        ).not.toThrow();
    });
});

// ─── validate (DM-003) ────────────────────────────────────────────────────────

describe('DM-003 — validator returns structured error on null/missing content', () => {
    it('does not throw and reports MARKETING_MISSING_CONTENT for null content', () => {
        const board = makeBoard([nullContentFrame('conversion')]);
        let result!: ReturnType<typeof validateMarketingStoryboard>;
        expect(() => { result = validateMarketingStoryboard(board); }).not.toThrow();
        expect(result.valid).toBe(false);
        const err = result.errors.find(e => e.code === 'MARKETING_MISSING_CONTENT');
        expect(err).toBeDefined();
        expect(err!.frameId).toBe('null-content');
    });

    it('does not throw for missing content and continues validating other frames', () => {
        const board = makeBoard([
            missingContentFrame('audience'),
            makeFrame('empty-conversion', 'conversion', {}), // valid object content, missing conversionGoal
        ]);
        let result!: ReturnType<typeof validateMarketingStoryboard>;
        expect(() => { result = validateMarketingStoryboard(board); }).not.toThrow();
        const codes = result.errors.map(e => e.code);
        expect(codes).toContain('MARKETING_MISSING_CONTENT');
        expect(codes).toContain('MARKETING_MISSING_CONVERSION_GOAL'); // loop continued past the bad frame
    });
});
