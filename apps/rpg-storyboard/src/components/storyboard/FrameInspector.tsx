// ─── rpg-storyboard / FrameInspector.tsx ─────────────────────────────────────
//
// Inspector panel for a selected RPG frame.
// Renders:
//   - Frame type badge + title
//   - Summary
//   - Implementation status (from @storyboard-os/rpg-domain beatStatus)
//   - RPG content fields (designer notes, state changes, etc.)
//   - "Open Frame Page" link
//
// ─────────────────────────────────────────────────────────────────────────────

import type { StoryboardFrame, StoryboardFrameType } from '../../lib/storyboard/schema';
import {
  getBeatStatus,
  BLOCKING_REASONS,
  type BeatStatusLevel,
  type MissingSpecReason,
} from '@storyboard-os/rpg-domain';
import type { FrameProgress } from '../../lib/storyboard/project';
import { frameRoute } from '../../lib/storyboard/routes';

// ─── Type display config ──────────────────────────────────────────────────────

const TYPE_LABELS: Record<StoryboardFrameType, string> = {
  hook:        'Hook',
  scene:       'Scene',
  choice:      'Choice',
  encounter:   'Encounter',
  reveal:      'Reveal',
  npc_beat:    'NPC Beat',
  consequence: 'Consequence',
};

const TYPE_COLORS: Record<StoryboardFrameType, string> = {
  hook:        '#EAB308',
  scene:       '#3B82F6',
  choice:      '#8B5CF6',
  encounter:   '#EF4444',
  reveal:      '#F97316',
  npc_beat:    '#22C55E',
  consequence: '#6B7280',
};

// ─── Status display config ────────────────────────────────────────────────────

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

const REASON_LABELS: Record<MissingSpecReason, string> = {
  no_state_changes:             'State changes required for this frame type',
  no_entry_or_state_change:     'Entry conditions or state changes required for reveal',
  no_designer_notes:            'No designer notes',
  no_required_assets:           'No required assets listed',
  no_test_criteria:             'No test criteria defined',
  no_implementation_checklist:  'No implementation checklist',
  no_stakes:                    'No stakes defined',
  no_possible_outcomes:         'No possible outcomes listed',
};

// ─── Component ────────────────────────────────────────────────────────────────

interface Props {
  frame: StoryboardFrame;
  storyboardId: string;
  onClose: () => void;
  /** When provided, renders an "Edit Beat" button. Only passed on project boards. */
  onEditClick?: () => void;
  /** Completion progress for this frame's checklist + test criteria. Project boards only. */
  frameProgress?: FrameProgress;
  onChecklistChange?: (index: number, complete: boolean) => void;
  onTestCriterionChange?: (index: number, complete: boolean) => void;
}

