// ─── handoffLoad.test.ts ─────────────────────────────────────────────────────
//
// F-9462df76: missing project vs handoff generation failure must be distinct.
// ─────────────────────────────────────────────────────────────────────────────

import { describe, it, expect } from 'vitest';
import { loadProjectHandoff } from './handoffLoad';
import type { RpgStoryboardProject, ProjectHandoff } from '@storyboard-os/rpg-domain';

function makeProject(id: string): RpgStoryboardProject {
  return {
    id,
    title: `Project ${id}`,
    createdAt: '2026-07-01T00:00:00.000Z',
    updatedAt: '2026-07-01T00:00:00.000Z',
    storyboard: {
      id: `sb-${id}`,
      title: `Board ${id}`,
      frames: [],
      connections: [],
    },
    progress: { frames: {} },
  } as RpgStoryboardProject;
}

describe('loadProjectHandoff — not-found vs generate-failed', () => {
  it('returns not_found when id is missing', () => {
    expect(loadProjectHandoff(null, () => undefined).status).toBe('not_found');
    expect(loadProjectHandoff('', () => undefined).status).toBe('not_found');
  });

  it('returns not_found when the project is absent', () => {
    const result = loadProjectHandoff('missing', () => undefined);
    expect(result.status).toBe('not_found');
  });

  it('returns ok with handoff + boardHref when generation succeeds', () => {
    const project = makeProject('p1');
    const fakeHandoff = { projectId: 'p1' } as ProjectHandoff;
    const result = loadProjectHandoff(
      'p1',
      id => (id === 'p1' ? project : undefined),
      () => fakeHandoff,
    );
    expect(result.status).toBe('ok');
    if (result.status === 'ok') {
      expect(result.handoff).toBe(fakeHandoff);
      expect(result.boardHref).toBe('/projects/board?id=p1');
    }
  });

  it('returns generate_failed (not not_found) when generate throws', () => {
    const project = makeProject('p2');
    const result = loadProjectHandoff(
      'p2',
      () => project,
      () => {
        throw new Error('boom during handoff');
      },
    );
    expect(result.status).toBe('generate_failed');
    if (result.status === 'generate_failed') {
      expect(result.message).toContain('boom during handoff');
      expect(result.boardHref).toBe('/projects/board?id=p2');
    }
  });

  it('returns store_unreadable (not not_found) when the miss is a corrupt store', () => {
    const result = loadProjectHandoff(
      'p3',
      () => undefined,
      () => { throw new Error('should not generate'); },
      () => ({ code: 'STORE_UNREADABLE' }),
    );
    expect(result.status).toBe('store_unreadable');
  });

  it('keeps not_found when the store is readable but the id is absent', () => {
    const result = loadProjectHandoff(
      'missing',
      () => undefined,
      () => { throw new Error('should not generate'); },
      () => ({ code: 'RECORDS_DROPPED' }),
    );
    expect(result.status).toBe('not_found');
  });
});
