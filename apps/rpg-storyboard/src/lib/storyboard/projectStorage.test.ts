// ─── projectStorage.test.ts ───────────────────────────────────────────────────
//
// AP-003 receipts: readAll must never let one corrupt localStorage record
// (or a corrupt store root) wipe the whole project list.
//
// Contract under test:
//   - corrupt JSON root        → [] + STORE_UNREADABLE warning (storage untouched)
//   - non-array root           → [] + STORE_UNREADABLE warning
//   - invalid elements         → dropped; valid ones survive; RECORDS_DROPPED warning
//   - dropped records          → remain in storage untouched (reads never write,
//                                and writes preserve raw entries they can't validate)
//   - missing updatedAt        → record dropped; sort comparator never throws
//   - missing progress         → migrated to { frames: {} } (pre-2D records)
//   - fully valid store        → returned sorted, no warning
// ─────────────────────────────────────────────────────────────────────────────

import { describe, it, expect, beforeEach, afterAll } from 'vitest';
import {
  listProjects,
  getProject,
  saveProject,
  deleteProject,
  getLastReadWarning,
} from './projectStorage';
import type { RpgStoryboardProject } from '@storyboard-os/rpg-domain';

const STORAGE_KEY = 'rpg-sb:projects';

// ─── localStorage stub (vitest runs in node — no DOM) ────────────────────────

const backing = new Map<string, string>();

const fakeLocalStorage = {
  getItem: (k: string) => (backing.has(k) ? backing.get(k)! : null),
  setItem: (k: string, v: string) => {
    backing.set(k, String(v));
  },
  removeItem: (k: string) => {
    backing.delete(k);
  },
  clear: () => {
    backing.clear();
  },
  key: (i: number) => [...backing.keys()][i] ?? null,
  get length() {
    return backing.size;
  },
};

(globalThis as Record<string, unknown>).localStorage = fakeLocalStorage;

beforeEach(() => {
  backing.clear();
});

afterAll(() => {
  delete (globalThis as Record<string, unknown>).localStorage;
});

// ─── Fixtures ─────────────────────────────────────────────────────────────────

function makeProject(id: string, overrides: Partial<RpgStoryboardProject> = {}): RpgStoryboardProject {
  return {
    id,
    title: `Project ${id}`,
    createdAt: '2026-07-01T00:00:00.000Z',
    updatedAt: '2026-07-01T00:00:00.000Z',
    storyboard: {
      id: `sb-${id}`,
      title: `Board ${id}`,
      frames: [
        {
          id: `${id}-f1`,
          type: 'scene',
          title: 'Opening',
          summary: 'A beat',
          position: { x: 0, y: 0 },
          size: { width: 220, height: 120 },
          content: {},
          annotations: [],
        },
      ],
      connections: [],
    },
    progress: { frames: {} },
    ...overrides,
  } as RpgStoryboardProject;
}

function seed(raw: unknown): void {
  backing.set(STORAGE_KEY, typeof raw === 'string' ? raw : JSON.stringify(raw));
}

// ─── Corrupt store root ───────────────────────────────────────────────────────

describe('readAll — corrupt store root', () => {
  it('returns [] on unparseable JSON and reports STORE_UNREADABLE', () => {
    seed('{"definitely not valid json');
    expect(listProjects()).toEqual([]);
    const warning = getLastReadWarning();
    expect(warning).not.toBeNull();
    expect(warning!.code).toBe('STORE_UNREADABLE');
  });

  it('returns [] on a non-array root and reports STORE_UNREADABLE', () => {
    seed({ oops: 'not an array' });
    expect(listProjects()).toEqual([]);
    expect(getLastReadWarning()?.code).toBe('STORE_UNREADABLE');
  });

  it('does not modify storage when the root is corrupt', () => {
    seed('{"definitely not valid json');
    listProjects();
    expect(backing.get(STORAGE_KEY)).toBe('{"definitely not valid json');
  });
});

// ─── Per-record validation ────────────────────────────────────────────────────

