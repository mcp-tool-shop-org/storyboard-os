// ─── Cinematic Domain — Templates ────────────────────────────────────────────

import type { StoryboardFrame, Storyboard, StoryboardConnection } from './schema';

export type CinematicTemplateId = 'trailer_flow' | 'cutscene_sequence' | 'explainer_video';

export interface CinematicTemplateDefinition {
  id: CinematicTemplateId;
  name: string;
  frameCount: number;
  bestFor: string;
  rationale: string;
  createStoryboard: () => Storyboard;
}

// ─── Helper ───────────────────────────────────────────────────────────────────

/**
 * Per-invocation id factory. Each template call gets a fresh counter so that
 * connection and frame ids never collide between two storyboards returned
 * from the same template (or different templates) inside a single process.
 *
 * Frame ids combine a stable slug (`trailer-hook`) with the per-invocation
 * counter (`f-1`), so each call produces ids like `trailer-hook-f-1` — unique
 * across invocations, still slug-readable in URLs and logs.
 */
// Module-level counter so ids are unique across every invocation in the
// process. F-VR-204: returning a fresh counter from each makeUid() call meant
// two invocations of the same template produced identical frame ids.
let _moduleUidCounter = 0;
function makeUid(): (prefix: string) => string {
  return (prefix: string) => `${prefix}-${++_moduleUidCounter}`;
}

// ─── Trailer Flow ─────────────────────────────────────────────────────────────

