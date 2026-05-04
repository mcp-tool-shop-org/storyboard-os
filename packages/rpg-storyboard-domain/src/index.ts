// ─── @storyboard-os/rpg-domain ────────────────────────────────────────────────
//
// RPG game-authoring domain contract.
// Re-exports everything the rpg-storyboard app and its tests need.
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
  // Generic pass-throughs from @storyboard-os/core
  StoryboardConnectionType,
  StoryboardConnection,
  CreateStoryboardInput,
} from './schema';

export {
  STORYBOARD_TEMPLATES,
  getStoryboardTemplate,
  createStoryboardFromTemplate,
} from './templates';

export {
  validateStoryboard,
  validateRpgStoryboard,
} from './validate';

export type {
  StoryboardValidationError,
  StoryboardValidationResult,
} from './validate';

export { tollhouseLedgerProject } from './demo-project';

export {
  getFrameSignal,
  getFrameBadges,
  getChoiceBranchCount,
} from './frameSignals';

export type {
  FrameReadiness,
  FrameSignal,
  FrameBadgeDescriptor,
} from './frameSignals';

export {
  getBeatStatus,
  getStoryboardReadiness,
  BLOCKING_REASONS,
} from './beatStatus';

export type {
  BeatStatusLevel,
  MissingSpecReason,
  BeatStatus,
  StoryboardReadinessSummary,
} from './beatStatus';
