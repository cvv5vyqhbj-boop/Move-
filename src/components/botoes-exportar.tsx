"use client";

import { Download, Printer } from "lucide-react";

/**
 * Baixar em planilha (abre no Excel) e imprimir.
 * Na janela de impressão dá para escolher "Salvar como PDF".
 */
export function BotoesExportar({ arquivo }: { arquivo: string }) {
  const estilo =
    "flex cursor-pointer items-center gap-2 rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50";

  return (
    <div className="flex gap-2 print:hidden">
      <a href={arquivo} className={estilo}>
        <Download size={16} />
        Baixar planilha
      </a>
      <button type="button" onClick={() => window.print()} className={estilo}>
        <Printer size={16} />
        Imprimir / PDF
      </button>
    </div>
  );
}
