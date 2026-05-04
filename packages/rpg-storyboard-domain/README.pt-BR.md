<p align="center">
  <a href="README.ja.md">日本語</a> | <a href="README.zh.md">中文</a> | <a href="README.es.md">Español</a> | <a href="README.fr.md">Français</a> | <a href="README.hi.md">हिन्दी</a> | <a href="README.it.md">Italiano</a> | <a href="README.md">English</a>
</p>

<p align="center">
  <img src="https://raw.githubusercontent.com/mcp-tool-shop-org/brand/main/logos/storyboard-os/readme.png" alt="Storyboard OS" width="400" />
</p>

<p align="center">
  <a href="https://github.com/mcp-tool-shop-org/storyboard-os/actions/workflows/ci.yml"><img src="https://github.com/mcp-tool-shop-org/storyboard-os/actions/workflows/ci.yml/badge.svg" alt="CI" /></a>
  <a href="https://www.npmjs.com/package/@storyboard-os/rpg-domain"><img src="https://img.shields.io/npm/v/@storyboard-os/rpg-domain.svg" alt="npm" /></a>
  <a href="../../LICENSE"><img src="https://img.shields.io/badge/license-MIT-blue.svg" alt="MIT License" /></a>
</p>

<p align="center"><strong>Contrato para a criação de jogos de RPG na plataforma Storyboard OS.</strong></p>

---

# @storyboard-os/rpg-domain

Pacote de domínio para jogos de RPG. Tudo o que um designer, escritor ou desenvolvedor de jogos de RPG precisa para projetar narrativas de missões e cenas implementáveis — tipos de quadros, esquema de conteúdo, modelos, regras de validação, sinais da tela, modelo de prontidão, geração de entregas e auxiliares de persistência do projeto.

**Usuário-alvo:** Um designer ou desenvolvedor de jogos que está trabalhando em um videogame de RPG e precisa projetar elementos com profundidade suficiente para serem entregues a um motor de jogo ou para a fase de produção.

**Não é para:** Preparação de sessões de jogos de mesa, ferramentas para mestres de jogo, simuladores de mesa virtual (VTTs), anotações de campanhas ou editores de diálogo. O validador impõe isso — quadros que contenham terminologia relacionada a jogos de mesa falham na validação.

---

## Instalação

```bash
npm install @storyboard-os/rpg-domain
# or
pnpm add @storyboard-os/rpg-domain
```

---

## Tipos de quadros

Sete tipos. Cada um nomeia uma função específica em uma missão ou cena de RPG jogável.

| Tipo | Função | Cor sugerida |
|---|---|---|
| `hook` | Ponto de entrada ou linha de pensamento — abertura da missão ou ponto de partida para o futuro. | `#EAB308` |
| `scene` | Elemento narrativo ou de localização — o "onde" e o "o quê". | `#3B82F6` |
| `choice` | Ponto de decisão do jogador — ramifica a tela, define flags de estado. | `#8B5CF6` |
| `encounter` | Combate, quebra-cabeça, conflito social ou obstáculo de alto risco. | `#EF4444` |
| `reveal` | Informação, reviravolta, pista ou desbloqueio do estado do jogo. | `#F97316` |
| `npc_beat` | Interação do personagem com lógica de ramificação de diálogo. | `#22C55E` |
| `consequence` | Resultado do estado do mundo — o que muda após uma escolha ou evento. | `#6B7280` |

**Regras do domínio aplicadas por `validateRpgStoryboard`:**
- Os quadros `choice` (escolha) e `consequence` (consequência) devem conter pelo menos uma entrada `stateChanges` (alterações de estado).
- Os quadros `reveal` (revelação) devem conter pelo menos uma entrada `entryCondition` (condição de entrada) ou `stateChange` (alteração de estado).
- O conteúdo do quadro não pode conter termos relacionados a jogos de mesa.

---

## Esquema de conteúdo

Cada quadro de RPG contém um objeto `FrameContent` (conteúdo do quadro) com profundidade de implementação, e não apenas notas da história.

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

Um quadro sem `entryConditions` (condições de entrada), `stateChanges` (alterações de estado), `requiredAssets` (recursos necessários) e `testCriteria` (critérios de teste) é apenas uma nota da história, e não uma especificação do jogo. Os testes de proteção impõem isso em todos os quadros gerados por modelo.

---

## Modelos

Três pontos de partida para a produção de jogos de RPG. Cada quadro gerado por modelo contém condições de entrada, alterações de estado, recursos necessários e critérios de teste. Os modelos são estruturas de pensamento, e não pontos de partida em branco.

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

### Fluxo de Missão (`quest_flow`) — 8 quadros

```
Opening Hook → Establishing Scene → Character Contact → Key Choice
  → The Obstacle → The Reveal → The Consequence → Future Thread
```

Missão linear com uma ramificação principal controlada pelo jogador. Ideal para rascunhos iniciais — força cada elemento a ter lógica de estado desde o início.

### Ramificação de Missão (`quest_branch`) — 7 quadros

```
Inciting Situation → Decision Point → [Path A | Path B | Path C]
  → Convergence Point → Fallout Thread
```

