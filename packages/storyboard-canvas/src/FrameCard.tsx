// ─── storyboard-canvas / FrameCard.tsx ───────────────────────────────────────
//
// Konva Group that renders one storyboard frame as a card.
// Visual style is passed in via `style` — the parent resolves it from config.
// Domain badge chips (CanvasBadge[]) are rendered at the bottom of the card
// if present — the canvas renders them without knowing what they mean.
//
// ─────────────────────────────────────────────────────────────────────────────

import { Group, Rect, Text } from 'react-konva';
import Konva from 'konva';
import type { KonvaEventObject } from 'konva/lib/Node';
import type { CanvasFrame, CanvasFrameStyle, CanvasBadge } from './types';
import { DEFAULT_FRAME_STYLE } from './defaults';

const TYPE_BAR_HEIGHT = 26;
const PADDING = 10;
const TITLE_Y = TYPE_BAR_HEIGHT + 8;
const SUMMARY_Y = TYPE_BAR_HEIGHT + 28;

// Badge row constants
const BADGE_HEIGHT = 16;
const BADGE_PADDING_X = 5;
const BADGE_GAP = 4;
const BADGE_ROW_GAP = 3;
const BADGE_BOTTOM_MARGIN = 6;
const BADGE_FONT_SIZE = 9;
const BADGE_LETTER_SPACING = 0.6;
// VP-010: cap the badge area at two rows. Beyond that, remaining badges are
// dropped and a "+N" overflow chip communicates the count (never overrun).
const BADGE_MAX_ROWS = 2;

// VP-010: single reusable off-screen Konva.Text for measuring badge label
// widths with the ACTUAL font metrics, instead of a `text.length * 6.5` guess
// that overruns proportional fonts. Lazily created (Konva touches a canvas
// context, so we defer construction to first use — safe in the browser where
// these cards actually render; guarded for any non-DOM environment).
let badgeMeasureNode: Konva.Text | null = null;

function measureBadgeTextWidth(text: string): number {
  try {
    if (!badgeMeasureNode) {
      badgeMeasureNode = new Konva.Text({
        fontSize: BADGE_FONT_SIZE,
        fontStyle: 'bold',
        letterSpacing: BADGE_LETTER_SPACING,
      });
    }
    return badgeMeasureNode.measureSize(text).width;
  } catch {
    // Defensive fallback (no canvas context available): the old heuristic.
    return text.length * 6.5;
  }
}

/** Full chip width (measured text + horizontal padding), rounded up. */
function badgeWidth(text: string): number {
  return Math.ceil(measureBadgeTextWidth(text)) + BADGE_PADDING_X * 2;
}

interface Props {
  frame: CanvasFrame;
  position: { x: number; y: number };
  style?: CanvasFrameStyle;
  isSelected: boolean;
  onSelect: (id: string) => void;
  onDragEnd: (id: string, x: number, y: number) => void;
}

// A badge positioned within the card's badge area.
interface PlacedBadge {
  badge: CanvasBadge;
  x: number;
  y: number;
  width: number;
  /** True when the label was clamped to the card width and needs ellipsis. */
  clamped: boolean;
}

interface BadgeLayout {
  placed: PlacedBadge[];
  /** Number of rows actually used (0..BADGE_MAX_ROWS). */
  rows: number;
  /** Total height the badge area occupies (0 when no badges). */
  areaHeight: number;
}

/**
 * VP-010: pack badges into up to BADGE_MAX_ROWS rows within `innerWidth`,
 * wrapping when the next chip would overflow the card's right edge. A chip too
 * wide for even a fresh empty row is clamped to `innerWidth` (its label gets
 * ellipsis). Badges that don't fit within the row cap are summarized by a
 * trailing "+N" overflow chip so the row never overruns the card.
 */
function layoutBadges(badges: CanvasBadge[], innerWidth: number): BadgeLayout {
  if (badges.length === 0) {
    return { placed: [], rows: 0, areaHeight: 0 };
  }

  const maxWidth = Math.max(0, innerWidth);
  const placed: PlacedBadge[] = [];
  let row = 0;
  let cursorX = 0;

  for (let i = 0; i < badges.length; i++) {
    const badge = badges[i];
    let w = badgeWidth(badge.text);
    let clamped = false;

    // A single chip wider than the card: clamp its box to the card width and
    // let the Konva Text ellipsis truncate the label.
    if (w > maxWidth) {
      w = maxWidth;
      clamped = true;
    }

    const fitsOnCurrentRow = cursorX === 0 || cursorX + w <= maxWidth;
    if (!fitsOnCurrentRow) {
      // Wrap to the next row.
      row += 1;
      cursorX = 0;
      if (row >= BADGE_MAX_ROWS) {
        // Out of rows — replace the rest with a "+N" overflow chip if it fits.
        row = BADGE_MAX_ROWS - 1;
        const remaining = badges.length - i;
        appendOverflowChip(placed, remaining, maxWidth, row);
        break;
      }
    }

    placed.push({
      badge,
      x: cursorX,
      y: row * (BADGE_HEIGHT + BADGE_ROW_GAP),
      width: w,
      clamped,
    });
    cursorX += w + BADGE_GAP;
  }

  const rows = placed.length > 0
    ? Math.max(...placed.map(p => Math.round(p.y / (BADGE_HEIGHT + BADGE_ROW_GAP)))) + 1
    : 0;
  const areaHeight = rows > 0
    ? rows * BADGE_HEIGHT + (rows - 1) * BADGE_ROW_GAP
    : 0;

  return { placed, rows, areaHeight };
}

