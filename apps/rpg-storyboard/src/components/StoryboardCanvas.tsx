// ─── rpg-storyboard / StoryboardCanvas.tsx ───────────────────────────────────
//
// RPG app adapter. Owns:
//   - RPG frame type styles (colors, accent, badge labels)
//   - RPG connection type styles (with strokeWidth for game-state branches)
//   - Frame badge computation via @storyboard-os/rpg-domain signals
//   - Full page layout: header, canvas area, inspector/connection panels, footer
//   - Viewport controls (zoom, pan, fit, reset) — wired to canvas ViewportHandle
//   - Keyboard shortcuts for viewport operations
//
// Uses @storyboard-os/canvas for the Konva rendering layer.
// FrameInspector stays here because it reads RPG content fields.
// ConnectionPanel stays here because it surfaces RPG connection vocabulary.
//
// ─────────────────────────────────────────────────────────────────────────────

import { useState, useCallback, useMemo, useRef, useEffect } from 'react';
import Konva from 'konva';
import {
  StoryboardCanvas as KonvaBoard,
  type StoryboardCanvasConfig,
  type CanvasFrame,
  type ViewportHandle,
  type ViewState,
  DEFAULT_CONNECTION_STYLE,
} from '@storyboard-os/canvas';
import {
  getFrameBadges,
  getStoryboardReadiness,
  rpgColors,
  visibleRpgBoard,
  type BeatStatusLevel,
  type FrameContent,
  type FrameAnnotation,
} from '@storyboard-os/rpg-domain';
import { statusColors, statusLabels, surfaces, textColors, typeScale, spacing } from '@storyboard-os/core';
import type { Storyboard, StoryboardFrameType, StoryboardConnectionType } from '../lib/storyboard/schema';
import type { FrameBasicsPatch, FrameProgress, ProjectProgress, ProjectProgressSummary } from '../lib/storyboard/project';
import { loadBoardView, saveBoardView } from '../lib/storyboard/boardViewStorage';
import type { TopologyBanner } from '../lib/storyboard/topology';
import { CONNECTION_TYPE_OPTIONS } from '../lib/storyboard/topology';
import FrameInspector from './storyboard/FrameInspector';
import ViewControls from './storyboard/ViewControls';
import FanControls from './storyboard/FanControls';
import BeatEditPanel from './projects/BeatEditPanel';
import TopologyToolbar from './projects/TopologyToolbar';
import ErrorBoundary from './ErrorBoundary';

// ─── RPG canvas config ────────────────────────────────────────────────────────
// choice and consequence connections use heavier strokes to visually distinguish
// game-state branches from plain narrative sequence.
//
// Accent + stroke colors come from the shared @storyboard-os/core token API
// (statusColors) so the card badge, legend, inspector, and header all read from
// one source and can never drift. `hook` has no status-token equivalent — it's
// the one authored amber accent, kept as a named local. The per-type `bg` tints
// are unique dark washes, not status colors, so they stay literal.
// `SLATE_LINE` / `SLATE_LINE_DIM` are the neutral connection greys reused across
// the config, legend, and connection panel.

const TYPE_ACCENT_HOOK = '#EAB308'; // amber — no shared status token maps to it
const SLATE_LINE     = '#475569';
const SLATE_LINE_DIM = '#334155';

const RPG_CANVAS_CONFIG: StoryboardCanvasConfig = {
  frameTypeStyles: {
    hook:        { bg: '#1a1500', accent: TYPE_ACCENT_HOOK,   label: 'HOOK' },
    scene:       { bg: '#0c1a2e', accent: statusColors.state, label: 'SCENE' },
    choice:      { bg: '#14092e', accent: statusColors.accent, label: 'CHOICE' },
    encounter:   { bg: '#1f0808', accent: statusColors.blocked, label: 'ENCOUNTER' },
    reveal:      { bg: '#1f0e00', accent: statusColors.partial, label: 'REVEAL' },
    npc_beat:    { bg: '#071a0c', accent: rpgColors.ready,     label: 'NPC BEAT' },
    consequence: { bg: '#0e1018', accent: statusColors.draft,  label: 'CONSEQUENCE' },
  },
  connectionTypeStyles: {
    sequence:    { stroke: SLATE_LINE,                        strokeWidth: 1.5 },
    choice:      { stroke: statusColors.accent,  dash: [8, 4], strokeWidth: 2.5 },
    consequence: { stroke: statusColors.blocked,             strokeWidth: 2.5 },
    optional:    { stroke: SLATE_LINE_DIM,       dash: [4, 4], strokeWidth: 1.5 },
    fallback:    { stroke: statusColors.partial, dash: [6, 3], strokeWidth: 2 },
  },
  defaultFrameStyle:      { bg: '#0e1018', accent: SLATE_LINE, label: 'FRAME' },
  // Byte-identical to the canvas package's exported fallback — reuse it verbatim.
  defaultConnectionStyle: DEFAULT_CONNECTION_STYLE,
};

