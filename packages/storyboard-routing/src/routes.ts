// ─── storyboard-routing / routes.ts ──────────────────────────────────────────
//
// Configurable URL helpers for storyboard apps.
// Pure string → string — no framework deps, no domain imports.
//
// Usage:
//   import { createStoryboardRoutes } from '@storyboard-os/routing';
//   export const routes = createStoryboardRoutes({ storyboardBasePath: '/storyboards' });
//   routes.boardRoute('quest-01')             → '/storyboards/quest-01'
//   routes.frameRoute('quest-01', 'hook-1')   → '/storyboards/quest-01/frames/hook-1'
//   routes.projectRoute('tollhouse-ledger')   → '/projects/tollhouse-ledger'
//
// ─────────────────────────────────────────────────────────────────────────────

export interface StoryboardRouteConfig {
  /** Base path for storyboard and frame URLs, e.g. '/storyboards'. */
  storyboardBasePath: string;
}

export interface StoryboardRoutes {
  boardRoute(storyboardId: string): string;
  frameRoute(storyboardId: string, frameId: string): string;
  projectRoute(projectId: string): string;
}

export function createStoryboardRoutes(
  config: StoryboardRouteConfig,
): StoryboardRoutes {
  const base = config.storyboardBasePath.replace(/\/$/, '');

  return {
    boardRoute(storyboardId: string): string {
      return `${base}/${encodeURIComponent(storyboardId)}`;
    },

    frameRoute(storyboardId: string, frameId: string): string {
      return `${base}/${encodeURIComponent(storyboardId)}/frames/${encodeURIComponent(frameId)}`;
    },

    projectRoute(projectId: string): string {
      return `/projects/${encodeURIComponent(projectId)}`;
    },
  };
}
