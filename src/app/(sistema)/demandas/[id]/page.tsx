import { notFound } from "next/navigation";
import { requireModule } from "@/lib/auth";
import { db } from "@/lib/db";
import { filtroDeVisibilidade } from "@/lib/demandas";
import { FormularioDemanda } from "@/components/formulario-demanda";
import { ConversaDemanda } from "@/components/conversa-demanda";
import { PageHeader } from "@/components/ui";

export const metadata = { title: "Editar demanda — Move" };

export default async function EditarDemandaPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const user = await requireModule("DEMANDAS");
  const { id } = await params;

  const [demanda, clientes, pessoas] = await Promise.all([
    // O filtro garante que ninguem abre uma demanda que nao pode ver.
    db.demand.findFirst({
      where: { id, ...filtroDeVisibilidade(user) },
      include: {
        comments: {
          include: { author: { select: { name: true } } },
          orderBy: { createdAt: "asc" },
        },
        attachments: { orderBy: { createdAt: "asc" } },
      },
    }),
    db.client.findMany({ orderBy: { name: "asc" } }),
    db.user.findMany({ where: { active: true }, orderBy: { name: "asc" } }),
  ]);

  if (!demanda) notFound();

  return (
    <>
      <PageHeader title={demanda.title} subtitle="Editar demanda" />

      <div className="grid gap-4 lg:grid-cols-2 lg:items-start">
        <FormularioDemanda
          demanda={demanda}
          clientes={clientes}
          pessoas={pessoas}
        />
        <ConversaDemanda
          demandId={demanda.id}
          comentarios={demanda.comments}
          links={demanda.attachments}
          usuarioId={user.id}
          admin={user.role === "ADMIN"}
        />
      </div>
    </>
  );
}
