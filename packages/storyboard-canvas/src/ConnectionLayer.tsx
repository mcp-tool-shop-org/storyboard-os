// ─── storyboard-canvas / ConnectionLayer.tsx ─────────────────────────────────
//
// Konva Group that renders all storyboard connections as labeled arrows.
// Arrow styles come from config.connectionTypeStyles with a fallback.
//
// ─────────────────────────────────────────────────────────────────────────────

import { Group, Arrow, Text } from 'react-konva';
import type { CanvasConnection, CanvasFrame, CanvasConnectionStyle, StoryboardCanvasConfig, PositionMap } from './types';

const DEFAULT_CONN_STYLE: CanvasConnectionStyle = { stroke: '#475569' };

interface Props {
  connections: CanvasConnection[];
  frames: CanvasFrame[];
  positions: PositionMap;
  config: StoryboardCanvasConfig;
}

export default function ConnectionLayer({ connections, frames, positions, config }: Props) {
  const frameMap = new Map(frames.map(f => [f.id, f]));

  function styleFor(type: string): CanvasConnectionStyle {
    return (
      config.connectionTypeStyles?.[type] ??
      config.defaultConnectionStyle ??
      DEFAULT_CONN_STYLE
    );
  }

  return (
    <Group>
      {connections.map(conn => {
        const fromFrame = frameMap.get(conn.fromFrameId);
        const toFrame = frameMap.get(conn.toFrameId);
        if (!fromFrame || !toFrame) return null;

        const fromPos = positions[conn.fromFrameId] ?? fromFrame.position;
        const toPos = positions[conn.toFrameId] ?? toFrame.position;

        // Exit right-center, enter left-center
        const x1 = fromPos.x + fromFrame.size.width;
        const y1 = fromPos.y + fromFrame.size.height / 2;
        const x2 = toPos.x;
        const y2 = toPos.y + toFrame.size.height / 2;

        // Control points for a gentle curve when frames are offset vertically
        const dx = Math.abs(x2 - x1) * 0.4;
        const cx1 = x1 + dx;
        const cx2 = x2 - dx;

        const mx = (x1 + x2) / 2;
        const my = (y1 + y2) / 2 - 12;

        const style = styleFor(conn.type);

        return (
          <Group key={conn.id}>
            <Arrow
              points={[x1, y1, cx1, y1, cx2, y2, x2, y2]}
              tension={0.4}
              stroke={style.stroke}
              strokeWidth={1.5}
              fill={style.stroke}
              dash={style.dash}
              pointerLength={9}
              pointerWidth={6}
              opacity={0.75}
            />
            {conn.label && (
              <Text
                x={mx - 44}
                y={my}
                width={88}
                text={conn.label}
                fontSize={10}
                fill="#64748b"
                align="center"
              />
            )}
          </Group>
        );
      })}
    </Group>
  );
}
