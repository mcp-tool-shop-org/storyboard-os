// ─── marketing-storyboard-domain / project.ts ────────────────────────────────
//
// MarketingStoryboardProject — a durable user-created campaign project built
// from a template.
//
// Mirrors the RPG project model: wraps a Storyboard with authoring metadata,
// provenance, timestamps, and progress tracking separate from spec content.
//
// ─────────────────────────────────────────────────────────────────────────────

import type { Storyboard, MarketingTemplateId, MarketingFrameContent } from './schema';
import { createCampaignFromTemplate } from './templates';

// ─── Progress types ───────────────────────────────────────────────────────────

export interface FrameProgress {
    checklist: Record<string, boolean>;
    testCriteria: Record<string, boolean>;
}

export interface ProjectProgress {
    frames: Record<string, FrameProgress>;
}

export interface ProjectProgressSummary {
    totalChecklist: number;
    doneChecklist: number;
    totalTests: number;
    doneTests: number;
}

// ─── Types ────────────────────────────────────────────────────────────────────

export interface MarketingStoryboardProject {
    id: string;
    title: string;
    description?: string;
    createdAt: string;
    updatedAt: string;
    sourceTemplateId?: MarketingTemplateId;
    storyboard: Storyboard;
    progress: ProjectProgress;
}

export interface CreateCampaignProjectInput {
    title: string;
    description?: string;
    templateId: MarketingTemplateId;
}

export interface FramePosition {
    x: number;
    y: number;
}

export interface FrameBasicsPatch {
    title?: string;
    summary?: string;
}

// ─── Factory ──────────────────────────────────────────────────────────────────

export function createCampaignProject(input: CreateCampaignProjectInput): MarketingStoryboardProject {
    const id = crypto.randomUUID();
    const now = new Date().toISOString();

    const storyboard = createCampaignFromTemplate(input.templateId, {
        id: `sb-${id}`,
        title: input.title,
        description: input.description,
    });

    return {
        id,
        title: input.title,
        description: input.description,
        createdAt: now,
        updatedAt: now,
        sourceTemplateId: input.templateId,
        storyboard,
        progress: { frames: {} },
    };
}

// ─── Position update ──────────────────────────────────────────────────────────

export function updateFramePosition(
    project: MarketingStoryboardProject,
    frameId: string,
    position: FramePosition,
): MarketingStoryboardProject {
    const frameExists = project.storyboard.frames.some(f => f.id === frameId);
    if (!frameExists) return project;

    return {
        ...project,
        updatedAt: new Date().toISOString(),
        storyboard: {
            ...project.storyboard,
            frames: project.storyboard.frames.map(f =>
                f.id === frameId ? { ...f, position } : f,
            ),
        },
    };
}

// ─── Basics update ────────────────────────────────────────────────────────────

export function updateFrameBasics(
    project: MarketingStoryboardProject,
    frameId: string,
    patch: FrameBasicsPatch,
): MarketingStoryboardProject {
    const frameExists = project.storyboard.frames.some(f => f.id === frameId);
    if (!frameExists) return project;

    const defined = Object.fromEntries(
        Object.entries(patch).filter(([, v]) => v !== undefined),
    );
    if (Object.keys(defined).length === 0) return project;

    return {
        ...project,
        updatedAt: new Date().toISOString(),
        storyboard: {
            ...project.storyboard,
            frames: project.storyboard.frames.map(f =>
                f.id === frameId ? { ...f, ...defined } : f,
            ),
        },
    };
}

// ─── Progress reconciliation (DM-001) ────────────────────────────────────────
//
// Progress is keyed by item INDEX while `updateFrameContent` replaces the spec
// arrays wholesale. Without reconciliation, a reorder/insert/delete silently
// re-attaches done marks to different item texts. When a checklist or
// testCriteria array changes, we carry each done mark to the new index of the
// same item TEXT; marks whose text no longer exists are dropped. Keys stay
// index-based, so stored projects need no migration.

function arraysEqual(a: string[], b: string[]): boolean {
    return a.length === b.length && a.every((v, i) => v === b[i]);
}

/**
 * Re-key done marks from `oldItems` indices to `newItems` indices by item text.
 *
 * Two passes keep the mapping stable for duplicate texts:
 * 1. Same index + same text — unchanged positions keep their mark in place.
 * 2. Remaining done marks claim the first unclaimed exact text match, in
 *    old-index order. Unmatched marks are dropped.
 */
function reconcileItemProgress(
    oldItems: string[],
    newItems: string[],
    oldProgress: Record<string, boolean>,
): Record<string, boolean> {
    const next: Record<string, boolean> = {};
    const claimed = new Array<boolean>(newItems.length).fill(false);

    const doneIndices: number[] = [];
    for (let i = 0; i < oldItems.length; i++) {
        if (oldProgress[String(i)] === true) doneIndices.push(i);
    }

    const pending: number[] = [];

    // Pass 1 — same index, same text.
    for (const i of doneIndices) {
        if (i < newItems.length && !claimed[i] && newItems[i] === oldItems[i]) {
            claimed[i] = true;
            next[String(i)] = true;
        } else {
            pending.push(i);
        }
    }

    // Pass 2 — first unclaimed exact text match.
    for (const i of pending) {
        const text = oldItems[i];
        for (let j = 0; j < newItems.length; j++) {
            if (!claimed[j] && newItems[j] === text) {
                claimed[j] = true;
                next[String(j)] = true;
                break;
            }
        }
        // No match — the item text is gone; the done mark is dropped.
    }

    return next;
}

