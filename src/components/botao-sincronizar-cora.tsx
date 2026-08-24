"use client";

import { useState, useTransition } from "react";
import { RefreshCw } from "lucide-react";
import { useRouter } from "next/navigation";
import { sincronizarCoraAgora } from "@/app/actions/cora";
import { Button } from "./ui";

type Estado =
  | { tipo: "ocioso" }
  | { tipo: "ok"; entradas: number; saidas: number }
  | { tipo: "erro"; mensagem: string };

/**
 * Botao que puxa o extrato do Cora agora e mostra um resumo do que entrou.
 * So aparece na tela do administrador; a chamada em si e conferida no servidor.
 */
export function BotaoSincronizarCora() {
  const router = useRouter();
  const [estado, setEstado] = useState<Estado>({ tipo: "ocioso" });
  const [rodando, iniciar] = useTransition();

  function sincronizar() {
    setEstado({ tipo: "ocioso" });
    iniciar(async () => {
      const r = await sincronizarCoraAgora();
      if (r.ok) {
        setEstado({
          tipo: "ok",
          entradas: r.entradas ?? 0,
          saidas: r.saidas ?? 0,
        });
        router.refresh();
      } else {
        setEstado({ tipo: "erro", mensagem: r.erro ?? "Erro desconhecido" });
      }
    });
  }

  return (
    <div className="flex flex-wrap items-center gap-3">
      <Button
        type="button"
        variant="secundario"
        onClick={sincronizar}
        disabled={rodando}
        aria-busy={rodando || undefined}
        className="gap-2"
      >
        <RefreshCw
          size={14}
          className={rodando ? "animate-spin" : undefined}
          aria-hidden
        />
        {rodando ? "Sincronizando…" : "Sincronizar com o Cora"}
      </Button>

      {estado.tipo === "ok" && (
        <span className="text-sm text-slate-600">
          {estado.entradas + estado.saidas === 0
            ? "Nada novo no extrato."
            : `Trouxe ${estado.entradas} entrada(s) e ${estado.saidas} saída(s).`}
        </span>
      )}
      {estado.tipo === "erro" && (
        <span className="text-sm text-rose-600" title={estado.mensagem}>
          Não deu para sincronizar: {estado.mensagem.slice(0, 100)}
        </span>
      )}
    </div>
  );
}