// ─── Connection type display config ──────────────────────────────────────────

const CONNECTION_TYPE_LABELS: Record<string, string> = {
  sequence:    'Sequence',
  choice:      'Choice Branch',
  consequence: 'Consequence',
  optional:    'Optional Path',
  fallback:    'Fallback',
};

const CONNECTION_TYPE_COLORS: Record<string, string> = {
  sequence:    SLATE_LINE,
  choice:      statusColors.accent,
  consequence: statusColors.blocked,
  optional:    SLATE_LINE_DIM,
  fallback:    statusColors.partial,
};

// ─── Legend ───────────────────────────────────────────────────────────────────

const LEGEND = [
  { type: 'sequence',    color: SLATE_LINE,          label: 'Sequence',    dashed: false, weight: 1.5 },
  { type: 'choice',      color: statusColors.accent,  label: 'Choice',      dashed: true,  weight: 2.5 },
  { type: 'consequence', color: statusColors.blocked, label: 'Consequence', dashed: false, weight: 2.5 },
  { type: 'fallback',    color: statusColors.partial, label: 'Fallback',    dashed: true,  weight: 2 },
];

// ─── Layout constants ─────────────────────────────────────────────────────────

const HEADER_HEIGHT = 48;

// ─── Component ────────────────────────────────────────────────────────────────

/**
 * Authoring save-state machine for the board header chip.
 *
 * - `null` / `'saved'` / `'saving'` are happy-path states.
 * - `{ kind: 'failed', message }` is shown when a localStorage write failed
 *   (quota exceeded, Safari private-mode, serialization error). The user must
 *   see this — a stale "Saved" chip after a failed write means silent data loss.
 */
export type SaveStatus =
  | 'saved'
  | 'saving'
  | { kind: 'failed'; message: string; code?: string }
  | null;

interface Props {
  storyboard: Storyboard;
  /**
   * Called when a frame is dragged to a new position.
   * Omit on read-only boards (template previews). Provide on project boards.
   */
  onFramePositionChange?: (frameId: string, position: { x: number; y: number }) => void;
  /**
   * Called when the user saves edits in BeatEditPanel.
   * Omit on read-only boards. Providing this enables the "Edit Beat" button.
   */
  onFrameContentChange?: (
    frameId: string,
    basics: FrameBasicsPatch,
    content: Partial<FrameContent>,
    annotations?: FrameAnnotation[],
  ) => void;
  /**
   * Called when the user checks/unchecks a checklist item or test criterion.
   * `type` is 'checklist' or 'test'. Project boards only.
   */
  onProgressChange?: (frameId: string, type: 'checklist' | 'test', index: number, complete: boolean) => void;
  /** Full progress record for the project (all frames). Project boards only. */
  projectProgress?: ProjectProgress;
  /** Aggregated completion counts shown in the header. Project boards only. */
  progressSummary?: ProjectProgressSummary;
  /** Optional save-state indicator rendered in the header. */
  saveStatus?: SaveStatus;
  /**
   * Destination URL for the "Handoff →" link in the header.
   * Defaults to `/storyboards/${storyboard.id}/handoff` (template previews).
   * Project boards should pass `/projects/handoff?id=${projectId}`.
   */
  handoffHref?: string;
  /**
   * Stable id used as the sessionStorage key for zoom/pan persistence.
   * Project boards should pass the project id; template previews default to
   * the storyboard id.
   */
  viewStorageKey?: string;
  /**
   * Manual topology authoring (project boards only). Omit on read-only
   * template previews. C3: handlers must not propose or auto-wire edges.
   */
  topology?: {
    addDisabled?: boolean;
    banner?: TopologyBanner | null;
    onAddFrame: (type: StoryboardFrameType) => boolean;
    onRemoveFrame: (frameId: string) => boolean;
    onAddConnection: (input: {
      fromFrameId: string;
      toFrameId: string;
      type: StoryboardConnectionType;
      label?: string;
    }) => boolean;
    onUpdateConnection: (
      connectionId: string,
      patch: { type?: StoryboardConnectionType; label?: string | null },
    ) => boolean;
    onRemoveConnection: (connectionId: string) => boolean;
  };
}

