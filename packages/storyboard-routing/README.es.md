<p align="center">
  <a href="README.ja.md">日本語</a> | <a href="README.zh.md">中文</a> | <a href="README.md">English</a> | <a href="README.fr.md">Français</a> | <a href="README.hi.md">हिन्दी</a> | <a href="README.it.md">Italiano</a> | <a href="README.pt-BR.md">Português (BR)</a>
</p>

<p align="center">
  <img src="https://raw.githubusercontent.com/mcp-tool-shop-org/brand/main/logos/storyboard-os/readme.png" alt="Storyboard OS" width="400" />
</p>

<p align="center">
  <a href="https://github.com/mcp-tool-shop-org/storyboard-os/actions/workflows/ci.yml"><img src="https://github.com/mcp-tool-shop-org/storyboard-os/actions/workflows/ci.yml/badge.svg" alt="CI" /></a>
  <a href="https://www.npmjs.com/package/@storyboard-os/routing"><img src="https://img.shields.io/npm/v/@storyboard-os/routing.svg" alt="npm" /></a>
  <a href="../../LICENSE"><img src="https://img.shields.io/badge/license-MIT-blue.svg" alt="MIT License" /></a>
</p>

<p align="center"><strong>Ayudantes configurables para la construcción de URLs para aplicaciones de Storyboard OS. Sin dependencias.</strong></p>

---

# @storyboard-os/routing

Ayudantes para la construcción de URLs para aplicaciones construidas sobre la plataforma Storyboard OS. Genera URLs para "boards", "frames" y proyectos a partir de una única configuración.  Es una transformación pura de cadenas de texto a cadenas de texto: sin dependencias de frameworks, sin DOM, sin efectos secundarios.

Cada aplicación proporciona su propia ruta base. Una segunda aplicación con una estructura de URL diferente utiliza una configuración diferente y nunca entra en conflicto con la primera.

---

## Instalación

```bash
npm install @storyboard-os/routing
# or
pnpm add @storyboard-os/routing
```

---

## Uso

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

El "factory" elimina las barras diagonales finales de `storyboardBasePath`:

```ts
createStoryboardRoutes({ storyboardBasePath: '/storyboards/' })
  .boardRoute('quest-01')
// → '/storyboards/quest-01'   (trailing slash removed)
```

---

## API

### `createStoryboardRoutes(config)`

Devuelve un objeto `StoryboardRoutes` vinculado a la ruta base especificada.

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

La ruta `projectRoute` no se ve afectada por `storyboardBasePath`: los proyectos siempre se encuentran en `/projects`. Solo las rutas de "storyboard" y "frame" utilizan la ruta base configurada.

---

## Múltiples aplicaciones, múltiples configuraciones

Cada aplicación crea su propio "factory" de rutas. Nunca comparten estado:

```ts
// rpg-storyboard app
const rpgRoutes = createStoryboardRoutes({ storyboardBasePath: '/storyboards' });

// A hypothetical screenplay app
const screenplayRoutes = createStoryboardRoutes({ storyboardBasePath: '/scenes' });

rpgRoutes.boardRoute('quest-01')       // '/storyboards/quest-01'
screenplayRoutes.boardRoute('act-1')   // '/scenes/act-1'
```

---

## Patrón de re-exportación simplificado

Normalmente, las aplicaciones re-exportan una instancia preconfigurada para que los componentes de página importen desde la capa de la aplicación, y no directamente desde el paquete:

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

Esto mantiene las importaciones internas estables a medida que las versiones de los paquetes evolucionan: solo es necesario actualizar el archivo de re-exportación.

---

## Posición en la arquitectura

```
@storyboard-os/routing       ← you are here
  └── (no dependencies)

apps/rpg-storyboard
  └── @storyboard-os/routing
```

`@storyboard-os/routing` no tiene importaciones de la plataforma ni de ningún paquete de dominio. Es una utilidad pura: lo único que hace es concatenar cadenas de texto según la configuración que proporcione.

---

## Modelo de confianza

`@storyboard-os/routing` es una biblioteca pura de manipulación de cadenas de texto. No tiene efectos secundarios en tiempo de ejecución, ni E/S, ni acceso a la red, ni dependencias. Todas las funciones son síncronas y transparentes.

---

<p align="center">Part of <a href="https://github.com/mcp-tool-shop-org/storyboard-os">storyboard-os</a> · Built by <a href="https://mcp-tool-shop.github.io/">MCP Tool Shop</a></p>