/**
 * Append a "+N" overflow indicator to the last row, right-aligned so it never
 * pushes past the card edge. If even the last placed chip + "+N" won't fit, the
 * "+N" replaces the trailing chip.
 */
function appendOverflowChip(
  placed: PlacedBadge[],
  hiddenCount: number,
  maxWidth: number,
  row: number,
): void {
  const label = `+${hiddenCount}`;
  const w = Math.min(badgeWidth(label), maxWidth);
  const y = row * (BADGE_HEIGHT + BADGE_ROW_GAP);

  // Right-align the overflow chip within the row.
  const x = Math.max(0, maxWidth - w);

  // Drop any already-placed chips on this row that would collide with it.
  for (let j = placed.length - 1; j >= 0; j--) {
    const p = placed[j];
    if (p.y === y && p.x + p.width > x) {
      placed.splice(j, 1);
    } else if (p.y === y) {
      break;
    }
  }

  placed.push({
    badge: { text: label, color: '#94a3b8' },
    x,
    y,
    width: w,
    clamped: false,
  });
}

export default function FrameCard({
  frame,
  position,
  style = DEFAULT_FRAME_STYLE,
  isSelected,
  onSelect,
  onDragEnd,
}: Props) {
  const { width, height } = frame.size;
  const badges = frame.badges ?? [];
  const innerWidth = width - PADDING * 2;

  // VP-010: lay badges out (measured widths, wrap, clamp) instead of a naive
  // left-to-right stack that overruns a 4-badge cinematic row.
  const layout = layoutBadges(badges, innerWidth);
  const hasBadges = layout.placed.length > 0;

  // Reserve space at the bottom for the (possibly multi-row) badge area.
  // F-CV-004 (preserved): clamp to 0 — a short card would otherwise pass a
  // negative height to the Konva Text node.
  const badgeAreaHeight = hasBadges ? layout.areaHeight + BADGE_BOTTOM_MARGIN : 0;
  const summaryMaxHeight = Math.max(0, height - SUMMARY_Y - badgeAreaHeight - 8);

  // Top y of the whole badge block (bottom-anchored inside the card).
  const badgeBlockY = height - layout.areaHeight - BADGE_BOTTOM_MARGIN;

  function handleDragEnd(e: KonvaEventObject<DragEvent>) {
    onDragEnd(frame.id, e.target.x(), e.target.y());
  }

  function handleClick() {
    onSelect(frame.id);
  }

  return (
    <Group
      x={position.x}
      y={position.y}
      draggable
      onDragEnd={handleDragEnd}
      onClick={handleClick}
      onTap={handleClick}
    >
      {/* Drop shadow */}
      <Rect
        x={4} y={4}
        width={width} height={height}
        cornerRadius={8}
        fill="rgba(0,0,0,0.5)"
      />

      {/* Card body */}
      <Rect
        width={width} height={height}
        cornerRadius={8}
        fill={style.bg}
        stroke={isSelected ? '#f8fafc' : style.accent}
        strokeWidth={isSelected ? 2.5 : 1.5}
      />

      {/* Type color bar */}
      <Rect
        width={width} height={TYPE_BAR_HEIGHT}
        cornerRadius={[8, 8, 0, 0]}
        fill={style.accent}
        opacity={0.85}
      />

      {/* Type label */}
      <Text
        x={PADDING} y={7}
        width={width - PADDING * 2}
        text={style.label}
        fontSize={10}
        fontStyle="bold"
        fill="#fff"
        letterSpacing={1.2}
      />

      {/* Frame title */}
      <Text
        x={PADDING} y={TITLE_Y}
        width={width - PADDING * 2}
        text={frame.title}
        fontSize={13}
        fontStyle="bold"
        fill="#f1f5f9"
        wrap="word"
        lineHeight={1.3}
        ellipsis
      />

      {/* Summary — height shrinks when badge rows are present */}
      <Text
        x={PADDING} y={SUMMARY_Y}
        width={width - PADDING * 2}
        height={summaryMaxHeight}
        text={frame.summary}
        fontSize={11}
        fill="#94a3b8"
        wrap="word"
        lineHeight={1.4}
        ellipsis
      />

      {/* Badge area — domain-provided chips, measured + wrapped, bottom-anchored */}
      {hasBadges && (
        <Group x={PADDING} y={badgeBlockY}>
          {layout.placed.map((p, i) => (
            <Group key={`${p.badge.text}-${i}`} x={p.x} y={p.y}>
              {/* Badge fill (very subtle tint) */}
              <Rect
                width={p.width} height={BADGE_HEIGHT}
                cornerRadius={3}
                fill={p.badge.color}
                opacity={0.12}
              />
              {/* Badge border */}
              <Rect
                width={p.width} height={BADGE_HEIGHT}
                cornerRadius={3}
                stroke={p.badge.color}
                strokeWidth={1}
                opacity={0.55}
              />
              {/* Badge label — clamped chips get a bounded width + ellipsis */}
              <Text
                x={BADGE_PADDING_X}
                y={Math.floor((BADGE_HEIGHT - BADGE_FONT_SIZE) / 2) - 1}
                width={p.clamped ? Math.max(0, p.width - BADGE_PADDING_X * 2) : undefined}
                text={p.badge.text}
                fontSize={BADGE_FONT_SIZE}
                fontStyle="bold"
                fill={p.badge.color}
                letterSpacing={BADGE_LETTER_SPACING}
                wrap="none"
                ellipsis={p.clamped}
              />
            </Group>
          ))}
        </Group>
      )}
    </Group>
  );
}
