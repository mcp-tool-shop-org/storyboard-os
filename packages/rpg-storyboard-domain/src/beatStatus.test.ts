// ─── beatStatus.test.ts ───────────────────────────────────────────────────────
//
// Tests for the RPG domain readiness model.
// getBeatStatus() is the authoritative function for deciding what "ready" means
// for an RPG beat. getStoryboardReadiness() aggregates across a storyboard.
//
// ─────────────────────────────────────────────────────────────────────────────

import { describe, it, expect } from 'vitest';
import { getBeatStatus, getStoryboardReadiness, BLOCKING_REASONS } from './beatStatus';
import type { StoryboardFrame, Storyboard } from './schema';

// ─── Fixtures ─────────────────────────────────────────────────────────────────

function makeFrame(
  type: StoryboardFrame['type'],
  content: StoryboardFrame['content'] = {},
  id = 'frame-1',
): StoryboardFrame {
  return {
    id,
    type,
    title: `Test ${type} frame`,
    summary: 'A test beat.',
    position: { x: 0, y: 0 },
    size: { width: 180, height: 140 },
    content,
    annotations: [],
  };
}

function makeStoryboard(frames: StoryboardFrame[]): Storyboard {
  return {
    id: 'test-board',
    title: 'Test Board',
    frames,
    connections: [],
  };
}

// ─── BLOCKING_REASONS ─────────────────────────────────────────────────────────

describe('BLOCKING_REASONS', () => {
  it('includes no_state_changes', () => {
    expect(BLOCKING_REASONS.has('no_state_changes')).toBe(true);
  });

  it('includes no_entry_or_state_change', () => {
    expect(BLOCKING_REASONS.has('no_entry_or_state_change')).toBe(true);
  });

  it('does not include spec gap reasons', () => {
    expect(BLOCKING_REASONS.has('no_designer_notes')).toBe(false);
    expect(BLOCKING_REASONS.has('no_required_assets')).toBe(false);
    expect(BLOCKING_REASONS.has('no_test_criteria')).toBe(false);
    expect(BLOCKING_REASONS.has('no_implementation_checklist')).toBe(false);
  });
});

// ─── getBeatStatus — level ────────────────────────────────────────────────────

