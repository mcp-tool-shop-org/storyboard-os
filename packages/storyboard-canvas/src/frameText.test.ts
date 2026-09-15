import { describe, it, expect } from 'vitest';
import { DEFAULT_FRAME_STYLE, DEFAULT_CONNECTION_STYLE } from './defaults';
import {
  UNTITLED_FRAME,
  frameDisplayTitle,
  frameDisplaySummary,
  cardBeatLine,
  badgesWithText,
  frameTypeLabel,
  accessibleFrameName,
  connectionVisibleLabel,
  accessibleConnectionName,
  headerLabel,
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

describe('cardBeatLine', () => {
  it('keeps a single sentence', () => {
    expect(cardBeatLine('The smith offers the blade.')).toBe('The smith offers the blade.');
  });

  it('truncates to the first sentence', () => {
    expect(cardBeatLine('Beat one. Entry conditions follow. Checklist too.')).toBe('Beat one.');
  });

  it('truncates to the first line when there is no sentence terminator', () => {
    expect(cardBeatLine('Implementable beat\nThen a paragraph of spec.')).toBe(
      'Implementable beat',
    );
  });

  it('prefers the first line over a later sentence', () => {
    expect(cardBeatLine('Line one continues\nSecond. line')).toBe('Line one continues');
  });

  it('returns empty for blank or non-string input (no throw)', () => {
    expect(cardBeatLine('')).toBe('');
    expect(cardBeatLine('   \nmore')).toBe('');
    expect(cardBeatLine(null)).toBe('');
    expect(cardBeatLine(42)).toBe('');
    expect(cardBeatLine(undefined)).toBe('');
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

describe('default styles meet 1.4.11', () => {
  it('uses secondary slate, not retired #475569', () => {
    expect(DEFAULT_FRAME_STYLE.accent.toLowerCase()).toBe('#94a3b8');
    expect(DEFAULT_CONNECTION_STYLE.stroke.toLowerCase()).toBe('#94a3b8');
    expect(DEFAULT_FRAME_STYLE.accent.toLowerCase()).not.toBe('#475569');
    expect(DEFAULT_CONNECTION_STYLE.stroke.toLowerCase()).not.toBe('#475569');
  });
});

describe('headerLabel', () => {
  it('names frames-only, connections-only, and combined lists', () => {
    expect(headerLabel(3, 0)).toBe('Frames · 3');
    expect(headerLabel(0, 0)).toBe('Frames');
    expect(headerLabel(0, 2)).toBe('Connections · 2');
    expect(headerLabel(3, 2)).toBe('Board · 5');
  });
});

describe('connectionVisibleLabel', () => {
  it('prefers a trimmed label, then type, then Connection', () => {
    expect(connectionVisibleLabel({ label: 'then', type: 'sequence' })).toBe('then');
    expect(connectionVisibleLabel({ type: 'choice' })).toBe('choice');
    expect(connectionVisibleLabel({ type: '' })).toBe('Connection');
  });

  it('humanizes type keys and honors a type-label resolver', () => {
    expect(connectionVisibleLabel({ type: 'match_cut' })).toBe('match cut');
    expect(
      connectionVisibleLabel({ type: 'sequence' }, type =>
        type === 'sequence' ? 'SEQUENCE' : type,
      ),
    ).toBe('SEQUENCE');
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

  it('includes a resolved type label when conn.label is missing', () => {
    expect(
      accessibleConnectionName(
        { type: 'match_cut', fromFrameId: 'a', toFrameId: 'b' },
        frames,
      ),
    ).toBe('match cut — Hook to Reveal');
    expect(
      accessibleConnectionName(
        { type: 'sequence', fromFrameId: 'a', toFrameId: 'b' },
        frames,
        type => (type === 'sequence' ? 'SEQUENCE' : type),
      ),
    ).toBe('SEQUENCE — Hook to Reveal');
  });
});
