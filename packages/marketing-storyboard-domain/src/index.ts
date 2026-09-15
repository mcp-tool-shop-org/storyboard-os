// ─── @storyboard-os/marketing-domain ─────────────────────────────────────────
//
// Marketing campaign authoring domain contract.
// Re-exports everything the marketing-storyboard app and its tests need.
//
// ─────────────────────────────────────────────────────────────────────────────

export type {
    MarketingFrameType,
    MarketingAnnotationType,
    MarketingTemplateId,
    MarketingFrameContent,
    FrameAnnotation,
    StoryboardFrame,
    Storyboard,
    StoryboardProject,
    StoryboardTemplateDefinition,
    MarketingConnectionType,
    StoryboardConnection,
    CreateStoryboardInput,
} from './schema';

export { BOARD_SCHEMA_VERSION } from './schema';

export {
    MARKETING_TEMPLATES,
    getMarketingTemplate,
    createCampaignFromTemplate,
    listPublishedCampaigns,
    PUBLISHED_TEMPLATE_CAMPAIGN_IDS,
} from './templates';

export {
    validateStoryboard,
    validateMarketingStoryboard,
} from './validate';

export type {
    StoryboardValidationError,
    StoryboardValidationResult,
} from './validate';

export { launchRpgStoryboardCampaign } from './demo-campaign';

export {
    getMarketingFrameSignal,
    getMarketingCardLine,
    getMarketingFrameBadges,
    getSegmentPathCount,
    marketingColors,
} from './frameSignals';

export type {
    FrameReadiness,
    MarketingFrameSignal,
    FrameBadgeDescriptor,
} from './frameSignals';

export {
    getCampaignBeatStatus,
    getCampaignReadiness,
    BLOCKING_REASONS,
} from './beatStatus';

export {
    FRAME_TYPE_LABELS,
    CONNECTION_TYPE_LABELS,
    MISSING_REASON_LABELS,
    BEAT_STATUS_LABELS,
    humanizeFrameType,
    humanizeConnectionType,
    humanizeMissingReason,
    humanizeBeatStatus,
} from './labels';

export type {
    CampaignBeatStatusLevel,
    MissingSpecReason,
    CampaignBeatStatus,
    CampaignReadinessSummary,
} from './beatStatus';

export {
    generateCampaignHandoff,
    generateCampaignMarkdown,
    generateProjectCampaignHandoff,
    generateProjectCampaignMarkdown,
    validateCampaignHandoff,
    HANDOFF_FORMAT_VERSION,
    CAMPAIGN_HANDOFF_SCHEMA_ID,
} from './handoff';

export type {
    HandoffBranch,
    CampaignHandoffBeat,
    CampaignHandoffReadiness,
    CampaignHandoffLaunch,
    CampaignHandoff,
    CampaignHandoffValidationError,
    CampaignHandoffValidationResult,
    ProjectCampaignHandoffBeat,
    ProjectCampaignHandoff,
} from './handoff';

export {
    createCampaignProject,
    updateFramePosition,
    updateFrameBasics,
    updateFrameContent,
    setChecklistItemComplete,
    setTestCriterionComplete,
    getFrameProgress,
    getProjectProgress,
} from './project';

export type {
    MarketingStoryboardProject,
    CreateCampaignProjectInput,
    FramePosition,
    FrameBasicsPatch,
    FrameProgress,
    ProjectProgress,
    ProjectProgressSummary,
} from './project';

export {
    getCampaignLaunchReadiness,
    getCampaignCriticalPath,
    getApprovalGateSignals,
    getMeasurementLoopSignals,
    LAUNCH_READINESS_LABELS,
} from './launchReadiness';

export type {
    LaunchReadinessLevel,
    LaunchReadinessSummary,
    ApprovalGateSignal,
    MeasurementLoopSignal,
} from './launchReadiness';
