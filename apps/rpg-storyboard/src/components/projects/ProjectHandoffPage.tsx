// ─── ProjectHandoffPage.tsx ───────────────────────────────────────────────────
//
// Client-only React component for /projects/handoff?id=...
//
// Loads the saved project from localStorage, generates a ProjectHandoff via
// generateProjectHandoff(), and renders it in the same dark RPG aesthetic as
// the static storyboard handoff pages.
//
// Checklist and test criteria items show completion state ([x] / [ ]) sourced
// from the project's progress record — never from spec-text mutation.
//
// ─────────────────────────────────────────────────────────────────────────────

import { useEffect, useState, useCallback } from 'react';
import {
  generateProjectHandoff,
  generateProjectMarkdown,
  type ProjectHandoff,
  type ProjectHandoffBeat,
  type BeatStatusLevel,
} from '@storyboard-os/rpg-domain';
import { getProject } from '../../lib/storyboard/projectStorage';

// ─── Const display maps ───────────────────────────────────────────────────────

const STATUS_COLORS: Record<BeatStatusLevel, string> = {
  ready:   '#22C55E',
  partial: '#F97316',
  draft:   '#6B7280',
  blocked: '#EF4444',
};

const STATUS_LABELS: Record<BeatStatusLevel, string> = {
  ready:   'READY',
  partial: 'PARTIAL',
  draft:   'DRAFT',
  blocked: 'BLOCKED',
};

const CONN_LABELS: Record<string, string> = {
  sequence:    'sequence',
  choice:      'choice branch',
  consequence: 'consequence',
  optional:    'optional',
  fallback:    'fallback',
};

// Short noun-phrase labels for the Partial-section "missing: ..." list.
// Mirrors REASON_SHORT_LABELS in pages/storyboards/[storyboardId]/handoff.astro.
const REASON_SHORT_LABELS: Record<string, string> = {
  no_designer_notes:            'designer notes',
  no_required_assets:           'required assets',
  no_test_criteria:             'test criteria',
  no_implementation_checklist:  'implementation checklist',
  no_stakes:                    'stakes',
  no_possible_outcomes:         'possible outcomes',
  no_state_changes:             'state changes',
  no_entry_or_state_change:     'entry conditions or state changes',
};

function humanizeReasonShort(code: string): string {
  return REASON_SHORT_LABELS[code] ?? code.replace(/^no_/, '').replace(/_/g, ' '); // unmapped: legacy strip
}

// ─── Download helper ──────────────────────────────────────────────────────────

function download(content: string, name: string, type: string) {
  const blob = new Blob([content], { type });
  const url  = URL.createObjectURL(blob);
  const a    = document.createElement('a');
  a.href     = url;
  a.download = name;
  a.click();
  URL.revokeObjectURL(url);
}

// ─── Main component ───────────────────────────────────────────────────────────

