"use server";

import { atualizarTudo } from "@/lib/atualizar";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { requireModule } from "@/lib/auth";
import { filtroDeVisibilidade } from "@/lib/demandas";

function texto(dados: FormData, campo: string) {
  const valor = String(dados.get(campo) ?? "").trim();
  return valor || null;
}

export async function salvarDemanda(dados: FormData) {
  await requireModule("DEMANDAS");

  const id = texto(dados, "id");
  const prazo = texto(dados, "dueDate");

  const valores = {
    title: String(dados.get("title") ?? "").trim(),
    description: texto(dados, "description"),
    clientId: texto(dados, "clientId"),
    area: String(dados.get("area") ?? "EDICAO"),
    assigneeId: texto(dados, "assigneeId"),
    status: String(dados.get("status") ?? "A_FAZER"),
    priority: String(dados.get("priority") ?? "MEDIA"),
    dueDate: prazo ? new Date(prazo) : null,
  };

  if (!valores.title) return;

  if (id) {
    await db.demand.update({ where: { id }, data: valores });
  } else {
    await db.demand.create({ data: valores });
  }

  atualizarTudo();
  redirect("/demandas");
}

export async function excluirDemanda(dados: FormData) {
  await requireModule("DEMANDAS");
  const id = String(dados.get("id") ?? "");
  if (id) await db.demand.delete({ where: { id } });
  atualizarTudo();
  redirect("/demandas");
}

/** Usado quando o card e arrastado para outra coluna do kanban. */
export async function moverDemanda(id: string, status: string) {
  const user = await requireModule("KANBAN");

  // So deixa mover o que a pessoa realmente pode ver.
  const permitida = await db.demand.findFirst({
    where: { id, ...filtroDeVisibilidade(user) },
    select: { id: true },
  });
  if (!permitida) return;

  await db.demand.update({ where: { id }, data: { status } });
  atualizarTudo();
}
