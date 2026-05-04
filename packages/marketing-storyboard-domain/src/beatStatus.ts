// ─── marketing-domain / beatStatus.ts ────────────────────────────────────────
//
// Authoritative marketing readiness model.
//
// The domain decides what "ready" means — not the app, not the canvas.
// getCampaignBeatStatus() encodes the domain rules for every marketing frame type:
//   - conversion         requires conversionGoal
//   - asset              requires requiredAssets
//   - approval           requires approvalRequirements
//   - measurement        requires metrics
//   - touchpoint         requires channel
//   - message            requires messageClaim
//   - all types          require a full implementation spec to reach 'ready'
//
// getCampaignReadiness() aggregates across a whole storyboard so the board
// header can display production-pass coverage at a glance.
//
// ─────────────────────────────────────────────────────────────────────────────

import type { StoryboardFrame, Storyboard, MarketingFrameContent } from './schema';

// ─── Types ────────────────────────────────────────────────────────────────────

export type CampaignBeatStatusLevel = 'ready' | 'partial' | 'draft' | 'blocked';

export type MissingSpecReason =
    // ── Blocking: domain rule violations ──────────────────────────────────────
    | 'no_conversion_goal'
    | 'no_required_assets'
    | 'no_approval_requirements'
    | 'no_metrics'
    | 'no_channel'
    | 'no_message_claim'
    // ── Spec gaps: implementation completeness ────────────────────────────────
    | 'no_objective'
    | 'no_audience_segment'
    | 'no_customer_state_before'
    | 'no_customer_state_after'
    | 'no_test_criteria'
    | 'no_implementation_checklist'
    // ── Advisory: contextual depth ────────────────────────────────────────────
    | 'no_proof_points'
    | 'no_launch_dependencies';

export const BLOCKING_REASONS: ReadonlySet<MissingSpecReason> = new Set<MissingSpecReason>([
    'no_conversion_goal',
    'no_required_assets',
    'no_approval_requirements',
    'no_metrics',
    'no_channel',
    'no_message_claim',
]);

export interface CampaignBeatStatus {
    level: CampaignBeatStatusLevel;
    missing: MissingSpecReason[];
    assetCount: number;
    metricsCount: number;
    checklistCount: number;
    testCriteriaCount: number;
    hasApprovalRequirements: boolean;
    hasConversionGoal: boolean;
}

export interface CampaignReadinessSummary {
    total: number;
    ready: number;
    partial: number;
    draft: number;
    blocked: number;
    readyFraction: number;
    byFrame: Map<string, CampaignBeatStatus>;
}

// ─── Internal helpers ─────────────────────────────────────────────────────────

function getMissing(frame: StoryboardFrame): MissingSpecReason[] {
    const content = frame.content;
    const missing: MissingSpecReason[] = [];

    // Blocking rules — type-specific
    if (frame.type === 'conversion' && !content.conversionGoal?.trim()) {
        missing.push('no_conversion_goal');
    }
    if (frame.type === 'asset' && (!content.requiredAssets || content.requiredAssets.length === 0)) {
        missing.push('no_required_assets');
    }
    if (frame.type === 'approval' && (!content.approvalRequirements || content.approvalRequirements.length === 0)) {
        missing.push('no_approval_requirements');
    }
    if (frame.type === 'measurement' && (!content.metrics || content.metrics.length === 0)) {
        missing.push('no_metrics');
    }
    if (frame.type === 'touchpoint' && !content.channel?.trim()) {
        missing.push('no_channel');
    }
    if (frame.type === 'message' && !content.messageClaim?.trim()) {
        missing.push('no_message_claim');
    }

    // Spec gaps — universal
    if (!content.objective?.trim()) missing.push('no_objective');
    if (!content.audienceSegment?.trim()) missing.push('no_audience_segment');
    if (!content.customerStateBefore || content.customerStateBefore.length === 0) missing.push('no_customer_state_before');
    if (!content.customerStateAfter || content.customerStateAfter.length === 0) missing.push('no_customer_state_after');
    if (!content.testCriteria || content.testCriteria.length === 0) missing.push('no_test_criteria');
    if (!content.implementationChecklist || content.implementationChecklist.length === 0) missing.push('no_implementation_checklist');

    // Advisory
    if (!content.proofPoints || content.proofPoints.length === 0) missing.push('no_proof_points');
    if (!content.launchDependencies || content.launchDependencies.length === 0) missing.push('no_launch_dependencies');

    return missing;
}

function computeLevel(missing: MissingSpecReason[]): CampaignBeatStatusLevel {
    const hasBlocker = missing.some(r => BLOCKING_REASONS.has(r));
    if (hasBlocker) return 'blocked';

    // Only spec gaps and advisory remain
    const specGaps = missing.filter(r => !BLOCKING_REASONS.has(r));
    const specGapCount = specGaps.filter(r =>
        r !== 'no_proof_points' && r !== 'no_launch_dependencies'
    ).length;

    if (specGapCount === 0) return 'ready';
    if (specGapCount <= 3) return 'partial';
    return 'draft';
}

// ─── Public API ───────────────────────────────────────────────────────────────

export function getCampaignBeatStatus(frame: StoryboardFrame): CampaignBeatStatus {
    const content = frame.content;
    const missing = getMissing(frame);
    const level = computeLevel(missing);

    return {
        level,
        missing,
        assetCount: content.requiredAssets?.length ?? 0,
        metricsCount: content.metrics?.length ?? 0,
        checklistCount: content.implementationChecklist?.length ?? 0,
        testCriteriaCount: content.testCriteria?.length ?? 0,
        hasApprovalRequirements: (content.approvalRequirements?.length ?? 0) > 0,
        hasConversionGoal: !!content.conversionGoal?.trim(),
    };
}

export function getCampaignReadiness(storyboard: Storyboard): CampaignReadinessSummary {
    const byFrame = new Map<string, CampaignBeatStatus>();
    let ready = 0, partial = 0, draft = 0, blocked = 0;

    for (const frame of storyboard.frames) {
        const status = getCampaignBeatStatus(frame);
        byFrame.set(frame.id, status);
        switch (status.level) {
            case 'ready': ready++; break;
            case 'partial': partial++; break;
            case 'draft': draft++; break;
            case 'blocked': blocked++; break;
        }
    }

    const total = storyboard.frames.length;
    return {
        total,
        ready,
        partial,
        draft,
        blocked,
        readyFraction: total > 0 ? ready / total : 0,
        byFrame,
    };
}
