<p align="center">
  <a href="README.ja.md">日本語</a> | <a href="README.zh.md">中文</a> | <a href="README.md">English</a> | <a href="README.fr.md">Français</a> | <a href="README.hi.md">हिन्दी</a> | <a href="README.it.md">Italiano</a> | <a href="README.pt-BR.md">Português (BR)</a>
</p>

<p align="center">
  <img src="https://raw.githubusercontent.com/mcp-tool-shop-org/brand/main/logos/storyboard-os/readme.png" alt="Storyboard OS" width="400" />
</p>

<p align="center">
  <a href="https://github.com/mcp-tool-shop-org/storyboard-os/actions/workflows/ci.yml"><img src="https://github.com/mcp-tool-shop-org/storyboard-os/actions/workflows/ci.yml/badge.svg" alt="CI" /></a>
  <a href="https://www.npmjs.com/package/@storyboard-os/rpg-domain"><img src="https://img.shields.io/npm/v/@storyboard-os/rpg-domain.svg" alt="npm" /></a>
  <a href="../../LICENSE"><img src="https://img.shields.io/badge/license-MIT-blue.svg" alt="MIT License" /></a>
</p>

<p align="center"><strong>Contrato para la creación de juegos de rol (RPG) para la plataforma Storyboard OS.</strong></p>

---

# @storyboard-os/rpg-domain

Paquete de dominio para la creación de juegos de rol. Todo lo que un diseñador, escritor o desarrollador de juegos de rol necesita para diseñar narrativas de misiones y escenas que se puedan implementar: tipos de trama, esquema de contenido, plantillas, reglas de validación, señales del lienzo, modelo de preparación, generación de entregables y utilidades para la persistencia del proyecto.

**Usuario objetivo:** Un diseñador o desarrollador de juegos que trabaja en un videojuego de rol y que necesita diseñar elementos con suficiente profundidad para poder entregarlos a un motor de juego o para la fase de producción.

**No apto para:** Preparación de sesiones de juego de mesa, herramientas para el director de juego, simuladores de mesa virtual (VTT), notas de campaña o editores de diálogos únicamente. El validador hace cumplir esto; las tramas que contienen terminología relacionada con juegos de mesa no pasarán la validación.

---

## Instalación

```bash
npm install @storyboard-os/rpg-domain
# or
pnpm add @storyboard-os/rpg-domain
```

---

## Tipos de trama

Siete tipos. Cada uno define una función específica en una misión o escena de juego de rol.

| Tipo | Función | Color sugerido |
|---|---|---|
| `hook` | Punto de entrada o hilo abierto: inicio de la misión o punto de partida para futuras tramas. | `#EAB308` |
| `scene` | Elemento narrativo o de ubicación: el "dónde" y el "qué". | `#3B82F6` |
| `choice` | Punto de decisión del jugador: crea ramificaciones en la trama y establece indicadores de estado. | `#8B5CF6` |
| `encounter` | Combate, rompecabezas, conflicto social u obstáculo de alto riesgo. | `#EF4444` |
| `reveal` | Información, giro argumental, pista o desbloqueo del estado del juego. | `#F97316` |
| `npc_beat` | Interacción del personaje con lógica de ramificación de diálogo. | `#22C55E` |
| `consequence` | Resultado del estado del mundo: qué cambia después de una elección o evento. | `#6B7280` |

**Reglas del dominio aplicadas por `validateRpgStoryboard`:**
- Las tramas `choice` (elección) y `consequence` (consecuencia) deben contener al menos una entrada de `stateChanges` (cambios de estado).
- Las tramas `reveal` (revelación) deben contener al menos una entrada de `entryCondition` (condición de entrada) o `stateChange` (cambio de estado).
- El contenido de la trama no puede contener términos relacionados con juegos de mesa.

---

## Esquema de contenido

Cada trama de juego de rol contiene un objeto `FrameContent` con profundidad de implementación, no solo notas de la historia.

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

Una trama sin `entryConditions` (condiciones de entrada), `stateChanges` (cambios de estado), `requiredAssets` (recursos necesarios) y `testCriteria` (criterios de prueba) es una nota de la historia, no una especificación del juego. Las pruebas de seguridad hacen cumplir esto en cada trama generada por la plantilla.

---

## Plantillas

Tres puntos de partida para la producción de juegos de rol. Cada trama generada por la plantilla contiene condiciones de entrada, cambios de estado, recursos necesarios y criterios de prueba. Las plantillas son estructuras de pensamiento, no puntos de partida en blanco.

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

### Flujo de misión (`quest_flow`) — 8 tramas

```
Opening Hook → Establishing Scene → Character Contact → Key Choice
  → The Obstacle → The Reveal → The Consequence → Future Thread
```

Misión lineal con una rama principal impulsada por el jugador. Ideal para borradores iniciales; obliga a que cada elemento contenga lógica de estado desde el principio.

### Rama de misión (`quest_branch`) — 7 tramas

```
Inciting Situation → Decision Point → [Path A | Path B | Path C]
  → Convergence Point → Fallout Thread
```

