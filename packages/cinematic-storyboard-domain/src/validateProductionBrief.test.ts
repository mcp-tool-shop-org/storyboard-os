import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { generateProductionBrief } from './handoff';
import { createCinematicStoryboard, CINEMATIC_TEMPLATES } from './templates';
import { storyboardOsLaunchTrailer } from './demo-sequence';
import {
  validateProductionBrief,
  serializeProductionBriefJson,
  InvalidProductionBriefError,
  PRODUCTION_BRIEF_SCHEMA,
  PRODUCTION_BRIEF_SCHEMA_ID,
} from './validateProductionBrief';

describe('production-brief.schema.json', () => {
  it('is JSON Schema 2020-12 with the required envelope keys', () => {
    expect(PRODUCTION_BRIEF_SCHEMA.$schema).toBe('https://json-schema.org/draft/2020-12/schema');
    expect(PRODUCTION_BRIEF_SCHEMA.$id).toBe(PRODUCTION_BRIEF_SCHEMA_ID);
    expect(PRODUCTION_BRIEF_SCHEMA.additionalProperties).toBe(false);
    expect(PRODUCTION_BRIEF_SCHEMA.required).toEqual([
      'formatVersion',
      'title',
      'totalShots',
      'shots',
      'connections',
      'readySummary',
    ]);
  });

  it('matches the published schema file', () => {
    const published = JSON.parse(
      readFileSync(fileURLToPath(new URL('../schema/production-brief.json', import.meta.url)), 'utf8'),
    );
    expect(published).toEqual(PRODUCTION_BRIEF_SCHEMA);
  });
});

describe('validateProductionBrief', () => {
  for (const template of CINEMATIC_TEMPLATES) {
    it(`accepts generateProductionBrief(${template.id})`, () => {
      const brief = generateProductionBrief(template.createStoryboard());
      const result = validateProductionBrief(brief);
      expect(result.valid).toBe(true);
      expect(result.errors).toEqual([]);
    });
  }

  it('accepts the demo launch trailer brief', () => {
    const result = validateProductionBrief(generateProductionBrief(storyboardOsLaunchTrailer));
    expect(result.valid).toBe(true);
  });

  it('rejects a payload missing required envelope keys', () => {
    const result = validateProductionBrief({ title: 'Nope' });
    expect(result.valid).toBe(false);
    const missing = result.errors.filter(e => e.keyword === 'required').map(e => e.params?.missingProperty);
    expect(missing).toEqual(expect.arrayContaining([
      'formatVersion', 'totalShots', 'shots', 'connections', 'readySummary',
    ]));
  });

  it('rejects additional properties and the wrong formatVersion', () => {
    const brief = generateProductionBrief(createCinematicStoryboard('trailer_flow'));
    const extra = validateProductionBrief({ ...brief, engineNative: '.uasset' });
    expect(extra.valid).toBe(false);
    expect(extra.errors.some(e => e.keyword === 'additionalProperties')).toBe(true);

    const version = validateProductionBrief({ ...brief, formatVersion: 1 });
    expect(version.valid).toBe(false);
    expect(version.errors.some(e => e.keyword === 'const')).toBe(true);
  });

  it('does not throw on garbage input', () => {
    expect(validateProductionBrief(null).valid).toBe(false);
    expect(validateProductionBrief('brief').valid).toBe(false);
  });
});

describe('serializeProductionBriefJson', () => {
  it('round-trips a valid brief', () => {
    const brief = generateProductionBrief(createCinematicStoryboard('cutscene_sequence'));
    const json = serializeProductionBriefJson(brief);
    const parsed = JSON.parse(json);
    expect(validateProductionBrief(parsed).valid).toBe(true);
    expect(parsed.formatVersion).toBe(2);
  });

  it('fails closed on an invalid payload', () => {
    expect(() => serializeProductionBriefJson({ title: 'Nope' })).toThrow(InvalidProductionBriefError);
  });
});
