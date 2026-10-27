# Plano: Remoção do Supabase e Migração para Armazenamento JSON

**Status:** PLAN  
**Data:** 27/10/2026  
**Objetivo:** Remover a dependência do Supabase do MVP, substituindo pelo armazenamento em arquivos JSON locais, mantendo a arquitetura preparada para migração fácil para um banco real após validação do MVP.

---

## 1. Motivação

- **Custo inicial zero:** não contratar Supabase até validar o MVP.
- **Validação ágil:** dados persistidos localmente em arquivos JSON.
- **Migração preparada:** abstrair a camada de dados por trás de uma interface, permitindo troca futura por Supabase ou outro banco com mínima alteração.

## 2. Decisão Arquitetonal

| Aspecto | Antes (Supabase) | Depois (JSON) |
|---|---|---|
| Banco | Supabase/PostgreSQL | Arquivos JSON em `data/` |
| Leitura pública | `supabase-js` (anon + RLS) | API REST (`/api/catalog`) |
| Escrita de pedidos | Função serverless + Supabase | Função serverless + JSON |
| Autenticação admin | Supabase Auth | Token de sessão server-side |
| Rate limiting | Tabela `rate_guard` no Supabase | Arquivo `rate_guard.json` |
| Segurança | RLS + `service_role` server-side | API + validação server-side |

> **Nota crítica sobre Vercel:** Funções serverless da Vercel têm *filesystem* efêmero (apenas `/tmp`, com 500MB e reset periódico). Armazenamento JSON **funcionará localmente para desenvolvimento e testes**, mas **não persistirá em produção na Vercel**. A migração para um banco real é necessária antes de qualquer deploy. Este plano mantém a abstração para essa transição.

## 3. Nova Arquitetura

```text
                    VERCEL (local/dev)
         ┌───────────────────────────────┐
         │  PWA (React/Vite)             │
         │   ├── público (/)             │
         │   └── admin (/admin)          │
         │                               │
         │  API REST (Node/TS)           │
         │   ├── DataStore (interface)   │
         │   ├── JsonDataStore (impl)    │
         │   └── rotas REST              │
         └──────────┬────────────────────┘
                    │
                    ▼
              data/*.json
```

```text
                    VERCEL (produção futura)
         ┌───────────────────────────────┐
         │  PWA (React/Vite)             │
         │  API REST (Node/TS)           │
         │   ├── DataStore (interface)   │
         │   └── SupabaseDataStore       │
         └──────────┬────────────────────┘
                    │
                    ▼
                  SUPABASE
```

### 3.1. Camada de Dados Abstrata (DataStore)

Criar uma interface `DataStore` em `api/_shared/datastore/interface.ts` que abstrai todas as operações de dados:

```typescript
interface DataStore {
  // Categorias
  categories: { list(): Promise<Category[]>; create(c: CategoryInput): Promise<Category> }
  // Produtos
  products: { list(): Promise<Product[]>; get(id): Promise<Product|null> }
  // Ofertas
  offers: { list(status?): Promise<Offer[]>; create(o: OfferInput): Promise<Offer> }
  // Publicações
  publications: { list(): Promise<Publication[]>; get(productId): Promise<Publication|null> }
  // Pedidos
  orders: { create(o: OrderInput): Promise<Order>; getByToken(token): Promise<Order|null>; updateStatus(id, status, token): Promise<void> }
  // Configurações
  settings: { get(): Promise<AppSettings> }
  // Rate limiting
  rateGuard: { check(ip): Promise<{ allowed: boolean }> }
  // Autenticação
  auth: { validateSession(token): Promise<boolean> }
}
```

Implementações:
- `api/_shared/datastore/JsonDataStore.ts` — lê/escreve arquivos JSON
- `api/_shared/datastore/SupabaseDataStore.ts` — futura implementação Supabase (esqueleto)

### 3.2. Arquivos JSON

Estrutura em `data/` (gitignored em produção, committed como seed/fixture para dev):

```text
data/
├── categories.json
├── products.json
├── sources.json
├── offers.json
├── publications.json
├── publications_products.json   (relacionamento offer→product)
├── orders.json
├── order_items.json
├── app_settings.json
└── rate_guard.json
```

Cada arquivo contém um array de objetos seguindo o mesmo esquema das migrations Supabase.

## 4. Mudanças Necessárias

### 4.1. Backend (`api/`)

| Arquivo | Ação |
|---|---|
| `api/_shared/supabase.ts` | **Remover** — substituído por `datastore/` |
| `api/_shared/datastore/interface.ts` | **Criar** — interface abstrata |
| `api/_shared/datastore/JsonDataStore.ts` | **Criar** — implementação JSON |
| `api/_shared/datastore/index.ts` | **Criar** — factory que seleciona implementação |
| `api/_shared/pricing.ts` | **Atualizar** — usar DataStore ao invés de Supabase |
| `api/_shared/whatsapp.ts` | **Atualizar** — usar DataStore |
| `api/_shared/rate-limit.ts` | **Atualizar** — usar JSON |
| `api/_shared/validation.ts` | Manter (Zod) |
| `api/orders/index.ts` | **Atualizar** — usar DataStore |
| `api/orders/[id]/status.ts` | **Atualizar** — usar DataStore |
| `api/ingest.ts` | **Atualizar** — usar DataStore |

