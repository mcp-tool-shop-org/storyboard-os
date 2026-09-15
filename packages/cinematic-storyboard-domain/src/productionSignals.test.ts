// ─── Cinematic Domain — Production Signals Tests ─────────────────────────────

import { describe, it, expect } from 'vitest';
import { getSequenceProductionSignals, classifyCameraMove } from './productionSignals';
import type { Storyboard } from './schema';
import { storyboardOsLaunchTrailer } from './demo-sequence';

// ─── Test fixtures ────────────────────────────────────────────────────────────

function makeStoryboard(overrides: Partial<Storyboard> = {}): Storyboard {
  return {
    id: 'test-seq',
    title: 'Test Sequence',
    frames: [],
    connections: [],
    ...overrides,
  };
}

function makeFrame(id: string, overrides: Record<string, unknown> = {}) {
  return {
    id,
    type: 'shot' as const,
    title: `Frame ${id}`,
    summary: '',
    position: { x: 0, y: 0 },
    size: { width: 220, height: 140 },
    content: {},
    annotations: [],
    ...overrides,
  };
}

// ─── Tests ────────────────────────────────────────────────────────────────────

describe('classifyCameraMove', () => {
  it('classifies from the structured token, not regex-on-prose', () => {
    expect(classifyCameraMove(undefined)).toBe('unspecified');
    expect(classifyCameraMove('')).toBe('unspecified');
    expect(classifyCameraMove('static')).toBe('static');
    expect(classifyCameraMove('dolly')).toBe('complex');
    expect(classifyCameraMove('arc')).toBe('complex');
    expect(classifyCameraMove('orbit')).toBe('complex');
    expect(classifyCameraMove('steadicam')).toBe('complex');
    expect(classifyCameraMove('Slow pan or static hold')).toBe('unknown');
    expect(classifyCameraMove('azimuth')).toBe('unknown');
    expect(classifyCameraMove('turnaround')).toBe('unknown');
  });
});

