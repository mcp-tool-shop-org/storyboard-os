<p align="center">
  <a href="README.ja.md">日本語</a> | <a href="README.zh.md">中文</a> | <a href="README.es.md">Español</a> | <a href="README.fr.md">Français</a> | <a href="README.hi.md">हिन्दी</a> | <a href="README.md">English</a> | <a href="README.pt-BR.md">Português (BR)</a>
</p>

<p align="center">
  <img src="https://raw.githubusercontent.com/mcp-tool-shop-org/brand/main/logos/storyboard-os/readme.png" alt="Storyboard OS — Visual Stories. Structured. Implemented." width="550" />
</p>

<p align="center">
  <a href="https://github.com/mcp-tool-shop-org/storyboard-os/actions/workflows/ci.yml"><img src="https://github.com/mcp-tool-shop-org/storyboard-os/actions/workflows/ci.yml/badge.svg" alt="CI" /></a>
  <a href="LICENSE"><img src="https://img.shields.io/badge/license-MIT-blue.svg" alt="MIT License" /></a>
  <a href="https://mcp-tool-shop-org.github.io/storyboard-os/"><img src="https://img.shields.io/badge/landing-Pages-0ea5e9.svg" alt="Landing page" /></a>
  <a href="https://www.npmjs.com/package/@storyboard-os/core"><img src="https://img.shields.io/npm/v/@storyboard-os/core.svg" alt="npm @storyboard-os/core" /></a>
</p>


---

Una piattaforma per la creazione di storie visive, destinata alla narrazione interattiva: missioni, campagne, sequenze cinematografiche e la logica di produzione che le collega.

**Tre aree di applicazione, una piattaforma:**

| Area di applicazione | Dominio |
|---|---|
| `rpg-storyboard` | Missioni/narrazione di giochi di ruolo (RPG): piattaforma pronta per l'implementazione |
| `marketing-storyboard` | Lancio di una campagna: preparazione al lancio + percorso critico |
| `cinematic-storyboard` | Trailer/sequenza cinematografica/video esplicativo: creazione di storyboard per la produzione |

Tutti e tre sono prodotti, non demo. Nessuno importa dati dagli altri.

---

## Cos'è Storyboard OS

Una struttura organizzata per la progettazione di una **narrazione implementabile**. Ogni elemento sulla tela rappresenta una scena con:
- Condizioni di ingresso e uscita
- Modifiche di stato (flag, variabili, stato del mondo)
- Risorse necessarie per la fase di produzione
- Criteri di test con verifiche di superamento/fallimento
- Lista di controllo per l'implementazione

La struttura visualizza il flusso dello stato del gioco, non solo la sequenza della storia. Le connessioni trasmettono significato: rami di scelta, archi di conseguenze, linee guida della sequenza, percorsi alternativi. Un progettista può leggere la struttura e capire cosa fa effettivamente il gioco.

## Cos'è Storyboard OS (e cosa non è)

- Non è uno strumento generico per la creazione di diagrammi o una lavagna virtuale
- Non è uno strumento per gestire sessioni di gioco o assistere il Game Master
- Non è un wiki per la creazione di mondi o un database di informazioni
- Non è un editor dedicato esclusivamente agli alberi di dialogo
- Non è un'app per la preparazione di campagne

Se un utente potesse confondere questo con uno di questi strumenti, il prodotto si sarebbe discostato dal suo scopo.

---

## Cosa fa rpg-storyboard (Fase 2)

Dopo la Fase 2, un progettista può creare un progetto completo dall'inizio fino alla consegna, senza uscire dal browser:

| Funzionalità | Cosa offre |
|---|---|
| **Project creation** | Crea un progetto con un nome specifico a partire da un modello; le posizioni e le modifiche sulla struttura vengono salvate in localStorage |
| **Visual board** | Flusso delle missioni e logica dei rami dello stato del gioco affiancati su una tela Konva |
| **Beat editing** | Modifica il titolo, il riepilogo e tutti i campi delle specifiche di implementazione di ogni scena direttamente sulla struttura |
| **Progress tracking** | Spunta gli elementi della lista di controllo per l'implementazione e i criteri di test per ogni scena; lo stato viene salvato anche dopo il ricaricamento |
| **Game-state signal** | Badge per ogni scena (STATO, SPECIFICA/PARZIALE/BOZZA) senza uscire dalla struttura |
| **Implementation readiness** | Ogni scena mostra lo stato PRONTO/PARZIALE/BOZZA/BLOCCATO + cosa manca |
| **Project handoff** | Ricreato dallo stato attuale del progetto: include il contenuto modificato, i progressi per ogni scena e la cronologia |
| **Quest handoff** | Esportazione statica in formato Markdown + JSON per le strutture di anteprima |
| **Templates** | Tre punti di partenza per la produzione di giochi di ruolo, con sequenze di tipi di scena e motivazioni |
| **Board operations** | Zoom, panoramica, adattamento alla struttura, ripristino, scorciatoie da tastiera: navigazione utilizzabile su laptop |

