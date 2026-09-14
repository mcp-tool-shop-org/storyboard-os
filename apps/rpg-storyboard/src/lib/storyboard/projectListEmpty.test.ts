// F-c761d803: empty list must not reuse first-run CTA when the store root
// is unreadable / write path returned STORE_CORRUPT.
import { describe, it, expect } from 'vitest';
import { resolveProjectsEmptyCopy } from './projectListEmpty';

describe('resolveProjectsEmptyCopy — empty vs corrupt', () => {
  it('returns first-run copy when the list is empty and the store is healthy', () => {
    const copy = resolveProjectsEmptyCopy({ projectCount: 0, readWarningCode: null });
    expect(copy).not.toBeNull();
    expect(copy!.kind).toBe('first-run');
    expect(copy!.title).toBe('No projects yet');
    expect(copy!.createDisabled).toBe(false);
    expect(copy!.offerRawDownload).toBe(false);
    expect(copy!.body).toMatch(/templates/i);
  });

  it('returns corrupt-store recovery when readWarning is STORE_UNREADABLE', () => {
    const copy = resolveProjectsEmptyCopy({
      projectCount: 0,
      readWarningCode: 'STORE_UNREADABLE',
    });
    expect(copy).not.toBeNull();
    expect(copy!.kind).toBe('corrupt-store');
    expect(copy!.title).not.toBe('No projects yet');
    expect(copy!.title).toMatch(/corrupt/i);
    expect(copy!.createDisabled).toBe(true);
    expect(copy!.offerRawDownload).toBe(true);
    expect(copy!.body).toMatch(/clear site data/i);
    expect(copy!.body).not.toMatch(/Browse Templates/i);
    expect(copy!.body).not.toMatch(/No projects yet/i);
  });

  it('returns corrupt-store recovery when a write reported STORE_CORRUPT', () => {
    const copy = resolveProjectsEmptyCopy({
      projectCount: 0,
      readWarningCode: null,
      storeCorruptWrite: true,
    });
    expect(copy!.kind).toBe('corrupt-store');
    expect(copy!.createDisabled).toBe(true);
    expect(copy!.offerRawDownload).toBe(true);
  });

  it('does not treat RECORDS_DROPPED / NEWER_SCHEMA as corrupt empty', () => {
    expect(
      resolveProjectsEmptyCopy({ projectCount: 0, readWarningCode: 'RECORDS_DROPPED' })!.kind,
    ).toBe('first-run');
    expect(
      resolveProjectsEmptyCopy({ projectCount: 0, readWarningCode: 'NEWER_SCHEMA' })!.kind,
    ).toBe('first-run');
  });

  it('returns null when projects are present (no empty CTA)', () => {
    expect(
      resolveProjectsEmptyCopy({
        projectCount: 2,
        readWarningCode: 'STORE_UNREADABLE',
      }),
    ).toBeNull();
  });
});
