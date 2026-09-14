// ─── marketing-storyboard / lib/launchBlockers.ts ─────────────────────────────
//
// Pure categorization logic for the Launch Blockers panel.
//
// Lives outside the canvas component so it can be unit-tested without pulling
// Konva/react-konva into a node test environment.
//
// ─────────────────────────────────────────────────────────────────────────────

import {
    getCampaignBeatStatus,
    BLOCKING_REASONS,
    humanizeMissingReason,
    type ApprovalGateSignal,
    type MeasurementLoopSignal,
    type StoryboardFrame,
} from '@storyboard-os/marketing-domain';

export interface ApprovalSignalCategories {
    /** Gates that cannot pass at all — approval requirements are missing. */
    blocked: ApprovalGateSignal[];
    /** Gates that are defined but not yet fully specced/signed off. */
    pending: ApprovalGateSignal[];
}

export interface BlockedBeatEntry {
    frameId: string;
    title: string;
    /** Humanized BLOCKING_REASONS (or a generic fallback). */
    details: string[];
}

/** Measurement frames that have metrics but no outgoing feedback edge. */
export function hasOpenMeasurementLoops(signals: readonly MeasurementLoopSignal[]): boolean {
    return signals.some(s => s.hasMetrics && !s.isLoop);
}

/**
 * Outer visibility gate for the Launch Blockers panel.
 * Must include open loops — otherwise a clean campaign whose only issue is an
 * unclosed measurement loop never mounts the panel that would surface it.
 * When blockedFrameIds is non-empty the panel MUST also render those beats
 * (see collectBlockedBeatEntries) — visibility and contents stay aligned.
 */
export function shouldShowLaunchBlockersPanel(input: {
    blockedFrameIds: readonly string[];
    missingMeasurementFrameIds: readonly string[];
    pendingApprovals: readonly ApprovalGateSignal[];
    measurementSignals: readonly MeasurementLoopSignal[];
}): boolean {
    return (
        input.blockedFrameIds.length > 0 ||
        input.missingMeasurementFrameIds.length > 0 ||
        input.pendingApprovals.length > 0 ||
        hasOpenMeasurementLoops(input.measurementSignals)
    );
}

/**
 * Blocked beats the Launch Blockers rail claims to cover when
 * `blockedFrameIds` is non-empty. Excludes frames already listed under the
 * approval-blocked or missing-metrics sections so each beat appears once in
 * its most specific category.
 */
export function collectBlockedBeatEntries(
    frames: readonly StoryboardFrame[],
    blockedFrameIds: readonly string[],
    options?: { excludeFrameIds?: readonly string[] },
): BlockedBeatEntry[] {
    const exclude = new Set(options?.excludeFrameIds ?? []);
    const frameById = new Map(frames.map(f => [f.id, f]));

    return blockedFrameIds
        .filter(id => !exclude.has(id))
        .map(id => {
            const frame = frameById.get(id);
            if (!frame) {
                return { frameId: id, title: id, details: ['Blocked'] };
            }
            const status = getCampaignBeatStatus(frame);
            const blockers = status.missing.filter(r => BLOCKING_REASONS.has(r));
            return {
                frameId: id,
                title: frame.title,
                details: blockers.length > 0
                    ? blockers.map(humanizeMissingReason)
                    : ['Blocked'],
            };
        });
}

/**
 * Whether the panel body has anything to paint. Must stay true whenever
 * shouldShowLaunchBlockersPanel is true for the same campaign signals —
 * otherwise the titled rail mounts and then returns null.
 */
export function launchBlockersPanelHasContent(input: {
    blockedBeats: readonly BlockedBeatEntry[];
    blockedApprovals: readonly ApprovalGateSignal[];
    pendingApprovals: readonly ApprovalGateSignal[];
    measurementSignals: readonly MeasurementLoopSignal[];
}): boolean {
    const missingMetrics = input.measurementSignals.filter(s => !s.hasMetrics);
    const openLoops = input.measurementSignals.filter(s => s.hasMetrics && !s.isLoop);
    return (
        input.blockedBeats.length > 0 ||
        input.blockedApprovals.length > 0 ||
        input.pendingApprovals.length > 0 ||
        missingMetrics.length > 0 ||
        openLoops.length > 0
    );
}

/**
 * Split approval gate signals into "blocked" and "pending" buckets for the
 * Launch Blockers panel.
 *
 * Why 'pending' is derived instead of read off `signal.status`:
 * CampaignBeatStatusLevel is 'ready' | 'partial' | 'draft' | 'blocked' —
 * there IS no 'pending' level. The panel previously filtered on
 * `s.status === 'pending'`, which is always false (ts2367), so pending
 * approvals never appeared. The truthful mapping from the domain model
 * (see packages/marketing-storyboard-domain/src/beatStatus.ts):
 *
 *   - 'blocked'          → the gate has NO approvalRequirements defined
 *                          (the type-specific blocking rule for approval
 *                          frames). Nothing can be approved yet.
 *   - 'partial'/'draft'  → approvalRequirements exist (`hasApprovalRequirements`),
 *                          but the gate's implementation spec is incomplete —
 *                          i.e. the approval is defined and awaiting
 *                          completion. That is what "pending" means here.
 *   - 'ready'            → fully specced; not a blocker, not pending.
 *
 * `hasApprovalRequirements` is checked explicitly even though, under current
 * domain rules, a non-blocked approval frame always has requirements — the
 * panel should never claim an approval is "pending" if the requirements list
 * is empty, regardless of how status rules evolve.
 */
export function categorizeApprovalSignals(signals: ApprovalGateSignal[]): ApprovalSignalCategories {
    return {
        blocked: signals.filter(s => s.status === 'blocked'),
        pending: signals.filter(
            s => s.hasApprovalRequirements && (s.status === 'partial' || s.status === 'draft'),
        ),
    };
}