La struttura è una superficie di creazione. L'ispettore delle scene è una specifica di implementazione modificabile. La consegna è un documento generato dallo stato reale del progetto, non un'istantanea statica.

### Funzionalità della Fase 1 (ancora presenti)

La Fase 1 ha stabilito l'area di applicazione per l'anteprima in sola lettura: rendering sulla tela, segnale dello stato del gioco, modello di preparazione all'implementazione, esportazione per la consegna delle missioni, galleria di modelli e navigazione sulla struttura. Tutte le funzionalità della Fase 1 sono preservate ed estese dalla Fase 2.

---

## Pacchetti

| Pacchetto | Cosa contiene |
|---|---|
| `@storyboard-os/core` | Elementi di base per storyboard generici: scena, connessione (generica per tipo), annotazione, modello, validatore strutturale. I domini possiedono il proprio vocabolario di connessioni. |
| `@storyboard-os/rpg-domain` | Contratto per la creazione di giochi di ruolo: tipi di scena, campi di contenuto, modelli, modello di preparazione, generatore per la consegna, missione di esempio di Tollhouse Ledger. |
| `@storyboard-os/marketing-domain` | Contratto per l'implementazione di campagne di marketing: tipi di scena (pubblico, messaggio, punto di contatto, risorsa, approvazione, evento di lancio, misurazione), modello di preparazione al lancio, percorso critico, fasi di approvazione, cicli di misurazione, esportazione del brief della campagna, campagna di esempio. |
| `@storyboard-os/cinematic-domain` | Contratto per la produzione cinematografica: 9 tipi di scena, linguaggio della telecamera, requisiti per VFX/audio/continuità, segnali di produzione (stato, carico, complessità, scene bloccate), consegna del brief di produzione, 3 modelli, sequenza di trailer di esempio. |
| `@storyboard-os/canvas` | Renderer Konva: scene, connessioni, selezione, trascinamento, badge di tipo, etichette di connessione, viewport zoom/pan. Configurazione del dominio passata. |
| `@storyboard-os/routing` | Helper URL configurabili: generazione di percorsi per la struttura e le scene. Nessuna dipendenza. |

## App

| App | Cos'è |
|---|---|
| `rpg-storyboard` | Prodotto Astro per la creazione di giochi di ruolo. Contiene: configurazione della tela RPG, ispettore delle scene, pagine di consegna, galleria di modelli, configurazione dei percorsi, layout della pagina. |
| `marketing-storyboard` | Storyboard Astro per l'implementazione di campagne. Contiene: configurazione della tela di marketing, struttura della campagna, ispettore delle scene, badge di preparazione al lancio, enfasi sul percorso critico, pannello dei blocchi al lancio, consegna del brief della campagna. |
| `cinematic-storyboard` | Storyboard Astro per la produzione cinematografica. Contiene: configurazione della tela cinematografica, struttura della sequenza, ispettore delle scene (telecamera/VFX/audio/continuità), pannello dei segnali di produzione (stato/carico/complessità), consegna del brief di produzione. |

---

## Architettura

I pacchetti formano una catena di dipendenze pulita:

```
apps/rpg-storyboard
  → @storyboard-os/rpg-domain       (RPG game-authoring contract)
  → @storyboard-os/canvas           (Konva renderer, domain-configurable)
  → @storyboard-os/routing          (URL helpers)

apps/marketing-storyboard
  → @storyboard-os/marketing-domain  (marketing campaign-implementation contract)
  → @storyboard-os/canvas            (same canvas, different config)
  → @storyboard-os/routing           (URL helpers)

apps/cinematic-storyboard
  → @storyboard-os/cinematic-domain  (cinematic production contract)
  → @storyboard-os/canvas            (same canvas, different config)
  → @storyboard-os/routing           (URL helpers)

@storyboard-os/rpg-domain
  → @storyboard-os/core              (generic primitives)

@storyboard-os/marketing-domain
  → @storyboard-os/core              (generic primitives)

@storyboard-os/cinematic-domain
  → @storyboard-os/core              (generic primitives)

@storyboard-os/canvas
  → (no platform deps — pure Konva + React)

@storyboard-os/routing
  → (no deps — pure string helpers)

@storyboard-os/core
  → (no deps)
```

Una quarta area di applicazione creerebbe il proprio pacchetto di dominio e riutilizzerebbe `@storyboard-os/core`, `@storyboard-os/canvas` e `@storyboard-os/routing` senza toccare alcun pacchetto di dominio esistente. Tre aree di applicazione hanno ora dimostrato questo modello: zero modifiche alla tela, al nucleo o al routing.

