// ─── marketing-storyboard / MarketingStoryboardCanvas.tsx ─────────────────────
//
// Marketing app adapter. Owns:
//   - Marketing frame type styles (colors, accent, badge labels)
//   - Marketing connection type styles
//   - Frame badge computation via @storyboard-os/marketing-domain signals
//   - Full page layout: header, canvas area, inspector/connection panels, footer
//   - Viewport controls (zoom, pan, fit, reset)
//   - Keyboard shortcuts
//
// Uses @storyboard-os/canvas for the Konva rendering layer.
// MarketingFrameInspector stays separate because it reads marketing content fields.
//
// ─────────────────────────────────────────────────────────────────────────────

import { useState, useCallback, useMemo, useRef, useEffect } from 'react';
import {
    StoryboardCanvas as KonvaBoard,
    type StoryboardCanvasConfig,
    type CanvasFrame,
    type ViewportHandle,
    DEFAULT_FRAME_STYLE,
} from '@storyboard-os/canvas';
import {
    getMarketingFrameBadges,
    getCampaignReadiness,
    getCampaignLaunchReadiness,
    getCampaignCriticalPath,
    getApprovalGateSignals,
    getMeasurementLoopSignals,
    marketingColors,
    type CampaignBeatStatusLevel,
    type LaunchReadinessLevel,
    type ApprovalGateSignal,
    type MeasurementLoopSignal,
} from '@storyboard-os/marketing-domain';
import type { Storyboard } from '@storyboard-os/marketing-domain';
import { statusColors, textColors, typeScale } from '@storyboard-os/core';
import { categorizeApprovalSignals } from '../lib/launchBlockers';
import MarketingFrameInspector from './MarketingFrameInspector';
import ErrorBoundary from './ErrorBoundary';

// ─── Neutral connection greys ─────────────────────────────────────────────────
// The two authored slate line colors reused across the config, legend, and
// connection panel. No shared status token maps to them (they are chrome, not
// status), so they stay as named locals — a single source rather than scattered
// literals.

const SLATE_LINE = '#475569';
const SLATE_LINE_DIM = '#334155';

// ─── Marketing canvas config ──────────────────────────────────────────────────
// Accent + connection stroke colors come from the shared token API
// (@storyboard-os/core statusColors + @storyboard-os/marketing-domain
// marketingColors) so the card badge, legend, inspector, and header all read
// from one source and can never drift. The per-type `bg` tints are unique dark
// washes (not status colors), so they stay literal.

const MARKETING_CANVAS_CONFIG: StoryboardCanvasConfig = {
    frameTypeStyles: {
        audience: { bg: '#0c1a2e', accent: statusColors.state, label: 'AUDIENCE' },
        message: { bg: '#14092e', accent: statusColors.accent, label: 'MESSAGE' },
        touchpoint: { bg: '#071a0c', accent: statusColors.spec, label: 'TOUCHPOINT' },
        asset: { bg: '#1f0e00', accent: statusColors.partial, label: 'ASSET' },
        approval: { bg: '#1f0808', accent: statusColors.blocked, label: 'APPROVAL' },
        launch_event: { bg: '#1a1500', accent: marketingColors.critical, label: 'LAUNCH' },
        conversion: { bg: '#0e1a1a', accent: '#06B6D4', label: 'CONVERSION' },
        follow_up: { bg: '#0e0e1a', accent: '#6366F1', label: 'FOLLOW-UP' },
        measurement: { bg: '#1a0e1a', accent: '#EC4899', label: 'MEASUREMENT' },
    },
    connectionTypeStyles: {
        sequence: { stroke: SLATE_LINE, strokeWidth: 1.5 },
        dependency: { stroke: statusColors.blocked, dash: [8, 4], strokeWidth: 2 },
        // The "Approval Gate" connection reads the same amber as the GATE badge.
        approval: { stroke: marketingColors.gate, dash: [6, 3], strokeWidth: 2 },
        optional: { stroke: SLATE_LINE_DIM, dash: [4, 4], strokeWidth: 1.5 },
    },
    // Byte-identical to the canvas package's exported fallback frame style —
    // reuse it verbatim rather than hand-copying the literal.
    defaultFrameStyle: DEFAULT_FRAME_STYLE,
    defaultConnectionStyle: { stroke: SLATE_LINE, strokeWidth: 1.5 },
};

// ─── Connection type display config ──────────────────────────────────────────

