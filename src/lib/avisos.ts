import { db } from "./db";
import type { SessionUser } from "./session";
import { daysUntil } from "./format";

export type Aviso = {
  texto: string;
  detalhe: string;
  link: string;
  urgente: boolean;
};

/** Quantos dias antes do fim do contrato o sistema começa a avisar. */
const DIAS_PARA_AVISAR_RENOVACAO = 60;

/**
 * O que esta pessoa precisa ver hoje.
 *
 * Para todo mundo: as demandas dela que venceram ou vencem hoje.
 * Só para o administrador: dinheiro atrasado e contratos perto de acabar.
 */
export async function avisosDe(user: SessionUser): Promise<Aviso[]> {
  const inicioDeHoje = new Date(new Date().toDateString());
  const fimDeHoje = new Date(inicioDeHoje);
  fimDeHoje.setHours(23, 59, 59);

  const avisos: Aviso[] = [];

  // --- Minhas demandas com prazo estourando -------------------------------
  const minhas = await db.demand.findMany({
    where: {
      assigneeId: user.id,
      status: { not: "CONCLUIDO" },
      dueDate: { lte: fimDeHoje },
    },
    orderBy: { dueDate: "asc" },
  });

  for (const d of minhas) {
    const dias = daysUntil(d.dueDate!);
    avisos.push({
      texto: d.title,
      detalhe:
        dias === 0
          ? "Vence hoje"
          : `Atrasada ${-dias} ${-dias === 1 ? "dia" : "dias"}`,
      link: `/demandas/${d.id}`,
      urgente: dias < 0,
    });
  }

  if (user.role !== "ADMIN") return avisos;

  // --- Só o administrador vê daqui para baixo -----------------------------
  const [aReceber, aPagar, contratos] = await Promise.all([
    db.receivable.findMany({
      where: { status: "PENDENTE", dueDate: { lt: inicioDeHoje } },
      include: { client: true },
      orderBy: { dueDate: "asc" },
    }),
    db.payable.findMany({
      where: { status: "PENDENTE", dueDate: { lt: inicioDeHoje } },
      orderBy: { dueDate: "asc" },
    }),
    db.contract.findMany({
      where: { status: "ATIVO", endDate: { not: null } },
      include: { client: true },
      orderBy: { endDate: "asc" },
    }),
  ]);

  for (const r of aReceber) {
    avisos.push({
      texto: `${r.client?.name ?? "Cliente"} não pagou`,
      detalhe: r.description,
      link: `/financeiro/receber/${r.id}`,
      urgente: true,
    });
  }

  for (const p of aPagar) {
    avisos.push({
      texto: `Conta vencida: ${p.description}`,
      detalhe: `Venceu em ${new Date(p.dueDate).toLocaleDateString("pt-BR")}`,
      link: `/financeiro/pagar/${p.id}`,
      urgente: true,
    });
  }

  for (const c of contratos) {
    const dias = daysUntil(c.endDate!);
    if (dias < 0 || dias > DIAS_PARA_AVISAR_RENOVACAO) continue;
    avisos.push({
      texto: `Contrato de ${c.client.name} acaba em breve`,
      detalhe:
        dias === 0 ? "Acaba hoje" : `Faltam ${dias} dias — hora de renovar`,
      link: `/contratos/${c.id}`,
      urgente: dias <= 15,
    });
  }

  return avisos;
}
