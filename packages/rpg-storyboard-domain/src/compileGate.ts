// ─── rpg-domain / compileGate.ts ─────────────────────────────────────────────
//
// Shared schema gate for one-way compile adapters (.tres, world-forge pack).
// Adapters never parse engine-native files back onto the board.
//
// ─────────────────────────────────────────────────────────────────────────────

import type { ProjectHandoff, QuestHandoff } from './handoff';
import {
  PROJECT_HANDOFF_SCHEMA_ID,
  QUEST_HANDOFF_SCHEMA_ID,
  assertValidHandoff,
  assertValidProjectHandoff,
} from './handoffValidate';

export type SchemaValidHandoff = QuestHandoff | ProjectHandoff;

export function isProjectHandoff(handoff: SchemaValidHandoff): handoff is ProjectHandoff {
  return handoff.$schema === PROJECT_HANDOFF_SCHEMA_ID;
}

/**
 * Fail closed unless `input` is schema-valid QuestHandoff or ProjectHandoff JSON.
 * Detects project envelopes by `$schema` so a project payload is not run
 * through the quest const check.
 */
export function requireSchemaValidHandoff(input: unknown): SchemaValidHandoff {
  let data: unknown;
  try {
    data = JSON.parse(JSON.stringify(input));
  } catch {
    assertValidHandoff(input);
    return input as QuestHandoff;
  }

  const schema = data && typeof data === 'object'
    ? (data as { $schema?: unknown }).$schema
    : undefined;

  if (schema === PROJECT_HANDOFF_SCHEMA_ID) {
    assertValidProjectHandoff(data);
    return data as ProjectHandoff;
  }

  if (schema === QUEST_HANDOFF_SCHEMA_ID || schema === undefined) {
    assertValidHandoff(data);
    return data as QuestHandoff;
  }

  // Unknown $schema — quest validator reports the const mismatch.
  assertValidHandoff(data);
  return data as QuestHandoff;
}
