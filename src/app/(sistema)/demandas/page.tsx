import Link from "next/link";
import { requireModule } from "@/lib/auth";
import { db } from "@/lib/db";
import { filtroDeVisibilidade } from "@/lib/demandas";
import { AREAS, ROLE_AREA, STATUS } from "@/lib/constants";
import { date, dueLabel } from "@/lib/format";
import {
  EtiquetaArea,
  EtiquetaPrioridade,
  EtiquetaStatus,
} from "@/components/etiquetas";
import {
  Button,
  EmptyRow,
  LinkButton,
  PageHeader,
  Select,
  TCell,
  THead,
  TRow,
  Table,
} from "@/components/ui";

export const metadata = { title: "Demandas — Move" };

export default async function DemandasPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | undefined>>;
}) {
  const user = await requireModule("DEMANDAS");
  const filtros = await searchParams;

  const where = {
    ...filtroDeVisibilidade(user),
    ...(filtros.cliente ? { clientId: filtros.cliente } : {}),
    ...(filtros.area ? { area: filtros.area } : {}),
    ...(filtros.pessoa ? { assigneeId: filtros.pessoa } : {}),
    ...(filtros.situacao ? { status: filtros.situacao } : {}),
  };

  const [demandas, clientes, pessoas] = await Promise.all([
    db.demand.findMany({
      where,
      include: { client: true, assignee: true },
      orderBy: [{ dueDate: "asc" }, { createdAt: "desc" }],
    }),
    db.client.findMany({ orderBy: { name: "asc" } }),
    db.user.findMany({ where: { active: true }, orderBy: { name: "asc" } }),
  ]);

  const minhaArea = ROLE_AREA[user.role];

  return (
    <>
      <PageHeader
        title="Demandas"
        subtitle={
          minhaArea
            ? `Você está vendo as demandas de ${AREAS[minhaArea].toLowerCase()} e as que são suas.`
            : "Todas as demandas da agência."
        }
        action={<LinkButton href="/demandas/nova">+ Nova demanda</LinkButton>}
      />

      {/* Filtros: formulario simples, funciona sem depender de nada */}
      <form className="mb-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
        <Select
          name="cliente"
          defaultValue={filtros.cliente ?? ""}
          placeholder="Todos os clientes"
          options={clientes.map((c) => ({ value: c.id, label: c.name }))}
        />
        <Select
          name="area"
          defaultValue={filtros.area ?? ""}
          placeholder="Todas as áreas"
          options={Object.entries(AREAS).map(([value, label]) => ({
            value,
            label,
          }))}
        />
        <Select
          name="pessoa"
          defaultValue={filtros.pessoa ?? ""}
          placeholder="Todas as pessoas"
          options={pessoas.map((p) => ({ value: p.id, label: p.name }))}
        />
        <Select
          name="situacao"
          defaultValue={filtros.situacao ?? ""}
          placeholder="Todas as situações"
          options={Object.entries(STATUS).map(([value, label]) => ({
            value,
            label,
          }))}
        />
        <div className="flex gap-2">
          <Button type="submit" variant="secundario" className="w-full">
            Filtrar
          </Button>
          <LinkButton href="/demandas" variant="secundario">
            Limpar
          </LinkButton>
        </div>
      </form>

      <Table>
        <THead
          columns={[
            "Demanda",
            "Cliente",
            "Área",
            "Quem faz",
            "Prazo",
            "Prioridade",
            "Situação",
          ]}
        />
        <tbody>
          {demandas.length === 0 && (
            <EmptyRow colSpan={7}>
              Nenhuma demanda por aqui. Clique em “+ Nova demanda” para criar a
              primeira.
            </EmptyRow>
          )}
          {demandas.map((d) => (
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
                {d.client?.name ?? "Interno"}
              </TCell>
              <TCell>
                <EtiquetaArea area={d.area} />
              </TCell>
              <TCell className="text-slate-600">
                {d.assignee?.name ?? "Sem responsável"}
              </TCell>
              <TCell className="whitespace-nowrap">
                {d.dueDate ? (
                  <>
                    <span className="text-slate-700">{date(d.dueDate)}</span>
                    {d.status !== "CONCLUIDO" && (
                      <span
                        className={
                          new Date(d.dueDate) < new Date()
                            ? "block text-xs text-rose-600"
                            : "block text-xs text-slate-400"
                        }
                      >
                        {dueLabel(d.dueDate)}
                      </span>
                    )}
                  </>
                ) : (
                  <span className="text-slate-400">Sem prazo</span>
                )}
              </TCell>
              <TCell>
                <EtiquetaPrioridade priority={d.priority} />
              </TCell>
              <TCell>
                <EtiquetaStatus status={d.status} />
              </TCell>
            </TRow>
          ))}
        </tbody>
      </Table>

      <p className="mt-3 text-sm text-slate-500">
        {demandas.length}{" "}
        {demandas.length === 1 ? "demanda encontrada" : "demandas encontradas"}.
      </p>
    </>
  );
}
