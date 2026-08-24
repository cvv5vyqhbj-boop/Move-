import { requireModule } from "@/lib/auth";
import { db } from "@/lib/db";
import { AREAS } from "@/lib/constants";
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

  // Modo do quadro:
  // - "minhas" (padrao): so as demandas dela que ainda nao estao concluidas.
  // - "todas": tudo, como um kanban geral (util para ver o que o time esta fazendo).
  // O administrador tambem pode alternar entre os dois.
  const modo = filtros.modo === "todas" ? "todas" : "minhas";

  const where = {
    ...(filtros.cliente ? { clientId: filtros.cliente } : {}),
    ...(filtros.area ? { area: filtros.area } : {}),
    ...(modo === "minhas"
      ? { assigneeId: user.id, status: { not: "CONCLUIDO" } }
      : {}),
  };

  const [demandas, clientes] = await Promise.all([
    db.demand.findMany({
      where,
      include: {
        client: true,
        assignee: true,
        _count: { select: { comments: true } },
      },
      orderBy: [{ order: "asc" }, { createdAt: "asc" }],
    }),
    db.client.findMany({ orderBy: { name: "asc" } }),
  ]);

  const subtitulo =
    modo === "minhas"
      ? "Suas demandas em aberto. Arraste o card para mudar a situação."
      : "Todas as demandas do time. Arraste o card para mudar a situação.";

  const linkAlternar =
    modo === "minhas"
      ? "/kanban?modo=todas"
      : "/kanban?modo=minhas";
  const textoAlternar = modo === "minhas" ? "Ver todas do time" : "Ver só minhas";

  return (
    <>
      <PageHeader
        title="Kanban"
        subtitle={subtitulo}
        action={
          <div className="flex flex-wrap gap-2">
            <LinkButton href={linkAlternar} variant="secundario">
              {textoAlternar}
            </LinkButton>
            <LinkButton href="/demandas/nova">+ Nova demanda</LinkButton>
          </div>
        }
      />

      <form className="mb-5 grid gap-3 sm:grid-cols-3 lg:max-w-2xl">
        {/* preserva o modo escolhido ao filtrar */}
        <input type="hidden" name="modo" value={modo} />
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
        <div className="flex gap-2">
          <Button type="submit" variant="secundario" className="w-full">
            Filtrar
          </Button>
          <LinkButton
            href={modo === "minhas" ? "/kanban" : "/kanban?modo=todas"}
            variant="secundario"
          >
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
          internalDueDate: d.internalDueDate,
          clienteNome: d.client?.name ?? "Interno",
          responsavelNome: d.assignee?.name ?? "Sem responsável",
          comentarios: d._count.comments,
        }))}
      />
    </>
  );
}
