import { requireModule } from "@/lib/auth";
import { FormularioConta } from "@/components/formulario-conta";
import { PageHeader } from "@/components/ui";

export const metadata = { title: "Lançar conta — Move" };

export default async function NovaContaPage() {
  await requireModule("FINANCEIRO");

  return (
    <>
      <PageHeader
        title="Lançar conta a pagar"
        subtitle="Registre um gasto para não perder o vencimento."
      />
      <FormularioConta />
    </>
  );
}
