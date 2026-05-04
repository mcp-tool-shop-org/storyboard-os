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

<p align="center">Built by <a href="https://mcp-tool-shop.github.io/">MCP Tool Shop</a></p>

---

Una piattaforma per la creazione di storie visive, progettata per la narrazione interattiva: missioni, diramazioni, scene, incontri, conseguenze e la logica dello stato di gioco che le collega.

**rpg-storyboard** è la prima applicazione: uno strumento per la creazione di giochi RPG, progettato per la progettazione di missioni e scene. Non è una demo o un prototipo. È il prodotto per il quale questa piattaforma è stata creata.

---

## Cos'è Storyboard OS

Una struttura visiva per la progettazione di una narrazione **implementabile**. Ogni elemento sulla tela rappresenta una sequenza con:
- Condizioni di ingresso e uscita
- Modifiche dello stato (flag, variabili, stato del mondo)
- Risorse necessarie per la fase di produzione
- Criteri di test con verifiche di successo/fallimento
- Checklist di implementazione

La struttura visualizza il flusso dello stato di gioco, non solo la sequenza della storia. Le connessioni hanno un significato: diramazioni di scelta, archi di conseguenze, sequenze principali, percorsi alternativi. Un progettista può leggere la struttura e capire cosa fa effettivamente il gioco.

## Cos'è Storyboard OS (e cosa non è)

- Uno strumento generico per la creazione di diagrammi o una lavagna virtuale
- Un motore di sessione o un aiuto per il game master
- Una wiki o un database di informazioni sul mondo di gioco
- Un editor esclusivo per alberi di dialogo
- Un'applicazione per la preparazione di campagne

Se un utente potesse confondere questo prodotto con uno di questi, significa che la direzione intrapresa non è quella giusta.

---

## Cosa fa rpg-storyboard (Fase 2)

Dopo la Fase 2, un progettista può creare un progetto completo, dall'inizio alla consegna, senza uscire dal browser:

| Funzionalità | Cosa ottengono |
|---|---|
| **Project creation** | Creare un progetto con un nome, partendo da un modello; le posizioni e le modifiche nella struttura vengono salvate in localStorage |
| **Visual board** | Flusso della missione e logica di diramazione dello stato di gioco, affiancati su una tela Konva |
| **Beat editing** | Modificare direttamente sulla struttura il titolo, la descrizione e tutti i campi di specifica di implementazione di ogni sequenza |
| **Progress tracking** | Spuntare gli elementi della checklist di implementazione e i criteri di test per ogni sequenza; lo stato viene mantenuto anche dopo il ricaricamento |
| **Game-state signal** | Badge per ogni sequenza (STATO, SPECIFICO/PARZIALE/BOZZA) senza dover lasciare la struttura |
| **Implementation readiness** | Ogni sequenza mostra lo stato PRONTO/PARZIALE/BOZZA/BLOCCATO e cosa manca |
| **Project handoff** | Rigenerato dallo stato corrente del progetto: include contenuti modificati, progressi per ogni sequenza, informazioni sull'origine dei dati |
| **Quest handoff** | Esportazione in formato Markdown + JSON per le strutture di esempio |
| **Templates** | Tre punti di partenza per la produzione di giochi RPG, con sequenze di tipi di sequenza e relative motivazioni |
| **Board operations** | Zoom, panoramica, adattamento alla struttura, ripristino, scorciatoie da tastiera: navigazione utilizzabile con un laptop |

La struttura è una superficie di creazione. L'ispettore delle sequenze è una specifica di implementazione modificabile. La consegna è un documento generato dallo stato reale del progetto, non una semplice copia.

### Funzionalità della Fase 1 (ancora presenti)

La Fase 1 ha stabilito la struttura di anteprima in sola lettura: rendering della tela, segnale dello stato di gioco, modello di prontezza per l'implementazione, esportazione per la consegna delle missioni, galleria di modelli e navigazione nella struttura. Tutte le funzionalità della Fase 1 sono state preservate e ampliate nella Fase 2.

---

## Pacchetti

| Pacchetto | Cosa contiene |
|---|---|
| `@storyboard-os/core` | Elementi primitivi per la creazione di strutture: frame, connessione, annotazione, modello, validatore strutturale. Nessun vocabolario specifico del dominio. |
| `@storyboard-os/rpg-domain` | Contratto per la creazione di giochi RPG: tipi di frame, campi di contenuto, modelli, modello di prontezza, generatore di consegna, demo della missione Tollhouse Ledger. |
| `@storyboard-os/canvas` | Renderer per la tela Konva: frame, connessioni, selezione, trascinamento, badge di tipo, etichette di connessione, viewport di zoom/panoramica. Configurazione del dominio passata come parametro. |
| `@storyboard-os/routing` | Strumenti URL configurabili: generazione di percorsi per la struttura e i frame. Nessuna dipendenza. |

## Applicazioni

| Applicazione | Cos'è |
|---|---|
| `rpg-storyboard` | Prodotto per la creazione di giochi RPG Astro. Contiene: configurazione della tela RPG, ispettore dei frame, pagine di consegna, galleria di modelli, configurazione dei percorsi, layout delle pagine. |

---

## Architettura

I pacchetti formano una catena di dipendenze chiara:

