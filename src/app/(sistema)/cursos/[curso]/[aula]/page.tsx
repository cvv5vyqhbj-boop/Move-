import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Check, ExternalLink, FileText, Play } from "lucide-react";
import { requireModule } from "@/lib/auth";
import { marcarAula } from "@/app/actions/cursos";
import { NIVEIS } from "@/lib/constants";
import {
  buscarCurso,
  ehRevisao,
  embedDoVideo,
  percentual,
  proximaAula,
  trilhaDaPessoa,
} from "@/lib/cursos";

export const metadata = { title: "Aula — Move" };

export default async function AulaPage({
  params,
}: {
  params: Promise<{ curso: string; aula: string }>;
}) {
  const user = await requireModule("CURSOS");
  const { curso: slug, aula: aulaId } = await params;

  const curso = await buscarCurso(slug, user.id, user.role === "ADMIN");
  if (!curso) notFound();

  const atual = curso.modulos
    .flatMap((m) => m.aulas.map((a) => ({ aula: a, modulo: m })))
    .find((i) => i.aula.id === aulaId);
  if (!atual) notFound();

  const trilha = await trilhaDaPessoa(user.id);
  const proxima = proximaAula(curso, aulaId);
  const video = embedDoVideo(atual.aula.videoUrl);
  const feito = percentual(curso.concluidas, curso.totalAulas);

  return (
    <div className="-m-5 min-h-[calc(100vh-3.5rem)] bg-[#0a0a0f] md:-m-8">
      <div className="border-b border-white/10 px-5 py-3 md:px-8">
        <Link
          href={`/cursos/${curso.slug}`}
          className="inline-flex items-center gap-2 text-xs text-white/60 transition hover:text-white"
        >
          <ArrowLeft size={14} />
          {curso.title}
        </Link>
      </div>

      <div className="grid gap-6 px-5 py-6 md:px-8 lg:grid-cols-[minmax(0,1fr)_320px]">
        <div className="min-w-0">
          <div className="overflow-hidden rounded-2xl bg-black ring-1 ring-white/10">
            {video ? (
              <div className="relative aspect-video">
                <iframe
                  src={video}
                  title={atual.aula.title}
                  className="absolute inset-0 h-full w-full"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; fullscreen"
                  allowFullScreen
                />
              </div>
            ) : (
              <div className="flex aspect-video flex-col items-center justify-center gap-3 px-6 text-center">
                <span className="rounded-full bg-white/10 p-4 text-white/40">
                  <Play size={22} />
                </span>
                <p className="text-sm text-white/70">
                  Esta aula ainda não tem vídeo publicado.
                </p>
                {atual.aula.videoUrl ? (
                  <a
                    href={atual.aula.videoUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-2 text-xs text-white/50 underline transition hover:text-white"
                  >
                    <ExternalLink size={13} />
                    Abrir o link em outra aba
                  </a>
                ) : (
                  user.role === "ADMIN" && (
                    <Link
                      href={`/cursos/gerenciar/${curso.id}`}
                      className="text-xs text-white/50 underline transition hover:text-white"
                    >
                      Colar o link do vídeo em Gerenciar cursos
                    </Link>
                  )
                )}
              </div>
            )}
          </div>

          <div className="mt-5">
            <p className="text-[11px] font-semibold tracking-[0.18em] text-white/40 uppercase">
              {atual.modulo.title}
            </p>
            <h1 className="mt-1 text-2xl font-semibold tracking-tight text-white">
              {atual.aula.title}
            </h1>
            {atual.aula.description && (
              <p className="mt-3 max-w-2xl text-sm leading-relaxed text-white/65">
                {atual.aula.description}
              </p>
            )}

            <div className="mt-5 flex flex-wrap items-center gap-3">
              <form action={marcarAula}>
                <input type="hidden" name="lessonId" value={atual.aula.id} />
                <input
                  type="hidden"
                  name="concluida"
                  value={atual.aula.concluida ? "nao" : "sim"}
                />
                <button
                  type="submit"
                  className={`inline-flex cursor-pointer items-center gap-2 rounded-lg px-4 py-2.5 text-sm font-semibold transition ${
                    atual.aula.concluida
                      ? "border border-emerald-400/40 bg-emerald-500/15 text-emerald-300 hover:bg-emerald-500/25"
                      : "bg-white text-slate-900 hover:bg-white/85"
                  }`}
                >
                  <Check size={16} />
                  {atual.aula.concluida
                    ? "Concluída — desmarcar"
                    : "Marcar como concluída"}
                </button>
              </form>

              {proxima && (
                <Link
                  href={`/cursos/${curso.slug}/${proxima.aula.id}`}
                  className="inline-flex items-center gap-2 rounded-lg border border-white/15 px-4 py-2.5 text-sm text-white/80 transition hover:bg-white/10 hover:text-white"
                >
                  Próxima aula
                  <span aria-hidden>→</span>
                </Link>
              )}

              {atual.aula.materialUrl && (
                <a
                  href={atual.aula.materialUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-2 rounded-lg border border-white/15 px-4 py-2.5 text-sm text-white/80 transition hover:bg-white/10 hover:text-white"
                >
                  <FileText size={15} />
                  Material da aula
                </a>
              )}
            </div>
          </div>
        </div>

        {/* Lista lateral: o curso inteiro, com onde a pessoa está agora. */}
        <aside className="min-w-0">
          <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
            <div className="mb-3 flex items-baseline justify-between gap-2">
              <p className="text-sm font-semibold text-white">Conteúdo</p>
              <p className="text-xs text-white/45">
                {feito}% · {curso.concluidas}/{curso.totalAulas}
              </p>
            </div>
            <div className="mb-4 h-1 overflow-hidden rounded-full bg-white/10">
              <div
                className="h-1 rounded-full bg-[#f26522]"
                style={{ width: `${feito}%` }}
              />
            </div>

            <div className="max-h-[60vh] space-y-4 overflow-y-auto pr-1">
              {curso.modulos.map((modulo) => (
                <div key={modulo.id}>
                  <p className="mb-1 flex items-center gap-2 text-[11px] font-semibold tracking-wide text-white/45 uppercase">
                    {modulo.title}
                    {ehRevisao(modulo.level, trilha?.nivel ?? null) && (
                      <span className="rounded bg-white/10 px-1.5 py-0.5 text-[9px] normal-case">
                        revisão
                      </span>
                    )}
                  </p>
                  <ul className="space-y-0.5">
                    {modulo.aulas.map((aula) => {
                      const aqui = aula.id === atual.aula.id;
                      return (
                        <li key={aula.id}>
                          <Link
                            href={`/cursos/${curso.slug}/${aula.id}`}
                            className={`flex items-center gap-2 rounded-lg px-2.5 py-2 text-sm transition ${
                              aqui
                                ? "bg-[#f26522]/15 text-white"
                                : "text-white/70 hover:bg-white/[0.06] hover:text-white"
                            }`}
                          >
                            <span
                              className={`h-1.5 w-1.5 shrink-0 rounded-full ${
                                aula.concluida
                                  ? "bg-emerald-400"
                                  : aqui
                                    ? "bg-[#f26522]"
                                    : "bg-white/25"
                              }`}
                            />
                            <span className="min-w-0 flex-1 truncate">
                              {aula.title}
                            </span>
                            <span className="shrink-0 text-[11px] text-white/35">
                              {aula.durationMin ? `${aula.durationMin}′` : ""}
                            </span>
                          </Link>
                        </li>
                      );
                    })}
                  </ul>
                </div>
              ))}
            </div>
          </div>

          {trilha && (
            <p className="mt-3 px-1 text-xs text-white/35">
              Sua trilha: {trilha.name} · entrada no nível{" "}
              {NIVEIS[trilha.nivel].toLowerCase()}.
            </p>
          )}
        </aside>
      </div>
    </div>
  );
}