describe('readAll — invalid records are dropped, valid ones survive', () => {
  it('one bad record among good ones does not nuke the list', () => {
    const good1 = makeProject('good-1');
    const good2 = makeProject('good-2');
    seed([good1, { garbage: true }, good2]);

    const projects = listProjects();
    expect(projects.map(p => p.id).sort()).toEqual(['good-1', 'good-2']);

    const warning = getLastReadWarning();
    expect(warning?.code).toBe('RECORDS_DROPPED');
    expect(warning?.dropped).toBe(1);
  });

  it('a null element does not take down its siblings', () => {
    const good = makeProject('solo');
    seed([null, good]);
    expect(listProjects().map(p => p.id)).toEqual(['solo']);
    expect(getLastReadWarning()?.dropped).toBe(1);
  });

  it('a record missing updatedAt is dropped (sort comparator never throws)', () => {
    const good = makeProject('has-date');
    const noDate = makeProject('no-date') as unknown as Record<string, unknown>;
    delete noDate.updatedAt;
    seed([noDate, good]);

    expect(() => listProjects()).not.toThrow();
    expect(listProjects().map(p => p.id)).toEqual(['has-date']);
  });

  it('a record whose storyboard has no frames array is dropped', () => {
    const good = makeProject('fine');
    const broken = makeProject('broken') as unknown as { storyboard: Record<string, unknown> };
    broken.storyboard = { id: 'x', title: 'no frames here', connections: [] };
    seed([broken, good]);
    expect(listProjects().map(p => p.id)).toEqual(['fine']);
  });

  it('a record with a corrupt frame (no content object) is dropped', () => {
    const good = makeProject('ok');
    const badFrame = makeProject('bad-frame') as unknown as {
      storyboard: { frames: Array<Record<string, unknown>> };
    };
    delete badFrame.storyboard.frames[0].content;
    seed([badFrame, good]);
    expect(listProjects().map(p => p.id)).toEqual(['ok']);
  });

  // V2-001 — createdAt is REQUIRED and is dereferenced downstream
  // (generateProjectMarkdown does `createdAt.split('T')`). A record missing it
  // must be DROPPED + flagged, not passed through to throw at render time.
  it('a record missing createdAt is dropped (handoff derefs createdAt.split)', () => {
    const good = makeProject('has-created');
    const noCreated = makeProject('no-created') as unknown as Record<string, unknown>;
    delete noCreated.createdAt;
    seed([noCreated, good]);

    expect(() => listProjects()).not.toThrow();
    expect(listProjects().map(p => p.id)).toEqual(['has-created']);
    expect(getLastReadWarning()?.code).toBe('RECORDS_DROPPED');
    expect(getLastReadWarning()?.dropped).toBe(1);
  });

  // V2-002 — connection array elements were unvalidated. A `connections: [null]`
  // record passed the predicate, then ConnectionLayer deref'd conn.fromFrameId
  // and threw mid-render. It must now DROP + surface via the ReadWarning.
  it('a record with a null connection element is dropped', () => {
    const good = makeProject('clean-conns');
    const badConn = makeProject('null-conn') as unknown as {
      storyboard: { connections: unknown[] };
    };
    badConn.storyboard.connections = [null];
    seed([badConn, good]);

    expect(listProjects().map(p => p.id)).toEqual(['clean-conns']);
    expect(getLastReadWarning()?.code).toBe('RECORDS_DROPPED');
    expect(getLastReadWarning()?.dropped).toBe(1);
  });

  it('a record with a connection missing fromFrameId is dropped', () => {
    const good = makeProject('ok-conns');
    const badConn = makeProject('partial-conn') as unknown as {
      storyboard: { connections: unknown[] };
    };
    // Missing fromFrameId — ConnectionLayer would deref undefined.fromFrameId.
    badConn.storyboard.connections = [{ id: 'c1', toFrameId: 'x', type: 'sequence' }];
    seed([badConn, good]);
    expect(listProjects().map(p => p.id)).toEqual(['ok-conns']);
    expect(getLastReadWarning()?.dropped).toBe(1);
  });

  it('a record with a well-formed connection survives', () => {
    const withConn = makeProject('with-conn') as unknown as {
      id: string;
      storyboard: { frames: Array<{ id: string }>; connections: unknown[] };
    };
    const fid = withConn.storyboard.frames[0].id;
    withConn.storyboard.connections = [
      { id: 'c1', fromFrameId: fid, toFrameId: fid, type: 'sequence', label: 'loop' },
    ];
    seed([withConn]);
    expect(listProjects().map(p => p.id)).toEqual(['with-conn']);
    expect(getLastReadWarning()).toBeNull();
  });

  it('getProject returns undefined for a dropped record', () => {
    seed([{ id: 'shell', title: 42 }]);
    expect(getProject('shell')).toBeUndefined();
  });
});

