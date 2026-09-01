# PET EM CASA — ARQUITETURA DO MVP

**Status:** APROVADA (GATE-02)
**Data:** 01/09/2026
**Plano de referência:** `docs/gates/GATE-02-PLANO-ARQUITETURA.md`
**Decisão central:** `docs/ADRS/ADR-001-fastify.md`
**Evidência do Gate:** `docs/gates/GATE-02-ARCHITECTURE.md`

## 1. Objetivo

Este documento é a referência técnica permanente da arquitetura do MVP do Pet em Casa. Ele consolida as decisões aprovadas no GATE-02 e orienta a implementação dos Gates 03–06, mantendo simplicidade, segurança, baixo custo, compatibilidade com Vercel e Supabase, preparo para PWA e experiência Mobile-first.

## 2. Visão geral

```text
                    VERCEL
             ┌─────────────────────────┐
             │ Aplicação única (React) │
             │  ├── PWA público        │
             │  └── /admin (Dashboard) │
             │                         │
             │ Funções serverless      │
             │  ├── POST /api/orders   │
             │  ├── :id/status         │
             │  └── collector ingest   │
             └────────────┬────────────┘
                          │
                          ▼
                      SUPABASE
              ┌──────────┼──────────┐
              │ Postgres │ Auth     │
              │ Storage  │ RLS      │
              └──────────┴──────────┘
                        ▲
                        │ ingestão protegida por token
              ┌─────────┴─────────┐
              │     COLLECTOR     │
              │  Notebook (manual)│
              │  Python           │
              └───────────────────┘
```

- O morador chega pelo QRCode e abre o PWA no Smartphone.
- A aplicação pública lê o catálogo publicado diretamente do Supabase com `anon` + RLS.
- O pedido é criado por uma função serverless da Vercel, que detém `service_role` server-side.
- O Dashboard (área `/admin`) usa Supabase Auth para o único administrador.
- O Collector, fora da Vercel, envia ofertas por uma função protegida por token.
- WhatsApp é somente o canal externo via `wa.me`, sem integração automatizada.

## 3. Decisões arquiteturais centrais

| # | Decisão | Referência |
|---|---|---|
| 1 | **Sem Fastify** — funções serverless mínimas da Vercel (Node/TS) | ADR-001 |
| 2 | Aplicação React única (público + `/admin`) com rotas lazy | Seção 4 |
| 3 | Catálogo público via `supabase-js` (`anon` + RLS) + hooks próprios | Seções 4 e 7 |
| 4 | Carrinho com Zustand + persist | Seção 4 |
| 5 | Pedido transacional via `POST /api/orders` com precificação e validação server-side | Seções 6 e 9 |
| 6 | Idempotência por `client_order_token`; transição pública restrita por `order_token` | Seção 9 |
| 7 | Rate limiting mínimo por IP com `rate_guard` | Seção 9 |
| 8 | Imagens no Supabase Storage: bucket público + bucket privado | Seção 8 |
| 9 | Collector ingere via função protegida por token; `service_role` só server-side | Seção 12 |
| 10 | `price_history` criado no GATE-03; sem TanStack Query | Seções 4 e 14 |
| 11 | Markup 30% (`preço = custo × 1,30`), `pricing_type=markup` | Seção 13 |

## 4. Frontend (aplicação pública + Dashboard)

### 4.1. Tecnologias e estrutura

- **React + Vite + TypeScript.** Aplicação única hospedada na Vercel.
- Rotas públicas (`/`, catálogo, produto, carrinho, checkout) e administrativas (`/admin/*`) com **lazy-loading** separado.
- **Roteamento:** React Router.

### 4.2. Estado

- **Carrinho:** Zustand + `persist` — estado compartilhado entre cards, carrinho fixo e página de revisão, sobrevivendo a reload.
- **Dados:** hooks próprios sobre `supabase-js` (anon) com estados de loading/erro/vazio.
  - **TanStack Query NÃO será adicionado.** Cache/refetch são cobertos pelo Service Worker (`network-first`) para o catálogo. Reavalia-se somente se o catálogo exigir paginação complexa, invalidação específica ou mutações otimistas.

### 4.3. PWA

- `vite-plugin-pwa` (Workbox): manifest, ícones, Service Worker.
- Catálogo: estratégia `network-first`.
- Checkout dependente de rede — pedido offline não é permitido.

### 4.4. Componentes e experiência

- Componentes reutilizáveis: Button, Card, SearchBar, ProductCard, CategoryCard, CartBar fixa, Stepper, estados de loading/erro/vazio.
- Mobile-first: busca prioritária, categorias tocáveis, cards com ação de adicionar, carrinho fixo na parte inferior, áreas de toque confortáveis.
- Desktop apenas como compatibilidade na área pública.

