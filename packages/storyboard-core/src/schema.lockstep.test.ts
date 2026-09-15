// Lockstep: published 2020-12 envelope vs validateStoryboard (no Ajv).
// Shape codes fail both. Graph invariants (duplicate ids, unknown refs,
// self-loops, duplicate edges) are the runtime seawall — JSON Schema 2020-12
// cannot express them without custom keywords.

import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, it, expect } from 'vitest';
import { validateStoryboard } from './validate';
import type { KnownStoryboardValidationCode } from './validate';
import type { AnyStoryboardFrame, Storyboard } from './schema';
import { DEFAULT_SCHEMA_VERSION, STORYBOARD_JSON_SCHEMA_ID } from './schema';

const here = dirname(fileURLToPath(import.meta.url));
const schemaPath = join(here, '..', 'schema', 'storyboard.schema.json');
const packageJsonPath = join(here, '..', 'package.json');

type JsonSchema =
  | boolean
  | {
      $ref?: string;
      $defs?: Record<string, JsonSchema>;
      type?: string;
      properties?: Record<string, JsonSchema>;
      required?: string[];
      additionalProperties?: boolean | JsonSchema;
      items?: JsonSchema;
      minLength?: number;
      minimum?: number;
      minItems?: number;
      const?: unknown;
      pattern?: string;
      description?: string;
      title?: string;
      $schema?: string;
      $id?: string;
    };

const schema = JSON.parse(readFileSync(schemaPath, 'utf8')) as JsonSchema;
const pkg = JSON.parse(readFileSync(packageJsonPath, 'utf8')) as {
  exports?: Record<string, unknown>;
  files?: string[];
  dependencies?: Record<string, string>;
  devDependencies?: Record<string, string>;
};

function resolveRef(root: JsonSchema, ref: string): JsonSchema {
  const prefix = '#/$defs/';
  if (typeof root === 'boolean' || !ref.startsWith(prefix) || !root.$defs) {
    throw new Error(`unsupported $ref: ${ref}`);
  }
  const name = ref.slice(prefix.length);
  const target = root.$defs[name];
  if (target === undefined) throw new Error(`unresolved $ref: ${ref}`);
  return target;
}

function schemaTypeOk(type: string, data: unknown): boolean {
  switch (type) {
    case 'object':
      return data !== null && typeof data === 'object' && !Array.isArray(data);
    case 'array':
      return Array.isArray(data);
    case 'string':
      return typeof data === 'string';
    case 'number':
      return typeof data === 'number' && Number.isFinite(data);
    case 'integer':
      return typeof data === 'number' && Number.isInteger(data);
    case 'boolean':
      return typeof data === 'boolean';
    case 'null':
      return data === null;
    default:
      return false;
  }
}

function conforms(node: JsonSchema, data: unknown, root: JsonSchema): boolean {
  if (node === true) return true;
  if (node === false) return false;
  if (node.$ref) return conforms(resolveRef(root, node.$ref), data, root);
  if (node.type !== undefined && !schemaTypeOk(node.type, data)) return false;
  if (Object.hasOwn(node, 'const') && !Object.is(node.const, data)) return false;
  if (typeof data === 'string') {
    if (node.minLength !== undefined && data.length < node.minLength) return false;
    if (node.pattern !== undefined && !new RegExp(node.pattern).test(data)) return false;
  }
  if (typeof data === 'number' && node.minimum !== undefined && data < node.minimum) {
    return false;
  }
  if (Array.isArray(data)) {
    if (node.minItems !== undefined && data.length < node.minItems) return false;
    if (node.items !== undefined && !data.every(item => conforms(node.items as JsonSchema, item, root))) {
      return false;
    }
  }
  if (data !== null && typeof data === 'object' && !Array.isArray(data)) {
    const obj = data as Record<string, unknown>;
    if (node.required) {
      for (const key of node.required) {
        if (!Object.hasOwn(obj, key) || obj[key] === undefined) return false;
      }
    }
    if (node.properties) {
      for (const [key, child] of Object.entries(node.properties)) {
        if (Object.hasOwn(obj, key) && obj[key] !== undefined) {
          if (!conforms(child, obj[key], root)) return false;
        }
      }
    }
    if (node.additionalProperties === false) {
      const allowed = new Set(Object.keys(node.properties ?? {}));
      for (const key of Object.keys(obj)) {
        if (obj[key] === undefined) continue;
        if (!allowed.has(key)) return false;
      }
    } else if (typeof node.additionalProperties === 'object' || node.additionalProperties === false) {
      // boolean true / omitted → extra keys allowed
    }
  }
  return true;
}

function schemaAccepts(data: unknown): boolean {
  return conforms(schema, data, schema);
}

