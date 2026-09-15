// ─── Cinematic Domain — Production Brief Handoff ─────────────────────────────

import type {
  Storyboard,
  StoryboardFrame,
  StoryboardConnection,
  CinematicShotSize,
  CinematicCameraMove,
  CinematicFrameContent,
} from './schema';
import { getCinematicBeatStatus } from './beatStatus';
import { parseDurationRange } from './productionSignals';
import { assertValidProductionBrief, PRODUCTION_BRIEF_SCHEMA_ID } from './validateProductionBrief';
import {
  humanizeConnectionType,
  humanizeFrameType,
  humanizeMissingReason,
  humanizeStatus,
} from './labels';
export { parseDurationSeconds } from './productionSignals';
export {
  humanizeConnectionType,
  humanizeFrameType,
  humanizeMissingReason,
  humanizeStatus,
  FRAME_TYPE_LABELS,
  STATUS_LABELS,
  CONNECTION_TYPE_LABELS,
  CONNECTION_TYPE_COLORS,
  getConnectionTypeColor,
} from './labels';

// ─── Markdown escaping (DM-004) ───────────────────────────────────────────────
//
// Neutralize markdown-structural characters in INLINE user text:
// - backticks / backslashes → escaped so user text cannot open code spans
// - pipes     → escaped so user text cannot add/split table cells
// - `*` `_`   → escaped so emphasis cannot reshape structure
// - `[` `]` `(` `)` → escaped so link/image syntax stays inert
// - `<`       → `&lt;` so stray inline HTML stays inert
// - a leading `#` / `>` / `-` (per line) → escaped so user text cannot
//   introduce headings, blockquotes, or list items

