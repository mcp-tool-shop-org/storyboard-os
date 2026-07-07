// ─── frameSignals.test.ts ─────────────────────────────────────────────────────
//
// Tests for RPG domain frame signal helpers.
// Proves that branch/state summaries are generated from domain data, not
// from string literals passed in from outside.
//
// ─────────────────────────────────────────────────────────────────────────────

import { describe, it, expect } from 'vitest';
import { getFrameSignal, getFrameBadges, getChoiceBranchCount, rpgColors } from './frameSignals';
import type { StoryboardFrame } from './schema';
import { statusColors, statusLabels } from '@storyboard-os/core';
import type { StoryboardConnection } from '@storyboard-os/core';

// ─── Fixture helpers ──────────────────────────────────────────────────────────

function makeFrame(overrides: Partial<StoryboardFrame> = {}): StoryboardFrame {
  return {
    id: 'frame-1',
    type: 'scene',
    title: 'Test Frame',
    summary: 'A test beat.',
    position: { x: 0, y: 0 },
    size: { width: 180, height: 140 },
    content: {},
    annotations: [],
    ...overrides,
  };
}

function makeConnection(from: string, to: string, type = 'sequence'): StoryboardConnection {
  return {
    id: `${from}->${to}`,
    fromFrameId: from,
    toFrameId: to,
    type: type as any,
    label: `${from} to ${to}`,
  };
}

// ─── getFrameSignal ───────────────────────────────────────────────────────────

describe('getFrameSignal', () => {
  describe('isStateful', () => {
    it('is false when frame has no stateChanges', () => {
      const frame = makeFrame({ content: {} });
      expect(getFrameSignal(frame).isStateful).toBe(false);
    });

    it('is false when stateChanges is empty array', () => {
      const frame = makeFrame({ content: { stateChanges: [] } });
      expect(getFrameSignal(frame).isStateful).toBe(false);
    });

    it('is true when frame has one stateChange', () => {
      const frame = makeFrame({ content: { stateChanges: ['ledger_public = true'] } });
      expect(getFrameSignal(frame).isStateful).toBe(true);
    });

    it('is true when frame has multiple stateChanges', () => {
      const frame = makeFrame({
        content: {
          stateChanges: ['faction_trust += 1', 'quest_phase = 2', 'player_warned = true'],
        },
      });
      expect(getFrameSignal(frame).isStateful).toBe(true);
    });
  });

  describe('stateChangeSummary', () => {
    it('is null when no stateChanges', () => {
      const frame = makeFrame({ content: {} });
      expect(getFrameSignal(frame).stateChangeSummary).toBeNull();
    });

    it('is null when stateChanges is empty', () => {
      const frame = makeFrame({ content: { stateChanges: [] } });
      expect(getFrameSignal(frame).stateChangeSummary).toBeNull();
    });

    it('returns the single entry verbatim when there is one stateChange', () => {
      const frame = makeFrame({ content: { stateChanges: ['ledger_public = true'] } });
      expect(getFrameSignal(frame).stateChangeSummary).toBe('ledger_public = true');
    });

    it('returns a count summary when there are multiple stateChanges', () => {
      const frame = makeFrame({
        content: { stateChanges: ['flag_a = true', 'flag_b = true', 'counter += 1'] },
      });
      expect(getFrameSignal(frame).stateChangeSummary).toBe('3 state changes');
    });
  });

  describe('branchConditionSummary', () => {
    it('is null when no entryConditions', () => {
      const frame = makeFrame({ content: {} });
      expect(getFrameSignal(frame).branchConditionSummary).toBeNull();
    });

    it('is null when entryConditions is empty', () => {
      const frame = makeFrame({ content: { entryConditions: [] } });
      expect(getFrameSignal(frame).branchConditionSummary).toBeNull();
    });

    it('returns the single condition verbatim when there is one', () => {
      const frame = makeFrame({ content: { entryConditions: ['quest_tollhouse_active = true'] } });
      expect(getFrameSignal(frame).branchConditionSummary).toBe('quest_tollhouse_active = true');
    });

    it('returns a count summary when there are multiple conditions', () => {
      const frame = makeFrame({
        content: { entryConditions: ['cond_a', 'cond_b'] },
      });
      expect(getFrameSignal(frame).branchConditionSummary).toBe('2 entry conditions');
    });
  });

  describe('readiness', () => {
    it('is incomplete when content is empty', () => {
      const frame = makeFrame({ content: {} });
      expect(getFrameSignal(frame).readiness).toBe('incomplete');
    });

    it('is partial when content has only designerNotes', () => {
      const frame = makeFrame({ content: { designerNotes: 'Some notes' } });
      expect(getFrameSignal(frame).readiness).toBe('partial');
    });

    it('is partial when content has only implementationChecklist', () => {
      const frame = makeFrame({ content: { implementationChecklist: ['Do the thing'] } });
      expect(getFrameSignal(frame).readiness).toBe('partial');
    });

    it('is ready when frame has implementationChecklist + requiredAssets + testCriteria', () => {
      const frame = makeFrame({
        content: {
          implementationChecklist: ['Wire up dialogue'],
          requiredAssets: ['npc_keeper_voice.ogg'],
          testCriteria: ['Keeper dialogue triggers on approach'],
        },
      });
      expect(getFrameSignal(frame).readiness).toBe('ready');
    });

    it('is ready when frame has all four readiness fields', () => {
      const frame = makeFrame({
        content: {
          designerNotes: 'Notes',
          implementationChecklist: ['Task 1'],
          requiredAssets: ['asset.png'],
          testCriteria: ['Test 1'],
        },
      });
      expect(getFrameSignal(frame).readiness).toBe('ready');
    });
  });

  describe('spec coverage flags', () => {
    it('hasTestCoverage is false when testCriteria is absent', () => {
      const frame = makeFrame({ content: {} });
      expect(getFrameSignal(frame).hasTestCoverage).toBe(false);
    });

    it('hasTestCoverage is true when testCriteria has entries', () => {
      const frame = makeFrame({ content: { testCriteria: ['Ledger updates on accept'] } });
      expect(getFrameSignal(frame).hasTestCoverage).toBe(true);
    });

    it('hasRequiredAssets is false when requiredAssets is absent', () => {
      const frame = makeFrame({ content: {} });
      expect(getFrameSignal(frame).hasRequiredAssets).toBe(false);
    });

    it('hasRequiredAssets is true when requiredAssets has entries', () => {
      const frame = makeFrame({ content: { requiredAssets: ['bg_tollhouse.png'] } });
      expect(getFrameSignal(frame).hasRequiredAssets).toBe(true);
    });

    it('hasImplementationChecklist is false when checklist is absent', () => {
      const frame = makeFrame({ content: {} });
      expect(getFrameSignal(frame).hasImplementationChecklist).toBe(false);
    });

    it('hasImplementationChecklist is true when checklist has entries', () => {
      const frame = makeFrame({ content: { implementationChecklist: ['Wire up NPC'] } });
      expect(getFrameSignal(frame).hasImplementationChecklist).toBe(true);
    });
  });
});

