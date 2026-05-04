// ─── rpg-domain / handoff.ts ─────────────────────────────────────────────────
//
// Quest handoff generator.
//
// generateHandoff(storyboard) builds a production implementation artifact:
// beats ordered by quest flow, each carrying the full spec a developer needs
// to implement that beat in an RPG engine.
//
// generateMarkdown(handoff) renders that artifact as a readable handoff doc.
//
// These are the only two public functions. The domain decides what is included
// and what order it appears in. The app downloads/displays the result.
//
// ─────────────────────────────────────────────────────────────────────────────

import type { Storyboard, StoryboardFrame, FrameContent } from './schema';
import type { StoryboardConnection } from '@storyboard-os/core';
import { getBeatStatus, getStoryboardReadiness } from './beatStatus';
import type { BeatStatusLevel, MissingSpecReason } from './beatStatus';

// ─── Types ────────────────────────────────────────────────────────────────────

/** One outgoing edge from a beat — a branch the quest can take. */
export interface HandoffBranch {
  /** Connection type (sequence, choice, consequence, optional, fallback). */
  type: string;
  /** The label from the storyboard connection — carries condition/result text. */
  label?: string;
  /** Destination frame id. */
  toId: string;
  /** Destination frame title — human-readable without a lookup table. */
  toTitle: string;
}

/**
 * A single beat in the quest handoff — everything a developer needs to
 * implement this beat in an RPG engine.
 */
export interface HandoffBeat {
  id: string;
  type: string;
  title: string;
  summary: string;

  /** Implementation readiness level from the RPG domain model. */
  status: BeatStatusLevel;

  /** Missing spec fields and domain rule violations for this beat. */
  missing: MissingSpecReason[];

  // ── Optional authoring fields ─────────────────────────────────────────────
  designerNotes?: string;
  playerVisibleText?: string;
  stakes?: string;

  // ── Array content fields (always arrays, never undefined) ─────────────────
  entryConditions: string[];
  exitConditions: string[];
  stateChanges: string[];
  involvedCharacters: string[];
  involvedFactions: string[];
  possibleOutcomes: string[];
  requiredAssets: string[];
  implementationChecklist: string[];
  testCriteria: string[];

  // ── Graph context ─────────────────────────────────────────────────────────
  /** Branches leading OUT from this beat. Empty for terminal beats. */
  outgoingBranches: HandoffBranch[];
  /** IDs of frames that connect INTO this beat. */
  incomingFromIds: string[];
}

/**
 * Board-level readiness numbers for the handoff header.
 * Mirrors StoryboardReadinessSummary but without the per-frame Map
 * (not needed in the handoff — per-beat status is already on each HandoffBeat).
 */
export interface HandoffReadinessSummary {
  total: number;
  ready: number;
  partial: number;
  draft: number;
  blocked: number;
  readyFraction: number;
}

/** The complete quest handoff artifact. */
export interface QuestHandoff {
  id: string;
  title: string;
  description?: string;
  /** ISO 8601 timestamp — when this handoff was generated. */
  generatedAt: string;
  readiness: HandoffReadinessSummary;
  /** All beats in topological quest-flow order. */
  beats: HandoffBeat[];
  /** IDs of beats with 'blocked' status — must be resolved before implementation. */
  blockedBeatIds: string[];
  /** IDs of beats with 'partial' status — implementation can proceed but spec is incomplete. */
  partialBeatIds: string[];
}

// ─── Topological sort (Kahn's algorithm) ─────────────────────────────────────

function topologicalSort(
  frames: StoryboardFrame[],
  connections: StoryboardConnection[],
): StoryboardFrame[] {
  const frameIds = new Set(frames.map(f => f.id));

  // Build adjacency and in-degree — only for connections between known frames
  const adjacency = new Map<string, string[]>(frames.map(f => [f.id, []]));
  const inDegree  = new Map<string, number>(frames.map(f => [f.id, 0]));

  for (const conn of connections) {
    if (!frameIds.has(conn.fromFrameId) || !frameIds.has(conn.toFrameId)) continue;
    adjacency.get(conn.fromFrameId)!.push(conn.toFrameId);
    inDegree.set(conn.toFrameId, (inDegree.get(conn.toFrameId) ?? 0) + 1);
  }

  const frameMap = new Map(frames.map(f => [f.id, f]));

  // Start with all frames that have no incoming edges
  // Preserve original frame order among ties (stable sort property)
  const queue = frames.filter(f => inDegree.get(f.id) === 0);
  const sorted: StoryboardFrame[] = [];

  while (queue.length > 0) {
    const current = queue.shift()!;
    sorted.push(current);

    for (const nextId of adjacency.get(current.id) ?? []) {
      const deg = (inDegree.get(nextId) ?? 0) - 1;
      inDegree.set(nextId, deg);
      if (deg === 0) {
        const nextFrame = frameMap.get(nextId);
        if (nextFrame) queue.push(nextFrame);
      }
    }
  }

  // Append cycle members (frames not reached by BFS) in original order
  const sortedIds = new Set(sorted.map(f => f.id));
  for (const frame of frames) {
    if (!sortedIds.has(frame.id)) sorted.push(frame);
  }

  return sorted;
}

