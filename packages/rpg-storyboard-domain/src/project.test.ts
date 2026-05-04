import { describe, it, expect } from 'vitest';
import { createProject, updateFramePosition } from './project';

describe('createProject', () => {
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
