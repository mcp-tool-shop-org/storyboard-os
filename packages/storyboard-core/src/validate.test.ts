// ─── storyboard-core / validate.test.ts ───────────────────────────────────────
//
// Tests proving:
//   1. validateStoryboard works with the default connection type (RPG vocabulary)
//   2. validateStoryboard accepts domain-specific connection vocabularies without casts
//   3. Structural validation (broken refs, duplicates) works across all connection types
//
// ─────────────────────────────────────────────────────────────────────────────

import { describe, it, expect } from 'vitest';
import { validateStoryboard } from './validate';
import type { Storyboard, StoryboardConnection, AnyStoryboardFrame, AnyStoryboardConnection } from './schema';

// ─── Helpers ──────────────────────────────────────────────────────────────────

function makeFrame(id: string): AnyStoryboardFrame {
  return {
    id,
    type: 'scene',
    title: `Frame ${id}`,
    summary: `Summary for ${id}`,
    position: { x: 0, y: 0 },
    size: { width: 200, height: 140 },
    content: {},
    annotations: [],
  };
}

// ─── Default connection type (RPG vocabulary) ─────────────────────────────────

describe('validateStoryboard with default connection types', () => {
  it('accepts storyboard with core connection types', () => {
    const storyboard: Storyboard = {
      id: 'sb-1',
      title: 'Test',
      frames: [makeFrame('f1'), makeFrame('f2')],
      connections: [
        { id: 'c1', fromFrameId: 'f1', toFrameId: 'f2', type: 'sequence' },
        { id: 'c2', fromFrameId: 'f2', toFrameId: 'f1', type: 'choice' },
      ],
    };
    const result = validateStoryboard(storyboard);
    expect(result.valid).toBe(true);
    expect(result.errors).toHaveLength(0);
  });

  it('detects broken connection references', () => {
    const storyboard: Storyboard = {
      id: 'sb-1',
      title: 'Test',
      frames: [makeFrame('f1')],
      connections: [
        { id: 'c1', fromFrameId: 'f1', toFrameId: 'nonexistent', type: 'consequence' },
      ],
    };
    const result = validateStoryboard(storyboard);
    expect(result.valid).toBe(false);
    expect(result.errors[0].code).toBe('BROKEN_CONNECTION_TO');
  });
});

// ─── Custom connection vocabularies ───────────────────────────────────────────

describe('validateStoryboard with custom domain connection types', () => {
  type CinematicConnectionType =
    | 'sequence'
    | 'match_cut'
    | 'cutaway'
    | 'reaction'
    | 'transition'
    | 'continuity'
    | 'parallel_action'
    | 'fallback';

  type CinematicConnection = StoryboardConnection<CinematicConnectionType>;
  type CinematicStoryboard = Storyboard<AnyStoryboardFrame, CinematicConnection>;

  it('accepts cinematic connection vocabulary without casts', () => {
    const storyboard: CinematicStoryboard = {
      id: 'cine-1',
      title: 'Trailer Sequence',
      frames: [makeFrame('shot-1'), makeFrame('shot-2'), makeFrame('shot-3')],
      connections: [
        { id: 'c1', fromFrameId: 'shot-1', toFrameId: 'shot-2', type: 'match_cut' },
        { id: 'c2', fromFrameId: 'shot-2', toFrameId: 'shot-3', type: 'parallel_action' },
      ],
    };
    // No cast needed — validates directly
    const result = validateStoryboard(storyboard);
    expect(result.valid).toBe(true);
    expect(result.errors).toHaveLength(0);
  });

  it('detects broken refs in cinematic connections', () => {
    const storyboard: CinematicStoryboard = {
      id: 'cine-2',
      title: 'Broken Refs',
      frames: [makeFrame('shot-1')],
      connections: [
        { id: 'c1', fromFrameId: 'shot-1', toFrameId: 'ghost', type: 'cutaway' },
      ],
    };
    const result = validateStoryboard(storyboard);
    expect(result.valid).toBe(false);
    expect(result.errors[0].code).toBe('BROKEN_CONNECTION_TO');
  });

  type MarketingConnectionType = 'sequence' | 'dependency' | 'approval' | 'consequence' | 'optional';
  type MarketingConnection = StoryboardConnection<MarketingConnectionType>;
  type MarketingStoryboard = Storyboard<AnyStoryboardFrame, MarketingConnection>;

  it('accepts marketing connection vocabulary without casts', () => {
    const storyboard: MarketingStoryboard = {
      id: 'mkt-1',
      title: 'Campaign',
      frames: [makeFrame('audience'), makeFrame('approval-gate'), makeFrame('launch')],
      connections: [
        { id: 'c1', fromFrameId: 'audience', toFrameId: 'approval-gate', type: 'dependency' },
        { id: 'c2', fromFrameId: 'approval-gate', toFrameId: 'launch', type: 'approval' },
      ],
    };
    const result = validateStoryboard(storyboard);
    expect(result.valid).toBe(true);
    expect(result.errors).toHaveLength(0);
  });

  it('detects structural errors regardless of connection vocabulary', () => {
    const storyboard: MarketingStoryboard = {
      id: 'mkt-2',
      title: 'Bad Campaign',
      frames: [makeFrame('f1'), makeFrame('f1')], // duplicate ID
      connections: [],
    };
    const result = validateStoryboard(storyboard);
    expect(result.valid).toBe(false);
    expect(result.errors.some(e => e.code === 'DUPLICATE_FRAME_ID')).toBe(true);
  });
});

