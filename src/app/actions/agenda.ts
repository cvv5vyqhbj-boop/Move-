"use server";

import { revalidatePath } from "next/cache";
import { requireModule } from "@/lib/auth";
import { atualizarTudo } from "@/lib/atualizar";
import { db } from "@/lib/db";
import { AGENDA_TIPOS } from "@/lib/constants";

function texto(dados: FormData, campo: string) {
  return String(dados.get(campo) ?? "").trim() || null;
}

/**
 * Cria ou edita um compromisso do calendario (gravacao, post, reuniao...).
 * Todo mundo da equipe pode marcar — o calendario e compartilhado.
 */
export async function salvarAgenda(dados: FormData) {
  const user = await requireModule("CALENDARIO");

  const id = texto(dados, "id");
  const title = String(dados.get("title") ?? "").trim();
  const dia = String(dados.get("date") ?? "").trim();
  if (!title || !dia) return;

  const tipoBruto = String(dados.get("type") ?? "OUTRO");
  const type = tipoBruto in AGENDA_TIPOS ? tipoBruto : "OUTRO";

  // A data vem como "2026-08-25". Montamos ao meio-dia para o fuso nao
  // empurrar o compromisso para o dia anterior.
  const [ano, mes, d] = dia.split("-").map(Number);
  const date = new Date(ano, (mes ?? 1) - 1, d ?? 1, 12, 0, 0);

  const valores = {
    title,
    type,
    date,
    time: texto(dados, "time"),
    clientId: texto(dados, "clientId"),
    notes: texto(dados, "notes"),
  };

  if (id) {
    await db.agenda.update({ where: { id }, data: valores });
  } else {
    await db.agenda.create({ data: { ...valores, createdById: user.id } });
  }

  atualizarTudo();
  revalidatePath("/calendario");
}

export async function excluirAgenda(dados: FormData) {
  await requireModule("CALENDARIO");
  const id = String(dados.get("id") ?? "");
  if (id) await db.agenda.delete({ where: { id } });
  atualizarTudo();
  revalidatePath("/calendario");
}
