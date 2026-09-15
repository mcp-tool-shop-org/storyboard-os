// ─── Card beat line (C2 progressive disclosure) ──────────────────────────────
//
// On-card = type bar + title + one implementable line + readiness badges.
// Inspector keeps the full summary and spec. Never put wiki prose, camera
// essays, VFX lists, continuity, checklist, tests, or duration on the card.

import type { StoryboardFrame } from './schema';

/** Max characters for the Konva card beat (one line on a 220×140 card). */
export const CARD_BEAT_MAX_CHARS = 56;

function collapseWhitespace(text: string): string {
  return text.replace(/\s+/g, ' ').trim();
}

function truncateOneLine(text: string, maxChars: number): string {
  const line = collapseWhitespace(text);
  if (line.length <= maxChars) return line;
  if (maxChars <= 1) return '…';
  return `${line.slice(0, maxChars - 1).trimEnd()}…`;
}

/**
 * One implementable beat for the canvas card: intent when present, otherwise
 * a truncated summary. Null/missing content is treated as no intent (DM-002).
 */
export function cardBeatLine(
  frame: Pick<StoryboardFrame, 'summary' | 'content'>,
  maxChars: number = CARD_BEAT_MAX_CHARS,
): string {
  const content = (frame.content ?? {}) as StoryboardFrame['content'];
  const intent = typeof content.intent === 'string' ? collapseWhitespace(content.intent) : '';
  if (intent) return truncateOneLine(intent, maxChars);
  const summary = typeof frame.summary === 'string' ? frame.summary : '';
  return truncateOneLine(summary, maxChars);
}
