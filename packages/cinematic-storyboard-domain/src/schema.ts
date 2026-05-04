// ─── Cinematic Storyboard Domain — Schema ────────────────────────────────────
//
// Production-ready visual sequence planner for trailers, cutscenes, short films,
// game cinematics, promos, and animatics. Every frame carries camera language,
// continuity, asset/VFX/audio requirements, and edit readiness.
//
// ─────────────────────────────────────────────────────────────────────────────

import type { StoryboardFrame as CoreFrame } from '@storyboard-os/core';

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

export interface CinematicFrameContent {
  intent?: string;
  visualDescription?: string;
  cameraAngle?: string;
  cameraMovement?: string;
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

export interface StoryboardConnection {
  id: string;
  fromFrameId: string;
  toFrameId: string;
  type: CinematicConnectionType;
  label?: string;
}

export interface Storyboard {
  id: string;
  title: string;
  description?: string;
  templateId?: string;
  frames: StoryboardFrame[];
  connections: StoryboardConnection[];
}
