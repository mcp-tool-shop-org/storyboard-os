import { describe, it, expect } from 'vitest';
import {
  clampScale,
  fitViewToFrames,
  centerOnFrame,
  zoomAtPoint,
  zoomFromCenter,
  DEFAULT_VIEW_STATE,
  MIN_SCALE,
  MAX_SCALE,
  type ViewState,
} from './viewport';

// ─── clampScale ───────────────────────────────────────────────────────────────

describe('clampScale', () => {
  it('returns scale unchanged when within [MIN, MAX]', () => {
    expect(clampScale(1)).toBe(1);
    expect(clampScale(0.5)).toBe(0.5);
    expect(clampScale(2)).toBe(2);
    expect(clampScale(MIN_SCALE)).toBe(MIN_SCALE);
    expect(clampScale(MAX_SCALE)).toBe(MAX_SCALE);
  });

  it('clamps to MIN_SCALE when too low', () => {
    expect(clampScale(0)).toBe(MIN_SCALE);
    expect(clampScale(-5)).toBe(MIN_SCALE);
    expect(clampScale(MIN_SCALE - 0.001)).toBe(MIN_SCALE);
  });

  it('clamps to MAX_SCALE when too high', () => {
    expect(clampScale(100)).toBe(MAX_SCALE);
    expect(clampScale(MAX_SCALE + 0.001)).toBe(MAX_SCALE);
  });

  it('supports custom min/max bounds', () => {
    expect(clampScale(0.4, 0.5, 2)).toBe(0.5);
    expect(clampScale(2.1, 0.5, 2)).toBe(2);
    expect(clampScale(1.0, 0.5, 2)).toBe(1.0);
  });
});

// ─── fitViewToFrames ──────────────────────────────────────────────────────────

