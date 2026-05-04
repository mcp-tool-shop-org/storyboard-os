import type { SiteConfig } from '@mcptoolshop/site-theme';

export const config: SiteConfig = {
  title: 'Storyboard OS',
  description: 'Visual story-structure authoring platform for interactive narrative. rpg-storyboard is the first vertical: a game-authoring tool for RPG video game quest and scene design.',
  logoBadge: 'SO',
  brandName: 'Storyboard OS',
  repoUrl: 'https://github.com/mcp-tool-shop-org/storyboard-os',
  footerText: 'MIT Licensed — built by <a href="https://mcp-tool-shop.github.io/" style="color:var(--color-muted);text-decoration:underline">MCP Tool Shop</a>',

  hero: {
    badge: 'Open source · v1.0.0',
    headline: 'Visual stories.',
    headlineAccent: 'Structured. Implemented.',
    description: 'A board for designing implementable narrative. Every frame is a beat with entry conditions, state changes, required assets, test criteria, and an implementation checklist. The handoff is a document a developer can build from.',
    primaryCta: { href: '/storyboard-os/handbook', label: 'Read the docs' },
    secondaryCta: { href: '#features', label: 'See features' },
    previews: [
      { label: 'Start', code: 'pnpm install && pnpm dev' },
      { label: 'Verify', code: 'pnpm verify  # test + build' },
      { label: 'Status', code: '368/368 tests · 42 pages · v1.0.0' },
    ],
  },

  sections: [
    {
      kind: 'features',
      id: 'features',
      title: 'What rpg-storyboard does',
      subtitle: 'A durable local authoring workflow — no backend, no accounts, no server.',
      features: [
        {
          title: 'Durable projects',
          desc: 'Create a project from a template. Edit beat specs. Track checklist and test progress. All state persists in localStorage across reload.',
        },
        {
          title: 'Game-state signal',
          desc: 'Every frame on the canvas shows STATE and SPEC/PARTIAL/DRAFT badges. Implementation readiness is visible without opening a single inspector.',
        },
        {
          title: 'Project handoff',
          desc: 'Regenerated from live project state — includes edited content, per-beat progress markers, and template provenance. Download as Markdown or JSON.',
        },
        {
          title: 'Clean domain boundary',
          desc: 'The Konva canvas knows nothing about RPG vocabulary. A second vertical (screenplay, tabletop) adds its own domain package and reuses the platform unchanged.',
        },
        {
          title: '368 tests',
          desc: 'Pure domain functions are tested without DOM or Konva. Canvas viewport math is tested separately. Guardrail tests reject tabletop-drift terminology at build time.',
        },
        {
          title: 'Topological handoff order',
          desc: "Beats in the handoff are ordered using Kahn's algorithm — upstream dependencies before downstream outcomes. Cycles are detected and appended without crashing.",
        },
      ],
    },
    {
      kind: 'code-cards',
      id: 'usage',
      title: 'Quick start',
      cards: [
        {
          title: 'Install and run',
          code: 'git clone https://github.com/mcp-tool-shop-org/storyboard-os\ncd storyboard-os\npnpm install\npnpm dev  # localhost:4321',
        },
        {
          title: 'Verify before ship',
          code: '# Runs all 368 tests + builds 42 pages\npnpm verify',
        },
        {
          title: 'Create a project',
          code: '# Navigate to /projects\n# → New Project → pick a template\n# → name it → board opens\n# → edit beats → track progress → generate handoff',
        },
      ],
    },
  ],
};
