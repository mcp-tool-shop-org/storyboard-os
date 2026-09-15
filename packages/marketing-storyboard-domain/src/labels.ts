// ─── marketing-domain / labels.ts ─────────────────────────────────────────────
//
// Shared human-readable labels for frame types, connection types, missing-spec
// reasons, and beat status. Markdown, HTML handoff, inspector, and launch-blocker
// copy must all read from here so snake_case domain codes never leak (F-5c0c80f1).
//
// ─────────────────────────────────────────────────────────────────────────────

import { statusLabels } from '@storyboard-os/core';
import type { CampaignBeatStatusLevel, MissingSpecReason } from './beatStatus';
import type {
    MarketingAnnotationType,
    MarketingConnectionType,
    MarketingFrameType,
} from './schema';

export const FRAME_TYPE_LABELS: Record<MarketingFrameType, string> = {
    audience: 'Audience',
    message: 'Message',
    touchpoint: 'Touchpoint',
    asset: 'Asset',
    approval: 'Approval',
    launch_event: 'Launch Event',
    conversion: 'Conversion',
    follow_up: 'Follow-Up',
    measurement: 'Measurement',
};

export const CONNECTION_TYPE_LABELS: Record<MarketingConnectionType, string> = {
    sequence: 'campaign flow',
    dependency: 'dependency',
    approval: 'approval gate',
    optional: 'optional',
    choice: 'segment path',
    consequence: 'consequence',
};

export const MISSING_REASON_LABELS: Record<MissingSpecReason, string> = {
    no_conversion_goal: 'Conversion goal not defined',
    no_required_assets: 'Required assets not listed',
    no_approval_requirements: 'Approval requirements not defined',
    no_metrics: 'Metrics not defined',
    no_channel: 'Channel not specified',
    no_message_claim: 'Message claim not written',
    no_objective: 'Objective not defined',
    no_audience_segment: 'Audience segment not specified',
    no_customer_state_before: 'Customer state (before) not defined',
    no_customer_state_after: 'Customer state (after) not defined',
    no_test_criteria: 'Test criteria not defined',
    no_implementation_checklist: 'Implementation checklist missing',
    no_proof_points: 'Proof points not provided',
    no_launch_dependencies: 'Launch dependencies not noted',
};

export const BEAT_STATUS_LABELS: Record<CampaignBeatStatusLevel, string> = {
    ready: statusLabels.ready,
    partial: statusLabels.partial,
    draft: statusLabels.draft,
    blocked: statusLabels.blocked,
};

export const ANNOTATION_TYPE_LABELS: Record<MarketingAnnotationType, string> = {
    owner_note: 'Owner Note',
    stakeholder_note: 'Stakeholder Note',
    brand_guideline: 'Brand Guideline',
    legal_constraint: 'Legal Constraint',
    timing: 'Timing',
    budget_note: 'Budget Note',
};

export function humanizeFrameType(type: string): string {
    if (Object.prototype.hasOwnProperty.call(FRAME_TYPE_LABELS, type)) {
        return FRAME_TYPE_LABELS[type as MarketingFrameType];
    }
    return type;
}

export function humanizeConnectionType(type: string): string {
    if (Object.prototype.hasOwnProperty.call(CONNECTION_TYPE_LABELS, type)) {
        return CONNECTION_TYPE_LABELS[type as MarketingConnectionType];
    }
    return type;
}

export function humanizeMissingReason(code: string): string {
    if (Object.prototype.hasOwnProperty.call(MISSING_REASON_LABELS, code)) {
        return MISSING_REASON_LABELS[code as MissingSpecReason];
    }
    return code.replace(/_/g, ' ');
}

export function humanizeBeatStatus(level: string): string {
    if (Object.prototype.hasOwnProperty.call(BEAT_STATUS_LABELS, level)) {
        return BEAT_STATUS_LABELS[level as CampaignBeatStatusLevel];
    }
    return level;
}

export function humanizeAnnotationType(type: string): string {
    if (Object.prototype.hasOwnProperty.call(ANNOTATION_TYPE_LABELS, type)) {
        return ANNOTATION_TYPE_LABELS[type as MarketingAnnotationType];
    }
    return type.replace(/_/g, ' ');
}
