// ─── marketing-domain / project.test.ts ──────────────────────────────────────

import { describe, it, expect } from 'vitest';
import {
    createCampaignProject,
    updateFramePosition,
    updateFrameBasics,
    updateFrameContent,
    setChecklistItemComplete,
    setTestCriterionComplete,
    getFrameProgress,
    getProjectProgress,
} from './project';

describe('createCampaignProject', () => {
    it('creates a project with a UUID', () => {
        const project = createCampaignProject({
            title: 'Test Campaign',
            templateId: 'product_launch',
        });
        expect(project.id).toMatch(/^[0-9a-f-]{36}$/);
        expect(project.title).toBe('Test Campaign');
        expect(project.sourceTemplateId).toBe('product_launch');
        expect(project.storyboard.frames.length).toBeGreaterThan(0);
        expect(project.progress.frames).toEqual({});
    });

    it('sets createdAt and updatedAt', () => {
        const project = createCampaignProject({ title: 'X', templateId: 'campaign_funnel' });
        expect(project.createdAt).toBeDefined();
        expect(project.updatedAt).toBe(project.createdAt);
    });

    it('passes description through', () => {
        const project = createCampaignProject({ title: 'X', description: 'Desc', templateId: 'product_launch' });
        expect(project.description).toBe('Desc');
    });
});

describe('updateFramePosition', () => {
    it('updates position for existing frame', () => {
        const project = createCampaignProject({ title: 'X', templateId: 'product_launch' });
        const frameId = project.storyboard.frames[0].id;
        const updated = updateFramePosition(project, frameId, { x: 999, y: 888 });
        const frame = updated.storyboard.frames.find(f => f.id === frameId)!;
        expect(frame.position).toEqual({ x: 999, y: 888 });
        // updatedAt should be set (may equal createdAt if same ms tick)
        expect(updated.updatedAt).toBeDefined();
    });

    it('returns unchanged project for unknown frameId', () => {
        const project = createCampaignProject({ title: 'X', templateId: 'product_launch' });
        const result = updateFramePosition(project, 'nonexistent', { x: 0, y: 0 });
        expect(result).toBe(project);
    });

    it('does not mutate original project', () => {
        const project = createCampaignProject({ title: 'X', templateId: 'product_launch' });
        const frameId = project.storyboard.frames[0].id;
        const originalPos = { ...project.storyboard.frames[0].position };
        updateFramePosition(project, frameId, { x: 999, y: 888 });
        expect(project.storyboard.frames[0].position).toEqual(originalPos);
    });
});

describe('updateFrameBasics', () => {
    it('updates title', () => {
        const project = createCampaignProject({ title: 'X', templateId: 'product_launch' });
        const frameId = project.storyboard.frames[0].id;
        const updated = updateFrameBasics(project, frameId, { title: 'New Title' });
        const frame = updated.storyboard.frames.find(f => f.id === frameId)!;
        expect(frame.title).toBe('New Title');
    });

    it('updates summary without touching title', () => {
        const project = createCampaignProject({ title: 'X', templateId: 'product_launch' });
        const frameId = project.storyboard.frames[0].id;
        const originalTitle = project.storyboard.frames[0].title;
        const updated = updateFrameBasics(project, frameId, { summary: 'New summary' });
        const frame = updated.storyboard.frames.find(f => f.id === frameId)!;
        expect(frame.summary).toBe('New summary');
        expect(frame.title).toBe(originalTitle);
    });

    it('no-op for empty patch', () => {
        const project = createCampaignProject({ title: 'X', templateId: 'product_launch' });
        const frameId = project.storyboard.frames[0].id;
        const result = updateFrameBasics(project, frameId, {});
        expect(result).toBe(project);
    });

    it('no-op for unknown frameId', () => {
        const project = createCampaignProject({ title: 'X', templateId: 'product_launch' });
        const result = updateFrameBasics(project, 'nonexistent', { title: 'X' });
        expect(result).toBe(project);
    });
});

describe('updateFrameContent', () => {
    it('merges content patch into existing content', () => {
        const project = createCampaignProject({ title: 'X', templateId: 'product_launch' });
        const frameId = project.storyboard.frames[0].id;
        const updated = updateFrameContent(project, frameId, { objective: 'New objective' });
        const frame = updated.storyboard.frames.find(f => f.id === frameId)!;
        expect(frame.content.objective).toBe('New objective');
        // Other fields preserved
        expect(frame.content.audienceSegment).toBeDefined();
    });

    it('no-op for unknown frameId', () => {
        const project = createCampaignProject({ title: 'X', templateId: 'product_launch' });
        const result = updateFrameContent(project, 'nonexistent', { objective: 'X' });
        expect(result).toBe(project);
    });
});

describe('progress helpers', () => {
    it('getFrameProgress returns empty for frame with no progress', () => {
        const project = createCampaignProject({ title: 'X', templateId: 'product_launch' });
        const frameId = project.storyboard.frames[0].id;
        const progress = getFrameProgress(project, frameId);
        expect(progress.checklist).toEqual({});
        expect(progress.testCriteria).toEqual({});
    });

    it('setChecklistItemComplete records progress', () => {
        const project = createCampaignProject({ title: 'X', templateId: 'product_launch' });
        const frameId = project.storyboard.frames[0].id;
        const updated = setChecklistItemComplete(project, frameId, 0, true);
        const progress = getFrameProgress(updated, frameId);
        expect(progress.checklist['0']).toBe(true);
    });

    it('setChecklistItemComplete can uncheck', () => {
        const project = createCampaignProject({ title: 'X', templateId: 'product_launch' });
        const frameId = project.storyboard.frames[0].id;
        const checked = setChecklistItemComplete(project, frameId, 0, true);
        const unchecked = setChecklistItemComplete(checked, frameId, 0, false);
        const progress = getFrameProgress(unchecked, frameId);
        expect(progress.checklist['0']).toBe(false);
    });

    it('setTestCriterionComplete records progress', () => {
        const project = createCampaignProject({ title: 'X', templateId: 'product_launch' });
        const frameId = project.storyboard.frames[0].id;
        const updated = setTestCriterionComplete(project, frameId, 1, true);
        const progress = getFrameProgress(updated, frameId);
        expect(progress.testCriteria['1']).toBe(true);
    });

    it('progress operations are no-op for unknown frameId', () => {
        const project = createCampaignProject({ title: 'X', templateId: 'product_launch' });
        const result = setChecklistItemComplete(project, 'fake', 0, true);
        expect(result).toBe(project);
    });

    it('getProjectProgress sums across all frames', () => {
        let project = createCampaignProject({ title: 'X', templateId: 'product_launch' });
        const f0 = project.storyboard.frames[0].id;
        const f1 = project.storyboard.frames[1].id;
        project = setChecklistItemComplete(project, f0, 0, true);
        project = setTestCriterionComplete(project, f1, 0, true);
        const summary = getProjectProgress(project);
        expect(summary.totalChecklist).toBeGreaterThan(0);
        expect(summary.doneChecklist).toBe(1);
        expect(summary.doneTests).toBe(1);
    });
});
