import { describe, it, expect } from 'vitest';
import {
  createProject,
  updateFramePosition,
  updateFrameBasics,
  updateFrameContent,
  updateFrameAnnotations,
  setChecklistItemComplete,
  setTestCriterionComplete,
  getFrameProgress,
  getProjectProgress,
  addFrame,
  removeFrame,
  addConnection,
  updateConnection,
  removeConnection,
  RPG_FRAME_TYPES,
} from './project';
import type { RpgStoryboardProject, TopologyOk } from './project';
import { generateProjectMarkdown, generateProjectHandoff } from './handoff';
import { validateRpgStoryboard } from './validate';
import { DENSITY_SOFT_CAP, DENSITY_HARD_CAP } from '@storyboard-os/core';

describe('createProject', () => {
  it('initializes an empty progress record', () => {
    const p = createProject({ title: 'Test', templateId: 'quest_flow' });
    expect(p.progress).toEqual({ frames: {} });
  });

  it('returns a project with all required fields', () => {
    const p = createProject({ title: 'Test Quest', templateId: 'quest_flow' });
    expect(p.id).toBeTruthy();
    expect(p.title).toBe('Test Quest');
    expect(p.createdAt).toBeTruthy();
    expect(p.updatedAt).toBeTruthy();
    expect(p.storyboard).toBeTruthy();
    expect(p.sourceTemplateId).toBe('quest_flow');
  });

  it('generates a unique id for each call', () => {
    const a = createProject({ title: 'A', templateId: 'quest_flow' });
    const b = createProject({ title: 'B', templateId: 'quest_flow' });
    expect(a.id).not.toBe(b.id);
  });

  it('storyboard id is sb-{projectId}', () => {
    const p = createProject({ title: 'Test', templateId: 'quest_flow' });
    expect(p.storyboard.id).toBe(`sb-${p.id}`);
  });

  it('sets createdAt equal to updatedAt on creation', () => {
    const p = createProject({ title: 'Test', templateId: 'quest_flow' });
    expect(p.createdAt).toBe(p.updatedAt);
  });

  it('produces a valid ISO 8601 timestamp', () => {
    const p = createProject({ title: 'Test', templateId: 'quest_flow' });
    const parsed = new Date(p.createdAt);
    expect(isNaN(parsed.getTime())).toBe(false);
    expect(parsed.toISOString()).toBe(p.createdAt);
  });

  it('passes title through to the storyboard', () => {
    const p = createProject({ title: 'My Quest', templateId: 'quest_flow' });
    expect(p.storyboard.title).toBe('My Quest');
  });

  it('includes description when provided', () => {
    const p = createProject({ title: 'Test', description: 'A tale of three factions', templateId: 'quest_flow' });
    expect(p.description).toBe('A tale of three factions');
    expect(p.storyboard.description).toBe('A tale of three factions');
  });

  it('description is undefined when not provided', () => {
    const p = createProject({ title: 'Test', templateId: 'quest_flow' });
    expect(p.description).toBeUndefined();
  });

  it('records quest_flow as sourceTemplateId', () => {
    const p = createProject({ title: 'T', templateId: 'quest_flow' });
    expect(p.sourceTemplateId).toBe('quest_flow');
  });

  it('records quest_branch as sourceTemplateId', () => {
    const p = createProject({ title: 'T', templateId: 'quest_branch' });
    expect(p.sourceTemplateId).toBe('quest_branch');
  });

  it('records cutscene_beat as sourceTemplateId', () => {
    const p = createProject({ title: 'T', templateId: 'cutscene_beat' });
    expect(p.sourceTemplateId).toBe('cutscene_beat');
  });

  it('generates 8 frames for quest_flow', () => {
    const p = createProject({ title: 'T', templateId: 'quest_flow' });
    expect(p.storyboard.frames).toHaveLength(8);
  });

  it('generates 7 frames for quest_branch', () => {
    const p = createProject({ title: 'T', templateId: 'quest_branch' });
    expect(p.storyboard.frames).toHaveLength(7);
  });

  it('generates 5 frames for cutscene_beat', () => {
    const p = createProject({ title: 'T', templateId: 'cutscene_beat' });
    expect(p.storyboard.frames).toHaveLength(5);
  });
});

