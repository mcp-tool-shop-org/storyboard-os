// ─── rpg-storyboard-domain / templates.ts ────────────────────────────────────
//
// RPG storyboard template definitions. Three gold-SPEC worked examples:
//   quest_flow     — 8-beat linear quest spine (The Tollhouse Ledger)
//   quest_branch   — 7-beat branching quest (The Archive Window)
//   cutscene_beat  — 5-beat authored dramatic moment (The Name in the Ledger)
//
// ─────────────────────────────────────────────────────────────────────────────

import type {
  Storyboard,
  StoryboardFrame,
  StoryboardConnection,
  StoryboardTemplateId,
  StoryboardTemplateDefinition,
} from './schema';

import type { CreateStoryboardInput } from '@storyboard-os/core';

// ─── Layout helpers ──────────────────────────────────────────────────────────

const FRAME_W = 220;
const FRAME_H = 130;
const H_GAP = 280;
const ROW_Y_TOP = 80;
const ROW_Y_MID = 240;
const ROW_Y_BOT = 400;

function pos(col: number, row: 'top' | 'mid' | 'bot' = 'mid') {
  return {
    x: 80 + col * H_GAP,
    y: row === 'top' ? ROW_Y_TOP : row === 'mid' ? ROW_Y_MID : ROW_Y_BOT,
  };
}

function size() {
  return { width: FRAME_W, height: FRAME_H };
}

// ─── ID helpers ──────────────────────────────────────────────────────────────

function fid(boardId: string, role: string): string {
  return `${boardId}-${role}`;
}

function cid(boardId: string, from: string, to: string): string {
  return `${boardId}-conn-${from}-to-${to}`;
}

// ─── Template 1: Quest Flow ──────────────────────────────────────────────────
// Worked example: The Tollhouse Ledger — one playable quest spine.

