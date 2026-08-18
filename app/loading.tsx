import styles from "./status.module.css";

export default function Loading() {
  return <main className={styles.screen} aria-busy="true" aria-label="Carregando"><section className={styles.skeleton}><i /><i /><i /><i /></section></main>;
}
