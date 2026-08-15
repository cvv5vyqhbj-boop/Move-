"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { requireModule } from "@/lib/auth";

/** Criar, editar e excluir metas e coisa de administrador. */
async function exigirAdmin() {
  const user = await requireModule("METAS");
  if (user.role !== "ADMIN") redirect("/sem-acesso");
  return user;
}

export async function salvarMeta(dados: FormData) {
  await exigirAdmin();

  const id = String(dados.get("id") ?? "");
  const valores = {
    title: String(dados.get("title") ?? "").trim(),
    description: String(dados.get("description") ?? "").trim() || null,
    scope: String(dados.get("scope") ?? "PESSOAL"),
    ownerId: String(dados.get("ownerId") ?? "") || null,
    area: String(dados.get("area") ?? "") || null,
    month: Number(dados.get("month") ?? new Date().getMonth() + 1),
    year: Number(dados.get("year") ?? new Date().getFullYear()),
    targetValue: Number(dados.get("targetValue") ?? 1),
    currentValue: Number(dados.get("currentValue") ?? 0),
    unit: String(dados.get("unit") ?? "un"),
  };

  if (!valores.title) return;

  if (id) {
    await db.goal.update({ where: { id }, data: valores });
  } else {
    await db.goal.create({ data: valores });
  }

  revalidatePath("/metas");
  revalidatePath("/");
  redirect("/metas");
}

export async function excluirMeta(dados: FormData) {
  await exigirAdmin();
  const id = String(dados.get("id") ?? "");
  if (id) await db.goal.delete({ where: { id } });
  revalidatePath("/metas");
  redirect("/metas");
}

/** Atualizar o quanto ja foi feito: cada um na sua meta, o admin em qualquer uma. */
export async function atualizarProgresso(dados: FormData) {
  const user = await requireModule("METAS");
  const id = String(dados.get("id") ?? "");
  const valor = Number(dados.get("currentValue") ?? 0);

  const meta = await db.goal.findUnique({ where: { id } });
  if (!meta) return;
  if (user.role !== "ADMIN" && meta.ownerId !== user.id) return;

  await db.goal.update({ where: { id }, data: { currentValue: valor } });
  revalidatePath("/metas");
  revalidatePath("/");
}
