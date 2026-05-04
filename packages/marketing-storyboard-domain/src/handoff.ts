// ─── marketing-domain / handoff.ts ───────────────────────────────────────────
//
// Campaign Implementation Brief generator.
//
// generateCampaignHandoff(storyboard) builds a production implementation
// artifact: beats ordered by campaign flow, each carrying the full spec
// a marketer/designer/developer needs to execute that beat.
//
// generateCampaignMarkdown(handoff) renders that artifact as a readable brief.
//
// ─────────────────────────────────────────────────────────────────────────────

import type { Storyboard, StoryboardFrame, MarketingFrameContent } from './schema';
import type { StoryboardConnection } from '@storyboard-os/core';
import { getCampaignBeatStatus, getCampaignReadiness } from './beatStatus';
import type { CampaignBeatStatusLevel, MissingSpecReason } from './beatStatus';
import type { MarketingStoryboardProject, ProjectProgressSummary } from './project';
import { getFrameProgress, getProjectProgress } from './project';

// ─── Types ────────────────────────────────────────────────────────────────────

export interface HandoffBranch {
    type: string;
    label?: string;
    toId: string;
    toTitle: string;
}

export interface CampaignHandoffBeat {
    id: string;
    type: string;
    title: string;
    summary: string;
    status: CampaignBeatStatusLevel;
    missing: MissingSpecReason[];

    // Strategy
    objective?: string;
    audienceSegment?: string;
    customerStateBefore: string[];
    customerStateAfter: string[];

    // Messaging
    channel?: string;
    messageClaim?: string;
    proofPoints: string[];
    objectionsHandled: string[];

    // Production
    requiredAssets: string[];
    approvalRequirements: string[];
    launchDependencies: string[];

    // Outcomes
    conversionGoal?: string;
    metrics: string[];

    // Implementation
    testCriteria: string[];
    implementationChecklist: string[];

    // Graph context
    outgoingBranches: HandoffBranch[];
    incomingFromIds: string[];
}

export interface CampaignHandoffReadiness {
    total: number;
    ready: number;
    partial: number;
    draft: number;
    blocked: number;
    readyFraction: number;
}

export interface CampaignHandoff {
    id: string;
    title: string;
    description?: string;
    generatedAt: string;
    readiness: CampaignHandoffReadiness;
    beats: CampaignHandoffBeat[];
    blockedIds: string[];
}

export interface ProjectCampaignHandoffBeat extends CampaignHandoffBeat {
    checklistProgress: Record<string, boolean>;
    testCriteriaProgress: Record<string, boolean>;
}

export interface ProjectCampaignHandoff {
    projectId: string;
    projectTitle: string;
    sourceTemplateId?: string;
    generatedAt: string;
    progress: ProjectProgressSummary;
    readiness: CampaignHandoffReadiness;
    beats: ProjectCampaignHandoffBeat[];
    blockedIds: string[];
}

// ─── Topological sort (Kahn's algorithm) ──────────────────────────────────────

function topologicalSort(frames: StoryboardFrame[], connections: StoryboardConnection[]): StoryboardFrame[] {
    const inDegree = new Map<string, number>();
    const adjacency = new Map<string, string[]>();

    for (const frame of frames) {
        inDegree.set(frame.id, 0);
        adjacency.set(frame.id, []);
    }

    for (const conn of connections) {
        if (inDegree.has(conn.toFrameId)) {
            inDegree.set(conn.toFrameId, (inDegree.get(conn.toFrameId) ?? 0) + 1);
        }
        adjacency.get(conn.fromFrameId)?.push(conn.toFrameId);
    }

    const queue: string[] = [];
    for (const [id, deg] of inDegree) {
        if (deg === 0) queue.push(id);
    }

    const sorted: StoryboardFrame[] = [];
    const frameMap = new Map(frames.map(f => [f.id, f]));

    while (queue.length > 0) {
        const id = queue.shift()!;
        const frame = frameMap.get(id);
        if (frame) sorted.push(frame);

        for (const neighbor of adjacency.get(id) ?? []) {
            const newDeg = (inDegree.get(neighbor) ?? 1) - 1;
            inDegree.set(neighbor, newDeg);
            if (newDeg === 0) queue.push(neighbor);
        }
    }

    // Append any frames not reached (cycles or disconnected)
    for (const frame of frames) {
        if (!sorted.includes(frame)) sorted.push(frame);
    }

    return sorted;
}

// ─── Beat builder ─────────────────────────────────────────────────────────────

