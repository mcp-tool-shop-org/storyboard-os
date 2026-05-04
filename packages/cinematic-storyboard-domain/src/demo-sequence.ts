// ─── Cinematic Domain — Demo Sequence ─────────────────────────────────────────
//
// "Storyboard OS Launch Trailer" — a production-ready trailer storyboard
// that dogfoods the cinematic domain. 8 frames with full production spec.
//
// ─────────────────────────────────────────────────────────────────────────────

import type { Storyboard, StoryboardFrame, StoryboardConnection } from './schema';

const frames: StoryboardFrame[] = [
  {
    id: 'demo-hook', type: 'shot', title: 'Visual Hook',
    summary: 'Dark screen explodes into a Konva canvas with frames and connections appearing.',
    position: { x: 50, y: 200 }, size: { width: 220, height: 140 },
    content: {
      intent: 'Grab attention — visual tool appearing from nothing',
      visualDescription: 'Black → canvas grid fades in → frames materialize with glow → connections draw themselves',
      cameraAngle: 'Screen capture, full canvas view',
      cameraMovement: 'Static then slow zoom into center frame',
      durationEstimate: '3s',
      requiredAssets: ['Screen recording of canvas build animation', 'Sound design whoosh'],
      audioRequirements: ['Subtle electronic whoosh', 'Music bed intro'],
      implementationChecklist: ['Record canvas animation', 'Add frame appearance VFX', 'Mix sound design'],
      testCriteria: ['Visually compelling in <2s', 'Tool nature clear without text'],
    },
    annotations: [],
  },
  {
    id: 'demo-problem', type: 'dialogue', title: 'Problem Statement',
    summary: 'Text overlay or VO: "Story tools capture notes. They don\'t capture implementation."',
    position: { x: 320, y: 200 }, size: { width: 220, height: 140 },
    content: {
      intent: 'State the gap in existing tools',
      visualDescription: 'Split screen: generic tool (vague) vs storyboard-os (structured)',
      cameraAngle: 'Screen comparison layout',
      durationEstimate: '5s',
      dialogue: ['Story tools capture notes.', 'They don\'t capture implementation.'],
      requiredAssets: ['Comparison screenshots', 'Text overlay template', 'VO or text'],
      audioRequirements: ['Voiceover or text sound design'],
      implementationChecklist: ['Create comparison layout', 'Record VO or design text overlays', 'Sync to pacing'],
      testCriteria: ['Problem understood in one sentence', 'Comparison is honest'],
    },
    annotations: [],
  },
  {
    id: 'demo-feature-rpg', type: 'shot', title: 'RPG Vertical Demo',
    summary: 'Show rpg-storyboard: quest board with STATE/SPEC badges, frame inspector open.',
    position: { x: 590, y: 200 }, size: { width: 220, height: 140 },
    content: {
      intent: 'Prove implementation depth with live product footage',
      visualDescription: 'rpg-storyboard canvas with inspector open showing entry conditions, state changes, test criteria',
      cameraAngle: 'Full app screenshot, then zoom to inspector',
      cameraMovement: 'Smooth zoom from canvas overview to frame detail',
      framing: 'Left: canvas context. Right: inspector detail.',
      durationEstimate: '6s',
      requiredAssets: ['rpg-storyboard running with Tollhouse Ledger', 'Screen recording'],
      implementationChecklist: ['Record app with demo quest open', 'Zoom to show badge detail', 'Highlight spec fields'],
      testCriteria: ['Spec fields visible without pausing', 'Badges read at small size'],
    },
    annotations: [],
  },
  {
    id: 'demo-feature-marketing', type: 'shot', title: 'Marketing Vertical Demo',
    summary: 'Show marketing-storyboard: campaign board with launch readiness badge and blockers panel.',
    position: { x: 860, y: 200 }, size: { width: 220, height: 140 },
    content: {
      intent: 'Prove multi-vertical: same platform, different domain',
      visualDescription: 'marketing-storyboard canvas with CRITICAL path badges, AT RISK header badge, blockers panel visible',
      cameraAngle: 'Full app screenshot, then zoom to blockers panel',
      cameraMovement: 'Pan from header badge to right panel',
      framing: 'Full board view showing campaign flow',
      durationEstimate: '5s',
      requiredAssets: ['marketing-storyboard running with demo campaign', 'Screen recording'],
      continuityRequirements: ['Same visual style as RPG demo — proves same canvas'],
      implementationChecklist: ['Record marketing app', 'Show launch readiness badge', 'Pan to blockers panel'],
      testCriteria: ['Multi-vertical is obvious', 'Launch readiness concept clear'],
    },
    annotations: [],
  },
  {
    id: 'demo-architecture', type: 'vfx', title: 'Architecture Diagram',
    summary: 'Animated package diagram showing core → domains → apps with zero cross-imports.',
    position: { x: 1130, y: 100 }, size: { width: 220, height: 140 },
    content: {
      intent: 'Communicate clean architecture as a feature',
      visualDescription: 'Animated node diagram: core at bottom, two domains branching, two apps at top, arrows flowing up only',
      durationEstimate: '4s',
      vfxRequirements: ['Motion graphics: node appear animation', 'Arrow draw-on animation', 'Glow on zero-coupling label'],
      audioRequirements: ['Subtle click sounds as nodes appear'],
      requiredAssets: ['Package diagram design', 'Motion graphics template'],
      implementationChecklist: ['Design diagram layout', 'Animate node appearances', 'Add labels', 'Sound design clicks'],
      testCriteria: ['Architecture readable at video resolution', 'Zero-coupling message clear'],
    },
    annotations: [],
  },
  {
    id: 'demo-stats', type: 'edit_beat', title: 'Stats Montage',
    summary: 'Quick-cut stats: 511 tests, 45 pages, 5 packages, 2 apps, 0 cross-domain imports.',
    position: { x: 1130, y: 340 }, size: { width: 220, height: 140 },
    content: {
      intent: 'Land credibility through concrete numbers',
      durationEstimate: '3s',
      editNotes: 'Rapid-fire text cards: each stat appears for 0.5s. Music syncs to each card hit.',
      requiredAssets: ['Stat card designs × 5', 'Music beat sync points'],
      audioRequirements: ['Percussive hits on each stat reveal'],
      implementationChecklist: ['Design stat cards', 'Time to music beats', 'Test readability at 0.5s/card'],
      testCriteria: ['Each stat readable', 'Pacing feels punchy not rushed'],
    },
    annotations: [],
  },
  {
    id: 'demo-cinematic-meta', type: 'camera_move', title: 'Meta: This Trailer Was Planned Here',
    summary: 'Camera pulls out to reveal the trailer itself as a cinematic-storyboard board.',
    position: { x: 1400, y: 200 }, size: { width: 220, height: 140 },
    content: {
      intent: 'Meta moment: the product planned this very trailer — dogfood proof',
      visualDescription: 'Zoom out from current frame to reveal the full cinematic-storyboard board with all 8 frames visible',
      cameraMovement: 'Smooth zoom-out from single frame to full board',
      cameraAngle: 'Starts tight on one frame, ends on full canvas',
      framing: 'Full board visible at end with this frame highlighted',
      durationEstimate: '4s',
      continuityRequirements: ['Board matches actual trailer structure being watched'],
      requiredAssets: ['cinematic-storyboard app running with this demo sequence loaded'],
      vfxRequirements: ['Highlight glow on current frame during zoom-out'],
      implementationChecklist: ['Record cinematic board zoom-out', 'Add glow VFX on meta frame', 'Time for "aha" moment'],
      testCriteria: ['Viewer gets the meta moment', 'Board structure matches trailer they just watched'],
    },
    annotations: [],
  },
  {
    id: 'demo-cta', type: 'edit_beat', title: 'CTA: Try Storyboard OS',
    summary: 'Title card with repo URL, "pnpm install && pnpm dev", and platform badges.',
    position: { x: 1670, y: 200 }, size: { width: 220, height: 140 },
    content: {
      intent: 'Convert to clone/star/try',
      durationEstimate: '4s',
      editNotes: 'Hard cut to dark card. Logo appears. URL types itself. Hold for read time. Music resolves.',
      requiredAssets: ['Logo treatment', 'GitHub URL', 'Install command', 'Music sting'],
      audioRequirements: ['Music resolve to final chord', 'Optional keyboard typing SFX for URL'],
      implementationChecklist: ['Design CTA card', 'Animate URL typing', 'Add logo', 'Time music resolve', 'Hold 2s for reading'],
      testCriteria: ['URL readable', 'Action clear (clone/star)', 'Professional close'],
    },
    annotations: [],
  },
];

