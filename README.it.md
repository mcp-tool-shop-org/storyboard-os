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

Una piattaforma per la creazione di storie interattive, pensata per la narrazione visiva: missioni, campagne, sequenze cinematografiche e la logica di produzione che le collega.

**Tre aree di applicazione, un'unica piattaforma:**

| Area di applicazione | Dominio |
|---|---|
| `rpg-storyboard` | Missioni/narrazione di giochi di ruolo: creazione pronta per l'implementazione. |
| `marketing-storyboard` | Lancio di una campagna: preparazione al lancio e percorso critico. |
| `cinematic-storyboard` | Trailer/sequenza/spiegazione: storyboard di produzione. |

Tutti e tre sono prodotti, non demo. Nessuno importa dati dagli altri.

---

## Cos'è Storyboard OS

Una struttura visuale per la progettazione di una **narrazione implementabile**. Ogni elemento sullo schermo rappresenta una sezione con:
- Condizioni di ingresso e uscita
- Modifiche dello stato (flag, variabili, stato del mondo)
- Risorse necessarie per la fase di produzione
- Criteri di test con verifiche di successo/fallimento
- Checklist di implementazione

La struttura visualizza il flusso dello stato del gioco, non solo la sequenza della storia. Le connessioni hanno un significato: rami di scelta, archi di conseguenze, sequenze principali, percorsi alternativi. Un progettista può leggere la struttura e capire cosa fa effettivamente il gioco.

## Cos'è Storyboard OS (non è)

- Uno strumento generico per la creazione di diagrammi o una lavagna virtuale
- Un motore di sessione o un aiuto per il game master
- Una wiki o un database di informazioni sul mondo di gioco
- Un editor esclusivo per alberi di dialogo
- Un'applicazione per la preparazione di campagne

Se un utente potesse confondere questo prodotto con uno di questi, significa che il prodotto si è discostato dal suo scopo.

---

## Cosa fa rpg-storyboard (Fase 2)

Dopo la Fase 2, un progettista può creare un progetto completo, dall'inizio alla consegna, senza uscire dal browser:

| Funzionalità | Cosa ottiene |
|---|---|
| **Project creation** | Crea un progetto con un nome, partendo da un modello; le posizioni e le modifiche nella struttura vengono salvate nella memoria locale. |
| **Visual board** | Flusso delle missioni e logica di ramificazione dello stato del gioco, affiancati su una tela Konva. |
| **Beat editing** | Modifica direttamente sulla struttura il titolo, il riepilogo e tutti i campi di specifica di implementazione di ogni sezione. |
| **Progress tracking** | Spunta le voci della checklist di implementazione e i criteri di test per ogni sezione; lo stato viene mantenuto anche dopo il caricamento. |
| **Game-state signal** | Badge per ogni sezione (STATO, SPECIFICO/PARZIALE/BOZZA) senza dover lasciare la struttura. |
| **Implementation readiness** | Ogni sezione mostra lo stato PRONTO/PARZIALE/BOZZA/BLOCCATO e cosa manca. |
| **Project handoff** | Ricreata a partire dallo stato attuale del progetto: include contenuti modificati, progressi per sezione, informazioni sull'origine. |
| **Quest handoff** | Esportazione in formato Markdown + JSON per le strutture di esempio. |
| **Templates** | Tre punti di partenza per la produzione di giochi di ruolo, con sequenze di tipi di sezione e relative motivazioni. |
| **Board operations** | Zoom, panoramica, adattamento alla struttura, ripristino, scorciatoie da tastiera: navigazione utilizzabile con un laptop. |

La struttura è una superficie di creazione. L'ispettore delle sezioni è una specifica di implementazione modificabile. La consegna è un documento generato a partire dallo stato reale del progetto, non una semplice copia.

### Funzionalità della Fase 1 (ancora presenti)

La Fase 1 ha introdotto la struttura di anteprima in sola lettura: rendering della tela, segnale dello stato del gioco, modello di prontezza per l'implementazione, esportazione per la consegna delle missioni, galleria di modelli e navigazione nella struttura. Tutte le funzionalità della Fase 1 sono state mantenute e ampliate nella Fase 2.

---

## Pacchetti

| Pacchetto | Cosa contiene |
|---|---|
| `@storyboard-os/core` | Elementi primitivi per la creazione di strutture: sezione, connessione (generica per tipo), annotazione, modello, validatore strutturale. I domini contengono i propri vocabolari di connessioni. |
| `@storyboard-os/rpg-domain` | Contratto per la creazione di giochi di ruolo: tipi di sezione, campi di contenuto, modelli, modello di prontezza, generatore di consegna, demo della missione Tollhouse Ledger. |
| `@storyboard-os/marketing-domain` | Contratto per l'implementazione di campagne di marketing: tipi di sezione (pubblico, messaggio, punto di contatto, risorsa, approvazione, evento di lancio, misurazione), modello di prontezza per il lancio, percorso critico, controlli di approvazione, cicli di misurazione, esportazione del brief della campagna, demo della campagna. |
| `@storyboard-os/cinematic-domain` | Contratto per la produzione cinematografica: 9 tipi di fotogramma, linguaggio della telecamera, requisiti per VFX/audio/montaggio, indicatori di produzione (stato, carico, complessità, riprese bloccate), passaggio delle informazioni sulla produzione, 3 modelli, sequenza di anteprima. |
| `@storyboard-os/canvas` | Renderer per canvas Konva: fotogrammi, connessioni, selezione, trascinamento, badge di tipo, etichette di connessione, zoom/panoramica. Configurazione del dominio passata come parametro. |
| `@storyboard-os/routing` | Funzioni URL configurabili: generazione di percorsi per la bacheca e i fotogrammi. Nessuna dipendenza. |

