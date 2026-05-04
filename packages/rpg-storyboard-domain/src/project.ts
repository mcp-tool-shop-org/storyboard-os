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

/**
 * Return a new project with a frame's content fields partially updated.
 *
 * Pure function. Merges the patch into the existing content — fields not in
 * the patch are preserved. Bumps `updatedAt`. No-op on unknown frameId.
 */
export function updateFrameContent(
  project: RpgStoryboardProject,
  frameId: string,
  patch: Partial<FrameContent>,
): RpgStoryboardProject {
  const frameExists = project.storyboard.frames.some(f => f.id === frameId);
  if (!frameExists) return project;

  return {
    ...project,
    updatedAt: new Date().toISOString(),
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
    const checklist = frame.content.implementationChecklist ?? [];
    const tests     = frame.content.testCriteria ?? [];
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
