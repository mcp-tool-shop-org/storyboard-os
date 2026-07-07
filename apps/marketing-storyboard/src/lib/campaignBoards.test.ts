// ─── campaignBoards.test.ts ───────────────────────────────────────────────────
//
// BC-005 smoke suite for the marketing app (mirrors rpg-storyboard's
// templates.test.ts pattern). Tests the board-data surface the app's pages
// actually assemble: the template registry, campaign creation, and the demo
// campaign that campaigns/[campaignId].astro ships via getStaticPaths.
// ─────────────────────────────────────────────────────────────────────────────

import { describe, it, expect } from 'vitest';
import {
    MARKETING_TEMPLATES,
    getMarketingTemplate,
    createCampaignFromTemplate,
    validateStoryboard,
    launchRpgStoryboardCampaign,
    getCampaignReadiness,
    getCampaignLaunchReadiness,
} from '@storyboard-os/marketing-domain';

const INPUT = { id: 'test-campaign', title: 'Test Campaign', description: 'Vitest fixture' };

// Frame vocabulary the app's canvas config + handoff color maps cover.
// A frame type outside this set would render with fallback styling — this
// test turns silent style drift into a failing receipt.
const APP_FRAME_TYPES = [
    'audience', 'message', 'touchpoint', 'asset', 'approval',
    'launch_event', 'conversion', 'follow_up', 'measurement',
];

// ─── Registry ────────────────────────────────────────────────────────────────

describe('MARKETING_TEMPLATES', () => {
    it('defines all three campaign templates', () => {
        const ids = MARKETING_TEMPLATES.map(t => t.id);
        expect(ids).toContain('product_launch');
        expect(ids).toContain('campaign_funnel');
        expect(ids).toContain('content_to_conversion');
        expect(ids).toHaveLength(3);
    });

    it('each template has required metadata fields', () => {
        for (const t of MARKETING_TEMPLATES) {
            expect(t.id).toBeTruthy();
            expect(t.name).toBeTruthy();
            expect(t.description).toBeTruthy();
            expect(typeof t.frameCount).toBe('number');
            expect(t.bestFor).toBeTruthy();
            expect(typeof t.createStoryboard).toBe('function');
        }
    });

    it('getMarketingTemplate returns undefined for an unknown id', () => {
        expect(getMarketingTemplate('nonexistent' as never)).toBeUndefined();
    });
});

// ─── Campaign creation ────────────────────────────────────────────────────────

describe('createCampaignFromTemplate', () => {
    it('throws on an unknown template id', () => {
        expect(() => createCampaignFromTemplate('bad_id' as never, INPUT)).toThrow();
    });

    for (const template of MARKETING_TEMPLATES) {
        describe(template.id, () => {
            const campaign = createCampaignFromTemplate(template.id as never, INPUT);

            it('produces a canvas-renderable board', () => {
                expect(Array.isArray(campaign.frames)).toBe(true);
                expect(Array.isArray(campaign.connections)).toBe(true);
                expect(campaign.frames.length).toBeGreaterThan(0);
            });

            it('frame count matches template metadata', () => {
                expect(campaign.frames).toHaveLength(template.frameCount);
            });

            it('passes structural validation (no broken connection refs)', () => {
                const result = validateStoryboard(campaign);
                expect(result.valid).toBe(true);
                expect(result.errors).toHaveLength(0);
            });

            it('has no duplicate frame ids', () => {
                const ids = campaign.frames.map(f => f.id);
                expect(new Set(ids).size).toBe(ids.length);
            });

            it('every frame has position and valid size', () => {
                for (const frame of campaign.frames) {
                    expect(typeof frame.position.x).toBe('number');
                    expect(typeof frame.position.y).toBe('number');
                    expect(frame.size.width).toBeGreaterThan(0);
                    expect(frame.size.height).toBeGreaterThan(0);
                }
            });

            it('only uses frame types the app styles', () => {
                for (const frame of campaign.frames) {
                    expect(APP_FRAME_TYPES).toContain(frame.type);
                }
            });
        });
    }
});

// ─── Demo campaign (the board [campaignId].astro publishes) ──────────────────

describe('launchRpgStoryboardCampaign', () => {
    it('has a routable id and title', () => {
        expect(launchRpgStoryboardCampaign.id).toBeTruthy();
        expect(launchRpgStoryboardCampaign.title).toBeTruthy();
    });

    it('passes structural validation', () => {
        const result = validateStoryboard(launchRpgStoryboardCampaign);
        expect(result.valid).toBe(true);
    });

    it('only uses frame types the app styles', () => {
        for (const frame of launchRpgStoryboardCampaign.frames) {
            expect(APP_FRAME_TYPES).toContain(frame.type);
        }
    });

    it('readiness summary counts add up to total frames', () => {
        const summary = getCampaignReadiness(launchRpgStoryboardCampaign);
        expect(summary.ready + summary.partial + summary.draft + summary.blocked)
            .toBe(summary.total);
        expect(summary.total).toBe(launchRpgStoryboardCampaign.frames.length);
    });

    it('launch readiness returns a known level with a summary line', () => {
        const readiness = getCampaignLaunchReadiness(launchRpgStoryboardCampaign);
        expect(['ready', 'at_risk', 'blocked', 'draft']).toContain(readiness.level);
        expect(readiness.summary.length).toBeGreaterThan(0);
    });
});
