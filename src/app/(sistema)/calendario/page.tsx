import { requireModule } from "@/lib/auth";
import { db } from "@/lib/db";
import { filtroDeVisibilidade } from "@/lib/demandas";
import { monthLabel, money } from "@/lib/format";
import {
  CalendarioMes,
  type DiaDoMes,
  type ItemAgenda,
  type ItemDoSistema,
} from "@/components/calendario-mes";
import { Card, LinkButton, PageHeader } from "@/components/ui";

export const metadata = { title: "Calendário — Move" };

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

  const [demandas, cobrancas, contas, agenda, clientes] = await Promise.all([
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
    db.agenda.findMany({
      where: { date: { gte: inicio, lte: fim } },
      include: { client: { select: { name: true } } },
      orderBy: [{ date: "asc" }, { time: "asc" }],
    }),
    db.client.findMany({
      where: { status: "ATIVO" },
      orderBy: { name: "asc" },
      select: { id: true, name: true },
    }),
  ]);

  // Agrupa tudo por dia do mês, para o componente da tela só desenhar.
  const porDia = new Map<number, DiaDoMes>();
  const doDia = (dia: number): DiaDoMes => {
    let d = porDia.get(dia);
    if (!d) {
      d = { dia, agenda: [], sistema: [] };
      porDia.set(dia, d);
    }
    return d;
  };

  for (const a of agenda) {
    const item: ItemAgenda = {
      id: a.id,
      title: a.title,
      type: a.type,
      time: a.time,
      notes: a.notes,
      clienteNome: a.client?.name ?? null,
    };
    doDia(new Date(a.date).getDate()).agenda.push(item);
  }

  const empurrar = (dia: number, item: ItemDoSistema) =>
    doDia(dia).sistema.push(item);

  for (const d of demandas) {
    empurrar(new Date(d.dueDate!).getDate(), {
      texto: d.title,
      tipo: "demanda",
      link: `/demandas/${d.id}`,
    });
  }
  for (const c of cobrancas) {
    empurrar(new Date(c.dueDate).getDate(), {
      texto: `Receber ${money(c.amount)} — ${c.client?.name ?? c.description}`,
      tipo: "receber",
      link: `/financeiro/receber/${c.id}`,
    });
  }
  for (const c of contas) {
    empurrar(new Date(c.dueDate).getDate(), {
      texto: `Pagar ${money(c.amount)} — ${c.description}`,
      tipo: "pagar",
      link: `/financeiro/pagar/${c.id}`,
    });
  }

  const anterior = mes === 1 ? { mes: 12, ano: ano - 1 } : { mes: mes - 1, ano };
  const proximo = mes === 12 ? { mes: 1, ano: ano + 1 } : { mes: mes + 1, ano };

  const ehMesAtual =
    mes === hoje.getMonth() + 1 && ano === hoje.getFullYear();

  return (
    <>
      <PageHeader
        title="Calendário"
        subtitle="Clique em qualquer dia para marcar uma gravação, um post, uma reunião."
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

        <CalendarioMes
          ano={ano}
          mes={mes}
          dias={[...porDia.values()]}
          clientes={clientes}
          hojeDia={hoje.getDate()}
          ehMesAtual={ehMesAtual}
        />

        <div className="mt-5 flex flex-wrap gap-x-4 gap-y-2 border-t border-slate-100 pt-4 text-xs text-slate-500">
          <span className="flex items-center gap-1.5">
            <span className="inline-block h-2.5 w-2.5 rounded-full bg-violet-500" />
            Gravação
          </span>
          <span className="flex items-center gap-1.5">
            <span className="inline-block h-2.5 w-2.5 rounded-full bg-sky-500" />
            Post
          </span>
          <span className="flex items-center gap-1.5">
            <span className="inline-block h-2.5 w-2.5 rounded-full bg-amber-500" />
            Reunião
          </span>
          <span className="flex items-center gap-1.5">
            <span className="inline-block h-2.5 w-2.5 rounded-full bg-emerald-500" />
            Entrega
          </span>
          <span className="flex items-center gap-1.5">
            <span className="inline-block h-2.5 w-2.5 rounded-full bg-marca-500" />
            Prazo de demanda
          </span>
          {admin && (
            <span className="flex items-center gap-1.5">
              <span className="inline-block h-2.5 w-2.5 rounded-full bg-rose-500" />
              Conta a pagar
            </span>
          )}
        </div>
      </Card>
    </>
  );
}
