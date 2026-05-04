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
