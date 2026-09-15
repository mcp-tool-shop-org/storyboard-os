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
  updateFrameAnnotations,
  setChecklistItemComplete,
  setTestCriterionComplete,
  getFrameProgress,
  getProjectProgress,
  addFrame,
  removeFrame,
  addConnection,
  updateConnection,
  removeConnection,
  RPG_FRAME_TYPES,
  RPG_CONNECTION_TYPES,
} from '@storyboard-os/rpg-domain';
export type {
  RpgStoryboardProject,
  CreateProjectInput,
  FramePosition,
  FrameBasicsPatch,
  FrameProgress,
  ProjectProgress,
  ProjectProgressSummary,
  TopologyFailReason,
  TopologyOk,
  TopologyFail,
  TopologyResult,
  AddFrameInput,
  AddConnectionInput,
  ConnectionPatch,
} from '@storyboard-os/rpg-domain';
