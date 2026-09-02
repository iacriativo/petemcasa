# GATE-03 — Plano técnico: modelo de dados do Supabase

**Status:** PLAN — aguardando aprovação

**Gate anterior:** GATE-02 validado

**Escopo:** schema PostgreSQL, migrations, RLS, permissões, view pública e validação estrutural. Não inclui API, frontend, Dashboard, Auth de usuário, Storage, Collector ou Vercel.

## 1. Objetivo

Criar uma base de dados relacional, segura e pequena para o MVP. Ela deve suportar catálogo público sem origem externa, curadoria administrativa, pedidos registrados antes do WhatsApp e evolução posterior do Collector.

## 2. Decisões propostas

- IDs: UUID gerados pelo banco.
- Datas: `timestamptz`, sempre em UTC.
- Valores monetários: `numeric(12,2)`; nunca `float`.
- Estados: `text` com `check constraint`, para permitir evolução simples por migration.
- Exclusão: categorias, produtos, fontes e publicações serão desativados/retirados de publicação; não haverá exclusão física como operação usual.
- `offers.product_id` será opcional até a curadoria criar ou associar o produto canônico. Assim, o Collector pode registrar uma oportunidade sem publicar ou expor qualquer dado.
- `publications` terá uma publicação operacional por oferta. Uma retirada muda seu estado para `unpublished`; uma republicação atualiza o mesmo registro e preserva os carimbos de data.
- O único administrador será definido por `app_settings.admin_user_id`, após a criação manual do usuário no Supabase Auth. Não será criado cadastro administrativo público.
- A retenção de dados de pedidos ficará limitada ao histórico operacional. Prazo de retenção e procedimento de descarte serão decididos no GATE-12.

## 3. Estrutura proposta

| Tabela | Finalidade | Acesso público |
|---|---|---|
| `categories` | Categorias e subcategorias administráveis | Leitura somente das ativas |
| `products` | Produto canônico, com conteúdo e imagem final | Somente pela view do catálogo |
| `sources` | Lojas de origem | Nunca |
| `offers` | Oportunidades coletadas e dados de compra | Nunca |
| `price_history` | Histórico interno de preço/disponibilidade | Nunca |
| `offer_reviews` | Decisões de curadoria | Nunca |
| `publications` | Preço, vigência e visibilidade comercial | Somente pela view do catálogo |
| `orders` | Pedido do morador | Nunca diretamente |
| `order_items` | Itens e snapshots do pedido | Nunca diretamente |
| `app_settings` | Configuração única do condomínio e do admin | Nunca |
| `rate_guard` | Controle temporário de abuso por IP | Nunca |

### 3.1 Campos e relações essenciais

```text
categories
  id, name, slug, parent_id?, active, sort_order, created_at, updated_at

products
  id, name, description, brand?, category_id?, public_image_url?, active,
  created_at, updated_at

sources
  id, name, base_url, active, created_at, updated_at

offers
  id, product_id?, source_id, source_url, collected_price, original_price?,
  promotion_data?, availability, status, collected_at, last_verified_at?,
  expires_at?, created_at, updated_at

price_history
  id, offer_id, observed_price, original_price?, availability, collected_at

offer_reviews
  id, offer_id, admin_user_id, status, notes?, reviewed_at, created_at

publications
  id, offer_id, product_id, sale_price, pricing_type, pricing_value,
  status, published_at?, unpublished_at?, created_at, updated_at

orders
  id, pet_name, block, unit_number, total, status, client_order_token,
  order_token, whatsapp_sent_at?, created_at, updated_at

order_items
  id, order_id, product_id, quantity, unit_price, subtotal,
  product_name_snapshot, created_at

app_settings
  id (= 1), condominium_name, whatsapp_number, admin_user_id?,
  created_at, updated_at

rate_guard
  id, client_ip, window_start, request_count, created_at, updated_at
```

Relações principais:

```text
category ──< product ──< order_item >── order
source ──< offer ──< price_history
offer ──< offer_review
offer ──1 publication >── product
```

## 4. Regras de integridade propostas

- `categories.slug` único; `parent_id` aponta para outra categoria e não pode apontar para si mesma.
- `sources.name` único.
- Preços, quantidades e totais devem ser positivos; `subtotal = quantity × unit_price` será gravado pela futura API e protegido por validação de banco.
- `client_order_token` e `order_token` serão únicos. O primeiro evita duplicidade de pedido; o segundo restringe a futura atualização pública para `CRIADO → ENCAMINHADO_WHATSAPP`.
- `order_items` usa snapshots de nome e preço para preservar o pedido mesmo se o catálogo mudar.
- `publications.offer_id` será único, `sale_price` positivo e `pricing_type` aceitará `markup` ou `manual`. O valor padrão do markup é 30%.
- Um único registro em `app_settings` será garantido por chave fixa `id = 1`.
- Índices serão criados apenas para chaves estrangeiras, busca de catálogo e consultas operacionais: slug, status/vigência de publicação, status/data de pedido, `client_order_token`, `order_token` e janela do `rate_guard`.