const QUEST_FLOW: StoryboardTemplateDefinition = {
  id: 'quest_flow',
  name: 'Quest Flow',
  description: 'A complete quest spine from inciting hook to future thread. Eight beats: hook, scene, character contact, player choice, encounter, reveal, consequence, and a seeded future quest. Gold example: The Tollhouse Ledger at Ashmarrow Pass.',
  frameCount: 8,
  bestFor: 'Designing a single self-contained quest with clear narrative momentum and one major player-driven branch.',

  createStoryboard({ id, title, description }: CreateStoryboardInput): Storyboard {
    const frames: StoryboardFrame[] = [
      {
        id: fid(id, 'opening-hook'),
        type: 'hook',
        title: 'Abandoned Caravan at the Pass',
        summary: 'Ashmarrow Pass is silent. A Dalthor caravan sits abandoned outside a ruined tollhouse — wheels cracked, cargo unlooted, no guards.',
        position: pos(0),
        size: size(),
        content: {
          designerNotes: 'Open on absence, not carnage. Three readable details before any dialogue: Dalthor house markings on the lead wagon, cracked wheels that were not cut, and a still-warm cookpot. The caravan belongs to Dalthor Trading House — surface that through paint, not a quest marker.',
          playerVisibleText: 'The merchant road through Ashmarrow Pass should be busy at this hour. It is not. A Dalthor caravan has stopped outside a half-collapsed tollhouse and no one is moving.',
          stakes: 'If the player rides past, Compact patrols seize the cellar at dusk and quest_tollhouse_ledger_active never sets — the ledger is gone for this playthrough.',
          entryConditions: [
            'player_in_zone = ashmarrow_pass',
            'quest_tollhouse_ledger_active = false',
          ],
          exitConditions: [
            'Player has entered the ruined tollhouse interior OR spoken to Marel Dyn',
          ],
          stateChanges: [
            'Sets: quest_tollhouse_ledger_active = true',
            'Sets: opening_beat_complete = true',
            'Sets: caravan_owner = dalthor',
          ],
          involvedCharacters: ['Marel Dyn (fleeing Dalthor merchant, hiding behind the second wagon)'],
          involvedFactions: ['Dalthor Trading House', 'Velthari Intelligence'],
          possibleOutcomes: [
            'Player investigates the tollhouse immediately',
            'Player calms Marel Dyn and hears why the merchants fled',
            'Player notices a watcher in the treeline and marks the volume (Savan Vreil stays hidden)',
          ],
          requiredAssets: [
            'env/ashmarrow-pass-approach — war-scarred road, late-afternoon light',
            'env/ruined-tollhouse-exterior — collapsed east wall, smoke staining',
            'prop/dalthor-caravan — house markings, cracked wheels, unlooted crates',
            'npc/marel-dyn-hiding — crouch clip, two-state dialogue (panicked / calmed)',
            'vol/savan-vreil-treeline — invisible trigger, no mesh this beat',
            'audio/amb-pass-silence — no road traffic, one distant bird',
          ],
          implementationChecklist: [
            'Place three readable environmental details on the approach (markings, wheels, cookpot)',
            'Wire Marel Dyn as a discoverable NPC with a two-line backstory on calm',
            'Place Savan Vreil treeline volume with visible=false until the Obstacle beat',
          ],
          testCriteria: [
            'quest_tollhouse_ledger_active = true sets on first interaction with caravan or tollhouse door',
            'Marel Dyn is discoverable without a quest marker',
            'Savan Vreil has no visible mesh and no VO this beat',
            'Dalthor house markings on the lead wagon are readable at 4m without dialogue',
          ],
          authorOnlyNotes: [
            'Merchants fled after one of them glimpsed the ledger in the cellar and recognized Compact seals.',
            'Savan Vreil watches from the treeline; do not spawn her mesh until the Obstacle beat.',
          ],
        },
        annotations: [
          { id: fid(id, 'ann-hook-1'), type: 'timing', text: 'Target 5–10 minutes of play time. Drive toward the tollhouse door.' },
          { id: fid(id, 'ann-hook-2'), type: 'designer_note', text: 'The unanswered question is: why was a loaded caravan left unlooted?' },
        ],
      },
      {
        id: fid(id, 'establishing-scene'),
        type: 'scene',
        title: 'Ruined Tollhouse Interior',
        summary: 'Inside: a bolt-scored counter, a cellar hatch in the floorboards, and a records shelf pulled half-over. The space tells the player someone was searching in a hurry.',
        position: pos(1),
        size: size(),
        content: {
          designerNotes: 'Three readable details: (visual) cellar hatch with a broken padlock; (audio) drip from the collapsed east wall; (tension) Compact wax seal fragment on the records shelf that foreshadows the Reveal. Let the player explore before Orvyn speaks.',
          playerVisibleText: 'The tollhouse smells of pipe smoke and wet stone. A hatch in the floor has been forced. Behind the counter, someone has tried to hide.',
          stakes: 'What the player reads here shapes how they approach Orvyn — aggressive if they clock the Compact seal, cautious if they clock the blood trail.',
          entryConditions: ['opening_beat_complete = true'],
          exitConditions: ['scene_explored = true OR player reaches the counter (Orvyn trigger)'],
          stateChanges: [
            'Sets: scene_explored = true on first interaction with hatch, shelf, or counter',
            'Sets: compact_seal_noticed = true if player inspects the records shelf',
          ],
          involvedCharacters: ['Orvyn Kett (hidden, not yet in dialogue)'],
          involvedFactions: ['The Compact', 'Dalthor Trading House'],
          possibleOutcomes: [
            'Player inspects the cellar hatch first',
            'Player inspects the Compact seal fragment and enters contact with that knowledge',
            'Player walks straight to the counter and triggers Character Contact',
          ],
          requiredAssets: [
            'env/ruined-tollhouse-interior — counter, cellar hatch, records shelf, drip',
            'prop/cellar-hatch-forced — broken padlock, interactable',
            'prop/compact-seal-fragment — inspectable, foreshadows Reveal',
            'audio/amb-tollhouse-drip — wet-stone loop, no music sting',
          ],
          implementationChecklist: [
            'Author the three readable details and tag the seal fragment as the Reveal foreshadow',
            'Ensure every exploration path can reach the counter trigger',
            'Verify the seal fragment is inspectable without a quest marker',
          ],
          testCriteria: [
            'Player can reach Character Contact from hatch, shelf, or door approach',
            'Inspecting the records shelf sets compact_seal_noticed = true',
            'No quest marker points at the seal fragment',
          ],
          authorOnlyNotes: [
            'The Compact seal fragment is from a twelve-year-old informant file. Do not name Orvyn on it yet.',
          ],
        },
        annotations: [
          { id: fid(id, 'ann-scene-1'), type: 'designer_note', text: 'Scenes are interactive, not cinematic. Give the player readable surface area before Orvyn fires dialogue.' },
        ],
      },
      {
        id: fid(id, 'character-contact'),
        type: 'npc_beat',
        title: 'Orvyn Kett at the Counter',
        summary: 'Wounded tollkeeper Orvyn Kett is hiding under the counter with a crossbow bolt in his shoulder and a story he does not want to tell.',
        position: pos(2),
        size: size(),
        content: {
          designerNotes: 'Orvyn has a visible want (survive the next hour) and a hidden want (keep his name out of the ledger). Dialogue branches on approach: aggressive closes after two exchanges; neutral gives cellar location only; empathetic (or healing the bolt) gives all three faction names. Trust is permanent for this beat.',
          playerVisibleText: 'A stout man in toll-collector grey crouches behind the counter. He is bleeding. He is armed. He looks at you as if you might be the fourth person today come to kill him for something he found in his own cellar.',
          stakes: 'If Orvyn dies or flees, the player loses the three-faction briefing and must brute-force the cellar without context.',
          entryConditions: [
            'scene_explored = true OR player_at_counter = true',
            'quest_tollhouse_ledger_active = true',
          ],
          exitConditions: ['orvyn_trust_level is set to closed, partial, or full'],
          stateChanges: [
            'Sets: orvyn_trust_level = closed | partial | full (based on dialogue path)',
            'Sets: orvyn_healed = true if player uses a bandage_kit or heal skill',
            'Unlocks: key_choice_available = true (all trust states)',
          ],
          involvedCharacters: [
            'Orvyn Kett (tollkeeper, 60s, stubborn, afraid)',
            'Savan Vreil (Velthari courier, still outside, watching)',
          ],
          involvedFactions: ['The Compact', 'Velthari Intelligence', 'Dalthor Trading House'],
          possibleOutcomes: [
            'orvyn_trust_level = full — he names Compact, Velthari, and Dalthor and points at the hatch',
            'orvyn_trust_level = partial — cellar location only; faction names withheld',
            'orvyn_trust_level = closed — he shuts down; player can still force the hatch',
          ],
          requiredAssets: [
            'npc/orvyn-kett-wounded — bolt-in-shoulder mesh, crouch, crossbow-drawn idle',
            'ui/heal-prompt-orvyn — context prompt when bandage_kit or heal skill is equipped',
            'dlg/orvyn-contact-tree — three branches: aggressive, neutral, empathetic',
            'audio/vo-orvyn-pain-loop — low, stops on heal',
          ],
          implementationChecklist: [
            'Write Orvyn\'s visible want and hidden want before scripting the tree',
            'Implement aggressive (closes after 2 lines), neutral (partial), empathetic (full) branches',
            'Gate the three-faction briefing behind orvyn_trust_level = full; never give the informant-file spoiler here',
          ],
          testCriteria: [
            'All three trust states still set key_choice_available = true',
            'Aggressive path sets orvyn_trust_level = closed and cannot be reopened this visit',
            'Healing Orvyn increments trust toward full regardless of opening tone',
            'Savan Vreil remains invisible and silent this beat',
          ],
          authorOnlyNotes: [
            'Orvyn found the ledger three days ago in a sealed cellar compartment.',
            'His own name is in the ledger as a paid Compact informant from twelve years ago. Surface that in the Reveal, not here.',
          ],
        },
        annotations: [
          { id: fid(id, 'ann-npc-1'), type: 'player_visible', text: 'Orvyn should feel like a person with his own agenda, not a quest dispenser.' },
          { id: fid(id, 'ann-npc-2'), type: 'author_only', text: 'His hidden want (keep his name buried) seeds the Reveal. Do not leak it in his spoken lines.' },
        ],
      },
      {
        id: fid(id, 'key-choice'),
        type: 'choice',
        title: 'Who Gets the Ledger',
        summary: 'Three factions want the ledger. Compact agent Preket, Velthari courier Savan Vreil, and Dalthor factor Issa arrive in the same window. The player chooses who — if anyone — to deal with.',
        position: pos(3),
        size: size(),
        content: {
          designerNotes: 'No clean answer. Compact is legal and brutal. Velthari will copy and vanish. Dalthor will overpay to destroy it. Keeping it (player_kept) is a valid fourth option and accelerates the Obstacle. Do not frame any option as correct in UI or NPC tone.',
          playerVisibleText: 'Three people want what is under the hatch. A Compact soldier with a warrant. A Velthari courier with coin and no expression. A Dalthor factor who has not slept. They each say the ledger is theirs by right.',
          stakes: 'ledger_recipient decides the Obstacle type and which factions mark the player for the rest of the chapter.',
          entryConditions: ['key_choice_available = true'],
          exitConditions: ['ledger_recipient is set OR negotiation_timer_expired = true'],
          stateChanges: [
            'Sets: ledger_recipient = compact | velthari | dalthor | player_kept',
            'Sets: player_choice = ledger_recipient',
            'Updates: compact_faction_standing, velthari_faction_standing, dalthor_faction_standing',
          ],
          involvedCharacters: [
            'Preket (Compact military agent, warrant in hand)',
            'Savan Vreil (Velthari courier, now visible at the door)',
            'Issa Dalthor (merchant-house factor, desperate)',
            'Orvyn Kett (whisper recommendation only if orvyn_trust_level = full)',
          ],
          involvedFactions: ['The Compact', 'Velthari Intelligence', 'Dalthor Trading House'],
          possibleOutcomes: [
            'Give the ledger to Compact — faster, Preket arrests Orvyn later',
            'Give the ledger to Velthari — Savan copies it; original may be destroyed',
            'Give the ledger to Dalthor — Issa pays; she intends to burn it',
            'Keep the ledger — negotiation_timer_expired or explicit refuse; Obstacle starts immediately',
          ],
          requiredAssets: [
            'npc/preket-compact-agent — plate, warrant prop, aggressive idle',
            'npc/savan-vreil-courier — travel cloak, calm idle (mesh on for the first time)',
            'npc/issa-dalthor-factor — merchant coat, exhausted face set',
            'ui/diegetic-ledger-choice — three physical offers plus a keep/refuse interact on the hatch, no "correct" highlight',
            'audio/stinger-faction-pressure — low, not a HUD countdown',
          ],
          implementationChecklist: [
            'Implement four outcomes including player_kept; none labeled as the correct choice',
            'If orvyn_trust_level = full, play Orvyn\'s whispered faction warning before commit',
            'On player_kept or timer expiry, set ledger_recipient = player_kept and jump to the Obstacle',
          ],
          testCriteria: [
            'ledger_recipient is set before the Obstacle beat can fire',
            'No choice option uses gold trim, checkmarks, or "recommended" copy',
            'orvyn_trust_level = full enables the whisper; other trust states do not',
            'Refusing all three sets ledger_recipient = player_kept',
          ],
          authorOnlyNotes: [
            'Preket will arrest Orvyn regardless of ledger_recipient — he already has the informant file.',
            'Savan wants a copy, not the original. Issa wants the original burned because it names Dalthor war-cargo.',
          ],
        },
        annotations: [
          { id: fid(id, 'ann-choice-1'), type: 'branch_note', text: 'ledger_recipient selects the Obstacle variant: Compact raid, Velthari ambush, Dalthor lock, or all-three scramble.' },
          { id: fid(id, 'ann-choice-2'), type: 'danger', text: 'Do not telegraph the correct answer through NPC tone or UI framing.' },
        ],
      },
      {
        id: fid(id, 'the-obstacle'),
        type: 'encounter',
        title: 'Cellar Ambush',
        summary: 'The cellar is not empty. The faction the player did not pick — or all three, if they kept the ledger — resists the descent. Combat, lock, or chase depending on ledger_recipient.',
        position: pos(4),
        size: size(),
        content: {
          designerNotes: 'Match encounter type to ledger_recipient. compact → Velthari snipers on the stairs (cover fight). velthari → Compact raid team (shield rush). dalthor → Issa\'s hired lock-breakers already in the compartment (stealth fail-to-combat). player_kept → all three collide in the cellar (chaotic, shortest timer). Objective is reach the ledger crate, not a wipe.',
          playerVisibleText: 'The hatch drops you into wet stone and old records. You are not the only one who came for the crate.',
          stakes: 'obstacle_outcome (clean | costly | bypass) carries into the Reveal: costly means Orvyn is gone when you climb back; bypass means you miss a page.',
          entryConditions: ['ledger_recipient is set'],
          exitConditions: ['Player reaches prop/tollhouse-ledger crate OR fail-state fires'],
          stateChanges: [
            'Sets: obstacle_outcome = clean | costly | bypass',
            'Modifies: player_hp and the unchosen factions\' standing',
            'Sets: cellar_reached = true',
          ],
          involvedCharacters: ['Savan Vreil', 'Preket', 'Issa Dalthor', 'Orvyn Kett (upstairs, at risk if costly)'],
          involvedFactions: ['The Compact', 'Velthari Intelligence', 'Dalthor Trading House'],
          possibleOutcomes: [
            'clean — crate opened, Orvyn still upstairs, no page missing',
            'costly — crate opened, Orvyn fled or downed, player_hp below 50%',
            'bypass — player grabs the crate and runs; page 12 (informant list) is torn and missing',
          ],
          requiredAssets: [
            'env/tollhouse-cellar — stairs, crate alcove, three cover pillars',
            'ai/encounter-variant-compact — Velthari stair snipers, cover volumes',
            'ai/encounter-variant-velthari — Compact shield rush from the hatch',
            'ai/encounter-variant-dalthor — lock-breakers already at the crate',
            'ai/encounter-variant-kept — three-faction scramble, 90s pressure',
            'prop/tollhouse-ledger-crate — interact to complete the encounter',
          ],
          implementationChecklist: [
            'Implement all four ledger_recipient variants; verify they share the crate objective',
            'Define fail-state: player_hp = 0 respawns at the hatch with obstacle_outcome = costly, not an infinite retry',
            'Tear page 12 only on bypass so the Reveal can still fire with a gap',
          ],
          testCriteria: [
            'Encounter variant matches ledger_recipient — play all four',
            'All three obstacle_outcome values are reachable',
            'Fail-state sets obstacle_outcome = costly and does not dead-end the quest',
            'crate interact is the only completion trigger',
          ],
          authorOnlyNotes: [
            'The ledger crate is real. Page 12 is the informant list that names Orvyn. Bypass hides that page until a later quest.',
          ],
        },
        annotations: [
          { id: fid(id, 'ann-enc-1'), type: 'timing', text: 'Longest beat — design for 15–25 minutes including the chosen variant.' },
          { id: fid(id, 'ann-enc-2'), type: 'designer_note', text: 'The encounter should leave the ledger in the player\'s hands so the Reveal can be read, not narrated.' },
        ],
      },
      {
        id: fid(id, 'the-reveal'),
        type: 'reveal',
        title: 'Orvyn\'s Name in the Ledger',
        summary: 'By lantern light the player can read the informant list. Twelve years ago the Compact paid Orvyn Kett to report on Dalthor wagons. The wounded man upstairs is in the book.',
        position: pos(5),
        size: size(),
        content: {
          designerNotes: 'Recontextualize the Compact seal fragment from the Establishing Scene and Orvyn\'s fear. Deliver as a readable page, then 2–3 seconds of silence. If obstacle_outcome = bypass, the player gets a torn stub and Orvyn\'s reaction still confirms it.',
          playerVisibleText: 'The list is written in a clerk\'s hand. Informants paid by the Compact, Ashmarrow district, twelve years back. Third name: Orvyn Kett, tollkeeper. Amount paid. Dates.',
          stakes: 'truth_discovered makes the Consequence a moral choice, not a delivery errand. Without this beat the player can still hand the ledger off, but they will not know why Orvyn begged.',
          entryConditions: ['obstacle_outcome is set', 'cellar_reached = true'],
          exitConditions: ['truth_discovered = true'],
          stateChanges: [
            'Sets: truth_discovered = true',
            'Sets: orvyn_named_in_ledger = true',
            'Unlocks: consequence choice (keep / expose / bury)',
          ],
          involvedCharacters: ['Orvyn Kett (named on the page)', 'Preket (already knew)'],
          involvedFactions: ['The Compact', 'Dalthor Trading House'],
          possibleOutcomes: [
            'Player reads the full page (clean or costly) and understands Orvyn\'s fear',
            'Player has only the torn stub (bypass) and Orvyn fills the gap if still present',
            'Player already suspected from compact_seal_noticed and is confirmed',
          ],
          requiredAssets: [
            'prop/tollhouse-ledger-page-12 — readable inspect, names Orvyn Kett',
            'prop/ledger-page-12-stub — bypass variant, partial name',
            'fx/lantern-hold — 2–3s silence, no follow-up VO',
            'audio/stinger-reveal-hold — single low note, then mute',
          ],
          implementationChecklist: [
            'Write the inspect text as one block: "Orvyn Kett, tollkeeper, Compact informant, twelve years."',
            'Trace the seal fragment from the Establishing Scene so a careful player can connect it',
            'Hold 2–3 seconds after inspect before any character or UI speaks',
          ],
          testCriteria: [
            'Reveal inspect is gated on obstacle_outcome being set',
            'truth_discovered = true is set before the Consequence unlocks',
            'bypass variant still sets orvyn_named_in_ledger = true if Orvyn is present to confirm',
            'No VO overlaps the 2–3s hold',
          ],
          authorOnlyNotes: [
            'The player did not know Orvyn was a Compact informant until this inspect.',
            'This recontextualizes his wound, his fear, and why Preket brought a warrant instead of coin.',
          ],
        },
        annotations: [
          { id: fid(id, 'ann-rev-1'), type: 'author_only', text: 'The reveal should change what the player does next, not just what they know.' },
          { id: fid(id, 'ann-rev-2'), type: 'player_visible', text: 'Deliver this with a pause — no immediate follow-up dialogue. Let it land.' },
        ],
      },
      {
        id: fid(id, 'the-consequence'),
        type: 'consequence',
        title: 'The Ledger Leaves the Pass',
        summary: 'The world answers. Compact standing, Velthari copies, Dalthor cargo, and Orvyn\'s fate are written into flags that later quests will read.',
        position: pos(6),
        size: size(),
        content: {
          designerNotes: 'Make one faction relationship permanently different and visible in the world: Compact checkpoint on the pass road, Velthari dead-drop in the treeline, or a burned Dalthor wagon. Do not clean it up.',
          playerVisibleText: 'By the time you climb the hatch, the pass has already changed. Someone is going to live with what you did with that book.',
          stakes: 'quest_outcome is the chapter flag. If it is wrong, The Archive Window and later Compact quests branch on garbage data.',
          entryConditions: [
            'truth_discovered = true',
            'player_made_consequence_choice = true',
          ],
          exitConditions: ['quest_outcome is set to exposed | buried | kept_copy'],
          stateChanges: [
            'Sets: quest_outcome = exposed | buried | kept_copy',
            'Sets: orvyn_fate = arrested | fled | traveling_with_player',
            'Updates: compact_faction_standing, velthari_faction_standing, dalthor_faction_standing from ledger_recipient + quest_outcome',
          ],
          involvedCharacters: ['Orvyn Kett', 'Preket', 'Savan Vreil', 'Issa Dalthor'],
          involvedFactions: ['The Compact', 'Velthari Intelligence', 'Dalthor Trading House'],
          possibleOutcomes: [
            'exposed — ledger goes public; Compact checkpoint spawns on the pass; Orvyn arrested unless protected',
            'buried — original destroyed; Velthari may still hold a copy; Dalthor standing recovers',
            'kept_copy — player holds the book; all three factions mark the player as a target',
          ],
          requiredAssets: [
            'env/ashmarrow-pass-checkpoint — Compact barrier, spawns only if quest_outcome = exposed',
            'prop/velthari-dead-drop — treeline satchel, spawns if buried and Savan escaped',
            'anim/orvyn-exit — arrested / fled / follow variants',
            'ui/faction-standing-toast — silent world change, no quest-log sermon',
          ],
          implementationChecklist: [
            'Set quest_outcome and orvyn_fate before the beat clears',
            'Spawn exactly one world-visible change the player can see from the tollhouse door',
            'Decide now whether the player learns the full Velthari-copy truth or it waits for the Future Thread',
          ],
          testCriteria: [
            'quest_outcome matches the Consequence choice on all three paths',
            'The world change is visible from the tollhouse door without opening the quest log',
            'orvyn_fate is set and later dialogue can query it',
          ],
          authorOnlyNotes: [
            'Preket arrests Orvyn on exposed unless the player physically blocks the door (traveling_with_player).',
            'buried never guarantees the Velthari copy is gone — that is the Future Thread.',
          ],
        },
        annotations: [
          { id: fid(id, 'ann-cons-1'), type: 'danger', text: 'Do not clean up the consequence. Leave the Compact checkpoint or the dead-drop visible from the door.' },
        ],
      },
      {
        id: fid(id, 'future-thread'),
        type: 'hook',
        title: 'A Copy Still Moves',
        summary: 'One thread stays open: a Velthari courier satchel in the treeline, or a Compact warrant with the player\'s description. The next quest reads future_thread_active.',
        position: pos(7),
        size: size(),
        content: {
          designerNotes: 'Not a cliffhanger cutscene. A discoverable object in the aftermath: Savan\'s satchel if she escaped, or a warrant nailed to the tollhouse door. No marker. The question is "Who still has a copy?"',
          playerVisibleText: 'In the treeline, a waxed satchel hangs at shoulder height. Or, if the trees are empty, a Compact warrant is already nailed to the tollhouse door. Someone still has pages.',
          stakes: 'future_thread_active is the entry flag for The Archive Window. If it never sets, that quest cannot start.',
          entryConditions: ['quest_outcome is set'],
          exitConditions: ['future_thread_active = true'],
          stateChanges: [
            'Sets: future_thread_active = true',
            'Sets: velthari_copy_loose = true if Savan escaped',
            'Activates: quest_archive_window_available = true',
          ],
          involvedCharacters: ['Savan Vreil (absent, implied)', 'Orvyn Kett (if fled)'],
          involvedFactions: ['Velthari Intelligence', 'The Compact'],
          possibleOutcomes: [
            'Player takes the satchel now and starts The Archive Window early',
            'Player files the warrant or satchel and the next quest surfaces at camp',
            'Player ignores it; Compact or Velthari force the next quest at a worse time',
          ],
          requiredAssets: [
            'prop/velthari-satchel-treeline — inspectable, no marker, spawn if velthari_copy_loose',
            'prop/compact-warrant-door — inspectable fallback if Savan did not escape',
            'dlg/future-thread-inspect — one question: "Who still has a copy of the ledger?"',
          ],
          implementationChecklist: [
            'Write the thread as the single question "Who still has a copy of the ledger?"',
            'Connect future_thread_active to quest_archive_window_available',
            'Place the satchel or warrant with no quest marker',
          ],
          testCriteria: [
            'Thread object spawns only after quest_outcome is set',
            'Inspect is possible without a marker',
            'future_thread_active = true sets quest_archive_window_available = true',
          ],
          authorOnlyNotes: [
            'The satchel contains a partial copy and a Velthari archive address — fuel for The Archive Window template.',
          ],
        },
        annotations: [
          { id: fid(id, 'ann-fthread-1'), type: 'branch_note', text: 'Intentionally unresolved. Connects to The Archive Window (quest_branch).' },
          { id: fid(id, 'ann-fthread-2'), type: 'timing', text: 'Deliver as an epilogue beat. End on the question, not the answer.' },
        ],
      },
    ];

    const connections: StoryboardConnection[] = [
      { id: cid(id, 'opening-hook', 'establishing-scene'), fromFrameId: fid(id, 'opening-hook'), toFrameId: fid(id, 'establishing-scene'), type: 'sequence', label: 'enter the tollhouse' },
      { id: cid(id, 'establishing-scene', 'character-contact'), fromFrameId: fid(id, 'establishing-scene'), toFrameId: fid(id, 'character-contact'), type: 'sequence', label: 'Orvyn found' },
      { id: cid(id, 'character-contact', 'key-choice'), fromFrameId: fid(id, 'character-contact'), toFrameId: fid(id, 'key-choice'), type: 'sequence', label: 'factions arrive' },
      { id: cid(id, 'key-choice', 'the-obstacle'), fromFrameId: fid(id, 'key-choice'), toFrameId: fid(id, 'the-obstacle'), type: 'sequence', label: 'descend the hatch' },
      { id: cid(id, 'the-obstacle', 'the-reveal'), fromFrameId: fid(id, 'the-obstacle'), toFrameId: fid(id, 'the-reveal'), type: 'sequence', label: 'read the ledger' },
      { id: cid(id, 'the-reveal', 'the-consequence'), fromFrameId: fid(id, 'the-reveal'), toFrameId: fid(id, 'the-consequence'), type: 'consequence', label: 'the pass changes' },
      { id: cid(id, 'the-consequence', 'future-thread'), fromFrameId: fid(id, 'the-consequence'), toFrameId: fid(id, 'future-thread'), type: 'consequence', label: 'a copy still moves' },
    ];

    return { id, title, description, templateId: 'quest_flow', frames, connections };
  },
};

