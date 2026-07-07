<p align="center">
  <a href="README.ja.md">日本語</a> | <a href="README.zh.md">中文</a> | <a href="README.es.md">Español</a> | <a href="README.fr.md">Français</a> | <a href="README.hi.md">हिन्दी</a> | <a href="README.md">English</a> | <a href="README.pt-BR.md">Português (BR)</a>
</p>

<p align="center">
  <img src="https://raw.githubusercontent.com/mcp-tool-shop-org/brand/main/logos/storyboard-os/readme.png" alt="Storyboard OS — Visual Stories. Structured. Implemented." width="400" />
</p>

<p align="center">
  <a href="https://github.com/mcp-tool-shop-org/storyboard-os/actions/workflows/ci.yml"><img src="https://github.com/mcp-tool-shop-org/storyboard-os/actions/workflows/ci.yml/badge.svg" alt="CI" /></a>
  <a href="LICENSE"><img src="https://img.shields.io/badge/license-MIT-blue.svg" alt="MIT License" /></a>
</p>


---

Una piattaforma per la creazione di storie visive e strutture narrative interattive: missioni, campagne, sequenze cinematografiche e la logica di produzione che le collega.

**Tre aree di applicazione, una piattaforma:**

| Area di applicazione | Dominio |
|---|---|
| `rpg-storyboard` | Missioni/narrazione di giochi RPG: strumento pronto per l'implementazione. |
| `marketing-storyboard` | Lancio di una campagna: preparazione al lancio + percorso critico. |
| `cinematic-storyboard` | Trailer / scena cinematografica / video esplicativo: storyboard di produzione. |

Tutti e tre sono prodotti, non demo. Nessuno importa dati dagli altri.

---

## Cos'è Storyboard OS

Una struttura organizzata per la progettazione di **narrazioni implementabili**. Ogni elemento sulla tela rappresenta una scena con:
- Condizioni di ingresso e uscita
- Modifiche dello stato (flag, variabili, stato del mondo)
- Risorse necessarie per la fase di produzione
- Criteri di test con verifiche di superamento/fallimento
- Lista di controllo dell'implementazione

La struttura visualizza il flusso dello stato del gioco, non solo la sequenza della storia. Le connessioni trasmettono significato: rami delle scelte, archi consequenziali, linee guida della sequenza, percorsi alternativi. Un progettista può leggere la struttura e capire cosa fa effettivamente il gioco.

## Cos'è Storyboard OS (e cosa non è)

- Uno strumento generico per diagrammi o lavagne interattive
- Uno strumento per gestire sessioni di gioco o assistere un Game Master
- Un wiki per la creazione del mondo di gioco o un database di informazioni
- Un editor che si limita a creare alberi di dialogo
- Un'app per preparare una campagna

Se un utente potesse confondere questo con uno di questi strumenti, il prodotto si sarebbe discostato dal suo scopo.

---

## Cosa fa rpg-storyboard (Fase 2)

Dopo la Fase 2, un progettista può creare un progetto completo dall'inizio alla consegna senza uscire dal browser:

| Funzionalità | Cosa offre |
|---|---|
| **Project creation** | Creazione di un progetto con un nome specifico a partire da un modello; le posizioni e le modifiche sulla struttura vengono salvate in localStorage. |
| **Visual board** | Flusso delle missioni e logica dei rami dello stato del gioco affiancati su una tela Konva. |
| **Beat editing** | Modifica del titolo, del riepilogo e di tutti i campi relativi all'implementazione direttamente sulla struttura. |
| **Progress tracking** | Spunta gli elementi della lista di controllo dell'implementazione e i criteri di test per ogni scena; lo stato viene salvato anche dopo il ricaricamento. |
| **Game-state signal** | Badge per ogni elemento (STATO, SPECIFICA/PARZIALE/BOZZA) senza uscire dalla struttura. |
| **Implementation readiness** | Ogni scena mostra lo stato PRONTO/PARZIALE/BOZZA/BLOCCATO + cosa manca. |
| **Project handoff** | Rigenerato dallo stato attuale del progetto: include il contenuto modificato, i progressi per ogni scena e la cronologia. |
| **Quest handoff** | Esportazione statica in formato Markdown + JSON per le anteprime dei modelli. |
| **Templates** | Tre punti di partenza per la produzione di giochi RPG con sequenze di tipi di scene e motivazioni. |
| **Board operations** | Zoom, panoramica, adattamento alla struttura, ripristino, scorciatoie da tastiera: navigazione utilizzabile su un laptop. |

