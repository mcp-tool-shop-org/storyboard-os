// ─── Production brief schema gate ────────────────────────────────────────────
//
// C4: portable handoff is Markdown + schema-validated JSON. This module is
// the JSON half — Ajv-shaped errors against the published 2020-12 schema.

import productionBriefSchema from '../schema/production-brief.json';
import { validateJsonSchema, type JsonSchemaError, type JsonSchemaValidationResult } from './jsonSchema';

export const PRODUCTION_BRIEF_SCHEMA = productionBriefSchema as Record<string, unknown>;

/** $id of the published production-brief schema — stamped on generated JSON. */
export const PRODUCTION_BRIEF_SCHEMA_ID =
  typeof productionBriefSchema.$id === 'string'
    ? productionBriefSchema.$id
    : 'https://github.com/mcp-tool-shop-org/storyboard-os/schemas/cinematic/production-brief.json';

export type ProductionBriefValidationError = JsonSchemaError;
export type ProductionBriefValidationResult = JsonSchemaValidationResult;

export class InvalidProductionBriefError extends Error {
  readonly errors: ProductionBriefValidationError[];

  constructor(errors: ProductionBriefValidationError[]) {
    const preview = errors
      .slice(0, 3)
      .map(e => `${e.instancePath || '/'} ${e.message}`)
      .join('; ');
    super(
      `Production brief failed schema validation (${errors.length} error${errors.length === 1 ? '' : 's'}): ${preview}`,
    );
    this.name = 'InvalidProductionBriefError';
    this.errors = errors;
  }
}

/**
 * Validate unknown JSON against production-brief.schema.json (draft 2020-12).
 * Returns structured Ajv-shaped errors; never throws on a bad payload.
 */
export function validateProductionBrief(input: unknown): ProductionBriefValidationResult {
  return validateJsonSchema(input, PRODUCTION_BRIEF_SCHEMA);
}

/**
 * JSON export path: fail closed if the payload does not satisfy the schema.
 */
export function serializeProductionBriefJson(brief: unknown): string {
  const result = validateProductionBrief(brief);
  if (!result.valid) {
    throw new InvalidProductionBriefError(result.errors);
  }
  return JSON.stringify(brief, null, 2);
}

/** Assert a generated brief; used at the end of generateProductionBrief. */
export function assertValidProductionBrief(brief: unknown): void {
  const result = validateProductionBrief(brief);
  if (!result.valid) {
    throw new InvalidProductionBriefError(result.errors);
  }
}
