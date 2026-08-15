import { db } from "./db";
import { MONTHS } from "./constants";

/** Primeiro e ultimo dia de um mes (indice 0-11). */
function limitesDoMes(ano: number, mes: number) {
  return {
    inicio: new Date(ano, mes, 1),
    fim: new Date(ano, mes + 1, 0, 23, 59, 59),
  };
}

/**
 * Numeros do financeiro usados no painel, no resumo e nos relatorios.
 * Fica num lugar so para as telas nunca mostrarem contas diferentes.
 */
export async function resumoFinanceiro(mesesNoGrafico = 6) {
  const hoje = new Date();
  const { inicio, fim } = limitesDoMes(hoje.getFullYear(), hoje.getMonth());

  const [pagar, receber] = await Promise.all([
    db.payable.findMany(),
    db.receivable.findMany(),
  ]);

  const emAberto = <T extends { status: string }>(lista: T[]) =>
    lista.filter((i) => i.status === "PENDENTE");

  const soma = (lista: { amount: number }[]) =>
    lista.reduce((s, i) => s + i.amount, 0);

  const noMes = <T extends { dueDate: Date }>(lista: T[]) =>
    lista.filter((i) => i.dueDate >= inicio && i.dueDate <= fim);

  const vencidas = <T extends { dueDate: Date; status: string }>(lista: T[]) =>
    lista.filter((i) => i.status === "PENDENTE" && i.dueDate < hoje);

  // Serie dos ultimos meses para o grafico.
  const porMes = [];
  for (let i = mesesNoGrafico - 1; i >= 0; i--) {
    const d = new Date(hoje.getFullYear(), hoje.getMonth() - i, 1);
    const faixa = limitesDoMes(d.getFullYear(), d.getMonth());
    const dentro = <T extends { dueDate: Date }>(lista: T[]) =>
      lista.filter((x) => x.dueDate >= faixa.inicio && x.dueDate <= faixa.fim);

    porMes.push({
      mes: MONTHS[d.getMonth()].slice(0, 3),
      entrou: soma(dentro(receber)),
      saiu: soma(dentro(pagar)),
    });
  }

  return {
    aReceberNoMes: soma(noMes(receber)),
    aPagarNoMes: soma(noMes(pagar)),
    aReceberEmAberto: soma(emAberto(receber)),
    aPagarEmAberto: soma(emAberto(pagar)),
    recebidoNoMes: soma(noMes(receber).filter((r) => r.status === "RECEBIDO")),
    pagoNoMes: soma(noMes(pagar).filter((p) => p.status === "PAGO")),
    cobrancasVencidas: vencidas(receber),
    contasVencidas: vencidas(pagar),
    porMes,
  };
}
