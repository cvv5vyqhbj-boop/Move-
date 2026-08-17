"use client";

import { useEffect, useState } from "react";
import { Moon, Sun } from "lucide-react";

type Tema = "claro" | "escuro";

function detectarTemaAtual(): Tema {
  if (typeof document === "undefined") return "claro";
  return document.documentElement.classList.contains("dark") ? "escuro" : "claro";
}

/**
 * Botão que alterna claro/escuro e guarda a escolha em localStorage.
 *
 * Um script no <head> (ver layout.tsx) já aplica o tema antes do render,
 * então aqui só refletimos o estado atual e trocamos no clique.
 */
export function TrocaTema() {
  const [tema, setTema] = useState<Tema>("claro");

  useEffect(() => {
    setTema(detectarTemaAtual());
  }, []);

  function alternar() {
    const novo: Tema = tema === "escuro" ? "claro" : "escuro";
    const raiz = document.documentElement;
    if (novo === "escuro") raiz.classList.add("dark");
    else raiz.classList.remove("dark");
    try {
      localStorage.setItem("tema-move", novo);
    } catch {
      // sem localStorage (navegação privada, permissão): tudo bem, só não persiste.
    }
    setTema(novo);
  }

  const escuroAtivo = tema === "escuro";

  return (
    <button
      type="button"
      onClick={alternar}
      aria-label={escuroAtivo ? "Trocar para modo claro" : "Trocar para modo escuro"}
      title={escuroAtivo ? "Modo claro" : "Modo escuro"}
      className="flex cursor-pointer items-center gap-2 rounded-lg px-2 py-1.5 text-sm text-slate-500 transition hover:bg-slate-100 hover:text-slate-800"
    >
      {escuroAtivo ? <Sun size={16} /> : <Moon size={16} />}
      <span>{escuroAtivo ? "Modo claro" : "Modo escuro"}</span>
    </button>
  );
}
