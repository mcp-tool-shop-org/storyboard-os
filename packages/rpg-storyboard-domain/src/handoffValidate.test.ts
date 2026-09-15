// ─── handoffValidate.test.ts ─────────────────────────────────────────────────
//
// F-24fbdeab: published JSON Schema 2020-12 for QuestHandoff / ProjectHandoff.
// F-8632ec47: validateHandoff / validateProjectHandoff fail closed on envelope
// errors; content issues are attached; Markdown stays independent.
// T2 conformance: generateHandoff from each gold template must pass.
//
// ─────────────────────────────────────────────────────────────────────────────

import { describe, it, expect } from 'vitest';
import { generateHandoff, generateMarkdown, generateProjectHandoff } from './handoff';
import {
  QUEST_HANDOFF_SCHEMA_ID,
  PROJECT_HANDOFF_SCHEMA_ID,
  validateHandoff,
  validateProjectHandoff,
  serializeHandoffJson,
  serializeProjectHandoffJson,
  HandoffEnvelopeError,
  questHandoffSchemaDocument,
  projectHandoffSchemaDocument,
} from './handoffValidate';
import { createStoryboardFromTemplate } from './templates';
import { createProject } from './project';
import { tollhouseLedgerProject } from './demo-project';
import type { Storyboard, StoryboardFrame } from './schema';
import type { StoryboardConnection } from '@storyboard-os/core';

function makeFrame(
  id: string,
  type: StoryboardFrame['type'],
  content: StoryboardFrame['content'] = {},
  title = `Frame ${id}`,
): StoryboardFrame {
  return {
    id,
    type,
    title,
    summary: `Summary for ${id}`,
    position: { x: 0, y: 0 },
    size: { width: 180, height: 140 },
    content,
    annotations: [],
  };
}

function makeConn(
  from: string,
  to: string,
  type = 'sequence',
  label = `${from} → ${to}`,
): StoryboardConnection {
  return { id: `${from}->${to}`, fromFrameId: from, toFrameId: to, type: type as never, label };
}

function makeBoard(frames: StoryboardFrame[], connections: StoryboardConnection[] = []): Storyboard {
  return { id: 'board-1', title: 'Test Board', frames, connections };
}

const TEMPLATE_IDS = ['quest_flow', 'quest_branch', 'cutscene_beat'] as const;
const C4_FIELDS = [
  'entryConditions',
  'stateChanges',
  'requiredAssets',
  'testCriteria',
  'implementationChecklist',
] as const;

// ─── Published schema files ───────────────────────────────────────────────────

