// ─── rpg-storyboard / StoryboardCanvas.tsx ───────────────────────────────────
//
// RPG app adapter. Owns:
//   - RPG frame type styles (colors, accent, badge labels)
//   - RPG connection type styles
//   - Full page layout: header, canvas area, inspector panel, legend footer
//
// Uses @storyboard-os/canvas for the Konva rendering layer.
// FrameInspector stays here because it reads RPG content fields.
//
// ─────────────────────────────────────────────────────────────────────────────

import { useState, useCallback } from 'react';
import {
  StoryboardCanvas as KonvaBoard,
  type StoryboardCanvasConfig,
} from '@storyboard-os/canvas';
import type { Storyboard } from '../lib/storyboard/schema';
import FrameInspector from './storyboard/FrameInspector';

// ─── RPG canvas config ────────────────────────────────────────────────────────

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
    sequence:    { stroke: '#475569' },
    choice:      { stroke: '#8B5CF6', dash: [8, 4] },
    consequence: { stroke: '#EF4444' },
    optional:    { stroke: '#334155', dash: [4, 4] },
    fallback:    { stroke: '#F97316', dash: [6, 3] },
  },
  defaultFrameStyle:      { bg: '#0e1018', accent: '#475569', label: 'FRAME' },
  defaultConnectionStyle: { stroke: '#475569' },
};

// ─── Legend ───────────────────────────────────────────────────────────────────

const LEGEND = [
  { type: 'sequence',    color: '#475569', label: 'Sequence' },
  { type: 'choice',      color: '#8B5CF6', label: 'Choice branch', dashed: true },
  { type: 'consequence', color: '#EF4444', label: 'Consequence' },
  { type: 'fallback',    color: '#F97316', label: 'Fallback', dashed: true },
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
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const handleSelectFrame = useCallback((id: string | null) => {
    setSelectedId(id);
  }, []);

  const selectedFrame = selectedId
    ? storyboard.frames.find(f => f.id === selectedId) ?? null
    : null;

  return (
    <div style={{ position: 'fixed', inset: 0, display: 'flex', flexDirection: 'column', background: '#0f172a' }}>
      {/* Header bar */}
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
        <span style={{ marginLeft: 'auto', fontSize: 11, color: '#334155' }}>
          {storyboard.frames.length} frames · {storyboard.connections.length} connections
        </span>
      </header>

      {/* Canvas + Inspector row */}
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
            frames={storyboard.frames}
            connections={storyboard.connections}
            config={RPG_CANVAS_CONFIG}
            width={CANVAS_WIDTH}
            height={CANVAS_HEIGHT}
            selectedFrameId={selectedId}
            onSelectFrame={handleSelectFrame}
          />
        </div>

        {/* Inspector panel — RPG content, stays in app */}
        {selectedFrame && (
          <FrameInspector
            frame={selectedFrame}
            storyboardId={storyboard.id}
            onClose={() => setSelectedId(null)}
          />
        )}
      </div>

      {/* Legend footer */}
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
                strokeWidth="1.5"
                strokeDasharray={entry.dashed ? '6 3' : undefined}
              />
              <polygon points="22,2 28,5 22,8" fill={entry.color} />
            </svg>
            <span style={{ fontSize: 11, color: '#475569' }}>{entry.label}</span>
          </div>
        ))}
        <span style={{ marginLeft: 'auto', fontSize: 11, color: '#1e293b' }}>
          click frame to inspect · drag to reposition
        </span>
      </footer>
    </div>
  );
}
