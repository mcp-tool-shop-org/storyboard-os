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

import type {
  Storyboard,
  StoryboardTemplateId,
  FrameContent,
  FrameAnnotation,
  StoryboardFrame,
  StoryboardFrameType,
  StoryboardConnection,
  StoryboardConnectionType,
} from './schema';
import { createStoryboardFromTemplate } from './templates';
import { validateRpgStoryboard, type StoryboardValidationError } from './validate';
import {
  measureBoardDensity,
  DENSITY_SOFT_CAP,
  DENSITY_HARD_CAP,
  type BoardDensity,
} from '@storyboard-os/core';

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

/**
 * Return a new project with a frame's annotations replaced.
 *
 * Pure function. Bumps `updatedAt`. No-op on unknown frameId.
 * Annotations live on the frame (not FrameContent) so this is a separate
 * patch from `updateFrameContent`.
 */
export function updateFrameAnnotations(
  project: RpgStoryboardProject,
  frameId: string,
  annotations: FrameAnnotation[],
): RpgStoryboardProject {
  const frameExists = project.storyboard.frames.some(f => f.id === frameId);
  if (!frameExists) return project;

  return {
    ...project,
    updatedAt: new Date().toISOString(),
    storyboard: {
      ...project.storyboard,
      frames: project.storyboard.frames.map(f =>
        f.id === frameId ? { ...f, annotations } : f,
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

// ─── Topology authoring (F-e8c70228) ─────────────────────────────────────────
//
// Manual add/remove of frames and connections. Callers (the project board)
// choose every edge — these mutators never propose, fan-out, or auto-wire.
// Each successful change is validated with validateRpgStoryboard; progress
// maps are cleaned on frame delete. Density: warn at 50, refuse add at 100.

export const RPG_FRAME_TYPES: readonly StoryboardFrameType[] = [
  'hook',
  'scene',
  'choice',
  'encounter',
  'reveal',
  'npc_beat',
  'consequence',
] as const;

export const RPG_CONNECTION_TYPES: readonly StoryboardConnectionType[] = [
  'sequence',
  'choice',
  'consequence',
  'optional',
  'fallback',
] as const;

const FRAME_TYPE_SET: ReadonlySet<string> = new Set(RPG_FRAME_TYPES);
const CONNECTION_TYPE_SET: ReadonlySet<string> = new Set(RPG_CONNECTION_TYPES);

const NEW_FRAME_W = 220;
const NEW_FRAME_H = 130;
const NEW_FRAME_GAP = 280;

export type TopologyFailReason =
  | 'density_over'
  | 'validation'
  | 'unknown_frame'
  | 'unknown_connection'
  | 'last_frame'
  | 'self_loop'
  | 'duplicate_edge'
  | 'missing_endpoint'
  | 'invalid_type';

export interface TopologyOk {
  ok: true;
  project: RpgStoryboardProject;
  density: BoardDensity;
  warning?: string;
  frameId?: string;
  connectionId?: string;
}

export interface TopologyFail {
  ok: false;
  reason: TopologyFailReason;
  message: string;
  density?: BoardDensity;
  errors?: StoryboardValidationError[];
}

export type TopologyResult = TopologyOk | TopologyFail;

export interface AddFrameInput {
  type: StoryboardFrameType;
  title?: string;
  summary?: string;
  position?: FramePosition;
}

export interface AddConnectionInput {
  fromFrameId: string;
  toFrameId: string;
  type: StoryboardConnectionType;
  label?: string;
}

export interface ConnectionPatch {
  type?: StoryboardConnectionType;
  /** Pass null or '' to clear the label. Omit to leave it unchanged. */
  label?: string | null;
}

function failTopology(
  reason: TopologyFailReason,
  message: string,
  extras?: { density?: BoardDensity; errors?: StoryboardValidationError[] },
): TopologyFail {
  return { ok: false, reason, message, density: extras?.density, errors: extras?.errors };
}

function densityWarning(density: BoardDensity): string | undefined {
  if (density.level === 'over') {
    return `Board is at the ${DENSITY_HARD_CAP}-frame cap. Additional beats cannot be added.`;
  }
  if (density.level === 'warn') {
    return `Board density is high (${density.frameCount} frames). Path-finding gets harder past ${DENSITY_SOFT_CAP} frames.`;
  }
  return undefined;
}

function defaultFrameTitle(type: StoryboardFrameType): string {
  switch (type) {
    case 'hook':        return 'New Hook';
    case 'scene':       return 'New Scene';
    case 'choice':      return 'New Choice';
    case 'encounter':   return 'New Encounter';
    case 'reveal':      return 'New Reveal';
    case 'npc_beat':    return 'New NPC Beat';
    case 'consequence': return 'New Consequence';
  }
}

/** Seed type-required fields so a new beat is structurally valid (still draft). */
function defaultFrameContent(type: StoryboardFrameType): FrameContent {
  if (type === 'choice' || type === 'consequence') {
    return { stateChanges: ['Sets: author_to_specify = true'] };
  }
  if (type === 'reveal') {
    return { entryConditions: ['author_to_specify = true'] };
  }
  return {};
}

function nextFramePosition(frames: readonly StoryboardFrame[]): FramePosition {
  if (frames.length === 0) return { x: 80, y: 240 };
  let maxX = -Infinity;
  let yAtMax = 240;
  for (const frame of frames) {
    if (frame.position.x >= maxX) {
      maxX = frame.position.x;
      yAtMax = frame.position.y;
    }
  }
  return { x: maxX + NEW_FRAME_GAP, y: yAtMax };
}

/**
 * Stamp content.parentFrameId on a choice/consequence destination when the
 * source is a choice beat. Does not invent extra edges (C3: no auto-wire).
 */
function stampChoiceFanParent(
  frames: readonly StoryboardFrame[],
  fromFrameId: string,
  toFrameId: string,
  connType: StoryboardConnectionType,
): StoryboardFrame[] {
  if (connType !== 'choice' && connType !== 'consequence') return [...frames];
  const from = frames.find(f => f.id === fromFrameId);
  if (!from || from.type !== 'choice') return [...frames];
  return frames.map(f => {
    if (f.id !== toFrameId) return f;
    const content = (f.content ?? {}) as FrameContent;
    if (content.parentFrameId) return f;
    return { ...f, content: { ...content, parentFrameId: fromFrameId } };
  });
}

function omitFrameProgress(progress: ProjectProgress, frameId: string): ProjectProgress {
  if (!(frameId in progress.frames)) return progress;
  const { [frameId]: _removed, ...frames } = progress.frames;
  return { frames };
}

function commitTopology(
  project: RpgStoryboardProject,
  storyboard: Storyboard,
  progress: ProjectProgress,
  extras?: { frameId?: string; connectionId?: string },
): TopologyResult {
  const density = measureBoardDensity(storyboard);
  const validation = validateRpgStoryboard(storyboard);
  if (!validation.valid) {
    return failTopology(
      'validation',
      validation.errors[0]?.message ?? 'Storyboard is invalid after this change.',
      { density, errors: validation.errors },
    );
  }
  return {
    ok: true,
    project: {
      ...project,
      updatedAt: new Date().toISOString(),
      storyboard,
      progress,
    },
    density,
    warning: densityWarning(density),
    frameId: extras?.frameId,
    connectionId: extras?.connectionId,
  };
}

/**
 * Add a beat of the given type. Allocates a new id. Refuses when the board
 * is already at the hard density cap (100 frames). Never adds connections.
 */
export function addFrame(
  project: RpgStoryboardProject,
  input: AddFrameInput,
): TopologyResult {
  const densityNow = measureBoardDensity(project.storyboard);
  if (densityNow.level === 'over') {
    return failTopology(
      'density_over',
      `Cannot add a beat — the board is at the ${DENSITY_HARD_CAP}-frame cap.`,
      { density: densityNow },
    );
  }

  if (!FRAME_TYPE_SET.has(input.type)) {
    return failTopology('invalid_type', `Unknown frame type "${input.type}".`);
  }

  const id = `frm-${crypto.randomUUID()}`;
  const title = input.title?.trim() || defaultFrameTitle(input.type);
  const summary = input.summary?.trim() || 'Author this beat.';
  const position = input.position ?? nextFramePosition(project.storyboard.frames);

  const frame: StoryboardFrame = {
    id,
    type: input.type,
    title,
    summary,
    position,
    size: { width: NEW_FRAME_W, height: NEW_FRAME_H },
    content: defaultFrameContent(input.type),
    annotations: [],
  };

  return commitTopology(
    project,
    { ...project.storyboard, frames: [...project.storyboard.frames, frame] },
    project.progress,
    { frameId: id },
  );
}

/**
 * Remove a beat, drop connections that referenced it, and drop its progress.
 * Refuses when it is the last remaining beat (empty boards are invalid).
 */
export function removeFrame(
  project: RpgStoryboardProject,
  frameId: string,
): TopologyResult {
  const exists = project.storyboard.frames.some(f => f.id === frameId);
  if (!exists) {
    return failTopology('unknown_frame', `No beat with id "${frameId}".`);
  }
  if (project.storyboard.frames.length <= 1) {
    return failTopology(
      'last_frame',
      'Cannot delete the last beat — a board must keep at least one.',
      { density: measureBoardDensity(project.storyboard) },
    );
  }

  const frames = project.storyboard.frames.filter(f => f.id !== frameId);
  const connections = project.storyboard.connections.filter(
    c => c.fromFrameId !== frameId && c.toFrameId !== frameId,
  );
  const progress = omitFrameProgress(project.progress, frameId);

  return commitTopology(
    project,
    { ...project.storyboard, frames, connections },
    progress,
  );
}

/**
 * Add one author-specified connection. Does not propose other edges.
 */
export function addConnection(
  project: RpgStoryboardProject,
  input: AddConnectionInput,
): TopologyResult {
  if (!CONNECTION_TYPE_SET.has(input.type)) {
    return failTopology('invalid_type', `Unknown connection type "${input.type}".`);
  }
  if (input.fromFrameId === input.toFrameId) {
    return failTopology('self_loop', 'A beat cannot connect to itself.');
  }

  const fromExists = project.storyboard.frames.some(f => f.id === input.fromFrameId);
  const toExists = project.storyboard.frames.some(f => f.id === input.toFrameId);
  if (!fromExists || !toExists) {
    return failTopology(
      'missing_endpoint',
      'Both ends of a connection must be existing beats.',
    );
  }

  const duplicate = project.storyboard.connections.some(
    c => c.fromFrameId === input.fromFrameId && c.toFrameId === input.toFrameId,
  );
  if (duplicate) {
    return failTopology(
      'duplicate_edge',
      'That path already exists. Edit the existing connection instead.',
    );
  }

  const id = `conn-${crypto.randomUUID()}`;
  const label = input.label?.trim();
  const connection: StoryboardConnection = {
    id,
    fromFrameId: input.fromFrameId,
    toFrameId: input.toFrameId,
    type: input.type,
    ...(label ? { label } : {}),
  };

  return commitTopology(
    project,
    {
      ...project.storyboard,
      frames: stampChoiceFanParent(
        project.storyboard.frames,
        input.fromFrameId,
        input.toFrameId,
        input.type,
      ),
      connections: [...project.storyboard.connections, connection],
    },
    project.progress,
    { connectionId: id },
  );
}

/**
 * Patch a connection's type and/or label. Does not retarget endpoints.
 */
export function updateConnection(
  project: RpgStoryboardProject,
  connectionId: string,
  patch: ConnectionPatch,
): TopologyResult {
  const existing = project.storyboard.connections.find(c => c.id === connectionId);
  if (!existing) {
    return failTopology('unknown_connection', `No connection with id "${connectionId}".`);
  }

  if (patch.type !== undefined && !CONNECTION_TYPE_SET.has(patch.type)) {
    return failTopology('invalid_type', `Unknown connection type "${patch.type}".`);
  }

  const nextType = patch.type ?? existing.type;
  const nextLabel = 'label' in patch
    ? (patch.label?.trim() || undefined)
    : existing.label;

  if (nextType === existing.type && nextLabel === existing.label) {
    return {
      ok: true,
      project,
      density: measureBoardDensity(project.storyboard),
      connectionId,
    };
  }

  const updated: StoryboardConnection = {
    id: existing.id,
    fromFrameId: existing.fromFrameId,
    toFrameId: existing.toFrameId,
    type: nextType,
    ...(nextLabel ? { label: nextLabel } : {}),
  };

  return commitTopology(
    project,
    {
      ...project.storyboard,
      connections: project.storyboard.connections.map(c =>
        c.id === connectionId ? updated : c,
      ),
    },
    project.progress,
    { connectionId },
  );
}

/** Remove one connection. Frames are left untouched. */
export function removeConnection(
  project: RpgStoryboardProject,
  connectionId: string,
): TopologyResult {
  const exists = project.storyboard.connections.some(c => c.id === connectionId);
  if (!exists) {
    return failTopology('unknown_connection', `No connection with id "${connectionId}".`);
  }

  return commitTopology(
    project,
    {
      ...project.storyboard,
      connections: project.storyboard.connections.filter(c => c.id !== connectionId),
    },
    project.progress,
  );
}