function StoryboardCanvasInner({
  storyboard,
  onFramePositionChange,
  onFrameContentChange,
  onProgressChange,
  projectProgress,
  progressSummary,
  saveStatus,
  handoffHref,
  viewStorageKey,
  topology,
}: Props) {
  const resolvedHandoffHref = handoffHref ?? `/storyboards/${storyboard.id}/handoff`;
  const boardViewKey = viewStorageKey ?? storyboard.id;
  const persistedView = useMemo(() => loadBoardView(boardViewKey), [boardViewKey]);

  const [selectedFrameId, setSelectedFrameId]           = useState<string | null>(null);
  const [selectedConnectionId, setSelectedConnectionId] = useState<string | null>(null);
  const [editingFrameId, setEditingFrameId]             = useState<string | null>(null);
  const [scale, setScale]                               = useState(persistedView?.scale ?? 1);
  const [connectArmed, setConnectArmed]                 = useState(false);
  const [connectFromId, setConnectFromId]               = useState<string | null>(null);
  const [connectToId, setConnectToId]                   = useState<string | null>(null);
  const [expandedFanIds, setExpandedFanIds]             = useState<string[]>([]);
  const [typeFilter, setTypeFilter]                     = useState<StoryboardFrameType | 'all'>('all');
  const [readinessFilter, setReadinessFilter]           = useState<BeatStatusLevel | 'all'>('all');

  const canvasRef = useRef<ViewportHandle | null>(null);
  const boardAreaRef = useRef<HTMLDivElement | null>(null);
  // Skip persisting the first autoFit callback so a fresh board does not lock
  // the autofit framing into sessionStorage before the user adjusts anything.
  const skipPersistCount = useRef(persistedView ? 0 : 1);

  const handleViewStateChange = useCallback(
    (v: ViewState) => {
      setScale(v.scale);
      if (skipPersistCount.current > 0) {
        skipPersistCount.current -= 1;
        return;
      }
      saveBoardView(boardViewKey, v);
    },
    [boardViewKey],
  );

  // Restore persisted zoom/pan after the Konva Stage mounts. Canvas does not
  // yet expose initialViewState/setView (core-infra), so we apply the transform
  // imperatively on the Stage that lives inside our board area. Interactions
  // read from the Stage, so subsequent pan/zoom stay consistent.
  useEffect(() => {
    if (!persistedView) return;
    let cancelled = false;
    let attempts = 0;

    const tryApply = () => {
      if (cancelled) return;
      const root = boardAreaRef.current;
      const stage = Konva.stages.find(s => (root ? root.contains(s.container()) : false));
      if (!stage) {
        if (attempts++ < 60) requestAnimationFrame(tryApply);
        return;
      }
      stage.scale({ x: persistedView.scale, y: persistedView.scale });
      stage.position({ x: persistedView.x, y: persistedView.y });
      stage.batchDraw();
      setScale(persistedView.scale);
    };

    requestAnimationFrame(tryApply);
    return () => {
      cancelled = true;
    };
  }, [persistedView, boardViewKey]);

  const handleSelectFrame = useCallback((id: string | null) => {
    if (connectArmed && id) {
      if (!connectFromId) {
        setConnectFromId(id);
        setSelectedFrameId(id);
        setSelectedConnectionId(null);
        return;
      }
      if (id !== connectFromId) {
        setConnectToId(id);
        setSelectedFrameId(id);
      }
      return;
    }
    setSelectedFrameId(id);
    // Selecting a different frame cancels any open edit
    setEditingFrameId(null);
  }, [connectArmed, connectFromId]);

  const handleSelectConnection = useCallback((id: string | null) => {
    setSelectedConnectionId(id);
  }, []);

  const handleEditClick = useCallback(() => {
    setEditingFrameId(selectedFrameId);
  }, [selectedFrameId]);

  const handleEditSave = useCallback(
    (basics: FrameBasicsPatch, content: Partial<FrameContent>, annotations: FrameAnnotation[]) => {
      if (editingFrameId && onFrameContentChange) {
        onFrameContentChange(editingFrameId, basics, content, annotations);
      }
      setEditingFrameId(null);
    },
    [editingFrameId, onFrameContentChange],
  );

  const handleEditCancel = useCallback(() => {
    setEditingFrameId(null);
  }, []);

  // ── Nest choice fans + optional type/readiness filter (F-b0fe9ec9) ────────
  // Core visibleFrames is preferred inside visibleRpgBoard when present.
  const boardView = useMemo(
    () => visibleRpgBoard(storyboard, {
      expandedFanIds,
      typeFilter,
      readinessFilter,
    }),
    [storyboard, expandedFanIds, typeFilter, readinessFilter],
  );

  const canvasFrames = useMemo<CanvasFrame[]>(() => {
    return boardView.frames.map(frame => ({
      id: frame.id,
      type: frame.type,
      title: frame.title,
      summary: frame.summary,
      position: frame.position,
      size: frame.size,
      badges: getFrameBadges(frame),
    }));
  }, [boardView.frames]);

  const readinessSummary = useMemo(
    () => getStoryboardReadiness(storyboard),
    [storyboard],
  );

  // ── Selected entities ──────────────────────────────────────────────────────
  const selectedFrame = selectedFrameId
    ? storyboard.frames.find(f => f.id === selectedFrameId) ?? null
    : null;

  const selectedConnection = selectedConnectionId
    ? storyboard.connections.find(c => c.id === selectedConnectionId) ?? null
    : null;

  const connFromFrame = selectedConnection
    ? storyboard.frames.find(f => f.id === selectedConnection.fromFrameId)
    : null;

  const connToFrame = selectedConnection
    ? storyboard.frames.find(f => f.id === selectedConnection.toFrameId)
    : null;

  // Progress for the currently selected frame
  const EMPTY_FP: FrameProgress = { checklist: {}, testCriteria: {} };
  const selectedFrameProgress: FrameProgress | undefined = selectedFrameId && projectProgress
    ? (projectProgress.frames[selectedFrameId] ?? EMPTY_FP)
    : undefined;

  // ── Keyboard shortcuts ─────────────────────────────────────────────────────
  // f → fit    0 → reset    +/= → zoom in    - → zoom out    Escape → deselect
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      // Don't intercept when user is typing in an input/textarea
      const tag = (e.target as HTMLElement)?.tagName;
      if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') return;

      switch (e.key) {
        case 'f':
        case 'F':
          canvasRef.current?.fitToFrames();
          break;
        case '0':
          canvasRef.current?.resetView();
          break;
        case '+':
        case '=':
          canvasRef.current?.zoomIn();
          break;
        case '-':
          canvasRef.current?.zoomOut();
          break;
        case 'Escape':
          setSelectedFrameId(null);
          setSelectedConnectionId(null);
          setConnectArmed(false);
          setConnectFromId(null);
          setConnectToId(null);
          break;
        case 'Delete':
          if (!topology || editingFrameId) break;
          if (selectedConnectionId) {
            e.preventDefault();
            if (topology.onRemoveConnection(selectedConnectionId)) {
              setSelectedConnectionId(null);
            }
          } else if (selectedFrameId) {
            e.preventDefault();
            if (topology.onRemoveFrame(selectedFrameId)) {
              setSelectedFrameId(null);
            }
          }
          break;
      }
    }

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [topology, editingFrameId, selectedFrameId, selectedConnectionId]);

  return (
    <div style={{ position: 'fixed', inset: 0, display: 'flex', flexDirection: 'column', background: surfaces.bgChrome }}>

      {/* ── Header bar ────────────────────────────────────────────────────── */}
      <header style={{
        minHeight: HEADER_HEIGHT,
        padding: `0 ${spacing.lg}`,
        background: 'rgba(15,23,42,0.97)',
        borderBottom: `1px solid ${surfaces.border}`,
        display: 'flex', alignItems: 'center', gap: spacing.md, flexWrap: 'wrap',
        flexShrink: 0, zIndex: 30,
      }}>
        {/* Brand — SO wordmark badge ties the app to the marketing site (VP-014) */}
        <a
          href="/"
          aria-label="Storyboard OS home"
          style={{ display: 'flex', alignItems: 'center', gap: spacing.sm, textDecoration: 'none', flexShrink: 0 }}
        >
          <span style={{
            display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
            width: 24, height: 24, borderRadius: 6,
            background: statusColors.accent, color: textColors.onError,
            fontSize: typeScale.xs, fontWeight: 800, letterSpacing: typeScale.tracking.wide,
          }}>
            SO
          </span>
          <span style={{
            fontSize: typeScale.xs, color: textColors.secondary,
            textTransform: 'uppercase', letterSpacing: typeScale.tracking.label, fontWeight: 600,
          }}>
            RPG Storyboard
          </span>
        </a>
        <span aria-hidden="true" style={{ color: textColors.muted }}>|</span>
        <h1 style={{
          fontSize: typeScale.md, fontWeight: 700, color: textColors.heading,
          margin: 0, lineHeight: 1.3,
        }}>
          {storyboard.title}
        </h1>
        {storyboard.description && (
          <span style={{ fontSize: typeScale.sm, color: textColors.secondary, flex: 1, minWidth: 120, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {storyboard.description}
          </span>
        )}
        <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: spacing.sm, flexWrap: 'wrap', justifyContent: 'flex-end' }}>
          <span style={{ fontSize: typeScale.xs, color: textColors.muted }}>
            {boardView.frames.length === storyboard.frames.length
              ? `${storyboard.frames.length} frames · ${storyboard.connections.length} connections`
              : `${boardView.frames.length}/${storyboard.frames.length} visible · ${boardView.connections.length} connections`}
          </span>
          <ReadinessCounts summary={readinessSummary} />
          {progressSummary && <ProgressCounts summary={progressSummary} />}
          {saveStatus && <SaveStatusChip status={saveStatus} />}
          <a
            href="https://mcp-tool-shop-org.github.io/storyboard-os/"
            target="_blank"
            rel="noreferrer"
            style={{
              fontSize: typeScale.xs, fontWeight: 700, letterSpacing: typeScale.tracking.label,
              padding: `${spacing.xs} ${spacing.sm}`, borderRadius: 4,
              border: `1px solid ${surfaces.border}`,
              color: textColors.secondary, textDecoration: 'none',
            }}
          >
            Handbook ↗
          </a>
          <a
            href={resolvedHandoffHref}
            style={{
              fontSize: typeScale.xs, fontWeight: 700, letterSpacing: typeScale.tracking.label,
              padding: `${spacing.xs} ${spacing.sm}`, borderRadius: 4,
              background: 'rgba(71,85,105,0.2)', border: `1px solid ${surfaces.border}`,
              color: textColors.secondary, textDecoration: 'none',
            }}
          >
            Handoff →
          </a>
        </div>
      </header>

      {/* ── Canvas + side panel row ────────────────────────────────────────── */}
      <main style={{ flex: 1, display: 'flex', overflow: 'hidden', position: 'relative' }}>

        {/* Canvas area — fills all remaining space, clip overflow */}
        <div
          ref={boardAreaRef}
          style={{
            flex: 1,
            overflow: 'hidden',
            position: 'relative',
            backgroundImage: 'radial-gradient(circle, #1e293b 1px, transparent 1px)',
            backgroundSize: '32px 32px',
            backgroundPosition: '0 0',
            backgroundColor: surfaces.bgPage,
          }}
        >
          <KonvaBoard
            ref={canvasRef}
            frames={canvasFrames}
            connections={boardView.connections}
            config={RPG_CANVAS_CONFIG}
            selectedFrameId={selectedFrameId}
            onSelectFrame={handleSelectFrame}
            selectedConnectionId={selectedConnectionId}
            onSelectConnection={handleSelectConnection}
            onViewStateChange={handleViewStateChange}
            onFramePositionChange={onFramePositionChange}
            autoFit={!persistedView}
            // Forward-compat: when canvas honors initialViewState, restore is declarative.
            {...(persistedView
              ? { initialViewState: persistedView as ViewState }
              : {})}
          />

          {/* Viewport controls — absolutely positioned over canvas */}
          <ViewControls canvasRef={canvasRef} scale={scale} />

          <FanControls
            fans={boardView.fans}
            expandedFanIds={new Set(expandedFanIds)}
            onToggleFan={id => {
              setExpandedFanIds(current =>
                current.includes(id) ? current.filter(x => x !== id) : [...current, id],
              );
            }}
            onExpandAll={() => setExpandedFanIds(boardView.fans.map(f => f.parentId))}
            onCollapseAll={() => setExpandedFanIds([])}
            typeFilter={typeFilter}
            readinessFilter={readinessFilter}
            onTypeFilter={setTypeFilter}
            onReadinessFilter={setReadinessFilter}
            visibleCount={boardView.frames.length}
            totalCount={storyboard.frames.length}
          />

          {topology && (
            <TopologyToolbar
              frames={storyboard.frames.map(f => ({ id: f.id, title: f.title }))}
              selectedFrameId={selectedFrameId}
              selectedConnectionId={selectedConnectionId}
              addDisabled={Boolean(topology.addDisabled)}
              banner={topology.banner ?? null}
              connectArmed={connectArmed}
              connectFromId={connectFromId}
              connectToId={connectToId}
              onArmConnect={armed => {
                setConnectArmed(armed);
                if (!armed) {
                  setConnectFromId(null);
                  setConnectToId(null);
                }
              }}
              onConnectFromChange={setConnectFromId}
              onConnectToChange={setConnectToId}
              onAddFrame={topology.onAddFrame}
              onAddConnection={topology.onAddConnection}
              onDeleteSelected={() => {
                if (selectedConnectionId) {
                  if (topology.onRemoveConnection(selectedConnectionId)) {
                    setSelectedConnectionId(null);
                  }
                  return;
                }
                if (selectedFrameId) {
                  if (topology.onRemoveFrame(selectedFrameId)) {
                    setSelectedFrameId(null);
                    setEditingFrameId(null);
                  }
                }
              }}
            />
          )}
        </div>

        {/* Beat edit panel — shown when editing a frame (project boards only) */}
        {editingFrameId && selectedFrame && onFrameContentChange && (
          <BeatEditPanel
            frame={selectedFrame}
            onSave={handleEditSave}
            onCancel={handleEditCancel}
          />
        )}

        {/* Frame inspector — shown when a frame is selected and not in edit mode */}
        {selectedFrame && !editingFrameId && (
          <FrameInspector
            frame={selectedFrame}
            storyboardId={storyboard.id}
            onClose={() => setSelectedFrameId(null)}
            onEditClick={onFrameContentChange ? handleEditClick : undefined}
            onDeleteClick={topology && selectedFrameId
              ? () => {
                  if (topology.onRemoveFrame(selectedFrameId)) {
                    setSelectedFrameId(null);
                    setEditingFrameId(null);
                  }
                }
              : undefined}
            frameProgress={selectedFrameProgress}
            onChecklistChange={onProgressChange && selectedFrameId
              ? (index, complete) => onProgressChange(selectedFrameId, 'checklist', index, complete)
              : undefined}
            onTestCriterionChange={onProgressChange && selectedFrameId
              ? (index, complete) => onProgressChange(selectedFrameId, 'test', index, complete)
              : undefined}
          />
        )}

        {/* Connection detail panel — shown when a connection is selected */}
        {selectedConnection && connFromFrame && connToFrame && (
          <ConnectionPanel
            connection={selectedConnection}
            fromTitle={connFromFrame.title}
            toTitle={connToFrame.title}
            onClose={() => setSelectedConnectionId(null)}
            onChange={topology
              ? patch => topology.onUpdateConnection(selectedConnection.id, patch)
              : undefined}
            onDelete={topology
              ? () => {
                  if (topology.onRemoveConnection(selectedConnection.id)) {
                    setSelectedConnectionId(null);
                  }
                }
              : undefined}
          />
        )}
      </main>

      {/* ── Legend footer ─────────────────────────────────────────────────── */}
      <footer style={{
        height: 36,
        padding: `0 ${spacing.lg}`,
        background: 'rgba(15,23,42,0.97)',
        borderTop: `1px solid ${surfaces.border}`,
        display: 'flex', alignItems: 'center', gap: spacing.xl,
        flexShrink: 0,
      }}>
        {LEGEND.map(entry => (
          <div key={entry.type} style={{ display: 'flex', alignItems: 'center', gap: spacing.xs }}>
            <svg width="28" height="10">
              <line
                x1="0" y1="5" x2="22" y2="5"
                stroke={entry.color}
                strokeWidth={entry.weight}
                strokeDasharray={entry.dashed ? '6 3' : undefined}
              />
              <polygon points="22,2 28,5 22,8" fill={entry.color} />
            </svg>
            <span style={{ fontSize: typeScale.xs, color: textColors.secondary }}>{entry.label}</span>
          </div>
        ))}
        {/* Badge legend + shortcut hint. Colors come from the SAME rpgColors
            source getFrameBadges() uses for the card badges, so the footer key
            and the on-card chips can never drift. BLOCKED is included because
            domain-blocked beats now emit that badge instead of SPEC/PARTIAL. */}
        <div style={{ display: 'flex', alignItems: 'center', gap: spacing.sm, marginLeft: 'auto' }}>
          {[
            { text: 'STATE',   color: rpgColors.state },
            { text: 'SPEC',    color: rpgColors.ready },
            { text: 'BLOCKED', color: rpgColors.blocked },
          ].map(b => (
            <span
              key={b.text}
              style={{
                fontSize: 9, fontWeight: 700, letterSpacing: typeScale.tracking.label,
                padding: '1px 5px', borderRadius: 3,
                border: `1px solid ${b.color}55`,
                color: b.color, background: `${b.color}1a`,
              }}
            >
              {b.text}
            </span>
          ))}
          <span style={{ fontSize: typeScale.xs, color: textColors.muted }}>
            drag to pan · scroll to pan · ctrl+scroll to zoom · F fit · 0 reset
          </span>
        </div>
      </footer>
    </div>
  );
}

