"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@supabase/supabase-js";
import { CANAL, EVENTO } from "@/lib/eventos";

/** De quanto em quanto tempo procurar novidades, quando não há tempo real. */
const SEGUNDOS_ENTRE_CONFERIDAS = 5;

/**
 * Mantém a tela sempre com os dados mais novos.
 *
 * Com o Supabase configurado, a tela de todo mundo se atualiza no instante em
 * que alguém salva. Sem ele, o navegador confere sozinho a cada poucos
 * segundos — mais devagar, mas ninguém precisa apertar F5.
 *
 * Nos dois casos, também atualiza quando a pessoa volta para a aba.
 */
export function AtualizacaoAutomatica() {
  const router = useRouter();

  useEffect(() => {
    let agendado: ReturnType<typeof setTimeout> | undefined;

    // Junta avisos que chegam quase juntos numa atualização só.
    const atualizar = () => {
      clearTimeout(agendado);
      agendado = setTimeout(() => router.refresh(), 150);
    };

    const aoVoltarParaAba = () => {
      if (document.visibilityState === "visible") atualizar();
    };
    document.addEventListener("visibilitychange", aoVoltarParaAba);

    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const chave = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    // --- Caminho rápido: aviso na hora, pelo Supabase ---------------------
    if (url && chave) {
      const supabase = createClient(url, chave, {
        auth: { persistSession: false },
      });
      const canal = supabase
        .channel(CANAL)
        .on("broadcast", { event: EVENTO }, atualizar)
        .subscribe();

      return () => {
        clearTimeout(agendado);
        supabase.removeChannel(canal);
        document.removeEventListener("visibilitychange", aoVoltarParaAba);
      };
    }

    // --- Sem Supabase: confere sozinho de tempos em tempos ----------------
    const relogio = setInterval(() => {
      // Só quando a aba está à vista, para não gastar à toa.
      if (document.visibilityState === "visible") router.refresh();
    }, SEGUNDOS_ENTRE_CONFERIDAS * 1000);

    return () => {
      clearTimeout(agendado);
      clearInterval(relogio);
      document.removeEventListener("visibilitychange", aoVoltarParaAba);
    };
  }, [router]);

  return null;
}