export default function ProjectHandoffPage() {
  const [handoff,   setHandoff]   = useState<ProjectHandoff | null>(null);
  const [loading,   setLoading]   = useState(true);
  const [notFound,  setNotFound]  = useState(false);
  const [boardHref, setBoardHref] = useState('/projects');

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const id = params.get('id');
    if (!id) { setNotFound(true); setLoading(false); return; }

    const project = getProject(id);
    if (!project) { setNotFound(true); setLoading(false); return; }

    setBoardHref(`/projects/board?id=${id}`);
    setHandoff(generateProjectHandoff(project));
    setLoading(false);
  }, []);

  const handleDownloadMd = useCallback(() => {
    if (!handoff) return;
    const md  = generateProjectMarkdown(handoff);
    const name = `${handoff.projectId}-handoff`;
    download(md, `${name}.md`, 'text/markdown');
  }, [handoff]);

  const handleDownloadJson = useCallback(() => {
    if (!handoff) return;
    const name = `${handoff.projectId}-handoff`;
    download(JSON.stringify(handoff, null, 2), `${name}.json`, 'application/json');
  }, [handoff]);

  if (loading) return <StateScreen text="Generating handoff…" />;
  if (notFound || !handoff) return <StateScreen text="Project not found." link="/projects" linkLabel="← Projects" />;

  const readyPct = Math.round(handoff.readiness.readyFraction * 100);
  const dateStr  = handoff.generatedAt.split('T')[0];

  return (
    <div style={{ minHeight: '100vh', background: '#0b1120', color: '#f1f5f9', fontFamily: 'ui-sans-serif, system-ui, sans-serif', WebkitFontSmoothing: 'antialiased' }}>

      {/* ── Top bar ──────────────────────────────────────────────────────── */}
      <nav style={{
        position: 'sticky', top: 0, zIndex: 40,
        background: 'rgba(11,17,32,0.97)',
        borderBottom: '1px solid rgba(255,255,255,0.08)',
        padding: '0 24px', height: 48,
        display: 'flex', alignItems: 'center', gap: 16,
      }}>
        <a href={boardHref} style={{ fontSize: 12, color: '#475569', textDecoration: 'none' }}>← Board</a>
        <span style={{ color: '#1e293b' }}>|</span>
        <span style={{ fontSize: 13, fontWeight: 700, color: '#f1f5f9', flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {handoff.title}
        </span>
        <span style={{ fontSize: 10, fontWeight: 700, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
          Project Handoff
        </span>
        <button
          onClick={handleDownloadMd}
          style={btnStyle}
        >
          ↓ Markdown
        </button>
        <button
          onClick={handleDownloadJson}
          style={btnStyle}
        >
          ↓ JSON
        </button>
      </nav>

      {/* ── Page content ─────────────────────────────────────────────────── */}
      <main style={{ maxWidth: 860, margin: '0 auto', padding: '40px 24px 80px' }}>

        {/* Hero */}
        <div style={{ marginBottom: 40 }}>
          <h1 style={{ fontSize: 28, fontWeight: 800, color: '#f1f5f9', lineHeight: 1.2, marginBottom: 10 }}>
            {handoff.title}
          </h1>
          {handoff.description && (
            <p style={{ fontSize: 15, color: '#94a3b8', lineHeight: 1.65, marginBottom: 10 }}>
              {handoff.description}
            </p>
          )}
          <p style={{ fontSize: 11, color: '#334155', fontFamily: 'ui-monospace, monospace' }}>
            Generated {dateStr} · Project {handoff.projectId}
            {handoff.sourceTemplateId && ` · Template: ${handoff.sourceTemplateId}`}
          </p>
          <p style={{ fontSize: 11, color: '#1e293b', fontFamily: 'ui-monospace, monospace', marginTop: 3 }}>
            Created {handoff.createdAt.split('T')[0]} · Updated {handoff.updatedAt.split('T')[0]}
          </p>
        </div>

        {/* Progress summary */}
        {(handoff.progress.totalChecklist > 0 || handoff.progress.totalTests > 0) && (
          <div style={{ marginBottom: 32 }}>
            <SectionTitle>Implementation Progress</SectionTitle>
            <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
              {handoff.progress.totalChecklist > 0 && (
                <ProgressChip
                  color="#22C55E"
                  label={`✓ Tasks: ${handoff.progress.doneChecklist}/${handoff.progress.totalChecklist}`}
                  pct={handoff.progress.totalChecklist > 0
                    ? Math.round((handoff.progress.doneChecklist / handoff.progress.totalChecklist) * 100)
                    : 0}
                />
              )}
              {handoff.progress.totalTests > 0 && (
                <ProgressChip
                  color="#3B82F6"
                  label={`✦ Tests: ${handoff.progress.doneTests}/${handoff.progress.totalTests}`}
                  pct={handoff.progress.totalTests > 0
                    ? Math.round((handoff.progress.doneTests / handoff.progress.totalTests) * 100)
                    : 0}
                />
              )}
            </div>
          </div>
        )}

        {/* Readiness summary */}
        <div style={{ marginBottom: 40 }}>
          <SectionTitle>Beat Readiness</SectionTitle>
          <p style={{ fontSize: 22, fontWeight: 800, color: '#f1f5f9', marginBottom: 8 }}>
            {handoff.readiness.ready} / {handoff.readiness.total} beats ready
            <span style={{ fontSize: 14, fontWeight: 400, color: '#475569', marginLeft: 8 }}>
              ({readyPct}%)
            </span>
          </p>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginTop: 8 }}>
            {handoff.readiness.ready > 0 && <StatusChip level="ready" count={handoff.readiness.ready} />}
            {handoff.readiness.partial > 0 && <StatusChip level="partial" count={handoff.readiness.partial} />}
            {handoff.readiness.blocked > 0 && <StatusChip level="blocked" count={handoff.readiness.blocked} />}
            {handoff.readiness.draft > 0 && <StatusChip level="draft" count={handoff.readiness.draft} />}
          </div>
        </div>

        {/* Beats */}
        <SectionTitle>Beats</SectionTitle>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 24, marginTop: 16 }}>
          {handoff.beats.map((beat, i) => (
            <BeatCard key={beat.id} beat={beat} index={i} />
          ))}
        </div>

        {/* Spec issues */}
        {(handoff.blockedBeatIds.length > 0 || handoff.partialBeatIds.length > 0) && (
          <div style={{ marginTop: 48 }}>
            <SectionTitle>Spec Issues</SectionTitle>

            {handoff.blockedBeatIds.length > 0 && (
              <IssueGroup
                title={`Blocked (${handoff.blockedBeatIds.length})`}
                titleColor="#EF4444"
                subtitle="Domain rule violations — must be resolved before implementation."
                ids={handoff.blockedBeatIds}
                beats={handoff.beats}
                dotColor="#EF4444"
                gapFilter={r => r === 'no_state_changes' || r === 'no_entry_or_state_change'}
              />
            )}

            {handoff.partialBeatIds.length > 0 && (
              <IssueGroup
                title={`Partial (${handoff.partialBeatIds.length})`}
                titleColor="#F97316"
                subtitle="Spec is incomplete — expect rework during implementation."
                ids={handoff.partialBeatIds}
                beats={handoff.beats}
                dotColor="#F97316"
                gapFilter={r => !['no_state_changes', 'no_entry_or_state_change', 'no_stakes', 'no_possible_outcomes'].includes(r)}
              />
            )}
          </div>
        )}

      </main>
    </div>
  );
}