describe('getBeatStatus — level', () => {
  describe('draft', () => {
    it('is draft when scene frame has empty content', () => {
      const frame = makeFrame('scene', {});
      expect(getBeatStatus(frame).level).toBe('draft');
    });

    it('is draft when hook frame has empty content', () => {
      const frame = makeFrame('hook', {});
      expect(getBeatStatus(frame).level).toBe('draft');
    });

    it('is draft when encounter frame has empty content', () => {
      const frame = makeFrame('encounter', {});
      expect(getBeatStatus(frame).level).toBe('draft');
    });

    it('is draft when npc_beat frame has empty content', () => {
      const frame = makeFrame('npc_beat', {});
      expect(getBeatStatus(frame).level).toBe('draft');
    });

    // F-VR-206 parity: an empty domain-required frame (choice/consequence/reveal)
    // is now 'blocked', not 'draft'. The old "empty shell" carve-out was a
    // divergence from marketing and cinematic and is removed in Wave 6.
    it('is blocked (NOT draft) when choice frame has empty content — F-VR-206 parity', () => {
      const frame = makeFrame('choice', {});
      expect(getBeatStatus(frame).level).toBe('blocked');
    });

    it('is blocked (NOT draft) when consequence frame has empty content — F-VR-206 parity', () => {
      const frame = makeFrame('consequence', {});
      expect(getBeatStatus(frame).level).toBe('blocked');
    });

    it('is blocked (NOT draft) when reveal frame has empty content — F-VR-206 parity', () => {
      const frame = makeFrame('reveal', {});
      expect(getBeatStatus(frame).level).toBe('blocked');
    });
  });

  describe('blocked', () => {
    it('is blocked when choice frame has content but no stateChanges', () => {
      const frame = makeFrame('choice', {
        designerNotes: 'The player must choose a faction.',
      });
      expect(getBeatStatus(frame).level).toBe('blocked');
    });

    it('is blocked when consequence frame has content but no stateChanges', () => {
      const frame = makeFrame('consequence', {
        designerNotes: 'The outcome of the ambush.',
        requiredAssets: ['cutscene_aftermath.mp4'],
      });
      expect(getBeatStatus(frame).level).toBe('blocked');
    });

    it('is blocked when reveal frame has content but neither entryConditions nor stateChanges', () => {
      const frame = makeFrame('reveal', {
        designerNotes: 'What the ledger says.',
        requiredAssets: ['ledger_document.png'],
      });
      expect(getBeatStatus(frame).level).toBe('blocked');
    });

    it('is NOT blocked when choice frame has stateChanges', () => {
      const frame = makeFrame('choice', {
        designerNotes: 'Choose a faction.',
        stateChanges: ['faction_choice = velthari'],
      });
      expect(getBeatStatus(frame).level).not.toBe('blocked');
    });

    it('is NOT blocked when consequence frame has stateChanges', () => {
      const frame = makeFrame('consequence', {
        designerNotes: 'Ledger goes public.',
        stateChanges: ['ledger_public = true'],
      });
      expect(getBeatStatus(frame).level).not.toBe('blocked');
    });

    it('is NOT blocked when reveal frame has entryConditions only', () => {
      const frame = makeFrame('reveal', {
        designerNotes: 'Information unlock.',
        entryConditions: ['ledger_found = true'],
      });
      expect(getBeatStatus(frame).level).not.toBe('blocked');
    });

    it('is NOT blocked when reveal frame has stateChanges only', () => {
      const frame = makeFrame('reveal', {
        designerNotes: 'Information changes state.',
        stateChanges: ['player_knows_orvyn = true'],
      });
      expect(getBeatStatus(frame).level).not.toBe('blocked');
    });

    it('is NOT blocked for non-domain-requirement frame types (hook, scene, encounter, npc_beat)', () => {
      for (const type of ['hook', 'scene', 'encounter', 'npc_beat'] as const) {
        const frame = makeFrame(type, { designerNotes: 'Some notes.' });
        expect(getBeatStatus(frame).level).not.toBe('blocked');
      }
    });
  });

  describe('partial', () => {
    it('is partial when scene has only designerNotes', () => {
      const frame = makeFrame('scene', { designerNotes: 'Opening scene.' });
      expect(getBeatStatus(frame).level).toBe('partial');
    });

    it('is partial when frame has 2 of 4 spec fields', () => {
      const frame = makeFrame('scene', {
        designerNotes: 'Some design notes.',
        requiredAssets: ['bg_road.png'],
      });
      expect(getBeatStatus(frame).level).toBe('partial');
    });

    it('is partial when choice frame has stateChanges + 2 spec fields', () => {
      const frame = makeFrame('choice', {
        stateChanges: ['faction_choice = guild'],
        designerNotes: 'Choose who to trust.',
        requiredAssets: ['faction_portraits.png'],
      });
      expect(getBeatStatus(frame).level).toBe('partial');
    });
  });

  describe('ready', () => {
    it('is ready when scene frame has 3 or more spec fields', () => {
      const frame = makeFrame('scene', {
        designerNotes: 'Environmental storytelling.',
        requiredAssets: ['bg_road.png', 'sfx_wind.ogg'],
        testCriteria: ['Scene triggers on approach', 'Music fades on exit'],
        implementationChecklist: ['Place trigger volume', 'Wire ambience'],
      });
      expect(getBeatStatus(frame).level).toBe('ready');
    });

    it('is ready when choice frame has stateChanges + 3 spec fields', () => {
      const frame = makeFrame('choice', {
        stateChanges: ['faction_trust = guild'],
        designerNotes: 'Player picks a faction.',
        requiredAssets: ['portrait_guild.png'],
        testCriteria: ['Flag set on confirm'],
        implementationChecklist: ['Wire choice UI'],
      });
      expect(getBeatStatus(frame).level).toBe('ready');
    });

    it('is ready when consequence frame has stateChanges + full spec', () => {
      const frame = makeFrame('consequence', {
        stateChanges: ['ledger_public = true', 'orvyn_arrested = true'],
        designerNotes: 'The ledger destabilizes the region.',
        requiredAssets: ['cutscene_arrest.mp4'],
        testCriteria: ['Flags set after branch taken'],
        implementationChecklist: ['Play cutscene', 'Set flags', 'Update world state'],
      });
      expect(getBeatStatus(frame).level).toBe('ready');
    });
  });
});

