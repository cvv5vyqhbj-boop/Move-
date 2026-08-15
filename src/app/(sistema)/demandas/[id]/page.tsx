import { notFound } from "next/navigation";
import { requireModule } from "@/lib/auth";
import { db } from "@/lib/db";
import { filtroDeVisibilidade } from "@/lib/demandas";
import { FormularioDemanda } from "@/components/formulario-demanda";
import { PageHeader } from "@/components/ui";

export const metadata = { title: "Editar demanda — Move" };

export default async function EditarDemandaPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const user = await requireModule("DEMANDAS");
  const { id } = await params;

  const [demanda, clientes, pessoas] = await Promise.all([
    // O filtro garante que ninguem abre uma demanda que nao pode ver.
    db.demand.findFirst({ where: { id, ...filtroDeVisibilidade(user) } }),
    db.client.findMany({ orderBy: { name: "asc" } }),
    db.user.findMany({ where: { active: true }, orderBy: { name: "asc" } }),
  ]);

  if (!demanda) notFound();

  return (
    <>
      <PageHeader title={demanda.title} subtitle="Editar demanda" />
      <FormularioDemanda
        demanda={demanda}
        clientes={clientes}
        pessoas={pessoas}
      />
    </>
  );
}
