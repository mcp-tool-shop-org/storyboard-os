// ─── TopologyToolbar.tsx ──────────────────────────────────────────────────────
//
// Project-board chrome for manual topology authoring (F-e8c70228).
// Add-beat by type, two-click / picker draw of one connection, delete selected.
// C3: no proposed edges, no fan auto-complete.

import { useState } from 'react';
import type { StoryboardFrameType, StoryboardConnectionType } from '../../lib/storyboard/schema';
import {
  FRAME_TYPE_OPTIONS,
  CONNECTION_TYPE_OPTIONS,
  type TopologyBanner,
} from '../../lib/storyboard/topology';
import { textColors } from '@storyboard-os/core';

export interface TopologyToolbarProps {
  frames: ReadonlyArray<{ id: string; title: string }>;
  selectedFrameId: string | null;
  selectedConnectionId: string | null;
  addDisabled: boolean;
  banner: TopologyBanner | null;
  connectArmed: boolean;
  connectFromId: string | null;
  connectToId: string | null;
  onArmConnect: (armed: boolean) => void;
  onConnectFromChange: (id: string | null) => void;
  onConnectToChange: (id: string | null) => void;
  onAddFrame: (type: StoryboardFrameType) => boolean;
  onAddConnection: (input: {
    fromFrameId: string;
    toFrameId: string;
    type: StoryboardConnectionType;
    label?: string;
  }) => boolean;
  onDeleteSelected: () => void;
}

const SELECT: React.CSSProperties = {
  background: 'rgba(15, 24, 42, 0.95)',
  border: '1px solid rgba(255,255,255,0.12)',
  borderRadius: 5,
  color: '#e2e8f0',
  fontSize: 12,
  padding: '5px 8px',
  minWidth: 108,
};

const INPUT: React.CSSProperties = {
  ...SELECT,
  minWidth: 140,
};

const BTN: React.CSSProperties = {
  background: 'rgba(15,24,42,0.92)',
  border: '1px solid rgba(255,255,255,0.12)',
  borderRadius: 5,
  color: '#cbd5e1',
  cursor: 'pointer',
  fontSize: 12,
  fontWeight: 700,
  padding: '5px 10px',
};

const BTN_ACCENT: React.CSSProperties = {
  ...BTN,
  background: 'rgba(139,92,246,0.18)',
  border: '1px solid rgba(139,92,246,0.4)',
  color: '#ddd6fe',
};

const BTN_DANGER: React.CSSProperties = {
  ...BTN,
  color: '#FCA5A5',
  border: '1px solid rgba(239,68,68,0.35)',
};