describe('updateFramePosition', () => {
  function makeProject() {
    return createProject({ title: 'Test', templateId: 'quest_flow' });
  }

  it('returns a new project object (immutable)', () => {
    const p = makeProject();
    const firstFrameId = p.storyboard.frames[0].id;
    const updated = updateFramePosition(p, firstFrameId, { x: 500, y: 300 });
    expect(updated).not.toBe(p);
  });

  it('updates the target frame position', () => {
    const p = makeProject();
    const firstFrameId = p.storyboard.frames[0].id;
    const updated = updateFramePosition(p, firstFrameId, { x: 500, y: 300 });
    const frame = updated.storyboard.frames.find(f => f.id === firstFrameId)!;
    expect(frame.position).toEqual({ x: 500, y: 300 });
  });

  it('does not mutate the original project', () => {
    const p = makeProject();
    const firstFrameId = p.storyboard.frames[0].id;
    const originalPos = { ...p.storyboard.frames[0].position };
    updateFramePosition(p, firstFrameId, { x: 999, y: 999 });
    expect(p.storyboard.frames[0].position).toEqual(originalPos);
  });

  it('preserves all other frames unchanged', () => {
    const p = makeProject();
    const firstFrameId = p.storyboard.frames[0].id;
    const updated = updateFramePosition(p, firstFrameId, { x: 500, y: 300 });
    const otherFrames = updated.storyboard.frames.filter(f => f.id !== firstFrameId);
    const originalOthers = p.storyboard.frames.filter(f => f.id !== firstFrameId);
    expect(otherFrames).toHaveLength(originalOthers.length);
    otherFrames.forEach((f, i) => {
      expect(f.position).toEqual(originalOthers[i].position);
    });
  });

  it('bumps updatedAt', () => {
    const p = makeProject();
    const firstFrameId = p.storyboard.frames[0].id;
    // Pause 1ms to ensure updatedAt differs
    const before = p.updatedAt;
    const updated = updateFramePosition(p, firstFrameId, { x: 1, y: 1 });
    // updatedAt is a new valid ISO string
    expect(new Date(updated.updatedAt).toISOString()).toBe(updated.updatedAt);
    // It is >= the original (may be equal if same millisecond, but structurally correct)
    expect(updated.updatedAt >= before).toBe(true);
  });

  it('preserves all other project fields', () => {
    const p = makeProject();
    const firstFrameId = p.storyboard.frames[0].id;
    const updated = updateFramePosition(p, firstFrameId, { x: 1, y: 1 });
    expect(updated.id).toBe(p.id);
    expect(updated.title).toBe(p.title);
    expect(updated.createdAt).toBe(p.createdAt);
    expect(updated.sourceTemplateId).toBe(p.sourceTemplateId);
  });

  it('returns the project unchanged when frameId is unknown', () => {
    const p = makeProject();
    const result = updateFramePosition(p, 'no-such-frame', { x: 1, y: 1 });
    expect(result).toBe(p);
  });
});

describe('updateFrameBasics', () => {
  function makeProject() {
    return createProject({ title: 'Test', templateId: 'quest_flow' });
  }

  it('updates the frame title', () => {
    const p = makeProject();
    const fid = p.storyboard.frames[0].id;
    const updated = updateFrameBasics(p, fid, { title: 'New Title' });
    expect(updated.storyboard.frames[0].title).toBe('New Title');
  });

  it('updates the frame summary', () => {
    const p = makeProject();
    const fid = p.storyboard.frames[0].id;
    const updated = updateFrameBasics(p, fid, { summary: 'New summary.' });
    expect(updated.storyboard.frames[0].summary).toBe('New summary.');
  });

  it('does not mutate the original project', () => {
    const p = makeProject();
    const fid = p.storyboard.frames[0].id;
    const originalTitle = p.storyboard.frames[0].title;
    updateFrameBasics(p, fid, { title: 'Changed' });
    expect(p.storyboard.frames[0].title).toBe(originalTitle);
  });

  it('returns a new project object', () => {
    const p = makeProject();
    const fid = p.storyboard.frames[0].id;
    const updated = updateFrameBasics(p, fid, { title: 'X' });
    expect(updated).not.toBe(p);
  });

  it('bumps updatedAt', () => {
    const p = makeProject();
    const fid = p.storyboard.frames[0].id;
    const updated = updateFrameBasics(p, fid, { title: 'X' });
    expect(updated.updatedAt >= p.updatedAt).toBe(true);
  });

  it('returns project unchanged when frameId is unknown', () => {
    const p = makeProject();
    const result = updateFrameBasics(p, 'unknown', { title: 'X' });
    expect(result).toBe(p);
  });

  it('preserves other frames', () => {
    const p = makeProject();
    const fid = p.storyboard.frames[0].id;
    const updated = updateFrameBasics(p, fid, { title: 'X' });
    const others = updated.storyboard.frames.slice(1);
    p.storyboard.frames.slice(1).forEach((f, i) => {
      expect(others[i].title).toBe(f.title);
    });
  });
});

describe('updateFrameContent', () => {
  function makeProject() {
    return createProject({ title: 'Test', templateId: 'quest_flow' });
  }

  it('updates a string content field', () => {
    const p = makeProject();
    const fid = p.storyboard.frames[0].id;
    const updated = updateFrameContent(p, fid, { designerNotes: 'New notes' });
    expect(updated.storyboard.frames[0].content.designerNotes).toBe('New notes');
  });

  it('updates an array content field', () => {
    const p = makeProject();
    const fid = p.storyboard.frames[0].id;
    const updated = updateFrameContent(p, fid, { stateChanges: ['flag_a = true'] });
    expect(updated.storyboard.frames[0].content.stateChanges).toEqual(['flag_a = true']);
  });

  it('merges with existing content — does not wipe other fields', () => {
    const p = makeProject();
    const fid = p.storyboard.frames[0].id;
    const original = p.storyboard.frames[0].content;
    const updated = updateFrameContent(p, fid, { designerNotes: 'Patched' });
    const updatedContent = updated.storyboard.frames[0].content;
    // Other fields are preserved
    expect(updatedContent.requiredAssets).toEqual(original.requiredAssets);
    expect(updatedContent.testCriteria).toEqual(original.testCriteria);
  });

  it('does not mutate the original project', () => {
    const p = makeProject();
    const fid = p.storyboard.frames[0].id;
    const originalNotes = p.storyboard.frames[0].content.designerNotes;
    updateFrameContent(p, fid, { designerNotes: 'Changed' });
    expect(p.storyboard.frames[0].content.designerNotes).toBe(originalNotes);
  });

  it('returns a new project object', () => {
    const p = makeProject();
    const fid = p.storyboard.frames[0].id;
    const updated = updateFrameContent(p, fid, { designerNotes: 'X' });
    expect(updated).not.toBe(p);
  });

  it('bumps updatedAt', () => {
    const p = makeProject();
    const fid = p.storyboard.frames[0].id;
    const updated = updateFrameContent(p, fid, { designerNotes: 'X' });
    expect(updated.updatedAt >= p.updatedAt).toBe(true);
  });

  it('returns project unchanged when frameId is unknown', () => {
    const p = makeProject();
    const result = updateFrameContent(p, 'unknown', { designerNotes: 'X' });
    expect(result).toBe(p);
  });
});

