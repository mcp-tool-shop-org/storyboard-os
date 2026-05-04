// ─── rpg-storyboard-domain / demo-project.ts ─────────────────────────────────
//
// The Tollhouse Ledger — canonical demo project for the RPG storyboard vertical.
// A short quest sequence: three factions want the same hidden ledger.
// The player decides who wins.
//
// Exported as a typed StoryboardProject for use by the app and tests.
//
// ─────────────────────────────────────────────────────────────────────────────

import type { StoryboardProject } from './schema';
import rawProject from './demo-project.json';

export const tollhouseLedgerProject = rawProject as unknown as StoryboardProject;
