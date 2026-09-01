# PET EM CASA — DOCUMENTAÇÃO GERAL DO PROJETO

**Versão:** 4.1  
**Data:** 31/08/2026  
**Status:** Documento mestre — início do MVP  
**Regra de execução:** desenvolvimento incremental por Gates

---

# 1. OBJETIVO

Este é o documento mestre do Projeto **Pet em Casa**.

O projeto deverá manter seu código e seus dados de desenvolvimento isolados de outros projetos.

A hospedagem do MVP será feita na **Vercel**, com o banco de dados no **Supabase**. O servidor local/doméstico não faz parte da infraestrutura de hospedagem do MVP.

O OpenCode deve ler este documento antes de qualquer implementação e nunca assumir que o diretório atual pertence ao Pet em Casa.

---

# 1.1. REPOSITÓRIO OFICIAL

O repositório Git oficial do projeto é:

```text
https://github.com/iacriativo/petemcasa.git
```

---

# 1.2. EXPERIÊNCIA PRINCIPAL

O Pet em Casa é uma experiência de comércio digital **100% orientada a Smartphone**.

O principal acesso do morador será por um **QRCode instalado em local estratégico no condomínio**.

```text
QRCode
   ↓
Smartphone
   ↓
Pet em Casa — PWA
   ↓
Catálogo
   ↓
Produto
   ↓
Carrinho
   ↓
Identificação do pedido
   ↓
Supabase
   ↓
WhatsApp
```

O frontend público não deve ser tratado como um site Desktop adaptado para Mobile.

Prioridade:

```text
Smartphone
   ↓
Tablet secundário
   ↓
Desktop apenas como compatibilidade
```

---

# 1.3. FLUXO COMERCIAL DO MVP

O morador **não terá conta, cadastro ou login**.

Fluxo:

```text
Escolher produto
   ↓
Adicionar ao carrinho
   ↓
Revisar carrinho
   ↓
Informar:
  - Nome do Pet
  - Bloco
  - Número da unidade
   ↓
Criar Order + OrderItems
   ↓
Supabase
   ↓
Abrir WhatsApp
   ↓
Atendimento humano
   ↓
Pagamento
   ↓
Confirmação
   ↓
Entrega no condomínio
```

### WhatsApp

O WhatsApp será exclusivamente o canal externo para atendimento e fechamento do pedido.

Não haverá:

- API oficial do WhatsApp;
- webhook;
- chatbot;
- leitura de mensagens;
- sincronização de conversas;
- confirmação automática de pagamento.

O Pet em Casa apenas registra o pedido, prepara a mensagem e abre o WhatsApp.

Mensagem padrão aprovada:

```text
🐾 *PET EM CASA — NOVO PEDIDO*

🏢 Condomínio: {condominio}
🆔 Pedido: #{pedido_id}

📦 *Itens:*
• {quantidade}x {produto}
• {quantidade}x {produto}

💰 *Total: R$ {total}*

Olá! Gostaria de finalizar este pedido.

Aguardo a confirmação e as orientações para pagamento.

Obrigado!
```

### Pagamento e frete

Não haverá pagamento integrado nem sistema de frete no MVP.

---

# 1.4. DECISÕES DO MVP CONSOLIDADAS

### 1 — Condomínio
- 1 condomínio no MVP.
- Arquitetura poderá permitir expansão futura.
- Não implementar multi-condomínio agora.

### 2 — WhatsApp
- Canal externo para fechamento.
- Número configurado no projeto.
- Sem API oficial ou automação.

### 3 — Administração
- 1 administrador.
- Supabase Auth.
- Sem conta para moradores.

### 4 — Preço
- Markup padrão de 30% sobre o preço de aquisição.
- Administrador pode ajustar o preço antes de publicar.

### 5 — Categorias
- Criar, editar, ativar e desativar pelo Dashboard.
- Sem exclusão física como operação padrão.

### 6 — Imagens
- Imagem pública definitiva será adicionada/selecionada antes da publicação.
- Não publicar automaticamente imagem da fonte externa.
- A imagem pública não deve revelar a origem.

