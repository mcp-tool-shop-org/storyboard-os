// ─── rpg-storyboard-domain / schema.ts ───────────────────────────────────────
//
// RPG game-authoring domain types. Specializes the generic primitives from
// @storyboard-os/core with RPG-specific frame types, content fields, and
// annotation vocabulary.
//
// App code imports from '@storyboard-os/rpg-domain', not from here directly.
//
// ─────────────────────────────────────────────────────────────────────────────

import type {
  FrameAnnotation as CoreAnnotation,
  StoryboardFrame as CoreFrame,
  Storyboard as CoreStoryboard,
  StoryboardProject as CoreProject,
  StoryboardTemplateDefinition as CoreTemplateDefinition,
} from '@storyboard-os/core';

// Re-export generic types the app uses directly (no specialization needed).
export type {
  StoryboardConnectionType,
  StoryboardConnection,
  CreateStoryboardInput,
} from '@storyboard-os/core';

// ─── RPG Frame Types ──────────────────────────────────────────────────────────

export type StoryboardFrameType =
  | 'hook'
  | 'scene'
  | 'choice'
  | 'encounter'
  | 'reveal'
  | 'npc_beat'
  | 'consequence';

// ─── RPG Annotation Types ─────────────────────────────────────────────────────

export type FrameAnnotationType =
  | 'designer_note'
  | 'player_visible'
  | 'author_only'
  | 'danger'
  | 'timing'
  | 'branch_note';

// ─── RPG Template IDs ─────────────────────────────────────────────────────────

export type StoryboardTemplateId =
  | 'quest_flow'
  | 'quest_branch'
  | 'cutscene_beat';

// ─── Optional combat attachment (encounter only) ──────────────────────────────
// Quest-logic stays on the encounter card. Combat timing is an optional spec
// attachment, never a new StoryboardFrameType.

/** Resource-shaped ability id + action-point cost (Godot Resource compile input). */
export interface CombatAbilityRef {
  /** Engine Resource id (e.g. `res://abilities/slash.tres`). */
  id: string;
  /** Action-point cost. Omitted when the ability has no AP cost. */
  ap?: number;
}

/**
 * Optional 4-beat combat timing on an encounter.
 * Empty object is valid — the encounter remains quest-logic.
 * Only copied onto the handoff when `frame.type === 'encounter'`.
 */
export interface CombatSpec {
  anticipation?: string;
  hit?: string;
  followThrough?: string;
  recovery?: string;
  ability?: CombatAbilityRef;
}

// ─── RPG Frame Content ────────────────────────────────────────────────────────
// Carries the full implementation depth for each beat.
// Serves both the canvas summary label and the full detail page.

export interface FrameContent {
  // Authoring
  designerNotes?: string;
  playerVisibleText?: string;
  authorOnlyNotes?: string[];
  stakes?: string;

  // Game structure
  entryConditions?: string[];
  exitConditions?: string[];
  stateChanges?: string[];

  // Characters + world
  involvedCharacters?: string[];
  involvedFactions?: string[];

  // Outcomes + implementation
  possibleOutcomes?: string[];
  implementationChecklist?: string[];
  requiredAssets?: string[];
  testCriteria?: string[];

  /**
   * Authoring nest parent for choice→consequence fans.
   * String field on content (core has no parentFrameId in this worktree).
   * Not a pack/layout field and not copied onto the portable handoff.
   */
  parentFrameId?: string;

  /**
   * Encounter-only combat attachment. Ignored on other frame types.
   * Absent and `{}` are both valid quest-logic.
   */
  combatSpec?: CombatSpec;
}

// ─── Concrete RPG Types ───────────────────────────────────────────────────────

export type FrameAnnotation = CoreAnnotation<FrameAnnotationType>;

export type StoryboardFrame = CoreFrame<
  StoryboardFrameType,
  FrameContent,
  FrameAnnotationType
>;

export type Storyboard = CoreStoryboard<StoryboardFrame>;

export type StoryboardProject = CoreProject<Storyboard>;

export type StoryboardTemplateDefinition =
  CoreTemplateDefinition<StoryboardTemplateId, Storyboard>;