describe('fitViewToFrames', () => {
  it('returns DEFAULT_VIEW_STATE when frames array is empty', () => {
    expect(fitViewToFrames([], 1000, 800)).toEqual(DEFAULT_VIEW_STATE);
  });

  it('centers content horizontally and vertically', () => {
    // Single frame at origin: 200×100
    // Container: 1000×800, padding: 40
    // availW=920, availH=720; scaleW=920/200=4.6, scaleH=720/100=7.2 → min=4.6 → clamped to MAX=4
    const frame = { position: { x: 0, y: 0 }, size: { width: 200, height: 100 } };
    const result = fitViewToFrames([frame], 1000, 800, 40);

    expect(result.scale).toBe(MAX_SCALE);
    // x = (1000 - 200*4) / 2 - 0*4 = 100
    expect(result.x).toBeCloseTo(100);
    // y = (800 - 100*4) / 2 - 0*4 = 200
    expect(result.y).toBeCloseTo(200);
  });

  it('constrains scale by width for a wide board', () => {
    // 2000×300 board in 1000×800 container, padding=40
    // availW=920, availH=720; scaleW=920/2000=0.46, scaleH=720/300=2.4 → min=0.46
    const frame = { position: { x: 0, y: 0 }, size: { width: 2000, height: 300 } };
    const result = fitViewToFrames([frame], 1000, 800, 40);

    expect(result.scale).toBeCloseTo(0.46, 2);
    // Content is centered: x = (1000 - 2000*0.46) / 2 = (1000 - 920) / 2 = 40
    expect(result.x).toBeCloseTo(40, 0);
  });

  it('constrains scale by height for a tall board', () => {
    // 200×2000 board in 1000×800 container, padding=40
    // availW=920, availH=720; scaleW=920/200=4.6→clamped=4, scaleH=720/2000=0.36 → min=0.36
    const frame = { position: { x: 0, y: 0 }, size: { width: 200, height: 2000 } };
    const result = fitViewToFrames([frame], 1000, 800, 40);

    expect(result.scale).toBeCloseTo(0.36, 2);
    // y = (800 - 2000*0.36) / 2 = (800 - 720) / 2 = 40
    expect(result.y).toBeCloseTo(40, 0);
  });

  it('handles frames offset from the origin', () => {
    // Two frames side by side, both offset from (0,0)
    // Frame 1: pos(100, 50) size(200, 100) → right edge at 300
    // Frame 2: pos(400, 50) size(200, 100) → right edge at 600
    // Bounding box: x[100..600] y[50..150], contentW=500, contentH=100
    const frames = [
      { position: { x: 100, y: 50 }, size: { width: 200, height: 100 } },
      { position: { x: 400, y: 50 }, size: { width: 200, height: 100 } },
    ];
    const result = fitViewToFrames(frames, 1000, 600, 40);

    // availW=920, availH=520; scaleW=920/500=1.84, scaleH=520/100=5.2 → min=1.84
    expect(result.scale).toBeCloseTo(1.84, 1);
    // x = (1000 - 500*1.84)/2 - 100*1.84 = 40 - 184 = -144
    expect(result.x).toBeCloseTo((1000 - 500 * 1.84) / 2 - 100 * 1.84, 0);
  });

  it('larger padding → smaller scale', () => {
    const frame = { position: { x: 0, y: 0 }, size: { width: 500, height: 300 } };
    const withPad80 = fitViewToFrames([frame], 1000, 800, 80);
    const withPad20 = fitViewToFrames([frame], 1000, 800, 20);

    expect(withPad80.scale).toBeLessThan(withPad20.scale);
  });

  it('clamps tiny frames to MAX_SCALE', () => {
    const frame = { position: { x: 0, y: 0 }, size: { width: 10, height: 10 } };
    const result = fitViewToFrames([frame], 1000, 800, 40);

    expect(result.scale).toBe(MAX_SCALE);
  });

  it('clamps huge boards to MIN_SCALE', () => {
    const frame = { position: { x: 0, y: 0 }, size: { width: 100000, height: 50000 } };
    const result = fitViewToFrames([frame], 1000, 800, 40);

    expect(result.scale).toBe(MIN_SCALE);
  });

  it('works with a single frame at a large offset', () => {
    const frame = { position: { x: 500, y: 500 }, size: { width: 200, height: 100 } };
    const result = fitViewToFrames([frame], 800, 600, 40);

    // Content extent is still 200×100 regardless of offset
    // x offset should shift so frame is centered
    const bboxCenterX = 500 + 100; // 600 in content space
    // x = (800 - 200*scale)/2 - 500*scale
    const expectedX = (800 - 200 * result.scale) / 2 - 500 * result.scale;
    expect(result.x).toBeCloseTo(expectedX, 1);
  });
});

// ─── centerOnFrame ────────────────────────────────────────────────────────────

describe('centerOnFrame', () => {
  it('centers a frame at scale 1', () => {
    // Frame 200×100 at (100, 50): center at content (200, 100)
    // Container 800×600: screen center at (400, 300)
    // x = 400 - 200*1 = 200, y = 300 - 100*1 = 200
    const frame = { position: { x: 100, y: 50 }, size: { width: 200, height: 100 } };
    const result = centerOnFrame(frame, 800, 600, 1);

    expect(result.scale).toBe(1);
    expect(result.x).toBeCloseTo(200);
    expect(result.y).toBeCloseTo(200);
  });

  it('preserves the current scale', () => {
    const frame = { position: { x: 0, y: 0 }, size: { width: 200, height: 100 } };
    const result = centerOnFrame(frame, 800, 600, 0.5);

    expect(result.scale).toBe(0.5);
  });

  it('accounts for scale when computing offset', () => {
    // Frame 200×100 at (0,0): center at content (100, 50)
    // scale=2: x = 400 - 100*2 = 200, y = 300 - 50*2 = 200
    const frame = { position: { x: 0, y: 0 }, size: { width: 200, height: 100 } };
    const result = centerOnFrame(frame, 800, 600, 2);

    expect(result.x).toBeCloseTo(200);
    expect(result.y).toBeCloseTo(200);
  });

  it('works with a frame far from origin', () => {
    const frame = { position: { x: 1000, y: 800 }, size: { width: 240, height: 140 } };
    const result = centerOnFrame(frame, 1200, 900, 1.5);

    const contentCX = 1000 + 120; // 1120
    const contentCY = 800 + 70;   // 870
    expect(result.x).toBeCloseTo(600 - contentCX * 1.5, 1);
    expect(result.y).toBeCloseTo(450 - contentCY * 1.5, 1);
  });
});

