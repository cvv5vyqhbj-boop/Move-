import Link from "next/link";
import { Play } from "lucide-react";
import { CAPAS, NIVEIS, type Capa } from "@/lib/constants";

export type CursoDoCartao = {
  slug: string;
  title: string;
  subtitle: string | null;
  level: string;
  cover: string;
  totalAulas: number;
  concluidas: number;
};

/**
 * Cartao da vitrine. Sem imagem de capa: a cor e a identidade do curso, e o
 * sistema nao depende de ninguem subir arte para ficar apresentavel.
 */
export function CartaoCurso({
  curso,
  destaque,
}: {
  curso: CursoDoCartao;
  /** Marca visual de "é por aqui que você começa". */
  destaque?: string;
}) {
  const percent = curso.totalAulas
    ? Math.round((curso.concluidas / curso.totalAulas) * 100)
    : 0;
  const capa = CAPAS[curso.cover as Capa] ?? CAPAS.laranja;

  return (
    <Link
      href={`/cursos/${curso.slug}`}
      className="group relative block w-[220px] shrink-0 sm:w-[250px]"
    >
      <div
        className={`relative aspect-video overflow-hidden rounded-xl bg-gradient-to-br ${capa} ring-1 ring-white/10 transition-transform duration-200 com-mouse:group-hover:scale-[1.04]`}
      >
        <div className="absolute inset-0 bg-[radial-gradient(120%_100%_at_20%_0%,rgba(255,255,255,0.22),transparent_60%)]" />

        {destaque && (
          <span className="absolute top-2 left-2 rounded-full bg-black/55 px-2 py-0.5 text-[10px] font-semibold tracking-wide text-white uppercase backdrop-blur">
            {destaque}
          </span>
        )}

        <div className="absolute inset-x-0 bottom-0 p-3">
          <p className="line-clamp-2 text-sm leading-snug font-semibold text-white drop-shadow">
            {curso.title}
          </p>
          <p className="mt-0.5 text-[11px] text-white/70">
            {curso.totalAulas} {curso.totalAulas === 1 ? "aula" : "aulas"} ·{" "}
            {NIVEIS[curso.level as keyof typeof NIVEIS] ?? "Base"}
          </p>
        </div>

        <span className="absolute inset-0 flex items-center justify-center opacity-0 transition-opacity com-mouse:group-hover:opacity-100">
          <span className="rounded-full bg-white/90 p-3 text-slate-900 shadow-lg">
            <Play size={18} fill="currentColor" />
          </span>
        </span>

        {percent > 0 && (
          <span className="absolute inset-x-0 bottom-0 block h-1 bg-black/40">
            <span
              className="block h-1 bg-[#f26522]"
              style={{ width: `${percent}%` }}
            />
          </span>
        )}
      </div>

      {curso.subtitle && (
        <p className="mt-2 line-clamp-2 text-xs leading-relaxed text-white/55">
          {curso.subtitle}
        </p>
      )}
    </Link>
  );
}
