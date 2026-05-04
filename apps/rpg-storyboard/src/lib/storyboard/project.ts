// ─── lib/storyboard/project.ts ───────────────────────────────────────────────
//
// Thin re-export. App code imports from this adapter rather than directly from
// @storyboard-os/rpg-domain, keeping internal imports stable as packages evolve.
// ─────────────────────────────────────────────────────────────────────────────

export {
  createProject,
  updateFramePosition,
  updateFrameBasics,
  updateFrameContent,
  setChecklistItemComplete,
  setTestCriterionComplete,
  getFrameProgress,
  getProjectProgress,
} from '@storyboard-os/rpg-domain';
export type {
  RpgStoryboardProject,
  CreateProjectInput,
  FramePosition,
  FrameBasicsPatch,
  FrameProgress,
  ProjectProgress,
  ProjectProgressSummary,
} from '@storyboard-os/rpg-domain';
