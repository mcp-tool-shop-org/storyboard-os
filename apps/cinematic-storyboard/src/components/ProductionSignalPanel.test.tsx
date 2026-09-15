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

  it('surfaces unparsable duration samples on the duration row', () => {
    const html = renderToStaticMarkup(
      createElement(ProductionSignalPanel, {
        signals: makeSignals({
          health: 'yellow',
          healthReason: 'unparsable duration estimates',
          pressureSummary: ['1 duration estimate could not be parsed (use Ns, N-Ms, N seconds, or m:ss).'],
          durationRollup: {
            estimatedLowSeconds: 0,
            estimatedHighSeconds: 0,
            formatted: 'Unknown',
            coveredFrames: 0,
            uncoveredFrames: 0,
            unparsableSamples: ['TBD', 'a beat'],
          },
        }),
        onClose: () => {},
      }),
    );
    expect(html).toContain('0 timed');
    expect(html).toContain('2 unparsed');
    expect(html).toContain('TBD');
    expect(html).toContain('a beat');
    expect(html).not.toContain('untimed');
  });

  it('sets aria-expanded on collapsible SignalSection headers', () => {
    const html = renderToStaticMarkup(
      createElement(ProductionSignalPanel, {
        signals: makeSignals({
          blockedShots: [
            { frameId: 'f1', frameTitle: 'Hook', reasons: ['no_visualDescription'] },
          ],
        }),
        onClose: () => {},
      }),
    );
    expect(html).toContain('aria-expanded="true"');
    expect(html).toContain('aria-controls="signal-section-pressure"');
    expect(html).toContain('id="signal-section-pressure"');
  });
});
