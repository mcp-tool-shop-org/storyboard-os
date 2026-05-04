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

<p align="center">Built by <a href="https://mcp-tool-shop.github.io/">MCP Tool Shop</a></p>

---

Uma plataforma de criação visual para estruturas narrativas interativas — missões, ramificações, cenas, encontros, consequências e a lógica de estado do jogo que as conecta.

**rpg-storyboard** é a primeira aplicação: uma ferramenta de criação de jogos para o design de missões e cenas de videogames de RPG. Não é uma demonstração ou um protótipo. É o produto para o qual esta plataforma foi criada.

---

## O que é o Storyboard OS

Um quadro estruturado para projetar uma **narrativa implementável**. Cada quadro na tela representa um elemento com:
- Condições de entrada e saída
- Mudanças de estado (flags, variáveis, estado do mundo)
- Recursos necessários para a fase de produção
- Critérios de teste com verificações de aprovação/reprovação
- Lista de verificação de implementação

O quadro visualiza o fluxo de estado do jogo, não apenas a sequência da história. As conexões têm significado — ramificações de escolha, arcos de consequências, sequências principais, caminhos alternativos. Um designer pode ler o quadro e entender o que o jogo realmente faz.

## O que o Storyboard OS Não É

- Uma ferramenta genérica de diagramação ou quadro branco
- Um executor de sessões ou um auxílio para mestres de jogo
- Uma wiki de construção de mundos ou um banco de dados de informações
- Um editor exclusivo de árvores de diálogo
- Um aplicativo de preparação de campanhas

Se um leitor pudesse confundir isso com qualquer um desses, o produto se desviou do seu propósito.

---

## O que o rpg-storyboard faz (Fase 2)

Após a Fase 2, um designer pode criar um projeto completo, do início ao fim, sem sair do navegador:

| Funcionalidades | O que eles recebem |
|---|---|
| **Project creation** | Criar um projeto com nome a partir de um modelo; as posições e edições do quadro persistem no localStorage |
| **Visual board** | Fluxo de missões e lógica de ramificação do estado do jogo lado a lado em uma tela Konva |
| **Beat editing** | Editar o título, o resumo e todos os campos de especificação de implementação de cada elemento diretamente no quadro |
| **Progress tracking** | Marcar itens da lista de verificação de implementação e critérios de teste para cada elemento; o estado é preservado durante o recarregamento |
| **Game-state signal** | Badges por elemento (ESTADO, ESPECIFICAÇÃO/PARCIAL/RAScunho) sem sair do quadro |
| **Implementation readiness** | Cada elemento mostra o status PRONTO/PARCIAL/RAScunho/BLOQUEADO + o que está faltando |
| **Project handoff** | Regenerado a partir do estado do projeto em tempo real — inclui conteúdo editado, progresso por elemento, histórico de alterações |
| **Quest handoff** | Exportação estática em Markdown + JSON para quadros de visualização de modelos |
| **Templates** | Três pontos de partida para a produção de RPG com sequências de tipos de elementos e justificativas |
| **Board operations** | Zoom, pan, ajuste ao quadro, reset, atalhos de teclado — navegação utilizável em laptops |

O quadro é uma superfície de criação. O inspetor de elementos é uma especificação de implementação editável. A entrega é um documento gerado a partir do estado real do projeto — não um instantâneo estático.

### Funcionalidades da Fase 1 (ainda presentes)

A Fase 1 estabeleceu a visualização de somente leitura: renderização da tela, sinal de estado do jogo, modelo de prontidão de implementação, exportação de entrega de missões, galeria de modelos e navegação no quadro. Todas as funcionalidades da Fase 1 são preservadas e expandidas na Fase 2.

---

## Pacotes

| Pacote | O que ele contém |
|---|---|
| `@storyboard-os/core` | Primitivos genéricos de quadro: elemento, conexão, anotação, modelo, validador estrutural. Sem vocabulário específico do domínio. |
| `@storyboard-os/rpg-domain` | Contrato de criação de jogos de RPG: tipos de elementos, campos de conteúdo, modelos, modelo de prontidão, gerador de entrega, demonstração de missão Tollhouse Ledger. |
| `@storyboard-os/canvas` | Renderizador de tela Konva: elementos, conexões, seleção, arrasto, badges de tipo, rótulos de conexão, viewport de zoom/pan. Configuração do domínio passada como parâmetro. |
| `@storyboard-os/routing` | Utilitários de URL configuráveis: geração de rotas de quadro e elemento. Sem dependências. |

## Aplicativos

| Aplicativo | O que é |
|---|---|
| `rpg-storyboard` | Produto de criação de jogos Astro RPG. Contém: configuração da tela de RPG, inspetor de elementos, páginas de entrega, galeria de modelos, configuração de rotas, layout de página. |

---

## Arquitetura

Os pacotes formam uma cadeia de dependências limpa:

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

