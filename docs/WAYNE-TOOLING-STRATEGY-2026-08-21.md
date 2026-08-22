# Wayne Tooling Strategy — 2026-08-21

Este documento transforma as dez referências enviadas pelo proprietário em decisões de produto. O princípio é simples: uma lista grande de ferramentas não cria receita por si só. Cada tecnologia só entra quando reduz custo, aumenta conversão ou remove um gargalo já medido.

## Motor de receita prioritário

1. A auditoria gratuita identifica problemas reais e gera uma conversa qualificada.
2. Sites Wayne vende um dos três escopos padronizados: Essencial, Profissional ou Growth.
3. Wayne Care e Wayne Growth criam recorrência após a entrega.
4. O processo é executado, medido e corrigido antes de receber novas automações.
5. StarkIA automatiza apenas etapas estáveis, auditáveis e previamente autorizadas.

Não há promessa de renda automática. Tráfego, oferta, atendimento, entrega e manutenção continuam necessários.

## Referência 1 — sinais de site genérico

Os dez itens da imagem viraram uma auditoria aplicável em `/auditoria`:

| Referência visual | Critério operacional |
|---|---|
| Gradiente | identidade visual coerente, independentemente da técnica usada |
| Botão CTA | ação específica e consequência clara |
| Favicon | ícone, título e descrição próprios |
| Lovable/construtor | ausência de marca ou URL da ferramenta na experiência do cliente |
| Serif | hierarquia tipográfica legível e consistente |
| Prova social | somente projetos, depoimentos e números verificáveis |
| Domínio | endereço confiável; domínio próprio após validação de receita |
| Copy | público, problema, solução e próximo passo específicos |
| Rodapé | contato, autoria e documentos aplicáveis |
| Estrutura | ordem alinhada à decisão do cliente |

Gradientes, botões e serifas não são defeitos isolados. O problema é copiar uma fórmula sem identidade, evidência ou função comercial.

## Referência 2 — conjunto de ferramentas

| Ferramenta/ideia | Decisão Wayne |
|---|---|
| ChatGPT | apoio de pesquisa, código e operação; nunca substitui validação |
| Claude | alternativa de laboratório, sem dependência obrigatória |
| InfinitePay e Stripe | não entram agora; Mercado Pago já é o provedor escolhido |
| VS Code | ambiente principal de desenvolvimento |
| Notion | opcional para documentação futura; nenhum dado crítico depende dele |
| Hermes Agent | não adotado até identificar projeto, licença e modelo de segurança exatos |
| n8n | candidato para fluxos recorrentes após homologação; exige revisão da licença e dos segredos |

Adicionar provedores de pagamento concorrentes antes da primeira operação validada aumentaria suporte, conciliação e risco sem aumentar demanda.

## Referência 3 — produção 3D

A imagem descreve uma cadeia profissional completa: referência, conceito, blockout, escultura, roupas, hard surface, retopologia, UV, baking, texturas, cabelo, lookdev, rig, personagem em tempo real, render e portfólio.

Isso fica registrado como futuro **Wayne Creative Pipeline**, separado do motor de caixa atual. As etapas serão preservadas, mas as diversas ferramentas pagas não serão instaladas em massa. O software será escolhido somente quando existir um primeiro produto 3D definido, começando por opções compatíveis com o orçamento.

## Referências 4 a 10 — fontes e automação

As fontes foram verificadas nos repositórios oficiais em 2026-08-21:

