import { requireModule } from "@/lib/auth";
import { FormularioCurso } from "@/components/formulario-curso";
import { PageHeader } from "@/components/ui";

export const metadata = { title: "Novo curso — Move" };

export default async function NovoCursoPage() {
  await requireModule("CURSOS_ADMIN");

  return (
    <>
      <PageHeader
        title="Novo curso"
        subtitle="Depois de criar, você monta os módulos e as aulas na tela seguinte."
      />
      <FormularioCurso />
    </>
  );
}