Consulta [`docs/architecture.md`](docs/architecture.md) per i dettagli completi.

---

## Guida rapida

<!-- AUTOGEN-NOTE: Snapshot values (1413 tests, 63 pages) below are manually updated.
     Verify with: pnpm test (test count), pnpm -r build (page count).
     See docs/snapshot-checklist.md for every location that holds these snapshots. -->

```bash
pnpm install
pnpm dev        # starts rpg-storyboard at localhost:4321
pnpm test       # runs all package + app tests (1413 tests)
pnpm build      # builds all 3 apps (63 pages)
pnpm verify     # typecheck + test + build in one command (ship gate)
```

Requisiti: Node ≥ 22.13, pnpm ≥ 11.

L'ambito dei test viene filtrato automaticamente per i pacchetti `@storyboard-os/*` e `rpg-storyboard`: non include i workspace secondari nella directory principale.

---

## Modello di fiducia

Storyboard OS è un'applicazione **locale per browser** (tre aree di applicazione): nessun server, nessun account, nessuna comunicazione di rete.

- **Dati interessati:** **solo RPG** — dati del progetto (specifiche delle scene, posizioni degli elementi, avanzamento della checklist) nel browser `localStorage` sulla macchina dell'utente. Le demo statiche di marketing e cinematografiche vengono esportate e non utilizzano `localStorage` oggi.
- **Dati NON interessati:** Nessuna credenziale, nessuna informazione di pagamento, nessun dato personale oltre a ciò che l'operatore digita nei campi delle specifiche (RPG) o a ciò che viene inserito nel contenuto della demo statica.
- **Nessuna richiesta di rete in fase di esecuzione.** Ogni applicazione è un sito statico. Dopo il caricamento iniziale della pagina, non vengono effettuate richieste di rete.
- **Nessun telemetria.** Non vengono raccolti o trasmessi dati.

Per il modello completo di fiducia e la segnalazione di vulnerabilità, vedere [`SECURITY.md`](SECURITY.md).

---

## Stato

<!-- AUTOGEN-NOTE: Snapshot values below (1413 tests, 63 pages, 6 packages, 3 apps) are
     manually updated. Verify with:
       pnpm test                       # tests passing
       pnpm -r build                   # pages built (count from Astro output)
       ls packages/ | wc -l            # package count
       ls apps/ | wc -l                # app count
     See docs/snapshot-checklist.md for every doc location that holds these. -->

```
v1.3.0 Feature Pass — gold templates, playlist, nest, engine adapters
1413/1413 tests passing
63/63 pages built
6 packages · 3 apps
```

| Fase | Descrizione | Stato |
|---|---|---|
| 0A–0F | Prova di creazione di contenuti RPG: canvas, pagine delle scene, modelli, demo di quest | ✅ |
| 0R | Riparazione + riancoraggio: ogni fotogramma contiene le specifiche dello stato del gioco | ✅ |
| 0M | Migrazione monorepo: core, dominio, canvas, routing estratti | ✅ |
| 1A | Visualizzazione di rami e stati sul canvas | ✅ |
| 1B | Prontezza all'implementazione per ogni scena | ✅ |
| 1C | Esportazione della quest | ✅ |
| 1D | Galleria di modelli | ✅ |
| 1E | Operazioni sulla lavagna: zoom, panoramica, adattamento, controlli della finestra | ✅ |
| 1F | Chiusura del rilascio: documentazione, registro delle modifiche, note sull'architettura | ✅ |
| 2A | Creazione di progetti da modelli: persistenza in localStorage | ✅ |
| 2B | Posizioni della lavagna persistenti per progetto | ✅ |
| 2C | Contenuti delle scene modificabili: i campi delle specifiche persistono tra i ricaricamenti | ✅ |
| 2D | Persistenza della checklist/avanzamento: separata dal testo delle specifiche | ✅ |
| 2E | Passaggio del progetto: rigenerato dallo stato del progetto salvato | ✅ |
| 2F | Chiusura del rilascio: documentazione, registro delle modifiche, note sull'architettura | ✅ |
| M-0A | Pacchetto di dominio di marketing: schema, segnali, modelli, convalida, campagna demo | ✅ |
| M-0B | Applicazione verticale di marketing: lavagna della campagna Astro, ispettore dei fotogrammi, passaggio | ✅ |
| M-0C | Livello di segnalazione di prontezza al lancio: percorso critico, gate di approvazione, cicli di misurazione | ✅ |
| M-0D | Chiusura del marketing: documentazione, registro delle modifiche, prova dell'architettura | ✅ |
| C-0A | Pacchetto di dominio cinematografico: schema, linguaggio della telecamera, VFX/audio, modelli, convalida, demo | ✅ |
| C-0B | Applicazione verticale cinematografica: lavagna della sequenza Astro, ispettore dei fotogrammi, breve descrizione della produzione | ✅ |
| C-0C | Livello di segnalazione della produzione: stato, carico di VFX/audio, complessità della telecamera, riprese bloccate | ✅ |
| C-0D | Chiusura cinematografica: documentazione, registro delle modifiche, prova dell'architettura | ✅ |
| H-1A | Rafforzamento del core: tipi di connessione generici, i domini possiedono il proprio vocabolario | ✅ |
| v1.2.0 | Rafforzamento della salute: validatore senza eccezioni, resilienza dello store + versionamento dello schema localStorage, livello di token di progettazione, accesso al canvas tramite tastiera/lettore di schermo, Astro 5 + gate di controllo delle dipendenze CI | ✅ |
| v1.3.0 | Passaggio delle funzionalità: nove modelli d'oro + cataloghi SSG; sequenza cinematografica `/reels/demo-launch-reel`; nidificazione (`parentFrameId` + `collapsedIds`); adattatori di motore unidirezionali; passaggi JSON Schema | ✅ |

