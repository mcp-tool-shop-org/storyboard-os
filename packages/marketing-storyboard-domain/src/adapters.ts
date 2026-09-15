// ─── marketing-domain / adapters.ts ──────────────────────────────────────────
//
// Downstream compile adapters over a schema-validated CampaignHandoff.
// C4: Markdown + JSON is the portable contract; these files are execution
// artifacts, never the authoring source of truth.
// C3: adapters compile; they never call networks, invent owners/dates, or
// auto-wire analytics accounts.
//
// ─────────────────────────────────────────────────────────────────────────────

import type { CampaignHandoff } from './handoff';
import { validateCampaignHandoff } from './handoff';

export class InvalidCampaignHandoffError extends Error {
    readonly errors: { path: string; message: string }[];

    constructor(errors: { path: string; message: string }[]) {
        const preview = errors
            .slice(0, 3)
            .map(e => `${e.path || '/'}: ${e.message}`)
            .join('; ');
        super(
            `CampaignHandoff failed schema validation (${errors.length} error${errors.length === 1 ? '' : 's'}): ${preview}`,
        );
        this.name = 'InvalidCampaignHandoffError';
        this.errors = errors;
    }
}

function requireValidCampaignHandoff(input: unknown): CampaignHandoff {
    const result = validateCampaignHandoff(input);
    if (!result.valid) {
        throw new InvalidCampaignHandoffError(result.errors);
    }
    return input as CampaignHandoff;
}

function csvEscape(value: string): string {
    if (/[",\n\r]/.test(value)) {
        return `"${value.replace(/"/g, '""')}"`;
    }
    return value;
}

/**
 * Stable id from an author-written display string. Compiles the string the
 * author already committed — does not invent a GA event name.
 */
export function fallbackEventId(text: string): string {
    const slug = text
        .trim()
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '_')
        .replace(/^_+|_+$/g, '')
        .slice(0, 64);
    return slug || 'unnamed';
}

export interface CampaignAssetRow {
    beatId: string;
    beatTitle: string;
    beatType: string;
    asset: string;
}

export interface CampaignEventMapEntry {
    beatId: string;
    beatTitle: string;
    beatType: string;
    id: string;
    name: string;
    /** Author-committed source, or `fallback` when compiled from a display string. */
    source: string;
}

export interface CampaignEventMap {
    campaignId: string;
    title: string;
    conversions: CampaignEventMapEntry[];
    measurements: CampaignEventMapEntry[];
}

/**
 * Required-assets production pack as CSV (one row per asset, grouped by beat
 * via beat_id). No owners, no due dates.
 */
export function adaptCampaignHandoffToAssetPack(input: unknown): string {
    const handoff = requireValidCampaignHandoff(input);
    const rows: CampaignAssetRow[] = [];
    for (const beat of handoff.beats) {
        for (const asset of beat.requiredAssets) {
            if (!asset.trim()) continue;
            rows.push({
                beatId: beat.id,
                beatTitle: beat.title,
                beatType: beat.type,
                asset,
            });
        }
    }
    const header = 'beat_id,beat_title,beat_type,asset';
    const body = rows.map(r =>
        [r.beatId, r.beatTitle, r.beatType, r.asset].map(csvEscape).join(','),
    );
    return [header, ...body].join('\n');
}

/**
 * Measurement / conversion event map for analytics tooling.
 * Prefers author-committed conversionEvent / measurementEvents ids; falls back
 * to slugifying conversionGoal / metrics strings. Never auto-wires GA.
 */
export function adaptCampaignHandoffToEventMap(input: unknown): CampaignEventMap {
    const handoff = requireValidCampaignHandoff(input);
    const conversions: CampaignEventMapEntry[] = [];
    const measurements: CampaignEventMapEntry[] = [];

    for (const beat of handoff.beats) {
        const base = {
            beatId: beat.id,
            beatTitle: beat.title,
            beatType: beat.type,
        };

        if (beat.conversionEvent) {
            conversions.push({
                ...base,
                id: beat.conversionEvent.id,
                name: beat.conversionEvent.name,
                source: 'author',
            });
        } else if (beat.conversionGoal?.trim()) {
            conversions.push({
                ...base,
                id: fallbackEventId(beat.conversionGoal),
                name: beat.conversionGoal.trim(),
                source: 'fallback',
            });
        }

        if ((beat.measurementEvents?.length ?? 0) > 0) {
            for (const ev of beat.measurementEvents ?? []) {
                measurements.push({
                    ...base,
                    id: ev.id,
                    name: ev.name,
                    source: ev.source,
                });
            }
        } else {
            for (const metric of beat.metrics) {
                if (!metric.trim()) continue;
                measurements.push({
                    ...base,
                    id: fallbackEventId(metric),
                    name: metric.trim(),
                    source: 'fallback',
                });
            }
        }
    }

    return {
        campaignId: handoff.id,
        title: handoff.title,
        conversions,
        measurements,
    };
}

/**
 * Implementation-checklist pack as Markdown grouped by beat.
 * Checkboxes are unchecked compile output — not a progress store.
 */
export function adaptCampaignHandoffToChecklistPack(input: unknown): string {
    const handoff = requireValidCampaignHandoff(input);
    const lines: string[] = [];
    lines.push(`# Implementation Checklist: ${handoff.title}`);
    lines.push('');

    let emitted = 0;
    for (const beat of handoff.beats) {
        if (beat.implementationChecklist.length === 0) continue;
        emitted += 1;
        lines.push(`## ${beat.title}`);
        lines.push('');
        lines.push(`Beat: ${beat.id} (${beat.type})`);
        lines.push('');
        for (const item of beat.implementationChecklist) {
            lines.push(`- [ ] ${item}`);
        }
        lines.push('');
    }

    if (emitted === 0) {
        lines.push('_No implementation checklist items on this campaign._');
        lines.push('');
    }

    return lines.join('\n');
}
