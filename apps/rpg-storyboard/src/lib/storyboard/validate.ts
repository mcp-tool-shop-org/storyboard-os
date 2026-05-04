// ─── rpg-storyboard / validate.ts ─────────────────────────────────────────────
//
// Thin re-export. Structural validation from @storyboard-os/core;
// RPG domain validation from @storyboard-os/rpg-domain.
//
// ─────────────────────────────────────────────────────────────────────────────

export { validateStoryboard, validateRpgStoryboard } from '@storyboard-os/rpg-domain';
export type { StoryboardValidationResult, StoryboardValidationError } from '@storyboard-os/rpg-domain';
