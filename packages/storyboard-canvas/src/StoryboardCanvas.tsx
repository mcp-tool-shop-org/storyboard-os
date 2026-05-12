// ─── storyboard-canvas / StoryboardCanvas.tsx ────────────────────────────────
//
// Reusable Konva Stage renderer for storyboard frames and connections.
//
// Responsibilities:
//   - Renders FrameCard for each frame with the appropriate config style
//   - Renders ConnectionLayer for all connections
//   - Manages frame drag-position state internally
//   - Emits onSelectFrame / onSelectConnection on interaction
//   - Owns viewport state: pan (mouse drag on background), wheel zoom
//   - Exposes ViewportHandle via ref for programmatic fit / center / zoom
//   - Fills its container via ResizeObserver (no explicit width/height props)
//
// NOT responsible for:
//   - App layout (header, footer, inspector panel)
//   - Domain-specific content or vocabulary
//   - Route generation
//
// Viewport interaction model:
//   - Background drag  → pan
//   - Ctrl/Cmd + wheel → zoom at cursor
//   - Plain scroll     → pan (natural trackpad)
//   - Viewport handle  → programmatic fit / reset / zoom / center
//
// ─────────────────────────────────────────────────────────────────────────────

import React, {
  useState,
  useCallback,
  useRef,
  useEffect,
  useImperativeHandle,
} from 'react';
import { Stage, Layer } from 'react-konva';
import type Konva from 'konva';
import type {
  CanvasFrame,
  CanvasConnection,
  StoryboardCanvasConfig,
  PositionMap,
} from './types';
import {
  type ViewState,
  DEFAULT_VIEW_STATE,
  fitViewToFrames,
  centerOnFrame as centerOnFrameMath,
  zoomAtPoint,
  zoomFromCenter,
} from './viewport';
import ConnectionLayer from './ConnectionLayer';
import FrameCard from './FrameCard';

// ─── Public handle exposed via ref ────────────────────────────────────────────

export interface ViewportHandle {
  /** Fit all frames (at their current dragged positions) into the viewport. */
  fitToFrames(): void;
  /** Reset to scale=1, x=0, y=0. */
  resetView(): void;
  /** Zoom in 20% from the container center. */
  zoomIn(): void;
  /** Zoom out 20% from the container center. */
  zoomOut(): void;
  /** Center the viewport on a specific frame, preserving current scale. */
  centerOnFrame(frame: CanvasFrame): void;
  /** Return the current scale factor. */
  getScale(): number;
}

// ─── Component props ──────────────────────────────────────────────────────────

interface Props {
  frames: CanvasFrame[];
  connections: CanvasConnection[];
  config: StoryboardCanvasConfig;
  selectedFrameId?: string | null;
  onSelectFrame?: (frameId: string | null) => void;
  selectedConnectionId?: string | null;
  onSelectConnection?: (connectionId: string | null) => void;
  /**
   * Called whenever the viewport state changes (zoom, pan, fit, reset).
   * Use for displaying the current scale in parent controls.
   */
  onViewStateChange?: (v: ViewState) => void;
  /**
   * Fit all frames into the viewport on first mount (after container is measured).
   * Default: false.
   */
  autoFit?: boolean;
  /**
   * Called once per completed frame drag with the frame's new canvas-space position.
   * Use this to persist layout changes (e.g. for user-created project boards).
   * Template preview boards can omit this to remain non-persistent.
   */
  onFramePositionChange?: (frameId: string, position: { x: number; y: number }) => void;
}

// ─── Internal constants ───────────────────────────────────────────────────────

const DEFAULT_FRAME_STYLE = {
  bg: '#0e1018',
  accent: '#475569',
  label: 'FRAME',
};

const ZOOM_FACTOR = 1.2;
const WHEEL_ZOOM_FACTOR = 1.08;

// ─── Component ────────────────────────────────────────────────────────────────

