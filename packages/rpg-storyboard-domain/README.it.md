<p align="center">
  <a href="README.ja.md">日本語</a> | <a href="README.zh.md">中文</a> | <a href="README.es.md">Español</a> | <a href="README.fr.md">Français</a> | <a href="README.hi.md">हिन्दी</a> | <a href="README.md">English</a> | <a href="README.pt-BR.md">Português (BR)</a>
</p>

<p align="center">
  <img src="https://raw.githubusercontent.com/mcp-tool-shop-org/brand/main/logos/storyboard-os/readme.png" alt="Storyboard OS" width="400" />
</p>

<p align="center">
  <a href="https://github.com/mcp-tool-shop-org/storyboard-os/actions/workflows/ci.yml"><img src="https://github.com/mcp-tool-shop-org/storyboard-os/actions/workflows/ci.yml/badge.svg" alt="CI" /></a>
  <a href="https://www.npmjs.com/package/@storyboard-os/rpg-domain"><img src="https://img.shields.io/npm/v/@storyboard-os/rpg-domain.svg" alt="npm" /></a>
  <a href="../../LICENSE"><img src="https://img.shields.io/badge/license-MIT-blue.svg" alt="MIT License" /></a>
</p>

<p align="center"><strong>Contratto per la creazione di giochi di ruolo (RPG) per la piattaforma Storyboard OS.</strong></p>

---

# @storyboard-os/rpg-domain

Pacchetto per il dominio dei giochi di ruolo. Include tutto ciò di cui un progettista, scrittore o sviluppatore di giochi di ruolo ha bisogno per progettare una narrazione di missioni e scene implementabile: tipi di frame, schemi di contenuto, modelli, regole di validazione, segnali della tela, modello di prontezza, generazione di consegne e helper per la persistenza del progetto.

**Utente target:** Un progettista o sviluppatore di giochi che lavora a un videogioco di ruolo e che ha bisogno di progettare sequenze con sufficiente profondità per poterle trasferire a un motore di gioco o a una fase di produzione.

**Non adatto per:** Preparazione di sessioni di gioco da tavolo, strumenti per il master del gioco, VTT (Virtual Tabletop), note di campagna o editor di dialoghi. Il validatore applica questa restrizione: i frame che contengono terminologia da gioco da tavolo non superano la validazione.

---

## Installazione

```bash
npm install @storyboard-os/rpg-domain
# or
pnpm add @storyboard-os/rpg-domain
```

---

## Tipi di frame

Sette tipi. Ognuno definisce una funzione specifica in una missione o scena di gioco di ruolo.

| Tipo | Funzione | Colore suggerito |
|---|---|---|
| `hook` | Punto di ingresso o filo conduttore — apertura della missione o spunto per il futuro | `#EAB308` |
| `scene` | Sequenza narrativa o ambientazione — il "dove" e il "cosa" | `#3B82F6` |
| `choice` | Punto di decisione del giocatore — dirama la sequenza, imposta flag di stato | `#8B5CF6` |
| `encounter` | Combattimento, enigma, conflitto sociale o ostacolo ad alto rischio | `#EF4444` |
| `reveal` | Informazione, colpo di scena, indizio o sblocco dello stato del gioco forniti | `#F97316` |
| `npc_beat` | Interazione con il personaggio con logica di diramazione del dialogo | `#22C55E` |
| `consequence` | Esito dello stato del mondo — cosa cambia dopo una scelta o un evento | `#6B7280` |

**Regole del dominio applicate da `validateRpgStoryboard`:**
- I frame `choice` e `consequence` devono contenere almeno una voce `stateChanges`.
- I frame `reveal` devono contenere almeno una condizione di ingresso (`entryCondition`) o una modifica dello stato (`stateChange`).
- Il contenuto dei frame non può contenere termini relativi al gioco da tavolo.

---

## Schema del contenuto

Ogni frame di gioco di ruolo contiene un oggetto `FrameContent` con un livello di dettaglio implementativo, non solo note sulla storia.