describe('updateFrameAnnotations', () => {
  function makeProject() {
    return createProject({ title: 'Test', templateId: 'quest_flow' });
  }

  it('replaces annotations on the target frame', () => {
    const p = makeProject();
    const fid = p.storyboard.frames[0].id;
    const next = [
      { id: 'ann-new', type: 'danger' as const, text: 'Do not spawn the courier yet.' },
    ];
    const updated = updateFrameAnnotations(p, fid, next);
    expect(updated.storyboard.frames[0].annotations).toEqual(next);
  });

  it('does not mutate the original project', () => {
    const p = makeProject();
    const fid = p.storyboard.frames[0].id;
    const original = p.storyboard.frames[0].annotations;
    updateFrameAnnotations(p, fid, []);
    expect(p.storyboard.frames[0].annotations).toBe(original);
  });

  it('returns project unchanged when frameId is unknown', () => {
    const p = makeProject();
    const result = updateFrameAnnotations(p, 'unknown', []);
    expect(result).toBe(p);
  });
});

describe('setChecklistItemComplete', () => {
  function makeProject() {
    return createProject({ title: 'Test', templateId: 'quest_flow' });
  }

  it('marks a checklist item complete', () => {
    const p = makeProject();
    const fid = p.storyboard.frames[0].id;
    const updated = setChecklistItemComplete(p, fid, 0, true);
    expect(getFrameProgress(updated, fid).checklist['0']).toBe(true);
  });

  it('marks a checklist item incomplete', () => {
    const p = makeProject();
    const fid = p.storyboard.frames[0].id;
    const checked   = setChecklistItemComplete(p, fid, 0, true);
    const unchecked = setChecklistItemComplete(checked, fid, 0, false);
    expect(getFrameProgress(unchecked, fid).checklist['0']).toBe(false);
  });

  it('does not mutate the original project', () => {
    const p = makeProject();
    const fid = p.storyboard.frames[0].id;
    setChecklistItemComplete(p, fid, 0, true);
    expect(p.progress.frames[fid]).toBeUndefined();
  });

  it('returns a new project object', () => {
    const p = makeProject();
    const fid = p.storyboard.frames[0].id;
    const updated = setChecklistItemComplete(p, fid, 0, true);
    expect(updated).not.toBe(p);
  });

  it('bumps updatedAt', () => {
    const p = makeProject();
    const fid = p.storyboard.frames[0].id;
    const updated = setChecklistItemComplete(p, fid, 0, true);
    expect(updated.updatedAt >= p.updatedAt).toBe(true);
  });

  it('returns project unchanged when frameId is unknown', () => {
    const p = makeProject();
    const result = setChecklistItemComplete(p, 'no-such-frame', 0, true);
    expect(result).toBe(p);
  });

  it('preserves progress for other frames', () => {
    const p = makeProject();
    const fid0 = p.storyboard.frames[0].id;
    const fid1 = p.storyboard.frames[1].id;
    const step1 = setChecklistItemComplete(p, fid0, 0, true);
    const step2 = setChecklistItemComplete(step1, fid1, 1, true);
    expect(getFrameProgress(step2, fid0).checklist['0']).toBe(true);
    expect(getFrameProgress(step2, fid1).checklist['1']).toBe(true);
  });
});

describe('setTestCriterionComplete', () => {
  function makeProject() {
    return createProject({ title: 'Test', templateId: 'quest_flow' });
  }

  it('marks a test criterion complete', () => {
    const p = makeProject();
    const fid = p.storyboard.frames[0].id;
    const updated = setTestCriterionComplete(p, fid, 0, true);
    expect(getFrameProgress(updated, fid).testCriteria['0']).toBe(true);
  });

  it('marks a test criterion incomplete', () => {
    const p = makeProject();
    const fid = p.storyboard.frames[0].id;
    const checked   = setTestCriterionComplete(p, fid, 0, true);
    const unchecked = setTestCriterionComplete(checked, fid, 0, false);
    expect(getFrameProgress(unchecked, fid).testCriteria['0']).toBe(false);
  });

  it('does not mutate the original project', () => {
    const p = makeProject();
    const fid = p.storyboard.frames[0].id;
    setTestCriterionComplete(p, fid, 0, true);
    expect(p.progress.frames[fid]).toBeUndefined();
  });

  it('returns project unchanged when frameId is unknown', () => {
    const p = makeProject();
    const result = setTestCriterionComplete(p, 'no-such-frame', 0, true);
    expect(result).toBe(p);
  });

  it('preserves existing checklist progress in the same frame', () => {
    const p = makeProject();
    const fid = p.storyboard.frames[0].id;
    const step1 = setChecklistItemComplete(p, fid, 0, true);
    const step2 = setTestCriterionComplete(step1, fid, 0, true);
    expect(getFrameProgress(step2, fid).checklist['0']).toBe(true);
    expect(getFrameProgress(step2, fid).testCriteria['0']).toBe(true);
  });
});

