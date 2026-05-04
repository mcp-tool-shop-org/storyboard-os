// ─── rpg-storyboard / StoryboardCanvas.tsx ───────────────────────────────────
//
// RPG app adapter. Owns:
//   - RPG frame type styles (colors, accent, badge labels)
//   - RPG connection type styles (with strokeWidth for game-state branches)
//   - Frame badge computation via @storyboard-os/rpg-domain signals
//   - Full page layout: header, canvas area, inspector/connection panels, footer
//
// Uses @storyboard-os/canvas for the Konva rendering layer.
// FrameInspector stays here because it reads RPG content fields.
// ConnectionPanel stays here because it surfaces RPG connection vocabulary.
//
// ─────────────────────────────────────────────────────────────────────────────

import { useState, useCallback, useMemo } from 'react';
import {
  StoryboardCanvas as KonvaBoard,
  type StoryboardCanvasConfig,
  type CanvasFrame,
} from '@storyboard-os/canvas';
import {
  getFrameBadges,
  getChoiceBranchCount,
  getStoryboardReadiness,
  type BeatStatusLevel,
} from '@storyboard-os/rpg-domain';
import type { Storyboard } from '../lib/storyboard/schema';
import FrameInspector from './storyboard/FrameInspector';

// ─── RPG canvas config ────────────────────────────────────────────────────────
// choice and consequence connections use heavier strokes to visually distinguish
// game-state branches from plain narrative sequence.

const RPG_CANVAS_CONFIG: StoryboardCanvasConfig = {
  frameTypeStyles: {
    hook:        { bg: '#1a1500', accent: '#EAB308', label: 'HOOK' },
    scene:       { bg: '#0c1a2e', accent: '#3B82F6', label: 'SCENE' },
    choice:      { bg: '#14092e', accent: '#8B5CF6', label: 'CHOICE' },
    encounter:   { bg: '#1f0808', accent: '#EF4444', label: 'ENCOUNTER' },
    reveal:      { bg: '#1f0e00', accent: '#F97316', label: 'REVEAL' },
    npc_beat:    { bg: '#071a0c', accent: '#22C55E', label: 'NPC BEAT' },
    consequence: { bg: '#0e1018', accent: '#6B7280', label: 'CONSEQUENCE' },
  },
  connectionTypeStyles: {
    sequence:    { stroke: '#475569',                strokeWidth: 1.5 },
    choice:      { stroke: '#8B5CF6', dash: [8, 4],  strokeWidth: 2.5 },
    consequence: { stroke: '#EF4444',                strokeWidth: 2.5 },
    optional:    { stroke: '#334155', dash: [4, 4],  strokeWidth: 1.5 },
    fallback:    { stroke: '#F97316', dash: [6, 3],  strokeWidth: 2 },
  },
  defaultFrameStyle:      { bg: '#0e1018', accent: '#475569', label: 'FRAME' },
  defaultConnectionStyle: { stroke: '#475569', strokeWidth: 1.5 },
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
  sequence:    '#475569',
  choice:      '#8B5CF6',
  consequence: '#EF4444',
  optional:    '#334155',
  fallback:    '#F97316',
};

// ─── Legend ───────────────────────────────────────────────────────────────────

const LEGEND = [
  { type: 'sequence',    color: '#475569', label: 'Sequence',    dashed: false, weight: 1.5 },
  { type: 'choice',      color: '#8B5CF6', label: 'Choice',      dashed: true,  weight: 2.5 },
  { type: 'consequence', color: '#EF4444', label: 'Consequence', dashed: false, weight: 2.5 },
  { type: 'fallback',    color: '#F97316', label: 'Fallback',    dashed: true,  weight: 2 },
];

// ─── Layout constants ─────────────────────────────────────────────────────────

const CANVAS_WIDTH  = 2400;
const CANVAS_HEIGHT = 840;
const HEADER_HEIGHT = 48;

