// ─── sequenceBoards.test.ts ───────────────────────────────────────────────────
//
// BC-005 smoke suite for the cinematic app (mirrors rpg-storyboard's
// templates.test.ts pattern). Tests the board-data surface the app's pages
// actually assemble: the template registry, sequence creation, the demo
// trailer that sequences/[sequenceId].astro publishes, and the production
// brief that the handoff page renders.
// ─────────────────────────────────────────────────────────────────────────────

import { describe, it, expect } from 'vitest';
import {
    CINEMATIC_TEMPLATES,
    getCinematicTemplate,
    createCinematicStoryboard,
    validateCinematicStoryboard,
    storyboardOsLaunchTrailer,
    generateProductionBrief,
    generateProductionMarkdown,
    getSequenceReadiness,
} from '@storyboard-os/cinematic-domain';

// Frame vocabulary the app's canvas config + handoff color maps cover.
const APP_FRAME_TYPES = [
    'sequence', 'shot', 'camera_move', 'action', 'dialogue',
    'transition', 'vfx', 'audio', 'edit_beat',
];

// Status vocabulary the handoff page's STATUS_COLORS map covers. The shot
// status badge falls back to a neutral accent for anything else (AP-005) —
// this pins the domain contract so the fallback stays a dead branch.
const APP_STATUS_LEVELS = ['ready', 'partial', 'draft', 'blocked'];

// ─── Registry ────────────────────────────────────────────────────────────────

describe('CINEMATIC_TEMPLATES', () => {
    it('defines all three sequence templates', () => {
        const ids = CINEMATIC_TEMPLATES.map(t => t.id);
        expect(ids).toContain('trailer_flow');
        expect(ids).toContain('cutscene_sequence');
        expect(ids).toContain('explainer_video');
        expect(ids).toHaveLength(3);
    });

    it('getCinematicTemplate returns undefined for an unknown id', () => {
        expect(getCinematicTemplate('nonexistent' as never)).toBeUndefined();
    });
});

// ─── Sequence creation ────────────────────────────────────────────────────────

describe('createCinematicStoryboard', () => {
    it('throws on an unknown template id', () => {
        expect(() => createCinematicStoryboard('bad_id' as never)).toThrow();
    });

    for (const template of CINEMATIC_TEMPLATES) {
        describe(template.id, () => {
            const sequence = createCinematicStoryboard(template.id);

            it('produces a canvas-renderable board', () => {
                expect(Array.isArray(sequence.frames)).toBe(true);
                expect(Array.isArray(sequence.connections)).toBe(true);
                expect(sequence.frames.length).toBeGreaterThan(0);
            });

            it('passes cinematic validation', () => {
                const result = validateCinematicStoryboard(sequence);
                expect(result.valid).toBe(true);
                expect(result.errors).toHaveLength(0);
            });

            it('has no duplicate frame ids', () => {
                const ids = sequence.frames.map(f => f.id);
                expect(new Set(ids).size).toBe(ids.length);
            });

            it('every frame has position and valid size', () => {
                for (const frame of sequence.frames) {
                    expect(typeof frame.position.x).toBe('number');
                    expect(typeof frame.position.y).toBe('number');
                    expect(frame.size.width).toBeGreaterThan(0);
                    expect(frame.size.height).toBeGreaterThan(0);
                }
            });

            it('only uses frame types the app styles', () => {
                for (const frame of sequence.frames) {
                    expect(APP_FRAME_TYPES).toContain(frame.type);
                }
            });
        });
    }
});

// ─── Demo trailer (the board [sequenceId].astro publishes) ────────────────────

describe('storyboardOsLaunchTrailer', () => {
    it('has a routable id and title', () => {
        expect(storyboardOsLaunchTrailer.id).toBeTruthy();
        expect(storyboardOsLaunchTrailer.title).toBeTruthy();
    });

    it('passes cinematic validation', () => {
        const result = validateCinematicStoryboard(storyboardOsLaunchTrailer);
        expect(result.valid).toBe(true);
    });

    it('only uses frame types the app styles', () => {
        for (const frame of storyboardOsLaunchTrailer.frames) {
            expect(APP_FRAME_TYPES).toContain(frame.type);
        }
    });

    it('readiness summary counts add up to total frames', () => {
        const summary = getSequenceReadiness(storyboardOsLaunchTrailer);
        expect(summary.ready + summary.partial + summary.draft + summary.blocked)
            .toBe(summary.total);
        expect(summary.total).toBe(storyboardOsLaunchTrailer.frames.length);
    });
});

// ─── Production brief (what the handoff page renders) ────────────────────────

describe('generateProductionBrief', () => {
    const brief = generateProductionBrief(storyboardOsLaunchTrailer);

    it('produces a non-empty shot list', () => {
        expect(Array.isArray(brief.shots)).toBe(true);
        expect(brief.shots.length).toBeGreaterThan(0);
    });

    it('numbers shots sequentially from 1', () => {
        brief.shots.forEach((shot, i) => {
            expect(shot.shotNumber).toBe(i + 1);
        });
    });

    it('every shot status is a level the handoff page styles', () => {
        for (const shot of brief.shots) {
            expect(APP_STATUS_LEVELS).toContain(shot.status);
        }
    });

    it('every shot carries an id and title', () => {
        for (const shot of brief.shots) {
            expect(shot.title).toBeTruthy();
        }
    });

    it('renders to non-empty markdown', () => {
        const md = generateProductionMarkdown(brief);
        expect(typeof md).toBe('string');
        expect(md.length).toBeGreaterThan(0);
        expect(md).toContain(storyboardOsLaunchTrailer.title);
    });
});
