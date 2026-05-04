// ─── lib/storyboard/project.ts ───────────────────────────────────────────────
//
// Thin re-export. App code imports from this adapter rather than directly from
// @storyboard-os/rpg-domain, keeping internal imports stable as packages evolve.
// ─────────────────────────────────────────────────────────────────────────────

export { createProject, updateFramePosition } from '@storyboard-os/rpg-domain';
export type { RpgStoryboardProject, CreateProjectInput, FramePosition } from '@storyboard-os/rpg-domain';