## Applicazioni

| Applicazione | Cos'è |
|---|---|
| `rpg-storyboard` | Prodotto per la creazione di giochi di ruolo (RPG). Include: configurazione del canvas RPG, ispettore dei fotogrammi, pagine di passaggio informazioni, galleria di modelli, configurazione dei percorsi, layout delle pagine. |
| `marketing-storyboard` | Storyboard per l'implementazione di una campagna RPG. Include: configurazione del canvas per il marketing, bacheca della campagna, ispettore dei fotogrammi, badge di prontezza al lancio, enfasi sul percorso critico, pannello di blocco del lancio, passaggio delle informazioni sulla campagna. |
| `cinematic-storyboard` | Storyboard per la produzione cinematografica. Include: configurazione del canvas cinematografico, bacheca delle sequenze, ispettore dei fotogrammi (telecamera/VFX/audio/montaggio), pannello degli indicatori di produzione (stato/carico/complessità), passaggio delle informazioni sulla produzione. |

---

## Architettura

I pacchetti formano una catena di dipendenze chiara:

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

Un quarto modulo creerebbe il proprio pacchetto di dominio e riutilizzerebbe `@storyboard-os/core`, `@storyboard-os/canvas` e `@storyboard-os/routing` senza modificare alcun pacchetto di dominio esistente. Tre moduli hanno già dimostrato questo schema: zero modifiche al canvas, al core o al routing.

Consultare [`docs/architecture.md`](docs/architecture.md) per i dettagli completi.

---

## Guida introduttiva

<!-- AUTOGEN-NOTE: I valori degli snapshot (649 test, 54 pagine) sottostanti sono aggiornati manualmente.
Verificare con: pnpm test (numero di test), pnpm -r build (numero di pagine).
Consultare docs/snapshot-checklist.md per ogni posizione che contiene questi snapshot. -->

```bash
pnpm install
pnpm dev        # starts rpg-storyboard at localhost:4321
pnpm test       # runs all package + app tests (649 tests)
pnpm build      # builds all 3 apps (54 pages)
pnpm verify     # test + build in one command (ship gate)
```

Requisiti: Node ≥ 20, pnpm ≥ 9.

L'ambito dei test viene filtrato automaticamente ai pacchetti `@storyboard-os/*` e `rpg-storyboard`: non include le sottocartelle nello stesso livello.

---

## Modello di sicurezza

Storyboard OS è un'**applicazione per browser che funziona solo localmente**: non richiede un server, account o connessione di rete.

- **Dati accessibili:** Dati del progetto (specifiche dei "beat", posizioni sulla bacheca, avanzamento delle checklist) memorizzati solo nella memoria locale del browser dell'utente.
- **Dati NON accessibili:** Nessuna credenziale, nessuna informazione di pagamento, nessuna informazione personale oltre a ciò che il designer inserisce nei campi delle specifiche dei "beat".
- **Nessuna richiesta di rete durante l'esecuzione.** L'applicazione è un sito statico. Dopo il caricamento iniziale della pagina, non vengono effettuate chiamate di rete.
- **Nessuna telemetria.** Non viene raccolto né trasmesso nulla.

Consultare [`SECURITY.md`](SECURITY.md) per il modello di sicurezza completo e la segnalazione di vulnerabilità.

---

## Stato

<!-- AUTOGEN-NOTE: I valori degli snapshot sottostanti (649 test, 54 pagine, 6 pacchetti, 3 applicazioni) sono
aggiornati manualmente. Verificare con:
pnpm test                       # test superati
pnpm -r build                   # pagine generate (conteggio dall'output di Astro)
ls packages/ | wc -l            # numero di pacchetti
ls apps/ | wc -l                # numero di applicazioni
Consultare docs/snapshot-checklist.md per ogni documento che contiene questi dati. -->

```
Phase 2 complete + Marketing Phase 0 complete + Cinematic Phase 0 complete + Core Hardening 1A
649/649 tests passing
54/54 pages built
6 packages · 3 apps
```

