import { describe, it, expect } from 'vitest';
import { typeBarLabelFill } from './typeBarFill';

const NAVY = '#0b1120';
const WHITE = '#ffffff';

describe('typeBarLabelFill', () => {
  it('uses navy on Quick Start yellow / green / orange bars (white fails AA-normal)', () => {
    expect(typeBarLabelFill('#EAB308', '#1a1500')).toBe(NAVY); // HOOK
    expect(typeBarLabelFill('#22C55E', '#0a1a0e')).toBe(NAVY); // CHARACTER BEAT / spec
    expect(typeBarLabelFill('#F97316', '#1a0e00')).toBe(NAVY); // REVEAL
  });

  it('keeps white on the secondary slate default', () => {
    expect(typeBarLabelFill('#94a3b8', '#0e1018')).toBe(WHITE);
  });

  it('falls back to white when a color is not hex', () => {
    expect(typeBarLabelFill('rebeccapurple', '#0e1018')).toBe(WHITE);
  });
});
