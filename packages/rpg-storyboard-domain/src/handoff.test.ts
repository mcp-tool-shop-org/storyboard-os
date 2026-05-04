// ─── handoff.test.ts ─────────────────────────────────────────────────────────
//
// Tests for the RPG quest handoff generator.
// generateHandoff() builds a production implementation artifact from a
// Storyboard. generateMarkdown() renders that artifact as a handoff document.
//
// ─────────────────────────────────────────────────────────────────────────────

import { describe, it, expect } from 'vitest';
import { generateHandoff, generateMarkdown, generateProjectHandoff, generateProjectMarkdown } from './handoff';
import type { Storyboard, StoryboardFrame } from './schema';
import type { StoryboardConnection } from '@storyboard-os/core';
import { tollhouseLedgerProject } from './demo-project';
import {
  createProject,
  updateFrameBasics,
  updateFrameContent,
  setChecklistItemComplete,
  setTestCriterionComplete,
} from './project';

// ─── Fixture helpers ──────────────────────────────────────────────────────────

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
  return { id: `${from}->${to}`, fromFrameId: from, toFrameId: to, type: type as any, label };
}

function makeBoard(frames: StoryboardFrame[], connections: StoryboardConnection[] = []): Storyboard {
  return { id: 'board-1', title: 'Test Board', frames, connections };
}

// ─── generateHandoff — metadata ───────────────────────────────────────────────

describe('generateHandoff — metadata', () => {
  it('carries the storyboard id and title', () => {
    const board = makeBoard([], []);
    board.id = 'quest-01';
    board.title = 'The Tollhouse Ledger';
    const handoff = generateHandoff(board);
    expect(handoff.id).toBe('quest-01');
    expect(handoff.title).toBe('The Tollhouse Ledger');
  });

  it('carries the storyboard description when present', () => {
    const board = makeBoard([], []);
    board.description = 'A short quest about a dangerous ledger.';
    const handoff = generateHandoff(board);
    expect(handoff.description).toBe('A short quest about a dangerous ledger.');
  });

  it('generatedAt is a non-empty ISO date string', () => {
    const handoff = generateHandoff(makeBoard([]));
    expect(handoff.generatedAt).toBeTruthy();
    expect(() => new Date(handoff.generatedAt)).not.toThrow();
    expect(new Date(handoff.generatedAt).toISOString()).toBe(handoff.generatedAt);
  });
});

// ─── generateHandoff — beat content ──────────────────────────────────────────

