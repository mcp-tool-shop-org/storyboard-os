// ─── cinematic-domain / frameSignals.test.ts ─────────────────────────────────

import { describe, it, expect } from 'vitest';
import { getCinematicFrameBadges, getCinematicFrameSignal, cinematicColors } from './frameSignals';
import { statusColors, statusLabels } from '@storyboard-os/core';
import type { StoryboardFrame, CinematicFrameContent } from './schema';

function makeFrame(
  type: string,
  content: Partial<CinematicFrameContent> = {},
): StoryboardFrame {
  return {
    id: `frame-${type}`,
    type: type as any,
    title: `Test ${type}`,
    summary: `A test ${type} frame`,
    position: { x: 0, y: 0 },
    size: { width: 220, height: 140 },
    content: content as CinematicFrameContent,
    annotations: [],
  };
}

describe('getCinematicFrameBadges', () => {
  it('returns CAM badge when camera language is defined', () => {
    const frame = makeFrame('shot', { cameraAngle: 'Wide', visualDescription: 'Test' });
    const badges = getCinematicFrameBadges(frame);
    const cam = badges.find(b => b.text === 'CAM');
    expect(cam).toBeDefined();
    expect(cam!.color).toBe('#3B82F6');
  });

  it('returns VFX badge when vfxRequirements present', () => {
    const frame = makeFrame('vfx', { vfxRequirements: ['Particle system'] });
    const badges = getCinematicFrameBadges(frame);
    expect(badges.find(b => b.text === 'VFX')).toBeDefined();
  });

  it('returns SFX badge when audioRequirements present', () => {
    const frame = makeFrame('audio', { audioRequirements: ['Foley'] });
    const badges = getCinematicFrameBadges(frame);
    expect(badges.find(b => b.text === 'SFX')).toBeDefined();
  });

  it('always includes a readiness badge', () => {
    const frame = makeFrame('sequence', {});
    const badges = getCinematicFrameBadges(frame);
    const readiness = badges.find(b => ['SPEC', 'PARTIAL', 'DRAFT', 'BLOCKED'].includes(b.text));
    expect(readiness).toBeDefined();
  });

  it('DRAFT badge for empty frame', () => {
    const frame = makeFrame('sequence', {});
    const badges = getCinematicFrameBadges(frame);
    expect(badges.find(b => b.text === 'DRAFT')).toBeDefined();
  });

  it('SPEC badge for fully-specced frame', () => {
    const frame = makeFrame('shot', {
      intent: 'Test',
      visualDescription: 'Visual',
      cameraAngle: 'Wide',
      cameraMovement: 'Pan',
      framing: 'Rule of thirds',
      durationEstimate: '5s',
      requiredAssets: ['Asset'],
      continuityRequirements: ['Match'],
      implementationChecklist: ['Task'],
      testCriteria: ['Criterion'],
    });
    const badges = getCinematicFrameBadges(frame);
    expect(badges.find(b => b.text === 'SPEC')).toBeDefined();
  });

  it('no CAM badge when no camera fields', () => {
    const frame = makeFrame('edit_beat', { durationEstimate: '3s', intent: 'x' });
    const badges = getCinematicFrameBadges(frame);
    expect(badges.find(b => b.text === 'CAM')).toBeUndefined();
  });
});

// ─── cinematicColors contract (VP-001 / VP-003 refactor guard) ────────────────

describe('cinematicColors', () => {
  it('VFX is purple #A855F7 (the CARD value), NOT pink #EC4899 (VP-003)', () => {
    expect(cinematicColors.vfx).toBe('#A855F7');
    expect(cinematicColors.vfx).not.toBe('#EC4899');
  });

  it('camera and audio/sfx are each reconciled to one value', () => {
    expect(cinematicColors.camera).toBe('#3B82F6');
    expect(cinematicColors.sfx).toBe('#06B6D4');
    expect(cinematicColors.audio).toBe(cinematicColors.sfx);
  });

  it('shared readiness swatches source from core statusColors', () => {
    expect(cinematicColors.ready).toBe(statusColors.spec);
    expect(cinematicColors.partial).toBe(statusColors.partial);
    expect(cinematicColors.draft).toBe(statusColors.draft);
    expect(cinematicColors.blocked).toBe(statusColors.blocked);
  });

  it('the VFX badge output uses the purple card value, not pink', () => {
    const frame = makeFrame('vfx', { vfxRequirements: ['Particle system'] });
    const vfx = getCinematicFrameBadges(frame).find(b => b.text === 'VFX');
    expect(vfx).toBeDefined();
    expect(vfx!.color).toBe(cinematicColors.vfx);
    expect(vfx!.color).not.toBe('#EC4899');
  });

  it('a fully-specced frame renders the canonical SPEC label + spec color', () => {
    const frame = makeFrame('shot', {
      intent: 'x', visualDescription: 'v', cameraAngle: 'Wide', cameraMovement: 'Pan',
      framing: 'thirds', durationEstimate: '5s', requiredAssets: ['a'],
      continuityRequirements: ['m'], implementationChecklist: ['t'], testCriteria: ['c'],
    });
    const badge = getCinematicFrameBadges(frame).find(b => b.text === statusLabels.ready);
    expect(badge).toBeDefined();
    expect(badge!.color).toBe(statusColors.spec);
  });
});

describe('getCinematicFrameSignal', () => {
  it('returns camera summary from angle + movement + framing', () => {
    const frame = makeFrame('shot', {
      cameraAngle: 'Wide',
      cameraMovement: 'Dolly in',
      framing: 'Center',
      visualDescription: 'Test',
    });
    const signal = getCinematicFrameSignal(frame);
    expect(signal.cameraSummary).toBe('Wide · Dolly in · Center');
  });

  it('returns null cameraSummary when no camera fields', () => {
    const frame = makeFrame('edit_beat', { durationEstimate: '3s' });
    const signal = getCinematicFrameSignal(frame);
    expect(signal.cameraSummary).toBeNull();
  });

  it('detects VFX and audio presence', () => {
    const frame = makeFrame('vfx', {
      vfxRequirements: ['Particles'],
      audioRequirements: ['Boom'],
      intent: 'x',
    });
    const signal = getCinematicFrameSignal(frame);
    expect(signal.hasVfx).toBe(true);
    expect(signal.hasAudio).toBe(true);
  });

  it('detects continuity requirements', () => {
    const frame = makeFrame('shot', {
      continuityRequirements: ['Time of day'],
      visualDescription: 'x',
      intent: 'x',
    });
    const signal = getCinematicFrameSignal(frame);
    expect(signal.hasContinuity).toBe(true);
  });

  it('returns readiness level', () => {
    const frame = makeFrame('sequence', {});
    const signal = getCinematicFrameSignal(frame);
    expect(signal.readiness).toBe('draft');
  });
});