export default function FrameInspector({ frame, storyboardId, onClose, onEditClick, frameProgress, onChecklistChange, onTestCriterionChange }: Props) {
  const route  = frameRoute(storyboardId, frame.id);
  const accent = TYPE_COLORS[frame.type];
  const status = getBeatStatus(frame);

  // Separate missing reasons by severity — blockers first, then spec gaps,
  // skip advisory from inspector view (it clutters without adding actionability)
  const blockers = status.missing.filter(r => BLOCKING_REASONS.has(r));
  const specGaps = status.missing.filter(
    r => !BLOCKING_REASONS.has(r) && r !== 'no_stakes' && r !== 'no_possible_outcomes',
  );

  return (
    <div style={{
      position: 'absolute', top: 48, right: 0, bottom: 0, width: 360,
      background: '#0c1220',
      borderLeft: '1px solid rgba(255,255,255,0.07)',
      display: 'flex', flexDirection: 'column',
      overflowY: 'auto', zIndex: 20,
    }}>
      {/* ── Header ──────────────────────────────────────────────────────────── */}
      <div style={{
        padding: '14px 18px',
        borderBottom: '1px solid rgba(255,255,255,0.07)',
        display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 10,
      }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          <span style={{
            display: 'inline-block', padding: '2px 8px', borderRadius: 4,
            background: accent, fontSize: 10, fontWeight: 700,
            color: '#fff', letterSpacing: '0.08em', textTransform: 'uppercase',
            alignSelf: 'flex-start',
          }}>
            {TYPE_LABELS[frame.type]}
          </span>
          <span style={{ fontSize: 14, fontWeight: 700, color: '#f1f5f9', lineHeight: 1.3 }}>
            {frame.title}
          </span>
        </div>
        <button
          onClick={onClose}
          style={{
            background: 'none', border: 'none', color: '#475569',
            cursor: 'pointer', fontSize: 20, lineHeight: 1, padding: '0 2px',
            flexShrink: 0,
          }}
          aria-label="Close inspector"
        >×</button>
      </div>

      {/* ── Summary ─────────────────────────────────────────────────────────── */}
      <div style={{ padding: '14px 18px', borderBottom: '1px solid rgba(255,255,255,0.07)' }}>
        <p style={{ fontSize: 12, color: '#cbd5e1', lineHeight: 1.65 }}>{frame.summary}</p>
      </div>

      {/* ── Implementation status ────────────────────────────────────────────── */}
      <div style={{
        padding: '14px 18px',
        borderBottom: '1px solid rgba(255,255,255,0.07)',
        display: 'flex', flexDirection: 'column', gap: 10,
      }}>
        {/* Status badge row */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{
            padding: '3px 9px', borderRadius: 4,
            background: `${STATUS_COLORS[status.level]}22`,
            border: `1px solid ${STATUS_COLORS[status.level]}55`,
            fontSize: 10, fontWeight: 700,
            color: STATUS_COLORS[status.level],
            letterSpacing: '0.1em',
          }}>
            {STATUS_LABELS[status.level]}
          </span>
          {/* Coverage numbers */}
          <span style={{ fontSize: 11, color: '#475569' }}>
            {status.assetCount} {status.assetCount === 1 ? 'asset' : 'assets'}
            {' · '}
            {status.testCriteriaCount} {status.testCriteriaCount === 1 ? 'test' : 'tests'}
            {' · '}
            {status.checklistCount} {status.checklistCount === 1 ? 'task' : 'tasks'}
          </span>
        </div>

        {/* Blockers */}
        {blockers.length > 0 && (
          <ul style={{ margin: 0, padding: 0, listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 4 }}>
            {blockers.map(r => (
              <li key={r} style={{
                fontSize: 11, color: '#EF4444',
                display: 'flex', alignItems: 'flex-start', gap: 5,
              }}>
                <span style={{ flexShrink: 0, marginTop: 1 }}>⚠</span>
                <span>{REASON_LABELS[r]}</span>
              </li>
            ))}
          </ul>
        )}

        {/* Spec gaps */}
        {specGaps.length > 0 && (
          <ul style={{ margin: 0, padding: 0, listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 3 }}>
            {specGaps.map(r => (
              <li key={r} style={{
                fontSize: 11, color: '#64748b',
                display: 'flex', alignItems: 'flex-start', gap: 5,
              }}>
                <span style={{ flexShrink: 0 }}>–</span>
                <span>{REASON_LABELS[r]}</span>
              </li>
            ))}
          </ul>
        )}

        {/* All-clear */}
        {status.level === 'ready' && (
          <p style={{ fontSize: 11, color: '#22C55E', margin: 0 }}>
            ✓ Implementation spec complete
          </p>
        )}
      </div>

      {/* ── Implementation progress ─────────────────────────────────────────── */}
      {frameProgress && (
        (frame.content.implementationChecklist?.length || frame.content.testCriteria?.length)
      ) && (
        <div style={{
          padding: '14px 18px',
          borderBottom: '1px solid rgba(255,255,255,0.07)',
          display: 'flex', flexDirection: 'column', gap: 16,
        }}>
          {frame.content.implementationChecklist && frame.content.implementationChecklist.length > 0 && (
            <ProgressChecklist
              label="Implementation Checklist"
              items={frame.content.implementationChecklist}
              progress={frameProgress.checklist}
              accentColor="#22C55E"
              onChange={onChecklistChange}
            />
          )}
          {frame.content.testCriteria && frame.content.testCriteria.length > 0 && (
            <ProgressChecklist
              label="Test Criteria"
              items={frame.content.testCriteria}
              progress={frameProgress.testCriteria}
              accentColor="#3B82F6"
              onChange={onTestCriterionChange}
            />
          )}
        </div>
      )}

      {/* ── Content fields ──────────────────────────────────────────────────── */}
      <div style={{ padding: '14px 18px', flex: 1, display: 'flex', flexDirection: 'column', gap: 18 }}>
        {frame.content.stakes && (
          <Field label="Stakes" value={frame.content.stakes} color="#F97316" />
        )}
        {frame.content.designerNotes && (
          <Field label="Designer Notes" value={frame.content.designerNotes} />
        )}
        {frame.content.playerVisibleText && (
          <Field label="In-Game Text" value={frame.content.playerVisibleText} color="#22C55E" />
        )}
        {frame.content.authorOnlyNotes && frame.content.authorOnlyNotes.length > 0 && (
          <Field
            label="Author Notes"
            value={frame.content.authorOnlyNotes.map((s, i) => `${i + 1}. ${s}`).join('\n\n')}
            color="#8B5CF6"
          />
        )}
        {frame.content.stateChanges && frame.content.stateChanges.length > 0 && (
          <Field label="State Changes" value={frame.content.stateChanges.join('\n')} color="#3B82F6" />
        )}
        {frame.content.involvedCharacters && frame.content.involvedCharacters.length > 0 && (
          <Field label="Characters" value={frame.content.involvedCharacters.join('\n')} />
        )}
        {frame.content.involvedFactions && frame.content.involvedFactions.length > 0 && (
          <Field label="Factions" value={frame.content.involvedFactions.join('\n')} />
        )}
        {frame.content.possibleOutcomes && frame.content.possibleOutcomes.length > 0 && (
          <Field
            label="Possible Outcomes"
            value={frame.content.possibleOutcomes.map((o, i) => `${i + 1}. ${o}`).join('\n')}
          />
        )}
      </div>

      {/* ── Footer actions ────────────────────────────────────────────────────── */}
      <div style={{ padding: '14px 18px', borderTop: '1px solid rgba(255,255,255,0.07)', display: 'flex', flexDirection: 'column', gap: 10 }}>
        {onEditClick && (
          <button
            onClick={onEditClick}
            style={{
              display: 'block', width: '100%', padding: '10px 16px', textAlign: 'center',
              background: accent, color: '#fff', border: 'none',
              fontWeight: 700, fontSize: 13, cursor: 'pointer',
              borderRadius: 6, letterSpacing: '0.02em',
            }}
          >
            Edit Beat ✎
          </button>
        )}
        <a
          href={route}
          style={{
            display: 'block', padding: '10px 16px', textAlign: 'center',
            background: onEditClick ? 'rgba(255,255,255,0.05)' : accent,
            color: onEditClick ? '#94a3b8' : '#fff',
            border: onEditClick ? '1px solid rgba(255,255,255,0.1)' : 'none',
            fontWeight: 700, fontSize: 13, textDecoration: 'none',
            borderRadius: 6, letterSpacing: '0.02em',
          }}
        >
          Open Frame Page →
        </a>
        <p style={{ marginTop: 0, fontSize: 10, color: '#334155', textAlign: 'center', fontFamily: 'monospace' }}>
          {route}
        </p>
      </div>
    </div>
  );
}

// ─── ProgressChecklist ────────────────────────────────────────────────────────

interface ProgressChecklistProps {
  label: string;
  items: string[];
  progress: Record<string, boolean>;
  accentColor: string;
  onChange?: (index: number, complete: boolean) => void;
}

function ProgressChecklist({ label, items, progress, accentColor, onChange }: ProgressChecklistProps) {
  const doneCount = items.filter((_, i) => progress[String(i)] === true).length;

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
        <p style={{
          fontSize: 10, fontWeight: 700, color: accentColor,
          textTransform: 'uppercase', letterSpacing: '0.1em', margin: 0,
        }}>
          {label}
        </p>
        <span style={{ fontSize: 10, color: '#475569' }}>
          {doneCount}/{items.length}
        </span>
      </div>
      <ul style={{ margin: 0, padding: 0, listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 7 }}>
        {items.map((item, i) => {
          const done = progress[String(i)] === true;
          return (
            <li
              key={i}
              onClick={() => onChange?.(i, !done)}
              style={{ display: 'flex', alignItems: 'flex-start', gap: 8, cursor: onChange ? 'pointer' : 'default' }}
            >
              {/* Checkbox */}
              <span style={{
                width: 14, height: 14, borderRadius: 3, flexShrink: 0, marginTop: 2,
                border: `1.5px solid ${done ? accentColor : '#334155'}`,
                background: done ? `${accentColor}2a` : 'transparent',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                transition: 'border-color 0.1s',
              }}>
                {done && (
                  <span style={{ fontSize: 9, color: accentColor, lineHeight: 1, fontWeight: 900 }}>✓</span>
                )}
              </span>
              {/* Item text */}
              <span style={{
                fontSize: 12, color: done ? '#475569' : '#94a3b8',
                lineHeight: 1.5,
                textDecoration: done ? 'line-through' : 'none',
              }}>
                {item}
              </span>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

// ─── Field ────────────────────────────────────────────────────────────────────

function Field({ label, value, color = '#94a3b8' }: { label: string; value: string; color?: string }) {
  return (
    <div>
      <p style={{
        fontSize: 10, fontWeight: 700, color, textTransform: 'uppercase',
        letterSpacing: '0.1em', marginBottom: 6,
      }}>
        {label}
      </p>
      <p style={{ fontSize: 12, color: '#94a3b8', lineHeight: 1.65, whiteSpace: 'pre-wrap' }}>
        {value}
      </p>
    </div>
  );
}
