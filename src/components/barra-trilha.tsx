import { refazerQuiz, trocarNivel } from "@/app/actions/cursos";
import { NIVEIS } from "@/lib/constants";
import type { TrilhaDaPessoa } from "@/lib/cursos";

/**
 * Faixa fina no topo da vitrine: qual trilha o quiz apontou, em que nivel a
 * pessoa entrou e como mudar isso sem depender de ninguem.
 */
export function BarraTrilha({ trilha }: { trilha: TrilhaDaPessoa }) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-4 border-b border-white/10 bg-black/40 px-5 py-3 md:px-8">
      <div>
        <p className="text-[11px] font-semibold tracking-[0.18em] text-white/45 uppercase">
          Sua trilha
        </p>
        <p className="text-sm font-semibold text-white">{trilha.name}</p>
        {trilha.tagline && (
          <p className="text-xs text-white/50">{trilha.tagline}</p>
        )}
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <form action={trocarNivel} className="flex items-center gap-2">
          <label className="text-xs text-white/50" htmlFor="nivel-da-pessoa">
            Entro em
          </label>
          <select
            id="nivel-da-pessoa"
            name="nivel"
            defaultValue={trilha.nivel}
            className="cursor-pointer rounded-lg border border-white/15 bg-white/10 px-3 py-1.5 text-xs text-white outline-none focus:border-white/40"
          >
            {Object.entries(NIVEIS).map(([valor, texto]) => (
              <option key={valor} value={valor} className="text-slate-900">
                {texto}
              </option>
            ))}
          </select>
          <button
            type="submit"
            className="cursor-pointer rounded-lg border border-white/15 px-3 py-1.5 text-xs text-white/80 transition hover:bg-white/10"
          >
            Ajustar
          </button>
        </form>

        <form action={refazerQuiz}>
          <button
            type="submit"
            className="cursor-pointer rounded-lg px-3 py-1.5 text-xs text-white/60 transition hover:bg-white/10 hover:text-white"
          >
            Refazer o quiz
          </button>
        </form>
      </div>
    </div>
  );
}
