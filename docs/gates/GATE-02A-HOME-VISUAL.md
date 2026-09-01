# GATE-02A — Home Mobile Visual

**Status:** BUILD — validação local concluída, aguardando publicação na Vercel e validação visual no iPhone
**Data:** 01/09/2026
**Gate anterior:** GATE-02 VALIDATED em `f3272f8`
**Etapa intermediária:** validação visual da Home Mobile; não é o GATE-03.

## Objetivo

Criar uma primeira Home funcionalmente navegável porém estática, publicada na Vercel para validação da experiência Mobile-first no iPhone em `https://petemcasa.vercel.app`.

## Referência visual

- `docs/referencias/PET_EM_CASA_HOME_MOBILE_REFERENCIA_APROVADA.png`
- Especificação visual constante no arquivo de instrução `PET_EM_CASA_GATE_02A_HOME_VISUAL_BUILD.md` tratada como referência desta implementação.

## Escopo

- Home Mobile estática com as seções: Header/identidade, Hero, Benefícios, Busca, Categorias, Banner institucional, Ofertas, Como funciona e Carrinho fixo inferior.
- Mocks visuais de ofertas, preços demonstrativos e carrinho (não funcional).
- Imagens demonstrativas locais (SVG) — sem Supabase Storage, sem dependências externas de imagem.
- Estado puramente visual com solução simples (sem Zustand nesta etapa).

## Não implementado nesta etapa

- Supabase, banco ou migrations.
- Catálogo real, pedido real, API de pedidos.
- WhatsApp real.
- Dashboard, Collector, autenticação, pagamento, frete.

## Tecnologias

- React 18 + Vite 6.4.3 + TypeScript.
- Aplicação única em `frontend/`.
- Sem Fastify, sem TanStack Query, sem Zustand.
- Ícones e ilustrações em SVG locais.

## Estrutura criada

```text
frontend/
├── index.html
├── package.json
├── package-lock.json
├── tsconfig.json
├── vite.config.ts
├── public/
│   └── paw-house.svg
└── src/
    ├── main.tsx
    ├── App.tsx
    ├── index.css
    ├── vite-env.d.ts
    └── components/
        ├── Home.tsx
        ├── Header.tsx
        ├── Hero.tsx
        ├── HeroArt.tsx
        ├── Benefits.tsx
        ├── Search.tsx
        ├── Categories.tsx
        ├── Banner.tsx
        ├── Offers.tsx
        ├── ProductArt.tsx
        ├── HowItWorks.tsx
        ├── CartBar.tsx
        └── icons.tsx
```

## Validações executadas

- `npm install` com `npm audit`: 0 vulnerabilidades (Vite atualizado 5→6.4.3 para correção do esbuild).
- `npm run build`: compilação TypeScript + bundle de produção OK (40 módulos, JS ~161 kB / gzip ~50 kB).
- Servidor de preview respondendo HTTP 200 na rota `/`.
- Renderização confirmada via DOM headless (Chrome): todas as seções e textos presentes.
- Screenshots locais gerados em 375px, 390px e 430px de largura (Chrome headless).
- Acentos e textos conferidos nos fontes e no bundle.

## URL Vercel

`https://petemcasa.vercel.app` — publicação pendente nesta etapa (ver Pendências).

## Limitações

- Busca e botões são visuais (sem ação).
- Carrinho fixo e ofertas são mocks.
- Imagens são ilustrações SVG demonstrativas, não fotos reais.
- Sem PWA ainda (manifest/Service Worker pertencem a Gates futuros).
- Validação visual final depende de dispositivo iPhone real.

## Pendências

- Publicação na Vercel (`frontend/` como root do projeto Vercel já conectado) e confirmação de acesso em `https://petemcasa.vercel.app`.
- Validação visual no iPhone (aprovação final desta etapa).
- GATE-03 NÃO iniciado.

## Status da etapa

BUILD executado e validado localmente. Aguardando publicação/validação Vercel + iPhone para aprovação final.