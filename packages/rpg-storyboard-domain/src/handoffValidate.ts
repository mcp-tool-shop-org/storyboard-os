// ─── rpg-domain / handoffValidate.ts ─────────────────────────────────────────
//
// Bounded JSON Schema 2020-12 validator for QuestHandoff / ProjectHandoff.
//
// Validates against the published schema files (not TypeScript interfaces).
// Keywords used: $id, $ref, $defs, type, properties, required,
// additionalProperties, items, minLength, minimum, maximum, enum, const, format.
// No Ajv — kept out of this package and out of @storyboard-os/core.
//
// Envelope/shape errors fail closed. Empty-string C4 array items are
// field-level content issues and do not fail the envelope.
//
// ─────────────────────────────────────────────────────────────────────────────

import questHandoffSchema from '../schema/quest-handoff.json';
import projectHandoffSchema from '../schema/project-handoff.json';

/** Canonical $id / instance `$schema` for QuestHandoff. */
export const QUEST_HANDOFF_SCHEMA_ID =
  'https://storyboard-os.dev/schemas/rpg/quest-handoff.json';

/** Canonical $id / instance `$schema` for ProjectHandoff. */
export const PROJECT_HANDOFF_SCHEMA_ID =
  'https://storyboard-os.dev/schemas/rpg/project-handoff.json';

/** C4 beat arrays named in the portable handoff contract. */
const C4_BEAT_ARRAYS = [
  'entryConditions',
  'stateChanges',
  'requiredAssets',
  'testCriteria',
  'implementationChecklist',
] as const;

export type HandoffIssueSeverity = 'envelope' | 'content';

export interface HandoffValidationIssue {
  /** JSON Pointer from the artifact root. */
  path: string;
  code: string;
  message: string;
  severity: HandoffIssueSeverity;
}

export interface HandoffValidationResult {
  /** False when any envelope/shape issue is present. Content issues do not flip this. */
  valid: boolean;
  issues: HandoffValidationIssue[];
}

export class HandoffEnvelopeError extends Error {
  readonly issues: HandoffValidationIssue[];

  constructor(kind: 'quest' | 'project', result: HandoffValidationResult) {
    const envelope = result.issues.filter(i => i.severity === 'envelope');
    super(
      `${kind} handoff failed schema envelope: ${
        envelope.map(i => `${i.path} ${i.message}`).join('; ') || 'invalid'
      }`,
    );
    this.name = 'HandoffEnvelopeError';
    this.issues = envelope;
  }
}

// ─── JSON Schema 2020-12 subset ───────────────────────────────────────────────

interface JsonSchema {
  $id?: string;
  $ref?: string;
  $defs?: Record<string, JsonSchema>;
  type?: string | string[];
  properties?: Record<string, JsonSchema>;
  required?: string[];
  additionalProperties?: boolean | JsonSchema;
  items?: JsonSchema;
  minItems?: number;
  minLength?: number;
  minimum?: number;
  maximum?: number;
  enum?: unknown[];
  const?: unknown;
  format?: string;
  description?: string;
  title?: string;
}

function jsonType(value: unknown): string {
  if (value === null) return 'null';
  if (Array.isArray(value)) return 'array';
  return typeof value;
}

function isInteger(value: unknown): boolean {
  return typeof value === 'number' && Number.isInteger(value);
}

function jsonEqual(a: unknown, b: unknown): boolean {
  return JSON.stringify(a) === JSON.stringify(b);
}

