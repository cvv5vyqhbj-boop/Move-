import { FormularioEntrar } from "./formulario";

export const metadata = { title: "Entrar — Move" };

export default function EntrarPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-50 p-4">
      <div className="w-full max-w-sm">
        <div className="mb-8 text-center">
          <p className="text-3xl font-bold tracking-tight text-slate-900">
            move
          </p>
          <p className="mt-2 text-sm text-slate-500">
            Sistema da agência. Entre para continuar.
          </p>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <FormularioEntrar />
        </div>

        <p className="mt-6 text-center text-xs text-slate-400">
          Esqueceu a senha? Peça para o administrador criar uma nova para você.
        </p>
      </div>
    </main>
  );
}
