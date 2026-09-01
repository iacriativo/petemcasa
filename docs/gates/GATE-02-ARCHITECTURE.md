# GATE-02 — Arquitetura do MVP

**Status:** DOCUMENTADO — aguardando validação
**Data:** 01/09/2026
**Plano aprovado:** `docs/gates/GATE-02-PLANO-ARQUITETURA.md`
**Escopo:** somente documentação de arquitetura; nenhuma implementação funcional.

## Objetivo

Transformar as decisões arquiteturais aprovadas do GATE-02 em documentação técnica permanente do projeto, definindo frontend, Dashboard, Vercel, Supabase, Storage, funções serverless, fluxo de pedidos, WhatsApp, Collector, segurança, modelo conceitual e PWA.

## Escopo

- Criação/atualização apenas de documentação relacionada ao GATE-02.
- Nenhum código funcional, endpoint, banco, migration, tabela, RLS, Auth, Storage, Supabase, Vercel, PWA, Collector ou WhatsApp implementado.
- Nenhuma dependência instalada.

## Decisões registradas

1. **Fastify NÃO utilizado** — funções serverless mínimas da Vercel (Node/TS). Documentado em `docs/ADRS/ADR-001-fastify.md`.
2. **Fronteira pública** — `supabase-js` com `anon` + RLS; hooks próprios; **sem TanStack Query**.
3. **Carrinho** — Zustand + persist.
4. **Pedidos** — `POST /api/orders` com validação e preço server-side, idempotência por `client_order_token`, `order_token` para transição pública restrita e inserção transacional de `orders` + `order_items`.
5. **Rate limiting** — `rate_guard`, janela deslizante por IP; reforços no GATE-12.
6. **Imagens** — Supabase Storage: bucket público (imagem final) e bucket privado (curadoria/interno).
7. **Collector** — função de ingestão protegida por token; `service_role` exclusivamente server-side (nunca no notebook, nunca no cliente).
8. **`price_history`** — criação somente no GATE-03, junto do modelo de dados.
9. **PWA e Mobile** — aplicação única Vercel, catálogo `network-first`, checkout dependente de rede.
10. **Markup 30%** — `preço = custo × 1,30`, `pricing_type=markup`.

## Documentos produzidos

### Criados

- `docs/ARCHITECTURE.md` — arquitetura vigente consolidada.
- `docs/ADRS/ADR-001-fastify.md` — ADR da decisão Fastify.
- `docs/gates/GATE-02-ARCHITECTURE.md` — este documento.

### Atualizados

- `docs/PET_EM_CASA_BUILD.md` — registro do estado e decisões do GATE-02, preservando o histórico do GATE-01.
- `docs/PET_EM_CASA_GERAL.md` — tabela de STACK (§13): linha de API atualizada para funções serverless da Vercel, com referência ao ADR-001.

## Validações executadas

- Leitura obrigatória: AGENTS.md, GERAL, PLANO_MVP, PLANO_IMPLEMENTACAO, GATE-01-BOOTSTRAP, BUILD e Plano do GATE-02.
- Revisão dos arquivos criados/alterados.
- Busca de referências a Fastify e a TanStack Query no repositório, para confirmar consistência.
- `git diff --check` sem erros de whitespace.
- Confirmação de que nenhum arquivo funcional foi criado e nenhuma dependência instalada.

## Resultado da validação

### Tabela de validação

| Item | Resultado |
|---|---|
| 1. Arquivos verificados | OK |
| 2. Links e caminhos internos | OK |
| 3. Referências conflitantes a Fastify | Nenhuma conflitante; trecho histórico atualizado (GERAL §13) e decisão isolada no ADR-001 |
| 4. Referências conflitantes a TanStack Query | Nenhuma; arquitetura registra sua exclusão |
| 5. Cinco decisões aprovadas presentes | OK |
| 6. Ausência de código funcional | OK |
| 7. Ausência de dependências novas | OK |
| 8. Supabase e Vercel não configurados | OK |
| 9. Nenhum Gate posterior executado | OK |
| 10. Apenas verificações/documentação executadas | OK |

## Estado do Git

- Branch: `main`.
- `HEAD` sincronizado com `origin/main` em `9c77a5c`.
- Alterações do Gate deixadas no working tree para revisão (sem commit, sem push).
- Arquivos do Gate presentes no working tree: documentação exclusivamente.

## Não incluído

- Camada funcional de API ou endpoints.
- Banco, migrations, tabelas, RLS, Auth ou Storage.
- Frontend, Home, carrinho ou checkout.
- Dashboard funcional.
- PWA, manifest ou Service Worker.
- Collector, Browser Harness ou Chromium.
- Integração com WhatsApp.
- Configuração Supabase ou Vercel.
- Instalação de dependências.

## Confirmação de escopo

- GATE-02 não foi além de documentação de arquitetura.
- GATE-03 não foi executado.
- Nenhum Gate posterior foi executado.
- Nenhum commit ou push realizado.