Três caminhos divergentes com custos e recompensas distintos. Ideal para decisões do jogador que criam uma experiência de jogo genuinamente diferente, e não a mesma sequência com apenas mudanças visuais.

### Cena Dramática (`cutscene_beat`) — 5 quadros

```
Establishing Frame → Character Beat → The Revelation
  → Player Response → The Shift
```

Um momento autoral e dramático que preserva a autonomia do jogador. O quadro de resposta do jogador é obrigatório — sem ele, a sequência é uma cena de corte no sentido mais negativo da palavra.

---

## Validação

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

Códigos de erro específicos para RPG incluem `CHOICE_MISSING_STATE_CHANGES` (escolha sem alterações de estado), `CONSEQUENCE_MISSING_STATE_CHANGES` (consequência sem alterações de estado), `REVEAL_MISSING_ENTRY_OR_STATE` (revelação sem condição de entrada ou alteração de estado) e `TABLETOP_DRIFT_TERM` (termo relacionado a jogos de mesa).

---

## Sinais da tela

Essas funções produzem dados de exibição a partir do conteúdo do quadro sem exigir nenhum código de tela ou React. O pacote da tela renderiza os resultados; o domínio os calcula.

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

## Modelo de prontidão de implementação

`getBeatStatus` é a fonte autoritária do que significa "pronto". O aplicativo renderiza o resultado; o domínio decide.

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

### Níveis de status

| Nível | Significado |
|---|---|
| `ready` | Todas as seções de especificação estão presentes. Pontuação da especificação ≥ 3 (designerNotes, requiredAssets, testCriteria, implementationChecklist). Sem violações de domínio. |
| `partial` | Algumas seções da especificação estão presentes, mas incompletas. Pontuação da especificação de 1 a 2. |
| `draft` | Nenhuma especificação (pontuação = 0). O "frame" existe estruturalmente, mas não possui detalhes de implementação. |
| `blocked` | Violação de domínio: `choice`/`consequence` ausente de `stateChanges`, ou `reveal` ausente de ambos, `entryConditions` e `stateChanges`. |

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

## Exportação de "handoff"

```ts
import { generateHandoff, generateMarkdown } from '@storyboard-os/rpg-domain';

// For template preview boards — static storyboard data
const handoff = generateHandoff(storyboard);
const markdown = generateMarkdown(handoff);
```

Os "beats" são ordenados topologicamente usando o algoritmo de Kahn – dependências anteriores aos resultados subsequentes. Ciclos são detectados e os "frames" restantes são adicionados sem causar falhas.

Cada `HandoffBeat` inclui: status, motivos da falta, todos os campos da especificação, ramos de saída com tipo e rótulo, e IDs dos "beats" de entrada. O cabeçalho do "handoff" mostra as contagens totais/prontas/parciais/rascunhos/bloqueados e os `blockedBeatIds` / `partialBeatIds` para triagem imediata.

---

## Utilitários de domínio do projeto

Para projetos de criação duradouros – crie um projeto, edite o conteúdo da especificação e acompanhe o progresso separadamente do texto da especificação.

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

**Invariante de progresso:** As strings `implementationChecklist` e `testCriteria` da especificação nunca são modificadas pelas funções de progresso. O estado de conclusão é armazenado separadamente em `project.progress.frames`. A especificação pode ser editada independentemente do progresso, e o "handoff" pode ser regenerado a qualquer momento a partir do estado atual de ambos.

### "Handoff" do projeto

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

## Missão de demonstração – The Tollhouse Ledger

Uma missão de 8 "beats" totalmente especificada. Cada "frame" possui nomes de flags específicos, requisitos de recursos e critérios de teste – pode ser usado como uma implementação de referência ou uma demonstração ao vivo.

```ts
import { tollhouseLedgerProject } from '@storyboard-os/rpg-domain';

const storyboard = tollhouseLedgerProject.storyboard;
console.log(storyboard.frames.length); // 8

const hook = storyboard.frames[0];
hook.content.stateChanges;   // ['Sets: quest_tollhouse_active = true']
hook.content.requiredAssets; // ['Ruined tollhouse exterior environment', ...]
hook.content.testCriteria;   // ['Player can observe the abandoned caravan without dialogue trigger', ...]
```

**Cenário:** O jogador chega a uma casa de pedágio marcada pela guerra. Três facções querem o mesmo livro de registros escondido. O jogador decide quem o recebe, quem perde e como a região ficará. Oito "beats" com dois ramos de consequências.

---

## Modelo de confiança

`@storyboard-os/rpg-domain` é uma biblioteca TypeScript pura. Não possui efeitos colaterais em tempo de execução, nenhuma entrada/saída, nenhum acesso à rede e nenhuma API de navegador ou Node.js. Todas as funções aceitam dados e retornam dados. Nada é armazenado, registrado ou transmitido por este pacote – a persistência é responsabilidade do aplicativo que o utiliza.

---

<p align="center">Part of <a href="https://github.com/mcp-tool-shop-org/storyboard-os">storyboard-os</a> · Built by <a href="https://mcp-tool-shop.github.io/">MCP Tool Shop</a></p>
