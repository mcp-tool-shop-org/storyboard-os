// ─── projectStorage.ts ───────────────────────────────────────────────────────
//
// localStorage-backed project registry for Phase 2A.
// All project data is stored in the browser — no backend required.
//
// Storage key : 'rpg-sb:projects'
// Format      : JSON array of RpgStoryboardProject (ordered by updatedAt desc)
//
// These functions are safe to call during SSR — they guard against
// `typeof localStorage === 'undefined'` and return empty results on the server.
// ─────────────────────────────────────────────────────────────────────────────

import type { RpgStoryboardProject } from '@storyboard-os/rpg-domain';

const STORAGE_KEY = 'rpg-sb:projects';

// ─── Internal helpers ─────────────────────────────────────────────────────────

/**
 * Migrate a project loaded from localStorage to the current shape.
 * Phase 2D: add `progress` field if missing (projects saved before 2D).
 */
function migrate(project: RpgStoryboardProject): RpgStoryboardProject {
  if (!project.progress) {
    return { ...project, progress: { frames: {} } };
  }
  return project;
}

function readAll(): RpgStoryboardProject[] {
  if (typeof localStorage === 'undefined') return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    const parsed = raw ? (JSON.parse(raw) as RpgStoryboardProject[]) : [];
    return parsed.map(migrate);
  } catch {
    return [];
  }
}

function writeAll(projects: RpgStoryboardProject[]): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(projects));
}

// ─── Public API ───────────────────────────────────────────────────────────────

/** All projects, sorted most-recently-updated first. */
export function listProjects(): RpgStoryboardProject[] {
  return readAll().sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
}

/** Single project by ID. Returns `undefined` if not found. */
export function getProject(id: string): RpgStoryboardProject | undefined {
  return readAll().find(p => p.id === id);
}

/** Insert or replace a project (upsert). */
export function saveProject(project: RpgStoryboardProject): void {
  const all = readAll().filter(p => p.id !== project.id);
  writeAll([...all, project]);
}

/** Remove a project by ID. No-op if not found. */
export function deleteProject(id: string): void {
  writeAll(readAll().filter(p => p.id !== id));
}
