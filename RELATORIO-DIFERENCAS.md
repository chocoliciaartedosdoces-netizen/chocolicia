# Relatório de diferenças — Chocolícia

Data da análise: 2026-11-04  

## Resumo executivo

- A Home ganhou consultas ao backend, navegação para `/receitas` e `/promocoes`, uma seção condicional de receitas e uma faixa condicional de promoção.
- Não houve alteração de `client/index.html`, `client/src/index.css`, `vite.config.ts`, `vercel.json`, `client/src/lib/analytics.ts` nem de assets durante esta comparação.
- `pnpm exec tsc --noEmit --pretty false` passou.
- A migration nova não está registrada em `drizzle/meta/_journal.json`; portanto, o `db:migrate` padrão provavelmente não aplicará `0001_receitas_promocoes.sql` automaticamente.
- As rotas dinâmicas `/receitas/:slug` não entram em `PRERENDER_PATHS` nem no sitemap. Elas dependem de execução do cliente + API e não recebem HTML/SEO individual no build atual.
- Não foi possível validar a produção diretamente: tanto `chocolicia.site` quanto `www.chocolicia.site` retornaram erro de resolução DNS nesta sessão. O relatório separa o que foi confirmado no repositório do que depende da produção publicada.

## 1. Inventário de arquivos

### Arquivos novos

`client/src/components/`

- `ContentLayout.tsx` — cabeçalho/rodapé simplificados e CTA fixo de WhatsApp para páginas de conteúdo.

`client/src/pages/`

- `Promocoes.tsx` — página de promoção ativa.
- `Receitas.tsx` — listagem paginada de receitas.
- `ReceitaDetalhe.tsx` — detalhe por slug.

`drizzle/`

- `0001_receitas_promocoes.sql` — criação das tabelas `receitas` e `promocoes`.

`scripts/`

- `seed-receitas.ts` — seed de três receitas e uma promoção.

### Arquivos modificados

`client/src/`

- `App.tsx` — importa e registra as três rotas novas.
- `pages/Home.tsx` — consultas, links de navegação e duas seções novas.
- `seo/routeMeta.ts` — metadados e pré-renderização de `/receitas` e `/promocoes`.

`server/`

- `db.ts` — funções de leitura de receitas/promoções.
- `routers.ts` — procedures públicas tRPC para receitas e promoções.

`drizzle/`

- `schema.ts` — tabelas, tipos e índices novos.

Raiz:

- `package.json` — script `seed:receitas`.

### Arquivos removidos

- Nenhum arquivo foi removido.

### Arquivos sem diferença nesta integração

- `client/index.html`
- `client/src/index.css`
- `vite.config.ts`
- `vercel.json`
- `client/src/lib/analytics.ts`
- Não existe `tailwind.config.*` rastreado; Tailwind 4 continua sendo carregado por `@tailwindcss/vite` e `@import "tailwindcss"`.

## 2. Home — diferenças e impacto

### Backend usado pela Home

Em `client/src/pages/Home.tsx:292-293`, a Home passa a fazer duas consultas públicas:

- `trpc.receitas.recentes.useQuery({ limite: 2 })`.
- `trpc.promocoes.ativa.useQuery()`.

Isso faz a Home depender das tabelas novas e da API. Em caso de banco sem migration, as requests podem falhar; a UI simplesmente não renderiza as seções condicionais, mas haverá erro de API/rede.

### Cabeçalho reorganizado

Em `client/src/pages/Home.tsx:309-319`, os itens `Receitas` e `Promoções` foram acrescentados ao menu desktop e mobile. Em `:335` e `:343`, links de âncora passaram a ser transformados em `/#...`, preservando navegação para seções da Home quando o usuário está em outra rota.

Risco: são links HTML tradicionais, não navegação Wouter; a página é recarregada. Isso é compatível com as rotas Vercel existentes, mas deve ser testado em produção para URLs profundas e fallback.

### Promoção nova

