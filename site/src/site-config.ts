import type { SiteConfig } from '@mcptoolshop/site-theme';
// Pull version from root package.json so the hero badge auto-updates on bump.
// Vite resolves JSON imports at build time (resolveJsonModule: true in tsconfig).
import rootPkg from '../../package.json' with { type: 'json' };

export const config: SiteConfig = {
  title: 'Storyboard OS',
  description: 'Visual story-structure authoring platform for interactive narrative. Design implementable beats with game-state signals, handoff export, and a clean multi-vertical architecture.',
  logoBadge: 'SO',
  brandName: 'Storyboard OS',
  repoUrl: 'https://github.com/mcp-tool-shop-org/storyboard-os',
  footerText: 'MIT Licensed — built by <a href="https://mcp-tool-shop.github.io/" style="color:var(--color-muted);text-decoration:underline">MCP Tool Shop</a>',

  hero: {
    badge: `Open source · v${rootPkg.version}`,
    headline: 'Story structure that ships.',
    headlineAccent: 'Three verticals.',
    description: 'A visual authoring platform where every frame is an implementation spec. Three verticals — RPG quest authoring, marketing campaign implementation, and cinematic production storyboarding — share one canvas, zero cross-domain imports.',
    primaryCta: { href: '#platform', label: 'See the platform' },
    secondaryCta: { href: 'handbook/', label: 'Read the Handbook' },
    // AUTOGEN-NOTE: Snapshot values (test count, page count, app count) below are
    // manually updated. To verify, run:
    //   pnpm test            # total tests
    //   pnpm -r build        # builds all apps + counts pages
    //   ls apps/ | wc -l     # app count
    //   ls packages/ | wc -l # package count
    // See docs/snapshot-checklist.md for every doc location that holds these snapshots.
    previews: [
      { label: 'Install', code: 'git clone mcp-tool-shop-org/storyboard-os\npnpm install && pnpm dev' },
      { label: 'Verify', code: 'pnpm verify  # 649 tests · 54 pages · 3 apps' },
      { label: 'Packages', code: '@storyboard-os/core\n@storyboard-os/rpg-domain\n@storyboard-os/marketing-domain\n@storyboard-os/cinematic-domain\n@storyboard-os/canvas\n@storyboard-os/routing' },
    ],
  },

  sections: [
    {
      kind: 'features',
      id: 'platform',
      title: 'A platform, not a tool',
      subtitle: 'Five focused packages. Each owns one concern. Nothing leaks across the boundary.',
      features: [
        {
          title: '@storyboard-os/core',
          desc: 'Generic storyboard primitives with no domain vocabulary — frames, connections (generic over type), projects, templates, and structural validation. Domains own their connection vocabularies.',
        },
        {
          title: '@storyboard-os/rpg-domain',
          desc: 'The RPG authoring contract: 7 frame types, 13 spec fields, 3 production templates, canvas signals, a readiness model, and handoff generation. Pure TypeScript — no React, no Konva.',
        },
        {
          title: '@storyboard-os/marketing-domain',
          desc: 'The campaign-implementation contract: 9 frame types, launch readiness model, critical path analysis, approval gates, measurement loops, and campaign brief export. Answers: can this campaign ship?',
        },
        {
          title: '@storyboard-os/cinematic-domain',
          desc: 'The cinematic production contract: 9 frame types, camera language, VFX/audio/continuity requirements, production signals (health, burden, complexity), and production brief export. Answers: what makes this sequence hard to produce?',
        },
        {
          title: '@storyboard-os/canvas',
          desc: 'Konva rendering with a ViewportHandle API — zoom, pan, fit, center, drag. Accepts any StoryboardCanvasConfig. Has no knowledge of RPG, marketing, or cinematic vocabulary.',
        },
        {
          title: '@storyboard-os/routing',
          desc: 'URL construction helpers with zero dependencies. One factory, three route builders. Each vertical passes its own base path — the canvas and domain work without modification.',
        },
        // AUTOGEN-NOTE: "649 tests" below is a manually updated snapshot.
        // Verify with: pnpm test  (see docs/snapshot-checklist.md)
        {
          title: '649 tests, three verticals, zero cross-domain imports',
          desc: 'The cinematic vertical proved multi-vertical architecture for the third time: zero changes to canvas, core, or routing. Core Hardening 1A extracted generic connection types — domains own their vocabulary without casts.',
        },
      ],
    },
    {
      kind: 'features',
      id: 'features',
      title: 'Three verticals, one platform',
      subtitle: 'rpg-storyboard for quest authoring. marketing-storyboard for campaign implementation. cinematic-storyboard for production storyboarding. All run locally — no backend, no accounts, no server.',
      features: [
        {
          title: 'Game-state signal on the board',
          desc: 'STATE (blue), SPEC (green), PARTIAL (orange), DRAFT (gray), BLOCKED (red) — implementation readiness is visible on every frame without opening an inspector.',
        },
        {
          title: 'Full spec depth per beat',
          desc: 'Entry conditions, exit conditions, state changes, required assets, test criteria, implementation checklist, designer notes, player text, involved characters and factions — all editable inline.',
        },
        {
          title: 'Durable projects',
          desc: 'Create from a template, rearrange the board, edit specs, mark checklist items and test criteria complete. Position and progress persist across reload with no backend.',
        },
        {
          title: 'Topological handoff export',
          desc: "Beats ordered by Kahn's algorithm — upstream dependencies before downstream outcomes, cycle-safe. Download as Markdown for developers or JSON for engines.",
        },
        {
          title: 'Three production templates',
          desc: 'Quest Flow (8 frames), Quest Branch (7 frames, 3 divergent paths), Cutscene Beat (5 frames). Every generated frame ships with full spec depth — not a blank starting point.',
        },
        {
          title: 'Progress without spec mutation',
          desc: 'Checklist and test completion live in project.progress, never in the spec strings. The handoff regenerates from live state — edited content plus current progress, always in sync.',
        },
        {
          title: 'Launch readiness (marketing)',
          desc: 'Critical path to launch, approval gate signals, measurement loop closure. The board shows "BLOCKED / AT RISK / READY" derived from spec completeness — not from human-assigned status.',
        },
        {
          title: 'Campaign brief handoff (marketing)',
          desc: 'Markdown + JSON export scoped to a campaign. Same topological sort, different domain. A campaign coordinator can read what ships, what blocks it, and what measures success.',
        },
        {
          title: 'Production signals (cinematic)',
          desc: 'Continuity risk, VFX/audio burden, camera complexity, duration rollup, and blocked shots. The board shows production health derived from spec completeness — not from human-assigned status.',
        },
        {
          title: 'Production brief handoff (cinematic)',
          desc: 'Per-shot camera language, asset requirements, VFX/audio specs, and readiness status. An editor or animator can receive a sequence they didn\'t design and understand what to build.',
        },
      ],
    },
    {
      kind: 'code-cards',
      id: 'usage',
      title: 'Quick start',
      cards: [
        {
          title: 'Clone and run',
          code: 'git clone https://github.com/mcp-tool-shop-org/storyboard-os\ncd storyboard-os\npnpm install\npnpm dev  # opens at localhost:4321',
        },
        {
          title: 'Use a package',
          code: 'npm install @storyboard-os/rpg-domain\n\n// Generate a quest board\nimport { createStoryboardFromTemplate } from \'@storyboard-os/rpg-domain\';\nconst board = createStoryboardFromTemplate(\'quest_flow\');',
        },
        // AUTOGEN-NOTE: "649 tests", "6 packages", "3 apps", "54 pages" below
        // are manually updated snapshots. Verify with:
        //   pnpm test; pnpm -r build; ls packages/ | wc -l; ls apps/ | wc -l
        // See docs/snapshot-checklist.md for every doc location that holds these.
        {
          title: 'Verify before ship',
          code: '# All 649 tests + full build in one command\npnpm verify  # 6 packages · 3 apps · 54 pages',
        },
      ],
    },
  ],
};
