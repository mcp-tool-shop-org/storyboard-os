// ─── storyboard-canvas / AccessibleFrameList.tsx ─────────────────────────────
//
// HU-001: the keyboard + screen-reader access layer for the storyboard board.
//
// The board itself is a single opaque Konva <canvas>, and canvas pixels cannot
// hold DOM focus — so a keyboard-only or screen-reader user has no way to reach
// a frame, and since the inspector / beat editor / checklist toggles all live
// behind canvas selection, the entire authoring flow is otherwise locked out.
//
// This component is the standard canvas-a11y remedy: a REAL focusable HTML
// element tree, co-located with the Stage, that mirrors the frames in board
// order. It is rendered by StoryboardCanvas, so all three apps
// (cinematic / marketing / rpg) inherit it automatically — no per-app wiring.
//
// Pattern: WAI-ARIA listbox with ROVING TABINDEX.
//   - The listbox is ONE tab stop. Tab moves into it; Tab moves out.
//   - Arrow keys move the "active" option within the list (Home/End jump to
//     the ends). Only the active option has tabIndex 0; the rest are -1.
//   - Enter / Space activates the active option → onActivateFrame(id), which
//     runs the SAME onSelectFrame path the mouse uses AND centers the canvas.
//   - When onActivateConnection is provided, connection rows are appended to
//     the SAME list (not a second surface) and Enter/Space selects them.
//   - aria-selected reflects the canvas selection so the announced state and
//     the visual selection stay in agreement, in BOTH directions (activating
//     here selects on the canvas; selecting on the canvas moves the active
//     option here).
//
// The pure index arithmetic for arrow/Home/End lives in ./a11yNav (unit-tested
// there); display-name helpers live in ./frameText. This file owns the DOM +
// focus wiring, which the package's node-env vitest setup (no jsdom) cannot
// exercise directly.
//
// ─────────────────────────────────────────────────────────────────────────────

import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type { CanvasConnection, CanvasFrame } from './types';
import { isNavKey, nextFrameIndex } from './a11yNav';
import {
  accessibleConnectionName,
  accessibleFrameName,
  connectionVisibleLabel,
  frameDisplayTitle,
} from './frameText';

export { humanizeType } from './humanizeType';

interface Props {
  frames: CanvasFrame[];
  /** Currently-selected frame id (owned by the app, mirrored here). */
  selectedFrameId: string | null;
  /** Activate a frame by id — selects it (mouse-path callback) + centers it. */
  onActivateFrame: (id: string) => void;
  /** id of the sr-only canvas description, wired via aria-describedby. */
  describedById?: string;
  /**
   * Resolves a frame type key to the type-bar label FrameCard shows
   * (`config.frameTypeStyles[type].label`). Falls back to DEFAULT_FRAME_STYLE
   * label when omitted.
   */
  typeLabelFor?: (type: string) => string;
  /** Connections listed after frames when `onActivateConnection` is provided. */
  connections?: CanvasConnection[];
  selectedConnectionId?: string | null;
  /** Activate a connection by id — same path as a pointer click on the arrow. */
  onActivateConnection?: (id: string) => void;
}

type ListItem =
  | { kind: 'frame'; id: string; frame: CanvasFrame }
  | { kind: 'connection'; id: string; connection: CanvasConnection };

// ─── Presentation ─────────────────────────────────────────────────────────────
// Visually subtle but genuinely present (NOT display:none — that would remove it
// from the accessibility tree and defeat the purpose). A compact panel pinned to
// the top-left of the canvas; low-contrast at rest, lifted on focus-within so a
// sighted keyboard user gets a clear focus affordance.

const PANEL_STYLE: React.CSSProperties = {
  position: 'absolute',
  top: 8,
  left: 8,
  zIndex: 15,
  maxWidth: 240,
  maxHeight: 'calc(100% - 16px)',
  display: 'flex',
  flexDirection: 'column',
  background: 'rgba(15,23,42,0.55)',
  border: '1px solid rgba(255,255,255,0.06)',
  borderRadius: 6,
  opacity: 0.45,
  transition: 'opacity 0.12s ease, box-shadow 0.12s ease',
  pointerEvents: 'auto',
  fontFamily: 'inherit',
};

const PANEL_FOCUSED_STYLE: React.CSSProperties = {
  opacity: 1,
  boxShadow: '0 4px 18px rgba(0,0,0,0.45)',
  background: 'rgba(15,23,42,0.96)',
  border: '1px solid rgba(255,255,255,0.14)',
};

