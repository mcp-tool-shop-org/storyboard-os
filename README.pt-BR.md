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

Uma plataforma de criação de narrativas visuais para histórias interativas — missões, campanhas, cinematográficos e a lógica de produção que os conecta.

**Três áreas, uma plataforma:**

| Área | Domínio |
|---|---|
| `rpg-storyboard` | Narrativa/missão de RPG — criação pronta para implementação |
| `marketing-storyboard` | Lançamento de campanha — prontidão para lançamento + caminho crítico |
| `cinematic-storyboard` | Trailer/cena/explicação — roteiro de produção |

Todos são produtos, não demonstrações. Nenhum importa dados dos outros.

---

## O que é o Storyboard OS

Um quadro estruturado para projetar **narrativas implementáveis**. Cada quadro na tela é um elemento com:
- Condições de entrada e saída
- Mudanças de estado (flags, variáveis, estado do mundo)
- Recursos necessários para a fase de produção
- Critérios de teste com verificações de aprovação/reprovação
- Lista de verificação de implementação

O quadro visualiza o fluxo do estado do jogo, não apenas a sequência da história. As conexões carregam significado — ramificações de escolha, arcos de consequência, sequências principais, caminhos alternativos. Um designer pode ler o quadro e entender o que o jogo realmente faz.

## O que o Storyboard OS Não É

- Uma ferramenta genérica de diagramação ou quadro branco
- Um executor de sessões ou um auxílio para mestres de jogo
- Uma wiki de construção de mundos ou banco de dados de lore
- Um editor exclusivo de árvores de diálogo
- Um aplicativo de preparação de campanhas

Se um leitor pudesse confundir isso com qualquer um desses, o produto se desviou do seu propósito.

---

## O que o rpg-storyboard faz (Fase 2)

Após a Fase 2, um designer pode criar um projeto completo do início ao fim, sem sair do navegador:

| Funcionalidade | O que eles obtêm |
|---|---|
| **Project creation** | Criar um projeto com nome a partir de um modelo; as posições e edições do quadro persistem no localStorage |
| **Visual board** | Fluxo da missão e lógica de ramificação do estado do jogo lado a lado em uma tela Konva |
| **Beat editing** | Editar o título, o resumo e todos os campos de especificação de implementação de cada elemento diretamente no quadro |
| **Progress tracking** | Marcar itens da lista de verificação de implementação e critérios de teste para cada elemento; o estado é preservado ao recarregar |
| **Game-state signal** | Selos por quadro (ESTADO, ESPECIFICAÇÃO/PARCIAL/RAScunho) sem sair do quadro |
| **Implementation readiness** | Cada elemento mostra o status PRONTO/PARCIAL/RAScunho/BLOQUEADO + o que está faltando |
| **Project handoff** | Regenerado a partir do estado do projeto em tempo real — inclui conteúdo editado, progresso por elemento, histórico de alterações |
| **Quest handoff** | Exportação estática em Markdown + JSON para quadros de visualização de modelos |
| **Templates** | Três pontos de partida para a produção de RPG com sequências de tipos de elementos e justificativas |
| **Board operations** | Zoom, pan, ajuste à tela, reset, atalhos de teclado — navegação utilizável em laptops |

O quadro é uma superfície de criação. O inspetor de elementos é uma especificação de implementação editável. A entrega é um documento gerado a partir do estado real do projeto — não um instantâneo estático.

### Funcionalidades da Fase 1 (ainda presentes)

A Fase 1 estabeleceu a área de visualização somente leitura: renderização da tela, sinal de estado do jogo, modelo de prontidão para implementação, exportação de entrega de missões, galeria de modelos e navegação no quadro. Todas as funcionalidades da Fase 1 são preservadas e expandidas na Fase 2.

---

## Pacotes

| Pacote | O que ele contém |
|---|---|
| `@storyboard-os/core` | Primitivos genéricos de storyboard: quadro, conexão (genérico por tipo), anotação, modelo, validador estrutural. Os domínios possuem seus próprios vocabulários de conexão. |
| `@storyboard-os/rpg-domain` | Contrato de criação de jogos de RPG: tipos de elementos, campos de conteúdo, modelos, modelo de prontidão, gerador de entrega, missão de demonstração do Tollhouse Ledger. |
| `@storyboard-os/marketing-domain` | Contrato de implementação de campanha de marketing: tipos de elementos (público, mensagem, ponto de contato, recurso, aprovação, evento de lançamento, medição), modelo de prontidão para lançamento, caminho crítico, portões de aprovação, loops de medição, exportação de resumo da campanha, campanha de demonstração. |
| `@storyboard-os/cinematic-domain` | Contrato de produção cinematográfica: 9 tipos de quadros, linguagem de câmera, requisitos de VFX/áudio/continuidade, sinais de produção (saúde, carga, complexidade, quadros bloqueados), entrega do briefing de produção, 3 modelos, sequência de trailer de demonstração. |
| `@storyboard-os/canvas` | Renderizador de tela Konva: quadros, conexões, seleção, arrasto, etiquetas de tipo, rótulos de conexão, zoom/pan da visualização. Configuração do domínio passada como parâmetro. |
| `@storyboard-os/routing` | Utilitários de URL configuráveis: geração de rotas para painel e quadro. Sem dependências. |

