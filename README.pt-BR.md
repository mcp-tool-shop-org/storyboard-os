<p align="center">
  <a href="README.ja.md">日本語</a> | <a href="README.zh.md">中文</a> | <a href="README.es.md">Español</a> | <a href="README.fr.md">Français</a> | <a href="README.hi.md">हिन्दी</a> | <a href="README.it.md">Italiano</a> | <a href="README.md">English</a>
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

Uma plataforma de criação visual de estruturas narrativas para narrativas interativas — missões, campanhas, sequências cinematográficas e a lógica de produção que as conecta.

**Três áreas de atuação, uma plataforma:**

| Área de atuação | Domínio |
|---|---|
| `rpg-storyboard` | Missão/narrativa de RPG — criação pronta para implementação |
| `marketing-storyboard` | Lançamento de campanha — preparação para o lançamento + caminho crítico |
| `cinematic-storyboard` | Trailer/cena/vídeo explicativo — storyboard de produção |

Os três são produtos, não demonstrações. Nenhum importa dados dos outros.

---

## O que é o Storyboard OS

Um painel estruturado para projetar **narrativas implementáveis**. Cada quadro na tela é um momento com:
- Condições de entrada e saída
- Mudanças de estado (flags, variáveis, estado do mundo)
- Recursos necessários para a fase de produção
- Critérios de teste com verificações de aprovação/reprovação
- Lista de verificação de implementação

O painel visualiza o fluxo do estado do jogo, não apenas a sequência da história. As conexões transmitem significado — ramificações de escolha, arcos de consequências, sequências principais, caminhos alternativos. Um designer pode ler o painel e entender o que o jogo realmente faz.

## O que o Storyboard OS não é

- Uma ferramenta genérica de diagramação ou quadro branco
- Uma ferramenta de condução de sessão ou auxílio para o mestre do jogo
- Uma wiki de construção de mundo ou banco de dados de informações
- Um editor apenas para árvores de diálogo
- Um aplicativo de preparação de campanha

Se um leitor puder confundir isso com qualquer um desses, o produto terá se desviado de seu propósito.

---

## O que o rpg-storyboard faz (Fase 2)

Após a Fase 2, um designer pode criar um projeto completo do início ao fim, sem sair do navegador:

| Capacidade | O que ele obtém |
|---|---|
| **Project creation** | Criar um projeto nomeado a partir de um modelo; as posições e edições do painel são persistidas no localStorage |
| **Visual board** | Fluxo de missão e lógica de ramificação do estado do jogo lado a lado em um canvas Konva |
| **Beat editing** | Editar o título, o resumo e todos os campos de especificação de implementação de qualquer momento diretamente no painel |
| **Progress tracking** | Marcar os itens da lista de verificação de implementação e os critérios de teste por momento; o estado é preservado ao recarregar |
| **Game-state signal** | Badges por quadro (ESTADO, ESPEC/PARCIAL/RASCUNHO) sem sair do painel |
| **Implementation readiness** | Cada momento mostra o status PRONTO/PARCIAL/RASCUNHO/BLOQUEADO + o que está faltando |
| **Project handoff** | Regenerado a partir do estado atual do projeto — inclui conteúdo editado, progresso por momento, origem |
| **Quest handoff** | Exportação estática em Markdown + JSON para painéis de visualização de modelos |
| **Templates** | Três pontos de partida para a produção de RPG com sequências de tipo de momento e justificativa |
| **Board operations** | Zoom, pan, ajuste ao painel, redefinição, atalhos de teclado — navegação utilizável em laptop |

O painel é uma superfície de criação. O inspetor de momentos é uma especificação de implementação editável. A entrega é um documento gerado a partir do estado real do projeto — não um instantâneo estático.

### Capacidades da Fase 1 (ainda presentes)

A Fase 1 estabeleceu a área de atuação de visualização somente leitura: renderização do canvas, sinal do estado do jogo, modelo de prontidão para implementação, exportação de entrega de missão, galeria de modelos e navegação do painel. Todas as capacidades da Fase 1 são preservadas e estendidas pela Fase 2.

---

## Pacotes

| Pacote | O que ele contém |
|---|---|
| `@storyboard-os/core` | Primitivas genéricas de storyboard: quadro, conexão (genérico para tipo), anotação, modelo, validador estrutural. Os domínios possuem seus vocabulários de conexão. |
| `@storyboard-os/rpg-domain` | Contrato de criação de jogos de RPG: tipos de quadro, campos de conteúdo, modelos, modelo de prontidão, gerador de entrega, missão de demonstração do Tollhouse Ledger. |
| `@storyboard-os/marketing-domain` | Contrato de implementação de campanha de marketing: tipos de quadro (público, mensagem, ponto de contato, recurso, aprovação, evento de lançamento, medição), modelo de prontidão para lançamento, caminho crítico, portões de aprovação, ciclos de medição, exportação do resumo da campanha, campanha de demonstração. |
| `@storyboard-os/cinematic-domain` | Contrato de produção cinematográfica: 9 tipos de quadro, linguagem da câmera, requisitos de VFX/áudio/continuidade, sinais de produção (saúde, carga, complexidade, cenas bloqueadas), entrega do resumo da produção, 3 modelos, sequência de trailer de demonstração. |
| `@storyboard-os/canvas` | Renderizador de canvas Konva: quadros, conexões, seleção, arrastar, badges de tipo, rótulos de conexão, viewport de zoom/pan. Configuração de domínio passada. |
| `@storyboard-os/routing` | Helpers de URL configuráveis: geração de rota de quadro e painel. Sem dependências. |

