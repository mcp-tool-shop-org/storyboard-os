<p align="center">
  <a href="README.ja.md">日本語</a> | <a href="README.zh.md">中文</a> | <a href="README.md">English</a> | <a href="README.fr.md">Français</a> | <a href="README.hi.md">हिन्दी</a> | <a href="README.it.md">Italiano</a> | <a href="README.pt-BR.md">Português (BR)</a>
</p>

<p align="center">
  <img src="https://raw.githubusercontent.com/mcp-tool-shop-org/brand/main/logos/storyboard-os/readme.png" alt="Storyboard OS" width="400" />
</p>

<p align="center">
  <a href="https://github.com/mcp-tool-shop-org/storyboard-os/actions/workflows/ci.yml"><img src="https://github.com/mcp-tool-shop-org/storyboard-os/actions/workflows/ci.yml/badge.svg" alt="CI" /></a>
  <a href="https://www.npmjs.com/package/@storyboard-os/canvas"><img src="https://img.shields.io/npm/v/@storyboard-os/canvas.svg" alt="npm" /></a>
  <a href="../../LICENSE"><img src="https://img.shields.io/badge/license-MIT-blue.svg" alt="MIT License" /></a>
</p>

<p align="center"><strong>Renderizador de lienzo configurable para dominios, para Storyboard OS.</strong></p>

---

# @storyboard-os/canvas

Un renderizador de lienzo impulsado por Konva para la creación interactiva de storyboards. Renderiza fotogramas, conexiones, selección, arrastre, etiquetas de tipo y etiquetas de conexión. **No tiene conocimiento de la terminología específica de ningún dominio**, como RPG, guiones o cualquier otro vocabulario. Toda la configuración visual se inyecta a través de la aplicación que lo utiliza.

Un segundo componente (por ejemplo, para guiones, juegos de mesa o mapas de juegos) puede pasar su propia configuración y obtener un lienzo completamente funcional sin modificar este paquete.

---

## Dependencias de pares

```bash
npm install react react-konva konva
# react >= 18, react-konva >= 18, konva >= 9
```

---

## Instalación

```bash
npm install @storyboard-os/canvas
# or
pnpm add @storyboard-os/canvas
```

---

## Comienzo rápido

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

## Propiedades

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

## Configuración del dominio

`StoryboardCanvasConfig` es la única información que el lienzo necesita conocer sobre tu dominio.

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

## Etiquetas de fotograma

Los dominios pueden adjuntar "chips" de etiquetas a las tarjetas de fotogramas sin que el lienzo sepa lo que significan.

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

En `rpg-storyboard`, `getFrameBadges(frame, connections)` de `@storyboard-os/rpg-domain` genera estas etiquetas. El lienzo las renderiza sin necesidad de saber lo que significan "ESTADO" o "ESPECIFICACIÓN".

---

## Manejador de la vista

`StoryboardCanvas` es un componente `forwardRef`. Pasa una referencia (`ref`) para obtener el `ViewportHandle`:

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

## Modelo de interacción de la vista

| Gestos | Efecto |
|---|---|
| Arrastrar el fondo | Desplazamiento |
| Ctrl/Cmd + rueda de desplazamiento | Zoom en la posición del cursor |
| Desplazamiento normal | Desplazamiento (con trackpad de dos dedos) |
| Arrastrar fotogramas | Reposiciona el fotograma; activa `onFramePositionChange` al soltar. |
| Hacer clic en un fotograma | Selecciona el fotograma; activa `onSelectFrame`. |
| Hacer clic en una conexión | Selecciona la conexión; activa `onSelectConnection`. |
| Hacer clic en el fondo | Deselecciona; activa `onSelectFrame(null)`. |

El mecanismo de protección contra el arrastre del fondo (`e.target !== stage`) evita que el desplazamiento se active cuando se está arrastrando una tarjeta de fotograma.

---

## Tamaño del contenedor

`StoryboardCanvas` utiliza un `ResizeObserver` para medir su contenedor y lo rellena completamente. No se deben pasar propiedades explícitas de `width` o `height`; simplemente, se debe definir un tamaño para el contenedor.

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

## Cálculos de la vista — utilidades independientes

Las funciones de cálculo de la vista son puras y no tienen dependencias de React o Konva. Se exportan para que las aplicaciones puedan calcular el diseño o el posicionamiento fuera del componente del lienzo.

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

Las 27 pruebas de cálculo de la vista en `viewport.test.ts` se ejecutan sin DOM ni Konva, lo que las hace rápidas y fiables en CI.

---

## Arquitectura

```
@storyboard-os/canvas        ← you are here
  └── react, react-konva, konva  (peer deps)

apps/rpg-storyboard
  ├── @storyboard-os/canvas
  └── @storyboard-os/rpg-domain  (provides config + badge data)
```

`@storyboard-os/canvas` **no** importa nada de `@storyboard-os/core`, `@storyboard-os/rpg-domain` ni de ninguna aplicación. La configuración del dominio se introduce a través de propiedades; el lienzo nunca accede a la capa del dominio.

La verificación canónica: buscar `rpg-domain`, `quest`, `npc_beat` o `stateChange` en el código fuente de este paquete no debe devolver ningún resultado.

---

## Modelo de seguridad

`@storyboard-os/canvas` es una biblioteca de componentes React. No tiene acceso a la red, ni lecturas ni escrituras en localStorage, ni efectos en el lado del servidor, ni telemetría. Toda la persistencia es responsabilidad de la aplicación que lo utiliza a través de `onFramePositionChange`.

---

<p align="center">Part of <a href="https://github.com/mcp-tool-shop-org/storyboard-os">storyboard-os</a> · Built by <a href="https://mcp-tool-shop.github.io/">MCP Tool Shop</a></p>
