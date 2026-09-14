// ─── ProductionSignalPanel — reason / health rendering ───────────────────────
//
// Domain package is mocked so this module runs without a dist build.
//
// ─────────────────────────────────────────────────────────────────────────────

import { describe, it, expect, vi } from 'vitest';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';

vi.mock('@storyboard-os/cinematic-domain', () => ({
  cinematicColors: { vfx: '#A855F7' },
}));

import ProductionSignalPanel from './ProductionSignalPanel';
import type { ProductionSignals } from '@storyboard-os/cinematic-domain';

function makeSignals(overrides: Partial<ProductionSignals> = {}): ProductionSignals {
  return {
    health: 'yellow',
    healthReason: 'empty sequence',
    continuityRisks: [],
    vfxBurden: { totalFramesWithVfx: 0, totalRequirements: 0, shots: [] },
    audioBurden: { totalFramesWithAudio: 0, totalRequirements: 0, shots: [] },
    cameraComplexity: {
      totalComplexShots: 0,
      totalStaticShots: 0,
      totalUnspecifiedShots: 0,
      totalUnknownShots: 0,
      unknownMovementSamples: [],
      complexShots: [],
    },
    durationRollup: {
      estimatedLowSeconds: 0,
      estimatedHighSeconds: 0,
      formatted: 'Unknown',
      coveredFrames: 0,
      uncoveredFrames: 0,
      unparsableSamples: [],
    },
    blockedShots: [],
    pressureSummary: ['Empty sequence — no shots to produce.'],
    ...overrides,
  };
}

describe('ProductionSignalPanel', () => {
  it('renders healthReason and humanized blocked-shot reasons', () => {
    const html = renderToStaticMarkup(
      createElement(ProductionSignalPanel, {
        signals: makeSignals({
          health: 'red',
          healthReason: '1 blocked shot',
          blockedShots: [
            {
              frameId: 'f1',
              frameTitle: 'Hook',
              reasons: ['no_visualDescription'],
            },
          ],
          pressureSummary: ['1 shot blocked — missing critical spec fields.'],
        }),
        onClose: () => {},
      }),
    );
    expect(html).toContain('1 blocked shot');
    expect(html).toContain('Visual description missing');
    expect(html).toContain('Hook');
  });

  it('uses cinematicColors.vfx (purple) for the VFX section accent', () => {
    const html = renderToStaticMarkup(
      createElement(ProductionSignalPanel, {
        signals: makeSignals({
          health: 'green',
          healthReason: 'Production-ready',
          pressureSummary: [],
          vfxBurden: {
            totalFramesWithVfx: 1,
            totalRequirements: 1,
            shots: [{ frameId: 'v1', frameTitle: 'VFX Beat', items: ['Glow'] }],
          },
          durationRollup: {
            estimatedLowSeconds: 3,
            estimatedHighSeconds: 3,
            formatted: '3s',
            coveredFrames: 1,
            uncoveredFrames: 0,
            unparsableSamples: [],
          },
        }),
        onClose: () => {},
      }),
    );
    expect(html).toContain('#A855F7');
    expect(html).not.toContain('#EC4899');
  });

  it('surfaces empty-sequence pressure copy', () => {
    const html = renderToStaticMarkup(
      createElement(ProductionSignalPanel, {
        signals: makeSignals(),
        onClose: () => {},
      }),
    );
    expect(html).toContain('empty sequence');
    expect(html).toContain('Empty sequence — no shots to produce.');
  });

  it('renders unclassified camera samples when totalComplexShots is 0', () => {
    const html = renderToStaticMarkup(
      createElement(ProductionSignalPanel, {
        signals: makeSignals({
          health: 'green',
          healthReason: 'Production-ready',
          pressureSummary: ['4 shots with unclassified camera movement — review copy.'],
          cameraComplexity: {
            totalComplexShots: 0,
            totalStaticShots: 0,
            totalUnspecifiedShots: 0,
            totalUnknownShots: 4,
            unknownMovementSamples: ['Steadicam', 'gimbal follow subject', 'slow drift', 'rack focus'],
            complexShots: [],
          },
        }),
        onClose: () => {},
      }),
    );
    expect(html).toContain('Unclassified camera (4)');
    expect(html).toContain('Steadicam');
    expect(html).toContain('gimbal follow subject');
    expect(html).toContain('slow drift');
    expect(html).toContain('rack focus');
    expect(html).not.toContain('Camera Complexity');
  });
});