// ─── Beat builder ─────────────────────────────────────────────────────────────

function buildBeat(
  frame: StoryboardFrame,
  connections: StoryboardConnection[],
  frameMap: Map<string, StoryboardFrame>,
): HandoffBeat {
  const content = frame.content as FrameContent;
  const status  = getBeatStatus(frame);

  const outgoingBranches: HandoffBranch[] = connections
    .filter(c => c.fromFrameId === frame.id && frameMap.has(c.toFrameId))
    .map(c => ({
      type:    c.type,
      label:   c.label ?? undefined,
      toId:    c.toFrameId,
      toTitle: frameMap.get(c.toFrameId)!.title,
    }));

  const incomingFromIds = connections
    .filter(c => c.toFrameId === frame.id && frameMap.has(c.fromFrameId))
    .map(c => c.fromFrameId);

  return {
    id:      frame.id,
    type:    frame.type,
    title:   frame.title,
    summary: frame.summary,
    status:  status.level,
    missing: status.missing,

    designerNotes:    content.designerNotes     ?? undefined,
    playerVisibleText: content.playerVisibleText ?? undefined,
    stakes:           content.stakes            ?? undefined,

    entryConditions:       content.entryConditions       ?? [],
    exitConditions:        content.exitConditions        ?? [],
    stateChanges:          content.stateChanges          ?? [],
    involvedCharacters:    content.involvedCharacters    ?? [],
    involvedFactions:      content.involvedFactions      ?? [],
    possibleOutcomes:      content.possibleOutcomes      ?? [],
    requiredAssets:        content.requiredAssets        ?? [],
    implementationChecklist: content.implementationChecklist ?? [],
    testCriteria:          content.testCriteria          ?? [],

    outgoingBranches,
    incomingFromIds,
  };
}

// ─── Public API ───────────────────────────────────────────────────────────────

/**
 * Generate a quest implementation handoff from a storyboard.
 *
 * Beats are sorted in topological quest-flow order (upstream first).
 * Each beat carries the full implementation spec — a developer can implement
 * the quest from this artifact without opening the canvas.
 */
export function generateHandoff(storyboard: Storyboard): QuestHandoff {
  const sorted   = topologicalSort(storyboard.frames, storyboard.connections);
  const frameMap = new Map(storyboard.frames.map(f => [f.id, f]));

  const beats = sorted.map(frame =>
    buildBeat(frame, storyboard.connections, frameMap),
  );

  // Readiness summary (reuse domain function, strip the Map for serialisation)
  const boardReadiness = getStoryboardReadiness(storyboard);
  const readiness: HandoffReadinessSummary = {
    total:         boardReadiness.total,
    ready:         boardReadiness.ready,
    partial:       boardReadiness.partial,
    draft:         boardReadiness.draft,
    blocked:       boardReadiness.blocked,
    readyFraction: boardReadiness.readyFraction,
  };

  const blockedBeatIds = beats.filter(b => b.status === 'blocked').map(b => b.id);
  const partialBeatIds = beats.filter(b => b.status === 'partial').map(b => b.id);

  return {
    id:           storyboard.id,
    title:        storyboard.title,
    description:  storyboard.description ?? undefined,
    generatedAt:  new Date().toISOString(),
    readiness,
    beats,
    blockedBeatIds,
    partialBeatIds,
  };
}

// ─── Markdown renderer ────────────────────────────────────────────────────────

const STATUS_LABELS: Record<BeatStatusLevel, string> = {
  ready:   'READY',
  partial: 'PARTIAL',
  draft:   'DRAFT',
  blocked: 'BLOCKED',
};

const CONNECTION_TYPE_LABELS: Record<string, string> = {
  sequence:    'sequence',
  choice:      'choice branch',
  consequence: 'consequence',
  optional:    'optional',
  fallback:    'fallback',
};

