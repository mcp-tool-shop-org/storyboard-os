<p align="center">
  <a href="README.ja.md">日本語</a> | <a href="README.zh.md">中文</a> | <a href="README.es.md">Español</a> | <a href="README.fr.md">Français</a> | <a href="README.hi.md">हिन्दी</a> | <a href="README.it.md">Italiano</a> | <a href="README.md">English</a>
</p>

<p align="center">
  <img src="https://raw.githubusercontent.com/mcp-tool-shop-org/brand/main/logos/storyboard-os/readme.png" alt="Storyboard OS — Visual Stories. Structured. Implemented." width="400" />
</p>

<p align="center">
  <a href="https://github.com/mcp-tool-shop-org/storyboard-os/actions/workflows/ci.yml"><img src="https://github.com/mcp-tool-shop-org/storyboard-os/actions/workflows/ci.yml/badge.svg" alt="CI" /></a>
  <a href="LICENSE"><img src="https://img.shields.io/badge/license-MIT-blue.svg" alt="MIT License" /></a>
</p>


---

Uma plataforma de criação visual de estruturas narrativas para narrativas interativas — missões, campanhas, sequências cinematográficas e a lógica de produção que as conecta.

**Três áreas de atuação, uma plataforma:**

| Área de Atuação | Domínio |
|---|---|
| `rpg-storyboard` | Criação de missões/narrativas para RPG — pronta para implementação |
| `marketing-storyboard` | Lançamento de campanha — preparação para o lançamento + caminho crítico |
| `cinematic-storyboard` | Trailer / cena / vídeo explicativo — storyboard da produção |

Os três são produtos, não demonstrações. Nenhum importa dados dos outros.

---

## O que é o Storyboard OS

Um painel estruturado para projetar **narrativas implementáveis**. Cada quadro na tela representa um momento com:
- Condições de entrada e saída
- Mudanças de estado (flags, variáveis, estado do mundo)
- Recursos necessários para a fase de produção
- Critérios de teste com verificações de aprovação/reprovação
- Lista de verificação de implementação

O painel visualiza o fluxo do estado do jogo, não apenas a sequência da história. As conexões transmitem significado — ramificações de escolha, arcos de consequências, sequências principais, caminhos alternativos. Um designer pode ler o painel e entender o que o jogo realmente faz.

## O que o Storyboard OS não é

- Uma ferramenta genérica de diagramação ou quadro branco
- Uma ferramenta para conduzir sessões ou auxiliar um mestre de jogo (GM)
- Uma wiki de construção de mundo ou banco de dados de informações
- Um editor apenas para árvores de diálogo
- Um aplicativo de preparação de campanha

Se um leitor puder confundir isso com qualquer uma dessas opções, o produto terá se desviado do seu propósito.

---

## O que o rpg-storyboard faz (Fase 2)

Após a Fase 2, um designer pode criar um projeto completo desde o início até a entrega, sem sair do navegador:

| Capacidade | O que ele obtém |
|---|---|
| **Project creation** | Criar um projeto nomeado a partir de um modelo; as posições e edições do painel são persistidas no localStorage |
| **Visual board** | Fluxo da missão e lógica de ramificação do estado do jogo lado a lado em uma tela Konva |
| **Beat editing** | Editar o título, resumo e todos os campos de especificação de implementação de qualquer momento diretamente no painel |
| **Progress tracking** | Marcar itens da lista de verificação de implementação e critérios de teste por momento; o estado é preservado ao recarregar a página |
| **Game-state signal** | Badges por quadro (ESTADO, ESPECIFICAÇÃO/PARCIAL/RASCUNHO) sem sair do painel |
| **Implementation readiness** | Cada momento mostra o status PRONTO/PARCIAL/RASCUNHO/BLOQUEADO + o que está faltando |
| **Project handoff** | Regenerado a partir do estado atual do projeto — inclui conteúdo editado, progresso por momento e informações de origem |
| **Quest handoff** | Markdown estático + exportação JSON para painéis de visualização de modelos |
| **Templates** | Três pontos de partida para produção de RPG com sequências de tipo de momento e justificativa |
| **Board operations** | Zoom, pan, ajuste ao painel, redefinição, atalhos de teclado — navegação utilizável em laptops |

