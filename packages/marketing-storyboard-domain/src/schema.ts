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
    StoryboardConnection as CoreConnection,
} from '@storyboard-os/core';

// ─── Marketing Connection Types ───────────────────────────────────────────────

export type MarketingConnectionType =
    | 'sequence'
    | 'choice'
    | 'dependency'
    | 'approval'
    | 'consequence'
    | 'optional';

export type StoryboardConnection = CoreConnection<MarketingConnectionType>;

// Re-export generic types the app uses directly (no specialization needed).
export type {
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

// ─── Outcome event ids (author-committed; adapters never invent these) ────────

/** Conversion the beat drives toward. Display string `conversionGoal` stays for humans. */
export interface MarketingConversionEvent {
    id: string;
    name: string;
}

/**
 * Measurement the beat observes. `source` is where the count is read
 * (github, npm, pages, …) — not a GA property and not an auto-wired account.
 */
export interface MarketingMeasurementEvent {
    id: string;
    name: string;
    source: string;
}

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

    // Outcomes — display strings plus optional author-committed ids (F-684f138c)
    conversionGoal?: string;
    conversionEvent?: MarketingConversionEvent;
    metrics?: string[];
    measurementEvents?: MarketingMeasurementEvent[];

    // Implementation
    testCriteria?: string[];
    implementationChecklist?: string[];
    ownerNotes?: string;
}

// ─── Specialized types ────────────────────────────────────────────────────────

export type FrameAnnotation = CoreAnnotation<MarketingAnnotationType>;
export type StoryboardFrame = CoreFrame<MarketingFrameType, MarketingFrameContent, MarketingAnnotationType>;

/**
 * Board schema discriminator for future load/migration paths.
 * Stamped on demo + template boards. Not a project/persist model.
 */
export const BOARD_SCHEMA_VERSION = 1;

export type Storyboard = CoreStoryboard<StoryboardFrame, StoryboardConnection> & {
    /** Optional board-format version; stamped by createCampaignFromTemplate / demo. */
    schemaVersion?: number;
};
export type StoryboardProject = CoreProject<Storyboard>;
export type StoryboardTemplateDefinition = CoreTemplateDefinition<MarketingTemplateId, Storyboard>;
