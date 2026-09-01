import { requireModule } from "@/lib/auth";
import { db } from "@/lib/db";
import { NIVEIS, TRILHAS, type TrilhaSlug } from "@/lib/constants";
import { LinhaClicavel } from "@/components/linha-clicavel";
import {
  Badge,
  EmptyRow,
  LinkButton,
  PageHeader,
  Table,
  TCell,
  THead,
} from "@/components/ui";

export const metadata = { title: "Gerenciar cursos — Move" };

export default async function GerenciarCursosPage() {
  await requireModule("CURSOS_ADMIN");

  const cursos = await db.course.findMany({
    orderBy: [{ order: "asc" }, { title: "asc" }],
    include: {
      tracks: { include: { track: true } },
      modules: { include: { _count: { select: { lessons: true } } } },
    },
  });

  return (
    <>
      <PageHeader
        title="Gerenciar cursos"
        subtitle="Cadastre o curso, divida em módulos por nível e cole os links das aulas."
        action={<LinkButton href="/cursos/gerenciar/novo">+ Novo curso</LinkButton>}
      />

      <Table>
        <THead columns={["Curso", "Trilhas", "Nível", "Conteúdo", "Situação"]} />
        <tbody>
          {cursos.map((curso) => {
            const aulas = curso.modules.reduce(
              (soma, m) => soma + m._count.lessons,
              0,
            );
            return (
              <LinhaClicavel
                key={curso.id}
                href={`/cursos/gerenciar/${curso.id}`}
                title="Abrir curso"
              >
                <TCell>
                  <span className="font-medium text-slate-900">
                    {curso.title}
                  </span>
                  {curso.subtitle && (
                    <span className="block text-xs text-slate-500">
                      {curso.subtitle}
                    </span>
                  )}
                </TCell>
                <TCell className="text-slate-600">
                  {curso.tracks.length === 0
                    ? "—"
                    : curso.tracks
                        .map(
                          (t) =>
                            TRILHAS[t.track.slug as TrilhaSlug]?.name ??
                            t.track.name,
                        )
                        .join(", ")}
                </TCell>
                <TCell className="text-slate-600">
                  {NIVEIS[curso.level as keyof typeof NIVEIS] ?? curso.level}
                </TCell>
                <TCell className="text-slate-600">
                  {curso.modules.length}{" "}
                  {curso.modules.length === 1 ? "módulo" : "módulos"} · {aulas}{" "}
                  {aulas === 1 ? "aula" : "aulas"}
                </TCell>
                <TCell>
                  {curso.published ? (
                    <Badge tone="verde">Publicado</Badge>
                  ) : (
                    <Badge tone="amarelo">Rascunho</Badge>
                  )}
                  {curso.featured && (
                    <span className="ml-1 inline-block">
                      <Badge tone="laranja">Destaque</Badge>
                    </span>
                  )}
                </TCell>
              </LinhaClicavel>
            );
          })}

          {cursos.length === 0 && (
            <EmptyRow colSpan={5}>
              Nenhum curso ainda. Clique em “+ Novo curso” para publicar o
              primeiro.
            </EmptyRow>
          )}
        </tbody>
      </Table>
    </>
  );
}