### 7 — Collector
- Executado no notebook do responsável.
- Execução inicialmente manual.
- Python + Browser Harness + Chromium.
- Dados enviados ao Supabase.
- Automação será avaliada posteriormente, após validação dos Gates 07–09.

### 8 — Dashboard
- Dashboard operacional e enxuto.
- Áreas: Dashboard, Ofertas, Pedidos, Produtos, Categorias, Publicados e Configurações.
- Home com indicadores essenciais, atenção, ofertas pendentes e pedidos recentes.
- Sem BI avançado, estoque, logística, CRM ou automações complexas.
- Otimizado para administração em Desktop, mantendo responsividade.

### 9 — Identificação do pedido
Antes de finalizar, o morador informa:
- Nome do Pet;
- Bloco;
- Número da unidade.

Esses dados são vinculados ao pedido e usados para identificação operacional e entrega no condomínio. Não constituem conta do morador.

---

# 1.5. REFERÊNCIAS VISUAIS APROVADAS

### Home Mobile — referência simplificada aprovada

```text
docs/referencias/PET_EM_CASA_HOME_MOBILE_REFERENCIA_APROVADA.png
```

A versão simplificada da Home Mobile é a referência visual principal do frontend público.

Princípios aprovados:

- experiência prioritariamente Smartphone;
- entrada por QRCode;
- busca em posição prioritária;
- categorias acessíveis por toque;
- ofertas/produtos como foco comercial;
- ação de adicionar diretamente no card;
- carrinho muito visível;
- baixa fricção entre entrada, escolha e compra;
- identidade visual acolhedora ligada ao bem-estar do pet;
- pouco conteúdo institucional na área inicial.

A imagem é referência de UX/UI e não especificação literal de todos os componentes. A implementação deve preservar a hierarquia e a experiência, adaptando componentes e navegação ao escopo real do MVP.

### Dashboard

```text
docs/referencias/PET_EM_CASA_DASHBOARD_MVP_REFERENCIA.png
```

A referência do Dashboard orienta a linguagem visual e a estrutura da Home administrativa.

A imagem é referência de UX/UI e não deve ser copiada literalmente.

---

# 2. ISOLAMENTO DO SERVIDOR

O Pet em Casa deverá possuir seu próprio diretório de trabalho durante o desenvolvimento.

O OpenCode NÃO pode modificar outro projeto, reutilizar seus `package.json`, `.env`, dependências, configurações ou banco.

A infraestrutura local serve apenas ao desenvolvimento, testes e preparação do código. Ela **não será usada para hospedar o MVP em produção**.

Nunca executar o OpenCode em uma pasta genérica como se ela fosse a raiz do projeto.

---

# 3. AMBIENTE DE DESENVOLVIMENTO

O desenvolvimento poderá ser feito localmente ou em ambiente remoto de desenvolvimento, conforme a necessidade.

O ambiente de desenvolvimento não deve ser confundido com a hospedagem do MVP.

Arquitetura de hospedagem do MVP:

```text
Usuário
  ↓
Vercel
  ├── Frontend
  └── Backend/API
       ↓
    Supabase
       └── PostgreSQL
```

O OpenCode deverá ser executado dentro da pasta do Pet em Casa e nunca deverá modificar outro projeto.

---

# 4. FLUXO OFICIAL

```text
                    LOJAS EXTERNAS
              ┌────────┬────────┬────────┐
              │  Petz  │ Cobasi │ Petlove│
              └────┬───┴────┬───┴────┬───┘
                   │        │        │
                   └────────┼────────┘
                            ▼
                    BROWSER HARNESS
                            │
                            ▼
                   COLETOR DE OFERTAS
                            │
                            ▼
                  ofertas_pendentes.json
                            │
                            ▼
                       DASHBOARD
                            │
                    revisar / editar
                    definir preço
                    aprovar / rejeitar
                            │
                         APROVADO
                            ▼
                 ofertas_publicadas.json
                            │
                            ▼
                    ┌───────────────┐
                    │  PET EM CASA  │
                    │ Produto       │
                    │ Imagem        │
                    │ Descrição     │
                    │ Preço         │
                    │ Disponibilidade│
                    │ [Comprar]     │
                    └───────────────┘
```