describe('generateHandoff — beat content', () => {
  it('includes every frame as a beat', () => {
    const frames = [makeFrame('a', 'hook'), makeFrame('b', 'scene'), makeFrame('c', 'consequence')];
    const handoff = generateHandoff(makeBoard(frames));
    expect(handoff.beats).toHaveLength(3);
    const ids = handoff.beats.map(b => b.id);
    expect(ids).toContain('a');
    expect(ids).toContain('b');
    expect(ids).toContain('c');
  });

  it('maps content array fields as arrays (never undefined)', () => {
    const frame = makeFrame('a', 'scene', {});
    const handoff = generateHandoff(makeBoard([frame]));
    const beat = handoff.beats[0];
    expect(Array.isArray(beat.entryConditions)).toBe(true);
    expect(Array.isArray(beat.exitConditions)).toBe(true);
    expect(Array.isArray(beat.stateChanges)).toBe(true);
    expect(Array.isArray(beat.requiredAssets)).toBe(true);
    expect(Array.isArray(beat.implementationChecklist)).toBe(true);
    expect(Array.isArray(beat.testCriteria)).toBe(true);
    expect(Array.isArray(beat.involvedCharacters)).toBe(true);
    expect(Array.isArray(beat.involvedFactions)).toBe(true);
    expect(Array.isArray(beat.possibleOutcomes)).toBe(true);
  });

  it('populates content fields from frame content', () => {
    const frame = makeFrame('a', 'choice', {
      designerNotes: 'Choose your allegiance.',
      playerVisibleText: 'Who do you trust?',
      stakes: 'Everything changes.',
      entryConditions: ['keeper_met = true'],
      exitConditions: ['faction_chosen = true'],
      stateChanges: ['faction = guild'],
      requiredAssets: ['portrait_guild.png'],
      implementationChecklist: ['Wire choice UI'],
      testCriteria: ['Flag sets on confirm'],
      involvedCharacters: ['Orvyn'],
      involvedFactions: ['Guild'],
      possibleOutcomes: ['Guild outcome', 'Other outcome'],
    });
    const beat = generateHandoff(makeBoard([frame])).beats[0];

    expect(beat.designerNotes).toBe('Choose your allegiance.');
    expect(beat.playerVisibleText).toBe('Who do you trust?');
    expect(beat.stakes).toBe('Everything changes.');
    expect(beat.entryConditions).toEqual(['keeper_met = true']);
    expect(beat.exitConditions).toEqual(['faction_chosen = true']);
    expect(beat.stateChanges).toEqual(['faction = guild']);
    expect(beat.requiredAssets).toEqual(['portrait_guild.png']);
    expect(beat.implementationChecklist).toEqual(['Wire choice UI']);
    expect(beat.testCriteria).toEqual(['Flag sets on confirm']);
    expect(beat.involvedCharacters).toEqual(['Orvyn']);
    expect(beat.involvedFactions).toEqual(['Guild']);
    expect(beat.possibleOutcomes).toEqual(['Guild outcome', 'Other outcome']);
  });

  it('beat type and status reflect the domain frame', () => {
    const frame = makeFrame('a', 'consequence', { designerNotes: 'Notes.' });
    // consequence without stateChanges → blocked
    const beat = generateHandoff(makeBoard([frame])).beats[0];
    expect(beat.type).toBe('consequence');
    expect(beat.status).toBe('blocked');
  });

  it('beat missing array reflects getBeatStatus missing', () => {
    const frame = makeFrame('a', 'choice', { designerNotes: 'Notes.' });
    const beat = generateHandoff(makeBoard([frame])).beats[0];
    expect(beat.missing).toContain('no_state_changes');
  });
});

// ─── generateHandoff — outgoing branches ─────────────────────────────────────

describe('generateHandoff — outgoing branches', () => {
  it('a frame with no outgoing connections has an empty outgoingBranches array', () => {
    const board = makeBoard([makeFrame('a', 'hook'), makeFrame('b', 'scene')], []);
    const beatA = generateHandoff(board).beats.find(b => b.id === 'a')!;
    expect(beatA.outgoingBranches).toHaveLength(0);
  });

  it('a frame with one outgoing connection has one branch', () => {
    const board = makeBoard(
      [makeFrame('a', 'hook'), makeFrame('b', 'scene')],
      [makeConn('a', 'b', 'sequence', 'enter scene')],
    );
    const beatA = generateHandoff(board).beats.find(b => b.id === 'a')!;
    expect(beatA.outgoingBranches).toHaveLength(1);
    expect(beatA.outgoingBranches[0].toId).toBe('b');
    expect(beatA.outgoingBranches[0].toTitle).toBe('Frame b');
    expect(beatA.outgoingBranches[0].type).toBe('sequence');
    expect(beatA.outgoingBranches[0].label).toBe('enter scene');
  });

  it('a branching frame has all outgoing branches listed', () => {
    const board = makeBoard(
      [makeFrame('reveal', 'reveal'), makeFrame('expose', 'consequence'), makeFrame('hide', 'consequence')],
      [
        makeConn('reveal', 'expose', 'consequence', 'expose it →'),
        makeConn('reveal', 'hide',   'consequence', 'bury it →'),
      ],
    );
    const revealBeat = generateHandoff(board).beats.find(b => b.id === 'reveal')!;
    expect(revealBeat.outgoingBranches).toHaveLength(2);
    const toIds = revealBeat.outgoingBranches.map(b => b.toId);
    expect(toIds).toContain('expose');
    expect(toIds).toContain('hide');
  });

  it('connections referencing frames not in the storyboard are ignored', () => {
    const board = makeBoard(
      [makeFrame('a', 'hook')],
      [makeConn('a', 'ghost', 'sequence')], // 'ghost' not in frames
    );
    const beatA = generateHandoff(board).beats.find(b => b.id === 'a')!;
    expect(beatA.outgoingBranches).toHaveLength(0);
  });
});

