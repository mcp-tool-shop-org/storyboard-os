// ─── Cinematic Domain — Templates ────────────────────────────────────────────
//
// Gold-SPEC worked examples (T1). Camera grammar is cinematic Sequencer
// language a shot list can use: shot size · lens/FOV · move. Not a 35°
// sprite-turnaround orbit. Sequences remain the authored unit.

import type { StoryboardFrame, Storyboard, StoryboardConnection } from './schema';
import { BOARD_SCHEMA_VERSION } from './schema';

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

const CARD = { width: 220, height: 140 };

// ─── Trailer Flow ─────────────────────────────────────────────────────────────
// Worked example: Ashfall launch trailer — bell / fortress / siege / wishlist.

function createTrailerFlow(): Storyboard {
  const uid = makeUid();
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
      summary: 'Cracked bronze bell fills the frame; embers crawl the fissure until the clapper glows. No logo yet — curiosity only.',
      position: { x: 50, y: 200 }, size: CARD,
      content: {
        intent: 'Hook: embers in the bell in 2s',
        visualDescription: 'ECU interior of a cracked bronze bell. Embers crawl the fissure left-to-right; the clapper ignites on the music downbeat. Black surround, no environment yet.',
        cameraAngle: 'ECU · 85mm T2.0 · FOV 24°',
        cameraMovement: 'Static locked-off; 2-frame handheld micro-settle on the ignite',
        shotSize: 'ECU', lensMm: 85, fovDeg: 24, move: 'static',
        framing: 'Bell rim is a circle inscribed in 1.85; fissure on the right third; clapper dead-center at the hit',
        durationEstimate: '2-3s',
        actionNotes: ['Ember travel 0.0–1.6s along the crack', 'Clapper ignites on the downbeat at 1.8s'],
        continuityRequirements: ['Bell metal reads bronze-green through the rest of the trailer', 'Ember color matches the later shockwave (2000K)'],
        requiredAssets: ['Hero bell hero mesh + interior cavity', 'Ember particle sim', 'Ignite light rig', 'Sound design: ember crawl + ignite hit'],
        vfxRequirements: ['Ember crawl along a geo fissure', 'Clapper ignition flash, 2-frame overexpose'],
        audioRequirements: ['Dry ember crawl', 'Ignite hit synced to picture'],
        editNotes: 'Open from black. No title. Cut on the ignite flash into the establishing crane.',
        implementationChecklist: [
          'Sculpt the bell interior so the ECU reads at 4K',
          'Cache ember sim to the fissure spline',
          'Time the ignite to the music downbeat',
          'Gate the opening 4 frames of black',
        ],
        testCriteria: [
          'Viewer can name the object as a bell before the cut',
          'Ignite lands on the downbeat ±1 frame',
          'No logo or type on screen',
        ],
      },
      annotations: [],
    },
    {
      id: establish, type: 'sequence', title: 'Establishing Context',
      summary: 'Pull out of the bell to an EWS of the ash-choked fortress at blue hour. The world, not the product, is the subject.',
      position: { x: 320, y: 200 }, size: CARD,
      content: {
        intent: 'Plant the fortress in the ash storm',
        visualDescription: 'EWS of a cliff fortress under a blue-hour ash storm. The bell sits in a high tower. Ash sheets left-to-right; a siege camp glows in the valley.',
        cameraAngle: 'EWS · 24mm T2.8 · FOV 73°',
        cameraMovement: 'Crane up 4m over 5s, horizon locked; start on the tower bell, end on the full fortress',
        shotSize: 'EWS', lensMm: 24, fovDeg: 73, move: 'crane',
        framing: 'Horizon on the lower third; tower on the right third at start; fortress spans the frame at end',
        durationEstimate: '4-6s',
        actionNotes: ['Ash sheets continuous L→R', 'Siege-camp torches hold practical flicker'],
        continuityRequirements: ['Blue-hour key from the ECU ignite (same 2000K embers in the belfry)', 'Bell silhouette matches the ECU hero mesh', 'Wind direction L→R for the rest of the trailer'],
        requiredAssets: ['Fortress environment (hero tower + valley camp)', 'Ash storm volume', 'Crane camera rig in Sequencer', 'Score bed: low drone into brass'],
        vfxRequirements: ['Ash volume with colliding sheets', 'Distant torch flicker as sprites, not a character turnaround'],
        audioRequirements: ['Wind bed', 'Distant siege murmur', 'Score drone under the crane'],
        editNotes: 'Cut in on the ECU ignite flash. Hold the crane until the fortress reads, then cut to the feature MS.',
        implementationChecklist: [
          'Block the crane so the bell is readable in frame 1',
          'Cache ash for the 5s move',
          'Match belfry ember color to shot 1',
          'Lay the drone under the move, brass sting at the end',
        ],
        testCriteria: [
          'Fortress reads as a place, not a skybox, by 3s',
          'Bell in the tower is findable without a label',
          'Horizon does not roll during the crane',
        ],
      },
      annotations: [],
    },
    {
      id: feature, type: 'shot', title: 'Feature Reveal',
      summary: 'MS of the player ringing the bell — the core mechanic — as the shockwave starts to form in the belfry.',
      position: { x: 590, y: 200 }, size: CARD,
      content: {
        intent: 'Show the bell-ring mechanic clean',
        visualDescription: 'MS of the player character hauling the bell rope. Dust dumps off the bronze. A spherical shockwave nucleates at the clapper and expands toward camera.',
        cameraAngle: 'MS · 35mm T2.2 · FOV 54°',
        cameraMovement: 'Track left 1.5m with the rope pull; slight boom down 0.4m into the shockwave nucleate',
        shotSize: 'MS', lensMm: 35, fovDeg: 54, move: 'track',
        framing: 'Player on the left third; bell occupies the right half; headroom for the expanding sphere',
        durationEstimate: '5-8s',
        actionNotes: ['Rope pull 0–2s', 'Dust dump on the pull peak', 'Shockwave nucleates at 3s and reaches camera by 7s'],
        continuityRequirements: ['Player wardrobe is the launch-hero kit (cloak + wrapped hands)', 'Bell mesh and crack match shots 1–2', 'Shockwave color 2000K'],
        requiredAssets: ['Player hero animation (rope pull)', 'Bell rope + dust cache', 'Shockwave sphere sim', 'Gameplay HUD off — this is cinematic, not a capture overlay'],
        vfxRequirements: ['Dust dump from bell lip', 'Shockwave nucleate + expansion, refractive edge'],
        audioRequirements: ['Rope creak', 'Bell strike (full body, not the ECU ignite)', 'Shockwave whoosh building'],
        editNotes: 'Enter from the crane. Exit as the shockwave hits lens (white frame) into the tension montage.',
        implementationChecklist: [
          'Animate the rope pull so the strike reads without VO',
          'Cache shockwave to hit lens at 7s',
          'Keep HUD and reticles out of frame',
          'Record a full-body bell strike, not a UI click',
        ],
        testCriteria: [
          'A new viewer can describe the mechanic as "ring the bell" with the sound off',
          'Shockwave hits lens on the music sting',
          'No gameplay HUD',
        ],
      },
      annotations: [],
    },
    {
      id: tension, type: 'edit_beat', title: 'Tension Build',
      summary: 'Accelerating MCU/CU siege cuts timed to the rising score: arrows, collapsing scaffold, fuse, faces. Each shot shorter than the last.',
      position: { x: 860, y: 200 }, size: CARD,
      content: {
        intent: 'Accelerate cuts into the payoff',
        visualDescription: 'Montage: MCU archer loosing, CU scaffold bolts shearing, insert of a fuse racing, CU defender teeth grit. Ash and sparks in every frame.',
        cameraAngle: 'MCU/CU · 50mm T2.0 · FOV 40°',
        cameraMovement: 'Whip pan L→R between plates; last plate is a push-in on the fuse',
        shotSize: 'MCU', lensMm: 50, fovDeg: 40, move: 'pan',
        framing: 'Eyelines alternate L/R to keep the siege spatial; fuse insert is centered',
        durationEstimate: '4-6s',
        actionNotes: ['4–6 plates, each shorter than the last (1.2s → 0.4s)', 'Whip pans on drum hits', 'Fuse is the last plate and the cut-out'],
        continuityRequirements: ['Ash direction still L→R', 'Blue-hour grade holds', 'No daylight plates'],
        requiredAssets: ['Archer plate', 'Scaffold collapse cache', 'Fuse insert', 'Defender CU', 'Percussion edit of the score'],
        vfxRequirements: ['Sparks on bolt shear', 'Fuse burn with ember match to shot 1'],
        audioRequirements: ['Rising percussion', 'Cut-synced whooshes on whip pans', 'Fuse sizzle isolated on the last plate'],
        editNotes: 'Increase cut frequency. Music rises. Last frame of the fuse jump-cuts to the proof shockwave wide.',
        implementationChecklist: [
          'Select 4–6 plates and time them to percussion',
          'Whip-pan in Sequencer, not a sprite orbit',
          'Keep each plate shorter than the one before',
          'Isolate fuse sizzle on the last 8 frames',
        ],
        testCriteria: [
          'Pacing reads as acceleration, not chaos',
          'A viewer can still parse each plate',
          'No 35° turnaround or character-orbit plates',
        ],
      },
      annotations: [],
    },
    {
      id: proof, type: 'shot', title: 'Proof / Social Proof',
      summary: 'Shockwave clears the ash; insert of critic quote cards and a CU of the sky opening over the fortress.',
      position: { x: 1130, y: 200 }, size: CARD,
      content: {
        intent: 'Proof: the shockwave clears the sky',
        visualDescription: 'WS of the fortress as the shockwave blows the ash off the cliffs. Two quote cards (score + pull-quote) fade as lower-thirds, then a CU of clear sky where the storm was.',
        cameraAngle: 'WS then CU · 65mm T2.8 · FOV 31°',
        cameraMovement: 'Static locked-off on the WS; cut to CU of the cleared sky with a slow push-in 0.6m',
        shotSize: 'WS', lensMm: 65, fovDeg: 31, move: 'dolly',
        framing: 'Fortress lower-third in the WS; quote cards sit in the bottom fifth and never cover the tower; CU sky is negative space',
        durationEstimate: '3-5s',
        actionNotes: ['Ash blow-off 0–1.5s', 'Quote card A at 1.2s, card B at 2.2s', 'Cut to sky CU at 3s'],
        continuityRequirements: ['Shockwave is the same sim that hit lens in shot 3', 'Tower silhouette matches the establishing crane'],
        requiredAssets: ['Shockwave-cleared fortress take', 'Two quote-card graphics (score + pull-quote)', 'Clear-sky plate'],
        vfxRequirements: ['Ash blow-off driven by the shockwave cache', 'Quote cards as comps, not in-world props'],
        audioRequirements: ['Shockwave tail', 'Silence under the quotes (music drops 6dB)', 'High air on the sky CU'],
        editNotes: 'Enter from the fuse. Music ducks under quotes. Match-cut the cleared sky into the title card.',
        implementationChecklist: [
          'Drive ash with the shot-3 shockwave cache',
          'Design two quote cards readable at 1920×1080 in 1s',
          'Do not cover the tower with type',
          'Duck music 6dB under the cards',
        ],
        testCriteria: [
          'Quotes readable without pausing',
          'Tower still findable under the cards',
          'Sky CU match-cuts to the title-card background',
        ],
      },
      annotations: [],
    },
    {
      id: cta, type: 'edit_beat', title: 'CTA / Title Card',
      summary: 'Hard cut to the Ashfall title treatment, date, and wishlist CTA. Music resolves. Hold for read.',
      position: { x: 1400, y: 200 }, size: CARD,
      content: {
        intent: 'CTA: wishlist Ashfall on the date',
        visualDescription: 'Cleared-sky hold with the Ashfall logotype, release window, and a single wishlist CTA. Platform marks sit in the bottom fifth. No extra body copy.',
        cameraAngle: 'WS · 35mm T2.8 · FOV 54°',
        cameraMovement: 'Slow push-in 0.8m over 4s; locked horizon (same sky plate as shot 5)',
        shotSize: 'WS', lensMm: 35, fovDeg: 54, move: 'dolly',
        framing: 'Logotype centered in the upper two-thirds; CTA in the optical center-lower; platform marks bottom-right',
        durationEstimate: '3-4s',
        actionNotes: ['Hard cut from sky CU', 'Logotype already on at cut', 'CTA fades 8 frames later'],
        continuityRequirements: ['Sky plate is the shot-5 CU continued', 'Grade matches the cleared-sky CU'],
        requiredAssets: ['Ashfall logotype', 'Release-window line', 'Wishlist CTA', 'Platform marks', 'Music resolve / final hit'],
        audioRequirements: ['Music resolve to a held chord', 'No VO on the card'],
        editNotes: 'Hard cut to title. Music resolves. Hold long enough to read the CTA. No URL paragraph.',
        implementationChecklist: [
          'Lock logotype, date, and one CTA — no second action',
          'Continue the sky plate; do not relight',
          'Time the hold to a 3s read at 1080p',
          'Resolve the score; do not introduce a new motif',
        ],
        testCriteria: [
          'CTA is one action (wishlist)',
          'Date and title readable at 1080p without pausing',
          'Hold is ≥3s',
        ],
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
    schemaVersion: BOARD_SCHEMA_VERSION,
    frames,
    connections,
  };
}

