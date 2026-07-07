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

// ─── DM-001 — progress reconciliation on checklist/testCriteria edits ─────────
//
// updateFrameContent replaces spec arrays wholesale while progress is keyed by
// index. Without reconciliation, done marks silently attach to different item
// texts after a reorder/insert/delete. These tests pin ✓-to-text attachment.

describe('updateFrameContent — progress reconciliation (DM-001)', () => {
    /** Project whose first frame has a known checklist, with given texts done. */
    function seedChecklist(items: string[], doneTexts: string[]) {
        let p = createCampaignProject({ title: 'Test', templateId: 'product_launch' });
        const fid = p.storyboard.frames[0].id;
        p = updateFrameContent(p, fid, { implementationChecklist: items });
        for (const text of doneTexts) {
            p = setChecklistItemComplete(p, fid, items.indexOf(text), true);
        }
        return { p, fid };
    }

    it('(a) reorder preserves which TEXTS are done', () => {
        const { p, fid } = seedChecklist(['alpha', 'beta', 'gamma'], ['beta']);
        const reordered = updateFrameContent(p, fid, {
            implementationChecklist: ['gamma', 'alpha', 'beta'],
        });
        const fp = getFrameProgress(reordered, fid);
        // 'beta' moved from index 1 to index 2 — the done mark must follow the text.
        expect(fp.checklist['2']).toBe(true);
        expect(fp.checklist['0']).not.toBe(true);
        expect(fp.checklist['1']).not.toBe(true);
    });

    it('(b) insert-before shifts done marks to the new index', () => {
        const { p, fid } = seedChecklist(['alpha', 'beta'], ['beta']);
        const inserted = updateFrameContent(p, fid, {
            implementationChecklist: ['new first task', 'alpha', 'beta'],
        });
        const fp = getFrameProgress(inserted, fid);
        expect(fp.checklist['2']).toBe(true); // beta: 1 → 2
        expect(fp.checklist['0']).not.toBe(true); // inserted item is not done
        expect(fp.checklist['1']).not.toBe(true);
    });

    it('(c) delete of a done item drops only that mark', () => {
        const { p, fid } = seedChecklist(['alpha', 'beta', 'gamma'], ['alpha', 'gamma']);
        const deleted = updateFrameContent(p, fid, {
            implementationChecklist: ['beta', 'gamma'], // alpha (done) removed
        });
        const fp = getFrameProgress(deleted, fid);
        expect(fp.checklist['1']).toBe(true); // gamma still done at its new index
        expect(fp.checklist['0']).not.toBe(true); // beta was never done
        expect(Object.values(fp.checklist).filter(v => v === true)).toHaveLength(1);
    });

    it('(d) unchanged arrays leave progress untouched', () => {
        const { p, fid } = seedChecklist(['alpha', 'beta'], ['beta']);
        const before = getFrameProgress(p, fid);
        const same = updateFrameContent(p, fid, {
            implementationChecklist: ['alpha', 'beta'],
        });
        expect(getFrameProgress(same, fid)).toEqual(before);
    });

    it('patching an unrelated field leaves progress untouched', () => {
        const { p, fid } = seedChecklist(['alpha', 'beta'], ['beta']);
        const before = getFrameProgress(p, fid);
        const patched = updateFrameContent(p, fid, { objective: 'Objective' });
        expect(getFrameProgress(patched, fid)).toEqual(before);
    });

    it('duplicate texts claim matches in order (stable)', () => {
        const { p, fid } = seedChecklist(['dup', 'dup', 'other'], ['dup']);
        // First 'dup' (index 0) is done. Remove one 'dup'.
        const edited = updateFrameContent(p, fid, {
            implementationChecklist: ['dup', 'other'],
        });
        const fp = getFrameProgress(edited, fid);
        expect(fp.checklist['0']).toBe(true); // one dup remains done
        expect(Object.values(fp.checklist).filter(v => v === true)).toHaveLength(1);
    });

    it('drops all marks when every done text is removed', () => {
        const { p, fid } = seedChecklist(['alpha', 'beta'], ['alpha', 'beta']);
        const replaced = updateFrameContent(p, fid, {
            implementationChecklist: ['entirely', 'new', 'items'],
        });
        const fp = getFrameProgress(replaced, fid);
        expect(Object.values(fp.checklist).filter(v => v === true)).toHaveLength(0);
    });

    it('reconciles testCriteria progress the same way', () => {
        let p = createCampaignProject({ title: 'Test', templateId: 'product_launch' });
        const fid = p.storyboard.frames[0].id;
        p = updateFrameContent(p, fid, { testCriteria: ['t-one', 't-two'] });
        p = setTestCriterionComplete(p, fid, 1, true); // 't-two' done
        const reordered = updateFrameContent(p, fid, { testCriteria: ['t-two', 't-one'] });
        const fp = getFrameProgress(reordered, fid);
        expect(fp.testCriteria['0']).toBe(true); // t-two followed to index 0
        expect(fp.testCriteria['1']).not.toBe(true);
    });

    it('getProjectProgress counts stay attached to texts after a reorder', () => {
        const { p, fid } = seedChecklist(['alpha', 'beta', 'gamma'], ['beta']);
        const reordered = updateFrameContent(p, fid, {
            implementationChecklist: ['beta', 'gamma', 'alpha'],
        });
        const summary = getProjectProgress(reordered);
        expect(summary.doneChecklist).toBe(1); // still exactly one done item
        const fp = getFrameProgress(reordered, fid);
        expect(fp.checklist['0']).toBe(true); // and it is 'beta'
    });
});
