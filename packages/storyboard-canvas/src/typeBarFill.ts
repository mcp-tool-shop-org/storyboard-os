// ─── storyboard-canvas / typeBarFill.ts ───────────────────────────────────────
//
// Type-bar copy sits at 10px bold on a Rect filled with style.accent at 0.85
// over style.bg. Unconditional white fails AA-normal on yellow / green / orange
// Quick Start accents. Pick white vs navy from the composited bar luminance
// so 10px bold stays ≥4.5:1.
//
// ─────────────────────────────────────────────────────────────────────────────

const TYPE_BAR_OPACITY = 0.85;
const TYPE_BAR_LIGHT = '#ffffff';
const TYPE_BAR_DARK = '#0b1120'; // surfaces.bgPage
const AA_NORMAL = 4.5;

function parseHex(hex: string): [number, number, number] | null {
  const raw = hex.trim();
  const short = /^#([0-9a-f]{3})$/i.exec(raw);
  if (short) {
    const n = short[1];
    return [
      parseInt(n[0] + n[0], 16),
      parseInt(n[1] + n[1], 16),
      parseInt(n[2] + n[2], 16),
    ];
  }
  const full = /^#([0-9a-f]{6})$/i.exec(raw);
  if (!full) return null;
  const n = parseInt(full[1], 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}

function srgbChannel(c: number): number {
  const s = c / 255;
  return s <= 0.04045 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4;
}

function luminance(rgb: [number, number, number]): number {
  return 0.2126 * srgbChannel(rgb[0]) + 0.7152 * srgbChannel(rgb[1]) + 0.0722 * srgbChannel(rgb[2]);
}

function contrastRatio(a: [number, number, number], b: [number, number, number]): number {
  const L1 = luminance(a);
  const L2 = luminance(b);
  const lighter = Math.max(L1, L2);
  const darker = Math.min(L1, L2);
  return (lighter + 0.05) / (darker + 0.05);
}

function composite(
  fg: [number, number, number],
  bg: [number, number, number],
  opacity: number,
): [number, number, number] {
  const rest = 1 - opacity;
  return [
    fg[0] * opacity + bg[0] * rest,
    fg[1] * opacity + bg[1] * rest,
    fg[2] * opacity + bg[2] * rest,
  ];
}

/** Fill for 10px bold type-bar copy on the 0.85-composited accent bar. */
export function typeBarLabelFill(accent: string, bg: string): string {
  const accentRgb = parseHex(accent);
  const bgRgb = parseHex(bg);
  if (!accentRgb || !bgRgb) return TYPE_BAR_LIGHT;
  const bar = composite(accentRgb, bgRgb, TYPE_BAR_OPACITY);
  const white = parseHex(TYPE_BAR_LIGHT)!;
  const navy = parseHex(TYPE_BAR_DARK)!;
  return contrastRatio(white, bar) >= AA_NORMAL ? TYPE_BAR_LIGHT : TYPE_BAR_DARK;
}
