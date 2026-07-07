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

export {
    MARKETING_TEMPLATES,
    getMarketingTemplate,
    createCampaignFromTemplate,
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
    HANDOFF_FORMAT_VERSION,
} from './handoff';

export type {
    HandoffBranch,
    CampaignHandoffBeat,
    CampaignHandoffReadiness,
    CampaignHandoff,
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
} from './launchReadiness';

export type {
    LaunchReadinessLevel,
    LaunchReadinessSummary,
    ApprovalGateSignal,
    MeasurementLoopSignal,
} from './launchReadiness';
