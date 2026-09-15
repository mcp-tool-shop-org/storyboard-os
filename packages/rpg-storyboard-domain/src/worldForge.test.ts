// ─── worldForge.test.ts ──────────────────────────────────────────────────────
//
// F-b82a6045: one-way world-forge pack adapter from schema-valid
// QuestHandoff / ProjectHandoff. Pack layout lives in the adapter.
//
// ─────────────────────────────────────────────────────────────────────────────

import { describe, it, expect } from 'vitest';
import {
  compileHandoffToWorldForgePack,
  WORLD_FORGE_PACK_FORMAT,
  WORLD_FORGE_PACK_VERSION,
} from './worldForge';
import { generateHandoff, generateProjectHandoff } from './handoff';
import { HandoffEnvelopeError } from './handoffValidate';
import { createProject, updateFrameContent } from './project';
import { createStoryboardFromTemplate } from './templates';
import type { Storyboard, StoryboardFrame } from './schema';

function makeFrame(
  id: string,
  type: StoryboardFrame['type'],
  content: StoryboardFrame['content'] = {},
): StoryboardFrame {
  return {
    id,
    type,
    title: `Frame ${id}`,
    summary: `Summary for ${id}`,
    position: { x: 0, y: 0 },
    size: { width: 180, height: 140 },
    content,
    annotations: [],
  };
}

function makeBoard(frames: StoryboardFrame[]): Storyboard {
  return { id: 'board-1', title: 'Test Board', frames, connections: [] };
}

describe('compileHandoffToWorldForgePack (F-b82a6045)', () => {
  it('compiles a quest_branch handoff into adapter-owned pack layout', () => {
    const board = createStoryboardFromTemplate('quest_branch', {
      id: 'archive',
      title: 'The Archive Window',
    });
    const pack = compileHandoffToWorldForgePack(generateHandoff(board));
    expect(pack.format).toBe(WORLD_FORGE_PACK_FORMAT);
    expect(pack.version).toBe(WORLD_FORGE_PACK_VERSION);
    expect(pack.source.kind).toBe('quest');
    expect(pack.quest.id).toBe('archive');
    expect(pack.quest.beatOrder).toHaveLength(board.frames.length);
    expect(Object.keys(pack.nodes)).toHaveLength(board.frames.length);
    const decision = pack.nodes['archive-decision-point'];
    expect(decision.type).toBe('choice');
    expect(decision.branches.length).toBeGreaterThanOrEqual(3);
    expect(pack.combat).toEqual({});
    expect(pack.quest).not.toHaveProperty('parentFrameId');
    expect(JSON.stringify(pack)).not.toContain('parentFrameId');
  });

  it('puts combatSpec into pack.combat, not onto node layout', () => {
    const board = makeBoard([
      makeFrame('enc-1', 'encounter', {
        combatSpec: {
          anticipation: 'Wind up',
          ability: { id: 'res://abilities/cleave.tres', ap: 3 },
        },
      }),
    ]);
    const pack = compileHandoffToWorldForgePack(generateHandoff(board));
    expect(pack.nodes['enc-1']).not.toHaveProperty('combatSpec');
    expect(pack.combat['enc-1']).toEqual({
      beatId: 'enc-1',
      anticipation: 'Wind up',
      ability: { resourceId: 'res://abilities/cleave.tres', ap: 3 },
    });
  });

  it('accepts a schema-valid ProjectHandoff', () => {
    let project = createProject({ title: 'P', templateId: 'quest_flow' });
    const encounter = project.storyboard.frames.find(f => f.type === 'encounter')!;
    project = updateFrameContent(project, encounter.id, {
      combatSpec: { recovery: 'Step back' },
    });
    const pack = compileHandoffToWorldForgePack(generateProjectHandoff(project));
    expect(pack.source.kind).toBe('project');
    expect(pack.source.projectId).toBe(project.id);
    expect(pack.combat[encounter.id]?.recovery).toBe('Step back');
  });

  it('throws on schema-invalid JSON', () => {
    expect(() => compileHandoffToWorldForgePack({ format: 'world-forge-pack' })).toThrow(
      HandoffEnvelopeError,
    );
  });

  it('does not export a reverse-import', async () => {
    const mod = await import('./worldForge');
    expect(mod).not.toHaveProperty('importWorldForgePack');
    expect(mod).not.toHaveProperty('packToStoryboard');
  });
});
