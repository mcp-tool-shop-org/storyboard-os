// ─── lib/storyboard/project.ts ───────────────────────────────────────────────
//
// Thin re-export. App code imports from this adapter rather than directly from
// @storyboard-os/rpg-domain, keeping internal imports stable as packages evolve.
// ─────────────────────────────────────────────────────────────────────────────

export { createProject, updateFramePosition, updateFrameBasics, updateFrameContent } from '@storyboard-os/rpg-domain';
export type { RpgStoryboardProject, CreateProjectInput, FramePosition, FrameBasicsPatch } from '@storyboard-os/rpg-domain';
