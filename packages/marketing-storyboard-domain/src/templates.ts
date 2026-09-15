// ─── marketing-domain / templates.ts ─────────────────────────────────────────
//
// Three production campaign templates.
//
// Each template generates a complete storyboard with full spec depth — not
// blank starting points. A marketer can read the generated board and understand
// what each beat requires without supplementary docs.
//
// ─────────────────────────────────────────────────────────────────────────────

import type { CreateStoryboardInput } from '@storyboard-os/core';
import type {
    MarketingTemplateId,
    MarketingFrameType,
    MarketingFrameContent,
    StoryboardFrame,
    Storyboard,
    StoryboardTemplateDefinition,
} from './schema';
import { BOARD_SCHEMA_VERSION } from './schema';
import { launchRpgStoryboardCampaign } from './demo-campaign';
// ─── Helper ───────────────────────────────────────────────────────────────────

function makeFrame(
    idPrefix: string,
    slug: string,
    type: MarketingFrameType,
    title: string,
    summary: string,
    content: MarketingFrameContent,
    position: { x: number; y: number },
): StoryboardFrame {
    return {
        id: `${idPrefix}-${slug}`,
        type,
        title,
        summary,
        position,
        size: { width: 260, height: 160 },
        content,
        annotations: [],
    };
}

// ─── Product Launch Flow ──────────────────────────────────────────────────────

const PRODUCT_LAUNCH_SEGMENT =
    'Growth marketers, campaign managers, and GTM engineers at indie developer-tools who currently brief launches in slides and spreadsheets';

