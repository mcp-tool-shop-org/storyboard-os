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
