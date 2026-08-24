import Link from "next/link";
import { requireModule } from "@/lib/auth";
import { db } from "@/lib/db";
import { marcarComoPago } from "@/app/actions/financeiro";
import { date, money } from "@/lib/format";
import { AbasFinanceiro } from "@/components/abas-financeiro";
import { BotaoSincronizarCora } from "@/components/botao-sincronizar-cora";
import { coraConfigurado } from "@/lib/cora";
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

export const metadata = { title: "Contas a pagar — Move" };

export default async function ContasAPagarPage() {
  await requireModule("FINANCEIRO");

  const contas = await db.payable.findMany({
    orderBy: [{ status: "asc" }, { dueDate: "asc" }],
  });

  const emAberto = contas.filter((c) => c.status === "PENDENTE");
  const total = emAberto.reduce((s, c) => s + c.amount, 0);
  const vencidas = emAberto.filter(
    (c) => c.dueDate < new Date(new Date().toDateString()),
  );

  return (
    <>
      <PageHeader
        title="Contas a pagar"
        subtitle="Tudo que a agência precisa pagar."
        action={
          <LinkButton href="/financeiro/pagar/nova">+ Lançar conta</LinkButton>
        }
      />

      <AbasFinanceiro />

      {coraConfigurado() && (
        <div className="mb-4">
          <BotaoSincronizarCora />
        </div>
      )}

      <div className="mb-6 grid gap-4 sm:grid-cols-3">
        <Stat label="Em aberto" value={money(total)} tone="negativo" />
        <Stat label="Contas em aberto" value={String(emAberto.length)} />
        <Stat
          label="Vencidas"
          value={String(vencidas.length)}
          tone={vencidas.length > 0 ? "atencao" : "neutro"}
        />
      </div>

      <Table>
        <THead
          columns={[
            "Conta",
            "Para quem",
            "Tipo",
            "Valor",
            "Vence em",
            "Situação",
            "",
          ]}
        />
        <tbody>
          {contas.length === 0 && (
            <EmptyRow colSpan={7}>
              Nenhuma conta lançada. Clique em “+ Lançar conta”.
            </EmptyRow>
          )}
          {contas.map((c) => (
            <TRow key={c.id}>
              <TCell>
                <Link
                  href={`/financeiro/pagar/${c.id}`}
                  className="font-medium text-slate-900 hover:text-marca-600"
                >
                  {c.description}
                </Link>
              </TCell>
              <TCell className="text-slate-600">{c.supplier ?? "—"}</TCell>
              <TCell className="text-slate-600">{c.category ?? "—"}</TCell>
              <TCell className="font-medium whitespace-nowrap">
                {money(c.amount)}
              </TCell>
              <TCell className="whitespace-nowrap text-slate-600">
                {date(c.dueDate)}
              </TCell>
              <TCell>
                <EtiquetaPagamento status={c.status} dueDate={c.dueDate} />
              </TCell>
              <TCell>
                <form action={marcarComoPago}>
                  <input type="hidden" name="id" value={c.id} />
                  {c.status === "PAGO" && (
                    <input type="hidden" name="desmarcar" value="1" />
                  )}
                  <Button type="submit" variant="secundario">
                    {c.status === "PAGO" ? "Desfazer" : "Marcar como paga"}
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
