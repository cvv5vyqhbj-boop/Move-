import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { FormularioPrimeiroAcesso } from "./formulario";

export const metadata = { title: "Primeiro acesso — Move" };

// Sempre consulta o banco: esta tela precisa saber a verdade do momento.
export const dynamic = "force-dynamic";

export default async function PrimeiroAcessoPage() {
  // Se o sistema já tem dono, esta tela não existe mais.
  const quantasPessoas = await db.user.count();
  if (quantasPessoas > 0) redirect("/entrar");

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-50 p-4">
      <div className="w-full max-w-sm">
        <div className="mb-8 text-center">
          <p className="text-3xl font-bold tracking-tight text-slate-900">move</p>
          <p className="mt-2 text-sm text-slate-500">
            Bem-vinda. Vamos criar o seu acesso de administradora.
          </p>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <FormularioPrimeiroAcesso />
        </div>

        <p className="mt-6 text-center text-xs text-slate-400">
          Esta tela aparece uma vez só. Depois que o seu acesso existir, ela
          deixa de funcionar e a equipe entra pela tela normal.
        </p>
      </div>
    </main>
  );
}
