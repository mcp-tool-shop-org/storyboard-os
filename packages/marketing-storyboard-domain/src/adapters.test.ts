// ─── marketing-domain / adapters.test.ts ─────────────────────────────────────
//
// Compile adapters over schema-validated CampaignHandoff (F-df7eed25, F-684f138c).
// ─────────────────────────────────────────────────────────────────────────────

import { describe, it, expect } from 'vitest';
import {
    generateCampaignHandoff,
    validateCampaignHandoff,
} from './handoff';
import {
    adaptCampaignHandoffToAssetPack,
    adaptCampaignHandoffToEventMap,
    adaptCampaignHandoffToChecklistPack,
    fallbackEventId,
    InvalidCampaignHandoffError,
} from './adapters';
import { launchRpgStoryboardCampaign } from './demo-campaign';
import { MARKETING_TEMPLATES, createCampaignFromTemplate } from './templates';
import type { Storyboard, StoryboardFrame, MarketingFrameContent } from './schema';

function makeFrame(
    id: string,
    type: string,
    content: Partial<MarketingFrameContent> = {},
): StoryboardFrame {
    return {
        id,
        type: type as StoryboardFrame['type'],
        title: `Frame ${id}`,
        summary: `Summary for ${id}`,
        position: { x: 0, y: 0 },
        size: { width: 260, height: 160 },
        content: content as MarketingFrameContent,
        annotations: [],
    };
}

function makeBoard(frames: StoryboardFrame[]): Storyboard {
    return { id: 'test-sb', title: 'Test Campaign', frames, connections: [] };
}

describe('fallbackEventId', () => {
    it('slugifies an author-written display string without inventing a GA name', () => {
        expect(fallbackEventId('GitHub stars (week 1)')).toBe('github_stars_week_1');
        expect(fallbackEventId('  npm installs  ')).toBe('npm_installs');
    });

    it('returns unnamed for empty input rather than guessing', () => {
        expect(fallbackEventId('   ')).toBe('unnamed');
    });
});

describe('adaptCampaignHandoffToAssetPack (F-df7eed25)', () => {
    it('emits CSV rows grouped by beat id/title/type for every required asset', () => {
        const handoff = generateCampaignHandoff(launchRpgStoryboardCampaign);
        const csv = adaptCampaignHandoffToAssetPack(handoff);
        const lines = csv.split('\n');
        expect(lines[0]).toBe('beat_id,beat_title,beat_type,asset');
        expect(csv).toContain('launch-github-readme,GitHub README + Landing Page,touchpoint,');
        expect(csv).toContain('README with clear thesis, demo link, quick start');
        expect(csv).toContain('launch-announcement,Public Launch Announcement,launch_event,');
        expect(csv).toContain('Reddit post (r/gamedev, r/indiegaming)');
        expect(csv.toLowerCase()).not.toContain('hubspot');
        expect(csv.toLowerCase()).not.toContain('due date');
        expect(csv.toLowerCase()).not.toContain('owner,');
    });

    it('quotes commas inside asset text', () => {
        const board = makeBoard([
            makeFrame('asset-1', 'asset', { requiredAssets: ['Hero, 1600px, PNG'] }),
        ]);
        const csv = adaptCampaignHandoffToAssetPack(generateCampaignHandoff(board));
        expect(csv).toContain('"Hero, 1600px, PNG"');
    });

    it('header-only when no assets are listed', () => {
        const board = makeBoard([makeFrame('aud', 'audience', { objective: 'x' })]);
        const csv = adaptCampaignHandoffToAssetPack(generateCampaignHandoff(board));
        expect(csv).toBe('beat_id,beat_title,beat_type,asset');
    });

    it('rejects a payload that fails schema validation', () => {
        expect(() => adaptCampaignHandoffToAssetPack({ not: 'a handoff' })).toThrow(
            InvalidCampaignHandoffError,
        );
    });
});

