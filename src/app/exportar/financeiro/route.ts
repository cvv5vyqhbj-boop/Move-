import { requireModule } from "@/lib/auth";
import { db } from "@/lib/db";
import {
  hojeParaArquivo,
  montarPlanilha,
  respostaDePlanilha,
} from "@/lib/planilha";

/** Baixa o financeiro inteiro (entradas e saídas) como planilha. */
export async function GET() {
  await requireModule("FINANCEIRO");

  const [receber, pagar] = await Promise.all([
    db.receivable.findMany({
      include: { client: true },
      orderBy: { dueDate: "asc" },
    }),
    db.payable.findMany({
      include: { client: true },
      orderBy: { dueDate: "asc" },
    }),
  ]);

  const linhas = [
    ...receber.map((r) => [
      "Entrada",
      r.description,
      r.client?.name ?? "",
      "",
      r.amount,
      r.dueDate.toLocaleDateString("pt-BR"),
      r.status === "RECEBIDO" ? "Recebido" : "Em aberto",
      r.receivedAt ? r.receivedAt.toLocaleDateString("pt-BR") : "",
    ]),
    ...pagar.map((p) => [
      "Saída",
      p.description,
      p.client?.name ?? "",
      p.category ?? "",
      p.amount,
      p.dueDate.toLocaleDateString("pt-BR"),
      p.status === "PAGO" ? "Pago" : "Em aberto",
      p.paidAt ? p.paidAt.toLocaleDateString("pt-BR") : "",
    ]),
  ].sort((a, b) => String(a[5]).localeCompare(String(b[5])));

  const planilha = montarPlanilha(
    [
      "Tipo",
      "Descrição",
      "Cliente",
      "Categoria",
      "Valor (R$)",
      "Vencimento",
      "Situação",
      "Data do pagamento",
    ],
    linhas,
  );

  return respostaDePlanilha(
    `move-financeiro-${hojeParaArquivo()}.csv`,
    planilha,
  );
}
