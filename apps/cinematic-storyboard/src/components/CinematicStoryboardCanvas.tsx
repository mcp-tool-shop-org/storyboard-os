// ─── cinematic-storyboard / CinematicStoryboardCanvas.tsx ─────────────────────
//
// Cinematic app adapter. Owns:
//   - Cinematic frame type styles (colors, accent, badge labels)
//   - Cinematic connection type styles
//   - Frame badge computation via @storyboard-os/cinematic-domain signals
//   - Full page layout: header, canvas area, inspector/connection panels, footer
//   - Viewport controls (zoom, pan, fit, reset)
//   - Keyboard shortcuts
//
// Uses @storyboard-os/canvas for the Konva rendering layer.
// CinematicFrameInspector stays separate because it reads cinematic content fields.
//
// ─────────────────────────────────────────────────────────────────────────────

import { useState, useCallback, useMemo, useRef, useEffect } from 'react';
import {
    StoryboardCanvas as KonvaBoard,
    type StoryboardCanvasConfig,
    type CanvasFrame,
    type ViewportHandle,
} from '@storyboard-os/canvas';
import {
    getCinematicFrameBadges,
    getSequenceReadiness,
    getSequenceProductionSignals,
    type CinematicBeatStatusLevel,
    type SequenceHealthLevel,
} from '@storyboard-os/cinematic-domain';
import type { Storyboard } from '@storyboard-os/cinematic-domain';
import CinematicFrameInspector from './CinematicFrameInspector';
import ProductionSignalPanel from './ProductionSignalPanel';
import ErrorBoundary from './ErrorBoundary';

// ─── Cinematic canvas config ──────────────────────────────────────────────────

const CINEMATIC_CANVAS_CONFIG: StoryboardCanvasConfig = {
    frameTypeStyles: {
        sequence:     { bg: '#0c1620', accent: '#475569', label: 'SEQUENCE' },
        shot:         { bg: '#0c1a2e', accent: '#3B82F6', label: 'SHOT' },
        camera_move:  { bg: '#071a1a', accent: '#06B6D4', label: 'CAMERA' },
        action:       { bg: '#1f0e00', accent: '#F97316', label: 'ACTION' },
        dialogue:     { bg: '#14092e', accent: '#A855F7', label: 'DIALOGUE' },
        transition:   { bg: '#0e0e1a', accent: '#6366F1', label: 'TRANSITION' },
        vfx:          { bg: '#1a0e1a', accent: '#EC4899', label: 'VFX' },
        audio:        { bg: '#071a0c', accent: '#22C55E', label: 'AUDIO' },
        edit_beat:    { bg: '#1a1500', accent: '#EAB308', label: 'EDIT' },
    },
    connectionTypeStyles: {
        sequence:        { stroke: '#475569', strokeWidth: 1.5 },
        match_cut:       { stroke: '#3B82F6', dash: [8, 4], strokeWidth: 2 },
        cutaway:         { stroke: '#F97316', dash: [6, 3], strokeWidth: 1.5 },
        reaction:        { stroke: '#A855F7', dash: [6, 3], strokeWidth: 2 },
        transition:      { stroke: '#6366F1', dash: [6, 3], strokeWidth: 1.5 },
        continuity:      { stroke: '#22C55E', dash: [4, 4], strokeWidth: 1.5 },
        parallel_action: { stroke: '#EAB308', dash: [8, 4], strokeWidth: 2 },
        fallback:        { stroke: '#334155', dash: [4, 4], strokeWidth: 1.5 },
    },
    defaultFrameStyle: { bg: '#0e1018', accent: '#475569', label: 'FRAME' },
    defaultConnectionStyle: { stroke: '#475569', strokeWidth: 1.5 },
};

// ─── Connection type display config ──────────────────────────────────────────

const CONNECTION_TYPE_LABELS: Record<string, string> = {
    sequence:        'Sequence',
    match_cut:       'Match Cut',
    cutaway:         'Cutaway',
    reaction:        'Reaction',
    transition:      'Transition',
    continuity:      'Continuity',
    parallel_action: 'Parallel Action',
    fallback:        'Fallback',
};

const CONNECTION_TYPE_COLORS: Record<string, string> = {
    sequence:        '#475569',
    match_cut:       '#3B82F6',
    cutaway:         '#F97316',
    reaction:        '#A855F7',
    transition:      '#6366F1',
    continuity:      '#22C55E',
    parallel_action: '#EAB308',
    fallback:        '#334155',
};

