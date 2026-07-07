// ─── storyboard-canvas / ConnectionLayer.tsx ─────────────────────────────────
//
// Konva Group that renders all storyboard connections as labeled arrows.
// Arrow styles come from config.connectionTypeStyles with a fallback.
// Supports strokeWidth per connection type and optional click-to-select.
//
// ─────────────────────────────────────────────────────────────────────────────

import { memo, useMemo } from 'react';
import { Group, Arrow, Rect, Text } from 'react-konva';
import type {
  CanvasConnection,
  CanvasFrame,
  CanvasConnectionStyle,
  StoryboardCanvasConfig,
  PositionMap,
} from './types';

const DEFAULT_CONN_STYLE: CanvasConnectionStyle = { stroke: '#475569' };
const DEFAULT_STROKE_WIDTH = 1.5;

// Hit-area height for the invisible click target along each connection
const HIT_AREA_HEIGHT = 12;

interface Props {
  connections: CanvasConnection[];
  frames: CanvasFrame[];
  positions: PositionMap;
  config: StoryboardCanvasConfig;
  selectedConnectionId?: string | null;
  onSelectConnection?: (connectionId: string | null) => void;
}

function ConnectionLayer({
  connections,
  frames,
  positions,
  config,
  selectedConnectionId,
  onSelectConnection,
}: Props) {
  // F-CV-002: this projection ran on every parent render — wheel-pan mirrors
  // viewState into React state, so every pan/zoom tick rebuilt the Map and
  // re-projected all connections. Memoize on `frames`; live frame drags are
  // imperative Konva moves that only commit `positions` on drag-end, so prop
  // identity is a correct invalidation signal here (see React.memo below).
  const frameMap = useMemo(() => new Map(frames.map(f => [f.id, f])), [frames]);

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

        // F-CI-208: skip rendering if any coordinate is non-finite (NaN/Infinity).
        // A poisoned frame would otherwise cascade through arrow/curve math and
        // blank the entire canvas.
        if (
          !Number.isFinite(fromPos.x) || !Number.isFinite(fromPos.y) ||
          !Number.isFinite(toPos.x) || !Number.isFinite(toPos.y) ||
          !Number.isFinite(fromFrame.size.width) || !Number.isFinite(fromFrame.size.height) ||
          !Number.isFinite(toFrame.size.width) || !Number.isFinite(toFrame.size.height)
        ) {
          console.warn(`[storyboard-canvas] Skipping connection ${conn.id} — non-finite coordinates on connected frames.`);
          return null;
        }

        // Exit right-center, enter left-center
        const x1 = fromPos.x + fromFrame.size.width;
        const y1 = fromPos.y + fromFrame.size.height / 2;
        const x2 = toPos.x;
        const y2 = toPos.y + toFrame.size.height / 2;

        // Control points for a gentle curve when frames are offset vertically
        const dx = Math.abs(x2 - x1) * 0.4;
        const cx1 = x1 + dx;
        const cx2 = x2 - dx;

        // Midpoint for label placement
        const mx = (x1 + x2) / 2;
        const my = (y1 + y2) / 2 - 12;

        const style = styleFor(conn.type);
        const strokeWidth = style.strokeWidth ?? DEFAULT_STROKE_WIDTH;
        const isSelected = selectedConnectionId === conn.id;

        function handleClick() {
          onSelectConnection?.(isSelected ? null : conn.id);
        }

        return (
          <Group key={conn.id}>
            <Arrow
              points={[x1, y1, cx1, y1, cx2, y2, x2, y2]}
              tension={0.4}
              stroke={isSelected ? '#f8fafc' : style.stroke}
              strokeWidth={isSelected ? strokeWidth + 1 : strokeWidth}
              fill={isSelected ? '#f8fafc' : style.stroke}
              dash={style.dash}
              pointerLength={9}
              pointerWidth={6}
              opacity={isSelected ? 1 : 0.75}
            />

            {/* Invisible wider hit area for easier clicking */}
            {onSelectConnection && (
              <Rect
                x={Math.min(x1, x2)}
                y={my - HIT_AREA_HEIGHT / 2}
                width={Math.abs(x2 - x1)}
                height={HIT_AREA_HEIGHT}
                opacity={0}
                onClick={handleClick}
                onTap={handleClick}
              />
            )}

            {conn.label && (
              <Text
                x={mx - 44}
                y={my}
                width={88}
                text={conn.label}
                fontSize={10}
                fill={isSelected ? '#cbd5e1' : '#64748b'}
                align="center"
                onClick={handleClick}
                onTap={handleClick}
              />
            )}
          </Group>
        );
      })}
    </Group>
  );
}

// F-CV-002: memo() skips re-rendering the whole connection set when props are
// identical — the common case during wheel pan/zoom, where StoryboardCanvas
// re-renders for viewState mirroring but connections/frames/positions/config
// are untouched. onSelectConnection is useCallback-stable in StoryboardCanvas.
export default memo(ConnectionLayer);
