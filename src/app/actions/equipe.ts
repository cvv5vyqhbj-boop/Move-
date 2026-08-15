"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import bcrypt from "bcryptjs";
import { db } from "@/lib/db";
import { requireModule } from "@/lib/auth";

export async function salvarPessoa(dados: FormData) {
  await requireModule("EQUIPE");

  const id = String(dados.get("id") ?? "");
  const senha = String(dados.get("senha") ?? "");

  const valores = {
    name: String(dados.get("name") ?? "").trim(),
    email: String(dados.get("email") ?? "")
      .trim()
      .toLowerCase(),
    role: String(dados.get("role") ?? "EDICAO"),
    active: String(dados.get("active") ?? "1") === "1",
  };

  if (!valores.name || !valores.email) return;

  if (id) {
    await db.user.update({
      where: { id },
      data: {
        ...valores,
        // Só troca a senha se uma nova foi digitada.
        ...(senha ? { passwordHash: await bcrypt.hash(senha, 10) } : {}),
      },
    });
  } else {
    await db.user.create({
      data: {
        ...valores,
        passwordHash: await bcrypt.hash(senha || "move123", 10),
      },
    });
  }

  revalidatePath("/equipe");
  redirect("/equipe");
}

export async function excluirPessoa(dados: FormData) {
  const admin = await requireModule("EQUIPE");
  const id = String(dados.get("id") ?? "");

  // Ninguém consegue apagar a própria conta e ficar sem acesso.
  if (id && id !== admin.id) await db.user.delete({ where: { id } });

  revalidatePath("/equipe");
  redirect("/equipe");
}
