# PET EM CASA — PLANO DE IMPLEMENTAÇÃO DO MVP

**Status:** PLAN — aguardando aprovação
**Versão:** 1.0
**Data:** 01/09/2026
**Repositório oficial:** https://github.com/iacriativo/petemcasa.git

Este documento consolida a análise do projeto, o estado atual do repositório e o plano de implementação do MVP. Ele não autoriza a execução de nenhum Gate. A implementação deverá ocorrer somente após aprovação explícita, um Gate por vez.

## 1. Resumo executivo

O Pet em Casa será um PWA de comércio digital exclusivo para moradores de um condomínio.

Fluxo principal:

```text
QRCode
↓
Home Mobile
↓
Catálogo
↓
Carrinho
↓
Nome do Pet + Bloco + Unidade
↓
Order + OrderItems no Supabase
↓
WhatsApp externo
↓
Atendimento humano
```

Características obrigatórias do MVP:

- Morador sem conta, cadastro ou login.
- Experiência pública prioritariamente orientada a Smartphone.
- Dashboard protegido por Supabase Auth.
- Um condomínio e um administrador.
- Curadoria humana antes da publicação.
- Vercel para hospedagem da aplicação.
- Supabase/PostgreSQL como banco oficial.
- Collector executado manualmente no notebook.
- Sem pagamento integrado, frete ou automações no WhatsApp.

## 2. Estado atual do repositório

Estado Git observado durante a análise:

- Branch atual: `main`.
- Commit atual: `78fbae9 Documentos e referencias`.
- Working tree limpa.
- Branch sincronizada com `origin/main`.
- Remote oficial: `https://github.com/iacriativo/petemcasa.git`.

Arquivos existentes:

```text
AGENTS.md
docs/PET_EM_CASA_GERAL.md
docs/PET_EM_CASA_PLANO_MVP.md
docs/referencias/PET_EM_CASA_HOME_MOBILE_REFERENCIA_APROVADA.png
docs/referencias/PET_EM_CASA_DASHBOARD_MVP_REFERENCIA.png
```

Não existem atualmente frontend, Dashboard, backend, API, migrations Supabase, Collector, scripts, `.env.example`, testes ou configuração PWA.

Todos os Gates estão `PENDING`.

## 3. Análise das referências visuais

### 3.1. Home Mobile

A referência orienta:

- Fundo claro e acolhedor.
- Identidade verde associada ao bem-estar animal.
- Marca e comunicação simples no topo.
- Acesso rápido ao WhatsApp.
- Busca como ação prioritária.
- Categorias em cartões grandes e tocáveis.
- Ofertas como foco comercial.
- Adição direta ao carrinho nos cartões.
- Preço em destaque.
- Carrinho fixo e muito acessível na parte inferior.
- Pouco conteúdo institucional.
- Hierarquia clara entre buscar, selecionar, adicionar e revisar.

A implementação não deve transformar os produtos, textos, números, ícones ou quantidade de cartões da imagem em requisitos funcionais.

A referência não define uma barra de navegação inferior tradicional com múltiplas seções. A parte inferior deve priorizar exclusivamente o carrinho fixo, acessível e orientado à jornada de compra.

### 3.2. Dashboard

A referência orienta:

- Sidebar escura com navegação administrativa.
- Item atual destacado em verde.
- Cabeçalho com tela, condomínio e administrador.
- Indicadores resumidos no topo.
- Área de alertas e pendências.
- Lista de ofertas aguardando revisão.
- Tabela de pedidos recentes.
- Cards claros, bordas discretas e espaçamento amplo.
- Linguagem operacional, não promocional.
- Experiência prioritariamente Desktop, com responsividade secundária.

O Dashboard deve priorizar decisões e ações operacionais, não relatórios avançados.

## 4. O que já existe

- Documentação mestre do projeto.
- Plano de implementação inicial.
- Decisões de produto consolidadas.
- Lista oficial de Gates.
- Referência visual da Home Mobile.
- Referência visual do Dashboard.
- Repositório Git oficial configurado.

## 5. O que ainda falta

- Bootstrap do projeto.
- Definição técnica detalhada.
- Banco e migrations Supabase.
- Regras RLS.
- Camada de API/backend, com Fastify como proposta a validar.
- Autenticação administrativa.
- Catálogo público.
- Carrinho.
- Checkout operacional.
- Criação de pedidos.
- Abertura do WhatsApp.
- Dashboard.
- Curadoria de ofertas.
- Publicação de produtos.
- Categorias.
- Imagens públicas.
- Collector.
- Browser Harness e Chromium.
- Revalidação de preços e disponibilidade.
- Testes técnicos e visuais.
- Deploy na Vercel.
- Documentação de evidências dos Gates.