```ts
interface FrameContent {
  designerNotes?: string;          // Intent, tone, design rationale — author-facing
  playerVisibleText?: string;      // What the player actually sees or hears
  authorOnlyNotes?: string;        // Spoilers, hidden logic — never shown in-game
  stakes?: string;                 // What is at risk if this beat fails or is skipped
  entryConditions?: string[];      // Game-state flags that must be true before this fires
  exitConditions?: string[];       // What must be true for this beat to resolve
  stateChanges?: string[];         // Flags / variables / world-state this beat sets
  involvedCharacters?: string[];   // Named characters present or referenced
  involvedFactions?: string[];     // Factions with stakes in this beat
  possibleOutcomes?: string[];     // All distinct results this beat can produce
  requiredAssets?: string[];       // Art, audio, props, dialogue, animations needed
  testCriteria?: string[];         // Pass/fail checks that verify correct implementation
  implementationChecklist?: string[]; // Ordered task list for the dev or production pass
}
```

Un frame senza `entryConditions`, `stateChanges`, `requiredAssets` e `testCriteria` è una semplice nota sulla storia, non una specifica di gioco. I test di controllo applicano questa regola a ogni frame generato dai modelli.

---

## Modelli

Tre punti di partenza per la produzione di giochi di ruolo. Ogni frame generato dai modelli contiene condizioni di ingresso, modifiche dello stato, risorse richieste e criteri di test. I modelli sono strutture di pensiero, non semplici punti di partenza vuoti.

```ts
import { STORYBOARD_TEMPLATES, createStoryboardFromTemplate } from '@storyboard-os/rpg-domain';

const template = STORYBOARD_TEMPLATES.find(t => t.id === 'quest_flow');
console.log(template.name);       // 'Quest Flow'
console.log(template.frameCount); // 8
console.log(template.bestFor);    // 'First draft of any new quest...'

const storyboard = createStoryboardFromTemplate('quest_flow', {
  id: 'my-quest',
  title: 'The Ruined Tollhouse',
  description: 'Three factions want the same ledger.',
});
```

### Flusso della missione (`quest_flow`) — 8 frame

```
Opening Hook → Establishing Scene → Character Contact → Key Choice
  → The Obstacle → The Reveal → The Consequence → Future Thread
```

Missione lineare con un'unica diramazione principale guidata dal giocatore. Ideale per le prime bozze: forza ogni sequenza a includere la logica dello stato fin dall'inizio.

### Diramazione della missione (`quest_branch`) — 7 frame

```
Inciting Situation → Decision Point → [Path A | Path B | Path C]
  → Convergence Point → Fallout Thread
```

Tre percorsi divergenti con costi e ricompense distinti. Ideale per le decisioni del giocatore che creano un gameplay veramente diverso, non la stessa sequenza con una diversa "vernice".

### Sequenza cinematica (`cutscene_beat`) — 5 frame

```
Establishing Frame → Character Beat → The Revelation
  → Player Response → The Shift
```

Un momento drammatico creato che preserva l'autonomia del giocatore. Il frame di risposta del giocatore è obbligatorio: senza di esso, la sequenza è una sequenza cinematica nel senso peggiore del termine.

---

## Validazione

```ts
import { validateStoryboard, validateRpgStoryboard } from '@storyboard-os/rpg-domain';

// Structural validation only (from @storyboard-os/core)
const structural = validateStoryboard(storyboard);

// RPG domain rules layered on top
const rpg = validateRpgStoryboard(storyboard);

if (!rpg.valid) {
  rpg.errors.forEach(e => console.error(e.code, e.message, e.frameId));
}
```

Codici di errore specifici per i giochi di ruolo includono `CHOICE_MISSING_STATE_CHANGES`, `CONSEQUENCE_MISSING_STATE_CHANGES`, `REVEAL_MISSING_ENTRY_OR_STATE` e `TABLETOP_DRIFT_TERM`.

---

## Segnali della tela

Queste funzioni producono dati di visualizzazione dal contenuto dei frame senza richiedere codice della tela o React. Il pacchetto della tela esegue il rendering dei risultati; il dominio li calcola.

