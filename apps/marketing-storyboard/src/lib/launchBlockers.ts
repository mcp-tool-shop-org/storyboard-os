// ─── marketing-storyboard / lib/launchBlockers.ts ─────────────────────────────
//
// Pure categorization logic for the Launch Blockers panel.
//
// Lives outside the canvas component so it can be unit-tested without pulling
// Konva/react-konva into a node test environment. Type-only domain import —
// nothing from the domain package executes at runtime here.
//
// ─────────────────────────────────────────────────────────────────────────────

import type { ApprovalGateSignal } from '@storyboard-os/marketing-domain';

export interface ApprovalSignalCategories {
    /** Gates that cannot pass at all — approval requirements are missing. */
    blocked: ApprovalGateSignal[];
    /** Gates that are defined but not yet fully specced/signed off. */
    pending: ApprovalGateSignal[];
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
