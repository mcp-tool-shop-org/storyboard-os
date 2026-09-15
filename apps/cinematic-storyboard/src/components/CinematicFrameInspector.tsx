// ─── cinematic-storyboard / CinematicFrameInspector.tsx ───────────────────────
//
// Inspector panel for a selected cinematic frame.
// Renders:
//   - Frame type badge + title
//   - Summary
//   - Production readiness status
//   - Camera language (angle, movement, framing)
//   - Duration
//   - Visual description
//   - Dialogue / Action notes
//   - VFX / Audio requirements
//   - Continuity requirements
//   - Required assets
//   - Edit notes
//   - Implementation checklist
//   - Test criteria
//
// ─────────────────────────────────────────────────────────────────────────────

import {
    getCinematicBeatStatus,
    getCinematicFrameSignal,
    cinematicColors,
    STATUS_LABELS,
    type CinematicBeatStatusLevel,
    type StoryboardFrame,
    type CinematicFrameType,
} from '@storyboard-os/cinematic-domain';
import { humanizeReason } from '../lib/humanizeReason';

// ─── Type display config ──────────────────────────────────────────────────────

const TYPE_LABELS: Record<CinematicFrameType, string> = {
    sequence: 'Sequence',
    shot: 'Shot',
    camera_move: 'Camera Move',
    action: 'Action',
    dialogue: 'Dialogue',
    transition: 'Transition',
    vfx: 'VFX',
    audio: 'Audio',
    edit_beat: 'Edit Beat',
};

const TYPE_COLORS: Record<CinematicFrameType, string> = {
    sequence: '#475569',
    shot: '#3B82F6',
    camera_move: '#06B6D4',
    action: '#F97316',
    dialogue: '#A855F7',
    transition: '#6366F1',
    vfx: cinematicColors.vfx,
    audio: '#22C55E',
    edit_beat: '#EAB308',
};

// ─── Status display config ────────────────────────────────────────────────────

const STATUS_COLORS: Record<CinematicBeatStatusLevel, string> = {
    ready: '#22C55E',
    partial: '#F97316',
    draft: '#6B7280',
    blocked: '#EF4444',
};

// ─── Component ────────────────────────────────────────────────────────────────

export interface NestedChildPreview {
    id: string;
    title: string;
    type: string;
}

interface Props {
    frame: StoryboardFrame;
    onClose: () => void;
    nestedChildren?: NestedChildPreview[];
    nestedKind?: 'sequence' | 'fan';
    nestedExpanded?: boolean;
    onToggleNested?: () => void;
}

