<p align="center">
  <a href="README.ja.md">日本語</a> | <a href="README.zh.md">中文</a> | <a href="README.es.md">Español</a> | <a href="README.md">English</a> | <a href="README.hi.md">हिन्दी</a> | <a href="README.it.md">Italiano</a> | <a href="README.pt-BR.md">Português (BR)</a>
</p>

<p align="center">
  <img src="https://raw.githubusercontent.com/mcp-tool-shop-org/brand/main/logos/storyboard-os/readme.png" alt="Storyboard OS" width="400" />
</p>

<p align="center">
  <a href="https://github.com/mcp-tool-shop-org/storyboard-os/actions/workflows/ci.yml"><img src="https://github.com/mcp-tool-shop-org/storyboard-os/actions/workflows/ci.yml/badge.svg" alt="CI" /></a>
  <a href="https://www.npmjs.com/package/@storyboard-os/rpg-domain"><img src="https://img.shields.io/npm/v/@storyboard-os/rpg-domain.svg" alt="npm" /></a>
  <a href="../../LICENSE"><img src="https://img.shields.io/badge/license-MIT-blue.svg" alt="MIT License" /></a>
</p>

<p align="center"><strong>Contrat de développement de jeux de rôle pour la plateforme Storyboard OS.</strong></p>

---

# @storyboard-os/rpg-domain

Le paquet de domaine pour le développement de jeux de rôle. Tout ce dont un concepteur, un rédacteur ou un développeur de jeux de rôle a besoin pour concevoir des quêtes et des narrations de scènes qui peuvent être mises en œuvre : types de cadres, schémas de contenu, modèles, règles de validation, signaux de la zone de travail, modèle de préparation, génération de transmission et outils d'assistance à la persistance des projets.

**Utilisateur cible :** Un concepteur ou un développeur de jeux qui travaille sur un jeu de rôle vidéo et qui a besoin de concevoir des séquences avec suffisamment de profondeur pour pouvoir les transmettre à un moteur de jeu ou à une équipe de production.

**Non destiné à :** Préparation de sessions de jeu de rôle sur table, outils pour les maîtres de jeu, simulateurs de table virtuels, notes de campagne ou éditeurs de dialogues uniquement. Le validateur applique cette règle : les cadres contenant une terminologie propre aux jeux de rôle sur table ne passent pas la validation.

---

## Installation

```bash
npm install @storyboard-os/rpg-domain
# or
pnpm add @storyboard-os/rpg-domain
```

---

## Types de cadres

Sept types. Chaque type désigne une fonction spécifique dans une quête ou une scène de jeu de rôle.

| Type | Fonction | Couleur suggérée |
|---|---|---|
| `hook` | Point d'entrée ou fil conducteur — ouverture de quête ou amorce pour une suite. | `#EAB308` |
| `scene` | Séquence narrative ou lieu — le "où" et le "quoi". | `#3B82F6` |
| `choice` | Point de décision du joueur — divise le scénario, définit les états. | `#8B5CF6` |
| `encounter` | Combat, énigme, conflit social ou obstacle majeur. | `#EF4444` |
| `reveal` | Information, rebondissement, indice ou déverrouillage de l'état du jeu. | `#F97316` |
| `npc_beat` | Interaction avec un personnage avec logique de branchement du dialogue. | `#22C55E` |
| `consequence` | Conséquence sur l'état du monde — ce qui change après un choix ou un événement. | `#6B7280` |