// ─── ProgressCounts ───────────────────────────────────────────────────────────

function ProgressCounts({ summary }: { summary: ProjectProgressSummary }) {
  if (summary.totalChecklist === 0 && summary.totalTests === 0) return null;
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
      {summary.totalChecklist > 0 && (
        <span
          title={`${summary.doneChecklist}/${summary.totalChecklist} tasks complete`}
          style={{
            fontSize: 10, fontWeight: 700, letterSpacing: '0.04em',
            padding: '2px 7px', borderRadius: 3,
            background: '#22C55E18', border: '1px solid #22C55E44',
            color: '#22C55E',
          }}
        >
          ✓ {summary.doneChecklist}/{summary.totalChecklist}
        </span>
      )}
      {summary.totalTests > 0 && (
        <span
          title={`${summary.doneTests}/${summary.totalTests} tests passed`}
          style={{
            fontSize: 10, fontWeight: 700, letterSpacing: '0.04em',
            padding: '2px 7px', borderRadius: 3,
            background: '#3B82F618', border: '1px solid #3B82F644',
            color: '#3B82F6',
          }}
        >
          ✦ {summary.doneTests}/{summary.totalTests}
        </span>
      )}
    </div>
  );
}

// ─── SaveStatusChip ───────────────────────────────────────────────────────────