---

## Demo

**The Tollhouse Ledger** — tre fazioni vogliono lo stesso registro nascosto. Il giocatore decide chi vince, chi perde e come sarà la regione in seguito. Otto scene con specifiche complete dello stato del gioco: nomi dei flag, requisiti degli asset, criteri di test di superamento/fallimento, checklist di implementazione.

Ogni fotogramma nella demo può essere implementato come una quest in un motore RPG senza documentazione aggiuntiva.

Percorso: `/storyboards/quest-01`

**Cataloghi pubblicati (SSG):**

| Area di applicazione | Demo | Modelli |
|---|---|---|
| RPG | `/storyboards/quest-01` | `/storyboards/template-quest-flow`, `template-quest-branch`, `template-cutscene-beat` |
| Marketing | `/campaigns/campaign-01` | `/campaigns/template-product_launch`, `template-campaign_funnel`, `template-content_to_conversion` |
| Cinematografico | `/sequences/demo-launch-trailer` · reel `/reels/demo-launch-reel` | `/sequences/template-trailer-flow`, `template-cutscene-sequence`, `template-explainer-video` |

---

## Documentazione

- [`docs/architecture.md`](docs/architecture.md) — separazione dei pacchetti, regole di dipendenza, modello della finestra del canvas, limite di archiviazione del progetto, estensibilità
- [`docs/product-brief.md`](docs/product-brief.md) — cos'è rpg-storyboard, utente di riferimento, avvisi di deriva, gate di accettazione
- [`docs/rpg-storyboard.md`](docs/rpg-storyboard.md) — contratto di creazione di giochi RPG, ciclo di creazione completo (Fase 2), modello di prontezza, esportazione del passaggio
- [`docs/marketing-storyboard.md`](docs/marketing-storyboard.md) — contratto di implementazione della campagna di marketing, modello di prontezza al lancio, percorso critico, esclusioni
- [`docs/cinematic-storyboard.md`](docs/cinematic-storyboard.md) — storyboard della produzione cinematografica, segnali di produzione, linguaggio della telecamera, esclusioni deliberate
- [`docs/cinematic-phase-0-closeout.md`](docs/cinematic-phase-0-closeout.md) — narrativa di base della fase 0 cinematografica, gate di accettazione, prova
- [`docs/marketing-phase-0-closeout.md`](docs/marketing-phase-0-closeout.md) — narrativa di base della fase 0 di marketing, gate di accettazione, prova
- [`docs/phase-2-closeout.md`](docs/phase-2-closeout.md) — narrativa di base della fase 2, registro dell'integrità dell'architettura, esclusioni deliberate
- [`docs/phase-1-closeout.md`](docs/phase-1-closeout.md) — narrativa di base della fase 1 e registro dell'integrità dell'architettura
- [`docs/phase-0-closeout.md`](docs/phase-0-closeout.md) — verdetto della fase 0 e backlog originale della fase 1
- [`docs/monorepo-migration.md`](docs/monorepo-migration.md) — registro della migrazione 0M: cosa è stato spostato, perché e l'architettura risultante
- [`CHANGELOG.md`](CHANGELOG.md) — cronologia dei rilasci
- [Pagina di destinazione](https://mcp-tool-shop-org.github.io/storyboard-os/) · [Manuale](https://mcp-tool-shop-org.github.io/storyboard-os/handbook/)

---

<p align="center">Built by <a href="https://mcp-tool-shop.github.io/">MCP Tool Shop</a></p>
