import { notFound } from "next/navigation";
import { requireModule } from "@/lib/auth";
import { db } from "@/lib/db";
import { buscarCurso } from "@/lib/cursos";
import { EditorModulos } from "@/components/editor-modulos";
import { FormularioCurso } from "@/components/formulario-curso";
import { LinkButton, PageHeader } from "@/components/ui";

export const metadata = { title: "Editar curso — Move" };

export default async function EditarCursoPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const user = await requireModule("CURSOS_ADMIN");
  const { id } = await params;

  const registro = await db.course.findUnique({ where: { id } });
  if (!registro) notFound();

  // Reaproveita a mesma leitura da vitrine: assim o admin ve o curso exatamente
  // como ele esta montado, com modulos e aulas na ordem de exibicao.
  const curso = await buscarCurso(registro.slug, user.id, true);
  if (!curso) notFound();

  return (
    <>
      <PageHeader
        title={curso.title}
        subtitle="Dados do curso, módulos e aulas."
        action={
          <LinkButton href={`/cursos/${curso.slug}`} variant="secundario">
            Ver como fica
          </LinkButton>
        }
      />

      <div className="space-y-8">
        <FormularioCurso
          curso={{
            id: curso.id,
            slug: curso.slug,
            title: curso.title,
            subtitle: curso.subtitle,
            description: curso.description,
            level: curso.level,
            area: curso.area,
            cover: curso.cover,
            featured: curso.featured,
            published: curso.published,
            order: registro.order,
            trilhas: curso.trilhas,
          }}
        />

        <section>
          <h2 className="mb-3 text-sm font-semibold tracking-wide text-slate-500 uppercase">
            Conteúdo do curso
          </h2>
          <EditorModulos courseId={curso.id} modulos={curso.modulos} />
        </section>
      </div>
    </>
  );
}
