// ─── storyboard-canvas / ConnectionLayer.tsx ─────────────────────────────────
//
// Konva Group that renders all storyboard connections as labeled arrows.
// Arrow styles come from config.connectionTypeStyles with a fallback.
// Supports strokeWidth per connection type and optional click-to-select.
//
// ─────────────────────────────────────────────────────────────────────────────

import { memo, useMemo } from 'react';
import { Group, Arrow, Rect, Text } from 'react-konva';
import Konva from 'konva';
import type {
  CanvasConnection,
  CanvasFrame,
  CanvasConnectionStyle,
  StoryboardCanvasConfig,
  PositionMap,
} from './types';
import { DEFAULT_CONNECTION_STYLE } from './defaults';

const DEFAULT_STROKE_WIDTH = 1.5;

// ─── Label sizing (VP-012) ────────────────────────────────────────────────────
// The label box was a fixed 88px with no ellipsis, so long labels clipped at an
// arbitrary character. Auto-size to the measured text up to LABEL_MAX_WIDTH;
// beyond that, clamp to LABEL_MAX_WIDTH and let Konva's ellipsis truncate.
const LABEL_FONT_SIZE = 10;
const LABEL_MIN_WIDTH = 40;
const LABEL_MAX_WIDTH = 140;
const LABEL_PADDING_X = 4;

// ─── Hit target (VP-012) ──────────────────────────────────────────────────────
// The old hit strip was a thin horizontal band spanning x1..x2 at the label y —
// it missed clicks on the vertical/curved portions of an offset connection.
// Replace it with a square-ish target centered on the connection midpoint, which
// is where the label sits and where users aim.
const HIT_TARGET_SIZE = 30;

// Single reusable off-screen Konva.Text for measuring connection-label widths.
// Lazily created (Konva touches a canvas context); guarded for non-DOM envs.
let labelMeasureNode: Konva.Text | null = null;

function measureLabelWidth(text: string): number {
  try {
    if (!labelMeasureNode) {
      labelMeasureNode = new Konva.Text({ fontSize: LABEL_FONT_SIZE });
    }
    return labelMeasureNode.measureSize(text).width;
  } catch {
    // Defensive fallback (no canvas context): rough proportional estimate.
    return text.length * 6;
  }
}

/** Clamp the auto-sized label box to [MIN, MAX], adding horizontal padding. */
function labelBoxWidth(text: string): { width: number; clamped: boolean } {
  const measured = measureLabelWidth(text) + LABEL_PADDING_X * 2;
  if (measured > LABEL_MAX_WIDTH) return { width: LABEL_MAX_WIDTH, clamped: true };
  return { width: Math.max(LABEL_MIN_WIDTH, Math.ceil(measured)), clamped: false };
}

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
      DEFAULT_CONNECTION_STYLE
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

        // Geometric midpoint of the connection (where the hit target sits).
        const mx = (x1 + x2) / 2;
        const midY = (y1 + y2) / 2;
        // Label is drawn just above the midpoint.
        const labelY = midY - 12;

        const style = styleFor(conn.type);
        const strokeWidth = style.strokeWidth ?? DEFAULT_STROKE_WIDTH;
        const isSelected = selectedConnectionId === conn.id;

        // VP-012: auto-size the label box to the measured text (clamped).
        const labelBox = conn.label
          ? labelBoxWidth(conn.label)
          : { width: LABEL_MIN_WIDTH, clamped: false };

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

            {/* VP-012: invisible hit target centered on the connection
                midpoint. The old thin horizontal strip missed clicks on the
                vertical/curved portions of an offset connection; a compact
                square at the midpoint is where the label is and where users
                aim. Also covers the auto-sized label's full width. */}
            {onSelectConnection && (
              <Rect
                x={mx - Math.max(HIT_TARGET_SIZE, labelBox.width) / 2}
                y={midY - HIT_TARGET_SIZE / 2}
                width={Math.max(HIT_TARGET_SIZE, labelBox.width)}
                height={HIT_TARGET_SIZE}
                opacity={0}
                onClick={handleClick}
                onTap={handleClick}
              />
            )}

            {conn.label && (
              <Text
                x={mx - labelBox.width / 2}
                y={labelY}
                width={labelBox.width}
                text={conn.label}
                fontSize={LABEL_FONT_SIZE}
                wrap="none"
                ellipsis={labelBox.clamped}
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
