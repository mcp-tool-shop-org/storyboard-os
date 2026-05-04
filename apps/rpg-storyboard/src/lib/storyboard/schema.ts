// ─── rpg-storyboard / schema.ts ───────────────────────────────────────────────
//
// Thin re-export. All RPG domain types live in @storyboard-os/rpg-domain.
// App code imports from this file as before — no downstream changes needed.
//
// ─────────────────────────────────────────────────────────────────────────────

export type {
  StoryboardFrameType,
  FrameAnnotationType,
  StoryboardTemplateId,
  FrameContent,
  FrameAnnotation,
  StoryboardFrame,
  Storyboard,
  StoryboardProject,
  StoryboardTemplateDefinition,
  StoryboardConnectionType,
  StoryboardConnection,
  CreateStoryboardInput,
} from '@storyboard-os/rpg-domain';