function buildBeat(
    frame: StoryboardFrame,
    connections: StoryboardConnection[],
    allFrames: StoryboardFrame[],
): CampaignHandoffBeat {
    const content = frame.content;
    const status = getCampaignBeatStatus(frame);
    const frameMap = new Map(allFrames.map(f => [f.id, f]));

    const outgoing = connections
        .filter(c => c.fromFrameId === frame.id)
        .map(c => ({
            type: c.type,
            label: c.label,
            toId: c.toFrameId,
            toTitle: frameMap.get(c.toFrameId)?.title ?? c.toFrameId,
        }));

    const incoming = connections
        .filter(c => c.toFrameId === frame.id)
        .map(c => c.fromFrameId);

    return {
        id: frame.id,
        type: frame.type,
        title: frame.title,
        summary: frame.summary,
        status: status.level,
        missing: status.missing,
        objective: content.objective,
        audienceSegment: content.audienceSegment,
        customerStateBefore: content.customerStateBefore ?? [],
        customerStateAfter: content.customerStateAfter ?? [],
        channel: content.channel,
        messageClaim: content.messageClaim,
        proofPoints: content.proofPoints ?? [],
        objectionsHandled: content.objectionsHandled ?? [],
        requiredAssets: content.requiredAssets ?? [],
        approvalRequirements: content.approvalRequirements ?? [],
        launchDependencies: content.launchDependencies ?? [],
        conversionGoal: content.conversionGoal,
        metrics: content.metrics ?? [],
        testCriteria: content.testCriteria ?? [],
        implementationChecklist: content.implementationChecklist ?? [],
        outgoingBranches: outgoing,
        incomingFromIds: incoming,
    };
}

// ─── Public API ───────────────────────────────────────────────────────────────

export function generateCampaignHandoff(storyboard: Storyboard): CampaignHandoff {
    const sorted = topologicalSort(storyboard.frames, storyboard.connections);
    const readiness = getCampaignReadiness(storyboard);

    const beats = sorted.map(f => buildBeat(f, storyboard.connections, storyboard.frames));
    const blockedIds = beats.filter(b => b.status === 'blocked').map(b => b.id);

    return {
        id: storyboard.id,
        title: storyboard.title,
        description: storyboard.description,
        generatedAt: new Date().toISOString(),
        readiness: {
            total: readiness.total,
            ready: readiness.ready,
            partial: readiness.partial,
            draft: readiness.draft,
            blocked: readiness.blocked,
            readyFraction: readiness.readyFraction,
        },
        beats,
        blockedIds,
    };
}

export function generateCampaignMarkdown(handoff: CampaignHandoff): string {
    const lines: string[] = [];

    lines.push(`# Campaign Implementation Brief: ${handoff.title}`);
    lines.push('');
    if (handoff.description) {
        lines.push(handoff.description);
        lines.push('');
    }
    lines.push(`Generated: ${handoff.generatedAt}`);
    lines.push('');

    // Readiness summary
    lines.push('## Readiness');
    lines.push('');
    lines.push(`| Status | Count |`);
    lines.push(`|--------|-------|`);
    lines.push(`| Ready | ${handoff.readiness.ready} |`);
    lines.push(`| Partial | ${handoff.readiness.partial} |`);
    lines.push(`| Draft | ${handoff.readiness.draft} |`);
    lines.push(`| Blocked | ${handoff.readiness.blocked} |`);
    lines.push(`| **Total** | **${handoff.readiness.total}** |`);
    lines.push('');

    if (handoff.blockedIds.length > 0) {
        lines.push('### Blocked Beats');
        lines.push('');
        for (const id of handoff.blockedIds) {
            const beat = handoff.beats.find(b => b.id === id);
            if (beat) lines.push(`- **${beat.title}** — missing: ${beat.missing.join(', ')}`);
        }
        lines.push('');
    }

    // Beats
    lines.push('---');
    lines.push('');
    lines.push('## Campaign Beats');
    lines.push('');

    for (const beat of handoff.beats) {
        lines.push(`### ${beat.title}`);
        lines.push('');
        lines.push(`**Type:** ${beat.type} | **Status:** ${beat.status}`);
        lines.push('');
        lines.push(beat.summary);
        lines.push('');

        if (beat.objective) {
            lines.push(`**Objective:** ${beat.objective}`);
            lines.push('');
        }

        if (beat.audienceSegment) {
            lines.push(`**Audience:** ${beat.audienceSegment}`);
            lines.push('');
        }

        if (beat.channel) {
            lines.push(`**Channel:** ${beat.channel}`);
            lines.push('');
        }

        if (beat.messageClaim) {
            lines.push(`**Message:** ${beat.messageClaim}`);
            lines.push('');
        }

        if (beat.conversionGoal) {
            lines.push(`**Conversion Goal:** ${beat.conversionGoal}`);
            lines.push('');
        }

        if (beat.customerStateBefore.length > 0) {
            lines.push('**Customer State Before:**');
            for (const s of beat.customerStateBefore) lines.push(`- ${s}`);
            lines.push('');
        }

        if (beat.customerStateAfter.length > 0) {
            lines.push('**Customer State After:**');
            for (const s of beat.customerStateAfter) lines.push(`- ${s}`);
            lines.push('');
        }

        if (beat.requiredAssets.length > 0) {
            lines.push('**Required Assets:**');
            for (const a of beat.requiredAssets) lines.push(`- ${a}`);
            lines.push('');
        }

        if (beat.approvalRequirements.length > 0) {
            lines.push('**Approval Requirements:**');
            for (const a of beat.approvalRequirements) lines.push(`- ${a}`);
            lines.push('');
        }

        if (beat.launchDependencies.length > 0) {
            lines.push('**Launch Dependencies:**');
            for (const d of beat.launchDependencies) lines.push(`- ${d}`);
            lines.push('');
        }

        if (beat.metrics.length > 0) {
            lines.push('**Metrics:**');
            for (const m of beat.metrics) lines.push(`- ${m}`);
            lines.push('');
        }

        if (beat.testCriteria.length > 0) {
            lines.push('**Test Criteria:**');
            for (const t of beat.testCriteria) lines.push(`- ${t}`);
            lines.push('');
        }

        if (beat.implementationChecklist.length > 0) {
            lines.push('**Implementation Checklist:**');
            for (const c of beat.implementationChecklist) lines.push(`- [ ] ${c}`);
            lines.push('');
        }

        if (beat.outgoingBranches.length > 0) {
            lines.push('**Next:**');
            for (const b of beat.outgoingBranches) {
                lines.push(`- → ${b.toTitle} (${b.type}${b.label ? ': ' + b.label : ''})`);
            }
            lines.push('');
        }

        lines.push('---');
        lines.push('');
    }

    return lines.join('\n');
}

