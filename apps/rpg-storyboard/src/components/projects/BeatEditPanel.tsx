// ─── BeatEditPanel.tsx ────────────────────────────────────────────────────────
//
// Inline edit form for a single storyboard beat (project boards only).
// Edits title + summary (basics) and all FrameContent implementation fields.
//
// Array fields are presented as one-item-per-line textareas.
// No rich text, no collaboration features — just saved implementation content.
//
// ─────────────────────────────────────────────────────────────────────────────

import { useState } from 'react';
import type { StoryboardFrame, StoryboardFrameType } from '../../lib/storyboard/schema';
import type { FrameBasicsPatch } from '../../lib/storyboard/project';
import type { FrameContent } from '@storyboard-os/rpg-domain';

// ─── Type label config ────────────────────────────────────────────────────────

const TYPE_COLORS: Record<StoryboardFrameType, string> = {
  hook:        '#EAB308',
  scene:       '#3B82F6',
  choice:      '#8B5CF6',
  encounter:   '#EF4444',
  reveal:      '#F97316',
  npc_beat:    '#22C55E',
  consequence: '#6B7280',
};

const TYPE_LABELS: Record<StoryboardFrameType, string> = {
  hook:        'Hook',
  scene:       'Scene',
  choice:      'Choice',
  encounter:   'Encounter',
  reveal:      'Reveal',
  npc_beat:    'NPC Beat',
  consequence: 'Consequence',
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

/** Join an array to a one-per-line string for textarea display. */
function arrToLines(arr: string[] | undefined): string {
  return arr ? arr.join('\n') : '';
}

/** Split a one-per-line textarea string back to a trimmed, non-empty array. */
function linesToArr(text: string): string[] {
  return text
    .split('\n')
    .map(s => s.trim())
    .filter(Boolean);
}

// ─── Props ────────────────────────────────────────────────────────────────────

interface Props {
  frame: StoryboardFrame;
  onSave: (basics: FrameBasicsPatch, content: Partial<FrameContent>) => void;
  onCancel: () => void;
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function BeatEditPanel({ frame, onSave, onCancel }: Props) {
  const accent = TYPE_COLORS[frame.type];

  // Basics
  const [title,   setTitle]   = useState(frame.title);
  const [summary, setSummary] = useState(frame.summary ?? '');

  // String content fields
  const [designerNotes,     setDesignerNotes]     = useState(frame.content.designerNotes     ?? '');
  const [playerVisibleText, setPlayerVisibleText] = useState(frame.content.playerVisibleText ?? '');
  const [stakes,            setStakes]            = useState(frame.content.stakes            ?? '');

  // Array content fields (stored as one-per-line strings)
  const [entryConditions,        setEntryConditions]        = useState(arrToLines(frame.content.entryConditions));
  const [exitConditions,         setExitConditions]         = useState(arrToLines(frame.content.exitConditions));
  const [stateChanges,           setStateChanges]           = useState(arrToLines(frame.content.stateChanges));
  const [requiredAssets,         setRequiredAssets]         = useState(arrToLines(frame.content.requiredAssets));
  const [testCriteria,           setTestCriteria]           = useState(arrToLines(frame.content.testCriteria));
  const [implementationChecklist,setImplementationChecklist] = useState(arrToLines(frame.content.implementationChecklist));
  const [authorOnlyNotes,        setAuthorOnlyNotes]        = useState(arrToLines(frame.content.authorOnlyNotes));

  function handleSave() {
    const basics: FrameBasicsPatch = {};
    if (title.trim()   !== frame.title)        basics.title   = title.trim();
    if (summary.trim() !== (frame.summary ?? '')) basics.summary = summary.trim();

    const content: Partial<FrameContent> = {
      designerNotes:          designerNotes.trim()     || undefined,
      playerVisibleText:      playerVisibleText.trim() || undefined,
      stakes:                 stakes.trim()            || undefined,
      entryConditions:        linesToArr(entryConditions),
      exitConditions:         linesToArr(exitConditions),
      stateChanges:           linesToArr(stateChanges),
      requiredAssets:         linesToArr(requiredAssets),
      testCriteria:           linesToArr(testCriteria),
      implementationChecklist:linesToArr(implementationChecklist),
      authorOnlyNotes:        linesToArr(authorOnlyNotes),
    };

    onSave(basics, content);
  }

  return (
    <div style={{
      position: 'absolute', top: 48, right: 0, bottom: 0, width: 400,
      background: '#0c1220',
      borderLeft: '1px solid rgba(255,255,255,0.07)',
      display: 'flex', flexDirection: 'column',
      zIndex: 20,
    }}>
      {/* ── Header ────────────────────────────────────────────────────────── */}
      <div style={{
        padding: '14px 18px',
        borderBottom: '1px solid rgba(255,255,255,0.07)',
        display: 'flex', alignItems: 'center', gap: 10,
        flexShrink: 0,
      }}>
        <span style={{
          display: 'inline-block', padding: '2px 8px', borderRadius: 4,
          background: accent, fontSize: 10, fontWeight: 700,
          color: '#fff', letterSpacing: '0.08em', textTransform: 'uppercase',
        }}>
          {TYPE_LABELS[frame.type]}
        </span>
        <span style={{ fontSize: 13, fontWeight: 700, color: '#f1f5f9', flex: 1,
          overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          Edit Beat
        </span>
        <button
          onClick={onCancel}
          style={{
            background: 'none', border: 'none', color: '#475569',
            cursor: 'pointer', fontSize: 20, lineHeight: 1, padding: '0 2px',
          }}
          aria-label="Cancel editing"
        >×</button>
      </div>

      {/* ── Scrollable form body ───────────────────────────────────────────── */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '18px', display: 'flex', flexDirection: 'column', gap: 20 }}>

        {/* Basics */}
        <Section label="Title" accent={accent}>
          <input
            value={title}
            onChange={e => setTitle(e.target.value)}
            style={inputStyle}
            placeholder="Beat title"
          />
        </Section>

        <Section label="Summary" accent={accent}>
          <textarea
            value={summary}
            onChange={e => setSummary(e.target.value)}
            rows={3}
            style={taStyle}
            placeholder="One-line narrative summary"
          />
        </Section>

        {/* Story content */}
        <Section label="In-Game Text (player-visible)" accent={accent}>
          <textarea
            value={playerVisibleText}
            onChange={e => setPlayerVisibleText(e.target.value)}
            rows={3}
            style={taStyle}
            placeholder="Text the player sees in-game"
          />
        </Section>

        <Section label="Stakes" accent={accent}>
          <textarea
            value={stakes}
            onChange={e => setStakes(e.target.value)}
            rows={2}
            style={taStyle}
            placeholder="What's at risk in this beat"
          />
        </Section>

        <Section label="Designer Notes" accent={accent}>
          <textarea
            value={designerNotes}
            onChange={e => setDesignerNotes(e.target.value)}
            rows={4}
            style={taStyle}
            placeholder="Implementation guidance, design intent…"
          />
        </Section>

        {/* Game state */}
        <Section label="Entry Conditions (one per line)" accent={accent}>
          <textarea
            value={entryConditions}
            onChange={e => setEntryConditions(e.target.value)}
            rows={3}
            style={taStyle}
            placeholder="flag_completed_prologue = true"
          />
        </Section>

        <Section label="Exit Conditions (one per line)" accent={accent}>
          <textarea
            value={exitConditions}
            onChange={e => setExitConditions(e.target.value)}
            rows={3}
            style={taStyle}
            placeholder="player_chose_faction != null"
          />
        </Section>

        <Section label="State Changes (one per line)" accent={accent}>
          <textarea
            value={stateChanges}
            onChange={e => setStateChanges(e.target.value)}
            rows={3}
            style={taStyle}
            placeholder="quest_state = active"
          />
        </Section>

        {/* Implementation */}
        <Section label="Required Assets (one per line)" accent={accent}>
          <textarea
            value={requiredAssets}
            onChange={e => setRequiredAssets(e.target.value)}
            rows={3}
            style={taStyle}
            placeholder="cutscene_intro.mp4"
          />
        </Section>

        <Section label="Test Criteria (one per line)" accent={accent}>
          <textarea
            value={testCriteria}
            onChange={e => setTestCriteria(e.target.value)}
            rows={3}
            style={taStyle}
            placeholder="Quest marker appears on map"
          />
        </Section>

        <Section label="Implementation Checklist (one per line)" accent={accent}>
          <textarea
            value={implementationChecklist}
            onChange={e => setImplementationChecklist(e.target.value)}
            rows={3}
            style={taStyle}
            placeholder="Wire up quest flag trigger"
          />
        </Section>

        <Section label="Author Notes (one per line)" accent={accent}>
          <textarea
            value={authorOnlyNotes}
            onChange={e => setAuthorOnlyNotes(e.target.value)}
            rows={3}
            style={taStyle}
            placeholder="Private authoring notes (not shown in handoff)"
          />
        </Section>

      </div>

      {/* ── Save / Cancel buttons ────────────────────────────────────────────── */}
      <div style={{
        padding: '14px 18px',
        borderTop: '1px solid rgba(255,255,255,0.07)',
        display: 'flex', gap: 10,
        flexShrink: 0,
      }}>
        <button
          onClick={handleSave}
          style={{
            flex: 1, padding: '10px 0',
            background: accent, color: '#fff', border: 'none',
            borderRadius: 6, fontWeight: 700, fontSize: 13,
            cursor: 'pointer', letterSpacing: '0.03em',
          }}
        >
          Save Beat
        </button>
        <button
          onClick={onCancel}
          style={{
            padding: '10px 18px',
            background: 'rgba(255,255,255,0.05)',
            color: '#94a3b8', border: '1px solid rgba(255,255,255,0.1)',
            borderRadius: 6, fontWeight: 600, fontSize: 13,
            cursor: 'pointer',
          }}
        >
          Cancel
        </button>
      </div>
    </div>
  );
}

// ─── Section ─────────────────────────────────────────────────────────────────

function Section({ label, accent, children }: { label: string; accent: string; children: React.ReactNode }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
      <label style={{
        fontSize: 10, fontWeight: 700, color: accent,
        textTransform: 'uppercase', letterSpacing: '0.1em',
      }}>
        {label}
      </label>
      {children}
    </div>
  );
}

// ─── Shared styles ────────────────────────────────────────────────────────────

const baseFieldStyle: React.CSSProperties = {
  background: 'rgba(255,255,255,0.05)',
  border: '1px solid rgba(255,255,255,0.1)',
  borderRadius: 4,
  color: '#f1f5f9',
  fontSize: 12,
  fontFamily: 'ui-sans-serif, system-ui, sans-serif',
  padding: '8px 10px',
  resize: 'vertical',
  outline: 'none',
  width: '100%',
  boxSizing: 'border-box',
};

const inputStyle: React.CSSProperties = {
  ...baseFieldStyle,
  resize: 'none',
};

const taStyle: React.CSSProperties = {
  ...baseFieldStyle,
  lineHeight: 1.55,
};