describe('getSequenceProductionSignals', () => {
  it('returns yellow health for an empty sequence (not Production-ready)', () => {
    const signals = getSequenceProductionSignals(makeStoryboard());
    expect(signals.health).toBe('yellow');
    expect(signals.healthReason).toBe('empty sequence');
    expect(signals.pressureSummary.some(s => /empty sequence/i.test(s))).toBe(true);
  });

  it('returns green health for a fully-specced sequence', () => {
    const sb = makeStoryboard({
      frames: [
        makeFrame('a', {
          content: {
            intent: 'Hook',
            visualDescription: 'Explosion',
            cameraAngle: 'Wide',
            cameraMovement: 'Static',
            durationEstimate: '3s',
            requiredAssets: ['Explosion VFX'],
            implementationChecklist: ['Record'],
            testCriteria: ['Looks good'],
          },
        }),
      ],
    });
    const signals = getSequenceProductionSignals(sb);
    expect(signals.health).toBe('green');
    expect(signals.blockedShots).toHaveLength(0);
  });

  it('detects blocked shots and returns red health', () => {
    // 'shot' type blocks on visualDescription
    const sb = makeStoryboard({
      frames: [
        makeFrame('blocked-1', {
          type: 'shot',
          content: { intent: 'Partial spec without visual' },
        }),
      ],
    });
    const signals = getSequenceProductionSignals(sb);
    expect(signals.health).toBe('red');
    expect(signals.blockedShots).toHaveLength(1);
    expect(signals.blockedShots[0].frameId).toBe('blocked-1');
    expect(signals.blockedShots[0].reasons).toContain('no_visualDescription');
  });

  it('computes VFX burden', () => {
    const sb = makeStoryboard({
      frames: [
        makeFrame('v1', { content: { vfxRequirements: ['Motion blur', 'Color grade'] } }),
        makeFrame('v2', { content: { vfxRequirements: ['Particles'] } }),
        makeFrame('v3', { content: {} }),
      ],
    });
    const signals = getSequenceProductionSignals(sb);
    expect(signals.vfxBurden.totalFramesWithVfx).toBe(2);
    expect(signals.vfxBurden.totalRequirements).toBe(3);
    expect(signals.vfxBurden.shots).toHaveLength(2);
  });

  it('computes audio burden', () => {
    const sb = makeStoryboard({
      frames: [
        makeFrame('a1', { content: { audioRequirements: ['VO', 'Music bed', 'SFX whoosh'] } }),
        makeFrame('a2', { content: { audioRequirements: ['Ambient'] } }),
      ],
    });
    const signals = getSequenceProductionSignals(sb);
    expect(signals.audioBurden.totalFramesWithAudio).toBe(2);
    expect(signals.audioBurden.totalRequirements).toBe(4);
  });

  it('computes camera complexity from structured move, not prose', () => {
    const sb = makeStoryboard({
      frames: [
        makeFrame('c1', { content: { move: 'track', cameraMovement: 'Tracking shot', cameraAngle: 'Low' } }),
        makeFrame('c2', { content: { move: 'crane', cameraMovement: 'Crane up' } }),
        makeFrame('c3', { content: { cameraAngle: 'Wide', cameraMovement: 'dolly in' } }), // unspecified (no move)
      ],
    });
    const signals = getSequenceProductionSignals(sb);
    expect(signals.cameraComplexity.totalComplexShots).toBe(2);
    expect(signals.cameraComplexity.totalStaticShots).toBe(0);
    expect(signals.cameraComplexity.totalUnspecifiedShots).toBe(1);
    expect(signals.cameraComplexity.complexShots[0].movement).toBe('track');
    expect(signals.cameraComplexity.complexShots[0].shotSize).toBeUndefined();
  });

  it('treats move: "static" as a static shot; prose does not classify', () => {
    const sb = makeStoryboard({
      frames: [
        makeFrame('s1', { content: { move: 'static', cameraMovement: 'Static' } }),
        makeFrame('s2', { content: { move: 'static', cameraMovement: 'Static then slow zoom into center frame' } }),
        makeFrame('s3', { content: { move: 'static' } }),
        makeFrame('s4', { content: { move: 'static', cameraMovement: 'locked off' } }),
        makeFrame('s5', { content: { move: 'pan', cameraMovement: 'Slow pan or static hold' } }),
      ],
    });
    const signals = getSequenceProductionSignals(sb);
    expect(signals.cameraComplexity.totalStaticShots).toBe(4);
    expect(signals.cameraComplexity.totalComplexShots).toBe(1);
    expect(signals.cameraComplexity.complexShots[0].movement).toBe('pan');
  });

  it('does not count unknown move tokens as static; orbit aliases arc', () => {
    const sb = makeStoryboard({
      frames: [
        makeFrame('u1', { content: { move: 'steadicam' } }),
        makeFrame('u2', { content: { move: 'gimbal' as never, cameraMovement: 'gimbal follow subject' } }),
        makeFrame('u3', { content: { move: 'drift' as never } }),
        makeFrame('u4', { content: { move: 'rack' as never } }),
        makeFrame('u5', { content: { move: 'static' } }),
        makeFrame('u6', { content: {} }),
        makeFrame('u7', { content: { move: 'orbit' as never } }),
      ],
    });
    const signals = getSequenceProductionSignals(sb);
    expect(signals.cameraComplexity.totalStaticShots).toBe(1);
    expect(signals.cameraComplexity.totalUnspecifiedShots).toBe(1);
    expect(signals.cameraComplexity.totalUnknownShots).toBe(3);
    expect(signals.cameraComplexity.totalComplexShots).toBe(2);
    expect(signals.cameraComplexity.complexShots.map(s => s.movement)).toEqual(
      expect.arrayContaining(['steadicam', 'arc']),
    );
    expect(signals.cameraComplexity.unknownMovementSamples).toEqual(
      expect.arrayContaining(['gimbal', 'drift', 'rack']),
    );
  });

  it('computes duration rollup', () => {
    const sb = makeStoryboard({
      frames: [
        makeFrame('d1', { content: { durationEstimate: '3s' } }),
        makeFrame('d2', { content: { durationEstimate: '5-8s' } }),
        makeFrame('d3', { content: {} }), // uncovered
      ],
    });
    const signals = getSequenceProductionSignals(sb);
    expect(signals.durationRollup.estimatedLowSeconds).toBe(8);
    expect(signals.durationRollup.estimatedHighSeconds).toBe(11);
    expect(signals.durationRollup.formatted).toBe('8–11s');
    expect(signals.durationRollup.coveredFrames).toBe(2);
    expect(signals.durationRollup.uncoveredFrames).toBe(1);
  });

  it('parses broader durationEstimate forms (seconds / bare / m:ss)', () => {
    const sb = makeStoryboard({
      frames: [
        makeFrame('d1', { content: { durationEstimate: '3 seconds' } }),
        makeFrame('d2', { content: { durationEstimate: '90' } }),
        makeFrame('d3', { content: { durationEstimate: '1:30' } }),
        makeFrame('d4', { content: { durationEstimate: '2-4 sec' } }),
      ],
    });
    const signals = getSequenceProductionSignals(sb);
    expect(signals.durationRollup.coveredFrames).toBe(4);
    expect(signals.durationRollup.estimatedLowSeconds).toBe(3 + 90 + 90 + 2);
    expect(signals.durationRollup.estimatedHighSeconds).toBe(3 + 90 + 90 + 4);
    expect(signals.durationRollup.unparsableSamples).toHaveLength(0);
  });

  it('computes continuity risks from frame requirements', () => {
    const sb = makeStoryboard({
      frames: [
        makeFrame('cr1', { content: { continuityRequirements: ['Match lighting from previous shot'] } }),
        makeFrame('cr2', { content: {} }),
      ],
    });
    const signals = getSequenceProductionSignals(sb);
    expect(signals.continuityRisks).toHaveLength(1);
    expect(signals.continuityRisks[0].frameId).toBe('cr1');
    expect(signals.continuityRisks[0].requirements).toHaveLength(1);
  });

  it('computes continuity risks from connection links', () => {
    const sb = makeStoryboard({
      frames: [
        makeFrame('cr1', { content: {} }),
        makeFrame('cr2', { content: {} }),
      ],
      connections: [
        { id: 'conn-1', fromFrameId: 'cr1', toFrameId: 'cr2', type: 'continuity' as const },
      ],
    });
    const signals = getSequenceProductionSignals(sb);
    expect(signals.continuityRisks).toHaveLength(2);
    expect(signals.continuityRisks[0].linkedFrameIds).toContain('cr2');
    expect(signals.continuityRisks[1].linkedFrameIds).toContain('cr1');
  });

  it('returns yellow health for missing durations', () => {
    const sb = makeStoryboard({
      frames: [
        makeFrame('y1', { content: { visualDescription: 'Something', intent: 'Hook', cameraAngle: 'Wide', cameraMovement: 'Static' } }),
      ],
    });
    const signals = getSequenceProductionSignals(sb);
    // Not blocked (enough spec for 'ready' status), but missing duration → yellow
    expect(signals.health).toBe('yellow');
    expect(signals.healthReason).toContain('missing duration');
  });

  it('does not treat unparsable durationEstimate "TBD" as missing', () => {
    const sb = makeStoryboard({
      frames: [
        makeFrame('tbd', {
          content: {
            intent: 'Hook',
            visualDescription: 'Explosion',
            cameraAngle: 'Wide',
            cameraMovement: 'Static',
            durationEstimate: 'TBD',
          },
        }),
      ],
    });
    const signals = getSequenceProductionSignals(sb);
    expect(signals.durationRollup.uncoveredFrames).toBe(0);
    expect(signals.durationRollup.coveredFrames).toBe(0);
    expect(signals.durationRollup.unparsableSamples).toEqual(['TBD']);
    expect(signals.pressureSummary.some(s => /missing duration/i.test(s))).toBe(false);
    expect(signals.pressureSummary.some(s => /could not be parsed/i.test(s))).toBe(true);
    expect(signals.healthReason).not.toContain('missing duration');
    expect(signals.healthReason).toContain('unparsable duration');
    expect(signals.health).toBe('yellow');
  });

  it('builds a pressure summary with multiple signals', () => {
    const sb = makeStoryboard({
      frames: [
        makeFrame('p1', {
          type: 'shot',
          content: { intent: 'Something', vfxRequirements: ['A', 'B', 'C', 'D'], audioRequirements: ['X', 'Y', 'Z', 'W'] },
        }),
      ],
    });
    const signals = getSequenceProductionSignals(sb);
    // Should mention blocked (no visualDescription for shot type), VFX, audio
    expect(signals.pressureSummary.length).toBeGreaterThan(0);
    expect(signals.pressureSummary.some(s => s.includes('blocked'))).toBe(true);
  });

  it('produces meaningful signals for the demo launch trailer', () => {
    const signals = getSequenceProductionSignals(storyboardOsLaunchTrailer);

    // The demo has 8 frames with rich production spec
    expect(signals.durationRollup.coveredFrames).toBe(8);
    expect(signals.durationRollup.estimatedLowSeconds).toBeGreaterThan(0);

    // Demo has VFX frames
    expect(signals.vfxBurden.totalFramesWithVfx).toBeGreaterThan(0);

    // Demo has audio requirements
    expect(signals.audioBurden.totalFramesWithAudio).toBeGreaterThan(0);

    // Demo has camera movement
    expect(signals.cameraComplexity.totalComplexShots).toBeGreaterThan(0);

    // Demo has continuity requirements
    expect(signals.continuityRisks.length).toBeGreaterThan(0);

    // Pressure summary should have content
    expect(signals.pressureSummary.length).toBeGreaterThan(0);
  });
});