## 6. Arquitetura técnica proposta

### 6.1. Organização

Proposta de estrutura inicial:

```text
pet-em-casa/
├── frontend/
│   ├── React + Vite
│   ├── Home pública
│   ├── Catálogo
│   ├── Produto
│   ├── Carrinho
│   ├── Checkout
│   └── Área administrativa protegida
├── backend/
│   ├── Node.js
│   ├── TypeScript
│   ├── Camada de API
│   ├── Fastify, se aprovado no GATE-02
│   └── API para Vercel
├── collector/
│   ├── Python
│   ├── Browser Harness
│   └── integrações com lojas
├── supabase/
│   └── migrations
├── docs/
│   └── gates
├── scripts/
├── .env.example
├── .gitignore
├── README.md
└── LICENSE
```

A recomendação é manter frontend público e Dashboard no mesmo projeto React, com rotas e carregamento separados, em vez de criar duas aplicações independentes sem necessidade.

### 6.2. Implantação

```text
Usuário
↓
Vercel
├── React/Vite
└── Camada de API/backend
    (Fastify como proposta)
    ↓
Supabase
├── PostgreSQL
├── Auth
└── Storage, se aprovado
```

Fastify permanece como proposta arquitetural, mas não como decisão definitiva. No GATE-02 deverá ser validado se ele é realmente necessário para o MVP ou se existe uma solução mais simples e adequada à Vercel + Supabase.

A decisão deverá considerar simplicidade, segurança, custo, manutenção, performance, necessidade real de uma camada de backend, proteção das credenciais e regras de negócio do pedido.

### 6.3. Separação funcional

- Frontend público: somente catálogo publicado e fluxo de pedido.
- Dashboard: autenticação e operações administrativas.
- Backend: validação, regras de negócio e acesso controlado ao Supabase.
- Collector: processo independente executado manualmente no notebook.
- Supabase: fonte oficial dos dados.

## 7. Fluxo completo do morador

1. O morador acessa o QRCode.
2. O PWA abre a Home Mobile.
3. O morador pesquisa ou navega por categoria.
4. Visualiza apenas produtos publicados.
5. Consulta imagem, nome, descrição, preço e disponibilidade.
6. Adiciona produtos ao carrinho.
7. Revisa quantidades e total.
8. Informa nome do Pet, bloco e número da unidade.
9. O frontend envia o pedido para a API.
10. O backend valida os dados.
11. O backend consulta preços e disponibilidade atuais.
12. O backend calcula o total.
13. O backend cria `orders` e `order_items` atomicamente.
14. O pedido nasce com status `CRIADO`.
15. O sistema monta a mensagem aprovada.
16. O sistema abre o WhatsApp com a mensagem preenchida.
17. O pedido pode passar para `ENCAMINHADO_WHATSAPP`.
18. O atendimento humano continua fora da plataforma.

Abrir o WhatsApp não significa confirmação do pedido, pagamento ou entrega.

## 8. Fluxo administrativo

1. O administrador acessa a área administrativa.
2. O Supabase Auth valida o login.
3. O backend valida a sessão e a autorização.
4. O Dashboard apresenta pendências, publicações, pedidos recentes e itens que exigem atenção.
5. O administrador revisa uma oferta.
6. Pode editar nome, descrição, marca, categoria, imagem pública, preço e disponibilidade.
7. Define ou confirma o preço sugerido.
8. Aprova ou rejeita a oferta.
9. A oferta aprovada torna-se uma publicação pública.
10. O administrador acompanha os pedidos.
11. O administrador atualiza manualmente o status conforme o atendimento externo.

O Dashboard não terá CRM, estoque completo, logística ou BI avançado.

## 9. Modelo de dados proposto

### `categories`

Necessária porque categorias são administráveis.

```text
id
name
slug
parent_id
active
sort_order
created_at
updated_at
```

`parent_id` permite subcategorias sem criar uma estrutura adicional.

### `products`

Produto canônico e seguro para uso público.

```text
id
name
description
brand
category_id
image_url
active
created_at
updated_at
```

### `sources`

Dados internos das lojas de origem.

```text
id
name
base_url
active
created_at
updated_at
```

### `offers`

Oportunidades coletadas.