function escapeMarkdownInline(text: string): string {
  return text
    .replace(/\\/g, '\\\\')
    .replace(/`/g, '\\`')
    .replace(/\|/g, '\\|')
    .replace(/\*/g, '\\*')
    .replace(/_/g, '\\_')
    .replace(/\[/g, '\\[')
    .replace(/\]/g, '\\]')
    .replace(/\(/g, '\\(')
    .replace(/\)/g, '\\)')
    .replace(/</g, '&lt;')
    .replace(/^([#>-])/gm, '\\$1');
}

// ─── Topological sort (Kahn's algorithm) ─────────────────────────────────────
//
// Shots are arranged on the canvas as a directed graph — connections describe
// the cinematic flow (sequence, match cut, cutaway, reaction, etc.). The raw
// `storyboard.frames` array order reflects authoring/creation order, not
// playback/production order. The production brief must walk shots in flow
// order so the resulting document reads like a shot list, not a creation log.
//
// Matches the algorithm used by RPG and Marketing domains for parity.

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

// ─── Types ────────────────────────────────────────────────────────────────────

export interface ProductionBriefCamera {
  shotSize?: CinematicShotSize;
  lensMm?: number;
  fovDeg?: number;
  move?: CinematicCameraMove;
  /** Free-text author notes (legacy cameraAngle / cameraMovement). */
  notes?: string;
}

export interface ProductionBriefShot {
  frameId: string;
  shotNumber: number;
  title: string;
  type: string;
  intent: string | null;
  visualDescription: string | null;
  camera: ProductionBriefCamera | null;
  framing: string | null;
  duration: string | null;
  dialogue: string[];
  actionNotes: string[];
  continuity: string[];
  requiredAssets: string[];
  vfx: string[];
  audio: string[];
  editNotes: string | null;
  checklist: string[];
  testCriteria: string[];
  status: string;
  /** Beat-status reason codes; omitted when empty so ready shots stay quiet. */
  missingReasons?: string[];
}

export interface ProductionBriefConnection {
  id: string;
  fromFrameId: string;
  toFrameId: string;
  fromTitle: string;
  toTitle: string;
  /** Raw connection enum — humanize only in markdown/HTML. */
  type: string;
}

/**
 * Current handoff artifact schema version. Bump when the shape changes in a way
 * a downstream importer must branch on. Stamped onto every generated brief so
 * future consumers have a discriminator (PR-004).
 * 2: connections + optional missingReasons on shots.
 * 3: camera is a structured object (shotSize, lensMm, fovDeg, move, notes).
 */
export const HANDOFF_FORMAT_VERSION = 3;

/** Format structured camera for markdown / HTML. Null when empty. */
export function formatProductionBriefCamera(camera: ProductionBriefCamera | null | undefined): string | null {
  if (!camera) return null;
  const parts: string[] = [];
  if (camera.shotSize) parts.push(camera.shotSize);
  if (typeof camera.lensMm === 'number') parts.push(`${camera.lensMm}mm`);
  if (typeof camera.fovDeg === 'number') parts.push(`FOV ${camera.fovDeg}°`);
  if (camera.move) parts.push(camera.move);
  if (camera.notes) parts.push(camera.notes);
  return parts.length > 0 ? parts.join(' · ') : null;
}

function toBriefCamera(content: CinematicFrameContent): ProductionBriefCamera | null {
  const notesParts: string[] = [];
  if (content.cameraAngle) notesParts.push(content.cameraAngle);
  if (content.cameraMovement) notesParts.push(content.cameraMovement);
  const camera: ProductionBriefCamera = {};
  if (content.shotSize) camera.shotSize = content.shotSize;
  if (typeof content.lensMm === 'number') camera.lensMm = content.lensMm;
  if (typeof content.fovDeg === 'number') camera.fovDeg = content.fovDeg;
  if (content.move) camera.move = content.move;
  if (notesParts.length > 0) camera.notes = notesParts.join(' · ');
  return Object.keys(camera).length > 0 ? camera : null;
}

export interface ProductionBrief {
  /** Published 2020-12 schema URI so importers can locate the contract. */
  $schema?: string;
  /** Schema discriminator for downstream importers (PR-004). */
  formatVersion: number;
  title: string;
  description: string;
  totalShots: number;
  totalDuration: string;
  shots: ProductionBriefShot[];
  connections: ProductionBriefConnection[];
  readySummary: { ready: number; partial: number; draft: number; blocked: number };
}

// ─── Duration rollup (uses shared parseDurationRange / parseDurationSeconds) ──

function formatTotalDuration(frames: StoryboardFrame[]): string {
  let totalLow = 0;
  let totalHigh = 0;
  for (const f of frames) {
    // `?.` guards frames whose content is null/missing (DM-002).
    const range = parseDurationRange(f.content?.durationEstimate);
    if (!range) continue;
    totalLow += range[0];
    totalHigh += range[1];
  }
  if (totalLow === 0) return 'Unknown';
  if (totalLow === totalHigh) return `${totalLow}s`;
  return `${totalLow}-${totalHigh}s`;
}


// ─── Generate brief ──────────────────────────────────────────────────────────

export function generateProductionBrief(storyboard: Storyboard): ProductionBrief {
  const summary = { ready: 0, partial: 0, draft: 0, blocked: 0 };

  // Order shots by cinematic flow (graph topology), not array order.
  const sorted = topologicalSort(storyboard.frames, storyboard.connections);

  const shots: ProductionBriefShot[] = sorted.map((frame, i) => {
    // Normalize null/missing content to an empty spec (DM-002).
    const content = (frame.content ?? {}) as StoryboardFrame['content'];
    const status = getCinematicBeatStatus(frame);
    summary[status.level]++;

    const shot: ProductionBriefShot = {
      frameId: frame.id,
      shotNumber: i + 1,
      title: frame.title,
      type: frame.type,
      intent: content.intent ?? null,
      visualDescription: content.visualDescription ?? null,
      camera: toBriefCamera(content),
      framing: content.framing ?? null,
      duration: content.durationEstimate ?? null,
      dialogue: content.dialogue ?? [],
      actionNotes: content.actionNotes ?? [],
      continuity: content.continuityRequirements ?? [],
      requiredAssets: content.requiredAssets ?? [],
      vfx: content.vfxRequirements ?? [],
      audio: content.audioRequirements ?? [],
      editNotes: content.editNotes ?? null,
      checklist: content.implementationChecklist ?? [],
      testCriteria: content.testCriteria ?? [],
      status: status.level,
    };
    if (status.missingReasons.length > 0) {
      shot.missingReasons = status.missingReasons;
    }
    return shot;
  });

  const frameTitle = new Map(storyboard.frames.map(f => [f.id, f.title]));
  const connections: ProductionBriefConnection[] = (storyboard.connections ?? []).map(conn => ({
    id: conn.id,
    fromFrameId: conn.fromFrameId,
    toFrameId: conn.toFrameId,
    fromTitle: frameTitle.get(conn.fromFrameId) ?? conn.fromFrameId,
    toTitle: frameTitle.get(conn.toFrameId) ?? conn.toFrameId,
    type: conn.type,
  }));

  const brief: ProductionBrief = {
    $schema: PRODUCTION_BRIEF_SCHEMA_ID,
    formatVersion: HANDOFF_FORMAT_VERSION,
    title: storyboard.title,
    description: storyboard.description ?? '',
    totalShots: shots.length,
    totalDuration: formatTotalDuration(storyboard.frames),
    shots,
    connections,
    readySummary: summary,
  };
  assertValidProductionBrief(brief);
  return brief;
}

// ─── Markdown export ──────────────────────────────────────────────────────────

export function generateProductionMarkdown(brief: ProductionBrief): string {
  const esc = escapeMarkdownInline;
  const lines: string[] = [];

  lines.push(`# ${esc(brief.title)} — Production Brief`);
  lines.push('');
  if (brief.description) {
    lines.push(esc(brief.description));
    lines.push('');
  }
  lines.push(`**Total shots:** ${brief.totalShots}  `);
  lines.push(`**Estimated duration:** ${brief.totalDuration}  `);
  lines.push(`**Readiness:** ${brief.readySummary.ready} ready · ${brief.readySummary.partial} partial · ${brief.readySummary.draft} draft · ${brief.readySummary.blocked} blocked`);
  lines.push('');
  lines.push('---');
  lines.push('');

  for (const shot of brief.shots) {
    lines.push(`## Shot ${shot.shotNumber}: ${esc(shot.title)}`);
    lines.push('');
    lines.push(`**Type:** ${humanizeFrameType(shot.type)} · **Status:** ${humanizeStatus(shot.status)}${shot.duration ? ` · **Duration:** ${esc(shot.duration)}` : ''}`);
    lines.push('');
    if (shot.missingReasons && shot.missingReasons.length > 0) {
      lines.push(`**Missing:** ${shot.missingReasons.map(humanizeMissingReason).map(esc).join(', ')}`);
      lines.push('');
    }

    if (shot.intent) {
      lines.push(`**Intent:** ${esc(shot.intent)}`);
      lines.push('');
    }

    if (shot.visualDescription) {
      lines.push(`**Visual:** ${esc(shot.visualDescription)}`);
      lines.push('');
    }

    const cameraLine = formatProductionBriefCamera(shot.camera);
    if (cameraLine) {
      lines.push(`**Camera:** ${esc(cameraLine)}`);
      lines.push('');
    }

    if (shot.framing) {
      lines.push(`**Framing:** ${esc(shot.framing)}`);
      lines.push('');
    }

    if (shot.dialogue.length > 0) {
      lines.push('**Dialogue:**');
      for (const d of shot.dialogue) lines.push(`- ${esc(d)}`);
      lines.push('');
    }

    if (shot.actionNotes.length > 0) {
      lines.push('**Action:**');
      for (const a of shot.actionNotes) lines.push(`- ${esc(a)}`);
      lines.push('');
    }

    if (shot.continuity.length > 0) {
      lines.push('**Continuity:**');
      for (const c of shot.continuity) lines.push(`- ${esc(c)}`);
      lines.push('');
    }

    if (shot.requiredAssets.length > 0) {
      lines.push('**Required assets:**');
      for (const a of shot.requiredAssets) lines.push(`- ${esc(a)}`);
      lines.push('');
    }

    if (shot.vfx.length > 0) {
      lines.push('**VFX:**');
      for (const v of shot.vfx) lines.push(`- ${esc(v)}`);
      lines.push('');
    }

    if (shot.audio.length > 0) {
      lines.push('**Audio:**');
      for (const a of shot.audio) lines.push(`- ${esc(a)}`);
      lines.push('');
    }

    if (shot.editNotes) {
      lines.push(`**Edit notes:** ${esc(shot.editNotes)}`);
      lines.push('');
    }

    if (shot.checklist.length > 0) {
      lines.push('**Checklist:**');
      for (const item of shot.checklist) lines.push(`- [ ] ${esc(item)}`);
      lines.push('');
    }

    if (shot.testCriteria.length > 0) {
      lines.push('**Test criteria:**');
      for (const t of shot.testCriteria) lines.push(`- [ ] ${esc(t)}`);
      lines.push('');
    }

    lines.push('---');
    lines.push('');
  }

  if (brief.connections && brief.connections.length > 0) {
    lines.push('## Sequence Flow');
    lines.push('');
    lines.push('| From | Type | To |');
    lines.push('| --- | --- | --- |');
    for (const conn of brief.connections) {
      lines.push(
        `| ${esc(conn.fromTitle)} | ${humanizeConnectionType(conn.type)} | ${esc(conn.toTitle)} |`,
      );
    }
    lines.push('');
  }

  return lines.join('\n');
}
