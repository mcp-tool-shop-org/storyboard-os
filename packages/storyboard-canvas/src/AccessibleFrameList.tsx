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
//   - aria-selected reflects the canvas selection so the announced state and
//     the visual selection stay in agreement, in BOTH directions (activating
//     here selects on the canvas; selecting on the canvas moves the active
//     option here).
//
// The pure index arithmetic for arrow/Home/End lives in ./a11yNav (unit-tested
// there); this file owns only the DOM + focus wiring, which the package's
// node-env vitest setup (no jsdom) cannot exercise directly.
//
// ─────────────────────────────────────────────────────────────────────────────

import React, { useCallback, useEffect, useRef, useState } from 'react';
import type { CanvasFrame } from './types';
import { isNavKey, nextFrameIndex } from './a11yNav';

interface Props {
  frames: CanvasFrame[];
  /** Currently-selected frame id (owned by the app, mirrored here). */
  selectedFrameId: string | null;
  /** Activate a frame by id — selects it (mouse-path callback) + centers it. */
  onActivateFrame: (id: string) => void;
  /** id of the sr-only canvas description, wired via aria-describedby. */
  describedById?: string;
}

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

const EMPTY_STYLE: React.CSSProperties = {
  fontSize: 12,
  color: '#64748b',
  padding: '8px 10px',
  fontStyle: 'italic',
};

// ─── Accessible name ──────────────────────────────────────────────────────────
// title + type + status. The generic CanvasFrame has no `status` field — in this
// package per-frame status is carried by domain BADGES (STATE / SPEC / CAM / …),
// so the accessible name composes title + humanized type + badge texts. When a
// frame has no badges, name is just title + type (graceful).

function humanizeType(type: string): string {
  return type.replace(/[_-]+/g, ' ').trim();
}

function accessibleName(frame: CanvasFrame): string {
  const parts: string[] = [frame.title || 'Untitled frame'];
  const type = humanizeType(frame.type);
  if (type) parts.push(type);
  const badges = frame.badges ?? [];
  if (badges.length > 0) {
    parts.push(badges.map(b => b.text).join(', '));
  }
  return parts.join(' — ');
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function AccessibleFrameList({
  frames,
  selectedFrameId,
  onActivateFrame,
  describedById,
}: Props) {
  const count = frames.length;

  // Index of the roving-tabindex "active" option.
  const [activeIndex, setActiveIndex] = useState(0);
  const [focusWithin, setFocusWithin] = useState(false);

  // Refs to each option so we can imperatively move DOM focus.
  const optionRefs = useRef<Array<HTMLLIElement | null>>([]);
  // True only while a keyboard action requested a focus move — so we don't
  // steal focus from the page when selection changes for unrelated reasons.
  const wantFocusMove = useRef(false);

  // ── Keep activeIndex valid as frames change ─────────────────────────────────
  useEffect(() => {
    setActiveIndex(prev => {
      if (count === 0) return 0;
      return Math.min(prev, count - 1);
    });
  }, [count]);

  // ── Mirror external (mouse) selection into the active option ────────────────
  // When the canvas selection changes from outside (a mouse click on a card),
  // move the roving active option to match so the two surfaces agree. This does
  // NOT move DOM focus (wantFocusMove stays false) — it only realigns the list.
  useEffect(() => {
    if (!selectedFrameId) return;
    const idx = frames.findIndex(f => f.id === selectedFrameId);
    if (idx >= 0) setActiveIndex(idx);
  }, [selectedFrameId, frames]);

  // ── Apply a pending keyboard-driven focus move ──────────────────────────────
  useEffect(() => {
    if (!wantFocusMove.current) return;
    wantFocusMove.current = false;
    optionRefs.current[activeIndex]?.focus();
  }, [activeIndex]);

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
        const frame = frames[activeIndex];
        if (frame) onActivateFrame(frame.id);
        return;
      }
      // Escape intentionally NOT handled/stopped here — it bubbles to the app so
      // the existing "Escape = deselect / close panels" behaviour still fires.
    },
    [activeIndex, count, frames, onActivateFrame],
  );

  const handleOptionClick = useCallback(
    (index: number) => {
      setActiveIndex(index);
      const frame = frames[index];
      if (frame) onActivateFrame(frame.id);
    },
    [frames, onActivateFrame],
  );

  const panelStyle: React.CSSProperties = focusWithin
    ? { ...PANEL_STYLE, ...PANEL_FOCUSED_STYLE }
    : PANEL_STYLE;

  return (
    <nav
      aria-label="Storyboard frames"
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
        Frames{count > 0 ? ` · ${count}` : ''}
      </div>

      {count === 0 ? (
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
          {frames.map((frame, index) => {
            const isSelected = frame.id === selectedFrameId;
            const isActive = index === activeIndex;
            const style: React.CSSProperties = {
              ...OPTION_STYLE,
              ...(isSelected ? OPTION_SELECTED_STYLE : null),
              ...(isActive && focusWithin ? OPTION_FOCUSED_OUTLINE : null),
            };
            return (
              <li
                key={frame.id}
                ref={el => {
                  optionRefs.current[index] = el;
                }}
                role="option"
                aria-selected={isSelected}
                aria-current={isSelected ? 'true' : undefined}
                aria-label={accessibleName(frame)}
                title={accessibleName(frame)}
                // Roving tabindex: exactly one option is tabbable at a time.
                tabIndex={isActive ? 0 : -1}
                style={style}
                onKeyDown={handleOptionKeyDown}
                onClick={() => handleOptionClick(index)}
              >
                <span
                  aria-hidden="true"
                  style={{
                    width: 6,
                    height: 6,
                    borderRadius: '50%',
                    flexShrink: 0,
                    background:
                      frame.badges && frame.badges[0]
                        ? frame.badges[0].color
                        : '#475569',
                  }}
                />
                <span
                  style={{
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                  }}
                >
                  {frame.title || 'Untitled frame'}
                </span>
              </li>
            );
          })}
        </ul>
      )}
    </nav>
  );
}
