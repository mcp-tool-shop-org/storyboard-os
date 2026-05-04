// ─── marketing-domain / demo-campaign.ts ─────────────────────────────────────
//
// Demo campaign: "Launch rpg-storyboard as first Storyboard OS vertical"
//
// Dogfoods the tool immediately — this is a real campaign for a real product.
// Every frame carries full spec depth: customer state transitions, required
// assets, approval gates, conversion goals, and measurement checkpoints.
//
// ─────────────────────────────────────────────────────────────────────────────

import type { Storyboard, StoryboardFrame } from './schema';

const frames: StoryboardFrame[] = [
    {
        id: 'launch-audience',
        type: 'audience',
        title: 'RPG Game Designers & Writers',
        summary: 'Indie RPG developers, game designers, and narrative writers who need structured quest/scene tools.',
        position: { x: 80, y: 200 },
        size: { width: 260, height: 160 },
        content: {
            objective: 'Identify and qualify the primary audience for rpg-storyboard launch',
            audienceSegment: 'Indie RPG game developers, narrative designers, writers working on quest-driven games',
            customerStateBefore: [
                'Using spreadsheets, wikis, or generic diagram tools for quest design',
                'No visual tool that understands RPG structure (branches, state changes, conditions)',
                'Handoff to devs requires supplementary documentation',
            ],
            customerStateAfter: [
                'Aware that rpg-storyboard exists',
                'Understands it is specifically for RPG quest/scene design, not a generic tool',
            ],
            testCriteria: [
                'Can target this segment via gamedev communities (itch.io, indie-dev discords, r/gamedev)',
                'Persona has confirmed pain: "I use spreadsheets and it sucks"',
            ],
            implementationChecklist: [
                'Map gamedev communities where RPG designers congregate',
                'Identify 5 indie RPG projects in active development',
                'Validate pain point via 3 conversations or posts',
            ],
        },
        annotations: [],
    },
    {
        id: 'launch-message',
        type: 'message',
        title: 'Core Launch Message',
        summary: 'The single claim: "Design RPG quests visually with game-state awareness — not a generic diagram."',
        position: { x: 380, y: 200 },
        size: { width: 260, height: 160 },
        content: {
            objective: 'Craft the primary message that differentiates rpg-storyboard from wikis and diagrams',
            messageClaim: 'Design implementable RPG quests on a visual board — every frame carries entry conditions, state changes, required assets, and test criteria.',
            proofPoints: [
                'Open source, MIT licensed',
                '368 tests proving the domain model',
                'Full spec depth per beat — not blank boxes',
                'Topological handoff export for developers',
            ],
            objectionsHandled: [
                '"I can do this in Miro/FigJam" → Those are blank canvases. This has RPG vocabulary built in.',
                '"Why not just use my engine\'s editor?" → Engine editors bury narrative in implementation. This separates design from code.',
                '"Is this just for tabletop?" → No. This is explicitly for video game RPG production.',
            ],
            customerStateBefore: ['Unaware or skeptical'],
            customerStateAfter: ['Understands the differentiation and wants to try it'],
            testCriteria: [
                'Message passes the "so what?" test with 3 game designers',
                'Claim is provable by linking to the demo board',
            ],
            implementationChecklist: [
                'Write 3 headline variations',
                'Test message in 2 gamedev communities',
                'Finalize based on response',
            ],
        },
        annotations: [],
    },
    {
        id: 'launch-github-readme',
        type: 'touchpoint',
        title: 'GitHub README + Landing Page',
        summary: 'Primary discovery surface — README is the landing page for open source.',
        position: { x: 680, y: 200 },
        size: { width: 260, height: 160 },
        content: {
            objective: 'Convert GitHub visitors into users who clone/star/try the tool',
            channel: 'GitHub repo + GitHub Pages landing',
            requiredAssets: [
                'README with clear thesis, demo link, quick start',
                'Landing page with features, code cards, handbook link',
                'Logo and brand badge',
                'Translations (7 languages)',
            ],
            customerStateBefore: ['Found repo via search, link, or community post'],
            customerStateAfter: ['Understands what it is, clones it, runs pnpm dev'],
            metrics: ['GitHub stars', 'Clones', 'Landing page visits'],
            testCriteria: [
                'README answers "what is this?" in 10 seconds',
                'Quick start works from a fresh clone',
                'Landing page loads in < 2s',
            ],
            implementationChecklist: [
                'Write README',
                'Build landing page via site-theme',
                'Deploy to GitHub Pages',
                'Verify quick start works',
            ],
        },
        annotations: [],
    },
    {
        id: 'launch-approval',
        type: 'approval',
        title: 'Launch Readiness Gate',
        summary: 'Ship gate: all tests pass, packages on npm, docs complete, no blockers.',
        position: { x: 980, y: 100 },
        size: { width: 260, height: 160 },
        content: {
            objective: 'Verify product is ready for public attention',
            approvalRequirements: [
                '368/368 tests passing',
                '42/42 pages building',
                'npm packages published (@storyboard-os/*)',
                'Landing page live',
                'Handbook deployed',
                'SHIP_GATE.md all hard gates checked',
            ],
            launchDependencies: [
                'CI green on master',
                'v1.0.1 tag applied',
                'npm publish workflow succeeded',
            ],
            testCriteria: [
                'pnpm verify passes from fresh clone',
                'npm packages installable',
                'Landing page accessible',
            ],
            implementationChecklist: [
                'Run full ship gate audit',
                'Verify npm packages published',
                'Test fresh clone experience',
                'Confirm landing page live',
            ],
        },
        annotations: [],
    },
    {
        id: 'launch-announcement',
        type: 'launch_event',
        title: 'Public Launch Announcement',
        summary: 'Coordinated announcement across gamedev communities and social.',
        position: { x: 980, y: 320 },
        size: { width: 260, height: 160 },
        content: {
            objective: 'Generate maximum qualified awareness in the first 48 hours',
            channel: 'Multi-channel: Reddit, Discord, Twitter/X, Hacker News',
            launchDependencies: [
                'Launch readiness gate passed',
                'All assets produced',
                'Posts drafted and reviewed',
            ],
            requiredAssets: [
                'Reddit post (r/gamedev, r/indiegaming)',
                'Discord message for relevant servers',
                'Twitter/X thread',
                'Optional: Hacker News Show HN',
            ],
            customerStateBefore: ['Unaware or vaguely aware'],
            customerStateAfter: ['Knows rpg-storyboard is live and tries it'],
            testCriteria: [
                'Posts go live within 2-hour window',
                'All links work',
                'Demo board is accessible',
            ],
            implementationChecklist: [
                'Draft Reddit post',
                'Draft Twitter thread',
                'Identify 3 Discord servers to announce in',
                'Schedule coordinated posting window',
                'Monitor and respond to comments',
            ],
        },
        annotations: [],
    },
    {
        id: 'launch-conversion',
        type: 'conversion',
        title: 'GitHub Star + Clone',
        summary: 'Primary conversion: user stars the repo and/or clones it locally.',
        position: { x: 1280, y: 200 },
        size: { width: 260, height: 160 },
        content: {
            objective: 'Convert interested visitors into active users who run the tool',
            conversionGoal: 'User stars repo AND/OR clones and runs pnpm dev successfully',
            metrics: ['Stars gained in first week', 'Clones in first week', 'npm installs of @storyboard-os/*'],
            customerStateBefore: ['Read about it, visiting repo'],
            customerStateAfter: ['Running it locally, exploring demo board'],
            testCriteria: [
                'Fresh clone → pnpm install → pnpm dev works in < 2 minutes',
                'Demo board loads and is navigable',
            ],
            implementationChecklist: [
                'Ensure quick start is < 4 commands',
                'Test on Node 20 + pnpm 9',
                'Verify demo board renders correctly',
            ],
        },
        annotations: [],
    },
    {
        id: 'launch-follow-up',
        type: 'follow_up',
        title: 'Community Engagement',
        summary: 'Post-launch: respond to feedback, issues, and feature requests.',
        position: { x: 1580, y: 200 },
        size: { width: 260, height: 160 },
        content: {
            objective: 'Retain early adopters and build community momentum',
            channel: 'GitHub Issues + Discord + Reddit replies',
            customerStateBefore: ['Tried it, has opinions or questions'],
            customerStateAfter: ['Feels heard, contributes feedback, stays engaged'],
            requiredAssets: [
                'Issue templates (bug, feature request)',
                'Contributing guide (if accepting PRs)',
                'Response templates for common questions',
            ],
            testCriteria: [
                'All issues get first response within 48h',
                'Community questions answered within 24h',
            ],
            implementationChecklist: [
                'Set up issue templates',
                'Monitor GitHub notifications',
                'Respond to Reddit/Discord comments',
                'Track feature requests',
            ],
        },
        annotations: [],
    },
    {
        id: 'launch-measurement',
        type: 'measurement',
        title: 'Launch Metrics & Learnings',
        summary: 'Week-1 and week-4 readout: what worked, what to do next.',
        position: { x: 1880, y: 200 },
        size: { width: 260, height: 160 },
        content: {
            objective: 'Quantify launch success and extract learnings for Phase 3 marketing',
            metrics: [
                'GitHub stars (week 1, week 4)',
                'Clones (week 1, week 4)',
                'npm installs',
                'Issues opened (signal of engagement)',
                'Community mentions',
            ],
            customerStateBefore: ['Launch activity data accumulating'],
            customerStateAfter: ['Learnings documented, next campaign planned'],
            testCriteria: [
                'Can measure all listed metrics',
                'Readout happens within 7 days of launch',
            ],
            implementationChecklist: [
                'Set up GitHub traffic dashboard',
                'Track npm download stats',
                'Schedule week-1 readout',
                'Document learnings and next actions',
            ],
        },
        annotations: [],
    },
];