const HEADER_STYLE: React.CSSProperties = {
  fontSize: 10,
  fontWeight: 700,
  letterSpacing: '0.1em',
  textTransform: 'uppercase',
  color: '#64748b',
  padding: '6px 10px',
  borderBottom: '1px solid rgba(255,255,255,0.06)',
  userSelect: 'none',
};

const LIST_STYLE: React.CSSProperties = {
  listStyle: 'none',
  margin: 0,
  padding: 4,
  overflowY: 'auto',
  minHeight: 0,
};

const OPTION_STYLE: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  gap: 6,
  padding: '4px 8px',
  borderRadius: 4,
  fontSize: 12,
  color: '#cbd5e1',
  cursor: 'pointer',
  outline: 'none',
  whiteSpace: 'nowrap',
  overflow: 'hidden',
  textOverflow: 'ellipsis',
};

const OPTION_SELECTED_STYLE: React.CSSProperties = {
  background: 'rgba(248,250,252,0.12)',
  color: '#f8fafc',
};

const OPTION_FOCUSED_OUTLINE: React.CSSProperties = {
  boxShadow: 'inset 0 0 0 1.5px rgba(148,163,184,0.8)',
};

// Secondary text (#94a3b8) — AA normal on the navy chrome. Empty boards have
// no tabbable option, so the panel is forced opaque (see panelStyle below).
const EMPTY_STYLE: React.CSSProperties = {
  fontSize: 12,
  color: '#94a3b8',
  padding: '8px 10px',
  fontStyle: 'italic',
};

