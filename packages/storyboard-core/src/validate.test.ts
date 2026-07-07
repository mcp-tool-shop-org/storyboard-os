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

// ─── Non-string title/summary guards (CR-001) ─────────────────────────────────
// Optional chaining (`frame.title?.trim()`) only guards null/undefined. A
// number/object/array/boolean title or summary must yield a structured
// MISSING_TITLE / MISSING_SUMMARY error — never a TypeError.

describe('validateStoryboard non-string title/summary guards', () => {
  const nonStringValues: Array<[string, unknown]> = [
    ['number', 42],
    ['boolean', true],
    ['array', ['not', 'a', 'title']],
    ['object', { text: 'nope' }],
  ];

  for (const [label, value] of nonStringValues) {
    it(`returns MISSING_TITLE (no throw) when title is a ${label}`, () => {
      const badFrame = { ...makeFrame('f1'), title: value };
      const storyboard = {
        id: 'sb',
        title: 'Bad title type',
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        frames: [badFrame as any],
        connections: [],
      } as Storyboard;
      const result = validateStoryboard(storyboard);
      expect(result.valid).toBe(false);
      expect(result.errors.some(e => e.code === 'MISSING_TITLE' && e.frameId === 'f1')).toBe(true);
    });

    it(`returns MISSING_SUMMARY (no throw) when summary is a ${label}`, () => {
      const badFrame = { ...makeFrame('f1'), summary: value };
      const storyboard = {
        id: 'sb',
        title: 'Bad summary type',
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        frames: [badFrame as any],
        connections: [],
      } as Storyboard;
      const result = validateStoryboard(storyboard);
      expect(result.valid).toBe(false);
      expect(result.errors.some(e => e.code === 'MISSING_SUMMARY' && e.frameId === 'f1')).toBe(true);
    });
  }
});

// ─── Per-element shape guards (CR-002) ────────────────────────────────────────
// A null or primitive element inside `frames` / `connections` must yield a
// structured INVALID_STORYBOARD_SHAPE error naming the array and index —
// never a TypeError from dereferencing the element.

describe('validateStoryboard per-element shape guards', () => {
  it('returns INVALID_STORYBOARD_SHAPE for a null element in frames', () => {
    const storyboard = {
      id: 'sb',
      title: 'Null frame',
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      frames: [makeFrame('f1'), null as any],
      connections: [],
    } as Storyboard;
    const result = validateStoryboard(storyboard);
    expect(result.valid).toBe(false);
    expect(
      result.errors.some(
        e => e.code === 'INVALID_STORYBOARD_SHAPE' && e.message.includes('frames[1]'),
      ),
    ).toBe(true);
  });

  it('returns INVALID_STORYBOARD_SHAPE for a null element in connections', () => {
    const storyboard = {
      id: 'sb',
      title: 'Null connection',
      frames: [makeFrame('f1')],
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      connections: [null as any],
    } as Storyboard;
    const result = validateStoryboard(storyboard);
    expect(result.valid).toBe(false);
    expect(
      result.errors.some(
        e => e.code === 'INVALID_STORYBOARD_SHAPE' && e.message.includes('connections[0]'),
      ),
    ).toBe(true);
  });

  it('returns INVALID_STORYBOARD_SHAPE for primitive elements in both arrays', () => {
    const storyboard = {
      id: 'sb',
      title: 'Primitive elements',
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      frames: [makeFrame('f1'), 42 as any],
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      connections: ['not-a-connection' as any],
    } as Storyboard;
    const result = validateStoryboard(storyboard);
    expect(result.valid).toBe(false);
    expect(
      result.errors.some(
        e => e.code === 'INVALID_STORYBOARD_SHAPE' && e.message.includes('frames[1]'),
      ),
    ).toBe(true);
    expect(
      result.errors.some(
        e => e.code === 'INVALID_STORYBOARD_SHAPE' && e.message.includes('connections[0]'),
      ),
    ).toBe(true);
  });

  it('still validates the healthy frames alongside a bad element', () => {
    const badTitleFrame = { ...makeFrame('f2'), title: '   ' };
    const storyboard = {
      id: 'sb',
      title: 'Mixed good and bad',
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      frames: [null as any, badTitleFrame],
      connections: [],
    } as Storyboard;
    const result = validateStoryboard(storyboard);
    expect(result.valid).toBe(false);
    // The null element gets a shape error AND the healthy-shaped sibling still
    // gets its own field-level validation.
    expect(
      result.errors.some(
        e => e.code === 'INVALID_STORYBOARD_SHAPE' && e.message.includes('frames[0]'),
      ),
    ).toBe(true);
    expect(result.errors.some(e => e.code === 'MISSING_TITLE' && e.frameId === 'f2')).toBe(true);
  });
});

