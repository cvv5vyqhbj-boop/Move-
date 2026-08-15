"use server";

import { atualizarTudo } from "@/lib/atualizar";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { requireModule } from "@/lib/auth";

function texto(dados: FormData, campo: string) {
  return String(dados.get(campo) ?? "").trim() || null;
}

export async function salvarCliente(dados: FormData) {
  await requireModule("CLIENTES");

  const id = String(dados.get("id") ?? "");
  const valores = {
    name: String(dados.get("name") ?? "").trim(),
    company: texto(dados, "company"),
    contactName: texto(dados, "contactName"),
    email: texto(dados, "email"),
    phone: texto(dados, "phone"),
    startDate: new Date(String(dados.get("startDate") || new Date().toISOString())),
    status: String(dados.get("status") ?? "ATIVO"),
    notes: texto(dados, "notes"),
  };

  if (!valores.name) return;

  if (id) {
    await db.client.update({ where: { id }, data: valores });
  } else {
    await db.client.create({ data: valores });
  }
  atualizarTudo();
  redirect("/clientes");
}

export async function excluirCliente(dados: FormData) {
  await requireModule("CLIENTES");
  const id = String(dados.get("id") ?? "");
  if (id) await db.client.delete({ where: { id } });
  atualizarTudo();
  redirect("/clientes");
}

export async function salvarContrato(dados: FormData) {
  await requireModule("CONTRATOS");

  const id = String(dados.get("id") ?? "");
  const fim = texto(dados, "endDate");
  const valores = {
    clientId: String(dados.get("clientId") ?? ""),
    title: String(dados.get("title") ?? "").trim(),
    monthlyValue: Number(dados.get("monthlyValue") ?? 0),
    startDate: new Date(String(dados.get("startDate") || new Date().toISOString())),
    endDate: fim ? new Date(fim) : null,
    status: String(dados.get("status") ?? "ATIVO"),
    notes: texto(dados, "notes"),
  };

  if (!valores.title || !valores.clientId) return;

  if (id) {
    await db.contract.update({ where: { id }, data: valores });
  } else {
    await db.contract.create({ data: valores });
  }
  atualizarTudo();
  redirect("/contratos");
}

export async function excluirContrato(dados: FormData) {
  await requireModule("CONTRATOS");
  const id = String(dados.get("id") ?? "");
  if (id) await db.contract.delete({ where: { id } });
  atualizarTudo();
  redirect("/contratos");
}