function productLaunchFrames(idPrefix: string): StoryboardFrame[] {
    return [
        makeFrame(idPrefix, 'audience', 'audience', 'Target Audience', 'Growth marketers who brief launches in decks and need an implementation contract.', {
            objective: 'Name and qualify the primary audience for the marketing-storyboard public launch',
            audienceSegment: PRODUCT_LAUNCH_SEGMENT,
            customerStateBefore: [
                'Planning launches in slides, wikis, or generic whiteboards',
                'Handoff to design and engineering is a follow-up meeting',
                'No shared implementation contract for a campaign',
            ],
            customerStateAfter: [
                'Recognizes they need an implementation board, not another deck',
                'Can name marketing-storyboard as the tool that carries audience, assets, approvals, and measurement per beat',
            ],
            proofPoints: [
                'Demo campaign (campaign-01) is a real rpg-storyboard launch, not a blank scaffold',
                'Nine marketing frame types map onto launch work rather than a generic diagram',
            ],
            launchDependencies: [
                'Persona interviews or community posts confirming the pain',
                'Segment is reachable via GitHub, indie-SaaS Slack, and r/marketing',
            ],
            testCriteria: [
                'Can name three communities where this segment already gathers',
                'Persona confirms "our launch brief is a slide deck and it falls apart in execution"',
            ],
            implementationChecklist: [
                'Map five communities (GitHub Discussions, indie-SaaS Slack, r/marketing, HN, indie-tool newsletters)',
                'Write a one-paragraph persona',
                'Validate the pain in three conversations or posts',
            ],
        }, { x: 80, y: 200 }),

        makeFrame(idPrefix, 'message', 'message', 'Core Message', 'Single claim: a visual board that is a launch-ready implementation contract.', {
            objective: 'Lock the single claim that separates an implementation board from a generic whiteboard',
            audienceSegment: PRODUCT_LAUNCH_SEGMENT,
            messageClaim: 'Design a launch-ready campaign as a visual board — every beat carries audience, assets, approvals, tests, and measurement, then export a campaign brief.',
            proofPoints: [
                'Open source, MIT licensed',
                '@storyboard-os/marketing-domain publishes the campaign contract',
                'Demo board is a real rpg-storyboard launch, not lorem ipsum',
                'Handoff is Markdown plus schema-validated JSON',
            ],
            objectionsHandled: [
                '"We already use Miro" → Miro is a blank canvas. This board has campaign vocabulary and a launch-readiness rollup.',
                '"Is this a CRM?" → No. It is the implementation contract you hand to the people who build assets, pages, and measurement.',
                '"We just need a landing page" → A landing page without approvals, assets, and a closed measurement loop is how launches slip.',
            ],
            customerStateBefore: ['Unaware, or assuming this is another kanban'],
            customerStateAfter: ['Repeats the claim in their own words and opens the demo board'],
            launchDependencies: [
                'Claim passes a "so what?" test with three campaign managers',
                'Demo board is reachable from the README in one click',
            ],
            testCriteria: [
                'Claim is provable by opening campaign-01',
                'Three people outside the team can repeat the differentiation',
            ],
            implementationChecklist: [
                'Write three headline variations',
                'Test the claim in two GTM communities',
                'Lock the README thesis to the winning line',
            ],
        }, { x: 380, y: 200 }),

        makeFrame(idPrefix, 'touchpoint-landing', 'touchpoint', 'Landing Page', 'GitHub README plus Pages app — primary conversion surface for the launch.', {
            objective: 'Convert GitHub and landing visitors into people who open the demo campaign board',
            audienceSegment: PRODUCT_LAUNCH_SEGMENT,
            channel: 'GitHub README + GitHub Pages marketing-storyboard app',
            requiredAssets: [
                'README thesis and four-command quick start',
                'Live demo campaign board (campaign-01)',
                'OG image',
                'Handbook page on campaign implementation',
            ],
            customerStateBefore: ['Arrived from search, a community post, or the org landing page'],
            customerStateAfter: ['Understands the claim, opens /campaigns/campaign-01, clones the repo'],
            proofPoints: [
                'Quick start runs from a fresh clone',
                'Demo board loads with eight implementable beats',
            ],
            launchDependencies: [
                'GitHub Pages deploy is green',
                'README answers "what is this?" in ten seconds',
            ],
            metrics: ['Landing visits', 'Demo-board opens', 'Clones from the README'],
            testCriteria: [
                'README answers "what is this?" in ten seconds',
                'CTA to the demo board is above the fold',
                'Pages app loads in under two seconds',
            ],
            implementationChecklist: [
                'Write the README thesis',
                'Link the demo board from the first screen',
                'Deploy Pages and verify the OG image',
                'Walk the quick start from a fresh clone',
            ],
        }, { x: 680, y: 200 }),

        makeFrame(idPrefix, 'announcement', 'launch_event', 'Launch Announcement', 'Coordinated 48-hour public release across GitHub, HN, and GTM communities.', {
            objective: 'Generate qualified awareness in the first 48 hours of the marketing-storyboard launch',
            audienceSegment: PRODUCT_LAUNCH_SEGMENT,
            channel: 'GitHub Release notes, Hacker News Show HN, r/marketing, indie-SaaS Slack',
            launchDependencies: [
                'Landing page and demo board live',
                'npm package @storyboard-os/marketing-domain installable',
                'SHIP_GATE.md hard gates checked',
                'Announcement drafts reviewed',
            ],
            requiredAssets: [
                'GitHub Release notes',
                'Show HN post',
                'r/marketing post',
                'Slack/Discord one-paragraph intro',
            ],
            customerStateBefore: ['Unaware, or waiting on "when does the marketing vertical ship?"'],
            customerStateAfter: ['Knows marketing-storyboard is live and has a link to the demo board'],
            proofPoints: [
                'Release tag matches the published npm version',
                'Every announcement link opens the same demo board',
            ],
            testCriteria: [
                'All channels fire inside a two-hour window',
                'No broken links on launch day',
                'Demo board is reachable from every post',
            ],
            implementationChecklist: [
                'Draft Release notes and Show HN',
                'Identify three GTM communities to post in',
                'Schedule the posting window',
                'Staff comments for the first 48 hours',
            ],
        }, { x: 980, y: 200 }),

        makeFrame(idPrefix, 'conversion', 'conversion', 'Primary Conversion', 'Visitor stars the repo and opens the demo campaign board locally or on Pages.', {
            objective: 'Convert launch traffic into people running the marketing board',
            audienceSegment: PRODUCT_LAUNCH_SEGMENT,
            conversionGoal: 'Star the repo AND open /campaigns/campaign-01 (Pages or local pnpm dev)',
            metrics: ['Stars in week 1', 'Clones in week 1', 'npm installs of @storyboard-os/marketing-domain'],
            customerStateBefore: ['Read the announcement or README, still evaluating'],
            customerStateAfter: ['Running the demo board, inspecting a beat, downloading the campaign brief'],
            proofPoints: [
                'Fresh clone → pnpm install → pnpm dev works in under two minutes',
                'Demo board is navigable without an account',
            ],
            launchDependencies: [
                'Quick start is four commands or fewer',
                'Node ≥ 22.13 and pnpm 11 documented',
            ],
            testCriteria: [
                'Fresh clone path works on Node ≥ 22.13 + pnpm 11',
                'Demo board renders and the campaign brief downloads',
            ],
            implementationChecklist: [
                'Pin the quick start to four commands',
                'Test clone on a clean machine',
                'Verify the JSON/Markdown brief download buttons',
            ],
        }, { x: 1280, y: 200 }),

        makeFrame(idPrefix, 'follow-up', 'follow_up', 'Post-Launch Follow-up', 'Respond to issues, capture template requests, keep early adopters.', {
            objective: 'Retain people who opened the demo and turn questions into spec improvements',
            audienceSegment: PRODUCT_LAUNCH_SEGMENT,
            channel: 'GitHub Issues + launch-thread replies',
            customerStateBefore: ['Tried the demo, has a question or a "we would use this if…"'],
            customerStateAfter: ['Got a first response within 48 hours and knows how to file a campaign-template request'],
            requiredAssets: [
                'Issue templates (bug, campaign-template request)',
                'Reply snippets for "is this a CRM?" and "where is the schema?"',
            ],
            proofPoints: [
                'Every launch-week issue gets a first response within 48 hours',
                'Template requests are labeled and visible on the board',
            ],
            launchDependencies: [
                'Issue templates published before announcement',
                'Notification routing for mcp-tool-shop-org/storyboard-os is live',
            ],
            testCriteria: [
                'Issue templates render on "New issue"',
                'Launch-thread questions answered within 24 hours',
            ],
            implementationChecklist: [
                'Publish bug and template-request issue templates',
                'Monitor GitHub notifications for 14 days',
                'Log recurring questions into the handbook',
            ],
        }, { x: 1580, y: 200 }),

        makeFrame(idPrefix, 'measurement', 'measurement', 'Launch Measurement', 'Week-1 and week-4 readout: stars, clones, installs, issues, next campaign.', {
            objective: 'Prove whether the marketing-storyboard launch created qualified use, then feed the next campaign',
            audienceSegment: PRODUCT_LAUNCH_SEGMENT,
            metrics: [
                'GitHub stars (day 7, day 28)',
                'Clones (day 7, day 28)',
                'npm installs of @storyboard-os/marketing-domain',
                'Issues opened (engagement signal)',
                'Demo-board sessions on Pages',
            ],
            customerStateBefore: ['Launch activity data accumulating with no readout'],
            customerStateAfter: ['Week-1 readout documented; week-4 decides the next campaign (funnel or content path)'],
            proofPoints: [
                'GitHub Insights and npm download counts are the source of truth',
                'Readout names one keep / one cut / one next campaign',
            ],
            launchDependencies: [
                'Traffic insights enabled on the repo',
                'npm download series is queryable',
            ],
            testCriteria: [
                'All listed metrics are measurable without a spreadsheet hunt',
                'Week-1 readout happens within seven days of announcement',
            ],
            implementationChecklist: [
                'Snapshot GitHub Insights on day 0 / day 7 / day 28',
                'Track npm downloads for @storyboard-os/marketing-domain',
                'Write the week-1 readout in the repo Discussions',
                'Pick the next campaign from the funnel or content-to-conversion template',
            ],
        }, { x: 1880, y: 200 }),
    ];
}

