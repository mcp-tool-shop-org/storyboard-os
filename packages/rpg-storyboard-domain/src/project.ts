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

import type { Storyboard, StoryboardTemplateId } from './schema';
import { createStoryboardFromTemplate } from './templates';

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
}

export interface CreateProjectInput {
  title: string;
  description?: string;
  templateId: StoryboardTemplateId;
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
  };
}
