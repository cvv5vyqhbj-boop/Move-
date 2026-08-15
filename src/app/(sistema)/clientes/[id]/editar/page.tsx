import { notFound } from "next/navigation";
import { requireModule } from "@/lib/auth";
import { db } from "@/lib/db";
import { FormularioCliente } from "@/components/formulario-cliente";
import { PageHeader } from "@/components/ui";

export const metadata = { title: "Editar cliente — Move" };

export default async function EditarClientePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requireModule("CLIENTES");
  const { id } = await params;

  const cliente = await db.client.findUnique({ where: { id } });
  if (!cliente) notFound();

  return (
    <>
      <PageHeader title={cliente.name} subtitle="Editar dados do cliente" />
      <FormularioCliente cliente={cliente} />
    </>
  );
}
