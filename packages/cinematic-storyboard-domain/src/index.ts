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

export {
  getCinematicBeatStatus,
  getSequenceReadiness,
} from './beatStatus';
export type { CinematicBeatStatus, CinematicBeatStatusLevel, CinematicReadinessSummary } from './beatStatus';

export { validateCinematicStoryboard, validateStoryboard } from './validate';
export type { StoryboardValidationError, StoryboardValidationResult } from './validate';

export { getCinematicFrameBadges, getCinematicFrameSignal } from './frameSignals';
export type { CinematicFrameBadge, CinematicFrameSignal } from './frameSignals';

export {
  CINEMATIC_TEMPLATES,
  getCinematicTemplate,
  createCinematicStoryboard,
} from './templates';
export type { CinematicTemplateId, CinematicTemplateDefinition } from './templates';

export { generateProductionBrief, generateProductionMarkdown } from './handoff';
export type { ProductionBrief, ProductionBriefShot } from './handoff';

export { getSequenceProductionSignals } from './productionSignals';
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
