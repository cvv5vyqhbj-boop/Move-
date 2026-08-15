import { requireModule } from "@/lib/auth";
import { resumoFinanceiro } from "@/lib/financeiro";
import { date, money, monthLabel } from "@/lib/format";
import { AbasFinanceiro } from "@/components/abas-financeiro";
import { GraficoFinanceiro } from "@/components/grafico-financeiro";
import { Card, PageHeader, Stat } from "@/components/ui";

export const metadata = { title: "Financeiro — Move" };

export default async function FinanceiroPage() {
  await requireModule("FINANCEIRO");

  const r = await resumoFinanceiro();
  const hoje = new Date();
  const saldoPrevisto = r.aReceberNoMes - r.aPagarNoMes;

  return (
    <>
      <PageHeader
        title="Financeiro"
        subtitle={`Como está ${monthLabel(hoje.getMonth() + 1, hoje.getFullYear())}.`}
      />

      <AbasFinanceiro />

      <div className="mb-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Stat
          label="Entra este mês"
          value={money(r.aReceberNoMes)}
          hint={`${money(r.recebidoNoMes)} já recebido`}
          tone="positivo"
        />
        <Stat
          label="Sai este mês"
          value={money(r.aPagarNoMes)}
          hint={`${money(r.pagoNoMes)} já pago`}
          tone="negativo"
        />
        <Stat
          label="Sobra prevista"
          value={money(saldoPrevisto)}
          hint="Entra menos sai"
          tone={saldoPrevisto >= 0 ? "positivo" : "negativo"}
        />
        <Stat
          label="Em atraso"
          value={String(r.cobrancasVencidas.length + r.contasVencidas.length)}
          hint="Cobranças e contas vencidas"
          tone={
            r.cobrancasVencidas.length + r.contasVencidas.length > 0
              ? "atencao"
              : "neutro"
          }
        />
      </div>

      <Card className="mb-6">
        <h2 className="font-semibold text-slate-900">
          Quanto entrou e quanto saiu
        </h2>
        <p className="mb-4 text-sm text-slate-500">
          Últimos 6 meses, pela data de vencimento.
        </p>
        <GraficoFinanceiro dados={r.porMes} />
      </Card>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <h2 className="mb-1 font-semibold text-slate-900">
            Clientes em atraso
          </h2>
          <p className="mb-3 text-sm text-slate-500">
            Cobranças que passaram do vencimento.
          </p>
          {r.cobrancasVencidas.length === 0 ? (
            <p className="py-4 text-center text-sm text-slate-400">
              Nenhuma cobrança atrasada.
            </p>
          ) : (
            <ul className="divide-y divide-slate-100 text-sm">
              {r.cobrancasVencidas.map((c) => (
                <li key={c.id} className="flex justify-between gap-3 py-2">
                  <span className="text-slate-700">{c.description}</span>
                  <span className="whitespace-nowrap">
                    <span className="font-medium text-slate-900">
                      {money(c.amount)}
                    </span>
                    <span className="ml-2 text-xs text-rose-600">
                      {date(c.dueDate)}
                    </span>
                  </span>
                </li>
              ))}
            </ul>
          )}
        </Card>

        <Card>
          <h2 className="mb-1 font-semibold text-slate-900">Contas vencidas</h2>
          <p className="mb-3 text-sm text-slate-500">
            O que a agência já deveria ter pago.
          </p>
          {r.contasVencidas.length === 0 ? (
            <p className="py-4 text-center text-sm text-slate-400">
              Nenhuma conta atrasada.
            </p>
          ) : (
            <ul className="divide-y divide-slate-100 text-sm">
              {r.contasVencidas.map((c) => (
                <li key={c.id} className="flex justify-between gap-3 py-2">
                  <span className="text-slate-700">{c.description}</span>
                  <span className="whitespace-nowrap">
                    <span className="font-medium text-slate-900">
                      {money(c.amount)}
                    </span>
                    <span className="ml-2 text-xs text-rose-600">
                      {date(c.dueDate)}
                    </span>
                  </span>
                </li>
              ))}
            </ul>
          )}
        </Card>
      </div>
    </>
  );
}
