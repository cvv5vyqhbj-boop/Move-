"use client";

import { useRef } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { CartaoCurso, type CursoDoCartao } from "./cartao-curso";

export type LinhaDaVitrine = {
  titulo: string;
  subtitulo?: string;
  cursos: CursoDoCartao[];
  /** Etiqueta que aparece no primeiro cartao (ex.: "Comece por aqui"). */
  etiqueta?: string;
};

/**
 * Uma fileira da vitrine, que rola para o lado.
 *
 * No celular e no iPad rola com o dedo; no computador aparecem as setas.
 * As setas so existem onde ha ponteiro de verdade (com-mouse), para nao
 * ocuparem espaco em cima do conteudo no toque.
 */
export function LinhaVitrine({ linha }: { linha: LinhaDaVitrine }) {
  const trilho = useRef<HTMLDivElement>(null);

  function rolar(direcao: 1 | -1) {
    const el = trilho.current;
    if (!el) return;
    el.scrollBy({ left: direcao * el.clientWidth * 0.8, behavior: "smooth" });
  }

  if (linha.cursos.length === 0) return null;

  return (
    <section className="group/linha relative">
      <div className="mb-3 flex items-end justify-between gap-3 px-5 md:px-8">
        <div>
          <h2 className="text-base font-semibold tracking-tight text-white">
            {linha.titulo}
          </h2>
          {linha.subtitulo && (
            <p className="text-xs text-white/50">{linha.subtitulo}</p>
          )}
        </div>
      </div>

      <div className="relative">
        <button
          type="button"
          onClick={() => rolar(-1)}
          aria-label="Voltar"
          className="absolute top-0 bottom-0 left-0 z-10 hidden w-10 cursor-pointer items-center justify-center bg-gradient-to-r from-black/70 to-transparent text-white opacity-0 transition-opacity com-mouse:flex group-hover/linha:opacity-100"
        >
          <ChevronLeft size={22} />
        </button>

        <div
          ref={trilho}
          className="flex gap-3 overflow-x-auto scroll-smooth px-5 pb-2 md:px-8 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        >
          {linha.cursos.map((curso, i) => (
            <CartaoCurso
              key={curso.slug}
              curso={curso}
              destaque={i === 0 ? linha.etiqueta : undefined}
            />
          ))}
        </div>

        <button
          type="button"
          onClick={() => rolar(1)}
          aria-label="Avançar"
          className="absolute top-0 right-0 bottom-0 z-10 hidden w-10 cursor-pointer items-center justify-center bg-gradient-to-l from-black/70 to-transparent text-white opacity-0 transition-opacity com-mouse:flex group-hover/linha:opacity-100"
        >
          <ChevronRight size={22} />
        </button>
      </div>
    </section>
  );
}
