import Link from "next/link";
import { requireUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { filtroDeVisibilidade } from "@/lib/demandas";
import { resumoFinanceiro } from "@/lib/financeiro";
import { date, money, monthLabel } from "@/lib/format";
import { EtiquetaStatus } from "@/components/etiquetas";
import { Card, PageHeader, Progress, Stat } from "@/components/ui";

export const metadata = { title: "Painel — Move" };

export default async function PainelPage() {
  const user = await requireUser();
  const admin = user.role === "ADMIN";
  const hoje = new Date();
  const inicioDoDia = new Date(hoje.toDateString());

  const visiveis = filtroDeVisibilidade(user);

  const [minhasDemandas, atrasadas, metas] = await Promise.all([
    db.demand.findMany({
      where: { ...visiveis, status: { not: "CONCLUIDO" } },
      include: { client: true },
      orderBy: [{ dueDate: "asc" }],
      take: 6,
    }),
    db.demand.count({
      where: {
        ...visiveis,
        status: { not: "CONCLUIDO" },
        dueDate: { lt: inicioDoDia },
      },
    }),
    db.goal.findMany({
      where: {
        month: hoje.getMonth() + 1,
        year: hoje.getFullYear(),
        ...(admin
          ? {}
          : { OR: [{ ownerId: user.id }, { scope: { in: ["EQUIPE", "AGENCIA"] } }] }),
      },
      orderBy: { scope: "asc" },
      take: 4,
    }),
  ]);

  const emAberto = await db.demand.count({
    where: { ...visiveis, status: { not: "CONCLUIDO" } },
  });

  const financeiro = admin ? await resumoFinanceiro() : null;

  const primeiroNome = user.name.split(" ")[0];

  return (
    <>
      <PageHeader
        title={`Olá, ${primeiroNome}`}
        subtitle={`Aqui está o resumo de ${monthLabel(hoje.getMonth() + 1, hoje.getFullYear())}.`}
      />

      <div className="mb-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Stat label="Demandas em aberto" value={String(emAberto)} />
        <Stat
          label="Passaram do prazo"
          value={String(atrasadas)}
          tone={atrasadas > 0 ? "negativo" : "positivo"}
        />
        {financeiro ? (
          <>
            <Stat
              label="Entra este mês"
              value={money(financeiro.aReceberNoMes)}
              tone="positivo"
            />
            <Stat
              label="Sai este mês"
              value={money(financeiro.aPagarNoMes)}
              tone="negativo"
            />
          </>
        ) : (
          <>
            <Stat label="Metas do mês" value={String(metas.length)} />
            <Stat
              label="Metas batidas"
              value={String(
                metas.filter((m) => m.currentValue >= m.targetValue).length,
              )}
              tone="positivo"
            />
          </>
        )}
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <div className="mb-3 flex items-baseline justify-between">
            <h2 className="font-semibold text-slate-900">Próximas entregas</h2>
            <Link
              href="/demandas"
              className="text-sm text-marca-600 hover:underline"
            >
              Ver todas
            </Link>
          </div>

          {minhasDemandas.length === 0 ? (
            <p className="py-6 text-center text-sm text-slate-400">
              Nada em aberto por aqui. Tudo em dia! 🎉
            </p>
          ) : (
            <ul className="divide-y divide-slate-100">
              {minhasDemandas.map((d) => {
                const atrasada = d.dueDate && d.dueDate < inicioDoDia;
                return (
                  <li key={d.id} className="py-2.5">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <Link
                          href={`/demandas/${d.id}`}
                          className="block truncate text-sm font-medium text-slate-900 hover:text-marca-600"
                        >
                          {d.title}
                        </Link>
                        <p className="text-xs text-slate-400">
                          {d.client?.name ?? "Interno"}
                        </p>
                      </div>
                      <div className="shrink-0 text-right">
                        <EtiquetaStatus status={d.status} />
                        {d.dueDate && (
                          <p
                            className={
                              atrasada
                                ? "mt-1 text-xs text-rose-600"
                                : "mt-1 text-xs text-slate-400"
                            }
                          >
                            {date(d.dueDate)}
                          </p>
                        )}
                      </div>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </Card>

        <Card>
          <div className="mb-3 flex items-baseline justify-between">
            <h2 className="font-semibold text-slate-900">Metas do mês</h2>
            <Link
              href="/metas"
              className="text-sm text-marca-600 hover:underline"
            >
              Ver todas
            </Link>
          </div>

          {metas.length === 0 ? (
            <p className="py-6 text-center text-sm text-slate-400">
              Nenhuma meta definida para este mês.
            </p>
          ) : (
            <ul className="space-y-4">
              {metas.map((m) => {
                const percent = m.targetValue
                  ? (m.currentValue / m.targetValue) * 100
                  : 0;
                return (
                  <li key={m.id}>
                    <div className="mb-1 flex justify-between text-sm">
                      <span className="text-slate-700">{m.title}</span>
                      <span className="text-slate-500">
                        {Math.round(percent)}%
                      </span>
                    </div>
                    <Progress percent={percent} />
                  </li>
                );
              })}
            </ul>
          )}
        </Card>
      </div>
    </>
  );
}