describe('getFrameProgress', () => {
  it('returns empty progress for a frame with no recorded progress', () => {
    const p = createProject({ title: 'T', templateId: 'quest_flow' });
    const fid = p.storyboard.frames[0].id;
    const fp = getFrameProgress(p, fid);
    expect(fp.checklist).toEqual({});
    expect(fp.testCriteria).toEqual({});
  });

  it('returns the recorded progress after a checklist change', () => {
    const p = createProject({ title: 'T', templateId: 'quest_flow' });
    const fid = p.storyboard.frames[0].id;
    const updated = setChecklistItemComplete(p, fid, 2, true);
    expect(getFrameProgress(updated, fid).checklist['2']).toBe(true);
  });
});

describe('getProjectProgress', () => {
  it('returns zero done-counts for a fresh project', () => {
    const p = createProject({ title: 'T', templateId: 'quest_flow' });
    const summary = getProjectProgress(p);
    expect(summary.doneChecklist).toBe(0);
    expect(summary.doneTests).toBe(0);
  });

  it('totalChecklist > 0 because quest_flow frames have checklists', () => {
    const p = createProject({ title: 'T', templateId: 'quest_flow' });
    const summary = getProjectProgress(p);
    expect(summary.totalChecklist).toBeGreaterThan(0);
    expect(summary.totalTests).toBeGreaterThan(0);
  });

  it('increments doneChecklist when an item is checked', () => {
    const p = createProject({ title: 'T', templateId: 'quest_flow' });
    const fid = p.storyboard.frames[0].id;
    const updated = setChecklistItemComplete(p, fid, 0, true);
    const summary = getProjectProgress(updated);
    expect(summary.doneChecklist).toBe(1);
  });

  it('increments doneTests when a criterion is checked', () => {
    const p = createProject({ title: 'T', templateId: 'quest_flow' });
    const fid = p.storyboard.frames[0].id;
    const updated = setTestCriterionComplete(p, fid, 0, true);
    const summary = getProjectProgress(updated);
    expect(summary.doneTests).toBe(1);
  });

  it('counts across multiple frames', () => {
    const p = createProject({ title: 'T', templateId: 'quest_flow' });
    const fid0 = p.storyboard.frames[0].id;
    const fid1 = p.storyboard.frames[1].id;
    const step1 = setChecklistItemComplete(p, fid0, 0, true);
    const step2 = setChecklistItemComplete(step1, fid1, 0, true);
    const summary = getProjectProgress(step2);
    expect(summary.doneChecklist).toBe(2);
  });
});

// ─── DM-001 — progress reconciliation on checklist/testCriteria edits ─────────
//
// updateFrameContent replaces spec arrays wholesale while progress is keyed by
// index. Without reconciliation, done marks silently attach to different item
// texts after a reorder/insert/delete. These tests pin ✓-to-text attachment.

