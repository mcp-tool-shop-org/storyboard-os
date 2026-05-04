// ─── storyboard-core / schema.ts ──────────────────────────────────────────────
//
// Generic storyboard primitives. No domain-specific vocabulary.
// Domain packages specialize these types with their own frame types,
// content shapes, and annotation types.
//
// ─────────────────────────────────────────────────────────────────────────────

// ─── Annotation ───────────────────────────────────────────────────────────────

export interface FrameAnnotation<TAnnotationType extends string = string> {
  id: string;
  type: TAnnotationType;
  text: string;
}

// ─── Connection ───────────────────────────────────────────────────────────────
// First-class entity — not buried in frame.links.
// Type drives visual rendering: dashed for optional, bold for consequence, etc.

export type StoryboardConnectionType =
  | 'sequence'
  | 'choice'
  | 'consequence'
  | 'optional'
  | 'fallback';

export interface StoryboardConnection {
  id: string;
  fromFrameId: string;
  toFrameId: string;
  type: StoryboardConnectionType;
  label?: string;
}

// ─── Frame ────────────────────────────────────────────────────────────────────
// One narrative beat. Generic over frame type, content shape, and annotation type.
// Domains provide concrete TFrameType and TContent through type aliases.

export interface StoryboardFrame<
  TFrameType extends string = string,
  TContent = unknown,
  TAnnotationType extends string = string,
> {
  id: string;
  type: TFrameType;
  title: string;
  summary: string;
  position: { x: number; y: number };
  size: { width: number; height: number };
  content: TContent;
  annotations: FrameAnnotation<TAnnotationType>[];
}

// Convenience alias for unspecialized use (e.g. in the validator).
export type AnyStoryboardFrame = StoryboardFrame<string, unknown, string>;

// ─── Storyboard ───────────────────────────────────────────────────────────────

export interface Storyboard<TFrame extends AnyStoryboardFrame = AnyStoryboardFrame> {
  id: string;
  title: string;
  description?: string;
  /** Set by template creation; domain defines its own template ID type. */
  templateId?: string;
  frames: TFrame[];
  connections: StoryboardConnection[];
  canvasWidth?: number;
  canvasHeight?: number;
}

// ─── Project ──────────────────────────────────────────────────────────────────
// Shallow container. Not a domain database.

export interface StoryboardProject<
  TStoryboard extends Storyboard<AnyStoryboardFrame> = Storyboard,
> {
  id: string;
  title: string;
  description?: string;
  storyboards: TStoryboard[];
}

// ─── Template ─────────────────────────────────────────────────────────────────

export interface CreateStoryboardInput {
  id: string;
  title: string;
  description?: string;
}

export interface StoryboardTemplateDefinition<
  TId extends string = string,
  TStoryboard extends Storyboard<AnyStoryboardFrame> = Storyboard,
> {
  id: TId;
  name: string;
  description: string;
  frameCount: number;
  bestFor: string;
  createStoryboard: (input: CreateStoryboardInput) => TStoryboard;
}