const StoryboardCanvas = React.forwardRef<ViewportHandle, Props>(
  function StoryboardCanvas(
    {
      frames,
      connections,
      config,
      selectedFrameId,
      onSelectFrame,
      selectedConnectionId,
      onSelectConnection,
      onViewStateChange,
      autoFit = false,
      onFramePositionChange,
    },
    ref,
  ) {
    // ── State ──────────────────────────────────────────────────────────────
    const [positions, setPositions] = useState<PositionMap>(() =>
      Object.fromEntries(frames.map(f => [f.id, { ...f.position }])),
    );

    // viewState is the React-side mirror of the Stage's actual transform.
    // It is always in sync — updated immediately after every applyView call.
    const [viewState, setViewState] = useState<ViewState>(DEFAULT_VIEW_STATE);

    const [containerSize, setContainerSize] = useState({ width: 1200, height: 800 });

    // ── Refs ───────────────────────────────────────────────────────────────
    const containerRef = useRef<HTMLDivElement>(null);
    const stageRef     = useRef<Konva.Stage>(null);

    // Pan tracking (manually managed — NOT Stage.draggable)
    const isPanning  = useRef(false);
    const panStart   = useRef({ clientX: 0, clientY: 0, stageX: 0, stageY: 0 });
    const hasFitted  = useRef(false);

    // ── Reconcile positions with frames prop ───────────────────────────────
    // When the parent adds, removes, or replaces frames, prune orphaned ids
    // and seed new ids from frame.position. Existing dragged positions for
    // frames that still exist are preserved untouched.
    useEffect(() => {
      setPositions(prev => {
        const next: PositionMap = {};
        let changed = false;
        const prevKeys = Object.keys(prev);
        if (prevKeys.length !== frames.length) {
          changed = true;
        }
        for (const f of frames) {
          if (prev[f.id]) {
            next[f.id] = prev[f.id];
          } else {
            next[f.id] = { ...f.position };
            changed = true;
          }
        }
        // If we wrote the same number of keys but any old key disappeared,
        // the length check above caught it. Return prev when nothing changed
        // to avoid an unnecessary re-render.
        return changed ? next : prev;
      });
    }, [frames]);

    // ── Imperative apply ───────────────────────────────────────────────────
    // All viewport changes go through here. Imperatively sets the Konva Stage
    // (immediate visual update) and mirrors into React state (for controls display).
    const applyView = useCallback(
      (v: ViewState) => {
        const stage = stageRef.current;
        if (stage) {
          stage.scale({ x: v.scale, y: v.scale });
          stage.position({ x: v.x, y: v.y });
          stage.batchDraw();
        }
        setViewState(v);
        onViewStateChange?.(v);
      },
      [onViewStateChange],
    );

    // ── Container sizing ───────────────────────────────────────────────────
    useEffect(() => {
      const el = containerRef.current;
      if (!el) return;

      const ro = new ResizeObserver(entries => {
        const { width, height } = entries[0].contentRect;
        if (width > 0 && height > 0) {
          setContainerSize({ width, height });
        }
      });
      ro.observe(el);
      return () => ro.disconnect();
    }, []);

    // ── Auto-fit on first measurement ──────────────────────────────────────
    useEffect(() => {
      if (!autoFit || hasFitted.current) return;
      if (containerSize.width <= 0) return;

      hasFitted.current = true;
      const rects = frames.map(f => ({
        position: positions[f.id] ?? f.position,
        size: f.size,
      }));
      applyView(fitViewToFrames(rects, containerSize.width, containerSize.height));
      // Intentionally not including positions/frames in deps — this fires once
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [containerSize.width, containerSize.height, autoFit]);

    // ── Viewport handle ────────────────────────────────────────────────────
    useImperativeHandle(ref, () => ({
      fitToFrames() {
        const rects = frames.map(f => ({
          position: positions[f.id] ?? f.position,
          size: f.size,
        }));
        applyView(fitViewToFrames(rects, containerSize.width, containerSize.height));
      },
      resetView() {
        applyView(DEFAULT_VIEW_STATE);
      },
      zoomIn() {
        const stage = stageRef.current;
        if (!stage) return;
        const cur: ViewState = { scale: stage.scaleX(), x: stage.x(), y: stage.y() };
        applyView(zoomFromCenter(cur, containerSize.width, containerSize.height, ZOOM_FACTOR));
      },
      zoomOut() {
        const stage = stageRef.current;
        if (!stage) return;
        const cur: ViewState = { scale: stage.scaleX(), x: stage.x(), y: stage.y() };
        applyView(zoomFromCenter(cur, containerSize.width, containerSize.height, 1 / ZOOM_FACTOR));
      },
      centerOnFrame(frame: CanvasFrame) {
        const stage = stageRef.current;
        if (!stage) return;
        const currentPos = positions[frame.id] ?? frame.position;
        const rect = { position: currentPos, size: frame.size };
        applyView(
          centerOnFrameMath(rect, containerSize.width, containerSize.height, stage.scaleX()),
        );
      },
      getScale() {
        return stageRef.current?.scaleX() ?? viewState.scale;
      },
    }));

    // ── Mouse pan ──────────────────────────────────────────────────────────
    // Pan only activates when the mousedown target IS the Stage (background),
    // not a child node. This avoids conflict with frame-card dragging.

    const handleStageMouseDown = useCallback(
      (e: Konva.KonvaEventObject<MouseEvent>) => {
        // `e.target` is the topmost Konva node under the pointer.
        // Only start panning if the click hit the Stage itself.
        const stage = stageRef.current;
        if (!stage || e.target !== stage) return;

        e.evt.preventDefault();
        isPanning.current = true;
        panStart.current = {
          clientX: e.evt.clientX,
          clientY: e.evt.clientY,
          stageX: stage.x(),
          stageY: stage.y(),
        };
        stage.container().style.cursor = 'grabbing';
      },
      [],
    );

    const handleStageMouseMove = useCallback(
      (e: Konva.KonvaEventObject<MouseEvent>) => {
        if (!isPanning.current) return;
        const stage = stageRef.current;
        if (!stage) return;

        const dx = e.evt.clientX - panStart.current.clientX;
        const dy = e.evt.clientY - panStart.current.clientY;
        const newX = panStart.current.stageX + dx;
        const newY = panStart.current.stageY + dy;

        // Imperative update during pan — no React re-render per pixel
        stage.position({ x: newX, y: newY });
        stage.batchDraw();
      },
      [],
    );

    // mouseup on window so release outside the canvas still ends the pan
    useEffect(() => {
      function handleWindowMouseUp() {
        if (!isPanning.current) return;
        isPanning.current = false;

        const stage = stageRef.current;
        if (!stage) return;
        stage.container().style.cursor = '';

        // Sync React state after pan ends
        const newView: ViewState = {
          scale: stage.scaleX(),
          x: stage.x(),
          y: stage.y(),
        };
        setViewState(newView);
        onViewStateChange?.(newView);
      }

      window.addEventListener('mouseup', handleWindowMouseUp);
      return () => window.removeEventListener('mouseup', handleWindowMouseUp);
    }, [onViewStateChange]);

    // ── Wheel handler ──────────────────────────────────────────────────────
    // Ctrl/Cmd + wheel → zoom at cursor
    // Plain scroll      → pan (natural trackpad two-finger scroll)
    const handleWheel = useCallback(
      (e: Konva.KonvaEventObject<WheelEvent>) => {
        e.evt.preventDefault();
        const stage = stageRef.current;
        if (!stage) return;

        const cur: ViewState = { scale: stage.scaleX(), x: stage.x(), y: stage.y() };

        if (e.evt.ctrlKey || e.evt.metaKey) {
          // Zoom at cursor
          const pointer = stage.getPointerPosition();
          if (!pointer) return;
          const factor = e.evt.deltaY < 0 ? WHEEL_ZOOM_FACTOR : 1 / WHEEL_ZOOM_FACTOR;
          applyView(zoomAtPoint(cur, pointer.x, pointer.y, factor));
        } else {
          // Pan — treat deltaX/Y as pixel offsets
          const newX = stage.x() - e.evt.deltaX;
          const newY = stage.y() - e.evt.deltaY;
          stage.position({ x: newX, y: newY });
          stage.batchDraw();
          // Mirror to React state (debounced naturally by browser's scroll coalescing)
          const newView: ViewState = { scale: cur.scale, x: newX, y: newY };
          setViewState(newView);
          onViewStateChange?.(newView);
        }
      },
      [applyView, onViewStateChange],
    );

    // ── Stage click (deselect on background click) ─────────────────────────
    const handleStageClick = useCallback(
      (e: { target: { getType?: () => string } }) => {
        if (
          e.target &&
          typeof e.target.getType === 'function' &&
          e.target.getType() === 'Stage'
        ) {
          onSelectFrame?.(null);
          onSelectConnection?.(null);
        }
      },
      [onSelectFrame, onSelectConnection],
    );

    // ── Frame selection / drag ─────────────────────────────────────────────
    const handleSelectFrame = useCallback(
      (id: string) => {
        onSelectConnection?.(null);
        onSelectFrame?.(selectedFrameId === id ? null : id);
      },
      [onSelectFrame, onSelectConnection, selectedFrameId],
    );

    const handleSelectConnection = useCallback(
      (id: string | null) => {
        onSelectFrame?.(null);
        onSelectConnection?.(id);
      },
      [onSelectFrame, onSelectConnection],
    );

    const handleDragEnd = useCallback((id: string, x: number, y: number) => {
      setPositions(prev => ({ ...prev, [id]: { x, y } }));
      onFramePositionChange?.(id, { x, y });
    }, [onFramePositionChange]);

    // ── Style helper ───────────────────────────────────────────────────────
    function styleFor(type: string) {
      return (
        config.frameTypeStyles[type] ??
        config.defaultFrameStyle ??
        DEFAULT_FRAME_STYLE
      );
    }

    // ── Render ─────────────────────────────────────────────────────────────
    return (
      <div
        ref={containerRef}
        style={{ width: '100%', height: '100%' }}
      >
        <Stage
          ref={stageRef}
          width={containerSize.width}
          height={containerSize.height}
          onMouseDown={handleStageMouseDown}
          onMouseMove={handleStageMouseMove}
          onWheel={handleWheel}
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
      </div>
    );
  },
);

export default StoryboardCanvas;