As grandes lojas são fontes internas. Nunca devem aparecer no frontend público.

---

# 5. BROWSER HARNESS

Arquitetura conceitual:

```text
Coletor
 ↓
Browser Harness
 ↓ CDP
Chromium Headless
 ↓
Loja externa
```

O Browser Harness e o Chromium fazem parte da camada de coleta/automação. A execução deverá ocorrer em um ambiente compatível com essa necessidade; a Vercel não deve ser considerada automaticamente adequada para executar processos persistentes de navegador.

Para o MVP, a estratégia de execução do coletor/browser deverá ser definida e validada em um Gate específico, mantendo a hospedagem da aplicação na Vercel e o banco no Supabase.

IA **não é requisito do primeiro MVP**.

No primeiro MVP:

- Browser Harness = automação/navegação;
- Chromium = navegador;
- regras = extração/validação;
- JSON = armazenamento;
- Dashboard = curadoria;
- responsável = decisão comercial.

IA poderá ser adicionada posteriormente para normalização, categorização, descrições, interpretação e detecção de inconsistências.

---

# 6. DADOS COLETADOS

Para uma oportunidade, o coletor deverá tentar obter:

- nome;
- marca;
- categoria;
- subcategoria;
- imagem;
- breve descrição;
- preço original;
- preço promocional;
- disponibilidade;
- URL de origem;
- loja de origem;
- data/hora da coleta;
- condições objetivas da promoção, quando disponíveis.

A origem fica somente no ambiente interno.

---

# 7. CURADORIA HUMANA

Nenhuma oportunidade nova será publicada automaticamente no MVP.

```text
COLETADA
 ↓
PENDENTE
 ↓
REVISÃO
 ├── EDITAR
 ├── REJEITAR
 └── APROVAR
       ↓
   PUBLICADA
```

O Dashboard permitirá revisar nome, descrição, imagem, preço, margem/markup e aprovar ou rejeitar.

---

# 8. PRECIFICAÇÃO

Separar:

```text
Preço de aquisição observado
 ↓
Regra de precificação
 ↓
Preço sugerido
 ↓
Ajuste manual
 ↓
Preço aprovado
 ↓
Preço público
```

Para margem real:

```text
Preço de venda = Custo / (1 - Margem)
```

Exemplo:

```text
Custo: R$ 29,90
Margem: 30%
Preço: R$ 42,71
```

A definição entre margem e markup deverá ser explícita no sistema.

---

# 9. VALIDADE

Uma oferta não é permanente.

O modelo deverá permitir:

- data da coleta;
- última verificação;
- preço observado;
- disponibilidade;
- expiração;
- retirada da publicação.

Estados:

```text
pending
approved
published
rejected
expired
unavailable
```

---

# 10. SEPARAÇÃO INTERNO/PÚBLICO

No MVP, a separação entre dados internos e públicos será feita principalmente por **modelo de dados, tabelas, campos e regras de acesso no Supabase**, e não por arquivos JSON locais.

Interno:

```text
Supabase
├── products
├── sources
├── offers
├── price_history
├── offer_reviews
└── publications
```

Pode conter origem, URL, preço de aquisição, margem, histórico, logs e curadoria.

Público:

```text
API / consultas públicas controladas
```

Pode disponibilizar apenas produto aprovado, nome, descrição, imagem, categoria, preço e disponibilidade.

O frontend público nunca deve ter acesso direto a dados internos, credenciais administrativas ou operações de curadoria.

---

# 11. MODELO DE DADOS

O MVP usará **Supabase/PostgreSQL como banco de dados desde o início**.

> **O modelo deve ser simples e adequado ao MVP, mas estruturado como entidades relacionais para evitar retrabalho.**

Os JSONs, quando utilizados, serão apenas formatos auxiliares de importação, exportação, fixtures ou testes — não serão o banco oficial do MVP.

Entidades:

```text
Product
Source
Offer
PriceHistory
OfferReview
Publication
```

### Product

```text
id
name
description
brand
category_id
subcategory_id
image
active
created_at
updated_at
```

### Source

```text
id
name
base_url
active
created_at
updated_at
```