// ─── zoomAtPoint ─────────────────────────────────────────────────────────────

describe('zoomAtPoint', () => {
  it('doubles the scale when factor is 2 from origin', () => {
    const current: ViewState = { scale: 1, x: 0, y: 0 };
    const result = zoomAtPoint(current, 0, 0, 2);

    expect(result.scale).toBe(2);
    // Point at (0,0) stays at (0,0): x=0-0*2=0, y=0
    expect(result.x).toBe(0);
    expect(result.y).toBe(0);
  });

  it('keeps the pointer position visually fixed after zoom', () => {
    const current: ViewState = { scale: 1, x: -50, y: -30 };
    const px = 200, py = 150;
    const factor = 1.5;
    const result = zoomAtPoint(current, px, py, factor);

    // Content point under pointer before zoom
    const contentX = (px - current.x) / current.scale;
    const contentY = (py - current.y) / current.scale;

    // Screen position of that content point after zoom should equal the pointer
    expect(contentX * result.scale + result.x).toBeCloseTo(px, 5);
    expect(contentY * result.scale + result.y).toBeCloseTo(py, 5);
  });

  it('keeps pointer fixed when zooming out', () => {
    const current: ViewState = { scale: 2, x: -100, y: -80 };
    const px = 400, py = 300;
    const result = zoomAtPoint(current, px, py, 0.5);

    const contentX = (px - current.x) / current.scale;
    const contentY = (py - current.y) / current.scale;
    expect(contentX * result.scale + result.x).toBeCloseTo(px, 5);
    expect(contentY * result.scale + result.y).toBeCloseTo(py, 5);
  });

  it('clamps to MAX_SCALE when result would exceed it', () => {
    const current: ViewState = { scale: MAX_SCALE, x: 0, y: 0 };
    const result = zoomAtPoint(current, 100, 100, 2);

    expect(result.scale).toBe(MAX_SCALE);
  });

  it('clamps to MIN_SCALE when result would go below it', () => {
    const current: ViewState = { scale: MIN_SCALE, x: 0, y: 0 };
    const result = zoomAtPoint(current, 100, 100, 0.1);

    expect(result.scale).toBe(MIN_SCALE);
  });

  it('zooms from an offset viewport correctly', () => {
    const current: ViewState = { scale: 1.5, x: 200, y: 100 };
    const px = 600, py = 400;
    const result = zoomAtPoint(current, px, py, 1.2);

    const contentX = (px - current.x) / current.scale;
    const contentY = (py - current.y) / current.scale;
    expect(contentX * result.scale + result.x).toBeCloseTo(px, 5);
    expect(contentY * result.scale + result.y).toBeCloseTo(py, 5);
  });
});

// ─── Non-finite input hardening (F-CV-001) ────────────────────────────────────
// A single NaN/Infinity reaching stage.scale() / stage.position() blanks the
// entire Stage. These tests pin the recovery semantics for every exported
// viewport function so no caller can emit a non-finite ViewState.

describe('clampScale — non-finite input (F-CV-001)', () => {
  it('maps NaN to min (conservative "show everything" recovery)', () => {
    expect(clampScale(NaN)).toBe(MIN_SCALE);
  });

  it('maps NaN to the custom min when bounds are provided', () => {
    expect(clampScale(NaN, 0.5, 2)).toBe(0.5);
  });

  it('maps -Infinity to min', () => {
    expect(clampScale(-Infinity)).toBe(MIN_SCALE);
  });

  it('maps +Infinity to max (natural clamp semantics: "too big")', () => {
    expect(clampScale(Infinity)).toBe(MAX_SCALE);
  });
});

