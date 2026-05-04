<p align="center">
  <a href="README.ja.md">日本語</a> | <a href="README.zh.md">中文</a> | <a href="README.es.md">Español</a> | <a href="README.md">English</a> | <a href="README.hi.md">हिन्दी</a> | <a href="README.it.md">Italiano</a> | <a href="README.pt-BR.md">Português (BR)</a>
</p>

<p align="center">
  <img src="https://raw.githubusercontent.com/mcp-tool-shop-org/brand/main/logos/storyboard-os/readme.png" alt="Storyboard OS" width="400" />
</p>

<p align="center">
  <a href="https://github.com/mcp-tool-shop-org/storyboard-os/actions/workflows/ci.yml"><img src="https://github.com/mcp-tool-shop-org/storyboard-os/actions/workflows/ci.yml/badge.svg" alt="CI" /></a>
  <a href="https://www.npmjs.com/package/@storyboard-os/canvas"><img src="https://img.shields.io/npm/v/@storyboard-os/canvas.svg" alt="npm" /></a>
  <a href="../../LICENSE"><img src="https://img.shields.io/badge/license-MIT-blue.svg" alt="MIT License" /></a>
</p>

<p align="center"><strong>Rendu de canvas Konva configurable pour Storyboard OS.</strong></p>

---

# @storyboard-os/canvas

Un moteur de rendu de canvas basé sur Konva pour la création interactive de storyboards. Il affiche les images, les connexions, la sélection, le glissement, les étiquettes de type, et les libellés de connexion. Il **ne possède aucune connaissance du vocabulaire spécifique à un domaine (RPG, scénario, etc.)** ; toute configuration visuelle est injectée par l'application qui l'utilise.

Un autre domaine (scénario, jeu de rôle, carte de jeu) peut fournir sa propre configuration et obtenir un canvas entièrement fonctionnel sans modifier ce paquet.

---

## Dépendances indirectes

```bash
npm install react react-konva konva
# react >= 18, react-konva >= 18, konva >= 9
```

---

## Installation

```bash
npm install @storyboard-os/canvas
# or
pnpm add @storyboard-os/canvas
```

---

## Démarrage rapide

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

## Propriétés

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

## Configuration du domaine

L'objet `StoryboardCanvasConfig` est la seule information que le canvas doit connaître sur votre domaine.

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

## Étiquettes des images

Les domaines peuvent ajouter des étiquettes aux images sans que le canvas ait besoin de savoir ce qu'elles signifient.

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

Dans `rpg-storyboard`, la fonction `getFrameBadges(frame, connections)` de `@storyboard-os/rpg-domain` génère ces étiquettes. Le canvas les affiche sans avoir besoin de savoir ce que signifient "ÉTAT" ou "SPÉC".

---

## Gestionnaire de la zone d'affichage

`StoryboardCanvas` est un composant `forwardRef`. Passez une référence (`ref`) pour obtenir l'objet `ViewportHandle` :

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

## Modèle d'interaction de la zone d'affichage

| Geste | Effet |
|---|---|
| Glissement de l'arrière-plan | Déplacement |
| Ctrl/Cmd + molette de défilement | Zoom à la position du curseur |
| Défilement simple | Déplacement (piste tactile bidirectionnelle) |
| Glissement de l'image | Redéplacement de l'image ; déclenche `onFramePositionChange` au relâchement. |
| Clic sur l'image | Sélectionne l'image ; déclenche `onSelectFrame`. |
| Clic sur la connexion | Sélectionne la connexion ; déclenche `onSelectConnection`. |
| Clic sur l'arrière-plan | Désélectionne ; déclenche `onSelectFrame(null)`. |

La protection contre le glissement de l'arrière-plan (`e.target !== stage`) empêche le déplacement lorsque l'image est en cours de glissement.

---

## Dimensionnement du conteneur

`StoryboardCanvas` utilise un `ResizeObserver` pour mesurer son conteneur et le remplir complètement. Ne pas passer de propriétés `width` ou `height` explicites ; donnez simplement au conteneur une taille.

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

## Calculs de la zone d'affichage — utilitaires autonomes

Les fonctions de calcul de la zone d'affichage sont pures et n'ont aucune dépendance à React ou Konva. Elles sont exportées pour les applications qui doivent calculer la mise en page ou le positionnement en dehors du composant canvas.

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

Les 27 tests de calcul de la zone d'affichage dans `viewport.test.ts` s'exécutent sans DOM ni Konva, ce qui les rend rapides et fiables dans l'environnement CI.

---

## Architecture

```
@storyboard-os/canvas        ← you are here
  └── react, react-konva, konva  (peer deps)

apps/rpg-storyboard
  ├── @storyboard-os/canvas
  └── @storyboard-os/rpg-domain  (provides config + badge data)
```

`@storyboard-os/canvas` **n'importe pas** depuis `@storyboard-os/core`, `@storyboard-os/rpg-domain`, ou toute autre application. La configuration du domaine est transmise via les propriétés ; le canvas n'accède jamais à la couche du domaine.

La vérification canonique : la recherche de `rpg-domain`, `quest`, `npc_beat`, ou `stateChange` dans le code source de ce paquet ne doit rien renvoyer.

---

## Modèle de confiance

`@storyboard-os/canvas` est une bibliothèque de composants React. Elle n'a pas d'accès réseau, ne lit ni n'écrit dans le localStorage, n'a pas d'effets côté serveur, et ne collecte aucune donnée de télémétrie. Toute persistance est la responsabilité de l'application qui l'utilise via `onFramePositionChange`.

---

<p align="center">Part of <a href="https://github.com/mcp-tool-shop-org/storyboard-os">storyboard-os</a> · Built by <a href="https://mcp-tool-shop.github.io/">MCP Tool Shop</a></p>