### Estados

```text
offers:       pending | approved | published | rejected | expired | unavailable
publications: draft | published | unpublished
orders:       CRIADO | ENCAMINHADO_WHATSAPP | EM_ATENDIMENTO |
              CONFIRMADO | CONCLUIDO | CANCELADO
```

As transições de negócio serão aplicadas pela API no GATE-04 e pelo Dashboard no GATE-06; neste Gate o banco garante apenas valores válidos e relações consistentes.

## 5. Separação entre dados públicos e internos

Será criada a view `public_catalog`, contendo somente:

- identificação do produto e da publicação;
- nome, descrição, marca, categoria, imagem final, preço de venda e disponibilidade pública.

Ela nunca conterá loja, URL de origem, preço de aquisição, regra de preço, notas de curadoria, tokens ou dados de pedidos.

O catálogo exibirá apenas produtos ativos, em categoria ativa, vinculados a publicação com status `published` e dentro da vigência. A view usará `security_invoker = true` quando aplicada, e as permissões diretas em tabelas internas serão revogadas para `anon` e `authenticated`.

## 6. Estratégia de RLS e permissões

1. Habilitar RLS em toda tabela no schema exposto.
2. Revogar permissões padrão de `anon` e `authenticated` em tabelas internas e de pedidos.
3. Permitir a `anon` somente leitura das categorias ativas e da view `public_catalog`.
4. Não permitir `insert`, `update` ou `delete` direto de `anon` em nenhuma tabela.
5. Permitir ao administrador autenticado operações administrativas por políticas que chamam uma função interna `is_admin()`.
6. A função `is_admin()` verificará se `auth.uid()` coincide com `app_settings.admin_user_id`; ela será protegida contra acesso direto indevido.
7. `service_role` permanecerá exclusivamente nas futuras funções serverless da Vercel e ignorará RLS somente no servidor.

Essa abordagem impede que login comum se torne administrativo por padrão e mantém o frontend público sem acesso a dados sensíveis.

## 7. Migrations e validação

Após aprovação do plano e conexão segura, o BUILD do Gate executará nesta ordem:

1. Criar migration inicial com extensões necessárias, tabelas, chaves, constraints e índices.
2. Criar migration de função administrativa, RLS, revogação de permissões e view pública.
3. Adicionar testes SQL de permissão para cenários permitidos e negados.
4. Aplicar primeiro em ambiente controlado; revisar o diff antes de qualquer aplicação remota.
5. Validar estrutura, relações, constraints, catálogo público e bloqueios de acesso interno.
6. Registrar evidências em `docs/gates/GATE-03-MODELO-SUPABASE.md`.

### Critérios de aceite

- Todas as tabelas e relações previstas existem e aceitam apenas dados válidos.
- Um pedido e seus itens podem ser gravados dentro de uma transação; se um item inválido falhar, a transação inteira é desfeita.
- O catálogo anônimo retorna somente itens publicados e sem origem externa.
- Uma sessão anônima não lê tabelas internas e não cria pedidos diretamente.
- Um usuário autenticado que não seja administrador não obtém acesso administrativo.
- O administrador configurado consegue executar operações administrativas previstas por RLS.
- Não há segredos em migrations, documentação ou arquivos versionados.

## 8. Fora do escopo

- Endpoint `POST /api/orders`, montagem de WhatsApp, cálculo final de preço e rate limiting em execução: GATE-04.
- Tela de login e Dashboard: GATE-06.
- Buckets e upload de imagens: Gate posterior que utilizar Storage.
- Collector e ingestão: GATE-07 e GATE-08.
- Política definitiva de retenção e reforços de segurança: GATE-12.

## 9. Pontos para aprovação antes do BUILD

1. Manter `offers.product_id` opcional até a curadoria associar o produto.
2. Usar uma publicação operacional por oferta, com retirada/republicação registrada no mesmo item.
3. Fixar `app_settings` como registro único e usá-lo para vincular o administrador.
4. Usar os nomes de campos em inglês no banco (`pet_name`, `block`, `unit_number`) e textos da interface em português.
5. Aplicar o schema inicialmente em um projeto Supabase novo, no plano gratuito, sem dados reais.
