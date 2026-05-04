<p align="center">
  <a href="README.ja.md">日本語</a> | <a href="README.zh.md">中文</a> | <a href="README.es.md">Español</a> | <a href="README.fr.md">Français</a> | <a href="README.hi.md">हिन्दी</a> | <a href="README.md">English</a> | <a href="README.pt-BR.md">Português (BR)</a>
</p>

<p align="center">
  <img src="https://raw.githubusercontent.com/mcp-tool-shop-org/brand/main/logos/storyboard-os/readme.png" alt="Storyboard OS" width="400" />
</p>

<p align="center">
  <a href="https://github.com/mcp-tool-shop-org/storyboard-os/actions/workflows/ci.yml"><img src="https://github.com/mcp-tool-shop-org/storyboard-os/actions/workflows/ci.yml/badge.svg" alt="CI" /></a>
  <a href="https://www.npmjs.com/package/@storyboard-os/core"><img src="https://img.shields.io/npm/v/@storyboard-os/core.svg" alt="npm" /></a>
  <a href="../../LICENSE"><img src="https://img.shields.io/badge/license-MIT-blue.svg" alt="MIT License" /></a>
</p>

<p align="center"><strong>Elementi primitivi generici per lo storyboard. Nessun vocabolario specifico del dominio.</strong></p>

---

# @storyboard-os/core

La base strutturale della piattaforma Storyboard OS. Definisce i tipi generici che tutti i pacchetti specifici del dominio estendono: fotogrammi, connessioni, annotazioni, storyboard, modelli e convalida strutturale.

`@storyboard-os/core` **non ha dipendenze** e **non contiene vocabolario specifico del dominio**. Non sa cosa sia una missione di un gioco di ruolo, una scena di una sceneggiatura o una mappa di campagna. I pacchetti specifici del dominio importano questi elementi generici e li specializzano con i propri schemi di contenuto e tipi di fotogramma.

---

## Installazione

```bash
npm install @storyboard-os/core
# or
pnpm add @storyboard-os/core
```

---

## Cosa offre

### Fotogramma

Un `StoryboardFrame` rappresenta un singolo elemento narrativo, l'unità atomica di qualsiasi storyboard.

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

I domini definiscono i parametri di tipo:
```ts
// In @storyboard-os/rpg-domain:
type StoryboardFrame = CoreFrame<StoryboardFrameType, FrameContent, FrameAnnotationType>;
```

### Annotazione

Note di creazione specifiche per ogni fotogramma, tipizzate in base al dominio.

```ts
interface FrameAnnotation<TAnnotationType extends string = string> {
  id: string;
  type: TAnnotationType;
  text: string;
}
```

### Connessione

Le connessioni sono entità di primo livello, non nascoste in `frame.links`. Il tipo di connessione determina la resa visiva (spessore della linea, motivo tratteggiato) e trasporta un significato semantico.

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

Una collezione di fotogrammi e connessioni con un ID e un titolo.

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

### Progetto

Un contenitore semplice per uno o più storyboard. Non è un database specifico del dominio, ma fornisce una struttura sufficiente per raggruppare storyboard correlati sotto un nome.

```ts
interface StoryboardProject<TStoryboard extends Storyboard = Storyboard> {
  id: string;
  title: string;
  description?: string;
  storyboards: TStoryboard[];
}
```

### Modello

Un meccanismo per creare storyboard specifici del dominio a partire da un punto di partenza.

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

## Convalida strutturale

`validateStoryboard` verifica delle proprietà invarianti che sono valide per **qualsiasi** storyboard, indipendentemente dal dominio: ID di fotogrammi duplicati, riferimenti di connessione interrotti, campi obbligatori mancanti e dimensioni dei fotogrammi non valide.

```ts
import { validateStoryboard } from '@storyboard-os/core';

const result = validateStoryboard(storyboard);

if (!result.valid) {
  for (const error of result.errors) {
    console.error(error.code, error.message, error.frameId ?? error.connectionId);
  }
}
```

### Codici di errore

| Codice | Significato |
|---|---|
| `EMPTY_STORYBOARD` | Nessun fotogramma nello storyboard |
| `DUPLICATE_FRAME_ID` | Due fotogrammi condividono lo stesso ID |
| `MISSING_TITLE` | Il fotogramma non ha un titolo |
| `MISSING_TYPE` | Il fotogramma non ha un tipo |
| `MISSING_SUMMARY` | Il fotogramma non ha una descrizione |
| `INVALID_DIMENSIONS` | Larghezza o altezza del fotogramma inferiore al minimo di 40px |
| `BROKEN_CONNECTION_FROM` | La connessione `fromFrameId` fa riferimento a un fotogramma inesistente |
| `BROKEN_CONNECTION_TO` | La connessione `toFrameId` fa riferimento a un fotogramma inesistente |

I pacchetti specifici del dominio chiamano `validateStoryboard` per primi, quindi aggiungono le proprie regole specifiche del dominio. `@storyboard-os/rpg-domain` esporta `validateRpgStoryboard` che fa esattamente questo.

---

## Estensione della piattaforma

Per creare un nuovo modulo sulla base di `@storyboard-os/core`:

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

## Posizione nell'architettura

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

`@storyboard-os/core` si trova alla base della catena delle dipendenze. Non importa nulla dalla piattaforma. I pacchetti successivi importano elementi da livelli superiori; non importano mai elementi da livelli inferiori.

---

## Modello di sicurezza

`@storyboard-os/core` è una libreria TypeScript pura. Non ha effetti a runtime, nessuna operazione di I/O, nessun accesso alla rete e nessun effetto collaterale. La funzione `validateStoryboard` legge l'oggetto storyboard che le viene passato e restituisce un semplice oggetto risultato. Nulla viene memorizzato, registrato o trasmesso.

---

<p align="center">Part of <a href="https://github.com/mcp-tool-shop-org/storyboard-os">storyboard-os</a> · Built by <a href="https://mcp-tool-shop.github.io/">MCP Tool Shop</a></p>