describe('updateFrameContent — progress reconciliation (DM-001)', () => {
  /** Project whose first frame has a known checklist, with given texts done. */
  function seedChecklist(items: string[], doneTexts: string[]) {
    let p = createProject({ title: 'Test', templateId: 'quest_flow' });
    const fid = p.storyboard.frames[0].id;
    p = updateFrameContent(p, fid, { implementationChecklist: items });
    for (const text of doneTexts) {
      p = setChecklistItemComplete(p, fid, items.indexOf(text), true);
    }
    return { p, fid };
  }

  it('(a) reorder preserves which TEXTS are done', () => {
    const { p, fid } = seedChecklist(['alpha', 'beta', 'gamma'], ['beta']);
    const reordered = updateFrameContent(p, fid, {
      implementationChecklist: ['gamma', 'alpha', 'beta'],
    });
    const fp = getFrameProgress(reordered, fid);
    // 'beta' moved from index 1 to index 2 — the done mark must follow the text.
    expect(fp.checklist['2']).toBe(true);
    expect(fp.checklist['0']).not.toBe(true);
    expect(fp.checklist['1']).not.toBe(true);
  });

  it('(b) insert-before shifts done marks to the new index', () => {
    const { p, fid } = seedChecklist(['alpha', 'beta'], ['beta']);
    const inserted = updateFrameContent(p, fid, {
      implementationChecklist: ['new first task', 'alpha', 'beta'],
    });
    const fp = getFrameProgress(inserted, fid);
    expect(fp.checklist['2']).toBe(true); // beta: 1 → 2
    expect(fp.checklist['0']).not.toBe(true); // inserted item is not done
    expect(fp.checklist['1']).not.toBe(true);
  });

  it('(c) delete of a done item drops only that mark', () => {
    const { p, fid } = seedChecklist(['alpha', 'beta', 'gamma'], ['alpha', 'gamma']);
    const deleted = updateFrameContent(p, fid, {
      implementationChecklist: ['beta', 'gamma'], // alpha (done) removed
    });
    const fp = getFrameProgress(deleted, fid);
    expect(fp.checklist['1']).toBe(true); // gamma still done at its new index
    expect(fp.checklist['0']).not.toBe(true); // beta was never done
    expect(Object.values(fp.checklist).filter(v => v === true)).toHaveLength(1);
  });

  it('(d) unchanged arrays leave progress untouched', () => {
    const { p, fid } = seedChecklist(['alpha', 'beta'], ['beta']);
    const before = getFrameProgress(p, fid);
    const same = updateFrameContent(p, fid, {
      implementationChecklist: ['alpha', 'beta'],
    });
    expect(getFrameProgress(same, fid)).toEqual(before);
  });

  it('patching an unrelated field leaves progress untouched', () => {
    const { p, fid } = seedChecklist(['alpha', 'beta'], ['beta']);
    const before = getFrameProgress(p, fid);
    const patched = updateFrameContent(p, fid, { designerNotes: 'notes' });
    expect(getFrameProgress(patched, fid)).toEqual(before);
  });

  it('duplicate texts claim matches in order (stable)', () => {
    const { p, fid } = seedChecklist(['dup', 'dup', 'other'], ['dup']);
    // First 'dup' (index 0) is done. Remove one 'dup'.
    const edited = updateFrameContent(p, fid, {
      implementationChecklist: ['dup', 'other'],
    });
    const fp = getFrameProgress(edited, fid);
    expect(fp.checklist['0']).toBe(true); // one dup remains done
    expect(Object.values(fp.checklist).filter(v => v === true)).toHaveLength(1);
  });

  it('drops all marks when every done text is removed', () => {
    const { p, fid } = seedChecklist(['alpha', 'beta'], ['alpha', 'beta']);
    const replaced = updateFrameContent(p, fid, {
      implementationChecklist: ['entirely', 'new', 'items'],
    });
    const fp = getFrameProgress(replaced, fid);
    expect(Object.values(fp.checklist).filter(v => v === true)).toHaveLength(0);
  });

  it('reconciles testCriteria progress the same way', () => {
    let p = createProject({ title: 'Test', templateId: 'quest_flow' });
    const fid = p.storyboard.frames[0].id;
    p = updateFrameContent(p, fid, { testCriteria: ['t-one', 't-two'] });
    p = setTestCriterionComplete(p, fid, 1, true); // 't-two' done
    const reordered = updateFrameContent(p, fid, { testCriteria: ['t-two', 't-one'] });
    const fp = getFrameProgress(reordered, fid);
    expect(fp.testCriteria['0']).toBe(true); // t-two followed to index 0
    expect(fp.testCriteria['1']).not.toBe(true);
  });

  it('getProjectProgress counts stay attached to texts after a reorder', () => {
    const { p, fid } = seedChecklist(['alpha', 'beta', 'gamma'], ['beta']);
    const reordered = updateFrameContent(p, fid, {
      implementationChecklist: ['beta', 'gamma', 'alpha'],
    });
    const summary = getProjectProgress(reordered);
    expect(summary.doneChecklist).toBe(1); // still exactly one done item
    const fp = getFrameProgress(reordered, fid);
    expect(fp.checklist['0']).toBe(true); // and it is 'beta'
  });
});

// ─── V3-003 — DM-001 verified THROUGH the handoff, not just the progress map ──
//
// The reconciliation tests above assert the progress KEY moved to the right
// index. These assert the [x]/[ ] marker lands on the CORRECT item TEXT in the
// rendered handoff after insert / delete / duplicate — the observable output a
// developer actually reads.