// ─── BeatCard ─────────────────────────────────────────────────────────────────

function BeatCard({ beat, index }: { beat: ProjectHandoffBeat; index: number }) {
  const accentColor = STATUS_COLORS[beat.status] ?? '#475569';
  const typeLabel   = beat.type.replace('_', ' ').toUpperCase();
  const blockers    = beat.missing.filter(r =>
    r === 'no_state_changes' || r === 'no_entry_or_state_change',
  );

  return (
    <div id={`beat-${beat.id}`} style={{
      background: '#0f1825',
      border: '1px solid rgba(255,255,255,0.07)',
      borderRadius: 8, overflow: 'hidden',
    }}>
      {/* Header */}
      <div style={{
        padding: '14px 20px', borderLeft: `3px solid ${accentColor}44`,
        borderBottom: '1px solid rgba(255,255,255,0.06)',
        display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap',
      }}>
        <span style={{ fontSize: 11, color: '#334155', fontWeight: 600 }}>#{index + 1}</span>
        <span style={{
          fontSize: 9, fontWeight: 700, padding: '2px 7px', borderRadius: 3,
          textTransform: 'uppercase', letterSpacing: '0.08em',
          background: `${accentColor}22`, color: accentColor, border: `1px solid ${accentColor}44`,
        }}>{typeLabel}</span>
        <span style={{ fontSize: 16, fontWeight: 700, color: '#f1f5f9', flex: 1 }}>{beat.title}</span>
        <span style={{
          fontSize: 10, fontWeight: 700, padding: '3px 8px', borderRadius: 3, letterSpacing: '0.06em',
          background: `${accentColor}18`, border: `1px solid ${accentColor}44`, color: accentColor,
        }}>{STATUS_LABELS[beat.status]}</span>
      </div>

      {/* Blocker warning */}
      {blockers.length > 0 && (
        <div style={{
          margin: '0 20px', marginTop: 12,
          background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.25)',
          borderRadius: 6, padding: '10px 14px',
          fontSize: 11, color: '#fca5a5', lineHeight: 1.55,
        }}>
          <strong>⚠ Domain requirement missing — resolve before implementation:</strong>
          {blockers.includes('no_state_changes') && <div>State changes required for {beat.type} frame type</div>}
          {blockers.includes('no_entry_or_state_change') && <div>Entry conditions or state changes required for reveal beats</div>}
        </div>
      )}

      {/* Body */}
      <div style={{ padding: '16px 20px', display: 'flex', flexDirection: 'column', gap: 14 }}>

        <p style={{ fontSize: 13, color: '#cbd5e1', lineHeight: 1.65 }}>{beat.summary}</p>

        <BeatField label="Entry Conditions">
          {beat.entryConditions.length > 0
            ? <ItemList items={beat.entryConditions} mono />
            : <Dim>none required</Dim>}
        </BeatField>

        {beat.exitConditions.length > 0 && (
          <BeatField label="Exit Conditions">
            <ItemList items={beat.exitConditions} mono />
          </BeatField>
        )}

        {beat.stateChanges.length > 0 && (
          <BeatField label="State Changes" accentColor="#3B82F6">
            <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
              {beat.stateChanges.map((s, i) => (
                <div key={i} style={{ display: 'flex', gap: 8, alignItems: 'flex-start' }}>
                  <span style={{ color: '#3B82F6', flexShrink: 0 }}>›</span>
                  <span style={{ fontSize: 12, color: '#93c5fd', fontFamily: 'ui-monospace, monospace' }}>{s}</span>
                </div>
              ))}
            </div>
          </BeatField>
        )}

        {beat.playerVisibleText && (
          <BeatField label="Player-Visible Text" accentColor="#22C55E">
            <div style={{
              background: 'rgba(34,197,94,0.06)', borderLeft: '2px solid #22C55E',
              padding: '10px 14px', fontSize: 12, color: '#86efac',
              lineHeight: 1.65, whiteSpace: 'pre-wrap', fontStyle: 'italic',
            }}>
              {beat.playerVisibleText}
            </div>
          </BeatField>
        )}

        {beat.stakes && (
          <BeatField label="Stakes" accentColor="#F97316">
            <p style={{ fontSize: 12, color: '#94a3b8', lineHeight: 1.6 }}>{beat.stakes}</p>
          </BeatField>
        )}

        {beat.involvedCharacters.length > 0 && (
          <BeatField label="Characters">
            <p style={{ fontSize: 12, color: '#94a3b8' }}>{beat.involvedCharacters.join(', ')}</p>
          </BeatField>
        )}
        {beat.involvedFactions.length > 0 && (
          <BeatField label="Factions">
            <p style={{ fontSize: 12, color: '#94a3b8' }}>{beat.involvedFactions.join(', ')}</p>
          </BeatField>
        )}

        {beat.possibleOutcomes.length > 0 && (
          <BeatField label="Possible Outcomes">
            <ItemList items={beat.possibleOutcomes} />
          </BeatField>
        )}

        {beat.requiredAssets.length > 0 && (
          <BeatField label="Required Assets">
            <ItemList items={beat.requiredAssets} mono />
          </BeatField>
        )}

        {/* Implementation checklist — with progress state */}
        {beat.checklistProgress.length > 0 && (
          <BeatField label="Implementation Checklist" accentColor="#22C55E">
            <ProgressList
              items={beat.checklistProgress.map(i => ({ text: i.item, done: i.done }))}
              doneColor="#22C55E"
            />
          </BeatField>
        )}

        {/* Test criteria — with progress state */}
        {beat.testProgress.length > 0 && (
          <BeatField label="Test Criteria" accentColor="#3B82F6">
            <ProgressList
              items={beat.testProgress.map(i => ({ text: i.criterion, done: i.done }))}
              doneColor="#3B82F6"
            />
          </BeatField>
        )}

        {beat.designerNotes && (
          <BeatField label="Designer Notes">
            <p style={{ fontSize: 12, color: '#64748b', lineHeight: 1.6, fontStyle: 'italic' }}>
              {beat.designerNotes}
            </p>
          </BeatField>
        )}

        {/* Outgoing branches */}
        <BeatField label="Outgoing">
          {beat.outgoingBranches.length === 0 ? (
            beat.status !== 'draft'
              ? <Dim>terminal beat</Dim>
              : <Dim>—</Dim>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              {beat.outgoingBranches.map((branch, i) => (
                <div key={i} style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                  <span style={{ color: '#475569', flexShrink: 0 }}>→</span>
                  <a
                    href={`#beat-${branch.toId}`}
                    style={{ fontSize: 12, color: '#cbd5e1', fontWeight: 600, textDecoration: 'none' }}
                  >
                    {branch.toTitle}
                  </a>
                  <span style={{ fontSize: 10, color: '#475569' }}>
                    ({CONN_LABELS[branch.type] ?? branch.type}
                    {branch.label && `: "${branch.label}"`})
                  </span>
                </div>
              ))}
            </div>
          )}
        </BeatField>

      </div>
    </div>
  );
}

