import { requireModule } from "@/lib/auth";
import { db } from "@/lib/db";
import { timeSince } from "@/lib/format";
import {
  hojeParaArquivo,
  montarPlanilha,
  respostaDePlanilha,
} from "@/lib/planilha";

/** Baixa o relatório por cliente como planilha. */
export async function GET() {
  await requireModule("RELATORIOS");

  const clientes = await db.client.findMany({
    include: { contracts: true, demands: true, receivables: true, payables: true },
    orderBy: { name: "asc" },
  });

  const linhas = clientes.map((c) => {
    const mensal = c.contracts
      .filter((k) => k.status === "ATIVO")
      .reduce((s, k) => s + k.monthlyValue, 0);
    const recebido = c.receivables
      .filter((r) => r.status === "RECEBIDO")
      .reduce((s, r) => s + r.amount, 0);
    const emAberto = c.receivables
      .filter((r) => r.status === "PENDENTE")
      .reduce((s, r) => s + r.amount, 0);
    const custos = c.payables.reduce((s, p) => s + p.amount, 0);

    return [
      c.name,
      c.company ?? "",
      c.startDate.toLocaleDateString("pt-BR"),
      timeSince(c.startDate),
      mensal,
      recebido,
      custos,
      recebido - custos,
      emAberto,
      c.demands.filter((d) => d.status === "CONCLUIDO").length,
      c.demands.length,
      c.status,
    ];
  });

  const planilha = montarPlanilha(
    [
      "Cliente",
      "Empresa",
      "Cliente desde",
      "Tempo de casa",
      "Valor mensal (R$)",
      "Já recebido (R$)",
      "Custos do cliente (R$)",
      "Sobra (R$)",
      "Em aberto (R$)",
      "Demandas entregues",
      "Demandas no total",
      "Situação",
    ],
    linhas,
  );

  return respostaDePlanilha(
    `move-clientes-${hojeParaArquivo()}.csv`,
    planilha,
  );
}
