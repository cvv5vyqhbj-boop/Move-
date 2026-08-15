import { requireModule } from "@/lib/auth";
import { FormularioPessoa } from "@/components/formulario-pessoa";
import { PageHeader } from "@/components/ui";

export const metadata = { title: "Adicionar pessoa — Move" };

export default async function NovaPessoaPage() {
  await requireModule("EQUIPE");

  return (
    <>
      <PageHeader
        title="Adicionar pessoa"
        subtitle="Escolha o cargo com cuidado: é ele que define o que a pessoa vê."
      />
      <FormularioPessoa />
    </>
  );
}