Em `client/src/pages/Home.tsx:518`, é renderizada uma faixa marrom somente quando `promocoes.ativa` retorna dados. O link vai para `/promocoes` e mostra `titulo`.

Dependências: procedure `promocoes.ativa` em `server/routers.ts:44-47`, função `getActivePromotion` em `server/db.ts:125-130` e tabela `promocoes`.

### Receitas novas

Em `client/src/pages/Home.tsx:517`, é renderizada uma seção com até duas receitas, imagem, título, tempo e link para `/receitas/:slug`. Usa fallback visual `/images/og-image.jpg` quando `imagemUrl` está vazio.

Dependências: procedure `receitas.recentes`, tabela `receitas`, dados publicados e assets referenciados pelo seed (`brigadeiros.webp`, `bolo-aniversario.webp`, `cupcakes-rosas.webp`), todos existentes em `client/public/images`.

### Promoção, avaliações, contêineres e proporção de imagens

- Avaliações: não houve alteração no diff contra `main`.
- Contêineres/layout das seções existentes: não houve alteração estrutural fora das duas seções inseridas e dos links do cabeçalho.
- A seção de produtos anterior à inserção foi preservada; as novas seções entram antes de `#buffet`.

## 3. Páginas, rotas e dependências

### `/receitas`

Arquivo: `client/src/pages/Receitas.tsx`. Usa `ContentLayout`, `PageMeta`, `getRouteMeta` e `trpc.receitas.listar`. Pagina nove itens por vez e exibe fallback vazio quando não há receitas.

### `/receitas/:slug`

Arquivo: `client/src/pages/ReceitaDetalhe.tsx`. Usa `useRoute` do Wouter, `ContentLayout`, `PageMeta`, `getRouteMeta`, `trpc.receitas.porSlug` e `WA_ORCAMENTO`. Renderiza resumo, imagem, tempo, rendimento, ingredientes e modo de preparo.

Ponto de atenção: o `PageMeta` é aplicado apenas depois que a receita chega da API. A página de carregamento/erro não recebe metadata específica. O slug dinâmico não está em `PRERENDER_PATHS`.

### `/promocoes`

Arquivo: `client/src/pages/Promocoes.tsx`. Usa `ContentLayout`, `PageMeta`, `getRouteMeta`, `trpc.promocoes.ativa` e `WA_ORCAMENTO`. Exibe promoção ativa ou estado vazio.

### Rotas registradas

`client/src/App.tsx:26-28` registra `/receitas`, `/receitas/:slug` e `/promocoes`, sem modificar as rotas existentes.

### Dados e servidor

- `drizzle/schema.ts:39-68`: tabelas `receitas` e `promocoes`.
- `server/db.ts:101-134`: listagem, detalhe, promoção ativa e busca por slug.
- `server/routers.ts:34-47`: procedures públicas.
- `drizzle/0001_receitas_promocoes.sql`: DDL.
- `scripts/seed-receitas.ts`: seed manual; não é executado por `build`, `start`, `db:migrate` ou deploy Vercel.

## 4. Dependências, Vite, Tailwind e roteamento

### `package.json`

- Dependências de runtime: nenhuma adicionada, removida ou versionada.
- DevDependencies: nenhuma adicionada, removida ou versionada.
- Script novo: `seed:receitas`.
- `pnpm-lock.yaml` não apresenta mudança correspondente.

### `vite.config.ts`

Sem diferença. Continua usando React + `@tailwindcss/vite`, root `client`, saída cliente em `dist/public` e SSR em `dist/server`.

### Tailwind/CSS

Sem diferença em `client/src/index.css` e sem arquivo `tailwind.config.*` rastreado. As páginas novas reutilizam classes já existentes (`button-gold`, `button-outline`, `section-title`, `eyebrow`) e classes utilitárias Tailwind.

Risco de CSS: `ContentLayout` usa classes globais já existentes, mas não cria CSS global novo. O maior risco visual é o layout simplificado não compartilhar o header fixo/dock/estrutura completa da Home.

### Roteamento/pré-renderização

