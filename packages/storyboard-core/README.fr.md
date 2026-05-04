<p align="center">
  <a href="README.ja.md">日本語</a> | <a href="README.zh.md">中文</a> | <a href="README.es.md">Español</a> | <a href="README.md">English</a> | <a href="README.hi.md">हिन्दी</a> | <a href="README.it.md">Italiano</a> | <a href="README.pt-BR.md">Português (BR)</a>
</p>

<p align="center">
  <img src="https://raw.githubusercontent.com/mcp-tool-shop-org/brand/main/logos/storyboard-os/readme.png" alt="Storyboard OS" width="400" />
</p>

<p align="center">
  <a href="https://github.com/mcp-tool-shop-org/storyboard-os/actions/workflows/ci.yml"><img src="https://github.com/mcp-tool-shop-org/storyboard-os/actions/workflows/ci.yml/badge.svg" alt="CI" /></a>
  <a href="https://www.npmjs.com/package/@storyboard-os/core"><img src="https://img.shields.io/npm/v/@storyboard-os/core.svg" alt="npm" /></a>
  <a href="../../LICENSE"><img src="https://img.shields.io/badge/license-MIT-blue.svg" alt="MIT License" /></a>
</p>

<p align="center"><strong>Éléments de base génériques pour les storyboards. Pas de vocabulaire spécifique à un domaine.</strong></p>

---

# @storyboard-os/core

La base structurelle de la plateforme Storyboard OS. Elle définit les types génériques que tous les modules spécifiques à un domaine utilisent : cadres, connexions, annotations, storyboards, modèles et validation structurelle.

`@storyboard-os/core` n'a **aucune dépendance** et ne contient **aucun vocabulaire spécifique à un domaine**. Elle ne sait pas ce qu'est une quête de RPG, une scène de scénario ou une carte de campagne. Les modules spécifiques à un domaine importent ces éléments génériques et les spécialisent avec leurs propres schémas de données et types de cadres.

---

## Installation

```bash
npm install @storyboard-os/core
# or
pnpm add @storyboard-os/core
```

---

## Ce qu'elle fournit

### Cadre

Un `StoryboardFrame` représente une unité narrative, l'élément atomique de tout storyboard.

```ts
interface StoryboardFrame<
  TFrameType extends string = string,
  TContent = unknown,
  TAnnotationType extends string = string,
> {
  id: string;
  type: TFrameType;
  title: string;
  summary: string;
  position: { x: number; y: number };
  size: { width: number; height: number };
  content: TContent;
  annotations: FrameAnnotation<TAnnotationType>[];
}
```

Les modules spécifiques à un domaine définissent les paramètres de type :
```ts
// In @storyboard-os/rpg-domain:
type StoryboardFrame = CoreFrame<StoryboardFrameType, FrameContent, FrameAnnotationType>;
```

### Annotation

Notes rédigées pour chaque cadre, typées par module.

```ts
interface FrameAnnotation<TAnnotationType extends string = string> {
  id: string;
  type: TAnnotationType;
  text: string;
}
```

### Connexion

Les connexions sont des entités de premier plan, et ne sont pas intégrées dans `frame.links`. Le type de connexion détermine le rendu visuel (épaisseur du trait, motif de pointillés) et porte un sens sémantique.

```ts
type StoryboardConnectionType =
  | 'sequence'      // linear progression
  | 'choice'        // player-driven branch
  | 'consequence'   // outcome arc driven by state change
  | 'optional'      // conditional / skippable path
  | 'fallback';     // alternate route if primary is blocked

interface StoryboardConnection {
  id: string;
  fromFrameId: string;
  toFrameId: string;
  type: StoryboardConnectionType;
  label?: string;
}
```

### Storyboard

Une collection de cadres et de connexions, avec un identifiant et un titre.

```ts
interface Storyboard<TFrame extends AnyStoryboardFrame = AnyStoryboardFrame> {
  id: string;
  title: string;
  description?: string;
  templateId?: string;
  frames: TFrame[];
  connections: StoryboardConnection[];
  canvasWidth?: number;
  canvasHeight?: number;
}
```

### Projet

Un conteneur simple pour un ou plusieurs storyboards. Ce n'est pas une base de données spécifique à un domaine, mais une structure suffisante pour regrouper des storyboards connexes sous un nom.

