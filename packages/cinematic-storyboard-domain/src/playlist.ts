// ─── Cinematic Domain — Sequence Playlist ────────────────────────────────────
//
// Thin Sequencer-style reel: orders already-authored sequence ids with optional
// take labels. Persist is an authored JSON document, SSG-loaded like today's
// boards. Not an RPG project (no Storyboard clone, no FrameProgress, no
// timestamps, no /projects store).

import type { Storyboard } from './schema';
import { BOARD_SCHEMA_VERSION } from './schema';
import { storyboardOsLaunchTrailer } from './demo-sequence';
import { createCinematicStoryboard } from './templates';

export interface SequencePlaylistItem {
  sequenceId: string;
  /** Take label only — not a persist fork of the sequence. */
  take?: string;
}

export interface SequencePlaylist {
  schemaVersion: number;
  id: string;
  title: string;
  description?: string;
  items: SequencePlaylistItem[];
}

export interface CreateSequencePlaylistInput {
  id: string;
  title: string;
  description?: string;
  items: SequencePlaylistItem[];
}

/** Authored sequence ids the demo reel (and SSG) may reference. */
export const AUTHORED_SEQUENCE_IDS = [
  'demo-launch-trailer',
  'template-trailer-flow',
  'template-cutscene-sequence',
  'template-explainer-video',
] as const;

export type AuthoredSequenceId = (typeof AUTHORED_SEQUENCE_IDS)[number];

const SEQUENCE_FACTORIES: Record<AuthoredSequenceId, () => Storyboard> = {
  'demo-launch-trailer': () => storyboardOsLaunchTrailer,
  'template-trailer-flow': () => createCinematicStoryboard('trailer_flow'),
  'template-cutscene-sequence': () => createCinematicStoryboard('cutscene_sequence'),
  'template-explainer-video': () => createCinematicStoryboard('explainer_video'),
};

/**
 * Domain JSON factory. Stamps BOARD_SCHEMA_VERSION. Copies items by value so
 * callers cannot later mutate take/sequenceId through the input object.
 */
export function createSequencePlaylist(input: CreateSequencePlaylistInput): SequencePlaylist {
  const items: SequencePlaylistItem[] = input.items.map(item => {
    const next: SequencePlaylistItem = { sequenceId: item.sequenceId };
    if (item.take !== undefined) next.take = item.take;
    return next;
  });
  const playlist: SequencePlaylist = {
    schemaVersion: BOARD_SCHEMA_VERSION,
    id: input.id,
    title: input.title,
    items,
  };
  if (input.description !== undefined) playlist.description = input.description;
  return playlist;
}

/** Persist path: authored JSON document of sequence ids. No storage envelope. */
export function serializeSequencePlaylistJson(playlist: SequencePlaylist): string {
  return JSON.stringify(playlist, null, 2);
}

export const storyboardOsDemoReel: SequencePlaylist = createSequencePlaylist({
  id: 'demo-launch-reel',
  title: 'Storyboard OS Demo Reel',
  description:
    'Launch trailer plus the three cinematic templates, in playback order. Takes are labels, not forks.',
  items: [
    { sequenceId: 'demo-launch-trailer', take: 'A' },
    { sequenceId: 'template-trailer-flow' },
    { sequenceId: 'template-cutscene-sequence' },
    { sequenceId: 'template-explainer-video' },
  ],
});

export const CINEMATIC_PLAYLISTS: SequencePlaylist[] = [storyboardOsDemoReel];

export function listSequencePlaylists(): SequencePlaylist[] {
  return CINEMATIC_PLAYLISTS.slice();
}

export function getSequencePlaylist(id: string): SequencePlaylist | undefined {
  return CINEMATIC_PLAYLISTS.find(reel => reel.id === id);
}

export function getPublishedSequence(sequenceId: string): Storyboard | undefined {
  const factory = SEQUENCE_FACTORIES[sequenceId as AuthoredSequenceId];
  return factory ? factory() : undefined;
}

/**
 * Authored boards in reel order. Dedupes sequence ids across reels.
 * Landing, 404, and sequence getStaticPaths consume this list.
 */
export function listPublishedSequences(): Storyboard[] {
  const seen = new Set<string>();
  const boards: Storyboard[] = [];
  for (const reel of listSequencePlaylists()) {
    for (const item of reel.items) {
      if (seen.has(item.sequenceId)) continue;
      const board = getPublishedSequence(item.sequenceId);
      if (!board) continue;
      seen.add(item.sequenceId);
      boards.push(board);
    }
  }
  return boards;
}

/** SSG getStaticPaths over reel ids. */
export function listReelStaticPaths(): Array<{
  params: { reelId: string };
  props: { playlist: SequencePlaylist };
}> {
  return listSequencePlaylists().map(playlist => ({
    params: { reelId: playlist.id },
    props: { playlist },
  }));
}

/** Sequence paths derived from reel items (authored boards, not a project clone). */
export function listSequenceStaticPaths(): Array<{
  params: { sequenceId: string };
  props: { storyboard: Storyboard };
}> {
  return listPublishedSequences().map(storyboard => ({
    params: { sequenceId: storyboard.id },
    props: { storyboard },
  }));
}
