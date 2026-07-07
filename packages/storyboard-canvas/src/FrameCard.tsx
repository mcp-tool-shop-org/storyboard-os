// ─── storyboard-canvas / FrameCard.tsx ───────────────────────────────────────
//
// Konva Group that renders one storyboard frame as a card.
// Visual style is passed in via `style` — the parent resolves it from config.
// Domain badge chips (CanvasBadge[]) are rendered at the bottom of the card
// if present — the canvas renders them without knowing what they mean.
//
// ─────────────────────────────────────────────────────────────────────────────

import { Group, Rect, Text } from 'react-konva';
import type { KonvaEventObject } from 'konva/lib/Node';
import type { CanvasFrame, CanvasFrameStyle } from './types';

const TYPE_BAR_HEIGHT = 26;
const PADDING = 10;
const TITLE_Y = TYPE_BAR_HEIGHT + 8;
const SUMMARY_Y = TYPE_BAR_HEIGHT + 28;

// Badge row constants
const BADGE_HEIGHT = 16;
const BADGE_PADDING_X = 5;
const BADGE_GAP = 4;
const BADGE_BOTTOM_MARGIN = 6;
const BADGE_FONT_SIZE = 9;

const DEFAULT_STYLE: CanvasFrameStyle = {
  bg: '#0e1018',
  accent: '#475569',
  label: 'FRAME',
};

interface Props {
  frame: CanvasFrame;
  position: { x: number; y: number };
  style?: CanvasFrameStyle;
  isSelected: boolean;
  onSelect: (id: string) => void;
  onDragEnd: (id: string, x: number, y: number) => void;
}

/** Approximate pixel width for a badge chip with the given label text. */
function badgeWidth(text: string): number {
  // ~6.5px per character at 9px bold + left + right padding
  return Math.ceil(text.length * 6.5) + BADGE_PADDING_X * 2;
}

export default function FrameCard({
  frame,
  position,
  style = DEFAULT_STYLE,
  isSelected,
  onSelect,
  onDragEnd,
}: Props) {
  const { width, height } = frame.size;
  const badges = frame.badges ?? [];
  const hasBadges = badges.length > 0;

  // Reserve space at the bottom for the badge row.
  // F-CV-004: clamp to 0 — a short frame (height < SUMMARY_Y + badge row + 8)
  // would otherwise pass a negative height to the Konva Text node.
  const badgeRowHeight = hasBadges ? BADGE_HEIGHT + BADGE_BOTTOM_MARGIN : 0;
  const summaryMaxHeight = Math.max(0, height - SUMMARY_Y - badgeRowHeight - 8);

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

      {/* Summary — height shrinks when badge row is present */}
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

      {/* Badge row — domain-provided chips, rendered at card bottom */}
      {hasBadges && (
        <Group y={height - BADGE_HEIGHT - BADGE_BOTTOM_MARGIN}>
          {badges.map((badge, i) => {
            const bw = badgeWidth(badge.text);
            // Stack badges left-to-right from the left padding
            const bx =
              PADDING +
              badges.slice(0, i).reduce(
                (acc, prev) => acc + badgeWidth(prev.text) + BADGE_GAP,
                0,
              );
            return (
              <Group key={badge.text} x={bx}>
                {/* Badge fill (very subtle tint) */}
                <Rect
                  width={bw} height={BADGE_HEIGHT}
                  cornerRadius={3}
                  fill={badge.color}
                  opacity={0.12}
                />
                {/* Badge border */}
                <Rect
                  width={bw} height={BADGE_HEIGHT}
                  cornerRadius={3}
                  stroke={badge.color}
                  strokeWidth={1}
                  opacity={0.55}
                />
                {/* Badge label */}
                <Text
                  x={BADGE_PADDING_X}
                  y={Math.floor((BADGE_HEIGHT - BADGE_FONT_SIZE) / 2) - 1}
                  text={badge.text}
                  fontSize={BADGE_FONT_SIZE}
                  fontStyle="bold"
                  fill={badge.color}
                  letterSpacing={0.6}
                />
              </Group>
            );
          })}
        </Group>
      )}
    </Group>
  );
}
