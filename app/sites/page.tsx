import Link from "next/link";
import { ModuleShell } from "@/components/module-shell";

export default function SitesPage() {
  return (
    <ModuleShell
      active="/sites"
      eyebrow="SITES WAYNE"
      title="Sites feitos para funcionar."
      description="Projetos publicados pelo ecossistema Nexus Brasil, reunidos em um só lugar."
      action={<Link className="primary-button" href="/barbearia-wayne">Abrir site em destaque <span>↗</span></Link>}
    >
      <section className="sites-portal-grid" aria-label="Sites publicados">
        <article className="site-portal-card featured">
          <div className="site-browser-preview">
            <div><i /><i /><i /><span>barbearia-wayne</span></div>
            <section>
              <small>BARBEARIA PREMIUM</small>
              <strong>BW</strong>
              <h2>Seu estilo começa<br />no corte certo</h2>
              <b>AGENDAR AGORA</b>
            </section>
          </div>
          <div className="site-portal-info">
            <span className="live-site-badge"><i /> ONLINE</span>
            <h2>Barbearia Wayne</h2>
            <p>Site institucional premium para apresentar serviços e preparar solicitações de agendamento.</p>
            <ul>
              <li>Interface responsiva</li>
              <li>Identidade preto e dourado</li>
              <li>Formulário com privacidade</li>
            </ul>
            <Link className="primary-button" href="/barbearia-wayne">Visitar site <span>↗</span></Link>
          </div>
        </article>

        <aside className="sites-portal-status">
          <span>▧</span>
          <small>PORTFÓLIO EM EXPANSÃO</small>
          <h2>O próximo site pode nascer aqui.</h2>
          <p>Novos projetos serão publicados somente quando estiverem funcionais e prontos para visitantes reais.</p>
          <Link href="/">Voltar ao Nexus <b>→</b></Link>
        </aside>
      </section>
    </ModuleShell>
  );
}