### Offer

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
created_at
updated_at
```

### PriceHistory

```text
id
product_id
source_id
price
availability
collected_at
```

### OfferReview

```text
id
offer_id
status
notes
reviewed_at
```

### Publication

```text
id
offer_id
public_product_id
sale_price
margin_type
margin_value
published_at
unpublished_at
status
```

---

# 12. BANCO DE DADOS DO MVP

O banco oficial do MVP será o **Supabase**, utilizando **PostgreSQL**.

Estrutura conceitual:

```text
Supabase
├── products
├── sources
├── offers
├── price_history
├── offer_reviews
└── publications
```

Os IDs deverão ser estáveis e gerados pelo banco. Não usar posição em arrays como identidade.

JSON poderá ser utilizado somente para fixtures, testes, importações/exportações ou dados temporários do coletor, quando isso for útil.

---

# 13. STACK

| Camada | Tecnologia |
|---|---|
| Frontend | React + Vite |
| Backend | Node.js + TypeScript |
| API | Fastify |
| Dashboard | React |
| Coletor | Python |
| Browser | Browser Harness |
| Navegador | Chromium |
| Dados | Supabase / PostgreSQL |
| Hospedagem da aplicação | Vercel |
| Banco de dados | Supabase |
| Ambiente local | Desenvolvimento/testes |
| Containerização | Opcional, somente quando necessária ao desenvolvimento/coleta |

---

# 14. DOCKER

Docker **não é requisito da hospedagem do MVP**.

A aplicação será hospedada na **Vercel** e o banco de dados no **Supabase**.

Docker poderá ser utilizado localmente para desenvolvimento ou para componentes de coleta que necessitem de ambiente controlado, mas não deve ser criado apenas por convenção.

Não criar arquitetura distribuída desnecessária no MVP.

---

# 15. ESTRUTURA

```text
pet-em-casa/
├── frontend/
├── backend/
├── dashboard/
├── collector/
├── docs/
│   ├── PET_EM_CASA_GERAL.md
│   └── gates/
├── scripts/
├── .env.example
├── .gitignore
├── README.md
└── LICENSE
```

A estrutura final poderá ser simplificada durante os Gates, caso frontend, backend e dashboard possam ser organizados de forma mais adequada à Vercel sem criar complexidade desnecessária.

---

# 16. GATES

## GATE-00 — Ambiente de desenvolvimento e isolamento

Validar ambiente de desenvolvimento, diretório do projeto, Git, OpenCode, permissões e ferramentas necessárias.

Não modificar outros projetos.

O ambiente local/remoto de desenvolvimento não é ambiente de produção.

Resultado conceitual:

```text
Ambiente de desenvolvimento
 ↓
Projeto Pet em Casa
 ↓
Git / OpenCode
 ↓
Deploy
 ↓
Vercel
 ↓
Supabase
```

## GATE-01 — Bootstrap

Criar estrutura inicial, Git, README, `.gitignore`, `.env.example`, `docs/` e Docker Compose inicial.

## GATE-02 — Arquitetura

Definir frontend, backend, Dashboard, collector, comunicação, contratos, dados e estados.

## GATE-03 — Modelo de dados Supabase

Criar e validar tabelas, IDs, relações, estados, campos internos/públicos e regras de acesso no Supabase.

O MVP deverá contemplar `orders` e `order_items` para registrar o pedido antes do redirecionamento ao WhatsApp.

JSON, se utilizado, será apenas auxiliar.

## GATE-04 — Backend + Supabase

Criar API inicial, integração com Supabase, leitura/escrita controlada, dados públicos, operações administrativas, validação, erros e proteção das operações internas.

## GATE-05 — Frontend

Criar home, catálogo, produto, imagem, descrição, preço, disponibilidade e Comprar.

## GATE-06 — Dashboard

Criar visão geral, pendentes, detalhe, editar, aprovar, rejeitar e publicação.

## GATE-07 — Browser Harness + Chromium

Instalar e validar Python, Browser Harness, Chromium, headless, CDP, screenshots, logs e navegação de teste.

## GATE-08 — Primeiro coletor real

Usar uma única loja e extrair nome, imagem, descrição, preço, disponibilidade, URL e origem interna.

Nunca publicar automaticamente.

## GATE-09 — Múltiplas fontes

Adicionar progressivamente outras fontes com integrações desacopladas.

## GATE-10 — Pipeline completo

Validar:

```text
Loja
 ↓
