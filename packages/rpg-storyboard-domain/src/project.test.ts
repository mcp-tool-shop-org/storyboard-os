import { describe, it, expect } from 'vitest';
import { createProject } from './project';

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