// ─── getBeatStatus — missing reasons ─────────────────────────────────────────

describe('getBeatStatus — missing reasons', () => {
  it('includes no_state_changes for choice frame without stateChanges', () => {
    const frame = makeFrame('choice', { designerNotes: 'Notes.' });
    expect(getBeatStatus(frame).missing).toContain('no_state_changes');
  });

  it('includes no_state_changes for consequence frame without stateChanges', () => {
    const frame = makeFrame('consequence', { designerNotes: 'Notes.' });
    expect(getBeatStatus(frame).missing).toContain('no_state_changes');
  });

  it('does not include no_state_changes when stateChanges is present', () => {
    const frame = makeFrame('choice', { stateChanges: ['flag = true'] });
    expect(getBeatStatus(frame).missing).not.toContain('no_state_changes');
  });

  it('does not include no_state_changes for non-state-required types', () => {
    for (const type of ['hook', 'scene', 'encounter', 'npc_beat', 'reveal'] as const) {
      const frame = makeFrame(type, {});
      expect(getBeatStatus(frame).missing).not.toContain('no_state_changes');
    }
  });

  it('includes no_entry_or_state_change for reveal frame with neither', () => {
    const frame = makeFrame('reveal', { designerNotes: 'Info drop.' });
    expect(getBeatStatus(frame).missing).toContain('no_entry_or_state_change');
  });

  it('does not include no_entry_or_state_change when reveal has entryConditions', () => {
    const frame = makeFrame('reveal', {
      designerNotes: 'Info drop.',
      entryConditions: ['ledger_found = true'],
    });
    expect(getBeatStatus(frame).missing).not.toContain('no_entry_or_state_change');
  });

  it('does not include no_entry_or_state_change when reveal has stateChanges', () => {
    const frame = makeFrame('reveal', {
      designerNotes: 'Info drop.',
      stateChanges: ['player_knows_truth = true'],
    });
    expect(getBeatStatus(frame).missing).not.toContain('no_entry_or_state_change');
  });

  it('includes spec gap reasons when fields are absent', () => {
    const frame = makeFrame('scene', {});
    const missing = getBeatStatus(frame).missing;
    expect(missing).toContain('no_designer_notes');
    expect(missing).toContain('no_required_assets');
    expect(missing).toContain('no_test_criteria');
    expect(missing).toContain('no_implementation_checklist');
  });

  it('does not include spec gap reasons when fields are present', () => {
    const frame = makeFrame('scene', {
      designerNotes: 'Notes',
      requiredAssets: ['asset.png'],
      testCriteria: ['Test passes'],
      implementationChecklist: ['Task 1'],
    });
    const missing = getBeatStatus(frame).missing;
    expect(missing).not.toContain('no_designer_notes');
    expect(missing).not.toContain('no_required_assets');
    expect(missing).not.toContain('no_test_criteria');
    expect(missing).not.toContain('no_implementation_checklist');
  });

  it('includes advisory reasons when optional fields are absent', () => {
    const frame = makeFrame('scene', {});
    const missing = getBeatStatus(frame).missing;
    expect(missing).toContain('no_stakes');
    expect(missing).toContain('no_possible_outcomes');
  });

  it('does not include advisory reasons when optional fields are present', () => {
    const frame = makeFrame('scene', {
      stakes: 'The road goes dark.',
      possibleOutcomes: ['Player finds clue', 'Player passes through'],
    });
    const missing = getBeatStatus(frame).missing;
    expect(missing).not.toContain('no_stakes');
    expect(missing).not.toContain('no_possible_outcomes');
  });

  it('missing array is empty for a fully-specced non-domain-type frame', () => {
    const frame = makeFrame('scene', {
      designerNotes: 'Full notes.',
      requiredAssets: ['bg.png'],
      testCriteria: ['Triggers on entry'],
      implementationChecklist: ['Place trigger'],
      stakes: 'Something at risk.',
      possibleOutcomes: ['Path A', 'Path B'],
    });
    expect(getBeatStatus(frame).missing).toHaveLength(0);
  });
});

