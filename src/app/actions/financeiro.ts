"use server";

import { atualizarTudo } from "@/lib/atualizar";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { requireModule } from "@/lib/auth";

function texto(dados: FormData, campo: string) {
  return String(dados.get(campo) ?? "").trim() || null;
}

// --- Contas a pagar --------------------------------------------------------

export async function salvarConta(dados: FormData) {
  await requireModule("FINANCEIRO");

  const id = String(dados.get("id") ?? "");
  const pago = String(dados.get("status") ?? "PENDENTE") === "PAGO";
  const valores = {
    description: String(dados.get("description") ?? "").trim(),
    supplier: texto(dados, "supplier"),
    category: texto(dados, "category"),
    clientId: texto(dados, "clientId"),
    amount: Number(dados.get("amount") ?? 0),
    dueDate: new Date(String(dados.get("dueDate") || new Date().toISOString())),
    status: pago ? "PAGO" : "PENDENTE",
    paidAt: pago ? new Date() : null,
  };

  if (!valores.description) return;

  if (id) {
    await db.payable.update({ where: { id }, data: valores });
  } else {
    await db.payable.create({ data: valores });
  }

  atualizarTudo();
  redirect("/financeiro/pagar");
}

export async function marcarComoPago(dados: FormData) {
  await requireModule("FINANCEIRO");
  const id = String(dados.get("id") ?? "");
  const desmarcar = String(dados.get("desmarcar") ?? "") === "1";
  if (id) {
    await db.payable.update({
      where: { id },
      data: desmarcar
        ? { status: "PENDENTE", paidAt: null }
        : { status: "PAGO", paidAt: new Date() },
    });
  }
  atualizarTudo();
}

export async function excluirConta(dados: FormData) {
  await requireModule("FINANCEIRO");
  const id = String(dados.get("id") ?? "");
  if (id) await db.payable.delete({ where: { id } });
  atualizarTudo();
  redirect("/financeiro/pagar");
}

// --- Contas a receber ------------------------------------------------------

export async function salvarCobranca(dados: FormData) {
  await requireModule("FINANCEIRO");

  const id = String(dados.get("id") ?? "");
  const recebido = String(dados.get("status") ?? "PENDENTE") === "RECEBIDO";
  const valores = {
    description: String(dados.get("description") ?? "").trim(),
    clientId: texto(dados, "clientId"),
    amount: Number(dados.get("amount") ?? 0),
    dueDate: new Date(String(dados.get("dueDate") || new Date().toISOString())),
    status: recebido ? "RECEBIDO" : "PENDENTE",
    receivedAt: recebido ? new Date() : null,
  };

  if (!valores.description) return;

  if (id) {
    await db.receivable.update({ where: { id }, data: valores });
  } else {
    await db.receivable.create({ data: valores });
  }

  atualizarTudo();
  redirect("/financeiro/receber");
}

export async function marcarComoRecebido(dados: FormData) {
  await requireModule("FINANCEIRO");
  const id = String(dados.get("id") ?? "");
  const desmarcar = String(dados.get("desmarcar") ?? "") === "1";
  if (id) {
    await db.receivable.update({
      where: { id },
      data: desmarcar
        ? { status: "PENDENTE", receivedAt: null }
        : { status: "RECEBIDO", receivedAt: new Date() },
    });
  }
  atualizarTudo();
}

/**
 * Cria as mensalidades do mês a partir dos contratos ativos.
 *
 * Pode clicar quantas vezes quiser: se a mensalidade daquele contrato já existe
 * no mês, ela não é criada de novo.
 */
export async function gerarMensalidadesDoMes(dados: FormData) {
  await requireModule("FINANCEIRO");

  const hoje = new Date();
  const mes = Number(dados.get("mes") ?? hoje.getMonth() + 1) - 1;
  const ano = Number(dados.get("ano") ?? hoje.getFullYear());
  const diaDoVencimento = Number(dados.get("dia") ?? 10);

  const inicio = new Date(ano, mes, 1);
  const fim = new Date(ano, mes + 1, 0, 23, 59, 59);

  const contratos = await db.contract.findMany({
    where: {
      status: "ATIVO",
      startDate: { lte: fim },
      OR: [{ endDate: null }, { endDate: { gte: inicio } }],
    },
  });

  const jaLancadas = await db.receivable.findMany({
    where: { contractId: { not: null }, dueDate: { gte: inicio, lte: fim } },
    select: { contractId: true },
  });
  const jaTem = new Set(jaLancadas.map((r) => r.contractId));

  const novas = contratos
    .filter((c) => !jaTem.has(c.id))
    .map((c) => ({
      description: `Mensalidade - ${c.title}`,
      clientId: c.clientId,
      contractId: c.id,
      amount: c.monthlyValue,
      dueDate: new Date(ano, mes, diaDoVencimento, 12),
      status: "PENDENTE",
    }));

  if (novas.length > 0) await db.receivable.createMany({ data: novas });

  atualizarTudo();
  redirect(`/financeiro/receber?geradas=${novas.length}`);
}

export async function excluirCobranca(dados: FormData) {
  await requireModule("FINANCEIRO");
  const id = String(dados.get("id") ?? "");
  if (id) await db.receivable.delete({ where: { id } });
  atualizarTudo();
  redirect("/financeiro/receber");
}
