import Link from "next/link";
import { requireModule } from "@/lib/auth";
import { db } from "@/lib/db";
import {
  gerarMensalidadesDoMes,
  marcarComoRecebido,
} from "@/app/actions/financeiro";
import { date, money, monthLabel } from "@/lib/format";
import { AbasFinanceiro } from "@/components/abas-financeiro";
import { EtiquetaPagamento } from "@/components/etiquetas";
import {
  Button,
  Card,
  EmptyRow,
  Input,
  LinkButton,
  PageHeader,
  Stat,
  TCell,
  THead,
  TRow,
  Table,
} from "@/components/ui";

export const metadata = { title: "Contas a receber — Move" };

export default async function ContasAReceberPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | undefined>>;
}) {
  await requireModule("FINANCEIRO");
  const geradas = (await searchParams).geradas;
  const hoje = new Date();

  const cobrancas = await db.receivable.findMany({
    include: { client: true },
    orderBy: [{ status: "asc" }, { dueDate: "asc" }],
  });

  const emAberto = cobrancas.filter((c) => c.status === "PENDENTE");
  const total = emAberto.reduce((s, c) => s + c.amount, 0);
  const vencidas = emAberto.filter(
    (c) => c.dueDate < new Date(new Date().toDateString()),
  );

  return (
    <>
      <PageHeader
        title="Contas a receber"
        subtitle="Tudo que os clientes têm a pagar para a Move."
        action={
          <LinkButton href="/financeiro/receber/nova">
            + Lançar cobrança
          </LinkButton>
        }
      />

      <AbasFinanceiro />

      {geradas !== undefined && (
        <p className="mb-4 rounded-lg bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
          {Number(geradas) === 0
            ? "As mensalidades deste mês já estavam lançadas. Nada foi duplicado."
            : `${geradas} ${Number(geradas) === 1 ? "mensalidade lançada" : "mensalidades lançadas"} a partir dos contratos ativos.`}
        </p>
      )}

      <Card className="mb-6">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <h2 className="font-semibold text-slate-900">
              Mensalidades de {monthLabel(hoje.getMonth() + 1, hoje.getFullYear())}
            </h2>
            <p className="mt-1 text-sm text-slate-500">
              Lança de uma vez a mensalidade de cada contrato ativo. Se já estiver
              lançada, não duplica.
            </p>
          </div>
          <form action={gerarMensalidadesDoMes} className="flex items-end gap-2">
            <label className="text-sm">
              <span className="mb-1 block text-slate-600">Vence dia</span>
              <Input
                name="dia"
                type="number"
                min={1}
                max={28}
                defaultValue={10}
                className="w-20"
              />
            </label>
            <Button type="submit">Lançar mensalidades</Button>
          </form>
        </div>
      </Card>

      <div className="mb-6 grid gap-4 sm:grid-cols-3">
        <Stat label="A receber" value={money(total)} tone="positivo" />
        <Stat label="Cobranças em aberto" value={String(emAberto.length)} />
        <Stat
          label="Em atraso"
          value={String(vencidas.length)}
          tone={vencidas.length > 0 ? "atencao" : "neutro"}
        />
      </div>

      <Table>
        <THead
          columns={["Cobrança", "Cliente", "Valor", "Vence em", "Situação", ""]}
        />
        <tbody>
          {cobrancas.length === 0 && (
            <EmptyRow colSpan={6}>
              Nenhuma cobrança lançada. Clique em “+ Lançar cobrança”.
            </EmptyRow>
          )}
          {cobrancas.map((c) => (
            <TRow key={c.id}>
              <TCell>
                <Link
                  href={`/financeiro/receber/${c.id}`}
                  className="font-medium text-slate-900 hover:text-marca-600"
                >
                  {c.description}
                </Link>
              </TCell>
              <TCell className="text-slate-600">
                {c.client?.name ?? "Sem cliente"}
              </TCell>
              <TCell className="font-medium whitespace-nowrap">
                {money(c.amount)}
              </TCell>
              <TCell className="whitespace-nowrap text-slate-600">
                {date(c.dueDate)}
              </TCell>
              <TCell>
                <EtiquetaPagamento
                  status={c.status}
                  dueDate={c.dueDate}
                  pagoLabel="Recebido"
                />
              </TCell>
              <TCell>
                <form action={marcarComoRecebido}>
                  <input type="hidden" name="id" value={c.id} />
                  {c.status === "RECEBIDO" && (
                    <input type="hidden" name="desmarcar" value="1" />
                  )}
                  <Button type="submit" variant="secundario">
                    {c.status === "RECEBIDO" ? "Desfazer" : "Marcar recebida"}
                  </Button>
                </form>
              </TCell>
            </TRow>
          ))}
        </tbody>
      </Table>
    </>
  );
}