// ─── Component ────────────────────────────────────────────────────────────────

interface Props {
  storyboard: Storyboard;
}

export default function StoryboardCanvas({ storyboard }: Props) {
  const [selectedFrameId, setSelectedFrameId]           = useState<string | null>(null);
  const [selectedConnectionId, setSelectedConnectionId] = useState<string | null>(null);

  const handleSelectFrame = useCallback((id: string | null) => {
    setSelectedFrameId(id);
  }, []);

  const handleSelectConnection = useCallback((id: string | null) => {
    setSelectedConnectionId(id);
  }, []);

  // ── RPG badge + readiness computation ─────────────────────────────────────
  // Map domain frames → CanvasFrame[], injecting RPG-derived badges.
  // Compute board-level readiness summary for the header.
  // Both memoised — only recompute when storyboard data changes.
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

  const branchCount = selectedFrame
    ? getChoiceBranchCount(selectedFrame.id, storyboard.connections)
    : 0;

  return (
    <div style={{ position: 'fixed', inset: 0, display: 'flex', flexDirection: 'column', background: '#0f172a' }}>

      {/* ── Header bar ────────────────────────────────────────────────────── */}
      <header style={{
        height: HEADER_HEIGHT,
        padding: '0 20px',
        background: 'rgba(15,23,42,0.97)',
        borderBottom: '1px solid rgba(255,255,255,0.08)',
        display: 'flex', alignItems: 'center', gap: 16,
        flexShrink: 0, zIndex: 30,
      }}>
        <span style={{ fontSize: 11, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.12em', fontWeight: 600 }}>
          RPG Storyboard
        </span>
        <span style={{ color: '#1e293b' }}>|</span>
        <span style={{ fontSize: 14, fontWeight: 700, color: '#f1f5f9' }}>
          {storyboard.title}
        </span>
        {storyboard.description && (
          <span style={{ fontSize: 12, color: '#475569', flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {storyboard.description}
          </span>
        )}
        <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 10 }}>
          <span style={{ fontSize: 11, color: '#334155' }}>
            {storyboard.frames.length} frames · {storyboard.connections.length} connections
          </span>
          <ReadinessCounts summary={readinessSummary} />
        </div>
      </header>

      {/* ── Canvas + side panel row ────────────────────────────────────────── */}
      <div style={{ flex: 1, display: 'flex', overflow: 'hidden', position: 'relative' }}>

        {/* Scrollable canvas */}
        <div style={{
          flex: 1,
          overflow: 'auto',
          position: 'relative',
          backgroundImage: 'radial-gradient(circle, #1e293b 1px, transparent 1px)',
          backgroundSize: '32px 32px',
          backgroundPosition: '0 0',
          backgroundColor: '#0b1120',
        }}>
          <KonvaBoard
            frames={canvasFrames}
            connections={storyboard.connections}
            config={RPG_CANVAS_CONFIG}
            width={CANVAS_WIDTH}
            height={CANVAS_HEIGHT}
            selectedFrameId={selectedFrameId}
            onSelectFrame={handleSelectFrame}
            selectedConnectionId={selectedConnectionId}
            onSelectConnection={handleSelectConnection}
          />
        </div>

        {/* Frame inspector — shown when a frame is selected */}
        {selectedFrame && (
          <FrameInspector
            frame={selectedFrame}
            storyboardId={storyboard.id}
            onClose={() => setSelectedFrameId(null)}
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
      </div>

      {/* ── Legend footer ─────────────────────────────────────────────────── */}
      <footer style={{
        height: 36,
        padding: '0 20px',
        background: 'rgba(15,23,42,0.97)',
        borderTop: '1px solid rgba(255,255,255,0.06)',
        display: 'flex', alignItems: 'center', gap: 20,
        flexShrink: 0,
      }}>
        {LEGEND.map(entry => (
          <div key={entry.type} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <svg width="28" height="10">
              <line
                x1="0" y1="5" x2="22" y2="5"
                stroke={entry.color}
                strokeWidth={entry.weight}
                strokeDasharray={entry.dashed ? '6 3' : undefined}
              />
              <polygon points="22,2 28,5 22,8" fill={entry.color} />
            </svg>
            <span style={{ fontSize: 11, color: '#475569' }}>{entry.label}</span>
          </div>
        ))}
        {/* Badge legend */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginLeft: 'auto' }}>
          {[
            { text: 'STATE', color: '#3B82F6' },
            { text: 'SPEC',  color: '#22C55E' },
          ].map(b => (
            <span
              key={b.text}
              style={{
                fontSize: 9, fontWeight: 700, letterSpacing: '0.05em',
                padding: '1px 5px', borderRadius: 3,
                border: `1px solid ${b.color}55`,
                color: b.color, background: `${b.color}1a`,
              }}
            >
              {b.text}
            </span>
          ))}
          <span style={{ fontSize: 11, color: '#1e293b' }}>
            click frame or connection · drag to reposition
          </span>
        </div>
      </footer>
    </div>
  );
}

// ─── ReadinessCounts ──────────────────────────────────────────────────────────
// Small inline header widget showing board-level implementation status counts.
// Only shows non-zero counts to reduce noise on sparse boards.

const STATUS_HEADER_COLORS: Record<BeatStatusLevel, string> = {
  ready:   '#22C55E',
  partial: '#F97316',
  draft:   '#6B7280',
  blocked: '#EF4444',
};

function ReadinessCounts({ summary }: { summary: ReturnType<typeof getStoryboardReadiness> }) {
  const chips: Array<{ level: BeatStatusLevel; count: number }> = [
    { level: 'ready',   count: summary.ready },
    { level: 'partial', count: summary.partial },
    { level: 'blocked', count: summary.blocked },
    { level: 'draft',   count: summary.draft },
  ].filter(c => c.count > 0);

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
// Inline sub-component. Stays in this file — it reads RPG connection
// vocabulary (type names, colors) and is not reusable across domains.

interface ConnectionPanelProps {
  connection: { id: string; type: string; label?: string };
  fromTitle: string;
  toTitle: string;
  onClose: () => void;
}

function ConnectionPanel({ connection, fromTitle, toTitle, onClose }: ConnectionPanelProps) {
  const typeLabel   = CONNECTION_TYPE_LABELS[connection.type]   ?? connection.type.toUpperCase();
  const accentColor = CONNECTION_TYPE_COLORS[connection.type] ?? '#475569';

  return (
    <aside style={{
      width: 280,
      flexShrink: 0,
      background: '#0f1825',
      borderLeft: '1px solid rgba(255,255,255,0.07)',
      display: 'flex',
      flexDirection: 'column',
      overflowY: 'auto',
    }}>
      {/* Panel header */}
      <div style={{
        padding: '12px 16px',
        borderBottom: '1px solid rgba(255,255,255,0.07)',
        display: 'flex',
        alignItems: 'center',
        gap: 8,
        flexShrink: 0,
      }}>
        {/* Color pill */}
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
            color: '#475569', fontSize: 18, lineHeight: 1, padding: '0 2px',
          }}
          aria-label="Close connection panel"
        >
          ×
        </button>
      </div>

      {/* Connection body */}
      <div style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: 16 }}>

        {/* Flow path */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          <span style={{ fontSize: 10, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.1em', fontWeight: 600 }}>
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

        {/* Connection label / condition */}
        {connection.label && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            <span style={{ fontSize: 10, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.1em', fontWeight: 600 }}>
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

        {/* Type explanation */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          <span style={{ fontSize: 10, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.1em', fontWeight: 600 }}>
            Connection Type
          </span>
          <p style={{ margin: 0, fontSize: 12, color: '#64748b', lineHeight: 1.5 }}>
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
