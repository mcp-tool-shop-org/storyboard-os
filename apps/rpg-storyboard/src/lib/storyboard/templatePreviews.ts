// ─── templatePreviews.ts ──────────────────────────────────────────────────────
//
// Shared helper that generates the three RPG template preview storyboards.
//
// Template truth lives in @storyboard-os/rpg-domain. This module gives the
// app a single, stable place to:
//   - Map template IDs to preview storyboard IDs (used in URLs)
//   - Generate the actual storyboard objects for static path expansion
//
// All Astro pages that need template previews import from here so the IDs
// stay consistent across the board, frame, and handoff pages.
//
// ─────────────────────────────────────────────────────────────────────────────

import {
  STORYBOARD_TEMPLATES,
  createStoryboardFromTemplate,
  tollhouseLedgerProject,
} from '@storyboard-os/rpg-domain';
import type { Storyboard, StoryboardTemplateId } from './schema';

// ─── ID mapping ───────────────────────────────────────────────────────────────

/** Convert a template id (quest_flow) to a preview storyboard id (template-quest-flow). */
function previewId(templateId: string): string {
  return `template-${templateId.replace(/_/g, '-')}`;
}

// ─── Metadata ─────────────────────────────────────────────────────────────────

export interface TemplatePreviewMeta {
  templateId: StoryboardTemplateId;
  storyboardId: string;
  name: string;
  description: string;
  frameCount: number;
  bestFor: string;
}

/**
 * Metadata for the three RPG templates — used to render gallery cards without
 * generating full storyboard objects.
 */
export const TEMPLATE_PREVIEW_META: TemplatePreviewMeta[] = STORYBOARD_TEMPLATES.map(t => ({
  templateId:  t.id as StoryboardTemplateId,
  storyboardId: previewId(t.id),
  name:         t.name,
  description:  t.description,
  frameCount:   t.frameCount,
  bestFor:      t.bestFor,
}));

/** SSG getStaticPaths ids: demo sequences + template preview boards. */
const SSG_PREVIEW_IDS = new Set<string>([
  ...tollhouseLedgerProject.storyboards.map(s => s.id),
  ...TEMPLATE_PREVIEW_META.map(m => m.storyboardId),
]);

/**
 * True when `/storyboards/{id}/frames/{frameId}` is a built SSG page.
 * Project boards use `sb-{projectId}`, which is never in that set.
 */
export function isSsgPreviewStoryboardId(storyboardId: string): boolean {
  return SSG_PREVIEW_IDS.has(storyboardId);
}

// ─── Storyboard generator ─────────────────────────────────────────────────────

/**
 * Generate one preview Storyboard for every RPG template.
 *
 * Called at build time by Astro getStaticPaths() so template previews are
 * reachable via the existing board, frame, and handoff routes.
 *
 * Each generated storyboard is a fully-specced implementation template —
 * entry conditions, state changes, assets, checklists, and test criteria
 * are already populated on every frame.
 */
export function getTemplatePreviewStoryboards(): Storyboard[] {
  return TEMPLATE_PREVIEW_META.map(meta =>
    createStoryboardFromTemplate(meta.templateId, {
      id:          meta.storyboardId,
      title:       `${meta.name} — Template`,
      description: meta.description,
    }) as Storyboard,
  );
}
