// ─── cinematic-domain / labels.test.ts ────────────────────────────────────────

import { describe, it, expect } from 'vitest';
import { statusLabels } from '@storyboard-os/core';
import {
  CONNECTION_TYPE_LABELS,
  STATUS_LABELS,
  humanizeConnectionType,
  humanizeStatus,
} from './labels';
import { storyboardOsLaunchTrailer } from './demo-sequence';

describe('STATUS_LABELS / humanizeStatus — VP-005 SPEC', () => {
  it('ready is SPEC on the shared label map and humanizeStatus', () => {
    expect(STATUS_LABELS.ready).toBe('SPEC');
    expect(STATUS_LABELS.ready).toBe(statusLabels.ready);
    expect(humanizeStatus('ready')).toBe('SPEC');
    expect(humanizeStatus('ready')).not.toBe('READY');
  });

  it('other levels stay PARTIAL / DRAFT / BLOCKED', () => {
    expect(humanizeStatus('partial')).toBe('PARTIAL');
    expect(humanizeStatus('draft')).toBe('DRAFT');
    expect(humanizeStatus('blocked')).toBe('BLOCKED');
  });
});

describe('CONNECTION_TYPE_LABELS.parallel_action', () => {
  it('is Parallel Action (shared canvas / legend / Sequence Flow / markdown word)', () => {
    expect(CONNECTION_TYPE_LABELS.parallel_action).toBe('Parallel Action');
    expect(humanizeConnectionType('parallel_action')).toBe('Parallel Action');
    expect(humanizeConnectionType('parallel_action')).not.toBe('parallel');
    expect(humanizeConnectionType('parallel_action')).not.toBe('Parallel');
  });

  it('keeps the raw enum on the demo trailer JSON connection', () => {
    const edge = storyboardOsLaunchTrailer.connections.find(c => c.id === 'dc-5');
    expect(edge?.type).toBe('parallel_action');
  });
});

describe('demo-stats credibility copy', () => {
  it('names 6 packages and 3 apps, not the stale 5/2 scoreboard', () => {
    const stats = storyboardOsLaunchTrailer.frames.find(f => f.id === 'demo-stats');
    expect(stats?.summary).toContain('6 packages');
    expect(stats?.summary).toContain('3 apps');
    expect(stats?.summary).not.toContain('5 packages');
    expect(stats?.summary).not.toContain('2 apps');
    expect(stats?.summary).not.toMatch(/511 tests/);
    expect(stats?.summary).not.toMatch(/45 pages/);
  });
});
