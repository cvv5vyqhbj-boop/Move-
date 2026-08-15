import { notFound, redirect } from "next/navigation";
import { requireModule } from "@/lib/auth";
import { db } from "@/lib/db";
import { FormularioMeta } from "@/components/formulario-meta";
import { PageHeader } from "@/components/ui";

export const metadata = { title: "Editar meta — Move" };

export default async function EditarMetaPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const user = await requireModule("METAS");
  if (user.role !== "ADMIN") redirect("/sem-acesso");

  const { id } = await params;
  const [meta, pessoas] = await Promise.all([
    db.goal.findUnique({ where: { id } }),
    db.user.findMany({ where: { active: true }, orderBy: { name: "asc" } }),
  ]);

  if (!meta) notFound();

  return (
    <>
      <PageHeader title={meta.title} subtitle="Editar meta" />
      <FormularioMeta meta={meta} pessoas={pessoas} />
    </>
  );
}
