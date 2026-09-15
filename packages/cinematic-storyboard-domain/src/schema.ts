// ─── Cinematic Storyboard Domain — Schema ────────────────────────────────────
//
// Production-ready visual sequence planner for trailers, cutscenes, short films,
// game cinematics, promos, and animatics. Every frame carries camera language,
// continuity, asset/VFX/audio requirements, and edit readiness.
//
// ─────────────────────────────────────────────────────────────────────────────

import type { StoryboardFrame as CoreFrame, Storyboard as CoreStoryboard, StoryboardConnection as CoreConnection } from '@storyboard-os/core';

// ─── Frame types ──────────────────────────────────────────────────────────────

export type CinematicFrameType =
  | 'sequence'
  | 'shot'
  | 'camera_move'
  | 'action'
  | 'dialogue'
  | 'transition'
  | 'vfx'
  | 'audio'
  | 'edit_beat';

// ─── Content ──────────────────────────────────────────────────────────────────

/** Sequencer shot-size grammar. Not a sprite-turnaround azimuth. */
export const CINEMATIC_SHOT_SIZES = [
  'EWS', 'WS', 'MS', 'MCU', 'CU', 'ECU', 'POV', 'insert',
] as const;
export type CinematicShotSize = (typeof CINEMATIC_SHOT_SIZES)[number];

/**
 * Sequencer camera move. `arc` is the orbit/arc moving-camera token.
 * Do not add azimuth / turnaround / 35° sprite-orbit fields.
 */
export const CINEMATIC_CAMERA_MOVES = [
  'static', 'dolly', 'pan', 'tilt', 'track', 'crane',
  'handheld', 'steadicam', 'zoom', 'arc',
] as const;
export type CinematicCameraMove = (typeof CINEMATIC_CAMERA_MOVES)[number];

export interface CinematicFrameContent {
  intent?: string;
  visualDescription?: string;
  /** Free-text author note (angle, lighting, lens flavor). */
  cameraAngle?: string;
  /** Free-text author note for the move. Complexity classifies from `move`. */
  cameraMovement?: string;
  /** Structured shot size for the shot list. */
  shotSize?: CinematicShotSize;
  /** Focal length in millimetres. */
  lensMm?: number;
  /** Horizontal FOV in degrees. */
  fovDeg?: number;
  /** Structured Sequencer move. Classify complexity from this, not prose. */
  move?: CinematicCameraMove;
  framing?: string;
  durationEstimate?: string;
  dialogue?: string[];
  actionNotes?: string[];
  continuityRequirements?: string[];
  requiredAssets?: string[];
  vfxRequirements?: string[];
  audioRequirements?: string[];
  editNotes?: string;
  implementationChecklist?: string[];
  testCriteria?: string[];
}

// ─── Annotation types ─────────────────────────────────────────────────────────

export type CinematicAnnotationType =
  | 'director_note'
  | 'continuity_note'
  | 'timing_note'
  | 'audio_cue'
  | 'vfx_note';

// ─── Connection types ─────────────────────────────────────────────────────────

export type CinematicConnectionType =
  | 'sequence'
  | 'match_cut'
  | 'cutaway'
  | 'reaction'
  | 'transition'
  | 'continuity'
  | 'parallel_action'
  | 'fallback';

// ─── Composite types ──────────────────────────────────────────────────────────

export type StoryboardFrame = CoreFrame<CinematicFrameType, CinematicFrameContent, CinematicAnnotationType>;

export type StoryboardConnection = CoreConnection<CinematicConnectionType>;

/**
 * Board schema discriminator for future load/migration paths.
 * Stamped on demo + template boards. SequencePlaylist reuses this value as
 * its migration hook — it is not a project wrapper around a cloned board.
 */
export const BOARD_SCHEMA_VERSION = 1;

export type Storyboard = CoreStoryboard<StoryboardFrame, StoryboardConnection> & {
  /** Optional board-format version; stamped by createCinematicStoryboard / demo. */
  schemaVersion?: number;
};
