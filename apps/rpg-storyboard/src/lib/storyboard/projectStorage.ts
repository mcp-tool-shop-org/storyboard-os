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
//
// Writes return a structured WriteResult so the UI can render a real failure
// state (quota exceeded, Safari private-mode, serialization failure) instead
// of silently showing a "Saved" chip when the data never actually landed.
// ─────────────────────────────────────────────────────────────────────────────

import type { RpgStoryboardProject } from '@storyboard-os/rpg-domain';

const STORAGE_KEY = 'rpg-sb:projects';

// ─── Public types ─────────────────────────────────────────────────────────────

/**
 * Result of a write to localStorage. Authoring code (and the save chip UI)
 * MUST inspect `ok` before claiming a save succeeded.
 *
 * Failure modes:
 *   - QUOTA_EXCEEDED — localStorage is full (browser-imposed cap, typically
 *     5–10 MB). Common when too many projects pile up.
 *   - WRITE_FAILED — Any other thrown error during `setItem`, including
 *     Safari private-mode (which throws on every setItem call) and JSON
 *     serialization failures.
 */
export type WriteResult =
  | { ok: true }
  | { ok: false; code: 'QUOTA_EXCEEDED'; message: string }
  | { ok: false; code: 'WRITE_FAILED'; message: string };

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

/**
 * Detect QuotaExceededError across browsers. Chrome/Edge throw a DOMException
 * with name 'QuotaExceededError'; Firefox has used 'NS_ERROR_DOM_QUOTA_REACHED'
 * historically; older WebKit used code 22. We accept all three so the UI shows
 * the right "storage full" message regardless of engine.
 */
function isQuotaError(err: unknown): boolean {
  if (!err || typeof err !== 'object') return false;
  const e = err as { name?: string; code?: number };
  return (
    e.name === 'QuotaExceededError' ||
    e.name === 'NS_ERROR_DOM_QUOTA_REACHED' ||
    e.code === 22
  );
}

function writeAll(projects: RpgStoryboardProject[]): WriteResult {
  if (typeof localStorage === 'undefined') {
    return { ok: false, code: 'WRITE_FAILED', message: 'localStorage is not available in this environment' };
  }
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(projects));
    return { ok: true };
  } catch (err) {
    if (isQuotaError(err)) {
      return {
        ok: false,
        code: 'QUOTA_EXCEEDED',
        message: 'Browser storage is full. Delete unused projects to free space.',
      };
    }
    const message = err instanceof Error ? err.message : String(err);
    return { ok: false, code: 'WRITE_FAILED', message };
  }
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

/**
 * Insert or replace a project (upsert).
 *
 * Returns a WriteResult — callers MUST inspect `.ok` and render a visible
 * failure state on `false`. Showing "Saved" on a failed write is a trust
 * violation; users can lose work without knowing.
 */
export function saveProject(project: RpgStoryboardProject): WriteResult {
  const all = readAll().filter(p => p.id !== project.id);
  return writeAll([...all, project]);
}

/**
 * Remove a project by ID. No-op if not found.
 * Returns the same WriteResult shape — a quota-exceeded delete is rare but
 * possible (the rewrite still has to land), and callers should react.
 */
export function deleteProject(id: string): WriteResult {
  return writeAll(readAll().filter(p => p.id !== id));
}
