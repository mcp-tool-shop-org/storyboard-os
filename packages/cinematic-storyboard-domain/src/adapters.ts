// ─── cinematic-domain / adapters.ts ──────────────────────────────────────────
//
// Downstream compile adapters over a schema-validated ProductionBrief.
// C4: Markdown + JSON is the portable contract. These DTOs are execution
// artifacts for Unreal Sequencer / Godot Resource importers — never the
// authoring source of truth, never .uasset/.tres writes, never plugins.
//
// ─────────────────────────────────────────────────────────────────────────────

import type { ProductionBrief, ProductionBriefCamera, ProductionBriefShot } from './handoff';
import { parseDurationSeconds } from './productionSignals';
import {
  assertValidProductionBrief,
  InvalidProductionBriefError,
} from './validateProductionBrief';

export { InvalidProductionBriefError };

/**
 * Adapter, not source of truth. Authoring remains schema-validated
 * ProductionBrief JSON (and its Markdown twin). Engine-native files
 * (.tres / .uasset) compile from these DTOs in a downstream tool — this
 * package does not write them and does not replace Markdown/JSON export.
 */
export const ENGINE_ADAPTER_CONTRACT =
  'adapter, not source of truth — ProductionBrief JSON is the authored contract; Sequencer/Godot DTOs compile from a schema-validated brief and must not be round-tripped as the board';

export interface EngineShotDto {
  name: string;
  durationSeconds: number;
  camera: ProductionBriefCamera | null;
  continuity: string[];
  vfx: string[];
  audio: string[];
}

export interface SequencerShotList {
  contract: typeof ENGINE_ADAPTER_CONTRACT;
  kind: 'unreal-sequencer-shots';
  title: string;
  formatVersion: number;
  shots: EngineShotDto[];
}

export interface GodotResourceList {
  contract: typeof ENGINE_ADAPTER_CONTRACT;
  kind: 'godot-resources';
  title: string;
  formatVersion: number;
  shots: EngineShotDto[];
}

function requireValidBrief(input: unknown): ProductionBrief {
  assertValidProductionBrief(input);
  return input as ProductionBrief;
}

function compileShotDto(shot: ProductionBriefShot): EngineShotDto {
  return {
    name: shot.title,
    durationSeconds: parseDurationSeconds(shot.duration ?? undefined) ?? 0,
    camera: shot.camera,
    continuity: [...(shot.continuity ?? [])],
    vfx: [...(shot.vfx ?? [])],
    audio: [...(shot.audio ?? [])],
  };
}

/**
 * Map a validated ProductionBrief to Unreal Sequencer shot DTOs.
 * Pure function — no file I/O, no editor plugin, no .uasset writes.
 */
export function compileProductionBriefToSequencerShots(input: unknown): SequencerShotList {
  const brief = requireValidBrief(input);
  return {
    contract: ENGINE_ADAPTER_CONTRACT,
    kind: 'unreal-sequencer-shots',
    title: brief.title,
    formatVersion: brief.formatVersion,
    shots: brief.shots.map(compileShotDto),
  };
}

/**
 * Map a validated ProductionBrief to Godot Resource DTOs.
 * Pure function — no file I/O, no editor plugin, no .tres writes.
 */
export function compileProductionBriefToGodotResources(input: unknown): GodotResourceList {
  const brief = requireValidBrief(input);
  return {
    contract: ENGINE_ADAPTER_CONTRACT,
    kind: 'godot-resources',
    title: brief.title,
    formatVersion: brief.formatVersion,
    shots: brief.shots.map(compileShotDto),
  };
}
