"use server";

import { atualizarTudo } from "@/lib/atualizar";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { requireModule } from "@/lib/auth";
import { filtroDeVisibilidade } from "@/lib/demandas";
import { avisarPorEmail } from "@/lib/email";

function texto(dados: FormData, campo: string) {
  const valor = String(dados.get(campo) ?? "").trim();
  return valor || null;
}

export async function salvarDemanda(dados: FormData) {
  const user = await requireModule("DEMANDAS");

  const id = texto(dados, "id");
  const prazo = texto(dados, "dueDate");
  const prazoInterno = texto(dados, "internalDueDate");

  const valores = {
    title: String(dados.get("title") ?? "").trim(),
    description: texto(dados, "description"),
    clientId: texto(dados, "clientId"),
    area: String(dados.get("area") ?? "EDICAO"),
    assigneeId: texto(dados, "assigneeId"),
    status: String(dados.get("status") ?? "A_FAZER"),
    priority: String(dados.get("priority") ?? "MEDIA"),
    internalDueDate: prazoInterno ? new Date(prazoInterno) : null,
    dueDate: prazo ? new Date(prazo) : null,
  };

  if (!valores.title) return;

  // Outras pessoas no chamado, alem do responsavel principal.
  const participantes = [
    ...new Set(dados.getAll("participantIds").map(String).filter(Boolean)),
  ].filter((p) => p !== valores.assigneeId);

  // Quem ja estava na demanda antes de salvar (para avisar so quem entrou agora).
  const antes = id
    ? await db.demand.findUnique({
        where: { id },
        select: { assigneeId: true, participants: { select: { id: true } } },
      })
    : null;
  const jaEstavam = new Set(
    [antes?.assigneeId, ...(antes?.participants.map((p) => p.id) ?? [])].filter(
      Boolean,
    ),
  );

  const ligacao = participantes.map((p) => ({ id: p }));
  const demanda = id
    ? await db.demand.update({
        where: { id },
        data: { ...valores, participants: { set: ligacao } },
        include: { client: { select: { name: true } } },
      })
    : await db.demand.create({
        data: { ...valores, participants: { connect: ligacao } },
        include: { client: { select: { name: true } } },
      });

  // Avisa por e-mail quem acabou de entrar na demanda. Quem salvou ja sabe.
  const novos = [valores.assigneeId, ...participantes].filter(
    (p): p is string => !!p && !jaEstavam.has(p) && p !== user.id,
  );
  if (novos.length > 0) {
    const pessoas = await db.user.findMany({
      where: { id: { in: novos }, active: true },
      select: { name: true, email: true },
    });
    await avisarPorEmail(
      pessoas,
      { ...demanda, clienteNome: demanda.client?.name ?? null },
      user.name,
    );
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
