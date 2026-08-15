import Link from "next/link";
import { notFound } from "next/navigation";
import { requireModule } from "@/lib/auth";
import { db } from "@/lib/db";
import { date, money, timeSince } from "@/lib/format";
import {
  EtiquetaCliente,
  EtiquetaPagamento,
  EtiquetaStatus,
} from "@/components/etiquetas";
import {
  Badge,
  Card,
  EmptyRow,
  LinkButton,
  PageHeader,
  Stat,
  TCell,
  THead,
  TRow,
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
      receivables: { orderBy: { dueDate: "desc" }, take: 10 },
    },
  });

  if (!cliente) notFound();

  const mensal = cliente.contracts
    .filter((c) => c.status === "ATIVO")
    .reduce((s, c) => s + c.monthlyValue, 0);

  const jaRecebido = cliente.receivables
    .filter((r) => r.status === "RECEBIDO")
    .reduce((s, r) => s + r.amount, 0);

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

      <div className="mb-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Stat label="Tempo de casa" value={timeSince(cliente.startDate)} hint={`Desde ${date(cliente.startDate)}`} />
        <Stat label="Por mês" value={mensal > 0 ? money(mensal) : "—"} hint="Contratos ativos" tone="positivo" />
        <Stat label="Já recebido" value={money(jaRecebido)} hint="Últimos lançamentos" />
        <Stat label="Demandas abertas" value={String(abertas)} tone={abertas > 0 ? "atencao" : "neutro"} />
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
          <THead columns={["Contrato", "Valor mensal", "Início", "Fim", "Situação"]} />
          <tbody>
            {cliente.contracts.length === 0 && (
              <EmptyRow colSpan={5}>
                Este cliente ainda não tem contrato cadastrado.
              </EmptyRow>
            )}
            {cliente.contracts.map((c) => (
              <TRow key={c.id}>
                <TCell>
                  <Link
                    href={`/contratos/${c.id}`}
                    className="font-medium text-slate-900 hover:text-marca-600"
                  >
                    {c.title}
                  </Link>
                </TCell>
                <TCell className="font-medium">{money(c.monthlyValue)}</TCell>
                <TCell className="text-slate-600">{date(c.startDate)}</TCell>
                <TCell className="text-slate-600">
                  {c.endDate ? date(c.endDate) : "Sem data de fim"}
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
      </div>

      <h2 className="mb-3 font-semibold text-slate-900">Últimas demandas</h2>
      <div className="mb-6">
        <Table>
          <THead columns={["Demanda", "Quem faz", "Prazo", "Situação"]} />
          <tbody>
            {cliente.demands.length === 0 && (
              <EmptyRow colSpan={4}>Nenhuma demanda para este cliente.</EmptyRow>
            )}
            {cliente.demands.map((d) => (
              <TRow key={d.id}>
                <TCell>
                  <Link
                    href={`/demandas/${d.id}`}
                    className="font-medium text-slate-900 hover:text-marca-600"
                  >
                    {d.title}
                  </Link>
                </TCell>
                <TCell className="text-slate-600">
                  {d.assignee?.name ?? "Sem responsável"}
                </TCell>
                <TCell className="text-slate-600">{date(d.dueDate)}</TCell>
                <TCell>
                  <EtiquetaStatus status={d.status} />
                </TCell>
              </TRow>
            ))}
          </tbody>
        </Table>
      </div>

      <h2 className="mb-3 font-semibold text-slate-900">Últimos pagamentos</h2>
      <Table>
        <THead columns={["Descrição", "Valor", "Vencimento", "Situação"]} />
        <tbody>
          {cliente.receivables.length === 0 && (
            <EmptyRow colSpan={4}>Nenhuma cobrança lançada.</EmptyRow>
          )}
          {cliente.receivables.map((r) => (
            <TRow key={r.id}>
              <TCell className="text-slate-800">{r.description}</TCell>
              <TCell className="font-medium">{money(r.amount)}</TCell>
              <TCell className="text-slate-600">{date(r.dueDate)}</TCell>
              <TCell>
                <EtiquetaPagamento
                  status={r.status}
                  dueDate={r.dueDate}
                  pagoLabel="Recebido"
                />
              </TCell>
            </TRow>
          ))}
        </tbody>
      </Table>
    </>
  );
}