// ─── Campaign Funnel ──────────────────────────────────────────────────────────

const FUNNEL_SEGMENT =
    'Developers and GTM engineers who already found Storyboard OS on GitHub or npm and are deciding whether to install @storyboard-os/marketing-domain';

function campaignFunnelFrames(idPrefix: string): StoryboardFrame[] {
    return [
        makeFrame(idPrefix, 'audience', 'audience', 'Target Segment', 'GitHub and npm visitors evaluating a campaign-implementation package.', {
            objective: 'Qualify who enters the marketing-domain install funnel',
            audienceSegment: FUNNEL_SEGMENT,
            customerStateBefore: [
                'Cold or weakly aware — searched "campaign storyboard" or landed from the org README',
                'No prior install of @storyboard-os/marketing-domain',
            ],
            customerStateAfter: ['Aware the package exists and that it is an implementation contract, not a scheduler'],
            proofPoints: [
                'npm page lists the nine frame types',
                'GitHub README links the live marketing-storyboard demo',
            ],
            launchDependencies: [
                'npm package page is public',
                'GitHub topic tags include marketing and storyboard',
            ],
            testCriteria: [
                'Segment is reachable via GitHub search, npm search, and r/javascript',
                'Intent signal is "visited README or npm page in the last 7 days"',
            ],
            implementationChecklist: [
                'Tag the repo with marketing, storyboard, campaign',
                'Confirm npm page description matches the README thesis',
                'Estimate weekly GitHub unique visitors from Insights',
            ],
        }, { x: 80, y: 200 }),

        makeFrame(idPrefix, 'awareness', 'touchpoint', 'Awareness Touchpoint', 'First contact: GitHub search snippet, npm page, or a community post.', {
            objective: 'Earn the first click from search or a community thread onto the README or npm page',
            audienceSegment: FUNNEL_SEGMENT,
            channel: 'GitHub search + npm search + r/javascript and r/marketing posts',
            messageClaim: 'Stop briefing launches in slides — install a campaign board that already knows audience, assets, approvals, and measurement.',
            requiredAssets: [
                'GitHub description ≤ 350 characters',
                'npm package description and keywords',
                'One community post with a demo-board GIF',
            ],
            customerStateBefore: ['Unaware of @storyboard-os/marketing-domain'],
            customerStateAfter: ['Clicked through to the README or npm page'],
            metrics: ['GitHub unique visitors', 'npm page views', 'community post CTR'],
            proofPoints: [
                'Search snippet includes "campaign implementation"',
                'Demo GIF shows a beat inspector, not an empty canvas',
            ],
            launchDependencies: [
                'Repo description and npm keywords published',
                'Community post drafted and linked to campaign-01',
            ],
            testCriteria: [
                'GitHub search for "campaign storyboard" surfaces the repo on page one',
                'npm page loads and the install command is copyable',
            ],
            implementationChecklist: [
                'Set repo description and topics',
                'Refresh npm readme on publish',
                'Post one demo GIF in r/javascript or an indie-SaaS Slack',
            ],
        }, { x: 380, y: 200 }),

        makeFrame(idPrefix, 'proof', 'asset', 'Proof Asset', 'Live demo board plus test count — proof without a signup wall.', {
            objective: 'Move the visitor from "interesting README" to "this is a real contract I can install"',
            audienceSegment: FUNNEL_SEGMENT,
            requiredAssets: [
                'Live demo board at /campaigns/campaign-01',
                'Campaign brief JSON + Markdown download',
                'CI badge and test count on the README',
            ],
            customerStateBefore: ['Interested but assuming this is a mockup'],
            customerStateAfter: ['Convinced the domain model is real — ready to install'],
            proofPoints: [
                'Demo board is a shipped rpg-storyboard launch, not placeholders',
                'CI badge is green on master',
                'Handoff JSON validates against the published schema',
            ],
            launchDependencies: [
                'Pages demo is deployed',
                'Schema is exported from the package as ./schema/campaign-handoff.json',
            ],
            testCriteria: [
                'Proof assets are reachable with no account',
                'Demo board plus brief download complete in under three seconds on a clean session',
            ],
            implementationChecklist: [
                'Pin the demo URL in the README',
                'Expose the schema export on the npm page',
                'Record a 20-second inspector walkthrough GIF',
            ],
        }, { x: 680, y: 200 }),

        makeFrame(idPrefix, 'conversion-page', 'conversion', 'Conversion Page', 'npm install is the conversion — README and npm page share the same command.', {
            objective: 'Convert qualified visitors into an install of @storyboard-os/marketing-domain',
            audienceSegment: FUNNEL_SEGMENT,
            conversionGoal: 'pnpm add @storyboard-os/marketing-domain succeeds and import { createCampaignFromTemplate } resolves',
            channel: 'README install block + npm package page',
            metrics: ['npm installs per week', 'README copy-clicks on the install command', 'import errors filed as issues'],
            customerStateBefore: ['Convinced of value, comparing install cost'],
            customerStateAfter: ['Package installed; createCampaignFromTemplate imported in their project'],
            proofPoints: [
                'Package is public on npm under @storyboard-os/marketing-domain',
                'Types ship with the tarball',
            ],
            launchDependencies: [
                'npm publish succeeded for the advertised version',
                'README install command matches the package name',
            ],
            testCriteria: [
                'pnpm add @storyboard-os/marketing-domain works on a blank project',
                'TypeScript resolves createCampaignFromTemplate without a path alias',
            ],
            implementationChecklist: [
                'Keep README and npm install commands identical',
                'Add a five-line usage snippet under the install block',
                'Test install from a blank folder before each release',
            ],
        }, { x: 980, y: 200 }),

        makeFrame(idPrefix, 'follow-up', 'follow_up', 'Nurture Sequence', 'Handbook plus issues — activation after install, not a drip CRM.', {
            objective: 'Move installers from "package in node_modules" to "first campaign board generated"',
            audienceSegment: FUNNEL_SEGMENT,
            channel: 'Handbook getting-started + GitHub Issues',
            customerStateBefore: ['Installed, has not called createCampaignFromTemplate yet'],
            customerStateAfter: ['Generated a product_launch board and opened it in marketing-storyboard'],
            requiredAssets: [
                'Handbook getting-started for marketing-storyboard',
                'Usage snippet: createCampaignFromTemplate("product_launch", { id, title })',
                'Issue template for "install succeeded, board did not"',
            ],
            proofPoints: [
                'Handbook opens from the README in one click',
                'Usage snippet compiles against the published types',
            ],
            launchDependencies: [
                'Handbook marketing page is deployed',
                'Issue template is live before the funnel announcement',
            ],
            testCriteria: [
                'A new installer can generate a template board from the snippet in under ten minutes',
                'Failed-install issues have a template, not a blank form',
            ],
            implementationChecklist: [
                'Link handbook getting-started from the README',
                'Keep the usage snippet in lockstep with the public API',
                'Triage install issues within 48 hours',
            ],
        }, { x: 1280, y: 200 }),

        makeFrame(idPrefix, 'measurement', 'measurement', 'Funnel Measurement', 'Installs, drop-off from README to npm, activation after install.', {
            objective: 'Quantify README → npm page → install → first template board, then cut the leakiest stage',
            audienceSegment: FUNNEL_SEGMENT,
            metrics: [
                'GitHub unique visitors',
                'npm page views',
                'npm installs per week',
                'Issues tagged install or getting-started',
                'Template-board generations reported in discussions',
            ],
            customerStateBefore: ['Stage counts exist in three different dashboards'],
            customerStateAfter: ['One weekly readout names the leakiest stage and the next experiment'],
            proofPoints: [
                'GitHub Insights + npm downloads are enough — no ad pixel required',
                'Week-over-week install delta is the north-star for this funnel',
            ],
            launchDependencies: [
                'GitHub Insights enabled',
                'npm download series exported weekly',
            ],
            testCriteria: [
                'Attribution from first GitHub visit to npm install is reconstructable from public stats',
                'Weekly readout exists as a Discussion post',
            ],
            implementationChecklist: [
                'Snapshot Insights and npm downloads every Monday',
                'Compute README-visit to install ratio',
                'Pick one stage to improve the following week',
            ],
        }, { x: 1580, y: 200 }),
    ];
}