// ─── generateHandoff — incomingFrom ──────────────────────────────────────────

describe('generateHandoff — incomingFromIds', () => {
  it('a frame with no incoming connections has an empty incomingFromIds array', () => {
    const board = makeBoard([makeFrame('a', 'hook')], []);
    const beatA = generateHandoff(board).beats[0];
    expect(beatA.incomingFromIds).toHaveLength(0);
  });

  it('a frame with one incoming connection has one entry', () => {
    const board = makeBoard(
      [makeFrame('a', 'hook'), makeFrame('b', 'scene')],
      [makeConn('a', 'b')],
    );
    const beatB = generateHandoff(board).beats.find(b => b.id === 'b')!;
    expect(beatB.incomingFromIds).toHaveLength(1);
    expect(beatB.incomingFromIds[0]).toBe('a');
  });

  it('a convergence frame lists all incoming frames', () => {
    const board = makeBoard(
      [makeFrame('a', 'choice'), makeFrame('b', 'scene'), makeFrame('c', 'scene'), makeFrame('d', 'consequence')],
      [makeConn('b', 'd'), makeConn('c', 'd')],
    );
    const beatD = generateHandoff(board).beats.find(b => b.id === 'd')!;
    expect(beatD.incomingFromIds).toHaveLength(2);
    expect(beatD.incomingFromIds).toContain('b');
    expect(beatD.incomingFromIds).toContain('c');
  });
});

// ─── generateHandoff — readiness summary ─────────────────────────────────────

describe('generateHandoff — readiness summary', () => {
  it('readiness counts sum to total', () => {
    const frames = [
      makeFrame('f1', 'scene', { designerNotes: 'D', requiredAssets: ['a'], testCriteria: ['t'], implementationChecklist: ['c'] }),
      makeFrame('f2', 'scene', { designerNotes: 'D' }),
      makeFrame('f3', 'scene', {}),
      makeFrame('f4', 'choice', { designerNotes: 'D' }), // blocked
    ];
    const { readiness } = generateHandoff(makeBoard(frames));
    expect(readiness.total).toBe(4);
    expect(readiness.ready + readiness.partial + readiness.draft + readiness.blocked).toBe(4);
    expect(readiness.ready).toBe(1);
    expect(readiness.partial).toBe(1);
    expect(readiness.draft).toBe(1);
    expect(readiness.blocked).toBe(1);
  });

  it('readyFraction is correct', () => {
    const frames = [
      makeFrame('f1', 'scene', { designerNotes: 'D', requiredAssets: ['a'], testCriteria: ['t'], implementationChecklist: ['c'] }),
      makeFrame('f2', 'scene', {}),
    ];
    const { readiness } = generateHandoff(makeBoard(frames));
    expect(readiness.readyFraction).toBe(0.5);
  });

  it('empty storyboard has zero readiness values', () => {
    const { readiness } = generateHandoff(makeBoard([]));
    expect(readiness.total).toBe(0);
    expect(readiness.readyFraction).toBe(0);
  });
});

// ─── generateHandoff — blocked/partial lists ──────────────────────────────────

