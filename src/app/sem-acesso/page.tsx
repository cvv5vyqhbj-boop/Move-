import { Lock } from "lucide-react";
import { LinkButton } from "@/components/ui";

export const metadata = { title: "Sem acesso — Move" };

export default function SemAcessoPage() {
  return (
    <main className="flex min-h-screen items-center justify-center p-6">
      <div className="max-w-md text-center">
        <Lock className="mx-auto text-slate-300" size={44} strokeWidth={1.5} />
        <h1 className="mt-4 text-xl font-semibold text-slate-900">
          Esta área é só do administrador
        </h1>
        <p className="mt-2 text-sm text-slate-500">
          Seu acesso não inclui esta parte do sistema. Se você precisa ver isso
          para trabalhar, fale com quem administra a Move.
        </p>
        <div className="mt-6">
          <LinkButton href="/">Voltar para o início</LinkButton>
        </div>
      </div>
    </main>
  );
}