```text
id
product_id
source_id
source_url
collected_price
original_price
promotion_data
availability
status
collected_at
last_verified_at
expires_at
created_at
updated_at
```

Estados:

```text
pending
approved
published
rejected
expired
unavailable
```

### `price_history`

Histórico interno de preços e disponibilidade.

```text
id
product_id
source_id
price
availability
collected_at
```

### `offer_reviews`

Registro da curadoria humana.

```text
id
offer_id
admin_user_id
status
notes
reviewed_at
```

### `publications`

Controle da publicação pública.

```text
id
offer_id
public_product_id
sale_price
pricing_type
pricing_value
published_at
unpublished_at
status
```

A publicação deve ser a principal fonte de visibilidade pública.

### `orders`

```text
id
nome_pet
bloco
numero_unidade
total
status
created_at
updated_at
whatsapp_sent_at
```

Estados:

```text
CRIADO
ENCAMINHADO_WHATSAPP
EM_ATENDIMENTO
CONFIRMADO
CONCLUIDO
CANCELADO
```

### `order_items`

```text
id
order_id
product_id
quantidade
preco_unitario
subtotal
product_name_snapshot
created_at
```

O snapshot do nome e preço é recomendado para preservar o histórico do pedido.

### `app_settings`

Configurações do MVP:

```text
id
condominio_nome
whatsapp_number
created_at
updated_at
```

Como existe somente um condomínio e um administrador, não é necessária uma estrutura complexa de multi-tenancy.

## 10. Segurança

- `service_role` nunca chega ao frontend.
- Segredos ficam somente em variáveis de ambiente server-side.
- O frontend público não acessa tabelas internas diretamente.
- Origem, URL externa, custo e margem não aparecem na API pública.
- Rotas administrativas exigem Supabase Auth.
- Operações administrativas são autorizadas no backend.
- RLS existe como defesa adicional.
- Preço e disponibilidade são recalculados no servidor.
- O cliente não define livremente o total do pedido.
- Criação de pedido deve ser transacional.
- Nome, bloco e unidade devem ser validados.
- A API de pedidos deve possuir proteção básica contra abuso.
- Logs não devem expor dados desnecessários do morador.
- Imagens públicas e internas devem ser separadas quando houver Storage.
- Browser Harness e CDP não podem ficar expostos publicamente.

Políticas conceituais:

- Público: leitura somente de produtos publicados.
- Público: criação de pedido somente pelo fluxo controlado da API.
- Administrador: leitura e escrita de dados internos após autenticação.
- Collector: ingestão protegida e limitada a ofertas.

## 11. Estratégia PWA e Mobile

### PWA

- Manifest com nome, ícone e cores do projeto.
- Service Worker para o app shell.
- Catálogo preferencialmente com estratégia `network-first`.
- Carrinho persistido localmente.
- Checkout dependente de rede.
- Pedido offline não será permitido.
- Estados de loading, erro e vazio.
- Deploy otimizado para Vercel.

### Mobile

- Smartphone como breakpoint e prioridade principal.
- Áreas de toque confortáveis.
- Barra de carrinho fixa e acessível.
- Busca em posição superior.
- Categorias em rolagem ou grade adaptativa.
- Cards com ação direta de adicionar.
- Imagens comprimidas e responsivas.
- Respeito a safe areas.
- Teste em smartphone real após o GATE-05.
- Desktop tratado apenas como compatibilidade para a área pública.

## 12. Estratégia do Collector

Execução inicial:

```text
Notebook do responsável
↓
Python
↓
Browser Harness
↓
Chromium
↓
Loja externa
↓
Oferta estruturada
↓
Supabase
```

O Collector deverá:

- Ser executado manualmente.
- Trabalhar inicialmente com uma única loja.
- Extrair nome, marca, categoria, imagem, descrição, preços e disponibilidade.
- Registrar URL, origem e data/hora da coleta.
- Manter a origem somente no ambiente interno.
- Nunca publicar automaticamente.
- Enviar dados por endpoint protegido ou credencial server-side controlada.
- Produzir logs e evidências de execução.

JSON poderá existir apenas como fixture, exportação, importação, evidência ou dado temporário. Não será o banco oficial.

IA não faz parte do primeiro MVP.

## 13. Integração com WhatsApp sem API

O backend deverá:

1. Criar o pedido.
2. Buscar os dados persistidos.
3. Montar a mensagem padrão aprovada.
4. Retornar uma URL codificada para WhatsApp.
5. Permitir que o frontend abra a URL.

Formato conceitual:

