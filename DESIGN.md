# NEXUS Design Contract

Este arquivo é o contrato visual e editorial para pessoas e agentes que alteram o Nexus Brasil. Ele transforma identidade em regras verificáveis; não substitui teste com usuários nem revisão humana.

## Direção

- A experiência deve parecer um centro operacional brasileiro: precisa, ambiciosa e confiável.
- Evidência vem antes de espetáculo. Não publicar usuários, vendas, avaliações, cursos ou integrações fictícias.
- Uma página deve possuir uma ação principal clara. Ações secundárias não podem competir com ela.
- Gradientes, brilho e transparência são acentos, não identidade automática.
- Reutilizar componentes existentes antes de criar uma nova linguagem visual.

## Sistema visual

- Fundo principal: `#07080d`; superfícies: `#11131b` e `#151824`.
- Texto principal: `#f4f5fa`; texto secundário: `#8c92a6`.
- Roxo `#7357ff` representa o Nexus; ciano `#27ddf3` sinaliza ação, tecnologia e progresso.
- Verde indica somente estado positivo real; amarelo indica atenção; vermelho indica erro ou risco.
- Tipografia padrão: Geist/Inter/system. Não adicionar fonte sem ganho legível e licença verificada.
- Bordas são discretas e estruturais. Arredondamento padrão entre 8 e 14 px; círculos ficam para avatares e estados.

## Composição

- Começar por objetivo, prova/estado e ação; depois detalhes.
- Limitar cada seção a uma ideia dominante.
- Preservar ritmo vertical e alinhamento em grade. Evitar cartões repetidos sem hierarquia.
- Interfaces de trabalho usam painéis planos; efeitos decorativos ficam concentrados no hero ou em uma única peça visual.
- Mobile não é redução mecânica: CTA, progresso e conteúdo essencial aparecem antes de detalhes.

## Copy

- Escrever em português brasileiro, com verbos concretos e consequências claras.
- Evitar “revolucione”, “transforme sua presença”, “renda automática” e superlativos sem evidência.
- Diferenciar explicitamente: publicado, beta, em preparação, indisponível e planejado.
- Preço, prazo, prova e estatística precisam ter origem verificável.

## Interação e acesso

- Elementos interativos precisam de nome acessível, foco visível e estado discernível sem depender apenas de cor.
- Texto comum deve permanecer legível em celular; não reduzir informação importante para aparência de dashboard.
- Respeitar preferência de movimento reduzido em novas animações.
- Nenhum formulário coleta dado que não seja necessário para a ação informada.

## Gate de entrega

Antes de publicar uma mudança visual:

1. confirmar o objetivo comercial ou operacional;
2. testar teclado, mobile e contraste;
3. remover conteúdo fictício ou marcar o estado real;
4. executar lint, TypeScript, testes e build;
5. revisar o diff, segredos e dependências;
6. validar a prévia antes do merge.
