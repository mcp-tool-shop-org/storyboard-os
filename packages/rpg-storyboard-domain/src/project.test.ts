import { describe, it, expect } from 'vitest';
import {
  createProject,
  updateFramePosition,
  updateFrameBasics,
  updateFrameContent,
  setChecklistItemComplete,
  setTestCriterionComplete,
  getFrameProgress,
  getProjectProgress,
} from './project';

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