La struttura è una superficie per la creazione. L'ispettore delle scene è una specifica di implementazione modificabile. La consegna è un documento generato dallo stato reale del progetto, non uno snapshot statico.

### Funzionalità della Fase 1 (ancora presenti)

La Fase 1 ha stabilito l'area di applicazione per l'anteprima in sola lettura: rendering sulla tela, segnale dello stato del gioco, modello di preparazione all'implementazione, esportazione delle missioni, galleria dei modelli e navigazione sulla struttura. Tutte le funzionalità della Fase 1 sono preservate ed estese dalla Fase 2.

---

## Pacchetti

| Pacchetto | Cosa contiene |
|---|---|
| `@storyboard-os/core` | Elementi di base per storyboard generici: scena, connessione (generica rispetto al tipo), annotazione, modello, validatore strutturale. I domini gestiscono i propri vocabolari di connessioni. |
| `@storyboard-os/rpg-domain` | Contratto per la creazione di giochi RPG: tipi di scene, campi del contenuto, modelli, modello di preparazione, generatore di consegne, demo della missione Tollhouse Ledger. |
| `@storyboard-os/marketing-domain` | Contratto per l'implementazione di campagne di marketing: tipi di scene (pubblico, messaggio, punto di contatto, risorsa, approvazione, evento di lancio, misurazione), modello di preparazione al lancio, percorso critico, fasi di approvazione, cicli di misurazione, esportazione del brief della campagna, demo della campagna. |
| `@storyboard-os/cinematic-domain` | Contratto per la produzione cinematografica: 9 tipi di scene, linguaggio della telecamera, requisiti per VFX/audio/continuità, segnali di produzione (salute, carico, complessità, riprese bloccate), consegna del brief di produzione, 3 modelli, sequenza demo del trailer. |
| `@storyboard-os/canvas` | Renderer Konva: scene, connessioni, selezione, trascinamento, badge dei tipi, etichette delle connessioni, viewport zoom/panoramica. Configurazione del dominio passata. |
| `@storyboard-os/routing` | Helper URL configurabili: generazione di percorsi per la struttura e le scene. Nessuna dipendenza. |

## App

| App | Cos'è |
|---|---|
| `rpg-storyboard` | Prodotto Astro per la creazione di giochi RPG. Contiene: configurazione della tela RPG, ispettore delle scene, pagine di consegna, galleria dei modelli, impostazione del percorso, layout della pagina. |
| `marketing-storyboard` | Storyboard Astro per l'implementazione di campagne. Contiene: configurazione della tela di marketing, struttura della campagna, ispettore delle scene, badge di preparazione al lancio, enfasi sul percorso critico, pannello dei blocchi al lancio, consegna del brief della campagna. |
| `cinematic-storyboard` | Storyboard Astro per la produzione cinematografica. Contiene: configurazione della tela cinematografica, struttura della sequenza, ispettore delle scene (telecamera/VFX/audio/continuità), pannello dei segnali di produzione (salute/carico/complessità), consegna del brief di produzione. |

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

Una quarta area di applicazione creerebbe il proprio pacchetto di dominio e riutilizzerebbe `@storyboard-os/core`, `@storyboard-os/canvas` e `@storyboard-os/routing` senza toccare alcun pacchetto di dominio esistente. Tre aree di applicazione hanno ora dimostrato questo modello: zero modifiche alla tela, al core o al routing.

Consulta [`docs/architecture.md`](docs/architecture.md) per i dettagli completi.

---

## Guida rapida