```ts
interface StoryboardProject<TStoryboard extends Storyboard = Storyboard> {
  id: string;
  title: string;
  description?: string;
  storyboards: TStoryboard[];
}
```

### Modèle

Un outil de création de storyboards spécifiques à un domaine, à partir d'un point de départ.

```ts
interface StoryboardTemplateDefinition<
  TId extends string = string,
  TStoryboard extends Storyboard = Storyboard,
> {
  id: TId;
  name: string;
  description: string;
  frameCount: number;
  bestFor: string;
  createStoryboard: (input: CreateStoryboardInput) => TStoryboard;
}

interface CreateStoryboardInput {
  id: string;
  title: string;
  description?: string;
}
```

---

## Validation structurelle

`validateStoryboard` vérifie les invariants qui sont valables pour **tout** storyboard, quel que soit le domaine : identifiants de cadres en double, références de connexions rompues, champs obligatoires manquants et dimensions de cadres non valides.

```ts
import { validateStoryboard } from '@storyboard-os/core';

const result = validateStoryboard(storyboard);

if (!result.valid) {
  for (const error of result.errors) {
    console.error(error.code, error.message, error.frameId ?? error.connectionId);
  }
}
```

### Codes d'erreur

| Code | Signification |
|---|---|
| `EMPTY_STORYBOARD` | Aucun cadre dans le storyboard |
| `DUPLICATE_FRAME_ID` | Deux cadres partagent le même identifiant |
| `MISSING_TITLE` | Le cadre n'a pas de titre |
| `MISSING_TYPE` | Le cadre n'a pas de type |
| `MISSING_SUMMARY` | Le cadre n'a pas de résumé |
| `INVALID_DIMENSIONS` | Largeur ou hauteur du cadre inférieure à 40px (minimum) |
| `BROKEN_CONNECTION_FROM` | La connexion `fromFrameId` fait référence à un cadre inexistant |
| `BROKEN_CONNECTION_TO` | La connexion `toFrameId` fait référence à un cadre inexistant |

Les modules spécifiques à un domaine appellent `validateStoryboard` en premier, puis ajoutent leurs propres règles spécifiques au domaine. `@storyboard-os/rpg-domain` exporte `validateRpgStoryboard`, qui fait exactement cela.

---

## Extension de la plateforme

Pour créer un nouveau module spécifique à un domaine au-dessus de `@storyboard-os/core` :

```ts
// 1. Define your frame type union
type ScreenplayFrameType = 'scene' | 'beat' | 'sequence' | 'act_break';

// 2. Define your content shape
interface ScreenplayContent {
  sceneHeading: string;
  action: string;
  dialogue: string[];
  characterPresent: string[];
}

// 3. Specialize the generic frame type
import type { StoryboardFrame as CoreFrame } from '@storyboard-os/core';
type ScreenplayFrame = CoreFrame<ScreenplayFrameType, ScreenplayContent, 'note' | 'revision'>;

// 4. Build your domain package — validateStoryboard handles the structural layer
```

---

## Position dans l'architecture

```
@storyboard-os/core          ← you are here
  └── (no dependencies)

@storyboard-os/rpg-domain
  └── @storyboard-os/core

@storyboard-os/canvas
  └── (no platform deps — pure Konva + React)

apps/rpg-storyboard
  └── all @storyboard-os/* packages
```

`@storyboard-os/core` se trouve au bas de la chaîne de dépendances. Il n'importe rien d'autre de la plateforme. Les modules suivants importent les modules situés en amont ; ils n'importent jamais les modules situés en aval.

---

## Modèle de confiance

`@storyboard-os/core` est une bibliothèque TypeScript pure. Elle n'a pas d'effets d'exécution, pas d'E/S, pas d'accès au réseau et pas d'effets secondaires. La fonction `validateStoryboard` lit l'objet storyboard que vous lui passez et renvoie un simple objet de résultat. Rien n'est stocké, enregistré ou transmis.

---

<p align="center">Part of <a href="https://github.com/mcp-tool-shop-org/storyboard-os">storyboard-os</a> · Built by <a href="https://mcp-tool-shop.github.io/">MCP Tool Shop</a></p>