## Aplicativos

| Aplicativo | O que é |
|---|---|
| `rpg-storyboard` | Produto de criação de jogos de RPG Astro. Contém: configuração de canvas de RPG, inspetor de quadro, páginas de entrega, galeria de modelos, configuração de rota, layout de página. |
| `marketing-storyboard` | Storyboard de implementação de campanha Astro. Contém: configuração de canvas de marketing, painel de campanha, inspetor de quadro, badge de prontidão para lançamento, ênfase no caminho crítico, painel de bloqueios de lançamento, entrega do resumo da campanha. |
| `cinematic-storyboard` | Storyboard de produção cinematográfica Astro. Contém: configuração de canvas cinematográfico, painel de sequência, inspetor de quadro (câmera/VFX/áudio/continuidade), painel de sinal de produção (saúde/carga/complexidade), entrega do resumo da produção. |

---

## Arquitetura

Os pacotes formam uma cadeia de dependência limpa:

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

Uma quarta área de atuação criaria seu próprio pacote de domínio e reutilizaria `@storyboard-os/core`, `@storyboard-os/canvas` e `@storyboard-os/routing` sem tocar em nenhum pacote de domínio existente. Três áreas de atuação já provaram esse padrão: zero alterações no canvas, no núcleo ou no roteamento.

Consulte [`docs/architecture.md`](docs/architecture.md) para obter detalhes completos.

---

## Guia rápido

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

Requisitos: Node ≥ 22.13, pnpm ≥ 11.

O escopo de teste é filtrado automaticamente para os pacotes `@storyboard-os/*` e `rpg-storyboard` — ele não coleta espaços de trabalho irmãos no diretório pai.

---

## Modelo de confiança

O Storyboard OS é um **aplicativo de navegador somente local** (três áreas de atuação) — sem servidor, sem contas, sem saída de rede.

- **Dados afetados:** **Apenas RPG** — dados do projeto (especificações de cenas, posições no storyboard, progresso da lista de verificação) no navegador `localStorage` na máquina do usuário. Os painéis de demonstração estáticos de marketing e cinematografia são exportados e não usam `localStorage` hoje.
- **Dados NÃO afetados:** Nenhum dado de credencial, nenhuma informação de pagamento, nenhum dado pessoal além do que o operador digita nos campos de especificação (RPG) ou o que é incluído no conteúdo da demonstração estática.
- **Nenhuma solicitação de rede em tempo de execução.** Cada aplicativo é um site estático. Após o carregamento inicial da página, nenhuma solicitação de rede é feita.
- **Nenhuma telemetria.** Nada é coletado ou transmitido.

Consulte [`SECURITY.md`](SECURITY.md) para obter o modelo completo de confiança e o relatório de vulnerabilidades.

---

## Status

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

