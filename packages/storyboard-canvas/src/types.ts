// ─── storyboard-canvas / types.ts ────────────────────────────────────────────
//
// Generic canvas types. No domain vocabulary.
// Domains provide CanvasFrameStyle and CanvasConnectionStyle via config.
//
// ─────────────────────────────────────────────────────────────────────────────

// ─── Style contracts ──────────────────────────────────────────────────────────

/** Visual style for a frame card in a specific frame type slot. */
export interface CanvasFrameStyle {
  /** Card background color. */
  bg: string;
  /** Accent color — used for the type-bar fill and card border. */
  accent: string;
  /** Short uppercase label displayed in the type bar (e.g. "SCENE"). */
  label: string;
}

/** Visual style for a specific connection type. */
export interface CanvasConnectionStyle {
  stroke: string;
  dash?: number[];
  /** Override the default stroke width (1.5). Use higher values for game-state branches. */
  strokeWidth?: number;
}

// ─── Badge ────────────────────────────────────────────────────────────────────

/**
 * A small labeled chip rendered on a frame card.
 * Domains generate these from their own signals; the canvas renders them.
 */
export interface CanvasBadge {
  /** Short uppercase label, e.g. "STATE", "SPEC". */
  text: string;
  /** Hex color for the badge border and label text. */
  color: string;
}

// ─── Domain config ────────────────────────────────────────────────────────────

/** Config object the app/domain passes to the canvas components. */
export interface StoryboardCanvasConfig {
  /**
   * Per-frame-type styles. Keys are the domain's frame type strings.
   * Any type not present falls back to `defaultFrameStyle`.
   */
  frameTypeStyles: Record<string, CanvasFrameStyle>;

  /**
   * Per-connection-type styles. Keys are connection type strings.
   * Any type not present falls back to `defaultConnectionStyle`.
   */
  connectionTypeStyles?: Record<string, CanvasConnectionStyle>;

  /** Fallback style when a frame type has no configured entry. */
  defaultFrameStyle?: CanvasFrameStyle;

  /** Fallback style when a connection type has no configured entry. */
  defaultConnectionStyle?: CanvasConnectionStyle;
}

// ─── Minimal frame / connection shapes ───────────────────────────────────────
// The canvas only needs the fields it actually renders.
// Domains extend these with their own richer types.

export interface CanvasFrame {
  id: string;
  type: string;
  title: string;
  summary: string;
  position: { x: number; y: number };
  size: { width: number; height: number };
  /**
   * Optional badge chips rendered at the bottom of the card.
   * Domains provide these; the canvas renders them without needing to know
   * what they mean.
   */
  badges?: CanvasBadge[];
}

export interface CanvasConnection {
  id: string;
  fromFrameId: string;
  toFrameId: string;
  type: string;
  label?: string;
}

// ─── Position tracking ────────────────────────────────────────────────────────

export type PositionMap = Record<string, { x: number; y: number }>;
