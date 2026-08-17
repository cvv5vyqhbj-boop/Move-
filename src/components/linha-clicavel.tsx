"use client";

import { useRouter } from "next/navigation";
import type { ReactNode } from "react";

/**
 * Linha de tabela em que a linha inteira abre um endereco no clique.
 *
 * Clicar dentro de um link, botao ou campo continua fazendo o que ele faz —
 * o clique so vira "abrir a linha" quando cai em espaco vazio.
 */
export function LinhaClicavel({
  href,
  children,
  title,
}: {
  href: string;
  children: ReactNode;
  title?: string;
}) {
  const router = useRouter();

  return (
    <tr
      className="cursor-pointer border-b border-slate-100 last:border-0 transition-colors hover:bg-marca-50/60"
      title={title ?? "Abrir"}
      onClick={(e) => {
        const alvo = e.target as HTMLElement;
        if (alvo.closest("a, button, input, select, textarea, label")) return;
        router.push(href);
      }}
    >
      {children}
    </tr>
  );
}