const CONNECTION_EXPLANATIONS: Record<string, string> = {
    sequence:        'This shot follows sequentially. Hard cut or standard transition.',
    match_cut:       'Visual or audio element matches between shots — creates graphic continuity.',
    cutaway:         'Interrupts the main action to show a related detail before returning.',
    reaction:        'Shows a character or environment reacting to the previous shot.',
    transition:      'Motivated transition: dissolve, wipe, or designed visual bridge.',
    continuity:      'These shots must maintain spatial/temporal continuity.',
    parallel_action: 'These shots happen simultaneously — intercut or split screen.',
    fallback:        'Alternative path — used if the primary shot is not achievable.',
};

// ─── Legend ───────────────────────────────────────────────────────────────────

const LEGEND = [
    { type: 'sequence', color: '#475569', label: 'Sequence', dashed: false, weight: 1.5 },
    { type: 'match_cut', color: '#3B82F6', label: 'Match Cut', dashed: true, weight: 2 },
    { type: 'reaction', color: '#A855F7', label: 'Reaction', dashed: true, weight: 2 },
    { type: 'parallel_action', color: '#EAB308', label: 'Parallel', dashed: true, weight: 2 },
    { type: 'continuity', color: '#22C55E', label: 'Continuity', dashed: true, weight: 1.5 },
];

// ─── Layout constants ─────────────────────────────────────────────────────────

const HEADER_HEIGHT = 48;

// ─── Component ────────────────────────────────────────────────────────────────

interface Props {
    storyboard: Storyboard;
}

