# GATE-03 - Modelo de dados Supabase

**Status:** VALIDATED

**Data:** 01/09/2026

**Gate anterior:** GATE-02 VALIDATED

**Escopo executado:** schema PostgreSQL, migrations, integridade referencial, RLS, permissoes e view publica do catalogo.

## Resultado

O modelo de dados do MVP foi aplicado ao projeto Supabase `duftidhgewsxsplahmsp` por duas migrations versionadas:

1. `20260901130000_initial_schema.sql`
2. `20260901130100_rls_and_public_catalog.sql`

## Estrutura criada

- `categories`, `products`, `sources`, `offers`, `price_history`, `offer_reviews` e `publications`;
- `orders` e `order_items`, com tokens unicos e subtotal calculado pelo banco;
- `app_settings`, limitado a um registro do condominio;
- `rate_guard`, para suporte ao rate limiting do GATE-04;
- UUIDs, timestamps, checks de valores e estados, chaves estrangeiras, indices e triggers de atualizacao.

## Seguranca criada

- RLS habilitado em todas as tabelas do schema publico.
- Nenhum `insert`, `update` ou `delete` anonimo direto e nenhum acesso anonimo a pedidos ou dados internos.
- Categorias ativas e catalogo publicado sao as unicas leituras anonimas previstas.
- A view `public_catalog` usa `security_invoker = true` e retorna somente nome, descricao, marca, categoria, imagem final, preco e disponibilidade.
- Origem, URL externa, preco de aquisicao, markup, curadoria, tokens e pedidos permanecem inacessiveis ao catalogo publico.
- O acesso administrativo esta condicionado a `app_settings.admin_user_id`, via funcao interna `private.is_admin()`.

## Validacoes executadas

| Verificacao | Resultado |
|---|---|
| Previa de migrations antes da aplicacao | OK - duas migrations identificadas |
| Aplicacao remota via `supabase db push` | OK |
| Lint remoto via `supabase db lint --linked --fail-on error` | OK - nenhum erro de schema |
| Historico local/remoto via `supabase migration list` | OK - duas migrations sincronizadas |
| Exposicao de dados de negocio | Nenhum dado inserido |

Uma exportacao detalhada do schema via `supabase db dump` nao foi usada porque a CLI exige Docker Desktop para essa operacao neste computador. Isso nao bloqueou a aplicacao, o lint remoto ou a sincronizacao das migrations. Docker permanece fora do escopo do MVP neste momento.

## Fora do escopo preservado

- Endpoints e regras server-side de pedidos: GATE-04.
- Variaveis do frontend, chave publicavel e acesso real do catalogo: GATE-04/GATE-05.
- Criacao do administrador no Supabase Auth e telas administrativas: GATE-06.
- Storage e imagens: Gate posterior aplicavel.
- Collector e ingestao: GATE-07 e GATE-08.
- Reforcos de seguranca, testes de fluxo e retencao: GATE-12.