### 4.5. Fluxo do morador

```text
QRCode → PWA
→ Busca / categorias
→ Produtos publicados
→ Adicionar ao carrinho
→ Revisar carrinho
→ Identificação (pet + bloco + unidade)
→ POST /api/orders
→ Abrir WhatsApp (wa.me)
```

## 5. Dashboard

- Mesma aplicação React, grupo de rotas `/admin/*` carregadas via lazy.
- **Auth:** Supabase Auth (e-mail/senha, PKCE) para o único administrador.
- **Proteção:** guard de rota verifica a sessão; sem sessão → `/admin/login`.
- Dados via `supabase-js` com a sessão do admin + RLS; `service_role` nunca chega ao cliente.
- Estrutura: Dashboard, Ofertas, Pedidos, Produtos, Categorias, Publicados, Configurações.
- Experiência principal **Desktop**, responsivo.
- Fora de escopo neste MVP: BI, estoque completo, logística, CRM, múltiplos admins/condomínios, automações complexas.

## 6. Vercel

- Hospedagem da aplicação única (estático + funções).
- **Funções serverless** em `api/` (Node.js + TypeScript), mínimas:
  - `POST /api/orders` — criação de pedido.
  - `POST /api/orders/:id/status` — transição pública restrita.
  - ingestão do Collector — protegida por token.
- Sem servidor permanente; sem Fastify.
- Módulo compartilhado `api/_shared` com validação, precificação e montagem da mensagem do WhatsApp.

## 7. Supabase

- Um único projeto PostgreSQL.
- **Separação público/interno** por tabelas, campos e RLS.
- **Público (SELECT `anon`):** visão `public_catalog` (products ativos + publicações publicadas) e categorias ativas.
- **Interno (sem acesso anon):** `sources`, `offers`, `price_history`, `offer_reviews`, campos internos de `publications`, `app_settings`.
- **Pedidos:** `orders`/`order_items` sem INSERT direto de anon — apenas pela função serverless (`service_role`).
- **Admin:** políticas RLS atreladas ao único usuário admin.
- **Auth:** apenas administrativo (Supabase Auth).

## 8. Supabase Storage

- **Bucket público:** imagem definitiva exibida ao morador (imprescindível para o produto público).
- **Bucket privado:** imagens/insumos de curadoria interna e ofertas coletadas.
- A imagem apresentada ao morador nunca revela a origem externa.

## 9. Funções serverless — contratos

### 9.1. `POST /api/orders`

Criação de pedido. Regras server-side obrigatórias:

1. Rate limiting: verificar `rate_guard` (janela deslizante por IP).
2. Validar entradas: pet, bloco, unidade, itens e `client_order_token`.
3. Idempotência: `client_order_token` único; re-submissão retorna o pedido existente.
4. Precificação server-side: recálculo a partir das **publications vigentes**; total do cliente ignorado.
5. Inserção transacional de `orders` (status `CRIADO`) + `order_items` (com snapshot de nome/preço).
6. Gerar `order_token` por pedido e montar a mensagem padrão do WhatsApp.

Resposta: `{ order_id, order_token, wa_url }`.

### 9.2. `POST /api/orders/:id/status`

Transição pública restrita: somente `CRIADO → ENCAMINHADO_WHATSAPP`, exigindo `order_token` válido e estado atual `CRIADO`. Demais transições são exclusivas do admin autenticado.

### 9.3. Ingestão do Collector

Função protegida por **token de ingestão**; valida o token e escreve ofertas com `service_role` server-side.

## 10. Fluxo de pedidos

```text
QRCode → PWA
→ anon+RLS lê public_catalog
→ carrinho local persistido (Zustand)
→ checkout: gera client_order_token + pet + bloco + unidade (validação de formato)
→ POST /api/orders
   1. rate_guard (janela deslizante por IP)
   2. valida entradas e idempotência (client_order_token único)
   3. recalcula preços e total a partir das publications vigentes
   4. INSERT orders (CRIADO) + order_items (snapshot), transacional
   5. gera order_token + monta mensagem padrão
   6. retorna { order_id, order_token, wa_url }
→ abre wa_url
→ best-effort: POST /api/orders/:id/status (CRIADO → ENCAMINHADO_WHATSAPP)
→ falha na abertura: retry reabre wa_url sem recriar pedido; pedido permanece CRIADO e visível ao admin
→ atendimento humano fora da plataforma
→ admin atualiza status manualmente
```

## 11. WhatsApp

- Apenas `https://wa.me/{numero}?text={mensagem_codificada}`.
- Sem API oficial, webhook, chatbot, leitura/sincronização de mensagens, confirmação automática ou pagamento.
- Abrir o WhatsApp **não significa** confirmação do pedido.
- Mensagem padrão aprovada contém condomínio, id do pedido, itens, quantidades e total.