function pointer(parent: string, key: string | number): string {
  const token = String(key).replace(/~/g, '~0').replace(/\//g, '~1');
  return parent === '' ? `/${token}` : `${parent}/${token}`;
}

function resolveRef(root: JsonSchema, ref: string): JsonSchema {
  if (!ref.startsWith('#/$defs/')) {
    throw new Error(`Unsupported $ref "${ref}" — only #/$defs/* is implemented`);
  }
  const name = ref.slice('#/$defs/'.length);
  const def = root.$defs?.[name];
  if (!def) {
    throw new Error(`Unresolved $ref "${ref}"`);
  }
  return def;
}

function matchesType(value: unknown, type: string): boolean {
  switch (type) {
    case 'object':
      return jsonType(value) === 'object';
    case 'array':
      return jsonType(value) === 'array';
    case 'string':
      return typeof value === 'string';
    case 'number':
      return typeof value === 'number' && Number.isFinite(value);
    case 'integer':
      return isInteger(value);
    case 'boolean':
      return typeof value === 'boolean';
    case 'null':
      return value === null;
    default:
      return false;
  }
}

const ISO_DATE_TIME =
  /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d+)?(?:Z|[+-]\d{2}:\d{2})$/;

function evaluate(
  schema: JsonSchema,
  value: unknown,
  path: string,
  root: JsonSchema,
  issues: HandoffValidationIssue[],
): void {
  if (schema.$ref) {
    evaluate(resolveRef(root, schema.$ref), value, path, root, issues);
    return;
  }

  if (schema.type) {
    const types = Array.isArray(schema.type) ? schema.type : [schema.type];
    if (!types.some(t => matchesType(value, t))) {
      issues.push({
        path: path || '/',
        code: 'TYPE',
        message: `expected type ${types.join('|')}, got ${jsonType(value)}`,
        severity: 'envelope',
      });
      return;
    }
  }

  if (Object.prototype.hasOwnProperty.call(schema, 'const')) {
    if (!jsonEqual(value, schema.const)) {
      issues.push({
        path: path || '/',
        code: 'CONST',
        message: `expected ${JSON.stringify(schema.const)}`,
        severity: 'envelope',
      });
    }
  }

  if (schema.enum) {
    if (!schema.enum.some(option => jsonEqual(option, value))) {
      issues.push({
        path: path || '/',
        code: 'ENUM',
        message: `value is not one of the allowed enum members`,
        severity: 'envelope',
      });
    }
  }

  if (typeof value === 'string') {
    if (schema.minLength !== undefined && value.length < schema.minLength) {
      issues.push({
        path: path || '/',
        code: 'MIN_LENGTH',
        message: `string shorter than minLength ${schema.minLength}`,
        severity: 'envelope',
      });
    }
    if (schema.format === 'date-time' && !ISO_DATE_TIME.test(value)) {
      issues.push({
        path: path || '/',
        code: 'FORMAT',
        message: 'expected ISO-8601 date-time',
        severity: 'envelope',
      });
    }
  }

  if (typeof value === 'number') {
    if (schema.minimum !== undefined && value < schema.minimum) {
      issues.push({
        path: path || '/',
        code: 'MINIMUM',
        message: `value ${value} is below minimum ${schema.minimum}`,
        severity: 'envelope',
      });
    }
    if (schema.maximum !== undefined && value > schema.maximum) {
      issues.push({
        path: path || '/',
        code: 'MAXIMUM',
        message: `value ${value} is above maximum ${schema.maximum}`,
        severity: 'envelope',
      });
    }
  }

  if (Array.isArray(value)) {
    if (schema.minItems !== undefined && value.length < schema.minItems) {
      issues.push({
        path: path || '/',
        code: 'MIN_ITEMS',
        message: `array shorter than minItems ${schema.minItems}`,
        severity: 'envelope',
      });
    }
    if (schema.items) {
      value.forEach((item, index) => {
        evaluate(schema.items!, item, pointer(path, index), root, issues);
      });
    }
  }

  if (jsonType(value) === 'object') {
    const obj = value as Record<string, unknown>;
    for (const key of schema.required ?? []) {
      if (!Object.prototype.hasOwnProperty.call(obj, key)) {
        issues.push({
          path: pointer(path, key),
          code: 'REQUIRED',
          message: `missing required property "${key}"`,
          severity: 'envelope',
        });
      }
    }

    const properties = schema.properties ?? {};
    for (const key of Object.keys(obj)) {
      if (properties[key]) {
        evaluate(properties[key], obj[key], pointer(path, key), root, issues);
        continue;
      }
      if (schema.additionalProperties === false) {
        issues.push({
          path: pointer(path, key),
          code: 'ADDITIONAL',
          message: `additional property "${key}" is not allowed`,
          severity: 'envelope',
        });
      } else if (schema.additionalProperties && typeof schema.additionalProperties === 'object') {
        evaluate(schema.additionalProperties, obj[key], pointer(path, key), root, issues);
      }
    }
  }
}