describe('generateHandoff — blockedBeatIds / partialBeatIds', () => {
  it('blockedBeatIds contains ids of blocked frames', () => {
    const frames = [
      makeFrame('blocked-1', 'choice', { designerNotes: 'Notes.' }),
      makeFrame('blocked-2', 'consequence', { designerNotes: 'Notes.' }),
      makeFrame('ok', 'scene', {}),
    ];
    const { blockedBeatIds } = generateHandoff(makeBoard(frames));
    expect(blockedBeatIds).toContain('blocked-1');
    expect(blockedBeatIds).toContain('blocked-2');
    expect(blockedBeatIds).not.toContain('ok');
  });

  it('partialBeatIds contains ids of partial frames', () => {
    const frames = [
      makeFrame('p', 'scene', { designerNotes: 'Notes.' }),
      makeFrame('r', 'scene', { designerNotes: 'D', requiredAssets: ['a'], testCriteria: ['t'], implementationChecklist: ['c'] }),
    ];
    const { partialBeatIds } = generateHandoff(makeBoard(frames));
    expect(partialBeatIds).toContain('p');
    expect(partialBeatIds).not.toContain('r');
  });

  it('empty lists when no blocked or partial frames', () => {
    const frames = [
      makeFrame('a', 'scene', { designerNotes: 'D', requiredAssets: ['x'], testCriteria: ['t'], implementationChecklist: ['c'] }),
    ];
    const { blockedBeatIds, partialBeatIds } = generateHandoff(makeBoard(frames));
    expect(blockedBeatIds).toHaveLength(0);
    expect(partialBeatIds).toHaveLength(0);
  });
});

// ─── generateHandoff — topological ordering ───────────────────────────────────

describe('generateHandoff — topological beat ordering', () => {
  it('single frame returns single beat', () => {
    const board = makeBoard([makeFrame('a', 'hook')]);
    expect(generateHandoff(board).beats).toHaveLength(1);
    expect(generateHandoff(board).beats[0].id).toBe('a');
  });

  it('linear sequence A → B → C produces correct order', () => {
    const board = makeBoard(
      [makeFrame('a', 'hook'), makeFrame('b', 'scene'), makeFrame('c', 'consequence')],
      [makeConn('a', 'b'), makeConn('b', 'c')],
    );
    const ids = generateHandoff(board).beats.map(b => b.id);
    expect(ids.indexOf('a')).toBeLessThan(ids.indexOf('b'));
    expect(ids.indexOf('b')).toBeLessThan(ids.indexOf('c'));
  });

  it('branch A → B, A → C places A before B and C', () => {
    const board = makeBoard(
      [makeFrame('a', 'choice'), makeFrame('b', 'consequence'), makeFrame('c', 'consequence')],
      [makeConn('a', 'b', 'choice'), makeConn('a', 'c', 'choice')],
    );
    const ids = generateHandoff(board).beats.map(b => b.id);
    expect(ids.indexOf('a')).toBeLessThan(ids.indexOf('b'));
    expect(ids.indexOf('a')).toBeLessThan(ids.indexOf('c'));
  });

  it('diamond A → B, A → C, B → D, C → D places A first and D last', () => {
    const board = makeBoard(
      [makeFrame('a', 'choice'), makeFrame('b', 'scene'), makeFrame('c', 'scene'), makeFrame('d', 'consequence')],
      [makeConn('a', 'b'), makeConn('a', 'c'), makeConn('b', 'd'), makeConn('c', 'd')],
    );
    const ids = generateHandoff(board).beats.map(b => b.id);
    expect(ids.indexOf('a')).toBeLessThan(ids.indexOf('d'));
    expect(ids.indexOf('b')).toBeLessThan(ids.indexOf('d'));
    expect(ids.indexOf('c')).toBeLessThan(ids.indexOf('d'));
    expect(ids).toHaveLength(4);
  });

  it('all frames appear in output even if disconnected', () => {
    const board = makeBoard(
      [makeFrame('a', 'hook'), makeFrame('b', 'hook'), makeFrame('c', 'hook')],
      [], // no connections
    );
    const ids = generateHandoff(board).beats.map(b => b.id);
    expect(ids).toHaveLength(3);
    expect(ids).toContain('a');
    expect(ids).toContain('b');
    expect(ids).toContain('c');
  });

  it('cycle does not crash — all frames appear in output', () => {
    const board = makeBoard(
      [makeFrame('a', 'hook'), makeFrame('b', 'scene'), makeFrame('c', 'scene')],
      [makeConn('a', 'b'), makeConn('b', 'c'), makeConn('c', 'a')],
    );
    const ids = generateHandoff(board).beats.map(b => b.id);
    expect(ids).toHaveLength(3);
    expect(ids).toContain('a');
    expect(ids).toContain('b');
    expect(ids).toContain('c');
  });

  it('empty storyboard returns empty beats array', () => {
    expect(generateHandoff(makeBoard([])).beats).toHaveLength(0);
  });
});

