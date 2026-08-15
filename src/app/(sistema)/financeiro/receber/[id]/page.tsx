import { notFound } from "next/navigation";
import { requireModule } from "@/lib/auth";
import { db } from "@/lib/db";
import { FormularioCobranca } from "@/components/formulario-cobranca";
import { PageHeader } from "@/components/ui";

export const metadata = { title: "Editar cobrança — Move" };

export default async function EditarCobrancaPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requireModule("FINANCEIRO");
  const { id } = await params;

  const [cobranca, clientes] = await Promise.all([
    db.receivable.findUnique({ where: { id } }),
    db.client.findMany({ orderBy: { name: "asc" } }),
  ]);

  if (!cobranca) notFound();

  return (
    <>
      <PageHeader title={cobranca.description} subtitle="Editar cobrança" />
      <FormularioCobranca cobranca={cobranca} clientes={clientes} />
    </>
  );
}
