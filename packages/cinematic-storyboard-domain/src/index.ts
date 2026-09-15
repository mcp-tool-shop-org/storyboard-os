// ─── Cinematic Storyboard Domain — Barrel Export ─────────────────────────────

export type {
  CinematicFrameType,
  CinematicFrameContent,
  CinematicAnnotationType,
  CinematicConnectionType,
  StoryboardFrame,
  Storyboard,
  StoryboardConnection,
} from './schema';
export { BOARD_SCHEMA_VERSION } from './schema';

export {
  getCinematicBeatStatus,
  getSequenceReadiness,
} from './beatStatus';
export type { CinematicBeatStatus, CinematicBeatStatusLevel, CinematicReadinessSummary } from './beatStatus';

export { validateCinematicStoryboard, validateStoryboard } from './validate';
export type { StoryboardValidationError, StoryboardValidationResult } from './validate';

export { getCinematicFrameBadges, getCinematicFrameSignal, cinematicColors } from './frameSignals';
export type { CinematicFrameBadge, CinematicFrameSignal } from './frameSignals';

export {
  CINEMATIC_TEMPLATES,
  getCinematicTemplate,
  createCinematicStoryboard,
} from './templates';
export type { CinematicTemplateId, CinematicTemplateDefinition } from './templates';

export {
  generateProductionBrief,
  generateProductionMarkdown,
  HANDOFF_FORMAT_VERSION,
  parseDurationSeconds,
  humanizeFrameType,
  humanizeStatus,
  humanizeConnectionType,
  humanizeMissingReason,
  getConnectionTypeColor,
  FRAME_TYPE_LABELS,
  STATUS_LABELS,
  CONNECTION_TYPE_LABELS,
  CONNECTION_TYPE_COLORS,
} from './handoff';
export type { ProductionBrief, ProductionBriefShot, ProductionBriefConnection } from './handoff';

export {
  validateProductionBrief,
  serializeProductionBriefJson,
  assertValidProductionBrief,
  InvalidProductionBriefError,
  PRODUCTION_BRIEF_SCHEMA,
  PRODUCTION_BRIEF_SCHEMA_ID,
} from './validateProductionBrief';
export type { ProductionBriefValidationError, ProductionBriefValidationResult } from './validateProductionBrief';

export { cardBeatLine, CARD_BEAT_MAX_CHARS } from './cardBeat';

export {
  getSequenceProductionSignals,
  parseDurationRange,
} from './productionSignals';
export type {
  ProductionSignals,
  ContinuityRisk,
  VfxBurdenSummary,
  AudioBurdenSummary,
  CameraComplexitySummary,
  CameraComplexityShot,
  DurationRollup,
  BlockedShot,
  SequenceHealthLevel,
} from './productionSignals';

export { storyboardOsLaunchTrailer } from './demo-sequence';