function createTrailerFlow(): Storyboard {
  const uid = makeUid();
  // Per-invocation frame id factory. Two calls to createTrailerFlow() would
  // otherwise produce two storyboards with colliding frame ids (e.g. two frames
  // both called 'trailer-hook'). Same pattern as RPG/Marketing templates.
  const fid = (slug: string) => `${slug}-${uid('f')}`;
  const hook = fid('trailer-hook');
  const establish = fid('trailer-establish');
  const feature = fid('trailer-feature');
  const tension = fid('trailer-tension');
  const proof = fid('trailer-proof');
  const cta = fid('trailer-cta');
  const frames: StoryboardFrame[] = [
    {
      id: hook, type: 'shot', title: 'Hook Shot',
      summary: 'Opening visual that grabs attention in the first 2 seconds.',
      position: { x: 50, y: 200 }, size: { width: 220, height: 140 },
      content: {
        intent: 'Immediate visual hook — viewer decides to keep watching',
        visualDescription: 'High-impact visual or motion that creates curiosity',
        cameraAngle: 'Close-up or extreme wide establishing scale',
        durationEstimate: '2-3s',
        requiredAssets: ['Hero visual asset', 'Sound design hit'],
        implementationChecklist: ['Draft visual concept', 'Source or create opening asset', 'Time to music beat'],
        testCriteria: ['Viewer attention captured in <2s', 'Visual matches brand/product tone'],
      },
      annotations: [],
    },
    {
      id: establish, type: 'sequence', title: 'Establishing Context',
      summary: 'Set the world, product, or story context for the viewer.',
      position: { x: 320, y: 200 }, size: { width: 220, height: 140 },
      content: {
        intent: 'Anchor the viewer in what this is about',
        visualDescription: 'Wide shot or montage establishing context',
        cameraAngle: 'Wide or medium establishing',
        cameraMovement: 'Slow push-in or static',
        durationEstimate: '4-6s',
        requiredAssets: ['Context visuals', 'Background music bed'],
        implementationChecklist: ['Establish visual world', 'Set tone with music', 'Clear genre/product signal'],
        testCriteria: ['Viewer understands the subject within 5s'],
      },
      annotations: [],
    },
    {
      id: feature, type: 'shot', title: 'Feature Reveal',
      summary: 'Show the core feature, mechanic, or story premise.',
      position: { x: 590, y: 200 }, size: { width: 220, height: 140 },
      content: {
        intent: 'Deliver the value proposition visually',
        visualDescription: 'Clear demonstration of the key feature or dramatic premise',
        cameraAngle: 'Medium shot showing detail',
        framing: 'Subject centered, clean composition',
        durationEstimate: '5-8s',
        requiredAssets: ['Feature footage/animation', 'UI captures or gameplay'],
        implementationChecklist: ['Capture/render feature footage', 'Edit to highlight key moment', 'Add text overlay if needed'],
        testCriteria: ['Feature understood without voiceover', 'Visual quality matches release standard'],
      },
      annotations: [],
    },
    {
      id: tension, type: 'edit_beat', title: 'Tension Build',
      summary: 'Escalate pacing to create anticipation before the payoff.',
      position: { x: 860, y: 200 }, size: { width: 220, height: 140 },
      content: {
        intent: 'Build emotional momentum — faster cuts, rising music',
        durationEstimate: '4-6s',
        editNotes: 'Increase cut frequency. Music rises. Shots get shorter. Build to peak.',
        actionNotes: ['Montage of features/moments', 'Each shot shorter than the last'],
        audioRequirements: ['Rising music track', 'Rhythmic sound design'],
        implementationChecklist: ['Select 4-6 quick-cut shots', 'Time cuts to music beats', 'Build audio intensity'],
        testCriteria: ['Pacing feels accelerating', 'Viewer anticipation peaks'],
      },
      annotations: [],
    },
    {
      id: proof, type: 'shot', title: 'Proof / Social Proof',
      summary: 'Show evidence: reviews, stats, gameplay footage, testimonials.',
      position: { x: 1130, y: 200 }, size: { width: 220, height: 140 },
      content: {
        intent: 'Provide credibility or evidence of quality',
        visualDescription: 'Quote cards, review scores, real footage, or community response',
        cameraAngle: 'Clean graphic framing or direct capture',
        durationEstimate: '3-5s',
        requiredAssets: ['Review quotes or stats', 'Social proof visuals'],
        implementationChecklist: ['Gather proof assets', 'Design quote/stat cards', 'Integrate with pacing'],
        testCriteria: ['Credibility signal is clear', 'Does not break visual flow'],
      },
      annotations: [],
    },
    {
      id: cta, type: 'edit_beat', title: 'CTA / Title Card',
      summary: 'Final frame: title, release date, call-to-action.',
      position: { x: 1400, y: 200 }, size: { width: 220, height: 140 },
      content: {
        intent: 'Convert viewer attention into action',
        visualDescription: 'Title card with logo, date, and CTA (wishlist, download, subscribe)',
        durationEstimate: '3-4s',
        editNotes: 'Hard cut to title. Music resolves. CTA text appears. Hold for read time.',
        requiredAssets: ['Logo/title treatment', 'CTA text', 'Music sting/resolve'],
        audioRequirements: ['Music resolve or final hit'],
        implementationChecklist: ['Design title card', 'Add CTA text', 'Time music resolve', 'Add platform logos if needed'],
        testCriteria: ['CTA is readable', 'Viewer knows what to do next', 'Hold time sufficient for reading'],
      },
      annotations: [],
    },
  ];

  const connections: StoryboardConnection[] = [
    { id: uid('c'), fromFrameId: hook, toFrameId: establish, type: 'sequence' },
    { id: uid('c'), fromFrameId: establish, toFrameId: feature, type: 'sequence' },
    { id: uid('c'), fromFrameId: feature, toFrameId: tension, type: 'sequence' },
    { id: uid('c'), fromFrameId: tension, toFrameId: proof, type: 'sequence' },
    { id: uid('c'), fromFrameId: proof, toFrameId: cta, type: 'match_cut' },
  ];

  return {
    id: 'template-trailer-flow',
    title: 'Trailer Flow',
    description: 'Hook → Context → Feature → Tension → Proof → CTA. Best for product/game trailers, release videos, repo promos.',
    templateId: 'trailer_flow',
    frames,
    connections,
  };
}

// ─── Cutscene Sequence ────────────────────────────────────────────────────────