`client/src/seo/routeMeta.ts:22-30` adiciona somente `/receitas` e `/promocoes` ao pré-render. `scripts/prerender.ts` gera HTML para essas duas rotas, mas não para os slugs.

`client/src/seo/buildArtifacts.ts` gera sitemap com base em `routeMeta`; portanto `/receitas` e `/promocoes` entram no sitemap, mas receitas individuais não entram.

## 5. Auditoria crítica de tags e SEO

### Limite da verificação da produção

A tentativa de abrir `https://chocolicia.site/`, `https://www.chocolicia.site/robots.txt` e `https://www.chocolicia.site/sitemap.xml` não conseguiu resolver o host. Não é seguro afirmar o conteúdo atualmente publicado.


`client/index.html` está byte a byte sem diferença contra `main`:

- `<title>` estático: `Doces Artesanais | Chocolícia`.
- description estática e theme-color.
- canonical inicial: `https://www.chocolicia.site/`.
- favicon ICO, PNG 512, apple touch icon e manifest.
- preconnect/font Google.
- loader direto GA4 `G-V7SP1DKR6V` e `gtag('config', 'G-V7SP1DKR6V')`.
- Open Graph: type, URL, title, description, imagem, largura e altura.
- Twitter: card, title, description e imagem.
- Não há meta `google-site-verification` no arquivo local.
- Não há GTM nem `<noscript>` do GTM no arquivo local `main`/working tree.

`client/src/lib/analytics.ts` também não mudou. Ele usa `window.gtag` e fallback para `dataLayer`.

### Divergência crítica sobre GTM

O histórico Git contém commits anteriores com `GTM-P76PMH52`, o script `gtm.js` e `<noscript>` (`30b2ec9`, `656632f`, entre outros), mas `main`/`HEAD` atuais não os contêm. Portanto:

- Se a produção realmente contém o GTM que você informou, então o working tree atual não preserva essa versão e há risco de remoção no próximo deploy.
- O ID GA4 encontrado no repositório é `G-V7SP1DKR6V`; o ID GTM histórico é `GTM-P76PMH52`.
- Meta de verificação do Search Console não foi encontrada no baseline local nem na working tree.

Esta divergência precisa ser resolvida comparando o HTML efetivamente servido ou o commit exato do deploy antes de qualquer integração.

### SEO dinâmico e artefatos

- `PageMeta` atualiza title, description, canonical, OG e Twitter no cliente.
- O pré-render injeta esses dados em `/`, páginas existentes, `/receitas` e `/promocoes`.
- JSON-LD existente continua preservado; as novas páginas não adicionam `Recipe`, `Offer` ou `ItemList` JSON-LD.
- `robots.txt`, `sitemap.xml`, `llms.txt`, `llms-full.txt` e Markdown são gerados somente durante `pnpm build` por `scripts/prerender.ts`; não são arquivos fonte estáticos.
- Não há mudança em `vercel.json`/rewrites. O rewrite existente cobre somente `/api/(.*)`; o funcionamento de deep links depende de como o output pré-renderizado é servido pela Vercel.
- `/receitas/:slug` não recebe página pré-renderizada nem entrada de sitemap; é o principal risco de SEO da feature.

## 6. Conflitos e riscos