## Aplicativos

| Aplicativo | O que é |
|---|---|
| `rpg-storyboard` | Produto para criação de jogos de RPG. Inclui: configuração do canvas de RPG, inspetor de quadros, páginas de entrega, galeria de modelos, configuração de rotas, layout de página. |
| `marketing-storyboard` | Roteiro de implementação de campanha de RPG. Inclui: configuração do canvas de marketing, painel de campanha, inspetor de quadros, indicador de prontidão para lançamento, ênfase no caminho crítico, painel de bloqueios de lançamento, entrega do briefing da campanha. |
| `cinematic-storyboard` | Roteiro de produção cinematográfica. Inclui: configuração do canvas cinematográfico, painel de sequência, inspetor de quadros (câmera/VFX/áudio/continuidade), painel de sinais de produção (saúde/carga/complexidade), entrega do briefing de produção. |

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

Um quarto pacote vertical criaria seu próprio pacote de domínio e reutilizaria `@storyboard-os/core`, `@storyboard-os/canvas` e `@storyboard-os/routing` sem modificar nenhum pacote de domínio existente. Três pacotes verticais já comprovaram esse padrão: nenhuma alteração no canvas, core ou routing.

Consulte [`docs/architecture.md`](docs/architecture.md) para obter detalhes completos.

---

## Como começar

<!-- AUTOGEN-NOTE: Os valores de snapshot (649 testes, 54 páginas) abaixo são atualizados manualmente.
Verifique com: pnpm test (contagem de testes), pnpm -r build (contagem de páginas).
Consulte docs/snapshot-checklist.md para cada local que contém esses snapshots. -->

```bash
pnpm install
pnpm dev        # starts rpg-storyboard at localhost:4321
pnpm test       # runs all package + app tests (649 tests)
pnpm build      # builds all 3 apps (54 pages)
pnpm verify     # test + build in one command (ship gate)
```

Requisitos: Node ≥ 20, pnpm ≥ 9.

O escopo dos testes é filtrado automaticamente para os pacotes `@storyboard-os/*` e `rpg-storyboard` — não inclui workspaces irmãos no diretório pai.

---

## Modelo de Confiança

Storyboard OS é uma **aplicação para navegador que funciona apenas localmente** — sem servidor, sem contas, sem tráfego de rede.

- **Dados acessados:** Dados do projeto (especificações de "beats", posições do painel, progresso da lista de verificação) armazenados no `localStorage` do navegador na máquina do usuário.
- **Dados NÃO acessados:** Nenhuma credencial, nenhuma informação de pagamento, nenhuma informação pessoal além do que o designer digita nos campos de especificação de "beats".
- **Nenhuma solicitação de rede em tempo de execução.** O aplicativo é um site estático. Após o carregamento inicial da página, nenhuma chamada de rede é feita.
- **Nenhuma telemetria.** Nada é coletado ou transmitido.

Consulte [`SECURITY.md`](SECURITY.md) para obter o modelo de confiança completo e relatórios de vulnerabilidades.

---

## Status

<!-- AUTOGEN-NOTE: Os valores de snapshot abaixo (649 testes, 54 páginas, 6 pacotes, 3 aplicativos) são
atualizados manualmente. Verifique com:
pnpm test                       # testes passando
pnpm -r build                   # páginas construídas (contagem da saída do Astro)
ls packages/ | wc -l            # contagem de pacotes
ls apps/ | wc -l                # contagem de aplicativos
Consulte docs/snapshot-checklist.md para cada local de documentação que contém esses dados. -->

```
Phase 2 complete + Marketing Phase 0 complete + Cinematic Phase 0 complete + Core Hardening 1A
649/649 tests passing
54/54 pages built
6 packages · 3 apps
```

