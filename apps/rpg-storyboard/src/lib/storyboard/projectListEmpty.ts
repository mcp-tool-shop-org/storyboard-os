// Empty-list copy for the Projects page.
// First-run and STORE_UNREADABLE / STORE_CORRUPT must not share CTA wording —
// corrupt roots refuse writes, so "Browse Templates" is a dead end.

import type { ReadWarning } from './projectStorage';

export type ProjectsEmptyKind = 'first-run' | 'corrupt-store';

export interface ProjectsEmptyCopy {
  kind: ProjectsEmptyKind;
  title: string;
  body: string;
  /** When true, hide / disable create + template CTAs. */
  createDisabled: boolean;
  /** Offer raw localStorage download before clear (corrupt only). */
  offerRawDownload: boolean;
}

const FIRST_RUN: ProjectsEmptyCopy = {
  kind: 'first-run',
  title: 'No projects yet',
  body:
    'Create a project from one of the three RPG templates to get started. ' +
    'Projects are saved in this browser.',
  createDisabled: false,
  offerRawDownload: false,
};

export const CORRUPT_STORE: ProjectsEmptyCopy = {
  kind: 'corrupt-store',
  title: 'Saved projects storage is corrupt',
  body:
    'This is not a first-run empty list — the browser storage entry could not be read, ' +
    'and creating a project will fail until it is repaired. ' +
    'Download the raw storage blob below if you want a backup, then clear site data ' +
    'for this origin (or remove `rpg-sb:projects` under DevTools → Application → Local Storage) ' +
    'and reload.',
  createDisabled: true,
  offerRawDownload: true,
};

/**
 * Decide which empty-state copy to show. Returns null when the list is non-empty
 * (cards render instead). STORE_UNREADABLE and write-path STORE_CORRUPT both
 * force corrupt recovery — never the first-run Browse Templates CTA.
 */
export function resolveProjectsEmptyCopy(input: {
  projectCount: number;
  readWarningCode?: ReadWarning['code'] | null;
  storeCorruptWrite?: boolean;
}): ProjectsEmptyCopy | null {
  if (input.projectCount > 0) return null;
  if (input.readWarningCode === 'STORE_UNREADABLE' || input.storeCorruptWrite) {
    return CORRUPT_STORE;
  }
  return FIRST_RUN;
}