function SaveStatusChip({ status }: { status: SaveStatus }) {
  if (!status) return null;

  // Failed state — show WHAT failed and WHERE to recover (Projects delete UI),
  // not a bare "Save failed" that hides the recovery path in a tooltip.
  if (typeof status === 'object' && status.kind === 'failed') {
    const color = '#EF4444';
    return (
      <span
        role="status"
        aria-live="polite"
        style={{
          display: 'inline-flex', alignItems: 'center', gap: 8, flexWrap: 'wrap',
          fontSize: 10, fontWeight: 700, letterSpacing: '0.04em',
          padding: '3px 8px', borderRadius: 4,
          background: `${color}22`,
          border: `1px solid ${color}55`,
          color,
          maxWidth: 420,
        }}
      >
        <span style={{ lineHeight: 1.35 }}>{status.message}</span>
        <a
          href="/projects"
          style={{
            color: '#FCA5A5', textDecoration: 'underline',
            whiteSpace: 'nowrap', fontWeight: 700,
          }}
        >
          {status.code === 'STORE_CORRUPT'
            ? 'Open Projects to recover storage →'
            : 'Open Projects to delete →'}
        </a>
      </span>
    );
  }

  const label  = status === 'saving' ? 'Saving…' : 'Saved';
  const color  = status === 'saving' ? '#F97316' : '#22C55E';
  return (
    <span style={{
      fontSize: 10, fontWeight: 700, letterSpacing: '0.06em',
      padding: '2px 8px', borderRadius: 4,
      background: `${color}18`,
      border: `1px solid ${color}44`,
      color,
    }}>
      {label}
    </span>
  );
}

