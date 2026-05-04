import type { StoryboardFrame, StoryboardFrameType } from '../../lib/storyboard/schema';
import { frameRoute } from '../../lib/storyboard/routes';

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

interface Props {
  frame: StoryboardFrame;
  storyboardId: string;
  onClose: () => void;
}

export default function FrameInspector({ frame, storyboardId, onClose }: Props) {
  const route = frameRoute(storyboardId, frame.id);
  const accent = TYPE_COLORS[frame.type];

  return (
    <div style={{
      position: 'absolute', top: 48, right: 0, bottom: 0, width: 360,
      background: '#0c1220',
      borderLeft: '1px solid rgba(255,255,255,0.07)',
      display: 'flex', flexDirection: 'column',
      overflowY: 'auto', zIndex: 20,
    }}>
      {/* Header */}
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

      {/* Summary */}
      <div style={{ padding: '14px 18px', borderBottom: '1px solid rgba(255,255,255,0.07)' }}>
        <p style={{ fontSize: 12, color: '#cbd5e1', lineHeight: 1.65 }}>{frame.summary}</p>
      </div>

      {/* Content fields */}
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

      {/* Open frame page */}
      <div style={{ padding: '14px 18px', borderTop: '1px solid rgba(255,255,255,0.07)' }}>
        <a
          href={route}
          style={{
            display: 'block', padding: '10px 16px', textAlign: 'center',
            background: accent, color: '#fff',
            fontWeight: 700, fontSize: 13, textDecoration: 'none',
            borderRadius: 6, letterSpacing: '0.02em',
          }}
        >
          Open Frame Page →
        </a>
        <p style={{ marginTop: 8, fontSize: 10, color: '#334155', textAlign: 'center', fontFamily: 'monospace' }}>
          {route}
        </p>
      </div>
    </div>
  );
}

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
