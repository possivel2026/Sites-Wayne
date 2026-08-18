# Arquitetura — Wayne Digital Ecosystem

## Escopo disponível

Este repositório contém Nexus Brasil, Sites Wayne e Barbearia Wayne. A integração com o repositório privado StarkIA acontece por um relay HTTPS de saída: o Nexus nunca acessa diretamente o bridge local/Tailscale do computador.

## Camadas

- `app/`: páginas, metadados, estados globais e rotas HTTP.
- `components/`: interfaces compartilhadas do portal e do Autopilot.
- `lib/`: regras de negócio sem interface.
- `lib/server/`: HTTP resiliente, rate limit e logs estruturados exclusivos do servidor.
- `lib/ai/`: configuração e instruções centralizadas da IA.
- `supabase/migrations/`: schema, RLS e hardening incremental.
- `public/`: PWA e arquivos estáticos públicos.

## Integrações

| Serviço | Função | Estado sem credencial | Proteção |
|---|---|---|---|
| Supabase | Pedidos e dados futuros do Nexus | Autopilot bloqueado | service role somente no servidor e RLS |
| Mercado Pago | Checkout e confirmação | Checkout bloqueado | webhook assinado, consulta da cobrança, valor/moeda |
| Provedor de IA | Ferramentas Nexus IA | Demonstração identificada | URL HTTPS, timeout e limite de uso |
| Vercel | Deploy e cron | Site público | CI, preview e segredo do cron |
| TMDB | Catálogo Watch | Módulo desativado | token server-side, cache e rate limit |
| Supabase Auth | Conta e sessão | Módulo desativado | cookies HttpOnly, RLS e refresh token |
| StarkIA Relay | Dispositivos e tarefas | Módulo desativado | token com hash HMAC, allowlist e polling de saída |

## Feature flags

Uma feature fica pronta somente quando a flag explícita e todas as credenciais mínimas estão presentes. O status público contém apenas booleanos; nomes de variáveis ausentes e valores secretos nunca são enviados ao navegador.

## StarkIA sem exposição de rede

1. O usuário autenticado cria um dispositivo e recebe o token apenas uma vez.
2. O banco armazena somente HMAC-SHA-256 do token.
3. O worker Windows chama `/api/starkia/agent/poll` por HTTPS.
4. Uma função PostgreSQL reivindica uma tarefa de forma atômica com `skip locked`.
5. Somente `health`, `list_jobs` e `assistant_message` entram na fila.
6. O DesktopAssistantService mantém as confirmações e políticas de segurança já existentes.
7. O resultado é vinculado ao mesmo dispositivo e permanece auditável.

## Fluxo financeiro

1. O navegador envia somente conteúdo, pacote e consentimento.
2. O servidor determina o preço em centavos.
3. O Mercado Pago cria a preferência com chave de idempotência.
4. O webhook valida assinatura e consulta o pagamento no provedor.
5. Valor, moeda e pedido precisam coincidir.
6. Apenas então o site muda para `published`.

Nunca use o parâmetro de retorno do navegador como prova de pagamento.
