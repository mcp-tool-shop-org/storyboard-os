<p align="center">
  <a href="README.ja.md">日本語</a> | <a href="README.zh.md">中文</a> | <a href="README.es.md">Español</a> | <a href="README.fr.md">Français</a> | <a href="README.md">English</a> | <a href="README.it.md">Italiano</a> | <a href="README.pt-BR.md">Português (BR)</a>
</p>

<p align="center">
  <img src="https://raw.githubusercontent.com/mcp-tool-shop-org/brand/main/logos/storyboard-os/readme.png" alt="Storyboard OS" width="400" />
</p>

<p align="center">
  <a href="https://github.com/mcp-tool-shop-org/storyboard-os/actions/workflows/ci.yml"><img src="https://github.com/mcp-tool-shop-org/storyboard-os/actions/workflows/ci.yml/badge.svg" alt="CI" /></a>
  <a href="https://www.npmjs.com/package/@storyboard-os/canvas"><img src="https://img.shields.io/npm/v/@storyboard-os/canvas.svg" alt="npm" /></a>
  <a href="../../LICENSE"><img src="https://img.shields.io/badge/license-MIT-blue.svg" alt="MIT License" /></a>
</p>

<p align="center"><strong>स्टोरीबोर्ड ओएस के लिए डोमेन-कॉन्फ़िगर करने योग्य कोंवा कैनवस रेंडरर।</strong></p>

---

# @storyboard-os/canvas

यह कोंवा-आधारित कैनवस रेंडरर है, जिसका उपयोग इंटरैक्टिव स्टोरीबोर्ड बनाने के लिए किया जाता है। यह फ्रेम, कनेक्शन, चयन, ड्रैग, टाइप बैज और कनेक्शन लेबल प्रदर्शित करता है। यह **आरपीजी, पटकथा या किसी अन्य डोमेन शब्दावली के बारे में कोई जानकारी नहीं रखता** - सभी दृश्य कॉन्फ़िगरेशन को उपयोग करने वाले एप्लिकेशन द्वारा इंजेक्ट किया जाता है।

एक अन्य डोमेन (पटकथा, टेबलटॉप, गेम-मैप) अपना कॉन्फ़िगरेशन प्रदान करता है और बिना इस पैकेज को बदले एक पूरी तरह से कार्यात्मक कैनवस प्राप्त करता है।

---

## निर्भरताएँ

```bash
npm install react react-konva konva
# react >= 18, react-konva >= 18, konva >= 9
```

---

## इंस्टॉल करें

```bash
npm install @storyboard-os/canvas
# or
pnpm add @storyboard-os/canvas
```

---

## शुरुआत कैसे करें

```tsx
import StoryboardCanvas from '@storyboard-os/canvas';
import type { StoryboardCanvasConfig } from '@storyboard-os/canvas';
import { useRef } from 'react';
import type { ViewportHandle } from '@storyboard-os/canvas';

// 1. Define your domain config — canvas renders these without knowing what they mean
const MY_CONFIG: StoryboardCanvasConfig = {
  frameTypeStyles: {
    hook:       { bg: '#1a1500', accent: '#EAB308', label: 'HOOK' },
    scene:      { bg: '#0a1628', accent: '#3B82F6', label: 'SCENE' },
    choice:     { bg: '#14092e', accent: '#8B5CF6', label: 'CHOICE' },
    encounter:  { bg: '#1a0a0a', accent: '#EF4444', label: 'ENCOUNTER' },
    reveal:     { bg: '#1a0e00', accent: '#F97316', label: 'REVEAL' },
    npc_beat:   { bg: '#0a1a0e', accent: '#22C55E', label: 'CHARACTER BEAT' },
    consequence:{ bg: '#111318', accent: '#6B7280', label: 'CONSEQUENCE' },
  },
  connectionTypeStyles: {
    sequence:    { stroke: '#475569', strokeWidth: 1.5 },
    choice:      { stroke: '#8B5CF6', dash: [8, 4], strokeWidth: 2.5 },
    consequence: { stroke: '#EF4444', strokeWidth: 2.5 },
    optional:    { stroke: '#334155', dash: [6, 4], strokeWidth: 1.5 },
    fallback:    { stroke: '#F97316', dash: [6, 4], strokeWidth: 2 },
  },
};

// 2. Wire up the canvas
const canvasRef = useRef<ViewportHandle>(null);

<div style={{ width: '100%', height: '100vh' }}>
  <StoryboardCanvas
    ref={canvasRef}
    frames={storyboard.frames}
    connections={storyboard.connections}
    config={MY_CONFIG}
    autoFit
    onSelectFrame={(id) => setSelected(id)}
    onFramePositionChange={(frameId, pos) => persistPosition(frameId, pos)}
  />
</div>

// 3. Control viewport programmatically
<button onClick={() => canvasRef.current?.fitToFrames()}>Fit</button>
<button onClick={() => canvasRef.current?.resetView()}>1:1</button>
<button onClick={() => canvasRef.current?.zoomIn()}>+</button>
<button onClick={() => canvasRef.current?.zoomOut()}>−</button>
```