export default function TopologyToolbar({
  frames,
  selectedFrameId,
  selectedConnectionId,
  addDisabled,
  banner,
  connectArmed,
  connectFromId,
  connectToId,
  onArmConnect,
  onConnectFromChange,
  onConnectToChange,
  onAddFrame,
  onAddConnection,
  onDeleteSelected,
}: TopologyToolbarProps) {
  const [frameType, setFrameType] = useState<StoryboardFrameType>('scene');
  const [connType, setConnType] = useState<StoryboardConnectionType>('sequence');
  const [connLabel, setConnLabel] = useState('');

  const canDelete = Boolean(selectedFrameId || selectedConnectionId);
  const canCreateConnection = Boolean(connectFromId && connectToId && connectFromId !== connectToId);

  function handleAddBeat() {
    onAddFrame(frameType);
  }

  function handleCreateConnection() {
    if (!connectFromId || !connectToId) return;
    const ok = onAddConnection({
      fromFrameId: connectFromId,
      toFrameId: connectToId,
      type: connType,
      label: connLabel.trim() || undefined,
    });
    if (ok) {
      setConnLabel('');
      onArmConnect(false);
      onConnectFromChange(null);
      onConnectToChange(null);
    }
  }

  function handleCancelConnect() {
    onArmConnect(false);
    onConnectFromChange(null);
    onConnectToChange(null);
    setConnLabel('');
  }

  return (
    <div
      style={{
        position: 'absolute',
        top: 12,
        left: 12,
        zIndex: 21,
        display: 'flex',
        flexDirection: 'column',
        gap: 8,
        maxWidth: 560,
        pointerEvents: 'auto',
      }}
    >
      <div
        role="toolbar"
        aria-label="Board topology"
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
        <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 11, color: textColors.secondary, fontWeight: 600 }}>
          Add beat
          <select
            aria-label="Beat type"
            value={frameType}
            disabled={addDisabled}
            onChange={e => setFrameType(e.target.value as StoryboardFrameType)}
            style={SELECT}
          >
            {FRAME_TYPE_OPTIONS.map(opt => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
        </label>
        <button
          type="button"
          title={addDisabled ? 'Board is at the 100-frame cap' : 'Add a beat of the selected type'}
          disabled={addDisabled}
          onClick={handleAddBeat}
          style={{ ...BTN_ACCENT, opacity: addDisabled ? 0.45 : 1, cursor: addDisabled ? 'not-allowed' : 'pointer' }}
        >
          Add
        </button>

        <div style={{ width: 1, height: 18, background: 'rgba(255,255,255,0.08)', margin: '0 2px' }} />

        <button
          type="button"
          aria-pressed={connectArmed}
          title="Draw one connection. You pick both ends — nothing is suggested."
          onClick={() => (connectArmed ? handleCancelConnect() : onArmConnect(true))}
          style={connectArmed ? BTN_ACCENT : BTN}
        >
          {connectArmed ? 'Connecting…' : 'Draw connection'}
        </button>

        <button
          type="button"
          title={selectedConnectionId ? 'Delete selected connection' : 'Delete selected beat'}
          disabled={!canDelete}
          onClick={onDeleteSelected}
          style={{ ...BTN_DANGER, opacity: canDelete ? 1 : 0.4, cursor: canDelete ? 'pointer' : 'not-allowed' }}
        >
          Delete selected
        </button>
      </div>

      {connectArmed && (
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: 8,
            background: 'rgba(11,17,32,0.92)',
            borderRadius: 8,
            padding: '10px 12px',
            border: '1px solid rgba(139,92,246,0.28)',
          }}
        >
          <p style={{ margin: 0, fontSize: 11, color: textColors.secondary, lineHeight: 1.45 }}>
            Manual connection — click a source beat, then a target. Type and label are yours.
            Edges are never proposed.
          </p>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, alignItems: 'center' }}>
            <label style={{ fontSize: 11, color: textColors.secondary, display: 'flex', alignItems: 'center', gap: 6 }}>
              From
              <select
                aria-label="Connection source"
                value={connectFromId ?? ''}
                onChange={e => onConnectFromChange(e.target.value || null)}
                style={SELECT}
              >
                <option value="">{connectFromId ? '—' : 'Click a beat'}</option>
                {frames.map(f => (
                  <option key={f.id} value={f.id}>{f.title}</option>
                ))}
              </select>
            </label>
            <label style={{ fontSize: 11, color: textColors.secondary, display: 'flex', alignItems: 'center', gap: 6 }}>
              To
              <select
                aria-label="Connection target"
                value={connectToId ?? ''}
                onChange={e => onConnectToChange(e.target.value || null)}
                style={SELECT}
              >
                <option value="">{connectToId ? '—' : 'Then the target'}</option>
                {frames.map(f => (
                  <option key={f.id} value={f.id}>{f.title}</option>
                ))}
              </select>
            </label>
            <label style={{ fontSize: 11, color: textColors.secondary, display: 'flex', alignItems: 'center', gap: 6 }}>
              Type
              <select
                aria-label="Connection type"
                value={connType}
                onChange={e => setConnType(e.target.value as StoryboardConnectionType)}
                style={SELECT}
              >
                {CONNECTION_TYPE_OPTIONS.map(opt => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
            </label>
            <input
              aria-label="Connection label"
              placeholder="Label (optional)"
              value={connLabel}
              onChange={e => setConnLabel(e.target.value)}
              style={INPUT}
            />
            <button
              type="button"
              disabled={!canCreateConnection}
              onClick={handleCreateConnection}
              style={{ ...BTN_ACCENT, opacity: canCreateConnection ? 1 : 0.4, cursor: canCreateConnection ? 'pointer' : 'not-allowed' }}
            >
              Create
            </button>
            <button type="button" onClick={handleCancelConnect} style={BTN}>
              Cancel
            </button>
          </div>
        </div>
      )}

      {banner && (
        <div
          role="status"
          aria-live="polite"
          style={{
            fontSize: 11,
            fontWeight: 600,
            lineHeight: 1.4,
            padding: '6px 10px',
            borderRadius: 6,
            color: banner.tone === 'error' ? '#FCA5A5' : banner.tone === 'warn' ? '#FDBA74' : textColors.secondary,
            background: banner.tone === 'error'
              ? 'rgba(239,68,68,0.12)'
              : banner.tone === 'warn'
                ? 'rgba(249,115,22,0.12)'
                : 'rgba(15,24,42,0.88)',
            border: `1px solid ${
              banner.tone === 'error'
                ? 'rgba(239,68,68,0.35)'
                : banner.tone === 'warn'
                  ? 'rgba(249,115,22,0.35)'
                  : 'rgba(255,255,255,0.08)'
            }`,
          }}
        >
          {banner.text}
        </div>
      )}
    </div>
  );
}
