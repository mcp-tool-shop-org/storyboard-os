// ─── marketing-domain / launchReadiness.ts ───────────────────────────────────
//
// Launch Readiness Signal Layer (0C)
//
// Domain helpers that answer: "What blocks launch, and can this campaign ship?"
//
// Exports:
//   getCampaignLaunchReadiness()  — headline rollup signal
//   getCampaignCriticalPath()     — longest dependency chain through launch_event
//   getApprovalGateSignals()      — approval gate visibility at board level
//   getMeasurementLoopSignals()   — measurement closure signals
//
// These live in the domain because they encode marketing campaign rules.
// The app only consumes the result shapes.
//
// ─────────────────────────────────────────────────────────────────────────────

import type { Storyboard, StoryboardFrame, StoryboardConnection } from './schema';
import { getCampaignBeatStatus, BLOCKING_REASONS } from './beatStatus';
import type { CampaignBeatStatusLevel, MissingSpecReason } from './beatStatus';

// ─── Types ────────────────────────────────────────────────────────────────────

export type LaunchReadinessLevel = 'ready' | 'at_risk' | 'blocked' | 'draft';

export interface LaunchReadinessSummary {
    level: LaunchReadinessLevel;
    blockedFrameIds: string[];
    approvalGateFrameIds: string[];
    missingMeasurementFrameIds: string[];
    criticalPathFrameIds: string[];
    summary: string;
}

export interface ApprovalGateSignal {
    frameId: string;
    title: string;
    status: CampaignBeatStatusLevel;
    missing: MissingSpecReason[];
    blocksLaunch: boolean;
    hasApprovalRequirements: boolean;
}