---

## गुण (Props)

```ts
interface Props {
  /** Frames to render. Domain types are structurally compatible with CanvasFrame. */
  frames: CanvasFrame[];

  /** Connections to render. Domain types are structurally compatible with CanvasConnection. */
  connections: CanvasConnection[];

  /** All visual configuration for frame types and connection types. */
  config: StoryboardCanvasConfig;

  /** Currently selected frame ID. Controlled externally. */
  selectedFrameId?: string | null;

  /** Called when a frame card is clicked (passes ID) or background is clicked (passes null). */
  onSelectFrame?: (frameId: string | null) => void;

  /** Currently selected connection ID. Controlled externally. */
  selectedConnectionId?: string | null;

  /** Called when a connection arrow is clicked. */
  onSelectConnection?: (connectionId: string | null) => void;

  /** Called whenever zoom or pan state changes. Use for displaying scale in parent controls. */
  onViewStateChange?: (v: ViewState) => void;

  /** Fit all frames to the viewport on first mount. Default: false. */
  autoFit?: boolean;

  /**
   * Called once per completed frame drag with the frame's new canvas-space position.
   * Use this to persist layout changes. Template preview boards can omit this.
   */
  onFramePositionChange?: (frameId: string, position: { x: number; y: number }) => void;
}
```

---

## डोमेन कॉन्फ़िगरेशन

`StoryboardCanvasConfig` वह एकमात्र चीज़ है जिसके बारे में कैनवस को आपके डोमेन के बारे में जानने की आवश्यकता होती है।

```ts
interface StoryboardCanvasConfig {
  /**
   * Per-frame-type styles. Keys are your domain's frame type strings.
   * Any type not present falls back to defaultFrameStyle.
   */
  frameTypeStyles: Record<string, CanvasFrameStyle>;

  /**
   * Per-connection-type styles. Keys are connection type strings.
   * Any type not present falls back to defaultConnectionStyle.
   */
  connectionTypeStyles?: Record<string, CanvasConnectionStyle>;

  /** Fallback when a frame type has no entry. */
  defaultFrameStyle?: CanvasFrameStyle;

  /** Fallback when a connection type has no entry. */
  defaultConnectionStyle?: CanvasConnectionStyle;
}

interface CanvasFrameStyle {
  bg: string;      // card background color
  accent: string;  // type-bar fill and card border
  label: string;   // short uppercase type label, e.g. "SCENE"
}

interface CanvasConnectionStyle {
  stroke: string;
  dash?: number[];       // e.g. [8, 4] for dashed
  strokeWidth?: number;  // default 1.5; use higher values for game-state branches
}
```

---

## फ्रेम बैज

डोमेन फ्रेम कार्ड पर बैज चिप्स जोड़ सकते हैं, बिना यह जाने कि वे क्या दर्शाते हैं।

```ts
interface CanvasFrame {
  id: string;
  type: string;
  title: string;
  summary: string;
  position: { x: number; y: number };
  size: { width: number; height: number };
  badges?: CanvasBadge[];  // optional — rendered at the bottom of the card
}

interface CanvasBadge {
  text: string;  // short uppercase label, e.g. "STATE", "SPEC", "DRAFT"
  color: string; // hex color for the badge border and label text
}
```

`rpg-storyboard` में, `@storyboard-os/rpg-domain` से `getFrameBadges(frame, connections)` इन बैज को उत्पन्न करता है। कैनवस उन्हें इस तरह प्रदर्शित करता है कि उसे यह जानने की आवश्यकता नहीं है कि "STATE" या "SPEC" का क्या अर्थ है।

---

## व्यूपोर्ट हैंडल

`StoryboardCanvas` एक `forwardRef` घटक है। `ViewportHandle` प्राप्त करने के लिए एक `ref` पास करें:

```ts
interface ViewportHandle {
  /** Fit all frames (at their current dragged positions) into the viewport. */
  fitToFrames(): void;

  /** Reset to scale=1, x=0, y=0. */
  resetView(): void;

  /** Zoom in 20% from the container center. */
  zoomIn(): void;

  /** Zoom out 20% from the container center. */
  zoomOut(): void;

  /** Center the viewport on a specific frame at the current scale. */
  centerOnFrame(frame: CanvasFrame): void;

  /** Return the current scale factor (1 = 100%). */
  getScale(): number;
}
```

