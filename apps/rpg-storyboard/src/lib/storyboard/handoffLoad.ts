// ─── handoffLoad.ts ──────────────────────────────────────────────────────────
//
// Pure load/generate classifier for the project handoff page. Separates
// "project missing" from "project loaded but handoff generation threw" so the
// UI never tells the user their project vanished when generation failed.
// ─────────────────────────────────────────────────────────────────────────────

import {
  generateProjectHandoff,
  type ProjectHandoff,
  type RpgStoryboardProject,
} from '@storyboard-os/rpg-domain';

export type HandoffLoadResult =
  | { status: 'ok'; handoff: ProjectHandoff; boardHref: string }
  | { status: 'not_found' }
  | { status: 'generate_failed'; message: string; boardHref: string };

/**
 * Resolve a project id into a handoff artifact, or a distinct failure mode.
 * `getProject` is injected so tests can drive missing/found without localStorage.
 */
export function loadProjectHandoff(
  id: string | null | undefined,
  getProject: (id: string) => RpgStoryboardProject | undefined,
  generate: (project: RpgStoryboardProject) => ProjectHandoff = generateProjectHandoff,
): HandoffLoadResult {
  if (!id) return { status: 'not_found' };

  const project = getProject(id);
  if (!project) return { status: 'not_found' };

  const boardHref = `/projects/board?id=${id}`;
  try {
    return { status: 'ok', handoff: generate(project), boardHref };
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return { status: 'generate_failed', message, boardHref };
  }
}
