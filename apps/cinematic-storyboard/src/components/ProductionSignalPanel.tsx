// ─── cinematic-storyboard / ProductionSignalPanel.tsx ─────────────────────────
//
// Answers at a glance: "What makes this sequence hard to produce?"
//
// Shows: health badge, pressure summary, blocked shots, duration rollup,
// continuity risks, VFX/audio burden, camera complexity.
//
// Collapsible sections — opens from a header toggle or keyboard shortcut (P).
//
// ─────────────────────────────────────────────────────────────────────────────

import { useState } from 'react';
import type { ProductionSignals, SequenceHealthLevel } from '@storyboard-os/cinematic-domain';

// ─── Health colors ────────────────────────────────────────────────────────────

const HEALTH_COLORS: Record<SequenceHealthLevel, string> = {
  green: '#22C55E',
  yellow: '#EAB308',
  red: '#EF4444',
};

const HEALTH_LABELS: Record<SequenceHealthLevel, string> = {
  green: 'READY',
  yellow: 'AT RISK',
  red: 'BLOCKED',
};

// ─── Section label style ──────────────────────────────────────────────────────

const SECTION_LABEL: React.CSSProperties = {
  fontSize: 10,
  color: '#475569',
  textTransform: 'uppercase',
  letterSpacing: '0.1em',
  fontWeight: 600,
  marginBottom: 6,
};

const SECTION_VALUE: React.CSSProperties = {
  fontSize: 12,
  color: '#cbd5e1',
  lineHeight: 1.6,
};

const ITEM_CHIP: React.CSSProperties = {
  fontSize: 11,
  color: '#94a3b8',
  padding: '3px 8px',
  background: 'rgba(255,255,255,0.04)',
  border: '1px solid rgba(255,255,255,0.08)',
  borderRadius: 4,
};

// ─── Component ────────────────────────────────────────────────────────────────

interface Props {
  signals: ProductionSignals;
  onClose: () => void;
}

