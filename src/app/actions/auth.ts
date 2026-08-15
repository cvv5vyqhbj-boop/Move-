"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import bcrypt from "bcryptjs";
import { db } from "@/lib/db";
import type { Role } from "@/lib/constants";
import {
  createSessionToken,
  SESSION_COOKIE,
  SESSION_MAX_AGE,
} from "@/lib/session";

export async function entrar(_estado: string | null, dados: FormData) {
  const email = String(dados.get("email") ?? "")
    .trim()
    .toLowerCase();
  const senha = String(dados.get("senha") ?? "");

  if (!email || !senha) return "Preencha o e-mail e a senha.";

  const user = await db.user.findUnique({ where: { email } });
  if (!user || !user.active || !(await bcrypt.compare(senha, user.passwordHash))) {
    return "E-mail ou senha incorretos.";
  }

  const token = await createSessionToken({
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role as Role,
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

export async function sair() {
  (await cookies()).delete(SESSION_COOKIE);
  redirect("/entrar");
}
