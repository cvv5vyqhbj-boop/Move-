import { requireUser } from "@/lib/auth";
import { ROLES } from "@/lib/constants";
import { MODULES, ROLE_MODULES } from "@/lib/permissions";
import { Card, PageHeader } from "@/components/ui";
import { FormularioSenha } from "./formulario-senha";

export const metadata = { title: "Minha conta — Move" };

export default async function MinhaContaPage() {
  const user = await requireUser();

  return (
    <>
      <PageHeader title="Minha conta" subtitle="Seus dados de acesso." />

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <h2 className="mb-3 font-semibold text-slate-900">Seus dados</h2>
          <dl className="space-y-2 text-sm">
            <div className="flex justify-between gap-4">
              <dt className="text-slate-500">Nome</dt>
              <dd className="text-slate-800">{user.name}</dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt className="text-slate-500">E-mail</dt>
              <dd className="text-slate-800">{user.email}</dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt className="text-slate-500">Cargo</dt>
              <dd className="text-slate-800">{ROLES[user.role]}</dd>
            </div>
          </dl>

          <p className="mt-4 border-t border-slate-100 pt-4 text-sm text-slate-500">
            Você tem acesso a: {ROLE_MODULES[user.role].map((m) => MODULES[m].label).join(", ")}.
            {user.role !== "ADMIN" &&
              " Para mudar seu cargo ou seu nome, fale com quem administra a Move."}
          </p>
        </Card>

        <Card>
          <h2 className="mb-1 font-semibold text-slate-900">Trocar senha</h2>
          <p className="mb-4 text-sm text-slate-500">
            Use uma senha que só você saiba.
          </p>
          <FormularioSenha />
        </Card>
      </div>
    </>
  );
}
