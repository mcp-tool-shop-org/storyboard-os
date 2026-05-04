import type { SiteConfig } from '@mcptoolshop/site-theme';

export const config: SiteConfig = {
  title: 'Storyboard OS',
  description: 'Visual story-structure authoring platform for interactive narrative. Design implementable beats with game-state signals, handoff export, and a clean multi-vertical architecture.',
  logoBadge: 'SO',
  brandName: 'Storyboard OS',
  repoUrl: 'https://github.com/mcp-tool-shop-org/storyboard-os',
  footerText: 'MIT Licensed — built by <a href="https://mcp-tool-shop.github.io/" style="color:var(--color-muted);text-decoration:underline">MCP Tool Shop</a>',

  hero: {
    badge: 'Open source · v1.0.1',
    headline: 'Story structure that ships.',
    headlineAccent: 'Game-state first.',
    description: 'A visual authoring board where every frame is an implementation spec — entry conditions, state changes, required assets, test criteria, and a dev checklist. The handoff is a document a developer can build from, not a document a developer has to interpret.',
    primaryCta: { href: '/storyboard-os/handbook/', label: 'Read the docs' },
    secondaryCta: { href: '#platform', label: 'See the platform' },
    previews: [
      { label: 'Install', code: 'git clone mcp-tool-shop-org/storyboard-os\npnpm install && pnpm dev' },
      { label: 'Verify', code: 'pnpm verify  # 368 tests · 42 pages' },
      { label: 'Packages', code: '@storyboard-os/core\n@storyboard-os/rpg-domain\n@storyboard-os/canvas\n@storyboard-os/routing' },
    ],
  },

  sections: [
    {
      kind: 'features',
      id: 'platform',
      title: 'A platform, not a tool',
      subtitle: 'Four focused packages. Each owns one concern. Nothing leaks across the boundary.',
      features: [
        {
          title: '@storyboard-os/core',
          desc: 'Generic storyboard primitives with no domain vocabulary — frames, connections, projects, templates, and structural validation. The foundation every vertical builds on.',
        },
        {
          title: '@storyboard-os/rpg-domain',
          desc: 'The RPG authoring contract: 7 frame types, 13 spec fields, 3 production templates, canvas signals, a readiness model, and handoff generation. Pure TypeScript — no React, no Konva.',
        },
        {
          title: '@storyboard-os/canvas',
          desc: 'Konva rendering with a ViewportHandle API — zoom, pan, fit, center, drag. Accepts any StoryboardCanvasConfig. Has no knowledge of RPG vocabulary or any domain.',
        },
        {
          title: '@storyboard-os/routing',
          desc: 'URL construction helpers with zero dependencies. One factory, three route builders. Each vertical passes its own base path — the canvas and domain work without modification.',
        },
        {
          title: 'Clean vertical boundary',
          desc: 'A screenplay or tabletop vertical adds its own domain package and canvas config. It never touches rpg-domain. The platform stays unchanged. The isolation is architectural, not a convention.',
        },
        {
          title: '368 tests, no exceptions',
          desc: 'Domain functions tested without DOM or Konva. Viewport math tested in pure Node. Guardrail tests reject tabletop-drift terminology on every template frame at build time.',
        },
      ],
    },
    {
      kind: 'features',
      id: 'features',
      title: 'rpg-storyboard — the first vertical',
      subtitle: 'A complete local authoring workflow. No backend, no accounts, no server — everything in localStorage.',
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
        {
          title: 'Verify before ship',
          code: '# All 368 tests + full build in one command\npnpm verify',
        },
      ],
    },
  ],
};