describe('fitViewToFrames — poisoned frames (F-CV-001)', () => {
  const valid = [
    { position: { x: 0, y: 0 }, size: { width: 200, height: 100 } },
    { position: { x: 400, y: 50 }, size: { width: 200, height: 100 } },
  ];

  it('ignores a frame with NaN position and fits the valid frames', () => {
    const poisoned = { position: { x: NaN, y: 0 }, size: { width: 200, height: 100 } };
    const result = fitViewToFrames([...valid, poisoned], 1000, 800, 40);

    expect(result).toEqual(fitViewToFrames(valid, 1000, 800, 40));
    expect(Number.isFinite(result.scale)).toBe(true);
    expect(Number.isFinite(result.x)).toBe(true);
    expect(Number.isFinite(result.y)).toBe(true);
  });

  it('ignores a frame with Infinity size and fits the valid frames', () => {
    const poisoned = { position: { x: 0, y: 0 }, size: { width: Infinity, height: 100 } };
    const result = fitViewToFrames([poisoned, ...valid], 1000, 800, 40);

    expect(result).toEqual(fitViewToFrames(valid, 1000, 800, 40));
  });

  it('returns DEFAULT_VIEW_STATE when every frame is poisoned', () => {
    const frames = [
      { position: { x: NaN, y: NaN }, size: { width: NaN, height: NaN } },
      { position: { x: 0, y: 0 }, size: { width: 100, height: -Infinity } },
    ];
    expect(fitViewToFrames(frames, 1000, 800)).toEqual(DEFAULT_VIEW_STATE);
  });

  it('returns DEFAULT_VIEW_STATE for non-finite container dimensions', () => {
    const frame = { position: { x: 0, y: 0 }, size: { width: 200, height: 100 } };
    expect(fitViewToFrames([frame], NaN, 800)).toEqual(DEFAULT_VIEW_STATE);
    expect(fitViewToFrames([frame], 1000, Infinity)).toEqual(DEFAULT_VIEW_STATE);
  });
});

describe('centerOnFrame — poisoned inputs (F-CV-001)', () => {
  const validFrame = { position: { x: 100, y: 50 }, size: { width: 200, height: 100 } };

  it('returns DEFAULT_VIEW_STATE for a frame with non-finite geometry', () => {
    const frame = { position: { x: NaN, y: 50 }, size: { width: 200, height: 100 } };
    expect(centerOnFrame(frame, 800, 600, 1)).toEqual(DEFAULT_VIEW_STATE);
  });

  it('returns DEFAULT_VIEW_STATE for non-finite container dimensions', () => {
    expect(centerOnFrame(validFrame, NaN, 600, 1)).toEqual(DEFAULT_VIEW_STATE);
    expect(centerOnFrame(validFrame, 800, Infinity, 1)).toEqual(DEFAULT_VIEW_STATE);
  });

  it('recovers a NaN scale via clampScale and stays finite', () => {
    const result = centerOnFrame(validFrame, 800, 600, NaN);

    expect(result.scale).toBe(MIN_SCALE);
    expect(Number.isFinite(result.x)).toBe(true);
    expect(Number.isFinite(result.y)).toBe(true);
  });

  it('preserves a finite scale exactly (no clamping of valid input)', () => {
    expect(centerOnFrame(validFrame, 800, 600, 2).scale).toBe(2);
  });
});

