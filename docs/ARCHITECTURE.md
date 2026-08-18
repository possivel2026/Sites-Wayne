# Arquitetura — Wayne Digital Ecosystem

## Escopo disponível

Este repositório contém uma aplicação Next.js única que reúne Nexus Brasil, Sites Wayne e Barbearia Wayne. StarkIA/JARVIS/ULTRON não está presente neste repositório e, portanto, não é alterado por este projeto.

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

## Fluxo financeiro

1. O navegador envia somente conteúdo, pacote e consentimento.
2. O servidor determina o preço em centavos.
3. O Mercado Pago cria a preferência com chave de idempotência.
4. O webhook valida assinatura e consulta o pagamento no provedor.
5. Valor, moeda e pedido precisam coincidir.
6. Apenas então o site muda para `published`.

Nunca use o parâmetro de retorno do navegador como prova de pagamento.