function connTypeLabel(type: string): string {
  return CONNECTION_TYPE_LABELS[type] ?? type;
}

function lines(...parts: Array<string | null | false>): string {
  return parts.filter(Boolean).join('\n');
}

function checklistLines(items: string[]): string {
  return items.map(i => `- [ ] ${i}`).join('\n');
}

function bulletLines(items: string[]): string {
  return items.map(i => `- ${i}`).join('\n');
}

function blockquote(text: string): string {
  return text
    .split('\n')
    .map(line => `> ${line}`)
    .join('\n');
}

function renderBeat(beat: HandoffBeat, index: number): string {
  const typeLabel = beat.type.replace('_', ' ').toUpperCase();
  const sections: string[] = [];

  sections.push(`### Beat ${index + 1} — ${beat.title}`);
  sections.push(`**Type:** ${typeLabel} · **Status:** ${STATUS_LABELS[beat.status]}`);
  sections.push('');
  sections.push(beat.summary);

  // Entry / exit conditions
  sections.push('');
  sections.push(
    `**Entry Conditions:** ${beat.entryConditions.length > 0 ? '' : 'none required'}`,
  );
  if (beat.entryConditions.length > 0) {
    sections.push(bulletLines(beat.entryConditions));
  }

  sections.push(
    `**Exit Conditions:** ${beat.exitConditions.length > 0 ? '' : 'none required'}`,
  );
  if (beat.exitConditions.length > 0) {
    sections.push(bulletLines(beat.exitConditions));
  }

  // State changes
  if (beat.stateChanges.length > 0) {
    sections.push('');
    sections.push('**State Changes:**');
    sections.push(bulletLines(beat.stateChanges.map(s => `\`${s}\``)));
  }

  // Player-visible text
  if (beat.playerVisibleText) {
    sections.push('');
    sections.push('**Player-Visible Text:**');
    sections.push(blockquote(beat.playerVisibleText));
  }

  // Stakes
  if (beat.stakes) {
    sections.push('');
    sections.push(`**Stakes:** ${beat.stakes}`);
  }

  // Involved characters / factions
  if (beat.involvedCharacters.length > 0) {
    sections.push('');
    sections.push(`**Characters:** ${beat.involvedCharacters.join(', ')}`);
  }
  if (beat.involvedFactions.length > 0) {
    sections.push('');
    sections.push(`**Factions:** ${beat.involvedFactions.join(', ')}`);
  }

  // Possible outcomes
  if (beat.possibleOutcomes.length > 0) {
    sections.push('');
    sections.push('**Possible Outcomes:**');
    sections.push(bulletLines(beat.possibleOutcomes));
  }

  // Required assets
  if (beat.requiredAssets.length > 0) {
    sections.push('');
    sections.push('**Required Assets:**');
    sections.push(bulletLines(beat.requiredAssets));
  }

  // Implementation checklist
  if (beat.implementationChecklist.length > 0) {
    sections.push('');
    sections.push('**Implementation Checklist:**');
    sections.push(checklistLines(beat.implementationChecklist));
  }

  // Test criteria
  if (beat.testCriteria.length > 0) {
    sections.push('');
    sections.push('**Test Criteria:**');
    sections.push(checklistLines(beat.testCriteria));
  }

  // Designer notes (last — implementation-facing readers can skip)
  if (beat.designerNotes) {
    sections.push('');
    sections.push('**Designer Notes:**');
    sections.push(`> ${beat.designerNotes}`);
  }

  // Outgoing branches
  sections.push('');
  if (beat.outgoingBranches.length === 0) {
    // Only label as terminal if it has no outgoing AND no content suggests it
    // is a draft/stub — avoid noise on empty frames
    if (beat.status !== 'draft') {
      sections.push('**Outgoing:** none — terminal beat');
    }
  } else if (beat.outgoingBranches.length === 1) {
    const b = beat.outgoingBranches[0];
    const labelPart = b.label ? ` — "${b.label}"` : '';
    sections.push(`**Outgoing:** → ${b.toTitle} (${connTypeLabel(b.type)}${labelPart})`);
  } else {
    sections.push('**Outgoing Branches:**');
    for (const b of beat.outgoingBranches) {
      const labelPart = b.label ? `: "${b.label}"` : '';
      sections.push(`- → ${b.toTitle} (${connTypeLabel(b.type)}${labelPart})`);
    }
  }

  // Missing spec note
  const blockers = beat.missing.filter(r =>
    r === 'no_state_changes' || r === 'no_entry_or_state_change',
  );
  if (blockers.length > 0) {
    sections.push('');
    sections.push('> **⚠ Domain requirement missing — must resolve before implementation:**');
    if (blockers.includes('no_state_changes')) {
      sections.push('> - State changes required for this frame type (choice/consequence)');
    }
    if (blockers.includes('no_entry_or_state_change')) {
      sections.push('> - Entry conditions or state changes required for reveal beats');
    }
  }

  return sections.join('\n');
}

