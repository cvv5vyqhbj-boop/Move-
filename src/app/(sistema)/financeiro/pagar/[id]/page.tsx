import { notFound } from "next/navigation";
import { requireModule } from "@/lib/auth";
import { db } from "@/lib/db";
import { FormularioConta } from "@/components/formulario-conta";
import { PageHeader } from "@/components/ui";

export const metadata = { title: "Editar conta — Move" };

export default async function EditarContaPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requireModule("FINANCEIRO");
  const { id } = await params;

  const conta = await db.payable.findUnique({ where: { id } });
  if (!conta) notFound();

  return (
    <>
      <PageHeader title={conta.description} subtitle="Editar conta a pagar" />
      <FormularioConta conta={conta} />
    </>
  );
}
