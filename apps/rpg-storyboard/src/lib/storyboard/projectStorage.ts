// ─── projectStorage.ts ───────────────────────────────────────────────────────
//
// localStorage-backed project registry for Phase 2A.
// All project data is stored in the browser — no backend required.
//
// Storage key : 'rpg-sb:projects'
// Format      : a versioned envelope { schemaVersion, projects[] } where
//               `projects` is a JSON array of RpgStoryboardProject.
//               Legacy stores (a bare JSON array, no envelope) are read as
//               schema version 0 and migrated up on the next read/write.
//
// Schema versioning + migration (PR-001)
// ---------------------------------------
// The bare-array format had NO version marker, so any schema change that
// isn't presence-detectable would silently mis-migrate — or, worse, the
// per-record validity predicate would silently DROP the changed records as
// "invalid" = permanent data loss. The envelope fixes this:
//
//   - On read: detect the shape. A `{ schemaVersion, projects }` object reads
//     its own version; a legacy bare array is treated as version 0.
//   - Migrations run stepwise up an ordered ladder from the stored version to
//     CURRENT_SCHEMA_VERSION (v0→v1 = the pre-2D progress backfill). Adding a
//     future v1→v2 is just another ladder step.
//   - A store saved by a NEWER version (schemaVersion > CURRENT) is NOT
//     downgraded or dropped: records are returned best-effort as-is and a
//     NEWER_SCHEMA ReadWarning fires. A user who opened a newer deploy and
//     then an older one must not lose data.
//   - Migration runs BEFORE per-record validation, so the validity predicate
//     always sees current-shape records.
//   - On write: always emit the envelope at CURRENT_SCHEMA_VERSION.
//
// schemaVersion is internal to the stored shape — the public API
// (getProject/listProjects/saveProject/deleteProject) is unchanged and
// components need no changes.
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

/**
 * The schema version this build reads and writes. Bump this AND add a matching
 * ladder step in `migrations` whenever the stored project shape changes in a
 * way that isn't backward-safe by presence alone.
 */
export const CURRENT_SCHEMA_VERSION = 1;