## 12. Collector

- Execução inicial manual no notebook do responsável.
- Python + Browser Harness + Chromium (Gates 07+).
- Envia ofertas por **função de ingestão protegida por token**.
- `service_role` permanece exclusivamente server-side: **nunca no notebook, nunca no cliente**.
- Nunca publica automaticamente; curadoria humana no Dashboard.

## 13. Segurança

- `service_role` somente server-side.
- `anon` público limitado ao catálogo publicado.
- RLS como defesa em profundidade.
- Idempotência de pedido (`client_order_token`).
- Transição de status pública restrita (`order_token`, apenas `CRIADO → ENCAMINHADO_WHATSAPP`).
- Rate limiting por IP via `rate_guard`; reforços adicionais no GATE-12.
- Validação de entradas server-side.
- Markup 30%: `preço público = custo × 1,30`, `pricing_type=markup`.
- Retenção/privacidade dos dados de entrega: definida no GATE-03/GATE-12; default manter histórico operacional sem dados além da entrega.

## 14. Modelo conceitual de dados

Definição conceitual; criação em SQL no GATE-03.

| Entidade | Finalidade | Principais campos | Público/Interno |
|---|---|---|---|
| categories | Categorias administráveis | id, name, slug, parent_id, active, sort_order | Público (ativas) |
| products | Produto canônico | id, name, description, brand, category_id, image_url, active | Público (publicados) |
| sources | Lojas de origem | id, name, base_url, active | Interno |
| offers | Oportunidades coletadas | id, product_id, source_id, source_url, preços, availability, status | Interno |
| price_history | Histórico de preço/disponibilidade | id, product_id, source_id, price, availability, collected_at | Interno (GATE-03) |
| offer_reviews | Curadoria humana | id, offer_id, admin_user_id, status, notes, reviewed_at | Interno |
| publications | Visibilidade pública e preço | id, offer_id, product_id, sale_price, pricing_type, pricing_value, datetimes, status | Interno/parte pública via view |
| orders | Pedidos | id, nome_pet, bloco, numero_unidade, total, status, client_order_token, order_token, timestamps | Criação via API |
| order_items | Itens do pedido | id, order_id, product_id, quantidade, preco_unitario, subtotal, product_name_snapshot | Criação via API |
| app_settings | Configuração do condomínio | id, condominio_nome, whatsapp_number, timestamps | Interno |
| rate_guard | Controle de abuso | id, client_ip, window_start, request_count, created_at | Interno |

Estados de pedido: `CRIADO`, `ENCAMINHADO_WHATSAPP`, `EM_ATENDIMENTO`, `CONFIRMADO`, `CONCLUIDO`, `CANCELADO`.
Estados de oferta: `pending`, `approved`, `published`, `rejected`, `expired`, `unavailable`.

## 15. Estrutura de diretórios

```text
pet-em-casa/
├── frontend/            # React+Vite PWA (público + admin lazy)
│   ├── src/public/      # Home, catálogo, checkout
│   └── src/admin/       # Dashboard protegido
├── api/                 # Vercel Functions (Node/TS)
│   └── _shared/         # validação, preço, mensagem WhatsApp
├── supabase/
│   └── migrations/      # GATE-03+
├── collector/           # Python (Gates 07+)
├── scripts/
└── docs/                # + docs/gates/ + docs/ADRS/
```

## 16. Decisões e trade-offs

- **Fastify descartado:** adotar 1–3 funções serverless reduz framework, bundle, custo e manutenção sem perder segurança. Ver ADR-001.
- **TanStack Query descartado:** poucas leituras públicas; Service Worker cobre cache/refetch. Trade-off aceito; reavaliar sob demanda.
- **Zustand + persist mantido:** estado compartilhado e persistência do carrinho com dependência mínima.
- **Aplicação única:** um projeto Vercel para público e `/admin`; deploy e manutenção únicos.
- **RLS como fronteira pública:** o frontend público acessa somente o catálogo publicado; tudo o que é sensível permanece interno.
- **`service_role` centralizado:** pedido e ingestão passam por funções serverless, evitando credenciais privilegiadas fora do servidor.

## 17. Referências

- `docs/gates/GATE-02-PLANO-ARQUITETURA.md` — plano aprovado do Gate.
- `docs/ADRS/ADR-001-fastify.md` — decisão sobre Fastify.
- `docs/gates/GATE-02-ARCHITECTURE.md` — evidências do Gate.
- `docs/gates/GATE-01-BOOTSTRAP.md` — Gate anterior.
- `docs/PET_EM_CASA_BUILD.md` — registro de Build.
- `docs/PET_EM_CASA_GERAL.md` — documento mestre.