/**
 * Reconcile a frame's recorded progress against a content patch that may
 * replace `implementationChecklist` / `testCriteria`. Returns the project's
 * progress unchanged (same reference) when nothing needs to move.
 */
function reconcileFrameProgress(
    project: MarketingStoryboardProject,
    frameId: string,
    patch: Partial<MarketingFrameContent>,
): ProjectProgress {
    const existing = project.progress.frames[frameId];
    if (!existing) return project.progress;

    const frame = project.storyboard.frames.find(f => f.id === frameId);
    if (!frame) return project.progress;
    const content = (frame.content ?? {}) as MarketingFrameContent;

    let checklist = existing.checklist;
    if ('implementationChecklist' in patch) {
        const oldItems = content.implementationChecklist ?? [];
        const newItems = patch.implementationChecklist ?? [];
        if (!arraysEqual(oldItems, newItems)) {
            checklist = reconcileItemProgress(oldItems, newItems, existing.checklist);
        }
    }

    let testCriteria = existing.testCriteria;
    if ('testCriteria' in patch) {
        const oldItems = content.testCriteria ?? [];
        const newItems = patch.testCriteria ?? [];
        if (!arraysEqual(oldItems, newItems)) {
            testCriteria = reconcileItemProgress(oldItems, newItems, existing.testCriteria);
        }
    }

    if (checklist === existing.checklist && testCriteria === existing.testCriteria) {
        return project.progress;
    }

    return {
        ...project.progress,
        frames: {
            ...project.progress.frames,
            [frameId]: { ...existing, checklist, testCriteria },
        },
    };
}

// ─── Content update ───────────────────────────────────────────────────────────

/**
 * Return a new project with a frame's content fields partially updated.
 *
 * When the patch replaces `implementationChecklist` or `testCriteria`, the
 * frame's index-keyed progress is reconciled by item text so done marks stay
 * attached to the same items across reorder/insert/delete (DM-001).
 */
export function updateFrameContent(
    project: MarketingStoryboardProject,
    frameId: string,
    patch: Partial<MarketingFrameContent>,
): MarketingStoryboardProject {
    const frameExists = project.storyboard.frames.some(f => f.id === frameId);
    if (!frameExists) return project;

    const progress = reconcileFrameProgress(project, frameId, patch);

    return {
        ...project,
        updatedAt: new Date().toISOString(),
        progress,
        storyboard: {
            ...project.storyboard,
            frames: project.storyboard.frames.map(f =>
                f.id === frameId
                    ? { ...f, content: { ...f.content, ...patch } }
                    : f,
            ),
        },
    };
}

// ─── Progress helpers ─────────────────────────────────────────────────────────

const EMPTY_FRAME_PROGRESS: FrameProgress = { checklist: {}, testCriteria: {} };

export function getFrameProgress(
    project: MarketingStoryboardProject,
    frameId: string,
): FrameProgress {
    return project.progress.frames[frameId] ?? EMPTY_FRAME_PROGRESS;
}

export function getProjectProgress(project: MarketingStoryboardProject): ProjectProgressSummary {
    let totalChecklist = 0, doneChecklist = 0;
    let totalTests = 0, doneTests = 0;

    for (const frame of project.storyboard.frames) {
        // Normalize null/missing content to an empty spec (DM-002).
        const content = (frame.content ?? {}) as MarketingFrameContent;
        const checklist = content.implementationChecklist ?? [];
        const tests = content.testCriteria ?? [];
        const fp = project.progress.frames[frame.id] ?? EMPTY_FRAME_PROGRESS;

        totalChecklist += checklist.length;
        doneChecklist += checklist.filter((_, i) => fp.checklist[String(i)] === true).length;
        totalTests += tests.length;
        doneTests += tests.filter((_, i) => fp.testCriteria[String(i)] === true).length;
    }

    return { totalChecklist, doneChecklist, totalTests, doneTests };
}

export function setChecklistItemComplete(
    project: MarketingStoryboardProject,
    frameId: string,
    itemIndex: number,
    complete: boolean,
): MarketingStoryboardProject {
    const frameExists = project.storyboard.frames.some(f => f.id === frameId);
    if (!frameExists) return project;

    const existing = project.progress.frames[frameId] ?? EMPTY_FRAME_PROGRESS;
    return {
        ...project,
        updatedAt: new Date().toISOString(),
        progress: {
            ...project.progress,
            frames: {
                ...project.progress.frames,
                [frameId]: {
                    ...existing,
                    checklist: { ...existing.checklist, [String(itemIndex)]: complete },
                },
            },
        },
    };
}

export function setTestCriterionComplete(
    project: MarketingStoryboardProject,
    frameId: string,
    itemIndex: number,
    complete: boolean,
): MarketingStoryboardProject {
    const frameExists = project.storyboard.frames.some(f => f.id === frameId);
    if (!frameExists) return project;

    const existing = project.progress.frames[frameId] ?? EMPTY_FRAME_PROGRESS;
    return {
        ...project,
        updatedAt: new Date().toISOString(),
        progress: {
            ...project.progress,
            frames: {
                ...project.progress.frames,
                [frameId]: {
                    ...existing,
                    testCriteria: { ...existing.testCriteria, [String(itemIndex)]: complete },
                },
            },
        },
    };
}
