import Link from "next/link";
import { Play, Info } from "lucide-react";
import { CAPAS, NIVEIS, type Capa } from "@/lib/constants";
import { duracao, type CursoCompleto, type PontoDeEntrada } from "@/lib/cursos";

/** Frase que explica a indicacao. E o quiz falando, em uma linha. */
function explicacao(entrada: PontoDeEntrada | null) {
  if (!entrada) return "Curso ainda sem aulas publicadas.";
  switch (entrada.motivo) {
    case "continuar":
      return `Você parou em “${entrada.aula.title}”.`;
    case "quiz":
      return `Pelo quiz, você entra direto no módulo “${entrada.modulo.title}”. O que vem antes fica como revisão.`;
    case "revisao":
      return "Você já concluiu este curso. Rever é opcional.";
    default:
      return `Começa em “${entrada.aula.title}”.`;
  }
}

function textoDoBotao(entrada: PontoDeEntrada | null) {
  if (!entrada) return "Ver o curso";
  if (entrada.motivo === "continuar") return "Continuar assistindo";
  if (entrada.motivo === "revisao") return "Assistir de novo";
  return "Começar a assistir";
}

/** O bloco grande do topo da vitrine: um curso, uma razao e um botao. */
export function DestaqueCurso({
  curso,
  entrada,
  chamada,
}: {
  curso: CursoCompleto;
  entrada: PontoDeEntrada | null;
  /** Etiqueta pequena acima do titulo (ex.: "Indicado para você"). */
  chamada: string;
}) {
  const capa = CAPAS[curso.cover as Capa] ?? CAPAS.laranja;

  return (
    <section
      className={`relative overflow-hidden bg-gradient-to-br ${capa} px-5 pt-10 pb-24 md:px-8 md:pt-16 md:pb-32`}
    >
      <div className="absolute inset-0 bg-[radial-gradient(120%_90%_at_15%_0%,rgba(255,255,255,0.18),transparent_55%)]" />
      <div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-[#0a0a0f] to-transparent" />

      <div className="relative max-w-2xl">
        <p className="text-[11px] font-semibold tracking-[0.18em] text-white/70 uppercase">
          {chamada}
        </p>
        <h1 className="mt-2 text-3xl leading-tight font-bold tracking-tight text-white md:text-5xl">
          {curso.title}
        </h1>
        {curso.subtitle && (
          <p className="mt-3 text-base text-white/85 md:text-lg">
            {curso.subtitle}
          </p>
        )}

        <p className="mt-4 text-sm text-white/70">
          {NIVEIS[curso.level as keyof typeof NIVEIS] ?? "Base"} ·{" "}
          {curso.totalAulas} {curso.totalAulas === 1 ? "aula" : "aulas"} ·{" "}
          {duracao(curso.minutos)}
        </p>

        <p className="mt-4 max-w-xl text-sm leading-relaxed text-white/80">
          {explicacao(entrada)}
        </p>

        <div className="mt-6 flex flex-wrap gap-3">
          <Link
            href={
              entrada
                ? `/cursos/${curso.slug}/${entrada.aula.id}`
                : `/cursos/${curso.slug}`
            }
            className="inline-flex items-center gap-2 rounded-lg bg-white px-5 py-2.5 text-sm font-semibold text-slate-900 transition hover:bg-white/85"
          >
            <Play size={16} fill="currentColor" />
            {textoDoBotao(entrada)}
          </Link>

          <Link
            href={`/cursos/${curso.slug}`}
            className="inline-flex items-center gap-2 rounded-lg bg-black/35 px-5 py-2.5 text-sm font-semibold text-white backdrop-blur transition hover:bg-black/50"
          >
            <Info size={16} />
            Ver o conteúdo
          </Link>
        </div>
      </div>
    </section>
  );
}