// ─── Small sub-components ─────────────────────────────────────────────────────

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <p style={{
      fontSize: 11, fontWeight: 700, color: '#475569',
      textTransform: 'uppercase', letterSpacing: '0.12em',
      marginBottom: 16, paddingBottom: 8,
      borderBottom: '1px solid rgba(255,255,255,0.06)',
    }}>
      {children}
    </p>
  );
}

function StatusChip({ level, count }: { level: BeatStatusLevel; count: number }) {
  const color = STATUS_COLORS[level];
  return (
    <span style={{
      fontSize: 10, fontWeight: 700, letterSpacing: '0.06em',
      padding: '3px 8px', borderRadius: 3,
      background: `${color}18`, border: `1px solid ${color}44`, color,
    }}>
      {count} {STATUS_LABELS[level]}
    </span>
  );
}

function ProgressChip({ color, label, pct }: { color: string; label: string; pct: number }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
      <span style={{
        fontSize: 12, fontWeight: 700, color,
        padding: '4px 10px', borderRadius: 4,
        background: `${color}18`, border: `1px solid ${color}44`,
      }}>
        {label}
      </span>
      {/* Progress bar */}
      <div style={{ height: 3, background: 'rgba(255,255,255,0.06)', borderRadius: 2, width: 180 }}>
        <div style={{ height: 3, background: color, borderRadius: 2, width: `${pct}%`, transition: 'width 0.3s' }} />
      </div>
    </div>
  );
}

