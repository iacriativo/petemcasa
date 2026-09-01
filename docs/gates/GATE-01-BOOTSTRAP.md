# GATE-01 — Bootstrap do Projeto

**Status:** PASS COM RESSALVAS
**Data da validação:** 01/09/2026
**Escopo:** somente bootstrap técnico do repositório.

## Objetivo

Preparar uma base mínima e organizada para os Gates seguintes, sem implementar funcionalidades de produto ou decidir definitivamente a arquitetura do backend.

## Incluído

- Metadados npm do projeto.
- `.gitignore` para Node.js, Python, ambiente local e artefatos futuros.
- `.env.example` com placeholders vazios.
- README principal.
- Espaços reservados para frontend, backend, Collector e Supabase.
- Verificador local do bootstrap sem dependências externas.
- `package-lock.json` gerado sem dependências de aplicação.

## Não incluído

- Home, catálogo, produto, carrinho ou checkout.
- Dashboard ou autenticação.
- API, endpoints ou regras de negócio.
- Supabase, migrations, RLS, Auth ou Storage.
- Collector, Browser Harness ou Chromium.
- PWA, manifest ou Service Worker.
- Docker ou configuração de produção.
- Decisão definitiva sobre Fastify.

## Validação

Os resultados dos comandos e as evidências da validação técnica do bootstrap estão registrados abaixo.

## Resultado da validação

### Testes aprovados

- `npm install --ignore-scripts --package-lock-only`: concluído, sem dependências de aplicação adicionadas e sem vulnerabilidades reportadas.
- `npm run check:bootstrap`: aprovado.
- `node --check scripts/check-bootstrap.mjs`: aprovado.
- `npm ls --depth=0`: projeto sem dependências instaladas.
- `npm pkg get`: metadados, engines e script de bootstrap válidos.
- `git check-ignore`: `.env`, `.env.local`, `node_modules`, `dist`, `.vercel` e artefatos do Collector ignorados corretamente.
- `git check-ignore`: `.env.example` preservado pelo `! .env.example` configurado no `.gitignore`.
- Leitura do `.env.example`: placeholders de Supabase e WhatsApp vazios, sem credenciais reais.

### Estrutura criada

```text
.env.example
.gitignore
README.md
package.json
package-lock.json
backend/README.md
collector/README.md
frontend/README.md
scripts/check-bootstrap.mjs
supabase/README.md
docs/gates/GATE-01-BOOTSTRAP.md
```

### Estado Git ao final

- Branch: `main`.
- Remote: `https://github.com/iacriativo/petemcasa.git`.
- Commit atual: `3b49294 Plano de implementação do MVP`, sincronizado com `origin/main`.
- Nenhum commit realizado.
- Nenhum push realizado.
- Arquivos do bootstrap permanecem não rastreados para revisão.
- O plano de implementação já existente está rastreado no commit anterior ao bootstrap.

### Ressalvas

- A aplicação ainda não inicia como frontend ou backend, pois esses componentes pertencem a Gates posteriores.
- Docker e Docker Compose não foram instalados nem configurados; sua necessidade permanece opcional.
- Fastify não foi decidido nem implementado; a avaliação pertence ao GATE-02.
- Supabase CLI, Vercel CLI, Chromium e Browser Harness permanecem fora deste Gate.

## Confirmação de escopo

- GATE-02 não foi executado.
- Supabase não foi configurado.
- Collector não foi implementado.
- Home não foi implementada.
- Dashboard não foi implementado.
- WhatsApp não foi implementado.