// ─── Runtime shape guards (F-CI-004 / F-CI-013) ───────────────────────────────
// The validator is the runtime entry point for untrusted input — it must not
// throw on shape violations, it must return structured errors.

describe('validateStoryboard runtime shape guards', () => {
  it('returns INVALID_STORYBOARD_SHAPE when given null', () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const result = validateStoryboard(null as any);
    expect(result.valid).toBe(false);
    expect(result.errors[0].code).toBe('INVALID_STORYBOARD_SHAPE');
  });

  it('returns INVALID_STORYBOARD_SHAPE when given undefined', () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const result = validateStoryboard(undefined as any);
    expect(result.valid).toBe(false);
    expect(result.errors[0].code).toBe('INVALID_STORYBOARD_SHAPE');
  });

  it('returns INVALID_STORYBOARD_SHAPE when frames array is missing', () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const result = validateStoryboard({ id: 'sb', title: 'Broken', connections: [] } as any);
    expect(result.valid).toBe(false);
    expect(result.errors[0].code).toBe('INVALID_STORYBOARD_SHAPE');
  });

  it('returns INVALID_STORYBOARD_SHAPE when connections array is missing', () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const result = validateStoryboard({ id: 'sb', title: 'Broken', frames: [makeFrame('f1')] } as any);
    expect(result.valid).toBe(false);
    expect(result.errors[0].code).toBe('INVALID_STORYBOARD_SHAPE');
  });

  it('returns MISSING_FRAME_SIZE when a frame is missing its size field', () => {
    const badFrame = { ...makeFrame('f1'), size: undefined };
    const storyboard = {
      id: 'sb',
      title: 'No Size',
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      frames: [badFrame as any],
      connections: [],
    } as Storyboard;
    const result = validateStoryboard(storyboard);
    expect(result.valid).toBe(false);
    expect(result.errors.some(e => e.code === 'MISSING_FRAME_SIZE' && e.frameId === 'f1')).toBe(true);
  });

  it('returns MISSING_FRAME_POSITION when a frame is missing its position field', () => {
    const badFrame = { ...makeFrame('f1'), position: undefined };
    const storyboard = {
      id: 'sb',
      title: 'No Position',
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      frames: [badFrame as any],
      connections: [],
    } as Storyboard;
    const result = validateStoryboard(storyboard);
    expect(result.valid).toBe(false);
    expect(result.errors.some(e => e.code === 'MISSING_FRAME_POSITION' && e.frameId === 'f1')).toBe(true);
  });
});

// ─── Dimension validity (F-CI-006) ────────────────────────────────────────────
// NaN/Infinity comparisons against MIN_FRAME_DIMENSION are always false, so a
// naive `< 40` check lets them slip past. Use Number.isFinite.

describe('validateStoryboard dimension validity', () => {
  it('rejects NaN frame dimensions', () => {
    const badFrame: AnyStoryboardFrame = {
      ...makeFrame('f1'),
      size: { width: Number.NaN, height: 200 },
    };
    const storyboard: Storyboard = {
      id: 'sb',
      title: 'NaN width',
      frames: [badFrame],
      connections: [],
    };
    const result = validateStoryboard(storyboard);
    expect(result.valid).toBe(false);
    expect(result.errors.some(e => e.code === 'INVALID_FRAME_DIMENSION' && e.frameId === 'f1')).toBe(true);
  });

  it('rejects Infinity frame dimensions', () => {
    const badFrame: AnyStoryboardFrame = {
      ...makeFrame('f1'),
      size: { width: 200, height: Number.POSITIVE_INFINITY },
    };
    const storyboard: Storyboard = {
      id: 'sb',
      title: 'Infinity height',
      frames: [badFrame],
      connections: [],
    };
    const result = validateStoryboard(storyboard);
    expect(result.valid).toBe(false);
    expect(result.errors.some(e => e.code === 'INVALID_FRAME_DIMENSION' && e.frameId === 'f1')).toBe(true);
  });

  it('rejects below-minimum frame dimensions', () => {
    const badFrame: AnyStoryboardFrame = {
      ...makeFrame('f1'),
      size: { width: 10, height: 200 },
    };
    const storyboard: Storyboard = {
      id: 'sb',
      title: 'Too small',
      frames: [badFrame],
      connections: [],
    };
    const result = validateStoryboard(storyboard);
    expect(result.valid).toBe(false);
    expect(result.errors.some(e => e.code === 'INVALID_FRAME_DIMENSION' && e.frameId === 'f1')).toBe(true);
  });
});

// ─── Position validity (F-CI-201) ─────────────────────────────────────────────
// Same trap as dimensions: NaN/Infinity comparisons evade naive guards and
// poison downstream canvas math (control points, midpoints). Use Number.isFinite.

