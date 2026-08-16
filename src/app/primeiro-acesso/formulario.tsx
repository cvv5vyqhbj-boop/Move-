"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { criarPrimeiroAcesso } from "@/app/actions/primeiro-acesso";
import { Button, Field, Input } from "@/components/ui";

function BotaoCriar() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" className="w-full" disabled={pending}>
      {pending ? "Criando..." : "Criar meu acesso e entrar"}
    </Button>
  );
}

export function FormularioPrimeiroAcesso() {
  const [erro, acao] = useActionState(criarPrimeiroAcesso, null);

  return (
    <form action={acao} className="space-y-4">
      <Field label="Seu nome">
        <Input name="nome" placeholder="Como a equipe te chama" required />
      </Field>

      <Field label="Seu e-mail" hint="É com ele que você vai entrar daqui em diante.">
        <Input
          name="email"
          type="email"
          autoComplete="email"
          placeholder="seunome@move.com"
          required
        />
      </Field>

      <Field label="Crie uma senha" hint="Pelo menos 6 letras ou números.">
        <Input name="senha" type="password" autoComplete="new-password" required />
      </Field>

      <Field label="Repita a senha">
        <Input
          name="confirmar"
          type="password"
          autoComplete="new-password"
          required
        />
      </Field>

      {erro && (
        <p className="rounded-lg bg-rose-50 px-3 py-2 text-sm text-rose-700">
          {erro}
        </p>
      )}

      <BotaoCriar />
    </form>
  );
}
