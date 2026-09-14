import { describe, it, expect } from 'vitest';
import { humanizeType } from './humanizeType';

describe('humanizeType', () => {
  it('humanizes snake_case and kebab-case strings', () => {
    expect(humanizeType('match_cut')).toBe('match cut');
    expect(humanizeType('parallel-action')).toBe('parallel action');
  });

  it('returns empty string for non-string input (no throw)', () => {
    expect(humanizeType(42)).toBe('');
    expect(humanizeType(true)).toBe('');
    expect(humanizeType(null)).toBe('');
    expect(humanizeType(undefined)).toBe('');
    expect(humanizeType({ type: 'scene' })).toBe('');
    expect(humanizeType(['scene'])).toBe('');
  });

  it('returns empty string for whitespace-only string', () => {
    expect(humanizeType('   ')).toBe('');
  });
});
