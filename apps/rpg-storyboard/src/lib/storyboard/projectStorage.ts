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

/**
 * Result of the most recent read from localStorage, when something was wrong.
 *
 * Mirrors the WriteResult philosophy: reads that silently swallow corruption
 * are how "all my projects vanished" bugs happen. Callers that render the
 * project list SHOULD check this after listProjects()/getProject() and show a
 * non-blocking notice when records were skipped.
 *
 * Failure modes:
 *   - STORE_UNREADABLE — the store root is unusable (unparseable JSON or a
 *     non-array root). Nothing could be returned, but the raw value is left
 *     in storage untouched.
 *   - RECORDS_DROPPED — the root parsed, but `dropped` records failed
 *     validation and were omitted from the result. They remain in storage.
 */
export interface ReadWarning {
  code: 'STORE_UNREADABLE' | 'RECORDS_DROPPED';
  message: string;
  /** How many records were skipped (0 when the whole store was unreadable). */
  dropped: number;
}

// ─── Internal helpers ─────────────────────────────────────────────────────────

let lastReadWarning: ReadWarning | null = null;

/**
 * Warning produced by the most recent read, or null if the last read was
 * clean. Recomputed on every readAll() pass — call immediately after
 * listProjects()/getProject() if you intend to surface it.
 */
export function getLastReadWarning(): ReadWarning | null {
  return lastReadWarning;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

/**
 * Validate a single frame to the depth the render path dereferences:
 * StoryboardCanvas maps `frame.position` / `frame.size` into Konva nodes and
 * badge computation reads `frame.content.*`, so a frame missing any of these
 * throws mid-render and blanks the board (AP-001).
 */
function isValidStoredFrame(value: unknown): boolean {
  if (!isRecord(value)) return false;
  const frame = value as {
    id?: unknown; type?: unknown; title?: unknown;
    position?: unknown; size?: unknown; content?: unknown;
  };
  if (typeof frame.id !== 'string' || frame.id.length === 0) return false;
  if (typeof frame.type !== 'string') return false;
  if (typeof frame.title !== 'string') return false;
  if (!isRecord(frame.content)) return false;
  const pos = frame.position as { x?: unknown; y?: unknown } | undefined;
  if (!isRecord(pos) || typeof pos.x !== 'number' || typeof pos.y !== 'number') return false;
  const size = frame.size as { width?: unknown; height?: unknown } | undefined;
  if (!isRecord(size) || typeof size.width !== 'number' || typeof size.height !== 'number') return false;
  return true;
}

/**
 * Per-record validity predicate. Checks exactly the fields the app
 * dereferences on render (ProjectList card, board canvas, handoff generator,
 * and the updatedAt sort comparator). A record failing this is DROPPED from
 * the returned list — but left in storage untouched — instead of letting one
 * corrupt record nuke every project (AP-003).
 */
function isValidStoredProject(value: unknown): value is RpgStoryboardProject {
  if (!isRecord(value)) return false;
  const p = value as {
    id?: unknown; title?: unknown; updatedAt?: unknown; storyboard?: unknown;
  };
  if (typeof p.id !== 'string' || p.id.length === 0) return false;
  if (typeof p.title !== 'string') return false;
  if (typeof p.updatedAt !== 'string') return false;
  if (!isRecord(p.storyboard)) return false;
  const sb = p.storyboard as { frames?: unknown; connections?: unknown };
  if (!Array.isArray(sb.frames)) return false;
  if (!Array.isArray(sb.connections)) return false;
  if (!sb.frames.every(isValidStoredFrame)) return false;
  return true;
}

/**
 * Migrate a project loaded from localStorage to the current shape.
 * Phase 2D: add `progress` field if missing (projects saved before 2D).
 * Null-safe: a missing OR malformed progress field is normalized to the
 * empty progress record rather than crashing (or dropping) the project —
 * progress is auxiliary; the user's board content is what must survive.
 */
function migrate(project: RpgStoryboardProject): RpgStoryboardProject {
  const progress = (project as { progress?: unknown }).progress;
  if (!isRecord(progress) || !isRecord((progress as { frames?: unknown }).frames)) {
    return { ...project, progress: { frames: {} } };
  }
  return project;
}

/**
 * Raw entries as stored — no validation, no migration. Used by the write
 * path so records we can't validate are carried through writes untouched
 * instead of being destroyed on the next save. Returns null when the store
 * root itself is unusable.
 */
function readRawEntries(): unknown[] | null {
  if (typeof localStorage === 'undefined') return null;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw === null || raw === '') return [];
    const parsed: unknown = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : null;
  } catch {
    return null;
  }
}

function readAll(): RpgStoryboardProject[] {
  lastReadWarning = null;
  if (typeof localStorage === 'undefined') return [];

  const hasStoredValue = localStorage.getItem(STORAGE_KEY) !== null;
  const entries = readRawEntries();

  if (entries === null) {
    // Unparseable JSON or non-array root. Return nothing, touch nothing.
    if (hasStoredValue) {
      lastReadWarning = {
        code: 'STORE_UNREADABLE',
        message: 'Saved projects could not be read — the browser storage entry is corrupt.',
        dropped: 0,
      };
    }
    return [];
  }

  const valid = entries.filter(isValidStoredProject);
  const dropped = entries.length - valid.length;
  if (dropped > 0) {
    lastReadWarning = {
      code: 'RECORDS_DROPPED',
      message: `${dropped} saved ${dropped === 1 ? 'project' : 'projects'} could not be read and ${dropped === 1 ? 'was' : 'were'} skipped. The data is still in browser storage, untouched.`,
      dropped,
    };
  }
  return valid.map(migrate);
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

function writeAll(entries: unknown[]): WriteResult {
  if (typeof localStorage === 'undefined') {
    return { ok: false, code: 'WRITE_FAILED', message: 'localStorage is not available in this environment' };
  }
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(entries));
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
  // Comparator is defensive even though the validator guarantees updatedAt:
  // a comparator throw inside Array.sort nukes the whole list render (AP-002).
  return readAll().sort((a, b) => (b.updatedAt ?? '').localeCompare(a.updatedAt ?? ''));
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
 *
 * Records that fail validation are carried through untouched: only a VALID
 * record with the same id is replaced. If the store root itself is corrupt
 * there is nothing machine-readable to preserve, so the write starts a fresh
 * array — refusing to write would brick saving forever.
 */
export function saveProject(project: RpgStoryboardProject): WriteResult {
  const entries = readRawEntries() ?? [];
  const kept = entries.filter(e => !(isValidStoredProject(e) && e.id === project.id));
  return writeAll([...kept, project]);
}

/**
 * Remove a project by ID. No-op if not found.
 * Returns the same WriteResult shape — a quota-exceeded delete is rare but
 * possible (the rewrite still has to land), and callers should react.
 * Invalid raw records never match by id, so they survive deletes untouched.
 */
export function deleteProject(id: string): WriteResult {
  const entries = readRawEntries() ?? [];
  return writeAll(entries.filter(e => !(isValidStoredProject(e) && e.id === id)));
}
