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

  it('stamps formatVersion: 1 for downstream importers (PR-004)', () => {
    const brief = generateProductionBrief(createCinematicStoryboard('trailer_flow'));
    expect(brief.formatVersion).toBe(1);
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

  it('orders shots by graph topology, not array order', () => {
    // Frames are intentionally listed out of flow order: B comes before A in
    // the array but A → B in the connection graph. The production brief must
    // walk the graph in flow order so the resulting shot list reads as it
    // would in playback.
    const storyboard: Storyboard = {
      id: 'topo-test',
      title: 'Topology Test',
      frames: [
        makeFrame('B', 'shot', { visualDescription: 'second shot' }),
        makeFrame('A', 'shot', { visualDescription: 'first shot' }),
        makeFrame('C', 'shot', { visualDescription: 'third shot' }),
      ],
      connections: [
        { id: 'c1', fromFrameId: 'A', toFrameId: 'B', type: 'sequence' },
        { id: 'c2', fromFrameId: 'B', toFrameId: 'C', type: 'sequence' },
      ],
    };

    const brief = generateProductionBrief(storyboard);
    expect(brief.shots.map(s => s.frameId)).toEqual(['A', 'B', 'C']);
    expect(brief.shots[0].shotNumber).toBe(1);
    expect(brief.shots[1].shotNumber).toBe(2);
    expect(brief.shots[2].shotNumber).toBe(3);
  });

  it('appends cycle members at the end of the topological order', () => {
    // Cycle: A → B → A. Neither has in-degree 0; both must still appear in
    // the brief (no shot may be silently dropped). Cycle members are appended
    // in original array order after the BFS-reachable frames.
    const storyboard: Storyboard = {
      id: 'cycle-test',
      title: 'Cycle Test',
      frames: [
        makeFrame('A', 'shot', { visualDescription: 'a' }),
        makeFrame('B', 'shot', { visualDescription: 'b' }),
      ],
      connections: [
        { id: 'c1', fromFrameId: 'A', toFrameId: 'B', type: 'sequence' },
        { id: 'c2', fromFrameId: 'B', toFrameId: 'A', type: 'sequence' },
      ],
    };

    const brief = generateProductionBrief(storyboard);
    expect(brief.shots).toHaveLength(2);
    const ids = brief.shots.map(s => s.frameId).sort();
    expect(ids).toEqual(['A', 'B']);
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

// ─── DM-004 — markdown escapes user text ──────────────────────────────────────

describe('DM-004 — markdown escapes user text', () => {
  const HOSTILE = '`code` <img src=x onerror=x> | pipe';

  function makeBoardWith(frames: StoryboardFrame[], description = ''): Storyboard {
    return { id: 'sb-1', title: 'Test Sequence', description, frames, connections: [] };
  }

  it('neutralizes backticks, raw HTML, and pipes in shot titles', () => {
    const frame = makeFrame('f1', 'sequence', {});
    frame.title = HOSTILE;
    const md = generateProductionMarkdown(generateProductionBrief(makeBoardWith([frame])));
    expect(md).not.toContain('<img');       // raw HTML inert
    expect(md).toContain('&lt;img');
    expect(md).not.toContain('`code`');     // backticks cannot open a code span
    expect(md).toContain('\\`code\\`');
    expect(md).toContain('\\|');            // pipes escaped
  });

  it('prevents heading hijack from a leading "# " in the description', () => {
    const frame = makeFrame('f1', 'sequence', {});
    const md = generateProductionMarkdown(
      generateProductionBrief(makeBoardWith([frame], '# Fake Heading')),
    );
    expect(md).not.toMatch(/^# Fake Heading/m);
    expect(md).toContain('\\# Fake Heading');
  });

  it('escapes the storyboard title in the document heading', () => {
    const frame = makeFrame('f1', 'sequence', {});
    const board = makeBoardWith([frame]);
    board.title = 'Trailer <script>alert(1)</script>';
    const md = generateProductionMarkdown(generateProductionBrief(board));
    expect(md).not.toContain('<script>');
    expect(md).toContain('&lt;script>');
  });

  it('escapes dialogue lines and visual descriptions', () => {
    const frame = makeFrame('f1', 'shot', {
      visualDescription: 'wide shot with `ticks`',
      dialogue: ['<img src=x onerror=x>'],
    });
    const md = generateProductionMarkdown(generateProductionBrief(makeBoardWith([frame])));
    expect(md).not.toContain('<img');
    expect(md).toContain('&lt;img');
    expect(md).not.toContain('`ticks`');
  });
});

// ─── V3-001 — benign text round-trips unchanged (faithfulness) ────────────────
//
// The escaping tests above prove hostile input is neutralized. This guards the
// other direction: ordinary text with NO markdown-special characters must
// survive the render byte-for-byte — no stray backslashes, no &lt;, no mangling.

describe('V3-001 — benign text renders unchanged (no over-escaping)', () => {
  function makeBoardWith(frames: StoryboardFrame[], description = ''): Storyboard {
    return { id: 'sb-1', title: 'Test Sequence', description, frames, connections: [] };
  }

  it('preserves an ordinary title, visual, and checklist/asset items verbatim', () => {
    const frame = makeFrame('f1', 'shot', {
      intent: 'Establish the tollhouse at dusk.',
      visualDescription: 'A wide shot of the tollhouse.',
      requiredAssets: ['assets/tollhouse-exterior.png'],
      implementationChecklist: ['Block the establishing shot'],
      testCriteria: ['Framing matches the boards'],
    });
    frame.title = 'Shot Alpha';
    const md = generateProductionMarkdown(generateProductionBrief(makeBoardWith([frame])));

    expect(md).toContain('Shot Alpha');
    expect(md).toContain('Establish the tollhouse at dusk.');
    expect(md).toContain('A wide shot of the tollhouse.');
    expect(md).toContain('assets/tollhouse-exterior.png');
    expect(md).toContain('Block the establishing shot');
    expect(md).toContain('Framing matches the boards');
    // Enum-derived type label is not escaped and reads plainly.
    expect(md).toContain('**Type:** shot');
    // No collateral damage from escaping a string that needed none.
    expect(md).not.toContain('\\');
    expect(md).not.toContain('&lt;');
  });
});