```
apps/rpg-storyboard
  → @storyboard-os/rpg-domain  (RPG game-authoring contract)
  → @storyboard-os/canvas      (Konva renderer, domain-configurable)
  → @storyboard-os/routing     (URL helpers)

@storyboard-os/rpg-domain
  → @storyboard-os/core        (generic primitives)

@storyboard-os/canvas
  → (no platform deps — pure Konva + React)

@storyboard-os/routing
  → (no deps — pure string helpers)

@storyboard-os/core
  → (no deps)
```

Una seconda "verticale" (ad esempio, `apps/screenplay-storyboard`) creerebbe il proprio pacchetto di dominio e riutilizzerebbe `@storyboard-os/core`, `@storyboard-os/canvas` e `@storyboard-os/routing` senza modificare `@storyboard-os/rpg-domain`.

Consultare [`docs/architecture.md`](docs/architecture.md) per tutti i dettagli.

---

## Guida rapida

```bash
pnpm install
pnpm dev        # starts rpg-storyboard at localhost:4321
pnpm test       # runs all package + app tests (368 tests)
pnpm build      # builds rpg-storyboard (42 pages)
pnpm verify     # test + build in one command (ship gate)
```

Requisiti: Node ≥ 20, pnpm ≥ 9.

L'ambito dei test viene filtrato automaticamente ai pacchetti `@storyboard-os/*` e a `rpg-storyboard`; non include le sottocartelle nella directory principale.

---

## Modello di sicurezza

Storyboard OS è un'**applicazione per browser che funziona solo localmente**: non richiede un server, non ha account e non effettua connessioni di rete.

- **Dati accessibili:** Dati del progetto (specifiche delle scene, posizioni delle schede, avanzamento delle checklist) salvati solo nella memoria locale del browser dell'utente.
- **Dati NON accessibili:** Nessuna credenziale, nessuna informazione di pagamento, nessun dato personali oltre a ciò che il progettista inserisce nei campi delle specifiche delle scene.
- **Nessuna richiesta di rete durante l'esecuzione.** L'applicazione è un sito statico. Dopo il caricamento iniziale della pagina, non vengono effettuate chiamate di rete.
- **Nessuna telemetria.** Nulla viene raccolto o trasmesso.

Consultare [`SECURITY.md`](SECURITY.md) per il modello di sicurezza completo e per la segnalazione di vulnerabilità.

---

## Stato

```
Phase 2 complete
368/368 tests passing
42/42 pages built
```

| Fase | Descrizione | Stato |
|---|---|---|
| 0A–0F | Dimostrazione della creazione di giochi di ruolo: tela, pagine delle scene, modelli, quest di esempio | ✅ |
| 0R | Correzione e riallineamento: ogni frame contiene le specifiche dello stato del gioco | ✅ |
| 0M | Migrazione a monorepo: core, dominio, tela, routing estratti | ✅ |
| 1A | Visibilità dei rami e dello stato sulla tela | ✅ |
| 1B | Pronto per l'implementazione per ogni scena | ✅ |
| 1C | Esportazione della consegna della quest | ✅ |
| 1D | Galleria di modelli | ✅ |
| 1E | Operazioni sulla scheda: zoom, panoramica, adattamento, controlli della visualizzazione | ✅ |
| 1F | Chiusura del rilascio: documentazione, registro delle modifiche, note sull'architettura | ✅ |
| 2A | Creazione di progetti da modelli: persistenza nella memoria locale | ✅ |
| 2B | Posizioni delle schede persistenti per progetto | ✅ |
| 2C | Contenuto delle scene modificabile: le specifiche persistono durante il ricaricamento | ✅ |
| 2D | Persistenza della checklist/avanzamento: separata dal testo delle specifiche | ✅ |
| 2E | Consegna del progetto: rigenerata dallo stato del progetto salvato | ✅ |
| 2F | Chiusura del rilascio: documentazione, registro delle modifiche, note sull'architettura | ✅ |

---

## Demo

**The Tollhouse Ledger** — tre fazioni vogliono lo stesso registro nascosto. Il giocatore decide chi vince, chi perde e come sarà la regione. Otto scene con specifiche complete dello stato del gioco: nomi dei flag, requisiti delle risorse, criteri di test di successo/fallimento, checklist di implementazione.

Ogni frame della demo può essere implementato come una quest in un motore di giochi di ruolo senza documentazione aggiuntiva.

Percorso: `/storyboards/quest-01`

---

## Documentazione

- [`docs/architecture.md`](docs/architecture.md) — separazione dei pacchetti, regole delle dipendenze, modello di visualizzazione della tela, limite di archiviazione del progetto, estensibilità
- [`docs/product-brief.md`](docs/product-brief.md) — cos'è rpg-storyboard, utente target, avvisi di deviazione, criteri di accettazione
- [`docs/rpg-storyboard.md`](docs/rpg-storyboard.md) — contratto di creazione di giochi di ruolo, ciclo completo di creazione (Fase 2), modello di prontezza, esportazione della consegna
- [`docs/phase-2-closeout.md`](docs/phase-2-closeout.md) — narrativa della Fase 2, registro dell'integrità dell'architettura, esclusioni deliberate
- [`docs/phase-1-closeout.md`](docs/phase-1-closeout.md) — narrativa della Fase 1 e registro dell'integrità dell'architettura
- [`docs/phase-0-closeout.md`](docs/phase-0-closeout.md) — verdetto di test interno della Fase 0 e backlog originale della Fase 1
- [`docs/monorepo-migration.md`](docs/monorepo-migration.md) — registro della migrazione a monorepo: cosa è stato spostato, perché e l'architettura risultante
- [`CHANGELOG.md`](CHANGELOG.md) — storico delle versioni
