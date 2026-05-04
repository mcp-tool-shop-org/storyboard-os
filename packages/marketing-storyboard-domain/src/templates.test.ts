// ─── marketing-domain / templates.test.ts ────────────────────────────────────

import { describe, it, expect } from 'vitest';
import {
    MARKETING_TEMPLATES,
    getMarketingTemplate,
    createCampaignFromTemplate,
} from './templates';
import { validateMarketingStoryboard } from './validate';
import { getCampaignBeatStatus } from './beatStatus';
import type { MarketingTemplateId, MarketingFrameType } from './schema';

const VALID_FRAME_TYPES: MarketingFrameType[] = [
    'audience', 'message', 'touchpoint', 'asset', 'approval',
    'launch_event', 'conversion', 'follow_up', 'measurement',
];

describe('MARKETING_TEMPLATES', () => {
    it('has exactly three templates', () => {
        expect(MARKETING_TEMPLATES).toHaveLength(3);
    });

    it('each template has a unique id', () => {
        const ids = MARKETING_TEMPLATES.map(t => t.id);
        expect(new Set(ids).size).toBe(ids.length);
    });

    it('each template has a name and description', () => {
        for (const template of MARKETING_TEMPLATES) {
            expect(template.name.length).toBeGreaterThan(0);
            expect(template.description.length).toBeGreaterThan(0);
        }
    });

    for (const template of MARKETING_TEMPLATES) {
        describe(`template: ${template.id}`, () => {
            const storyboard = template.createStoryboard({ id: `test-${template.id}`, title: 'Test' });

            it('has at least 5 frames', () => {
                expect(storyboard.frames.length).toBeGreaterThanOrEqual(5);
            });

            it('has at least 4 connections', () => {
                expect(storyboard.connections.length).toBeGreaterThanOrEqual(4);
            });

            it('frameCount matches actual frame count', () => {
                expect(template.frameCount).toBe(storyboard.frames.length);
            });

            it('all frames have valid marketing frame types', () => {
                for (const frame of storyboard.frames) {
                    expect(VALID_FRAME_TYPES).toContain(frame.type);
                }
            });

            it('all frames have non-empty title and summary', () => {
                for (const frame of storyboard.frames) {
                    expect(frame.title.trim().length).toBeGreaterThan(0);
                    expect(frame.summary.trim().length).toBeGreaterThan(0);
                }
            });

            it('all frames have valid position and size', () => {
                for (const frame of storyboard.frames) {
                    expect(frame.position.x).toBeGreaterThanOrEqual(0);
                    expect(frame.position.y).toBeGreaterThanOrEqual(0);
                    expect(frame.size.width).toBeGreaterThanOrEqual(40);
                    expect(frame.size.height).toBeGreaterThanOrEqual(40);
                }
            });

            it('all frame IDs are unique within the template', () => {
                const ids = storyboard.frames.map(f => f.id);
                expect(new Set(ids).size).toBe(ids.length);
            });

            it('all connections reference valid frame IDs', () => {
                const ids = new Set(storyboard.frames.map(f => f.id));
                for (const conn of storyboard.connections) {
                    expect(ids.has(conn.fromFrameId)).toBe(true);
                    expect(ids.has(conn.toFrameId)).toBe(true);
                }
            });

            it('every frame has implementationChecklist or testCriteria', () => {
                for (const frame of storyboard.frames) {
                    const hasChecklist = (frame.content.implementationChecklist?.length ?? 0) > 0;
                    const hasTests = (frame.content.testCriteria?.length ?? 0) > 0;
                    expect(hasChecklist || hasTests).toBe(true);
                }
            });

            it('no frame contains planner-drift terminology', () => {
                const driftTerms = ['content calendar', 'editorial calendar', 'social schedule', 'posting schedule', 'upload schedule'];
                for (const frame of storyboard.frames) {
                    const str = JSON.stringify(frame.content).toLowerCase();
                    for (const term of driftTerms) {
                        expect(str).not.toContain(term);
                    }
                }
            });

            it('passes structural validation', () => {
                const result = validateMarketingStoryboard(storyboard);
                // Template frames should not have blocking validation errors
                const structuralErrors = result.errors.filter(e => !e.code.startsWith('MARKETING_'));
                expect(structuralErrors).toHaveLength(0);
            });
        });
    }
});

describe('getMarketingTemplate', () => {
    it('returns template by ID', () => {
        const t = getMarketingTemplate('product_launch');
        expect(t).toBeDefined();
        expect(t!.id).toBe('product_launch');
    });

    it('returns undefined for unknown ID', () => {
        const t = getMarketingTemplate('nonexistent' as MarketingTemplateId);
        expect(t).toBeUndefined();
    });
});

describe('createCampaignFromTemplate', () => {
    it('creates a storyboard with custom id and title', () => {
        const sb = createCampaignFromTemplate('product_launch', {
            id: 'my-campaign',
            title: 'My Launch',
            description: 'Test description',
        });
        expect(sb.id).toBe('my-campaign');
        expect(sb.title).toBe('My Launch');
        expect(sb.description).toBe('Test description');
        expect(sb.frames.length).toBeGreaterThan(0);
    });

    it('throws on unknown template', () => {
        expect(() =>
            createCampaignFromTemplate('fake' as MarketingTemplateId, { id: 'x', title: 'X' }),
        ).toThrow('Unknown marketing template');
    });

    it('preserves all frames from template', () => {
        const template = getMarketingTemplate('campaign_funnel')!;
        const sb = createCampaignFromTemplate('campaign_funnel', { id: 'test', title: 'Test' });
        expect(sb.frames.length).toBe(template.frameCount);
    });
});
