# Gabinete Digital — protótipo de atendimento parlamentar

Protótipo navegável de uma plataforma de atendimento parlamentar (futuro SaaS multi-gabinete).
Demonstração com a **Vereadora Helena Duarte (fictícia) — Taubaté-SP**. Todos os dados são fictícios e ficam no `localStorage` do navegador.

> **AMBIENTE DE DEMONSTRAÇÃO.** Acessos simulados, sem autenticação real. Documentos gerados trazem a marca
> “MODELO DEMONSTRATIVO — SEM VALIDADE OFICIAL”.

## Executar

```bash
cd gabinete-digital
npm install
npm run dev          # http://localhost:3000
```

Verificações:

```bash
npm run typecheck    # tsc --noEmit
npm run lint         # next lint
npm run build        # build de produção
npm start &          # serve a pasta out/ em :3000 (após build)
npm run test:e2e     # navegação ponta a ponta (Playwright); BASE_URL opcional
```

O teste E2E usa o pacote `playwright` já disponível no ambiente (`npm i -D playwright` se rodar em outra máquina).

## Publicar no GitHub Pages

O app é exportado como site estático (`output: "export"`). O workflow `.github/workflows/pages.yml` publica o Draw My Life em `/` e o Gabinete Digital em `/gabinete/`.

1. Repositório → **Settings → Pages → Source: GitHub Actions**.
2. Se aparecer bloqueio de branch no ambiente `github-pages`: **Settings → Environments → github-pages → Deployment branches** e permita a branch usada.
3. Faça push (ou rode o workflow manualmente em *Actions*). URL: `https://<usuario>.github.io/<repo>/gabinete/`.

Build local equivalente: `NEXT_PUBLIC_BASE_PATH=/eu/gabinete npm run build` (a saída fica em `out/`). Sem a variável, o app roda na raiz.
Detalhes de solicitação e ofício usam `?id=` na URL, pois a exportação estática não gera rotas dinâmicas.

## Publicar na Vercel

1. Importe o repositório na Vercel.
2. Em **Root Directory** selecione `gabinete-digital` (o repositório também contém outro projeto estático).
3. Framework: Next.js (detectado automaticamente). Nenhuma variável de ambiente é necessária.

## Roteiro de demonstração (fluxo completo)

1. Tela inicial → **Cidadão** → *Nova solicitação* → Iluminação pública → local (mapa/bairro/rua) → descrição → foto → enviar. Anote o **protocolo**.
2. Menu **Cidadão ▾** (barra superior) → **Vereadora**. Em *Solicitações* pesquise o protocolo.
3. Atribua a um assessor → **Gerar ofício** (editar, salvar, imprimir/PDF) → **Atualizar status** para *Encaminhada ao órgão responsável* → aba *Conversa*, envie resposta.
4. Volte ao perfil **Cidadão**: sino com notificação, novo status na linha do tempo e a resposta na conversa.
5. Recarregue a página: tudo permanece. *Restaurar dados demonstrativos* na tela inicial.

## Estrutura

```
src/
  app/
    page.tsx                 hub de demonstração / seleção de perfil
    cidadao/                 início, nova (wizard), solicitacoes, detalhe?id=, notificacoes, mandato, contato
    gabinete/                painel, solicitacoes (tabela+kanban), detalhe?id=, oficio?id=, oficios, mapa, comunicacao, equipe
    plataforma/              visão geral SaaS, gabinetes, novo, arquitetura
    privacidade/             política de privacidade demonstrativa
    manifest.ts, icon.svg    base para PWA
  components/                ui, shells (layouts por perfil), city-map (SVG), request-parts, role-switcher
  lib/
    types.ts constants.ts    modelo e metadados (status, categorias, bairros)
    seed.ts                  dados fictícios determinísticos
    repository.ts            interface DataRepository + adaptador localStorage
    store.tsx                estado global, ações e persistência
supabase/schema.sql          modelo relacional + RLS para a etapa futura
ARQUITETURA.md               desenho multi-gabinete
scripts/e2e.mjs              teste de navegação
```

## Funcionalidades

**Cidadão** — início com a vereadora, CTA, minhas solicitações, demandas recentes anonimizadas, projetos de lei, notícias, agenda, contato;
wizard de 5 etapas (categoria, local com mapa simulado, descrição, fotos com prévia, revisão) com protocolo `GD-AAAA-NNNNNN`;
linha do tempo, mensagens complementares, central de notificações, menu inferior mobile.

**Gabinete (assessor/vereadora)** — painel com 8 indicadores e 3 gráficos interativos; tabela e Kanban (arrastar e soltar) com busca e filtros
(status, bairro, categoria, período, responsável); detalhe com prioridade, responsável, observações internas (nunca visíveis ao cidadão),
encaminhamentos, histórico, conversa, documentos, prazo; gerador de ofício editável com pré-visualização A4 e impressão/PDF;
mapa de demandas com concentração; comunicação do mandato (CRUD, publicar/ocultar, bloqueio de conteúdo eleitoral); equipe (cadastro,
permissões, produtividade, distribuição automática de demandas).

**Plataforma (admin)** — gabinetes, municípios, usuários, volume, planos e assinaturas simulados; criação de novo gabinete (foto, logo, cores, equipe) com pré-visualização.

**Transversais** — 4 perfis alternáveis, restauração de dados, estados de carregamento, toasts de sucesso/erro, validações, acessibilidade básica
(rótulos, foco visível, `aria-live`, `prefers-reduced-motion`), mobile first sem rolagem horizontal.

## Simulado vs. real

| Simulado | Observação |
|---|---|
| Autenticação e perfis | Apenas alternância de perfil |
| Banco de dados | `localStorage` (versão `v1`); fotos comprimidas (≈720 px) para caber na cota |
| Mapa | SVG ilustrativo de Taubaté; sem API externa; localizações fictícias |
| Notificações | Geradas no store; sem push/e-mail/WhatsApp |
| Planos/assinaturas | Sem cobrança |
| Ofício/PDF | `window.print()` (salvar como PDF no diálogo do navegador) |
| Multi-gabinete | Modelo com `tenantId`; dados completos apenas do gabinete de Taubaté |

## Limitações

- Dados só existem no navegador/dispositivo; não há sincronização entre dispositivos (apenas entre abas do mesmo navegador).
- Cota do `localStorage` (~5 MB) limita o total de fotos; o app avisa quando a gravação falha.
- Gabinetes criados na área do administrador não possuem dados próprios navegáveis (apenas cadastro/identidade).
- PWA: manifesto e ícone SVG prontos; falta service worker e ícones PNG 192/512 para instalação completa.
- Sem testes unitários; a cobertura é o roteiro E2E (`scripts/e2e.mjs`).
- Não é aconselhamento jurídico: os textos de privacidade e os modelos de ofício são ilustrativos.

## Cuidados jurídicos e de privacidade

Canal de **atendimento parlamentar**, não órgão executor: o app diferencia *encaminhamento parlamentar* de *execução pelo município*,
não promete atendimento pela prefeitura, não pede CPF/título/preferência política, não usa dados reais e não tem recursos de campanha eleitoral.