const CONNECTION_TYPE_LABELS: Record<string, string> = {
    sequence: 'Campaign Flow',
    dependency: 'Dependency',
    approval: 'Approval Gate',
    optional: 'Optional Path',
};

const CONNECTION_TYPE_COLORS: Record<string, string> = {
    sequence: SLATE_LINE,
    dependency: statusColors.blocked,
    approval: marketingColors.gate,
    optional: SLATE_LINE_DIM,
};

const CONNECTION_EXPLANATIONS: Record<string, string> = {
    sequence: 'This beat follows the previous one in the campaign flow. Execution is sequential.',
    dependency: 'This beat cannot start until the upstream dependency is resolved.',
    approval: 'This beat requires formal approval before the downstream work can begin.',
    optional: 'This path is optional — the campaign can proceed without it.',
};

// ─── Legend ───────────────────────────────────────────────────────────────────

const LEGEND = [
    { type: 'sequence', color: SLATE_LINE, label: 'Flow', dashed: false, weight: 1.5 },
    { type: 'dependency', color: statusColors.blocked, label: 'Dependency', dashed: true, weight: 2 },
    { type: 'approval', color: marketingColors.gate, label: 'Approval', dashed: true, weight: 2 },
    { type: 'optional', color: SLATE_LINE_DIM, label: 'Optional', dashed: true, weight: 1.5 },
];

// ─── Badge legend ───────────────────────────────────────────────────────────
// The card-badge color key in the footer. VP-002: GATE reads amber
// (marketingColors.gate) so it matches the card badge — it was hardcoded red
// (#EF4444, the `blocked` hue), which made the legend disagree with the card.
// VP-004: CRITICAL is present here (marketingColors.critical) — the critical-
// path badge previously had no legend entry and collided with the launch_event
// accent. Every swatch reads from a domain/status token; a test pins
// GATE === marketingColors.gate so the card-vs-legend bug can't return.

const BADGE_LEGEND: Array<{ text: string; color: string }> = [
    { text: 'STATE', color: marketingColors.state },
    { text: 'GATE', color: marketingColors.gate },
    { text: 'CRITICAL', color: marketingColors.critical },
    { text: 'SPEC', color: marketingColors.ready },
];

// Exported for the color-reconciliation test (mkt legend GATE === domain token).
export { BADGE_LEGEND as MARKETING_BADGE_LEGEND };

// ─── Layout constants ─────────────────────────────────────────────────────────

const HEADER_HEIGHT = 48;

// ─── SO wordmark badge ────────────────────────────────────────────────────────
// VP-014: the shared "SO" (Storyboard OS) mark in the header so all three
// verticals + the site read as one product. Uses the shared accent hue.

function SOBadge() {
    return (
        <span
            aria-hidden="true"
            style={{
                display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                width: 22, height: 22, borderRadius: 5,
                background: `linear-gradient(135deg, ${statusColors.accent}, ${statusColors.state})`,
                color: '#fff', fontSize: 10, fontWeight: 800, letterSpacing: '0.02em',
                flexShrink: 0,
            }}
        >
            SO
        </span>
    );
}

// ─── Component ────────────────────────────────────────────────────────────────

interface Props {
    storyboard: Storyboard;
}

