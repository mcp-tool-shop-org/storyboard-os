// ─── ViewControls.tsx ──────────────────────────────────────────────────────────
//
// Floating viewport controls overlaid in the lower-right corner of the canvas.
// Calls ViewportHandle methods — no viewport math lives here.
//
// ─────────────────────────────────────────────────────────────────────────────

import type { ViewportHandle } from '@storyboard-os/canvas';

interface Props {
  canvasRef: React.RefObject<ViewportHandle | null>;
  scale: number;
}

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

const BTN_HOVER: React.CSSProperties = {
  borderColor: 'rgba(255,255,255,0.22)',
  color: '#f1f5f9',
};

function CtrlBtn({
  label,
  title,
  onClick,
}: {
  label: string;
  title: string;
  onClick: () => void;
}) {
  return (
    <button
      title={title}
      onClick={onClick}
      style={BTN}
      onMouseEnter={e => Object.assign((e.currentTarget as HTMLElement).style, BTN_HOVER)}
      onMouseLeave={e => Object.assign((e.currentTarget as HTMLElement).style, BTN)}
    >
      {label}
    </button>
  );
}

export default function ViewControls({ canvasRef, scale }: Props) {
  const pct = Math.round(scale * 100);

  return (
    <div
      style={{
        position: 'absolute',
        bottom: 16,
        right: 16,
        display: 'flex',
        alignItems: 'center',
        gap: 4,
        zIndex: 20,
        // Prevent this overlay from intercepting canvas mouse events when not
        // directly over a button
        pointerEvents: 'none',
      }}
    >
      {/* All children re-enable pointer events individually */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 4,
          pointerEvents: 'auto',
          background: 'rgba(11,17,32,0.7)',
          backdropFilter: 'blur(6px)',
          borderRadius: 7,
          padding: '4px 6px',
          border: '1px solid rgba(255,255,255,0.07)',
        }}
      >
        <CtrlBtn
          label="Fit"
          title="Fit board to screen  (F)"
          onClick={() => canvasRef.current?.fitToFrames()}
        />
        <CtrlBtn
          label="1:1"
          title="Reset zoom to 100%  (0)"
          onClick={() => canvasRef.current?.resetView()}
        />

        {/* Separator */}
        <div
          style={{
            width: 1,
            height: 18,
            background: 'rgba(255,255,255,0.08)',
            margin: '0 2px',
          }}
        />

        <CtrlBtn
          label="−"
          title="Zoom out  (−)"
          onClick={() => canvasRef.current?.zoomOut()}
        />
        <span
          style={{
            fontSize: 11,
            fontWeight: 700,
            color: '#475569',
            minWidth: 36,
            textAlign: 'center',
            letterSpacing: '0.04em',
            userSelect: 'none',
          }}
        >
          {pct}%
        </span>
        <CtrlBtn
          label="+"
          title="Zoom in  (+)"
          onClick={() => canvasRef.current?.zoomIn()}
        />
      </div>
    </div>
  );
}