```text
https://wa.me/{numero}?text={mensagem_codificada}
```

A mensagem deve conter condomínio, ID do pedido, itens, quantidades e total.

Não haverá API oficial, webhook, chatbot, leitura de mensagens, sincronização, confirmação automática ou pagamento via WhatsApp.

A semântica exata do momento em que o pedido passa de `CRIADO` para `ENCAMINHADO_WHATSAPP` deve ser fechada no GATE-02.

## 14. Plano detalhado por Gates

### GATE-00 — Ambiente e isolamento

Validar exclusivamente a raiz correta do projeto, Git, branch, remote, Node, npm, Python, ferramentas necessárias, permissões e isolamento do projeto.

O GATE-00 não deverá criar frontend, backend, Supabase, Collector ou qualquer estrutura de implementação.

Evidências esperadas:

- Diretório atual;
- branch e remote;
- versões das ferramentas;
- estado Git;
- limitações identificadas.

### GATE-01 — Bootstrap

Criar estrutura inicial, `README.md`, `.gitignore`, `.env.example`, configuração inicial, documentação de Gates e configuração de desenvolvimento.

Docker Compose deverá ser incluído somente como suporte de desenvolvimento, nunca como requisito de produção. Sua necessidade deve ser registrada.

Validar inicialização local, isolamento, variáveis documentadas e ausência de segredos versionados.

### GATE-02 — Arquitetura

Definir organização do frontend, Dashboard, camada de API, contratos, estados, fluxo do pedido, separação público/interno, imagens, autenticação, markup e Collector.

Avaliar se Fastify é realmente necessário para o MVP ou se uma solução mais simples atende melhor à Vercel + Supabase. A análise deverá considerar simplicidade, segurança, custo, manutenção, performance, necessidade real de uma camada de backend, proteção das credenciais e regras de negócio do pedido.

Validar as decisões e registrar qualquer escolha que ainda possa bloquear implementação.

### GATE-03 — Modelo Supabase

Criar e validar migrations, tabelas, relações, IDs, estados, categorias, ofertas, publicações, pedidos, itens e RLS.

Validar inserção atômica de pedido e itens, integridade referencial e separação entre dados internos e públicos.

### GATE-04 — Backend + Supabase

Implementar a camada de API definida no GATE-02, API pública, API administrativa, endpoint de pedido, validação, cálculo server-side, curadoria, publicação, categorias, pedidos e mensagem do WhatsApp.

Validar pedido criado antes do redirecionamento, total não confiado ao cliente, ausência de dados internos na API pública e tratamento de erros.

### GATE-05 — Frontend público

Implementar Home Mobile, busca, categorias, produtos, detalhe, imagens, descrição, preço, disponibilidade, carrinho, identificação do pedido e abertura do WhatsApp.

Validar fluxo completo do morador, responsividade, toque, persistência do carrinho e acessibilidade básica.

### Validação Mobile

Antes do GATE-06, testar em smartphone real:

- Áreas de toque;
- barra fixa do carrinho;
- teclado e formulários;
- desempenho;
- loading, erros e estados vazios.

Qualquer falha deve ser corrigida antes de avançar.

### GATE-06 — Dashboard

Implementar Supabase Auth, proteção de rotas, Dashboard, Ofertas, Produtos, Categorias, Pedidos, Publicados, Configurações, edição, aprovação, rejeição e publicação.

Validar autenticação, curadoria humana, publicação pública e invisibilidade da origem.

### GATE-07 — Browser Harness + Chromium

Validar Python, Browser Harness, Chromium, headless, CDP, navegação, screenshots, logs e tratamento de falhas.

### GATE-08 — Primeiro coletor real

Usar uma única loja para extrair nome, imagem, descrição, preço, disponibilidade, URL e origem interna.

Validar envio ao Supabase, oferta pendente no Dashboard e ausência de publicação automática.

### GATE-09 — Múltiplas fontes

Adicionar fontes progressivamente, com integrações desacopladas e validação independente.

### GATE-10 — Pipeline completo

Validar o fluxo completo:

```text
Loja
↓
Browser Harness
↓
Collector
↓
Dashboard
↓
Curadoria
↓
publications
↓
API pública
↓
Frontend Vercel
```

### GATE-11 — Revalidação

Implementar verificação de preço, disponibilidade, histórico, expiração e retirada de publicação.

### GATE-12 — Segurança

Validar variáveis de ambiente, credenciais, Auth, RLS, separação interno/público, rotas administrativas e não exposição do CDP.

### GATE-13 — Teste de carga