O painel é uma superfície de criação. O inspetor de momentos é uma especificação de implementação editável. A entrega é um documento gerado a partir do estado real do projeto — não apenas um instantâneo estático.

### Capacidades da Fase 1 (ainda presentes)

A Fase 1 estabeleceu a área de atuação de visualização somente leitura: renderização na tela, sinal de estado do jogo, modelo de prontidão para implementação, exportação de entrega de missão, galeria de modelos e navegação no painel. Todas as capacidades da Fase 1 são preservadas e estendidas pela Fase 2.

---

## Pacotes

| Pacote | O que ele contém |
|---|---|
| `@storyboard-os/core` | Primitivas genéricas de storyboard: quadro, conexão (genérica em relação ao tipo), anotação, modelo, validador estrutural. Os domínios possuem seus próprios vocabulários de conexão. |
| `@storyboard-os/rpg-domain` | Contrato de criação de jogos RPG: tipos de quadro, campos de conteúdo, modelos, modelo de prontidão, gerador de entrega, missão de demonstração Tollhouse Ledger. |
| `@storyboard-os/marketing-domain` | Contrato de implementação de campanha de marketing: tipos de quadro (público, mensagem, ponto de contato, recurso, aprovação, evento de lançamento, medição), modelo de prontidão para lançamento, caminho crítico, portões de aprovação, ciclos de medição, exportação do resumo da campanha, campanha de demonstração. |
| `@storyboard-os/cinematic-domain` | Contrato de produção cinematográfica: 9 tipos de quadro, linguagem da câmera, requisitos de VFX/áudio/continuidade, sinais de produção (saúde, carga, complexidade, cenas bloqueadas), entrega do resumo da produção, 3 modelos, sequência de trailer de demonstração. |
| `@storyboard-os/canvas` | Renderizador de tela Konva: quadros, conexões, seleção, arrastar, badges de tipo, rótulos de conexão, zoom/pan na área de visualização. A configuração do domínio é passada como parâmetro. |
| `@storyboard-os/routing` | Auxiliares de URL configuráveis: geração de rotas para o painel e os quadros. Sem dependências. |

## Aplicativos

| Aplicativo | O que é |
|---|---|
| `rpg-storyboard` | Produto de criação de jogos RPG Astro. Contém: configuração da tela RPG, inspetor de quadros, páginas de entrega, galeria de modelos, configuração de rotas, layout da página. |
| `marketing-storyboard` | Storyboard de implementação de campanha Astro. Contém: configuração da tela de marketing, painel da campanha, inspetor de quadros, badge de prontidão para lançamento, ênfase no caminho crítico, painel de bloqueios de lançamento, entrega do resumo da campanha. |
| `cinematic-storyboard` | Storyboard de produção cinematográfica Astro. Contém: configuração da tela cinematográfica, painel de sequência, inspetor de quadros (câmera/VFX/áudio/continuidade), painel de sinal de produção (saúde/carga/complexidade), entrega do resumo da produção. |

---

## Arquitetura

Os pacotes formam uma cadeia de dependências limpa:

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

Uma quarta área de atuação criaria seu próprio pacote de domínio e reutilizaria `@storyboard-os/core`, `@storyboard-os/canvas` e `@storyboard-os/routing` sem tocar em nenhum pacote de domínio existente. Três áreas de atuação já provaram esse padrão: zero alterações na tela, no núcleo ou no roteamento.

Consulte [`docs/architecture.md`](docs/architecture.md) para obter detalhes completos.

---

## Guia rápido