function createCutsceneSequence(): Storyboard {
  const uid = makeUid();
  const fid = (slug: string) => `${slug}-${uid('f')}`;
  const establish = fid('cutscene-establish');
  const character = fid('cutscene-character');
  const reveal = fid('cutscene-reveal');
  const reaction = fid('cutscene-reaction');
  const action = fid('cutscene-action');
  const exit = fid('cutscene-exit');
  const frames: StoryboardFrame[] = [
    {
      id: establish, type: 'shot', title: 'Establishing Shot',
      summary: 'Set location, time, mood for the cinematic.',
      position: { x: 50, y: 200 }, size: { width: 220, height: 140 },
      content: {
        intent: 'Ground the viewer in space and time',
        visualDescription: 'Wide establishing shot of location',
        cameraAngle: 'Wide/extreme wide',
        cameraMovement: 'Slow pan or static hold',
        framing: 'Location-dominant, characters small or absent',
        durationEstimate: '3-5s',
        continuityRequirements: ['Time of day consistent with scene context', 'Weather matches narrative'],
        requiredAssets: ['Environment art/render', 'Ambient audio'],
        audioRequirements: ['Ambient soundscape', 'Optional score intro'],
        implementationChecklist: ['Render/capture establishing shot', 'Set lighting for time of day', 'Mix ambient audio'],
        testCriteria: ['Location reads clearly', 'Mood established in first frame'],
      },
      annotations: [],
    },
    {
      id: character, type: 'dialogue', title: 'Character Beat',
      summary: 'Character introduction or key dialogue delivery.',
      position: { x: 320, y: 200 }, size: { width: 220, height: 140 },
      content: {
        intent: 'Introduce or develop character through performance',
        visualDescription: 'Medium shot of character speaking or reacting',
        cameraAngle: 'Medium close-up',
        framing: 'Character at rule-of-thirds, eye-line to camera or off-camera subject',
        dialogue: ['[Character name]: Key dialogue line', '[Character name]: Response or internal thought'],
        continuityRequirements: ['Character wardrobe matches scene', 'Lighting direction consistent with establishing'],
        requiredAssets: ['Character model/actor', 'Dialogue VO recording', 'Lip sync data'],
        audioRequirements: ['Dialogue recording', 'Room tone', 'Foley for movement'],
        durationEstimate: '5-10s',
        implementationChecklist: ['Record/animate dialogue', 'Sync lip movement', 'Set character lighting', 'Add subtle idle animation'],
        testCriteria: ['Dialogue audible and clear', 'Performance conveys intended emotion', 'No continuity break from previous shot'],
      },
      annotations: [],
    },
    {
      id: reveal, type: 'camera_move', title: 'Reveal',
      summary: 'Camera reveals key information, object, or twist.',
      position: { x: 590, y: 200 }, size: { width: 220, height: 140 },
      content: {
        intent: 'Deliver story information through camera movement',
        visualDescription: 'Camera pulls back, racks focus, or tracks to reveal new element',
        cameraMovement: 'Pull-back reveal or rack focus',
        cameraAngle: 'Shifts from tight to wide during move',
        framing: 'Subject hidden then revealed through movement',
        durationEstimate: '3-5s',
        continuityRequirements: ['Revealed element established in prior or subsequent shot'],
        requiredAssets: ['Reveal target asset', 'Camera path animation'],
        vfxRequirements: ['Depth of field shift if using rack focus'],
        implementationChecklist: ['Animate camera path', 'Time reveal beat', 'Add focus pull if needed', 'Sound design for reveal moment'],
        testCriteria: ['Reveal is legible', 'Timing creates intended emotional beat', 'Camera movement smooth'],
      },
      annotations: [],
    },
    {
      id: reaction, type: 'shot', title: 'Reaction Shot',
      summary: 'Character or environment reacts to the reveal.',
      position: { x: 860, y: 200 }, size: { width: 220, height: 140 },
      content: {
        intent: 'Show emotional impact of the reveal on characters/world',
        visualDescription: 'Close-up reaction: expression, gesture, or environmental response',
        cameraAngle: 'Close-up',
        framing: 'Face fills frame, eyes at upper-third',
        durationEstimate: '2-4s',
        continuityRequirements: ['Eyeline matches reveal direction', 'Emotional state escalates from previous'],
        requiredAssets: ['Character facial animation/performance', 'Reaction audio'],
        implementationChecklist: ['Animate reaction', 'Hold beat for emotional read', 'Cut point matches action'],
        testCriteria: ['Emotion reads without dialogue', 'Continuity with reveal shot maintained'],
      },
      annotations: [],
    },
    {
      id: action, type: 'action', title: 'Action Shift',
      summary: 'Scene shifts into action or consequence.',
      position: { x: 1130, y: 200 }, size: { width: 220, height: 140 },
      content: {
        intent: 'Translate emotional beat into physical/narrative action',
        visualDescription: 'Character moves, environment changes, or action begins',
        cameraAngle: 'Medium or wide to show action scope',
        cameraMovement: 'Track with character or quick reframe',
        durationEstimate: '4-8s',
        actionNotes: ['Character stands/turns/draws weapon/runs', 'Environment responds (door opens, explosion, etc.)'],
        continuityRequirements: ['Action direction consistent', 'Props/objects from previous shots present'],
        requiredAssets: ['Action animation', 'VFX if needed', 'Sound design for action'],
        audioRequirements: ['Action foley', 'Music shift'],
        implementationChecklist: ['Animate action sequence', 'Time camera to action', 'Add VFX layers', 'Mix action audio'],
        testCriteria: ['Action reads clearly', 'Pacing drives forward momentum', 'No spatial continuity errors'],
      },
      annotations: [],
    },
    {
      id: exit, type: 'transition', title: 'Exit Beat',
      summary: 'Scene closes — transition to next sequence or black.',
      position: { x: 1400, y: 200 }, size: { width: 220, height: 140 },
      content: {
        intent: 'Close the cinematic moment cleanly',
        visualDescription: 'Fade, hard cut, or motivated transition out of scene',
        durationEstimate: '2-3s',
        editNotes: 'Cut to black, dissolve, or match-cut to next scene. Music resolves or cuts abruptly for tension.',
        audioRequirements: ['Music resolve or abrupt silence', 'Final ambient tail'],
        continuityRequirements: ['Exit state matches next scene entry if applicable'],
        implementationChecklist: ['Choose transition type', 'Time music resolve', 'Render final frame hold'],
        testCriteria: ['Transition feels intentional', 'No hanging audio', 'Scene closure is satisfying'],
      },
      annotations: [],
    },
  ];

  const connections: StoryboardConnection[] = [
    { id: uid('c'), fromFrameId: establish, toFrameId: character, type: 'sequence' },
    { id: uid('c'), fromFrameId: character, toFrameId: reveal, type: 'sequence' },
    { id: uid('c'), fromFrameId: reveal, toFrameId: reaction, type: 'reaction' },
    { id: uid('c'), fromFrameId: reaction, toFrameId: action, type: 'sequence' },
    { id: uid('c'), fromFrameId: action, toFrameId: exit, type: 'transition' },
  ];

  return {
    id: 'template-cutscene-sequence',
    title: 'Cutscene Sequence',
    description: 'Establishing → Character → Reveal → Reaction → Action → Exit. Best for RPG/game cinematics.',
    templateId: 'cutscene_sequence',
    frames,
    connections,
  };
}