// ─── Content-to-Conversion Sequence ──────────────────────────────────────────

const CONTENT_SEGMENT =
    'Campaign managers who treat a handbook article as research, then need a path from that article to a running campaign board';

function contentToConversionFrames(idPrefix: string): StoryboardFrame[] {
    return [
        makeFrame(idPrefix, 'idea', 'message', 'Content Idea', 'Insight: a campaign board is an implementation contract, not a publishing list.', {
            objective: 'Lock an insight that converts readers into people who open the demo campaign board',
            audienceSegment: CONTENT_SEGMENT,
            messageClaim: 'A campaign board is an implementation contract — every beat names audience, assets, approvals, tests, and measurement — not a list of posts to ship.',
            customerStateBefore: [
                'Has a launch to ship and a document that lists posts',
                'Does not yet see the gap between a publishing list and an implementation spec',
            ],
            customerStateAfter: [
                'Can explain why an implementation board is the missing artifact',
                'Knows Storyboard OS marketing-storyboard is the worked example',
            ],
            proofPoints: [
                'Demo campaign-01 is a real launch with assets, approvals, and a closed measurement loop',
                'The domain refuses planner-drift terms in frame content',
            ],
            objectionsHandled: [
                '"We already write briefs" → A brief that cannot answer "can this campaign ship?" is not an implementation contract.',
                '"This is just documentation" → The board generates a schema-validated handoff the builders can run.',
            ],
            launchDependencies: [
                'Insight is distinct from the README thesis (deeper, not a restatement)',
                'Demo board is live to cite as the worked example',
            ],
            testCriteria: [
                'The insight maps onto a conversion (open the demo board), not vanity reach',
                'Three campaign managers agree the gap is real',
            ],
            implementationChecklist: [
                'Outline the article around the gap: publishing list vs implementation contract',
                'Collect three failure stories from launch post-mortems',
                'Name the demo board as the worked example in the outline',
            ],
        }, { x: 80, y: 200 }),

        makeFrame(idPrefix, 'content-asset', 'asset', 'Content Asset', 'Handbook essay with a CTA to the live demo campaign board.', {
            objective: 'Ship a complete handbook essay a campaign manager can act on in one sitting',
            audienceSegment: CONTENT_SEGMENT,
            requiredAssets: [
                'Handbook article "Campaign implementation vs a publishing list"',
                'Annotated screenshot of campaign-01 with the launch-readiness badge visible',
                'Inline CTA: Open the demo campaign board',
            ],
            customerStateBefore: ['Searching for how to brief a launch without another slide deck'],
            customerStateAfter: ['Finished the essay and trusts the source enough to click the demo CTA'],
            proofPoints: [
                'Article cites the live board, not a mock',
                'CTA is in the body and at the end, both pointing at /campaigns/campaign-01',
            ],
            launchDependencies: [
                'Handbook build includes the new article',
                'Screenshot is current with the READY/AT RISK badge',
            ],
            testCriteria: [
                'Article delivers the headline promise in the first screen',
                'CTA is visible without scrolling past the fold on desktop',
            ],
            implementationChecklist: [
                'Draft the essay in docs/handbook',
                'Capture the campaign-01 screenshot',
                'Place the CTA after the worked-example section and at the end',
                'Ship with the handbook build',
            ],
        }, { x: 380, y: 200 }),

        makeFrame(idPrefix, 'distribution', 'touchpoint', 'Distribution Touchpoint', 'README link, r/marketing post, and indie-SaaS newsletter mention.', {
            objective: 'Put the essay in front of campaign managers who already read launch post-mortems',
            audienceSegment: CONTENT_SEGMENT,
            channel: 'Handbook URL linked from README + r/marketing post + one indie-SaaS newsletter',
            requiredAssets: [
                'Canonical handbook URL',
                'r/marketing post (problem → insight → demo link)',
                'Two-sentence newsletter blurb',
            ],
            customerStateBefore: ['In a feed or README, not yet reading the essay'],
            customerStateAfter: ['Clicked through and is reading the article'],
            metrics: ['Handbook page views', 'r/marketing CTR', 'README outbound clicks to the article'],
            proofPoints: [
                'README "Handbook" link lands on the essay, not a generic index',
                'Community post includes the demo-board URL as the worked example',
            ],
            launchDependencies: [
                'Handbook article is live',
                'README handbook link updated',
            ],
            testCriteria: [
                'Handbook URL returns 200',
                'Every distribution link opens the same article',
                'UTM or referrer is enough to tell README vs r/marketing apart',
            ],
            implementationChecklist: [
                'Add the article to the README handbook list',
                'Publish the r/marketing post within 24 hours of the article',
                'Send the newsletter blurb the same week',
            ],
        }, { x: 680, y: 200 }),

        makeFrame(idPrefix, 'cta', 'conversion', 'Call to Action', 'Reader opens /campaigns/campaign-01 from the essay.', {
            objective: 'Convert essay readers into people inspecting a live campaign board',
            audienceSegment: CONTENT_SEGMENT,
            conversionGoal: 'Click "Open the demo campaign board" and land on /campaigns/campaign-01',
            customerStateBefore: ['Finished (or skimmed) the essay, trusts the argument'],
            customerStateAfter: ['Demo board is open; reader is inspecting a beat in the inspector'],
            metrics: ['CTA click rate from the handbook page', 'Demo-board sessions with handbook referrer'],
            proofPoints: [
                'CTA copy names the destination ("demo campaign board"), not a generic "learn more"',
                'Landing route is the published campaign-01 board',
            ],
            launchDependencies: [
                'campaign-01 is in the SSG catalog',
                'CTA href is a root-relative /campaigns/campaign-01',
            ],
            testCriteria: [
                'CTA is visible in the article body',
                'Click lands on the demo board, not a 404',
            ],
            implementationChecklist: [
                'Write CTA copy: "Open the demo campaign board →"',
                'Link both in-body and end-of-article CTAs',
                'Click-test from the production handbook URL',
            ],
        }, { x: 980, y: 200 }),

        makeFrame(idPrefix, 'follow-up', 'follow_up', 'Follow-up', 'After the demo, offer the product_launch template as the next board.', {
            objective: 'Turn a demo-board session into a generated product_launch campaign',
            audienceSegment: CONTENT_SEGMENT,
            channel: 'Demo-board footer + handbook "next step" paragraph',
            customerStateBefore: ['Just opened campaign-01 from the essay'],
            customerStateAfter: ['Opened template-product_launch or generated that template in their own app'],
            requiredAssets: [
                'In-board link to template-product_launch',
                'Handbook closing paragraph pointing at createCampaignFromTemplate("product_launch")',
            ],
            proofPoints: [
                'template-product_launch is on the default SSG catalog',
                'Snippet compiles against the published domain package',
            ],
            launchDependencies: [
                'listPublishedCampaigns includes template-product_launch',
                'Handbook closing paragraph is in the same article',
            ],
            testCriteria: [
                'Follow-up link is reachable from the demo board within one click',
                'Snippet in the article matches the public API',
            ],
            implementationChecklist: [
                'Link the product_launch template from the article close',
                'Link it from the marketing-storyboard landing catalog',
                'Verify the snippet against the current export list',
            ],
        }, { x: 1280, y: 200 }),

        makeFrame(idPrefix, 'measurement', 'measurement', 'Content ROI Measurement', 'Article views → demo-board opens → template-board opens.', {
            objective: 'Prove the essay created demo-board sessions, then decide the next article',
            audienceSegment: CONTENT_SEGMENT,
            metrics: [
                'Handbook article page views',
                'CTA clicks to /campaigns/campaign-01',
                'Demo-board sessions with handbook referrer',
                'Visits to /campaigns/template-product_launch',
            ],
            customerStateBefore: ['Article is live; conversion path is not yet counted'],
            customerStateAfter: ['Monthly readout shows views → demo → template, and names the next essay'],
            proofPoints: [
                'Pages analytics plus GitHub referrers reconstruct the path',
                'A drop between views and CTA clicks is an article problem, not a product problem',
            ],
            launchDependencies: [
                'Handbook host exposes pageview counts',
                'Demo board is a stable SSG route',
            ],
            testCriteria: [
                'Can attribute a demo-board session back to the article',
                'Monthly readout fits on one page and names one next action',
            ],
            implementationChecklist: [
                'Enable pageviews on the handbook article',
                'Count CTA clicks weekly for the first month',
                'Write the month-1 readout in Discussions',
            ],
        }, { x: 1580, y: 200 }),
    ];
}