export default function CinematicFrameInspector({
    frame,
    onClose,
    nestedChildren,
    nestedKind,
    nestedExpanded = false,
    onToggleNested,
}: Props) {
    const accent = TYPE_COLORS[frame.type];
    const status = getCinematicBeatStatus(frame);
    const signal = getCinematicFrameSignal(frame);
    // Normalize null/missing content (DM-002) — same pattern as beatStatus/handoff.
    const content = (frame.content ?? {}) as StoryboardFrame['content'];

    return (
        <div style={{
            position: 'absolute', top: 48, right: 0, bottom: 0, width: 380,
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

            {/* ── One-level nest (sequence group or cutaway/reaction fan) ─────────── */}
            {nestedChildren && nestedChildren.length > 0 && onToggleNested && (
                <div style={{
                    padding: '14px 18px',
                    borderBottom: '1px solid rgba(255,255,255,0.07)',
                    display: 'flex', flexDirection: 'column', gap: 8,
                }}>
                    <button
                        type="button"
                        aria-expanded={nestedExpanded}
                        onClick={onToggleNested}
                        style={{
                            fontSize: 11, fontWeight: 700, letterSpacing: '0.04em',
                            padding: '6px 10px', borderRadius: 4, cursor: 'pointer',
                            background: nestedExpanded ? 'rgba(59,130,246,0.15)' : 'rgba(71,85,105,0.2)',
                            border: nestedExpanded ? '1px solid rgba(59,130,246,0.4)' : '1px solid #1e293b',
                            color: nestedExpanded ? '#93c5fd' : '#94a3b8',
                            textAlign: 'left',
                        }}
                    >
                        {nestedExpanded ? 'Hide' : 'Show'} {nestedChildren.length} nested {nestedKind === 'fan' ? 'cutaway/reaction' : 'shots'}
                    </button>
                    <ul style={{ margin: 0, padding: '0 0 0 16px', fontSize: 12, color: '#94a3b8' }}>
                        {nestedChildren.map(child => (
                            <li key={child.id} style={{ marginBottom: 4 }}>
                                {child.title}
                            </li>
                        ))}
                    </ul>
                </div>
            )}

            {/* ── Production readiness status ──────────────────────────────────────── */}
            <div style={{
                padding: '14px 18px',
                borderBottom: '1px solid rgba(255,255,255,0.07)',
                display: 'flex', flexDirection: 'column', gap: 10,
            }}>
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
                    <span style={{ fontSize: 11, color: '#475569' }}>
                        {signal.hasVfx && '🎬 VFX'}
                        {signal.hasVfx && signal.hasAudio && ' · '}
                        {signal.hasAudio && '🔊 Audio'}
                        {(signal.hasVfx || signal.hasAudio) && signal.hasContinuity && ' · '}
                        {signal.hasContinuity && '🔗 Continuity'}
                    </span>
                </div>

                {status.missingReasons.length > 0 && status.level === 'blocked' && (
                    <ul style={{ margin: 0, padding: 0, listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 4 }}>
                        {status.missingReasons.map(r => (
                            <li key={r} style={{ fontSize: 11, color: '#EF4444', display: 'flex', alignItems: 'flex-start', gap: 5 }}>
                                <span style={{ flexShrink: 0, marginTop: 1 }}>⚠</span>
                                <span>{humanizeReason(r)}</span>
                            </li>
                        ))}
                    </ul>
                )}

                {status.level === 'ready' && (
                    <span style={{ fontSize: 11, color: '#22C55E' }}>✓ Production-ready — spec score ≥ 3, no blockers</span>
                )}
            </div>

            {/* ── Cinematic content fields ──────────────────────────────────────────── */}
            <div style={{ padding: '14px 18px', display: 'flex', flexDirection: 'column', gap: 14 }}>

                {/* Intent */}
                {content.intent && (
                    <ContentSection title="Intent">
                        <p style={{
                            fontSize: 12, color: '#f1f5f9', lineHeight: 1.6,
                            fontStyle: 'italic', borderLeft: `2px solid ${accent}`,
                            paddingLeft: 10,
                        }}>
                            {content.intent}
                        </p>
                    </ContentSection>
                )}

                {/* Camera language — structured Sequencer row, then free-text notes */}
                {(content.shotSize || content.move || content.lensMm != null || content.fovDeg != null
                    || content.cameraAngle || content.cameraMovement || content.framing || signal.cameraSummary) && (
                    <ContentSection title="Camera">
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                            {(content.shotSize || content.move || content.lensMm != null || content.fovDeg != null) && (
                                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 4 }}>
                                    {content.shotSize && (
                                        <span style={{ fontSize: 11, fontWeight: 700, color: '#67e8f9' }}>{content.shotSize}</span>
                                    )}
                                    {typeof content.lensMm === 'number' && (
                                        <span style={{ fontSize: 11, color: '#cbd5e1' }}>{content.lensMm}mm</span>
                                    )}
                                    {typeof content.fovDeg === 'number' && (
                                        <span style={{ fontSize: 11, color: '#cbd5e1' }}>FOV {content.fovDeg}°</span>
                                    )}
                                    {content.move && (
                                        <span style={{ fontSize: 11, fontWeight: 600, color: '#93c5fd' }}>{content.move}</span>
                                    )}
                                </div>
                            )}
                            {content.cameraAngle && (
                                <div style={{ display: 'flex', gap: 6 }}>
                                    <span style={{ fontSize: 10, color: '#475569', minWidth: 60 }}>Note</span>
                                    <span style={{ fontSize: 12, color: '#cbd5e1' }}>{content.cameraAngle}</span>
                                </div>
                            )}
                            {content.cameraMovement && (
                                <div style={{ display: 'flex', gap: 6 }}>
                                    <span style={{ fontSize: 10, color: '#475569', minWidth: 60 }}>Movement</span>
                                    <span style={{ fontSize: 12, color: '#cbd5e1' }}>{content.cameraMovement}</span>
                                </div>
                            )}
                            {content.framing && (
                                <div style={{ display: 'flex', gap: 6 }}>
                                    <span style={{ fontSize: 10, color: '#475569', minWidth: 60 }}>Framing</span>
                                    <span style={{ fontSize: 12, color: '#cbd5e1' }}>{content.framing}</span>
                                </div>
                            )}
                        </div>
                    </ContentSection>
                )}

                {/* Visual description */}
                {content.visualDescription && (
                    <ContentSection title="Visual Description">
                        <p style={{ fontSize: 12, color: '#cbd5e1', lineHeight: 1.6 }}>{content.visualDescription}</p>
                    </ContentSection>
                )}

                {/* Duration */}
                {content.durationEstimate && (
                    <ContentSection title="Duration">
                        <span style={{
                            display: 'inline-block', fontSize: 11, fontWeight: 600,
                            padding: '2px 8px', borderRadius: 4,
                            background: '#EAB30818', border: '1px solid #EAB30833', color: '#EAB308',
                        }}>
                            {content.durationEstimate}
                        </span>
                    </ContentSection>
                )}

                {/* Dialogue */}
                {content.dialogue && content.dialogue.length > 0 && (
                    <ContentSection title="Dialogue">
                        <ul style={{ margin: 0, padding: 0, listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 4 }}>
                            {content.dialogue.map((d, i) => (
                                <li key={i} style={{ fontSize: 12, color: '#A855F7', lineHeight: 1.5, paddingLeft: 10, borderLeft: '2px solid #A855F755' }}>
                                    {d}
                                </li>
                            ))}
                        </ul>
                    </ContentSection>
                )}

                {/* Action notes */}
                {content.actionNotes && content.actionNotes.length > 0 && (
                    <ContentSection title="Action">
                        <ListField items={content.actionNotes} />
                    </ContentSection>
                )}

                {/* Edit notes */}
                {content.editNotes && (
                    <ContentSection title="Edit Notes">
                        <p style={{ fontSize: 12, color: '#cbd5e1', lineHeight: 1.6 }}>{content.editNotes}</p>
                    </ContentSection>
                )}

                {/* Continuity requirements */}
                {content.continuityRequirements && content.continuityRequirements.length > 0 && (
                    <ContentSection title="Continuity Requirements">
                        <ListField items={content.continuityRequirements} color="#22C55E" />
                    </ContentSection>
                )}

                {/* Required assets */}
                {content.requiredAssets && content.requiredAssets.length > 0 && (
                    <ContentSection title="Required Assets">
                        <ListField items={content.requiredAssets} />
                    </ContentSection>
                )}

                {/* VFX requirements */}
                {content.vfxRequirements && content.vfxRequirements.length > 0 && (
                    <ContentSection title="VFX Requirements">
                        <ListField items={content.vfxRequirements} color={cinematicColors.vfx} />
                    </ContentSection>
                )}

                {/* Audio requirements */}
                {content.audioRequirements && content.audioRequirements.length > 0 && (
                    <ContentSection title="Audio Requirements">
                        <ListField items={content.audioRequirements} color="#06B6D4" />
                    </ContentSection>
                )}

                {/* Implementation checklist */}
                {content.implementationChecklist && content.implementationChecklist.length > 0 && (
                    <ContentSection title="Checklist">
                        <ul style={{ margin: 0, padding: 0, listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 3 }}>
                            {content.implementationChecklist.map((item, i) => (
                                <li key={i} style={{ fontSize: 11, color: '#94a3b8', display: 'flex', gap: 6, alignItems: 'flex-start' }}>
                                    <span style={{ color: '#334155', fontSize: 10 }}>☐</span>
                                    <span>{item}</span>
                                </li>
                            ))}
                        </ul>
                    </ContentSection>
                )}

                {/* Test criteria */}
                {content.testCriteria && content.testCriteria.length > 0 && (
                    <ContentSection title="Test Criteria">
                        <ul style={{ margin: 0, padding: 0, listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 3 }}>
                            {content.testCriteria.map((item, i) => (
                                <li key={i} style={{ fontSize: 11, color: '#94a3b8', display: 'flex', gap: 6, alignItems: 'flex-start' }}>
                                    <span style={{ color: '#334155', fontSize: 10 }}>✓</span>
                                    <span>{item}</span>
                                </li>
                            ))}
                        </ul>
                    </ContentSection>
                )}
            </div>
        </div>
    );
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function ContentSection({ title, children }: { title: string; children: React.ReactNode }) {
    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            <span style={{
                fontSize: 10, fontWeight: 600, color: '#475569',
                textTransform: 'uppercase', letterSpacing: '0.1em',
            }}>
                {title}
            </span>
            {children}
        </div>
    );
}

function ListField({ items, color = '#94a3b8' }: { items: string[]; color?: string }) {
    return (
        <ul style={{ margin: 0, padding: 0, listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 3 }}>
            {items.map((item, i) => (
                <li key={i} style={{ fontSize: 11, color, display: 'flex', gap: 6, alignItems: 'flex-start' }}>
                    <span style={{ color: '#334155', fontSize: 10, flexShrink: 0 }}>•</span>
                    <span>{item}</span>
                </li>
            ))}
        </ul>
    );
}
