"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { entrar } from "@/app/actions/auth";
import { Button, Field, Input } from "@/components/ui";

function BotaoEntrar() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" className="w-full" disabled={pending}>
      {pending ? "Entrando..." : "Entrar"}
    </Button>
  );
}

export function FormularioEntrar() {
  const [erro, acao] = useActionState(entrar, null);

  return (
    <form action={acao} className="space-y-4">
      <Field label="E-mail">
        <Input
          name="email"
          type="email"
          autoComplete="email"
          placeholder="seunome@move.com"
          required
        />
      </Field>

      <Field label="Senha">
        <Input
          name="senha"
          type="password"
          autoComplete="current-password"
          placeholder="Sua senha"
          required
        />
      </Field>

      {erro && (
        <p className="rounded-lg bg-rose-50 px-3 py-2 text-sm text-rose-700">
          {erro}
        </p>
      )}

      <BotaoEntrar />
    </form>
  );
}
