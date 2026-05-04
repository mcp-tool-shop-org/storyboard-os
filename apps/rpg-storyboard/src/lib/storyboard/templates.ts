// ─── rpg-storyboard / templates.ts ───────────────────────────────────────────
//
// Thin re-export. All template logic lives in @storyboard-os/rpg-domain.
// App code imports from this file as before — no downstream changes needed.
//
// ─────────────────────────────────────────────────────────────────────────────

export {
  STORYBOARD_TEMPLATES,
  getStoryboardTemplate,
  createStoryboardFromTemplate,
} from '@storyboard-os/rpg-domain';

export type {
  CreateStoryboardInput,
  StoryboardTemplateDefinition,
} from '@storyboard-os/rpg-domain';
