// ─── marketing-domain / handoff.test.ts ──────────────────────────────────────

import { describe, it, expect } from 'vitest';
import { statusLabels } from '@storyboard-os/core';
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import {
    generateCampaignHandoff,
    generateCampaignMarkdown,
    generateProjectCampaignHandoff,
    generateProjectCampaignMarkdown,
    validateCampaignHandoff,
    CAMPAIGN_HANDOFF_SCHEMA_ID,
    HANDOFF_FORMAT_VERSION,
} from './handoff';
import { LAUNCH_READINESS_LABELS } from './launchReadiness';
import { MARKETING_TEMPLATES, createCampaignFromTemplate } from './templates';
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

    it('stamps $schema and a launch object (F-359ea7ff, F-ed056938)', () => {
        const storyboard: Storyboard = {
            id: 'v', title: 'V', frames: [makeFrame('f1', 'audience')], connections: [],
        };
        const handoff = generateCampaignHandoff(storyboard);
        expect(handoff.$schema).toBe(CAMPAIGN_HANDOFF_SCHEMA_ID);
        expect(handoff.launch.level).toBeTruthy();
        expect(typeof handoff.launch.summary).toBe('string');
        expect(Array.isArray(handoff.launch.criticalPathFrameIds)).toBe(true);
        expect(Array.isArray(handoff.launch.approvalGateFrameIds)).toBe(true);
        expect(Array.isArray(handoff.launch.missingMeasurementFrameIds)).toBe(true);
        expect(Array.isArray(handoff.launch.openLoopFrameIds)).toBe(true);
        expect(validateCampaignHandoff(handoff).valid).toBe(true);
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
        expect(md).toContain(`| ${statusLabels.ready} |`);
        expect(md).toContain(`| ${statusLabels.partial} |`);
        expect(md).toContain(`| ${statusLabels.draft} |`);
        expect(md).toContain(`| ${statusLabels.blocked} |`);
        expect(md).not.toContain('| Ready |');
    });

    it('renders a Launch section matching the board badge (F-ed056938)', () => {
        const handoff = generateCampaignHandoff(launchRpgStoryboardCampaign);
        const md = generateCampaignMarkdown(handoff);
        expect(md).toContain('## Launch');
        expect(md).toContain(`**${LAUNCH_READINESS_LABELS[handoff.launch.level]}** — ${handoff.launch.summary}`);
        expect(md).toContain('Critical path:');
        expect(md).toContain('Approval gates:');
        expect(md).toContain('Missing measurement:');
        expect(md).toContain('Open loops:');
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

    it('emits proof points, objections handled, and owner notes when present (F-8cbc4229)', () => {
        const storyboard: Storyboard = {
            id: 'pp',
            title: 'Proof Campaign',
            frames: [
                makeFrame('msg', 'message', {
                    messageClaim: 'Ships fast',
                    proofPoints: ['Benchmarked against X'],
                    objectionsHandled: ['Too expensive → ROI calculator'],
                    ownerNotes: 'Do not promise enterprise SLA yet',
                }),
            ],
            connections: [],
        };
        const beat = generateCampaignHandoff(storyboard).beats[0];
        expect(beat.proofPoints).toEqual(['Benchmarked against X']);
        expect(beat.objectionsHandled).toEqual(['Too expensive → ROI calculator']);
        expect(beat.ownerNotes).toBe('Do not promise enterprise SLA yet');

        const md = generateCampaignMarkdown(generateCampaignHandoff(storyboard));
        expect(md).toContain('**Proof Points:**');
        expect(md).toContain('- Benchmarked against X');
        expect(md).toContain('**Objections Handled:**');
        expect(md).toContain('- Too expensive → ROI calculator');
        expect(md).toContain('**Owner Notes:**');
        expect(md).toContain('Do not promise enterprise SLA yet');
    });

    it('lists only true launch blockers under ### Blocked Beats (F-1157926f)', () => {
        const storyboard: Storyboard = {
            id: 'blk',
            title: 'Blocked Campaign',
            frames: [
                makeFrame('conv', 'conversion', {
                    // blocked: no conversionGoal; also ordinary gaps + advisory
                    objective: undefined,
                    proofPoints: undefined,
                    launchDependencies: undefined,
                }),
            ],
            connections: [],
        };
        const md = generateCampaignMarkdown(generateCampaignHandoff(storyboard));
        expect(md).toContain('### Blocked Beats');
        expect(md).toMatch(/### Blocked Beats[\s\S]*?Conversion goal not defined/);
        expect(md).not.toMatch(/### Blocked Beats[\s\S]*?no_conversion_goal/);
        // Ordinary incompleteness / advisory must not appear under Blocked Beats.
        const blockedSection = md.slice(
            md.indexOf('### Blocked Beats'),
            md.indexOf('### Spec Gaps') >= 0 ? md.indexOf('### Spec Gaps') : md.indexOf('## Campaign Beats'),
        );
        expect(blockedSection).not.toContain('no_objective');
        expect(blockedSection).not.toContain('Objective not defined');
        expect(blockedSection).not.toContain('no_proof_points');
        expect(blockedSection).not.toContain('no_launch_dependencies');
        expect(md).toContain('### Spec Gaps');
        expect(md).toMatch(/### Spec Gaps[\s\S]*?Objective not defined/);
        expect(md).not.toContain('no_objective');
        expect(md).not.toContain('no_conversion_goal');
    });

    it('lists spec gaps for every beat that has them, not only blockedIds (F-5c0c80f1)', () => {
        const storyboard: Storyboard = {
            id: 'gaps',
            title: 'Gaps Campaign',
            frames: [
                makeFrame('aud', 'audience', {
                    objective: 'Reach them',
                    // no audienceSegment / states / tests / checklist → spec gaps, not blocked
                }),
            ],
            connections: [],
        };
        const md = generateCampaignMarkdown(generateCampaignHandoff(storyboard));
        expect(md).not.toContain('### Blocked Beats');
        expect(md).toContain('### Spec Gaps');
        expect(md).toContain('Audience segment not specified');
        expect(md).not.toContain('no_audience_segment');
        expect(md).toContain('**Type:** Audience');
        expect(md).not.toContain('**Type:** audience');
    });

    it('humanizes type, status, and next-step connection types (F-5c0c80f1)', () => {
        const storyboard: Storyboard = {
            id: 'human',
            title: 'Human Campaign',
            frames: [
                makeFrame('msg', 'message', { messageClaim: 'Ships' }),
                makeFrame('conv', 'conversion', { conversionGoal: 'Signup' }),
            ],
            connections: [
                { id: 'c1', fromFrameId: 'msg', toFrameId: 'conv', type: 'sequence' },
            ],
        };
        const md = generateCampaignMarkdown(generateCampaignHandoff(storyboard));
        expect(md).toContain('**Type:** Message');
        expect(md).toContain('**Type:** Conversion');
        expect(md).not.toContain('**Status:** ready');
        expect(md).not.toContain('**Status:** blocked');
        expect(md).toMatch(/\*\*Status:\*\* (SPEC|PARTIAL|DRAFT|BLOCKED)/);
        expect(md).toContain('(campaign flow)');
        expect(md).not.toContain('(sequence)');
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

    it('escapes emphasis and link/image syntax (* _ [] ()) (F-a9199745)', () => {
        const frame = makeFrame('f1', 'message', {
            messageClaim: 'see *bold* and _italic_ plus [click](http://x)',
        });
        // Title containing *](http://x) must stay inert in the brief.
        frame.title = 'Beat*](http://x)';
        const md = generateCampaignMarkdown(generateCampaignHandoff(makeBoardWith(frame)));
        expect(md).toContain('\\*bold\\*');
        expect(md).toContain('\\_italic\\_');
        expect(md).toContain('\\[click\\]\\(http://x\\)');
        expect(md).toContain('Beat\\*\\]\\(http://x\\)');
        expect(md).not.toContain('*](http://x)');
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

describe('validateCampaignHandoff (F-359ea7ff)', () => {
    const schemaPath = join(dirname(fileURLToPath(import.meta.url)), '../schema/campaign-handoff.schema.json');

    it('publishes a 2020-12 schema whose $id matches CAMPAIGN_HANDOFF_SCHEMA_ID', () => {
        const schema = JSON.parse(readFileSync(schemaPath, 'utf8')) as {
            $schema: string;
            $id: string;
            properties: { formatVersion: { const: number } };
        };
        expect(schema.$schema).toBe('https://json-schema.org/draft/2020-12/schema');
        expect(schema.$id).toBe(CAMPAIGN_HANDOFF_SCHEMA_ID);
        expect(schema.properties.formatVersion.const).toBe(HANDOFF_FORMAT_VERSION);
    });

    it('accepts generated handoffs for the demo and every template', () => {
        expect(validateCampaignHandoff(generateCampaignHandoff(launchRpgStoryboardCampaign)).valid).toBe(true);
        for (const template of MARKETING_TEMPLATES) {
            const board = createCampaignFromTemplate(template.id, { id: `gold-${template.id}`, title: template.name });
            const result = validateCampaignHandoff(generateCampaignHandoff(board));
            expect(result.valid).toBe(true);
        }
    });

    it('rejects a payload missing $schema and launch', () => {
        const handoff = generateCampaignHandoff(launchRpgStoryboardCampaign);
        const { $schema: _s, launch: _l, ...stripped } = handoff;
        const result = validateCampaignHandoff(stripped);
        expect(result.valid).toBe(false);
        expect(result.errors.some(e => e.path === '$schema')).toBe(true);
        expect(result.errors.some(e => e.path === 'launch')).toBe(true);
    });
});

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
        // Enum-derived type label is humanized and not escaped.
        expect(md).toContain('**Type:** Message');
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
