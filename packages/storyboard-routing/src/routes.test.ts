// ─── storyboard-routing / routes.test.ts ─────────────────────────────────────
//
// Tests proving:
//   1. Trailing-slash stripping on storyboardBasePath
//   2. Empty / odd base paths behave as documented
//   3. projectRoute is independent of storyboardBasePath
//   4. All id segments are URL-encoded so that traversal attempts
//      cannot escape the configured base path
//   5. README-documented examples produce the documented outputs
//
// ─────────────────────────────────────────────────────────────────────────────

import { describe, it, expect } from 'vitest';
import { createStoryboardRoutes } from './routes';

describe('createStoryboardRoutes — base path normalization', () => {
  it('keeps a clean base path verbatim', () => {
    const routes = createStoryboardRoutes({ storyboardBasePath: '/storyboards' });
    expect(routes.boardRoute('quest-01')).toBe('/storyboards/quest-01');
  });

  it('strips a single trailing slash', () => {
    const routes = createStoryboardRoutes({ storyboardBasePath: '/storyboards/' });
    expect(routes.boardRoute('quest-01')).toBe('/storyboards/quest-01');
  });

  it('accepts an empty base path', () => {
    const routes = createStoryboardRoutes({ storyboardBasePath: '' });
    expect(routes.boardRoute('quest-01')).toBe('/quest-01');
  });

  it('accepts a non-leading-slash base path verbatim (consumer choice)', () => {
    // Routes returns the base path exactly as configured (sans trailing slash).
    // Consumers are responsible for choosing a leading slash if they want
    // absolute paths. This test documents that behavior so it doesn't regress.
    const routes = createStoryboardRoutes({ storyboardBasePath: 'storyboards' });
    expect(routes.boardRoute('quest-01')).toBe('storyboards/quest-01');
  });
});

describe('createStoryboardRoutes — boardRoute', () => {
  const routes = createStoryboardRoutes({ storyboardBasePath: '/storyboards' });

  it('produces the README example', () => {
    expect(routes.boardRoute('quest-01')).toBe('/storyboards/quest-01');
  });

  it('encodes path-traversal attempts so they cannot escape base', () => {
    const out = routes.boardRoute('../admin');
    // The `..` and `/` must be percent-encoded; the result must remain a
    // path inside /storyboards/.
    expect(out.startsWith('/storyboards/')).toBe(true);
    expect(out).not.toContain('/admin');
    expect(out).toBe('/storyboards/..%2Fadmin');
  });

  it('encodes slashes inside an id so the path does not split', () => {
    const out = routes.boardRoute('q/a');
    expect(out).toBe('/storyboards/q%2Fa');
  });

  it('encodes query-string and fragment chars', () => {
    expect(routes.boardRoute('q?x=1')).toBe('/storyboards/q%3Fx%3D1');
    expect(routes.boardRoute('q#frag')).toBe('/storyboards/q%23frag');
  });

  it('encodes whitespace', () => {
    expect(routes.boardRoute('hello world')).toBe('/storyboards/hello%20world');
  });

  it('encodes unicode characters', () => {
    // 物語 → %E7%89%A9%E8%AA%9E (UTF-8)
    expect(routes.boardRoute('物語')).toBe('/storyboards/%E7%89%A9%E8%AA%9E');
  });
});

describe('createStoryboardRoutes — frameRoute', () => {
  const routes = createStoryboardRoutes({ storyboardBasePath: '/storyboards' });

  it('produces the README example', () => {
    expect(routes.frameRoute('quest-01', 'hook-arrival')).toBe(
      '/storyboards/quest-01/frames/hook-arrival',
    );
  });

  it('encodes both id segments independently', () => {
    expect(routes.frameRoute('quest-01', '../admin')).toBe(
      '/storyboards/quest-01/frames/..%2Fadmin',
    );
    expect(routes.frameRoute('../etc', 'hook')).toBe(
      '/storyboards/..%2Fetc/frames/hook',
    );
  });

  it('prevents collision between (q, a/b) and (q/a, b)', () => {
    const a = routes.frameRoute('q', 'a/b');
    const b = routes.frameRoute('q/a', 'b');
    expect(a).not.toBe(b);
    expect(a).toBe('/storyboards/q/frames/a%2Fb');
    expect(b).toBe('/storyboards/q%2Fa/frames/b');
  });
});

describe('createStoryboardRoutes — projectRoute', () => {
  it('always lives at /projects regardless of storyboardBasePath', () => {
    const a = createStoryboardRoutes({ storyboardBasePath: '/storyboards' });
    const b = createStoryboardRoutes({ storyboardBasePath: '/different' });
    const c = createStoryboardRoutes({ storyboardBasePath: '/anything-at-all/' });
    expect(a.projectRoute('p1')).toBe('/projects/p1');
    expect(b.projectRoute('p1')).toBe('/projects/p1');
    expect(c.projectRoute('p1')).toBe('/projects/p1');
  });

  it('encodes traversal attempts on projectId', () => {
    const routes = createStoryboardRoutes({ storyboardBasePath: '/storyboards' });
    const out = routes.projectRoute('../admin');
    expect(out.startsWith('/projects/')).toBe(true);
    expect(out).toBe('/projects/..%2Fadmin');
  });
});

describe('createStoryboardRoutes — bare dot segments (CR-004)', () => {
  // encodeURIComponent leaves `.` untouched, so a bare `.` or `..` id would
  // survive verbatim and normalize to the current/parent path segment,
  // escaping the configured base. Those two ids must be percent-encoded.
  const routes = createStoryboardRoutes({ storyboardBasePath: '/storyboards' });

  it('encodes a bare ".." id so it cannot normalize to the parent path', () => {
    expect(routes.boardRoute('..')).toBe('/storyboards/%2E%2E');
  });

  it('encodes a bare "." id so it cannot normalize to the current path', () => {
    expect(routes.boardRoute('.')).toBe('/storyboards/%2E');
  });

  it('encodes bare dot segments in both frameRoute positions', () => {
    expect(routes.frameRoute('..', 'hook')).toBe('/storyboards/%2E%2E/frames/hook');
    expect(routes.frameRoute('quest-01', '..')).toBe('/storyboards/quest-01/frames/%2E%2E');
    expect(routes.frameRoute('.', '.')).toBe('/storyboards/%2E/frames/%2E');
  });

  it('encodes a bare ".." projectId', () => {
    expect(routes.projectRoute('..')).toBe('/projects/%2E%2E');
  });

  it('leaves ids that merely contain dots untouched', () => {
    expect(routes.boardRoute('v1.2')).toBe('/storyboards/v1.2');
    expect(routes.boardRoute('...')).toBe('/storyboards/...');
    expect(routes.boardRoute('.hidden')).toBe('/storyboards/.hidden');
  });
});

describe('createStoryboardRoutes — multiple configs do not share state', () => {
  it('two factories with different base paths yield independent routes', () => {
    const rpg = createStoryboardRoutes({ storyboardBasePath: '/storyboards' });
    const screenplay = createStoryboardRoutes({ storyboardBasePath: '/scenes' });
    expect(rpg.boardRoute('quest-01')).toBe('/storyboards/quest-01');
    expect(screenplay.boardRoute('act-1')).toBe('/scenes/act-1');
  });
});
