# PET EM CASA — REGISTRO DE BUILD

**Status:** BUILD — GATE-02 validado e encerrado
**Data:** 01/09/2026
**Gate atual:** GATE-02 — Arquitetura
**Plano:** `docs/PET_EM_CASA_PLANO_IMPLEMENTACAO_MVP.md`

Este documento preserva o histórico dos Gates executados e reflete o estado atual do Build. As seções 3–9 registram o GATE-01; o GATE-02 é registrado a partir da seção 10.

## 1. Objetivo

Registrar a execução do Build do Pet em Casa de forma incremental, mantendo o trabalho limitado ao Gate autorizado e documentando as evidências antes de qualquer avanço.

## 2. Regra de execução

```text
PLAN
↓
aprovação
↓
GATE atual
↓
BUILD
↓
validação
↓
documentação/evidências
↓
próximo Gate
```

Nenhum Gate posterior pode ser antecipado. O próximo Gate somente poderá começar após a validação explícita do resultado do Gate atual.

## 3. Build executado — GATE-01 (Bootstrap)

O Build atual foi limitado ao bootstrap técnico do GATE-01.

Incluído:

- Metadados npm do projeto.
- `package-lock.json` sem dependências de aplicação.
- `.gitignore` para dependências, ambientes e artefatos locais.
- `.env.example` com placeholders vazios.
- README principal.
- READMEs reservando frontend, backend, Collector e Supabase.
- Verificador local do bootstrap usando somente APIs nativas do Node.js.
- Evidência específica em `docs/gates/GATE-01-BOOTSTRAP.md`.

## 4. Fora do escopo

- Home, catálogo, produto, carrinho e checkout.
- Dashboard e autenticação.
- API, endpoints e regras de negócio.
- Supabase, migrations, RLS, Auth e Storage.
- Collector, Browser Harness e Chromium.
- PWA, manifest e Service Worker.
- Docker e configuração de produção.
- Decisão definitiva sobre Fastify.
- Deploy na Vercel.

## 5. Dependências

Nenhuma dependência de aplicação foi instalada.

Foi executado somente o preparo do lockfile:

```text
npm install --ignore-scripts --package-lock-only
```

## 6. Validação

Comandos aprovados:

```text
npm run check:bootstrap
node --check scripts/check-bootstrap.mjs
npm ls --depth=0
git check-ignore -v .env .env.example node_modules/ dist/ .vercel/
```

O bootstrap foi validado com status **PASS COM RESSALVAS**. As ressalvas estão detalhadas em `docs/gates/GATE-01-BOOTSTRAP.md`.

## 7. Estado do repositório

- Branch atual: `main`.
- Commit base: `3b49294 Plano de implementação do MVP`.
- `HEAD` sincronizado com `origin/main`.
- Nenhum commit realizado durante este Build.
- Nenhum push realizado.
- Arquivos do bootstrap aguardando revisão no working tree.

## 8. Controle de avanço — contexto do GATE-01

Nota histórica do momento do BUILD do GATE-01: naquele ponto, o GATE-02 ainda não estava autorizado e o avanço dependia de:

1. Validação explícita do resultado do GATE-01.
2. Novo planejamento específico do GATE-02.
3. Aprovação desse planejamento.
4. Execução isolada do GATE-02 em BUILD.

O estado atual desse controle está registrado na seção 11.

## 9. Confirmações — GATE-01

- Supabase não foi configurado.
- Collector não foi implementado.
- Home não foi implementada.
- Dashboard não foi implementado.
- WhatsApp não foi implementado.
- Fastify não foi decidido nem implementado.
- Nenhum Gate posterior foi executado.

O GATE-01 foi validado e encerrado no commit `9c77a5c chore: conclui GATE-01 bootstrap`, com push para `origin/main`.

## 10. Build executado — GATE-02 (Arquitetura)

O GATE-02 foi executado em BUILD com escopo exclusivamente documental, transformando o plano aprovado em documentação técnica permanente.

### 10.1. Documentos criados

- `docs/ARCHITECTURE.md` — arquitetura vigente do MVP (frontend, Dashboard, Vercel, Supabase, Storage, funções serverless, fluxo de pedidos, WhatsApp, Collector, segurança, modelo conceitual, PWA, estrutura de diretórios, decisões e trade-offs).
- `docs/ADRS/ADR-001-fastify.md` — decisão formal: Fastify NÃO será utilizado no MVP.
- `docs/gates/GATE-02-ARCHITECTURE.md` — evidências e resultado do Gate.

### 10.2. Documentos atualizados

- `docs/PET_EM_CASA_BUILD.md` — este registro (estado e decisões do GATE-02, preservando o histórico do GATE-01).
- `docs/PET_EM_CASA_GERAL.md` — atualização mínima da tabela de STACK (§13): Fastify substituído por funções serverless da Vercel, com referência ao ADR-001.

### 10.3. Decisões preservadas

- Fastify NÃO utilizado; funções serverless mínimas da Vercel.
- React + Vite + TypeScript; aplicação única (público + `/admin`).
- Dados públicos: `supabase-js` com `anon` + RLS; hooks próprios; **sem TanStack Query**.
- Carrinho: Zustand + persist.
- Pedidos: `POST /api/orders`, validação e preço server-side, idempotência (`client_order_token`), `order_token` para transição pública restrita, `orders` + `order_items` transacionais.
- WhatsApp: somente `wa.me`, sem API/webhook/chatbot/sincronização; abertura não é confirmação.
- Rate limiting: `rate_guard`, janela deslizante por IP; reforços no GATE-12.
- Imagens: Supabase Storage — bucket público (imagem final) e bucket privado (curadoria/interno).
- Collector: função de ingestão protegida por token; `service_role` somente server-side (nunca no notebook, nunca no cliente).
- `price_history`: criado somente no GATE-03.

### 10.4. Validação executada

- Revisão dos 11 itens de validação do GATE-02 (arquivos, links internos, referências a Fastify/TanStack Query, cinco decisões aprovadas, ausência de código funcional, ausência de dependências, Supabase/Vercel não configurados, nenhum Gate posterior executado).
- `git diff --check` sem problemas de whitespace.
- Working tree com somente os arquivos documentais do Gate.

### 10.5. Estado do repositório

- Branch: `main`.
- `HEAD` = `origin/main` = `9c77a5c`.
- Nenhum commit / push novos durante este Build (aguardando revisão).

## 11. Controle de avanço

- GATE-01: VALIDATED e encerrado (`9c77a5c`).
- GATE-02: VALIDATED e encerrado.
- GATE-03: VALIDATED e encerrado.
- GATE-04: PENDING até novo planejamento aprovado.

## 12. Build executado - GATE-03 (Modelo Supabase)

- Projeto Supabase vinculado: `duftidhgewsxsplahmsp`.
- CLI oficial Supabase adicionada como dependencia de desenvolvimento, por autorizacao explicita.
- Migrations aplicadas: `20260901130000_initial_schema.sql` e `20260901130100_rls_and_public_catalog.sql`.
- Validacoes remotas: previa, `db push`, `db lint` sem erros e historico de migrations sincronizado.
- Evidencias: `docs/gates/GATE-03-MODELO-SUPABASE.md`.
- Nenhum dado comercial, morador, administrador ou configuracao operacional foi inserido.