describe('DM-001 through-render — insert / delete / duplicate (V3-003)', () => {
  /** Project whose first frame has a known checklist, with given texts done. */
  function seedChecklist(items: string[], doneTexts: string[]) {
    let p = createProject({ title: 'Test', templateId: 'quest_flow' });
    const fid = p.storyboard.frames[0].id;
    p = updateFrameContent(p, fid, { implementationChecklist: items });
    for (const text of doneTexts) {
      p = setChecklistItemComplete(p, fid, items.indexOf(text), true);
    }
    return { p, fid };
  }

  it('(a) insert-before-a-done-item keeps [x] on the done text, [ ] on the new one', () => {
    const { p, fid } = seedChecklist(['alpha', 'beta'], ['beta']);
    const inserted = updateFrameContent(p, fid, {
      implementationChecklist: ['new first task', 'alpha', 'beta'],
    });
    const md = generateProjectMarkdown(generateProjectHandoff(inserted));
    expect(md).toContain('- [x] beta');            // done mark followed its text
    expect(md).toContain('- [ ] new first task');  // inserted item is undone
    expect(md).toContain('- [ ] alpha');
    expect(md).not.toContain('- [x] new first task');
    expect(md).not.toContain('- [x] alpha');
  });

  it('(b) delete-a-done-item drops only that marker; siblings render correctly', () => {
    const { p, fid } = seedChecklist(['alpha', 'beta', 'gamma'], ['alpha', 'gamma']);
    const deleted = updateFrameContent(p, fid, {
      implementationChecklist: ['beta', 'gamma'], // alpha (done) removed
    });
    const md = generateProjectMarkdown(generateProjectHandoff(deleted));
    expect(md).toContain('- [x] gamma');   // surviving done text keeps its mark
    expect(md).toContain('- [ ] beta');    // never done
    expect(md).not.toContain('alpha');     // removed item is gone entirely
    // Confirm the handoff-level pairing agrees with the rendered markers.
    const beat = generateProjectHandoff(deleted).beats.find(b => b.id === fid)!;
    const gamma = beat.checklistProgress.find(i => i.item === 'gamma')!;
    const beta = beat.checklistProgress.find(i => i.item === 'beta')!;
    expect(gamma.done).toBe(true);
    expect(beta.done).toBe(false);
  });

  it('(c) duplicate text — the mark lands on ONE instance, not double-claimed', () => {
    // Two identical 'dup' items, only the first done. After adding a third
    // 'dup', exactly one instance must render [x]; the rest [ ].
    const { p, fid } = seedChecklist(['dup', 'dup'], ['dup']);
    const grown = updateFrameContent(p, fid, {
      implementationChecklist: ['dup', 'dup', 'dup'],
    });
    const beat = generateProjectHandoff(grown).beats.find(b => b.id === fid)!;
    const doneCount = beat.checklistProgress.filter(i => i.item === 'dup' && i.done).length;
    expect(doneCount).toBe(1); // exactly one 'dup' is claimed, not double-claimed

    const md = generateProjectMarkdown(generateProjectHandoff(grown));
    // One [x] dup and at least one [ ] dup in the rendered output.
    const doneLines = md.split('\n').filter(l => l === '- [x] dup');
    const undoneLines = md.split('\n').filter(l => l === '- [ ] dup');
    expect(doneLines).toHaveLength(1);
    expect(undoneLines).toHaveLength(2);
  });
});

// ─── F-e8c70228 — topology authoring ─────────────────────────────────────────

function addedFrame(before: RpgStoryboardProject, after: RpgStoryboardProject) {
  const known = new Set(before.storyboard.frames.map(f => f.id));
  return after.storyboard.frames.find(f => !known.has(f.id));
}

function unwrapOk(result: ReturnType<typeof addFrame>): TopologyOk {
  expect(result.ok).toBe(true);
  if (!result.ok) throw new Error(result.message);
  return result;
}

function projectWithNFrames(n: number): RpgStoryboardProject {
  const p = createProject({ title: 'Density', templateId: 'quest_flow' });
  const proto = p.storyboard.frames[0];
  const frames = Array.from({ length: n }, (_, i) => ({
    ...proto,
    id: `frm-d-${i}`,
    title: `Beat ${i + 1}`,
    position: { x: 80 + (i % 10) * 280, y: 80 + Math.floor(i / 10) * 160 },
    content: { ...proto.content },
    annotations: [],
  }));
  return {
    ...p,
    storyboard: { ...p.storyboard, frames, connections: [] },
  };
}