<!-- NOTA AUTOGENERATA: I valori di snapshot (937 test, 54 pagine) qui sotto vengono aggiornati manualmente.
Verifica con: pnpm test (conteggio dei test), pnpm -r build (conteggio delle pagine).
Consulta docs/snapshot-checklist.md per ogni posizione che contiene questi snapshot. -->

```bash
pnpm install
pnpm dev        # starts rpg-storyboard at localhost:4321
pnpm test       # runs all package + app tests (937 tests)
pnpm build      # builds all 3 apps (54 pages)
pnpm verify     # typecheck + test + build in one command (ship gate)
```

Requisiti: Node ≥ 20, pnpm ≥ 10.

L'ambito dei test è automaticamente filtrato per includere i pacchetti `@storyboard-os/*` e `rpg-storyboard`; non include le cartelle di lavoro correlate nella directory principale.

---

## Modello di fiducia

Storyboard OS è un'**applicazione browser locale**, senza server, account o comunicazione esterna tramite rete.

- **Dati interessati:** dati del progetto (specifiche delle scene, posizioni sulla lavagna, avanzamento della lista di controllo) memorizzati esclusivamente nella `localStorage` del browser sull'apparecchio dell'utente.
- **Dati NON interessati:** nessuna credenziale, informazioni di pagamento o dati personali oltre a quelli inseriti dall'utente nei campi delle specifiche delle scene.
- **Nessuna richiesta di rete durante l'esecuzione.** L'applicazione è un sito statico. Dopo il caricamento iniziale della pagina, non vengono effettuate ulteriori comunicazioni con la rete.
- **Nessun tracciamento dei dati.** Non viene raccolto né trasmesso alcun dato.

Consultare [`SECURITY.md`](SECURITY.md) per il modello di fiducia completo e le informazioni sulla segnalazione delle vulnerabilità.

---

## Stato

<!-- NOTA GENERATA AUTOMATICAMENTE: i valori di riferimento riportati di seguito (937 test, 54 pagine, 6 pacchetti, 3 applicazioni) vengono aggiornati manualmente. Verificare con:
pnpm test                       # test superati
pnpm -r build                   # pagine generate (conteggio dall'output di Astro)
ls packages/ | wc -l            # numero di pacchetti
ls apps/ | wc -l                # numero di applicazioni
Consultare docs/snapshot-checklist.md per l'elenco completo delle posizioni dei documenti che contengono questi dati. -->

```
Phase 2 + Marketing Phase 0 + Cinematic Phase 0 + Core Hardening 1A + v1.2.0 Health Hardening
937/937 tests passing
54/54 pages built
6 packages · 3 apps
```

| Fase | Descrizione | Stato |
|---|---|---|
| 0A–0F | Prova di creazione di contenuti RPG: tela, pagine delle scene, modelli, demo della missione. | ✅ |
| 0R | Riparazione e riancoraggio: ogni fotogramma contiene le specifiche dello stato del gioco. | ✅ |
| 0M | Migrazione al monorepo: core, dominio, tela, routing estratti. | ✅ |
| 1A | Visualizzazione di rami e stati sulla tela. | ✅ |
| 1B | Prontezza all'implementazione per ogni scena. | ✅ |
| 1C | Esportazione della missione completata. | ✅ |
| 1D | Galleria dei modelli. | ✅ |
| 1E | Operazioni sulla lavagna: zoom, panoramica, adattamento, controlli della finestra di visualizzazione. | ✅ |
| 1F | Chiusura del rilascio: documentazione, registro delle modifiche, note sull'architettura. | ✅ |
| 2A | Creazione di progetti da modelli: persistenza in `localStorage`. | ✅ |
| 2B | Posizioni della lavagna persistenti per ogni progetto. | ✅ |
| 2C | Contenuti delle scene modificabili: le specifiche dei campi vengono mantenute anche dopo il ricaricamento. | ✅ |
| 2D | Persistenza della lista di controllo/avanzamento: separata dal testo delle specifiche. | ✅ |
| 2E | Passaggio del progetto: rigenerato dallo stato salvato del progetto. | ✅ |
| 2F | Chiusura del rilascio: documentazione, registro delle modifiche, note sull'architettura. | ✅ |
| M-0A | Pacchetto del dominio marketing: schema, segnali, modelli, convalida, campagna demo. | ✅ |
| M-0B | Applicazione verticale di marketing: lavagna della campagna Astro, ispettore dei fotogrammi, passaggio. | ✅ |
| M-0C | Livello di segnalazione della prontezza al lancio: percorso critico, porte di approvazione, cicli di misurazione. | ✅ |
| M-0D | Chiusura del marketing: documentazione, registro delle modifiche, prova dell'architettura. | ✅ |
| C-0A | Pacchetto del dominio cinematografico: schema, linguaggio della telecamera, VFX/audio, modelli, convalida, demo. | ✅ |
| C-0B | Applicazione verticale cinematografica: lavagna delle sequenze Astro, ispettore dei fotogrammi, riepilogo della produzione. | ✅ |
| C-0C | Livello di segnalazione della produzione: stato, carico di VFX/audio, complessità della telecamera, scene bloccate. | ✅ |
| C-0D | Chiusura cinematografica: documentazione, registro delle modifiche, prova dell'architettura. | ✅ |
| H-1A | Rafforzamento del core: tipi di connessione generici, i domini gestiscono il proprio vocabolario. | ✅ |
| v1.2.0 | Rafforzamento della sicurezza: validatore senza eccezioni, resilienza dello store + versioning dello schema `localStorage`, livello dei token di progettazione, accesso alla tela tramite tastiera/lettore schermo, Astro 5 + gate per il controllo delle dipendenze con CI. | ✅ |

