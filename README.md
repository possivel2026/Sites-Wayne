# Sites Wayne — NEXUS BRASIL

Mega portal digital brasileiro construído com Next.js, TypeScript e Tailwind CSS. O projeto reúne descoberta, vídeos, inteligência artificial, comunidades, marketplace, educação e jogos em uma experiência única.

## O que já funciona

- homepage premium e totalmente responsiva;
- área comercial Sites Wayne com pacotes, recorrência e briefing local;
- busca global, tema claro/escuro e notificações;
- páginas de explorar, vídeos, Nexus IA, comunidades, marketplace, cursos, jogos e planos;
- IA em modo demonstração, carrinho, progresso de cursos, comunidades e quiz;
- API server-side preparada para um provedor de IA configurável;
- PWA instalável, metadados, sitemap, robots e páginas legais;
- schema PostgreSQL/Supabase com relacionamentos, índices e políticas RLS;
- layout estabilizado, sem animações que causem tremor no celular.

Autenticação, Realtime, uploads, pagamentos e analytics permanecem em modo demonstração enquanto as respectivas credenciais não forem configuradas.

O botão direto para WhatsApp da área de serviços é ativado com `NEXT_PUBLIC_WHATSAPP_NUMBER`, usando apenas números e código do país (ex.: `5511999999999`). Sem essa variável, o visitante consegue copiar o briefing sem enviar dados ao servidor.

## Rodar no computador

Requisitos: Node.js 22.13 ou superior.

```bash
npm ci
cp .env.example .env.local
npm run dev
```

Abra `http://localhost:3000`.

## Verificações

```bash
npm run lint
npm run build
```

## Publicar na Vercel

1. Entre na Vercel e escolha **Add New → Project**.
2. Importe o repositório `possivel2026/Sites-Wayne`.
3. O framework será identificado automaticamente como Next.js.
4. Copie as variáveis necessárias de `.env.example` para as configurações do projeto.
5. Publique primeiro sem chaves externas para testar o modo demonstração.
6. Depois configure Supabase, IA e Mercado Pago usando credenciais de teste.

## Supabase

A migration inicial está em `supabase/migrations/202608100001_initial_nexus_schema.sql`. Ela inclui as principais tabelas, índices e políticas RLS. Cadastre administradores pelo painel seguro do Supabase; não existe senha administrativa fixa no código.

## Segurança

- chaves secretas ficam somente no servidor;
- pagamentos reais devem usar conta pertencente a alguém legalmente autorizado;
- nunca armazene dados de cartão;
- revise RLS, LGPD e documentos legais antes do lançamento comercial;
- mantenha integrações financeiras no ambiente de testes durante o desenvolvimento.

## Estrutura

```text
app/                 páginas, API, SEO e PWA
components/          interface e módulos interativos
config/site.ts       nome e identidade centralizados
public/              ícones e service worker
supabase/migrations/ banco PostgreSQL e RLS
.env.example         variáveis necessárias
```
