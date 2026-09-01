# GATE-02 — Plano de Arquitetura do MVP

**Status:** PLAN — decisões aprovadas, revisão crítica incorporada
**Data:** 01/09/2026
**Data da revisão crítica:** 01/09/2026
**Gate anterior:** GATE-01 VALIDATED em `9c77a5c`
**Escopo:** somente definição e documentação da arquitetura; nenhuma implementação funcional.

## 1. Objetivo

Definir e documentar a arquitetura técnica do MVP antes de qualquer implementação funcional, respeitando simplicidade, segurança, baixo custo, compatibilidade com Vercel e Supabase, preparo para PWA e experiência Mobile-first.

## 2. Contexto atual

- GATE-00 e GATE-01 concluídos e validados.
- Commit atual: `9c77a5c chore: conclui GATE-01 bootstrap`.
- Working tree limpo e `HEAD` sincronizado com `origin/main`.
- Bootstrap criado sem dependências de aplicação.
- As decisões arquiteturais abertas na seção 17 do plano de implementação devem ser fechadas neste Gate.

### 2.1. Decisões aprovadas na revisão crítica

1. **TanStack Query removido** — leituras públicas via hooks próprios sobre `supabase-js`; cache/refetch cobertos pelo Service Worker.
2. **Carrinho com Zustand + persist** — estado compartilhado e persistência local mantidos.
3. **Rate limiting mínimo no `POST /api/orders`** — janela deslizante por IP usando a tabela auxiliar `rate_guard` no Supabase, verificada na função serverless; reforços adicionais no GATE-12.
4. **`price_history` criado no GATE-03** — junto da estrutura do Supabase/modelo de dados.
5. **Ingestão do Collector por função protegida por token** — decisão firme; `service_role` exclusivamente server-side, nunca no notebook e nunca no cliente.

Complementos incorporados: idempotência de pedido (`client_order_token`), token por pedido para transição de status (`order_token`) e fluxo de retry do WhatsApp sem recriar pedido.

## 3. Decisão central — Fastify

### 3.1. Análise comparativa

| Critério | A) Só Frontend + Supabase direto | B) Frontend + serverless mínimo Vercel + Supabase | C) Frontend + Fastify + Supabase |
|---|---|---|---|
| Complexidade | Baixa | Baixa-média | Média-alta |
| Custo | Mínimo | Mínimo (free tier) | Mínimo–médio |
| Manutenção | Lógica em SQL/RLS | Funções TS pequenas | Framework + servidor |
| Segurança | service_role fora do cliente; RLS | service_role 100% server-side | Idem B, maior superfície |
| Performance | Excelente | Boa (cold start pontual) | Boa; pior se servidor separado |
| Deploy | Trivial | Trivial (Vercel) | Adapter mono-função ou infra extra |
| Necessidade real | Parcial | Atende todos os requisitos | Excede a necessidade |
| Impacto futuro | Regra no Postgres | Migração fácil | Sem ganho agora |

### 3.2. Necessidades reais do MVP

1. Catálogo público — leitura filtrada (publicado/ativo), resolvida por RLS + `anon`.
2. Criação de pedido — única operação com regra de negócio sensível: validação, precificação server-side, inserção atômica de `orders` + `order_items`, montagem da mensagem do WhatsApp e rate limiting.
3. Operações administrativas — 1 admin via Supabase Auth, escrita protegida por RLS.
4. Ingestão do Collector — escrita em `offers` a partir do notebook.

Tudo isso é coberto por 1–3 funções serverless na Vercel.

### 3.3. Decisão

> **Fastify NÃO será utilizado no MVP.**
> **Opção B:** frontend (React/Vite/PWA) + funções serverless mínimas da Vercel (Node/TS) + Supabase.

- A leitura pública usa `anon` + RLS diretamente do PWA.
- `POST /api/orders` valida, aplica rate limiting, recalcula preços a partir das publicações vigentes, insere `orders` + `order_items` transacionalmente via `service_role` (server-side), monta `wa.me` e retorna `{ order_id, order_token, wa_url }`.
- Função auxiliar autenticada para ingestão do Collector.
- Sem framework de backend; módulos TS compartilhados (validação, preço, mensagem).

Esta decisão revisa formalmente a linha "API: Fastify" da tabela de STACK em `docs/PET_EM_CASA_GERAL.md` §13 e será registrada como ADR no Build do Gate.

## 4. Arquitetura do Frontend (PWA público)