```ts
import { getFrameSignal, getFrameBadges, getChoiceBranchCount } from '@storyboard-os/rpg-domain';

const signal = getFrameSignal(frame);
signal.stateChangeSummary;     // e.g. "Sets 2 flags"
signal.branchConditionSummary; // e.g. "3 outgoing branches"
signal.readiness;              // 'full' | 'partial' | 'none'
signal.hasStateChanges;        // boolean
signal.specScore;              // 0–4

const badges = getFrameBadges(frame, connections);
// → [{ text: 'STATE', color: '#3B82F6' }, { text: 'SPEC', color: '#22C55E' }]
// Rendered by @storyboard-os/canvas without needing to know what they mean
```

---

## Modello di prontezza per l'implementazione

`getBeatStatus` è la fonte autorevole di cosa significhi "pronto". L'applicazione esegue il rendering del risultato; il dominio lo determina.

```ts
import { getBeatStatus, getStoryboardReadiness, BLOCKING_REASONS } from '@storyboard-os/rpg-domain';

const status = getBeatStatus(frame);

status.level;             // 'ready' | 'partial' | 'draft' | 'blocked'
status.missing;           // MissingSpecReason[]
status.assetCount;        // number of requiredAssets entries
status.testCriteriaCount; // number of testCriteria entries
status.checklistCount;    // number of implementationChecklist entries

// Distinguish domain violations (blockers) from spec gaps
const blockers = status.missing.filter(r => BLOCKING_REASONS.has(r));
const gaps     = status.missing.filter(r => !BLOCKING_REASONS.has(r));
```

### Livelli di stato

| Livello | Significato |
|---|---|
| `ready` | Tutte le sezioni delle specifiche sono presenti. Punteggio delle specifiche ≥ 3 (note del progettista, risorse richieste, criteri di test, checklist di implementazione). Nessuna violazione delle regole del dominio. |
| `partial` | Alcune sezioni delle specifiche sono presenti ma incomplete. Punteggio delle specifiche da 1 a 2. |
| `draft` | Nessuna specifica (punteggio = 0). La struttura esiste, ma non contiene dettagli sull'implementazione. |
| `blocked` | Violazione delle regole del dominio: manca `stateChanges` in `choice`/`consequence`, oppure mancano sia `entryConditions` che `stateChanges` in `reveal`. |

```ts
// Board-level readiness summary
const summary = getStoryboardReadiness(storyboard);
summary.total;         // total frame count
summary.ready;         // frames at 'ready'
summary.partial;       // frames at 'partial'
summary.draft;         // frames at 'draft'
summary.blocked;       // frames at 'blocked'
summary.readyFraction; // ready / total (0–1)
summary.byFrame;       // Map<frameId, BeatStatus>
```

---

## Esportazione del passaggio di consegne

```ts
import { generateHandoff, generateMarkdown } from '@storyboard-os/rpg-domain';

// For template preview boards — static storyboard data
const handoff = generateHandoff(storyboard);
const markdown = generateMarkdown(handoff);
```

Le sequenze sono ordinate topologicamente utilizzando l'algoritmo di Kahn: le dipendenze precedenti vengono prima degli esiti successivi. I cicli vengono rilevati e i frame rimanenti vengono aggiunti senza causare errori.

Ogni `HandoffBeat` include: stato, motivi della mancanza, tutti i campi delle specifiche, rami in uscita con tipo ed etichetta, e ID dei beat in entrata. L'intestazione del passaggio di consegne mostra i conteggi totali/pronti/parziali/bozze/bloccati e gli ID dei beat bloccati (`blockedBeatIds`) e parziali (`partialBeatIds`) per una valutazione immediata.

---

## Strumenti di supporto per il dominio del progetto

Per progetti di creazione duraturi: creare un progetto, modificare il contenuto delle specifiche e monitorare i progressi separatamente dal testo delle specifiche.

