// ─── labels.test.ts ───────────────────────────────────────────────────────────

import { describe, it, expect } from 'vitest';
import { statusLabels } from '@storyboard-os/core';
import {
    FRAME_TYPE_LABELS,
    CONNECTION_TYPE_LABELS,
    MISSING_REASON_LABELS,
    BEAT_STATUS_LABELS,
    ANNOTATION_TYPE_LABELS,
    humanizeFrameType,
    humanizeConnectionType,
    humanizeMissingReason,
    humanizeBeatStatus,
    humanizeAnnotationType,
} from './labels';

describe('humanizeFrameType', () => {
    it('covers every MarketingFrameType without leaking snake_case', () => {
        for (const [type, label] of Object.entries(FRAME_TYPE_LABELS)) {
            expect(humanizeFrameType(type)).toBe(label);
            expect(label).not.toContain('_');
        }
    });

    it('passes through unknown types', () => {
        expect(humanizeFrameType('custom_beat')).toBe('custom_beat');
    });
});

describe('humanizeConnectionType', () => {
    it('uses the HTML CONN_LABELS strings (F-5c0c80f1)', () => {
        expect(humanizeConnectionType('sequence')).toBe('campaign flow');
        expect(humanizeConnectionType('choice')).toBe('segment path');
        expect(humanizeConnectionType('consequence')).toBe('consequence');
        expect(humanizeConnectionType('approval')).toBe('approval gate');
        expect(Object.keys(CONNECTION_TYPE_LABELS).sort()).toEqual(
            ['approval', 'choice', 'consequence', 'dependency', 'optional', 'sequence'].sort(),
        );
    });
});

describe('humanizeMissingReason', () => {
    it('humanizes blocking and spec-gap codes instead of snake_case tokens', () => {
        expect(humanizeMissingReason('no_conversion_goal')).toBe('Conversion goal not defined');
        expect(humanizeMissingReason('no_objective')).toBe('Objective not defined');
        expect(humanizeMissingReason('no_audience_segment')).toBe('Audience segment not specified');
        for (const label of Object.values(MISSING_REASON_LABELS)) {
            expect(label).not.toMatch(/^no_/);
        }
    });

    it('falls back to spaces for unknown codes', () => {
        expect(humanizeMissingReason('no_unknown_field')).toBe('no unknown field');
    });
});

describe('humanizeBeatStatus', () => {
    it('maps ready → SPEC (VP-005 / F-1e7131d2), not READY', () => {
        expect(humanizeBeatStatus('ready')).toBe(statusLabels.ready);
        expect(humanizeBeatStatus('ready')).toBe('SPEC');
        expect(BEAT_STATUS_LABELS.partial).toBe(statusLabels.partial);
        expect(BEAT_STATUS_LABELS.draft).toBe(statusLabels.draft);
        expect(BEAT_STATUS_LABELS.blocked).toBe(statusLabels.blocked);
    });
});

describe('humanizeAnnotationType (F-2cdce1c8)', () => {
    it('covers every MarketingAnnotationType without leaking snake_case', () => {
        for (const [type, label] of Object.entries(ANNOTATION_TYPE_LABELS)) {
            expect(humanizeAnnotationType(type)).toBe(label);
            expect(label).not.toContain('_');
        }
    });

    it('falls back to spaces for unknown types', () => {
        expect(humanizeAnnotationType('custom_gate')).toBe('custom gate');
    });
});
