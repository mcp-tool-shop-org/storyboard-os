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

// Shared encode path for every id segment. encodeURIComponent leaves `.`
// untouched, so a bare `.` or `..` id would survive verbatim and normalize to
// the current/parent path segment — escaping the configured base. Percent-
// encode the dots for exactly those two ids; everything else (including ids
// that merely contain dots, like `v1.2`) goes through encodeURIComponent.
function encodeSegment(id: string): string {
  if (id === '.') return '%2E';
  if (id === '..') return '%2E%2E';
  return encodeURIComponent(id);
}

export function createStoryboardRoutes(
  config: StoryboardRouteConfig,
): StoryboardRoutes {
  const base = config.storyboardBasePath.replace(/\/$/, '');

  return {
    boardRoute(storyboardId: string): string {
      return `${base}/${encodeSegment(storyboardId)}`;
    },

    frameRoute(storyboardId: string, frameId: string): string {
      return `${base}/${encodeSegment(storyboardId)}/frames/${encodeSegment(frameId)}`;
    },

    projectRoute(projectId: string): string {
      return `/projects/${encodeSegment(projectId)}`;
    },
  };
}
