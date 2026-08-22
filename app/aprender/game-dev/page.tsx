import type { Metadata } from "next";
import Link from "next/link";
import { GameDevRoadmap } from "@/components/game-dev-roadmap";
import { ModuleShell } from "@/components/module-shell";
import styles from "./game-dev.module.css";

export const metadata: Metadata = {
  title: "Wayne Game Lab — Trilha de desenvolvimento de jogos",
  description: "Uma trilha prática de doze missões: fundamentos, Unreal Engine, Blender, produção, portfólio e lançamento consciente.",
};

export default function GameDevPage() {
  return (
    <ModuleShell
      active="/aprender"
      eyebrow="NEXUS ACADEMY • WAYNE GAME LAB"
      title="Pare de colecionar tutoriais. Termine um jogo pequeno."
      description="Uma rota prática baseada em fundamentos, desenvolvimento, produção e lançamento. Blueprints primeiro, C++ quando houver necessidade e uma entrega verificável em cada missão."
      action={<Link className={styles.heroLink} href="/jogos">TESTAR CONHECIMENTO <span>→</span></Link>}
    >
      <section className={styles.principles} aria-label="Princípios da trilha">
        <article><span>01</span><h2>Unreal + Blender</h2><p>Ferramentas centrais da primeira rota, sem comprar software antes de existir uma necessidade comprovada.</p></article>
        <article><span>02</span><h2>Uma build por fase</h2><p>Conhecimento só conta quando gera protótipo, vertical slice, build estável ou produto demonstrável.</p></article>
        <article><span>03</span><h2>Publicação consciente</h2><p>Lojas, taxas, classificação, privacidade e conta do responsável são revisadas antes de qualquer gasto.</p></article>
      </section>

      <GameDevRoadmap />

      <section className={styles.business} aria-labelledby="business-title">
        <div><span>MODELOS DE RECEITA</span><h2 id="business-title">Três saídas. Escolha uma por ciclo.</h2><p>O Game Lab não promete renda; ele transforma estudo em ativos que podem ser demonstrados, testados e vendidos.</p></div>
        <div>
          <article><b>01</b><h3>Pacotes de assets</h3><p>Modelos, materiais ou kits originais com licença clara e demonstração dentro do motor.</p></article>
          <article><b>02</b><h3>Protótipos para clientes</h3><p>Experiências pequenas para educação, apresentação de produto ou eventos, com escopo fechado.</p></article>
          <article><b>03</b><h3>Mini-jogo próprio</h3><p>Uma experiência curta com demo real; monetização só depois de testes, custos e público validados.</p></article>
        </div>
      </section>

      <p className={styles.notice}>Multiplayer, lojas pagas e agentes autônomos não entram antes de uma build simples funcionar. Validar primeiro, automatizar depois, escalar por último.</p>
    </ModuleShell>
  );
}
