import { describe, it, expect } from 'vitest';
import { isEmptyCombatSpec, normalizeCombatSpec } from './combatSpec';

describe('normalizeCombatSpec (F-39baa660)', () => {
  it('returns undefined for missing/non-object values', () => {
    expect(normalizeCombatSpec(undefined)).toBeUndefined();
    expect(normalizeCombatSpec(null)).toBeUndefined();
    expect(normalizeCombatSpec('slash')).toBeUndefined();
  });

  it('treats empty object as a valid empty spec', () => {
    expect(normalizeCombatSpec({})).toEqual({});
    expect(isEmptyCombatSpec(normalizeCombatSpec({}))).toBe(true);
  });

  it('keeps 4-beat fields and Resource id/AP', () => {
    expect(normalizeCombatSpec({
      anticipation: '  wind  ',
      hit: 'impact',
      followThrough: '',
      recovery: 'reset',
      ability: { id: 'res://abilities/slash.tres', ap: 2 },
    })).toEqual({
      anticipation: 'wind',
      hit: 'impact',
      recovery: 'reset',
      ability: { id: 'res://abilities/slash.tres', ap: 2 },
    });
  });

  it('drops ability when id is missing', () => {
    expect(normalizeCombatSpec({ ability: { ap: 2 } })).toEqual({});
  });
});
