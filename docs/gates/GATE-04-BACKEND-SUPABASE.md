# GATE-04 - Backend + Supabase

**Status:** VALIDATED

**Data:** 26/10/2026

**Gate anterior:** GATE-03 VALIDATED

**Escopo executado:** camada de API (funções serverless na Vercel) para criação de pedidos, transição de status e ingestão do Collector, integrando com o Supabase provisionado no GATE-03.

## Resultado

Implementadas 3 funções serverless e 4 módulos compartilhados em `api/`, utilizando TypeScript e o cliente Supabase com `service_role` exclusivamente server-side.

### Arquivos criados

```
api/
├── _shared/
│   ├── supabase.ts       # Cliente Supabase (service_role, server-side apenas)
│   ├── validation.ts     # Validação de entradas com Zod
│   ├── pricing.ts        # Precificação server-side (markup 30%)
│   ├── whatsapp.ts       # Montagem da mensagem padrão do WhatsApp
│   └── rate-limit.ts     # Rate limiting por IP via tabela rate_guard
├── orders/
│   ├── index.ts          # POST /api/orders - criação de pedido
│   └── [id]/
│       └── status.ts     # POST /api/orders/:id/status - transição pública restrita
└── ingest.ts             # POST /api/ingest - ingestão do Collector
```

### Arquivos de configuração

- `vercel.json` — configuração de build das funções serverless na Vercel
- `.env.local` — variáveis de ambiente locais (não versionado)
- `tsconfig.api.json` — configuração TypeScript para a camada de API

### Dependências instaladas

- `@supabase/supabase-js` — cliente Supabase
- `zod` — validação de entradas
- `typescript` — compilador TypeScript (raiz)
- `@types/node` — tipos do Node.js
- `tsx` — execução de TypeScript para testes

## Contratos da API implementados

### POST /api/orders

Criação de pedido com as seguintes regras server-side:

1. Rate limiting via `rate_guard` (janela deslizante por IP, limite 10 req/min)
2. Validação de entradas (pet_name, block, unit_number, items, client_order_token)
3. Idempotência: `client_order_token` único evita duplicação
4. Precificação server-side: preços recalculados a partir das `publications` vigentes (total do cliente ignorado)
5. Inserção transacional: `orders` (status `CRIADO`) + `order_items` (snapshot de nome e preço)
6. Geração de `order_token` por pedido
7. Montagem da mensagem padrão do WhatsApp e retorno de `wa_url`

Resposta de sucesso: `{ order_id, order_token, wa_url }`

### POST /api/orders/:id/status

Transição pública restrita `CRIADO → ENCAMINHADO_WHATSAPP`:

- Exige `order_token` válido no body
- Exige que o pedido esteja em estado `CRIADO`
- Demais transições são exclusivas do admin autenticado (GATE-06)

### POST /api/ingest

Ingestão do Collector:

- Protegida por token de ingestão (header `Authorization: Bearer <token>`)
- Escreve ofertas na tabela `offers` com `service_role` server-side
- Retorna contagem de inserções e erros

## Segurança

- `service_role` somente server-side (apenas em `api/_shared/supabase.ts`)
- `anon` não tem acesso direto a `orders`/`order_items` (RLS bloqueado no GATE-03)
- Idempotência de pedido via `client_order_token`
- Transição pública restrita apenas `CRIADO → ENCAMINHADO_WHATSAPP` via `order_token`
- Rate limiting mínimo por IP via `rate_guard`
- Validação de entradas server-side com Zod
- Markup 30% aplicado server-side (`pricing_type=markup`)
- Nenhum segredo no frontend nem em arquivos versionados (`.env.local` não versionado)

## Validações executadas

| Verificação | Resultado |
|---|---|
| TypeScript compila sem erros (`tsc --noEmit`) | OK |
| Build do frontend (`npm run build` no frontend/) | OK - 40 módulos, JS ~161 kB / gzip ~50 kB |
| Bootstrap check (`npm run check:bootstrap`) | OK |
| Validação de pedido válido | PASS |
| Rejeição de token UUID inválido | PASS |
| Rejeição de pet_name vazio | PASS |
| Rejeição de items vazio | PASS |
| Rejeição de quantidade zero | PASS |
| Aceitação de status de ordem válido | PASS |
| Rejeição de token de status inválido | PASS |
| Rejeição de bloco com >30 caracteres | PASS |
| Aceitação de múltiplos itens | PASS |
| `service_role` não exposto no frontend | OK (apenas em `api/_shared/supabase.ts`) |
| `.env.example` mantém placeholders vazios | OK |
| `.env.local` não versionado (`.gitignore`) | OK |

## Testes técnicos

Executados 9 testes de validação via `scripts/test-validation.mts` — todos aprovados.

Testes end-to-end contra o Supabase real dependem de credenciais válidas (`SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`, `WHATSAPP_NUMBER`, `CONDOMINIO_NOME`, `COLLECTOR_INGESTION_TOKEN`) configuradas em `.env.local` ou na Vercel.

## Fora do escopo preservado

- Frontend real com integração Supabase: GATE-05
- Criação do administrador no Supabase Auth e telas administrativas: GATE-06
- Storage e imagens: Gate posterior
- Collector (Python + Browser Harness + Chromium): GATE-07 e GATE-08
- Reforços de segurança (WAF, rate limiting avançado): GATE-12

## Próximo gate

GATE-05 — Frontend (implementar Home Mobile, catálogo, carrinho, checkout com integração real ao Supabase via `anon` + RLS).