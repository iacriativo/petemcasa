# PET EM CASA — INSTRUÇÃO BASE PARA AGENTES DE IA

## STATUS

**Projeto:** Pet em Casa  
**Fase:** MVP  
**Repositório:** `iacriativo/petemcasa`

---

## 1. REGRA PRINCIPAL

Antes de implementar qualquer coisa, leia integralmente:

```text
docs/PET_EM_CASA_GERAL.md
docs/PET_EM_CASA_PLANO_MVP.md
```

Quando trabalhar em UX/UI, leia também visualmente:

```text
docs/referencias/PET_EM_CASA_HOME_MOBILE_REFERENCIA_APROVADA.png
docs/referencias/PET_EM_CASA_DASHBOARD_MVP_REFERENCIA.png
```

As imagens são referências de UX/UI. Não devem ser reproduzidas literalmente nem transformar elementos ilustrativos em requisitos funcionais.

**Quando for necessário pode fazer perguntas.**

Não invente decisões importantes para preencher lacunas.

Se uma dúvida não bloquear o trabalho, registre-a como decisão posterior.

---

# 2. OBJETIVO DO PROJETO

O Pet em Casa é um MVP de comércio digital exclusivo para moradores de um condomínio.

A experiência pública é prioritariamente para **Smartphone**.

O principal acesso acontece por um QRCode instalado em local estratégico no condomínio.

```text
QRCode
   ↓
Smartphone
   ↓
Pet em Casa — PWA
   ↓
Catálogo
   ↓
Carrinho
   ↓
Nome do Pet + Bloco + Número
   ↓
Pedido no Supabase
   ↓
WhatsApp
   ↓
Atendimento humano
```

O frontend público não deve ser tratado como um site Desktop adaptado para Mobile.

---

# 3. MORADOR

No MVP não haverá:

- conta;
- cadastro;
- login;
- senha;
- área pessoal;
- autenticação do morador.

O morador simplesmente:

```text
Entra
 ↓
Escolhe produto
 ↓
Adiciona ao carrinho
 ↓
Revisa
 ↓
Informa:
  - Nome do Pet
  - Bloco
  - Número da unidade
 ↓
Finaliza
```

Os dados de Nome do Pet, Bloco e Número identificam operacionalmente o pedido.

Eles **não constituem uma conta do morador**.

---

# 4. WHATSAPP

O WhatsApp será somente o canal externo para atendimento e fechamento do pedido.

**NÃO implementar:**

- API oficial do WhatsApp;
- webhook;
- chatbot;
- leitura de mensagens;
- sincronização de conversas;
- confirmação automática;
- integração automática de status;
- pagamento pelo WhatsApp via sistema.

O sistema deverá:

1. criar o pedido no Supabase;
2. preparar a mensagem;
3. abrir o WhatsApp.

Abrir o WhatsApp **não significa que o pedido foi confirmado**.

Mensagem padrão:

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

---

# 5. PAGAMENTO E FRETE

Não haverá no MVP:

- sistema de pagamento integrado;
- checkout financeiro;
- sistema de frete;
- cálculo de frete;
- transportadora.

Pagamento e fechamento comercial acontecem fora da plataforma.

A entrega é exclusiva para o condomínio.

---

# 6. CONDOMÍNIO

O MVP atenderá inicialmente **1 condomínio**.

Não implementar multi-condomínio agora.

A arquitetura poderá permitir expansão futura, mas isso não deve aumentar a complexidade do MVP.

---

# 7. ADMINISTRAÇÃO

O MVP terá **1 administrador**.

O Dashboard será protegido por:

```text
Supabase Auth
```

Não criar sistema de múltiplos administradores neste momento.

---

# 8. PREÇO

Markup padrão:

```text
30%
```

sobre o preço de aquisição.

O administrador poderá alterar o preço sugerido antes da publicação.

---

# 9. CATEGORIAS

As categorias serão administráveis pelo Dashboard.

Permitir:

- criar;
- editar;
- ativar;
- desativar.

Não utilizar exclusão física como operação padrão.

---

# 10. IMAGENS

A imagem pública definitiva será adicionada ou selecionada **antes da publicação**.

Não publicar automaticamente a imagem da fonte externa.

A imagem apresentada ao morador não deve revelar a origem externa da oferta.

---

# 11. COLLECTOR

O Collector será executado:

```text
Notebook do responsável
```

Tecnologias previstas:

```text
Python
Browser Harness
Chromium
```

No MVP:

```text
Execução manual
```

Os dados coletados serão enviados ao Supabase.

Não criar infraestrutura complexa para o Collector nesta fase.

Automação/agendamento será avaliada posteriormente, após validação dos Gates relacionados à coleta.

---

# 12. INFRAESTRUTURA

Arquitetura prevista:

```text
                    VERCEL
             ┌─────────────────┐
             │ PWA              │
             │ Dashboard        │
             │ API              │
             └────────┬────────┘
                      │
                      ▼
                 SUPABASE
                      ▲
                      │
             ┌────────┴────────┐
             │                 │
         COLLECTOR         CURADORIA
         Notebook          Dashboard
         Python
         Chromium
```

### Vercel

Hospedagem da aplicação do MVP.

### Supabase

Responsável pelos serviços necessários ao MVP, incluindo:

- PostgreSQL;
- autenticação administrativa;
- dados;
- regras de acesso;
- demais recursos necessários.

### Collector

Fora da Vercel.

Executado inicialmente no notebook do responsável.

---

# 13. HOME MOBILE

A experiência pública é **Mobile-first de verdade**.

Prioridade:

```text
QRCode
 ↓
Busca
 ↓
Categorias
 ↓
Produtos / Ofertas
 ↓
Adicionar
 ↓
Carrinho
```