| Fase | Descrição | Status |
|---|---|---|
| 0A–0F | Prova de criação de RPG — tela, páginas de cenas, modelos, missão de demonstração | ✅ |
| 0R | Reparo + reancoragem — cada quadro contém a especificação do estado do jogo | ✅ |
| 0M | Migração para monorepositorio — núcleo, domínio, tela, roteamento extraídos | ✅ |
| 1A | Visibilidade de ramificação e estado na tela | ✅ |
| 1B | Prontidão de implementação por cena | ✅ |
| 1C | Exportação da missão | ✅ |
| 1D | Galeria de modelos | ✅ |
| 1E | Operações do painel — zoom, panorâmica, ajuste, controles da área de visualização | ✅ |
| 1F | Encerramento do lançamento — documentação, registro de alterações, notas de arquitetura | ✅ |
| 2A | Criação de projeto a partir de modelos — persistência no localStorage | ✅ |
| 2B | Posições do painel persistentes por projeto | ✅ |
| 2C | Conteúdo da cena editável — os campos de especificação persistem após a recarga | ✅ |
| 2D | Persistência da lista de verificação/progresso — separada do texto da especificação | ✅ |
| 2E | Entrega do projeto — regenerado a partir do estado do projeto salvo | ✅ |
| 2F | Encerramento do lançamento — documentação, registro de alterações, notas de arquitetura | ✅ |
| M-0A | Pacote de domínio de marketing — esquema, sinais, modelos, validação, campanha de demonstração | ✅ |
| M-0B | Vertical do aplicativo de marketing — painel de campanha Astro, inspetor de quadros, entrega | ✅ |
| M-0C | Camada de sinal de prontidão para lançamento — caminho crítico, portões de aprovação, ciclos de medição | ✅ |
| M-0D | Encerramento de marketing — documentação, registro de alterações, prova de arquitetura | ✅ |
| C-0A | Pacote de domínio cinematográfico — esquema, linguagem da câmera, VFX/áudio, modelos, validação, demonstração | ✅ |
| C-0B | Vertical do aplicativo cinematográfico — painel de sequência Astro, inspetor de quadros, resumo da produção | ✅ |
| C-0C | Camada de sinal de produção — saúde, carga de VFX/áudio, complexidade da câmera, cenas bloqueadas | ✅ |
| C-0D | Encerramento cinematográfico — documentação, registro de alterações, prova de arquitetura | ✅ |
| H-1A | Fortalecimento do núcleo — tipos de conexão genéricos, os domínios possuem seu próprio vocabulário | ✅ |
| v1.2.0 | Fortalecimento da saúde — validador sem exceções, resiliência do armazenamento + versionamento do esquema do localStorage, camada de design-token, acesso à tela por teclado/leitor de tela, Astro 5 + portão de auditoria de dependências do CI | ✅ |
| v1.3.0 | Passagem de recursos — nove modelos de ouro + catálogos SSG; sequência cinematográfica `/reels/demo-launch-reel`; aninhamento (`parentFrameId` + `collapsedIds`); adaptadores de mecanismo unidirecionais; transferências JSON Schema | ✅ |

---

## Demonstração

**The Tollhouse Ledger** — três facções querem o mesmo livro-razão oculto. O jogador decide quem vence, quem perde e como será a região a seguir. Oito cenas com a especificação completa do estado do jogo: nomes de sinalizadores, requisitos de recursos, critérios de teste de aprovação/reprovação, listas de verificação de implementação.

Cada quadro na demonstração pode ser implementado como uma missão em um mecanismo de RPG sem documentação adicional.

Rota: `/storyboards/quest-01`

**Catálogos publicados (SSG):**

| Área de atuação | Demonstração | Modelos |
|---|---|---|
| RPG | `/storyboards/quest-01` | `/storyboards/template-quest-flow`, `template-quest-branch`, `template-cutscene-beat` |
| Marketing | `/campaigns/campaign-01` | `/campaigns/template-product_launch`, `template-campaign_funnel`, `template-content_to_conversion` |
| Cinematográfico | `/sequences/demo-launch-trailer` · cena `/reels/demo-launch-reel` | `/sequences/template-trailer-flow`, `template-cutscene-sequence`, `template-explainer-video` |

---

## Documentação

- [`docs/architecture.md`](docs/architecture.md) — separação de pacotes, regras de dependência, modelo de área de visualização da tela, limite de armazenamento do projeto, extensibilidade
- [`docs/product-brief.md`](docs/product-brief.md) — o que é o rpg-storyboard, usuário-alvo, avisos de desvio, portões de aceitação
- [`docs/rpg-storyboard.md`](docs/rpg-storyboard.md) — contrato de criação de jogos RPG, ciclo completo de criação (Fase 2), modelo de prontidão, exportação de entrega
- [`docs/marketing-storyboard.md`](docs/marketing-storyboard.md) — contrato de implementação de campanha de marketing, modelo de prontidão para lançamento, caminho crítico, exclusões
- [`docs/cinematic-storyboard.md`](docs/cinematic-storyboard.md) — storyboard de produção cinematográfica, sinais de produção, linguagem da câmera, exclusões deliberadas
- [`docs/cinematic-phase-0-closeout.md`](docs/cinematic-phase-0-closeout.md) — narrativa da Fase 0 cinematográfica, portões de aceitação, prova
- [`docs/marketing-phase-0-closeout.md`](docs/marketing-phase-0-closeout.md) — narrativa da Fase 0 de marketing, portões de aceitação, prova
- [`docs/phase-2-closeout.md`](docs/phase-2-closeout.md) — narrativa da Fase 2, registro de integridade da arquitetura, exclusões deliberadas
- [`docs/phase-1-closeout.md`](docs/phase-1-closeout.md) — narrativa da Fase 1 e registro de integridade da arquitetura
- [`docs/phase-0-closeout.md`](docs/phase-0-closeout.md) — veredicto da Fase 0 e backlog original da Fase 1
- [`docs/monorepo-migration.md`](docs/monorepo-migration.md) — registro da migração 0M: o que foi movido, por quê e a arquitetura resultante
- [`CHANGELOG.md`](CHANGELOG.md) — histórico de lançamentos
- [Página de destino](https://mcp-tool-shop-org.github.io/storyboard-os/) · [Manual](https://mcp-tool-shop-org.github.io/storyboard-os/handbook/)

---

<p align="center">Built by <a href="https://mcp-tool-shop.github.io/">MCP Tool Shop</a></p>