// Exported as the default at the bottom of the file, wrapped in an error
// boundary so a thrown Konva mount error renders a graceful fallback (with a
// link to the SSG launch brief) instead of blanking the page.
function MarketingStoryboardCanvasInner({ storyboard }: Props) {
    const handoffHref = `/campaigns/${storyboard.id}/handoff`;
    const [selectedFrameId, setSelectedFrameId] = useState<string | null>(null);
    const [selectedConnectionId, setSelectedConnectionId] = useState<string | null>(null);
    const [scale, setScale] = useState(1);

    const canvasRef = useRef<ViewportHandle | null>(null);

    const handleSelectFrame = useCallback((id: string | null) => {
        setSelectedFrameId(id);
    }, []);

    const handleSelectConnection = useCallback((id: string | null) => {
        setSelectedConnectionId(id);
    }, []);

    // ── Marketing badge + readiness computation ────────────────────────────────
    const launchReadiness = useMemo(
        () => getCampaignLaunchReadiness(storyboard),
        [storyboard],
    );

    const criticalPathIds = useMemo(
        () => new Set(getCampaignCriticalPath(storyboard)),
        [storyboard],
    );

    const approvalSignals = useMemo(
        () => getApprovalGateSignals(storyboard),
        [storyboard],
    );

    // Blocked vs pending approval gates (see lib/launchBlockers.ts for why
    // "pending" is derived rather than a status level).
    const approvalCategories = useMemo(
        () => categorizeApprovalSignals(approvalSignals),
        [approvalSignals],
    );

    const measurementSignals = useMemo(
        () => getMeasurementLoopSignals(storyboard),
        [storyboard],
    );

    const canvasFrames = useMemo<CanvasFrame[]>(() => {
        return storyboard.frames.map(frame => {
            const badges = getMarketingFrameBadges(frame);
            if (criticalPathIds.has(frame.id)) {
                badges.push({ text: 'CRITICAL', color: marketingColors.critical });
            }
            return {
                id: frame.id,
                type: frame.type,
                title: frame.title,
                summary: frame.summary,
                position: frame.position,
                size: frame.size,
                badges,
            };
        });
    }, [storyboard.frames, criticalPathIds]);

    const readinessSummary = useMemo(
        () => getCampaignReadiness(storyboard),
        [storyboard],
    );

    // ── Selected entities ──────────────────────────────────────────────────────
    const selectedFrame = selectedFrameId
        ? storyboard.frames.find(f => f.id === selectedFrameId) ?? null
        : null;

    const selectedConnection = selectedConnectionId
        ? storyboard.connections.find(c => c.id === selectedConnectionId) ?? null
        : null;

    const connFromFrame = selectedConnection
        ? storyboard.frames.find(f => f.id === selectedConnection.fromFrameId)
        : null;

    const connToFrame = selectedConnection
        ? storyboard.frames.find(f => f.id === selectedConnection.toFrameId)
        : null;

    // ── Keyboard shortcuts ─────────────────────────────────────────────────────
    useEffect(() => {
        function handleKeyDown(e: KeyboardEvent) {
            const tag = (e.target as HTMLElement)?.tagName;
            if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') return;

            switch (e.key) {
                case 'f':
                case 'F':
                    canvasRef.current?.fitToFrames();
                    break;
                case '0':
                    canvasRef.current?.resetView();
                    break;
                case '+':
                case '=':
                    canvasRef.current?.zoomIn();
                    break;
                case '-':
                    canvasRef.current?.zoomOut();
                    break;
                case 'Escape':
                    setSelectedFrameId(null);
                    setSelectedConnectionId(null);
                    break;
            }
        }

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, []);

    return (
        <div style={{ position: 'fixed', inset: 0, display: 'flex', flexDirection: 'column', background: '#0f172a' }}>

            {/* ── Header bar ────────────────────────────────────────────────────── */}
            {/* VP-009: minHeight (not fixed height) + wrap so the chip cluster can
                drop to a second row on narrow viewports (~1024–1100px) instead of
                overflowing off the right edge. */}
            <header style={{
                minHeight: HEADER_HEIGHT,
                padding: '6px 20px',
                background: 'rgba(15,23,42,0.97)',
                borderBottom: '1px solid rgba(255,255,255,0.08)',
                display: 'flex', alignItems: 'center', gap: 16, flexWrap: 'wrap',
                flexShrink: 0, zIndex: 30,
            }}>
                <a href="/" aria-label="Storyboard OS home" style={{ display: 'flex', alignItems: 'center', gap: 8, textDecoration: 'none', flexShrink: 0 }}>
                    <SOBadge />
                    <span style={{ fontSize: 11, color: textColors.secondary, textTransform: 'uppercase', letterSpacing: typeScale.tracking.wide, fontWeight: 600 }}>
                        Marketing Storyboard
                    </span>
                </a>
                <span style={{ color: SLATE_LINE_DIM }} aria-hidden="true">|</span>
                <h1 style={{ fontSize: 14, fontWeight: 700, color: textColors.heading, margin: 0, lineHeight: 1.2 }}>
                    {storyboard.title}
                </h1>
                {storyboard.description && (
                    <span style={{ fontSize: 12, color: textColors.secondary, flex: 1, minWidth: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {storyboard.description}
                    </span>
                )}
                <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap', justifyContent: 'flex-end' }}>
                    <span style={{ fontSize: 11, color: textColors.muted }}>
                        {storyboard.frames.length} frames · {storyboard.connections.length} connections
                    </span>
                    <ReadinessCounts summary={readinessSummary} />
                    <LaunchReadinessBadge level={launchReadiness.level} summary={launchReadiness.summary} />
                    <a
                        href="/handbook"
                        style={{
                            fontSize: 11, fontWeight: 700, letterSpacing: typeScale.tracking.label,
                            padding: '4px 10px', borderRadius: 4,
                            background: 'rgba(71,85,105,0.2)', border: `1px solid ${SLATE_LINE_DIM}`,
                            color: textColors.secondary, textDecoration: 'none',
                        }}
                    >
                        Handbook
                    </a>
                    <a
                        href={handoffHref}
                        style={{
                            fontSize: 11, fontWeight: 700, letterSpacing: typeScale.tracking.label,
                            padding: '4px 10px', borderRadius: 4,
                            background: 'rgba(71,85,105,0.2)', border: `1px solid ${SLATE_LINE_DIM}`,
                            color: textColors.secondary, textDecoration: 'none',
                        }}
                    >
                        Campaign Brief →
                    </a>
                </div>
            </header>

            {/* ── Canvas + side panel row ────────────────────────────────────────── */}
            <div style={{ flex: 1, display: 'flex', overflow: 'hidden', position: 'relative' }}>

                {/* Canvas area */}
                <div role="main" aria-label={`Campaign board: ${storyboard.title}`} style={{
                    flex: 1,
                    overflow: 'hidden',
                    position: 'relative',
                    backgroundImage: 'radial-gradient(circle, #1e293b 1px, transparent 1px)',
                    backgroundSize: '32px 32px',
                    backgroundPosition: '0 0',
                    backgroundColor: '#0b1120',
                }}>
                    <KonvaBoard
                        ref={canvasRef}
                        frames={canvasFrames}
                        connections={storyboard.connections}
                        config={MARKETING_CANVAS_CONFIG}
                        selectedFrameId={selectedFrameId}
                        onSelectFrame={handleSelectFrame}
                        selectedConnectionId={selectedConnectionId}
                        onSelectConnection={handleSelectConnection}
                        onViewStateChange={v => setScale(v.scale)}
                        autoFit
                    />

                    {/* Viewport controls */}
                    <ViewControls canvasRef={canvasRef} scale={scale} />
                </div>

                {/* Frame inspector */}
                {selectedFrame && (
                    <MarketingFrameInspector
                        frame={selectedFrame}
                        onClose={() => setSelectedFrameId(null)}
                    />
                )}

                {/* Launch blockers panel — visible when issues exist and no frame/connection is selected.
                    Pending approvals count as an issue: they must surface here even when
                    nothing is hard-blocked (AP-006 #4). */}
                {!selectedFrame && !selectedConnection && (
                    launchReadiness.blockedFrameIds.length > 0 ||
                    launchReadiness.missingMeasurementFrameIds.length > 0 ||
                    approvalCategories.pending.length > 0
                ) && (
                    <LaunchBlockersPanel
                        blockedApprovals={approvalCategories.blocked}
                        pendingApprovals={approvalCategories.pending}
                        measurementSignals={measurementSignals}
                        frames={storyboard.frames}
                    />
                )}

                {/* Connection detail panel */}
                {selectedConnection && connFromFrame && connToFrame && (
                    <ConnectionPanel
                        connection={selectedConnection}
                        fromTitle={connFromFrame.title}
                        toTitle={connToFrame.title}
                        onClose={() => setSelectedConnectionId(null)}
                    />
                )}
            </div>

            {/* ── Legend footer ─────────────────────────────────────────────────── */}
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
                                strokeWidth={entry.weight}
                                strokeDasharray={entry.dashed ? '6 3' : undefined}
                            />
                            <polygon points="22,2 28,5 22,8" fill={entry.color} />
                        </svg>
                        <span style={{ fontSize: 11, color: textColors.muted }}>{entry.label}</span>
                    </div>
                ))}
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginLeft: 'auto' }}>
                    {BADGE_LEGEND.map(b => (
                        <span
                            key={b.text}
                            style={{
                                fontSize: 9, fontWeight: 700, letterSpacing: typeScale.tracking.label,
                                padding: '1px 5px', borderRadius: 3,
                                border: `1px solid ${b.color}55`,
                                color: b.color, background: `${b.color}1a`,
                            }}
                        >
                            {b.text}
                        </span>
                    ))}
                    <span style={{ fontSize: 11, color: textColors.muted }}>
                        drag to pan · scroll to pan · ctrl+scroll to zoom · F fit · 0 reset
                    </span>
                </div>
            </footer>
        </div>
    );
}