- Framework: React + Vite, TypeScript.
- App único: frontend público + Dashboard administrativo no mesmo projeto.
- Roteamento: React Router com lazy-loading por rota (público e `/admin/*` separados).
- Estado do carrinho: store leve com persistência local (**Zustand + persist**), sobrevive a reload.
- Dados: **hooks próprios sobre `supabase-js` (anon)** para leituras públicas (catálogo, categorias, detalhe), com estados de loading/erro/vazio. **TanStack Query foi descartado na revisão crítica** — o MVP possui poucas leituras públicas, e cache/refetch são cobertos pelo Service Worker (`network-first`) sem dependência extra. Trade-off aceito: quando o catálogo evoluir (paginação, invalidação complexa, mutações otimistas), reintroduzir a biblioteca pode ser avaliado; hoje a ausência reduz bundle e manutenção.
- PWA: `vite-plugin-pwa` (Workbox), manifest, ícones, Service Worker `network-first` para catálogo; checkout dependente de rede.
- Estilo: decisão de implementação adiada ao GATE-05, sem impacto arquitetural.
- Componentes reutilizáveis: Button, Card, SearchBar, ProductCard, CategoryCard, CartBar fixa, Stepper, estados de loading/erro/vazio.
- Fluxo: Home (busca prioritária) → categorias → produtos publicados → adicionar → carrinho fixo → revisão → identificação (pet/bloco/unidade) → `POST /api/orders` → abrir `wa.me`.

## 5. Arquitetura do Dashboard

- Mesmo app React, rotas `/admin/*` protegidas e carregadas via lazy.
- Supabase Auth (e-mail/senha, PKCE) para o único admin.
- Guard de rota verifica sessão; sem sessão → `/admin/login`.
- `supabase-js` com sessão do admin + RLS; `service_role` nunca chega ao cliente.
- Rotas: Dashboard, Ofertas, Pedidos, Produtos, Categorias, Publicados, Configurações.
- Responsivo, experiência principal Desktop.
- Não-habilidades: sem BI, estoque, logística, CRM, multi-admin, multi-condomínio.

## 6. Supabase (planejamento)

- Um único projeto com PostgreSQL.
- Separação público/interno por tabelas, campos e RLS.
- Público (SELECT `anon`): visão `public_catalog` (products ativos + publicações publicadas) e categorias ativas.
- Interno (sem acesso anon): `sources`, `offers`, `price_history`, `offer_reviews`, campos internos de `publications`, `app_settings`.
- Pedidos: `orders`/`order_items` sem INSERT direto de anon — apenas via função serverless (service_role).
- Rate limiting do pedido: tabela auxiliar `rate_guard` (janela deslizante por IP) consultada na função serverless.
- Admin: políticas RLS atreladas ao único usuário admin.
- Auth: apenas administrativo.
- Storage: Supabase Storage — bucket público para imagem final do produto, bucket privado para imagens internas/curadoria.
- Collector: **decisão firme** — ingestão via função protegida por token de ingestão; `service_role` exclusivamente server-side (nunca no notebook, nunca no cliente).

## 7. Modelo de dados conceitual

Definição conceitual; criação em SQL pertence ao GATE-03.

- **categories** — administrável (criar/editar/ativar/desativar; sem exclusão física). `id, name, slug, parent_id, active, sort_order, created_at, updated_at`. Subcategorias via `parent_id` (1 nível).
- **products** — produto canônico para uso público. `id, name, description, brand, category_id, image_url, active, created_at, updated_at`. Rel.: 1:N com publications, price_history, order_items.
- **sources** — interno, lojas de origem. `id, name, base_url, active, created_at, updated_at`. Rel.: 1:N offers. Nunca público.
- **offers** — oportunidade coletada. `id, product_id, source_id, source_url, collected_price, original_price, promotion_data, availability, status, collected_at, last_verified_at, expires_at, created_at, updated_at`. Estados: pending/approved/published/rejected/expired/unavailable. Interno.
- **price_history** — histórico interno. `id, product_id, source_id, price, availability, collected_at`. Interno. **Criação confirmada no GATE-03** junto do modelo de dados.
- **offer_reviews** — curadoria humana. `id, offer_id, admin_user_id, status, notes, reviewed_at`. Interno.
- **publications** — controle da visibilidade pública e preço. `id, offer_id, product_id, sale_price, pricing_type, pricing_value, published_at, unpublished_at, status`. A publicação é a porta de entrada do catálogo público.
- **orders** — `id, nome_pet, bloco, numero_unidade, total, status, client_order_token, order_token, created_at, updated_at, whatsapp_sent_at`. `client_order_token` é a chave de idempotência gerada no checkout (unique) para evitar dupla submissão; `order_token` é o token por pedido usado na transição de status pública. Estados: CRIADO / ENCAMINHADO_WHATSAPP / EM_ATENDIMENTO / CONFIRMADO / CONCLUIDO / CANCELADO.
- **order_items** — `id, order_id, product_id, quantidade, preco_unitario, subtotal, product_name_snapshot, created_at`. Snapshot preserva histórico.
- **app_settings** — `id, condominio_nome, whatsapp_number, created_at, updated_at`. 1 registro.
- **rate_guard** — tabela auxiliar de controle de abuso. `id, client_ip, window_start, request_count, created_at`. Emprego na janela deslizante do `POST /api/orders`; dados de proteção, com janela curta de expiração.

