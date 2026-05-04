<p align="center">
  <a href="README.ja.md">日本語</a> | <a href="README.zh.md">中文</a> | <a href="README.md">English</a> | <a href="README.fr.md">Français</a> | <a href="README.hi.md">हिन्दी</a> | <a href="README.it.md">Italiano</a> | <a href="README.pt-BR.md">Português (BR)</a>
</p>

<p align="center">
  <img src="https://raw.githubusercontent.com/mcp-tool-shop-org/brand/main/logos/storyboard-os/readme.png" alt="Storyboard OS" width="400" />
</p>

<p align="center">
  <a href="https://github.com/mcp-tool-shop-org/storyboard-os/actions/workflows/ci.yml"><img src="https://github.com/mcp-tool-shop-org/storyboard-os/actions/workflows/ci.yml/badge.svg" alt="CI" /></a>
  <a href="https://www.npmjs.com/package/@storyboard-os/core"><img src="https://img.shields.io/npm/v/@storyboard-os/core.svg" alt="npm" /></a>
  <a href="../../LICENSE"><img src="https://img.shields.io/badge/license-MIT-blue.svg" alt="MIT License" /></a>
</p>

<p align="center"><strong>Elementos básicos genéricos para guiones gráficos. No utiliza vocabulario específico de ningún dominio.</strong></p>

---

# @storyboard-os/core

La base estructural de la plataforma Storyboard OS. Define los tipos genéricos que todos los paquetes de dominio especializan: fotogramas, conexiones, anotaciones, guiones gráficos, plantillas y validación estructural.

`@storyboard-os/core` **no tiene dependencias** y **no contiene vocabulario específico de ningún dominio**. No sabe qué es una misión de RPG, una escena de guion cinematográfico o un mapa de campaña. Los paquetes de dominio importan estos elementos genéricos y los especializan con sus propios esquemas de contenido y tipos de fotogramas.

---

## Instalación

```bash
npm install @storyboard-os/core
# or
pnpm add @storyboard-os/core
```

---

## Lo que proporciona

### Fotograma

Un `StoryboardFrame` es una unidad narrativa, la unidad básica de cualquier guion gráfico.

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

Los dominios definen los parámetros de tipo:
```ts
// In @storyboard-os/rpg-domain:
type StoryboardFrame = CoreFrame<StoryboardFrameType, FrameContent, FrameAnnotationType>;
```

### Anotación

Notas de autoría específicas de cada fotograma, tipadas por dominio.

```ts
interface FrameAnnotation<TAnnotationType extends string = string> {
  id: string;
  type: TAnnotationType;
  text: string;
}
```

### Conexión

Las conexiones son entidades de primer nivel, no están ocultas en `frame.links`. El tipo de conexión determina la representación visual (grosor de línea, patrón de guiones) y lleva un significado semántico.

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

### Guion gráfico

Una colección de fotogramas y conexiones con un ID y un título.

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

### Proyecto

Un contenedor simple para uno o más guiones gráficos. No es una base de datos de dominio, sino una estructura suficiente para agrupar guiones gráficos relacionados bajo un nombre.

```ts
interface StoryboardProject<TStoryboard extends Storyboard = Storyboard> {
  id: string;
  title: string;
  description?: string;
  storyboards: TStoryboard[];
}
```

### Plantilla

Un generador para crear guiones gráficos específicos de un dominio a partir de un punto de partida.

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

## Validación estructural

`validateStoryboard` verifica invariantes que se cumplen para **cualquier** guion gráfico, independientemente del dominio: IDs de fotogramas duplicados, referencias de conexión rotas, campos obligatorios faltantes y dimensiones de fotogramas inválidas.

```ts
import { validateStoryboard } from '@storyboard-os/core';

const result = validateStoryboard(storyboard);

if (!result.valid) {
  for (const error of result.errors) {
    console.error(error.code, error.message, error.frameId ?? error.connectionId);
  }
}
```

### Códigos de error

| Código | Significado |
|---|---|
| `EMPTY_STORYBOARD` | No hay fotogramas en el guion gráfico |
| `DUPLICATE_FRAME_ID` | Dos fotogramas comparten el mismo ID |
| `MISSING_TITLE` | El fotograma no tiene título |
| `MISSING_TYPE` | El fotograma no tiene tipo |
| `MISSING_SUMMARY` | El fotograma no tiene resumen |
| `INVALID_DIMENSIONS` | Ancho o alto del fotograma por debajo del mínimo de 40px |
| `BROKEN_CONNECTION_FROM` | La conexión `fromFrameId` hace referencia a un fotograma inexistente |
| `BROKEN_CONNECTION_TO` | La conexión `toFrameId` hace referencia a un fotograma inexistente |

Los paquetes de dominio llaman a `validateStoryboard` primero, y luego aplican sus propias reglas específicas del dominio. `@storyboard-os/rpg-domain` exporta `validateRpgStoryboard`, que hace exactamente esto.

---

## Extender la plataforma

Para crear una nueva funcionalidad sobre `@storyboard-os/core`:

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

## Posición en la arquitectura

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

`@storyboard-os/core` está en la parte inferior de la cadena de dependencias. No importa nada de la plataforma. Los paquetes posteriores importan desde arriba; nunca importan desde abajo.

---

## Modelo de confianza

`@storyboard-os/core` es una biblioteca TypeScript pura. No tiene efectos en tiempo de ejecución, ni E/S, ni acceso a la red, ni efectos secundarios. La función `validateStoryboard` lee el objeto de guion gráfico que se le pasa y devuelve un objeto de resultado simple. Nada se guarda, se registra o se transmite.

---

<p align="center">Part of <a href="https://github.com/mcp-tool-shop-org/storyboard-os">storyboard-os</a> · Built by <a href="https://mcp-tool-shop.github.io/">MCP Tool Shop</a></p>
