"use client";

import { useState } from "react";
import Link from "next/link";
import { clsx } from "clsx";
import { Bell } from "lucide-react";
import type { Aviso } from "@/lib/avisos";

/** Sino do topo: o que precisa de atenção hoje. */
export function SinoAvisos({ avisos }: { avisos: Aviso[] }) {
  const [aberto, setAberto] = useState(false);
  const urgentes = avisos.filter((a) => a.urgente).length;

  return (
    <div className="relative">
      <button
        onClick={() => setAberto((v) => !v)}
        className="relative cursor-pointer rounded-lg p-2 text-slate-500 transition hover:bg-slate-100"
        aria-label={`Avisos (${avisos.length})`}
      >
        <Bell size={20} />
        {avisos.length > 0 && (
          <span
            className={clsx(
              "absolute top-0.5 right-0.5 flex h-4 min-w-4 items-center justify-center rounded-full px-1 text-[10px] font-semibold text-white",
              urgentes > 0 ? "bg-rose-500" : "bg-marca-500",
            )}
          >
            {avisos.length}
          </span>
        )}
      </button>

      {aberto && (
        <>
          {/* Clicar fora fecha */}
          <div className="fixed inset-0 z-40" onClick={() => setAberto(false)} />

          <div className="absolute right-0 z-50 mt-2 w-80 max-w-[calc(100vw-2rem)] overflow-hidden rounded-xl border border-slate-200 bg-white shadow-lg">
            <div className="border-b border-slate-100 px-4 py-3">
              <p className="font-semibold text-slate-900">Precisa de atenção</p>
            </div>

            {avisos.length === 0 ? (
              <p className="px-4 py-8 text-center text-sm text-slate-400">
                Nada atrasado. Tudo em dia.
              </p>
            ) : (
              <ul className="max-h-96 divide-y divide-slate-100 overflow-y-auto">
                {avisos.map((a, i) => (
                  <li key={i}>
                    <Link
                      href={a.link}
                      onClick={() => setAberto(false)}
                      className="block px-4 py-3 transition hover:bg-slate-50"
                    >
                      <p className="text-sm font-medium text-slate-800">
                        {a.texto}
                      </p>
                      <p
                        className={clsx(
                          "mt-0.5 text-xs",
                          a.urgente ? "text-rose-600" : "text-slate-500",
                        )}
                      >
                        {a.detalhe}
                      </p>
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </>
      )}
    </div>
  );
}