```ts
import {
  createProject,
  updateFrameBasics,
  updateFrameContent,
  updateFramePosition,
  setChecklistItemComplete,
  setTestCriterionComplete,
  getFrameProgress,
  getProjectProgress,
} from '@storyboard-os/rpg-domain';

// Create a project from a template
const project = createProject({
  title: 'The Ruined Tollhouse',
  description: 'Three factions want the same ledger.',
  sourceTemplateId: 'quest_flow',
});

// All update functions are pure — they return a new project object
const updated = updateFrameBasics(project, 'hook-1', { title: 'The Caravan Arrives' });
const edited  = updateFrameContent(updated, 'hook-1', {
  designerNotes: 'Environmental storytelling — no dialogue in this beat.',
  entryConditions: ['quest_tollhouse_active === true'],
  requiredAssets: ['ruined tollhouse exterior', 'abandoned caravan prop'],
});

// Track progress separately from spec text (spec strings are never modified)
const p1 = setChecklistItemComplete(edited, 'hook-1', 0, true);
const p2 = setTestCriterionComplete(p1, 'hook-1', 0, true);

// Read back progress
const frameProgress = getFrameProgress(p2, 'hook-1');
frameProgress.checklist;    // { "0": true, ... }
frameProgress.testCriteria; // { "0": true, ... }

const summary = getProjectProgress(p2);
summary.totalChecklist; // total checklist items across all frames
summary.doneChecklist;  // completed items
summary.totalTests;     // total test criteria across all frames
summary.doneTests;      // completed criteria
```

**Invariante di avanzamento:** le stringhe `implementationChecklist` e `testCriteria` nelle specifiche non vengono mai modificate dalle funzioni di avanzamento. Lo stato di completamento è memorizzato separatamente in `project.progress.frames`. La specifica può essere modificata indipendentemente dai progressi, e il passaggio di consegne può essere rigenerato in qualsiasi momento a partire dallo stato corrente di entrambi.

### Passaggio di consegne del progetto

```ts
import { generateProjectHandoff, generateProjectMarkdown } from '@storyboard-os/rpg-domain';

// For durable projects — includes edited content + progress
const handoff = generateProjectHandoff(project);

handoff.projectId;       // project.id
handoff.title;           // project.title
handoff.sourceTemplateId;
handoff.generatedAt;
handoff.progress;        // ProjectProgressSummary
handoff.beats;           // ProjectHandoffBeat[] — spec + completion arrays

// Each ProjectHandoffBeat extends HandoffBeat with:
// checklistProgress: boolean[]   — one entry per checklist item
// testProgress: boolean[]        — one entry per test criterion

const markdown = generateProjectMarkdown(handoff);
// Produces Markdown with [x]/[ ] per item, project identity header, progress summary
```

---

## Demo: La contabilità della Tollhouse

Una quest di 8 sequenze completamente documentata. Ogni sequenza contiene nomi di flag specifici, requisiti di risorse e criteri di test: può essere utilizzata come implementazione di riferimento o come demo funzionante.

```ts
import { tollhouseLedgerProject } from '@storyboard-os/rpg-domain';

const storyboard = tollhouseLedgerProject.storyboard;
console.log(storyboard.frames.length); // 8

const hook = storyboard.frames[0];
hook.content.stateChanges;   // ['Sets: quest_tollhouse_active = true']
hook.content.requiredAssets; // ['Ruined tollhouse exterior environment', ...]
hook.content.testCriteria;   // ['Player can observe the abandoned caravan without dialogue trigger', ...]
```

**Scenario:** Il giocatore arriva a una caserma di pedaggio devastata dalla guerra. Tre fazioni vogliono lo stesso registro nascosto. Il giocatore decide chi lo ottiene, chi lo perde e come apparirà la regione in futuro. Otto sequenze con due rami di conseguenze.

---

## Modello di fiducia

`@storyboard-os/rpg-domain` è una libreria TypeScript pura. Non ha effetti collaterali a runtime, non ha I/O, non ha accesso alla rete e non ha API per browser o Node.js. Tutte le funzioni accettano dati e restituiscono dati. Nulla viene memorizzato, registrato o trasmesso da questo pacchetto: la persistenza è responsabilità dell'applicazione che lo utilizza.

---

<p align="center">Part of <a href="https://github.com/mcp-tool-shop-org/storyboard-os">storyboard-os</a> · Built by <a href="https://mcp-tool-shop.github.io/">MCP Tool Shop</a></p>
