// ─── storyboard-canvas / FrameCard.tsx ───────────────────────────────────────
//
// Konva Group that renders one storyboard frame as a card.
// Visual style is passed in via `style` — the parent resolves it from config.
//
// ─────────────────────────────────────────────────────────────────────────────

import { Group, Rect, Text } from 'react-konva';
import type { KonvaEventObject } from 'konva/lib/Node';
import type { CanvasFrame, CanvasFrameStyle } from './types';

const TYPE_BAR_HEIGHT = 26;
const PADDING = 10;
const TITLE_Y = TYPE_BAR_HEIGHT + 8;
const SUMMARY_Y = TYPE_BAR_HEIGHT + 28;

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

export default function FrameCard({
  frame,
  position,
  style = DEFAULT_STYLE,
  isSelected,
  onSelect,
  onDragEnd,
}: Props) {
  const { width, height } = frame.size;

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

      {/* Summary */}
      <Text
        x={PADDING} y={SUMMARY_Y}
        width={width - PADDING * 2}
        height={height - SUMMARY_Y - 8}
        text={frame.summary}
        fontSize={11}
        fill="#94a3b8"
        wrap="word"
        lineHeight={1.4}
        ellipsis
      />
    </Group>
  );
}
