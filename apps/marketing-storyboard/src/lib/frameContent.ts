// ─── marketing-storyboard / lib/frameContent.ts ───────────────────────────────
//
// Null/missing content normalization for inspector field access (DM-002).
// Kept outside the React component so unit tests do not need Konva/JSX.
// ─────────────────────────────────────────────────────────────────────────────

import type { MarketingFrameContent, StoryboardFrame } from '@storyboard-os/marketing-domain';

export function resolveInspectorContent(frame: StoryboardFrame): MarketingFrameContent {
    return (frame.content ?? {}) as MarketingFrameContent;
}