| Fase | Descrizione | Stato |
|---|---|---|
| 0A–0F | Prova di creazione di giochi RPG: canvas, pagine dei "beat", modelli, quest demo | ✅ |
| 0R | Riparazione e riallineamento: ogni fotogramma contiene le specifiche dello stato del gioco | ✅ |
| 0M | Migrazione a monorepo: core, dominio, canvas, routing estratti | ✅ |
| 1A | Visibilità dei rami e dello stato sul canvas | ✅ |
| 1B | Pronto per l'implementazione per ogni "beat" | ✅ |
| 1C | Esportazione della quest | ✅ |
| 1D | Galleria di modelli | ✅ |
| 1E | Operazioni sulla bacheca: zoom, panoramica, adattamento, controlli della visualizzazione | ✅ |
| 1F | Chiusura del rilascio: documentazione, changelog, note sull'architettura. | ✅ |
| 2A | Creazione di progetti a partire da modelli: persistenza tramite localStorage. | ✅ |
| 2B | Posizioni delle schede persistenti per progetto. | ✅ |
| 2C | Contenuto delle "beat" modificabile: i campi delle specifiche persistono anche dopo il ricaricamento. | ✅ |
| 2D | Persistenza delle checklist/progressi: separata dal testo delle specifiche. | ✅ |
| 2E | Passaggio di consegne del progetto: rigenerato a partire dallo stato del progetto salvato. | ✅ |
| 2F | Chiusura del rilascio: documentazione, changelog, note sull'architettura. | ✅ |
| M-0A | Pacchetto per il dominio del marketing: schema, segnali, modelli, validazione, campagna dimostrativa. | ✅ |
| M-0B | Verticale applicativo per il marketing: pannello "Astro" per le campagne, ispettore dei fotogrammi, passaggio di consegne. | ✅ |
| M-0C | Strato di segnali per la preparazione al lancio: percorso critico, approvazioni, cicli di misurazione. | ✅ |
| M-0D | Chiusura del marketing: documentazione, changelog, verifica dell'architettura. | ✅ |
| C-0A | Pacchetto per il dominio cinematografico: schema, linguaggio delle telecamere, VFX/audio, modelli, validazione, demo. | ✅ |
| C-0B | Verticale applicativo per il cinema: pannello "Astro" per le sequenze, ispettore dei fotogrammi, briefing di produzione. | ✅ |
| C-0C | Strato di segnali per la produzione: stato di salute, carico di VFX/audio, complessità delle telecamere, riprese bloccate. | ✅ |
| C-0D | Chiusura del cinema: documentazione, changelog, verifica dell'architettura. | ✅ |
| H-1A | Rafforzamento del core: tipi di connessione generici, i domini gestiscono il proprio vocabolario. | ✅ |

---

## Demo

**The Tollhouse Ledger** — tre fazioni vogliono lo stesso registro nascosto. Il giocatore decide chi vince, chi perde e come sarà la regione. Otto "beat" con specifiche complete dello stato del gioco: nomi delle bandiere, requisiti delle risorse, criteri di test di successo/fallimento, checklist di implementazione.

Ogni fotogramma della demo può essere implementato come una missione in un motore di gioco RPG senza documentazione aggiuntiva.

Percorso: `/storyboards/quest-01`

---

## Documentazione

- [`docs/architecture.md`](docs/architecture.md) — separazione dei pacchetti, regole delle dipendenze, modello di viewport della tela, confine di archiviazione del progetto, estensibilità.
- [`docs/product-brief.md`](docs/product-brief.md) — cos'è rpg-storyboard, utente target, avvisi di deviazione, criteri di accettazione.
- [`docs/rpg-storyboard.md`](docs/rpg-storyboard.md) — contratto per la creazione di giochi RPG, ciclo completo di creazione (Fase 2), modello di prontezza, esportazione per il passaggio di consegne.
- [`docs/marketing-storyboard.md`](docs/marketing-storyboard.md) — contratto per l'implementazione di campagne di marketing, modello di prontezza per il lancio, percorso critico, esclusioni.
- [`docs/cinematic-storyboard.md`](docs/cinematic-storyboard.md) — storyboard per la produzione cinematografica, segnali di produzione, linguaggio delle telecamere, esclusioni deliberate.
- [`docs/cinematic-phase-0-closeout.md`](docs/cinematic-phase-0-closeout.md) — narrativa principale della Fase 0 cinematografica, criteri di accettazione, verifica.
- [`docs/marketing-phase-0-closeout.md`](docs/marketing-phase-0-closeout.md) — narrativa principale della Fase 0 del marketing, criteri di accettazione, verifica.
- [`docs/phase-2-closeout.md`](docs/phase-2-closeout.md) — narrativa principale della Fase 2, registro dell'integrità dell'architettura, esclusioni deliberate.
- [`docs/phase-1-closeout.md`](docs/phase-1-closeout.md) — narrativa principale della Fase 1 e registro dell'integrità dell'architettura.
- [`docs/phase-0-closeout.md`](docs/phase-0-closeout.md) — verdetto della Fase 0 (test interno) e backlog originale della Fase 1.
- [`docs/monorepo-migration.md`](docs/monorepo-migration.md) — registro della migrazione al monorepo: cosa è stato spostato, perché e l'architettura risultante.
- [`CHANGELOG.md`](CHANGELOG.md) — cronologia delle release.
