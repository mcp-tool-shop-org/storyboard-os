// ─── rpg-storyboard-domain / project.ts ─────────────────────────────────────
//
// RpgStoryboardProject — a durable user-created project built from a template.
//
// The project model wraps a Storyboard with authoring metadata: provenance
// (which template it came from), creation + update timestamps, and a stable
// project-level ID that is separate from the storyboard ID.
//
// Storage is not the domain's concern. The app layer persists projects.
// ─────────────────────────────────────────────────────────────────────────────

import type { Storyboard, StoryboardTemplateId, FrameContent } from './schema';
import { createStoryboardFromTemplate } from './templates';

// ─── Progress types ───────────────────────────────────────────────────────────

/**
 * Completion state for a single frame's checklist and test criteria.
 * Keyed by item index (as string). Sparse — only checked entries need be stored.
 */
export interface FrameProgress {
  checklist: Record<string, boolean>;
  testCriteria: Record<string, boolean>;
}

/** Project-wide progress — one FrameProgress per frame that has any progress. */
export interface ProjectProgress {
  frames: Record<string, FrameProgress>;
}

/** Aggregated completion counts across all frames in a project. */
export interface ProjectProgressSummary {
  totalChecklist: number;
  doneChecklist: number;
  totalTests: number;
  doneTests: number;
}

// ─── Types ───────────────────────────────────────────────────────────────────

/** A durable user-created RPG storyboard project. */
export interface RpgStoryboardProject {
  /** Stable project identifier. Separate from the storyboard ID. */
  id: string;
  title: string;
  description?: string;
  /** ISO 8601 datetime string — when the project was created. */
  createdAt: string;
  /** ISO 8601 datetime string — last time the project was modified. */
  updatedAt: string;
  /** The template this project was generated from, if any. */
  sourceTemplateId?: StoryboardTemplateId;
  /** The generated storyboard. In Phase 2B+ this becomes editable. */
  storyboard: Storyboard;
  /**
   * Completion state for implementation checklists and test criteria.
   * Stored separately from spec content — checking off a task never
   * mutates the underlying checklist text.
   */
  progress: ProjectProgress;
}

export interface CreateProjectInput {
  title: string;
  description?: string;
  templateId: StoryboardTemplateId;
}

// ─── Factory ─────────────────────────────────────────────────────────────────

// ─── Position type ────────────────────────────────────────────────────────────

export interface FramePosition {
  x: number;
  y: number;
}

// ─── Factory ─────────────────────────────────────────────────────────────────

/**
 * Create a new RPG storyboard project from a template.
 *
 * Generates a unique project ID via `crypto.randomUUID()`, derives a
 * storyboard ID from it (`sb-{projectId}`), runs the template generator,
 * and wraps the output in a project envelope with authoring metadata.
 *
 * Storage is the caller's responsibility — this function only creates the
 * in-memory project object.
 */
