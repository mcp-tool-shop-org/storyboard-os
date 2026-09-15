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

import type { Storyboard, StoryboardFrame, MarketingFrameContent, StoryboardConnection } from './schema';
import { getCampaignBeatStatus, getCampaignReadiness, BLOCKING_REASONS } from './beatStatus';
import type { CampaignBeatStatusLevel, MissingSpecReason } from './beatStatus';
import type { MarketingStoryboardProject, ProjectProgressSummary } from './project';
import { getFrameProgress, getProjectProgress } from './project';
import {
    humanizeBeatStatus,
    humanizeConnectionType,
    humanizeFrameType,
    humanizeMissingReason,
    MISSING_REASON_LABELS,
} from './labels';
import {
    getCampaignLaunchReadiness,
    getMeasurementLoopSignals,
    LAUNCH_READINESS_LABELS,
} from './launchReadiness';
import type { LaunchReadinessLevel } from './launchReadiness';

// ─── Markdown escaping (DM-004) ───────────────────────────────────────────────
//
// Neutralize markdown-structural characters in INLINE user text:
// - backticks / backslashes → escaped so user text cannot open code spans
// - pipes     → escaped so user text cannot add/split table cells
// - `*` `_`   → escaped so emphasis cannot reshape structure
// - `[` `]` `(` `)` → escaped so link/image syntax stays inert
// - `<`       → `&lt;` so stray inline HTML stays inert
// - a leading `#` / `>` / `-` (per line) → escaped so user text cannot
//   introduce headings, blockquotes, or list items

