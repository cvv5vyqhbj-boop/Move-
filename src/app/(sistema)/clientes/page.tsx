import Link from "next/link";
import { requireModule } from "@/lib/auth";
import { db } from "@/lib/db";
import { date, money, timeSince } from "@/lib/format";
import { EtiquetaCliente } from "@/components/etiquetas";
import {
  EmptyRow,
  LinkButton,
  PageHeader,
  Stat,
  TCell,
  THead,
  TRow,
  Table,
} from "@/components/ui";

export const metadata = { title: "Clientes — Move" };

export default async function ClientesPage() {
  await requireModule("CLIENTES");

  const clientes = await db.client.findMany({
    include: { contracts: true, demands: { select: { status: true } } },
    orderBy: { startDate: "asc" },
  });

  const ativos = clientes.filter((c) => c.status === "ATIVO");
  const receitaMensal = clientes
    .flatMap((c) => c.contracts)
    .filter((c) => c.status === "ATIVO")
    .reduce((soma, c) => soma + c.monthlyValue, 0);

  return (
    <>
      <PageHeader
        title="Clientes"
        subtitle="Quem são, desde quando estão com a gente e quanto rendem por mês."
        action={<LinkButton href="/clientes/novo">+ Novo cliente</LinkButton>}
      />

      <div className="mb-6 grid gap-4 sm:grid-cols-3">
        <Stat label="Clientes ativos" value={String(ativos.length)} />
        <Stat
          label="Receita fixa por mês"
          value={money(receitaMensal)}
          hint="Soma dos contratos ativos"
          tone="positivo"
        />
        <Stat
          label="Cliente mais antigo"
          value={clientes[0] ? timeSince(clientes[0].startDate) : "—"}
          hint={clientes[0]?.name}
        />
      </div>

      <Table>
        <THead
          columns={[
            "Cliente",
            "Contato",
            "Cliente desde",
            "Tempo de casa",
            "Por mês",
            "Demandas abertas",
            "Situação",
          ]}
        />
        <tbody>
          {clientes.length === 0 && (
            <EmptyRow colSpan={7}>
              Nenhum cliente cadastrado ainda. Clique em “+ Novo cliente”.
            </EmptyRow>
          )}
          {clientes.map((c) => {
            const mensal = c.contracts
              .filter((k) => k.status === "ATIVO")
              .reduce((s, k) => s + k.monthlyValue, 0);
            const abertas = c.demands.filter(
              (d) => d.status !== "CONCLUIDO",
            ).length;

            return (
              <TRow key={c.id}>
                <TCell>
                  <Link
                    href={`/clientes/${c.id}`}
                    className="font-medium text-slate-900 hover:text-marca-600"
                  >
                    {c.name}
                  </Link>
                  {c.company && (
                    <span className="block text-xs text-slate-400">
                      {c.company}
                    </span>
                  )}
                </TCell>
                <TCell className="text-slate-600">
                  {c.contactName ?? "—"}
                  {c.phone && (
                    <span className="block text-xs text-slate-400">
                      {c.phone}
                    </span>
                  )}
                </TCell>
                <TCell className="whitespace-nowrap text-slate-600">
                  {date(c.startDate)}
                </TCell>
                <TCell className="whitespace-nowrap text-slate-600">
                  {timeSince(c.startDate)}
                </TCell>
                <TCell className="whitespace-nowrap font-medium text-slate-900">
                  {mensal > 0 ? money(mensal) : "—"}
                </TCell>
                <TCell className="text-slate-600">{abertas}</TCell>
                <TCell>
                  <EtiquetaCliente status={c.status} />
                </TCell>
              </TRow>
            );
          })}
        </tbody>
      </Table>
    </>
  );
}
