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
import { statusColors, statusLabels } from '@storyboard-os/core';

// ─── Marketing badge colors ───────────────────────────────────────────────────
// The single source for marketing badge colors. The shared status swatches come
// from core; the domain-specific ones (GATE, CRITICAL) live here. VP-002: GATE
// is AMBER (#F59E0B) — NOT red. Red (#EF4444) is reserved for `blocked`; the
// legend bug that painted the approval GATE red is fixed by everyone importing
// this const instead of hand-typing a hex.

export const marketingColors = {
  state:    statusColors.state,   // shared blue — customer-state transition
  gate:     '#F59E0B',            // amber — approval GATE (NOT red — that's blocked)
  critical: '#EAB308',            // yellow — critical-path / launch-critical marker
  ready:    statusColors.spec,
  partial:  statusColors.partial,
  draft:    statusColors.draft,
  blocked:  statusColors.blocked,
} as const;

// ─── Types ────────────────────────────────────────────────────────────────────

export type FrameReadiness = 'ready' | 'partial' | 'incomplete';

const READINESS_LABEL: Record<FrameReadiness, string> = {
  ready:      statusLabels.ready,   // 'SPEC'
  partial:    statusLabels.partial, // 'PARTIAL'
  incomplete: statusLabels.draft,   // 'DRAFT'
};

const READINESS_COLOR: Record<FrameReadiness, string> = {
  ready:      marketingColors.ready,
  partial:    marketingColors.partial,
  incomplete: marketingColors.draft,
};

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
    // Untrusted load paths can hand us a frame with null/missing content —
    // normalize to an empty spec instead of throwing (DM-002).
    const content = (frame.content ?? {}) as MarketingFrameContent;

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
): FrameBadgeDescriptor[] {
    // Normalize null/missing content to an empty spec (DM-002).
    const content = (frame.content ?? {}) as MarketingFrameContent;
    const badges: FrameBadgeDescriptor[] = [];

    // STATE badge — frame carries customer state transition
    if (content.customerStateAfter && content.customerStateAfter.length > 0) {
        badges.push({ text: 'STATE', color: marketingColors.state });
    }

    // APPROVAL badge — frame has approval requirements (amber GATE, not red)
    if (content.approvalRequirements && content.approvalRequirements.length > 0) {
        badges.push({ text: 'GATE', color: marketingColors.gate });
    }

    // Readiness badge
    const readiness = computeReadiness(content);
    switch (readiness) {
        case 'ready':
        case 'partial':
        case 'incomplete':
            badges.push({
                text: READINESS_LABEL[readiness],
                color: READINESS_COLOR[readiness],
            });
            break;
        default: {
            // Exhaustiveness guard (PR-003): a new FrameReadiness arm becomes a
            // compile error. At runtime, warn and fall back to DRAFT rather than
            // dropping the readiness badge (which would miscount coverage).
            const _exhaustive: never = readiness;
            console.warn('[marketing] unhandled FrameReadiness value:', _exhaustive);
            badges.push({ text: statusLabels.draft, color: marketingColors.draft });
            break;
        }
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