| Fase | Descrição | Status |
|---|---|---|
| 0A–0F | Prova de criação de RPG — canvas, páginas de "beats", modelos, quest de demonstração | ✅ |
| 0R | Correção + reancoragem — cada quadro carrega a especificação do estado do jogo | ✅ |
| 0M | Migração para monorepo — core, domínio, canvas, routing extraídos | ✅ |
| 1A | Visibilidade de ramificação e estado no canvas | ✅ |
| 1B | Prontidão para implementação por "beat" | ✅ |
| 1C | Exportação de "handoff" de quest | ✅ |
| 1D | Galeria de modelos | ✅ |
| 1E | Operações do painel — zoom, pan, ajuste, controles de visualização | ✅ |
| 1F | Finalização da versão — documentação, histórico de alterações, notas de arquitetura. | ✅ |
| 2A | Criação de projetos a partir de modelos — persistência no localStorage. | ✅ |
| 2B | Posições das telas persistentes por projeto. | ✅ |
| 2C | Conteúdo das "beats" editável — os campos de especificação persistem após a recarga. | ✅ |
| 2D | Persistência de listas de verificação/progresso — separada do texto da especificação. | ✅ |
| 2E | Entrega de projetos — regenerados a partir do estado do projeto salvo. | ✅ |
| 2F | Finalização da versão — documentação, histórico de alterações, notas de arquitetura. | ✅ |
| M-0A | Pacote de domínio de marketing — esquema, sinais, modelos, validação, campanha de demonstração. | ✅ |
| M-0B | Vertical de aplicativos de marketing — painel de campanha Astro, inspetor de quadros, entrega. | ✅ |
| M-0C | Camada de sinais de prontidão para lançamento — caminho crítico, etapas de aprovação, ciclos de medição. | ✅ |
| M-0D | Finalização de marketing — documentação, histórico de alterações, comprovação da arquitetura. | ✅ |
| C-0A | Pacote de domínio cinematográfico — esquema, linguagem de câmera, efeitos visuais/áudio, modelos, validação, demonstração. | ✅ |
| C-0B | Vertical de aplicativos cinematográficos — painel de sequência Astro, inspetor de quadros, resumo de produção. | ✅ |
| C-0C | Camada de sinais de produção — saúde, carga de efeitos visuais/áudio, complexidade da câmera, cenas bloqueadas. | ✅ |
| C-0D | Finalização cinematográfica — documentação, histórico de alterações, comprovação da arquitetura. | ✅ |
| H-1A | Fortalecimento do núcleo — tipos de conexão genéricos, os domínios possuem seu próprio vocabulário. | ✅ |

---

## Demonstração

**O Livro Razão de Tollhouse** — três facções querem o mesmo livro razão secreto. O jogador decide quem vence, quem perde e como a região ficará. Oito "beats" com especificação completa do estado do jogo: nomes de flags, requisitos de recursos, critérios de teste de aprovação/reprovação, listas de verificação de implementação.

Cada quadro na demonstração pode ser implementado como uma missão em um motor de RPG sem documentação suplementar.

Rota: `/storyboards/quest-01`

---

## Documentação

- [`docs/architecture.md`](docs/architecture.md) — separação de pacotes, regras de dependência, modelo de viewport da tela, limite de armazenamento do projeto, extensibilidade.
- [`docs/product-brief.md`](docs/product-brief.md) — o que é rpg-storyboard, usuário-alvo, avisos de desvio, etapas de aceitação.
- [`docs/rpg-storyboard.md`](docs/rpg-storyboard.md) — contrato de criação de jogos RPG, loop completo de criação (Fase 2), modelo de prontidão, exportação para entrega.
- [`docs/marketing-storyboard.md`](docs/marketing-storyboard.md) — contrato de implementação de campanhas de marketing, modelo de prontidão para lançamento, caminho crítico, exclusões.
- [`docs/cinematic-storyboard.md`](docs/cinematic-storyboard.md) — storyboard de produção cinematográfica, sinais de produção, linguagem de câmera, exclusões intencionais.
- [`docs/cinematic-phase-0-closeout.md`](docs/cinematic-phase-0-closeout.md) — narrativa central da Fase 0 cinematográfica, etapas de aceitação, comprovação.
- [`docs/marketing-phase-0-closeout.md`](docs/marketing-phase-0-closeout.md) — narrativa central da Fase 0 de marketing, etapas de aceitação, comprovação.
- [`docs/phase-2-closeout.md`](docs/phase-2-closeout.md) — narrativa central da Fase 2, registro de integridade da arquitetura, exclusões intencionais.
- [`docs/phase-1-closeout.md`](docs/phase-1-closeout.md) — narrativa central da Fase 1 e registro de integridade da arquitetura.
- [`docs/phase-0-closeout.md`](docs/phase-0-closeout.md) — veredicto da Fase 0 (teste interno) e backlog original da Fase 1.
- [`docs/monorepo-migration.md`](docs/monorepo-migration.md) — registro de migração para monorepo: o que foi movido, por quê e a arquitetura resultante.
- [`CHANGELOG.md`](CHANGELOG.md) — histórico de lançamentos.
