import { requireModule } from "@/lib/auth";
import { db } from "@/lib/db";
import { filtroDeVisibilidade } from "@/lib/demandas";
import { AREAS, ROLE_AREA } from "@/lib/constants";
import { QuadroKanban } from "@/components/quadro-kanban";
import { Button, LinkButton, PageHeader, Select } from "@/components/ui";

export const metadata = { title: "Kanban — Move" };

export default async function KanbanPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | undefined>>;
}) {
  const user = await requireModule("KANBAN");
  const filtros = await searchParams;

  const [demandas, clientes] = await Promise.all([
    db.demand.findMany({
      where: {
        ...filtroDeVisibilidade(user),
        ...(filtros.cliente ? { clientId: filtros.cliente } : {}),
        ...(filtros.area ? { area: filtros.area } : {}),
      },
      include: {
        client: true,
        assignee: true,
        _count: { select: { comments: true } },
      },
      orderBy: [{ order: "asc" }, { createdAt: "asc" }],
    }),
    db.client.findMany({ orderBy: { name: "asc" } }),
  ]);

  const minhaArea = ROLE_AREA[user.role];

  return (
    <>
      <PageHeader
        title="Kanban"
        subtitle="Arraste o card para mudar a situação da demanda."
        action={<LinkButton href="/demandas/nova">+ Nova demanda</LinkButton>}
      />

      <form className="mb-5 grid gap-3 sm:grid-cols-3 lg:max-w-2xl">
        <Select
          name="cliente"
          defaultValue={filtros.cliente ?? ""}
          placeholder="Todos os clientes"
          options={clientes.map((c) => ({ value: c.id, label: c.name }))}
        />
        <Select
          name="area"
          defaultValue={filtros.area ?? ""}
          placeholder={minhaArea ? `Minha área (${AREAS[minhaArea]})` : "Todas as áreas"}
          options={Object.entries(AREAS).map(([value, label]) => ({
            value,
            label,
          }))}
        />
        <div className="flex gap-2">
          <Button type="submit" variant="secundario" className="w-full">
            Filtrar
          </Button>
          <LinkButton href="/kanban" variant="secundario">
            Limpar
          </LinkButton>
        </div>
      </form>

      <QuadroKanban
        inicial={demandas.map((d) => ({
          id: d.id,
          title: d.title,
          status: d.status,
          area: d.area,
          priority: d.priority,
          dueDate: d.dueDate,
          clienteNome: d.client?.name ?? "Interno",
          responsavelNome: d.assignee?.name ?? "Sem responsável",
          comentarios: d._count.comments,
        }))}
      />
    </>
  );
}