---

## Demo

**The Tollhouse Ledger**: tre fazioni vogliono lo stesso registro nascosto. Il giocatore decide chi vince, chi perde e come sarà la regione in futuro. Otto scene con specifiche complete dello stato del gioco: nomi dei flag, requisiti degli asset, criteri di test superamento/fallimento, liste di controllo dell'implementazione.

Ogni fotogramma nella demo può essere implementato come missione in un motore RPG senza documentazione aggiuntiva.

Percorso: `/storyboards/quest-01`

---

## Documentazione

- [`docs/architecture.md`](docs/architecture.md): separazione dei pacchetti, regole di dipendenza, modello della finestra di visualizzazione della tela, limite dell'archiviazione del progetto, estensibilità.
- [`docs/product-brief.md`](docs/product-brief.md): cos'è rpg-storyboard, utente target, avvisi sui rischi, porte di accettazione.
- [`docs/rpg-storyboard.md`](docs/rpg-storyboard.md): contratto per la creazione di giochi RPG, ciclo completo di creazione (Fase 2), modello di prontezza, esportazione del passaggio.
- [`docs/marketing-storyboard.md`](docs/marketing-storyboard.md): contratto per l'implementazione della campagna di marketing, modello di prontezza al lancio, percorso critico, esclusioni.
- [`docs/cinematic-storyboard.md`](docs/cinematic-storyboard.md): storyboard della produzione cinematografica, segnali di produzione, linguaggio della telecamera, esclusioni deliberate.
- [`docs/cinematic-phase-0-closeout.md`](docs/cinematic-phase-0-closeout.md): narrativa principale della fase 0 cinematografica, porte di accettazione, prova.
- [`docs/marketing-phase-0-closeout.md`](docs/marketing-phase-0-closeout.md): narrativa principale della fase 0 del marketing, porte di accettazione, prova.
- [`docs/phase-2-closeout.md`](docs/phase-2-closeout.md): narrativa principale della fase 2, registro dell'integrità dell'architettura, esclusioni deliberate.
- [`docs/phase-1-closeout.md`](docs/phase-1-closeout.md): narrativa principale e registro dell'integrità dell'architettura della fase 1.
- [`docs/phase-0-closeout.md`](docs/phase-0-closeout.md): verdetto del test di prova della fase 0 e backlog originale della fase 1.
- [`docs/monorepo-migration.md`](docs/monorepo-migration.md): registro della migrazione al monorepo: cosa è stato spostato, perché e l'architettura risultante.
- [`CHANGELOG.md`](CHANGELOG.md): cronologia dei rilasci.
