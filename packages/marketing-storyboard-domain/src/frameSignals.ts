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
import { getCampaignBeatStatus, type CampaignBeatStatusLevel } from './beatStatus';

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

// Badge readiness mirrors getCampaignBeatStatus so type-rule blockers cannot
// paint as SPEC while the inspector/launch rollup show blocked.
const BEAT_STATUS_LABEL: Record<CampaignBeatStatusLevel, string> = {
    ready:   statusLabels.ready,   // 'SPEC'
    partial: statusLabels.partial, // 'PARTIAL'
    draft:   statusLabels.draft,   // 'DRAFT'
    blocked: statusLabels.blocked, // 'BLOCKED'
};

const BEAT_STATUS_COLOR: Record<CampaignBeatStatusLevel, string> = {
    ready:   marketingColors.ready,
    partial: marketingColors.partial,
    draft:   marketingColors.draft,
    blocked: marketingColors.blocked,
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

/** Map beat status onto the coarser FrameReadiness union (blocked/draft → incomplete). */
function readinessFromBeatStatus(level: CampaignBeatStatusLevel): FrameReadiness {
    switch (level) {
        case 'ready':
            return 'ready';
        case 'partial':
            return 'partial';
        case 'draft':
        case 'blocked':
            return 'incomplete';
        default: {
            const _exhaustive: never = level;
            void _exhaustive;
            return 'incomplete';
        }
    }
}

// ─── Public API ───────────────────────────────────────────────────────────────

/**
 * Extract a MarketingFrameSignal from a campaign frame.
 *
 * `readiness` follows getCampaignBeatStatus (same authority as badges /
 * inspector / launch rollup), mapped onto FrameReadiness
 * (blocked/draft → incomplete). A type-rule blocker cannot report ready.
 */
export function getMarketingFrameSignal(frame: StoryboardFrame): MarketingFrameSignal {
    // Untrusted load paths can hand us a frame with null/missing content —
    // normalize to an empty spec instead of throwing (DM-002).
    const content = (frame.content ?? {}) as MarketingFrameContent;

    const customerStateSummary =
        content.customerStateAfter && content.customerStateAfter.length > 0
            ? content.customerStateAfter[0] + (content.customerStateAfter.length > 1 ? ` (+${content.customerStateAfter.length - 1})` : '')
            : null;

    const channelSummary = content.channel?.trim() || null;
    const beatStatus = getCampaignBeatStatus(frame);

    return {
        customerStateSummary,
        channelSummary,
        readiness: readinessFromBeatStatus(beatStatus.level),
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

    // Readiness badge — authoritative beat status (includes type-rule blockers)
    const status = getCampaignBeatStatus(frame);
    badges.push({
        text: BEAT_STATUS_LABEL[status.level],
        color: BEAT_STATUS_COLOR[status.level],
    });

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