// ─── generateMarkdown ─────────────────────────────────────────────────────────

describe('generateMarkdown', () => {
  it('contains the quest title', () => {
    const board = makeBoard([makeFrame('a', 'hook')]);
    board.title = 'The Tollhouse Ledger';
    const md = generateMarkdown(generateHandoff(board));
    expect(md).toContain('The Tollhouse Ledger');
  });

  it('contains each beat title', () => {
    const board = makeBoard([
      makeFrame('a', 'hook', {}, 'Opening Hook'),
      makeFrame('b', 'scene', {}, 'The Road'),
    ]);
    const md = generateMarkdown(generateHandoff(board));
    expect(md).toContain('Opening Hook');
    expect(md).toContain('The Road');
  });

  it('includes readiness summary numbers', () => {
    const frames = [
      makeFrame('f1', 'scene', { designerNotes: 'D', requiredAssets: ['a'], testCriteria: ['t'], implementationChecklist: ['c'] }),
      makeFrame('f2', 'scene', {}),
    ];
    const board = makeBoard(frames);
    const md = generateMarkdown(generateHandoff(board));
    expect(md).toContain('1');  // at least '1' ready or '1' draft appears
    expect(md).toContain('2');  // 2 total
  });

  it('formats implementationChecklist as markdown checkboxes', () => {
    const frame = makeFrame('a', 'scene', {
      implementationChecklist: ['Place scene trigger', 'Wire ambient audio'],
    });
    const md = generateMarkdown(generateHandoff(makeBoard([frame])));
    expect(md).toContain('- [ ] Place scene trigger');
    expect(md).toContain('- [ ] Wire ambient audio');
  });

  it('formats testCriteria as markdown checkboxes', () => {
    const frame = makeFrame('a', 'scene', {
      testCriteria: ['Flag sets after trigger', 'Audio starts correctly'],
    });
    const md = generateMarkdown(generateHandoff(makeBoard([frame])));
    expect(md).toContain('- [ ] Flag sets after trigger');
    expect(md).toContain('- [ ] Audio starts correctly');
  });

  it('includes state changes for stateful beats', () => {
    const frame = makeFrame('a', 'consequence', {
      stateChanges: ['ledger_public = true', 'orvyn_arrested = true'],
    });
    const md = generateMarkdown(generateHandoff(makeBoard([frame])));
    expect(md).toContain('ledger_public = true');
    expect(md).toContain('orvyn_arrested = true');
  });

  it('includes outgoing branches for branching frames', () => {
    const board = makeBoard(
      [makeFrame('reveal', 'reveal', {}, 'What the Ledger Says'),
       makeFrame('expose', 'consequence', {}, 'Ledger Goes Public'),
       makeFrame('hide',   'consequence', {}, 'Ledger Is Hidden')],
      [
        makeConn('reveal', 'expose', 'consequence', 'expose it →'),
        makeConn('reveal', 'hide',   'consequence', 'bury it →'),
      ],
    );
    const md = generateMarkdown(generateHandoff(board));
    expect(md).toContain('Ledger Goes Public');
    expect(md).toContain('Ledger Is Hidden');
    expect(md).toContain('expose it');
  });

  it('includes a blocked beats section when blocked frames exist', () => {
    const frame = makeFrame('a', 'choice', { designerNotes: 'Notes.' });
    const md = generateMarkdown(generateHandoff(makeBoard([frame])));
    expect(md.toLowerCase()).toContain('blocked');
  });

  it('quotes player-visible text as a blockquote', () => {
    const frame = makeFrame('a', 'npc_beat', {
      playerVisibleText: 'The keeper looks at you steadily.',
    });
    const md = generateMarkdown(generateHandoff(makeBoard([frame])));
    expect(md).toContain('> The keeper looks at you steadily.');
  });

  it('omits empty sections — no phantom headings', () => {
    const frame = makeFrame('a', 'hook', {}); // nothing in content
    const md = generateMarkdown(generateHandoff(makeBoard([frame])));
    // Should not have empty checkbox lists or empty asset sections
    expect(md).not.toContain('- [ ] \n');
    expect(md).not.toContain('**Required Assets:**\n\n**');
  });

  it('tollhouse ledger produces a non-empty markdown document', () => {
    const storyboard = tollhouseLedgerProject.storyboards[0];
    const handoff = generateHandoff(storyboard);
    const md = generateMarkdown(handoff);
    expect(md.length).toBeGreaterThan(1000);
    expect(md).toContain('Tollhouse');
    expect(md).toContain('ledger');
  });
});