export function createProject(input: CreateProjectInput): RpgStoryboardProject {
  const id = crypto.randomUUID();
  const now = new Date().toISOString();

  const storyboard = createStoryboardFromTemplate(input.templateId, {
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

// ─── Basics patch ────────────────────────────────────────────────────────────

export interface FrameBasicsPatch {
  title?: string;
  summary?: string;
}

// ─── Position update ──────────────────────────────────────────────────────────

/**
 * Return a new project with one frame's position updated.
 *
 * Pure function — does not mutate the original project. Bumps `updatedAt`.
 * If `frameId` does not exist in the project's storyboard, the project is
 * returned unchanged (no error, no mutation).
 */
export function updateFramePosition(
  project: RpgStoryboardProject,
  frameId: string,
  position: FramePosition,
): RpgStoryboardProject {
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

// ─── Content update ───────────────────────────────────────────────────────────

/**
 * Return a new project with a frame's title and/or summary updated.
 *
 * Pure function. Bumps `updatedAt`. No-op on unknown frameId.
 * Undefined fields in the patch are ignored (they do not overwrite existing values).
 */
export function updateFrameBasics(
  project: RpgStoryboardProject,
  frameId: string,
  patch: FrameBasicsPatch,
): RpgStoryboardProject {
  const frameExists = project.storyboard.frames.some(f => f.id === frameId);
  if (!frameExists) return project;

  // Filter out undefined values so they do not overwrite existing data.
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
  project: RpgStoryboardProject,
  frameId: string,
  patch: Partial<FrameContent>,
): ProjectProgress {
  const existing = project.progress.frames[frameId];
  if (!existing) return project.progress;

  const frame = project.storyboard.frames.find(f => f.id === frameId);
  if (!frame) return project.progress;
  const content = (frame.content ?? {}) as FrameContent;

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
    frames: {
      ...project.progress.frames,
      [frameId]: { ...existing, checklist, testCriteria },
    },
  };
}

/**
 * Return a new project with a frame's content fields partially updated.
 *
 * Pure function. Merges the patch into the existing content — fields not in
 * the patch are preserved. Bumps `updatedAt`. No-op on unknown frameId.
 *
 * When the patch replaces `implementationChecklist` or `testCriteria`, the
 * frame's index-keyed progress is reconciled by item text so done marks stay
 * attached to the same items across reorder/insert/delete (DM-001).
 */
export function updateFrameContent(
  project: RpgStoryboardProject,
  frameId: string,
  patch: Partial<FrameContent>,
): RpgStoryboardProject {
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

/** Internal helper — empty FrameProgress sentinel. */
const EMPTY_FRAME_PROGRESS: FrameProgress = { checklist: {}, testCriteria: {} };

/**
 * Return the recorded progress for a specific frame.
 * Returns an empty FrameProgress if no progress has been recorded yet.
 */
export function getFrameProgress(
  project: RpgStoryboardProject,
  frameId: string,
): FrameProgress {
  return project.progress.frames[frameId] ?? EMPTY_FRAME_PROGRESS;
}

/**
 * Return aggregated completion counts across all frames in the project.
 * Uses item indices to correlate progress keys with spec arrays.
 */
export function getProjectProgress(project: RpgStoryboardProject): ProjectProgressSummary {
  let totalChecklist = 0, doneChecklist = 0;
  let totalTests = 0,     doneTests = 0;

  for (const frame of project.storyboard.frames) {
    // Normalize null/missing content to an empty spec (DM-002).
    const content   = (frame.content ?? {}) as FrameContent;
    const checklist = content.implementationChecklist ?? [];
    const tests     = content.testCriteria ?? [];
    const fp        = project.progress.frames[frame.id] ?? EMPTY_FRAME_PROGRESS;

    totalChecklist += checklist.length;
    doneChecklist  += checklist.filter((_, i) => fp.checklist[String(i)] === true).length;
    totalTests     += tests.length;
    doneTests      += tests.filter((_, i) => fp.testCriteria[String(i)] === true).length;
  }

  return { totalChecklist, doneChecklist, totalTests, doneTests };
}

/**
 * Return a new project with one implementation checklist item toggled.
 *
 * Pure function. Bumps `updatedAt`. No-op on unknown frameId.
 * The spec text in `implementationChecklist` is never modified — only the
 * progress record changes.
 */
export function setChecklistItemComplete(
  project: RpgStoryboardProject,
  frameId: string,
  itemIndex: number,
  complete: boolean,
): RpgStoryboardProject {
  const frameExists = project.storyboard.frames.some(f => f.id === frameId);
  if (!frameExists) return project;

  const existing = project.progress.frames[frameId] ?? EMPTY_FRAME_PROGRESS;
  return {
    ...project,
    updatedAt: new Date().toISOString(),
    progress: {
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

/**
 * Return a new project with one test criterion toggled.
 *
 * Pure function. Bumps `updatedAt`. No-op on unknown frameId.
 * The spec text in `testCriteria` is never modified — only the progress record changes.
 */
export function setTestCriterionComplete(
  project: RpgStoryboardProject,
  frameId: string,
  itemIndex: number,
  complete: boolean,
): RpgStoryboardProject {
  const frameExists = project.storyboard.frames.some(f => f.id === frameId);
  if (!frameExists) return project;

  const existing = project.progress.frames[frameId] ?? EMPTY_FRAME_PROGRESS;
  return {
    ...project,
    updatedAt: new Date().toISOString(),
    progress: {
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
