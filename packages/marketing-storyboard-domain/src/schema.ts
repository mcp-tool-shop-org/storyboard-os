// ─── marketing-storyboard-domain / schema.ts ─────────────────────────────────
//
// Marketing campaign authoring domain types. Specializes the generic primitives
// from @storyboard-os/core with marketing-specific frame types, content fields,
// and annotation vocabulary.
//
// App code imports from '@storyboard-os/marketing-domain', not from here directly.
//
// ─────────────────────────────────────────────────────────────────────────────

import type {
    FrameAnnotation as CoreAnnotation,
    StoryboardFrame as CoreFrame,
    Storyboard as CoreStoryboard,
    StoryboardProject as CoreProject,
    StoryboardTemplateDefinition as CoreTemplateDefinition,
} from '@storyboard-os/core';

// Re-export generic types the app uses directly (no specialization needed).
export type {
    StoryboardConnectionType,
    StoryboardConnection,
    CreateStoryboardInput,
} from '@storyboard-os/core';

// ─── Marketing Frame Types ────────────────────────────────────────────────────

export type MarketingFrameType =
    | 'audience'
    | 'message'
    | 'touchpoint'
    | 'asset'
    | 'approval'
    | 'launch_event'
    | 'conversion'
    | 'follow_up'
    | 'measurement';

// ─── Marketing Annotation Types ───────────────────────────────────────────────

export type MarketingAnnotationType =
    | 'owner_note'
    | 'stakeholder_note'
    | 'brand_guideline'
    | 'legal_constraint'
    | 'timing'
    | 'budget_note';

// ─── Marketing Template IDs ──────────────────────────────────────────────────

export type MarketingTemplateId =
    | 'product_launch'
    | 'campaign_funnel'
    | 'content_to_conversion';

// ─── Marketing Frame Content ──────────────────────────────────────────────────
// Carries the full implementation depth for each campaign beat.

export interface MarketingFrameContent {
    // Strategy
    objective?: string;
    audienceSegment?: string;
    customerStateBefore?: string[];
    customerStateAfter?: string[];

    // Messaging
    channel?: string;
    messageClaim?: string;
    proofPoints?: string[];
    objectionsHandled?: string[];

    // Production
    requiredAssets?: string[];
    approvalRequirements?: string[];
    launchDependencies?: string[];

    // Outcomes
    conversionGoal?: string;
    metrics?: string[];

    // Implementation
    testCriteria?: string[];
    implementationChecklist?: string[];
    ownerNotes?: string;
}

// ─── Specialized types ────────────────────────────────────────────────────────

export type FrameAnnotation = CoreAnnotation<MarketingAnnotationType>;
export type StoryboardFrame = CoreFrame<MarketingFrameType, MarketingFrameContent, MarketingAnnotationType>;
export type Storyboard = CoreStoryboard<StoryboardFrame>;
export type StoryboardProject = CoreProject<Storyboard>;
export type StoryboardTemplateDefinition = CoreTemplateDefinition<MarketingTemplateId, Storyboard>;