function makeFrame(id: string): AnyStoryboardFrame {
  return {
    id,
    type: 'scene',
    title: `Frame ${id}`,
    summary: `Summary for ${id}`,
    position: { x: 0, y: 0 },
    size: { width: 200, height: 140 },
    content: {},
    annotations: [],
  };
}

function board(overrides: Record<string, unknown> = {}): Record<string, unknown> {
  return {
    id: 'sb',
    title: 'Lockstep',
    frames: [makeFrame('f1'), makeFrame('f2')],
    connections: [
      { id: 'c1', fromFrameId: 'f1', toFrameId: 'f2', type: 'sequence' },
    ],
    ...overrides,
  };
}

const KNOWN_CODES: KnownStoryboardValidationCode[] = [
  'INVALID_STORYBOARD_SHAPE',
  'EMPTY_STORYBOARD',
  'INVALID_SCHEMA_VERSION',
  'INVALID_FRAME_ID',
  'DUPLICATE_FRAME_ID',
  'MISSING_TITLE',
  'MISSING_TYPE',
  'MISSING_SUMMARY',
  'MISSING_FRAME_SIZE',
  'MISSING_FRAME_POSITION',
  'INVALID_FRAME_DIMENSION',
  'INVALID_FRAME_POSITION',
  'INVALID_CONNECTION_ID',
  'DUPLICATE_CONNECTION_ID',
  'SELF_LOOP_CONNECTION',
  'DUPLICATE_CONNECTION_EDGE',
  'BROKEN_CONNECTION_FROM',
  'BROKEN_CONNECTION_TO',
];

/** Graph-only codes: schema cannot express them; runtime seawall owns them. */
const RUNTIME_ONLY: ReadonlySet<KnownStoryboardValidationCode> = new Set([
  'DUPLICATE_FRAME_ID',
  'DUPLICATE_CONNECTION_ID',
  'SELF_LOOP_CONNECTION',
  'DUPLICATE_CONNECTION_EDGE',
]);

interface LockstepCase {
  code: KnownStoryboardValidationCode;
  data: unknown;
  /** When set, schema is expected to accept (graph invariant). */
  schemaOk?: boolean;
}

const CASES: LockstepCase[] = [
  { code: 'INVALID_STORYBOARD_SHAPE', data: null },
  {
    code: 'INVALID_STORYBOARD_SHAPE',
    data: { id: 'sb', title: 'Broken', connections: [] },
  },
  {
    code: 'EMPTY_STORYBOARD',
    data: board({ frames: [], connections: [] }),
  },
  {
    code: 'INVALID_SCHEMA_VERSION',
    data: board({ schemaVersion: 0 }),
  },
  {
    code: 'INVALID_FRAME_ID',
    data: board({ frames: [{ ...makeFrame('f1'), id: '' }, makeFrame('f2')] }),
  },
  {
    code: 'DUPLICATE_FRAME_ID',
    data: board({ frames: [makeFrame('f1'), makeFrame('f1')], connections: [] }),
    schemaOk: true,
  },
  {
    code: 'MISSING_TITLE',
    data: board({ frames: [{ ...makeFrame('f1'), title: '   ' }, makeFrame('f2')] }),
  },
  {
    code: 'MISSING_TYPE',
    data: board({ frames: [{ ...makeFrame('f1'), type: '   ' }, makeFrame('f2')] }),
  },
  {
    code: 'MISSING_SUMMARY',
    data: board({ frames: [{ ...makeFrame('f1'), summary: '' }, makeFrame('f2')] }),
  },
  {
    code: 'MISSING_FRAME_SIZE',
    data: board({
      frames: [{ ...makeFrame('f1'), size: undefined }, makeFrame('f2')],
    }),
  },
  {
    code: 'MISSING_FRAME_POSITION',
    data: board({
      frames: [{ ...makeFrame('f1'), position: undefined }, makeFrame('f2')],
    }),
  },
  {
    code: 'INVALID_FRAME_DIMENSION',
    data: board({
      frames: [{ ...makeFrame('f1'), size: { width: 10, height: 200 } }, makeFrame('f2')],
    }),
  },
  {
    code: 'INVALID_FRAME_POSITION',
    data: board({
      frames: [{ ...makeFrame('f1'), position: { x: Number.NaN, y: 0 } }, makeFrame('f2')],
    }),
  },
  {
    code: 'INVALID_CONNECTION_ID',
    data: board({
      connections: [{ id: '', fromFrameId: 'f1', toFrameId: 'f2', type: 'sequence' }],
    }),
  },
  {
    code: 'DUPLICATE_CONNECTION_ID',
    data: board({
      frames: [makeFrame('f1'), makeFrame('f2'), makeFrame('f3')],
      connections: [
        { id: 'c1', fromFrameId: 'f1', toFrameId: 'f2', type: 'sequence' },
        { id: 'c1', fromFrameId: 'f2', toFrameId: 'f3', type: 'sequence' },
      ],
    }),
    schemaOk: true,
  },
  {
    code: 'SELF_LOOP_CONNECTION',
    data: board({
      frames: [makeFrame('f1')],
      connections: [{ id: 'c1', fromFrameId: 'f1', toFrameId: 'f1', type: 'sequence' }],
    }),
    schemaOk: true,
  },
  {
    code: 'DUPLICATE_CONNECTION_EDGE',
    data: board({
      connections: [
        { id: 'c1', fromFrameId: 'f1', toFrameId: 'f2', type: 'sequence' },
        { id: 'c2', fromFrameId: 'f1', toFrameId: 'f2', type: 'choice' },
      ],
    }),
    schemaOk: true,
  },
  {
    code: 'BROKEN_CONNECTION_FROM',
    data: board({
      connections: [{ id: 'c1', fromFrameId: 42, toFrameId: 'f2', type: 'sequence' }],
    }),
  },
  {
    code: 'BROKEN_CONNECTION_TO',
    data: board({
      connections: [{ id: 'c1', fromFrameId: 'f1', toFrameId: 'ghost', type: 'sequence' }],
    }),
    schemaOk: true,
  },
];

