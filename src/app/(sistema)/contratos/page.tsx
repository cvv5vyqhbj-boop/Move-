import { FileText } from "lucide-react";
import { requireModule } from "@/lib/auth";
import { db } from "@/lib/db";
import { date, money, timeSince } from "@/lib/format";
import { LinhaClicavel } from "@/components/linha-clicavel";
import {
  Badge,
  EmptyRow,
  LinkButton,
  PageHeader,
  Stat,
  TCell,
  THead,
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
            "PDF",
            "Situação",
          ]}
        />
        <tbody>
          {contratos.length === 0 && (
            <EmptyRow colSpan={8}>
              Nenhum contrato cadastrado. Clique em “+ Novo contrato”.
            </EmptyRow>
          )}
          {contratos.map((c) => (
            <LinhaClicavel key={c.id} href={`/contratos/${c.id}`}>
              <TCell>
                <span className="font-medium text-slate-900">
                  {c.client.name}
                </span>
              </TCell>
              <TCell className="text-slate-700">{c.title}</TCell>
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
                {c.pdfUrl ? (
                  <a
                    href={c.pdfUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-sm text-marca-600 hover:text-marca-700 hover:underline"
                    title="Abrir contrato em uma nova aba"
                  >
                    <FileText size={14} />
                    Abrir
                  </a>
                ) : (
                  <span className="text-xs text-slate-400">—</span>
                )}
              </TCell>
              <TCell>
                <Badge tone={c.status === "ATIVO" ? "verde" : "cinza"}>
                  {c.status === "ATIVO" ? "Ativo" : "Encerrado"}
                </Badge>
              </TCell>
            </LinhaClicavel>
          ))}
        </tbody>
      </Table>
    </>
  );
}
