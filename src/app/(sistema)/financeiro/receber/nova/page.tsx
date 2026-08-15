import { requireModule } from "@/lib/auth";
import { db } from "@/lib/db";
import { FormularioCobranca } from "@/components/formulario-cobranca";
import { PageHeader } from "@/components/ui";

export const metadata = { title: "Lançar cobrança — Move" };

export default async function NovaCobrancaPage() {
  await requireModule("FINANCEIRO");

  const clientes = await db.client.findMany({ orderBy: { name: "asc" } });

  return (
    <>
      <PageHeader
        title="Lançar cobrança"
        subtitle="Registre o que um cliente tem a pagar."
      />
      <FormularioCobranca clientes={clientes} />
    </>
  );
}