// ─── ViewControls ─────────────────────────────────────────────────────────────

const BTN: React.CSSProperties = {
    background: 'rgba(15,24,42,0.92)',
    border: '1px solid rgba(255,255,255,0.1)',
    borderRadius: 5,
    color: textColors.secondary,
    cursor: 'pointer',
    fontSize: 15,
    fontWeight: 700,
    lineHeight: 1,
    padding: '6px 10px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    transition: 'border-color 0.12s, color 0.12s',
    userSelect: 'none',
};

function CtrlBtn({ label, title, onClick }: { label: string; title: string; onClick: () => void }) {
    return (
        <button title={title} onClick={onClick} style={BTN}>
            {label}
        </button>
    );
}

function ViewControls({ canvasRef, scale }: { canvasRef: React.RefObject<ViewportHandle | null>; scale: number }) {
    const pct = Math.round(scale * 100);
    return (
        <div style={{
            position: 'absolute', bottom: 12, right: 12,
            display: 'flex', gap: 4, zIndex: 20,
            alignItems: 'center',
        }}>
            <span style={{ fontSize: 10, color: textColors.muted, marginRight: 4 }}>{pct}%</span>
            <CtrlBtn label="+" title="Zoom in (=)" onClick={() => canvasRef.current?.zoomIn()} />
            <CtrlBtn label="−" title="Zoom out (-)" onClick={() => canvasRef.current?.zoomOut()} />
            <CtrlBtn label="⊡" title="Fit to frames (F)" onClick={() => canvasRef.current?.fitToFrames()} />
            <CtrlBtn label="1:1" title="Reset (0)" onClick={() => canvasRef.current?.resetView()} />
        </div>
    );
}

