// ─── rpg-storyboard-domain / templates.ts ────────────────────────────────────
//
// RPG storyboard template definitions. Three templates:
//   quest_flow     — 8-beat linear quest spine with choice + consequence
//   quest_branch   — 7-beat branching quest with three paths converging
//   cutscene_beat  — 5-beat authored dramatic moment with player response
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
// Complete spine for one playable quest sequence.
// Linear with a choice beat that produces divergent game-state outcomes.

const QUEST_FLOW: StoryboardTemplateDefinition = {
  id: 'quest_flow',
  name: 'Quest Flow',
  description: 'A complete quest spine from inciting hook to future thread. Eight beats: hook, scene, character contact, player choice, encounter, reveal, consequence, and a seeded future quest.',
  frameCount: 8,
  bestFor: 'Designing a single self-contained quest with clear narrative momentum and one major player-driven branch.',

  createStoryboard({ id, title, description }: CreateStoryboardInput): Storyboard {
    const frames: StoryboardFrame[] = [
      {
        id: fid(id, 'opening-hook'),
        type: 'hook',
        title: 'Opening Hook',
        summary: 'Something has changed, appeared, or gone wrong that demands immediate player attention. The quest starts in motion.',
        position: pos(0),
        size: size(),
        content: {
          designerNotes: 'Drop the player into the situation, not the setup. The hook should make clear that something is already happening. Use one concrete environmental detail that rewards observation and generates an immediate question the player wants answered.',
          playerVisibleText: 'Something is different. The world just shifted in a way that demands a response.',
          stakes: 'If the player ignores this, what game-state consequence triggers? Define the fallback path now.',
          entryConditions: ['quest_[id]_active = true'],
          stateChanges: ['Sets: opening_beat_complete = true'],
          requiredAssets: [
            'Environment: [quest opening location — fill in]',
            'Ambient audio: establishes the wrongness or change',
            'Hook object or event: the concrete thing that has changed',
          ],
          implementationChecklist: [
            'Define the one image or event that opens the quest — write it before building',
            'Specify what world-state has changed since the last quest or chapter',
            'Implement a character or environment reaction that fires if player acts within 30 seconds',
          ],
          testCriteria: [
            'Hook is visible and readable before any dialogue fires',
            'Player can reach the next beat from any approach to the hook area',
            'opening_beat_complete = true is set on first player interaction',
          ],
        },
        annotations: [
          { id: fid(id, 'ann-hook-1'), type: 'timing', text: 'Target 5–10 minutes of play time. Drive forward quickly.' },
          { id: fid(id, 'ann-hook-2'), type: 'designer_note', text: 'The hook should generate a question the player wants answered — that question is the quest engine.' },
        ],
      },
      {
        id: fid(id, 'establishing-scene'),
        type: 'scene',
        title: 'Establishing Scene',
        summary: 'The environment communicates the game-state before any character speaks. This beat teaches the player what kind of situation they are entering.',
        position: pos(1),
        size: size(),
        content: {
          designerNotes: 'Use environmental storytelling: three distinct readable details — one visual, one auditory or contextual, one that implies tension or recent change. Let the player explore before any character triggers dialogue.',
          playerVisibleText: 'The space, the atmosphere, the details of a world that has already been moving before you arrived.',
          stakes: 'What the player reads from the environment shapes their approach to every beat that follows.',
          entryConditions: ['opening_beat_complete = true'],
          stateChanges: ['Sets: scene_explored = true (on player interaction with environment)'],
          requiredAssets: [
            'Location: [scene environment — fill in]',
            'Three readable environmental details (visual / audio or contextual / tension-implying)',
            'One environmental clue that foreshadows the Reveal beat',
          ],
          possibleOutcomes: [
            'Player immediately investigates the most prominent detail',
            'Player explores and gathers multiple observations before acting',
            'Player identifies a character and speaks before exploring',
          ],
          implementationChecklist: [
            'Design three readable environmental details — decide which foreshadows the Reveal',
            'Ensure the player can reach the Character Contact beat from any exploration approach',
            'Verify the foreshadow clue is present and readable without a quest marker',
          ],
          testCriteria: [
            'Player can access the Character Contact beat from any exploration path',
            'Environmental foreshadow clue is present and readable without a quest marker pointing to it',
          ],
        },
        annotations: [
          { id: fid(id, 'ann-scene-1'), type: 'designer_note', text: 'Scenes are interactive, not cinematic. Give the player readable surface area before dialogue fires.' },
        ],
      },
      {
        id: fid(id, 'character-contact'),
        type: 'npc_beat',
        title: 'Character Contact',
        summary: 'A character who matters is encountered. They have something the player needs: information, access, a quest item, or a direction.',
        position: pos(2),
        size: size(),
        content: {
          designerNotes: 'This character should have a visible want and a hidden want. Their dialogue tree branches based on how the player approached the Establishing Scene — design the contact to reward environmental awareness. Trust state changes should be permanent within the beat.',
          playerVisibleText: 'Someone is here who has answers — or at least part of them.',
          stakes: 'Whether the player gains this character\'s cooperation determines what information they carry into the choice ahead.',
          entryConditions: ['scene_explored = true OR player_bypasses_scene = true'],
          stateChanges: [
            'Sets: contact_trust_state = [full | partial | none] (based on approach)',
            'Unlocks: key_choice_available = true (all trust states)',
          ],
          involvedCharacters: ['Primary Contact (fill in name)'],
          possibleOutcomes: [
            'Character fully trusts the player — shares all information',
            'Character gives partial information — withholds the most dangerous detail',
            'Character refuses — player reaches the Key Choice beat through another path',
          ],
          requiredAssets: [
            'NPC: [character name — fill in] with full dialogue tree (3 branches minimum)',
            'Contact scene environment or sub-location',
            'Trust state system: dialogue options gated by approach context',
          ],
          implementationChecklist: [
            'Write the character\'s visible want and their hidden want before scripting dialogue',
            'Implement three dialogue branches: aggressive (closes off), neutral (partial), empathetic (full)',
            'Define one piece of information they will not give under any circumstances',
          ],
          testCriteria: [
            'All trust-state branches eventually unlock key_choice_available = true',
            'Aggressive dialogue approach permanently reduces available information (cannot be un-done)',
            'Character dialogue branches are not immediately re-openable after selection',
          ],
        },
        annotations: [
          { id: fid(id, 'ann-npc-1'), type: 'player_visible', text: 'This character should feel like a person with their own agenda, not a quest dispenser.' },
          { id: fid(id, 'ann-npc-2'), type: 'author_only', text: 'The character\'s hidden want seeds a future quest complication — flag it.' },
        ],
      },
      {
        id: fid(id, 'key-choice'),
        type: 'choice',
        title: 'Key Choice',
        summary: 'The stakes are visible. The player must make a decision that changes how the rest of this quest plays out.',
        position: pos(3),
        size: size(),
        content: {
          designerNotes: 'The choice should have no clean answer. Each option should have a real cost and a real benefit. If the player can obviously select the best option, the choice is not designed hard enough. This choice sets the flag that determines the Encounter type.',
          playerVisibleText: 'The situation is clear. What does the player actually choose to do?',
          stakes: 'The choice made here determines which type of obstacle stands between the player and the truth.',
          entryConditions: ['key_choice_available = true'],
          stateChanges: [
            'Sets: player_choice = [path_a | path_b | unexpected]',
            'Unlocks: encounter beat corresponding to chosen path',
          ],
          possibleOutcomes: [
            'Player takes the direct path — faster, higher resource cost',
            'Player takes the cautious path — slower, more information gained',
            'Player attempts something outside the expected options — lateral path',
          ],
          requiredAssets: [
            'Choice trigger: diegetic interaction or UI element for the player decision',
            'Visual or audio distinction between the available options',
            'Environment that reflects the tension of the decision moment',
          ],
          implementationChecklist: [
            'Define what each choice costs the player in the short term',
            'Define the long-term faction or world-state consequence of each option',
            'Implement a fallback path for the unexpected option — players always find it',
          ],
          testCriteria: [
            'All choice paths lead to the obstacle beat',
            'player_choice flag is set before exit from this beat',
            'No option is labeled or visually framed as the "correct" choice',
          ],
        },
        annotations: [
          { id: fid(id, 'ann-choice-1'), type: 'branch_note', text: 'This choice feeds the Encounter beat. Different choices produce different encounter types.' },
          { id: fid(id, 'ann-choice-2'), type: 'danger', text: 'Do not telegraph the "correct" answer through NPC tone or UI framing.' },
        ],
      },
      {
        id: fid(id, 'the-obstacle'),
        type: 'encounter',
        title: 'The Obstacle',
        summary: 'A force, faction, or entity actively resists the player\'s progress. This may be combat, a social sequence, a puzzle, or a race against a timer.',
        position: pos(4),
        size: size(),
        content: {
          designerNotes: 'The encounter type should reflect the choice the player made. Design it to feel like a consequence of that decision — the player should be able to trace the connection. The objective is not to defeat the obstacle but to pass through it toward the truth.',
          playerVisibleText: 'Something stands between the player and what they need. It must be resolved.',
          stakes: 'The player emerges from this stronger, weaker, or changed. What they lose or win here carries into the Reveal.',
          entryConditions: ['player_choice is set'],
          stateChanges: [
            'Sets: obstacle_outcome = [clean | costly | bypass]',
            'Modifies: player resources or faction standing based on outcome',
          ],
          possibleOutcomes: [
            'Player overcomes the obstacle cleanly — no lasting cost',
            'Player overcomes the obstacle with cost — resource, reputation, or information gap',
            'Player bypasses the obstacle — faster but leaves something unresolved',
          ],
          requiredAssets: [
            'Encounter environment or combat space designed for the expected encounter type',
            'Opposition NPC(s) with appropriate rigs and behavior sets',
            'Objective system: the thing the player controls or reaches to complete the encounter',
          ],
          implementationChecklist: [
            'Match the encounter design to the player_choice value — verify all three variants',
            'Define the fail state: what happens if the player cannot overcome the obstacle',
            'Ensure the encounter teaches the player something useful for interpreting the Reveal',
          ],
          testCriteria: [
            'Encounter type matches player_choice value — test all three paths',
            'All three obstacle_outcome states are reachable through normal play',
            'Fail state has a defined consequence — not a dead end or infinite retry loop',
          ],
        },
        annotations: [
          { id: fid(id, 'ann-enc-1'), type: 'timing', text: 'Longest beat of the quest — design for 20–30 minutes of play time.' },
          { id: fid(id, 'ann-enc-2'), type: 'designer_note', text: 'The encounter should expose information the player will use to interpret the Reveal.' },
        ],
      },
      {
        id: fid(id, 'the-reveal'),
        type: 'reveal',
        title: 'The Reveal',
        summary: 'Information, consequence, or truth lands. Something the player didn\'t know — or thought they knew — changes meaning.',
        position: pos(5),
        size: size(),
        content: {
          designerNotes: 'The Reveal should recontextualize something the player encountered earlier. It works best when the player can look back and see the clue they missed. Deliver it in a moment of reduced tension after the encounter. It should make the Consequence feel earned.',
          playerVisibleText: 'What the player thought was true was incomplete. Here is what was missing.',
          stakes: 'The Reveal changes what the Consequence means. It should make the next decision harder, not easier.',
          entryConditions: ['obstacle_outcome is set'],
          stateChanges: [
            'Sets: truth_discovered = true',
            'Unlocks: consequence choice (both branches)',
          ],
          authorOnlyNotes: [
            'Fill in: what did the player not know until this moment?',
            'Fill in: what does this change about a character or faction already introduced?',
          ],
          possibleOutcomes: [
            'Player adjusts their objectives based on the new information',
            'Player feels deceived — design the reaction path',
            'Player already suspected this and is validated — path forward opens',
          ],
          requiredAssets: [
            'Reveal trigger: document, dialogue line, or environmental discovery',
            'Reveal stinger: audio or visual hold that emphasizes the landing',
            'Evidence prop: if player can challenge the reveal, evidence must be accessible',
          ],
          implementationChecklist: [
            'Write the reveal in one sentence before building: "[character/faction] was actually [truth]"',
            'Trace back the one environmental clue from the Establishing Scene that pointed here',
            'Decide what the player does NOT learn here — hold that for the next quest',
          ],
          testCriteria: [
            'Reveal only triggers after obstacle_outcome is set',
            'truth_discovered = true is set before consequence choice unlocks',
            'At least one prior clue from the establishing scene is recontextualized — verify legibility',
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
        title: 'The Consequence',
        summary: 'The game world responds to what the player has done. Something has permanently changed as a result of their choices in this quest.',
        position: pos(6),
        size: size(),
        content: {
          designerNotes: 'The Consequence should feel earned, not arbitrary. One faction, relationship, or world-state is now different because of the player. This beat makes the quest matter beyond its own completion — it ripples into the next quest or chapter.',
          playerVisibleText: 'What the player did here has changed something. The world is not the same as when they arrived.',
          stakes: 'Does this consequence help the player in future quests, hurt them, or create complications they can\'t yet predict?',
          entryConditions: ['truth_discovered = true', 'player_made_consequence_choice = true'],
          stateChanges: [
            'Sets: quest_outcome = [outcome_a | outcome_b]',
            'Updates: world_state flags for downstream quests',
            'Modifies: faction standings based on player choice',
          ],
          possibleOutcomes: [
            'Consequence is visible and immediate — player sees the result',
            'Consequence is delayed — surfaces in a future quest or chapter',
            'Consequence is ambiguous — player doesn\'t know yet if they made the right call',
          ],
          requiredAssets: [
            'World-state change visuals: map update, NPC reaction, or environmental shift',
            'Faction or relationship standing update system',
            'Consequence confirmation: dialogue, cutscene, or reactive world element',
          ],
          implementationChecklist: [
            'Set the world-state flag that downstream quests will check',
            'Identify one faction or character whose relationship has permanently changed',
            'Decide whether the player learns the full extent of the consequence now or later',
          ],
          testCriteria: [
            'World-state flags are set correctly based on player choice — test each path',
            'The change is detectable in the game world without a quest log entry',
            'quest_outcome is set before this beat clears',
          ],
        },
        annotations: [
          { id: fid(id, 'ann-cons-1'), type: 'danger', text: 'Do not clean up the consequence. Leave the complexity visible and readable in the world.' },
        ],
      },
      {
        id: fid(id, 'future-thread'),
        type: 'hook',
        title: 'Future Thread',
        summary: 'One thread remains open. A name, a faction, a question the player carries forward into the next quest.',
        position: pos(7),
        size: size(),
        content: {
          designerNotes: 'The future thread is not a cliffhanger — it is an unanswered question seeded into the world. It should appear naturally in the aftermath of the Consequence and feel like something the player noticed without being told to notice it.',
          playerVisibleText: 'Something hasn\'t resolved. There is more here.',
          stakes: 'This is the thread that pulls the next quest or chapter.',
          entryConditions: ['quest_outcome is set'],
          stateChanges: [
            'Sets: future_thread_active = true',
            'Activates: next quest entry condition flag',
          ],
          possibleOutcomes: [
            'Player actively pursues the thread — triggers next quest early',
            'Thread is filed and resurfaces at a designed moment later',
            'Player ignores it — it becomes a complication at the worst story moment',
          ],
          requiredAssets: [
            'Thread object or message: a discoverable world item — not a quest marker',
            'Delivery mechanism: natural placement that rewards observation',
          ],
          implementationChecklist: [
            'Write the thread as a single question before building: "Who was [name]?" or "Why did [faction] let them go?"',
            'Connect this flag to the entry condition of the next quest in the sequence',
            'Verify the thread is discoverable but not forced on the player',
          ],
          testCriteria: [
            'Thread only appears after quest_outcome is set',
            'Thread is discoverable without a quest marker pointing to it',
            'future_thread_active = true activates the next quest\'s entry condition',
          ],
        },
        annotations: [
          { id: fid(id, 'ann-fthread-1'), type: 'branch_note', text: 'Intentionally unresolved. Connects to the next quest in the sequence.' },
          { id: fid(id, 'ann-fthread-2'), type: 'timing', text: 'Deliver as an epilogue beat. End the quest on the question, not the answer.' },
        ],
      },
    ];

    const connections: StoryboardConnection[] = [
      { id: cid(id, 'opening-hook', 'establishing-scene'), fromFrameId: fid(id, 'opening-hook'), toFrameId: fid(id, 'establishing-scene'), type: 'sequence', label: 'investigate' },
      { id: cid(id, 'establishing-scene', 'character-contact'), fromFrameId: fid(id, 'establishing-scene'), toFrameId: fid(id, 'character-contact'), type: 'sequence', label: 'contact found' },
      { id: cid(id, 'character-contact', 'key-choice'), fromFrameId: fid(id, 'character-contact'), toFrameId: fid(id, 'key-choice'), type: 'sequence', label: 'decision point' },
      { id: cid(id, 'key-choice', 'the-obstacle'), fromFrameId: fid(id, 'key-choice'), toFrameId: fid(id, 'the-obstacle'), type: 'sequence', label: 'path forward' },
      { id: cid(id, 'the-obstacle', 'the-reveal'), fromFrameId: fid(id, 'the-obstacle'), toFrameId: fid(id, 'the-reveal'), type: 'sequence', label: 'truth exposed' },
      { id: cid(id, 'the-reveal', 'the-consequence'), fromFrameId: fid(id, 'the-reveal'), toFrameId: fid(id, 'the-consequence'), type: 'consequence', label: 'decision lands' },
      { id: cid(id, 'the-consequence', 'future-thread'), fromFrameId: fid(id, 'the-consequence'), toFrameId: fid(id, 'future-thread'), type: 'consequence', label: 'thread remains' },
    ];

    return { id, title, description, templateId: 'quest_flow', frames, connections };
  },
};

// ─── Template 2: Quest Branch ────────────────────────────────────────────────
// Branching player choice with three divergent paths and a convergence.

const QUEST_BRANCH: StoryboardTemplateDefinition = {
  id: 'quest_branch',
  name: 'Quest Branch',
  description: 'A branching player choice with three divergent paths converging at a shared consequence. Makes player agency and game-state logic visible on the board.',
  frameCount: 7,
  bestFor: 'Designing a decision with multiple valid outcomes — faction choices, moral dilemmas, or tactical divergence that converges before the next chapter.',

  createStoryboard({ id, title, description }: CreateStoryboardInput): Storyboard {
    const frames: StoryboardFrame[] = [
      {
        id: fid(id, 'inciting-situation'),
        type: 'hook',
        title: 'Inciting Situation',
        summary: 'The situation is presented. The player understands what is at stake, who wants what, and what the cost of inaction is.',
        position: pos(0),
        size: size(),
        content: {
          designerNotes: 'Present the situation without prescribing a solution. All three paths should feel genuinely available from the opening. Avoid signaling a "right" answer through NPC tone, UI emphasis, or environmental staging.',
          playerVisibleText: 'Here is what is happening. Here is who is affected. Here is what happens if nothing is done.',
          stakes: 'Inaction is a choice. Define what happens if the player does nothing.',
          entryConditions: ['quest_[id]_active = true'],
          stateChanges: ['Sets: inciting_situation_complete = true'],
          possibleOutcomes: [
            'Player identifies the three paths immediately',
            'Player asks clarifying questions — implement honest, complete answers',
            'Player attempts a fourth option — design a path for lateral thinking',
          ],
          requiredAssets: [
            'Environment: [situation location — fill in]',
            'One NPC or faction representative per path (3 total, surface on request)',
            'Problem statement: diegetic or quest-log display of what is at stake',
          ],
          implementationChecklist: [
            'State the problem in one sentence in the quest log or opening dialogue',
            'Ensure all three paths are accessible without prior quest knowledge or special stats',
            'Implement one NPC or representative per path who surfaces if the player asks',
          ],
          testCriteria: [
            'All three paths are accessible from this beat without prior knowledge',
            'Inaction consequence fires on a timer if player does nothing',
            'Problem is legible without a quest marker pointing to the solution',
          ],
        },
        annotations: [
          { id: fid(id, 'ann-inc-1'), type: 'designer_note', text: 'Present the situation as a problem, not a mission. The player should feel like they are making a real choice.' },
        ],
      },
      {
        id: fid(id, 'decision-point'),
        type: 'choice',
        title: 'Decision Point',
        summary: 'The player must choose between three real paths. Each path has a distinct cost, a distinct benefit, and a distinct challenge type.',
        position: pos(1),
        size: size(),
        content: {
          designerNotes: 'The decision point is the fulcrum of this quest. Once the player commits, the board branches. Give each path a one-sentence pitch. Each path should feel like a valid strategy — not an obvious trap and not an obvious winner.',
          playerVisibleText: 'Three ways forward. Each leads somewhere real.',
          stakes: 'The path chosen determines what kind of quest this becomes — action, negotiation, or discovery.',
          entryConditions: ['inciting_situation_complete = true'],
          stateChanges: [
            'Sets: chosen_path = [path_a | path_b | path_c]',
            'Locks: alternative path outcomes until Convergence',
          ],
          possibleOutcomes: [
            'Player chooses Path A: assertive, direct, higher resource cost',
            'Player chooses Path B: cautious, diplomatic, slower payoff',
            'Player chooses Path C: lateral, unexpected, least information',
          ],
          requiredAssets: [
            'Choice UI or diegetic trigger for three-way decision',
            'Visual or audio distinction between the three paths',
            'One NPC or faction representative per path (available for query before committing)',
          ],
          implementationChecklist: [
            'Verify each path can reach the Convergence Point from a different direction',
            'Define what happens if the player attempts to switch paths mid-sequence',
            'Implement the decision as a diegetic in-world choice, not a menu screen',
          ],
          testCriteria: [
            'chosen_path flag is set before any path beat fires',
            'All three path beats are only reachable via their corresponding chosen_path value',
            'No path description telegraphs which is the "correct" choice',
          ],
        },
        annotations: [
          { id: fid(id, 'ann-dp-1'), type: 'branch_note', text: 'This frame connects to three outgoing paths. The branch is the structural point of this template.' },
          { id: fid(id, 'ann-dp-2'), type: 'danger', text: 'No correct path. If one option is obviously superior, redesign the others.' },
        ],
      },
      {
        id: fid(id, 'path-a'),
        type: 'scene',
        title: 'Path A — The Direct Route',
        summary: 'The assertive, high-cost path. Faster resolution but requires the player to spend resources, take damage, or create faction enemies.',
        position: pos(2, 'top'),
        size: size(),
        content: {
          designerNotes: 'Path A should feel like the obvious choice but cost the most. The player who takes Path A arrives at the Convergence Point faster but with fewer resources and more opposition generated.',
          playerVisibleText: 'You go straight through. It\'s faster. It\'s harder.',
          stakes: 'The player moves quickly but burns resources or faction standing. The Convergence will reflect that cost.',
          entryConditions: ['chosen_path = path_a'],
          stateChanges: [
            'Modifies: player resources (cost — fill in specific resource)',
            'Sets: path_a_completed = true',
          ],
          possibleOutcomes: [
            'Player powers through and arrives at Convergence at full strength',
            'Player takes significant losses but arrives',
            'Player is blocked partway and must improvise a route to Convergence',
          ],
          requiredAssets: [
            'Path A environment: [fill in — direct route location]',
            'Path A unique obstacle or opposition NPC(s)',
            'Resource cost system visible to player (health, currency, faction standing)',
          ],
          implementationChecklist: [
            'Design the obstacle unique to Path A — it must be different from B and C',
            'Define the specific resource the player loses on this path',
            'Implement one faction that responds differently to the player for having taken Path A',
          ],
          testCriteria: [
            'Path A is only accessible when chosen_path = path_a',
            'path_a_completed = true is set before Convergence entry condition clears',
            'Resource cost is legible during and after the path',
          ],
        },
        annotations: [
          { id: fid(id, 'ann-a-1'), type: 'designer_note', text: 'Path A players arrive first but with least information.' },
        ],
      },
      {
        id: fid(id, 'path-b'),
        type: 'scene',
        title: 'Path B — The Cautious Route',
        summary: 'The diplomatic or investigative path. Slower, more information gathered, the player arrives with allies or leverage.',
        position: pos(2, 'mid'),
        size: size(),
        content: {
          designerNotes: 'Path B players arrive at Convergence with more information than Path A but possibly less time. They have negotiated or investigated, and may have pulled a character into their camp.',
          playerVisibleText: 'You take your time. You talk to people. You learn things the others don\'t.',
          stakes: 'The player arrives with knowledge and possibly allies — but the situation may have shifted while they were being careful.',
          entryConditions: ['chosen_path = path_b'],
          stateChanges: [
            'Sets: path_b_info_gained = true',
            'Sets: path_b_completed = true',
          ],
          possibleOutcomes: [
            'Player arrives with a piece of information that changes the Convergence scene',
            'Player arrives with an NPC ally who has conditions attached',
            'Player arrives late — something has changed at Convergence while they took extra time',
          ],
          requiredAssets: [
            'Path B environment: [fill in — cautious route location]',
            'Path B unique NPC ally or information source (not reachable by A or C)',
            'Information log or codex entry for the path B discovery',
          ],
          implementationChecklist: [
            'Define the piece of information only Path B players discover',
            'Implement the NPC ally with conditions that the player must agree to',
            'Design what changes at Convergence while Path B takes extra time',
          ],
          testCriteria: [
            'Path B is only accessible when chosen_path = path_b',
            'path_b_info_gained = true changes the Convergence scene variant',
            'NPC ally conditions are communicated clearly before the player commits',
          ],
        },
        annotations: [
          { id: fid(id, 'ann-b-1'), type: 'designer_note', text: 'Path B players arrive last but know the most.' },
        ],
      },
      {
        id: fid(id, 'path-c'),
        type: 'encounter',
        title: 'Path C — The Unexpected Route',
        summary: 'The lateral path — not the obvious move. Highest uncertainty, but possible access to something neither Path A nor B would find.',
        position: pos(2, 'bot'),
        size: size(),
        content: {
          designerNotes: 'Path C is for the player who refuses the framing of the other two options. It must feel genuine — a real path with real consequences. Path C players may find something the designer planned to surface in a later quest. Honor lateral thinking.',
          playerVisibleText: 'You don\'t go the way anyone expected. You might find something no one else is looking for.',
          stakes: 'Highest uncertainty, highest potential reward — but also the highest chance of encountering something the player isn\'t prepared for.',
          entryConditions: ['chosen_path = path_c'],
          stateChanges: [
            'Sets: path_c_discovery = [found | missed] (based on player behavior)',
            'Sets: path_c_completed = true',
          ],
          possibleOutcomes: [
            'Player discovers a third faction or piece of information that reframes the quest',
            'Player finds Convergence from an unexpected direction with unique leverage',
            'Player gets in over their head and must improvise a route to Convergence',
          ],
          requiredAssets: [
            'Path C environment: [fill in — unexpected route, not A or B]',
            'Path C unique discovery: [fill in — not reachable by A or B]',
            'Retreat mechanism: path to Convergence if player is blocked on Path C',
          ],
          implementationChecklist: [
            'Design something genuinely valuable at the end of Path C that A and B cannot reach',
            'Define what makes Path C dangerous in a way that is different from harder combat',
            'Decide whether Path C discovery connects to the Fallout Thread or main Consequence',
          ],
          testCriteria: [
            'Path C is only accessible when chosen_path = path_c',
            'path_c_discovery is set based on player behavior, not automatically',
            'Path C discovery is meaningfully different from A and B rewards — test explicitly',
          ],
        },
        annotations: [
          { id: fid(id, 'ann-c-1'), type: 'branch_note', text: 'Honor lateral thinking. This path should feel rewarding, not like a design trap.' },
          { id: fid(id, 'ann-c-2'), type: 'author_only', text: 'Path C may expose something the next quest needs. Flag it for the quest designer.' },
        ],
      },
      {
        id: fid(id, 'convergence'),
        type: 'consequence',
        title: 'Convergence Point',
        summary: 'All paths arrive here — but not with the same information, resources, or allies. What the player brings depends entirely on which path they took.',
        position: pos(3),
        size: size(),
        content: {
          designerNotes: 'The Convergence Point is not a reset. Design three variants of the same scene — one per path. Path A players arrive depleted. Path B players arrive informed but possibly late. Path C players arrive with something unusual. All three variants must reach the same endpoint.',
          playerVisibleText: 'This is where it comes to a head. What the player knows and who they brought with them matters now.',
          stakes: 'The outcome here is shaped by every choice that came before it.',
          entryConditions: [
            'path_a_completed = true OR path_b_completed = true OR path_c_completed = true',
          ],
          stateChanges: [
            'Sets: convergence_outcome = [clean | costly | unexpected] (based on path taken)',
            'Updates: faction standings based on path and Convergence resolution',
            'Sets: quest_outcome = [resolved — fill in specific flag]',
          ],
          possibleOutcomes: [
            'Player with most information achieves the cleanest resolution',
            'Player with most resources survives the hardest version of the conflict',
            'Player with the unexpected Path C advantage opens a door others cannot',
          ],
          requiredAssets: [
            'Convergence environment: same location with three variant scene states',
            'State-reactive NPC dialogue: three versions based on path_x_completed flag',
            'Shared resolution system: the one thing all paths want that they cannot all have',
          ],
          implementationChecklist: [
            'Implement three scene variants — one per path — that merge to the same endpoint',
            'Identify the one thing all paths want that they cannot all have',
            'Define what is permanently decided here regardless of which path was taken',
          ],
          testCriteria: [
            'Convergence scene variant matches path_x_completed flag — test all three',
            'path_c_discovery value changes Convergence outcome when path_c_completed = true',
            'quest_outcome flag is set before this beat clears',
          ],
        },
        annotations: [
          { id: fid(id, 'ann-conv-1'), type: 'designer_note', text: 'This is the payoff for giving the player real choice. Make the consequences of each path legible here.' },
        ],
      },
      {
        id: fid(id, 'fallout-hook'),
        type: 'hook',
        title: 'Fallout Thread',
        summary: 'Whatever was decided here echoes forward. One open thread survives the quest regardless of which path the player took.',
        position: pos(4),
        size: size(),
        content: {
          designerNotes: 'The Fallout Thread is the proof that the player\'s choice mattered beyond quest completion. It should be path-agnostic — it happens because of the Convergence outcome, not because of which path was chosen.',
          playerVisibleText: 'Something remains unresolved. The player knows it. The world knows it.',
          stakes: 'This thread connects to the next quest arc or chapter.',
          entryConditions: ['quest_outcome is set'],
          stateChanges: [
            'Sets: fallout_thread_active = true',
            'Activates: next quest entry condition flag',
          ],
          possibleOutcomes: [
            'The thread is a character who escaped or survived',
            'The thread is information that couldn\'t be acted on in time',
            'The thread is a faction that now knows who the player is',
          ],
          requiredAssets: [
            'Fallout thread object or world signal: discoverable, path-agnostic',
            'World change visual: something the player can see regardless of which path was taken',
          ],
          implementationChecklist: [
            'Identify the one consequence that spans all three paths',
            'Write the thread as a quest log question: "What happened to [name/place/object]?"',
            'Connect the fallout_thread_active flag to the next quest\'s entry condition',
          ],
          testCriteria: [
            'fallout_thread_active fires regardless of which path was completed',
            'Thread is legible without a quest log entry pointing to it',
            'Next quest entry condition flag is set',
          ],
        },
        annotations: [
          { id: fid(id, 'ann-fh-1'), type: 'branch_note', text: 'Fires regardless of which path was taken. This is the convergence thread for the next arc.' },
        ],
      },
    ];

    const connections: StoryboardConnection[] = [
      { id: cid(id, 'inciting-situation', 'decision-point'), fromFrameId: fid(id, 'inciting-situation'), toFrameId: fid(id, 'decision-point'), type: 'sequence', label: 'situation develops' },
      { id: cid(id, 'decision-point', 'path-a'), fromFrameId: fid(id, 'decision-point'), toFrameId: fid(id, 'path-a'), type: 'choice', label: 'path A' },
      { id: cid(id, 'decision-point', 'path-b'), fromFrameId: fid(id, 'decision-point'), toFrameId: fid(id, 'path-b'), type: 'choice', label: 'path B' },
      { id: cid(id, 'decision-point', 'path-c'), fromFrameId: fid(id, 'decision-point'), toFrameId: fid(id, 'path-c'), type: 'choice', label: 'path C' },
      { id: cid(id, 'path-a', 'convergence'), fromFrameId: fid(id, 'path-a'), toFrameId: fid(id, 'convergence'), type: 'consequence', label: 'path A outcome' },
      { id: cid(id, 'path-b', 'convergence'), fromFrameId: fid(id, 'path-b'), toFrameId: fid(id, 'convergence'), type: 'consequence', label: 'path B outcome' },
      { id: cid(id, 'path-c', 'convergence'), fromFrameId: fid(id, 'path-c'), toFrameId: fid(id, 'convergence'), type: 'consequence', label: 'path C outcome' },
      { id: cid(id, 'convergence', 'fallout-hook'), fromFrameId: fid(id, 'convergence'), toFrameId: fid(id, 'fallout-hook'), type: 'consequence', label: 'thread survives' },
    ];

    return { id, title, description, templateId: 'quest_branch', frames, connections };
  },
};

// ─── Template 3: Cutscene Beat ────────────────────────────────────────────────
// Authored dramatic moment that always leaves room for player response.

const CUTSCENE_BEAT: StoryboardTemplateDefinition = {
  id: 'cutscene_beat',
  name: 'Cutscene Beat',
  description: 'A dramatic authored moment — reveal, confrontation, or character beat — that always preserves room for player response.',
  frameCount: 5,
  bestFor: 'Major reveals, character confrontations, villain monologues, lore drops, and pivotal relationship moments — without removing player agency.',

  createStoryboard({ id, title, description }: CreateStoryboardInput): Storyboard {
    const frames: StoryboardFrame[] = [
      {
        id: fid(id, 'establishing-frame'),
        type: 'scene',
        title: 'Establishing Frame',
        summary: 'Set the scene with precision. This moment has weight. The player should feel it before anyone speaks or acts.',
        position: pos(0),
        size: size(),
        content: {
          designerNotes: 'The Establishing Frame is about atmosphere, not plot delivery. Use environmental storytelling to signal significance — light, sound, character positioning. Design it so the player slows down before dialogue fires.',
          playerVisibleText: 'The scene shifts. Something feels different. Attention is required.',
          stakes: 'This frame sets the emotional register for everything that follows. If it feels cheap, the Revelation will land flat.',
          entryConditions: ['cutscene_[id]_triggered = true'],
          stateChanges: ['Sets: establishing_frame_complete = true'],
          requiredAssets: [
            'Scene environment with deliberate atmosphere design',
            'Ambient audio layer: establishes emotional register before dialogue',
            'One strong environmental detail: light, object, or character positioning',
          ],
          implementationChecklist: [
            'Choose one environmental detail — sound, light, positioning — that makes the scene feel significant',
            'Decide whether any characters are already present or arrive as the player enters',
            'Script the final line or image of this frame before triggering the Character Beat',
          ],
          testCriteria: [
            'Establishing frame plays before any character dialogue fires',
            'Player can observe the environment — frame is not instant-skip',
            'The emotional register shift is legible without explanation',
          ],
        },
        annotations: [
          { id: fid(id, 'ann-ef-1'), type: 'timing', text: 'Short. 2–3 minutes. Do not let the atmosphere collapse before the Character Beat fires.' },
          { id: fid(id, 'ann-ef-2'), type: 'designer_note', text: 'The Establishing Frame earns the Revelation. Do not cut it for pacing.' },
        ],
      },
      {
        id: fid(id, 'character-moment'),
        type: 'npc_beat',
        title: 'Character Beat',
        summary: 'A character acts, speaks, or reveals something that changes the emotional register of the scene. This is the engine of the cutscene.',
        position: pos(1),
        size: size(),
        content: {
          designerNotes: 'The character carries the scene. They may confess, confront, threaten, grieve, or reveal. Their action should feel personal, not expository. Avoid having them explain the plot — have them do or say something that reveals who they are.',
          playerVisibleText: 'The character does something that changes how the player sees them.',
          stakes: 'What the character does here shapes whether the Revelation lands as tragedy, threat, or truth.',
          entryConditions: ['establishing_frame_complete = true'],
          stateChanges: ['Sets: character_moment_complete = true'],
          involvedCharacters: ['Primary Character (fill in name)'],
          possibleOutcomes: [
            'Character reveals something they were concealing — changes player trust',
            'Character confronts the player with something they did or know',
            'Character shows vulnerability the player did not expect',
          ],
          requiredAssets: [
            'Character NPC: [fill in name] with cutscene-specific animation set',
            'Defining dialogue line: write this before building the scene',
            'Character reveal prop or visual (if the beat involves a physical reveal)',
          ],
          implementationChecklist: [
            'Write one line of dialogue that will define this character for the rest of the game — write it first',
            'Define what the character wants from this moment — not what they say they want',
            'Decide whether they exit after the Revelation or remain for the Player Response',
          ],
          testCriteria: [
            'Character action or dialogue fires before Revelation triggers',
            'Character\'s hidden motivation is planted as at least one readable cue',
            'Scene does not skip past this beat to the Revelation on first playthrough',
          ],
        },
        annotations: [
          { id: fid(id, 'ann-nm-1'), type: 'player_visible', text: 'The Character Beat should feel like the player exists in the scene, not just observes it.' },
          { id: fid(id, 'ann-nm-2'), type: 'author_only', text: 'The character\'s hidden motivation is the real story. Plant one clue to it here.' },
        ],
      },
      {
        id: fid(id, 'revelation'),
        type: 'reveal',
        title: 'The Revelation',
        summary: 'Something is exposed. A secret, a truth, a consequence the player did not expect. This is the emotional peak of the cutscene.',
        position: pos(2),
        size: size(),
        content: {
          designerNotes: 'Deliver the Revelation and stop all other audio and dialogue. Do not immediately follow it with an explanation. Do not fire another character\'s reaction immediately. The Revelation should make one prior event mean something completely different.',
          playerVisibleText: 'Something previously unknown is now visible. It changes what came before.',
          stakes: 'The Revelation is the pivot point. Everything that follows is the player\'s response to it.',
          entryConditions: ['character_moment_complete = true'],
          stateChanges: [
            'Sets: revelation_known = true',
            'Unlocks: player_response beat',
          ],
          authorOnlyNotes: [
            'Fill in: what truth is exposed in this moment?',
            'Fill in: what earlier event or character does this recontextualize?',
          ],
          possibleOutcomes: [
            'Player accepts the truth and adjusts their objectives accordingly',
            'Player rejects or disbelieves the truth — implement an evidence path',
            'Player already suspected this and is validated — now they can act',
          ],
          requiredAssets: [
            'Revelation delivery: dialogue line or environmental observation — write it before building',
            'Hold mechanism: 2–3 second silence or audio pause after delivery',
            'Evidence prop: if player can challenge the revelation, evidence must be accessible',
          ],
          implementationChecklist: [
            'Write the Revelation as one sentence of dialogue or environmental observation before building',
            'Implement the evidence path if the player can challenge the Revelation',
            'Define what the Revelation does NOT explain — hold that for the next quest',
          ],
          testCriteria: [
            'Revelation fires only after character_moment_complete = true',
            'revelation_known = true is set before player_response beat unlocks',
            'At least one prior event or character is recontextualized — verify legibility with a fresh player test',
          ],
        },
        annotations: [
          { id: fid(id, 'ann-rev-1'), type: 'timing', text: 'Hold on the Revelation for 2–3 seconds of silence before any character or UI responds.' },
          { id: fid(id, 'ann-rev-2'), type: 'author_only', text: 'The Revelation should make one earlier character or event mean something completely different.' },
        ],
      },
      {
        id: fid(id, 'player-response'),
        type: 'choice',
        title: 'Player Response',
        summary: 'The player must respond. Even the most authored moments leave room for player agency. This is where the scene becomes interactive.',
        position: pos(3),
        size: size(),
        content: {
          designerNotes: 'This is the most important frame in the Cutscene Beat. Without it, the sequence is a cinematic in the worst sense. Design the Player Response to allow the full range of emotional reactions: acceptance, anger, grief, skepticism, immediate action.',
          playerVisibleText: 'The player can speak, act, or remain silent. Their response matters. The scene is waiting.',
          stakes: 'How the player responds here changes the shape of The Shift that follows.',
          entryConditions: ['revelation_known = true'],
          stateChanges: [
            'Sets: player_response = [accept | reject | act | silent]',
            'Triggers: scene variant corresponding to response type',
          ],
          possibleOutcomes: [
            'Player confronts the character — triggers a dialogue branch',
            'Player accepts the revelation and makes an immediate decision',
            'Player acts before the scene resolves — changes the terrain',
            'Player says nothing — implement a silence-handling response from character or environment',
          ],
          requiredAssets: [
            'Response UI or diegetic interaction point',
            'Character reaction dialogue for each response type (accept / reject / act / silent)',
            'Silence-handling system: defined behavior when player does nothing',
          ],
          implementationChecklist: [
            'Implement a response for each emotional register: acceptance, rejection, anger, grief, action',
            'Design the character\'s reaction for the unexpected player choice',
            'Define and implement silence handling — it must produce a scene reaction',
          ],
          testCriteria: [
            'All four response types are handled — test each individually',
            'player_response flag is set before The Shift triggers',
            'Silence response produces a scene reaction — verify it is not treated as a bug',
          ],
        },
        annotations: [
          { id: fid(id, 'ann-pr-1'), type: 'danger', text: 'Do not rush past this frame. The player response is the reason the cutscene exists.' },
          { id: fid(id, 'ann-pr-2'), type: 'player_visible', text: 'The player\'s response here is what they will remember. The Revelation is what they will talk about.' },
        ],
      },
      {
        id: fid(id, 'the-shift'),
        type: 'consequence',
        title: 'The Shift',
        summary: 'The scene closes differently than it opened. Something has changed — between characters, in the world, or in the game-state — as a direct result of this beat.',
        position: pos(4),
        size: size(),
        content: {
          designerNotes: 'The Shift is the emotional landing. It should be quieter than the Revelation. One relationship has changed. One truth is now shared. One door is open that was not before. Do not recap what just happened — show what is different now.',
          playerVisibleText: 'Something has changed. The player feels it. The other characters feel it. The world has moved.',
          stakes: 'The Shift is the lasting consequence of this beat. It should persist and be detectable in future quests.',
          entryConditions: ['player_response is set'],
          stateChanges: [
            'Updates: relationship_[character] flag based on player_response',
            'Sets: cutscene_[id]_complete = true',
            'Unlocks: downstream quests or dialogue options that require this beat',
          ],
          possibleOutcomes: [
            'A relationship between player and character is permanently altered',
            'Information now shared changes what actions are available in future quests',
            'A path — literal or systemic — has opened that was not available before',
          ],
          requiredAssets: [
            'Shift expression: environmental change, animation, or dialogue that shows what changed',
            'World-state flag setter: relationship or knowledge flag update system',
            'Exit mechanism: how the player leaves the cutscene space',
          ],
          implementationChecklist: [
            'Write one sentence describing what is different now that was not before this beat',
            'Set the world-state flags that downstream quests will check',
            'Verify the Shift is legible in the game world — player should be able to see it changed',
          ],
          testCriteria: [
            'Relationship flag is set correctly based on player_response value — test each response type',
            'The change is legible in the game world — downstream quests can detect it',
            'cutscene_[id]_complete flag is set — verify it unlocks any downstream content',
          ],
        },
        annotations: [
          { id: fid(id, 'ann-shift-1'), type: 'designer_note', text: 'Close the scene quietly. The weight of the Revelation should still be in the room.' },
          { id: fid(id, 'ann-shift-2'), type: 'branch_note', text: 'The Shift often seeds a future quest thread. Flag anything that should be revisited.' },
        ],
      },
    ];

    const connections: StoryboardConnection[] = [
      { id: cid(id, 'establishing-frame', 'character-moment'), fromFrameId: fid(id, 'establishing-frame'), toFrameId: fid(id, 'character-moment'), type: 'sequence', label: 'character arrives' },
      { id: cid(id, 'character-moment', 'revelation'), fromFrameId: fid(id, 'character-moment'), toFrameId: fid(id, 'revelation'), type: 'sequence', label: 'truth exposed' },
      { id: cid(id, 'revelation', 'player-response'), fromFrameId: fid(id, 'revelation'), toFrameId: fid(id, 'player-response'), type: 'sequence', label: 'player responds' },
      { id: cid(id, 'player-response', 'the-shift'), fromFrameId: fid(id, 'player-response'), toFrameId: fid(id, 'the-shift'), type: 'consequence', label: 'scene changes' },
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