A Home deve priorizar:

- Smartphone;
- toque confortável;
- leitura fácil;
- CTA claro;
- carrinho muito acessível;
- imagens otimizadas;
- poucos elementos institucionais;
- visual acolhedor;
- sensação de bem-estar do pet;
- baixa fricção.

A referência visual aprovada deve orientar:

- linguagem visual;
- hierarquia;
- espaçamento;
- componentes;
- composição;
- densidade de informação.

A imagem não é uma especificação literal.

---

# 14. DASHBOARD

O Dashboard é uma ferramenta administrativa operacional e enxuta.

Estrutura:

```text
Dashboard
Ofertas
Pedidos
Produtos
Categorias
Publicados
Configurações
```

A Home do Dashboard deve priorizar:

- indicadores essenciais;
- itens que precisam de atenção;
- ofertas pendentes;
- pedidos recentes.

Não transformar o Dashboard em ERP ou BI.

Não antecipar no MVP:

- BI avançado;
- estoque completo;
- logística;
- CRM;
- múltiplos administradores;
- múltiplos condomínios;
- automações comerciais complexas;
- relatórios avançados.

O Dashboard será responsivo, mas sua experiência principal é administrativa em Desktop.

---

# 15. PEDIDOS

O modelo deve contemplar:

```text
Order
OrderItems
```

O pedido é criado **antes** do redirecionamento ao WhatsApp.

Dados mínimos:

```text
pedido_id
nome_pet
bloco
numero_unidade
total
status
```

Itens:

```text
order_id
product_id
quantidade
preco_unitario
subtotal
```

Estados possíveis:

```text
CRIADO
ENCAMINHADO_WHATSAPP
EM_ATENDIMENTO
CONFIRMADO
CONCLUIDO
CANCELADO
```

Não assumir qualquer confirmação automática pelo WhatsApp.

---

# 16. GATES

O projeto trabalha com Gates.

Regra obrigatória:

> **Uma etapa por vez. Só avançar após executar e validar a etapa atual.**

Fluxo:

```text
Planejar
 ↓
Executar um Gate
 ↓
Validar
 ↓
Registrar evidências
 ↓
Somente então avançar
```

Não implementar funcionalidades pertencentes a Gates futuros.

Se uma tarefa pertencer a outro Gate, registre isso e não antecipe a implementação.

---

# 17. PLAN MODE E BUILD MODE

### PLAN MODE

Usar para:

- análise;
- inspeção;
- arquitetura;
- planejamento;
- decisões;
- revisão.

No PLAN MODE não implementar.

### BUILD MODE

Usar para:

- implementação;
- alterações de código;
- testes;
- correções.

No BUILD MODE implementar somente o escopo do Gate autorizado.

---

# 18. PRINCÍPIOS DE IMPLEMENTAÇÃO

Priorizar:

- simplicidade;
- baixo custo;
- segurança;
- manutenção fácil;
- Mobile-first real;
- componentes reutilizáveis;
- acessibilidade básica;
- performance;
- evolução futura;
- ausência de complexidade prematura.

Evitar:

- microserviços sem necessidade;
- Kubernetes;
- filas complexas;
- infraestrutura excessiva;
- serviços pagos desnecessários;
- integrações não aprovadas;
- funcionalidades futuras antecipadas.

---

# 19. SEGURANÇA

Nunca:

- expor `service_role` no frontend;
- colocar segredos no código público;
- confiar no cliente para regras administrativas;
- expor dados internos das ofertas;
- misturar dados públicos e administrativos sem controle.

Considerar:

- Supabase RLS;
- proteção das rotas administrativas;
- validação de entradas;
- separação entre dados públicos e internos.

---

# 20. PERFORMANCE MOBILE

A experiência em Smartphone é prioridade absoluta.

Considerar:

- imagens otimizadas;
- carregamento progressivo;
- JavaScript mínimo necessário;
- componentes leves;
- boa experiência em rede móvel;
- áreas de toque adequadas;
- feedback visual;
- loading;
- erros;
- estados vazios;
- persistência adequada do carrinho;
- PWA funcional.

Sempre que possível, validar em Smartphone real.

---

# 21. PRIMEIRA IMPLEMENTAÇÃO

Quando o Gate aprovado determinar a primeira implementação visual, começar pequeno.

A Home Mobile poderá inicialmente utilizar dados estáticos/fictícios para validar:

- composição;
- responsividade;
- hierarquia;
- cards;
- categorias;
- carrinho visual.

Não antecipar:

- Supabase;
- Collector;
- WhatsApp funcional;
- autenticação;
- pagamento;

se esses recursos ainda não pertencerem ao Gate atual.

---

# 22. CRITÉRIO DE CONCLUSÃO DE UM GATE

Antes de considerar um Gate concluído:

1. Implementação limitada ao escopo aprovado.
2. Teste técnico executado.
3. Teste visual quando aplicável.
4. Teste em Smartphone quando aplicável.
5. Erros tratados.
6. Evidências registradas.
7. Documentação atualizada quando necessário.

Se a validação falhar:

> **PARAR.**

Resolver o problema antes de avançar.

---

# 23. REGRA FINAL

O agente deve trabalhar como parte do projeto.

Antes de agir:

```text
LER
 ↓
ENTENDER
 ↓
VERIFICAR
 ↓
PLANEJAR
 ↓
EXECUTAR
 ↓
VALIDAR
```

Nunca pule diretamente para implementação sem entender o Gate atual.

**Leia a documentação. Interprete as referências. Respeite as decisões. Trabalhe um Gate por vez. Valide antes de avançar. Pergunte quando necessário.**