function contentIssues(data: unknown): HandoffValidationIssue[] {
  if (jsonType(data) !== 'object') return [];
  const beats = (data as { beats?: unknown }).beats;
  if (!Array.isArray(beats)) return [];

  const issues: HandoffValidationIssue[] = [];
  beats.forEach((beat, index) => {
    if (jsonType(beat) !== 'object') return;
    const record = beat as Record<string, unknown>;
    for (const field of C4_BEAT_ARRAYS) {
      const arr = record[field];
      if (!Array.isArray(arr)) continue;
      arr.forEach((item, itemIndex) => {
        if (typeof item === 'string' && item.trim() === '') {
          issues.push({
            path: pointer(pointer(pointer('/beats', index), field), itemIndex),
            code: 'EMPTY_C4_ITEM',
            message: `${field} item is empty`,
            severity: 'content',
          });
        }
      });
    }
  });
  return issues;
}

function toJsonValue(input: unknown): unknown {
  if (input === undefined) return undefined;
  return JSON.parse(JSON.stringify(input));
}

function validateAgainst(
  schema: JsonSchema,
  input: unknown,
): HandoffValidationResult {
  const issues: HandoffValidationIssue[] = [];
  let data: unknown;
  try {
    data = toJsonValue(input);
  } catch {
    return {
      valid: false,
      issues: [{
        path: '/',
        code: 'NOT_JSON',
        message: 'value is not JSON-serializable',
        severity: 'envelope',
      }],
    };
  }

  evaluate(schema, data, '', schema, issues);
  issues.push(...contentIssues(data));
  return {
    valid: issues.every(i => i.severity !== 'envelope'),
    issues,
  };
}

function assertEnvelope(kind: 'quest' | 'project', result: HandoffValidationResult): void {
  if (!result.valid) {
    throw new HandoffEnvelopeError(kind, result);
  }
}

/** Validate a QuestHandoff (or untrusted JSON) against the published 2020-12 schema. */
export function validateHandoff(input: unknown): HandoffValidationResult {
  return validateAgainst(questHandoffSchema as JsonSchema, input);
}

/** Validate a ProjectHandoff (or untrusted JSON) against the published 2020-12 schema. */
export function validateProjectHandoff(input: unknown): HandoffValidationResult {
  return validateAgainst(projectHandoffSchema as JsonSchema, input);
}

/** Fail closed: throw HandoffEnvelopeError when the quest envelope is invalid. */
export function assertValidHandoff(input: unknown): HandoffValidationResult {
  const result = validateHandoff(input);
  assertEnvelope('quest', result);
  return result;
}

/** Fail closed: throw HandoffEnvelopeError when the project envelope is invalid. */
export function assertValidProjectHandoff(input: unknown): HandoffValidationResult {
  const result = validateProjectHandoff(input);
  assertEnvelope('project', result);
  return result;
}

/**
 * Schema-validated JSON serialization for the SSG / download path.
 * Throws HandoffEnvelopeError instead of emitting structurally invalid JSON.
 */
export function serializeHandoffJson(input: unknown): string {
  assertValidHandoff(input);
  return JSON.stringify(toJsonValue(input), null, 2);
}

/**
 * Schema-validated JSON serialization for the project handoff download path.
 * Throws HandoffEnvelopeError instead of emitting structurally invalid JSON.
 */
export function serializeProjectHandoffJson(input: unknown): string {
  assertValidProjectHandoff(input);
  return JSON.stringify(toJsonValue(input), null, 2);
}

export const questHandoffSchemaDocument = questHandoffSchema;
export const projectHandoffSchemaDocument = projectHandoffSchema;
