import { FileText } from "lucide-react";
import { notFound } from "next/navigation";
import { requireModule } from "@/lib/auth";
import { db } from "@/lib/db";
import { date, money, timeSince } from "@/lib/format";
import { EtiquetaCliente, EtiquetaStatus } from "@/components/etiquetas";
import { LinhaClicavel } from "@/components/linha-clicavel";
import {
  Badge,
  Card,
  EmptyRow,
  LinkButton,
  PageHeader,
  Stat,
  TCell,
  THead,
  Table,
} from "@/components/ui";

export const metadata = { title: "Cliente — Move" };

export default async function ClientePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requireModule("CLIENTES");
  const { id } = await params;

  const cliente = await db.client.findUnique({
    where: { id },
    include: {
      contracts: { orderBy: { startDate: "desc" } },
      demands: {
        include: { assignee: { select: { name: true } } },
        orderBy: { createdAt: "desc" },
        take: 10,
      },
    },
  });

  if (!cliente) notFound();

  // Se a Alyson digitou "quanto paga" no cadastro, esse valor manda. Caso
  // contrario, somamos os contratos ativos (comportamento antigo).
  const somaContratos = cliente.contracts
    .filter((c) => c.status === "ATIVO")
    .reduce((s, c) => s + c.monthlyValue, 0);
  const mensal = cliente.monthlyFee ?? somaContratos;
  const origemMensal =
    cliente.monthlyFee != null ? "Valor combinado" : "Soma dos contratos ativos";

  const abertas = cliente.demands.filter((d) => d.status !== "CONCLUIDO").length;

  return (
    <>
      <PageHeader
        title={cliente.name}
        subtitle={cliente.company ?? undefined}
        action={
          <LinkButton href={`/clientes/${cliente.id}/editar`} variant="secundario">
            Editar dados
          </LinkButton>
        }
      />

      <div className="mb-6 grid gap-4 sm:grid-cols-3">
        <Stat
          label="Tempo de casa"
          value={timeSince(cliente.startDate)}
          hint={`Desde ${date(cliente.startDate)}`}
        />
        <Stat
          label="Paga por mês"
          value={mensal > 0 ? money(mensal) : "—"}
          hint={mensal > 0 ? origemMensal : "Ainda não informado"}
          tone="positivo"
        />
        <Stat
          label="Demandas abertas"
          value={String(abertas)}
          tone={abertas > 0 ? "atencao" : "neutro"}
        />
      </div>

      <div className="mb-6 grid gap-4 lg:grid-cols-2">
        <Card>
          <h2 className="mb-3 font-semibold text-slate-900">Contato</h2>
          <dl className="space-y-2 text-sm">
            <div className="flex justify-between gap-4">
              <dt className="text-slate-500">Pessoa de contato</dt>
              <dd className="text-slate-800">{cliente.contactName ?? "—"}</dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt className="text-slate-500">Telefone</dt>
              <dd className="text-slate-800">{cliente.phone ?? "—"}</dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt className="text-slate-500">E-mail</dt>
              <dd className="text-slate-800">{cliente.email ?? "—"}</dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt className="text-slate-500">Situação</dt>
              <dd>
                <EtiquetaCliente status={cliente.status} />
              </dd>
            </div>
          </dl>
        </Card>

        <Card>
          <h2 className="mb-3 font-semibold text-slate-900">Observações</h2>
          <p className="text-sm whitespace-pre-line text-slate-600">
            {cliente.notes || "Nada anotado sobre este cliente ainda."}
          </p>
        </Card>
      </div>

      <h2 className="mb-3 font-semibold text-slate-900">Contratos</h2>
      <div className="mb-6">
        <Table>
          <THead
            columns={[
              "Contrato",
              "Valor mensal",
              "Início",
              "Fim",
              "PDF",
              "Situação",
            ]}
          />
          <tbody>
            {cliente.contracts.length === 0 && (
              <EmptyRow colSpan={6}>
                Este cliente ainda não tem contrato cadastrado.
              </EmptyRow>
            )}
            {cliente.contracts.map((c) => (
              <LinhaClicavel key={c.id} href={`/contratos/${c.id}`}>
                <TCell>
                  <span className="font-medium text-slate-900">{c.title}</span>
                </TCell>
                <TCell className="font-medium">{money(c.monthlyValue)}</TCell>
                <TCell className="text-slate-600">{date(c.startDate)}</TCell>
                <TCell className="text-slate-600">
                  {c.endDate ? date(c.endDate) : "Sem data de fim"}
                </TCell>
                <TCell>
                  {c.pdfUrl ? (
                    <a
                      href={c.pdfUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-sm text-marca-600 hover:text-marca-700 hover:underline"
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
      </div>

      <h2 className="mb-3 font-semibold text-slate-900">Últimas demandas</h2>
      <Table>
        <THead columns={["Demanda", "Quem faz", "Prazo", "Situação"]} />
        <tbody>
          {cliente.demands.length === 0 && (
            <EmptyRow colSpan={4}>Nenhuma demanda para este cliente.</EmptyRow>
          )}
          {cliente.demands.map((d) => (
            <LinhaClicavel key={d.id} href={`/demandas/${d.id}`}>
              <TCell>
                <span className="font-medium text-slate-900">{d.title}</span>
              </TCell>
              <TCell className="text-slate-600">
                {d.assignee?.name ?? "Sem responsável"}
              </TCell>
              <TCell className="text-slate-600">{date(d.dueDate)}</TCell>
              <TCell>
                <EtiquetaStatus status={d.status} />
              </TCell>
            </LinhaClicavel>
          ))}
        </tbody>
      </Table>
    </>
  );
}
