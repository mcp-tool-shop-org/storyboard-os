// ─── boardViewStorage.test.ts ────────────────────────────────────────────────
//
// F-a49b09c9: per-board zoom/pan persists in sessionStorage across remount.
// ─────────────────────────────────────────────────────────────────────────────

import { describe, it, expect, beforeEach, afterAll } from 'vitest';
import { loadBoardView, saveBoardView } from './boardViewStorage';

const backing = new Map<string, string>();

const fakeSessionStorage = {
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

(globalThis as Record<string, unknown>).sessionStorage = fakeSessionStorage;

beforeEach(() => {
  backing.clear();
});

afterAll(() => {
  delete (globalThis as Record<string, unknown>).sessionStorage;
});

describe('boardViewStorage', () => {
  it('round-trips a finite view for a board id', () => {
    saveBoardView('proj-1', { scale: 1.5, x: -120, y: 40 });
    expect(loadBoardView('proj-1')).toEqual({ scale: 1.5, x: -120, y: 40 });
  });

  it('returns null for a missing board', () => {
    expect(loadBoardView('never-saved')).toBeNull();
  });

  it('rejects non-finite views on save and load', () => {
    saveBoardView('bad', { scale: Number.NaN, x: 0, y: 0 });
    expect(loadBoardView('bad')).toBeNull();

    // JSON null is not a number — must not coerce to 0 and look valid.
    backing.set('rpg-sb:view:poison', JSON.stringify({ scale: 1, x: null, y: 0 }));
    expect(loadBoardView('poison')).toBeNull();
  });

  it('keeps views for different board ids independent', () => {
    saveBoardView('a', { scale: 2, x: 1, y: 2 });
    saveBoardView('b', { scale: 0.5, x: 9, y: 8 });
    expect(loadBoardView('a')).toEqual({ scale: 2, x: 1, y: 2 });
    expect(loadBoardView('b')).toEqual({ scale: 0.5, x: 9, y: 8 });
  });
});