// Exported as the default at the bottom of the file, wrapped in an error
// boundary so a thrown Konva mount error renders a graceful fallback (with a
// link to the SSG production brief) instead of blanking the page.
function CinematicStoryboardCanvasInner({ storyboard }: Props) {
    const handoffHref = `/sequences/${storyboard.id}/handoff`;
    const [selectedFrameId, setSelectedFrameId] = useState<string | null>(null);
    const [selectedConnectionId, setSelectedConnectionId] = useState<string | null>(null);
    const [showSignals, setShowSignals] = useState(false);
    const [scale, setScale] = useState(1);

    const canvasRef = useRef<ViewportHandle | null>(null);

    const handleSelectFrame = useCallback((id: string | null) => {
        setSelectedFrameId(id);
        if (id) setSelectedConnectionId(null);
    }, []);

    const handleSelectConnection = useCallback((id: string | null) => {
        setSelectedConnectionId(id);
        if (id) setSelectedFrameId(null);
    }, []);

    // ── Readiness + production signals ──────────────────────────────────────────
    const readiness = useMemo(
        () => getSequenceReadiness(storyboard),
        [storyboard],
    );

    const productionSignals = useMemo(
        () => getSequenceProductionSignals(storyboard),
        [storyboard],
    );

    const canvasFrames = useMemo<CanvasFrame[]>(() => {
        return storyboard.frames.map(frame => {
            const badges = getCinematicFrameBadges(frame);
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
    }, [storyboard.frames]);

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
                case 'p':
                case 'P':
                    setShowSignals(prev => !prev);
                    break;
                case 'Escape':
                    setSelectedFrameId(null);
                    setSelectedConnectionId(null);
                    setShowSignals(false);
                    break;
            }
        }

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, []);

    return (
        <div style={{ position: 'fixed', inset: 0, display: 'flex', flexDirection: 'column', background: '#0f172a' }}>

            {/* ── Header bar ────────────────────────────────────────────────────── */}
            <header style={{
                height: HEADER_HEIGHT,
                padding: '0 20px',
                background: 'rgba(15,23,42,0.97)',
                borderBottom: '1px solid rgba(255,255,255,0.08)',
                display: 'flex', alignItems: 'center', gap: 16,
                flexShrink: 0, zIndex: 30,
            }}>
                <a href="/" style={{ fontSize: 11, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.12em', fontWeight: 600, textDecoration: 'none' }}>
                    Cinematic Storyboard
                </a>
                <span style={{ color: '#1e293b' }}>|</span>
                <span style={{ fontSize: 14, fontWeight: 700, color: '#f1f5f9' }}>
                    {storyboard.title}
                </span>
                {storyboard.description && (
                    <span style={{ fontSize: 12, color: '#475569', flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {storyboard.description}
                    </span>
                )}
                <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 10 }}>
                    <span style={{ fontSize: 11, color: '#334155' }}>
                        {storyboard.frames.length} shots · {storyboard.connections.length} connections
                    </span>
                    <ReadinessCounts summary={readiness} />
                    <HealthBadge health={productionSignals.health} reason={productionSignals.healthReason} />
                    <button
                        onClick={() => setShowSignals(s => !s)}
                        title="Production Signals (P)"
                        style={{
                            fontSize: 11, fontWeight: 700, letterSpacing: '0.04em',
                            padding: '4px 10px', borderRadius: 4,
                            background: showSignals ? 'rgba(234,179,8,0.15)' : 'rgba(71,85,105,0.2)',
                            border: showSignals ? '1px solid rgba(234,179,8,0.4)' : '1px solid #1e293b',
                            color: showSignals ? '#EAB308' : '#94a3b8',
                            cursor: 'pointer',
                        }}
                    >
                        Signals
                    </button>
                    <a
                        href={handoffHref}
                        style={{
                            fontSize: 11, fontWeight: 700, letterSpacing: '0.04em',
                            padding: '4px 10px', borderRadius: 4,
                            background: 'rgba(71,85,105,0.2)', border: '1px solid #1e293b',
                            color: '#94a3b8', textDecoration: 'none',
                        }}
                    >
                        Production Brief →
                    </a>
                </div>
            </header>

            {/* ── Canvas + side panel row ────────────────────────────────────────── */}
            <div style={{ flex: 1, display: 'flex', overflow: 'hidden', position: 'relative' }}>

                {/* Canvas area */}
                <div style={{
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
                        config={CINEMATIC_CANVAS_CONFIG}
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
                    <CinematicFrameInspector
                        frame={selectedFrame}
                        onClose={() => setSelectedFrameId(null)}
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

                {/* Production signal panel */}
                {showSignals && !selectedFrame && !selectedConnection && (
                    <ProductionSignalPanel
                        signals={productionSignals}
                        onClose={() => setShowSignals(false)}
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
                        <span style={{ fontSize: 11, color: '#475569' }}>{entry.label}</span>
                    </div>
                ))}
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginLeft: 'auto' }}>
                    {[
                        { text: 'CAM', color: '#3B82F6' },
                        { text: 'VFX', color: '#EC4899' },
                        { text: 'SFX', color: '#06B6D4' },
                        { text: 'SPEC', color: '#22C55E' },
                    ].map(b => (
                        <span
                            key={b.text}
                            style={{
                                fontSize: 9, fontWeight: 700, letterSpacing: '0.05em',
                                padding: '1px 5px', borderRadius: 3,
                                border: `1px solid ${b.color}55`,
                                color: b.color, background: `${b.color}1a`,
                            }}
                        >
                            {b.text}
                        </span>
                    ))}
                    <span style={{ fontSize: 11, color: '#1e293b' }}>
                        drag to pan · scroll to pan · ctrl+scroll to zoom · F fit · 0 reset · P signals
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
    color: '#94a3b8',
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
            <span style={{ fontSize: 10, color: '#475569', marginRight: 4 }}>{pct}%</span>
            <CtrlBtn label="+" title="Zoom in (=)" onClick={() => canvasRef.current?.zoomIn()} />
            <CtrlBtn label="−" title="Zoom out (-)" onClick={() => canvasRef.current?.zoomOut()} />
            <CtrlBtn label="⊡" title="Fit to frames (F)" onClick={() => canvasRef.current?.fitToFrames()} />
            <CtrlBtn label="1:1" title="Reset (0)" onClick={() => canvasRef.current?.resetView()} />
        </div>
    );
}

// ─── ReadinessCounts ──────────────────────────────────────────────────────────

const STATUS_HEADER_COLORS: Record<CinematicBeatStatusLevel, string> = {
    ready: '#22C55E',
    partial: '#F97316',
    draft: '#6B7280',
    blocked: '#EF4444',
};

