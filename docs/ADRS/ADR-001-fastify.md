# ADR-001 — Fastify NÃO será utilizado no MVP

**Status:** Aceita (Accepted)
**Data:** 01/09/2026
**Gate:** GATE-02 — Arquitetura
**Autor:** OpenCode + revisão crítica aprovada
**Arquitetura de referência:** `docs/ARCHITECTURE.md`

## Contexto

O documento mestre (`docs/PET_EM_CASA_GERAL.md` §13) listava **Fastify** como tecnologia da camada de API, mas a decisão nunca foi validada tecnicamente. O plano de implementação tratava Fastify como proposta condicionada à avaliação no GATE-02.

O MVP possui um conjunto pequeno e específico de necessidades que exigem processamento server-side:

1. Catálogo público — leitura filtrada (publicado/ativo), resolvida por RLS + `anon` diretamente do PWA.
2. Criação de pedido — única operação com regra de negócio sensível: validação, precificação server-side, inserção atômica de `orders` + `order_items`, montagem da mensagem do WhatsApp e rate limiting.
3. Operações administrativas — 1 admin via Supabase Auth, escrita protegida por RLS.
4. Ingestão do Collector — escrita em `offers` a partir do notebook.

## Alternativas analisadas

| Alternativa | Descrição |
|---|---|
| A) Frontend + Supabase direto | SPA lê catálogo e cria pedido via RPC/PL-pgSQL; `service_role` fora do cliente; RLS como fronteira. |
| B) Frontend + serverless mínimo Vercel + Supabase | PWA + 1–3 funções serverless (Node/TS) na Vercel; `service_role` server-side; RLS para o catálogo. |
| C) Frontend + Fastify + Supabase | Servidor Fastify (na Vercel via adapter ou hospedagem própria) como camada de API. |

Critérios comparados: complexidade, custo, manutenção, segurança, performance, facilidade de deploy, integração com Vercel, necessidade real para o MVP, impacto no desenvolvimento, impacto futuro e riscos.

**Resumo comparativo:**

- **A)** Mais simples e barato, porém concentra a lógica de negócio em PL-pgSQL (mais difícil de testar e manter em TS).
- **B)** Atende todos os requisitos com pouquíssimas funções; lógica em TypeScript, `service_role` 100% server-side, deploy trivial na Vercel.
- **C)** Excede a necessidade: adiciona framework, bundle, adapter/framework de deploy e superfície de manutenção sem ganho real para o escopo do MVP.

## Decisão

> **Fastify NÃO será utilizado no MVP.**
>
> **Opção B:** frontend (React/Vite/PWA) + funções serverless mínimas da Vercel (Node/TypeScript) + Supabase.

Detalhamento:

- Leitura pública do catálogo via `supabase-js` com `anon` + RLS.
- `POST /api/orders` como função serverless que valida, aplica rate limiting, recalcula preços a partir das publicações vigentes, insere `orders` + `order_items` transacionalmente via `service_role`, monta a mensagem e retorna `{ order_id, order_token, wa_url }`.
- Transição pública restrita `CRIADO → ENCAMINHADO_WHATSAPP` via `POST /api/orders/:id/status` (exige `order_token`).
- Ingestão do Collector por função protegida por token.
- Sem framework de backend — apenas módulos TypeScript compartilhados (validação, preço, mensagem).

## Motivos

- **Necessidade real:** 1–3 operações server-side; um framework completo não agrega valor.
- **Simplicidade e manutenção:** menos dependências, menos código, atualizações mais simples.
- **Custo:** permanece no free tier da Vercel/Supabase; sem servidor dedicado.
- **Segurança:** `service_role` centralizado nas funções; RLS permanece como defesa em profundidade.
- **Deploy:** funções serverless nativas da Vercel integram-se ao mesmo projeto da aplicação.
- **Performance:** sem servidor permanente; cold start pontual irrelevante para o volume do MVP.
- **Evolução futura:** se a complexidade crescer, é possível migrar para uma camada de backend dedicada sem retrabalho relevante (a estrutura `api/_shared` já isola a lógica).

## Consequências

### Positivas

- Menos dependências e bundle menor.
- Lógica de negócio testável em TypeScript.
- Custo e infraestrutura mínimos.
- Horizonte de segurança mais simples de auditar (`service_role` só em funções).

### Negativas / condicionantes

- O frontend não pode confiar em regras avançadas no cliente — tudo sensível continua server-side.
- Rate limiting e proteção antiabuso dependem da implementação nas funções (base `rate_guard`); reforços mais robustos ficam no GATE-12.
- Não há camada HTTP rica (plugins, hooks, serialização de esquemas) se algum dia essas capacidades forem exigidas.

## Reavaliação futura

Esta decisão poderá ser revista se surgirem requisitos que justifiquem uma camada HTTP dedicada:

- Múltiplas integrações externas além do Collector;
- automações comerciais complexas;
- necessidade de rate limiting avançado em muitos endpoints;
- contratos HTTP ricos com serialização/validação centralizada.

Nenhum desses cenários pertence ao escopo do MVP atual. A reavaliação, se ocorrer, passará por novo ADR e novo Gate de arquitetura.

## Referências

- `docs/ARCHITECTURE.md` — arquitetura vigente.
- `docs/gates/GATE-02-PLANO-ARQUITETURA.md` — plano aprovado.
- `docs/PET_EM_CASA_GERAL.md` §13 — tabela de STACK (atualizada no GATE-02).