/** Version assigned to a legacy bare-array store (no envelope). */
const LEGACY_SCHEMA_VERSION = 0;

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
 *   - STORE_UNREADABLE — the store root is unusable (unparseable JSON, or a
 *     value that is neither a bare array nor a `{ schemaVersion, projects }`
 *     envelope). Nothing could be returned, but the raw value is left in
 *     storage untouched.
 *   - RECORDS_DROPPED — the root parsed, but `dropped` records failed
 *     validation and were omitted from the result. They remain in storage.
 *   - NEWER_SCHEMA — the store was written by a newer build (its
 *     `schemaVersion` exceeds this build's CURRENT_SCHEMA_VERSION). Records are
 *     returned best-effort as-is and the raw value is left untouched — the
 *     store is NOT downgraded — so a user who opened a newer deploy then an
 *     older one does not lose data.
 */
export interface ReadWarning {
  code: 'STORE_UNREADABLE' | 'RECORDS_DROPPED' | 'NEWER_SCHEMA';
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

/**
 * Non-throwing dev-facing diagnostic (PR-002). The store is the highest-stakes
 * layer yet had zero dev signal (the canvas has F-CI-208 warns; the store had
 * none). This is ADDITIVE console.warn only — the user-facing ReadWarning
 * banner is unchanged. Fires at the store's inflection points: records dropped,
 * store unreadable, a migration ran, a newer schema encountered.
 */
function devWarn(message: string, context?: unknown): void {
  try {
    if (context === undefined) console.warn(`[projectStorage] ${message}`);
    else console.warn(`[projectStorage] ${message}`, context);
  } catch {
    // Never let a diagnostic take down a read/write.
  }
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
 * Validate a single connection to the depth the render path dereferences:
 * ConnectionLayer reads `conn.fromFrameId` / `conn.toFrameId` to resolve
 * endpoint frames and `conn.type` to pick the edge style, so a connection
 * missing any of these (or a `null` array element) throws mid-render and
 * blanks the board. The connection type is `{ id, fromFrameId, toFrameId,
 * type: string, label?: string }` — the four required fields are all strings.
 */
function isValidStoredConnection(value: unknown): boolean {
  if (!isRecord(value)) return false;
  const conn = value as {
    id?: unknown; fromFrameId?: unknown; toFrameId?: unknown; type?: unknown;
  };
  if (typeof conn.id !== 'string') return false;
  if (typeof conn.fromFrameId !== 'string') return false;
  if (typeof conn.toFrameId !== 'string') return false;
  if (typeof conn.type !== 'string') return false;
  return true;
}

/**
 * Per-record validity predicate. Checks exactly the fields the app
 * dereferences on render (ProjectList card, board canvas, handoff generator,
 * and the updatedAt sort comparator). A record failing this is DROPPED from
 * the returned list — but left in storage untouched — instead of letting one
 * corrupt record nuke every project (AP-003).
 *
 * `createdAt` is required alongside `updatedAt`: it is a required string on
 * the type and is dereferenced by the project handoff generator
 * (`createdAt.split('T')`). A record missing it would pass an id/title/
 * updatedAt-only check and then throw at handoff time (V2-001).
 */
function isValidStoredProject(value: unknown): value is RpgStoryboardProject {
  if (!isRecord(value)) return false;
  const p = value as {
    id?: unknown; title?: unknown; createdAt?: unknown; updatedAt?: unknown; storyboard?: unknown;
  };
  if (typeof p.id !== 'string' || p.id.length === 0) return false;
  if (typeof p.title !== 'string') return false;
  if (typeof p.createdAt !== 'string') return false;
  if (typeof p.updatedAt !== 'string') return false;
  if (!isRecord(p.storyboard)) return false;
  const sb = p.storyboard as { frames?: unknown; connections?: unknown };
  if (!Array.isArray(sb.frames)) return false;
  if (!Array.isArray(sb.connections)) return false;
  if (!sb.frames.every(isValidStoredFrame)) return false;
  // Connection elements are dereferenced at render — validate each, not just
  // that the container is an array, so a `[null]` element can't reach the
  // canvas and throw (V2-002).
  if (!sb.connections.every(isValidStoredConnection)) return false;
  return true;
}

/**
 * Ordered migration ladder. Each entry `migrations[n]` upgrades a project
 * array from schema version `n` to version `n + 1`. `migrateProjects()` applies
 * them stepwise from the stored version up to CURRENT_SCHEMA_VERSION, so a
 * future v1→v2 is just another entry here — that's the whole point of the
 * envelope. Steps operate on the raw array (unknown[]) because a record may be
 * pre-migration-shape; validation happens AFTER migration.
 *
 *   step 0 (v0 → v1): the pre-2D `progress` backfill. Null-safe — a missing OR
 *   malformed progress field is normalized to the empty progress record rather
 *   than crashing (or dropping) the project; progress is auxiliary, the user's
 *   board content is what must survive.
 */
const migrations: Record<number, (projects: unknown[]) => unknown[]> = {
  0: (projects) =>
    projects.map((entry) => {
      if (!isRecord(entry)) return entry; // leave non-records for the validator to drop
      const progress = (entry as { progress?: unknown }).progress;
      if (!isRecord(progress) || !isRecord((progress as { frames?: unknown }).frames)) {
        return { ...entry, progress: { frames: {} } };
      }
      return entry;
    }),
};

/**
 * Apply the ladder from `fromVersion` up to CURRENT_SCHEMA_VERSION. A missing
 * ladder step for some version is treated as a structural no-op (advance the
 * version without touching the data) so a gap can never silently drop records.
 */
function migrateProjects(projects: unknown[], fromVersion: number): unknown[] {
  let data = projects;
  for (let v = fromVersion; v < CURRENT_SCHEMA_VERSION; v++) {
    const step = migrations[v];
    data = step ? step(data) : data;
  }
  return data;
}

/**
 * The stored shape once parsed: either a legacy bare array (schemaVersion 0,
 * `projects` is the array itself) or a `{ schemaVersion, projects }` envelope.
 */
type ParsedStore =
  | { kind: 'store'; schemaVersion: number; projects: unknown[] }
  | { kind: 'unreadable' };

/**
 * Detect the on-disk shape without validating individual records:
 *   - a JSON array           → legacy v0, projects = the array
 *   - a { schemaVersion:number, projects:array } envelope → that version
 *   - anything else          → unreadable
 */
function parseStore(parsed: unknown): ParsedStore {
  if (Array.isArray(parsed)) {
    return { kind: 'store', schemaVersion: LEGACY_SCHEMA_VERSION, projects: parsed };
  }
  if (isRecord(parsed)) {
    const version = (parsed as { schemaVersion?: unknown }).schemaVersion;
    const projects = (parsed as { projects?: unknown }).projects;
    if (typeof version === 'number' && Array.isArray(projects)) {
      return { kind: 'store', schemaVersion: version, projects };
    }
  }
  return { kind: 'unreadable' };
}

/**
 * Raw project entries as stored — no per-record validation, no migration. Used
 * by the write path so records we can't validate are carried through writes
 * untouched instead of being destroyed on the next save. Unwraps the envelope
 * (or a legacy bare array) to the underlying `projects` array. Returns null
 * when the store root itself is unusable.
 */
function readRawEntries(): unknown[] | null {
  if (typeof localStorage === 'undefined') return null;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw === null || raw === '') return [];
    const store = parseStore(JSON.parse(raw));
    return store.kind === 'store' ? store.projects : null;
  } catch {
    return null;
  }
}

function readAll(): RpgStoryboardProject[] {
  lastReadWarning = null;
  if (typeof localStorage === 'undefined') return [];

  const raw = localStorage.getItem(STORAGE_KEY);
  if (raw === null || raw === '') return [];

  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch (err) {
    // Unparseable JSON. Return nothing, touch nothing.
    devWarn('store unreadable — JSON.parse failed', {
      error: err instanceof Error ? err.message : String(err),
      rawPrefix: raw.slice(0, 80),
    });
    lastReadWarning = {
      code: 'STORE_UNREADABLE',
      message: 'Saved projects could not be read — the browser storage entry is corrupt.',
      dropped: 0,
    };
    return [];
  }

  const store = parseStore(parsed);
  if (store.kind === 'unreadable') {
    // Parsed, but neither a bare array nor a { schemaVersion, projects }
    // envelope. Return nothing, touch nothing.
    devWarn('store unreadable — root is neither a bare array nor an envelope', {
      rawPrefix: raw.slice(0, 80),
    });
    lastReadWarning = {
      code: 'STORE_UNREADABLE',
      message: 'Saved projects could not be read — the browser storage entry is corrupt.',
      dropped: 0,
    };
    return [];
  }

  // "Saved by a newer version" guard: do NOT downgrade or drop. Return the
  // records best-effort as-is and surface a NEWER_SCHEMA warning. The raw store
  // is left untouched (reads never write) so the newer deploy keeps its data.
  if (store.schemaVersion > CURRENT_SCHEMA_VERSION) {
    devWarn('newer schema encountered — returning records as-is, not downgrading', {
      storedVersion: store.schemaVersion,
      currentVersion: CURRENT_SCHEMA_VERSION,
      projectCount: store.projects.length,
    });
    lastReadWarning = {
      code: 'NEWER_SCHEMA',
      message:
        'These projects were saved by a newer version of the app. They are shown as-is; ' +
        'save from this older version only if you understand it may drop newer fields.',
      dropped: 0,
    };
    // Best-effort: return everything that at least looks like a project record,
    // without dropping (a newer field must not read as "invalid" here). Cast via
    // unknown — these are newer-shape records we deliberately do not validate.
    return store.projects.filter(isRecord) as unknown as RpgStoryboardProject[];
  }

  // Migrate FIRST (stepwise up the ladder), then validate — so the validity
  // predicate always sees current-shape records.
  const migrated =
    store.schemaVersion < CURRENT_SCHEMA_VERSION
      ? migrateProjects(store.projects, store.schemaVersion)
      : store.projects;
  if (store.schemaVersion < CURRENT_SCHEMA_VERSION) {
    devWarn('migration ran', {
      fromVersion: store.schemaVersion,
      toVersion: CURRENT_SCHEMA_VERSION,
      projectCount: migrated.length,
    });
  }

  const valid = migrated.filter(isValidStoredProject);
  const dropped = migrated.length - valid.length;
  if (dropped > 0) {
    const droppedIds = migrated
      .filter((e) => !isValidStoredProject(e))
      .map((e) => (isRecord(e) && typeof e.id === 'string' ? e.id : '<no id>'));
    devWarn('records dropped during read (failed validation)', {
      dropped,
      ids: droppedIds,
    });
    lastReadWarning = {
      code: 'RECORDS_DROPPED',
      message: `${dropped} saved ${dropped === 1 ? 'project' : 'projects'} could not be read and ${dropped === 1 ? 'was' : 'were'} skipped. The data is still in browser storage, untouched.`,
      dropped,
    };
  }
  return valid;
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

/**
 * Persist the project array as a versioned envelope at CURRENT_SCHEMA_VERSION.
 * Always writes `{ schemaVersion, projects }` — never a bare array — so the
 * next read can version-detect. `entries` is unknown[] because invalid raw
 * records are carried through writes untouched (see saveProject/deleteProject).
 */
function writeAll(entries: unknown[]): WriteResult {
  if (typeof localStorage === 'undefined') {
    return { ok: false, code: 'WRITE_FAILED', message: 'localStorage is not available in this environment' };
  }
  const envelope = { schemaVersion: CURRENT_SCHEMA_VERSION, projects: entries };
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(envelope));
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