// ─── ReadinessCounts ──────────────────────────────────────────────────────────

const STATUS_HEADER_COLORS: Record<BeatStatusLevel, string> = {
  ready:   statusColors.spec,
  partial: statusColors.partial,
  draft:   statusColors.draft,
  blocked: statusColors.blocked,
};

function ReadinessCounts({ summary }: { summary: ReturnType<typeof getStoryboardReadiness> }) {
  // Annotate the source array, not the filter result — contextual typing does
  // not flow through .filter(), so annotating the filtered variable left the
  // literals widened to `{ level: string }` (ts2322).
  const allChips: Array<{ level: BeatStatusLevel; count: number }> = [
    { level: 'ready',   count: summary.ready },
    { level: 'partial', count: summary.partial },
    { level: 'blocked', count: summary.blocked },
    { level: 'draft',   count: summary.draft },
  ];
  const chips = allChips.filter(c => c.count > 0);

  if (chips.length === 0) return null;

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
      {chips.map(({ level, count }) => (
        <span
          key={level}
          title={`${count} ${statusLabels[level]}`}
          style={{
            fontSize: 10, fontWeight: 700,
            padding: '2px 6px', borderRadius: 3,
            background: `${STATUS_HEADER_COLORS[level]}18`,
            border: `1px solid ${STATUS_HEADER_COLORS[level]}44`,
            color: STATUS_HEADER_COLORS[level],
            letterSpacing: '0.04em',
          }}
        >
          {count} {statusLabels[level]}
        </span>
      ))}
    </div>
  );
}

