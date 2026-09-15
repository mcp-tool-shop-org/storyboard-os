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
  rpgColors,
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

export {
  generateHandoff,
  generateMarkdown,
  generateProjectHandoff,
  generateProjectMarkdown,
  HANDOFF_FORMAT_VERSION,
} from './handoff';

export type {
  HandoffBranch,
  HandoffAnnotation,
  HandoffBeat,
  HandoffReadinessSummary,
  QuestHandoff,
  ProjectHandoffBeat,
  ProjectHandoff,
} from './handoff';

export {
  QUEST_HANDOFF_SCHEMA_ID,
  PROJECT_HANDOFF_SCHEMA_ID,
  validateHandoff,
  validateProjectHandoff,
  assertValidHandoff,
  assertValidProjectHandoff,
  serializeHandoffJson,
  serializeProjectHandoffJson,
  HandoffEnvelopeError,
  questHandoffSchemaDocument,
  projectHandoffSchemaDocument,
} from './handoffValidate';

export type {
  HandoffIssueSeverity,
  HandoffValidationIssue,
  HandoffValidationResult,
} from './handoffValidate';

export {
  createProject,
  updateFramePosition,
  updateFrameBasics,
  updateFrameContent,
  updateFrameAnnotations,
  setChecklistItemComplete,
  setTestCriterionComplete,
  getFrameProgress,
  getProjectProgress,
} from './project';

export type {
  RpgStoryboardProject,
  CreateProjectInput,
  FramePosition,
  FrameBasicsPatch,
  FrameProgress,
  ProjectProgress,
  ProjectProgressSummary,
} from './project';