// ─── getBeatStatus — coverage counts ─────────────────────────────────────────

describe('getBeatStatus — coverage counts', () => {
  it('assetCount is 0 when no requiredAssets', () => {
    const frame = makeFrame('scene', {});
    expect(getBeatStatus(frame).assetCount).toBe(0);
  });

  it('assetCount reflects actual count', () => {
    const frame = makeFrame('scene', {
      requiredAssets: ['bg_road.png', 'sfx_wind.ogg', 'npc_keeper.mesh'],
    });
    expect(getBeatStatus(frame).assetCount).toBe(3);
  });

  it('testCriteriaCount is 0 when no testCriteria', () => {
    const frame = makeFrame('scene', {});
    expect(getBeatStatus(frame).testCriteriaCount).toBe(0);
  });

  it('testCriteriaCount reflects actual count', () => {
    const frame = makeFrame('scene', {
      testCriteria: ['Scene fires', 'Music starts', 'Keeper spawns'],
    });
    expect(getBeatStatus(frame).testCriteriaCount).toBe(3);
  });

  it('checklistCount is 0 when no implementationChecklist', () => {
    const frame = makeFrame('scene', {});
    expect(getBeatStatus(frame).checklistCount).toBe(0);
  });

  it('checklistCount reflects actual count', () => {
    const frame = makeFrame('scene', {
      implementationChecklist: ['Wire up trigger', 'Add ambient audio'],
    });
    expect(getBeatStatus(frame).checklistCount).toBe(2);
  });
});

// ─── getBeatStatus — hasDomainRequirements ────────────────────────────────────

describe('getBeatStatus — hasDomainRequirements', () => {
  it('is true for choice frames', () => {
    expect(getBeatStatus(makeFrame('choice')).hasDomainRequirements).toBe(true);
  });

  it('is true for consequence frames', () => {
    expect(getBeatStatus(makeFrame('consequence')).hasDomainRequirements).toBe(true);
  });

  it('is true for reveal frames', () => {
    expect(getBeatStatus(makeFrame('reveal')).hasDomainRequirements).toBe(true);
  });

  it('is false for hook frames', () => {
    expect(getBeatStatus(makeFrame('hook')).hasDomainRequirements).toBe(false);
  });

  it('is false for scene frames', () => {
    expect(getBeatStatus(makeFrame('scene')).hasDomainRequirements).toBe(false);
  });

  it('is false for encounter frames', () => {
    expect(getBeatStatus(makeFrame('encounter')).hasDomainRequirements).toBe(false);
  });

  it('is false for npc_beat frames', () => {
    expect(getBeatStatus(makeFrame('npc_beat')).hasDomainRequirements).toBe(false);
  });
});

// ─── getStoryboardReadiness ───────────────────────────────────────────────────