// ─── Template 2: Quest Branch ────────────────────────────────────────────────
// Worked example: The Archive Window — three paths, one reading room.

const QUEST_BRANCH: StoryboardTemplateDefinition = {
  id: 'quest_branch',
  name: 'Quest Branch',
  description: 'A branching player choice with three divergent paths converging at a shared consequence. Makes player agency and game-state logic visible on the board. Gold example: The Archive Window — twelve hours to recover the ledger from Compact records.',
  frameCount: 7,
  bestFor: 'Designing a decision with multiple valid outcomes — faction choices, moral dilemmas, or tactical divergence that converges before the next chapter.',

  createStoryboard({ id, title, description }: CreateStoryboardInput): Storyboard {
    const frames: StoryboardFrame[] = [
      {
        id: fid(id, 'inciting-situation'),
        type: 'hook',
        title: 'Twelve Hours on the Archive',
        summary: 'Compact clerks have the recovered ledger in the Ashmarrow records hall. At dawn they copy it into the regional file. The player has until then.',
        position: pos(0),
        size: size(),
        content: {
          designerNotes: 'Present a problem, not a mission briefing. All three paths (raid the hall, bribe clerk Ryn Vale, crawl the smugglers\' tunnel) are visible from the plaza without special stats. Inaction: at dawn the copy is filed and quest_archive_window_failed = true.',
          playerVisibleText: 'The Compact records hall sits on the plaza. A clerk carries the ledger through the front doors. A notice board says copies are filed at dawn. You have until the bell.',
          stakes: 'If the player does nothing until dawn, the regional file exists forever and later Compact quests treat the ledger as public.',
          entryConditions: [
            'quest_archive_window_available = true',
            'future_thread_active = true',
          ],
          exitConditions: ['inciting_situation_complete = true'],
          stateChanges: [
            'Sets: quest_archive_window_active = true',
            'Sets: inciting_situation_complete = true',
            'Sets: archive_copy_deadline = dawn_bell',
          ],
          involvedCharacters: [
            'Ryn Vale (Compact night clerk, visible at the side door)',
            'Captain Preket (off-site, named on the notice board)',
          ],
          involvedFactions: ['The Compact', 'Velthari Intelligence', 'Dalthor Trading House'],
          possibleOutcomes: [
            'Player clocks all three routes from the plaza (front, clerk, grate)',
            'Player talks to Ryn Vale before committing and hears the bribe price',
            'Player finds the smugglers\' grate and marks Path C without taking it yet',
          ],
          requiredAssets: [
            'env/ashmarrow-plaza-night — records hall facade, notice board, side door, street grate',
            'prop/dawn-copy-notice — readable, states the dawn bell deadline',
            'npc/ryn-vale-clerk — side-door idle, available for query before commit',
            'vol/smuggler-grate-marker — inspectable, does not start Path C until Decision Point',
            'audio/amb-plaza-night — distant bell practice, no combat music',
          ],
          implementationChecklist: [
            'State the problem on the notice board in one sentence: "Regional copy files at dawn."',
            'Place front doors, Ryn Vale, and the grate so all three are reachable from the plaza spawn',
            'Start a dawn-bell timer; on expiry set quest_archive_window_failed = true',
          ],
          testCriteria: [
            'All three paths are reachable from the plaza without prior quest items or skill gates',
            'Inaction until dawn_bell sets quest_archive_window_failed = true',
            'The deadline is legible from the notice board without a quest marker',
          ],
          authorOnlyNotes: [
            'Ryn Vale will take a bribe (Path B) but her price includes a condition: the player never names her to Preket.',
            'The grate (Path C) is an old Dalthor smuggling run from the war. Issa Dalthor knows it exists.',
          ],
        },
        annotations: [
          { id: fid(id, 'ann-inc-1'), type: 'designer_note', text: 'Present the situation as a problem, not a mission. The player should feel they are making a real choice.' },
        ],
      },
      {
        id: fid(id, 'decision-point'),
        type: 'choice',
        title: 'How You Enter the Hall',
        summary: 'Commit to one route: raid the front, bribe the clerk, or crawl the smugglers\' tunnel. Each is a valid strategy with a distinct cost.',
        position: pos(1),
        size: size(),
        content: {
          designerNotes: 'Diegetic commit: walking through the front doors, handing Ryn the coin purse, or dropping into the grate. No menu. Once chosen_path is set, the other two routes lock until Convergence. Switching mid-route dumps the player back to the plaza with chosen_path cleared and time still ticking.',
          playerVisibleText: 'Front doors, clerk\'s side door, or the grate in the alley. Each gets you to the same reading room. None of them is free.',
          stakes: 'chosen_path decides whether Convergence is a fight, a quiet handoff, or a surprise with a Velthari duplicate.',
          entryConditions: ['inciting_situation_complete = true'],
          exitConditions: ['chosen_path = path_a | path_b | path_c'],
          stateChanges: [
            'Sets: chosen_path = path_a | path_b | path_c',
            'Locks: the other two route triggers until Convergence',
          ],
          involvedCharacters: ['Ryn Vale', 'Issa Dalthor (can confirm the grate if asked)'],
          involvedFactions: ['The Compact', 'Dalthor Trading House'],
          possibleOutcomes: [
            'path_a — raid the front hall, spend player_hp and Compact standing',
            'path_b — bribe Ryn Vale, arrive late with the copy-schedule in hand',
            'path_c — smugglers\' tunnel, chance at a Velthari duplicate already in the walls',
          ],
          requiredAssets: [
            'interact/hall-front-doors — committing this sets path_a',
            'interact/ryn-bribe-purse — 200 coin, committing this sets path_b',
            'interact/smuggler-grate — drop-in, committing this sets path_c',
            'npc/ryn-vale-query — pre-commit dialogue, no path lock',
          ],
          implementationChecklist: [
            'Implement the commit as three in-world interacts, not a choice wheel',
            'If the player tries to switch mid-route, clear chosen_path and return them to the plaza with the dawn timer intact',
            'Verify each path can reach the reading room from a different navmesh door',
          ],
          testCriteria: [
            'chosen_path is set before any path beat\'s entry condition can pass',
            'Each path beat is reachable only when chosen_path matches',
            'No interact copy calls a route "safer" or "recommended"',
          ],
          authorOnlyNotes: [
            'Path C is not a trap. Honor it. The Velthari duplicate is a real reward.',
          ],
        },
        annotations: [
          { id: fid(id, 'ann-dp-1'), type: 'branch_note', text: 'This frame connects to three outgoing paths. The branch is the structural point of this template.' },
          { id: fid(id, 'ann-dp-2'), type: 'danger', text: 'No correct path. If the raid is obviously superior, raise Ryn\'s intel value and the tunnel\'s duplicate.' },
        ],
      },
      {
        id: fid(id, 'path-a'),
        type: 'scene',
        title: 'Path A — Front Hall Raid',
        summary: 'Straight through the records hall. Faster. Costs player_hp and Compact standing. Arrives first, with the least information.',
        position: pos(2, 'top'),
        size: size(),
        content: {
          designerNotes: 'Unique obstacle: night-watch on the marble stair, not a copy of B or C. Resource cost is player_hp (fight or sprint) plus compact_faction_standing -2. Path A players reach Convergence first and find Preket still in the room.',
          playerVisibleText: 'The front hall is lit. Two night-watch on the stair. You can go through them. It will be loud.',
          stakes: 'You arrive first, but Preket is still in the reading room and Compact standing drops. Convergence will be a confrontation, not a theft.',
          entryConditions: ['chosen_path = path_a'],
          exitConditions: ['path_a_completed = true'],
          stateChanges: [
            'Modifies: player_hp -= 25 on fight, or player_hp -= 10 on sprint-past',
            'Modifies: compact_faction_standing -= 2',
            'Sets: path_a_completed = true',
            'Sets: preket_in_reading_room = true',
          ],
          involvedCharacters: ['Night-watch Halden', 'Night-watch Sera', 'Captain Preket (ahead, in the reading room)'],
          involvedFactions: ['The Compact'],
          possibleOutcomes: [
            'Fight the watch, arrive at full information-zero, Preket present',
            'Sprint past, take the smaller hp hit, alarm still trips',
            'Get pinned on the stair and must burn a bandage_kit to continue',
          ],
          requiredAssets: [
            'env/compact-records-front-hall — marble stair, two cover desks',
            'npc/night-watch-halden',
            'npc/night-watch-sera',
            'ai/stair-hold — fight or sprint-past, no stealth win on Path A',
            'ui/standing-cost-toast — Compact -2, visible during the beat',
          ],
          implementationChecklist: [
            'Build a stair fight that does not reuse Path C tunnel geometry',
            'Show the Compact standing cost during the beat, not only in a later menu',
            'Set preket_in_reading_room = true so Convergence can spawn him',
          ],
          testCriteria: [
            'Path A loads only when chosen_path = path_a',
            'path_a_completed = true is required for Convergence entry',
            'compact_faction_standing decreases by 2 and the toast is visible',
          ],
          authorOnlyNotes: [
            'Path A players arrive first but with least information. Preket has not left. That is the cost.',
          ],
        },
        annotations: [
          { id: fid(id, 'ann-a-1'), type: 'designer_note', text: 'Path A players arrive first but with least information.' },
        ],
      },
      {
        id: fid(id, 'path-b'),
        type: 'scene',
        title: 'Path B — Clerk\'s Side Door',
        summary: 'Bribe Ryn Vale. Slower. She hands over the copy-schedule and walks you in after the night-watch rotation. You arrive informed, possibly late.',
        position: pos(2, 'mid'),
        size: size(),
        content: {
          designerNotes: 'Unique reward: path_b_copy_schedule = true changes Convergence lighting and NPC placement (Preket has left). Cost: 200 coin and Ryn\'s condition (ryn_protected = true). If the player names her later, she is arrested and this path\'s intel is retroactively burned in New Game+ flags only — for this quest, honor the condition as a promise the Consequence can break.',
          playerVisibleText: 'Ryn Vale counts the coin without looking at you. "I walk you in after the rotation. You never say my name to Preket. If you do, I was never here."',
          stakes: 'You arrive with the schedule and an empty reading room — but the dawn bell is closer, and you now owe Ryn silence.',
          entryConditions: ['chosen_path = path_b'],
          exitConditions: ['path_b_completed = true'],
          stateChanges: [
            'Sets: path_b_copy_schedule = true',
            'Sets: path_b_completed = true',
            'Sets: ryn_protected = true',
            'Modifies: player_coin -= 200',
          ],
          involvedCharacters: ['Ryn Vale (ally with a condition)', 'Captain Preket (absent if the rotation has passed)'],
          involvedFactions: ['The Compact'],
          possibleOutcomes: [
            'Ryn walks the player in; Preket has left; schedule shows where the original sits',
            'Player cannot pay 200 coin — Ryn refuses and chosen_path clears back to the plaza',
            'Player arrives late enough that the dawn-bell warning ticks into the last third',
          ],
          requiredAssets: [
            'env/compact-records-side-corridor — clerk desks, rotation window',
            'npc/ryn-vale-escort — walk-and-talk to the reading room',
            'item/copy-schedule — inspectable, marks the original vs the file copy',
            'dlg/ryn-condition — explicit "do not name me to Preket" before the door opens',
          ],
          implementationChecklist: [
            'Gate the escort on player_coin >= 200; otherwise bounce to plaza with chosen_path cleared',
            'Put Ryn\'s condition in spoken dialogue before the door, not in a tooltip',
            'path_b_copy_schedule must change Convergence: empty room, original on the side table',
          ],
          testCriteria: [
            'Path B loads only when chosen_path = path_b',
            'path_b_copy_schedule = true selects the empty-room Convergence variant',
            'Ryn\'s condition line plays before the reading-room door opens',
            'Insufficient coin does not soft-lock; chosen_path clears',
          ],
          authorOnlyNotes: [
            'Path B players arrive last-ish but know the most. The schedule is the unique intel A and C cannot get.',
          ],
        },
        annotations: [
          { id: fid(id, 'ann-b-1'), type: 'designer_note', text: 'Path B players arrive later but know the most.' },
        ],
      },
      {
        id: fid(id, 'path-c'),
        type: 'encounter',
        title: 'Path C — Smugglers\' Tunnel',
        summary: 'The old Dalthor grate. Lateral, wet, and not a harder version of the stair fight. Inside the wall: a Velthari duplicate already being copied.',
        position: pos(2, 'bot'),
        size: size(),
        content: {
          designerNotes: 'Danger is collapse and a Velthari scribe, not more Compact hp. path_c_discovery = found if the player inspects the wall-cache; missed if they sprint for the reading-room grate. Honor lateral thinking: found grants velthari_duplicate_held = true, which Convergence cannot grant to A or B.',
          playerVisibleText: 'The grate drops you into a brick run that still smells like Dalthor tar. Someone has been here with a lantern. The wall on the left is newer than the rest.',
          stakes: 'Highest uncertainty. You may reach Convergence with a duplicate Compact does not know exists — or you may bring the tunnel down and crawl in late with nothing.',
          entryConditions: ['chosen_path = path_c'],
          exitConditions: ['path_c_completed = true'],
          stateChanges: [
            'Sets: path_c_discovery = found | missed (inspect wall-cache vs sprint)',
            'Sets: path_c_completed = true',
            'Sets: velthari_duplicate_held = true only if path_c_discovery = found',
          ],
          involvedCharacters: ['Velthari scribe (unnamed, flees if spotted)', 'Issa Dalthor (knows the grate, not present)'],
          involvedFactions: ['Velthari Intelligence', 'Dalthor Trading House'],
          possibleOutcomes: [
            'found — player takes the Velthari duplicate from the wall-cache; scribe flees',
            'missed — player sprints to the reading-room grate; cache collapses behind them',
            'collapse — player_hp -= 15, still reaches Convergence via the crawl, no duplicate',
          ],
          requiredAssets: [
            'env/dalthor-smuggler-tunnel — brick, tar smell, one new wall panel',
            'prop/velthari-wall-cache — inspectable duplicate pages',
            'npc/velthari-scribe-flee — no combat unless the player blocks the exit',
            'vol/tunnel-collapse-fallback — crawl to reading room if blocked, always reaches Convergence',
          ],
          implementationChecklist: [
            'Put something A and B cannot obtain (the Velthari duplicate) behind an inspect, not an auto-grant',
            'Make the danger collapse and a fleeing scribe, not a scaled-up stair fight',
            'Always provide a crawl to Convergence so Path C cannot dead-end',
          ],
          testCriteria: [
            'Path C loads only when chosen_path = path_c',
            'path_c_discovery is found only on wall-cache inspect, never automatically',
            'velthari_duplicate_held is unique to Path C found — A and B cannot set it',
            'Collapse still sets path_c_completed = true',
          ],
          authorOnlyNotes: [
            'The duplicate is what The Name in the Ledger cutscene can later prove Velthari still holds.',
          ],
        },
        annotations: [
          { id: fid(id, 'ann-c-1'), type: 'branch_note', text: 'Honor lateral thinking. This path should feel rewarding, not like a design trap.' },
          { id: fid(id, 'ann-c-2'), type: 'author_only', text: 'Path C may expose the Velthari duplicate the next quest needs. Flag velthari_duplicate_held.' },
        ],
      },
      {
        id: fid(id, 'convergence'),
        type: 'consequence',
        title: 'Reading Room',
        summary: 'All paths reach the same room. Path A finds Preket. Path B finds an empty table and a schedule. Path C can enter from the wall with a duplicate. Same endpoint, different leverage.',
        position: pos(3),
        size: size(),
        content: {
          designerNotes: 'Three variants of one room. They must all be able to set quest_outcome = original_taken | copy_taken | duplicate_taken. The one thing they cannot all have: the unmarked original and anonymity at the same time.',
          playerVisibleText: 'The reading room is a single lantern over a slope-top desk. What you know, who is still here, and what you carried in through the wall decides this.',
          stakes: 'quest_outcome here is permanent for the chapter. Compact will know a document left. They may or may not know it was you.',
          entryConditions: [
            'path_a_completed = true OR path_b_completed = true OR path_c_completed = true',
          ],
          exitConditions: ['quest_outcome = original_taken | copy_taken | duplicate_taken'],
          stateChanges: [
            'Sets: convergence_outcome = clean | costly | unexpected',
            'Sets: quest_outcome = original_taken | copy_taken | duplicate_taken',
            'Updates: compact_faction_standing based on whether Preket saw the player',
          ],
          involvedCharacters: ['Captain Preket (Path A)', 'Ryn Vale (Path B, waiting in the corridor)', 'Velthari scribe (Path C, if not fled)'],
          involvedFactions: ['The Compact', 'Velthari Intelligence'],
          possibleOutcomes: [
            'Path B schedule → original_taken, clean, Preket never sees the player',
            'Path A confrontation → original_taken or copy_taken, costly, Preket sees the player',
            'Path C found → duplicate_taken, unexpected, Compact still thinks the original is filed',
          ],
          requiredAssets: [
            'env/compact-reading-room — one desk, three lighting / occupancy variants',
            'dlg/preket-confrontation — Path A only',
            'prop/ledger-original — side table if path_b_copy_schedule',
            'prop/ledger-file-copy — desk if Path A',
            'nav/wall-grate-enter — Path C arrival, different camera than the door',
          ],
          implementationChecklist: [
            'Implement three occupancy variants that all write quest_outcome and then share the same exit door',
            'Identify the scarce thing: unmarked original + anonymity cannot both be true',
            'If path_c_discovery = found, allow duplicate_taken without moving the original',
          ],
          testCriteria: [
            'Convergence variant matches the completed path flag — play all three',
            'path_c_discovery = found can set quest_outcome = duplicate_taken',
            'quest_outcome is set before the beat clears',
          ],
          authorOnlyNotes: [
            'duplicate_taken is the only outcome where Compact\'s file still looks complete at dawn. That is Path C\'s unique power.',
          ],
        },
        annotations: [
          { id: fid(id, 'ann-conv-1'), type: 'designer_note', text: 'This is the payoff for giving the player real choice. Make the consequences of each path legible here.' },
        ],
      },
      {
        id: fid(id, 'fallout-hook'),
        type: 'hook',
        title: 'The Clerk, or the Warrant',
        summary: 'Whatever was decided, Compact knows a document moved. Ryn Vale\'s name or the player\'s face is now in a night report. The thread is path-agnostic.',
        position: pos(4),
        size: size(),
        content: {
          designerNotes: 'Path-agnostic fallout: a night-report pinned to the plaza board at dawn. If ryn_protected was true and the player kept the promise, the report names "unknown thief." If they broke it, it names Ryn. The player\'s face is sketched only if preket_in_reading_room was true.',
          playerVisibleText: 'Dawn. A new notice is nailed over the copy schedule. Someone is described. Someone is going to be asked questions.',
          stakes: 'fallout_thread_active starts the next Compact chapter. It must fire on all three paths.',
          entryConditions: ['quest_outcome is set'],
          exitConditions: ['fallout_thread_active = true'],
          stateChanges: [
            'Sets: fallout_thread_active = true',
            'Sets: compact_night_report_posted = true',
            'Activates: quest_name_in_ledger_available = true',
          ],
          involvedCharacters: ['Ryn Vale (named or protected)', 'Captain Preket (author of the report)'],
          involvedFactions: ['The Compact'],
          possibleOutcomes: [
            'Report names an unknown thief (Ryn protected, Preket did not see the player)',
            'Report names Ryn Vale (promise broken)',
            'Report sketches the player (Path A / Preket present)',
          ],
          requiredAssets: [
            'prop/dawn-night-report — plaza board overlay, three text variants',
            'env/ashmarrow-plaza-dawn — same plaza as the inciting beat, daylight',
          ],
          implementationChecklist: [
            'Write one plaza-board inspect that spans all three paths',
            'Variant the report text from ryn_protected and preket_in_reading_room',
            'Connect fallout_thread_active to quest_name_in_ledger_available',
          ],
          testCriteria: [
            'fallout_thread_active sets on path_a, path_b, and path_c completions',
            'The notice is readable without a quest-log pointer',
            'quest_name_in_ledger_available = true after inspect or zone-exit',
          ],
          authorOnlyNotes: [
            'The night report is the proof the player\'s choice mattered beyond quest-complete. It is also the seed for The Name in the Ledger.',
          ],
        },
        annotations: [
          { id: fid(id, 'ann-fh-1'), type: 'branch_note', text: 'Fires regardless of which path was taken. This is the convergence thread for the next arc.' },
        ],
      },
    ];

    const connections: StoryboardConnection[] = [
      { id: cid(id, 'inciting-situation', 'decision-point'), fromFrameId: fid(id, 'inciting-situation'), toFrameId: fid(id, 'decision-point'), type: 'sequence', label: 'dawn is coming' },
      { id: cid(id, 'decision-point', 'path-a'), fromFrameId: fid(id, 'decision-point'), toFrameId: fid(id, 'path-a'), type: 'choice', label: 'raid the front hall' },
      { id: cid(id, 'decision-point', 'path-b'), fromFrameId: fid(id, 'decision-point'), toFrameId: fid(id, 'path-b'), type: 'choice', label: 'bribe the clerk' },
      { id: cid(id, 'decision-point', 'path-c'), fromFrameId: fid(id, 'decision-point'), toFrameId: fid(id, 'path-c'), type: 'choice', label: 'crawl the grate' },
      { id: cid(id, 'path-a', 'convergence'), fromFrameId: fid(id, 'path-a'), toFrameId: fid(id, 'convergence'), type: 'consequence', label: 'Preket is still inside' },
      { id: cid(id, 'path-b', 'convergence'), fromFrameId: fid(id, 'path-b'), toFrameId: fid(id, 'convergence'), type: 'consequence', label: 'empty room, schedule in hand' },
      { id: cid(id, 'path-c', 'convergence'), fromFrameId: fid(id, 'path-c'), toFrameId: fid(id, 'convergence'), type: 'consequence', label: 'enter through the wall' },
      { id: cid(id, 'convergence', 'fallout-hook'), fromFrameId: fid(id, 'convergence'), toFrameId: fid(id, 'fallout-hook'), type: 'consequence', label: 'a night report is posted' },
    ];

    return { id, title, description, templateId: 'quest_branch', frames, connections };
  },
};