function ReadinessCounts({ summary }: { summary: { ready: number; partial: number; draft: number; blocked: number } }) {
    // Annotate the source array, not the filter result — contextual typing does
    // not flow through .filter(), so annotating the filtered variable left the
    // literals widened to `{ level: string }` (ts2322).
    const allChips: Array<{ level: CinematicBeatStatusLevel; count: number }> = [
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

// ─── HealthBadge ──────────────────────────────────────────────────────────────

const HEALTH_BADGE_COLORS: Record<SequenceHealthLevel, string> = {
    green: '#22C55E',
    yellow: '#EAB308',
    red: '#EF4444',
};

const HEALTH_BADGE_LABELS: Record<SequenceHealthLevel, string> = {
    green: '● READY',
    yellow: '▲ AT RISK',
    red: '■ BLOCKED',
};

function HealthBadge({ health, reason }: { health: SequenceHealthLevel; reason: string }) {
    const color = HEALTH_BADGE_COLORS[health];
    return (
        <span
            title={reason}
            style={{
                fontSize: 10, fontWeight: 700,
                padding: '2px 7px', borderRadius: 3,
                background: `${color}18`,
                border: `1px solid ${color}44`,
                color,
                letterSpacing: '0.04em',
                cursor: 'default',
            }}
        >
            {HEALTH_BADGE_LABELS[health]}
        </span>
    );
}

// ─── ConnectionPanel (continued) ──────────────────────────────────────────────

interface ConnectionPanelProps {
    connection: { id: string; type: string; label?: string };
    fromTitle: string;
    toTitle: string;
    onClose: () => void;
}

function ConnectionPanel({ connection, fromTitle, toTitle, onClose }: ConnectionPanelProps) {
    const typeLabel = CONNECTION_TYPE_LABELS[connection.type] ?? connection.type.toUpperCase();
    const accentColor = CONNECTION_TYPE_COLORS[connection.type] ?? '#475569';
    const explanation = CONNECTION_EXPLANATIONS[connection.type] ?? null;

    return (
        <aside style={{
            width: 320,
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
                        color: '#475569', fontSize: 18, lineHeight: 1, padding: '0 2px',
                    }}
                    aria-label="Close connection panel"
                >
                    ×
                </button>
            </div>

            <div style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: 16 }}>

                {/* Flow visualization */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                    <span style={{ fontSize: 10, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.1em', fontWeight: 600 }}>
                        Edit Flow
                    </span>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <span style={{
                            fontSize: 12, color: '#cbd5e1', background: 'rgba(255,255,255,0.05)',
                            padding: '4px 8px', borderRadius: 4, flex: 1, minWidth: 0,
                            overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                        }}>
                            {fromTitle}
                        </span>
                        <svg width="20" height="10" style={{ flexShrink: 0 }}>
                            <line x1="0" y1="5" x2="14" y2="5" stroke={accentColor} strokeWidth="1.5" />
                            <polygon points="14,2.5 20,5 14,7.5" fill={accentColor} />
                        </svg>
                        <span style={{
                            fontSize: 12, color: '#cbd5e1', background: 'rgba(255,255,255,0.05)',
                            padding: '4px 8px', borderRadius: 4, flex: 1, minWidth: 0,
                            overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                        }}>
                            {toTitle}
                        </span>
                    </div>
                </div>

                {/* Cinematic grammar explanation */}
                {explanation && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                        <span style={{ fontSize: 10, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.1em', fontWeight: 600 }}>
                            Cinematic Grammar
                        </span>
                        <p style={{
                            margin: 0, fontSize: 12, color: '#94a3b8',
                            lineHeight: 1.6, padding: '8px 10px',
                            background: `${accentColor}0d`,
                            border: `1px solid ${accentColor}22`,
                            borderRadius: 4,
                        }}>
                            {explanation}
                        </p>
                    </div>
                )}

                {/* Connection label */}
                {connection.label && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                        <span style={{ fontSize: 10, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.1em', fontWeight: 600 }}>
                            Note
                        </span>
                        <p style={{
                            margin: 0, fontSize: 13, color: '#f1f5f9',
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

// ─── Public entry point — wraps the canvas in an ErrorBoundary ───────────────
//
// Konva mount failures or render exceptions inside the canvas tree get caught
// here, rendering a fallback that points at the SSG'd production brief. The
// brief is plain HTML and works without React/Konva, so the user always has
// a path to their data even when the interactive board can't render.
export default function CinematicStoryboardCanvas({ storyboard }: Props) {
    const handoffHref = `/sequences/${storyboard.id}/handoff`;
    return (
        <ErrorBoundary handoffHref={handoffHref}>
            <CinematicStoryboardCanvasInner storyboard={storyboard} />
        </ErrorBoundary>
    );
}
