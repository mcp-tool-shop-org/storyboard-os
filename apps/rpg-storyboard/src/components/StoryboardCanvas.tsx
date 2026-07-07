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
import {
  StoryboardCanvas as KonvaBoard,
  type StoryboardCanvasConfig,
  type CanvasFrame,
  type ViewportHandle,
  DEFAULT_CONNECTION_STYLE,
} from '@storyboard-os/canvas';
import {
  getFrameBadges,
  getStoryboardReadiness,
  rpgColors,
  type BeatStatusLevel,
  type FrameContent,
} from '@storyboard-os/rpg-domain';
import { statusColors, surfaces, textColors, typeScale, spacing } from '@storyboard-os/core';
import type { Storyboard } from '../lib/storyboard/schema';
import type { FrameBasicsPatch, FrameProgress, ProjectProgress, ProjectProgressSummary } from '../lib/storyboard/project';
import FrameInspector from './storyboard/FrameInspector';
import ViewControls from './storyboard/ViewControls';
import BeatEditPanel from './projects/BeatEditPanel';
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
  | { kind: 'failed'; message: string }
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
  onFrameContentChange?: (frameId: string, basics: FrameBasicsPatch, content: Partial<FrameContent>) => void;
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
}

function StoryboardCanvasInner({ storyboard, onFramePositionChange, onFrameContentChange, onProgressChange, projectProgress, progressSummary, saveStatus, handoffHref }: Props) {
  const resolvedHandoffHref = handoffHref ?? `/storyboards/${storyboard.id}/handoff`;
  const [selectedFrameId, setSelectedFrameId]           = useState<string | null>(null);
  const [selectedConnectionId, setSelectedConnectionId] = useState<string | null>(null);
  const [editingFrameId, setEditingFrameId]             = useState<string | null>(null);
  const [scale, setScale]                               = useState(1);

  const canvasRef = useRef<ViewportHandle | null>(null);

  const handleSelectFrame = useCallback((id: string | null) => {
    setSelectedFrameId(id);
    // Selecting a different frame cancels any open edit
    setEditingFrameId(null);
  }, []);

  const handleSelectConnection = useCallback((id: string | null) => {
    setSelectedConnectionId(id);
  }, []);

  const handleEditClick = useCallback(() => {
    setEditingFrameId(selectedFrameId);
  }, [selectedFrameId]);

  const handleEditSave = useCallback(
    (basics: FrameBasicsPatch, content: Partial<FrameContent>) => {
      if (editingFrameId && onFrameContentChange) {
        onFrameContentChange(editingFrameId, basics, content);
      }
      setEditingFrameId(null);
    },
    [editingFrameId, onFrameContentChange],
  );

  const handleEditCancel = useCallback(() => {
    setEditingFrameId(null);
  }, []);

  // ── RPG badge + readiness computation ─────────────────────────────────────
  const canvasFrames = useMemo<CanvasFrame[]>(() => {
    return storyboard.frames.map(frame => ({
      id: frame.id,
      type: frame.type,
      title: frame.title,
      summary: frame.summary,
      position: frame.position,
      size: frame.size,
      badges: getFrameBadges(frame),
    }));
  }, [storyboard.frames]);

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
          break;
      }
    }

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

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
            {storyboard.frames.length} frames · {storyboard.connections.length} connections
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
        <div style={{
          flex: 1,
          overflow: 'hidden',
          position: 'relative',
          backgroundImage: 'radial-gradient(circle, #1e293b 1px, transparent 1px)',
          backgroundSize: '32px 32px',
          backgroundPosition: '0 0',
          backgroundColor: surfaces.bgPage,
        }}>
          <KonvaBoard
            ref={canvasRef}
            frames={canvasFrames}
            connections={storyboard.connections}
            config={RPG_CANVAS_CONFIG}
            selectedFrameId={selectedFrameId}
            onSelectFrame={handleSelectFrame}
            selectedConnectionId={selectedConnectionId}
            onSelectConnection={handleSelectConnection}
            onViewStateChange={v => setScale(v.scale)}
            onFramePositionChange={onFramePositionChange}
            autoFit
          />

          {/* Viewport controls — absolutely positioned over canvas */}
          <ViewControls canvasRef={canvasRef} scale={scale} />
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
        {/* Badge legend + shortcut hint. STATE/SPEC colors come from the SAME
            rpgColors source getFrameBadges() uses for the card badges, so the
            footer key and the on-card chips can never drift. */}
        <div style={{ display: 'flex', alignItems: 'center', gap: spacing.sm, marginLeft: 'auto' }}>
          {[
            { text: 'STATE', color: rpgColors.state },
            { text: 'SPEC',  color: rpgColors.ready },
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

  // Failed state — red chip with the error message as a tooltip so the user
  // sees the chip turn red AND can hover for the underlying reason. This is
  // the load-bearing humanization fix for F-AP-201: we must not show a green
  // "Saved" chip after a localStorage write threw.
  if (typeof status === 'object' && status.kind === 'failed') {
    const color = '#EF4444';
    return (
      <span
        title={status.message}
        role="status"
        aria-live="polite"
        style={{
          fontSize: 10, fontWeight: 700, letterSpacing: '0.06em',
          padding: '2px 8px', borderRadius: 4,
          background: `${color}22`,
          border: `1px solid ${color}55`,
          color,
        }}
      >
        Save failed
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
          title={`${count} ${level}`}
          style={{
            fontSize: 10, fontWeight: 700,
            padding: '2px 6px', borderRadius: 3,
            background: `${STATUS_HEADER_COLORS[level]}18`,
            border: `1px solid ${STATUS_HEADER_COLORS[level]}44`,
            color: STATUS_HEADER_COLORS[level],
            letterSpacing: '0.04em',
          }}
        >
          {count} {level.toUpperCase()}
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
}

function ConnectionPanel({ connection, fromTitle, toTitle, onClose }: ConnectionPanelProps) {
  const typeLabel   = CONNECTION_TYPE_LABELS[connection.type]   ?? connection.type.toUpperCase();
  const accentColor = CONNECTION_TYPE_COLORS[connection.type] ?? SLATE_LINE;

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

        {connection.label && (
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
        )}

        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          <span style={{ fontSize: 10, color: textColors.secondary, textTransform: 'uppercase', letterSpacing: '0.1em', fontWeight: 600 }}>
            Connection Type
          </span>
          <p style={{ margin: 0, fontSize: 12, color: textColors.muted, lineHeight: 1.5 }}>
            {connectionTypeDescription(connection.type)}
          </p>
        </div>

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
