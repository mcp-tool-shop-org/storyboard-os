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

export interface StoryboardConnection<TConnectionType extends string = StoryboardConnectionType> {
  id: string;
  fromFrameId: string;
  toFrameId: string;
  type: TConnectionType;
  label?: string;
}

// Convenience alias for unspecialized connection use (e.g. in the validator).
export type AnyStoryboardConnection = StoryboardConnection<string>;

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
  /**
   * Optional parent for one nest level. Collapse hides children of ids in
   * `Storyboard.collapsedIds`; this field is topology, not a collapsed flag.
   */
  parentFrameId?: string;
}

// Convenience alias for unspecialized use (e.g. in the validator).
export type AnyStoryboardFrame = StoryboardFrame<string, unknown, string>;

// ─── Storyboard ───────────────────────────────────────────────────────────────

/** Current envelope generation. Absent `schemaVersion` is treated as this value. */
export const DEFAULT_SCHEMA_VERSION = 1;

/**
 * Published JSON Schema export path (`package.json` `./schema/storyboard.json`).
 * Stamp on C4 handoff instances as `$schema` when writing portable JSON.
 */
export const STORYBOARD_JSON_SCHEMA_ID =
  'https://unpkg.com/@storyboard-os/core/schema/storyboard.json';

export interface Storyboard<
  TFrame extends AnyStoryboardFrame = AnyStoryboardFrame,
  TConnection extends AnyStoryboardConnection = StoryboardConnection,
> {
  id: string;
  title: string;
  description?: string;
  /** Set by template creation; domain defines its own template ID type. */
  templateId?: string;
  /**
   * Envelope generation. Additive; omit for version 1 (existing fixtures).
   * The published JSON Schema `const`/`minimum` is 1.
   */
  schemaVersion?: number;
  /** Optional instance pointer at the published core envelope schema. */
  $schema?: string;
  frames: TFrame[];
  connections: TConnection[];
  /**
   * Author-owned collapsed parent ids (serialized Set). Collapse does not
   * mutate frame records. Absent / empty = all expanded (nothing auto-collapses).
   */
  collapsedIds?: string[];
  canvasWidth?: number;
  canvasHeight?: number;
}

// ─── Project ──────────────────────────────────────────────────────────────────
// Shallow container. Not a domain database.

export interface StoryboardProject<
  TStoryboard extends Storyboard<AnyStoryboardFrame, AnyStoryboardConnection> = Storyboard,
> {
  id: string;
  title: string;
  description?: string;
  /**
   * Envelope generation. Additive; omit for version 1 (existing fixtures).
   * Not a domain formatVersion (ProductionBrief.formatVersion stays cinematic).
   */
  schemaVersion?: number;
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
  TStoryboard extends Storyboard<AnyStoryboardFrame, AnyStoryboardConnection> = Storyboard,
> {
  id: TId;
  name: string;
  description: string;
  frameCount: number;
  bestFor: string;
  createStoryboard: (input: CreateStoryboardInput) => TStoryboard;
}
