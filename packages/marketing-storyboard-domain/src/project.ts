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

// ─── Content update ───────────────────────────────────────────────────────────

export function updateFrameContent(
  project: MarketingStoryboardProject,
  frameId: string,
  patch: Partial<MarketingFrameContent>,
): MarketingStoryboardProject {
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
    const checklist = frame.content.implementationChecklist ?? [];
    const tests = frame.content.testCriteria ?? [];
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