// ─── Template 3: Cutscene Beat ────────────────────────────────────────────────
// Worked example: The Name in the Ledger — Orvyn reads his own entry.

const CUTSCENE_BEAT: StoryboardTemplateDefinition = {
  id: 'cutscene_beat',
  name: 'Cutscene Beat',
  description: 'A dramatic authored moment — reveal, confrontation, or character beat — that always preserves room for player response. Gold example: The Name in the Ledger — Orvyn Kett reads the informant list in the cellar.',
  frameCount: 5,
  bestFor: 'Major reveals, character confrontations, villain monologues, lore drops, and pivotal relationship moments — without removing player agency.',

  createStoryboard({ id, title, description }: CreateStoryboardInput): Storyboard {
    const frames: StoryboardFrame[] = [
      {
        id: fid(id, 'establishing-frame'),
        type: 'scene',
        title: 'Lantern Over the Crate',
        summary: 'Tollhouse cellar. One lantern on the slope-top crate. The ledger is open. Drip from the east wall. No music. The player should slow down before Orvyn speaks.',
        position: pos(0),
        size: size(),
        content: {
          designerNotes: 'Atmosphere, not plot. Light: single lantern, hard shadows on the informant list. Sound: drip, no score. Positioning: Orvyn is already at the crate, back to the hatch, so the player walks in on a private moment.',
          playerVisibleText: 'The cellar is smaller by lantern light. Orvyn is already here, hunched over the open ledger. He has not heard the hatch.',
          stakes: 'If this frame is skipped or instant-cut, the Revelation lands as exposition instead of a private shame the player walked in on.',
          entryConditions: ['quest_name_in_ledger_available = true', 'cutscene_ledger_name_triggered = true'],
          exitConditions: ['establishing_frame_complete = true'],
          stateChanges: ['Sets: establishing_frame_complete = true'],
          involvedCharacters: ['Orvyn Kett (back to hatch, reading)'],
          involvedFactions: ['The Compact'],
          possibleOutcomes: [
            'Player watches from the stairs before stepping down',
            'Player approaches immediately and Orvyn still does not turn until the Character Beat',
          ],
          requiredAssets: [
            'env/tollhouse-cellar-lantern — single practical, hard shadow on page 12',
            'audio/amb-cellar-drip — no score, no stinger yet',
            'anim/orvyn-read-back — looped read, no eye contact',
            'cam/hatch-descend — 8s, skippable only after 3s',
          ],
          implementationChecklist: [
            'Lock the lantern as the only key light; no fill that flattens Orvyn\'s face',
            'Place Orvyn at the crate before the player enters; he does not spawn in',
            'Hold the last image (his hand on the name) for one second before the Character Beat',
          ],
          testCriteria: [
            'No Orvyn VO fires during the Establishing Frame',
            'Camera cannot skip in the first 3 seconds',
            'The ledger page is readable in the shot without a UI popup',
          ],
          authorOnlyNotes: [
            'Orvyn came down on his own after the Archive Window fallout. He already suspects. He is confirming.',
          ],
        },
        annotations: [
          { id: fid(id, 'ann-ef-1'), type: 'timing', text: 'Short. 2–3 minutes including the descend. Do not let the atmosphere collapse before the Character Beat fires.' },
          { id: fid(id, 'ann-ef-2'), type: 'designer_note', text: 'The Establishing Frame earns the Revelation. Do not cut it for pacing.' },
        ],
      },
      {
        id: fid(id, 'character-moment'),
        type: 'npc_beat',
        title: 'Orvyn\'s Voice Breaks',
        summary: 'Orvyn does not explain the plot. He says one line that defines him for the rest of the game, then stops.',
        position: pos(1),
        size: size(),
        content: {
          designerNotes: 'Visible want: make the player leave so he can burn the page. Hidden want: be told he was more than an informant. Defining line, written first: "I kept this road open. That is the only true thing in this book." He stays for the Player Response; he does not exit.',
          playerVisibleText: 'He still does not turn around. "I kept this road open. That is the only true thing in this book."',
          stakes: 'If the line is cut or paraphrased into exposition, the Revelation becomes a lore dump instead of a man defending the one thing he did right.',
          entryConditions: ['establishing_frame_complete = true'],
          exitConditions: ['character_moment_complete = true'],
          stateChanges: ['Sets: character_moment_complete = true'],
          involvedCharacters: ['Orvyn Kett'],
          involvedFactions: ['The Compact', 'Dalthor Trading House'],
          possibleOutcomes: [
            'Player hears the line and waits — trust tilts toward him',
            'Player interrupts — Orvyn still finishes the line, then the Revelation fires',
            'Player already read page 12 in The Tollhouse Ledger — Orvyn\'s shame is confirmation, not news',
          ],
          requiredAssets: [
            'npc/orvyn-kett-cutscene — seated-read face set, no combat rig',
            'vo/orvyn-defining-line — "I kept this road open. That is the only true thing in this book."',
            'anim/orvyn-hand-on-name — holds through the line',
          ],
          implementationChecklist: [
            'Record the defining line first; do not ad-lib exposition around it',
            'Keep Orvyn in the room for the Player Response; no exit walk',
            'Plant one readable cue of the hidden want: he covers the payment column with his hand',
          ],
          testCriteria: [
            'Defining line plays to completion even if the player mashes interact',
            'Orvyn\'s hand covers the payment column (hidden-want cue) before the Revelation',
            'Scene cannot skip from Establishing Frame to Revelation on first playthrough',
          ],
          authorOnlyNotes: [
            'Hidden want: he needs the player to say he was more than the Compact\'s clerk. Plant it; do not have him ask.',
          ],
        },
        annotations: [
          { id: fid(id, 'ann-nm-1'), type: 'player_visible', text: 'The Character Beat should feel like the player exists in the scene, not just observes it.' },
          { id: fid(id, 'ann-nm-2'), type: 'author_only', text: 'The character\'s hidden motivation is the real story. His hand on the payment column is the clue.' },
        ],
      },
      {
        id: fid(id, 'revelation'),
        type: 'reveal',
        title: 'The Payment Column',
        summary: 'He turns the page. The payment column is in Compact clerk hand: Orvyn Kett, twelve years, amounts. He finally looks at the player.',
        position: pos(2),
        size: size(),
        content: {
          designerNotes: 'Deliver and stop. 2–3 seconds of silence. No second character reaction. This recontextualizes every Orvyn conversation in The Tollhouse Ledger and why Preket brought a warrant instead of coin.',
          playerVisibleText: 'He turns the page. The payment column is a clerk\'s hand. His name. Twelve years. Amounts. He looks at you for the first time.',
          stakes: 'revelation_known unlocks the Player Response. Without it the scene is a monologue and the Shift has nothing to branch on.',
          entryConditions: ['character_moment_complete = true'],
          exitConditions: ['revelation_known = true'],
          stateChanges: [
            'Sets: revelation_known = true',
            'Sets: orvyn_named_in_ledger = true',
            'Unlocks: player_response beat',
          ],
          involvedCharacters: ['Orvyn Kett'],
          involvedFactions: ['The Compact'],
          possibleOutcomes: [
            'Player already knew from The Tollhouse Ledger inspect — this is Orvyn knowing that they know',
            'Player did not read page 12 — this is the first time the name is visible',
            'Player can later challenge the page if they hold the Path C duplicate (evidence path)',
          ],
          requiredAssets: [
            'prop/ledger-payment-column — readable insert, Orvyn Kett / twelve years / amounts',
            'hold/reveal-silence — 2.5s, no VO, no UI',
            'prop/velthari-duplicate-evidence — optional inspect if velthari_duplicate_held = true',
          ],
          implementationChecklist: [
            'Write the insert as one sentence of page text, not a narrator VO',
            'If velthari_duplicate_held, offer an evidence inspect that does not skip the hold',
            'Do not explain why he took the money — hold that for a later quest',
          ],
          testCriteria: [
            'Revelation fires only after character_moment_complete = true',
            'revelation_known = true is set before Player Response unlocks',
            'Hold is 2–3 seconds with no overlapping VO',
            'A player who never met Orvyn before can still read the name on the page',
          ],
          authorOnlyNotes: [
            'Truth exposed: Orvyn was a paid Compact informant for twelve years.',
            'Recontextualizes his wound, his fear of Preket, and the Compact seal fragment in the tollhouse.',
          ],
        },
        annotations: [
          { id: fid(id, 'ann-rev-1'), type: 'timing', text: 'Hold on the Revelation for 2–3 seconds of silence before any character or UI responds.' },
          { id: fid(id, 'ann-rev-2'), type: 'author_only', text: 'The Revelation should make every earlier Orvyn conversation mean something different.' },
        ],
      },
      {
        id: fid(id, 'player-response'),
        type: 'choice',
        title: 'What You Say to Him',
        summary: 'The player must respond. Accept, reject, act, or stay silent. Orvyn has a reaction for each, including silence.',
        position: pos(3),
        size: size(),
        content: {
          designerNotes: 'Four registers, all valid: accept ("You kept the road open."), reject ("You sold names."), act (take the ledger from his hands), silent (6s, then Orvyn speaks first). Silence is not a bug. Unexpected: if the player draws a weapon, Orvyn does not fight — he closes the book and waits.',
          playerVisibleText: 'He waits. You can tell him he is more than the column, tell him he sold names, take the book, or say nothing.',
          stakes: 'player_response writes relationship_orvyn and selects The Shift\'s exit: he stays, he flees, or he follows.',
          entryConditions: ['revelation_known = true'],
          exitConditions: ['player_response = accept | reject | act | silent'],
          stateChanges: [
            'Sets: player_response = accept | reject | act | silent',
            'Triggers: Orvyn reaction variant for that value',
          ],
          involvedCharacters: ['Orvyn Kett'],
          involvedFactions: ['The Compact'],
          possibleOutcomes: [
            'accept — he exhales, leaves the book, relationship_orvyn = allied',
            'reject — he nods once, relationship_orvyn = broken',
            'act — player takes the ledger; he does not stop them; relationship_orvyn = wary',
            'silent — after 6s he says "Say it."; if still silent, he closes the book himself',
          ],
          requiredAssets: [
            'ui/diegetic-response — three spoken interacts plus a 6s silence timer, no "correct" highlight',
            'vo/orvyn-react-accept',
            'vo/orvyn-react-reject',
            'vo/orvyn-react-act',
            'vo/orvyn-react-silent — "Say it." then close-book',
            'anim/orvyn-weapon-wait — if player draws, he closes the book and waits; no combat',
          ],
          implementationChecklist: [
            'Implement accept, reject, act, and silent as first-class outcomes',
            'Weapon-draw is the unexpected choice: no fight, close-book wait, then treat as reject',
            'Silence after 6s must produce Orvyn\'s "Say it." — never a frozen scene',
          ],
          testCriteria: [
            'All four player_response values are reachable and set the flag before The Shift',
            'Silence at 6s plays "Say it." and still completes the beat if the player stays quiet',
            'No response option is visually framed as correct',
            'Weapon-draw does not open combat',
          ],
          authorOnlyNotes: [
            'Silence is the hidden-want test. If the player stays quiet through "Say it.", Orvyn assumes the worst (broken) but does not attack.',
          ],
        },
        annotations: [
          { id: fid(id, 'ann-pr-1'), type: 'danger', text: 'Do not rush past this frame. The player response is the reason the cutscene exists.' },
          { id: fid(id, 'ann-pr-2'), type: 'player_visible', text: 'The player\'s response here is what they will remember. The payment column is what they will talk about.' },
        ],
      },
      {
        id: fid(id, 'the-shift'),
        type: 'consequence',
        title: 'He Stays, or He Walks',
        summary: 'The cellar is the same room with a different man in it. relationship_orvyn is written. The hatch is the exit. No recap.',
        position: pos(4),
        size: size(),
        content: {
          designerNotes: 'Quieter than the Revelation. Show the change: allied Orvyn puts the lantern in the player\'s hand; broken Orvyn goes up the hatch first and is gone from the tollhouse; wary Orvyn leaves the book and sits with his back to the wall. Downstream quests query relationship_orvyn.',
          playerVisibleText: 'The drip is still the loudest sound. He is not the same man who was hunched over the crate when you came down.',
          stakes: 'relationship_orvyn and cutscene_ledger_name_complete gate later Compact quests. If they are unset, those quests cannot tell whether Orvyn is an ally, a witness, or missing.',
          entryConditions: ['player_response is set'],
          exitConditions: ['cutscene_ledger_name_complete = true'],
          stateChanges: [
            'Updates: relationship_orvyn = allied | broken | wary (from player_response)',
            'Sets: cutscene_ledger_name_complete = true',
            'Unlocks: dlg/orvyn-post-ledger and quests that require relationship_orvyn',
          ],
          involvedCharacters: ['Orvyn Kett'],
          involvedFactions: ['The Compact', 'Dalthor Trading House'],
          possibleOutcomes: [
            'allied — lantern handoff, Orvyn remains in the tollhouse as a vendor/ally',
            'broken — Orvyn exits through the hatch and despawns from the interior',
            'wary — Orvyn stays, vendor locked, will still give the cellar key if asked',
          ],
          requiredAssets: [
            'anim/orvyn-lantern-handoff — allied only',
            'anim/orvyn-hatch-exit — broken only',
            'anim/orvyn-wall-sit — wary only',
            'flag/relationship_orvyn — queried by later Compact dialogue',
          ],
          implementationChecklist: [
            'Write one sentence per variant of what is different now (lantern / empty interior / wall-sit)',
            'Set relationship_orvyn and cutscene_ledger_name_complete before the hatch interact enables',
            'Verify the change is visible after the player climbs out (Orvyn present, gone, or wall-sitting)',
          ],
          testCriteria: [
            'relationship_orvyn matches player_response (accept→allied, reject/silent→broken, act→wary)',
            'Downstream dialogue can query relationship_orvyn after the hatch',
            'cutscene_ledger_name_complete = true unlocks dlg/orvyn-post-ledger',
          ],
          authorOnlyNotes: [
            'Silent maps to broken for the flag, but the wall-sit anim is not used — he leaves. Wary is reserved for act (took the book).',
            'This beat seeds whether Orvyn can appear in later Compact archive quests.',
          ],
        },
        annotations: [
          { id: fid(id, 'ann-shift-1'), type: 'designer_note', text: 'Close the scene quietly. The weight of the payment column should still be in the room.' },
          { id: fid(id, 'ann-shift-2'), type: 'branch_note', text: 'relationship_orvyn is the future-quest thread. Do not recap it in VO.' },
        ],
      },
    ];

    const connections: StoryboardConnection[] = [
      { id: cid(id, 'establishing-frame', 'character-moment'), fromFrameId: fid(id, 'establishing-frame'), toFrameId: fid(id, 'character-moment'), type: 'sequence', label: 'he speaks without turning' },
      { id: cid(id, 'character-moment', 'revelation'), fromFrameId: fid(id, 'character-moment'), toFrameId: fid(id, 'revelation'), type: 'sequence', label: 'he turns the page' },
      { id: cid(id, 'revelation', 'player-response'), fromFrameId: fid(id, 'revelation'), toFrameId: fid(id, 'player-response'), type: 'sequence', label: 'the cellar waits' },
      { id: cid(id, 'player-response', 'the-shift'), fromFrameId: fid(id, 'player-response'), toFrameId: fid(id, 'the-shift'), type: 'consequence', label: 'the man is different' },
    ];

    return { id, title, description, templateId: 'cutscene_beat', frames, connections };
  },
};

// ─── Public API ──────────────────────────────────────────────────────────────

export const STORYBOARD_TEMPLATES: StoryboardTemplateDefinition[] = [
  QUEST_FLOW,
  QUEST_BRANCH,
  CUTSCENE_BEAT,
];

export function getStoryboardTemplate(
  templateId: StoryboardTemplateId
): StoryboardTemplateDefinition | undefined {
  return STORYBOARD_TEMPLATES.find(t => t.id === templateId);
}

export function createStoryboardFromTemplate(
  templateId: StoryboardTemplateId,
  input: CreateStoryboardInput
): Storyboard {
  const template = getStoryboardTemplate(templateId);
  if (!template) {
    throw new Error(`Unknown template id: "${templateId}"`);
  }
  return template.createStoryboard(input);
}