#### Novos endpoints admin (substituem `supabase.from()` direto):

O frontend admin atualmente chama o Supabase diretamente. Com a remoção, precisamos de endpoints REST:

```text
GET  /api/admin/categories        → lista categorias
POST /api/admin/categories        → cria categoria
PATCH /api/admin/categories/:id   → atualiza (toggle active, edit)
GET  /api/admin/products          → lista produtos
POST /api/admin/products          → cria/edita produto
GET  /api/admin/offers            → lista ofertas (com status/pending)
PATCH /api/admin/offers/:id       → atualiza status da oferta
GET  /api/admin/publications      → lista publicações
POST /api/admin/publications      → cria/atualiza publicação
GET  /api/admin/orders            → lista pedidos
PATCH /api/admin/orders/:id       → atualiza status do pedido (admin)
GET  /api/admin/settings          → obtém configurações
PATCH /api/admin/settings         → atualiza configurações
POST /api/admin/auth/login        → autentica admin (token-based)
GET  /api/admin/auth/validate     → valida sessão
```

### 4.2. Frontend (`frontend/`)

| Arquivo | Ação |
|---|---|
| `frontend/src/lib/supabase.ts` | **Remover** — substituído por `api-client.ts` |
| `frontend/src/lib/api-client.ts` | **Criar** — cliente REST com fetch |
| `frontend/src/components/Offers.tsx` | **Atualizar** — usar `/api/catalog` |
| `frontend/src/pages/Catalog.tsx` | **Atualizar** — usar `/api/catalog` |
| `frontend/src/pages/ProductDetail.tsx` | **Atualizar** — usar `/api/catalog/:id` |
| `frontend/src/pages/OrderSuccess.tsx` | **Atualizar** — usar API para status |
| `frontend/src/pages/admin/AdminDashboard.tsx` | **Atualizar** — usar `/api/admin/*` |
| `frontend/src/pages/admin/AdminOfertas.tsx` | **Atualizar** — usar `/api/admin/offers` |
| `frontend/src/pages/admin/AdminProdutos.tsx` | **Atualizar** — usar `/api/admin/products` |
| `frontend/src/pages/admin/AdminCategorias.tsx` | **Atualizar** — usar `/api/admin/categories` |
| `frontend/src/pages/admin/AdminPedidos.tsx` | **Atualizar** — usar `/api/admin/orders` |
| `frontend/src/pages/admin/AdminPublicados.tsx` | **Atualizar** — usar `/api/admin/publications` |
| `frontend/src/pages/admin/AdminConfiguracoes.tsx` | **Atualizar** — usar `/api/admin/settings` |
| `frontend/src/context/AuthContext.tsx` | **Atualizar** — token-based, não Supabase Auth |
| `frontend/package.json` | **Atualizar** — remover `@supabase/supabase-js` |
| `frontend/src/components/ProtectedRoute.tsx` | Manter (verifica token) |
| `frontend/vite.config.ts` | Manter |
| `vercel.json` | **Atualizar** — remover vars do Supabase |

### 4.3. Backend raiz (`/`)

| Arquivo | Ação |
|---|---|
| `package.json` | Remover `@supabase/supabase-js` da raiz |
| `.env.example` | Substituir vars do Supabase por `ADMIN_TOKEN`, `JSON_DATA_PATH` |

### 4.4. Migrações e documentos

| Arquivo | Ação |
|---|---|
| `supabase/migrations/*.sql` | Arquivar em `supabase/migrations/` como referência histórica |
| `docs/ARCHITECTURE.md` | **Atualizar** — refletir nova arquitetura sem Supabase |
| `docs/PET_EM_CASA_GERAL.md` | **Atualizar** — STACK sem Supabase como banco; JSON como banco do MVP |
| `docs/gates/GATE-03-MODELO-SUPABASE.md` | Marcar como **ARQUIVADO** (substituído) |
| `docs/gates/GATE-04-BACKEND-SUPABASE.md` | Marcar como **ARQUIVADO** (substituído) |
| `docs/ADRS/ADR-001-fastify.md` | Mantido (decisão independente do Supabase) |

## 5. Estratégia de Abstração (DataStore)

O padrão **Strategy** garante que a troca do JSON pelo Supabase futuro seja trivial:

```typescript
// api/_shared/datastore/index.ts
import { JsonDataStore } from './JsonDataStore'
import { SupabaseDataStore } from './SupabaseDataStore'

const impl = process.env.NODE_ENV === 'development'
  ? new JsonDataStore(process.env.JSON_DATA_PATH)
  : new SupabaseDataStore(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY)

export default impl
```

Todas as funções serverless e módulos compartilhados recebem `DataStore` via importação, nunca instanciam a implementação concreta.