// ─── Explainer Video ──────────────────────────────────────────────────────────

function createExplainerVideo(): Storyboard {
  const uid = makeUid();
  const fid = (slug: string) => `${slug}-${uid('f')}`;
  const problem = fid('explainer-problem');
  const metaphor = fid('explainer-metaphor');
  const demo = fid('explainer-demo');
  const proof = fid('explainer-proof');
  const outcome = fid('explainer-outcome');
  const cta = fid('explainer-cta');
  const frames: StoryboardFrame[] = [
    {
      id: problem, type: 'shot', title: 'Problem',
      summary: 'Show the pain point or challenge the viewer faces.',
      position: { x: 50, y: 200 }, size: { width: 220, height: 140 },
      content: {
        intent: 'Create recognition — viewer sees their own problem',
        visualDescription: 'Visual metaphor or direct representation of the problem',
        cameraAngle: 'Medium shot or screen capture showing friction',
        durationEstimate: '5-8s',
        dialogue: ['Voiceover: State the problem clearly'],
        requiredAssets: ['Problem visualization', 'VO recording'],
        audioRequirements: ['Voiceover', 'Subtle tension music'],
        implementationChecklist: ['Script problem statement', 'Record VO', 'Create problem visual', 'Time to VO cadence'],
        testCriteria: ['Problem is immediately recognizable', 'Viewer nods within 5s'],
      },
      annotations: [],
    },
    {
      id: metaphor, type: 'vfx', title: 'Visual Metaphor',
      summary: 'Abstract or visual analogy that makes the concept tangible.',
      position: { x: 320, y: 200 }, size: { width: 220, height: 140 },
      content: {
        intent: 'Make abstract concept concrete through visual storytelling',
        visualDescription: 'Animated metaphor, diagram, or visual transformation',
        durationEstimate: '4-6s',
        vfxRequirements: ['Motion graphics for metaphor', 'Transition animation from problem to solution space'],
        dialogue: ['Voiceover: Bridge from problem to solution concept'],
        requiredAssets: ['Metaphor animation assets', 'VO recording'],
        implementationChecklist: ['Design metaphor visual', 'Animate transition', 'Sync to VO', 'Test clarity with naive viewer'],
        testCriteria: ['Metaphor understood without explanation', 'Visual transition smooth'],
      },
      annotations: [],
    },
    {
      id: demo, type: 'shot', title: 'Demonstration',
      summary: 'Show the product/solution in action — not features, outcomes.',
      position: { x: 590, y: 200 }, size: { width: 220, height: 140 },
      content: {
        intent: 'Prove the solution works through demonstration',
        visualDescription: 'Screen capture, product footage, or animated walkthrough',
        cameraAngle: 'Screen capture with cursor/highlight or close product shot',
        durationEstimate: '8-15s',
        dialogue: ['Voiceover: Walk through the key action or workflow'],
        requiredAssets: ['Product footage/capture', 'Cursor highlights', 'VO recording'],
        audioRequirements: ['Voiceover', 'UI sounds or subtle music'],
        implementationChecklist: ['Capture demo footage', 'Add highlights/callouts', 'Record VO walkthrough', 'Edit to essential actions only'],
        testCriteria: ['Demo is followable without pausing', 'Key value visible in first 5s of demo'],
      },
      annotations: [],
    },
    {
      id: proof, type: 'shot', title: 'Proof',
      summary: 'Evidence that the solution delivers: stats, testimonials, results.',
      position: { x: 860, y: 200 }, size: { width: 220, height: 140 },
      content: {
        intent: 'Build credibility with concrete evidence',
        visualDescription: 'Stats, quotes, before/after, or social proof',
        cameraAngle: 'Clean graphic framing',
        durationEstimate: '4-6s',
        dialogue: ['Voiceover: State key result or proof point'],
        requiredAssets: ['Proof data/quotes', 'Graphic templates'],
        implementationChecklist: ['Gather proof points', 'Design proof cards', 'Record VO', 'Time for readability'],
        testCriteria: ['Proof is specific not vague', 'Readable in allocated time'],
      },
      annotations: [],
    },
    {
      id: outcome, type: 'sequence', title: 'Outcome',
      summary: 'Show the end state — what life/work looks like after adoption.',
      position: { x: 1130, y: 200 }, size: { width: 220, height: 140 },
      content: {
        intent: 'Paint the after picture — viewer wants this state',
        visualDescription: 'Smooth workflow, happy result, or transformation complete',
        durationEstimate: '4-6s',
        dialogue: ['Voiceover: Describe the transformed state'],
        requiredAssets: ['Outcome visualization', 'VO recording'],
        audioRequirements: ['Uplifting music shift', 'Voiceover'],
        implementationChecklist: ['Create outcome visual', 'Record VO', 'Music shift at transition point'],
        testCriteria: ['Outcome is desirable', 'Contrast with problem is clear'],
      },
      annotations: [],
    },
    {
      id: cta, type: 'edit_beat', title: 'CTA',
      summary: 'Call-to-action: what the viewer should do next.',
      position: { x: 1400, y: 200 }, size: { width: 220, height: 140 },
      content: {
        intent: 'Convert viewer into actor — one clear next step',
        durationEstimate: '3-4s',
        editNotes: 'Title card with single CTA. Music resolves. URL/button visible. Hold for read time.',
        dialogue: ['Voiceover: Clear instruction — Try it free / Sign up / Download now'],
        requiredAssets: ['CTA card design', 'URL/link', 'Logo', 'Final VO line'],
        audioRequirements: ['Music resolve', 'VO CTA delivery'],
        implementationChecklist: ['Design CTA card', 'Record CTA VO', 'Time hold for readability', 'Add end screen elements'],
        testCriteria: ['CTA is one clear action', 'Readable without pausing', 'Viewer knows what to do'],
      },
      annotations: [],
    },
  ];

  const connections: StoryboardConnection[] = [
    { id: uid('c'), fromFrameId: problem, toFrameId: metaphor, type: 'sequence' },
    { id: uid('c'), fromFrameId: metaphor, toFrameId: demo, type: 'sequence' },
    { id: uid('c'), fromFrameId: demo, toFrameId: proof, type: 'sequence' },
    { id: uid('c'), fromFrameId: proof, toFrameId: outcome, type: 'match_cut' },
    { id: uid('c'), fromFrameId: outcome, toFrameId: cta, type: 'sequence' },
  ];

  return {
    id: 'template-explainer-video',
    title: 'Explainer Video',
    description: 'Problem → Metaphor → Demo → Proof → Outcome → CTA. Best for creator tools, product demos, launch assets.',
    templateId: 'explainer_video',
    frames,
    connections,
  };
}