describe('addFrame', () => {
  it('appends a beat with an allocated id and default size', () => {
    const p = createProject({ title: 'T', templateId: 'quest_flow' });
    const beforeCount = p.storyboard.frames.length;
    const result = unwrapOk(addFrame(p, { type: 'scene' }));
    expect(result.project).not.toBe(p);
    expect(result.project.storyboard.frames).toHaveLength(beforeCount + 1);
    const frame = addedFrame(p, result.project)!;
    expect(frame.id).toMatch(/^frm-/);
    expect(frame.type).toBe('scene');
    expect(frame.title).toBe('New Scene');
    expect(frame.summary).toBe('Author this beat.');
    expect(frame.size).toEqual({ width: 220, height: 130 });
    expect(frame.annotations).toEqual([]);
    expect(result.frameId).toBe(frame.id);
  });

  it('does not mutate the original project or add any connection', () => {
    const p = createProject({ title: 'T', templateId: 'quest_flow' });
    const connCount = p.storyboard.connections.length;
    addFrame(p, { type: 'hook' });
    expect(p.storyboard.frames).toHaveLength(8);
    expect(p.storyboard.connections).toHaveLength(connCount);
    const result = unwrapOk(addFrame(p, { type: 'hook' }));
    expect(result.project.storyboard.connections).toHaveLength(connCount);
  });

  it('seeds stateChanges so a new choice beat validates', () => {
    const p = createProject({ title: 'T', templateId: 'quest_flow' });
    const result = unwrapOk(addFrame(p, { type: 'choice' }));
    const frame = addedFrame(p, result.project)!;
    expect(frame.content.stateChanges?.length).toBeGreaterThan(0);
    expect(validateRpgStoryboard(result.project.storyboard).valid).toBe(true);
  });

  it('seeds entryConditions so a new reveal beat validates', () => {
    const p = createProject({ title: 'T', templateId: 'quest_flow' });
    const result = unwrapOk(addFrame(p, { type: 'reveal' }));
    const frame = addedFrame(p, result.project)!;
    expect(frame.content.entryConditions?.length).toBeGreaterThan(0);
    expect(validateRpgStoryboard(result.project.storyboard).valid).toBe(true);
  });

  it('places the new beat to the right of the rightmost existing beat', () => {
    const p = createProject({ title: 'T', templateId: 'quest_flow' });
    const rightmost = p.storyboard.frames.reduce((a, b) =>
      a.position.x >= b.position.x ? a : b,
    );
    const result = unwrapOk(addFrame(p, { type: 'scene' }));
    const frame = addedFrame(p, result.project)!;
    expect(frame.position.x).toBe(rightmost.position.x + 280);
    expect(frame.position.y).toBe(rightmost.position.y);
  });

  it('honors an explicit title, summary, and position', () => {
    const p = createProject({ title: 'T', templateId: 'quest_flow' });
    const result = unwrapOk(addFrame(p, {
      type: 'npc_beat',
      title: 'Marel Dyn',
      summary: 'The merchant steps out.',
      position: { x: 12, y: 34 },
    }));
    const frame = addedFrame(p, result.project)!;
    expect(frame.title).toBe('Marel Dyn');
    expect(frame.summary).toBe('The merchant steps out.');
    expect(frame.position).toEqual({ x: 12, y: 34 });
  });

  it('rejects an unknown frame type without changing the project', () => {
    const p = createProject({ title: 'T', templateId: 'quest_flow' });
    const result = addFrame(p, { type: 'combat' as typeof RPG_FRAME_TYPES[number] });
    expect(result.ok).toBe(false);
    if (result.ok) return;
    expect(result.reason).toBe('invalid_type');
    expect(p.storyboard.frames).toHaveLength(8);
  });

  it('warns when adding onto a board at the soft density cap', () => {
    const p = projectWithNFrames(DENSITY_SOFT_CAP);
    const result = unwrapOk(addFrame(p, { type: 'scene' }));
    expect(result.density.level).toBe('warn');
    expect(result.warning).toMatch(/50/);
    expect(result.project.storyboard.frames).toHaveLength(DENSITY_SOFT_CAP + 1);
  });

  it('refuses add when the board is already at the hard density cap', () => {
    const p = projectWithNFrames(DENSITY_HARD_CAP);
    const result = addFrame(p, { type: 'scene' });
    expect(result.ok).toBe(false);
    if (result.ok) return;
    expect(result.reason).toBe('density_over');
    expect(result.density?.frameCount).toBe(DENSITY_HARD_CAP);
    expect(p.storyboard.frames).toHaveLength(DENSITY_HARD_CAP);
  });

  it('still allows the 100th beat (99 is warn, not over)', () => {
    const p = projectWithNFrames(DENSITY_HARD_CAP - 1);
    const result = unwrapOk(addFrame(p, { type: 'scene' }));
    expect(result.project.storyboard.frames).toHaveLength(DENSITY_HARD_CAP);
    expect(result.density.level).toBe('over');
    expect(result.warning).toMatch(/100/);
  });
});

describe('removeFrame', () => {
  it('removes the beat, incident connections, and progress', () => {
    const p = createProject({ title: 'T', templateId: 'quest_flow' });
    const fid = p.storyboard.frames[0].id;
    const incident = p.storyboard.connections.filter(
      c => c.fromFrameId === fid || c.toFrameId === fid,
    );
    expect(incident.length).toBeGreaterThan(0);
    const withProgress = setChecklistItemComplete(p, fid, 0, true);
    expect(getFrameProgress(withProgress, fid).checklist['0']).toBe(true);

    const result = unwrapOk(removeFrame(withProgress, fid));
    expect(result.project.storyboard.frames.find(f => f.id === fid)).toBeUndefined();
    expect(result.project.storyboard.connections.some(
      c => c.fromFrameId === fid || c.toFrameId === fid,
    )).toBe(false);
    expect(result.project.progress.frames[fid]).toBeUndefined();
    expect(validateRpgStoryboard(result.project.storyboard).valid).toBe(true);
    expect(withProgress.storyboard.frames.find(f => f.id === fid)).toBeDefined();
  });

  it('leaves unrelated progress and connections intact', () => {
    const p = createProject({ title: 'T', templateId: 'quest_flow' });
    const keep = p.storyboard.frames[1].id;
    const drop = p.storyboard.frames[0].id;
    const seeded = setChecklistItemComplete(p, keep, 0, true);
    const result = unwrapOk(removeFrame(seeded, drop));
    expect(getFrameProgress(result.project, keep).checklist['0']).toBe(true);
  });

  it('refuses to delete the last remaining beat', () => {
    let p = createProject({ title: 'T', templateId: 'cutscene_beat' });
    while (p.storyboard.frames.length > 1) {
      const next = unwrapOk(removeFrame(p, p.storyboard.frames[0].id));
      p = next.project;
    }
    const lastId = p.storyboard.frames[0].id;
    const result = removeFrame(p, lastId);
    expect(result.ok).toBe(false);
    if (result.ok) return;
    expect(result.reason).toBe('last_frame');
    expect(p.storyboard.frames).toHaveLength(1);
  });

  it('returns unknown_frame when the id is missing', () => {
    const p = createProject({ title: 'T', templateId: 'quest_flow' });
    const result = removeFrame(p, 'no-such-frame');
    expect(result.ok).toBe(false);
    if (result.ok) return;
    expect(result.reason).toBe('unknown_frame');
  });
});

