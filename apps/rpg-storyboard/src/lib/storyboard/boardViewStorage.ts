// ─── boardViewStorage.ts ─────────────────────────────────────────────────────
//
// Per-board zoom/pan persistence in sessionStorage. Survives reload/remount
// within the tab; cleared when the tab closes. Keyed by board id (project id
// when authoring, storyboard id for template previews).
// ─────────────────────────────────────────────────────────────────────────────

export interface BoardViewState {
  scale: number;
  x: number;
  y: number;
}

const KEY_PREFIX = 'rpg-sb:view:';

function storageKey(boardId: string): string {
  return `${KEY_PREFIX}${boardId}`;
}

function isFiniteView(v: BoardViewState): boolean {
  return (
    Number.isFinite(v.scale) &&
    v.scale > 0 &&
    Number.isFinite(v.x) &&
    Number.isFinite(v.y)
  );
}

/** Load a previously persisted view, or null when missing/invalid. */
export function loadBoardView(boardId: string): BoardViewState | null {
  if (typeof sessionStorage === 'undefined' || !boardId) return null;
  try {
    const raw = sessionStorage.getItem(storageKey(boardId));
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Partial<BoardViewState>;
    // Require real numbers — JSON.stringify turns Infinity into null, and
    // Number(null) === 0, so a typeof check is load-bearing.
    if (
      typeof parsed.scale !== 'number' ||
      typeof parsed.x !== 'number' ||
      typeof parsed.y !== 'number'
    ) {
      return null;
    }
    const view: BoardViewState = {
      scale: parsed.scale,
      x: parsed.x,
      y: parsed.y,
    };
    return isFiniteView(view) ? view : null;
  } catch {
    return null;
  }
}

/** Persist zoom/pan for this board. No-ops on invalid input or missing sessionStorage. */
export function saveBoardView(boardId: string, view: BoardViewState): void {
  if (typeof sessionStorage === 'undefined' || !boardId) return;
  if (!isFiniteView(view)) return;
  try {
    sessionStorage.setItem(
      storageKey(boardId),
      JSON.stringify({ scale: view.scale, x: view.x, y: view.y }),
    );
  } catch {
    // Quota / private mode — view persistence is best-effort.
  }
}