Tres caminos divergentes con costos y recompensas distintos. Ideal para decisiones del jugador que crean una jugabilidad genuinamente diferente, no la misma secuencia con diferentes elementos visuales.

### Escena cinematográfica (`cutscene_beat`) — 5 tramas

```
Establishing Frame → Character Beat → The Revelation
  → Player Response → The Shift
```

Un momento dramático y elaborado que preserva la agencia del jugador. La trama de respuesta del jugador es obligatoria; sin ella, la secuencia es una escena cinematográfica en el peor de los sentidos.

---

## Validación

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

Códigos de error específicos para juegos de rol incluyen `CHOICE_MISSING_STATE_CHANGES` (la elección no tiene cambios de estado), `CONSEQUENCE_MISSING_STATE_CHANGES` (la consecuencia no tiene cambios de estado), `REVEAL_MISSING_ENTRY_OR_STATE` (la revelación no tiene condición de entrada ni cambio de estado) y `TABLETOP_DRIFT_TERM` (término relacionado con juegos de mesa).

---

## Señales del lienzo

Estas funciones producen datos de visualización a partir del contenido de la trama sin requerir ningún código de lienzo o React. El paquete del lienzo renderiza los resultados; el dominio los calcula.

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

## Modelo de preparación de implementación

`getBeatStatus` es la fuente autorizada de lo que significa "listo". La aplicación renderiza el resultado; el dominio lo determina.

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

### Niveles de estado

| Nivel | Significado |
|---|---|
| `ready` | Todas las secciones de especificaciones están presentes. Puntuación de la especificación ≥ 3 (notas del diseñador, recursos requeridos, criterios de prueba, lista de verificación de implementación). No hay violaciones de dominio. |
| `partial` | Algunas secciones de la especificación están presentes pero son incompletas. Puntuación de la especificación de 1 a 2. |
| `draft` | No hay especificación (puntuación = 0). El marco existe estructuralmente, pero no tiene profundidad de implementación. |
| `blocked` | Violación de dominio: `choice`/`consequence` falta `stateChanges`, o `reveal` falta tanto `entryConditions` como `stateChanges`. |

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

## Exportación de transferencia

```ts
import { generateHandoff, generateMarkdown } from '@storyboard-os/rpg-domain';

// For template preview boards — static storyboard data
const handoff = generateHandoff(storyboard);
const markdown = generateMarkdown(handoff);
```

Los "beats" (pasos) están ordenados topológicamente utilizando el algoritmo de Kahn: las dependencias anteriores a los resultados posteriores. Los ciclos se detectan y los marcos restantes se agregan sin provocar fallos.

Cada `HandoffBeat` incluye: estado, razones de la falta, todos los campos de la especificación, ramas de salida con tipo y etiqueta, y los ID de los "beats" de entrada. El encabezado de la transferencia muestra los totales de: listo, parcial, borrador, bloqueado, y los `blockedBeatIds` / `partialBeatIds` para una evaluación inmediata.

---

## Herramientas de dominio para proyectos

Para proyectos de creación duraderos: cree un proyecto, edite el contenido de la especificación y realice un seguimiento del progreso por separado del texto de la especificación.

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

**Invariante de progreso:** Las cadenas de `implementationChecklist` y `testCriteria` de la especificación nunca se modifican mediante funciones de progreso. El estado de finalización se almacena por separado en `project.progress.frames`. La especificación se puede editar de forma independiente del progreso, y la transferencia se puede regenerar en cualquier momento a partir del estado actual de ambos.

### Transferencia de proyecto

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

## Misión de demostración: El Libro Mayor de la Estación de Peaje

Una misión de 8 "beats" completamente especificada. Cada marco contiene nombres de banderas específicos, requisitos de recursos y criterios de prueba; se puede utilizar como una implementación de referencia o una demostración en vivo.

```ts
import { tollhouseLedgerProject } from '@storyboard-os/rpg-domain';

const storyboard = tollhouseLedgerProject.storyboard;
console.log(storyboard.frames.length); // 8

const hook = storyboard.frames[0];
hook.content.stateChanges;   // ['Sets: quest_tollhouse_active = true']
hook.content.requiredAssets; // ['Ruined tollhouse exterior environment', ...]
hook.content.testCriteria;   // ['Player can observe the abandoned caravan without dialogue trigger', ...]
```

**Escenario:** El jugador llega a una estación de peaje devastada por la guerra. Tres facciones quieren el mismo libro mayor oculto. El jugador decide quién lo obtiene, quién lo pierde y cómo se verá la región a continuación. Ocho "beats" con dos ramas de consecuencias.

---

## Modelo de confianza

`@storyboard-os/rpg-domain` es una biblioteca de TypeScript pura. No tiene efectos secundarios en tiempo de ejecución, ni E/S, ni acceso a la red, ni APIs de navegador ni de Node.js. Todas las funciones aceptan datos y devuelven datos. Nada se almacena, se registra o se transmite mediante este paquete; la persistencia es responsabilidad de la aplicación que lo utiliza.

---

<p align="center">Part of <a href="https://github.com/mcp-tool-shop-org/storyboard-os">storyboard-os</a> · Built by <a href="https://mcp-tool-shop.github.io/">MCP Tool Shop</a></p>
