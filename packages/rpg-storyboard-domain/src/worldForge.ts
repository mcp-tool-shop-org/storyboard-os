// ─── rpg-domain / worldForge.ts ──────────────────────────────────────────────
//
// One-way world-forge pack compile of schema-valid QuestHandoff / ProjectHandoff.
// Pack layout lives here, not on FrameContent. There is no reverse-import onto
// the Konva graph.
//
// ─────────────────────────────────────────────────────────────────────────────

import type { CombatSpec } from './schema';
import type { HandoffBeat } from './handoff';
import { normalizeCombatSpec } from './combatSpec';
import { isProjectHandoff, requireSchemaValidHandoff } from './compileGate';

export const WORLD_FORGE_PACK_FORMAT = 'world-forge-pack' as const;
export const WORLD_FORGE_PACK_VERSION = 1 as const;

export interface WorldForgePackSource {
  kind: 'quest' | 'project';
  schema: string;
  id: string;
  title: string;
  formatVersion: 1;
  projectId?: string;
  storyboardId?: string;
}

export interface WorldForgePackBranch {
  type: string;
  toId: string;
  label?: string;
}

export interface WorldForgePackNode {
  id: string;
  type: string;
  title: string;
  summary: string;
  entry: string[];
  exit: string[];
  state: string[];
  assets: string[];
  tests: string[];
  checklist: string[];
  branches: WorldForgePackBranch[];
}

export interface WorldForgePackCombat {
  beatId: string;
  anticipation?: string;
  hit?: string;
  followThrough?: string;
  recovery?: string;
  ability?: { resourceId: string; ap?: number };
}

/**
 * Downstream pack contract. Layout is adapter-owned — do not persist these
 * fields on FrameContent or treat the pack as a second source of truth.
 */
export interface WorldForgePack {
  format: typeof WORLD_FORGE_PACK_FORMAT;
  version: typeof WORLD_FORGE_PACK_VERSION;
  source: WorldForgePackSource;
  quest: {
    id: string;
    title: string;
    description?: string;
    beatOrder: string[];
  };
  nodes: Record<string, WorldForgePackNode>;
  combat: Record<string, WorldForgePackCombat>;
}

function packCombat(beat: HandoffBeat): WorldForgePackCombat | undefined {
  if (beat.type !== 'encounter') return undefined;
  const spec: CombatSpec | undefined = normalizeCombatSpec(beat.combatSpec);
  if (spec === undefined) return undefined;
  const combat: WorldForgePackCombat = { beatId: beat.id };
  if (spec.anticipation) combat.anticipation = spec.anticipation;
  if (spec.hit) combat.hit = spec.hit;
  if (spec.followThrough) combat.followThrough = spec.followThrough;
  if (spec.recovery) combat.recovery = spec.recovery;
  if (spec.ability) {
    combat.ability = spec.ability.ap === undefined
      ? { resourceId: spec.ability.id }
      : { resourceId: spec.ability.id, ap: spec.ability.ap };
  }
  return combat;
}

function packNode(beat: HandoffBeat): WorldForgePackNode {
  return {
    id: beat.id,
    type: beat.type,
    title: beat.title,
    summary: beat.summary,
    entry: [...beat.entryConditions],
    exit: [...beat.exitConditions],
    state: [...beat.stateChanges],
    assets: [...beat.requiredAssets],
    tests: [...beat.testCriteria],
    checklist: [...beat.implementationChecklist],
    branches: beat.outgoingBranches.map(b => {
      const branch: WorldForgePackBranch = { type: b.type, toId: b.toId };
      if (b.label) branch.label = b.label;
      return branch;
    }),
  };
}

/**
 * Compile schema-valid QuestHandoff / ProjectHandoff JSON to a world-forge pack.
 * Throws HandoffEnvelopeError when the envelope fails the schema gate.
 */
export function compileHandoffToWorldForgePack(input: unknown): WorldForgePack {
  const handoff = requireSchemaValidHandoff(input);
  const nodes: Record<string, WorldForgePackNode> = {};
  const combat: Record<string, WorldForgePackCombat> = {};

  for (const beat of handoff.beats) {
    nodes[beat.id] = packNode(beat);
    const attached = packCombat(beat);
    if (attached) combat[beat.id] = attached;
  }

  const source: WorldForgePackSource = isProjectHandoff(handoff)
    ? {
        kind: 'project',
        schema: handoff.$schema,
        id: handoff.projectId,
        title: handoff.title,
        formatVersion: 1,
        projectId: handoff.projectId,
        storyboardId: handoff.storyboardId,
      }
    : {
        kind: 'quest',
        schema: handoff.$schema,
        id: handoff.id,
        title: handoff.title,
        formatVersion: 1,
      };

  const quest: WorldForgePack['quest'] = {
    id: isProjectHandoff(handoff) ? handoff.storyboardId : handoff.id,
    title: handoff.title,
    beatOrder: handoff.beats.map(b => b.id),
  };
  if (handoff.description) quest.description = handoff.description;

  return {
    format: WORLD_FORGE_PACK_FORMAT,
    version: WORLD_FORGE_PACK_VERSION,
    source,
    quest,
    nodes,
    combat,
  };
}
