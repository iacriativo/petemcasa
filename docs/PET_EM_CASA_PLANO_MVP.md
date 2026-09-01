# PET EM CASA — PLANO DE IMPLEMENTAÇÃO DO MVP

**Status:** PLAN — decisões do MVP consolidadas
**Versão do plano:** 1.3
**Repositório oficial:** https://github.com/iacriativo/petemcasa.git


## 1. Entendimento do produto

O MVP é uma experiência PWA 100% orientada a Smartphone, acessada principalmente por QRCode no condomínio. O morador não possui conta; compra via carrinho e conclui o atendimento pelo WhatsApp. O pedido é registrado no Supabase antes do redirecionamento. Vercel hospeda a aplicação e o Collector roda inicialmente no notebook do responsável.

## 2.1. Fluxo oficial de pedido e WhatsApp

O WhatsApp é somente canal externo de atendimento e fechamento. Não haverá API oficial, webhook, chatbot, leitura ou sincronização de conversas. O pedido usa `Order` + `OrderItems` e é criado antes de abrir o WhatsApp.

## 3. Estratégia UX/UI

Home Mobile como referência principal; Dashboard enxuto e operacional como referência administrativa.

## 9. Decisões arquiteturais

1. 1 condomínio no MVP; arquitetura preparada para expansão futura.
2. WhatsApp externo, sem API oficial.
3. 1 administrador via Supabase Auth.
4. Markup padrão de 30%.
5. Categorias administráveis pelo Dashboard.
6. Imagem definida antes da publicação.
7. Collector no notebook, inicialmente manual.
8. Dashboard operacional enxuto.
9. Pedido identificado por Nome do Pet + Bloco + Número.

## 11. Critérios de aceite

- Sem conta do morador; carrinho; identificação do pedido; Order + OrderItems; abertura do WhatsApp; sem pagamento/frete; Dashboard protegido; validação mobile.

## 12. Ordem exata de execução

1. GATE-00; 2. GATE-01; 3. GATE-02; 4. GATE-03; 5. GATE-04; 6. GATE-05; 7. validação Mobile; 8. GATE-06; 9. GATE-07; 10. GATE-08; 11. GATE-09; 12. GATE-10; 13. GATE-11; 14. GATE-12; 15. GATE-13; 16. GATE-14. Sempre um Gate por vez, validando antes de avançar.
