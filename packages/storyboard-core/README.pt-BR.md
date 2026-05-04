<p align="center">
  <a href="README.ja.md">日本語</a> | <a href="README.zh.md">中文</a> | <a href="README.es.md">Español</a> | <a href="README.fr.md">Français</a> | <a href="README.hi.md">हिन्दी</a> | <a href="README.it.md">Italiano</a> | <a href="README.md">English</a>
</p>

<p align="center">
  <img src="https://raw.githubusercontent.com/mcp-tool-shop-org/brand/main/logos/storyboard-os/readme.png" alt="Storyboard OS" width="400" />
</p>

<p align="center">
  <a href="https://github.com/mcp-tool-shop-org/storyboard-os/actions/workflows/ci.yml"><img src="https://github.com/mcp-tool-shop-org/storyboard-os/actions/workflows/ci.yml/badge.svg" alt="CI" /></a>
  <a href="https://www.npmjs.com/package/@storyboard-os/core"><img src="https://img.shields.io/npm/v/@storyboard-os/core.svg" alt="npm" /></a>
  <a href="../../LICENSE"><img src="https://img.shields.io/badge/license-MIT-blue.svg" alt="MIT License" /></a>
</p>

<p align="center"><strong>Elementos básicos genéricos para storyboards. Sem vocabulário específico de domínio.</strong></p>

---

# @storyboard-os/core

A base estrutural da plataforma Storyboard OS. Define os tipos genéricos que todos os pacotes de domínio especializam: quadros, conexões, anotações, storyboards, modelos e validação estrutural.

O pacote `@storyboard-os/core` **não possui dependências** e **não contém vocabulário específico de domínio**. Ele não sabe o que é uma missão de RPG, uma cena de roteiro ou um mapa de campanha. Os pacotes de domínio importam esses elementos genéricos e os especializam com seus próprios esquemas de conteúdo e tipos de quadros.

---

## Instalação

```bash
npm install @storyboard-os/core
# or
pnpm add @storyboard-os/core
```

---

## O que ele oferece

### Quadro

Um `StoryboardFrame` é um elemento narrativo — a unidade básica de qualquer storyboard.

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

Os domínios definem os parâmetros de tipo:
```ts
// In @storyboard-os/rpg-domain:
type StoryboardFrame = CoreFrame<StoryboardFrameType, FrameContent, FrameAnnotationType>;
```

### Anotação

Notas de criação específicas para cada quadro, definidas por domínio.

```ts
interface FrameAnnotation<TAnnotationType extends string = string> {
  id: string;
  type: TAnnotationType;
  text: string;
}
```

### Conexão

As conexões são entidades de primeira classe — não estão "escondidas" em `frame.links`. O tipo de conexão define a renderização visual (espessura da linha, padrão de traço) e carrega significado semântico.

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

Uma coleção de quadros e conexões com um ID e um título.

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

### Projeto

Um contêiner simples para um ou mais storyboards. Não é um banco de dados de domínio — apenas uma estrutura suficiente para agrupar storyboards relacionados sob um nome.

```ts
interface StoryboardProject<TStoryboard extends Storyboard = Storyboard> {
  id: string;
  title: string;
  description?: string;
  storyboards: TStoryboard[];
}
```

### Modelo

Uma fábrica para criar storyboards específicos de domínio a partir de um ponto de partida.

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

## Validação estrutural

`validateStoryboard` verifica invariantes que são válidas para **qualquer** storyboard, independentemente do domínio: IDs de quadros duplicados, referências de conexão interrompidas, campos obrigatórios ausentes e dimensões de quadro inválidas.

```ts
import { validateStoryboard } from '@storyboard-os/core';

const result = validateStoryboard(storyboard);

if (!result.valid) {
  for (const error of result.errors) {
    console.error(error.code, error.message, error.frameId ?? error.connectionId);
  }
}
```

### Códigos de erro

| Código | Significado |
|---|---|
| `EMPTY_STORYBOARD` | Não há quadros no storyboard |
| `DUPLICATE_FRAME_ID` | Dois quadros compartilham o mesmo ID |
| `MISSING_TITLE` | O quadro não tem título |
| `MISSING_TYPE` | O quadro não tem tipo |
| `MISSING_SUMMARY` | O quadro não tem resumo |
| `INVALID_DIMENSIONS` | Largura ou altura do quadro abaixo do mínimo de 40px |
| `BROKEN_CONNECTION_FROM` | A conexão `fromFrameId` referencia um quadro inexistente |
| `BROKEN_CONNECTION_TO` | A conexão `toFrameId` referencia um quadro inexistente |

Os pacotes de domínio chamam `validateStoryboard` primeiro e, em seguida, aplicam suas próprias regras de domínio. O pacote `@storyboard-os/rpg-domain` exporta `validateRpgStoryboard`, que faz exatamente isso.

---

## Extensão da plataforma

Para criar uma nova funcionalidade sobre o pacote `@storyboard-os/core`:

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

## Posição na arquitetura

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

O pacote `@storyboard-os/core` está na base da cadeia de dependências. Ele não importa nada da plataforma. Os pacotes subsequentes importam de cima para baixo — eles nunca importam de baixo para cima.

---

## Modelo de confiança

O pacote `@storyboard-os/core` é uma biblioteca TypeScript pura. Ele não tem efeitos em tempo de execução, nenhuma entrada/saída, nenhum acesso à rede e nenhum efeito colateral. A função `validateStoryboard` lê o objeto de storyboard que você passa e retorna um objeto de resultado simples. Nada é armazenado, registrado ou transmitido.

---

<p align="center">Part of <a href="https://github.com/mcp-tool-shop-org/storyboard-os">storyboard-os</a> · Built by <a href="https://mcp-tool-shop.github.io/">MCP Tool Shop</a></p>
