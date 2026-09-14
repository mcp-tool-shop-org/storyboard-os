import { describe, it, expect } from 'vitest';
import { DEFAULT_FRAME_STYLE } from './defaults';
import {
  UNTITLED_FRAME,
  frameDisplayTitle,
  frameDisplaySummary,
  badgesWithText,
  frameTypeLabel,
  accessibleFrameName,
  connectionVisibleLabel,
  accessibleConnectionName,
} from './frameText';

describe('frameDisplayTitle', () => {
  it('returns a non-blank string title unchanged', () => {
    expect(frameDisplayTitle('Hook')).toBe('Hook');
  });

  it('falls back to Untitled frame for blank/non-string', () => {
    expect(frameDisplayTitle('')).toBe(UNTITLED_FRAME);
    expect(frameDisplayTitle('   ')).toBe(UNTITLED_FRAME);
    expect(frameDisplayTitle(null)).toBe(UNTITLED_FRAME);
    expect(frameDisplayTitle(42)).toBe(UNTITLED_FRAME);
    expect(frameDisplayTitle(undefined)).toBe(UNTITLED_FRAME);
  });
});

describe('frameDisplaySummary', () => {
  it('returns string summaries unchanged (including empty)', () => {
    expect(frameDisplaySummary('Beat one.')).toBe('Beat one.');
    expect(frameDisplaySummary('')).toBe('');
  });

  it('returns empty string for non-string input (no throw)', () => {
    expect(frameDisplaySummary(null)).toBe('');
    expect(frameDisplaySummary(42)).toBe('');
    expect(frameDisplaySummary(undefined)).toBe('');
  });
});

describe('badgesWithText', () => {
  it('keeps badges whose text is a non-empty string', () => {
    expect(
      badgesWithText([
        { text: 'SPEC', color: '#22C55E' },
        { text: 'STATE', color: '#3B82F6' },
      ]),
    ).toHaveLength(2);
  });

  it('drops non-string and empty badge text', () => {
    expect(
      badgesWithText([
        { text: 'SPEC', color: '#22C55E' },
        { text: 42 as unknown as string, color: '#fff' },
        { text: '', color: '#fff' },
        { text: null as unknown as string, color: '#fff' },
      ]),
    ).toEqual([{ text: 'SPEC', color: '#22C55E' }]);
  });

  it('returns [] for missing/empty badges', () => {
    expect(badgesWithText(undefined)).toEqual([]);
    expect(badgesWithText([])).toEqual([]);
  });
});

describe('frameTypeLabel', () => {
  it('uses the resolver label (config type-bar text), not the raw key', () => {
    const typeLabelFor = (type: string) =>
      type === 'character_beat' ? 'CHARACTER BEAT' : '';
    expect(frameTypeLabel('character_beat', typeLabelFor)).toBe('CHARACTER BEAT');
  });

  it('falls back to DEFAULT_FRAME_STYLE.label when the resolver is missing or blank', () => {
    expect(frameTypeLabel('unknown')).toBe(DEFAULT_FRAME_STYLE.label);
    expect(frameTypeLabel('unknown', () => '')).toBe(DEFAULT_FRAME_STYLE.label);
    expect(frameTypeLabel('unknown', () => '   ')).toBe(DEFAULT_FRAME_STYLE.label);
  });
});

describe('accessibleFrameName', () => {
  it('composes title, config type label, and badge texts', () => {
    const name = accessibleFrameName(
      {
        title: 'Meet the smith',
        type: 'character_beat',
        badges: [{ text: 'SPEC', color: '#22C55E' }],
      },
      type => (type === 'character_beat' ? 'CHARACTER BEAT' : 'FRAME'),
    );
    expect(name).toBe('Meet the smith — CHARACTER BEAT — SPEC');
    expect(name).not.toContain('character beat');
    expect(name).not.toContain('character_beat');
  });

  it('uses Untitled frame + default FRAME label when title/type are poisoned', () => {
    const name = accessibleFrameName({
      title: 42 as unknown as string,
      type: 'nope',
      badges: [{ text: 9 as unknown as string, color: '#fff' }],
    });
    expect(name).toBe(`${UNTITLED_FRAME} — ${DEFAULT_FRAME_STYLE.label}`);
  });
});

describe('connectionVisibleLabel', () => {
  it('prefers a trimmed label, then type, then Connection', () => {
    expect(connectionVisibleLabel({ label: 'then', type: 'sequence' })).toBe('then');
    expect(connectionVisibleLabel({ type: 'choice' })).toBe('choice');
    expect(connectionVisibleLabel({ type: '' })).toBe('Connection');
  });
});

describe('accessibleConnectionName', () => {
  const frames = [
    { id: 'a', title: 'Hook' },
    { id: 'b', title: 'Reveal' },
  ];

  it('uses label plus from/to titles', () => {
    expect(
      accessibleConnectionName(
        { label: 'then', fromFrameId: 'a', toFrameId: 'b' },
        frames,
      ),
    ).toBe('then — Hook to Reveal');
  });

  it('falls back to route-only when the label is blank', () => {
    expect(
      accessibleConnectionName(
        { fromFrameId: 'a', toFrameId: 'b' },
        frames,
      ),
    ).toBe('Hook to Reveal');
  });

  it('uses frame ids when endpoints are missing', () => {
    expect(
      accessibleConnectionName(
        { fromFrameId: 'gone', toFrameId: 'b' },
        frames,
      ),
    ).toBe('gone to Reveal');
  });
});