// ─── getFrameBadges ───────────────────────────────────────────────────────────

describe('getFrameBadges', () => {
  it('returns no STATE badge for a non-stateful frame', () => {
    const frame = makeFrame({ content: {} });
    const badges = getFrameBadges(frame);
    const stateBadge = badges.find(b => b.text === 'STATE');
    expect(stateBadge).toBeUndefined();
  });

  it('returns a STATE badge for a frame with stateChanges', () => {
    const frame = makeFrame({ content: { stateChanges: ['ledger_public = true'] } });
    const badges = getFrameBadges(frame);
    const stateBadge = badges.find(b => b.text === 'STATE');
    expect(stateBadge).toBeDefined();
    expect(stateBadge!.color).toBe('#3B82F6');
  });

  it('returns a DRAFT readiness badge for an empty frame', () => {
    const frame = makeFrame({ content: {} });
    const badges = getFrameBadges(frame);
    const readinessBadge = badges.find(b => ['SPEC', 'PARTIAL', 'DRAFT'].includes(b.text));
    expect(readinessBadge?.text).toBe('DRAFT');
  });

  it('returns a PARTIAL readiness badge for a partially specced frame', () => {
    const frame = makeFrame({ content: { designerNotes: 'Some notes' } });
    const badges = getFrameBadges(frame);
    const readinessBadge = badges.find(b => ['SPEC', 'PARTIAL', 'DRAFT'].includes(b.text));
    expect(readinessBadge?.text).toBe('PARTIAL');
  });

  it('returns a SPEC readiness badge for a fully specced frame', () => {
    const frame = makeFrame({
      content: {
        implementationChecklist: ['Wire up'],
        requiredAssets: ['asset.png'],
        testCriteria: ['Fires on entry'],
      },
    });
    const badges = getFrameBadges(frame);
    const readinessBadge = badges.find(b => ['SPEC', 'PARTIAL', 'DRAFT'].includes(b.text));
    expect(readinessBadge?.text).toBe('SPEC');
  });

  it('returns both STATE and SPEC badges for a fully-specced stateful frame', () => {
    const frame = makeFrame({
      content: {
        stateChanges: ['ledger_public = true'],
        implementationChecklist: ['Wire up'],
        requiredAssets: ['asset.png'],
        testCriteria: ['Fires on entry'],
      },
    });
    const badges = getFrameBadges(frame);
    expect(badges.find(b => b.text === 'STATE')).toBeDefined();
    expect(badges.find(b => b.text === 'SPEC')).toBeDefined();
    expect(badges).toHaveLength(2);
  });

  it('each badge has a non-empty text and a valid hex color string', () => {
    const frame = makeFrame({
      content: {
        stateChanges: ['flag = true'],
        implementationChecklist: ['Task 1'],
        requiredAssets: ['file.png'],
        testCriteria: ['Passes'],
      },
    });
    for (const badge of getFrameBadges(frame)) {
      expect(badge.text.length).toBeGreaterThan(0);
      expect(badge.color).toMatch(/^#[0-9a-fA-F]{6}$/);
    }
  });
});

// ─── Centralized token contract (VP-001 / PR-003 refactor guard) ──────────────
// The badge colors are now sourced from core's statusColors — this proves the
// centralization preserved the exact canonical hexes the app renders, and that
// a known readiness value still produces the right badge after the switch was
// refactored with an exhaustiveness default arm.

describe('rpgColors sources from core statusColors', () => {
  it('re-exports the shared status swatches under domain names', () => {
    expect(rpgColors.state).toBe(statusColors.state);
    expect(rpgColors.ready).toBe(statusColors.spec);
    expect(rpgColors.partial).toBe(statusColors.partial);
    expect(rpgColors.draft).toBe(statusColors.draft);
  });

  it('a ready frame renders the canonical SPEC label + spec color', () => {
    const frame = makeFrame({
      content: {
        implementationChecklist: ['Wire up'],
        requiredAssets: ['a.png'],
        testCriteria: ['fires'],
      },
    });
    const badge = getFrameBadges(frame).find(b => b.text === statusLabels.ready);
    expect(badge).toBeDefined();
    expect(badge!.color).toBe(statusColors.spec);
  });

  it('an incomplete frame renders the canonical DRAFT label + draft color', () => {
    const badge = getFrameBadges(makeFrame({ content: {} })).find(
      b => b.text === statusLabels.draft,
    );
    expect(badge).toBeDefined();
    expect(badge!.color).toBe(statusColors.draft);
  });
});

// ─── getChoiceBranchCount ─────────────────────────────────────────────────────

describe('getChoiceBranchCount', () => {
  it('returns 0 when no connections involve the frame', () => {
    const conns = [makeConnection('other-1', 'other-2')];
    expect(getChoiceBranchCount('frame-1', conns)).toBe(0);
  });

  it('returns 0 when frame only appears as a target', () => {
    const conns = [makeConnection('frame-0', 'frame-1')];
    expect(getChoiceBranchCount('frame-1', conns)).toBe(0);
  });

  it('counts one outgoing connection correctly', () => {
    const conns = [makeConnection('frame-1', 'frame-2')];
    expect(getChoiceBranchCount('frame-1', conns)).toBe(1);
  });

  it('counts multiple outgoing connections from one frame', () => {
    const conns = [
      makeConnection('frame-1', 'frame-a', 'choice'),
      makeConnection('frame-1', 'frame-b', 'choice'),
      makeConnection('frame-1', 'frame-c', 'choice'),
    ];
    expect(getChoiceBranchCount('frame-1', conns)).toBe(3);
  });

  it('does not count outgoing from other frames', () => {
    const conns = [
      makeConnection('frame-1', 'frame-a', 'choice'),
      makeConnection('frame-2', 'frame-b', 'choice'),
    ];
    expect(getChoiceBranchCount('frame-1', conns)).toBe(1);
    expect(getChoiceBranchCount('frame-2', conns)).toBe(1);
  });

  it('works with an empty connections array', () => {
    expect(getChoiceBranchCount('frame-1', [])).toBe(0);
  });
});