// ─── Template definitions ─────────────────────────────────────────────────────

function buildTemplate(
    id: MarketingTemplateId,
    name: string,
    description: string,
    bestFor: string,
    frameBuilder: (prefix: string) => StoryboardFrame[],
): StoryboardTemplateDefinition {
    const frameCount = frameBuilder(`count-${id}`).length;

    return {
        id,
        name,
        description,
        frameCount,
        bestFor,
        createStoryboard(input: CreateStoryboardInput): Storyboard {
            const frames = frameBuilder(input.id);

            // Auto-generate sequence connections between adjacent frames
            const connections = frames.slice(0, -1).map((frame, i) => ({
                id: `${input.id}-conn-${i}`,
                fromFrameId: frame.id,
                toFrameId: frames[i + 1].id,
                type: 'sequence' as const,
            }));

            // Close the measurement loop: terminal readout feeds back into
            // follow-up (or message) so getCampaignLaunchReadiness can reach
            // 'ready' on an otherwise spec-complete board (F-5d3af7e7).
            const measurement = frames.find(f => f.type === 'measurement');
            const feedbackTarget =
                [...frames].reverse().find(f => f.type === 'follow_up')
                ?? frames.find(f => f.type === 'message');
            if (measurement && feedbackTarget && feedbackTarget.id !== measurement.id) {
                connections.push({
                    id: `${input.id}-conn-feedback`,
                    fromFrameId: measurement.id,
                    toFrameId: feedbackTarget.id,
                    type: 'sequence' as const,
                });
            }

            return {
                id: input.id,
                title: input.title,
                description: input.description ?? description,
                templateId: id,
                schemaVersion: BOARD_SCHEMA_VERSION,
                frames,
                connections,
            };
        },
    };
}