// ─── Cutscene Sequence ────────────────────────────────────────────────────────
// Worked example: The Tollhouse Bargain — in-engine cinematic, not a trailer.

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
      summary: 'EWS of the tollhouse at dusk in rain. The road is empty; a lantern is already lit in the window. Location before faces.',
      position: { x: 50, y: 200 }, size: CARD,
      content: {
        intent: 'Plant dusk, rain, and the tollhouse',
        visualDescription: 'EWS of a timber tollhouse on a wet road at dusk. Rain sheets toward camera. One warm lantern in the left window; chimney smoke flattening in the wind.',
        cameraAngle: 'EWS · 27mm T2.8 · FOV 67°',
        cameraMovement: 'Dolly in 3m over 4s on a wet-road axis; 10cm boom down to keep the lantern on the left third',
        shotSize: 'EWS', lensMm: 27, fovDeg: 67, move: 'dolly',
        framing: 'Tollhouse sits on the left third; road leads from lower-right; sky occupies the top third for rain readout',
        durationEstimate: '3-5s',
        actionNotes: ['Rain continuous toward camera', 'Lantern already lit — do not animate a light-up', 'No characters in frame'],
        continuityRequirements: ['Dusk key (no daylight)', 'Rain direction toward camera for the whole scene', 'Lantern color 2200K'],
        requiredAssets: ['Tollhouse exterior + wet road', 'Rain sim', 'Lantern practical', 'Dolly track in Sequencer', 'Ambience: rain on timber + distant river'],
        vfxRequirements: ['Rain sheets with colliding drops on the road', 'Chimney smoke flattening downwind'],
        audioRequirements: ['Rain on timber', 'Distant river', 'No score yet — let the rain own the open'],
        editNotes: 'Hold until the lantern reads, then cut to the keeper MCU on a rain-drop hit.',
        implementationChecklist: [
          'Block the dolly so the lantern never leaves the left third',
          'Cache rain for 5s at 24fps',
          'Keep characters out of the EWS',
          'Record rain-on-timber before adding score',
        ],
        testCriteria: [
          'Location reads as a tollhouse in the first frame',
          'Time of day is dusk, not night or day',
          'No character is visible',
        ],
      },
      annotations: [],
    },
    {
      id: character, type: 'dialogue', title: 'Character Beat',
      summary: 'MCU of the keeper at the window, lantern sidelight. He does not look at camera. Two lines, then he goes still.',
      position: { x: 320, y: 200 }, size: CARD,
      content: {
        intent: 'Introduce the keeper through performance',
        visualDescription: 'MCU of the tollhouse keeper at the open window. Lantern sidelight, rain rim. He speaks to the road, not the lens, then goes still as if he heard something inside.',
        cameraAngle: 'MCU · 50mm T2.0 · FOV 40°',
        cameraMovement: 'Static locked-off; 1cm breathing pedestal only',
        shotSize: 'MCU', lensMm: 50, fovDeg: 40, move: 'static',
        framing: 'Eyes on the upper third; looking camera-right down the road; lantern bokeh camera-left; rain rim on the shoulder',
        dialogue: [
          'Keeper: The ledger closed at sundown.',
          'Keeper: If you are on the road, you are already too late.',
        ],
        durationEstimate: '5-10s',
        actionNotes: ['Line 1 on a still face', 'Line 2 with a glance down the road', 'Hold 8 frames after line 2, then he stills — that still is the trigger for the reveal'],
        continuityRequirements: ['Wardrobe: oilskin + wool collar (matches later CU)', 'Lantern 2200K key from camera-left', 'Rain rim direction matches the EWS'],
        requiredAssets: ['Keeper hero (head + shoulders)', 'Dialogue VO', 'Lip-sync visemes', 'Window practical + rain glass'],
        audioRequirements: ['Dialogue VO, dry then with room', 'Room tone', 'Rain on the sill as foley', 'No score under the lines'],
        editNotes: 'Cut in on a rain-drop hit from the EWS. Cut out on the still after line 2 into the dolly reveal.',
        implementationChecklist: [
          'Record VO before animation; lock the still after line 2',
          'Keep eyeline camera-right, never into lens',
          'Match lantern color to the EWS practical',
          'Do not add score under dialogue',
        ],
        testCriteria: [
          'Both lines are intelligible on a laptop speaker',
          'Emotion reads as warning, not villainy',
          'Eyeline matches the road direction from the EWS',
        ],
      },
      annotations: [],
    },
    {
      id: reveal, type: 'camera_move', title: 'Reveal',
      summary: 'Dolly past the keeper; rack from his shoulder to a sealed ledger on the desk that begins to glow from inside the clasp.',
      position: { x: 590, y: 200 }, size: CARD,
      content: {
        intent: 'Reveal the sealed ledger by moving the camera',
        visualDescription: 'Start MCU on the keeper\'s shoulder. Dolly past him along the desk. Rack focus from wool collar to a brass-clasped ledger. The clasp seam begins to glow.',
        cameraAngle: 'MCU → insert · 40mm T2.2 · FOV 48°',
        cameraMovement: 'Dolly right 2.2m past the keeper; rack focus at 1.4m onto the clasp',
        shotSize: 'MCU', lensMm: 40, fovDeg: 48, move: 'dolly',
        framing: 'Keeper occupies frame-left at start and exits left; ledger lands on the right third, clasp in the optical center at end',
        durationEstimate: '3-5s',
        actionNotes: ['Keeper does not turn — the camera does the work', 'Glow ramps only after the rack settles', 'No extra props competing with the clasp'],
        continuityRequirements: ['Ledger is the same brass-clasp hero used in the action beat', 'Glow is 2000K, cooler than the lantern', 'Rain continues on the window behind the desk'],
        requiredAssets: ['Desk + hero ledger', 'Dolly path in Sequencer', 'Rack-focus animation', 'Interior glow material on the clasp seam'],
        vfxRequirements: ['Depth-of-field rack', 'Clasp-seam glow ramp after the rack settles'],
        audioRequirements: ['Room tone continues', 'Low ledger hum starting at the rack settle', 'Rain still present, down 3dB'],
        editNotes: 'Enter from the keeper still. Cut to the reaction CU when the glow is readable.',
        implementationChecklist: [
          'Animate the dolly so the keeper exits left without a head turn',
          'Rack settles before the glow ramps',
          'Keep the move a dolly-plus-rack, not an orbit around the character',
          'Mix the hum under the rain, not over it',
        ],
        testCriteria: [
          'The ledger is the new subject by the last frame',
          'Glow is readable without a cut-in',
          'Camera movement is a dolly, not a 35° sprite turnaround',
        ],
      },
      annotations: [],
    },
    {
      id: reaction, type: 'shot', title: 'Reaction Shot',
      summary: 'CU of the keeper. He has heard the ledger. No line. Eyes catch the glow; jaw sets.',
      position: { x: 860, y: 200 }, size: CARD,
      content: {
        intent: 'Read the keeper\'s fear without a line',
        visualDescription: 'CU of the keeper. Glow from camera-right (the ledger) climbs his cheek. He does not speak. Eyes tick to the desk, then hold.',
        cameraAngle: 'CU · 85mm T2.0 · FOV 24°',
        cameraMovement: 'Static locked-off',
        shotSize: 'CU', lensMm: 85, fovDeg: 24, move: 'static',
        framing: 'Eyes on the upper third; glow edge-light camera-right; left side still lantern-warm',
        durationEstimate: '2-4s',
        actionNotes: ['No blink for the first 12 frames', 'Eyeline tick to camera-right (desk) at 0.6s', 'Jaw set by 1.5s'],
        continuityRequirements: ['Eyeline to the desk matches the reveal direction (camera-right)', 'Oilskin + wool collar match the MCU', 'Two-source key: lantern left, ledger glow right'],
        requiredAssets: ['Keeper CU sculpt / blendshapes', 'Ledger-glow bounce card', 'Reaction breath foley'],
        audioRequirements: ['Ledger hum up 2dB', 'One held breath', 'Rain still under'],
        editNotes: 'Hold long enough to read the face. Cut on the jaw set into the action.',
        implementationChecklist: [
          'Light the CU with the two sources from the previous shots',
          'Do not add a line',
          'Cut on the jaw set, not on a blink',
          'Keep the camera locked — the performance is the move',
        ],
        testCriteria: [
          'Fear reads with the sound off',
          'Eyeline matches the ledger off camera-right',
          'No dialogue on this shot',
        ],
      },
      annotations: [],
    },
    {
      id: action, type: 'action', title: 'Action Shift',
      summary: 'Keeper slams the shutter, throws the bolt, and covers the ledger with his palm. The glow leaks between his fingers.',
      position: { x: 1130, y: 200 }, size: CARD,
      content: {
        intent: 'Turn the fear into a physical close-down',
        visualDescription: 'MS as the keeper slams the window shutter, throws the iron bolt, and covers the glowing clasp with his palm. Glow leaks between fingers. Rain hits the now-closed shutter.',
        cameraAngle: 'MS · 32mm T2.8 · FOV 58°',
        cameraMovement: 'Track right with the shutter slam, then reframe down onto the covered ledger',
        shotSize: 'MS', lensMm: 32, fovDeg: 58, move: 'track',
        framing: 'Shutter occupies the left half on the slam; hand-on-ledger lands in the lower-right third',
        durationEstimate: '4-8s',
        actionNotes: [
          'Shutter slam at 0.4s',
          'Bolt throw at 1.2s',
          'Palm covers the clasp at 2.0s; glow leaks between fingers and holds',
        ],
        continuityRequirements: [
          'Bolt and shutter exist in the establishing interior (do not spawn them)',
          'Ledger is the same hero as the reveal',
          'Glow still 2000K, now occluded',
        ],
        requiredAssets: ['Shutter + bolt animation', 'Hand cover on ledger', 'Glow-leak material between fingers', 'Foley: slam, bolt, palm'],
        vfxRequirements: ['Glow occlusion by the palm with finger leaks', 'Rain on the closed shutter'],
        audioRequirements: ['Shutter slam', 'Bolt throw', 'Palm on brass', 'Music sting on the slam, then cut'],
        editNotes: 'Enter from the jaw set. Exit as the glow-leak holds — that hold is the last picture before the fade.',
        implementationChecklist: [
          'Animate slam → bolt → palm as one continuous action',
          'Do not spawn the shutter; it is in the set',
          'Cache glow leak between fingers',
          'Cut music after the slam sting',
        ],
        testCriteria: [
          'Action order is slam, bolt, cover — readable at 24fps',
          'Glow leak is visible after the palm lands',
          'No spatial jump from the CU',
        ],
      },
      annotations: [],
    },
    {
      id: exit, type: 'transition', title: 'Exit Beat',
      summary: 'Hold the covered ledger, then fade to black on the rain hitting the shutter. Music does not resolve — it cuts.',
      position: { x: 1400, y: 200 }, size: CARD,
      content: {
        intent: 'Close on rain, not a title',
        visualDescription: 'Hold the covered-ledger insert. Dissolve 12 frames to the shutter from outside: rain hitting the boards where the lantern was. Fade to black.',
        cameraAngle: 'Insert then WS · 35mm T2.8 · FOV 54°',
        cameraMovement: 'Static locked-off on the insert; static hold on the exterior shutter',
        shotSize: 'insert', lensMm: 35, fovDeg: 54, move: 'static',
        framing: 'Insert: palm and glow leak fill the frame; exterior: shutter centered, road out of focus',
        durationEstimate: '2-3s',
        actionNotes: ['12-frame dissolve from insert to exterior shutter', 'Fade to black in 8 frames after the rain reads', 'No title card'],
        continuityRequirements: ['Exterior shutter is the same wall as the EWS', 'Rain direction still toward camera', 'Lantern is now hidden — the window is closed'],
        requiredAssets: ['Covered-ledger insert hold', 'Exterior shutter plate', 'Fade-to-black'],
        audioRequirements: ['Rain up on the exterior', 'Music cuts (does not resolve)', 'Final ambient tail 6 frames into black'],
        editNotes: 'Dissolve to the shutter. Music cuts on the dissolve. Fade to black. Do not put a title over the rain.',
        implementationChecklist: [
          '12-frame dissolve, not a whip',
          'Cut the score; do not resolve it',
          'Hold 6 frames of rain-into-black',
          'No logo on the exit',
        ],
        testCriteria: [
          'Scene feels closed, not cliffhangered with type',
          'No hanging music into the next sequence',
          'Rain is the last sound',
        ],
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
    schemaVersion: BOARD_SCHEMA_VERSION,
    frames,
    connections,
  };
}