**Règles du domaine appliquées par `validateRpgStoryboard` :**
- Les cadres `choice` (choix) et `consequence` (conséquence) doivent contenir au moins une entrée `stateChanges` (modifications d'état).
- Les cadres `reveal` (révélation) doivent contenir au moins une entrée `entryCondition` (condition d'entrée) ou `stateChange` (modification d'état).
- Le contenu des cadres ne doit pas contenir de termes propres aux jeux de rôle sur table.

---

## Schéma de contenu

Chaque cadre de jeu de rôle contient un objet `FrameContent` (contenu du cadre) avec une profondeur de mise en œuvre, et pas seulement des notes de scénario.

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

Un cadre sans `entryConditions` (conditions d'entrée), `stateChanges` (modifications d'état), `requiredAssets` (ressources nécessaires) et `testCriteria` (critères de test) est une simple note de scénario, et non une spécification de jeu. Les tests de contrôle appliquent cette règle à chaque cadre généré par un modèle.

---

## Modèles

Trois points de départ pour la production de jeux de rôle. Chaque cadre généré par un modèle contient des conditions d'entrée, des modifications d'état, des ressources nécessaires et des critères de test. Les modèles sont des structures de pensée, et non des points de départ vierges.

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

### Flux de quête (`quest_flow`) — 8 cadres

```
Opening Hook → Establishing Scene → Character Contact → Key Choice
  → The Obstacle → The Reveal → The Consequence → Future Thread
```

Quête linéaire avec une branche principale pilotée par le joueur. Idéal pour les premières versions — force chaque séquence à inclure une logique d'état dès le départ.

### Branche de quête (`quest_branch`) — 7 cadres

```
Inciting Situation → Decision Point → [Path A | Path B | Path C]
  → Convergence Point → Fallout Thread
```

Trois chemins divergents avec des coûts et des récompenses distincts. Idéal pour les décisions du joueur qui créent un gameplay véritablement différent, et non la même séquence avec une simple modification visuelle.

### Séquence de cinématique (`cutscene_beat`) — 5 cadres

```
Establishing Frame → Character Beat → The Revelation
  → Player Response → The Shift
```

Un moment dramatique conçu qui préserve la liberté d'action du joueur. Le cadre de réponse du joueur est obligatoire — sans lui, la séquence est une cinématique au sens le plus péjoratif du terme.

---

## Validation

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

Les codes d'erreur spécifiques aux jeux de rôle incluent `CHOICE_MISSING_STATE_CHANGES` (choix sans modification d'état), `CONSEQUENCE_MISSING_STATE_CHANGES` (conséquence sans modification d'état), `REVEAL_MISSING_ENTRY_OR_STATE` (révélation sans condition d'entrée ni modification d'état) et `TABLETOP_DRIFT_TERM` (terme propre aux jeux de rôle sur table).

---

## Signaux de la zone de travail

Ces fonctions produisent des données d'affichage à partir du contenu des cadres sans nécessiter de code de zone de travail ou de React. Le paquet de la zone de travail affiche les résultats ; le domaine les calcule.

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

## Modèle de préparation à la mise en œuvre

`getBeatStatus` est la source d'autorité pour définir ce que signifie "prêt". L'application affiche le résultat ; le domaine le détermine.

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

### Niveaux d'état

| Niveau | Signification |
|---|---|
| `ready` | Toutes les sections de spécifications sont présentes. Score de la spécification ≥ 3 (notes du concepteur, ressources requises, critères de test, liste de contrôle de l'implémentation). Aucune violation de domaine. |
| `partial` | Certaines sections de spécifications sont présentes mais incomplètes. Score de la spécification de 1 à 2. |
| `draft` | Aucune spécification (score = 0). La structure existe, mais elle ne contient aucune information sur l'implémentation. |
| `blocked` | Violation de domaine : `choice`/`consequence` manquant de `stateChanges`, ou `reveal` manquant à la fois de `entryConditions` et de `stateChanges`. |

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

## Exportation de la transmission

```ts
import { generateHandoff, generateMarkdown } from '@storyboard-os/rpg-domain';

// For template preview boards — static storyboard data
const handoff = generateHandoff(storyboard);
const markdown = generateMarkdown(handoff);
```

Les séquences sont ordonnées de manière topologique à l'aide de l'algorithme de Kahn : les dépendances en amont précèdent les résultats en aval. Les cycles sont détectés et les trames restantes sont ajoutées sans provoquer de plantage.

Chaque `HandoffBeat` comprend : le statut, les raisons de l'absence, tous les champs de la spécification, les branches sortantes avec leur type et leur étiquette, et les identifiants des séquences entrantes. L'en-tête de la transmission affiche les totaux/prêts/partiels/brouillons/bloqués, ainsi que les `blockedBeatIds` / `partialBeatIds` pour un tri rapide.

---

## Outils d'aide pour le domaine du projet

Pour les projets de création durables : créez un projet, modifiez le contenu de la spécification et suivez les progrès séparément du texte de la spécification.

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

**Invariant de progression :** les chaînes de caractères `implementationChecklist` et `testCriteria` de la spécification ne sont jamais modifiées par les fonctions de progression. L'état de complétion est stocké séparément dans `project.progress.frames`. La spécification peut être modifiée indépendamment de la progression, et la transmission peut être régénérée à tout moment à partir de l'état actuel des deux.

### Transmission du projet

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

## Quête de démonstration : Le registre de la maison de péage

Une quête de 8 séquences entièrement spécifiée. Chaque trame contient des noms de drapeaux spécifiques, des exigences de ressources et des critères de test, et peut être utilisée comme implémentation de référence ou comme démonstration en direct.

```ts
import { tollhouseLedgerProject } from '@storyboard-os/rpg-domain';

const storyboard = tollhouseLedgerProject.storyboard;
console.log(storyboard.frames.length); // 8

const hook = storyboard.frames[0];
hook.content.stateChanges;   // ['Sets: quest_tollhouse_active = true']
hook.content.requiredAssets; // ['Ruined tollhouse exterior environment', ...]
hook.content.testCriteria;   // ['Player can observe the abandoned caravan without dialogue trigger', ...]
```

**Scénario :** Le joueur arrive dans une maison de péage dévastée par la guerre. Trois factions veulent le même registre caché. Le joueur décide qui l'obtient, qui le perd et à quoi ressemble la région par la suite. Huit séquences avec deux branches de conséquences.

---

## Modèle de confiance

`@storyboard-os/rpg-domain` est une bibliothèque TypeScript pure. Elle n'a pas d'effets secondaires à l'exécution, pas d'E/S, pas d'accès au réseau et pas d'API de navigateur ou de Node.js. Toutes les fonctions acceptent des données et renvoient des données. Rien n'est stocké, enregistré ou transmis par ce package ; la persistance est la responsabilité de l'application qui l'utilise.

---

<p align="center">Part of <a href="https://github.com/mcp-tool-shop-org/storyboard-os">storyboard-os</a> · Built by <a href="https://mcp-tool-shop.github.io/">MCP Tool Shop</a></p>
