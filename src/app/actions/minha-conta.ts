"use server";

import bcrypt from "bcryptjs";
import { db } from "@/lib/db";
import { requireUser } from "@/lib/auth";

/** Cada pessoa troca a propria senha, confirmando a senha atual. */
export async function trocarMinhaSenha(_estado: string | null, dados: FormData) {
  const user = await requireUser();

  const atual = String(dados.get("atual") ?? "");
  const nova = String(dados.get("nova") ?? "");
  const confirmar = String(dados.get("confirmar") ?? "");

  if (nova.length < 6) return "A nova senha precisa ter pelo menos 6 letras ou números.";
  if (nova !== confirmar) return "As duas senhas novas não são iguais.";

  const pessoa = await db.user.findUnique({ where: { id: user.id } });
  if (!pessoa || !(await bcrypt.compare(atual, pessoa.passwordHash))) {
    return "A senha atual está errada.";
  }

  await db.user.update({
    where: { id: user.id },
    data: { passwordHash: await bcrypt.hash(nova, 10) },
  });

  return "Senha alterada. Use a nova da próxima vez que entrar.";
}
