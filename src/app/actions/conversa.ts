"use server";

import { db } from "@/lib/db";
import { requireModule } from "@/lib/auth";
import { atualizarTudo } from "@/lib/atualizar";
import { filtroDeVisibilidade } from "@/lib/demandas";

/** So deixa comentar e anexar em demanda que a pessoa realmente pode ver. */
async function demandaPermitida(demandId: string) {
  const user = await requireModule("DEMANDAS");
  const demanda = await db.demand.findFirst({
    where: { id: demandId, ...filtroDeVisibilidade(user) },
    select: { id: true },
  });
  return demanda ? user : null;
}

export async function comentar(dados: FormData) {
  const demandId = String(dados.get("demandId") ?? "");
  const texto = String(dados.get("text") ?? "").trim();
  if (!texto) return;

  const user = await demandaPermitida(demandId);
  if (!user) return;

  await db.comment.create({
    data: { demandId, authorId: user.id, text: texto },
  });

  atualizarTudo();
}

export async function apagarComentario(dados: FormData) {
  const id = String(dados.get("id") ?? "");
  const user = await requireModule("DEMANDAS");

  const comentario = await db.comment.findUnique({ where: { id } });
  if (!comentario) return;

  // Cada um apaga o que escreveu. O administrador apaga qualquer um.
  if (user.role !== "ADMIN" && comentario.authorId !== user.id) return;

  await db.comment.delete({ where: { id } });
  atualizarTudo();
}

export async function adicionarLink(dados: FormData) {
  const demandId = String(dados.get("demandId") ?? "");
  const title = String(dados.get("title") ?? "").trim();
  let url = String(dados.get("url") ?? "").trim();
  if (!url) return;

  // Aceita o endereço colado sem "https://".
  if (!/^https?:\/\//i.test(url)) url = `https://${url}`;

  const user = await demandaPermitida(demandId);
  if (!user) return;

  await db.attachment.create({
    data: { demandId, title: title || url, url },
  });

  atualizarTudo();
}

export async function apagarLink(dados: FormData) {
  const id = String(dados.get("id") ?? "");
  await requireModule("DEMANDAS");
  if (id) await db.attachment.delete({ where: { id } });
  atualizarTudo();
}
