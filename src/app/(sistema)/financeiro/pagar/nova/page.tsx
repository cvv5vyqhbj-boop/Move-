import { requireModule } from "@/lib/auth";
import { db } from "@/lib/db";
import { FormularioConta } from "@/components/formulario-conta";
import { PageHeader } from "@/components/ui";

export const metadata = { title: "Lançar conta — Move" };

export default async function NovaContaPage() {
  await requireModule("FINANCEIRO");
  const clientes = await db.client.findMany({ orderBy: { name: "asc" } });

  return (
    <>
      <PageHeader
        title="Lançar conta a pagar"
        subtitle="Registre um gasto para não perder o vencimento."
      />
      <FormularioConta clientes={clientes} />
    </>
  );
}