describe('getStoryboardReadiness', () => {
  it('returns all zeros for an empty storyboard', () => {
    const board = makeStoryboard([]);
    const summary = getStoryboardReadiness(board);
    expect(summary.total).toBe(0);
    expect(summary.ready).toBe(0);
    expect(summary.partial).toBe(0);
    expect(summary.draft).toBe(0);
    expect(summary.blocked).toBe(0);
    expect(summary.readyFraction).toBe(0);
  });

  it('counts a single ready frame correctly', () => {
    const frame = makeFrame('scene', {
      designerNotes: 'Full spec.',
      requiredAssets: ['bg.png'],
      testCriteria: ['Passes'],
      implementationChecklist: ['Wire it'],
    });
    const summary = getStoryboardReadiness(makeStoryboard([frame]));
    expect(summary.total).toBe(1);
    expect(summary.ready).toBe(1);
    expect(summary.readyFraction).toBe(1);
  });

  it('counts a single draft frame correctly', () => {
    const frame = makeFrame('scene', {});
    const summary = getStoryboardReadiness(makeStoryboard([frame]));
    expect(summary.total).toBe(1);
    expect(summary.draft).toBe(1);
    expect(summary.readyFraction).toBe(0);
  });

  it('counts a single blocked frame correctly', () => {
    const frame = makeFrame('choice', { designerNotes: 'Some content.' });
    const summary = getStoryboardReadiness(makeStoryboard([frame]));
    expect(summary.blocked).toBe(1);
    expect(summary.ready).toBe(0);
  });

  it('level counts sum to total across a mixed storyboard', () => {
    const frames = [
      makeFrame('scene', { designerNotes: 'D', requiredAssets: ['a'], testCriteria: ['t'], implementationChecklist: ['c'] }, 'f1'),
      makeFrame('scene', { designerNotes: 'D' }, 'f2'),
      makeFrame('scene', {}, 'f3'),
      makeFrame('choice', { designerNotes: 'D' }, 'f4'), // blocked
    ];
    const summary = getStoryboardReadiness(makeStoryboard(frames));
    expect(summary.total).toBe(4);
    expect(summary.ready + summary.partial + summary.draft + summary.blocked).toBe(4);
    expect(summary.ready).toBe(1);
    expect(summary.partial).toBe(1);
    expect(summary.draft).toBe(1);
    expect(summary.blocked).toBe(1);
  });

  it('readyFraction is correct for a mixed set', () => {
    const frames = [
      makeFrame('scene', { designerNotes: 'D', requiredAssets: ['a'], testCriteria: ['t'], implementationChecklist: ['c'] }, 'f1'),
      makeFrame('scene', { designerNotes: 'D', requiredAssets: ['a'], testCriteria: ['t'], implementationChecklist: ['c'] }, 'f2'),
      makeFrame('scene', {}, 'f3'),
      makeFrame('scene', {}, 'f4'),
    ];
    const summary = getStoryboardReadiness(makeStoryboard(frames));
    expect(summary.readyFraction).toBe(0.5);
  });

  it('byFrame contains a BeatStatus entry for every frame', () => {
    const frames = [
      makeFrame('scene', {}, 'f1'),
      makeFrame('choice', {}, 'f2'),
      makeFrame('reveal', { designerNotes: 'D' }, 'f3'),
    ];
    const summary = getStoryboardReadiness(makeStoryboard(frames));
    expect(summary.byFrame.has('f1')).toBe(true);
    expect(summary.byFrame.has('f2')).toBe(true);
    expect(summary.byFrame.has('f3')).toBe(true);
    expect(summary.byFrame.size).toBe(3);
  });

  it('byFrame status matches individual getBeatStatus call', () => {
    const frame = makeFrame('choice', { designerNotes: 'D', stateChanges: ['f = true'] }, 'f1');
    const summary = getStoryboardReadiness(makeStoryboard([frame]));
    const direct = getBeatStatus(frame);
    const viaBoard = summary.byFrame.get('f1')!;
    expect(viaBoard.level).toBe(direct.level);
    expect(viaBoard.missing).toEqual(direct.missing);
  });
});