// ─── Non-string id / ref guards (CR-003) ──────────────────────────────────────
// A frame with a non-string id must never enter the frame-id set: otherwise
// `frameIds.has(undefined)` matches a connection whose ref is also undefined
// and the broken reference is silently masked. Non-string ids and refs must
// produce structured errors and an invalid board.

describe('validateStoryboard non-string id and ref guards', () => {
  it('returns INVALID_FRAME_ID for a frame with an undefined id', () => {
    const badFrame = { ...makeFrame('f1'), id: undefined };
    const storyboard = {
      id: 'sb',
      title: 'Undefined frame id',
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      frames: [badFrame as any],
      connections: [],
    } as Storyboard;
    const result = validateStoryboard(storyboard);
    expect(result.valid).toBe(false);
    expect(result.errors.some(e => e.code === 'INVALID_FRAME_ID')).toBe(true);
  });

  it('returns INVALID_FRAME_ID for a frame with a numeric id', () => {
    const badFrame = { ...makeFrame('f1'), id: 42 };
    const storyboard = {
      id: 'sb',
      title: 'Numeric frame id',
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      frames: [badFrame as any],
      connections: [],
    } as Storyboard;
    const result = validateStoryboard(storyboard);
    expect(result.valid).toBe(false);
    expect(result.errors.some(e => e.code === 'INVALID_FRAME_ID')).toBe(true);
  });

  it('does not report a bogus DUPLICATE_FRAME_ID for two frames with undefined ids', () => {
    const storyboard = {
      id: 'sb',
      title: 'Two undefined ids',
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      frames: [{ ...makeFrame('f1'), id: undefined } as any, { ...makeFrame('f2'), id: undefined } as any],
      connections: [],
    } as Storyboard;
    const result = validateStoryboard(storyboard);
    expect(result.valid).toBe(false);
    expect(result.errors.filter(e => e.code === 'INVALID_FRAME_ID')).toHaveLength(2);
    expect(result.errors.some(e => e.code === 'DUPLICATE_FRAME_ID')).toBe(false);
  });

  it('non-string frame id does not mask a broken fromFrameId ref', () => {
    // Before the fix, the undefined frame id landed in the frame-id set, so a
    // connection with fromFrameId: undefined "matched" and no error fired.
    const storyboard = {
      id: 'sb',
      title: 'Masked broken from-ref',
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      frames: [{ ...makeFrame('f1'), id: undefined } as any, makeFrame('f2')],
      connections: [
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        { id: 'c1', fromFrameId: undefined, toFrameId: 'f2', type: 'sequence' } as any,
      ],
    } as Storyboard;
    const result = validateStoryboard(storyboard);
    expect(result.valid).toBe(false);
    expect(result.errors.some(e => e.code === 'INVALID_FRAME_ID')).toBe(true);
    expect(result.errors.some(e => e.code === 'BROKEN_CONNECTION_FROM' && e.connectionId === 'c1')).toBe(true);
  });

  it('non-string frame id does not mask a broken toFrameId ref', () => {
    const storyboard = {
      id: 'sb',
      title: 'Masked broken to-ref',
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      frames: [makeFrame('f1'), { ...makeFrame('f2'), id: 42 } as any],
      connections: [
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        { id: 'c1', fromFrameId: 'f1', toFrameId: 42, type: 'sequence' } as any,
      ],
    } as Storyboard;
    const result = validateStoryboard(storyboard);
    expect(result.valid).toBe(false);
    expect(result.errors.some(e => e.code === 'INVALID_FRAME_ID')).toBe(true);
    expect(result.errors.some(e => e.code === 'BROKEN_CONNECTION_TO' && e.connectionId === 'c1')).toBe(true);
  });

  it('does not report a bogus self-loop when both refs are non-string', () => {
    // `undefined === undefined` must not read as "frame connected to itself".
    const storyboard = {
      id: 'sb',
      title: 'Undefined refs are not a self-loop',
      frames: [makeFrame('f1')],
      connections: [
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        { id: 'c1', fromFrameId: undefined, toFrameId: undefined, type: 'sequence' } as any,
      ],
    } as Storyboard;
    const result = validateStoryboard(storyboard);
    expect(result.valid).toBe(false);
    expect(result.errors.some(e => e.code === 'SELF_LOOP_CONNECTION')).toBe(false);
    expect(result.errors.some(e => e.code === 'BROKEN_CONNECTION_FROM' && e.connectionId === 'c1')).toBe(true);
    expect(result.errors.some(e => e.code === 'BROKEN_CONNECTION_TO' && e.connectionId === 'c1')).toBe(true);
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