Browser Harness
 ↓
Collector
 ↓
Supabase / offers
 ↓
Dashboard
 ↓
Editar → Preço → Aprovar
 ↓
Supabase / publications
 ↓
API pública
 ↓
Vercel / Frontend
```

## GATE-11 — Revalidação

Implementar verificação de preço, disponibilidade, alteração e expiração.

## GATE-12 — Segurança

Validar variáveis de ambiente, credenciais, permissões, proteção do Dashboard, separação entre dados internos e públicos, políticas de acesso do Supabase e não exposição do CDP.

## GATE-13 — Teste de carga

Começar com:

```text
3 lojas / 10 produtos
```

Depois:

```text
3 lojas / 100 produtos
```

Medir CPU, RAM, disco, duração, navegadores e falhas.

## GATE-14 — MVP VALIDATED

Validar ambiente, JSON, frontend, Dashboard, Browser Harness, coleta, curadoria, publicação, invisibilidade da origem, precificação e revalidação.

---

# 17. HOSPEDAGEM DO MVP

A hospedagem do MVP está definida:

```text
Aplicação
   ↓
Vercel

Banco de dados
   ↓
Supabase / PostgreSQL
```

O servidor local/doméstico **não será utilizado como servidor de produção do MVP**.

A infraestrutura deverá permanecer simples. Recursos adicionais, como worker dedicado, storage externo, filas ou outra infraestrutura de execução do coletor, somente serão adicionados se um Gate demonstrar necessidade real.

---

# 18. NÃO FAZER NO MVP

Não antecipar:

- IA obrigatória;
- infraestrutura de banco diferente do Supabase/PostgreSQL;
- Kubernetes;
- microserviços excessivos;
- múltiplos servidores ou arquitetura distribuída;
- filas complexas;
- gateway de pagamento próprio;
- publicação automática sem aprovação;
- exposição das grandes lojas;
- recursos de Gates futuros.

---

# 19. PRINCÍPIOS PERMANENTES

1. **Isolamento:** Pet em Casa possui ambiente próprio.
2. **Curadoria humana:** oferta nova passa por aprovação.
3. **Fonte invisível:** lojas externas não aparecem no frontend público.
4. **Supabase como banco:** o MVP utiliza PostgreSQL via Supabase; JSON é apenas formato auxiliar quando necessário.
5. **Automação desacoplada:** Browser Harness não conversa diretamente com frontend público.
6. **Dados internos separados:** aquisição e publicação possuem estruturas distintas.
7. **Gates:** não avançar sem validar o anterior.
8. **Simplicidade:** Vercel + Supabase como base do MVP; não adicionar complexidade sem necessidade.

---

# 20. PRIMEIRA META

Primeiro provar:

> Uma oferta encontrada automaticamente em uma loja externa chega estruturada ao Dashboard para análise humana.

Depois provar:

> Uma oferta aprovada aparece no Pet em Casa sem revelar sua origem.

---

# 21. ESTADO INICIAL

```text
GATE-00  PENDING
GATE-01  PENDING
GATE-02  PENDING
GATE-03  PENDING
GATE-04  PENDING
GATE-05  PENDING
GATE-06  PENDING
GATE-07  PENDING
GATE-08  PENDING
GATE-09  PENDING
GATE-10  PENDING
GATE-11  PENDING
GATE-12  PENDING
GATE-13  PENDING
GATE-14  PENDING
```

---

# 22. REGRA FINAL PARA O OPENCODE

Este documento é contexto mestre, não autorização para implementar tudo.

Execução:

```text
GATE
 ↓
PLAN
 ↓
aprovação
 ↓
BUILD
 ↓
validação
 ↓
documentação
 ↓
VALIDATED
 ↓
próximo GATE
```

Nunca pular Gates.

Nunca modificar outro projeto.

Sempre confirmar a raiz do Pet em Casa antes de comandos de implementação.
