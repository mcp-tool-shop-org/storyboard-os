// ─── Cinematic Domain — Display labels ────────────────────────────────────────
//
// Shared humanization for handoff markdown + HTML so Type / Status / Sequence
// Flow / missing-reason copy cannot drift. JSON keeps the raw enums/codes.

import type { CinematicConnectionType, CinematicFrameType } from './schema';
import type { CinematicBeatStatusLevel } from './beatStatus';

export const FRAME_TYPE_LABELS: Record<CinematicFrameType, string> = {
  sequence: 'Sequence',
  shot: 'Shot',
  camera_move: 'Camera Move',
  action: 'Action',
  dialogue: 'Dialogue',
  transition: 'Transition',
  vfx: 'VFX',
  audio: 'Audio',
  edit_beat: 'Edit Beat',
};

export function humanizeFrameType(type: string): string {
  return FRAME_TYPE_LABELS[type as CinematicFrameType] ?? type.replace(/_/g, ' ');
}

export function humanizeStatus(status: string): string {
  return status.toUpperCase();
}

/** Beat-status words as they appear on HTML badges (READY / PARTIAL / …). */
export const STATUS_LABELS: Record<CinematicBeatStatusLevel, string> = {
  ready: 'READY',
  partial: 'PARTIAL',
  draft: 'DRAFT',
  blocked: 'BLOCKED',
};

/** Sequence Flow labels — match handoff.astro CONN_LABELS (not canvas Title Case). */
export const CONNECTION_TYPE_LABELS: Record<CinematicConnectionType, string> = {
  sequence: 'sequence',
  match_cut: 'match cut',
  cutaway: 'cutaway',
  reaction: 'reaction',
  transition: 'transition',
  continuity: 'continuity',
  parallel_action: 'parallel',
  fallback: 'fallback',
};

export const CONNECTION_TYPE_COLORS: Record<CinematicConnectionType, string> = {
  sequence: '#475569',
  match_cut: '#3B82F6',
  cutaway: '#F97316',
  reaction: '#A855F7',
  transition: '#6366F1',
  continuity: '#22C55E',
  parallel_action: '#EAB308',
  fallback: '#334155',
};

export function humanizeConnectionType(type: string): string {
  return CONNECTION_TYPE_LABELS[type as CinematicConnectionType] ?? type.replace(/_/g, ' ');
}

export function getConnectionTypeColor(type: string): string {
  return CONNECTION_TYPE_COLORS[type as CinematicConnectionType] ?? '#475569';
}

const MISSING_REASON_LABELS: Record<string, string> = {
  no_visualDescription: 'Visual description missing',
  no_cameraMovement: 'Camera movement missing',
  no_actionNotes: 'Action notes missing',
  no_dialogue: 'Dialogue missing',
  no_editNotes: 'Edit notes missing',
  no_vfxRequirements: 'VFX requirements missing',
  no_audioRequirements: 'Audio requirements missing',
  no_durationEstimate: 'Duration estimate missing',
  no_spec: 'No spec content yet — add at least one of: intent, framing, duration estimate, or implementation checklist',
};

/** Map a `no_*` beat-status code to the same copy ProductionSignalPanel shows. */
export function humanizeMissingReason(code: string): string {
  return (
    MISSING_REASON_LABELS[code] ??
    code
      .replace(/^no_/, 'Missing ')
      .replace(/([A-Z])/g, ' $1')
      .toLowerCase()
      .replace(/^./, c => c.toUpperCase())
  );
}
