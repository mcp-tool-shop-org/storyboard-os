// ─── compileTres.test.ts ─────────────────────────────────────────────────────
//
// F-06b6d0b3: compileHandoffToTres runs only on schema-valid JSON. One-way
// Godot Resource text. No round-trip parser. No localStorage of .tres.
//
// ─────────────────────────────────────────────────────────────────────────────

import { describe, it, expect } from 'vitest';
import { compileHandoffToTres } from './compileTres';
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

describe('compileHandoffToTres (F-06b6d0b3)', () => {
  it('emits Godot Resource text for encounter combatSpec + ability Resource id/AP', () => {
    const board = makeBoard([
      makeFrame('enc-1', 'encounter', {
        designerNotes: 'Fight',
        combatSpec: {
          anticipation: 'Raise the blade',
          hit: 'Connect',
          followThrough: 'Weight shifts',
          recovery: 'Guard up',
          ability: { id: 'res://abilities/slash.tres', ap: 2 },
        },
      }),
    ]);
    const tres = compileHandoffToTres(generateHandoff(board));
    expect(tres).toContain('[gd_resource type="Resource" script_class="QuestCombatPack"');
    expect(tres).toContain('format=3');
    expect(tres).toContain('anticipation = "Raise the blade"');
    expect(tres).toContain('hit = "Connect"');
    expect(tres).toContain('follow_through = "Weight shifts"');
    expect(tres).toContain('recovery = "Guard up"');
    expect(tres).toContain('id = "res://abilities/slash.tres"');
    expect(tres).toContain('ap = 2');
    expect(tres).toContain('beat_id = "enc-1"');
    expect(tres).toContain('One-way compile');
    expect(tres).toContain('Do not store in localStorage');
  });

  it('emits an empty encounters array when no combatSpec is attached', () => {
    const board = createStoryboardFromTemplate('quest_flow', {
      id: 'q',
      title: 'Tollhouse',
    });
    const tres = compileHandoffToTres(generateHandoff(board));
    expect(tres).toContain('encounters = []');
    expect(tres).toContain('quest_id = "q"');
  });

  it('compiles an empty combatSpec on an encounter as a valid empty resource', () => {
    const board = makeBoard([
      makeFrame('enc-empty', 'encounter', { combatSpec: {} }),
    ]);
    const tres = compileHandoffToTres(generateHandoff(board));
    expect(tres).toContain('beat_id = "enc-empty"');
    expect(tres).toContain('empty = true');
  });

  it('accepts a schema-valid ProjectHandoff', () => {
    let project = createProject({ title: 'P', templateId: 'quest_flow' });
    const encounter = project.storyboard.frames.find(f => f.type === 'encounter')!;
    project = updateFrameContent(project, encounter.id, {
      combatSpec: {
        hit: 'Shield bash',
        ability: { id: 'bash', ap: 1 },
      },
    });
    const tres = compileHandoffToTres(generateProjectHandoff(project));
    expect(tres).toContain('hit = "Shield bash"');
    expect(tres).toContain(`quest_id = "${project.id}"`);
  });

  it('throws on schema-invalid JSON and does not emit .tres', () => {
    expect(() => compileHandoffToTres({ not: 'a handoff' })).toThrow(HandoffEnvelopeError);
  });

  it('does not export a reverse parser — compile is one-way', async () => {
    const mod = await import('./compileTres');
    expect(Object.keys(mod)).toEqual(['compileHandoffToTres']);
  });
});