describe('published storyboard JSON Schema', () => {
  it('is JSON Schema 2020-12 with a closed envelope', () => {
    expect(schema).toMatchObject({
      $schema: 'https://json-schema.org/draft/2020-12/schema',
      $id: STORYBOARD_JSON_SCHEMA_ID,
      additionalProperties: false,
      required: ['id', 'title', 'frames', 'connections'],
    });
    const text = readFileSync(schemaPath, 'utf8');
    expect(text).not.toMatch(/entryConditions|stateChanges|cameraMovement|requiredAssets|quest|campaign/i);
  });

  it('schemaVersion const/minimum is 1', () => {
    const props = typeof schema === 'object' && schema && 'properties' in schema
      ? schema.properties
      : undefined;
    const version = props?.schemaVersion as { const?: unknown; minimum?: unknown; type?: string };
    expect(version?.type).toBe('integer');
    expect(version?.const).toBe(DEFAULT_SCHEMA_VERSION);
    expect(version?.minimum).toBe(DEFAULT_SCHEMA_VERSION);
  });

  it('is exported as ./schema/storyboard.json and included in files', () => {
    expect(pkg.exports?.['./schema/storyboard.json']).toBe('./schema/storyboard.schema.json');
    expect(pkg.files).toContain('schema');
  });

  it('does not add Ajv (or any runtime dep) to @storyboard-os/core', () => {
    expect(pkg.dependencies ?? {}).toEqual({});
    expect(pkg.devDependencies).not.toHaveProperty('ajv');
    expect(pkg.devDependencies).not.toHaveProperty('ajv-formats');
  });
});

describe('schema ↔ validateStoryboard lockstep', () => {
  it('covers every KnownStoryboardValidationCode', () => {
    const covered = new Set(CASES.map(c => c.code));
    expect([...KNOWN_CODES].sort()).toEqual([...covered].sort());
  });

  it('accepts a gold envelope with and without schemaVersion', () => {
    const gold = board();
    expect(schemaAccepts(gold)).toBe(true);
    expect(validateStoryboard(gold as Storyboard).valid).toBe(true);
    const stamped = board({ schemaVersion: 1, $schema: STORYBOARD_JSON_SCHEMA_ID });
    expect(schemaAccepts(stamped)).toBe(true);
    expect(validateStoryboard(stamped as Storyboard).valid).toBe(true);
  });

  it('rejects extra envelope keys (additionalProperties: false)', () => {
    const extra = board({ questId: 'nope' });
    expect(schemaAccepts(extra)).toBe(false);
  });

  for (const fixture of CASES) {
    const mode = fixture.schemaOk ? 'runtime-only' : 'shape';
    it(`${fixture.code} (${mode})`, () => {
      const runtime = validateStoryboard(fixture.data as Storyboard);
      expect(runtime.valid).toBe(false);
      expect(runtime.errors.some(e => e.code === fixture.code)).toBe(true);

      const accepted = schemaAccepts(fixture.data);
      if (fixture.schemaOk) {
        expect(RUNTIME_ONLY.has(fixture.code) || fixture.code === 'BROKEN_CONNECTION_TO').toBe(true);
        expect(accepted).toBe(true);
      } else {
        expect(accepted).toBe(false);
      }
    });
  }
});
