# Sites Wayne — NEXUS BRASIL

Mega portal digital brasileiro construído com Next.js, TypeScript e Tailwind CSS. O projeto reúne descoberta, vídeos, inteligência artificial, comunidades, marketplace, educação e jogos em uma experiência única.

## O que já funciona

- homepage premium e totalmente responsiva;
- área comercial Sites Wayne com pacotes, recorrência e briefing local;
- configurador Autopilot com três modelos fixos e prévia ao vivo;
- checkout Mercado Pago, confirmação por webhook e publicação automática;
- página de acompanhamento do pedido e monitoramento técnico diário;
- busca global, tema claro/escuro e notificações;
- páginas de explorar, vídeos, Nexus IA, comunidades, marketplace, cursos, jogos e planos;
- IA em modo demonstração, carrinho, progresso de cursos, comunidades e quiz;
- API server-side preparada para um provedor de IA configurável;
- PWA instalável, metadados, sitemap, robots e páginas legais;
- schema PostgreSQL/Supabase com relacionamentos, índices e políticas RLS;
- layout estabilizado, sem animações que causem tremor no celular.

Autenticação, Realtime, uploads e analytics permanecem em modo demonstração enquanto as respectivas credenciais não forem configuradas. O Autopilot de pagamentos também permanece bloqueado com segurança até Supabase e Mercado Pago estarem configurados.

O botão direto da área de serviços usa o contato comercial público do Sites Wayne. A variável `NEXT_PUBLIC_WHATSAPP_NUMBER`, somente com números e código do país, pode substituir esse contato em outro ambiente. O diagnóstico gera código do lead, referência de investimento, prazo, origem e mensagem pronta sem armazenar dados no servidor.

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

A migration inicial está em `supabase/migrations/202608100001_initial_nexus_schema.sql`. O Autopilot usa também `supabase/migrations/202608170001_wayne_autopilot.sql`, que cria os pedidos privados, ativa RLS e restringe o acesso à chave de serviço. Cadastre administradores pelo painel seguro do Supabase; não existe senha administrativa fixa no código.

## Ativar o Wayne Autopilot

1. Execute as duas migrations no Supabase.
2. Configure na Vercel `NEXT_PUBLIC_SUPABASE_URL` e `SUPABASE_SERVICE_ROLE_KEY`.
3. Crie uma aplicação no Mercado Pago e configure `MERCADO_PAGO_ACCESS_TOKEN`.
4. Cadastre o webhook de pagamentos apontando para `/api/mercado-pago/webhook` e configure `MERCADO_PAGO_WEBHOOK_SECRET` com a assinatura secreta exibida pelo Mercado Pago.
5. Use `MERCADO_PAGO_TEST_MODE=true` durante a homologação; altere para `false` somente após testar o fluxo completo.
6. Configure `CRON_SECRET` para proteger a verificação diária definida em `vercel.json`.

O sistema só publica depois de consultar o pagamento na API do Mercado Pago e validar identificador do pedido, valor e moeda. O nome e o e-mail do comprador não são publicados; somente o conteúdo explicitamente autorizado para o site.

## Segurança

- chaves secretas ficam somente no servidor;
- pagamentos reais devem usar conta pertencente a alguém legalmente autorizado;
- nunca envie access token, service-role key ou segredo do webhook por chat;
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