const connections: StoryboardConnection[] = [
  { id: 'dc-1', fromFrameId: 'demo-hook', toFrameId: 'demo-problem', type: 'sequence' },
  { id: 'dc-2', fromFrameId: 'demo-problem', toFrameId: 'demo-feature-rpg', type: 'sequence' },
  { id: 'dc-3', fromFrameId: 'demo-feature-rpg', toFrameId: 'demo-feature-marketing', type: 'match_cut' },
  { id: 'dc-4', fromFrameId: 'demo-feature-marketing', toFrameId: 'demo-architecture', type: 'sequence' },
  { id: 'dc-5', fromFrameId: 'demo-feature-marketing', toFrameId: 'demo-stats', type: 'parallel_action' },
  { id: 'dc-6', fromFrameId: 'demo-architecture', toFrameId: 'demo-cinematic-meta', type: 'sequence' },
  { id: 'dc-7', fromFrameId: 'demo-stats', toFrameId: 'demo-cinematic-meta', type: 'sequence' },
  { id: 'dc-8', fromFrameId: 'demo-cinematic-meta', toFrameId: 'demo-cta', type: 'match_cut' },
];

export const storyboardOsLaunchTrailer: Storyboard = {
  id: 'demo-launch-trailer',
  title: 'Storyboard OS Launch Trailer',
  description: 'Production storyboard for the Storyboard OS launch trailer. 8 shots with full camera language, asset requirements, and edit readiness. Dogfoods the cinematic domain.',
  frames,
  connections,
};
