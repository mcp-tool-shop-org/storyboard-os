<p align="center">
  <a href="README.ja.md">日本語</a> | <a href="README.zh.md">中文</a> | <a href="README.es.md">Español</a> | <a href="README.fr.md">Français</a> | <a href="README.hi.md">हिन्दी</a> | <a href="README.md">English</a> | <a href="README.pt-BR.md">Português (BR)</a>
</p>

<p align="center">
  <img src="https://raw.githubusercontent.com/mcp-tool-shop-org/brand/main/logos/storyboard-os/readme.png" alt="Storyboard OS" width="400" />
</p>

<p align="center">
  <a href="https://github.com/mcp-tool-shop-org/storyboard-os/actions/workflows/ci.yml"><img src="https://github.com/mcp-tool-shop-org/storyboard-os/actions/workflows/ci.yml/badge.svg" alt="CI" /></a>
  <a href="https://www.npmjs.com/package/@storyboard-os/canvas"><img src="https://img.shields.io/npm/v/@storyboard-os/canvas.svg" alt="npm" /></a>
  <a href="../../LICENSE"><img src="https://img.shields.io/badge/license-MIT-blue.svg" alt="MIT License" /></a>
</p>

<p align="center"><strong>Renderizzatore di canvas Konva configurabile per Storyboard OS.</strong></p>

---

# @storyboard-os/canvas

Un renderizzatore di canvas basato su Konva per la creazione interattiva di storyboard. Visualizza fotogrammi, connessioni, selezione, trascinamento, etichette di tipo e descrizioni delle connessioni. **Non ha alcuna conoscenza di vocabolari specifici, come quelli relativi a giochi di ruolo, sceneggiature o altri ambiti**; tutte le configurazioni visive vengono fornite dall'applicazione che lo utilizza.

Un'altra applicazione (ad esempio, per sceneggiature, giochi da tavolo o mappe di gioco) può fornire la propria configurazione e ottenere un canvas completamente funzionante senza modificare questo pacchetto.

---

## Dipendenze esterne

```bash
npm install react react-konva konva
# react >= 18, react-konva >= 18, konva >= 9
```

---

## Installazione

```bash
npm install @storyboard-os/canvas
# or
pnpm add @storyboard-os/canvas
```

---

## Guida introduttiva

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

## Proprietà (props)

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

## Configurazione specifica per l'ambito di applicazione

L'oggetto `StoryboardCanvasConfig` è l'unico modo in cui il canvas può conoscere le informazioni relative all'ambito di applicazione.

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

## Etichette dei fotogrammi

Un'applicazione può associare "badge" (etichette) alle schede dei fotogrammi senza che il canvas debba sapere cosa significano.

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

In `rpg-storyboard`, la funzione `getFrameBadges(frame, connections)` del modulo `@storyboard-os/rpg-domain` genera queste etichette. Il canvas le visualizza senza dover sapere cosa significano "STATO" o "SPECIFICHE".

---

## Gestore della viewport

`StoryboardCanvas` è un componente `forwardRef`. Passare un `ref` per ottenere l'oggetto `ViewportHandle`:

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

## Modello di interazione della viewport

| Gesto | Effetto |
|---|---|
| Trascinamento dello sfondo | Panoramica |
| Ctrl/Cmd + rotellina del mouse | Zoom nella posizione del cursore |
| Scorrimento semplice | Panoramica (con il touchpad a due dita) |
| Trascinamento del fotogramma | Ridisposizione del fotogramma; attiva l'evento `onFramePositionChange` al rilascio. |
| Click sul fotogramma | Seleziona il fotogramma; attiva l'evento `onSelectFrame`. |
| Click sulla connessione | Seleziona la connessione; attiva l'evento `onSelectConnection`. |
| Click sullo sfondo | Deseleziona; attiva l'evento `onSelectFrame(null)`. |

La protezione contro il trascinamento dello sfondo (`e.target !== stage`) impedisce che la panoramica venga attivata quando una scheda del fotogramma viene trascinata.

---

## Dimensionamento del contenitore

`StoryboardCanvas` utilizza un `ResizeObserver` per misurare il suo contenitore e lo riempie completamente. Non passare proprietà `width` o `height` esplicite; semplicemente, fornisci al contenitore una dimensione.

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

## Calcoli della viewport: utilità autonome

Le funzioni di calcolo della viewport sono pure e non hanno dipendenze da React o Konva. Vengono esportate per le applicazioni che devono calcolare il layout o il posizionamento al di fuori del componente canvas.

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

Tutti e 27 i test di calcolo della viewport in `viewport.test.ts` vengono eseguiti senza DOM o Konva, il che li rende veloci e affidabili nei test di integrazione.

---

## Architettura

```
@storyboard-os/canvas        ← you are here
  └── react, react-konva, konva  (peer deps)

apps/rpg-storyboard
  ├── @storyboard-os/canvas
  └── @storyboard-os/rpg-domain  (provides config + badge data)
```

`@storyboard-os/canvas` **non** importa moduli da `@storyboard-os/core`, `@storyboard-os/rpg-domain` o da alcuna applicazione. La configurazione specifica per l'ambito di applicazione viene fornita tramite le proprietà; il canvas non accede mai al livello specifico per l'ambito di applicazione.

La verifica definitiva: la ricerca di `rpg-domain`, `quest`, `npc_beat` o `stateChange` nel codice sorgente di questo pacchetto non deve restituire alcun risultato.

---

## Modello di sicurezza

`@storyboard-os/canvas` è una libreria di componenti React. Non ha accesso alla rete, non legge né scrive dati in `localStorage`, non ha effetti lato server e non raccoglie dati di telemetria. Tutta la persistenza è responsabilità dell'applicazione che lo utilizza tramite l'evento `onFramePositionChange`.

---

<p align="center">Part of <a href="https://github.com/mcp-tool-shop-org/storyboard-os">storyboard-os</a> · Built by <a href="https://mcp-tool-shop.github.io/">MCP Tool Shop</a></p>