// ─── ReadinessCounts ──────────────────────────────────────────────────────────

const STATUS_HEADER_COLORS: Record<CampaignBeatStatusLevel, string> = {
    ready: statusColors.spec,
    partial: statusColors.partial,
    draft: statusColors.draft,
    blocked: statusColors.blocked,
};

function ReadinessCounts({ summary }: { summary: ReturnType<typeof getCampaignReadiness> }) {
    // Annotate the source array, not the filter result — contextual typing does
    // not flow through .filter(), so annotating the filtered variable left the
    // literals widened to `{ level: string }` (ts2322).
    const allChips: Array<{ level: CampaignBeatStatusLevel; count: number }> = [
        { level: 'ready', count: summary.ready },
        { level: 'partial', count: summary.partial },
        { level: 'blocked', count: summary.blocked },
        { level: 'draft', count: summary.draft },
    ];
    const chips = allChips.filter(c => c.count > 0);

    if (chips.length === 0) return null;

    return (
        <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
            {chips.map(({ level, count }) => (
                <span
                    key={level}
                    title={`${count} ${level}`}
                    style={{
                        fontSize: 10, fontWeight: 700,
                        padding: '2px 6px', borderRadius: 3,
                        background: `${STATUS_HEADER_COLORS[level]}18`,
                        border: `1px solid ${STATUS_HEADER_COLORS[level]}44`,
                        color: STATUS_HEADER_COLORS[level],
                        letterSpacing: '0.04em',
                    }}
                >
                    {count} {level.toUpperCase()}
                </span>
            ))}
        </div>
    );
}

// ─── ConnectionPanel ──────────────────────────────────────────────────────────

interface ConnectionPanelProps {
    connection: { id: string; type: string; label?: string };
    fromTitle: string;
    toTitle: string;
    onClose: () => void;
}

