// ─── Cinematic Domain — Production Brief Handoff ─────────────────────────────

import type { Storyboard, StoryboardFrame, StoryboardConnection } from './schema';
import { getCinematicBeatStatus } from './beatStatus';

// ─── Types ────────────────────────────────────────────────────────────────────

export interface ProductionBriefShot {
  frameId: string;
  shotNumber: number;
  title: string;
  type: string;
  intent: string | null;
  visualDescription: string | null;
  camera: string | null;
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
}

export interface ProductionBrief {
  title: string;
  description: string;
  totalShots: number;
  totalDuration: string;
  shots: ProductionBriefShot[];
  readySummary: { ready: number; partial: number; draft: number; blocked: number };
}

// ─── Duration parsing helper ──────────────────────────────────────────────────

function parseDurationSeconds(est: string | undefined): number | null {
  if (!est) return null;
  // Handle "3s", "3-5s", "5-8s", "8-15s"
  const match = est.match(/(\d+)(?:\s*-\s*(\d+))?\s*s/i);
  if (!match) return null;
  const low = parseInt(match[1], 10);
  const high = match[2] ? parseInt(match[2], 10) : low;
  return (low + high) / 2;
}

function formatTotalDuration(frames: StoryboardFrame[]): string {
  let totalLow = 0;
  let totalHigh = 0;
  for (const f of frames) {
    const est = f.content.durationEstimate;
    if (!est) continue;
    const match = est.match(/(\d+)(?:\s*-\s*(\d+))?\s*s/i);
    if (!match) continue;
    totalLow += parseInt(match[1], 10);
    totalHigh += match[2] ? parseInt(match[2], 10) : parseInt(match[1], 10);
  }
  if (totalLow === 0) return 'Unknown';
  if (totalLow === totalHigh) return `${totalLow}s`;
  return `${totalLow}-${totalHigh}s`;
}

// ─── Generate brief ──────────────────────────────────────────────────────────

export function generateProductionBrief(storyboard: Storyboard): ProductionBrief {
  const summary = { ready: 0, partial: 0, draft: 0, blocked: 0 };

  const shots: ProductionBriefShot[] = storyboard.frames.map((frame, i) => {
    const content = frame.content;
    const status = getCinematicBeatStatus(frame);
    summary[status.level]++;

    const cameraParts: string[] = [];
    if (content.cameraAngle) cameraParts.push(content.cameraAngle);
    if (content.cameraMovement) cameraParts.push(content.cameraMovement);

    return {
      frameId: frame.id,
      shotNumber: i + 1,
      title: frame.title,
      type: frame.type,
      intent: content.intent ?? null,
      visualDescription: content.visualDescription ?? null,
      camera: cameraParts.length > 0 ? cameraParts.join(' · ') : null,
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
  });

  return {
    title: storyboard.title,
    description: storyboard.description ?? '',
    totalShots: shots.length,
    totalDuration: formatTotalDuration(storyboard.frames),
    shots,
    readySummary: summary,
  };
}

// ─── Markdown export ──────────────────────────────────────────────────────────

export function generateProductionMarkdown(brief: ProductionBrief): string {
  const lines: string[] = [];

  lines.push(`# ${brief.title} — Production Brief`);
  lines.push('');
  if (brief.description) {
    lines.push(brief.description);
    lines.push('');
  }
  lines.push(`**Total shots:** ${brief.totalShots}  `);
  lines.push(`**Estimated duration:** ${brief.totalDuration}  `);
  lines.push(`**Readiness:** ${brief.readySummary.ready} ready · ${brief.readySummary.partial} partial · ${brief.readySummary.draft} draft · ${brief.readySummary.blocked} blocked`);
  lines.push('');
  lines.push('---');
  lines.push('');

  for (const shot of brief.shots) {
    lines.push(`## Shot ${shot.shotNumber}: ${shot.title}`);
    lines.push('');
    lines.push(`**Type:** ${shot.type} · **Status:** ${shot.status}${shot.duration ? ` · **Duration:** ${shot.duration}` : ''}`);
    lines.push('');

    if (shot.intent) {
      lines.push(`**Intent:** ${shot.intent}`);
      lines.push('');
    }

    if (shot.visualDescription) {
      lines.push(`**Visual:** ${shot.visualDescription}`);
      lines.push('');
    }

    if (shot.camera) {
      lines.push(`**Camera:** ${shot.camera}`);
      if (shot.framing) lines.push(`  **Framing:** ${shot.framing}`);
      lines.push('');
    }

    if (shot.dialogue.length > 0) {
      lines.push('**Dialogue:**');
      for (const d of shot.dialogue) lines.push(`- ${d}`);
      lines.push('');
    }

    if (shot.actionNotes.length > 0) {
      lines.push('**Action:**');
      for (const a of shot.actionNotes) lines.push(`- ${a}`);
      lines.push('');
    }

    if (shot.continuity.length > 0) {
      lines.push('**Continuity:**');
      for (const c of shot.continuity) lines.push(`- ${c}`);
      lines.push('');
    }

    if (shot.requiredAssets.length > 0) {
      lines.push('**Required assets:**');
      for (const a of shot.requiredAssets) lines.push(`- ${a}`);
      lines.push('');
    }

    if (shot.vfx.length > 0) {
      lines.push('**VFX:**');
      for (const v of shot.vfx) lines.push(`- ${v}`);
      lines.push('');
    }

    if (shot.audio.length > 0) {
      lines.push('**Audio:**');
      for (const a of shot.audio) lines.push(`- ${a}`);
      lines.push('');
    }

    if (shot.editNotes) {
      lines.push(`**Edit notes:** ${shot.editNotes}`);
      lines.push('');
    }

    if (shot.checklist.length > 0) {
      lines.push('**Checklist:**');
      for (const item of shot.checklist) lines.push(`- [ ] ${item}`);
      lines.push('');
    }

    if (shot.testCriteria.length > 0) {
      lines.push('**Test criteria:**');
      for (const t of shot.testCriteria) lines.push(`- [ ] ${t}`);
      lines.push('');
    }

    lines.push('---');
    lines.push('');
  }

  return lines.join('\n');
}