<!-- NOTA DE AUTOGERAÇÃO: Os valores de instantâneo (937 testes, 54 páginas) abaixo são atualizados manualmente.
Verifique com: pnpm test (contagem de testes), pnpm -r build (contagem de páginas).
Consulte docs/snapshot-checklist.md para cada local que contém esses instantâneos. -->

```bash
pnpm install
pnpm dev        # starts rpg-storyboard at localhost:4321
pnpm test       # runs all package + app tests (937 tests)
pnpm build      # builds all 3 apps (54 pages)
pnpm verify     # typecheck + test + build in one command (ship gate)
```

Requisitos: Node ≥ 20, pnpm ≥ 10.

O escopo do teste é filtrado automaticamente para os pacotes `@storyboard-os/*` e `rpg-storyboard` — não inclui espaços de trabalho irmãos no diretório pai.

---

## Modelo de Confiança

Storyboard OS é uma **aplicação de navegador que funciona apenas localmente** — sem servidor, sem contas, sem comunicação com a rede.

- **Dados acessados:** Dados do projeto (especificações de cenas, posições no storyboard, progresso da lista de verificação) armazenados em `localStorage` no navegador, na máquina do usuário.
- **Dados NÃO acessados:** Nenhuma credencial, nenhuma informação de pagamento, nenhum dado pessoal além do que o designer digita nos campos das especificações de cena.
- **Nenhuma solicitação de rede durante a execução.** O aplicativo é um site estático. Após o carregamento inicial da página, não são feitas solicitações à rede.
- **Sem telemetria.** Nada é coletado ou transmitido.

Consulte [`SECURITY.md`](SECURITY.md) para obter o modelo de confiança completo e informações sobre como relatar vulnerabilidades.

---

## Status

<!-- NOTA DE GERAÇÃO AUTOMÁTICA: Os valores de snapshot abaixo (937 testes, 54 páginas, 6 pacotes, 3 aplicativos) são atualizados manualmente. Verifique com:
pnpm test # testes aprovados
pnpm -r build # páginas criadas (contagem da saída do Astro)
ls packages/ | wc -l # contagem de pacotes
ls apps/ | wc -l # contagem de aplicativos
Consulte docs/snapshot-checklist.md para obter a localização de cada documento que contém esses dados. -->

```
Phase 2 + Marketing Phase 0 + Cinematic Phase 0 + Core Hardening 1A + v1.2.0 Health Hardening
937/937 tests passing
54/54 pages built
6 packages · 3 apps
```

| Fase | Descrição | Status |
|---|---|---|
| 0A–0F | Prova de conceito da criação de RPG — tela, páginas de cenas, modelos, demonstração de missão | ✅ |
| 0R | Reparo + reancoragem — cada quadro contém as especificações do estado do jogo | ✅ |
| 0M | Migração para monorepositorio — núcleo, domínio, tela, roteamento extraídos | ✅ |
| 1A | Visibilidade de ramificação e estado na tela | ✅ |
| 1B | Prontidão da implementação por cena | ✅ |
| 1C | Exportação do fluxo de trabalho da missão | ✅ |
| 1D | Galeria de modelos | ✅ |
| 1E | Operações no storyboard — zoom, panorâmica, ajuste, controles da área de visualização | ✅ |
| 1F | Encerramento do lançamento — documentação, registro de alterações, notas sobre a arquitetura | ✅ |
| 2A | Criação de projeto a partir de modelos — persistência em `localStorage` | ✅ |
| 2B | Posições do storyboard persistentes por projeto | ✅ |
| 2C | Conteúdo da cena editável — os campos das especificações persistem após a recarga | ✅ |
| 2D | Persistência da lista de verificação/progresso — separada do texto da especificação | ✅ |
| 2E | Entrega do projeto — regenerado a partir do estado salvo do projeto | ✅ |
| 2F | Encerramento do lançamento — documentação, registro de alterações, notas sobre a arquitetura | ✅ |
| M-0A | Pacote de domínio de marketing — esquema, sinais, modelos, validação, campanha de demonstração | ✅ |
| M-0B | Vertical do aplicativo de marketing — storyboard da campanha Astro, inspetor de quadros, entrega | ✅ |
| M-0C | Camada de sinal de prontidão para o lançamento — caminho crítico, portões de aprovação, ciclos de medição | ✅ |
| M-0D | Encerramento do marketing — documentação, registro de alterações, prova da arquitetura | ✅ |
| C-0A | Pacote de domínio cinematográfico — esquema, linguagem da câmera, efeitos visuais/áudio, modelos, validação, demonstração | ✅ |
| C-0B | Vertical do aplicativo cinematográfico — storyboard da sequência Astro, inspetor de quadros, resumo da produção | ✅ |
| C-0C | Camada de sinal de produção — saúde, carga de efeitos visuais/áudio, complexidade da câmera, cenas bloqueadas | ✅ |
| C-0D | Encerramento cinematográfico — documentação, registro de alterações, prova da arquitetura | ✅ |
| H-1A | Reforço do núcleo — tipos de conexão genéricos, os domínios possuem seu próprio vocabulário | ✅ |
| v1.2.0 | Reforço da saúde — validador sem exceções, resiliência do armazenamento + versionamento do esquema `localStorage`, camada de design-token, acesso à tela por teclado/leitor de tela, Astro 5 + portão de auditoria de dependências CI | ✅ |

