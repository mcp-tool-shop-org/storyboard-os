// ─── rpg-storyboard / routes.ts ──────────────────────────────────────────────
//
// Thin adapter. Instantiates @storyboard-os/routing with the RPG app's
// storyboard base path and re-exports the helpers under the same names
// as before — no downstream page changes needed.
//
// ─────────────────────────────────────────────────────────────────────────────

import { createStoryboardRoutes } from '@storyboard-os/routing';

const routes = createStoryboardRoutes({ storyboardBasePath: '/storyboards' });

export const boardRoute = routes.boardRoute.bind(routes);
export const frameRoute = routes.frameRoute.bind(routes);
export const projectRoute = routes.projectRoute.bind(routes);
