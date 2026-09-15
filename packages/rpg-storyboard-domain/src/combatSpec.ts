// ─── rpg-domain / combatSpec.ts ──────────────────────────────────────────────
//
// Normalize the optional encounter combat attachment. Empty `{}` is valid
// quest-logic. Non-encounter callers should drop the field rather than store it.
//
// ─────────────────────────────────────────────────────────────────────────────

import type { CombatAbilityRef, CombatSpec } from './schema';

function asTrimmed(value: unknown): string | undefined {
  if (typeof value !== 'string') return undefined;
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : undefined;
}

function asFiniteNumber(value: unknown): number | undefined {
  if (typeof value === 'number' && Number.isFinite(value)) return value;
  if (typeof value === 'string' && value.trim() !== '') {
    const parsed = Number(value);
    if (Number.isFinite(parsed)) return parsed;
  }
  return undefined;
}

function normalizeAbility(value: unknown): CombatAbilityRef | undefined {
  if (value == null || typeof value !== 'object' || Array.isArray(value)) {
    return undefined;
  }
  const record = value as Record<string, unknown>;
  const id = asTrimmed(record.id);
  if (!id) return undefined;
  const ap = asFiniteNumber(record.ap);
  return ap === undefined ? { id } : { id, ap };
}

/**
 * Coerce unknown JSON into a CombatSpec. Returns `undefined` when the value
 * is missing/non-object. Returns `{}` when the object is present but empty.
 */
export function normalizeCombatSpec(value: unknown): CombatSpec | undefined {
  if (value == null || typeof value !== 'object' || Array.isArray(value)) {
    return undefined;
  }
  const record = value as Record<string, unknown>;
  const spec: CombatSpec = {};
  const anticipation = asTrimmed(record.anticipation);
  const hit = asTrimmed(record.hit);
  const followThrough = asTrimmed(record.followThrough);
  const recovery = asTrimmed(record.recovery);
  const ability = normalizeAbility(record.ability);
  if (anticipation) spec.anticipation = anticipation;
  if (hit) spec.hit = hit;
  if (followThrough) spec.followThrough = followThrough;
  if (recovery) spec.recovery = recovery;
  if (ability) spec.ability = ability;
  return spec;
}

/** True when the spec has no 4-beat text and no ability Resource. */
export function isEmptyCombatSpec(spec: CombatSpec | undefined): boolean {
  if (!spec) return true;
  return (
    !spec.anticipation &&
    !spec.hit &&
    !spec.followThrough &&
    !spec.recovery &&
    !spec.ability
  );
}