/**
 * Render a QuestHandoff as a Markdown handoff document.
 *
 * The output is a complete, standalone document a developer can work from.
 * It does not require the canvas, the app, or any domain knowledge beyond
 * the content of the document itself.
 */
export function generateMarkdown(handoff: QuestHandoff): string {
  const pct = Math.round(handoff.readiness.readyFraction * 100);
  const { ready, partial, draft, blocked, total } = handoff.readiness;

  const readinessParts: string[] = [];
  if (ready   > 0) readinessParts.push(`**${ready} READY**`);
  if (partial > 0) readinessParts.push(`${partial} PARTIAL`);
  if (blocked > 0) readinessParts.push(`${blocked} BLOCKED`);
  if (draft   > 0) readinessParts.push(`${draft} DRAFT`);

  const sections: string[] = [];

  // ── Header ────────────────────────────────────────────────────────────────
  sections.push(`# ${handoff.title} — Quest Handoff`);
  sections.push('');

  if (handoff.description) {
    sections.push(`> ${handoff.description}`);
    sections.push('');
  }

  sections.push(`**Generated:** ${handoff.generatedAt.split('T')[0]} · **Quest ID:** \`${handoff.id}\``);
  sections.push('');
  sections.push('---');

  // ── Readiness summary ────────────────────────────────────────────────────
  sections.push('');
  sections.push('## Implementation Readiness');
  sections.push('');
  sections.push(`**${ready} / ${total} beats ready** (${pct}% complete)`);
  if (readinessParts.length > 0) {
    sections.push('');
    sections.push(readinessParts.join(' · '));
  }
  sections.push('');
  sections.push('---');

  // ── Beat list ─────────────────────────────────────────────────────────────
  sections.push('');
  sections.push('## Beats');

  for (let i = 0; i < handoff.beats.length; i++) {
    sections.push('');
    sections.push(renderBeat(handoff.beats[i], i));
    sections.push('');
    sections.push('---');
  }

  // ── Blocked / partial summary ─────────────────────────────────────────────
  const hasIssues = handoff.blockedBeatIds.length > 0 || handoff.partialBeatIds.length > 0;

  if (hasIssues) {
    sections.push('');
    sections.push('## Spec Issues');
    sections.push('');
    sections.push('Resolve before implementation pass:');
    sections.push('');

    if (handoff.blockedBeatIds.length > 0) {
      sections.push(`### Blocked (${handoff.blockedBeatIds.length})`);
      sections.push('');
      sections.push('Domain rule violations — these beats cannot function without the missing data:');
      sections.push('');
      for (const id of handoff.blockedBeatIds) {
        const beat = handoff.beats.find(b => b.id === id);
        if (!beat) continue;
        const blockers = beat.missing
          .filter(r => r === 'no_state_changes' || r === 'no_entry_or_state_change');
        const detail = blockers.length > 0
          ? ` — ${blockers.map(r => r.replace(/_/g, ' ')).join(', ')}`
          : '';
        sections.push(`- **${beat.title}** (\`${id}\`)${detail}`);
      }
      sections.push('');
    }

    if (handoff.partialBeatIds.length > 0) {
      sections.push(`### Partial (${handoff.partialBeatIds.length})`);
      sections.push('');
      sections.push('Spec is incomplete — implementation can begin but expect rework:');
      sections.push('');
      for (const id of handoff.partialBeatIds) {
        const beat = handoff.beats.find(b => b.id === id);
        if (!beat) continue;
        const gaps = beat.missing.filter(
          r => !['no_state_changes', 'no_entry_or_state_change', 'no_stakes', 'no_possible_outcomes'].includes(r),
        );
        const detail = gaps.length > 0
          ? ` — missing: ${gaps.map(r => r.replace(/^no_/, '').replace(/_/g, ' ')).join(', ')}`
          : '';
        sections.push(`- **${beat.title}** (\`${id}\`)${detail}`);
      }
    }
  }

  return sections.join('\n');
}
