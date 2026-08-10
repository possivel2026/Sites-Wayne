# Sites Wayne — NEXUS BRASIL

Mega portal digital brasileiro construído com Next.js, TypeScript e Tailwind CSS. O projeto reúne descoberta, vídeos, inteligência artificial, comunidades, marketplace, educação e jogos em uma experiência única.

## O que já funciona

- homepage premium e totalmente responsiva;
- busca global, tema claro/escuro e notificações;
- páginas de explorar, vídeos, Nexus IA, comunidades, marketplace, cursos, jogos e planos;
- IA em modo demonstração, carrinho, progresso de cursos, comunidades e quiz;
- API server-side preparada para um provedor de IA configurável;
- autenticação real com cadastro, login, confirmação de e-mail, sessão persistente, recuperação de senha e logout;
- área `/conta` protegida no servidor com validação do token;
- PWA instalável, metadados, sitemap, robots e páginas legais;
- schema PostgreSQL/Supabase com relacionamentos, índices e políticas RLS;
- layout estabilizado, sem animações que causem tremor no celular.

O login fica automaticamente indisponível, sem simular sucesso, enquanto as variáveis públicas do Supabase não forem configuradas. Realtime, uploads, pagamentos e analytics continuam pendentes.

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
5. Configure o Supabase conforme a seção abaixo.
6. Faça um novo deploy para ativar login e cadastro.

## Ativar o login com Supabase

1. Crie um projeto no Supabase e abra **SQL Editor**.
2. Execute, na ordem, os arquivos de `supabase/migrations/`.
3. Em **Project Settings → API** ou **Connect**, copie a URL e a chave publicável.
4. Na Vercel, abra **Settings → Environment Variables** e adicione:

```text
NEXT_PUBLIC_SUPABASE_URL=https://SEU-PROJETO.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=sb_publishable_...
```

5. No Supabase, abra **Authentication → URL Configuration** e defina:

```text
Site URL: https://sites-wayne.vercel.app
Redirect URLs:
http://localhost:3000/**
https://sites-wayne.vercel.app/**
```

6. Faça um redeploy na Vercel e teste cadastro, confirmação por e-mail, login, recuperação e logout.

A migration inicial cria as tabelas e políticas RLS; a segunda endurece a criação automática de perfis. Para produção, configure SMTP próprio no Supabase, pois o serviço de e-mail padrão é limitado. Cadastre administradores somente pelo painel seguro; não existe senha administrativa fixa no código.

## Segurança

- chaves secretas ficam somente no servidor;
- a chave publicável pode ficar no navegador; nunca exponha a `service_role`;
- páginas privadas validam o JWT no servidor com `getClaims()`;
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