## 6. Segurança

Com a remoção do Supabase:

| Preocupação | Solução |
|---|---|
| `service_role` exposto | Não aplicável — não há mais Supabase no dev |
| Auth admin | Token estático em env (`ADMIN_TOKEN`), validado server-side |
| Rate limiting | Arquivo `rate_guard.json` com janela deslizante por IP |
| Dados internos expostos | API REST controla quais campos são retornados |
| CORS | Configurado no `vercel.json` / funções |

> **No MVP de validação**, a autenticação admin será um token estático definido em `.env.local`. A migração para Supabase Auth será parte do plano de migração.

## 7. Plano de Migração para Supabase (futuro)

1. Criar `SupabaseDataStore.ts` implementando a mesma interface
2. Alterar `datastore/index.ts` para selecionar a implementação
3. Configurar variáveis de ambiente Supabase
4. Ajustar `vercel.json` para incluir as vars
5. O frontend já usará a mesma API REST — **nenhuma mudança no frontend necessária**

## 8. Fases de Implementação

### Fase 1: Infraestrutura de Dados (1-2 dias)
1. Criar interface `DataStore` em `api/_shared/datastore/interface.ts`
2. Criar `JsonDataStore.ts` com leitura/escrita de arquivos JSON
3. Criar arquivos JSON seed em `data/`
4. Criar `datastore/index.ts` como factory

### Fase 2: API Layer (2-3 dias)
1. Atualizar `api/_shared/pricing.ts`, `whatsapp.ts`, `rate-limit.ts`
2. Atualizar `api/orders/index.ts`, `api/orders/[id]/status.ts`, `api/ingest.ts`
3. Criar novos endpoints admin (`/api/admin/*`)
4. Criar `/api/admin/auth/login` e `/api/admin/auth/validate`
5. Criar `/api/catalog` e `/api/catalog/:id` para leitura pública

### Fase 3: Frontend Público (1-2 dias)
1. Criar `frontend/src/lib/api-client.ts`
2. Remover `frontend/src/lib/supabase.ts`
3. Atualizar `Offers.tsx`, `Catalog.tsx`, `ProductDetail.tsx`, `OrderForm.tsx`, `OrderSuccess.tsx`

### Fase 4: Frontend Admin (2 dias)
1. Atualizar `AuthContext.tsx` para token-based
2. Atualizar todas as páginas admin para usar API REST
3. Ajustar `ProtectedRoute.tsx` se necessário

### Fase 5: Configurações e Deploy (1 dia)
1. Atualizar `package.json` (raiz + frontend) — remover Supabase deps
2. Atualizar `.env.example`
3. Atualizar `vercel.json`
4. Atualizar documentação

### Fase 6: Validação (1 dia)
1. Rodar build do frontend
2. Rodar type-check da API (`tsc --noEmit`)
3. Rodar testes de validação (`scripts/test-validation.mts`)
4. Testar fluxo completo localmente

## 9. Riscos e Mitigações

| Risco | Mitigação |
|---|---|
| Vercel não persiste JSON | Preparar fallback/Supabase para prod; documentar claramente |
| JSON file lock (concorrência) | Usar operações atômicas (read-modify-write com lock simples) |
| Frontend precisa de todos os endpoints admin | Listar todos os `supabase.from()` na fase de planejamento |
| Regressão no fluxo de pedido | Manter testes existentes + novos testes |

## 10. Arquivos de Referência — Mapeamento Supabase → JSON

### categories.json
```json
[{"id":"...","name":"Rações","slug":"racoes","active":true,"sort_order":0,"created_at":"...","updated_at":"..."}]
```

### products.json
```json
[{"id":"...","name":"Ração Premium","description":"...","brand":"...","category_id":"...","public_image_url":"...","active":true,...}]
```

### offers.json
```json
[{"id":"...","product_id":"...","source_id":"...","source_url":"...","collected_price":10.00,...}]
```

### publications.json
```json
[{"id":"...","offer_id":"...","product_id":"...","sale_price":13.00,"pricing_type":"markup","pricing_value":30,"status":"published",...}]
```

### orders.json
```json
[{"id":"...","pet_name":"Rex","block":"A","unit_number":"101","total":26.00,"status":"CRIADO","client_order_token":"...","order_token":"...",...}]
```

### order_items.json
```json
[{"id":"...","order_id":"...","product_id":"...","quantity":2,"unit_price":13.00,"subtotal":26.00,"product_name_snapshot":"Ração Premium",...}]
```

### app_settings.json
```json
[{"id":1,"condominium_name":"Condomínio Pet em Casa","whatsapp_number":"5511999999999","admin_user_id":null,...}]
```

### rate_guard.json
```json
[{"id":"...","client_ip":"0.0.0.0","window_start":"...","request_count":1,...}]
```

---

**Próximo passo:** Aprovação deste plano para execução em BUILD. As mudanças tocam nos Gates 03 e 04 (supersedidos) e influenciam GATE-05 (Frontend) e GATE-06 (Dashboard).
