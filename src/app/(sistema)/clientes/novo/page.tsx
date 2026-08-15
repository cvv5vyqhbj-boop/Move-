import { requireModule } from "@/lib/auth";
import { FormularioCliente } from "@/components/formulario-cliente";
import { PageHeader } from "@/components/ui";

export const metadata = { title: "Novo cliente — Move" };

export default async function NovoClientePage() {
  await requireModule("CLIENTES");

  return (
    <>
      <PageHeader
        title="Novo cliente"
        subtitle="Depois de cadastrar, crie o contrato dele em Contratos."
      />
      <FormularioCliente />
    </>
  );
}
