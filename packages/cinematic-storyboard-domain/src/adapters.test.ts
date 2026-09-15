// ─── cinematic-domain / adapters.test.ts ─────────────────────────────────────
//
// Compile adapters over schema-validated ProductionBrief (F-b305f566).
// Adapter, not source of truth — no .tres/.uasset I/O.
// ─────────────────────────────────────────────────────────────────────────────

import { describe, it, expect } from 'vitest';
import { generateProductionBrief } from './handoff';
import { createCinematicStoryboard } from './templates';
import { storyboardOsLaunchTrailer } from './demo-sequence';
import { serializeProductionBriefJson, InvalidProductionBriefError } from './validateProductionBrief';
import {
  compileProductionBriefToSequencerShots,
  compileProductionBriefToGodotResources,
  ENGINE_ADAPTER_CONTRACT,
} from './adapters';

describe('compileProductionBriefToSequencerShots', () => {
  it('maps a validated brief to { name, durationSeconds, camera, continuity, vfx, audio }', () => {
    const brief = generateProductionBrief(createCinematicStoryboard('trailer_flow'));
    const compiled = compileProductionBriefToSequencerShots(brief);
    expect(compiled.kind).toBe('unreal-sequencer-shots');
    expect(compiled.contract).toBe(ENGINE_ADAPTER_CONTRACT);
    expect(compiled.contract).toMatch(/adapter, not source of truth/i);
    expect(compiled.formatVersion).toBe(brief.formatVersion);
    expect(compiled.shots).toHaveLength(brief.shots.length);
    const hook = compiled.shots[0];
    expect(hook).toEqual(expect.objectContaining({
      name: brief.shots[0].title,
      camera: brief.shots[0].camera,
      continuity: brief.shots[0].continuity,
      vfx: brief.shots[0].vfx,
      audio: brief.shots[0].audio,
    }));
    expect(typeof hook.durationSeconds).toBe('number');
    expect(hook.durationSeconds).toBeGreaterThan(0);
  });

  it('rejects a payload that fails production-brief schema validation', () => {
    expect(() => compileProductionBriefToSequencerShots({ not: 'a brief' })).toThrow(
      InvalidProductionBriefError,
    );
  });
});

describe('compileProductionBriefToGodotResources', () => {
  it('emits Godot Resource DTOs from the same validated brief', () => {
    const brief = generateProductionBrief(storyboardOsLaunchTrailer);
    const compiled = compileProductionBriefToGodotResources(brief);
    expect(compiled.kind).toBe('godot-resources');
    expect(compiled.contract).toBe(ENGINE_ADAPTER_CONTRACT);
    expect(compiled.shots).toHaveLength(brief.shots.length);
    expect(compiled.shots.every(s => typeof s.name === 'string')).toBe(true);
    expect(compiled.shots.every(s => typeof s.durationSeconds === 'number')).toBe(true);
  });

  it('does not invent engine-native file paths or replace JSON export', () => {
    const brief = generateProductionBrief(createCinematicStoryboard('cutscene_sequence'));
    const compiled = compileProductionBriefToGodotResources(brief);
    const blob = JSON.stringify(compiled);
    expect(blob.toLowerCase()).not.toContain('.tres');
    expect(blob.toLowerCase()).not.toContain('.uasset');
    expect(serializeProductionBriefJson(brief)).toContain('"formatVersion": 3');
  });
});