// ─── Explainer Video ──────────────────────────────────────────────────────────
// Worked example: Storyboard OS in ~40s — cinematic camera on a product demo.

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
      summary: 'MS of a messy notes app: tags, arrows, and a blinking cursor. The page looks busy and still does not say how to ship the shot.',
      position: { x: 50, y: 200 }, size: CARD,
      content: {
        intent: 'Show notes that cannot ship a shot',
        visualDescription: 'MS of a notes window on a dark desk. Tags, arrows, and a blinking cursor. No camera, no duration, no assets. Desk lamp is the only practical.',
        cameraAngle: 'MS · 35mm T2.2 · FOV 54°',
        cameraMovement: 'Slow push-in 0.8m over 6s; locked desk plane',
        shotSize: 'MS', lensMm: 35, fovDeg: 54, move: 'dolly',
        framing: 'Notes window on the right third; lamp bokeh camera-left; cursor blink is the motion',
        durationEstimate: '5-8s',
        dialogue: ['VO: Story tools capture notes. They do not capture the shot.'],
        actionNotes: ['Cursor blinks at 1s intervals', 'No UI interaction besides the blink'],
        continuityRequirements: ['Desk lamp 2700K for the whole explainer until the outcome grade shift', 'Notes window is the "before" plate referenced in the outcome'],
        requiredAssets: ['Notes-app capture (or designed fake)', 'Desk + lamp set', 'VO take of the problem line'],
        audioRequirements: ['VO', 'Low tension bed, no melody yet', 'Soft cursor tick optional'],
        editNotes: 'Hold the push-in until the VO lands, then dissolve into the metaphor fold.',
        implementationChecklist: [
          'Design the notes plate so it looks busy and still un-shootable',
          'Record VO before locking duration',
          'Push-in, do not orbit the monitor',
          'Keep the lamp practical in frame for the grade match later',
        ],
        testCriteria: [
          'A viewer nods at the problem within 5s',
          'No product UI from Storyboard OS appears yet',
          'VO is one sentence',
        ],
      },
      annotations: [],
    },
    {
      id: metaphor, type: 'vfx', title: 'Visual Metaphor',
      summary: 'The notes page folds, shot by shot, into a cinematic frame card with a type bar and a one-line beat. Abstract to concrete.',
      position: { x: 320, y: 200 }, size: CARD,
      content: {
        intent: 'Fold notes into a shot card',
        visualDescription: 'The notes page peels and folds along the shot-list axis. A type bar (SHOT) slams on. A one-line beat writes itself. The desk falls away to the board void.',
        cameraAngle: 'MCU · 50mm T2.0 · FOV 40°',
        cameraMovement: 'Arc 15° with the fold, horizon locked',
        shotSize: 'MCU', lensMm: 50, fovDeg: 40, move: 'arc',
        framing: 'Card ends centered; type bar on the top edge; beat line in the title band',
        durationEstimate: '4-6s',
        dialogue: ['VO: A shot is a contract: what is in front of the lens, and how long it lasts.'],
        actionNotes: ['Fold starts on the VO word "shot"', 'Type bar slams at 1.6s', 'Beat line types on at 2.2s'],
        continuityRequirements: ['Card language matches the live cinematic board (type bar + one-line beat, not a wiki paragraph)', 'Grade still 2700K until the outcome'],
        requiredAssets: ['Notes plate from shot 1', 'Cinematic frame-card mesh', 'Type-bar graphic', 'Beat-line type-on'],
        vfxRequirements: ['Page-fold to card', 'Type-bar slam', 'Beat-line type-on', 'Desk fall-away to void'],
        audioRequirements: ['Fold paper/metal hybrid', 'Type-bar hit', 'VO'],
        editNotes: 'Dissolve in from the problem push-in. Cut to the demo track as soon as the card reads.',
        implementationChecklist: [
          'Animate a fold, not a morph soup',
          'The card must show type + one-line beat only — no checklist on the card',
          'Arc the camera 15°, keep the horizon locked',
          'Sync the slam to the VO word "contract" or "shot"',
        ],
        testCriteria: [
          'A naive viewer can say "the notes became a shot card"',
          'No duration essay or VFX list on the card face',
          'Camera is an arc, not a 35° sprite orbit',
        ],
      },
      annotations: [],
    },
    {
      id: demo, type: 'shot', title: 'Demonstration',
      summary: 'Track along a live cinematic board: six shots, CAM/VFX/SFX/SPEC badges, inspector open on one frame showing lens and duration.',
      position: { x: 590, y: 200 }, size: CARD,
      content: {
        intent: 'Demo the board, not a feature list',
        visualDescription: 'Insert of the cinematic-storyboard canvas. Camera tracks left-to-right along six cards. Inspector is open on shot 3 showing 35mm, dolly, and 5–8s. Badges read CAM / SPEC.',
        cameraAngle: 'Insert · 50mm-equivalent · FOV 40° (screen capture, 1.85 crop)',
        cameraMovement: 'Track right along the frame row at card-width per 1.2s; hold on the open inspector for 3s',
        shotSize: 'insert', lensMm: 50, fovDeg: 40, move: 'track',
        framing: 'Cards on the upper two-thirds; inspector docked right; no app chrome besides the board',
        durationEstimate: '8-15s',
        dialogue: ['VO: Each shot carries lens, move, duration, assets, and a test — enough to hand to production.'],
        actionNotes: ['Track passes cards 1–3', 'Hold on card 3 with inspector', 'Do not click around; the camera does the showing'],
        continuityRequirements: ['Board is the Trailer Flow template (the worked example, not a random file)', 'Inspector shows Sequencer camera language, not a 35° orbit control'],
        requiredAssets: ['Screen capture of cinematic-storyboard with Trailer Flow', 'Cursor hidden', 'VO walkthrough'],
        audioRequirements: ['VO', 'Soft UI tick when the inspector is already open (no click)', 'Bed stays under'],
        editNotes: 'Enter from the metaphor card. Exit as the inspector SPEC badge holds, into the proof inserts.',
        implementationChecklist: [
          'Capture Trailer Flow with the inspector open on Feature Reveal',
          'Hide the cursor',
          'Track along cards; do not zoom-orbit the monitor',
          'VO names lens, move, duration, assets, test — not "features"',
        ],
        testCriteria: [
          'A viewer can follow the board without pausing',
          'Inspector camera line is readable at 1080p',
          'No mouse-click theatre',
        ],
      },
      annotations: [],
    },
    {
      id: proof, type: 'shot', title: 'Proof',
      summary: 'Insert of production-brief JSON passing schema, plus a quote card: six shots, zero blocked. Evidence, not adjectives.',
      position: { x: 860, y: 200 }, size: CARD,
      content: {
        intent: 'Proof: six shots, zero blocked',
        visualDescription: 'Two inserts: (1) production-brief JSON with formatVersion 3 and a green schema-valid chip; (2) a quote card "6 shots · 0 blocked". Dark void background, same as the board.',
        cameraAngle: 'Insert · 65mm-equivalent · FOV 31°',
        cameraMovement: 'Static locked-off on each insert; 8-frame dissolve between them',
        shotSize: 'insert', lensMm: 65, fovDeg: 31, move: 'static',
        framing: 'JSON block left-weighted; quote card centered; generous margin, no browser chrome',
        durationEstimate: '4-6s',
        dialogue: ['VO: The brief is schema-valid JSON. Six shots. None blocked.'],
        actionNotes: ['JSON insert 0–2.5s', 'Dissolve to the quote card', 'Hold the card through the VO period'],
        continuityRequirements: ['Numbers match Trailer Flow (6 shots, 0 blocked)', 'Void background matches the demo board'],
        requiredAssets: ['Valid production-brief JSON still', 'Quote-card graphic', 'Schema-valid chip'],
        vfxRequirements: ['8-frame dissolve between inserts'],
        audioRequirements: ['VO', 'Bed continues, no extra sting'],
        editNotes: 'Cut in from the inspector hold. Cut out on the quote-card period into the outcome WS.',
        implementationChecklist: [
          'Use a real generated brief still, not lorem JSON',
          'Quote card states 6 shots and 0 blocked — no extra stats',
          'Keep the dissolve short',
          'VO is specific, not "powerful" / "robust"',
        ],
        testCriteria: [
          'Proof is a number, not an adjective',
          'JSON still is readable as formatVersion 3 at 1080p',
          'Card hold is long enough to read',
        ],
      },
      annotations: [],
    },
    {
      id: outcome, type: 'sequence', title: 'Outcome',
      summary: 'WS of a clean sequence plus inspector: every card has a one-line beat, CAM/SPEC badges, and the desk-notes chaos is gone. Grade warms to the product look.',
      position: { x: 1130, y: 200 }, size: CARD,
      content: {
        intent: 'Show the after: a shootable board',
        visualDescription: 'WS of the cinematic board after the demo: six cards in flow, one-line beats, CAM/SPEC badges, inspector on the CTA shot. The desk-notes window is gone. Grade shifts from 2700K lamp to the product slate.',
        cameraAngle: 'WS · 24mm-equivalent · FOV 73° (full canvas)',
        cameraMovement: 'Slow push-in 1.2m toward the CTA card; horizon locked',
        shotSize: 'WS', lensMm: 24, fovDeg: 73, move: 'dolly',
        framing: 'Full six-card row in frame at start; CTA + inspector readable at end',
        durationEstimate: '4-6s',
        dialogue: ['VO: Production gets a shot list. You keep the sequence.'],
        actionNotes: ['Grade shift over 12 frames at the cut-in', 'No extra animation on the cards'],
        continuityRequirements: ['Same Trailer Flow board as the demo', 'Notes window from shot 1 is absent — that is the transformation'],
        requiredAssets: ['Full-board capture of Trailer Flow', 'Inspector on CTA', 'Grade LUT from lamp-warm to product slate'],
        audioRequirements: ['Uplifting bed shift (new motif, still under VO)', 'VO'],
        editNotes: 'Cut from the quote card. Music lifts. Push-in holds into the CTA title card.',
        implementationChecklist: [
          'Capture the full six-card row with inspector',
          'Grade-shift on the cut, not a dissolve soup',
          'Keep beats to one line on every card',
          'VO names the handoff (shot list) and the authored unit (sequence)',
        ],
        testCriteria: [
          'Contrast with the notes plate is obvious',
          'Cards do not show wiki prose',
          'VO says "sequence", not "project"',
        ],
      },
      annotations: [],
    },
    {
      id: cta, type: 'edit_beat', title: 'CTA',
      summary: 'Title card: Storyboard OS logotype, one action (open the cinematic board), repo URL. Music resolves. Hold for read.',
      position: { x: 1400, y: 200 }, size: CARD,
      content: {
        intent: 'CTA: open the cinematic board',
        visualDescription: 'Dark slate title card. Storyboard OS logotype. One line: Open the cinematic board. Repo URL under it. No second button.',
        cameraAngle: 'WS · 35mm T2.8 · FOV 54°',
        cameraMovement: 'Static locked-off',
        shotSize: 'WS', lensMm: 35, fovDeg: 54, move: 'static',
        framing: 'Logotype upper-center; CTA optical center; URL lower-third; no platform-mark pile-on',
        durationEstimate: '3-4s',
        dialogue: ['VO: Open the cinematic board. Plan the shot before you shoot it.'],
        actionNotes: ['Hard cut from the outcome push-in', 'Logotype on at cut', 'URL fades 6 frames later'],
        continuityRequirements: ['Slate color matches the outcome grade', 'Logotype is the product mark, not a new lockup'],
        requiredAssets: ['Storyboard OS logotype', 'CTA line', 'Repo URL', 'Music resolve'],
        audioRequirements: ['Music resolve to a held chord', 'VO CTA delivery'],
        editNotes: 'Hard cut to title. Music resolves. One CTA. Hold for a 3s read. No feature recap.',
        implementationChecklist: [
          'One action only: open the cinematic board',
          'URL readable at 1080p',
          'Hold ≥3s',
          'Do not recap features on the card',
        ],
        testCriteria: [
          'CTA is one action',
          'Readable without pausing',
          'Viewer knows the next click',
        ],
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
    schemaVersion: BOARD_SCHEMA_VERSION,
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
