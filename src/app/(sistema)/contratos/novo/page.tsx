import { requireModule } from "@/lib/auth";
import { db } from "@/lib/db";
import { FormularioContrato } from "@/components/formulario-contrato";
import { PageHeader } from "@/components/ui";

export const metadata = { title: "Novo contrato — Move" };

export default async function NovoContratoPage() {
  await requireModule("CONTRATOS");

  const clientes = await db.client.findMany({ orderBy: { name: "asc" } });

  return (
    <>
      <PageHeader
        title="Novo contrato"
        subtitle="Quanto o cliente paga por mês e desde quando."
      />
      <FormularioContrato clientes={clientes} />
    </>
  );
}