## 8. Fluxo técnico do pedido

```text
QRCode → PWA
→ anon+RLS lê public_catalog
→ carrinho local persistido (sem rede)
→ checkout: gera client_order_token (idempotência) + pet + bloco + unidade (validação de formato)
→ POST /api/orders
   1. rate_guard: janela deslizante por IP (tabela auxiliar); excesso → 429
   2. valida entradas e idempotência (client_order_token único)
   3. recalcula preços e total a partir das publications vigentes (total do cliente ignorado)
   4. INSERT orders (status=CRIADO) + order_items (snapshot), transacional
   5. gera order_token (por pedido) e monta mensagem padrão aprovada
   6. retorna { order_id, order_token, wa_url }
→ frontend abre wa_url (https://wa.me/{numero}?text=...)
→ best-effort: POST /api/orders/:id/status — transição CRIADO → ENCAMINHADO_WHATSAPP
   (exige order_token e pedido em CRIADO)
→ falha na abertura: retry reabre wa_url sem recriar pedido (idempotência); pedido permanece CRIADO e fica visível ao admin
→ atendimento humano fora da plataforma
→ admin (autenticado) atualiza status manualmente
```

Semântica: pedido nasce `CRIADO`; transição para `ENCAMINHADO_WHATSAPP` é best-effort após abertura do WhatsApp (falha não bloqueia o morador; reconciliação manual pelo admin). Abertura do WhatsApp não significa confirmação. Nenhuma transição além de `CRIADO → ENCAMINHADO_WHATSAPP` é permitida por token público; os demais estados são exclusivos do admin autenticado.

## 9. Segurança e riscos

- `service_role` somente server-side (funções Vercel; nunca no notebook, nunca no cliente).
- `anon` público limitado ao catálogo.
- Rate limiting no `POST /api/orders`: janela deslizante por IP (header do proxy/Vercel) com tabela auxiliar `rate_guard` no Supabase, consultada na função serverless. Reforços adicionais (limites por bloco/unidade, mitigação de força bruta, WAF) permanecem no GATE-12.
- Idempotência de pedido: `client_order_token` único gerado no checkout evita dupla submissão e duplicação por retry.
- Transição de status pública restrita: somente `CRIADO → ENCAMINHADO_WHATSAPP`, exigindo `order_token` por pedido e estado atual `CRIADO`.
- RLS como defesa em profundidade.
- Retenção/privacidade dos dados de entrega definida no GATE-03/GATE-12; default: manter histórico operacional sem dados além da entrega.
- Harmonização de preço: **markup 30%** — `preço público = custo × 1,30`, `pricing_type=markup`. Corrige fórmula de margem conflitante em `docs/PET_EM_CASA_GERAL.md` §8.

## 10. Estrutura-alvo

```text
pet-em-casa/
├── frontend/            # React+Vite PWA (público + admin lazy)
│   ├── src/public/      # Home, catálogo, checkout
│   └── src/admin/       # Dashboard protegido
├── api/                 # Vercel Functions (Node/TS) — orders, ingest
│   └── _shared/         # validação, preço, mensagem WhatsApp
├── supabase/
│   └── migrations/
├── collector/           # Python (Gates 07+)
├── docs/                # + docs/gates/
└── scripts/
```

Aplicada a partir dos Gates 03–06.

## 11. Escopo do BUILD do Gate

- `docs/ARCHITECTURE.md` — decisões, fluxos, contratos, modelo conceitual.
- `docs/ADRS/ADR-001-fastify.md` — fundamentação da decisão técnica.
- Atualização de `docs/PET_EM_CASA_BUILD.md`.
- Evidência em `docs/gates/GATE-02-ARCHITECTURE.md`.
- Commit + push após validação.
- Nenhum código funcional, nenhuma dependência, nenhuma configuração Supabase/Vercel.

## 12. Fora do escopo deste Gate

- Implementação de frontend, pedidos, catálogo, Dashboard ou PWA.
- Configuração do Supabase, migrations, RLS, Auth ou Storage.
- Configuração da Vercel.
- Collector, Browser Harness ou Chromium.
- Integração com WhatsApp.
- Instalação de dependências.
- GATE-03 em diante.

## 13. Critérios de validação

1. Documentos de arquitetura e ADR criados.
2. Decisões registradas conforme seções 3–9.
3. Ausência de código funcional e de dependências instaladas.
4. Working tree controlada; commit e push únicos do Gate.
5. Evidências registradas em `docs/gates/GATE-02-ARCHITECTURE.md`.

## 14. Decisões adiadas para outros Gates

- Estilo/design tokens: GATE-05.
- Nome do condomínio, número do WhatsApp e e-mail do admin: GATE-04/06 (dados operacionais).
- Primeira loja do Collector: GATE-08.
- Ferramentas de teste visual/mobile: GATE-05.
- Docker: fora do MVP.
- Regras legais/operacionais de coleta: GATE-07/08.