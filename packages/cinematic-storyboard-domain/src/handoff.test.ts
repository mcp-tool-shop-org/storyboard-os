// ─── cinematic-domain / handoff.test.ts ──────────────────────────────────────

import { describe, it, expect } from 'vitest';
import { generateProductionBrief, generateProductionMarkdown } from './handoff';
import { createCinematicStoryboard } from './templates';
import { storyboardOsLaunchTrailer } from './demo-sequence';
import type { Storyboard, StoryboardFrame, CinematicFrameContent } from './schema';

function makeFrame(
  id: string,
  type: string,
  content: Partial<CinematicFrameContent> = {},
): StoryboardFrame {
  return {
    id,
    type: type as any,
    title: `Frame ${id}`,
    summary: `Summary for ${id}`,
    position: { x: 0, y: 0 },
    size: { width: 220, height: 140 },
    content: content as CinematicFrameContent,
    annotations: [],
  };
}

describe('generateProductionBrief', () => {
  it('produces a brief from trailer template', () => {
    const sb = createCinematicStoryboard('trailer_flow');
    const brief = generateProductionBrief(sb);

    expect(brief.title).toBe('Trailer Flow');
    expect(brief.totalShots).toBe(6);
    expect(brief.shots).toHaveLength(6);
    expect(brief.readySummary.ready).toBe(6);
    expect(brief.readySummary.blocked).toBe(0);
  });

  it('computes total duration from frames', () => {
    const sb = createCinematicStoryboard('trailer_flow');
    const brief = generateProductionBrief(sb);
    // All trailer frames have durations, so total should not be "Unknown"
    expect(brief.totalDuration).not.toBe('Unknown');
    expect(brief.totalDuration).toContain('s');
  });

  it('shots contain camera language', () => {
    const sb = createCinematicStoryboard('cutscene_sequence');
    const brief = generateProductionBrief(sb);
    const establishShot = brief.shots[0];
    expect(establishShot.camera).not.toBeNull();
    expect(establishShot.camera).toContain('Wide');
  });

  it('shots contain required assets', () => {
    const sb = createCinematicStoryboard('explainer_video');
    const brief = generateProductionBrief(sb);
    const demoShot = brief.shots[2]; // Demonstration
    expect(demoShot.requiredAssets.length).toBeGreaterThan(0);
  });

  it('tracks readiness summary correctly', () => {
    const storyboard: Storyboard = {
      id: 'test',
      title: 'Test',
      frames: [
        makeFrame('s1', 'shot', {
          visualDescription: 'x', intent: 'x', cameraAngle: 'w', durationEstimate: '3s',
        }),
        makeFrame('s2', 'sequence', {}),
        makeFrame('s3', 'dialogue', { intent: 'x', durationEstimate: '3s' }),
      ],
      connections: [],
    };
    const brief = generateProductionBrief(storyboard);
    expect(brief.readySummary.ready).toBe(1);
    expect(brief.readySummary.draft).toBe(1);
    expect(brief.readySummary.blocked).toBe(1);
  });

  it('works with the demo launch trailer', () => {
    const brief = generateProductionBrief(storyboardOsLaunchTrailer);
    expect(brief.totalShots).toBe(8);
    expect(brief.title).toContain('Launch Trailer');
  });
});

describe('generateProductionMarkdown', () => {
  it('produces markdown with title and shots', () => {
    const sb = createCinematicStoryboard('trailer_flow');
    const brief = generateProductionBrief(sb);
    const md = generateProductionMarkdown(brief);

    expect(md).toContain('# Trailer Flow — Production Brief');
    expect(md).toContain('## Shot 1:');
    expect(md).toContain('## Shot 6:');
    expect(md).toContain('**Total shots:** 6');
  });

  it('includes camera, VFX, and audio sections', () => {
    const sb = createCinematicStoryboard('cutscene_sequence');
    const brief = generateProductionBrief(sb);
    const md = generateProductionMarkdown(brief);

    expect(md).toContain('**Camera:**');
    expect(md).toContain('**Audio:**');
  });

  it('includes checklists as markdown checkboxes', () => {
    const sb = createCinematicStoryboard('trailer_flow');
    const brief = generateProductionBrief(sb);
    const md = generateProductionMarkdown(brief);

    expect(md).toContain('- [ ] ');
  });

  it('includes continuity section when present', () => {
    const sb = createCinematicStoryboard('cutscene_sequence');
    const brief = generateProductionBrief(sb);
    const md = generateProductionMarkdown(brief);

    expect(md).toContain('**Continuity:**');
  });
});