export const launchRpgStoryboardCampaign: Storyboard = {
    id: 'campaign-01',
    title: 'Launch rpg-storyboard as First Storyboard OS Vertical',
    description: 'Coordinated launch campaign for rpg-storyboard — from audience definition through measurement. Dogfoods the marketing-storyboard vertical.',
    frames,
    connections: [
        { id: 'conn-01', fromFrameId: 'launch-audience', toFrameId: 'launch-message', type: 'sequence' },
        { id: 'conn-02', fromFrameId: 'launch-message', toFrameId: 'launch-github-readme', type: 'sequence' },
        { id: 'conn-03', fromFrameId: 'launch-github-readme', toFrameId: 'launch-approval', type: 'dependency' },
        { id: 'conn-04', fromFrameId: 'launch-github-readme', toFrameId: 'launch-announcement', type: 'sequence' },
        { id: 'conn-05', fromFrameId: 'launch-approval', toFrameId: 'launch-announcement', type: 'consequence' },
        { id: 'conn-06', fromFrameId: 'launch-announcement', toFrameId: 'launch-conversion', type: 'sequence' },
        { id: 'conn-07', fromFrameId: 'launch-conversion', toFrameId: 'launch-follow-up', type: 'sequence' },
        { id: 'conn-08', fromFrameId: 'launch-follow-up', toFrameId: 'launch-measurement', type: 'sequence' },
    ],
};
