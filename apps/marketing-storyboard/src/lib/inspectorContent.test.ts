// ─── inspectorContent.test.ts ─────────────────────────────────────────────────
//
// F-894d310e: MarketingFrameInspector previously did `const content = frame.content`
// then read content.objective / content.channel without a nullish fallback.
// Selecting a null-content frame threw during render and ErrorBoundary replaced
// the whole canvas. resolveInspectorContent mirrors beatStatus/frameSignals.
// ─────────────────────────────────────────────────────────────────────────────

import { describe, it, expect } from 'vitest';
import type { StoryboardFrame, MarketingFrameContent } from '@storyboard-os/marketing-domain';
import { resolveInspectorContent } from './frameContent';

function makeFrame(content: unknown): StoryboardFrame {
    return {
        id: 'frame-1',
        type: 'conversion',
        title: 'Corrupt conversion',
        summary: 'Fixture',
        position: { x: 0, y: 0 },
        size: { width: 260, height: 160 },
        content: content as MarketingFrameContent,
        annotations: [],
    };
}

describe('resolveInspectorContent', () => {
    it('returns an empty object for null content (does not throw on field access)', () => {
        const content = resolveInspectorContent(makeFrame(null));
        expect(content).toEqual({});
        expect(content.objective).toBeUndefined();
        expect(content.channel).toBeUndefined();
        expect(content.conversionGoal).toBeUndefined();
    });

    it('returns an empty object when content is missing', () => {
        const frame = makeFrame({});
        delete (frame as unknown as Record<string, unknown>)['content'];
        expect(() => resolveInspectorContent(frame)).not.toThrow();
        expect(resolveInspectorContent(frame)).toEqual({});
    });

    it('passes through a present content object', () => {
        const content = resolveInspectorContent(makeFrame({
            objective: 'Ship',
            conversionGoal: 'Signup',
        }));
        expect(content.objective).toBe('Ship');
        expect(content.conversionGoal).toBe('Signup');
    });
});
