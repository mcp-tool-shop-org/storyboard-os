// ─── cinematic-domain / playlist.test.ts ─────────────────────────────────────
//
// SequencePlaylist is a thin reel of authored sequence ids. It is not an RPG
// project: no Storyboard clone, no FrameProgress, no timestamps, no store.

import { describe, it, expect } from 'vitest';
import { BOARD_SCHEMA_VERSION } from './schema';
import {
  createSequencePlaylist,
  serializeSequencePlaylistJson,
  listSequencePlaylists,
  getSequencePlaylist,
  getPublishedSequence,
  listPublishedSequences,
  listReelStaticPaths,
  listSequenceStaticPaths,
  storyboardOsDemoReel,
  AUTHORED_SEQUENCE_IDS,
} from './playlist';
import type { SequencePlaylist } from './playlist';

const PROJECT_KEYS = [
  'storyboard',
  'progress',
  'createdAt',
  'updatedAt',
  'sourceTemplateId',
  'frames',
  'connections',
];

describe('createSequencePlaylist', () => {
  it('stamps BOARD_SCHEMA_VERSION and copies items by value', () => {
    const items = [{ sequenceId: 'demo-launch-trailer', take: 'B' }];
    const playlist = createSequencePlaylist({
      id: 'reel-test',
      title: 'Test Reel',
      description: 'Unit fixture',
      items,
    });
    expect(playlist.schemaVersion).toBe(BOARD_SCHEMA_VERSION);
    expect(playlist.items[0]).toEqual({ sequenceId: 'demo-launch-trailer', take: 'B' });
    items[0].take = 'mutated';
    expect(playlist.items[0].take).toBe('B');
  });

  it('omits take when not provided', () => {
    const playlist = createSequencePlaylist({
      id: 'reel-no-take',
      title: 'No Take',
      items: [{ sequenceId: 'template-trailer-flow' }],
    });
    expect(playlist.items[0]).toEqual({ sequenceId: 'template-trailer-flow' });
    expect(playlist.items[0]).not.toHaveProperty('take');
  });
});

describe('SequencePlaylist shape — not a project clone', () => {
  it('does not embed a Storyboard or FrameProgress', () => {
    const keys = Object.keys(storyboardOsDemoReel);
    expect(keys.sort()).toEqual(['description', 'id', 'items', 'schemaVersion', 'title'].sort());
    for (const key of PROJECT_KEYS) {
      expect(storyboardOsDemoReel).not.toHaveProperty(key);
    }
    const json = serializeSequencePlaylistJson(storyboardOsDemoReel);
    expect(json).not.toMatch(/"storyboard"/);
    expect(json).not.toMatch(/FrameProgress/);
    expect(json).not.toMatch(/"progress"/);
    expect(json).not.toMatch(/"createdAt"/);
    const parsed = JSON.parse(json) as SequencePlaylist;
    expect(parsed.items.every(item => Object.keys(item).every(k => k === 'sequenceId' || k === 'take'))).toBe(true);
  });
});

describe('storyboardOsDemoReel', () => {
  it('references demo-launch-trailer plus the three template sequence ids', () => {
    expect(storyboardOsDemoReel.id).toBe('demo-launch-reel');
    expect(storyboardOsDemoReel.schemaVersion).toBe(BOARD_SCHEMA_VERSION);
    const ids = storyboardOsDemoReel.items.map(i => i.sequenceId);
    expect(ids).toEqual([
      'demo-launch-trailer',
      'template-trailer-flow',
      'template-cutscene-sequence',
      'template-explainer-video',
    ]);
    expect(ids).toEqual([...AUTHORED_SEQUENCE_IDS]);
    expect(storyboardOsDemoReel.items[0].take).toBe('A');
    expect(storyboardOsDemoReel.items.slice(1).every(i => i.take === undefined)).toBe(true);
  });

  it('every item resolves to an authored board', () => {
    for (const item of storyboardOsDemoReel.items) {
      const board = getPublishedSequence(item.sequenceId);
      expect(board, item.sequenceId).toBeDefined();
      expect(board!.id).toBe(item.sequenceId);
    }
  });
});

describe('SSG catalog from reels', () => {
  it('listSequencePlaylists / listReelStaticPaths cover reel ids', () => {
    const reels = listSequencePlaylists();
    expect(reels.map(r => r.id)).toEqual(['demo-launch-reel']);
    expect(getSequencePlaylist('demo-launch-reel')).toBe(storyboardOsDemoReel);
    expect(getSequencePlaylist('missing')).toBeUndefined();
    const paths = listReelStaticPaths();
    expect(paths).toEqual([
      { params: { reelId: 'demo-launch-reel' }, props: { playlist: storyboardOsDemoReel } },
    ]);
  });

  it('listPublishedSequences follows reel order, not a flat concat of factories', () => {
    const boards = listPublishedSequences();
    expect(boards.map(b => b.id)).toEqual(storyboardOsDemoReel.items.map(i => i.sequenceId));
    const seqPaths = listSequenceStaticPaths();
    expect(seqPaths.map(p => p.params.sequenceId)).toEqual(boards.map(b => b.id));
  });
});
