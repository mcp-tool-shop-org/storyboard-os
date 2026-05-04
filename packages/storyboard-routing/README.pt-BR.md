<p align="center">
  <a href="README.ja.md">日本語</a> | <a href="README.zh.md">中文</a> | <a href="README.es.md">Español</a> | <a href="README.fr.md">Français</a> | <a href="README.hi.md">हिन्दी</a> | <a href="README.it.md">Italiano</a> | <a href="README.md">English</a>
</p>

<p align="center">
  <img src="https://raw.githubusercontent.com/mcp-tool-shop-org/brand/main/logos/storyboard-os/readme.png" alt="Storyboard OS" width="400" />
</p>

<p align="center">
  <a href="https://github.com/mcp-tool-shop-org/storyboard-os/actions/workflows/ci.yml"><img src="https://github.com/mcp-tool-shop-org/storyboard-os/actions/workflows/ci.yml/badge.svg" alt="CI" /></a>
  <a href="https://www.npmjs.com/package/@storyboard-os/routing"><img src="https://img.shields.io/npm/v/@storyboard-os/routing.svg" alt="npm" /></a>
  <a href="../../LICENSE"><img src="https://img.shields.io/badge/license-MIT-blue.svg" alt="MIT License" /></a>
</p>

<p align="center"><strong>Funções auxiliares configuráveis para URLs em aplicativos Storyboard OS. Sem dependências.</strong></p>

---

# @storyboard-os/routing

Funções auxiliares para a construção de URLs em aplicativos desenvolvidos na plataforma Storyboard OS. Gera URLs para quadros, frames e projetos a partir de uma única configuração. Conversão direta de string para string — sem dependências de framework, sem DOM e sem efeitos colaterais.

Cada aplicativo define seu próprio caminho base. Um segundo aplicativo com uma estrutura de URL diferente utiliza uma configuração diferente e nunca entra em conflito com o primeiro.

---

## Instalação

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

A função remove barras finais do `storyboardBasePath`:

```ts
createStoryboardRoutes({ storyboardBasePath: '/storyboards/' })
  .boardRoute('quest-01')
// → '/storyboards/quest-01'   (trailing slash removed)
```

---

## API

### `createStoryboardRoutes(config)`

Retorna um objeto `StoryboardRoutes` vinculado ao caminho base especificado.

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

A rota `projectRoute` não é afetada pelo `storyboardBasePath` — os projetos sempre estão localizados em `/projects`. Apenas as rotas de storyboard e frame utilizam o caminho base configurado.

---

## Múltiplos aplicativos, múltiplas configurações

Cada aplicativo cria sua própria fábrica de rotas. Eles nunca compartilham estado:

```ts
// rpg-storyboard app
const rpgRoutes = createStoryboardRoutes({ storyboardBasePath: '/storyboards' });

// A hypothetical screenplay app
const screenplayRoutes = createStoryboardRoutes({ storyboardBasePath: '/scenes' });

rpgRoutes.boardRoute('quest-01')       // '/storyboards/quest-01'
screenplayRoutes.boardRoute('act-1')   // '/scenes/act-1'
```

---

## Padrão de reexportação simplificado

Normalmente, os aplicativos reexportam uma instância pré-configurada, para que os componentes da página importem da camada do aplicativo, e não diretamente do pacote:

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

Isso mantém as importações internas estáveis à medida que as versões dos pacotes evoluem — apenas o arquivo de reexportação precisa ser atualizado.

---

## Posição na arquitetura

```
@storyboard-os/routing       ← you are here
  └── (no dependencies)

apps/rpg-storyboard
  └── @storyboard-os/routing
```

`@storyboard-os/routing` não possui importações da plataforma ou de nenhum pacote específico. É uma utilidade pura — sua única função é concatenar strings de acordo com a configuração fornecida.

---

## Modelo de confiança

`@storyboard-os/routing` é uma biblioteca pura de manipulação de strings. Não possui efeitos colaterais em tempo de execução, nenhuma operação de entrada/saída, nenhum acesso à rede e nenhuma dependência. Todas as funções são síncronas e referencialmente transparentes.

---

<p align="center">Part of <a href="https://github.com/mcp-tool-shop-org/storyboard-os">storyboard-os</a> · Built by <a href="https://mcp-tool-shop.github.io/">MCP Tool Shop</a></p>