describe('published JSON Schema 2020-12 (F-24fbdeab)', () => {
  it('quest-handoff.json declares draft 2020-12 and the stamped $id', () => {
    expect(questHandoffSchemaDocument.$schema).toBe('https://json-schema.org/draft/2020-12/schema');
    expect(questHandoffSchemaDocument.$id).toBe(QUEST_HANDOFF_SCHEMA_ID);
    expect(questHandoffSchemaDocument.title).toBe('QuestHandoff');
  });

  it('project-handoff.json declares draft 2020-12 and the stamped $id', () => {
    expect(projectHandoffSchemaDocument.$schema).toBe('https://json-schema.org/draft/2020-12/schema');
    expect(projectHandoffSchemaDocument.$id).toBe(PROJECT_HANDOFF_SCHEMA_ID);
    expect(projectHandoffSchemaDocument.title).toBe('ProjectHandoff');
  });

  it('both schemas name the C4 HandoffBeat fields', () => {
    const questBeat = (questHandoffSchemaDocument as { $defs: { handoffBeat: { properties: Record<string, unknown> } } })
      .$defs.handoffBeat.properties;
    const projectBeat = (projectHandoffSchemaDocument as { $defs: { projectHandoffBeat: { properties: Record<string, unknown> } } })
      .$defs.projectHandoffBeat.properties;
    for (const field of C4_FIELDS) {
      expect(questBeat[field], `quest missing ${field}`).toBeDefined();
      expect(projectBeat[field], `project missing ${field}`).toBeDefined();
    }
  });

  it('schemas are JSON object envelopes (not an engine-native resource format)', () => {
    expect(questHandoffSchemaDocument.type).toBe('object');
    expect(projectHandoffSchemaDocument.type).toBe('object');
    expect(questHandoffSchemaDocument.$schema).toContain('json-schema.org/draft/2020-12');
    expect(JSON.stringify(questHandoffSchemaDocument)).not.toMatch(/res:\/\//);
    expect(JSON.stringify(projectHandoffSchemaDocument)).not.toMatch(/res:\/\//);
  });

  it('keeps formatVersion as a required const 1', () => {
    const questFmt = (questHandoffSchemaDocument as { properties: { formatVersion: { const: number } } }).properties.formatVersion;
    const projectFmt = (projectHandoffSchemaDocument as { properties: { formatVersion: { const: number } } }).properties.formatVersion;
    expect(questFmt.const).toBe(1);
    expect(projectFmt.const).toBe(1);
  });

  it('names optional combatSpec on beats (F-39baa660) without requiring it', () => {
    const questBeat = (questHandoffSchemaDocument as { $defs: { handoffBeat: { required: string[]; properties: Record<string, unknown> } } })
      .$defs.handoffBeat;
    const projectBeat = (projectHandoffSchemaDocument as { $defs: { projectHandoffBeat: { required: string[]; properties: Record<string, unknown> } } })
      .$defs.projectHandoffBeat;
    expect(questBeat.properties.combatSpec).toBeDefined();
    expect(projectBeat.properties.combatSpec).toBeDefined();
    expect(questBeat.required).not.toContain('combatSpec');
    expect(projectBeat.required).not.toContain('combatSpec');
  });
});

// ─── Envelope fail-closed ─────────────────────────────────────────────────────

describe('validateHandoff — envelope (F-8632ec47)', () => {
  it('accepts a generated empty board (valid envelope, empty beats)', () => {
    const result = validateHandoff(generateHandoff(makeBoard([])));
    expect(result.valid).toBe(true);
    expect(result.issues.filter(i => i.severity === 'envelope')).toHaveLength(0);
  });

  it('fails closed when formatVersion is missing', () => {
    const handoff = generateHandoff(makeBoard([]));
    const { formatVersion: _drop, ...rest } = handoff;
    void _drop;
    const result = validateHandoff(rest);
    expect(result.valid).toBe(false);
    expect(result.issues.some(i => i.code === 'REQUIRED' && i.path.includes('formatVersion'))).toBe(true);
  });

  it('fails closed when formatVersion is not 1', () => {
    const handoff = { ...generateHandoff(makeBoard([])), formatVersion: 2 };
    const result = validateHandoff(handoff);
    expect(result.valid).toBe(false);
    expect(result.issues.some(i => i.code === 'CONST')).toBe(true);
  });

  it('fails closed when $schema is stripped', () => {
    const handoff = generateHandoff(makeBoard([]));
    const { $schema: _drop, ...rest } = handoff;
    void _drop;
    const result = validateHandoff(rest);
    expect(result.valid).toBe(false);
    expect(result.issues.some(i => i.path.includes('$schema'))).toBe(true);
  });

  it('fails closed when beats is not an array', () => {
    const handoff = { ...generateHandoff(makeBoard([])), beats: {} };
    const result = validateHandoff(handoff);
    expect(result.valid).toBe(false);
    expect(result.issues.some(i => i.path === '/beats' && i.code === 'TYPE')).toBe(true);
  });

  it('fails closed when implementationChecklist is not an array', () => {
    const handoff = JSON.parse(JSON.stringify(generateHandoff(makeBoard([makeFrame('a', 'scene')])))) as Record<string, unknown>;
    const beats = handoff.beats as Array<Record<string, unknown>>;
    beats[0].implementationChecklist = 'Wire the trigger';
    const result = validateHandoff(handoff);
    expect(result.valid).toBe(false);
    expect(result.issues.some(i => i.path.includes('implementationChecklist') && i.code === 'TYPE')).toBe(true);
  });

  it('fails closed on additional top-level properties', () => {
    const handoff = { ...generateHandoff(makeBoard([])), tresPayload: 'res://quest.tres' };
    const result = validateHandoff(handoff);
    expect(result.valid).toBe(false);
    expect(result.issues.some(i => i.code === 'ADDITIONAL')).toBe(true);
  });

  it('accepts an empty combatSpec object on an encounter beat', () => {
    const handoff = generateHandoff(makeBoard([makeFrame('enc', 'encounter', { combatSpec: {} })]));
    const result = validateHandoff(handoff);
    expect(result.valid).toBe(true);
    expect(handoff.beats[0].combatSpec).toEqual({});
  });
});

describe('validateHandoff — content issues do not fail the envelope', () => {
  it('attaches field-level issues for empty C4 array items', () => {
    const handoff = JSON.parse(JSON.stringify(generateHandoff(makeBoard([makeFrame('a', 'scene')])))) as Record<string, unknown>;
    const beats = handoff.beats as Array<Record<string, unknown>>;
    beats[0].requiredAssets = [''];
    const result = validateHandoff(handoff);
    expect(result.valid).toBe(true);
    expect(result.issues.some(i => i.severity === 'content' && i.code === 'EMPTY_C4_ITEM')).toBe(true);
    expect(result.issues.some(i => i.path.includes('requiredAssets'))).toBe(true);
  });
});

describe('validateProjectHandoff — envelope', () => {
  it('accepts a generated project from quest_flow', () => {
    const p = createProject({ title: 'T', templateId: 'quest_flow' });
    const result = validateProjectHandoff(generateProjectHandoff(p));
    expect(result.valid).toBe(true);
  });

  it('fails closed when progress is missing', () => {
    const p = createProject({ title: 'T', templateId: 'quest_flow' });
    const { progress: _drop, ...rest } = generateProjectHandoff(p);
    void _drop;
    const result = validateProjectHandoff(rest);
    expect(result.valid).toBe(false);
    expect(result.issues.some(i => i.path.includes('progress') && i.code === 'REQUIRED')).toBe(true);
  });

  it('fails closed when checklistProgress is not an array', () => {
    const p = createProject({ title: 'T', templateId: 'quest_flow' });
    const handoff = JSON.parse(JSON.stringify(generateProjectHandoff(p))) as Record<string, unknown>;
    const beats = handoff.beats as Array<Record<string, unknown>>;
    beats[0].checklistProgress = 'done';
    const result = validateProjectHandoff(handoff);
    expect(result.valid).toBe(false);
    expect(result.issues.some(i => i.path.includes('checklistProgress') && i.code === 'TYPE')).toBe(true);
  });
});

// ─── serialize fail-closed ────────────────────────────────────────────────────

describe('serializeHandoffJson / serializeProjectHandoffJson', () => {
  it('returns pretty JSON for a valid quest handoff', () => {
    const json = serializeHandoffJson(generateHandoff(makeBoard([])));
    const parsed = JSON.parse(json) as { $schema: string; formatVersion: number };
    expect(parsed.$schema).toBe(QUEST_HANDOFF_SCHEMA_ID);
    expect(parsed.formatVersion).toBe(1);
  });

  it('throws HandoffEnvelopeError instead of emitting invalid JSON', () => {
    const handoff = generateHandoff(makeBoard([]));
    const { $schema: _drop, ...rest } = handoff;
    void _drop;
    expect(() => serializeHandoffJson(rest)).toThrow(HandoffEnvelopeError);
  });

  it('throws HandoffEnvelopeError for an invalid project envelope', () => {
    const p = createProject({ title: 'T', templateId: 'quest_branch' });
    const { projectId: _drop, ...rest } = generateProjectHandoff(p);
    void _drop;
    expect(() => serializeProjectHandoffJson(rest)).toThrow(HandoffEnvelopeError);
  });
});

// ─── Markdown stays independent ───────────────────────────────────────────────

describe('generateMarkdown is independent of schema validation', () => {
  it('still renders when $schema is stripped from a generated handoff', () => {
    const handoff = generateHandoff(makeBoard([makeFrame('a', 'hook', {}, 'Opening Hook')]));
    const { $schema: _drop, ...rest } = handoff;
    void _drop;
    expect(() => generateMarkdown(rest as never)).not.toThrow();
    expect(generateMarkdown(rest as never)).toContain('Opening Hook');
  });

  it('still renders when formatVersion is wrong', () => {
    const handoff = { ...generateHandoff(makeBoard([makeFrame('a', 'scene')])), formatVersion: 99 as never };
    expect(() => generateMarkdown(handoff)).not.toThrow();
    expect(generateMarkdown(handoff)).toContain('Test Board');
  });
});

// ─── Template conformance (T2) ────────────────────────────────────────────────

describe('template handoff conformance', () => {
  for (const tid of TEMPLATE_IDS) {
    it(`generateHandoff(${tid}) passes validateHandoff`, () => {
      const sb = createStoryboardFromTemplate(tid, {
        id: `conformance-${tid}`,
        title: `${tid} gold`,
        description: 'Conformance fixture',
      });
      const handoff = generateHandoff(sb);
      const result = validateHandoff(handoff);
      expect(result.valid, result.issues.map(i => `${i.path} ${i.code} ${i.message}`).join('\n')).toBe(true);
      expect(handoff.$schema).toBe(QUEST_HANDOFF_SCHEMA_ID);
      expect(handoff.formatVersion).toBe(1);
      expect(handoff.beats.length).toBe(sb.frames.length);
    });

    it(`generateHandoff(${tid}) has no empty C4 content items`, () => {
      const sb = createStoryboardFromTemplate(tid, { id: `c4-${tid}`, title: tid });
      const result = validateHandoff(generateHandoff(sb));
      expect(result.issues.filter(i => i.severity === 'content')).toHaveLength(0);
    });

    it(`generateProjectHandoff(${tid}) passes validateProjectHandoff`, () => {
      const p = createProject({ title: `${tid} project`, templateId: tid });
      const handoff = generateProjectHandoff(p);
      const result = validateProjectHandoff(handoff);
      expect(result.valid, result.issues.map(i => `${i.path} ${i.code} ${i.message}`).join('\n')).toBe(true);
      expect(handoff.$schema).toBe(PROJECT_HANDOFF_SCHEMA_ID);
      expect(serializeProjectHandoffJson(handoff)).toContain(PROJECT_HANDOFF_SCHEMA_ID);
    });
  }

  it('tollhouse ledger demo generateHandoff passes validation', () => {
    const storyboard = tollhouseLedgerProject.storyboards[0];
    const result = validateHandoff(generateHandoff(storyboard));
    expect(result.valid, result.issues.map(i => `${i.path} ${i.code} ${i.message}`).join('\n')).toBe(true);
  });
});

describe('generateHandoff invokes validation (fail closed on broken connections)', () => {
  it('throws HandoffEnvelopeError when a branch type is not in the schema enum', () => {
    const board = makeBoard(
      [makeFrame('a', 'hook'), makeFrame('b', 'scene')],
      [makeConn('a', 'b', 'not_a_type')],
    );
    expect(() => generateHandoff(board)).toThrow(HandoffEnvelopeError);
  });
});
