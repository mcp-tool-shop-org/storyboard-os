// ─── CinematicFrameInspector — null-content regression ───────────────────────
//
// Domain DM-002: core validation / load can deliver null or missing content.
// Selecting such a frame must not throw (ErrorBoundary would blank the board).
// Domain package is mocked so this module runs without a dist build.
//
// ─────────────────────────────────────────────────────────────────────────────

import { describe, it, expect, vi } from 'vitest';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';

vi.mock('@storyboard-os/cinematic-domain', () => ({
  getCinematicBeatStatus: () => ({ level: 'draft', missingReasons: [] }),
  getCinematicFrameSignal: () => ({
    hasVfx: false,
    hasAudio: false,
    hasContinuity: false,
    cameraSummary: null,
  }),
  cinematicColors: { vfx: '#EC4899' },
}));

import CinematicFrameInspector from './CinematicFrameInspector';

function makeNullContentFrame() {
  return {
    id: 'f-null',
    type: 'shot' as const,
    title: 'Null Content Shot',
    summary: 'Regression fixture',
    position: { x: 0, y: 0 },
    size: { width: 220, height: 140 },
    content: null as unknown as Record<string, never>,
    annotations: [],
  };
}

describe('CinematicFrameInspector', () => {
  it('renders without throwing when frame.content is null', () => {
    expect(() => {
      renderToStaticMarkup(
        createElement(CinematicFrameInspector, {
          frame: makeNullContentFrame() as never,
          onClose: () => {},
        }),
      );
    }).not.toThrow();
  });

  it('still renders the frame title with null content', () => {
    const html = renderToStaticMarkup(
      createElement(CinematicFrameInspector, {
        frame: makeNullContentFrame() as never,
        onClose: () => {},
      }),
    );
    expect(html).toContain('Null Content Shot');
  });
});