function escapeMarkdownInline(text: string): string {
    return text
        .replace(/\\/g, '\\\\')
        .replace(/`/g, '\\`')
        .replace(/\|/g, '\\|')
        .replace(/\*/g, '\\*')
        .replace(/_/g, '\\_')
        .replace(/\[/g, '\\[')
        .replace(/\]/g, '\\]')
        .replace(/\(/g, '\\(')
        .replace(/\)/g, '\\)')
        .replace(/</g, '&lt;')
        .replace(/^([#>-])/gm, '\\$1');
}

/** True launch blockers only — mirrors handoff.astro / MarketingFrameInspector. */
function launchBlockersFor(missing: readonly MissingSpecReason[]): MissingSpecReason[] {
    return missing.filter(r => BLOCKING_REASONS.has(r));
}

/** Non-blocking incompleteness (excludes advisory depth fields). */
function specGapsFor(missing: readonly MissingSpecReason[]): MissingSpecReason[] {
    return missing.filter(
        r => !BLOCKING_REASONS.has(r) && r !== 'no_proof_points' && r !== 'no_launch_dependencies',
    );
}

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
    /** Author-only notes (mirrors RPG authorOnlyNotes on the handoff beat). */
    ownerNotes?: string;

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

/**
 * Current handoff artifact schema version. Bump when the shape changes in a way
 * a downstream importer must branch on. Stamped onto every generated handoff so
 * future consumers have a discriminator (PR-004).
 *
 * Launch-readiness (`launch`) and `$schema` are additive on formatVersion 1 —
 * importers that ignore unknown keys keep working.
 */
export const HANDOFF_FORMAT_VERSION = 1;

/** Stable $id of schema/campaign-handoff.schema.json (package export ./schema/campaign-handoff.json). */
export const CAMPAIGN_HANDOFF_SCHEMA_ID =
    'https://github.com/mcp-tool-shop-org/storyboard-os/packages/marketing-storyboard-domain/schema/campaign-handoff.json';

export interface CampaignHandoffLaunch {
    level: LaunchReadinessLevel;
    summary: string;
    criticalPathFrameIds: string[];
    approvalGateFrameIds: string[];
    missingMeasurementFrameIds: string[];
    openLoopFrameIds: string[];
}

export interface CampaignHandoff {
    /** JSON Schema 2020-12 $id — stamped so importers can fetch the contract. */
    $schema: typeof CAMPAIGN_HANDOFF_SCHEMA_ID;
    /** Schema discriminator for downstream importers (PR-004). Always 1 for now. */
    formatVersion: 1;
    id: string;
    title: string;
    description?: string;
    generatedAt: string;
    readiness: CampaignHandoffReadiness;
    /** Compiled launch-readiness — answers "can this campaign ship?" without the Storyboard graph. */
    launch: CampaignHandoffLaunch;
    beats: CampaignHandoffBeat[];
    blockedIds: string[];
}

export interface CampaignHandoffValidationError {
    path: string;
    message: string;
}

export interface CampaignHandoffValidationResult {
    valid: boolean;
    errors: CampaignHandoffValidationError[];
}

export interface ProjectCampaignHandoffBeat extends CampaignHandoffBeat {
    checklistProgress: Record<string, boolean>;
    testCriteriaProgress: Record<string, boolean>;
}

export interface ProjectCampaignHandoff {
    $schema: typeof CAMPAIGN_HANDOFF_SCHEMA_ID;
    /** Schema discriminator for downstream importers (PR-004). Always 1 for now. */
    formatVersion: 1;
    projectId: string;
    projectTitle: string;
    sourceTemplateId?: string;
    generatedAt: string;
    progress: ProjectProgressSummary;
    readiness: CampaignHandoffReadiness;
    launch: CampaignHandoffLaunch;
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
    // Normalize null/missing content to an empty spec (DM-002).
    const content = (frame.content ?? {}) as MarketingFrameContent;
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
        ownerNotes: content.ownerNotes,
        outgoingBranches: outgoing,
        incomingFromIds: incoming,
    };
}

// ─── Launch block ─────────────────────────────────────────────────────────────

function buildLaunch(storyboard: Storyboard): CampaignHandoffLaunch {
    const summary = getCampaignLaunchReadiness(storyboard);
    const openLoopFrameIds = getMeasurementLoopSignals(storyboard)
        .filter(s => s.hasMetrics && !s.isLoop)
        .map(s => s.frameId);
    return {
        level: summary.level,
        summary: summary.summary,
        criticalPathFrameIds: summary.criticalPathFrameIds,
        approvalGateFrameIds: summary.approvalGateFrameIds,
        missingMeasurementFrameIds: summary.missingMeasurementFrameIds,
        openLoopFrameIds,
    };
}

const MISSING_SPEC_REASONS = new Set<string>(Object.keys(MISSING_REASON_LABELS));
const LAUNCH_LEVELS = new Set<string>(Object.keys(LAUNCH_READINESS_LABELS));
const BEAT_STATUS_LEVELS = new Set(['ready', 'partial', 'draft', 'blocked']);

function isRecord(value: unknown): value is Record<string, unknown> {
    return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function isStringArray(value: unknown): value is string[] {
    return Array.isArray(value) && value.every(item => typeof item === 'string');
}

function pushError(
    errors: CampaignHandoffValidationError[],
    path: string,
    message: string,
): void {
    errors.push({ path, message });
}

/**
 * Bounded generate-time / download-time validator for CampaignHandoff.
 * Checks the fields importers actually consume (C4). Not Ajv — Ajv stays out
 * of @storyboard-os/core and is not a marketing-domain runtime dep.
 */
export function validateCampaignHandoff(input: unknown): CampaignHandoffValidationResult {
    const errors: CampaignHandoffValidationError[] = [];
    if (!isRecord(input)) {
        return { valid: false, errors: [{ path: '', message: 'CampaignHandoff must be an object' }] };
    }

    if (input.$schema !== CAMPAIGN_HANDOFF_SCHEMA_ID) {
        pushError(errors, '$schema', `must equal ${CAMPAIGN_HANDOFF_SCHEMA_ID}`);
    }
    if (input.formatVersion !== HANDOFF_FORMAT_VERSION) {
        pushError(errors, 'formatVersion', `must be ${HANDOFF_FORMAT_VERSION}`);
    }
    for (const key of ['id', 'title', 'generatedAt'] as const) {
        if (typeof input[key] !== 'string' || (input[key] as string).length === 0) {
            pushError(errors, key, 'must be a non-empty string');
        }
    }
    if (input.description !== undefined && typeof input.description !== 'string') {
        pushError(errors, 'description', 'must be a string when present');
    }

    if (!isRecord(input.readiness)) {
        pushError(errors, 'readiness', 'must be an object');
    } else {
        for (const key of ['total', 'ready', 'partial', 'draft', 'blocked', 'readyFraction'] as const) {
            if (typeof input.readiness[key] !== 'number') {
                pushError(errors, `readiness.${key}`, 'must be a number');
            }
        }
    }

    if (!isRecord(input.launch)) {
        pushError(errors, 'launch', 'must be an object');
    } else {
        if (typeof input.launch.level !== 'string' || !LAUNCH_LEVELS.has(input.launch.level)) {
            pushError(errors, 'launch.level', 'must be ready | at_risk | blocked | draft');
        }
        if (typeof input.launch.summary !== 'string') {
            pushError(errors, 'launch.summary', 'must be a string');
        }
        for (const key of [
            'criticalPathFrameIds',
            'approvalGateFrameIds',
            'missingMeasurementFrameIds',
            'openLoopFrameIds',
        ] as const) {
            if (!isStringArray(input.launch[key])) {
                pushError(errors, `launch.${key}`, 'must be a string array');
            }
        }
    }

    if (!isStringArray(input.blockedIds)) {
        pushError(errors, 'blockedIds', 'must be a string array');
    }

    if (!Array.isArray(input.beats)) {
        pushError(errors, 'beats', 'must be an array');
    } else {
        input.beats.forEach((beat, i) => {
            const path = `beats[${i}]`;
            if (!isRecord(beat)) {
                pushError(errors, path, 'must be an object');
                return;
            }
            for (const key of ['id', 'type', 'title', 'summary'] as const) {
                if (typeof beat[key] !== 'string') {
                    pushError(errors, `${path}.${key}`, 'must be a string');
                }
            }
            if (typeof beat.status !== 'string' || !BEAT_STATUS_LEVELS.has(beat.status)) {
                pushError(errors, `${path}.status`, 'must be ready | partial | draft | blocked');
            }
            if (!Array.isArray(beat.missing) || !beat.missing.every(
                m => typeof m === 'string' && MISSING_SPEC_REASONS.has(m),
            )) {
                pushError(errors, `${path}.missing`, 'must be an array of MissingSpecReason');
            }
            for (const key of [
                'customerStateBefore',
                'customerStateAfter',
                'proofPoints',
                'objectionsHandled',
                'requiredAssets',
                'approvalRequirements',
                'launchDependencies',
                'metrics',
                'testCriteria',
                'implementationChecklist',
                'incomingFromIds',
            ] as const) {
                if (!isStringArray(beat[key])) {
                    pushError(errors, `${path}.${key}`, 'must be a string array');
                }
            }
            if (!Array.isArray(beat.outgoingBranches)) {
                pushError(errors, `${path}.outgoingBranches`, 'must be an array');
            } else {
                beat.outgoingBranches.forEach((branch, j) => {
                    if (!isRecord(branch)
                        || typeof branch.type !== 'string'
                        || typeof branch.toId !== 'string'
                        || typeof branch.toTitle !== 'string') {
                        pushError(errors, `${path}.outgoingBranches[${j}]`, 'must have type, toId, toTitle');
                    }
                });
            }
        });
    }

    return { valid: errors.length === 0, errors };
}

// ─── Public API ───────────────────────────────────────────────────────────────

export function generateCampaignHandoff(storyboard: Storyboard): CampaignHandoff {
    const sorted = topologicalSort(storyboard.frames, storyboard.connections);
    const readiness = getCampaignReadiness(storyboard);

    const beats = sorted.map(f => buildBeat(f, storyboard.connections, storyboard.frames));
    const blockedIds = beats.filter(b => b.status === 'blocked').map(b => b.id);

    const handoff: CampaignHandoff = {
        $schema: CAMPAIGN_HANDOFF_SCHEMA_ID,
        formatVersion: HANDOFF_FORMAT_VERSION,
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
        launch: buildLaunch(storyboard),
        beats,
        blockedIds,
    };

    const result = validateCampaignHandoff(handoff);
    if (!result.valid) {
        const detail = result.errors.map(e => `${e.path}: ${e.message}`).join('; ');
        throw new Error(`generateCampaignHandoff produced invalid CampaignHandoff: ${detail}`);
    }
    return handoff;
}

export function generateCampaignMarkdown(handoff: CampaignHandoff): string {
    const esc = escapeMarkdownInline;
    const lines: string[] = [];

    lines.push(`# Campaign Implementation Brief: ${esc(handoff.title)}`);
    lines.push('');
    if (handoff.description) {
        lines.push(esc(handoff.description));
        lines.push('');
    }
    lines.push(`Generated: ${handoff.generatedAt}`);
    lines.push('');

    // Readiness summary
    lines.push('## Readiness');
    lines.push('');
    lines.push(`| Status | Count |`);
    lines.push(`|--------|-------|`);
    lines.push(`| ${humanizeBeatStatus('ready')} | ${handoff.readiness.ready} |`);
    lines.push(`| ${humanizeBeatStatus('partial')} | ${handoff.readiness.partial} |`);
    lines.push(`| ${humanizeBeatStatus('draft')} | ${handoff.readiness.draft} |`);
    lines.push(`| ${humanizeBeatStatus('blocked')} | ${handoff.readiness.blocked} |`);
    lines.push(`| **Total** | **${handoff.readiness.total}** |`);
    lines.push('');

    // Launch-readiness — same badge strings the board header paints.
    const launch = handoff.launch;
    const titleFor = (id: string) => handoff.beats.find(b => b.id === id)?.title ?? id;
    const listTitles = (ids: string[]) =>
        ids.length === 0 ? 'none' : ids.map(titleFor).join(', ');
    lines.push('## Launch');
    lines.push('');
    lines.push(`**${LAUNCH_READINESS_LABELS[launch.level]}** — ${esc(launch.summary)}`);
    lines.push('');
    lines.push(`- Critical path: ${launch.criticalPathFrameIds.length === 0 ? 'none' : launch.criticalPathFrameIds.map(titleFor).join(' → ')}`);
    lines.push(`- Approval gates: ${listTitles(launch.approvalGateFrameIds)}`);
    lines.push(`- Missing measurement: ${listTitles(launch.missingMeasurementFrameIds)}`);
    lines.push(`- Open loops: ${listTitles(launch.openLoopFrameIds)}`);
    lines.push('');

    if (handoff.blockedIds.length > 0) {
        lines.push('### Blocked Beats');
        lines.push('');
        for (const id of handoff.blockedIds) {
            const beat = handoff.beats.find(b => b.id === id);
            if (!beat) continue;
            const blockers = launchBlockersFor(beat.missing);
            // Only true launch blockers under this heading — not advisory / ordinary gaps.
            if (blockers.length > 0) {
                lines.push(`- **${esc(beat.title)}** — missing: ${blockers.map(humanizeMissingReason).join(', ')}`);
            } else {
                lines.push(`- **${esc(beat.title)}**`);
            }
        }
        lines.push('');
    }

    // Spec gaps for every beat that has them — not only blockedIds (F-5c0c80f1).
    const gapLines: string[] = [];
    for (const beat of handoff.beats) {
        const gaps = specGapsFor(beat.missing);
        if (gaps.length > 0) {
            gapLines.push(`- **${esc(beat.title)}** — missing: ${gaps.map(humanizeMissingReason).join(', ')}`);
        }
    }
    if (gapLines.length > 0) {
        lines.push('### Spec Gaps');
        lines.push('');
        lines.push(...gapLines);
        lines.push('');
    }

    // Beats
    lines.push('---');
    lines.push('');
    lines.push('## Campaign Beats');
    lines.push('');

    for (const beat of handoff.beats) {
        lines.push(`### ${esc(beat.title)}`);
        lines.push('');
        lines.push(`**Type:** ${humanizeFrameType(beat.type)} | **Status:** ${humanizeBeatStatus(beat.status)}`);
        lines.push('');
        lines.push(esc(beat.summary));
        lines.push('');

        if (beat.objective) {
            lines.push(`**Objective:** ${esc(beat.objective)}`);
            lines.push('');
        }

        if (beat.audienceSegment) {
            lines.push(`**Audience:** ${esc(beat.audienceSegment)}`);
            lines.push('');
        }

        if (beat.channel) {
            lines.push(`**Channel:** ${esc(beat.channel)}`);
            lines.push('');
        }

        if (beat.messageClaim) {
            lines.push(`**Message:** ${esc(beat.messageClaim)}`);
            lines.push('');
        }

        if (beat.proofPoints.length > 0) {
            lines.push('**Proof Points:**');
            for (const p of beat.proofPoints) lines.push(`- ${esc(p)}`);
            lines.push('');
        }

        if (beat.objectionsHandled.length > 0) {
            lines.push('**Objections Handled:**');
            for (const o of beat.objectionsHandled) lines.push(`- ${esc(o)}`);
            lines.push('');
        }

        if (beat.conversionGoal) {
            lines.push(`**Conversion Goal:** ${esc(beat.conversionGoal)}`);
            lines.push('');
        }

        if (beat.customerStateBefore.length > 0) {
            lines.push('**Customer State Before:**');
            for (const s of beat.customerStateBefore) lines.push(`- ${esc(s)}`);
            lines.push('');
        }

        if (beat.customerStateAfter.length > 0) {
            lines.push('**Customer State After:**');
            for (const s of beat.customerStateAfter) lines.push(`- ${esc(s)}`);
            lines.push('');
        }

        if (beat.requiredAssets.length > 0) {
            lines.push('**Required Assets:**');
            for (const a of beat.requiredAssets) lines.push(`- ${esc(a)}`);
            lines.push('');
        }

        if (beat.approvalRequirements.length > 0) {
            lines.push('**Approval Requirements:**');
            for (const a of beat.approvalRequirements) lines.push(`- ${esc(a)}`);
            lines.push('');
        }

        if (beat.launchDependencies.length > 0) {
            lines.push('**Launch Dependencies:**');
            for (const d of beat.launchDependencies) lines.push(`- ${esc(d)}`);
            lines.push('');
        }

        if (beat.metrics.length > 0) {
            lines.push('**Metrics:**');
            for (const m of beat.metrics) lines.push(`- ${esc(m)}`);
            lines.push('');
        }

        if (beat.testCriteria.length > 0) {
            lines.push('**Test Criteria:**');
            for (const t of beat.testCriteria) lines.push(`- ${esc(t)}`);
            lines.push('');
        }

        if (beat.implementationChecklist.length > 0) {
            lines.push('**Implementation Checklist:**');
            for (const c of beat.implementationChecklist) lines.push(`- [ ] ${esc(c)}`);
            lines.push('');
        }

        if (beat.ownerNotes?.trim()) {
            lines.push('**Owner Notes:**');
            lines.push('');
            lines.push(esc(beat.ownerNotes));
            lines.push('');
        }

        if (beat.outgoingBranches.length > 0) {
            lines.push('**Next:**');
            for (const b of beat.outgoingBranches) {
                lines.push(`- → ${esc(b.toTitle)} (${humanizeConnectionType(b.type)}${b.label ? ': ' + esc(b.label) : ''})`);
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
        $schema: CAMPAIGN_HANDOFF_SCHEMA_ID,
        formatVersion: HANDOFF_FORMAT_VERSION,
        projectId: project.id,
        projectTitle: project.title,
        sourceTemplateId: project.sourceTemplateId,
        generatedAt: base.generatedAt,
        progress,
        readiness: base.readiness,
        launch: base.launch,
        beats,
        blockedIds: base.blockedIds,
    };
}

export function generateProjectCampaignMarkdown(handoff: ProjectCampaignHandoff): string {
    const esc = escapeMarkdownInline;
    const lines: string[] = [];

    lines.push(`# Campaign Implementation Brief: ${esc(handoff.projectTitle)}`);
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
    lines.push(`| ${humanizeBeatStatus('ready')} | ${handoff.readiness.ready} |`);
    lines.push(`| ${humanizeBeatStatus('partial')} | ${handoff.readiness.partial} |`);
    lines.push(`| ${humanizeBeatStatus('draft')} | ${handoff.readiness.draft} |`);
    lines.push(`| ${humanizeBeatStatus('blocked')} | ${handoff.readiness.blocked} |`);
    lines.push(`| **Total** | **${handoff.readiness.total}** |`);
    lines.push('');

    // Beats with progress
    lines.push('---');
    lines.push('');
    lines.push('## Campaign Beats');
    lines.push('');

    for (const beat of handoff.beats) {
        lines.push(`### ${esc(beat.title)}`);
        lines.push('');
        lines.push(`**Type:** ${humanizeFrameType(beat.type)} | **Status:** ${humanizeBeatStatus(beat.status)}`);
        lines.push('');
        lines.push(esc(beat.summary));
        lines.push('');

        if (beat.objective) {
            lines.push(`**Objective:** ${esc(beat.objective)}`);
            lines.push('');
        }

        if (beat.implementationChecklist.length > 0) {
            lines.push('**Implementation Checklist:**');
            for (let i = 0; i < beat.implementationChecklist.length; i++) {
                const done = beat.checklistProgress[String(i)] === true;
                lines.push(`- [${done ? 'x' : ' '}] ${esc(beat.implementationChecklist[i])}`);
            }
            lines.push('');
        }

        if (beat.testCriteria.length > 0) {
            lines.push('**Test Criteria:**');
            for (let i = 0; i < beat.testCriteria.length; i++) {
                const done = beat.testCriteriaProgress[String(i)] === true;
                lines.push(`- [${done ? 'x' : ' '}] ${esc(beat.testCriteria[i])}`);
            }
            lines.push('');
        }

        lines.push('---');
        lines.push('');
    }

    return lines.join('\n');
}
