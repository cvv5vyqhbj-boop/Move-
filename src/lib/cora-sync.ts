/**
 * Traz o extrato do Cora para dentro do sistema.
 *
 * - Credito ("entrou") -> vira uma linha em "Contas a receber", ja marcada
 *   como recebida, com a data do lancamento.
 * - Debito ("saiu")   -> vira uma linha em "Contas a pagar", ja marcada
 *   como paga.
 *
 * O "coraEntryId" garante que rodar duas vezes nao duplica nada: se ja
 * existe uma linha com aquele id, a gente simplesmente pula.
 */

import { db } from "./db";
import { atualizarTudo } from "./atualizar";
import { buscarExtrato, coraConfigurado } from "./cora";

const CHAVE_ULTIMA_SINC = "cora.ultimaSincronizacao";
const DIAS_DE_FOLGA = 3; // quando ja tem historico, olha alguns dias para tras
const DIAS_INICIAIS = 30; // primeira vez: puxa o ultimo mes

export type ResumoSincronizacao = {
  entradas: number;
  saidas: number;
  ignoradas: number;
  ate: string;
};

export async function sincronizarComCora(): Promise<ResumoSincronizacao> {
  if (!coraConfigurado()) {
    throw new Error(
      "Cora nao configurado: veja as variaveis CORA_CLIENT_ID, CORA_CERT_PEM e CORA_KEY_PEM.",
    );
  }

  const agora = new Date();

  const registroUltima = await db.appSetting.findUnique({
    where: { key: CHAVE_ULTIMA_SINC },
  });
  const inicioBase = registroUltima
    ? new Date(registroUltima.value)
    : new Date(agora.getTime() - DIAS_INICIAIS * 24 * 3600_000);

  // Sempre re-olhamos alguns dias para tras, caso um lancamento tenha entrado
  // com data anterior (o Cora pode compensar Pix da noite so na manha seguinte).
  const inicio = new Date(inicioBase.getTime() - DIAS_DE_FOLGA * 24 * 3600_000);

  const lancamentos = await buscarExtrato(inicio, agora);

  let entradas = 0;
  let saidas = 0;
  let ignoradas = 0;

  for (const l of lancamentos) {
    if (l.tipo === "CREDITO") {
      const ja = await db.receivable.findUnique({
        where: { coraEntryId: l.id },
        select: { id: true },
      });
      if (ja) {
        ignoradas += 1;
        continue;
      }
      await db.receivable.create({
        data: {
          coraEntryId: l.id,
          description: descricaoLegivel(l.descricao, l.contraparte, "entrada"),
          amount: l.valor,
          dueDate: l.data,
          status: "RECEBIDO",
          receivedAt: l.data,
        },
      });
      entradas += 1;
    } else {
      const ja = await db.payable.findUnique({
        where: { coraEntryId: l.id },
        select: { id: true },
      });
      if (ja) {
        ignoradas += 1;
        continue;
      }
      await db.payable.create({
        data: {
          coraEntryId: l.id,
          description: descricaoLegivel(l.descricao, l.contraparte, "saida"),
          supplier: l.contraparte,
          amount: l.valor,
          dueDate: l.data,
          status: "PAGO",
          paidAt: l.data,
        },
      });
      saidas += 1;
    }
  }

  await db.appSetting.upsert({
    where: { key: CHAVE_ULTIMA_SINC },
    create: { key: CHAVE_ULTIMA_SINC, value: agora.toISOString() },
    update: { value: agora.toISOString() },
  });

  if (entradas > 0 || saidas > 0) atualizarTudo();

  return {
    entradas,
    saidas,
    ignoradas,
    ate: agora.toISOString(),
  };
}

/** Junta descricao + contraparte num texto curto e legivel. */
function descricaoLegivel(
  descricao: string,
  contraparte: string | null,
  tipo: "entrada" | "saida",
): string {
  const base = descricao.trim() || (tipo === "entrada" ? "Entrada" : "Saída");
  if (contraparte && !base.toLowerCase().includes(contraparte.toLowerCase())) {
    return `${base} — ${contraparte}`;
  }
  return base;
}
