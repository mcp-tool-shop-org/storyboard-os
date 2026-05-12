// ─── cinematic-storyboard / ErrorBoundary.tsx ────────────────────────────────
//
// React error boundary for the Konva-backed cinematic canvas.
//
// Konva mount failures (WebGL unavailable, OOM on long sequences, react-konva
// version skew) currently blank the sequence page — Astro hydrates the
// `client:only="react"` island and on a thrown render error the island
// silently unmounts. The user just sees navy.
//
// The sequence handoff page is SSG'd HTML — no React/Konva needed — so the
// fallback is: "canvas broke, here's the production brief instead."
// ─────────────────────────────────────────────────────────────────────────────

import React from 'react';

interface Props {
  children: React.ReactNode;
  /** Link to the SSG'd production brief for the current sequence. */
  handoffHref?: string;
  fallbackTitle?: string;
}

interface State {
  hasError: boolean;
  message: string;
}

export default class ErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, message: '' };
  }

  static getDerivedStateFromError(err: unknown): State {
    const message = err instanceof Error ? err.message : String(err);
    return { hasError: true, message };
  }

  componentDidCatch(err: unknown): void {
    if (typeof console !== 'undefined') {
      console.error('[CinematicStoryboardCanvas] render failed:', err);
    }
  }

  render(): React.ReactNode {
    if (!this.state.hasError) return this.props.children;

    const title = this.props.fallbackTitle ?? 'Canvas failed to load';
    const href = this.props.handoffHref;

    return (
      <div role="alert" style={fallbackStyles.root}>
        <div style={fallbackStyles.card}>
          <span style={fallbackStyles.icon} aria-hidden="true">⚠</span>
          <h2 style={fallbackStyles.title}>{title}</h2>
          <p style={fallbackStyles.body}>
            The interactive sequence board could not be rendered in this
            browser. Your sequence data is unchanged — only the canvas view
            failed.
          </p>
          {href && (
            <a href={href} style={fallbackStyles.cta}>
              View the production brief →
            </a>
          )}
          {this.state.message && (
            <details style={fallbackStyles.details}>
              <summary style={fallbackStyles.summary}>Technical details</summary>
              <pre style={fallbackStyles.pre}>{this.state.message}</pre>
            </details>
          )}
        </div>
      </div>
    );
  }
}

const fallbackStyles: Record<string, React.CSSProperties> = {
  root: {
    width: '100%',
    height: '100vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: '#0f172a',
    color: '#f1f5f9',
    fontFamily: 'ui-sans-serif, system-ui, sans-serif',
    padding: 24,
    boxSizing: 'border-box',
  },
  card: {
    maxWidth: 480,
    width: '100%',
    background: '#0f1825',
    border: '1px solid rgba(255,255,255,0.08)',
    borderRadius: 12,
    padding: 28,
    display: 'flex',
    flexDirection: 'column',
    gap: 14,
    textAlign: 'left',
  },
  icon: { fontSize: 24, color: '#EF4444', lineHeight: 1 },
  title: { fontSize: 18, fontWeight: 700, color: '#f1f5f9', margin: 0 },
  body: { fontSize: 13, color: '#94a3b8', lineHeight: 1.6, margin: 0 },
  cta: {
    fontSize: 13,
    fontWeight: 700,
    color: '#8B5CF6',
    textDecoration: 'none',
    alignSelf: 'flex-start',
    padding: '8px 0',
  },
  details: { fontSize: 11, color: '#475569', marginTop: 4 },
  summary: { cursor: 'pointer', color: '#64748b', fontSize: 11, fontWeight: 600 },
  pre: {
    background: '#0a0e18',
    border: '1px solid rgba(255,255,255,0.04)',
    borderRadius: 4,
    padding: 10,
    marginTop: 8,
    fontFamily: 'ui-monospace, monospace',
    fontSize: 11,
    color: '#94a3b8',
    whiteSpace: 'pre-wrap',
    wordBreak: 'break-word',
    maxHeight: 120,
    overflow: 'auto',
  },
};