// ─── generateProjectHandoff — metadata ───────────────────────────────────────

describe('generateProjectHandoff — metadata', () => {
  it('carries projectId, title, createdAt, updatedAt', () => {
    const p = createProject({ title: 'My Quest', templateId: 'quest_flow' });
    const h = generateProjectHandoff(p);
    expect(h.projectId).toBe(p.id);
    expect(h.title).toBe('My Quest');
    expect(h.createdAt).toBe(p.createdAt);
    expect(h.updatedAt).toBe(p.updatedAt);
  });

  it('carries sourceTemplateId', () => {
    const p = createProject({ title: 'T', templateId: 'quest_flow' });
    const h = generateProjectHandoff(p);
    expect(h.sourceTemplateId).toBe('quest_flow');
  });

  it('carries storyboardId', () => {
    const p = createProject({ title: 'T', templateId: 'quest_flow' });
    const h = generateProjectHandoff(p);
    expect(h.storyboardId).toBe(p.storyboard.id);
  });

  it('generatedAt is a valid ISO timestamp', () => {
    const p = createProject({ title: 'T', templateId: 'quest_flow' });
    const h = generateProjectHandoff(p);
    expect(new Date(h.generatedAt).toISOString()).toBe(h.generatedAt);
  });

  it('beats length matches storyboard frame count', () => {
    const p = createProject({ title: 'T', templateId: 'quest_flow' });
    const h = generateProjectHandoff(p);
    expect(h.beats).toHaveLength(p.storyboard.frames.length);
  });
});

// ─── generateProjectHandoff — edited content ─────────────────────────────────

describe('generateProjectHandoff — edited content', () => {
  it('reflects edited designerNotes in the beat', () => {
    const p = createProject({ title: 'T', templateId: 'quest_flow' });
    const fid = p.storyboard.frames[0].id;
    const edited = updateFrameContent(p, fid, { designerNotes: 'Updated notes for handoff' });
    const h = generateProjectHandoff(edited);
    const beat = h.beats.find(b => b.id === fid)!;
    expect(beat.designerNotes).toBe('Updated notes for handoff');
  });

  it('reflects edited title after updateFrameBasics', () => {
    const p = createProject({ title: 'T', templateId: 'quest_flow' });
    const fid = p.storyboard.frames[0].id;
    const edited = updateFrameBasics(p, fid, { title: 'Renamed Beat' });
    const h = generateProjectHandoff(edited);
    const beat = h.beats.find(b => b.id === fid)!;
    expect(beat.title).toBe('Renamed Beat');
  });

  it('reflects edited stateChanges', () => {
    const p = createProject({ title: 'T', templateId: 'quest_flow' });
    const fid = p.storyboard.frames[0].id;
    const edited = updateFrameContent(p, fid, { stateChanges: ['my_flag = true'] });
    const h = generateProjectHandoff(edited);
    const beat = h.beats.find(b => b.id === fid)!;
    expect(beat.stateChanges).toContain('my_flag = true');
  });
});

// ─── generateProjectHandoff — progress ───────────────────────────────────────