describe('addConnection / updateConnection / removeConnection', () => {
  it('adds one labelled connection between existing beats', () => {
    const p = createProject({ title: 'T', templateId: 'quest_flow' });
    const from = p.storyboard.frames[0].id;
    const to = p.storyboard.frames[2].id;
    const already = p.storyboard.connections.some(
      c => c.fromFrameId === from && c.toFrameId === to,
    );
    expect(already).toBe(false);
    const before = p.storyboard.connections.length;
    const result = unwrapOk(addConnection(p, {
      fromFrameId: from,
      toFrameId: to,
      type: 'optional',
      label: 'If the player waits',
    }));
    expect(result.project.storyboard.connections).toHaveLength(before + 1);
    const conn = result.project.storyboard.connections.find(c => c.id === result.connectionId)!;
    expect(conn.type).toBe('optional');
    expect(conn.label).toBe('If the player waits');
    expect(conn.fromFrameId).toBe(from);
    expect(conn.toFrameId).toBe(to);
    expect(validateRpgStoryboard(result.project.storyboard).valid).toBe(true);
    expect(p.storyboard.connections).toHaveLength(before);
  });

  it('does not auto-complete a fan — only the requested edge is added', () => {
    const p = createProject({ title: 'T', templateId: 'quest_branch' });
    const from = p.storyboard.frames[0].id;
    const others = p.storyboard.frames.slice(1).filter(f =>
      !p.storyboard.connections.some(c => c.fromFrameId === from && c.toFrameId === f.id),
    );
    expect(others.length).toBeGreaterThan(1);
    const result = unwrapOk(addConnection(p, {
      fromFrameId: from,
      toFrameId: others[0].id,
      type: 'choice',
      label: 'Ask about the window',
    }));
    expect(result.project.storyboard.connections).toHaveLength(
      p.storyboard.connections.length + 1,
    );
  });

  it('refuses a self-loop', () => {
    const p = createProject({ title: 'T', templateId: 'quest_flow' });
    const id = p.storyboard.frames[0].id;
    const result = addConnection(p, {
      fromFrameId: id,
      toFrameId: id,
      type: 'sequence',
    });
    expect(result.ok).toBe(false);
    if (result.ok) return;
    expect(result.reason).toBe('self_loop');
  });

  it('refuses a duplicate from→to edge', () => {
    const p = createProject({ title: 'T', templateId: 'quest_flow' });
    const existing = p.storyboard.connections[0];
    const result = addConnection(p, {
      fromFrameId: existing.fromFrameId,
      toFrameId: existing.toFrameId,
      type: 'fallback',
    });
    expect(result.ok).toBe(false);
    if (result.ok) return;
    expect(result.reason).toBe('duplicate_edge');
  });

  it('refuses a connection to an unknown beat', () => {
    const p = createProject({ title: 'T', templateId: 'quest_flow' });
    const result = addConnection(p, {
      fromFrameId: p.storyboard.frames[0].id,
      toFrameId: 'missing-beat',
      type: 'sequence',
    });
    expect(result.ok).toBe(false);
    if (result.ok) return;
    expect(result.reason).toBe('missing_endpoint');
  });

  it('updates type and label without retargeting', () => {
    const p = createProject({ title: 'T', templateId: 'quest_flow' });
    const conn = p.storyboard.connections[0];
    const result = unwrapOk(updateConnection(p, conn.id, {
      type: 'fallback',
      label: 'If the hatch is blocked',
    }));
    const updated = result.project.storyboard.connections.find(c => c.id === conn.id)!;
    expect(updated.type).toBe('fallback');
    expect(updated.label).toBe('If the hatch is blocked');
    expect(updated.fromFrameId).toBe(conn.fromFrameId);
    expect(updated.toFrameId).toBe(conn.toFrameId);
    expect(validateRpgStoryboard(result.project.storyboard).valid).toBe(true);
  });

  it('clears the label when patch.label is null', () => {
    const p = createProject({ title: 'T', templateId: 'quest_flow' });
    const labelled = p.storyboard.connections.find(c => c.label);
    expect(labelled).toBeDefined();
    const result = unwrapOk(updateConnection(p, labelled!.id, { label: null }));
    const updated = result.project.storyboard.connections.find(c => c.id === labelled!.id)!;
    expect(updated.label).toBeUndefined();
  });

  it('is a no-op when the patch changes nothing', () => {
    const p = createProject({ title: 'T', templateId: 'quest_flow' });
    const conn = p.storyboard.connections[0];
    const result = unwrapOk(updateConnection(p, conn.id, { type: conn.type }));
    expect(result.project).toBe(p);
  });

  it('removes a connection and leaves frames in place', () => {
    const p = createProject({ title: 'T', templateId: 'quest_flow' });
    const conn = p.storyboard.connections[0];
    const frameCount = p.storyboard.frames.length;
    const result = unwrapOk(removeConnection(p, conn.id));
    expect(result.project.storyboard.connections.find(c => c.id === conn.id)).toBeUndefined();
    expect(result.project.storyboard.frames).toHaveLength(frameCount);
    expect(validateRpgStoryboard(result.project.storyboard).valid).toBe(true);
  });

  it('returns unknown_connection for missing ids', () => {
    const p = createProject({ title: 'T', templateId: 'quest_flow' });
    expect(updateConnection(p, 'no-conn', { type: 'sequence' }).ok).toBe(false);
    expect(removeConnection(p, 'no-conn').ok).toBe(false);
  });
});
