import Link from "next/link";
import { requireModule } from "@/lib/auth";
import { db } from "@/lib/db";
import { date, daysUntil, money, timeSince } from "@/lib/format";
import { EtiquetaCliente } from "@/components/etiquetas";
import { BotoesExportar } from "@/components/botoes-exportar";
import {
  Card,
  EmptyRow,
  PageHeader,
  Stat,
  TCell,
  THead,
  TRow,
  Table,
} from "@/components/ui";

export const metadata = { title: "Relatórios — Move" };

/** Contratos que acabam nos próximos dois meses. */
const DIAS_PARA_AVISAR = 60;

export default async function RelatoriosPage() {
  await requireModule("RELATORIOS");

  const clientes = await db.client.findMany({
    include: {
      contracts: true,
      demands: true,
      receivables: true,
      payables: true,
    },
    orderBy: { name: "asc" },
  });

  const linhas = clientes
    .map((c) => {
      const mensal = c.contracts
        .filter((k) => k.status === "ATIVO")
        .reduce((s, k) => s + k.monthlyValue, 0);
      const recebido = c.receivables
        .filter((r) => r.status === "RECEBIDO")
        .reduce((s, r) => s + r.amount, 0);
      const emAberto = c.receivables
        .filter((r) => r.status === "PENDENTE")
        .reduce((s, r) => s + r.amount, 0);
      // Só os custos que foram apontados para este cliente.
      const custos = c.payables.reduce((s, p) => s + p.amount, 0);
      const entregues = c.demands.filter((d) => d.status === "CONCLUIDO").length;

      return {
        id: c.id,
        nome: c.name,
        status: c.status,
        desde: c.startDate,
        mensal,
        recebido,
        emAberto,
        custos,
        sobra: recebido - custos,
        entregues,
        totalDemandas: c.demands.length,
      };
    })
    .sort((a, b) => b.sobra - a.sobra);

  // Contratos chegando ao fim.
  const renovacoes = (
    await db.contract.findMany({
      where: { status: "ATIVO", endDate: { not: null } },
      include: { client: true },
      orderBy: { endDate: "asc" },
    })
  ).filter((c) => {
    const dias = daysUntil(c.endDate!);
    return dias >= 0 && dias <= DIAS_PARA_AVISAR;
  });

  const receitaMensal = linhas.reduce((s, l) => s + l.mensal, 0);
  const totalRecebido = linhas.reduce((s, l) => s + l.recebido, 0);
  const totalCustos = linhas.reduce((s, l) => s + l.custos, 0);
  const melhor = linhas[0];

  return (
    <>
      <PageHeader
        title="Relatórios por cliente"
        subtitle="Quanto cada cliente rende, quanto custa e o que sobra de verdade."
        action={<BotoesExportar arquivo="/exportar/clientes" />}
      />

      <div className="mb-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Stat
          label="Receita fixa por mês"
          value={money(receitaMensal)}
          hint="Contratos ativos"
          tone="positivo"
        />
        <Stat label="Já recebido no total" value={money(totalRecebido)} />
        <Stat
          label="Custo ligado a clientes"
          value={money(totalCustos)}
          hint="Freelas, diárias, impulsionamento"
          tone="negativo"
        />
        <Stat
          label="Cliente que mais dá lucro"
          value={melhor?.nome ?? "—"}
          hint={melhor ? `${money(melhor.sobra)} de sobra` : undefined}
        />
      </div>

      {renovacoes.length > 0 && (
        <Card className="mb-6 border-amber-200 bg-amber-50">
          <h2 className="font-semibold text-amber-900">
            Contratos para renovar
          </h2>
          <p className="mb-3 text-sm text-amber-800">
            Estes contratos acabam nos próximos {DIAS_PARA_AVISAR} dias. Fale com
            o cliente antes do prazo.
          </p>
          <ul className="divide-y divide-amber-200 text-sm">
            {renovacoes.map((c) => {
              const dias = daysUntil(c.endDate!);
              return (
                <li key={c.id} className="flex justify-between gap-3 py-2">
                  <Link
                    href={`/contratos/${c.id}`}
                    className="font-medium text-amber-900 hover:underline"
                  >
                    {c.client.name} — {c.title}
                  </Link>
                  <span className="whitespace-nowrap text-amber-800">
                    {money(c.monthlyValue)}/mês · acaba {date(c.endDate)} (
                    {dias === 0 ? "hoje" : `${dias} dias`})
                  </span>
                </li>
              );
            })}
          </ul>
        </Card>
      )}

      <Table>
        <THead
          columns={[
            "Cliente",
            "Tempo de casa",
            "Por mês",
            "Já recebido",
            "Custos",
            "Sobra",
            "Em aberto",
            "Entregues",
            "Situação",
          ]}
        />
        <tbody>
          {linhas.length === 0 && (
            <EmptyRow colSpan={9}>
              Cadastre clientes para ver os relatórios.
            </EmptyRow>
          )}
          {linhas.map((l) => (
            <TRow key={l.id}>
              <TCell>
                <Link
                  href={`/clientes/${l.id}`}
                  className="font-medium text-slate-900 hover:text-marca-600"
                >
                  {l.nome}
                </Link>
              </TCell>
              <TCell className="whitespace-nowrap text-slate-600">
                {timeSince(l.desde)}
              </TCell>
              <TCell className="whitespace-nowrap font-medium">
                {l.mensal > 0 ? money(l.mensal) : "—"}
              </TCell>
              <TCell className="whitespace-nowrap text-slate-700">
                {money(l.recebido)}
              </TCell>
              <TCell className="whitespace-nowrap text-slate-600">
                {l.custos > 0 ? `− ${money(l.custos)}` : "—"}
              </TCell>
              <TCell
                className={
                  l.sobra >= 0
                    ? "font-semibold whitespace-nowrap text-emerald-700"
                    : "font-semibold whitespace-nowrap text-rose-600"
                }
              >
                {money(l.sobra)}
              </TCell>
              <TCell className="whitespace-nowrap text-slate-600">
                {l.emAberto > 0 ? money(l.emAberto) : "—"}
              </TCell>
              <TCell className="text-slate-600">
                {l.entregues} de {l.totalDemandas}
              </TCell>
              <TCell>
                <EtiquetaCliente status={l.status} />
              </TCell>
            </TRow>
          ))}
        </tbody>
      </Table>

      <Card className="mt-6">
        <h2 className="mb-1 font-semibold text-slate-900">Como ler isso</h2>
        <p className="text-sm text-slate-500">
          <strong>Por mês</strong> é a soma dos contratos ativos.{" "}
          <strong>Já recebido</strong> é tudo que entrou de verdade.{" "}
          <strong>Custos</strong> são as contas a pagar que você apontou para
          aquele cliente (freela, diária, impulsionamento) — para aparecer aqui,
          escolha o cliente ao lançar a conta em Financeiro.{" "}
          <strong>Sobra</strong> é o recebido menos esses custos.
        </p>
      </Card>
    </>
  );
}