1. **Migration não registrada — alto.** `drizzle/0001_receitas_promocoes.sql` existe, mas `drizzle/meta/_journal.json` contém somente `0000_chocolicia_init`. `pnpm db:migrate` pode ignorar a migration nova. Resultado possível: procedures fazem query em tabelas inexistentes.
2. **Produção/GTM não reconciliados — alto.** A produção declarada pelo usuário usa GTM, mas o baseline local não. Um deploy com o estado atual pode remover GTM, noscript e/ou verificação se eles existirem apenas no deploy publicado.
3. **DNS/produção não auditável — alto.** O host não resolveu durante a análise; não houve confirmação de status, redirects, headers, robots ou sitemap publicados.
4. **Receitas dinâmicas sem SSR/sitemap — médio/alto.** Slugs individuais ficam dependentes de JavaScript e API para conteúdo e metadata, prejudicando indexação e compartilhamento.
5. **Banco obrigatório para conteúdo novo — médio.** A Home e páginas novas consultam o banco; não há fallback estático para receitas/promoções. O layout evita quebrar visualmente em alguns estados, mas não evita erros de API.
6. **Seed manual e promoção temporal — médio.** O seed cria `Especial de Natal` com `ativa: true` sem `dataFim`; ela permanecerá ativa indefinidamente até alteração manual.
7. **Erros de API tratados como estado vazio — médio.** A UI diferencia loading, mas não exibe erro específico em `Receitas`/`Promoções`; uma falha de banco pode parecer simplesmente ausência de conteúdo.
8. **Conteúdo de promoção sem escape/validação editorial — baixo/médio.** `linkBotao` é aceito do banco e aberto em nova aba; o backend não valida protocolo/host. É risco operacional se dados administrativos forem inseridos incorretamente.
9. **Duplicação de layout — médio visual.** `ContentLayout` cria header/footer próprios em paralelo ao layout rico da Home. Isso pode gerar inconsistência de navegação, branding e dock entre páginas.
10. **Não há mudanças de URL existente.** As rotas existentes permanecem registradas; as novas URLs são aditivas. Mesmo assim, o fallback Vercel para deep links deve ser validado.
11. **Nenhuma incompatibilidade TypeScript detectada.** O check passou, mas não substitui teste de runtime, migration aplicada, build SSR e smoke test das rotas.

## 7. Plano de integração incremental e reversível

1. **Fixar a verdade da produção.** Obter o HTML/headers atuais do deploy ou o commit exato publicado. Confirmar GTM, GA4, Search Console, canonical, redirects, robots e sitemap. Teste: snapshot do `<head>` e `<noscript>` antes da integração; qualquer tag existente deve ser preservada literalmente.
2. **Preparar banco isoladamente.** Registrar corretamente a migration `0001` no fluxo Drizzle e aplicar em ambiente de staging, sem seed em produção. Teste: `pnpm db:migrate`, queries das quatro procedures e rollback operacional documentado.
3. **Validar backend sem alterar a Home.** Testar listagem, detalhe, promoção ativa, datas inicial/final, banco vazio e banco indisponível. Teste: endpoints tRPC e respostas de erro.
4. **Integrar primeiro as páginas novas.** Publicar `/receitas`, `/receitas/:slug` e `/promocoes` em uma alteração isolada. Teste: carregamento direto, refresh em URL profunda, mobile, links, imagens, estados loading/vazio/erro e metadata.
5. **Resolver SEO de receita individual.** Decidir entre SSR/SSG dinâmico ou estratégia explicitamente noindex. Se indexável, gerar páginas/metadata/JSON-LD `Recipe` e sitemap para cada receita publicada. Teste: HTML sem JavaScript, canonical único, Open Graph e validação de dados estruturados.
6. **Adicionar as seções da Home.** Integrar consultas, navegação, seção de receitas e faixa de promoção. Teste: Home com banco vazio, com dados, com API indisponível, desktop/mobile e regressão visual das seções existentes.
7. **Preservar e verificar tags por diff.** Antes do deploy, comparar `client/index.html` e HTML final gerado com o snapshot da produção. Teste: GTM/GA4 IDs, noscript, Search Console, canonical, favicon, OG/Twitter e ausência de duplicatas.
8. **Deploy canário/reversível.** Fazer deploy preview, executar smoke tests das URLs antigas e novas, checar robots/sitemap/redirects e só então promover. Manter rollback para o último deploy estável.

## Conclusão para aprovação

A feature é pequena no frontend e compila, mas não está pronta para integração direta por causa de dois bloqueios de segurança: a migration não está conectada ao journal Drizzle e a fonte real das tags de produção não está reconciliada com o baseline Git. Recomendo aprovar primeiro a investigação/fix desses dois pontos; nenhuma alteração de aplicação foi feita nesta fase.
