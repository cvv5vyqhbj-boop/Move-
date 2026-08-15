import { requireModule } from "@/lib/auth";
import { db } from "@/lib/db";
import { monthLabel } from "@/lib/format";
import { CartaoMeta } from "@/components/cartao-meta";
import { EmptyState, LinkButton, PageHeader } from "@/components/ui";

export const metadata = { title: "Metas do mês — Move" };

export default async function MetasPage() {
  const user = await requireModule("METAS");

  const hoje = new Date();
  const mes = hoje.getMonth() + 1;
  const ano = hoje.getFullYear();
  const admin = user.role === "ADMIN";

  const metas = await db.goal.findMany({
    where: {
      month: mes,
      year: ano,
      // Cada pessoa ve as metas dela mais as da equipe e da agencia.
      ...(admin ? {} : { OR: [{ ownerId: user.id }, { scope: { in: ["EQUIPE", "AGENCIA"] } }] }),
    },
    include: { owner: { select: { name: true } } },
    orderBy: [{ scope: "asc" }, { title: "asc" }],
  });

  const daAgencia = metas.filter((m) => m.scope !== "PESSOAL");
  const pessoais = metas.filter((m) => m.scope === "PESSOAL");

  return (
    <>
      <PageHeader
        title="Metas do mês"
        subtitle={`Objetivos de ${monthLabel(mes, ano)}.`}
        action={admin ? <LinkButton href="/metas/nova">+ Nova meta</LinkButton> : undefined}
      />

      {metas.length === 0 && (
        <EmptyState>
          Nenhuma meta definida para este mês
          {admin ? ". Clique em “+ Nova meta” para começar." : ". Fale com o administrador."}
        </EmptyState>
      )}

      {daAgencia.length > 0 && (
        <section className="mb-8">
          <h2 className="mb-3 text-sm font-semibold tracking-wide text-slate-500 uppercase">
            Da agência e da equipe
          </h2>
          <div className="grid gap-4 md:grid-cols-2">
            {daAgencia.map((m) => (
              <CartaoMeta
                key={m.id}
                meta={m}
                podeEditar={admin}
                podeGerenciar={admin}
              />
            ))}
          </div>
        </section>
      )}

      {pessoais.length > 0 && (
        <section>
          <h2 className="mb-3 text-sm font-semibold tracking-wide text-slate-500 uppercase">
            {admin ? "Metas por pessoa" : "Suas metas"}
          </h2>
          <div className="grid gap-4 md:grid-cols-2">
            {pessoais.map((m) => (
              <CartaoMeta
                key={m.id}
                meta={m}
                podeEditar={admin || m.ownerId === user.id}
                podeGerenciar={admin}
              />
            ))}
          </div>
        </section>
      )}
    </>
  );
}
