"use client";

import { useEffect, useMemo, useState } from "react";
import { gameDevPhases, getGameDevProgress, type GameDevMissionId } from "@/lib/game-dev-roadmap";
import styles from "@/app/aprender/game-dev/game-dev.module.css";

const storageKey = "wayne-game-lab-progress-v1";

export function GameDevRoadmap() {
  const [completed, setCompleted] = useState<GameDevMissionId[]>([]);
  const progress = useMemo(() => getGameDevProgress(completed), [completed]);

  useEffect(() => {
    let restored: GameDevMissionId[] | null = null;
    try {
      const saved = window.localStorage.getItem(storageKey);
      const parsed = saved ? JSON.parse(saved) : null;
      if (Array.isArray(parsed)) restored = parsed as GameDevMissionId[];
    } catch {
      window.localStorage.removeItem(storageKey);
    }
    if (!restored) return;
    const restoreTimer = window.setTimeout(() => setCompleted(restored), 0);
    return () => window.clearTimeout(restoreTimer);
  }, []);

  function toggleMission(id: GameDevMissionId) {
    setCompleted((current) => {
      const next = current.includes(id) ? current.filter((item) => item !== id) : [...current, id];
      window.localStorage.setItem(storageKey, JSON.stringify(next));
      return next;
    });
  }

  function resetProgress() {
    setCompleted([]);
    window.localStorage.removeItem(storageKey);
  }

  return (
    <section className={styles.roadmap} aria-labelledby="roadmap-title">
      <header className={styles.dashboard}>
        <div>
          <span>PAINEL DE MISSÕES</span>
          <h2 id="roadmap-title">Do primeiro protótipo ao primeiro produto.</h2>
          <p>Marque somente o que você realmente entregou. O progresso fica neste dispositivo e não depende de login.</p>
        </div>
        <div className={styles.progressCard}>
          <div><strong>{progress.percentage}%</strong><span>{progress.completedCount}/{progress.total} missões</span></div>
          <div className={styles.progressTrack} aria-label={`${progress.percentage}% da trilha concluída`}><i style={{ width: `${progress.percentage}%` }} /></div>
          <p>{progress.complete ? "Trilha concluída. Agora valide o produto com pessoas reais." : <>Próxima: <strong>{progress.nextMission?.title}</strong></>}</p>
          {progress.completedCount > 0 && <button onClick={resetProgress} type="button">Zerar progresso</button>}
        </div>
      </header>

      <div className={styles.phases}>
        {gameDevPhases.map((phase) => (
          <section className={styles.phase} key={phase.id} aria-labelledby={`phase-${phase.id}`}>
            <header>
              <span>{phase.number}</span>
              <div><h2 id={`phase-${phase.id}`}>{phase.title}</h2><p>{phase.objective}</p></div>
            </header>
            <div className={styles.missions}>
              {phase.missions.map((mission) => {
                const isComplete = completed.includes(mission.id);
                return (
                  <article className={isComplete ? styles.complete : ""} key={mission.id}>
                    <button aria-pressed={isComplete} onClick={() => toggleMission(mission.id)} type="button">
                      <span>{isComplete ? "✓" : ""}</span>
                      <strong>{isComplete ? "ENTREGUE" : "MARCAR ENTREGA"}</strong>
                    </button>
                    <h3>{mission.title}</h3>
                    <p>{mission.description}</p>
                    <div>{mission.skills.map((skill) => <span key={skill}>{skill}</span>)}</div>
                    <small><b>SAÍDA:</b> {mission.deliverable}</small>
                  </article>
                );
              })}
            </div>
          </section>
        ))}
      </div>
    </section>
  );
}
