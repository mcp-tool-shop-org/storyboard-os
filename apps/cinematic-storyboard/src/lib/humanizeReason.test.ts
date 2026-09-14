import { describe, it, expect } from 'vitest';
import { humanizeReason } from './humanizeReason';

describe('humanizeReason', () => {
  it('maps known blocked-shot codes to inspector labels', () => {
    expect(humanizeReason('no_visualDescription')).toBe('Visual description missing');
    expect(humanizeReason('no_cameraMovement')).toBe('Camera movement missing');
    expect(humanizeReason('no_spec')).toContain('No spec content yet');
  });

  it('decodes unknown no_* codes without returning the raw snake_case id', () => {
    expect(humanizeReason('no_weirdField')).not.toBe('no_weirdField');
    expect(humanizeReason('no_weirdField')).toMatch(/missing/i);
  });
});
