import { requireUser } from "@/lib/auth";
import { ROLE_MODULES } from "@/lib/permissions";
import { MenuLateral } from "@/components/menu-lateral";
import { AtualizacaoAutomatica } from "@/components/atualizacao-automatica";

/** Moldura de todas as telas internas: menu de um lado, conteudo do outro. */
export default async function SistemaLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await requireUser();

  return (
    <div className="flex min-h-screen flex-col md:flex-row">
      <AtualizacaoAutomatica />
      <MenuLateral
        modules={ROLE_MODULES[user.role]}
        nome={user.name}
        cargo={user.role}
      />
      {/* min-w-0 impede que o kanban largo empurre a pagina inteira para o lado */}
      <main className="min-w-0 flex-1 p-5 md:p-8">
        <div className="mx-auto max-w-6xl">{children}</div>
      </main>
    </div>
  );
}
