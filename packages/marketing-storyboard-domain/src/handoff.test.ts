// ─── marketing-domain / handoff.test.ts ──────────────────────────────────────

import { describe, it, expect } from 'vitest';
import {
    generateCampaignHandoff,
    generateCampaignMarkdown,
    generateProjectCampaignHandoff,
    generateProjectCampaignMarkdown,
} from './handoff';
import { launchRpgStoryboardCampaign } from './demo-campaign';
import { createCampaignProject, setChecklistItemComplete, updateFrameContent } from './project';
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

    it('stamps formatVersion: 1 for downstream importers (PR-004)', () => {
        const storyboard: Storyboard = {
            id: 'v', title: 'V', frames: [makeFrame('f1', 'audience')], connections: [],
        };
        expect(generateCampaignHandoff(storyboard).formatVersion).toBe(1);
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

    it('stamps formatVersion: 1 for downstream importers (PR-004)', () => {
        const project = createCampaignProject({ title: 'V', templateId: 'product_launch' });
        expect(generateProjectCampaignHandoff(project).formatVersion).toBe(1);
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

// ─── DM-001 (e) — project markdown after checklist reorder ────────────────────

describe('generateProjectCampaignMarkdown — progress follows item text (DM-001)', () => {
    it('renders [x] on the correct item text after a checklist reorder', () => {
        let project = createCampaignProject({ title: 'Reorder Campaign', templateId: 'product_launch' });
        const fid = project.storyboard.frames[0].id;
        project = updateFrameContent(project, fid, {
            implementationChecklist: ['first task', 'second task'],
        });
        project = setChecklistItemComplete(project, fid, 1, true); // 'second task' done
        project = updateFrameContent(project, fid, {
            implementationChecklist: ['second task', 'first task'], // reorder
        });
        const md = generateProjectCampaignMarkdown(generateProjectCampaignHandoff(project));
        expect(md).toContain('- [x] second task');
        expect(md).toContain('- [ ] first task');
        expect(md).not.toContain('- [x] first task');
    });
});

// ─── DM-004 — markdown escapes user text ──────────────────────────────────────

describe('DM-004 — markdown escapes user text', () => {
    const HOSTILE = '`code` <img src=x onerror=x> | pipe';

    function makeBoardWith(frame: StoryboardFrame): Storyboard {
        return { id: 'test-sb', title: 'Test Campaign', frames: [frame], connections: [] };
    }

    it('neutralizes backticks, raw HTML, and pipes in frame titles', () => {
        const frame = makeFrame('f1', 'audience', {});
        frame.title = HOSTILE;
        const md = generateCampaignMarkdown(generateCampaignHandoff(makeBoardWith(frame)));
        expect(md).not.toContain('<img');       // raw HTML inert
        expect(md).toContain('&lt;img');
        expect(md).not.toContain('`code`');     // backticks cannot open a code span
        expect(md).toContain('\\`code\\`');
        expect(md).toContain('\\|');            // pipes escaped
    });

    it('prevents heading hijack from a leading "# " in summaries', () => {
        const frame = makeFrame('f1', 'audience', {});
        frame.summary = '# Fake Heading';
        const md = generateCampaignMarkdown(generateCampaignHandoff(makeBoardWith(frame)));
        expect(md).not.toMatch(/^# Fake Heading/m);
        expect(md).toContain('\\# Fake Heading');
    });

    it('escapes the campaign title in the document heading', () => {
        const frame = makeFrame('f1', 'audience', {});
        const board = makeBoardWith(frame);
        board.title = 'Campaign <script>alert(1)</script>';
        const md = generateCampaignMarkdown(generateCampaignHandoff(board));
        expect(md).not.toContain('<script>');
        expect(md).toContain('&lt;script>');
    });

    it('escapes checklist items and message claims', () => {
        const frame = makeFrame('f1', 'message', {
            messageClaim: 'claim with `ticks` | and pipe',
            implementationChecklist: ['<img src=x onerror=x>'],
        });
        const md = generateCampaignMarkdown(generateCampaignHandoff(makeBoardWith(frame)));
        expect(md).not.toContain('<img');
        expect(md).toContain('&lt;img');
        expect(md).not.toContain('`ticks`');
    });

    it('escapes user text in the project markdown too', () => {
        let project = createCampaignProject({ title: 'T', templateId: 'product_launch' });
        const fid = project.storyboard.frames[0].id;
        project = updateFrameContent(project, fid, {
            implementationChecklist: ['<img src=x onerror=x>'],
        });
        const md = generateProjectCampaignMarkdown(generateProjectCampaignHandoff(project));
        expect(md).not.toContain('<img');
        expect(md).toContain('&lt;img');
    });
});

// ─── V3-001 — benign text round-trips unchanged (faithfulness) ────────────────
//
// The escaping tests above prove hostile input is neutralized. This guards the
// other direction: ordinary text with NO markdown-special characters must
// survive the render byte-for-byte — no stray backslashes, no &lt;, no mangling.

describe('V3-001 — benign text renders unchanged (no over-escaping)', () => {
    function makeBoardWith(frame: StoryboardFrame): Storyboard {
        return { id: 'test-sb', title: 'Test Campaign', frames: [frame], connections: [] };
    }

    it('preserves an ordinary title, message, and checklist/asset items verbatim', () => {
        const frame = makeFrame('f1', 'message', {
            messageClaim: 'Ships in minutes, not weeks.',
            requiredAssets: ['assets/hero-banner.png'],
            implementationChecklist: ['Draft the launch email'],
            testCriteria: ['CTA fires the signup event'],
        });
        frame.title = 'Campaign Alpha';
        frame.summary = 'Announce the launch to warm leads.';
        const md = generateCampaignMarkdown(generateCampaignHandoff(makeBoardWith(frame)));

        expect(md).toContain('Campaign Alpha');
        expect(md).toContain('Announce the launch to warm leads.');
        expect(md).toContain('Ships in minutes, not weeks.');
        expect(md).toContain('assets/hero-banner.png');
        expect(md).toContain('Draft the launch email');
        expect(md).toContain('CTA fires the signup event');
        // Enum-derived type label is not escaped and reads plainly.
        expect(md).toContain('**Type:** message');
        // No collateral damage from escaping a string that needed none.
        expect(md).not.toContain('\\');
        expect(md).not.toContain('&lt;');
    });

    it('preserves benign checklist text verbatim in the project markdown', () => {
        let project = createCampaignProject({ title: 'Campaign Alpha', templateId: 'product_launch' });
        const fid = project.storyboard.frames[0].id;
        project = updateFrameContent(project, fid, {
            implementationChecklist: ['Draft the launch email'],
            requiredAssets: ['assets/hero-banner.png'],
        });
        const md = generateProjectCampaignMarkdown(generateProjectCampaignHandoff(project));
        expect(md).toContain('Campaign Alpha');
        expect(md).toContain('- [ ] Draft the launch email');
        // The benign item is not mangled with an escape backslash.
        expect(md).not.toContain('\\Draft');
    });
});
