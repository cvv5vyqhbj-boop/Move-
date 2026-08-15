import { requireUser } from "@/lib/auth";
import { ROLE_MODULES } from "@/lib/permissions";
import { avisosDe } from "@/lib/avisos";
import { MenuLateral } from "@/components/menu-lateral";
import { SinoAvisos } from "@/components/sino-avisos";
import { AtualizacaoAutomatica } from "@/components/atualizacao-automatica";

/** Moldura de todas as telas internas: menu de um lado, conteudo do outro. */
export default async function SistemaLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await requireUser();
  const avisos = await avisosDe(user);

  return (
    <div className="flex min-h-screen flex-col md:flex-row">
      <AtualizacaoAutomatica />

      <MenuLateral
        modules={ROLE_MODULES[user.role]}
        nome={user.name}
        cargo={user.role}
        sino={<SinoAvisos avisos={avisos} />}
      />

      {/* min-w-0 impede que o kanban largo empurre a pagina inteira para o lado */}
      <main className="min-w-0 flex-1">
        {/* Barra fina só no computador; no celular o sino fica na barra do menu. */}
        <header className="hidden justify-end border-b border-slate-200 bg-white px-8 py-2 md:flex">
          <SinoAvisos avisos={avisos} />
        </header>

        <div className="p-5 md:p-8">
          <div className="mx-auto max-w-6xl">{children}</div>
        </div>
      </main>
    </div>
  );
}
