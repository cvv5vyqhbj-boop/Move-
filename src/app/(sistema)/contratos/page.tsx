import Link from "next/link";
import { requireModule } from "@/lib/auth";
import { db } from "@/lib/db";
import { date, money, timeSince } from "@/lib/format";
import {
  Badge,
  EmptyRow,
  LinkButton,
  PageHeader,
  Stat,
  TCell,
  THead,
  TRow,
  Table,
} from "@/components/ui";

export const metadata = { title: "Contratos — Move" };

export default async function ContratosPage() {
  await requireModule("CONTRATOS");

  const contratos = await db.contract.findMany({
    include: { client: true },
    orderBy: [{ status: "asc" }, { startDate: "desc" }],
  });

  const ativos = contratos.filter((c) => c.status === "ATIVO");
  const receita = ativos.reduce((s, c) => s + c.monthlyValue, 0);
  const ticket = ativos.length ? receita / ativos.length : 0;

  return (
    <>
      <PageHeader
        title="Contratos"
        subtitle="O que cada cliente contratou, por quanto e desde quando."
        action={<LinkButton href="/contratos/novo">+ Novo contrato</LinkButton>}
      />

      <div className="mb-6 grid gap-4 sm:grid-cols-3">
        <Stat label="Contratos ativos" value={String(ativos.length)} />
        <Stat
          label="Entra por mês"
          value={money(receita)}
          hint="Soma dos contratos ativos"
          tone="positivo"
        />
        <Stat label="Valor médio por cliente" value={money(ticket)} />
      </div>

      <Table>
        <THead
          columns={[
            "Cliente",
            "Contrato",
            "Valor mensal",
            "Início",
            "Tempo",
            "Fim",
            "Situação",
          ]}
        />
        <tbody>
          {contratos.length === 0 && (
            <EmptyRow colSpan={7}>
              Nenhum contrato cadastrado. Clique em “+ Novo contrato”.
            </EmptyRow>
          )}
          {contratos.map((c) => (
            <TRow key={c.id}>
              <TCell>
                <Link
                  href={`/clientes/${c.clientId}`}
                  className="font-medium text-slate-900 hover:text-marca-600"
                >
                  {c.client.name}
                </Link>
              </TCell>
              <TCell>
                <Link
                  href={`/contratos/${c.id}`}
                  className="text-slate-700 hover:text-marca-600"
                >
                  {c.title}
                </Link>
              </TCell>
              <TCell className="font-medium whitespace-nowrap">
                {money(c.monthlyValue)}
              </TCell>
              <TCell className="whitespace-nowrap text-slate-600">
                {date(c.startDate)}
              </TCell>
              <TCell className="whitespace-nowrap text-slate-600">
                {timeSince(c.startDate)}
              </TCell>
              <TCell className="whitespace-nowrap text-slate-600">
                {c.endDate ? date(c.endDate) : "Sem prazo"}
              </TCell>
              <TCell>
                <Badge tone={c.status === "ATIVO" ? "verde" : "cinza"}>
                  {c.status === "ATIVO" ? "Ativo" : "Encerrado"}
                </Badge>
              </TCell>
            </TRow>
          ))}
        </tbody>
      </Table>
    </>
  );
}
