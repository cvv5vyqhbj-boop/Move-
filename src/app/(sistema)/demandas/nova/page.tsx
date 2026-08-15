import { requireModule } from "@/lib/auth";
import { db } from "@/lib/db";
import { FormularioDemanda } from "@/components/formulario-demanda";
import { PageHeader } from "@/components/ui";

export const metadata = { title: "Nova demanda — Move" };

export default async function NovaDemandaPage() {
  await requireModule("DEMANDAS");

  const [clientes, pessoas] = await Promise.all([
    db.client.findMany({ orderBy: { name: "asc" } }),
    db.user.findMany({ where: { active: true }, orderBy: { name: "asc" } }),
  ]);

  return (
    <>
      <PageHeader
        title="Nova demanda"
        subtitle="Descreva o que precisa ser feito, para quem e até quando."
      />
      <FormularioDemanda clientes={clientes} pessoas={pessoas} />
    </>
  );
}