Executar inicialmente:

```text
3 lojas / 10 produtos
```

Depois:

```text
3 lojas / 100 produtos
```

Medir CPU, memória, disco, duração, navegadores e falhas.

### GATE-14 — MVP Validated

Validar ambiente, banco, API, frontend, Dashboard, Auth, Collector, curadoria, publicação, origem invisível, precificação, revalidação, pedido, WhatsApp e experiência Mobile.

## 15. Dependências necessárias

Dependências técnicas previstas:

- Node.js;
- TypeScript;
- React;
- Vite;
- Fastify, somente se aprovado no GATE-02;
- Cliente Supabase;
- Supabase Auth;
- Supabase CLI ou equivalente para migrations;
- Python;
- Browser Harness;
- Chromium;
- Vercel;
- Projeto Supabase.

Dependências operacionais:

- Conta Supabase;
- Conta Vercel;
- Número de WhatsApp;
- Nome do condomínio;
- Usuário administrador;
- Imagens públicas;
- Categorias iniciais;
- Acesso às fontes externas;
- Definição das condições permitidas de coleta.

## 16. Riscos

- Necessidade real de uma camada de backend e escolha entre Fastify ou uma solução mais simples para Vercel + Supabase.
- Imagens externas inadequadas ou sem licença de uso.
- Mudanças no HTML das lojas.
- Bloqueios, CAPTCHA ou restrições das fontes externas.
- Preço ou disponibilidade mudarem após a coleta.
- Abuso do endpoint público de pedidos.
- Bloqueio da abertura do WhatsApp pelo navegador.
- PWA apresentar catálogo desatualizado.
- Vazamento acidental de origem ou custo.
- RLS configurado incorretamente.
- Ambiguidade entre markup e margem.
- Falta de política para expiração de ofertas.
- Ausência de teste em smartphone real.
- Collector exigir ambiente diferente do previsto.

## 17. Decisões posteriores

Não há dúvida bloqueando o planejamento. As decisões abaixo devem ser fechadas nos Gates correspondentes:

1. Organização final: um app React com Dashboard interno ou aplicações separadas.
2. Necessidade do Fastify ou adoção de uma solução mais simples para Vercel + Supabase, considerando simplicidade, segurança, custo, manutenção, performance, proteção das credenciais e regras de negócio do pedido.
3. Supabase Storage ou outro mecanismo para imagens.
4. Semântica de `public_product_id`.
5. Uso de `categories.parent_id` para subcategorias.
6. Confirmação formal de que os 30% significam markup.
7. Momento exato da transição para `ENCAMINHADO_WHATSAPP`.
8. Política de rate limiting para pedidos anônimos.
9. Estratégia de retenção e privacidade dos dados de entrega.
10. Nome e número oficiais do condomínio.
11. Primeira loja do GATE-08.
12. Ferramentas de teste visual e mobile.
13. Necessidade real de Docker Compose no desenvolvimento.
14. Regras legais e operacionais para coleta das fontes.

A documentação consolidada define markup padrão de 30%. A recomendação é:

```text
preço público = custo × 1,30
```

A seção sobre margem existente na documentação deve ser harmonizada no GATE-02.

## 18. Ordem exata de execução

```text
1. GATE-00 — Ambiente e isolamento
2. GATE-01 — Bootstrap
3. GATE-02 — Arquitetura
4. GATE-03 — Modelo de dados Supabase
5. GATE-04 — Backend + Supabase
6. GATE-05 — Frontend
7. Validação Mobile
8. GATE-06 — Dashboard
9. GATE-07 — Browser Harness + Chromium
10. GATE-08 — Primeiro coletor real
11. GATE-09 — Múltiplas fontes
12. GATE-10 — Pipeline completo
13. GATE-11 — Revalidação
14. GATE-12 — Segurança
15. GATE-13 — Teste de carga
16. GATE-14 — MVP Validated
```

Regra obrigatória de execução:

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

Nenhum Gate posterior poderá ser antecipado. Cada Gate deverá ser executado, validado e documentado antes do início do próximo.

## 19. Primeiro Gate após a aprovação

O primeiro Gate será:

> **GATE-00 — Ambiente de desenvolvimento e isolamento**

Ele deverá apenas validar a raiz correta do projeto, Git, branch, remote, Node, npm, Python, ferramentas necessárias, permissões e isolamento do repositório. Não deverá criar frontend, backend, Supabase ou Collector. Nenhum Gate foi executado como parte da criação ou revisão deste documento.
