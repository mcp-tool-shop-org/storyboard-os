// ─── CinematicFrameInspector — null-content regression ───────────────────────
//
// Domain DM-002: core validation / load can deliver null or missing content.
// Selecting such a frame must not throw (ErrorBoundary would blank the board).
// Domain package is mocked so this module runs without a dist build.
//
// ─────────────────────────────────────────────────────────────────────────────

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';

const beatStatusMock = vi.hoisted(() => ({
  getCinematicBeatStatus: vi.fn(() => ({
    level: 'draft' as 'draft' | 'ready' | 'partial' | 'blocked',
    missingReasons: [] as string[],
  })),
}));

vi.mock('@storyboard-os/cinematic-domain', () => ({
  getCinematicBeatStatus: beatStatusMock.getCinematicBeatStatus,
  getCinematicFrameSignal: () => ({
    hasVfx: false,
    hasAudio: false,
    hasContinuity: false,
    cameraSummary: null,
  }),
  cinematicColors: { vfx: '#A855F7' },
  STATUS_LABELS: { ready: 'SPEC', partial: 'PARTIAL', draft: 'DRAFT', blocked: 'BLOCKED' },
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
  beforeEach(() => {
    beatStatusMock.getCinematicBeatStatus.mockReturnValue({ level: 'draft', missingReasons: [] });
  });

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

  it('paints the VFX type chip with cinematicColors.vfx, not pink #EC4899', () => {
    const html = renderToStaticMarkup(
      createElement(CinematicFrameInspector, {
        frame: { ...makeNullContentFrame(), type: 'vfx' as const, title: 'Architecture Diagram' } as never,
        onClose: () => {},
      }),
    );
    expect(html).toContain('#A855F7');
    expect(html).not.toContain('#EC4899');
    expect(html).toContain('VFX');
  });

  it('renders structured camera row and keeps cameraAngle as author note', () => {
    const html = renderToStaticMarkup(
      createElement(CinematicFrameInspector, {
        frame: {
          ...makeNullContentFrame(),
          content: {
            shotSize: 'CU',
            lensMm: 85,
            fovDeg: 24,
            move: 'dolly',
            cameraAngle: 'Author note: low angle on the keeper',
          },
        } as never,
        onClose: () => {},
      }),
    );
    expect(html).toContain('CU');
    expect(html).toContain('85mm');
    expect(html).toContain('FOV 24°');
    expect(html).toContain('dolly');
    expect(html).toContain('Author note: low angle on the keeper');
    expect(html).toContain('Note');
    expect(html).not.toContain('turnaround');
    expect(html).not.toContain('azimuth');
    expect(html).not.toContain('35°');
  });

  it('ready copy names the ≥3 spec-field threshold, not full coverage', () => {
    beatStatusMock.getCinematicBeatStatus.mockReturnValue({ level: 'ready', missingReasons: [] });
    const html = renderToStaticMarkup(
      createElement(CinematicFrameInspector, {
        frame: makeNullContentFrame() as never,
        onClose: () => {},
      }),
    );
    expect(html).toContain('SPEC');
    expect(html).toContain('spec score ≥ 3');
    expect(html).toContain('no blockers');
    expect(html).not.toContain('full spec coverage');
  });

  it('shows nested children and an expand control for a sequence header', () => {
    const html = renderToStaticMarkup(
      createElement(CinematicFrameInspector, {
        frame: { ...makeNullContentFrame(), type: 'sequence' as const, title: 'Act I' } as never,
        onClose: () => {},
        nestedChildren: [
          { id: 's1', title: 'Hook Shot', type: 'shot' },
          { id: 's2', title: 'Feature Reveal', type: 'shot' },
        ],
        nestedKind: 'sequence',
        nestedExpanded: false,
        onToggleNested: () => {},
      }),
    );
    expect(html).toContain('Show 2 nested shots');
    expect(html).toContain('Hook Shot');
    expect(html).toContain('aria-expanded="false"');
  });
});