describe('zoomAtPoint — poisoned inputs (F-CV-001)', () => {
  const validCurrent: ViewState = { scale: 1.5, x: -100, y: -50 };

  it('recovers to DEFAULT_VIEW_STATE when current.scale is NaN', () => {
    expect(zoomAtPoint({ scale: NaN, x: 0, y: 0 }, 100, 100, 1.2)).toEqual(DEFAULT_VIEW_STATE);
  });

  it('recovers to DEFAULT_VIEW_STATE when current.scale is 0 (division guard)', () => {
    expect(zoomAtPoint({ scale: 0, x: 0, y: 0 }, 100, 100, 1.2)).toEqual(DEFAULT_VIEW_STATE);
  });

  it('recovers to DEFAULT_VIEW_STATE when current.x / current.y are non-finite', () => {
    expect(zoomAtPoint({ scale: 1, x: NaN, y: 0 }, 100, 100, 1.2)).toEqual(DEFAULT_VIEW_STATE);
    expect(zoomAtPoint({ scale: 1, x: 0, y: Infinity }, 100, 100, 1.2)).toEqual(DEFAULT_VIEW_STATE);
  });

  it('ignores the gesture (returns current unchanged) for a NaN pointer', () => {
    expect(zoomAtPoint(validCurrent, NaN, 100, 1.2)).toEqual(validCurrent);
    expect(zoomAtPoint(validCurrent, 100, NaN, 1.2)).toEqual(validCurrent);
  });

  it('ignores the gesture (returns current unchanged) for a non-finite factor', () => {
    expect(zoomAtPoint(validCurrent, 100, 100, NaN)).toEqual(validCurrent);
    expect(zoomAtPoint(validCurrent, 100, 100, Infinity)).toEqual(validCurrent);
  });

  it('never returns non-finite fields for any poisoned input combination', () => {
    const poisons = [NaN, Infinity, -Infinity];
    for (const p of poisons) {
      const results = [
        zoomAtPoint({ scale: p, x: 0, y: 0 }, 100, 100, 1.2),
        zoomAtPoint({ scale: 1, x: p, y: 0 }, 100, 100, 1.2),
        zoomAtPoint({ scale: 1, x: 0, y: p }, 100, 100, 1.2),
        zoomAtPoint(validCurrent, p, 100, 1.2),
        zoomAtPoint(validCurrent, 100, p, 1.2),
        zoomAtPoint(validCurrent, 100, 100, p),
      ];
      for (const r of results) {
        expect(Number.isFinite(r.scale)).toBe(true);
        expect(Number.isFinite(r.x)).toBe(true);
        expect(Number.isFinite(r.y)).toBe(true);
      }
    }
  });
});

describe('zoomFromCenter — poisoned inputs (F-CV-001, inherited via zoomAtPoint)', () => {
  it('recovers to DEFAULT_VIEW_STATE when current state is poisoned', () => {
    expect(zoomFromCenter({ scale: NaN, x: 0, y: 0 }, 800, 600, 1.2)).toEqual(DEFAULT_VIEW_STATE);
  });

  it('ignores the gesture when container dimensions are non-finite', () => {
    const current: ViewState = { scale: 1.5, x: -100, y: -50 };
    expect(zoomFromCenter(current, NaN, 600, 1.2)).toEqual(current);
  });
});

// ─── zoomFromCenter ───────────────────────────────────────────────────────────

describe('zoomFromCenter', () => {
  it('is equivalent to zoomAtPoint at the container center', () => {
    const current: ViewState = { scale: 1.5, x: -100, y: -50 };
    const w = 1000, h = 800;

    const fromCenter = zoomFromCenter(current, w, h, 1.2);
    const atCenter   = zoomAtPoint(current, w / 2, h / 2, 1.2);

    expect(fromCenter).toEqual(atCenter);
  });

  it('increases scale on zoom-in factor', () => {
    const current: ViewState = { scale: 1, x: 0, y: 0 };
    const result = zoomFromCenter(current, 800, 600, 1.5);

    expect(result.scale).toBeGreaterThan(current.scale);
  });

  it('decreases scale on zoom-out factor', () => {
    const current: ViewState = { scale: 2, x: 0, y: 0 };
    const result = zoomFromCenter(current, 800, 600, 0.8);

    expect(result.scale).toBeLessThan(current.scale);
  });

  it('clamps at MAX_SCALE', () => {
    const current: ViewState = { scale: MAX_SCALE, x: 0, y: 0 };
    const result = zoomFromCenter(current, 800, 600, 10);

    expect(result.scale).toBe(MAX_SCALE);
  });
});