function BeatField({ label, accentColor = '#475569', children }: { label: string; accentColor?: string; children: React.ReactNode }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
      <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: accentColor }}>
        {label}
      </span>
      {children}
    </div>
  );
}

function ItemList({ items, mono = false }: { items: string[]; mono?: boolean }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
      {items.map((item, i) => (
        <div key={i} style={{ display: 'flex', gap: 8, alignItems: 'flex-start' }}>
          <span style={{ color: '#334155', flexShrink: 0, marginTop: 1 }}>–</span>
          <span style={{
            fontSize: 12, color: '#94a3b8', lineHeight: 1.5,
            fontFamily: mono ? 'ui-monospace, monospace' : undefined,
          }}>{item}</span>
        </div>
      ))}
    </div>
  );
}

function ProgressList({ items, doneColor }: { items: Array<{ text: string; done: boolean }>; doneColor: string }) {
  const doneCount = items.filter(i => i.done).length;
  return (
    <div>
      <p style={{ fontSize: 10, color: '#475569', marginBottom: 6 }}>
        {doneCount}/{items.length} complete
      </p>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
        {items.map((item, i) => (
          <div key={i} style={{ display: 'flex', gap: 8, alignItems: 'flex-start' }}>
            {/* Static checkbox — read-only in handoff view */}
            <span style={{
              width: 14, height: 14, borderRadius: 3, flexShrink: 0, marginTop: 2,
              border: `1.5px solid ${item.done ? doneColor : '#334155'}`,
              background: item.done ? `${doneColor}2a` : 'transparent',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              {item.done && <span style={{ fontSize: 9, color: doneColor, fontWeight: 900 }}>✓</span>}
            </span>
            <span style={{
              fontSize: 12, color: item.done ? '#475569' : '#94a3b8', lineHeight: 1.5,
              textDecoration: item.done ? 'line-through' : 'none',
            }}>
              {item.text}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

function IssueGroup({ title, titleColor, subtitle, ids, beats, dotColor, gapFilter }: {
  title: string;
  titleColor: string;
  subtitle: string;
  ids: string[];
  beats: ProjectHandoffBeat[];
  dotColor: string;
  gapFilter: (r: string) => boolean;
}) {
  return (
    <div style={{ marginBottom: 24 }}>
      <p style={{ fontSize: 13, fontWeight: 700, color: titleColor, marginBottom: 8 }}>{title}</p>
      <p style={{ fontSize: 12, color: '#64748b', marginBottom: 12 }}>{subtitle}</p>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {ids.map(id => {
          const beat = beats.find(b => b.id === id);
          if (!beat) return null;
          const gaps = beat.missing.filter(gapFilter);
          return (
            <div key={id} style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
              <span style={{
                width: 6, height: 6, borderRadius: '50%', background: dotColor,
                flexShrink: 0, marginTop: 5,
              }} />
              <div>
                <a
                  href={`#beat-${id}`}
                  style={{ fontSize: 13, fontWeight: 600, color: '#f1f5f9', textDecoration: 'none' }}
                >
                  {beat.title}
                </a>
                <span style={{ fontSize: 11, color: '#334155', fontFamily: 'ui-monospace, monospace', marginLeft: 6 }}>
                  {id}
                </span>
                {gaps.length > 0 && (
                  <p style={{ fontSize: 11, color: '#64748b', marginTop: 2 }}>
                    missing: {gaps.map(r => humanizeReasonShort(r)).join(', ')}
                  </p>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function Dim({ children }: { children: React.ReactNode }) {
  return <span style={{ fontSize: 12, color: '#334155' }}>{children}</span>;
}

function StateScreen({ text, link, linkLabel }: { text: string; link?: string; linkLabel?: string }) {
  return (
    <div style={{
      display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
      height: '100vh', gap: 12, background: '#0b1120', color: '#f1f5f9',
      fontFamily: 'ui-sans-serif, system-ui, sans-serif',
    }}>
      <span style={{ fontSize: 14, color: '#475569' }}>{text}</span>
      {link && (
        <a href={link} style={{ fontSize: 13, color: '#8B5CF6', textDecoration: 'none' }}>{linkLabel}</a>
      )}
    </div>
  );
}

// ─── Shared styles ────────────────────────────────────────────────────────────

const btnStyle: React.CSSProperties = {
  fontSize: 11, fontWeight: 700, letterSpacing: '0.04em',
  padding: '5px 12px', borderRadius: 4, border: '1px solid #1e293b', cursor: 'pointer',
  background: 'rgba(71,85,105,0.2)', color: '#94a3b8',
};