describe('adaptCampaignHandoffToEventMap (F-df7eed25, F-684f138c)', () => {
    it('prefers author-committed conversionEvent / measurementEvents ids on the demo', () => {
        const handoff = generateCampaignHandoff(launchRpgStoryboardCampaign);
        expect(validateCampaignHandoff(handoff).valid).toBe(true);
        const map = adaptCampaignHandoffToEventMap(handoff);
        expect(map.campaignId).toBe(launchRpgStoryboardCampaign.id);
        const conversion = map.conversions.find(e => e.beatId === 'launch-conversion');
        expect(conversion).toEqual(expect.objectContaining({
            id: 'github_star_or_clone',
            name: 'GitHub star or clone',
            source: 'author',
        }));
        const stars = map.measurements.find(e => e.id === 'github_stars' && e.beatId === 'launch-measurement');
        expect(stars).toEqual(expect.objectContaining({
            name: 'GitHub stars (week 1, week 4)',
            source: 'github',
        }));
        expect(JSON.stringify(map)).not.toMatch(/google.?analytics/i);
        expect(JSON.stringify(map)).not.toContain('G-');
        expect(JSON.stringify(map).toLowerCase()).not.toContain('hubspot');
    });

    it('falls back to slugified conversionGoal / metrics when structured ids are absent', () => {
        const board = makeBoard([
            makeFrame('conv', 'conversion', {
                conversionGoal: 'Signup complete',
                metrics: ['Weekly active trials'],
            }),
        ]);
        const map = adaptCampaignHandoffToEventMap(generateCampaignHandoff(board));
        expect(map.conversions).toEqual([
            expect.objectContaining({
                beatId: 'conv',
                id: 'signup_complete',
                name: 'Signup complete',
                source: 'fallback',
            }),
        ]);
        expect(map.measurements).toEqual([
            expect.objectContaining({
                beatId: 'conv',
                id: 'weekly_active_trials',
                name: 'Weekly active trials',
                source: 'fallback',
            }),
        ]);
    });

    it('does not also emit fallback metrics when measurementEvents are present', () => {
        const board = makeBoard([
            makeFrame('meas', 'measurement', {
                metrics: ['GitHub stars'],
                measurementEvents: [
                    { id: 'github_stars', name: 'GitHub stars', source: 'github' },
                ],
            }),
        ]);
        const map = adaptCampaignHandoffToEventMap(generateCampaignHandoff(board));
        expect(map.measurements).toHaveLength(1);
        expect(map.measurements[0].source).toBe('github');
    });

    it('compiles every published template without inventing owners or dates', () => {
        for (const template of MARKETING_TEMPLATES) {
            const board = createCampaignFromTemplate(template.id, {
                id: `gold-${template.id}`,
                title: template.name,
            });
            const map = adaptCampaignHandoffToEventMap(generateCampaignHandoff(board));
            expect(map.conversions.length).toBeGreaterThan(0);
            expect(map.measurements.length).toBeGreaterThan(0);
            expect(map.conversions.every(e => e.source !== 'ga')).toBe(true);
        }
    });
});

describe('adaptCampaignHandoffToChecklistPack (F-df7eed25)', () => {
    it('groups checklist items by beat as markdown checkboxes', () => {
        const md = adaptCampaignHandoffToChecklistPack(
            generateCampaignHandoff(launchRpgStoryboardCampaign),
        );
        expect(md).toContain('# Implementation Checklist:');
        expect(md).toContain('## Launch Readiness Gate');
        expect(md).toContain('Beat: launch-approval (approval)');
        expect(md).toContain('- [ ] Run full ship gate audit');
        expect(md.toLowerCase()).not.toContain('due date');
        expect(md.toLowerCase()).not.toContain('hubspot');
    });

    it('notes when no checklist items exist', () => {
        const board = makeBoard([makeFrame('aud', 'audience', { objective: 'x' })]);
        const md = adaptCampaignHandoffToChecklistPack(generateCampaignHandoff(board));
        expect(md).toContain('_No implementation checklist items on this campaign._');
    });
});
