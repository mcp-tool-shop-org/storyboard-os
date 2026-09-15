// ─── FanControls.tsx ──────────────────────────────────────────────────────────
//
// Collapse/expand choice→consequence fans in place, plus optional type and
// readiness filters. Canvas cards stay type/title/one-line/readiness — spec
// does not move onto the board. Not cinematic playlist grouping.
//
// ─────────────────────────────────────────────────────────────────────────────

import type { ChoiceFan } from '@storyboard-os/rpg-domain';
import type { BeatStatusLevel } from '@storyboard-os/rpg-domain';
import type { StoryboardFrameType } from '../../lib/storyboard/schema';
import { textColors } from '@storyboard-os/core';

const TYPE_OPTIONS: ReadonlyArray<{ value: StoryboardFrameType | 'all'; label: string }> = [
  { value: 'all', label: 'All types' },
  { value: 'hook', label: 'Hook' },
  { value: 'scene', label: 'Scene' },
  { value: 'choice', label: 'Choice' },
  { value: 'encounter', label: 'Encounter' },
  { value: 'reveal', label: 'Reveal' },
  { value: 'npc_beat', label: 'NPC Beat' },
  { value: 'consequence', label: 'Consequence' },
];

const READINESS_OPTIONS: ReadonlyArray<{ value: BeatStatusLevel | 'all'; label: string }> = [
  { value: 'all', label: 'All readiness' },
  { value: 'ready', label: 'SPEC' },
  { value: 'partial', label: 'PARTIAL' },
  { value: 'draft', label: 'DRAFT' },
  { value: 'blocked', label: 'BLOCKED' },
];

const SELECT: React.CSSProperties = {
  background: 'rgba(15, 24, 42, 0.95)',
  border: '1px solid rgba(255,255,255,0.12)',
  borderRadius: 5,
  color: '#e2e8f0',
  fontSize: 11,
  padding: '4px 6px',
};

const BTN: React.CSSProperties = {
  background: 'rgba(15,24,42,0.92)',
  border: '1px solid rgba(255,255,255,0.12)',
  borderRadius: 5,
  color: '#cbd5e1',
  cursor: 'pointer',
  fontSize: 11,
  fontWeight: 700,
  padding: '4px 8px',
};

export interface FanControlsProps {
  fans: ChoiceFan[];
  expandedFanIds: ReadonlySet<string>;
  onToggleFan: (parentId: string) => void;
  onExpandAll: () => void;
  onCollapseAll: () => void;
  typeFilter: StoryboardFrameType | 'all';
  readinessFilter: BeatStatusLevel | 'all';
  onTypeFilter: (value: StoryboardFrameType | 'all') => void;
  onReadinessFilter: (value: BeatStatusLevel | 'all') => void;
  visibleCount: number;
  totalCount: number;
}

export default function FanControls({
  fans,
  expandedFanIds,
  onToggleFan,
  onExpandAll,
  onCollapseAll,
  typeFilter,
  readinessFilter,
  onTypeFilter,
  onReadinessFilter,
  visibleCount,
  totalCount,
}: FanControlsProps) {
  const hidden = totalCount - visibleCount;

  return (
    <div
      style={{
        position: 'absolute',
        bottom: 16,
        left: 16,
        zIndex: 20,
        display: 'flex',
        flexDirection: 'column',
        gap: 6,
        maxWidth: 360,
        pointerEvents: 'auto',
      }}
    >
      <div
        role="toolbar"
        aria-label="Board density"
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          gap: 6,
          background: 'rgba(11,17,32,0.88)',
          backdropFilter: 'blur(6px)',
          borderRadius: 8,
          padding: '6px 8px',
          border: '1px solid rgba(255,255,255,0.08)',
        }}
      >
        <span style={{ fontSize: 11, color: textColors.secondary, fontWeight: 600 }}>
          {visibleCount}/{totalCount} visible
          {hidden > 0 ? ` · ${hidden} nested` : ''}
        </span>
        <select
          aria-label="Filter by beat type"
          value={typeFilter}
          onChange={e => onTypeFilter(e.target.value as StoryboardFrameType | 'all')}
          style={SELECT}
        >
          {TYPE_OPTIONS.map(opt => (
            <option key={opt.value} value={opt.value}>{opt.label}</option>
          ))}
        </select>
        <select
          aria-label="Filter by readiness"
          value={readinessFilter}
          onChange={e => onReadinessFilter(e.target.value as BeatStatusLevel | 'all')}
          style={SELECT}
        >
          {READINESS_OPTIONS.map(opt => (
            <option key={opt.value} value={opt.value}>{opt.label}</option>
          ))}
        </select>
      </div>

      {fans.length > 0 && (
        <div
          style={{
            background: 'rgba(11,17,32,0.88)',
            backdropFilter: 'blur(6px)',
            borderRadius: 8,
            padding: '8px 10px',
            border: '1px solid rgba(139,92,246,0.28)',
            display: 'flex',
            flexDirection: 'column',
            gap: 6,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <span style={{ fontSize: 10, fontWeight: 700, color: '#c4b5fd', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
              Choice fans
            </span>
            <button type="button" onClick={onExpandAll} style={{ ...BTN, marginLeft: 'auto' }}>
              Expand all
            </button>
            <button type="button" onClick={onCollapseAll} style={BTN}>
              Collapse
            </button>
          </div>
          {fans.map(fan => {
            const expanded = expandedFanIds.has(fan.parentId);
            return (
              <button
                key={fan.parentId}
                type="button"
                onClick={() => onToggleFan(fan.parentId)}
                aria-expanded={expanded}
                title={expanded ? 'Collapse paths under this choice' : 'Expand paths in place'}
                style={{
                  ...BTN,
                  textAlign: 'left',
                  background: expanded ? 'rgba(139,92,246,0.18)' : BTN.background,
                  border: expanded ? '1px solid rgba(139,92,246,0.45)' : BTN.border,
                }}
              >
                {expanded ? '▾' : '▸'} {fan.parentTitle} ({fan.memberIds.length} paths)
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
