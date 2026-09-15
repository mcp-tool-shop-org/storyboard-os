// ─── JSON Schema 2020-12 subset evaluator ────────────────────────────────────
//
// Ajv is not a package dependency (lockfile is out of this domain's glob).
// This evaluator implements the keywords used by production-brief.schema.json
// and returns Ajv-shaped errors so validateProductionBrief() is a drop-in
// for an Ajv compile of that schema.

export interface JsonSchemaError {
  instancePath: string;
  schemaPath: string;
  keyword: string;
  message: string;
  params?: Record<string, unknown>;
}

export interface JsonSchemaValidationResult {
  valid: boolean;
  errors: JsonSchemaError[];
}

type SchemaNode = Record<string, unknown>;

function isObject(value: unknown): value is Record<string, unknown> {
  return value !== null && typeof value === 'object' && !Array.isArray(value);
}

function joinInstance(path: string, key: string | number): string {
  return `${path}/${String(key).replace(/~/g, '~0').replace(/\//g, '~1')}`;
}

function joinSchema(path: string, key: string): string {
  return `${path}/${key.replace(/~/g, '~0').replace(/\//g, '~1')}`;
}

function resolveRef(root: SchemaNode, ref: string): SchemaNode {
  if (!ref.startsWith('#/')) {
    throw new Error(`Unsupported $ref (absolute refs are not in this schema): ${ref}`);
  }
  let current: unknown = root;
  for (const segment of ref.slice(2).split('/')) {
    const key = segment.replace(/~1/g, '/').replace(/~0/g, '~');
    if (!isObject(current) && !Array.isArray(current)) {
      throw new Error(`Unresolvable $ref: ${ref}`);
    }
    current = (current as Record<string, unknown>)[key];
  }
  if (!isObject(current)) {
    throw new Error(`$ref did not resolve to an object: ${ref}`);
  }
  return current;
}

function typeOf(value: unknown): string {
  if (value === null) return 'null';
  if (Array.isArray(value)) return 'array';
  return typeof value;
}

function matchesType(value: unknown, expected: string): boolean {
  if (expected === 'integer') {
    return typeof value === 'number' && Number.isInteger(value);
  }
  return typeOf(value) === expected;
}

function deepEqual(a: unknown, b: unknown): boolean {
  if (a === b) return true;
  if (typeof a !== typeof b) return false;
  if (a === null || b === null) return a === b;
  if (Array.isArray(a) && Array.isArray(b)) {
    if (a.length !== b.length) return false;
    return a.every((item, i) => deepEqual(item, b[i]));
  }
  if (isObject(a) && isObject(b)) {
    const keys = Object.keys(a);
    if (keys.length !== Object.keys(b).length) return false;
    return keys.every(key => deepEqual(a[key], b[key]));
  }
  return false;
}