function ConnectionPanel({ connection, fromTitle, toTitle, onClose }: ConnectionPanelProps) {
    const typeLabel = CONNECTION_TYPE_LABELS[connection.type] ?? connection.type.toUpperCase();
    const accentColor = CONNECTION_TYPE_COLORS[connection.type] ?? SLATE_LINE;
    const explanation = CONNECTION_EXPLANATIONS[connection.type] ?? null;

    return (
        <aside style={{
            width: 300,
            flexShrink: 0,
            background: '#0f1825',
            borderLeft: '1px solid rgba(255,255,255,0.07)',
            display: 'flex',
            flexDirection: 'column',
            overflowY: 'auto',
        }}>
            <div style={{
                padding: '12px 16px',
                borderBottom: '1px solid rgba(255,255,255,0.07)',
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                flexShrink: 0,
            }}>
                <span style={{
                    display: 'inline-block',
                    width: 10, height: 10,
                    borderRadius: '50%',
                    background: accentColor,
                    flexShrink: 0,
                }} />
                <span style={{ fontSize: 11, fontWeight: 700, color: accentColor, textTransform: 'uppercase', letterSpacing: '0.1em' }}>
                    {typeLabel}
                </span>
                <button
                    onClick={onClose}
                    style={{
                        marginLeft: 'auto',
                        background: 'none', border: 'none', cursor: 'pointer',
                        color: textColors.muted, fontSize: 18, lineHeight: 1, padding: '0 2px',
                    }}
                    aria-label="Close connection panel"
                >
                    ×
                </button>
            </div>

            <div style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: 16 }}>

                {/* Flow visualization */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                    <span style={{ fontSize: 10, color: textColors.secondary, textTransform: 'uppercase', letterSpacing: typeScale.tracking.wide, fontWeight: 600 }}>
                        Campaign Flow
                    </span>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <span style={{
                            fontSize: 12, color: textColors.primary, background: 'rgba(255,255,255,0.05)',
                            padding: '4px 8px', borderRadius: 4, flex: 1, minWidth: 0,
                            overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                        }}>
                            {fromTitle}
                        </span>
                        <svg width="20" height="10" style={{ flexShrink: 0 }} aria-hidden="true">
                            <line x1="0" y1="5" x2="14" y2="5" stroke={accentColor} strokeWidth="1.5" />
                            <polygon points="14,2.5 20,5 14,7.5" fill={accentColor} />
                        </svg>
                        <span style={{
                            fontSize: 12, color: textColors.primary, background: 'rgba(255,255,255,0.05)',
                            padding: '4px 8px', borderRadius: 4, flex: 1, minWidth: 0,
                            overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                        }}>
                            {toTitle}
                        </span>
                    </div>
                </div>

                {/* Flow meaning explanation */}
                {explanation && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                        <span style={{ fontSize: 10, color: textColors.secondary, textTransform: 'uppercase', letterSpacing: typeScale.tracking.wide, fontWeight: 600 }}>
                            What This Means
                        </span>
                        <p style={{
                            margin: 0, fontSize: 12, color: textColors.secondary,
                            lineHeight: 1.6, padding: '8px 10px',
                            background: `${accentColor}0d`,
                            border: `1px solid ${accentColor}22`,
                            borderRadius: 4,
                        }}>
                            {explanation}
                        </p>
                    </div>
                )}

                {/* Connection label (condition) */}
                {connection.label && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                        <span style={{ fontSize: 10, color: textColors.secondary, textTransform: 'uppercase', letterSpacing: typeScale.tracking.wide, fontWeight: 600 }}>
                            Condition / Gate
                        </span>
                        <p style={{
                            margin: 0, fontSize: 13, color: textColors.heading,
                            background: `${accentColor}1a`,
                            border: `1px solid ${accentColor}33`,
                            borderRadius: 4, padding: '8px 10px',
                            lineHeight: 1.5,
                        }}>
                            {connection.label}
                        </p>
                    </div>
                )}
            </div>
        </aside>
    );
}

// ─── LaunchReadinessBadge ─────────────────────────────────────────────────────

const LAUNCH_BADGE_COLORS: Record<LaunchReadinessLevel, string> = {
    ready: statusColors.spec,
    at_risk: statusColors.partial,
    blocked: statusColors.blocked,
    draft: statusColors.draft,
};

const LAUNCH_BADGE_LABELS: Record<LaunchReadinessLevel, string> = {
    ready: 'READY',
    at_risk: 'AT RISK',
    blocked: 'BLOCKED',
    draft: 'DRAFT',
};

function LaunchReadinessBadge({ level, summary }: { level: LaunchReadinessLevel; summary: string }) {
    const color = LAUNCH_BADGE_COLORS[level];
    return (
        <span
            title={summary}
            style={{
                fontSize: 10, fontWeight: 700, letterSpacing: '0.06em',
                padding: '3px 8px', borderRadius: 4,
                background: `${color}18`,
                border: `1px solid ${color}55`,
                color,
            }}
        >
            ⚡ {LAUNCH_BADGE_LABELS[level]}
        </span>
    );
}

// ─── LaunchBlockersPanel ──────────────────────────────────────────────────────

