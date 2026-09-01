# Pet em Casa

Bootstrap inicial do MVP Pet em Casa.

O projeto será uma experiência PWA orientada a Smartphone para moradores de um condomínio. A aplicação será hospedada na Vercel e utilizará o Supabase quando os Gates correspondentes forem executados.

## Estado atual

Este repositório contém somente a base técnica do GATE-01. Ainda não existe aplicação executável.

Não fazem parte deste Gate:

- Home;
- catálogo;
- carrinho;
- checkout;
- WhatsApp;
- Dashboard;
- API funcional;
- Supabase;
- Collector;
- PWA completa;
- autenticação;
- migrations.

## Validação do bootstrap

```text
npm install --ignore-scripts --package-lock-only
npm run check:bootstrap
```

O comando de verificação utiliza somente APIs nativas do Node.js e não adiciona dependências de aplicação.

## Estrutura prevista

- `frontend/`: espaço reservado para o frontend público e a futura área administrativa.
- `backend/`: espaço reservado para a camada de API, cuja implementação será definida no GATE-02.
- `collector/`: espaço reservado para o Collector manual.
- `supabase/`: espaço reservado para migrations futuras.
- `docs/gates/`: evidências dos Gates.

Consulte `docs/PET_EM_CASA_GERAL.md` e o plano de implementação antes de executar qualquer Gate.
