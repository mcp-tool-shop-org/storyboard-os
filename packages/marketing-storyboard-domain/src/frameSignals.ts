// ─── marketing-domain / frameSignals.ts ──────────────────────────────────────
//
// Domain helpers that extract campaign-state and flow signals from marketing
// frames for use in canvas badges and hover previews.
//
// These live in the domain package because they understand marketing content
// fields. The canvas only sees the resulting badge descriptors.
//
// ─────────────────────────────────────────────────────────────────────────────

import type { StoryboardFrame, MarketingFrameContent, StoryboardConnection } from './schema';

// ─── Types ────────────────────────────────────────────────────────────────────

export type FrameReadiness = 'ready' | 'partial' | 'incomplete';

export interface MarketingFrameSignal {
    customerStateSummary: string | null;
    channelSummary: string | null;
    readiness: FrameReadiness;
    hasMetrics: boolean;
    hasRequiredAssets: boolean;
    hasImplementationChecklist: boolean;
    hasConversionGoal: boolean;
    hasApprovalRequirements: boolean;
}

export interface FrameBadgeDescriptor {
    text: string;
    color: string;
}

// ─── Internal helpers ─────────────────────────────────────────────────────────

function computeReadiness(content: MarketingFrameContent): FrameReadiness {
    const score = [
        (content.implementationChecklist?.length ?? 0) > 0,
        (content.requiredAssets?.length ?? 0) > 0,
        (content.testCriteria?.length ?? 0) > 0,
        !!content.objective,
    ].filter(Boolean).length;

    if (score >= 3) return 'ready';
    if (score >= 1) return 'partial';
    return 'incomplete';
}

// ─── Public API ───────────────────────────────────────────────────────────────

export function getMarketingFrameSignal(frame: StoryboardFrame): MarketingFrameSignal {
    const content = frame.content;

    const customerStateSummary =
        content.customerStateAfter && content.customerStateAfter.length > 0
            ? content.customerStateAfter[0] + (content.customerStateAfter.length > 1 ? ` (+${content.customerStateAfter.length - 1})` : '')
            : null;

    const channelSummary = content.channel?.trim() || null;

    return {
        customerStateSummary,
        channelSummary,
        readiness: computeReadiness(content),
        hasMetrics: (content.metrics?.length ?? 0) > 0,
        hasRequiredAssets: (content.requiredAssets?.length ?? 0) > 0,
        hasImplementationChecklist: (content.implementationChecklist?.length ?? 0) > 0,
        hasConversionGoal: !!content.conversionGoal?.trim(),
        hasApprovalRequirements: (content.approvalRequirements?.length ?? 0) > 0,
    };
}

export function getMarketingFrameBadges(
    frame: StoryboardFrame,
    connections: StoryboardConnection[],
): FrameBadgeDescriptor[] {
    const content = frame.content;
    const badges: FrameBadgeDescriptor[] = [];

    // STATE badge — frame carries customer state transition
    if (content.customerStateAfter && content.customerStateAfter.length > 0) {
        badges.push({ text: 'STATE', color: '#3B82F6' });
    }

    // APPROVAL badge — frame has approval requirements
    if (content.approvalRequirements && content.approvalRequirements.length > 0) {
        badges.push({ text: 'GATE', color: '#F59E0B' });
    }

    // Readiness badge
    const readiness = computeReadiness(content);
    switch (readiness) {
        case 'ready':
            badges.push({ text: 'SPEC', color: '#22C55E' });
            break;
        case 'partial':
            badges.push({ text: 'PARTIAL', color: '#F97316' });
            break;
        case 'incomplete':
            badges.push({ text: 'DRAFT', color: '#6B7280' });
            break;
    }

    return badges;
}

export function getSegmentPathCount(
    frame: StoryboardFrame,
    connections: StoryboardConnection[],
): number {
    if (frame.type !== 'audience') return 0;
    return connections.filter(
        c => c.fromFrameId === frame.id && c.type === 'choice', // segment_path maps to choice in core
    ).length;
}
