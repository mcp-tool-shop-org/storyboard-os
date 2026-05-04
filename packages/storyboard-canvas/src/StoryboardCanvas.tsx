// ─── storyboard-canvas / StoryboardCanvas.tsx ────────────────────────────────
//
// Reusable Konva Stage renderer for storyboard frames and connections.
//
// Responsibilities:
//   - Renders FrameCard for each frame with the appropriate config style
//   - Renders ConnectionLayer for all connections
//   - Manages drag-position state internally
//   - Emits onSelectFrame when a card is clicked (or null when stage is clicked)
//   - Emits onSelectConnection when a connection arrow/label is clicked
//   - Clears frame selection when a connection is selected, and vice versa
//
// NOT responsible for:
//   - App layout (header, footer, inspector panel)
//   - Domain-specific content inspection
//   - Route generation
//   - Domain vocabulary of any kind
//
// The parent component owns layout and injects config + callbacks.
//
// ─────────────────────────────────────────────────────────────────────────────

import { useState, useCallback } from 'react';
import { Stage, Layer } from 'react-konva';
import type { CanvasFrame, CanvasConnection, StoryboardCanvasConfig, PositionMap } from './types';
import ConnectionLayer from './ConnectionLayer';
import FrameCard from './FrameCard';

const DEFAULT_FRAME_STYLE = {
  bg: '#0e1018',
  accent: '#475569',
  label: 'FRAME',
};

interface Props {
  frames: CanvasFrame[];
  connections: CanvasConnection[];
  config: StoryboardCanvasConfig;
  width?: number;
  height?: number;
  selectedFrameId?: string | null;
  onSelectFrame?: (frameId: string | null) => void;
  selectedConnectionId?: string | null;
  onSelectConnection?: (connectionId: string | null) => void;
}

export default function StoryboardCanvas({
  frames,
  connections,
  config,
  width = 2400,
  height = 840,
  selectedFrameId,
  onSelectFrame,
  selectedConnectionId,
  onSelectConnection,
}: Props) {
  const [positions, setPositions] = useState<PositionMap>(() =>
    Object.fromEntries(frames.map(f => [f.id, { ...f.position }]))
  );

  const handleStageClick = useCallback(
    (e: { target: { getType?: () => string } }) => {
      if (e.target && typeof e.target.getType === 'function' && e.target.getType() === 'Stage') {
        onSelectFrame?.(null);
        onSelectConnection?.(null);
      }
    },
    [onSelectFrame, onSelectConnection],
  );

  const handleSelectFrame = useCallback(
    (id: string) => {
      // Selecting a frame clears the connection selection
      onSelectConnection?.(null);
      onSelectFrame?.(selectedFrameId === id ? null : id);
    },
    [onSelectFrame, onSelectConnection, selectedFrameId],
  );

  const handleSelectConnection = useCallback(
    (id: string | null) => {
      // Selecting a connection clears the frame selection
      onSelectFrame?.(null);
      onSelectConnection?.(id);
    },
    [onSelectFrame, onSelectConnection],
  );

  const handleDragEnd = useCallback((id: string, x: number, y: number) => {
    setPositions(prev => ({ ...prev, [id]: { x, y } }));
  }, []);

  function styleFor(type: string) {
    return (
      config.frameTypeStyles[type] ??
      config.defaultFrameStyle ??
      DEFAULT_FRAME_STYLE
    );
  }

  return (
    <Stage
      width={width}
      height={height}
      onClick={handleStageClick}
      onTap={handleStageClick}
    >
      {/* Connections below frames — interactive when onSelectConnection is provided */}
      <Layer listening={!!onSelectConnection}>
        <ConnectionLayer
          connections={connections}
          frames={frames}
          positions={positions}
          config={config}
          selectedConnectionId={selectedConnectionId}
          onSelectConnection={onSelectConnection ? handleSelectConnection : undefined}
        />
      </Layer>

      {/* Frame cards */}
      <Layer>
        {frames.map(frame => (
          <FrameCard
            key={frame.id}
            frame={frame}
            position={positions[frame.id] ?? frame.position}
            style={styleFor(frame.type)}
            isSelected={selectedFrameId === frame.id}
            onSelect={handleSelectFrame}
            onDragEnd={handleDragEnd}
          />
        ))}
      </Layer>
    </Stage>
  );
}