export const MARKETING_TEMPLATES: StoryboardTemplateDefinition[] = [
    buildTemplate(
        'product_launch',
        'Product Launch Flow',
        'Audience → Message → Landing Page → Announcement → Conversion → Follow-up → Measurement.',
        'Releasing a product, feature, repo, tool, or package.',
        productLaunchFrames,
    ),
    buildTemplate(
        'campaign_funnel',
        'Campaign Funnel',
        'Audience → Awareness Touchpoint → Proof Asset → Conversion Page → Follow-up → Measurement.',
        'Acquisition, waitlists, sales funnels, creator products.',
        campaignFunnelFrames,
    ),
    buildTemplate(
        'content_to_conversion',
        'Content-to-Conversion Sequence',
        'Idea → Content Asset → Distribution Touchpoint → CTA → Follow-up → Measurement.',
        'Turning content into action, not just publishing.',
        contentToConversionFrames,
    ),
];

export function getMarketingTemplate(id: MarketingTemplateId): StoryboardTemplateDefinition | undefined {
    return MARKETING_TEMPLATES.find(t => t.id === id);
}

export function createCampaignFromTemplate(
    templateId: MarketingTemplateId,
    input: CreateStoryboardInput,
): Storyboard {
    const template = getMarketingTemplate(templateId);
    if (!template) {
        throw new Error(`Unknown marketing template: ${templateId}`);
    }

    return template.createStoryboard(input);
}

/** Stable SSG ids for the three gold templates (demo keeps campaign-01). */
export const PUBLISHED_TEMPLATE_CAMPAIGN_IDS: Record<MarketingTemplateId, string> = {
    product_launch: 'template-product_launch',
    campaign_funnel: 'template-campaign_funnel',
    content_to_conversion: 'template-content_to_conversion',
};

/**
 * SSG catalog: demo campaign plus one board per template.
 * Landing, 404, and both getStaticPaths consume this list. Not a persist layer.
 */
export function listPublishedCampaigns(): Storyboard[] {
    const templates = MARKETING_TEMPLATES.map(template =>
        createCampaignFromTemplate(template.id, {
            id: PUBLISHED_TEMPLATE_CAMPAIGN_IDS[template.id],
            title: template.name,
            description: template.description,
        }),
    );
    return [launchRpgStoryboardCampaign, ...templates];
}
