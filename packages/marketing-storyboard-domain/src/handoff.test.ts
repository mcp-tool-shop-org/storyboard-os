// ─── marketing-domain / handoff.test.ts ──────────────────────────────────────

import { describe, it, expect } from 'vitest';
import {
    generateCampaignHandoff,
    generateCampaignMarkdown,
    generateProjectCampaignHandoff,
    generateProjectCampaignMarkdown,
} from './handoff';
import { launchRpgStoryboardCampaign } from './demo-campaign';
import { createCampaignProject, setChecklistItemComplete } from './project';
import type { Storyboard, StoryboardFrame, MarketingFrameContent } from './schema';

function makeFrame(
    id: string,
    type: string,
    content: Partial<MarketingFrameContent> = {},
): StoryboardFrame {
    return {
        id,
        type: type as any,
        title: `Frame ${id}`,
        summary: `Summary for ${id}`,
        position: { x: 0, y: 0 },
        size: { width: 260, height: 160 },
        content: content as MarketingFrameContent,
        annotations: [],
    };
}

describe('generateCampaignHandoff', () => {
    it('returns handoff with correct metadata', () => {
        const storyboard: Storyboard = {
            id: 'test-sb',
            title: 'Test Campaign',
            description: 'A test',
            frames: [makeFrame('f1', 'audience', { objective: 'test' })],
            connections: [],
        };
        const handoff = generateCampaignHandoff(storyboard);
        expect(handoff.id).toBe('test-sb');
        expect(handoff.title).toBe('Test Campaign');
        expect(handoff.generatedAt).toBeDefined();
    });

    it('returns beats in topological order', () => {
        const storyboard: Storyboard = {
            id: 'test',
            title: 'Test',
            frames: [
                makeFrame('c', 'measurement'),
                makeFrame('a', 'audience'),
                makeFrame('b', 'message', { messageClaim: 'claim' }),
            ],
            connections: [
                { id: 'conn-1', fromFrameId: 'a', toFrameId: 'b', type: 'sequence' },
                { id: 'conn-2', fromFrameId: 'b', toFrameId: 'c', type: 'sequence' },
            ],
        };
        const handoff = generateCampaignHandoff(storyboard);
        const order = handoff.beats.map(b => b.id);
        expect(order.indexOf('a')).toBeLessThan(order.indexOf('b'));
        expect(order.indexOf('b')).toBeLessThan(order.indexOf('c'));
    });

    it('reports blocked frames', () => {
        const storyboard: Storyboard = {
            id: 'test',
            title: 'Test',
            frames: [
                makeFrame('conv', 'conversion', {}), // missing conversionGoal
            ],
            connections: [],
        };
        const handoff = generateCampaignHandoff(storyboard);
        expect(handoff.blockedIds).toContain('conv');
    });

    it('reports outgoing branches', () => {
        const storyboard: Storyboard = {
            id: 'test',
            title: 'Test',
            frames: [
                makeFrame('a', 'audience'),
                makeFrame('b', 'message', { messageClaim: 'x' }),
            ],
            connections: [
                { id: 'c1', fromFrameId: 'a', toFrameId: 'b', type: 'sequence' },
            ],
        };
        const handoff = generateCampaignHandoff(storyboard);
        const beatA = handoff.beats.find(b => b.id === 'a')!;
        expect(beatA.outgoingBranches).toHaveLength(1);
        expect(beatA.outgoingBranches[0].toId).toBe('b');
    });

    it('reports incoming connections', () => {
        const storyboard: Storyboard = {
            id: 'test',
            title: 'Test',
            frames: [
                makeFrame('a', 'audience'),
                makeFrame('b', 'message', { messageClaim: 'x' }),
            ],
            connections: [
                { id: 'c1', fromFrameId: 'a', toFrameId: 'b', type: 'sequence' },
            ],
        };
        const handoff = generateCampaignHandoff(storyboard);
        const beatB = handoff.beats.find(b => b.id === 'b')!;
        expect(beatB.incomingFromIds).toContain('a');
    });

    it('works on the demo campaign', () => {
        const handoff = generateCampaignHandoff(launchRpgStoryboardCampaign);
        expect(handoff.beats.length).toBe(8);
        expect(handoff.title).toContain('rpg-storyboard');
    });
});

describe('generateCampaignMarkdown', () => {
    it('renders markdown with title and readiness table', () => {
        const handoff = generateCampaignHandoff(launchRpgStoryboardCampaign);
        const md = generateCampaignMarkdown(handoff);
        expect(md).toContain('# Campaign Implementation Brief');
        expect(md).toContain('## Readiness');
        expect(md).toContain('| Ready |');
    });

    it('includes beat sections', () => {
        const handoff = generateCampaignHandoff(launchRpgStoryboardCampaign);
        const md = generateCampaignMarkdown(handoff);
        expect(md).toContain('## Campaign Beats');
        expect(md).toContain('### RPG Game Designers & Writers');
    });

    it('includes implementation checklist items', () => {
        const handoff = generateCampaignHandoff(launchRpgStoryboardCampaign);
        const md = generateCampaignMarkdown(handoff);
        expect(md).toContain('- [ ]');
    });
});

describe('generateProjectCampaignHandoff', () => {
    it('includes project metadata', () => {
        const project = createCampaignProject({ title: 'My Campaign', templateId: 'product_launch' });
        const handoff = generateProjectCampaignHandoff(project);
        expect(handoff.projectId).toBe(project.id);
        expect(handoff.projectTitle).toBe('My Campaign');
        expect(handoff.sourceTemplateId).toBe('product_launch');
    });

    it('includes progress summary', () => {
        let project = createCampaignProject({ title: 'X', templateId: 'product_launch' });
        const frameId = project.storyboard.frames[0].id;
        project = setChecklistItemComplete(project, frameId, 0, true);
        const handoff = generateProjectCampaignHandoff(project);
        expect(handoff.progress.doneChecklist).toBe(1);
    });

    it('includes per-beat progress', () => {
        let project = createCampaignProject({ title: 'X', templateId: 'product_launch' });
        const frameId = project.storyboard.frames[0].id;
        project = setChecklistItemComplete(project, frameId, 0, true);
        const handoff = generateProjectCampaignHandoff(project);
        const beat = handoff.beats.find(b => b.id === frameId)!;
        expect(beat.checklistProgress['0']).toBe(true);
    });
});

describe('generateProjectCampaignMarkdown', () => {
    it('renders markdown with progress markers', () => {
        let project = createCampaignProject({ title: 'X', templateId: 'product_launch' });
        const frameId = project.storyboard.frames[0].id;
        project = setChecklistItemComplete(project, frameId, 0, true);
        const handoff = generateProjectCampaignHandoff(project);
        const md = generateProjectCampaignMarkdown(handoff);
        expect(md).toContain('[x]');
        expect(md).toContain('[ ]');
        expect(md).toContain('## Progress');
    });
});
