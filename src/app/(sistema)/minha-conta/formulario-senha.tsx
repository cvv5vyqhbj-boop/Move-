"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { trocarMinhaSenha } from "@/app/actions/minha-conta";
import { Button, Field, Input } from "@/components/ui";

function BotaoSalvar() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending}>
      {pending ? "Salvando..." : "Trocar senha"}
    </Button>
  );
}

export function FormularioSenha() {
  const [aviso, acao] = useActionState(trocarMinhaSenha, null);
  const deuCerto = aviso?.startsWith("Senha alterada");

  return (
    <form action={acao} className="space-y-4">
      <Field label="Senha atual">
        <Input name="atual" type="password" autoComplete="current-password" required />
      </Field>

      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Nova senha" hint="Pelo menos 6 letras ou números.">
          <Input name="nova" type="password" autoComplete="new-password" required />
        </Field>

        <Field label="Repita a nova senha">
          <Input name="confirmar" type="password" autoComplete="new-password" required />
        </Field>
      </div>

      {aviso && (
        <p
          className={
            deuCerto
              ? "rounded-lg bg-emerald-50 px-3 py-2 text-sm text-emerald-700"
              : "rounded-lg bg-rose-50 px-3 py-2 text-sm text-rose-700"
          }
        >
          {aviso}
        </p>
      )}

      <BotaoSalvar />
    </form>
  );
}
