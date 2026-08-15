import Link from "next/link";
import { requireModule } from "@/lib/auth";
import { db } from "@/lib/db";
import { money, timeSince } from "@/lib/format";
import { EtiquetaCliente } from "@/components/etiquetas";
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

export default async function RelatoriosPage() {
  await requireModule("RELATORIOS");

  const clientes = await db.client.findMany({
    include: {
      contracts: true,
      demands: true,
      receivables: true,
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
      const entregues = c.demands.filter((d) => d.status === "CONCLUIDO").length;

      return {
        id: c.id,
        nome: c.name,
        status: c.status,
        desde: c.startDate,
        mensal,
        recebido,
        emAberto,
        entregues,
        totalDemandas: c.demands.length,
      };
    })
    .sort((a, b) => b.recebido - a.recebido);

  const receitaMensal = linhas.reduce((s, l) => s + l.mensal, 0);
  const totalRecebido = linhas.reduce((s, l) => s + l.recebido, 0);
  const totalEntregue = linhas.reduce((s, l) => s + l.entregues, 0);
  const melhor = linhas[0];

  return (
    <>
      <PageHeader
        title="Relatórios por cliente"
        subtitle="Quanto cada cliente rende, há quanto tempo está com a Move e quanto já foi entregue."
      />

      <div className="mb-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Stat
          label="Receita fixa por mês"
          value={money(receitaMensal)}
          hint="Contratos ativos"
          tone="positivo"
        />
        <Stat label="Já recebido no total" value={money(totalRecebido)} />
        <Stat label="Demandas entregues" value={String(totalEntregue)} />
        <Stat
          label="Cliente que mais rendeu"
          value={melhor?.nome ?? "—"}
          hint={melhor ? money(melhor.recebido) : undefined}
        />
      </div>

      <Table>
        <THead
          columns={[
            "Cliente",
            "Tempo de casa",
            "Por mês",
            "Já recebido",
            "Em aberto",
            "Entregues",
            "Situação",
          ]}
        />
        <tbody>
          {linhas.length === 0 && (
            <EmptyRow colSpan={7}>
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
          <strong>Por mês</strong> é a soma dos contratos ativos do cliente.{" "}
          <strong>Já recebido</strong> é tudo que entrou de verdade, somando
          mensalidades e trabalhos avulsos. <strong>Em aberto</strong> é o que
          ainda falta receber.
        </p>
      </Card>
    </>
  );
}