describe('validateStoryboard position validity', () => {
  it('rejects NaN x position', () => {
    const badFrame: AnyStoryboardFrame = {
      ...makeFrame('f1'),
      position: { x: Number.NaN, y: 0 },
    };
    const storyboard: Storyboard = {
      id: 'sb',
      title: 'NaN x',
      frames: [badFrame],
      connections: [],
    };
    const result = validateStoryboard(storyboard);
    expect(result.valid).toBe(false);
    expect(result.errors.some(e => e.code === 'INVALID_FRAME_POSITION' && e.frameId === 'f1')).toBe(true);
  });

  it('rejects NaN y position', () => {
    const badFrame: AnyStoryboardFrame = {
      ...makeFrame('f1'),
      position: { x: 0, y: Number.NaN },
    };
    const storyboard: Storyboard = {
      id: 'sb',
      title: 'NaN y',
      frames: [badFrame],
      connections: [],
    };
    const result = validateStoryboard(storyboard);
    expect(result.valid).toBe(false);
    expect(result.errors.some(e => e.code === 'INVALID_FRAME_POSITION' && e.frameId === 'f1')).toBe(true);
  });

  it('rejects positive Infinity in position', () => {
    const badFrame: AnyStoryboardFrame = {
      ...makeFrame('f1'),
      position: { x: Number.POSITIVE_INFINITY, y: 0 },
    };
    const storyboard: Storyboard = {
      id: 'sb',
      title: 'Inf x',
      frames: [badFrame],
      connections: [],
    };
    const result = validateStoryboard(storyboard);
    expect(result.valid).toBe(false);
    expect(result.errors.some(e => e.code === 'INVALID_FRAME_POSITION' && e.frameId === 'f1')).toBe(true);
  });

  it('rejects negative Infinity in position', () => {
    const badFrame: AnyStoryboardFrame = {
      ...makeFrame('f1'),
      position: { x: 0, y: Number.NEGATIVE_INFINITY },
    };
    const storyboard: Storyboard = {
      id: 'sb',
      title: '-Inf y',
      frames: [badFrame],
      connections: [],
    };
    const result = validateStoryboard(storyboard);
    expect(result.valid).toBe(false);
    expect(result.errors.some(e => e.code === 'INVALID_FRAME_POSITION' && e.frameId === 'f1')).toBe(true);
  });

  it('accepts negative finite positions (frames can live in negative space)', () => {
    const frame: AnyStoryboardFrame = {
      ...makeFrame('f1'),
      position: { x: -500, y: -250 },
    };
    const storyboard: Storyboard = {
      id: 'sb',
      title: 'Negative finite',
      frames: [frame],
      connections: [],
    };
    const result = validateStoryboard(storyboard);
    expect(result.valid).toBe(true);
    expect(result.errors).toHaveLength(0);
  });
});

// ─── Connection invariants (F-CI-005) ─────────────────────────────────────────
// Duplicate connection IDs, self-loops, and duplicate edges must be caught.

describe('validateStoryboard connection invariants', () => {
  it('detects duplicate connection IDs', () => {
    const storyboard: Storyboard = {
      id: 'sb',
      title: 'Dup conn IDs',
      frames: [makeFrame('f1'), makeFrame('f2'), makeFrame('f3')],
      connections: [
        { id: 'c1', fromFrameId: 'f1', toFrameId: 'f2', type: 'sequence' },
        { id: 'c1', fromFrameId: 'f2', toFrameId: 'f3', type: 'sequence' },
      ],
    };
    const result = validateStoryboard(storyboard);
    expect(result.valid).toBe(false);
    expect(result.errors.some(e => e.code === 'DUPLICATE_CONNECTION_ID' && e.connectionId === 'c1')).toBe(true);
  });

  it('detects self-loop connections', () => {
    const storyboard: Storyboard = {
      id: 'sb',
      title: 'Self loop',
      frames: [makeFrame('f1')],
      connections: [
        { id: 'c1', fromFrameId: 'f1', toFrameId: 'f1', type: 'sequence' },
      ],
    };
    const result = validateStoryboard(storyboard);
    expect(result.valid).toBe(false);
    expect(result.errors.some(e => e.code === 'SELF_LOOP_CONNECTION' && e.connectionId === 'c1')).toBe(true);
  });

  it('detects duplicate connection edges (same from/to pair)', () => {
    const storyboard: Storyboard = {
      id: 'sb',
      title: 'Dup edges',
      frames: [makeFrame('f1'), makeFrame('f2')],
      connections: [
        { id: 'c1', fromFrameId: 'f1', toFrameId: 'f2', type: 'sequence' },
        { id: 'c2', fromFrameId: 'f1', toFrameId: 'f2', type: 'choice' },
      ],
    };
    const result = validateStoryboard(storyboard);
    expect(result.valid).toBe(false);
    expect(result.errors.some(e => e.code === 'DUPLICATE_CONNECTION_EDGE' && e.connectionId === 'c2')).toBe(true);
  });
});