// ─── Project handoff ──────────────────────────────────────────────────────────

export function generateProjectCampaignHandoff(
    project: MarketingStoryboardProject,
): ProjectCampaignHandoff {
    const base = generateCampaignHandoff(project.storyboard);
    const progress = getProjectProgress(project);

    const beats: ProjectCampaignHandoffBeat[] = base.beats.map(beat => {
        const fp = getFrameProgress(project, beat.id);
        return {
            ...beat,
            checklistProgress: fp.checklist,
            testCriteriaProgress: fp.testCriteria,
        };
    });

    return {
        projectId: project.id,
        projectTitle: project.title,
        sourceTemplateId: project.sourceTemplateId,
        generatedAt: base.generatedAt,
        progress,
        readiness: base.readiness,
        beats,
        blockedIds: base.blockedIds,
    };
}

export function generateProjectCampaignMarkdown(handoff: ProjectCampaignHandoff): string {
    const lines: string[] = [];

    lines.push(`# Campaign Implementation Brief: ${handoff.projectTitle}`);
    lines.push('');
    lines.push(`Project ID: ${handoff.projectId}`);
    if (handoff.sourceTemplateId) lines.push(`Template: ${handoff.sourceTemplateId}`);
    lines.push(`Generated: ${handoff.generatedAt}`);
    lines.push('');

    // Progress
    lines.push('## Progress');
    lines.push('');
    lines.push(`- Checklist: ${handoff.progress.doneChecklist}/${handoff.progress.totalChecklist}`);
    lines.push(`- Test Criteria: ${handoff.progress.doneTests}/${handoff.progress.totalTests}`);
    lines.push('');

    // Readiness
    lines.push('## Readiness');
    lines.push('');
    lines.push(`| Status | Count |`);
    lines.push(`|--------|-------|`);
    lines.push(`| Ready | ${handoff.readiness.ready} |`);
    lines.push(`| Partial | ${handoff.readiness.partial} |`);
    lines.push(`| Draft | ${handoff.readiness.draft} |`);
    lines.push(`| Blocked | ${handoff.readiness.blocked} |`);
    lines.push(`| **Total** | **${handoff.readiness.total}** |`);
    lines.push('');

    // Beats with progress
    lines.push('---');
    lines.push('');
    lines.push('## Campaign Beats');
    lines.push('');

    for (const beat of handoff.beats) {
        lines.push(`### ${beat.title}`);
        lines.push('');
        lines.push(`**Type:** ${beat.type} | **Status:** ${beat.status}`);
        lines.push('');
        lines.push(beat.summary);
        lines.push('');

        if (beat.objective) {
            lines.push(`**Objective:** ${beat.objective}`);
            lines.push('');
        }

        if (beat.implementationChecklist.length > 0) {
            lines.push('**Implementation Checklist:**');
            for (let i = 0; i < beat.implementationChecklist.length; i++) {
                const done = beat.checklistProgress[String(i)] === true;
                lines.push(`- [${done ? 'x' : ' '}] ${beat.implementationChecklist[i]}`);
            }
            lines.push('');
        }

        if (beat.testCriteria.length > 0) {
            lines.push('**Test Criteria:**');
            for (let i = 0; i < beat.testCriteria.length; i++) {
                const done = beat.testCriteriaProgress[String(i)] === true;
                lines.push(`- [${done ? 'x' : ' '}] ${beat.testCriteria[i]}`);
            }
            lines.push('');
        }

        lines.push('---');
        lines.push('');
    }

    return lines.join('\n');
}
