"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { requireModule } from "@/lib/auth";

function texto(dados: FormData, campo: string) {
  return String(dados.get(campo) ?? "").trim() || null;
}

function atualizarTelas() {
  revalidatePath("/financeiro");
  revalidatePath("/financeiro/pagar");
  revalidatePath("/financeiro/receber");
  revalidatePath("/relatorios");
  revalidatePath("/calendario");
  revalidatePath("/");
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

  atualizarTelas();
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
  atualizarTelas();
}

export async function excluirConta(dados: FormData) {
  await requireModule("FINANCEIRO");
  const id = String(dados.get("id") ?? "");
  if (id) await db.payable.delete({ where: { id } });
  atualizarTelas();
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

  atualizarTelas();
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
  atualizarTelas();
}

export async function excluirCobranca(dados: FormData) {
  await requireModule("FINANCEIRO");
  const id = String(dados.get("id") ?? "");
  if (id) await db.receivable.delete({ where: { id } });
  atualizarTelas();
  redirect("/financeiro/receber");
}
