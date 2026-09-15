// ─── storyboard-canvas / frameText.ts ─────────────────────────────────────────
//
// Shared display-text seawall for FrameCard (Konva) and AccessibleFrameList
// (DOM). Title/badge/type must agree across the two surfaces so a poisoned
// title cannot paint a blank card while the list announces "Untitled frame".
//
// ─────────────────────────────────────────────────────────────────────────────

import type { CanvasBadge, CanvasConnection, CanvasFrame } from './types';
import { DEFAULT_FRAME_STYLE } from './defaults';
import { humanizeType } from './humanizeType';

export const UNTITLED_FRAME = 'Untitled frame';

/** Coerce a frame title for display; blank/non-string → "Untitled frame". */
export function frameDisplayTitle(title: unknown): string {
  return typeof title === 'string' && title.trim() ? title : UNTITLED_FRAME;
}

/** Coerce a frame summary for Konva Text; non-string → empty (never throw). */
export function frameDisplaySummary(summary: unknown): string {
  return typeof summary === 'string' ? summary : '';
}

/** Badges whose `text` is a non-empty string — skip the rest (F-13e44dcf). */
export function badgesWithText(
  badges: CanvasBadge[] | undefined,
): CanvasBadge[] {
  if (!badges || badges.length === 0) return [];
  return badges.filter(
    b => typeof b.text === 'string' && b.text.length > 0,
  );
}

/**
 * Resolve a frame-type key to the same label FrameCard paints on the type bar:
 * `typeLabelFor(type)` (typically config.frameTypeStyles[type].label) falling
 * back to DEFAULT_FRAME_STYLE.label ("FRAME"). Never humanize the raw key.
 */
export function frameTypeLabel(
  type: string,
  typeLabelFor?: (type: string) => string,
): string {
  const resolved = typeLabelFor?.(type);
  if (typeof resolved === 'string' && resolved.trim()) return resolved.trim();
  return DEFAULT_FRAME_STYLE.label;
}

/** Accessible name: title — type-bar label — badge texts. */
export function accessibleFrameName(
  frame: Pick<CanvasFrame, 'title' | 'type' | 'badges'>,
  typeLabelFor?: (type: string) => string,
): string {
  const parts: string[] = [frameDisplayTitle(frame.title)];
  const type = frameTypeLabel(frame.type, typeLabelFor);
  if (type) parts.push(type);
  const badgeText = badgesWithText(frame.badges)
    .map(b => b.text)
    .join(', ');
  if (badgeText) parts.push(badgeText);
  return parts.join(' — ');
}

/**
 * Visible header / listbox name: frames-only, connections-only, or combined.
 * AccessibleFrameList mirrors this string on the nav landmark and listbox.
 */
export function headerLabel(frameCount: number, connectionCount: number): string {
  if (connectionCount > 0 && frameCount > 0) {
    return `Board · ${frameCount + connectionCount}`;
  }
  if (connectionCount > 0) return `Connections · ${connectionCount}`;
  return `Frames${frameCount > 0 ? ` · ${frameCount}` : ''}`;
}

/**
 * Visible connection-row label: explicit label, else type-label resolver /
 * humanized type key, else "Connection".
 */
export function connectionVisibleLabel(
  conn: Partial<Pick<CanvasConnection, 'label' | 'type'>>,
  typeLabelFor?: (type: string) => string,
): string {
  if (typeof conn.label === 'string' && conn.label.trim()) return conn.label.trim();
  const resolved = typeLabelFor?.(typeof conn.type === 'string' ? conn.type : '');
  if (typeof resolved === 'string' && resolved.trim()) return resolved.trim();
  const humanized = humanizeType(conn.type);
  if (humanized) return humanized;
  return 'Connection';
}

/** Accessible connection name: label — from-title to to-title. */
export function accessibleConnectionName(
  conn: Pick<CanvasConnection, 'fromFrameId' | 'toFrameId'> &
    Partial<Pick<CanvasConnection, 'label' | 'type'>>,
  frames: ReadonlyArray<Pick<CanvasFrame, 'id' | 'title'>>,
  typeLabelFor?: (type: string) => string,
): string {
  const from = frames.find(f => f.id === conn.fromFrameId);
  const to = frames.find(f => f.id === conn.toFrameId);
  const fromTitle = from ? frameDisplayTitle(from.title) : conn.fromFrameId;
  const toTitle = to ? frameDisplayTitle(to.title) : conn.toFrameId;
  const route = `${fromTitle} to ${toTitle}`;
  const explicit =
    typeof conn.label === 'string' && conn.label.trim() ? conn.label.trim() : '';
  if (explicit) return `${explicit} — ${route}`;
  if (typeof conn.type === 'string' && conn.type.trim()) {
    return `${connectionVisibleLabel(conn, typeLabelFor)} — ${route}`;
  }
  return route;
}
