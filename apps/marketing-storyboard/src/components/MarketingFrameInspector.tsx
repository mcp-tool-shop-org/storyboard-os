// ─── marketing-storyboard / MarketingFrameInspector.tsx ───────────────────────
//
// Inspector panel for a selected marketing campaign frame.
// Renders:
//   - Frame type badge + title
//   - Summary
//   - Campaign beat status (from @storyboard-os/marketing-domain beatStatus)
//   - Marketing content fields: customer state, channel, message, assets,
//     approvals, conversion goals, metrics
//
// ─────────────────────────────────────────────────────────────────────────────

import {
    getCampaignBeatStatus,
    BLOCKING_REASONS,
    marketingColors,
    type CampaignBeatStatusLevel,
    type MissingSpecReason,
    type StoryboardFrame,
    type MarketingFrameType,
} from '@storyboard-os/marketing-domain';
import { statusColors, statusLabels, textColors, typeScale, spacing } from '@storyboard-os/core';

// ─── Type display config ──────────────────────────────────────────────────────
// Accent per frame type comes from the shared token API so the inspector badge
// matches the card badge and legend (VP-002/003 discipline: one source of truth
// for every status hex). `launch_event` reads the marketing critical-path hue.

const TYPE_LABELS: Record<MarketingFrameType, string> = {
    audience: 'Audience',
    message: 'Message',
    touchpoint: 'Touchpoint',
    asset: 'Asset',
    approval: 'Approval',
    launch_event: 'Launch Event',
    conversion: 'Conversion',
    follow_up: 'Follow-Up',
    measurement: 'Measurement',
};

const TYPE_COLORS: Record<MarketingFrameType, string> = {
    audience: statusColors.state,
    message: statusColors.accent,
    touchpoint: statusColors.spec,
    asset: statusColors.partial,
    approval: statusColors.blocked,
    launch_event: marketingColors.critical,
    conversion: '#06B6D4',
    follow_up: '#6366F1',
    measurement: '#EC4899',
};

// ─── Status display config ────────────────────────────────────────────────────
// VP-005: the "ready" state is labeled 'SPEC' everywhere (statusLabels.ready) so
// the inspector agrees with the card badge and with the other verticals.

const STATUS_COLORS: Record<CampaignBeatStatusLevel, string> = {
    ready: statusColors.spec,
    partial: statusColors.partial,
    draft: statusColors.draft,
    blocked: statusColors.blocked,
};

const STATUS_LABELS: Record<CampaignBeatStatusLevel, string> = {
    ready: statusLabels.ready,   // 'SPEC'
    partial: statusLabels.partial,
    draft: statusLabels.draft,
    blocked: statusLabels.blocked,
};

const REASON_LABELS: Record<MissingSpecReason, string> = {
    no_conversion_goal: 'Conversion goal required for this frame type',
    no_required_assets: 'Required assets must be listed',
    no_approval_requirements: 'Approval requirements must be defined',
    no_metrics: 'Metrics required for measurement frames',
    no_channel: 'Channel required for touchpoint frames',
    no_message_claim: 'Message claim required',
    no_objective: 'No objective defined',
    no_audience_segment: 'No audience segment specified',
    no_customer_state_before: 'No customer state (before) listed',
    no_customer_state_after: 'No customer state (after) listed',
    no_test_criteria: 'No test criteria defined',
    no_implementation_checklist: 'No implementation checklist',
    no_proof_points: 'No proof points listed',
    no_launch_dependencies: 'No launch dependencies documented',
};

// ─── Component ────────────────────────────────────────────────────────────────

interface Props {
    frame: StoryboardFrame;
    onClose: () => void;
}

