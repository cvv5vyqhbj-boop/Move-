import { redirect } from "next/navigation";
import { requireModule } from "@/lib/auth";
import { db } from "@/lib/db";
import { FormularioMeta } from "@/components/formulario-meta";
import { PageHeader } from "@/components/ui";

export const metadata = { title: "Nova meta — Move" };

export default async function NovaMetaPage() {
  const user = await requireModule("METAS");
  if (user.role !== "ADMIN") redirect("/sem-acesso");

  const pessoas = await db.user.findMany({
    where: { active: true },
    orderBy: { name: "asc" },
  });

  return (
    <>
      <PageHeader
        title="Nova meta"
        subtitle="Defina o objetivo do mês e como ele será medido."
      />
      <FormularioMeta pessoas={pessoas} />
    </>
  );
}
