import Link from "next/link";
import { requireModule } from "@/lib/auth";
import { db } from "@/lib/db";
import { marcarComoRecebido } from "@/app/actions/financeiro";
import { date, money } from "@/lib/format";
import { AbasFinanceiro } from "@/components/abas-financeiro";
import { EtiquetaPagamento } from "@/components/etiquetas";
import {
  Button,
  EmptyRow,
  LinkButton,
  PageHeader,
  Stat,
  TCell,
  THead,
  TRow,
  Table,
} from "@/components/ui";

export const metadata = { title: "Contas a receber — Move" };

export default async function ContasAReceberPage() {
  await requireModule("FINANCEIRO");

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