---

## Demonstração

**The Tollhouse Ledger** — três facções querem o mesmo livro-razão oculto. O jogador decide quem vence, quem perde e como será a região no futuro. Oito cenas com especificações completas do estado do jogo: nomes de bandeiras, requisitos de recursos, critérios de teste de aprovação/reprovação, listas de verificação de implementação.

Cada quadro na demonstração pode ser implementado como uma missão em um motor de RPG sem documentação adicional.

Rota: `/storyboards/quest-01`

---

## Documentação

- [`docs/architecture.md`](docs/architecture.md) — separação de pacotes, regras de dependência, modelo da área de visualização do canvas, limite de armazenamento do projeto, extensibilidade
- [`docs/product-brief.md`](docs/product-brief.md) — o que é rpg-storyboard, usuário-alvo, avisos sobre desvios, portões de aceitação
- [`docs/rpg-storyboard.md`](docs/rpg-storyboard.md) — contrato de criação de jogos RPG, ciclo completo de criação (Fase 2), modelo de prontidão, exportação do fluxo de trabalho
- [`docs/marketing-storyboard.md`](docs/marketing-storyboard.md) — contrato de implementação da campanha de marketing, modelo de prontidão para o lançamento, caminho crítico, exclusões
- [`docs/cinematic-storyboard.md`](docs/cinematic-storyboard.md) — storyboard de produção cinematográfica, sinais de produção, linguagem da câmera, exclusões deliberadas
- [`docs/cinematic-phase-0-closeout.md`](docs/cinematic-phase-0-closeout.md) — narrativa principal da Fase 0 Cinematográfica, portões de aceitação, prova
- [`docs/marketing-phase-0-closeout.md`](docs/marketing-phase-0-closeout.md) — narrativa principal da Fase 0 de Marketing, portões de aceitação, prova
- [`docs/phase-2-closeout.md`](docs/phase-2-closeout.md) — narrativa principal da Fase 2, registro da integridade da arquitetura, exclusões deliberadas
- [`docs/phase-1-closeout.md`](docs/phase-1-closeout.md) — narrativa principal da Fase 1 e registro da integridade da arquitetura
- [`docs/phase-0-closeout.md`](docs/phase-0-closeout.md) — veredicto do teste da Fase 0 e backlog original da Fase 1
- [`docs/monorepo-migration.md`](docs/monorepo-migration.md) — registro da migração para monorepositorio: o que foi movido, por quê e a arquitetura resultante
- [`CHANGELOG.md`](CHANGELOG.md) — histórico de lançamentos