export default function ProductionSignalPanel({ signals, onClose }: Props) {
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set(['pressure', 'blocked']));

  const toggle = (section: string) => {
    setExpandedSections(prev => {
      const next = new Set(prev);
      if (next.has(section)) next.delete(section);
      else next.add(section);
      return next;
    });
  };

  const healthColor = HEALTH_COLORS[signals.health];

  return (
    <aside style={{
      width: 340,
      flexShrink: 0,
      background: '#0f1825',
      borderLeft: '1px solid rgba(255,255,255,0.07)',
      display: 'flex',
      flexDirection: 'column',
      overflowY: 'auto',
    }}>
      {/* ── Header ────────────────────────────────────────────────────────── */}
      <div style={{
        padding: '12px 16px',
        borderBottom: '1px solid rgba(255,255,255,0.07)',
        display: 'flex',
        alignItems: 'center',
        gap: 8,
        flexShrink: 0,
      }}>
        <span style={{
          fontSize: 9,
          fontWeight: 700,
          letterSpacing: '0.06em',
          padding: '2px 7px',
          borderRadius: 3,
          background: `${healthColor}18`,
          border: `1px solid ${healthColor}44`,
          color: healthColor,
        }}>
          {HEALTH_LABELS[signals.health]}
        </span>
        <span style={{ fontSize: 12, color: '#94a3b8', flex: 1 }}>
          {signals.healthReason}
        </span>
        <button
          onClick={onClose}
          style={{
            background: 'none', border: 'none', cursor: 'pointer',
            color: '#475569', fontSize: 18, lineHeight: 1, padding: '0 2px',
          }}
          aria-label="Close production signals panel"
        >
          ×
        </button>
      </div>

      <div style={{ padding: '12px 16px', display: 'flex', flexDirection: 'column', gap: 16 }}>

        {/* ── Duration rollup ──────────────────────────────────────────────── */}
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
            <span style={{ fontSize: 18, fontWeight: 700, color: '#f1f5f9' }}>
              {signals.durationRollup.formatted}
            </span>
            <span style={{ fontSize: 11, color: '#475569' }}>estimated</span>
          </div>
          <div style={{ display: 'flex', gap: 8, fontSize: 11, color: '#64748b' }}>
            <span>{signals.durationRollup.coveredFrames} timed</span>
            {signals.durationRollup.uncoveredFrames > 0 && (
              <span style={{ color: '#EAB308' }}>
                {signals.durationRollup.uncoveredFrames} untimed ⚠
              </span>
            )}
          </div>
        </div>

        {/* ── Pressure summary ─────────────────────────────────────────────── */}
        {signals.pressureSummary.length > 0 && (
          <SignalSection
            title="Production Pressure"
            sectionKey="pressure"
            expanded={expandedSections.has('pressure')}
            onToggle={toggle}
            accentColor="#F97316"
          >
            <ul style={{ margin: 0, padding: '0 0 0 14px', ...SECTION_VALUE }}>
              {signals.pressureSummary.map((line, i) => (
                <li key={i} style={{ marginBottom: 4 }}>{line}</li>
              ))}
            </ul>
          </SignalSection>
        )}

        {/* ── Blocked shots ────────────────────────────────────────────────── */}
        {signals.blockedShots.length > 0 && (
          <SignalSection
            title={`Blocked Shots (${signals.blockedShots.length})`}
            sectionKey="blocked"
            expanded={expandedSections.has('blocked')}
            onToggle={toggle}
            accentColor="#EF4444"
          >
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              {signals.blockedShots.map(shot => (
                <div key={shot.frameId} style={ITEM_CHIP}>
                  <span style={{ fontWeight: 600, color: '#f1f5f9' }}>{shot.frameTitle}</span>
                  <span style={{ color: '#64748b', marginLeft: 8 }}>{shot.reasons.join(', ')}</span>
                </div>
              ))}
            </div>
          </SignalSection>
        )}

        {/* ── Continuity risks ─────────────────────────────────────────────── */}
        {signals.continuityRisks.length > 0 && (
          <SignalSection
            title={`Continuity Risk (${signals.continuityRisks.length})`}
            sectionKey="continuity"
            expanded={expandedSections.has('continuity')}
            onToggle={toggle}
            accentColor="#22C55E"
          >
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              {signals.continuityRisks.map(risk => (
                <div key={risk.frameId} style={ITEM_CHIP}>
                  <span style={{ fontWeight: 600, color: '#f1f5f9' }}>{risk.frameTitle}</span>
                  {risk.requirements.length > 0 && (
                    <div style={{ marginTop: 3, fontSize: 11, color: '#64748b' }}>
                      {risk.requirements.map((r, i) => <div key={i}>• {r}</div>)}
                    </div>
                  )}
                  {risk.linkedFrameIds.length > 0 && (
                    <div style={{ marginTop: 2, fontSize: 10, color: '#475569' }}>
                      Linked: {risk.linkedFrameIds.length} shot{risk.linkedFrameIds.length > 1 ? 's' : ''}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </SignalSection>
        )}

        {/* ── VFX burden ───────────────────────────────────────────────────── */}
        {signals.vfxBurden.totalFramesWithVfx > 0 && (
          <SignalSection
            title={`VFX Burden (${signals.vfxBurden.totalRequirements} items)`}
            sectionKey="vfx"
            expanded={expandedSections.has('vfx')}
            onToggle={toggle}
            accentColor="#EC4899"
          >
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              {signals.vfxBurden.shots.map(shot => (
                <div key={shot.frameId} style={ITEM_CHIP}>
                  <span style={{ fontWeight: 600, color: '#f1f5f9' }}>{shot.frameTitle}</span>
                  <div style={{ marginTop: 3, fontSize: 11, color: '#64748b' }}>
                    {shot.items.map((item, i) => <div key={i}>• {item}</div>)}
                  </div>
                </div>
              ))}
            </div>
          </SignalSection>
        )}

        {/* ── Audio burden ─────────────────────────────────────────────────── */}
        {signals.audioBurden.totalFramesWithAudio > 0 && (
          <SignalSection
            title={`Audio Burden (${signals.audioBurden.totalRequirements} items)`}
            sectionKey="audio"
            expanded={expandedSections.has('audio')}
            onToggle={toggle}
            accentColor="#06B6D4"
          >
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              {signals.audioBurden.shots.map(shot => (
                <div key={shot.frameId} style={ITEM_CHIP}>
                  <span style={{ fontWeight: 600, color: '#f1f5f9' }}>{shot.frameTitle}</span>
                  <div style={{ marginTop: 3, fontSize: 11, color: '#64748b' }}>
                    {shot.items.map((item, i) => <div key={i}>• {item}</div>)}
                  </div>
                </div>
              ))}
            </div>
          </SignalSection>
        )}

        {/* ── Camera complexity ────────────────────────────────────────────── */}
        {signals.cameraComplexity.totalComplexShots > 0 && (
          <SignalSection
            title={`Camera Complexity (${signals.cameraComplexity.totalComplexShots} moving)`}
            sectionKey="camera"
            expanded={expandedSections.has('camera')}
            onToggle={toggle}
            accentColor="#3B82F6"
          >
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              {signals.cameraComplexity.complexShots.map(shot => (
                <div key={shot.frameId} style={ITEM_CHIP}>
                  <span style={{ fontWeight: 600, color: '#f1f5f9' }}>{shot.frameTitle}</span>
                  <div style={{ marginTop: 3, fontSize: 11, color: '#64748b' }}>
                    {shot.movement}
                    {shot.angle && ` · ${shot.angle}`}
                    {shot.framing && ` · ${shot.framing}`}
                  </div>
                </div>
              ))}
            </div>
          </SignalSection>
        )}
      </div>
    </aside>
  );
}

// ─── Collapsible Section ──────────────────────────────────────────────────────

interface SignalSectionProps {
  title: string;
  sectionKey: string;
  expanded: boolean;
  onToggle: (key: string) => void;
  accentColor: string;
  children: React.ReactNode;
}

function SignalSection({ title, sectionKey, expanded, onToggle, accentColor, children }: SignalSectionProps) {
  return (
    <div>
      <button
        onClick={() => onToggle(sectionKey)}
        style={{
          ...SECTION_LABEL,
          display: 'flex',
          alignItems: 'center',
          gap: 6,
          cursor: 'pointer',
          background: 'none',
          border: 'none',
          padding: 0,
          width: '100%',
          textAlign: 'left',
        }}
      >
        <span style={{
          display: 'inline-block',
          width: 6, height: 6,
          borderRadius: '50%',
          background: accentColor,
          flexShrink: 0,
        }} />
        <span style={{ flex: 1 }}>{title}</span>
        <span style={{ fontSize: 12, color: '#334155' }}>
          {expanded ? '▾' : '▸'}
        </span>
      </button>
      {expanded && <div style={{ marginTop: 6 }}>{children}</div>}
    </div>
  );
}