export interface MeasurementLoopSignal {
    frameId: string;
    title: string;
    hasMetrics: boolean;
    metricsCount: number;
    hasIncomingConnection: boolean;
    hasOutgoingConnection: boolean;
    isLoop: boolean;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

/** Connection types that represent blocking dependencies */
function isBlockingConnection(type: string): boolean {
    return type === 'consequence' || type === 'dependency';
}

/** Build adjacency list (fromId → toIds) */
function buildAdjacency(connections: StoryboardConnection[]): Map<string, string[]> {
    const adj = new Map<string, string[]>();
    for (const conn of connections) {
        const list = adj.get(conn.fromFrameId) ?? [];
        list.push(conn.toFrameId);
        adj.set(conn.fromFrameId, list);
    }
    return adj;
}

/** Build reverse adjacency (toId → fromIds) */
function buildReverseAdjacency(connections: StoryboardConnection[]): Map<string, string[]> {
    const rev = new Map<string, string[]>();
    for (const conn of connections) {
        const list = rev.get(conn.toFrameId) ?? [];
        list.push(conn.fromFrameId);
        rev.set(conn.toFrameId, list);
    }
    return rev;
}

/**
 * Find the longest path from any root (0 in-degree) to any launch_event frame,
 * using all connection types. Returns frame IDs in path order.
 */
function longestPathToLaunchEvent(
    frames: StoryboardFrame[],
    connections: StoryboardConnection[],
): string[] {
    const frameIds = new Set(frames.map(f => f.id));
    const adj = buildAdjacency(connections);

    // Compute in-degree
    const inDegree = new Map<string, number>();
    for (const f of frames) inDegree.set(f.id, 0);
    for (const c of connections) {
        if (frameIds.has(c.toFrameId)) {
            inDegree.set(c.toFrameId, (inDegree.get(c.toFrameId) ?? 0) + 1);
        }
    }

    // Topological sort (Kahn's)
    const queue: string[] = [];
    for (const [id, deg] of inDegree) {
        if (deg === 0) queue.push(id);
    }

    const topoOrder: string[] = [];
    while (queue.length > 0) {
        const id = queue.shift()!;
        topoOrder.push(id);
        for (const neighbor of adj.get(id) ?? []) {
            if (!frameIds.has(neighbor)) continue;
            const newDeg = (inDegree.get(neighbor) ?? 1) - 1;
            inDegree.set(neighbor, newDeg);
            if (newDeg === 0) queue.push(neighbor);
        }
    }

    // Find longest path to each node using DP on topo order
    const dist = new Map<string, number>();
    const prev = new Map<string, string | null>();
    for (const id of topoOrder) {
        dist.set(id, 0);
        prev.set(id, null);
    }

    for (const id of topoOrder) {
        const d = dist.get(id) ?? 0;
        for (const neighbor of adj.get(id) ?? []) {
            if (!frameIds.has(neighbor)) continue;
            if (d + 1 > (dist.get(neighbor) ?? 0)) {
                dist.set(neighbor, d + 1);
                prev.set(neighbor, id);
            }
        }
    }

    // Find launch_event frame with longest distance
    const frameMap = new Map(frames.map(f => [f.id, f]));
    let bestLaunchId: string | null = null;
    let bestDist = -1;
    for (const f of frames) {
        if (f.type === 'launch_event') {
            const d = dist.get(f.id) ?? 0;
            if (d > bestDist) {
                bestDist = d;
                bestLaunchId = f.id;
            }
        }
    }

    if (!bestLaunchId) return [];

    // Also include downstream from launch_event (conversion, measurement, follow_up)
    // Find longest path continuing from launch_event
    let endId = bestLaunchId;
    for (const id of topoOrder) {
        if ((dist.get(id) ?? 0) > (dist.get(endId) ?? 0)) {
            // Only extend if reachable from launch
            if (isReachableFrom(bestLaunchId, id, adj, frameIds)) {
                endId = id;
            }
        }
    }

    // Trace back from endId to root
    const path: string[] = [];
    let current: string | null = endId;
    while (current !== null) {
        path.unshift(current);
        current = prev.get(current) ?? null;
    }

    return path;
}

/** BFS reachability check */
function isReachableFrom(from: string, to: string, adj: Map<string, string[]>, valid: Set<string>): boolean {
    const visited = new Set<string>();
    const queue = [from];
    while (queue.length > 0) {
        const id = queue.shift()!;
        if (id === to) return true;
        if (visited.has(id)) continue;
        visited.add(id);
        for (const neighbor of adj.get(id) ?? []) {
            if (valid.has(neighbor) && !visited.has(neighbor)) {
                queue.push(neighbor);
            }
        }
    }
    return false;
}

/** Check if an approval frame blocks (connects to) a launch_event */
function approvalBlocksLaunch(
    approvalFrameId: string,
    connections: StoryboardConnection[],
    frames: StoryboardFrame[],
): boolean {
    const adj = buildAdjacency(connections);
    const frameIds = new Set(frames.map(f => f.id));
    const launchIds = new Set(frames.filter(f => f.type === 'launch_event').map(f => f.id));

    // BFS from approval frame — does it reach a launch_event?
    const visited = new Set<string>();
    const queue = [approvalFrameId];
    while (queue.length > 0) {
        const id = queue.shift()!;
        if (launchIds.has(id)) return true;
        if (visited.has(id)) continue;
        visited.add(id);
        for (const neighbor of adj.get(id) ?? []) {
            if (frameIds.has(neighbor) && !visited.has(neighbor)) {
                queue.push(neighbor);
            }
        }
    }
    return false;
}

// ─── Public API ───────────────────────────────────────────────────────────────

/**
 * Headline launch readiness signal.
 * Answers: "Can this campaign ship?"
 */
export function getCampaignLaunchReadiness(campaign: Storyboard): LaunchReadinessSummary {
    const { frames, connections } = campaign;

    // Compute per-frame status
    const blockedFrameIds: string[] = [];
    for (const frame of frames) {
        const status = getCampaignBeatStatus(frame);
        if (status.level === 'blocked') {
            blockedFrameIds.push(frame.id);
        }
    }

    // Approval gates
    const approvalGateFrameIds = frames
        .filter(f => f.type === 'approval')
        .map(f => f.id);

    // Measurement frames missing metrics
    const missingMeasurementFrameIds = frames
        .filter(f => f.type === 'measurement')
        .filter(f => !f.content.metrics || f.content.metrics.length === 0)
        .map(f => f.id);

    // Critical path
    const criticalPathFrameIds = longestPathToLaunchEvent(frames, connections);

    // Determine overall level
    const hasBlockedOnCriticalPath = criticalPathFrameIds.some(id => blockedFrameIds.includes(id));
    const hasBlockedApproval = approvalGateFrameIds.some(id => blockedFrameIds.includes(id));
    const hasAnyBlocked = blockedFrameIds.length > 0;
    const hasMeasurementGap = missingMeasurementFrameIds.length > 0;

    // Count total draft frames
    let draftCount = 0;
    for (const frame of frames) {
        const status = getCampaignBeatStatus(frame);
        if (status.level === 'draft') draftCount++;
    }

    let level: LaunchReadinessLevel;
    let summary: string;

    if (hasBlockedOnCriticalPath || hasBlockedApproval) {
        level = 'blocked';
        const blockerCount = blockedFrameIds.length;
        summary = `${blockerCount} launch ${blockerCount === 1 ? 'blocker' : 'blockers'} — campaign cannot ship`;
    } else if (hasAnyBlocked || hasMeasurementGap) {
        level = 'at_risk';
        const issues: string[] = [];
        if (hasAnyBlocked) issues.push(`${blockedFrameIds.length} blocked`);
        if (hasMeasurementGap) issues.push('measurement gaps');
        summary = `At risk — ${issues.join(', ')}`;
    } else if (draftCount > frames.length / 2) {
        level = 'draft';
        summary = `Campaign in draft — ${draftCount}/${frames.length} beats underspecified`;
    } else {
        level = 'ready';
        summary = 'Campaign implementation spec complete';
    }

    return {
        level,
        blockedFrameIds,
        approvalGateFrameIds,
        missingMeasurementFrameIds,
        criticalPathFrameIds,
        summary,
    };
}

/**
 * Critical path: longest dependency chain through launch_event.
 * Returns frame IDs in execution order.
 */
export function getCampaignCriticalPath(campaign: Storyboard): string[] {
    return longestPathToLaunchEvent(campaign.frames, campaign.connections);
}

/**
 * Approval gate signals for board-level visibility.
 */
export function getApprovalGateSignals(campaign: Storyboard): ApprovalGateSignal[] {
    const { frames, connections } = campaign;

    return frames
        .filter(f => f.type === 'approval')
        .map(f => {
            const status = getCampaignBeatStatus(f);
            return {
                frameId: f.id,
                title: f.title,
                status: status.level,
                missing: status.missing,
                blocksLaunch: approvalBlocksLaunch(f.id, connections, frames),
                hasApprovalRequirements: (f.content.approvalRequirements?.length ?? 0) > 0,
            };
        });
}

/**
 * Measurement loop signals — does the campaign close the measurement loop?
 */
export function getMeasurementLoopSignals(campaign: Storyboard): MeasurementLoopSignal[] {
    const { frames, connections } = campaign;

    const incomingMap = buildReverseAdjacency(connections);
    const outgoingMap = buildAdjacency(connections);

    return frames
        .filter(f => f.type === 'measurement')
        .map(f => {
            const hasMetrics = (f.content.metrics?.length ?? 0) > 0;
            const hasIncoming = (incomingMap.get(f.id)?.length ?? 0) > 0;
            const hasOutgoing = (outgoingMap.get(f.id)?.length ?? 0) > 0;

            return {
                frameId: f.id,
                title: f.title,
                hasMetrics,
                metricsCount: f.content.metrics?.length ?? 0,
                hasIncomingConnection: hasIncoming,
                hasOutgoingConnection: hasOutgoing,
                // A loop means measurement feeds back — has both incoming AND outgoing
                isLoop: hasIncoming && hasOutgoing,
            };
        });
}