function validateNode(
  instance: unknown,
  schema: SchemaNode,
  root: SchemaNode,
  instancePath: string,
  schemaPath: string,
  errors: JsonSchemaError[],
): void {
  if (typeof schema.$ref === 'string') {
    const ref = schema.$ref;
    validateNode(instance, resolveRef(root, ref), root, instancePath, ref, errors);
    return;
  }

  if (schema.type !== undefined) {
    const expected = Array.isArray(schema.type) ? schema.type : [schema.type];
    const types = expected.filter((t): t is string => typeof t === 'string');
    if (!types.some(t => matchesType(instance, t))) {
      errors.push({
        instancePath,
        schemaPath: joinSchema(schemaPath, 'type'),
        keyword: 'type',
        message: `must be ${types.join(' or ')}`,
        params: { type: types.length === 1 ? types[0] : types },
      });
      return;
    }
  }

  if (Object.prototype.hasOwnProperty.call(schema, 'const') && !deepEqual(instance, schema.const)) {
    errors.push({
      instancePath,
      schemaPath: joinSchema(schemaPath, 'const'),
      keyword: 'const',
      message: 'must be equal to constant',
      params: { allowedValue: schema.const },
    });
  }

  if (Array.isArray(schema.enum) && !schema.enum.some(allowed => deepEqual(instance, allowed))) {
    errors.push({
      instancePath,
      schemaPath: joinSchema(schemaPath, 'enum'),
      keyword: 'enum',
      message: 'must be equal to one of the allowed values',
      params: { allowedValues: schema.enum },
    });
  }

  if (typeof schema.minLength === 'number' && typeof instance === 'string' && instance.length < schema.minLength) {
    errors.push({
      instancePath,
      schemaPath: joinSchema(schemaPath, 'minLength'),
      keyword: 'minLength',
      message: `must NOT have fewer than ${schema.minLength} characters`,
      params: { limit: schema.minLength },
    });
  }

  if (typeof schema.minimum === 'number' && typeof instance === 'number' && instance < schema.minimum) {
    errors.push({
      instancePath,
      schemaPath: joinSchema(schemaPath, 'minimum'),
      keyword: 'minimum',
      message: `must be >= ${schema.minimum}`,
      params: { limit: schema.minimum },
    });
  }

  if (typeof schema.minItems === 'number' && Array.isArray(instance) && instance.length < schema.minItems) {
    errors.push({
      instancePath,
      schemaPath: joinSchema(schemaPath, 'minItems'),
      keyword: 'minItems',
      message: `must NOT have fewer than ${schema.minItems} items`,
      params: { limit: schema.minItems },
    });
  }

  if (Array.isArray(instance) && isObject(schema.items)) {
    instance.forEach((item, index) => {
      validateNode(
        item,
        schema.items as SchemaNode,
        root,
        joinInstance(instancePath, index),
        joinSchema(schemaPath, 'items'),
        errors,
      );
    });
  }

  const applyObjectKeywords =
    isObject(instance) &&
    (schema.type === 'object' ||
      isObject(schema.properties) ||
      Array.isArray(schema.required) ||
      schema.additionalProperties === false);
  if (applyObjectKeywords && isObject(instance)) {
    const required = Array.isArray(schema.required) ? schema.required.filter((k): k is string => typeof k === 'string') : [];
    for (const key of required) {
      if (!Object.prototype.hasOwnProperty.call(instance, key)) {
        errors.push({
          instancePath,
          schemaPath: joinSchema(schemaPath, 'required'),
          keyword: 'required',
          message: `must have required property '${key}'`,
          params: { missingProperty: key },
        });
      }
    }

    const properties = isObject(schema.properties) ? schema.properties : {};
    for (const [key, value] of Object.entries(instance)) {
      const propSchema = properties[key];
      if (isObject(propSchema)) {
        validateNode(
          value,
          propSchema,
          root,
          joinInstance(instancePath, key),
          joinSchema(joinSchema(schemaPath, 'properties'), key),
          errors,
        );
      } else if (schema.additionalProperties === false) {
        errors.push({
          instancePath: joinInstance(instancePath, key),
          schemaPath: joinSchema(schemaPath, 'additionalProperties'),
          keyword: 'additionalProperties',
          message: 'must NOT have additional properties',
          params: { additionalProperty: key },
        });
      } else if (isObject(schema.additionalProperties)) {
        validateNode(
          value,
          schema.additionalProperties,
          root,
          joinInstance(instancePath, key),
          joinSchema(schemaPath, 'additionalProperties'),
          errors,
        );
      }
    }
  }
}

/**
 * Validate `instance` against a 2020-12 schema using the keyword subset
 * this package publishes (type, const, enum, required, properties,
 * additionalProperties, items, $ref, minLength, minimum, minItems).
 */
export function validateJsonSchema(
  instance: unknown,
  schema: SchemaNode,
): JsonSchemaValidationResult {
  const errors: JsonSchemaError[] = [];
  validateNode(instance, schema, schema, '', '#', errors);
  return { valid: errors.length === 0, errors };
}
