import { describe, it, expect } from 'vitest';
import { cardBeatLine, CARD_BEAT_MAX_CHARS } from './cardBeat';
import { createCinematicStoryboard } from './templates';
import type { StoryboardFrame } from './schema';

function frame(partial: Partial<StoryboardFrame> & Pick<StoryboardFrame, 'content' | 'summary'>): StoryboardFrame {
  return {
    id: 'f1',
    type: 'shot',
    title: 'Shot',
    position: { x: 0, y: 0 },
    size: { width: 220, height: 140 },
    annotations: [],
    ...partial,
  };
}

describe('cardBeatLine', () => {
  it('prefers intent over the full summary', () => {
    const line = cardBeatLine(frame({
      summary: 'A long inspector summary about lens, VFX, continuity, and the whole spec.',
      content: { intent: 'Hook: embers in the bell in 2s' },
    }));
    expect(line).toBe('Hook: embers in the bell in 2s');
    expect(line).not.toContain('VFX');
    expect(line).not.toContain('continuity');
  });

  it('truncates a long intent to one card line', () => {
    const intent = 'This intent is deliberately longer than a 220×140 Konva card can hold without wrapping into a wiki paragraph about duration and assets.';
    const line = cardBeatLine(frame({ summary: 'unused', content: { intent } }));
    expect(line.length).toBeLessThanOrEqual(CARD_BEAT_MAX_CHARS);
    expect(line.endsWith('…')).toBe(true);
    expect(line).not.toContain('duration');
  });

  it('falls back to a truncated summary when intent is missing', () => {
    const summary = 'Opening visual that grabs attention in the first two seconds and then keeps going into a duration essay.';
    const line = cardBeatLine(frame({ summary, content: {} }));
    expect(line.length).toBeLessThanOrEqual(CARD_BEAT_MAX_CHARS);
    expect(line.startsWith('Opening visual')).toBe(true);
  });

  it('tolerates null content (DM-002)', () => {
    const line = cardBeatLine(frame({
      summary: 'Inspector still has this full summary.',
      content: null as unknown as StoryboardFrame['content'],
    }));
    expect(line).toContain('Inspector still has this');
  });

  it('does not put duration essays on the card when intent exists', () => {
    const line = cardBeatLine(frame({
      summary: 'Hold 3-4s. Music resolves. CTA text appears.',
      content: { intent: 'CTA: wishlist Ashfall on the date', durationEstimate: '3-4s' },
    }));
    expect(line).toBe('CTA: wishlist Ashfall on the date');
    expect(line).not.toMatch(/\d-\d+s/);
  });

  it('yields a one-line beat for every gold template frame', () => {
    for (const id of ['trailer_flow', 'cutscene_sequence', 'explainer_video'] as const) {
      const sb = createCinematicStoryboard(id);
      for (const f of sb.frames) {
        const line = cardBeatLine(f);
        expect(line.length).toBeGreaterThan(0);
        expect(line.length).toBeLessThanOrEqual(CARD_BEAT_MAX_CHARS);
        expect(line).not.toContain('\n');
      }
    }
  });
});