// ─── V3-002 — AP-003 dropped records stay in storage byte-for-byte ────────────

describe('readAll — dropped records are left in storage untouched (AP-003)', () => {
  it('reads [valid, invalid, valid] without rewriting the raw store', () => {
    const good1 = makeProject('keep-1');
    const good2 = makeProject('keep-2');
    // Build the raw string exactly as it will live in storage, then seed it.
    const raw = JSON.stringify([good1, { corrupt: 'record' }, good2]);
    backing.set(STORAGE_KEY, raw);

    const projects = listProjects();
    // (a) both valid projects come back
    expect(projects.map(p => p.id).sort()).toEqual(['keep-1', 'keep-2']);
    // (b) the invalid one is absent from the result
    expect(projects.some(p => (p as unknown as Record<string, unknown>).corrupt)).toBe(false);
    // (c) storage is byte-for-byte identical — the read never rewrote it
    expect(backing.get(STORAGE_KEY)).toBe(raw);

    // ...and the warning reports exactly one dropped record.
    const warning = getLastReadWarning();
    expect(warning?.code).toBe('RECORDS_DROPPED');
    expect(warning?.dropped).toBe(1);
  });
});

// ─── Migration ────────────────────────────────────────────────────────────────

describe('readAll — migration', () => {
  it('adds progress to pre-2D records that lack it', () => {
    const legacy = makeProject('legacy') as unknown as Record<string, unknown>;
    delete legacy.progress;
    seed([legacy]);
    const [p] = listProjects();
    expect(p.progress).toEqual({ frames: {} });
  });

  it('normalizes a malformed progress field instead of dropping the record', () => {
    const weird = makeProject('weird', { progress: 'huh' as never });
    seed([weird]);
    const [p] = listProjects();
    expect(p).toBeDefined();
    expect(p.progress).toEqual({ frames: {} });
  });
});

// ─── Happy path ───────────────────────────────────────────────────────────────

describe('readAll — fully valid store', () => {
  it('returns all records sorted most-recently-updated first, with no warning', () => {
    const older = makeProject('older', { updatedAt: '2026-01-01T00:00:00.000Z' });
    const newer = makeProject('newer', { updatedAt: '2026-06-01T00:00:00.000Z' });
    seed([older, newer]);
    expect(listProjects().map(p => p.id)).toEqual(['newer', 'older']);
    expect(getLastReadWarning()).toBeNull();
  });

  it('empty store yields [] with no warning', () => {
    expect(listProjects()).toEqual([]);
    expect(getLastReadWarning()).toBeNull();
  });
});

// ─── Write-path preservation ──────────────────────────────────────────────────

describe('writes — invalid raw records are preserved, not destroyed', () => {
  it('saveProject keeps unvalidatable entries in storage', () => {
    const good = makeProject('keeper');
    seed([good, { half: 'a record' }]);

    const result = saveProject(makeProject('newcomer'));
    expect(result.ok).toBe(true);

    const raw = JSON.parse(backing.get(STORAGE_KEY)!) as unknown[];
    expect(raw).toHaveLength(3); // keeper + invalid entry + newcomer
    expect(raw.some(e => (e as Record<string, unknown>)?.half === 'a record')).toBe(true);
  });

  it('saveProject replaces an existing valid record by id', () => {
    seed([makeProject('dup', { title: 'Old title' })]);
    saveProject(makeProject('dup', { title: 'New title' }));
    const projects = listProjects();
    expect(projects).toHaveLength(1);
    expect(projects[0].title).toBe('New title');
  });

  it('deleteProject removes only the target and keeps invalid entries', () => {
    seed([makeProject('a'), { junk: 1 }, makeProject('b')]);
    const result = deleteProject('a');
    expect(result.ok).toBe(true);

    const raw = JSON.parse(backing.get(STORAGE_KEY)!) as unknown[];
    expect(raw).toHaveLength(2); // junk + b
    expect(listProjects().map(p => p.id)).toEqual(['b']);
  });
});
