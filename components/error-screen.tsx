"use client";

import Link from "next/link";
import styles from "@/app/status.module.css";

export function ErrorScreen({ code, title, description, retry }: { code: string; title: string; description: string; retry?: () => void }) {
  return <main className={styles.screen}><section><span>{code}</span><h1>{title}</h1><p>{description}</p><div>{retry && <button onClick={retry}>Tentar novamente</button>}<Link href="/">Voltar ao início</Link></div><small>Se o problema continuar, anote o código acima.</small></section></main>;
}