describe('generateProjectHandoff — progress', () => {
  it('checklistProgress items are all done=false on a fresh project', () => {
    const p = createProject({ title: 'T', templateId: 'quest_flow' });
    const fid = p.storyboard.frames[0].id;
    const h = generateProjectHandoff(p);
    const beat = h.beats.find(b => b.id === fid)!;
    expect(beat.checklistProgress.every(i => i.done === false)).toBe(true);
  });

  it('marks a checked item as done=true without mutating spec arrays', () => {
    const p = createProject({ title: 'T', templateId: 'quest_flow' });
    const fid = p.storyboard.frames[0].id;
    const specBefore = [...(p.storyboard.frames[0].content.implementationChecklist ?? [])];
    const checked = setChecklistItemComplete(p, fid, 0, true);
    const h = generateProjectHandoff(checked);
    const beat = h.beats.find(b => b.id === fid)!;
    // Progress reflects the check
    expect(beat.checklistProgress[0].done).toBe(true);
    // Spec text is unchanged
    expect(checked.storyboard.frames[0].content.implementationChecklist).toEqual(specBefore);
    // Item text matches the spec
    expect(beat.checklistProgress[0].item).toBe(specBefore[0]);
  });

  it('marks a checked test criterion as done=true', () => {
    const p = createProject({ title: 'T', templateId: 'quest_flow' });
    const fid = p.storyboard.frames[0].id;
    const checked = setTestCriterionComplete(p, fid, 0, true);
    const h = generateProjectHandoff(checked);
    const beat = h.beats.find(b => b.id === fid)!;
    expect(beat.testProgress[0].done).toBe(true);
  });

  it('testProgress criterion text matches the spec', () => {
    const p = createProject({ title: 'T', templateId: 'quest_flow' });
    const fid = p.storyboard.frames[0].id;
    const spec = p.storyboard.frames[0].content.testCriteria ?? [];
    const h = generateProjectHandoff(p);
    const beat = h.beats.find(b => b.id === fid)!;
    beat.testProgress.forEach((tp, i) => expect(tp.criterion).toBe(spec[i]));
  });

  it('progress summary reflects checked items', () => {
    const p = createProject({ title: 'T', templateId: 'quest_flow' });
    const fid = p.storyboard.frames[0].id;
    const checked = setChecklistItemComplete(p, fid, 0, true);
    const h = generateProjectHandoff(checked);
    expect(h.progress.doneChecklist).toBe(1);
    expect(h.progress.totalChecklist).toBeGreaterThan(0);
  });
});

// ─── generateProjectMarkdown ──────────────────────────────────────────────────

describe('generateProjectMarkdown', () => {
  it('renders checked checklist items as [x]', () => {
    const p = createProject({ title: 'T', templateId: 'quest_flow' });
    const fid = p.storyboard.frames[0].id;
    const checked = setChecklistItemComplete(p, fid, 0, true);
    const md = generateProjectMarkdown(generateProjectHandoff(checked));
    expect(md).toContain('- [x]');
  });

  it('renders unchecked items as [ ]', () => {
    const p = createProject({ title: 'T', templateId: 'quest_flow' });
    const md = generateProjectMarkdown(generateProjectHandoff(p));
    expect(md).toContain('- [ ]');
  });

  it('includes project ID and title', () => {
    const p = createProject({ title: 'My Project', templateId: 'quest_flow' });
    const md = generateProjectMarkdown(generateProjectHandoff(p));
    expect(md).toContain('My Project');
    expect(md).toContain(p.id);
  });

  it('includes template provenance', () => {
    const p = createProject({ title: 'T', templateId: 'quest_branch' });
    const md = generateProjectMarkdown(generateProjectHandoff(p));
    expect(md).toContain('quest_branch');
  });

  it('includes progress counts', () => {
    const p = createProject({ title: 'T', templateId: 'quest_flow' });
    const fid = p.storyboard.frames[0].id;
    const checked = setChecklistItemComplete(p, fid, 0, true);
    const md = generateProjectMarkdown(generateProjectHandoff(checked));
    expect(md).toContain('1/');  // at least "1/N complete"
  });
});