---

## व्यूपोर्ट इंटरैक्शन मॉडल

| इशारा (Gesture) | प्रभाव (Effect) |
|---|---|
| पृष्ठभूमि ड्रैग | पैन |
| Ctrl/Cmd + स्क्रॉल व्हील | कर्सर स्थिति पर ज़ूम |
| सादा स्क्रॉल | पैन (प्राकृतिक दो-उंगली ट्रैकपैड) |
| फ्रेम ड्रैग | फ्रेम को पुन: स्थिति दें; रिलीज़ होने पर `onFramePositionChange` ट्रिगर होता है। |
| फ्रेम पर क्लिक करें | फ्रेम का चयन करें; `onSelectFrame` ट्रिगर होता है। |
| कनेक्शन पर क्लिक करें | कनेक्शन का चयन करें; `onSelectConnection` ट्रिगर होता है। |
| पृष्ठभूमि पर क्लिक करें | चयन रद्द करें; `onSelectFrame(null)` ट्रिगर होता है। |

पृष्ठभूमि-ड्रैग गार्ड (`e.target !== stage`) यह सुनिश्चित करता है कि जब कोई फ्रेम कार्ड खींचा जा रहा हो तो पैन ट्रिगर न हो।

---

## कंटेनर का आकार

`StoryboardCanvas` अपने कंटेनर को मापने और उसे पूरी तरह से भरने के लिए `ResizeObserver` का उपयोग करता है। स्पष्ट `width` या `height` गुण न दें - बस कंटेनर को एक आकार दें:

```tsx
// Fill a panel
<div style={{ width: '100%', height: '100%' }}>
  <StoryboardCanvas ... />
</div>

// Fill the viewport
<div style={{ width: '100vw', height: '100vh' }}>
  <StoryboardCanvas ... />
</div>
```

---

## व्यूपोर्ट गणित - स्टैंडअलोन उपयोगिताएँ

व्यूपोर्ट गणित फ़ंक्शन शुद्ध हैं और उनमें कोई React या Konva निर्भरता नहीं है। वे उन ऐप्स के लिए निर्यात किए जाते हैं जिन्हें कैनवस घटक के बाहर लेआउट या स्थिति की गणना करने की आवश्यकता होती है।

```ts
import {
  fitViewToFrames,
  centerOnFrame,
  zoomAtPoint,
  zoomFromCenter,
  clampScale,
  DEFAULT_VIEW_STATE,
  MIN_SCALE,  // 0.1
  MAX_SCALE,  // 4
} from '@storyboard-os/canvas';

// Compute the ViewState that fits all frames within a container
const view = fitViewToFrames(frames, containerWidth, containerHeight, padding);

// Zoom toward a screen point (pointer stays visually fixed)
const zoomed = zoomAtPoint(currentView, pointerX, pointerY, zoomFactor);

// Enforce scale bounds
const clamped = clampScale(rawScale); // clamps to [0.1, 4]
```

`viewport.test.ts` में सभी 27 व्यूपोर्ट गणित परीक्षण DOM या Konva के बिना चलते हैं, जिससे वे CI में तेज़ और विश्वसनीय होते हैं।

---

## आर्किटेक्चर स्थिति

```
@storyboard-os/canvas        ← you are here
  └── react, react-konva, konva  (peer deps)

apps/rpg-storyboard
  ├── @storyboard-os/canvas
  └── @storyboard-os/rpg-domain  (provides config + badge data)
```

`@storyboard-os/canvas` `@storyboard-os/core`, `@storyboard-os/rpg-domain` या किसी भी एप्लिकेशन से **आयात नहीं करता** है। डोमेन कॉन्फ़िगरेशन गुणों के माध्यम से प्रवाहित होता है; कैनवस कभी भी डोमेन परत में नहीं जाता है।

मानक सत्यापन: इस पैकेज के स्रोत में `rpg-domain`, `quest`, `npc_beat` या `stateChange` की खोज करने से कुछ भी नहीं मिलना चाहिए।

---

## विश्वसनीयता मॉडल

`@storyboard-os/canvas` एक React घटक लाइब्रेरी है। इसमें कोई नेटवर्क एक्सेस, कोई localStorage रीड या राइट, कोई सर्वर-साइड प्रभाव और कोई टेलीमेट्री नहीं है। सभी डेटा स्थायीकरण का जिम्मेदारी उपयोग करने वाले एप्लिकेशन का है, जो `onFramePositionChange` के माध्यम से होता है।

---

<p align="center">Part of <a href="https://github.com/mcp-tool-shop-org/storyboard-os">storyboard-os</a> · Built by <a href="https://mcp-tool-shop.github.io/">MCP Tool Shop</a></p>
