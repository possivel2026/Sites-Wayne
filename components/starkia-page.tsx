"use client";

import { FormEvent, useCallback, useEffect, useState } from "react";
import { ModuleShell } from "@/components/module-shell";

type Device = { id: string; name: string; status: string; token_prefix: string; last_seen_at: string | null };
type Task = { id: string; device_id: string; persona: string; command: string; status: string; result?: Record<string, unknown> | null; error_code?: string | null; created_at: string };

export function StarkiaPage({ ready }: { ready: boolean }) {
  const [devices, setDevices] = useState<Device[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [token, setToken] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const load = useCallback(async () => {
    if (!ready) return;
    const [deviceResponse, taskResponse] = await Promise.all([fetch("/api/starkia/devices"), fetch("/api/starkia/tasks")]);
    const deviceData = await deviceResponse.json() as { devices?: Device[]; error?: string };
    const taskData = await taskResponse.json() as { tasks?: Task[] };
    if (!deviceResponse.ok) { setMessage(deviceData.error || "Entre para ver os dispositivos."); return; }
    setDevices(deviceData.devices || []); setTasks(taskData.tasks || []);
  }, [ready]);
  useEffect(() => { const initial = window.setTimeout(() => load().catch(() => setMessage("Não foi possível consultar o relay.")), 0); const timer = window.setInterval(() => load().catch(() => undefined), 15_000); return () => { window.clearTimeout(initial); window.clearInterval(timer); }; }, [load]);

  async function pair(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); setLoading(true); setMessage("");
    const name = String(new FormData(event.currentTarget).get("name") || "");
    const response = await fetch("/api/starkia/devices", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ name }) });
    const data = await response.json() as { token?: string; error?: string };
    if (response.ok && data.token) { setToken(data.token); await load(); event.currentTarget.reset(); }
    else setMessage(data.error || "Pareamento indisponível.");
    setLoading(false);
  }

  async function send(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); setLoading(true); setMessage("");
    const values = Object.fromEntries(new FormData(event.currentTarget).entries());
    const response = await fetch("/api/starkia/tasks", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(values) });
    const data = await response.json() as { error?: string };
    if (!response.ok) setMessage(data.error || "Não foi possível enviar a tarefa.");
    else { setMessage("Tarefa colocada na fila segura."); await load(); }
    setLoading(false);
  }

  async function revoke(id: string) {
    if (!window.confirm("Revogar este dispositivo? O token deixará de funcionar.")) return;
    await fetch("/api/starkia/devices", { method: "DELETE", headers: { "content-type": "application/json" }, body: JSON.stringify({ id }) }); await load();
  }

  return <ModuleShell active="/automacoes" eyebrow="STARKIA • JARVIS • ULTRON" title="Automação com limites visíveis." description="O computador inicia a conexão de saída, busca tarefas permitidas e devolve resultados auditáveis. Nenhuma porta local é exposta.">
    {!ready ? <section className="feature-unavailable"><span>◷</span><div><strong>Relay seguro ainda não ativado</strong><p>A interface, o banco e os endpoints estão preparados. A ativação só deve ocorrer depois da migration, do segredo do relay e da instalação do agente compatível no StarkIA.</p></div></section> : <div className="starkia-layout">
      {message && <div className="inline-alert starkia-alert">{message}</div>}
      <section className="starkia-panel"><header><div><span>DISPOSITIVOS</span><h2>Computadores pareados</h2></div><em>{devices.filter(isOnline).length} online</em></header>{devices.length ? <div className="device-list">{devices.map((device) => <article key={device.id}><span className={isOnline(device) ? "device-online" : ""}>◆</span><p><strong>{device.name}</strong><small>{isOnline(device) ? "Online agora" : device.last_seen_at ? `Último sinal ${new Date(device.last_seen_at).toLocaleString("pt-BR")}` : "Nunca conectou"} • {device.token_prefix}…</small></p><button onClick={() => revoke(device.id)}>Revogar</button></article>)}</div> : <div className="empty-catalog">Nenhum dispositivo pareado.</div>}
        <form className="pair-form" onSubmit={pair}><label htmlFor="device-name">Novo dispositivo</label><div><input id="device-name" name="name" placeholder="Ex.: PC do escritório" minLength={2} maxLength={80} required/><button disabled={loading}>Gerar token</button></div></form>
        {token && <div className="pair-token"><strong>Copie agora — ele só aparece uma vez</strong><code>{token}</code><button onClick={() => navigator.clipboard.writeText(token)}>Copiar token</button></div>}
      </section>
      <section className="starkia-panel"><header><div><span>NOVA TAREFA</span><h2>Fila segura</h2></div></header>{devices.some((device) => device.status !== "revoked") ? <form className="task-form" onSubmit={send}><label>Dispositivo<select name="deviceId" required>{devices.filter((device) => device.status !== "revoked").map((device) => <option key={device.id} value={device.id}>{device.name}</option>)}</select></label><label>Persona<select name="persona"><option value="jarvis">JARVIS</option><option value="ultron">ULTRON</option></select></label><label>Ação<select name="command"><option value="health">Verificar saúde</option><option value="list_jobs">Listar tarefas locais</option><option value="assistant_message">Mensagem ao assistente</option></select></label><label className="task-message">Mensagem opcional<textarea name="message" maxLength={2000} placeholder="Obrigatória apenas para mensagem ao assistente."/></label><button disabled={loading}>Enviar para a fila</button></form> : <p className="panel-note">Pareie um dispositivo antes de criar tarefas.</p>}
        <div className="task-history"><h3>Histórico real</h3>{tasks.length ? tasks.slice(0,12).map((task) => <article key={task.id}><span className={`task-state ${task.status}`}>{task.status}</span><p><strong>{task.persona.toUpperCase()} • {task.command}</strong><small>{new Date(task.created_at).toLocaleString("pt-BR")}{task.error_code ? ` • ${task.error_code}` : ""}</small></p></article>) : <small>Nenhuma tarefa enviada.</small>}</div>
      </section>
    </div>}
  </ModuleShell>;
}

function isOnline(device: Device) { return device.status === "online" && Boolean(device.last_seen_at) && Date.now() - new Date(device.last_seen_at as string).getTime() < 45_000; }
