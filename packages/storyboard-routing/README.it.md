<p align="center">
  <a href="README.ja.md">日本語</a> | <a href="README.zh.md">中文</a> | <a href="README.es.md">Español</a> | <a href="README.fr.md">Français</a> | <a href="README.hi.md">हिन्दी</a> | <a href="README.md">English</a> | <a href="README.pt-BR.md">Português (BR)</a>
</p>

<p align="center">
  <img src="https://raw.githubusercontent.com/mcp-tool-shop-org/brand/main/logos/storyboard-os/readme.png" alt="Storyboard OS" width="400" />
</p>

<p align="center">
  <a href="https://github.com/mcp-tool-shop-org/storyboard-os/actions/workflows/ci.yml"><img src="https://github.com/mcp-tool-shop-org/storyboard-os/actions/workflows/ci.yml/badge.svg" alt="CI" /></a>
  <a href="https://www.npmjs.com/package/@storyboard-os/routing"><img src="https://img.shields.io/npm/v/@storyboard-os/routing.svg" alt="npm" /></a>
  <a href="../../LICENSE"><img src="https://img.shields.io/badge/license-MIT-blue.svg" alt="MIT License" /></a>
</p>

<p align="center"><strong>Funzioni di supporto configurabili per la gestione degli URL nelle applicazioni Storyboard OS. Nessuna dipendenza.</strong></p>

---

# @storyboard-os/routing

Funzioni di supporto per la costruzione degli URL per le applicazioni sviluppate sulla piattaforma Storyboard OS. Genera URL per "board", "frame" e "progetti" a partire da una singola configurazione. Funziona esclusivamente con stringhe: nessuna dipendenza da framework, nessun DOM, nessun effetto collaterale.

Ogni applicazione specifica il proprio percorso di base. Una seconda applicazione con una struttura di URL diversa utilizza una configurazione diversa e non entra in conflitto con la prima.

---

## Installazione

```bash
npm install @storyboard-os/routing
# or
pnpm add @storyboard-os/routing
```

---

## Utilizzo

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

La funzione crea rimuove le barre oblique finali da `storyboardBasePath`:

```ts
createStoryboardRoutes({ storyboardBasePath: '/storyboards/' })
  .boardRoute('quest-01')
// → '/storyboards/quest-01'   (trailing slash removed)
```

---

## API

### `createStoryboardRoutes(config)`

Restituisce un oggetto `StoryboardRoutes` associato al percorso di base specificato.

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

L'URL `projectRoute` non è influenzato da `storyboardBasePath`: i progetti sono sempre accessibili all'indirizzo `/projects`. Solo le route per "storyboard" e "frame" utilizzano il percorso di base configurato.

---

## Più applicazioni, più configurazioni

Ogni applicazione crea la propria funzione di creazione delle route. Queste funzioni non condividono lo stato:

```ts
// rpg-storyboard app
const rpgRoutes = createStoryboardRoutes({ storyboardBasePath: '/storyboards' });

// A hypothetical screenplay app
const screenplayRoutes = createStoryboardRoutes({ storyboardBasePath: '/scenes' });

rpgRoutes.boardRoute('quest-01')       // '/storyboards/quest-01'
screenplayRoutes.boardRoute('act-1')   // '/scenes/act-1'
```

---

## Schema di re-esportazione semplificato

Le applicazioni tipicamente re-esportano un'istanza preconfigurata, in modo che i componenti delle pagine importino dal livello dell'applicazione, e non direttamente dal pacchetto:

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

Questo mantiene stabili le importazioni interne man mano che le versioni dei pacchetti evolvono: è necessario aggiornare solo il file di re-esportazione.

---

## Posizione nell'architettura

```
@storyboard-os/routing       ← you are here
  └── (no dependencies)

apps/rpg-storyboard
  └── @storyboard-os/routing
```

`@storyboard-os/routing` non contiene importazioni dalla piattaforma né da alcun pacchetto specifico. È una semplice utility: la sua unica funzione è concatenare stringhe in base alla configurazione fornita.

---

## Modello di sicurezza

`@storyboard-os/routing` è una libreria di manipolazione di stringhe. Non ha effetti collaterali a runtime, non esegue operazioni di I/O, non accede alla rete e non ha dipendenze. Tutte le funzioni sono sincrone e referenzialmente trasparenti.

---

<p align="center">Part of <a href="https://github.com/mcp-tool-shop-org/storyboard-os">storyboard-os</a> · Built by <a href="https://mcp-tool-shop.github.io/">MCP Tool Shop</a></p>