interface LaunchBlockersPanelProps {
    /** Gates with no approval requirements defined — cannot pass at all. */
    blockedApprovals: ApprovalGateSignal[];
    /** Gates defined but not fully specced — approvals awaiting completion.
        Categorized in lib/launchBlockers.ts; the old `status === 'pending'`
        filter compared against a level that does not exist and hid these. */
    pendingApprovals: ApprovalGateSignal[];
    measurementSignals: MeasurementLoopSignal[];
    frames: Array<{ id: string; title: string }>;
}

function LaunchBlockersPanel({ blockedApprovals, pendingApprovals, measurementSignals, frames }: LaunchBlockersPanelProps) {
    const frameTitle = (id: string) => frames.find(f => f.id === id)?.title ?? id;

    const missingMetrics = measurementSignals.filter(s => !s.hasMetrics);
    const openLoops = measurementSignals.filter(s => s.hasMetrics && !s.isLoop);

    const hasIssues = blockedApprovals.length > 0 || pendingApprovals.length > 0 || missingMetrics.length > 0 || openLoops.length > 0;
    if (!hasIssues) return null;

    return (
        <aside style={{
            width: 280,
            flexShrink: 0,
            background: '#0f1825',
            borderLeft: '1px solid rgba(255,255,255,0.07)',
            display: 'flex',
            flexDirection: 'column',
            overflowY: 'auto',
        }}>
            <div style={{
                padding: '12px 16px',
                borderBottom: '1px solid rgba(255,255,255,0.07)',
            }}>
                <span style={{ fontSize: 11, fontWeight: 700, color: statusColors.blocked, textTransform: 'uppercase', letterSpacing: typeScale.tracking.wide }}>
                    Launch Blockers
                </span>
            </div>
            <div style={{ padding: '12px 16px', display: 'flex', flexDirection: 'column', gap: 14 }}>

                {/* Approval blockers */}
                {blockedApprovals.length > 0 && (
                    <BlockerSection title="Approval — Blocked" color={statusColors.blocked}>
                        {blockedApprovals.map(s => (
                            <BlockerItem key={s.frameId} label={frameTitle(s.frameId)} detail="Missing approval requirements" />
                        ))}
                    </BlockerSection>
                )}

                {pendingApprovals.length > 0 && (
                    <BlockerSection title="Approval — Pending" color={marketingColors.gate}>
                        {pendingApprovals.map(s => (
                            <BlockerItem key={s.frameId} label={frameTitle(s.frameId)} detail={s.blocksLaunch ? 'Blocks launch' : 'Does not block launch'} />
                        ))}
                    </BlockerSection>
                )}

                {/* Measurement gaps */}
                {missingMetrics.length > 0 && (
                    <BlockerSection title="Measurement — Missing Metrics" color="#EC4899">
                        {missingMetrics.map(s => (
                            <BlockerItem key={s.frameId} label={frameTitle(s.frameId)} detail="No metrics defined" />
                        ))}
                    </BlockerSection>
                )}

                {openLoops.length > 0 && (
                    <BlockerSection title="Measurement — Open Loop" color={statusColors.partial}>
                        {openLoops.map(s => (
                            <BlockerItem key={s.frameId} label={frameTitle(s.frameId)} detail={`${s.metricsCount} metric(s) — no feedback loop`} />
                        ))}
                    </BlockerSection>
                )}
            </div>
        </aside>
    );
}

function BlockerSection({ title, color, children }: { title: string; color: string; children: React.ReactNode }) {
    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            <span style={{ fontSize: 10, fontWeight: 600, color, textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                {title}
            </span>
            {children}
        </div>
    );
}

function BlockerItem({ label, detail }: { label: string; detail: string }) {
    return (
        <div style={{
            padding: '6px 10px', borderRadius: 4,
            background: 'rgba(255,255,255,0.03)',
            border: '1px solid rgba(255,255,255,0.06)',
        }}>
            <div style={{ fontSize: 12, color: textColors.primary, fontWeight: 500 }}>{label}</div>
            <div style={{ fontSize: 11, color: textColors.muted, marginTop: 2 }}>{detail}</div>
        </div>
    );
}

export default function MarketingStoryboardCanvas({ storyboard }: Props) {
    const handoffHref = `/campaigns/${storyboard.id}/handoff`;
    return (
        <ErrorBoundary handoffHref={handoffHref}>
            <MarketingStoryboardCanvasInner storyboard={storyboard} />
        </ErrorBoundary>
    );
}
