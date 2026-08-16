"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import bcrypt from "bcryptjs";
import { db } from "@/lib/db";
import {
  createSessionToken,
  SESSION_COOKIE,
  SESSION_MAX_AGE,
} from "@/lib/session";

/**
 * Cria a primeira pessoa do sistema, com acesso de administrador.
 *
 * Só funciona enquanto não existir ninguém cadastrado. Depois da primeira
 * pessoa, esta ação recusa qualquer tentativa — mesmo que alguém descubra o
 * endereço. É assim que o sistema recém-publicado ganha um dono sem precisar
 * de terminal.
 */
export async function criarPrimeiroAcesso(
  _estado: string | null,
  dados: FormData,
) {
  // A trava: se já tem gente, não cria mais ninguém por aqui.
  const quantasPessoas = await db.user.count();
  if (quantasPessoas > 0) {
    redirect("/entrar");
  }

  const nome = String(dados.get("nome") ?? "").trim();
  const email = String(dados.get("email") ?? "")
    .trim()
    .toLowerCase();
  const senha = String(dados.get("senha") ?? "");
  const confirmar = String(dados.get("confirmar") ?? "");

  if (!nome || !email) return "Preencha o seu nome e o seu e-mail.";
  if (senha.length < 6)
    return "A senha precisa ter pelo menos 6 letras ou números.";
  if (senha !== confirmar) return "As duas senhas não são iguais.";

  const pessoa = await db.user.create({
    data: {
      name: nome,
      email,
      passwordHash: await bcrypt.hash(senha, 10),
      role: "ADMIN",
      active: true,
    },
  });

  // Já entra no sistema, sem precisar digitar a senha de novo.
  const token = await createSessionToken({
    id: pessoa.id,
    name: pessoa.name,
    email: pessoa.email,
    role: "ADMIN",
  });

  (await cookies()).set(SESSION_COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: SESSION_MAX_AGE,
    secure: process.env.NODE_ENV === "production",
  });

  redirect("/");
}
