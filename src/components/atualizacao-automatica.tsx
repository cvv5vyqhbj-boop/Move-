"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

/**
 * Mantém a tela sempre com os dados mais novos.
 *
 * Fica ouvindo o servidor: assim que alguém da equipe salva qualquer coisa, a
 * tela de todo mundo se atualiza sozinha. Também atualiza quando a pessoa volta
 * para a aba, caso a conexão tenha caído nesse meio tempo.
 */
export function AtualizacaoAutomatica() {
  const router = useRouter();

  useEffect(() => {
    let agendado: ReturnType<typeof setTimeout> | undefined;

    // Junta avisos que chegam quase juntos numa atualizacao so.
    const atualizar = () => {
      clearTimeout(agendado);
      agendado = setTimeout(() => router.refresh(), 150);
    };

    const conexao = new EventSource("/api/atualizacoes");
    conexao.onmessage = atualizar;

    const aoVoltarParaAba = () => {
      if (document.visibilityState === "visible") atualizar();
    };
    document.addEventListener("visibilitychange", aoVoltarParaAba);

    return () => {
      clearTimeout(agendado);
      conexao.close();
      document.removeEventListener("visibilitychange", aoVoltarParaAba);
    };
  }, [router]);

  return null;
}