- [sindresorhus/awesome](https://github.com/sindresorhus/awesome): índice para descobrir listas especializadas; não é uma dependência do produto.
- [public-apis/public-apis](https://github.com/public-apis/public-apis): catálogo de APIs candidatas; cada API ainda exige verificação própria de licença, privacidade, estabilidade e custo.
- [D4Vinci/Scrapling](https://github.com/D4Vinci/Scrapling): framework de coleta web. Wayne permite somente coleta autorizada de conteúdo público, respeitando termos, robots, limites e direitos; recursos de evasão de anti-bot não serão usados.
- [ripienaar/free-for-dev](https://github.com/ripienaar/free-for-dev): pesquisa de tiers gratuitos. Limites e preços devem ser revistos antes de qualquer dependência de produção.
- [ollama/ollama](https://github.com/ollama/ollama): permanece como núcleo local e privado do StarkIA/JARVIS.
- [langflow-ai/langflow](https://github.com/langflow-ai/langflow): laboratório visual para protótipos de agentes, APIs e MCP; não entra no caminho crítico antes de um fluxo validado.
- [punkpeye/awesome-mcp-servers](https://github.com/punkpeye/awesome-mcp-servers): índice de descoberta. Nenhum servidor MCP é instalado sem revisão de permissões, origem e tratamento de dados.
- [n8n-io/n8n](https://github.com/n8n-io/n8n): candidato a orquestração com aprovações humanas. É source-available/fair-code, não simplesmente uma dependência MIT.

## Referências 11 a 14 — design, agentes e games

As quatro referências adicionais foram verificadas em 2026-08-21 e receberam papéis diferentes:

- [nexu-io/open-design](https://github.com/nexu-io/open-design): projeto Apache 2.0, local-first, com design systems e integração a agentes. Wayne adotou agora o conceito de contrato visual por meio do `DESIGN.md`. O aplicativo completo fica no laboratório: exige Node 24 ou Docker, daemon protegido e modelos locais/BYOK ou serviço comercial; não é dependência do site em produção.
- [Shubhamsaboo/awesome-llm-apps](https://github.com/Shubhamsaboo/awesome-llm-apps): catálogo Apache 2.0 com agentes, skills e exemplos de RAG. Serve para descobrir padrões; cada pasta possui dependências, provedores e riscos próprios. Nada será clonado, executado ou vendido sem auditoria individual de código, licença, dados e custo.
- [OpenHands/OpenHands](https://github.com/OpenHands/OpenHands): painel de agentes em beta, licença MIT. O próprio quickstart alerta que a execução sem sandbox concede acesso total ao sistema de arquivos. Por isso, um teste futuro exige contêiner/VM isolada, diretório mínimo, segredos temporários e proibição de acesso a produção, pagamentos ou dados pessoais.
- A árvore de habilidades de jogos virou a trilha pública `/aprender/game-dev`: fundamentos, matemática, Unreal/Blueprints, Blender, gameplay, áudio, multiplayer adiado até necessidade, testes, portfólio e publicação consciente. O progresso fica no dispositivo e não cria certificado fictício.

### Ordem do Wayne Game Lab

1. Blueprints e lógica antes de C++ avançado.
2. Greybox antes de arte final.
3. Jogo solo estável antes de multiplayer.
4. Build pequena antes de loja.
5. Um produto demonstrável por ciclo: asset pack, protótipo para cliente ou mini-jogo.

Steam, Google Play e App Store exigem revisão de conta, taxas, classificação, privacidade e suporte. Nenhuma publicação paga ou conta comercial é criada automaticamente; para menor de idade, o responsável participa das etapas contratuais e financeiras.

## Regra de entrada de tecnologia

Uma ferramenta nova só entra se passar por todos os gates:

1. problema real e repetido;
2. ganho mensurável;
3. licença e custo compatíveis;
4. tratamento de dados aceitável;
5. segredos fora de código, navegador e logs;
6. teste em ambiente isolado;
7. rollback documentado;
8. aprovação humana para pagamentos, publicação ou ações sensíveis.

## Próximas métricas

- visitas em `/auditoria`;
- auditorias completas;
- cliques para revisão no WhatsApp;
- propostas enviadas;
- vendas por pacote;
- adesão à manutenção;
- tempo real de entrega e número de revisões.

Somente depois de dez operações completas o fluxo vencedor deve ser automatizado e escalado.