export default function MarketingFrameInspector({ frame, onClose }: Props) {
    const accent = TYPE_COLORS[frame.type];
    const status = getCampaignBeatStatus(frame);
    const content = frame.content;

    const blockers = status.missing.filter(r => BLOCKING_REASONS.has(r));
    const specGaps = status.missing.filter(
        r => !BLOCKING_REASONS.has(r) && r !== 'no_proof_points' && r !== 'no_launch_dependencies',
    );

    return (
        <aside
            aria-label={`Frame details: ${frame.title}`}
            style={{
                position: 'absolute', top: 48, right: 0, bottom: 0,
                width: spacing.panelWidth.wide, maxWidth: '40vw',
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

            {/* ── Campaign beat status ─────────────────────────────────────────────── */}
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
                        {status.assetCount} {status.assetCount === 1 ? 'asset' : 'assets'}
                        {' · '}
                        {status.metricsCount} {status.metricsCount === 1 ? 'metric' : 'metrics'}
                        {' · '}
                        {status.checklistCount} {status.checklistCount === 1 ? 'task' : 'tasks'}
                    </span>
                </div>

                {blockers.length > 0 && (
                    <ul style={{ margin: 0, padding: 0, listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 4 }}>
                        {blockers.map(r => (
                            <li key={r} style={{ fontSize: 11, color: '#EF4444', display: 'flex', alignItems: 'flex-start', gap: 5 }}>
                                <span style={{ flexShrink: 0, marginTop: 1 }}>⚠</span>
                                <span>{REASON_LABELS[r]}</span>
                            </li>
                        ))}
                    </ul>
                )}

                {specGaps.length > 0 && (
                    <ul style={{ margin: 0, padding: 0, listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 3 }}>
                        {specGaps.map(r => (
                            <li key={r} style={{ fontSize: 11, color: '#64748b', display: 'flex', alignItems: 'flex-start', gap: 5 }}>
                                <span style={{ flexShrink: 0 }}>–</span>
                                <span>{REASON_LABELS[r]}</span>
                            </li>
                        ))}
                    </ul>
                )}

                {status.level === 'ready' && (
                    <span style={{ fontSize: 11, color: '#22C55E' }}>✓ All campaign requirements met</span>
                )}
            </div>

            {/* ── Campaign-specific content fields ──────────────────────────────────── */}
            <div style={{ padding: '14px 18px', display: 'flex', flexDirection: 'column', gap: 14 }}>

                {/* Objective */}
                {content.objective && (
                    <ContentSection title="Objective">
                        <p style={{ fontSize: 12, color: '#cbd5e1', lineHeight: 1.6 }}>{content.objective}</p>
                    </ContentSection>
                )}

                {/* Audience segment */}
                {content.audienceSegment && (
                    <ContentSection title="Audience Segment">
                        <p style={{ fontSize: 12, color: '#cbd5e1', lineHeight: 1.6 }}>{content.audienceSegment}</p>
                    </ContentSection>
                )}

                {/* Channel */}
                {content.channel && (
                    <ContentSection title="Channel">
                        <span style={{
                            display: 'inline-block', fontSize: 11, fontWeight: 600,
                            padding: '2px 8px', borderRadius: 4,
                            background: '#22C55E18', border: '1px solid #22C55E33', color: '#22C55E',
                        }}>
                            {content.channel}
                        </span>
                    </ContentSection>
                )}

                {/* Message claim */}
                {content.messageClaim && (
                    <ContentSection title="Message Claim">
                        <p style={{
                            fontSize: 12, color: '#f1f5f9', lineHeight: 1.6,
                            fontStyle: 'italic', borderLeft: `2px solid ${accent}`,
                            paddingLeft: 10,
                        }}>
                            "{content.messageClaim}"
                        </p>
                    </ContentSection>
                )}

                {/* Customer state before → after */}
                {((content.customerStateBefore?.length ?? 0) > 0 || (content.customerStateAfter?.length ?? 0) > 0) && (
                    <ContentSection title="Customer State Transition">
                        {content.customerStateBefore && content.customerStateBefore.length > 0 && (
                            <div style={{ marginBottom: 8 }}>
                                <span style={{ fontSize: 10, color: '#EF4444', fontWeight: 600, letterSpacing: '0.06em' }}>BEFORE</span>
                                <ul style={{ margin: '4px 0 0', padding: '0 0 0 14px', listStyle: 'disc' }}>
                                    {content.customerStateBefore.map((s, i) => (
                                        <li key={i} style={{ fontSize: 11, color: '#94a3b8', lineHeight: 1.5 }}>{s}</li>
                                    ))}
                                </ul>
                            </div>
                        )}
                        {content.customerStateAfter && content.customerStateAfter.length > 0 && (
                            <div>
                                <span style={{ fontSize: 10, color: '#22C55E', fontWeight: 600, letterSpacing: '0.06em' }}>AFTER</span>
                                <ul style={{ margin: '4px 0 0', padding: '0 0 0 14px', listStyle: 'disc' }}>
                                    {content.customerStateAfter.map((s, i) => (
                                        <li key={i} style={{ fontSize: 11, color: '#94a3b8', lineHeight: 1.5 }}>{s}</li>
                                    ))}
                                </ul>
                            </div>
                        )}
                    </ContentSection>
                )}

                {/* Conversion goal */}
                {content.conversionGoal && (
                    <ContentSection title="Conversion Goal">
                        <p style={{ fontSize: 12, color: '#06B6D4', lineHeight: 1.6 }}>{content.conversionGoal}</p>
                    </ContentSection>
                )}

                {/* Proof points */}
                {content.proofPoints && content.proofPoints.length > 0 && (
                    <ContentSection title="Proof Points">
                        <ul style={{ margin: 0, padding: '0 0 0 14px', listStyle: 'disc' }}>
                            {content.proofPoints.map((p, i) => (
                                <li key={i} style={{ fontSize: 11, color: '#94a3b8', lineHeight: 1.5 }}>{p}</li>
                            ))}
                        </ul>
                    </ContentSection>
                )}

                {/* Required assets */}
                {content.requiredAssets && content.requiredAssets.length > 0 && (
                    <ContentSection title="Required Assets">
                        <ul style={{ margin: 0, padding: '0 0 0 14px', listStyle: 'disc' }}>
                            {content.requiredAssets.map((a, i) => (
                                <li key={i} style={{ fontSize: 11, color: '#F97316', lineHeight: 1.5 }}>{a}</li>
                            ))}
                        </ul>
                    </ContentSection>
                )}

                {/* Approval requirements */}
                {content.approvalRequirements && content.approvalRequirements.length > 0 && (
                    <ContentSection title="Approval Requirements">
                        <ul style={{ margin: 0, padding: '0 0 0 14px', listStyle: 'disc' }}>
                            {content.approvalRequirements.map((a, i) => (
                                <li key={i} style={{ fontSize: 11, color: '#EF4444', lineHeight: 1.5 }}>{a}</li>
                            ))}
                        </ul>
                    </ContentSection>
                )}

                {/* Metrics */}
                {content.metrics && content.metrics.length > 0 && (
                    <ContentSection title="Metrics">
                        <ul style={{ margin: 0, padding: '0 0 0 14px', listStyle: 'disc' }}>
                            {content.metrics.map((m, i) => (
                                <li key={i} style={{ fontSize: 11, color: '#EC4899', lineHeight: 1.5 }}>{m}</li>
                            ))}
                        </ul>
                    </ContentSection>
                )}

                {/* Implementation checklist */}
                {content.implementationChecklist && content.implementationChecklist.length > 0 && (
                    <ContentSection title="Implementation Checklist">
                        <ul style={{ margin: 0, padding: 0, listStyle: 'none' }}>
                            {content.implementationChecklist.map((item, i) => (
                                <li key={i} style={{ fontSize: 11, color: '#94a3b8', lineHeight: 1.6, display: 'flex', gap: 6 }}>
                                    <span style={{ color: '#334155', flexShrink: 0 }}>☐</span>
                                    <span>{item}</span>
                                </li>
                            ))}
                        </ul>
                    </ContentSection>
                )}

                {/* Test criteria */}
                {content.testCriteria && content.testCriteria.length > 0 && (
                    <ContentSection title="Test Criteria">
                        <ul style={{ margin: 0, padding: 0, listStyle: 'none' }}>
                            {content.testCriteria.map((t, i) => (
                                <li key={i} style={{ fontSize: 11, color: '#94a3b8', lineHeight: 1.6, display: 'flex', gap: 6 }}>
                                    <span style={{ color: '#3B82F6', flexShrink: 0 }}>✦</span>
                                    <span>{t}</span>
                                </li>
                            ))}
                        </ul>
                    </ContentSection>
                )}
            </div>
        </aside>
    );
}

// ─── ContentSection helper ────────────────────────────────────────────────────

function ContentSection({ title, children }: { title: string; children: React.ReactNode }) {
    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            <span style={{ fontSize: 10, color: textColors.secondary, textTransform: 'uppercase', letterSpacing: typeScale.tracking.wide, fontWeight: 600 }}>
                {title}
            </span>
            {children}
        </div>
    );
}
