<p align="center">
  <a href="README.ja.md">日本語</a> | <a href="README.zh.md">中文</a> | <a href="README.es.md">Español</a> | <a href="README.md">English</a> | <a href="README.hi.md">हिन्दी</a> | <a href="README.it.md">Italiano</a> | <a href="README.pt-BR.md">Português (BR)</a>
</p>

<p align="center">
  <img src="https://raw.githubusercontent.com/mcp-tool-shop-org/brand/main/logos/storyboard-os/readme.png" alt="Storyboard OS" width="400" />
</p>

<p align="center">
  <a href="https://github.com/mcp-tool-shop-org/storyboard-os/actions/workflows/ci.yml"><img src="https://github.com/mcp-tool-shop-org/storyboard-os/actions/workflows/ci.yml/badge.svg" alt="CI" /></a>
  <a href="https://www.npmjs.com/package/@storyboard-os/routing"><img src="https://img.shields.io/npm/v/@storyboard-os/routing.svg" alt="npm" /></a>
  <a href="../../LICENSE"><img src="https://img.shields.io/badge/license-MIT-blue.svg" alt="MIT License" /></a>
</p>

<p align="center"><strong>Fonctions utilitaires configurables pour la construction d'URL pour les applications Storyboard OS. Aucune dépendance.</strong></p>

---

# @storyboard-os/routing

Fonctions utilitaires pour la construction d'URL pour les applications développées sur la plateforme Storyboard OS. Génère des URL pour les tableaux, les cadres et les projets à partir d'une seule configuration. Pure transformation de chaînes de caractères en chaînes de caractères : aucune dépendance de framework, pas de DOM, pas d'effets secondaires.

Chaque application fournit son propre chemin de base. Une deuxième application avec une structure d'URL différente utilise une configuration différente et ne crée jamais de conflit avec la première.

---

## Installation

```bash
npm install @storyboard-os/routing
# or
pnpm add @storyboard-os/routing
```

---

## Utilisation

```ts
import { createStoryboardRoutes } from '@storyboard-os/routing';

// Create a route factory for your app's URL structure
const routes = createStoryboardRoutes({ storyboardBasePath: '/storyboards' });

// Board — the canvas view
routes.boardRoute('quest-01')
// → '/storyboards/quest-01'

// Frame — the beat detail page
routes.frameRoute('quest-01', 'hook-arrival')
// → '/storyboards/quest-01/frames/hook-arrival'

// Project — a user-authored project board
routes.projectRoute('my-project-id')
// → '/projects/my-project-id'
```

La fonction génératrice supprime les barres obliques finales de `storyboardBasePath` :

```ts
createStoryboardRoutes({ storyboardBasePath: '/storyboards/' })
  .boardRoute('quest-01')
// → '/storyboards/quest-01'   (trailing slash removed)
```

---

## API

### `createStoryboardRoutes(config)`

Retourne un objet `StoryboardRoutes` lié au chemin de base spécifié.

```ts
function createStoryboardRoutes(config: StoryboardRouteConfig): StoryboardRoutes;

interface StoryboardRouteConfig {
  /** Base path for board and frame URLs. Example: '/storyboards'. */
  storyboardBasePath: string;
}

interface StoryboardRoutes {
  /** Board canvas URL: `<base>/<storyboardId>` */
  boardRoute(storyboardId: string): string;

  /** Beat detail page URL: `<base>/<storyboardId>/frames/<frameId>` */
  frameRoute(storyboardId: string, frameId: string): string;

  /** Project board URL: `/projects/<projectId>` (always at /projects) */
  projectRoute(projectId: string): string;
}
```

L'URL `projectRoute` n'est pas affectée par `storyboardBasePath` : les projets se trouvent toujours à `/projects`. Seules les URL des tableaux et des cadres utilisent le chemin de base configuré.

---

## Plusieurs applications, plusieurs configurations

Chaque application crée sa propre fonction génératrice d'URL. Elles ne partagent jamais d'état :

```ts
// rpg-storyboard app
const rpgRoutes = createStoryboardRoutes({ storyboardBasePath: '/storyboards' });

// A hypothetical screenplay app
const screenplayRoutes = createStoryboardRoutes({ storyboardBasePath: '/scenes' });

rpgRoutes.boardRoute('quest-01')       // '/storyboards/quest-01'
screenplayRoutes.boardRoute('act-1')   // '/scenes/act-1'
```

---

## Modèle de réexportation minimaliste

Les applications réexportent généralement une instance préconfigurée afin que les composants de page importent depuis la couche de l'application, et non directement depuis le package :

```ts
// apps/rpg-storyboard/src/lib/routes.ts
import { createStoryboardRoutes } from '@storyboard-os/routing';

export const routes = createStoryboardRoutes({ storyboardBasePath: '/storyboards' });
```

```ts
// anywhere in the app
import { routes } from '../lib/routes';

const href = routes.boardRoute(storyboard.id);
```

Cela maintient les importations internes stables à mesure que les versions des packages évoluent : seul le fichier de réexportation doit être mis à jour.

---

## Positionnement architectural

```
@storyboard-os/routing       ← you are here
  └── (no dependencies)

apps/rpg-storyboard
  └── @storyboard-os/routing
```

`@storyboard-os/routing` n'importe rien de la plateforme ni d'aucun package de domaine. C'est une simple utilitaire : sa seule fonction est de concaténer des chaînes de caractères en fonction de la configuration que vous fournissez.

---

## Modèle de confiance

`@storyboard-os/routing` est une bibliothèque de manipulation de chaînes de caractères. Elle n'a pas d'effets secondaires à l'exécution, pas d'E/S, pas d'accès au réseau et aucune dépendance. Toutes les fonctions sont synchrones et transparentes.

---

<p align="center">Part of <a href="https://github.com/mcp-tool-shop-org/storyboard-os">storyboard-os</a> · Built by <a href="https://mcp-tool-shop.github.io/">MCP Tool Shop</a></p>