// ─── ConnectionPanel ──────────────────────────────────────────────────────────

interface ConnectionPanelProps {
  connection: { id: string; type: string; label?: string };
  fromTitle: string;
  toTitle: string;
  onClose: () => void;
  onChange?: (patch: { type?: StoryboardConnectionType; label?: string | null }) => void;
  onDelete?: () => void;
}

function ConnectionPanel({ connection, fromTitle, toTitle, onClose, onChange, onDelete }: ConnectionPanelProps) {
  const typeLabel   = CONNECTION_TYPE_LABELS[connection.type]   ?? connection.type.toUpperCase();
  const accentColor = CONNECTION_TYPE_COLORS[connection.type] ?? SLATE_LINE;
  const [labelDraft, setLabelDraft] = useState(connection.label ?? '');

  useEffect(() => {
    setLabelDraft(connection.label ?? '');
  }, [connection.id, connection.label]);

  return (
    <aside
      role="complementary"
      aria-label={`Connection details: ${typeLabel}`}
      style={{
        width: 280,
        flexShrink: 0,
        background: '#0f1825',
        borderLeft: `1px solid ${surfaces.border}`,
        display: 'flex',
        flexDirection: 'column',
        overflowY: 'auto',
      }}
    >
      <div style={{
        padding: '12px 16px',
        borderBottom: '1px solid rgba(255,255,255,0.07)',
        display: 'flex',
        alignItems: 'center',
        gap: 8,
        flexShrink: 0,
      }}>
        <span style={{
          display: 'inline-block',
          width: 10, height: 10,
          borderRadius: '50%',
          background: accentColor,
          flexShrink: 0,
        }} />
        <span style={{ fontSize: 11, fontWeight: 700, color: accentColor, textTransform: 'uppercase', letterSpacing: '0.1em' }}>
          {typeLabel}
        </span>
        <button
          onClick={onClose}
          style={{
            marginLeft: 'auto',
            background: 'none', border: 'none', cursor: 'pointer',
            color: textColors.secondary, fontSize: 18, lineHeight: 1, padding: '0 2px',
          }}
          aria-label="Close connection panel"
        >
          ×
        </button>
      </div>

      <div style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: 16 }}>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          <span style={{ fontSize: 10, color: textColors.secondary, textTransform: 'uppercase', letterSpacing: '0.1em', fontWeight: 600 }}>
            Flow
          </span>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{
              fontSize: 12, color: '#cbd5e1', background: 'rgba(255,255,255,0.05)',
              padding: '4px 8px', borderRadius: 4, flex: 1, minWidth: 0,
              overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
            }}>
              {fromTitle}
            </span>
            <svg width="20" height="10" style={{ flexShrink: 0 }}>
              <line x1="0" y1="5" x2="14" y2="5" stroke={accentColor} strokeWidth="1.5" />
              <polygon points="14,2.5 20,5 14,7.5" fill={accentColor} />
            </svg>
            <span style={{
              fontSize: 12, color: '#cbd5e1', background: 'rgba(255,255,255,0.05)',
              padding: '4px 8px', borderRadius: 4, flex: 1, minWidth: 0,
              overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
            }}>
              {toTitle}
            </span>
          </div>
        </div>

        {onChange ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            <span style={{ fontSize: 10, color: textColors.secondary, textTransform: 'uppercase', letterSpacing: '0.1em', fontWeight: 600 }}>
              Connection Type
            </span>
            <select
              aria-label="Connection type"
              value={connection.type}
              onChange={e => onChange({ type: e.target.value as StoryboardConnectionType })}
              style={{
                background: 'rgba(255,255,255,0.05)',
                border: `1px solid ${accentColor}55`,
                borderRadius: 4,
                color: '#e2e8f0',
                fontSize: 12,
                padding: '6px 8px',
              }}
            >
              {CONNECTION_TYPE_OPTIONS.map(opt => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
            <p style={{ margin: 0, fontSize: 12, color: textColors.muted, lineHeight: 1.5 }}>
              {connectionTypeDescription(connection.type)}
            </p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            <span style={{ fontSize: 10, color: textColors.secondary, textTransform: 'uppercase', letterSpacing: '0.1em', fontWeight: 600 }}>
              Connection Type
            </span>
            <p style={{ margin: 0, fontSize: 12, color: textColors.muted, lineHeight: 1.5 }}>
              {connectionTypeDescription(connection.type)}
            </p>
          </div>
        )}

        {onChange ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            <span style={{ fontSize: 10, color: textColors.secondary, textTransform: 'uppercase', letterSpacing: '0.1em', fontWeight: 600 }}>
              Condition / Result
            </span>
            <input
              aria-label="Connection label"
              value={labelDraft}
              placeholder="Optional label"
              onChange={e => setLabelDraft(e.target.value)}
              onBlur={() => {
                const next = labelDraft.trim();
                const prev = connection.label ?? '';
                if (next === prev) return;
                onChange({ label: next.length > 0 ? next : null });
              }}
              style={{
                background: 'rgba(255,255,255,0.05)',
                border: `1px solid ${accentColor}33`,
                borderRadius: 4,
                color: '#f1f5f9',
                fontSize: 13,
                padding: '8px 10px',
              }}
            />
          </div>
        ) : connection.label ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            <span style={{ fontSize: 10, color: textColors.secondary, textTransform: 'uppercase', letterSpacing: '0.1em', fontWeight: 600 }}>
              Condition / Result
            </span>
            <p style={{
              margin: 0, fontSize: 13, color: '#f1f5f9',
              background: `${accentColor}1a`,
              border: `1px solid ${accentColor}33`,
              borderRadius: 4, padding: '8px 10px',
              lineHeight: 1.5,
            }}>
              {connection.label}
            </p>
          </div>
        ) : null}

        {onDelete && (
          <button
            type="button"
            onClick={onDelete}
            style={{
              marginTop: 4,
              background: 'rgba(239,68,68,0.12)',
              border: '1px solid rgba(239,68,68,0.35)',
              borderRadius: 4,
              color: '#FCA5A5',
              cursor: 'pointer',
              fontSize: 12,
              fontWeight: 700,
              padding: '8px 10px',
            }}
          >
            Delete connection
          </button>
        )}

      </div>
    </aside>
  );
}

function connectionTypeDescription(type: string): string {
  switch (type) {
    case 'sequence':
      return 'Linear progression — this beat leads directly to the next without branching.';
    case 'choice':
      return 'Player-driven branch — one of several paths the player can take from a choice point.';
    case 'consequence':
      return 'Outcome arc — a game-state change drives the story into this beat.';
    case 'optional':
      return 'Conditional or skippable path — this transition may not occur in every playthrough.';
    case 'fallback':
      return 'Alternate route — this path activates if the primary path is unavailable or blocked.';
    default:
      return `Connection type: ${type}`;
  }
}

export default function StoryboardCanvas(props: Props) {
  const handoffHref = props.handoffHref ?? `/storyboards/${props.storyboard.id}/handoff`;
  return (
    <ErrorBoundary handoffHref={handoffHref}>
      <StoryboardCanvasInner {...props} />
    </ErrorBoundary>
  );
}
