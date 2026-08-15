import Link from "next/link";
import { clsx } from "clsx";
import { requireModule } from "@/lib/auth";
import { db } from "@/lib/db";
import { filtroDeVisibilidade } from "@/lib/demandas";
import { monthLabel, money } from "@/lib/format";
import { Card, LinkButton, PageHeader } from "@/components/ui";

export const metadata = { title: "Calendário — Move" };

const DIAS_DA_SEMANA = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];

type Evento = {
  dia: number;
  texto: string;
  tipo: "demanda" | "receber" | "pagar";
  link?: string;
};

export default async function CalendarioPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | undefined>>;
}) {
  const user = await requireModule("CALENDARIO");
  const filtros = await searchParams;
  const admin = user.role === "ADMIN";

  const hoje = new Date();
  const mes = Number(filtros.mes ?? hoje.getMonth() + 1);
  const ano = Number(filtros.ano ?? hoje.getFullYear());

  const inicio = new Date(ano, mes - 1, 1);
  const fim = new Date(ano, mes, 0, 23, 59, 59);

  const [demandas, cobrancas, contas] = await Promise.all([
    db.demand.findMany({
      where: {
        ...filtroDeVisibilidade(user),
        dueDate: { gte: inicio, lte: fim },
      },
      include: { client: true },
    }),
    admin
      ? db.receivable.findMany({
          where: { dueDate: { gte: inicio, lte: fim } },
          include: { client: true },
        })
      : Promise.resolve([]),
    admin
      ? db.payable.findMany({ where: { dueDate: { gte: inicio, lte: fim } } })
      : Promise.resolve([]),
  ]);

  const eventos: Evento[] = [
    ...demandas.map((d) => ({
      dia: new Date(d.dueDate!).getDate(),
      texto: d.title,
      tipo: "demanda" as const,
      link: `/demandas/${d.id}`,
    })),
    ...cobrancas.map((c) => ({
      dia: new Date(c.dueDate).getDate(),
      texto: `Receber ${money(c.amount)} — ${c.client?.name ?? c.description}`,
      tipo: "receber" as const,
      link: `/financeiro/receber/${c.id}`,
    })),
    ...contas.map((c) => ({
      dia: new Date(c.dueDate).getDate(),
      texto: `Pagar ${money(c.amount)} — ${c.description}`,
      tipo: "pagar" as const,
      link: `/financeiro/pagar/${c.id}`,
    })),
  ];

  // Monta as celulas do mes, comecando no domingo.
  const diasNoMes = fim.getDate();
  const vazias = inicio.getDay();
  const celulas: (number | null)[] = [
    ...Array<null>(vazias).fill(null),
    ...Array.from({ length: diasNoMes }, (_, i) => i + 1),
  ];
  while (celulas.length % 7 !== 0) celulas.push(null);

  const anterior =
    mes === 1 ? { mes: 12, ano: ano - 1 } : { mes: mes - 1, ano };
  const proximo = mes === 12 ? { mes: 1, ano: ano + 1 } : { mes: mes + 1, ano };

  const CORES = {
    demanda: "bg-marca-50 text-marca-700",
    receber: "bg-emerald-50 text-emerald-700",
    pagar: "bg-rose-50 text-rose-700",
  };

  return (
    <>
      <PageHeader
        title="Calendário"
        subtitle={
          admin
            ? "Prazos de entrega e vencimentos do mês."
            : "Prazos de entrega do mês."
        }
        action={
          <div className="flex gap-2">
            <LinkButton
              href={`/calendario?mes=${anterior.mes}&ano=${anterior.ano}`}
              variant="secundario"
            >
              ← Anterior
            </LinkButton>
            <LinkButton
              href={`/calendario?mes=${proximo.mes}&ano=${proximo.ano}`}
              variant="secundario"
            >
              Próximo →
            </LinkButton>
          </div>
        }
      />

      <Card>
        <h2 className="mb-4 text-center font-semibold text-slate-900">
          {monthLabel(mes, ano)}
        </h2>

        <div className="grid grid-cols-7 gap-1 text-center text-xs font-medium text-slate-400">
          {DIAS_DA_SEMANA.map((d) => (
            <div key={d} className="pb-2">
              {d}
            </div>
          ))}
        </div>

        <div className="grid grid-cols-7 gap-1">
          {celulas.map((dia, i) => {
            const doDia = dia ? eventos.filter((e) => e.dia === dia) : [];
            const ehHoje =
              dia === hoje.getDate() &&
              mes === hoje.getMonth() + 1 &&
              ano === hoje.getFullYear();

            return (
              <div
                key={i}
                className={clsx(
                  "min-h-24 rounded-lg border p-1.5",
                  dia ? "border-slate-200 bg-white" : "border-transparent",
                  ehHoje && "border-marca-500 bg-marca-50/40",
                )}
              >
                {dia && (
                  <>
                    <span
                      className={clsx(
                        "text-xs font-medium",
                        ehHoje ? "text-marca-700" : "text-slate-400",
                      )}
                    >
                      {dia}
                    </span>
                    <div className="mt-1 space-y-1">
                      {doDia.slice(0, 3).map((e, j) => (
                        <Link
                          key={j}
                          href={e.link ?? "#"}
                          className={clsx(
                            "block truncate rounded px-1.5 py-1 text-[11px] leading-tight",
                            CORES[e.tipo],
                          )}
                          title={e.texto}
                        >
                          {e.texto}
                        </Link>
                      ))}
                      {doDia.length > 3 && (
                        <p className="px-1.5 text-[11px] text-slate-400">
                          +{doDia.length - 3} mais
                        </p>
                      )}
                    </div>
                  </>
                )}
              </div>
            );
          })}
        </div>

        <div className="mt-5 flex flex-wrap gap-4 border-t border-slate-100 pt-4 text-xs text-slate-500">
          <span className="flex items-center gap-1.5">
            <span className="inline-block h-2.5 w-2.5 rounded-full bg-marca-500" />
            Prazo de demanda
          </span>
          {admin && (
            <>
              <span className="flex items-center gap-1.5">
                <span className="inline-block h-2.5 w-2.5 rounded-full bg-emerald-500" />
                Dinheiro a receber
              </span>
              <span className="flex items-center gap-1.5">
                <span className="inline-block h-2.5 w-2.5 rounded-full bg-rose-500" />
                Conta a pagar
              </span>
            </>
          )}
        </div>
      </Card>
    </>
  );
}