function headerLabel(frameCount: number, connectionCount: number): string {
  if (connectionCount > 0 && frameCount > 0) {
    return `Board · ${frameCount + connectionCount}`;
  }
  if (connectionCount > 0) return `Connections · ${connectionCount}`;
  return `Frames${frameCount > 0 ? ` · ${frameCount}` : ''}`;
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function AccessibleFrameList({
  frames,
  selectedFrameId,
  onActivateFrame,
  describedById,
  typeLabelFor,
  connections,
  selectedConnectionId,
  onActivateConnection,
}: Props) {
  const includeConnections = !!onActivateConnection;
  const items: ListItem[] = useMemo(() => {
    const next: ListItem[] = frames.map(frame => ({
      kind: 'frame',
      id: frame.id,
      frame,
    }));
    if (includeConnections) {
      for (const connection of connections ?? []) {
        next.push({ kind: 'connection', id: connection.id, connection });
      }
    }
    return next;
  }, [frames, connections, includeConnections]);

  const count = items.length;
  const frameCount = frames.length;
  const connectionCount = includeConnections ? (connections?.length ?? 0) : 0;
  const isEmpty = count === 0;

  // Index of the roving-tabindex "active" option.
  const [activeIndex, setActiveIndex] = useState(0);
  const [focusWithin, setFocusWithin] = useState(false);

  // Refs to each option so we can imperatively move DOM focus.
  const optionRefs = useRef<Array<HTMLLIElement | null>>([]);
  // True only while a keyboard action requested a focus move — so we don't
  // steal focus from the page when selection changes for unrelated reasons.
  const wantFocusMove = useRef(false);

  // ── Keep activeIndex valid as items change ──────────────────────────────────
  useEffect(() => {
    setActiveIndex(prev => {
      if (count === 0) return 0;
      return Math.min(prev, count - 1);
    });
  }, [count]);

  // ── Mirror external (mouse) selection into the active option ────────────────
  // When the canvas selection changes from outside (a mouse click on a card
  // or connection), move the roving active option to match so the two surfaces
  // agree. This does NOT move DOM focus (wantFocusMove stays false).
  useEffect(() => {
    if (selectedFrameId) {
      const idx = items.findIndex(
        item => item.kind === 'frame' && item.id === selectedFrameId,
      );
      if (idx >= 0) setActiveIndex(idx);
      return;
    }
    if (selectedConnectionId) {
      const idx = items.findIndex(
        item => item.kind === 'connection' && item.id === selectedConnectionId,
      );
      if (idx >= 0) setActiveIndex(idx);
    }
  }, [selectedFrameId, selectedConnectionId, items]);

  // ── Apply a pending keyboard-driven focus move ──────────────────────────────
  useEffect(() => {
    if (!wantFocusMove.current) return;
    wantFocusMove.current = false;
    optionRefs.current[activeIndex]?.focus();
  }, [activeIndex]);

  const activateItem = useCallback(
    (index: number) => {
      const item = items[index];
      if (!item) return;
      if (item.kind === 'frame') onActivateFrame(item.id);
      else onActivateConnection?.(item.id);
    },
    [items, onActivateFrame, onActivateConnection],
  );

  // ── Keydown on an option (roving tabindex + activation) ─────────────────────
  const handleOptionKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLLIElement>) => {
      if (isNavKey(e.key)) {
        const next = nextFrameIndex(e.key, activeIndex, count);
        if (next >= 0) {
          // Handled locally — don't let it bubble to the app's global
          // viewport/shortcut keydown listener, and don't scroll the page.
          e.preventDefault();
          e.stopPropagation();
          wantFocusMove.current = true;
          setActiveIndex(next);
        }
        return;
      }

      if (e.key === 'Enter' || e.key === ' ' || e.key === 'Spacebar') {
        e.preventDefault();
        e.stopPropagation();
        activateItem(activeIndex);
        return;
      }
      // Escape intentionally NOT handled/stopped here — it bubbles to the app so
      // the existing "Escape = deselect / close panels" behaviour still fires.
    },
    [activeIndex, count, activateItem],
  );

  const handleOptionClick = useCallback(
    (index: number) => {
      setActiveIndex(index);
      activateItem(index);
    },
    [activateItem],
  );

  // Empty boards have no tabbable option, so force the focused/opaque treatment
  // or the role=status copy stays a low-contrast ghost in the corner.
  const panelStyle: React.CSSProperties =
    focusWithin || isEmpty
      ? { ...PANEL_STYLE, ...PANEL_FOCUSED_STYLE }
      : PANEL_STYLE;

  return (
    <nav
      aria-label="Frame navigation"
      style={panelStyle}
      onFocus={() => setFocusWithin(true)}
      onBlur={e => {
        // Only clear when focus leaves the whole panel (not on inner moves).
        if (!e.currentTarget.contains(e.relatedTarget as Node | null)) {
          setFocusWithin(false);
        }
      }}
    >
      <div style={HEADER_STYLE} aria-hidden="true">
        {headerLabel(frameCount, connectionCount)}
      </div>

      {isEmpty ? (
        // Graceful empty state — a real, announced status, not a crash.
        <div role="status" style={EMPTY_STYLE}>
          No frames on this board.
        </div>
      ) : (
        <ul
          role="listbox"
          aria-label="Storyboard frames"
          aria-describedby={describedById}
          style={LIST_STYLE}
        >
          {items.map((item, index) => {
            const isSelected =
              item.kind === 'frame'
                ? item.id === selectedFrameId
                : item.id === selectedConnectionId;
            const isActive = index === activeIndex;
            const style: React.CSSProperties = {
              ...OPTION_STYLE,
              ...(isSelected ? OPTION_SELECTED_STYLE : null),
              ...(isActive && focusWithin ? OPTION_FOCUSED_OUTLINE : null),
            };
            const name =
              item.kind === 'frame'
                ? accessibleFrameName(item.frame, typeLabelFor)
                : accessibleConnectionName(item.connection, frames);
            const visible =
              item.kind === 'frame'
                ? frameDisplayTitle(item.frame.title)
                : connectionVisibleLabel(item.connection);
            const swatchColor =
              item.kind === 'frame' && item.frame.badges && item.frame.badges[0]
                ? item.frame.badges[0].color
                : '#475569';
            return (
              <li
                key={`${item.kind}-${item.id}`}
                ref={el => {
                  optionRefs.current[index] = el;
                }}
                role="option"
                aria-selected={isSelected}
                aria-current={isSelected ? 'true' : undefined}
                aria-label={name}
                title={name}
                // Roving tabindex: exactly one option is tabbable at a time.
                tabIndex={isActive ? 0 : -1}
                style={style}
                onKeyDown={handleOptionKeyDown}
                onClick={() => handleOptionClick(index)}
              >
                <span
                  aria-hidden="true"
                  style={
                    item.kind === 'frame'
                      ? {
                          width: 6,
                          height: 6,
                          borderRadius: '50%',
                          flexShrink: 0,
                          background: swatchColor,
                        }
                      : {
                          flexShrink: 0,
                          color: '#94a3b8',
                          fontSize: 11,
                        }
                  }
                >
                  {item.kind === 'connection' ? '→' : null}
                </span>
                <span
                  style={{
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                  }}
                >
                  {visible}
                </span>
              </li>
            );
          })}
        </ul>
      )}
    </nav>
  );
}
