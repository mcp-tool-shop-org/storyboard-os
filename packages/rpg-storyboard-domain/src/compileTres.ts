// ─── rpg-domain / compileTres.ts ─────────────────────────────────────────────
//
// One-way Godot Resource (.tres) compile of schema-valid handoff JSON.
// combatSpec / ability Resource fields are the payload. There is no parser
// from .tres back into Storyboard/FrameContent, and callers must not persist
// the result in localStorage.
//
// ─────────────────────────────────────────────────────────────────────────────

import type { CombatSpec } from './schema';
import type { HandoffBeat } from './handoff';
import { isEmptyCombatSpec, normalizeCombatSpec } from './combatSpec';
import { isProjectHandoff, requireSchemaValidHandoff } from './compileGate';

function gdString(value: string): string {
  return `"${value.replace(/\\/g, '\\\\').replace(/"/g, '\\"').replace(/\n/g, '\\n')}"`;
}

function gdIdent(raw: string, fallback: string): string {
  const cleaned = raw.replace(/[^A-Za-z0-9_]/g, '_').replace(/^_+|_+$/g, '');
  const base = cleaned || fallback;
  return /^[0-9]/.test(base) ? `id_${base}` : base.slice(0, 64);
}

interface EncounterCombat {
  beat: HandoffBeat;
  spec: CombatSpec;
}

function encounterCombats(beats: HandoffBeat[]): EncounterCombat[] {
  const out: EncounterCombat[] = [];
  for (const beat of beats) {
    if (beat.type !== 'encounter') continue;
    const spec = normalizeCombatSpec(beat.combatSpec);
    if (spec === undefined) continue;
    out.push({ beat, spec });
  }
  return out;
}

function uniqueAbilities(combats: EncounterCombat[]): Array<{ key: string; id: string; ap?: number }> {
  const seen = new Map<string, { key: string; id: string; ap?: number }>();
  for (const { spec } of combats) {
    const ability = spec.ability;
    if (!ability) continue;
    if (seen.has(ability.id)) continue;
    seen.set(ability.id, {
      key: gdIdent(ability.id, `ability_${seen.size + 1}`),
      id: ability.id,
      ap: ability.ap,
    });
  }
  return [...seen.values()];
}

/**
 * Compile schema-valid QuestHandoff / ProjectHandoff JSON to Godot 4 Resource text.
 * Throws HandoffEnvelopeError when the envelope fails the schema gate.
 */
export function compileHandoffToTres(input: unknown): string {
  const handoff = requireSchemaValidHandoff(input);
  const combats = encounterCombats(handoff.beats);
  const abilities = uniqueAbilities(combats);

  const lines: string[] = [];
  lines.push('; One-way compile of schema-valid RPG handoff JSON.');
  lines.push('; Not an authoring source. Do not round-trip into the board. Do not store in localStorage.');
  lines.push('');

  const loadSteps = 1 + abilities.length + combats.length;
  lines.push(
    `[gd_resource type="Resource" script_class="QuestCombatPack" load_steps=${loadSteps} format=3]`,
  );
  lines.push('');

  for (const ability of abilities) {
    lines.push(`[sub_resource type="Resource" id="${ability.key}"]`);
    lines.push(`resource_name = ${gdString(ability.id)}`);
    lines.push(`id = ${gdString(ability.id)}`);
    if (ability.ap !== undefined) {
      lines.push(`ap = ${ability.ap}`);
    }
    lines.push('');
  }

  const encounterKeys: string[] = [];
  for (const { beat, spec } of combats) {
    const key = gdIdent(`combat_${beat.id}`, `combat_${encounterKeys.length + 1}`);
    encounterKeys.push(key);
    lines.push(`[sub_resource type="Resource" id="${key}"]`);
    lines.push(`resource_name = ${gdString(beat.title)}`);
    lines.push(`beat_id = ${gdString(beat.id)}`);
    if (spec.anticipation) lines.push(`anticipation = ${gdString(spec.anticipation)}`);
    if (spec.hit) lines.push(`hit = ${gdString(spec.hit)}`);
    if (spec.followThrough) lines.push(`follow_through = ${gdString(spec.followThrough)}`);
    if (spec.recovery) lines.push(`recovery = ${gdString(spec.recovery)}`);
    if (spec.ability) {
      const abilityKey = abilities.find(a => a.id === spec.ability!.id)?.key;
      if (abilityKey) {
        lines.push(`ability = SubResource("${abilityKey}")`);
      }
    }
    if (isEmptyCombatSpec(spec)) {
      lines.push('empty = true');
    }
    lines.push('');
  }

  const sourceId = isProjectHandoff(handoff) ? handoff.projectId : handoff.id;
  lines.push('[resource]');
  lines.push(`quest_id = ${gdString(sourceId)}`);
  lines.push(`title = ${gdString(handoff.title)}`);
  if (encounterKeys.length === 0) {
    lines.push('encounters = []');
  } else {
    lines.push(`encounters = [${encounterKeys.map(k => `SubResource("${k}")`).join(', ')}]`);
  }
  lines.push('');

  return lines.join('\n');
}
