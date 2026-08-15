import { notFound } from "next/navigation";
import { requireModule } from "@/lib/auth";
import { db } from "@/lib/db";
import { FormularioContrato } from "@/components/formulario-contrato";
import { PageHeader } from "@/components/ui";

export const metadata = { title: "Editar contrato — Move" };

export default async function EditarContratoPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requireModule("CONTRATOS");
  const { id } = await params;

  const [contrato, clientes] = await Promise.all([
    db.contract.findUnique({ where: { id }, include: { client: true } }),
    db.client.findMany({ orderBy: { name: "asc" } }),
  ]);

  if (!contrato) notFound();

  return (
    <>
      <PageHeader
        title={contrato.title}
        subtitle={`Contrato de ${contrato.client.name}`}
      />
      <FormularioContrato contrato={contrato} clientes={clientes} />
    </>
  );
}
