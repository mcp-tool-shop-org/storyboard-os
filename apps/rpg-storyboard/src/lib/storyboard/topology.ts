// ─── topology.ts ──────────────────────────────────────────────────────────────
//
// Project-board helpers for manual topology authoring (F-e8c70228).
// Pure display/policy — mutators live in @storyboard-os/rpg-domain.

import type { BoardDensity } from '@storyboard-os/core';
import type { StoryboardFrameType, StoryboardConnectionType } from './schema';

export const FRAME_TYPE_OPTIONS: ReadonlyArray<{ value: StoryboardFrameType; label: string }> = [
  { value: 'hook',        label: 'Hook' },
  { value: 'scene',       label: 'Scene' },
  { value: 'choice',      label: 'Choice' },
  { value: 'encounter',   label: 'Encounter' },
  { value: 'reveal',      label: 'Reveal' },
  { value: 'npc_beat',    label: 'NPC Beat' },
  { value: 'consequence', label: 'Consequence' },
];

export const CONNECTION_TYPE_OPTIONS: ReadonlyArray<{ value: StoryboardConnectionType; label: string }> = [
  { value: 'sequence',    label: 'Sequence' },
  { value: 'choice',      label: 'Choice Branch' },
  { value: 'consequence', label: 'Consequence' },
  { value: 'optional',    label: 'Optional Path' },
  { value: 'fallback',    label: 'Fallback' },
];

export interface TopologyBanner {
  text: string;
  tone: 'warn' | 'error' | 'info';
}

export function addBeatBlocked(density: BoardDensity): boolean {
  return density.level === 'over';
}

export function densityBanner(density: BoardDensity): TopologyBanner | null {
  if (density.level === 'over') {
    return {
      text: `Board is at the ${density.frameCount}-frame cap. Additional beats cannot be added.`,
      tone: 'error',
    };
  }
  if (density.level === 'warn') {
    return {
      text: `Board density is high (${density.frameCount} frames). Path-finding gets harder past 50 frames.`,
      tone: 'warn',
    };
  }
  return null;
}

export function topologyOpBanner(result: {
  ok: boolean;
  message?: string;
  warning?: string;
}): TopologyBanner | null {
  if (!result.ok) {
    return { text: result.message ?? 'Could not change the board.', tone: 'error' };
  }
  if (result.warning) return { text: result.warning, tone: 'warn' };
  return null;
}