Uma segunda estrutura vertical (por exemplo, `apps/screenplay-storyboard`) criaria seu próprio pacote de domínio e reutilizaria `@storyboard-os/core`, `@storyboard-os/canvas` e `@storyboard-os/routing`, sem modificar `@storyboard-os/rpg-domain`.

Consulte [`docs/architecture.md`](docs/architecture.md) para obter detalhes completos.

---

## Como Começar

```bash
pnpm install
pnpm dev        # starts rpg-storyboard at localhost:4321
pnpm test       # runs all package + app tests (368 tests)
pnpm build      # builds rpg-storyboard (42 pages)
pnpm verify     # test + build in one command (ship gate)
```

Requisitos: Node ≥ 20, pnpm ≥ 9.

O escopo dos testes é filtrado automaticamente para os pacotes `@storyboard-os/*` e `rpg-storyboard` — não inclui outros projetos (workspaces) no diretório pai.

---

## Modelo de Confiança

Storyboard OS é uma **aplicação para navegador que funciona apenas localmente** — sem servidor, sem contas, sem acesso à rede.

- **Dados acessados:** Dados do projeto (especificações de cenas, posições no quadro, progresso da lista de verificação) armazenados apenas no `localStorage` do navegador na máquina do usuário.
- **Dados NÃO acessados:** Nenhuma credencial, nenhuma informação de pagamento, nenhum dado pessoal além do que o designer digita nos campos de especificação da cena.
- **Nenhuma solicitação de rede em tempo de execução.** O aplicativo é um site estático. Após o carregamento inicial da página, nenhuma chamada de rede é feita.
- **Nenhuma telemetria.** Nada é coletado ou transmitido.

Consulte [`SECURITY.md`](SECURITY.md) para obter o modelo de confiança completo e informações sobre relatórios de vulnerabilidades.

---

## Status

```
Phase 2 complete
368/368 tests passing
42/42 pages built
```

| Fase | Descrição | Status |
|---|---|---|
| 0A–0F | Prova de criação de RPG — tela, páginas de cenas, modelos, missão de demonstração. | ✅ |
| 0R | Correção e reancoragem — cada quadro carrega a especificação do estado do jogo. | ✅ |
| 0M | Migração para monorepo — core, domínio, tela e roteamento extraídos. | ✅ |
| 1A | Visibilidade de ramificações e estados na tela. | ✅ |
| 1B | Prontidão para implementação por cena. | ✅ |
| 1C | Exportação de entrega da missão. | ✅ |
| 1D | Galeria de modelos. | ✅ |
| 1E | Operações na tela — zoom, pan, ajuste, controles de visualização. | ✅ |
| 1F | Finalização da versão — documentação, histórico de alterações, notas de arquitetura. | ✅ |
| 2A | Criação de projeto a partir de modelos — persistência no `localStorage`. | ✅ |
| 2B | Posições persistentes da tela por projeto. | ✅ |
| 2C | Conteúdo da cena editável — os campos de especificação são persistidos durante o recarregamento. | ✅ |
| 2D | Persistência da lista de verificação/progresso — separada do texto da especificação. | ✅ |
| 2E | Entrega do projeto — regenerado a partir do estado do projeto salvo. | ✅ |
| 2F | Finalização da versão — documentação, histórico de alterações, notas de arquitetura. | ✅ |

---

## Demonstração

**The Tollhouse Ledger** — três facções querem o mesmo livro de registros secreto. O jogador decide quem vence, quem perde e como a região ficará. Oito cenas com especificação completa do estado do jogo: nomes de bandeiras, requisitos de recursos, critérios de teste de aprovação/reprovação, listas de verificação de implementação.

Cada quadro na demonstração pode ser implementado como uma missão em um motor de RPG sem documentação adicional.

Rota: `/storyboards/quest-01`

---

## Documentação

- [`docs/architecture.md`](docs/architecture.md) — separação de pacotes, regras de dependência, modelo de visualização da tela, limite de armazenamento do projeto, extensibilidade.
- [`docs/product-brief.md`](docs/product-brief.md) — o que é rpg-storyboard, usuário-alvo, avisos de desvio, critérios de aceitação.
- [`docs/rpg-storyboard.md`](docs/rpg-storyboard.md) — contrato de criação de jogos de RPG, ciclo completo de criação (Fase 2), modelo de prontidão, exportação de entrega.
- [`docs/phase-2-closeout.md`](docs/phase-2-closeout.md) — narrativa da Fase 2, registro de integridade da arquitetura, exclusões intencionais.
- [`docs/phase-1-closeout.md`](docs/phase-1-closeout.md) — narrativa da Fase 1 e registro de integridade da arquitetura.
- [`docs/phase-0-closeout.md`](docs/phase-0-closeout.md) — veredicto da Fase 0 (teste interno) e backlog original da Fase 1.
- [`docs/monorepo-migration.md`](docs/monorepo-migration.md) — registro de migração para monorepo: o que foi movido, por quê e a arquitetura resultante.
- [`CHANGELOG.md`](CHANGELOG.md) — histórico de versões.