// ─── Template registry ────────────────────────────────────────────────────────

export const CINEMATIC_TEMPLATES: CinematicTemplateDefinition[] = [
  {
    id: 'trailer_flow',
    name: 'Trailer Flow',
    frameCount: 6,
    bestFor: 'Product/game trailers, release videos, repo promos',
    rationale: 'Hook → Context → Feature → Tension → Proof → CTA. Optimized for viewer retention and conversion.',
    createStoryboard: createTrailerFlow,
  },
  {
    id: 'cutscene_sequence',
    name: 'Cutscene Sequence',
    frameCount: 6,
    bestFor: 'RPG/game cinematics, animated scenes, story beats',
    rationale: 'Establishing → Character → Reveal → Reaction → Action → Exit. Follows cinematic grammar for emotional beats.',
    createStoryboard: createCutsceneSequence,
  },
  {
    id: 'explainer_video',
    name: 'Explainer Video',
    frameCount: 6,
    bestFor: 'Creator tools, product demos, launch assets, onboarding videos',
    rationale: 'Problem → Metaphor → Demo → Proof → Outcome → CTA. Optimized for comprehension and conversion.',
    createStoryboard: createExplainerVideo,
  },
];

/**
 * Look up a cinematic template by id.
 *
 * Returns `undefined` for an unknown id, matching the parity contract with
 * `getMarketingTemplate` and `getStoryboardTemplate` (RPG). The historical
 * throwing behavior was an API drift caught in Wave 6 review (F-VR-205).
 *
 * Callers that want the throwing behavior should use `createCinematicStoryboard`,
 * which validates the id and throws for an unknown template.
 */
export function getCinematicTemplate(id: CinematicTemplateId): CinematicTemplateDefinition | undefined {
  return CINEMATIC_TEMPLATES.find(t => t.id === id);
}

export function createCinematicStoryboard(templateId: CinematicTemplateId): Storyboard {
  const template = getCinematicTemplate(templateId);
  if (!template) {
    throw new Error(`Unknown cinematic template: ${templateId}`);
  }
  return template.createStoryboard();
}
