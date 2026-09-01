import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Check, Play } from "lucide-react";
import { requireModule } from "@/lib/auth";
import { AREAS, CAPAS, NIVEIS, type Capa } from "@/lib/constants";
import {
  buscarCurso,
  duracao,
  ehRevisao,
  ondeComecar,
  percentual,
  trilhaDaPessoa,
} from "@/lib/cursos";

export const metadata = { title: "Curso — Move" };

export default async function CursoPage({
  params,
}: {
  params: Promise<{ curso: string }>;
}) {
  const user = await requireModule("CURSOS");
  const { curso: slug } = await params;

  // O administrador enxerga tambem o que ainda esta como rascunho, para
  // conferir como ficou antes de publicar.
  const curso = await buscarCurso(slug, user.id, user.role === "ADMIN");
  if (!curso) notFound();

  const trilha = await trilhaDaPessoa(user.id);
  const entrada = ondeComecar(curso, trilha?.nivel ?? null);
  const capa = CAPAS[curso.cover as Capa] ?? CAPAS.laranja;
  const feito = percentual(curso.concluidas, curso.totalAulas);

  return (
    <div className="-m-5 min-h-[calc(100vh-3.5rem)] bg-[#0a0a0f] md:-m-8">
      <section
        className={`relative overflow-hidden bg-gradient-to-br ${capa} px-5 pt-6 pb-16 md:px-8 md:pt-8`}
      >
        <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-[#0a0a0f] to-transparent" />

        <div className="relative">
          <Link
            href="/cursos"
            className="inline-flex items-center gap-2 text-xs text-white/70 transition hover:text-white"
          >
            <ArrowLeft size={14} />
            Voltar para a vitrine
          </Link>

          <div className="mt-6 max-w-2xl">
            {!curso.published && (
              <span className="mb-3 inline-block rounded-full bg-black/50 px-2.5 py-1 text-[10px] font-semibold tracking-wide text-white uppercase">
                Rascunho — só o administrador vê
              </span>
            )}
            <h1 className="text-3xl leading-tight font-bold tracking-tight text-white md:text-4xl">
              {curso.title}
            </h1>
            {curso.subtitle && (
              <p className="mt-2 text-base text-white/85">{curso.subtitle}</p>
            )}
            <p className="mt-3 text-sm text-white/70">
              {NIVEIS[curso.level as keyof typeof NIVEIS] ?? "Base"} ·{" "}
              {curso.totalAulas} {curso.totalAulas === 1 ? "aula" : "aulas"} ·{" "}
              {duracao(curso.minutos)}
              {curso.area
                ? ` · ${AREAS[curso.area as keyof typeof AREAS] ?? curso.area}`
                : ""}
            </p>

            {curso.description && (
              <p className="mt-4 max-w-xl text-sm leading-relaxed text-white/75">
                {curso.description}
              </p>
            )}

            {entrada && (
              <div className="mt-6 flex flex-wrap items-center gap-3">
                <Link
                  href={`/cursos/${curso.slug}/${entrada.aula.id}`}
                  className="inline-flex items-center gap-2 rounded-lg bg-white px-5 py-2.5 text-sm font-semibold text-slate-900 transition hover:bg-white/85"
                >
                  <Play size={16} fill="currentColor" />
                  {entrada.motivo === "continuar"
                    ? "Continuar de onde parou"
                    : "Começar a assistir"}
                </Link>
                {feito > 0 && (
                  <span className="text-xs text-white/70">
                    {feito}% concluído · {curso.concluidas} de{" "}
                    {curso.totalAulas}
                  </span>
                )}
              </div>
            )}
          </div>
        </div>
      </section>

      <div className="px-5 pb-16 md:px-8">
        {entrada && entrada.motivo === "quiz" && (
          <p className="mb-6 rounded-xl border border-[#f26522]/30 bg-[#f26522]/10 px-4 py-3 text-sm text-white/85">
            Pelo seu quiz, o começo deste curso é o módulo{" "}
            <strong className="font-semibold">{entrada.modulo.title}</strong>. O
            que vem antes continua aberto, marcado como revisão.
          </p>
        )}

        {curso.modulos.length === 0 && (
          <p className="py-16 text-center text-sm text-white/50">
            Este curso ainda não tem aulas publicadas.
          </p>
        )}

        <div className="space-y-6">
          {curso.modulos.map((modulo) => {
            const revisao = ehRevisao(modulo.level, trilha?.nivel ?? null);
            const entraAqui = entrada?.modulo.id === modulo.id;

            return (
              <section
                key={modulo.id}
                className={`rounded-2xl border p-5 ${
                  entraAqui
                    ? "border-[#f26522]/50 bg-[#f26522]/[0.06]"
                    : "border-white/10 bg-white/[0.03]"
                }`}
              >
                <header className="mb-4 flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <h2 className="font-semibold text-white">{modulo.title}</h2>
                    {modulo.description && (
                      <p className="mt-1 max-w-xl text-sm text-white/55">
                        {modulo.description}
                      </p>
                    )}
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {entraAqui && (
                      <span className="rounded-full bg-[#f26522] px-2.5 py-1 text-[10px] font-semibold tracking-wide text-white uppercase">
                        Você entra aqui
                      </span>
                    )}
                    {revisao && !entraAqui && (
                      <span className="rounded-full bg-white/10 px-2.5 py-1 text-[10px] font-semibold tracking-wide text-white/60 uppercase">
                        Revisão opcional
                      </span>
                    )}
                    <span className="rounded-full bg-white/10 px-2.5 py-1 text-[10px] font-semibold tracking-wide text-white/60 uppercase">
                      {NIVEIS[modulo.level as keyof typeof NIVEIS] ?? "Base"}
                    </span>
                  </div>
                </header>

                <ol className="space-y-1">
                  {modulo.aulas.map((aula, i) => (
                    <li key={aula.id}>
                      <Link
                        href={`/cursos/${curso.slug}/${aula.id}`}
                        className="flex items-center gap-3 rounded-lg px-3 py-2.5 transition hover:bg-white/[0.06]"
                      >
                        <span
                          className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-[11px] font-semibold ${
                            aula.concluida
                              ? "bg-emerald-500/20 text-emerald-300"
                              : "bg-white/10 text-white/50"
                          }`}
                        >
                          {aula.concluida ? <Check size={13} /> : i + 1}
                        </span>
                        <span className="min-w-0 flex-1">
                          <span className="block truncate text-sm text-white/90">
                            {aula.title}
                          </span>
                          {aula.description && (
                            <span className="block truncate text-xs text-white/40">
                              {aula.description}
                            </span>
                          )}
                        </span>
                        <span className="shrink-0 text-xs text-white/40">
                          {aula.durationMin ? `${aula.durationMin} min` : "—"}
                        </span>
                      </Link>
                    </li>
                  ))}
                  {modulo.aulas.length === 0 && (
                    <li className="px-3 py-2 text-sm text-white/35">
                      Módulo ainda sem aulas.
                    </li>
                  )}
                </ol>
              </section>
            );
          })}
        </div>
      </div>
    </div>
  );
}
