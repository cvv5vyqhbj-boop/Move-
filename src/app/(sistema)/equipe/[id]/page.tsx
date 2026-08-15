import { notFound } from "next/navigation";
import { requireModule } from "@/lib/auth";
import { db } from "@/lib/db";
import { FormularioPessoa } from "@/components/formulario-pessoa";
import { PageHeader } from "@/components/ui";

export const metadata = { title: "Editar pessoa — Move" };

export default async function EditarPessoaPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const user = await requireModule("EQUIPE");
  const { id } = await params;

  const pessoa = await db.user.findUnique({ where: { id } });
  if (!pessoa) notFound();

  return (
    <>
      <PageHeader title={pessoa.name} subtitle="Editar acesso e cargo" />
      <FormularioPessoa pessoa={pessoa} ehVoce={pessoa.id === user.id} />
    </>
  );
}
