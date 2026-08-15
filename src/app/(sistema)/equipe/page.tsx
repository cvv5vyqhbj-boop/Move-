import Link from "next/link";
import { requireModule } from "@/lib/auth";
import { db } from "@/lib/db";
import { ROLES, type Role } from "@/lib/constants";
import { MODULES, ROLE_MODULES } from "@/lib/permissions";
import {
  Badge,
  Card,
  EmptyRow,
  LinkButton,
  PageHeader,
  TCell,
  THead,
  TRow,
  Table,
} from "@/components/ui";

export const metadata = { title: "Equipe — Move" };

export default async function EquipePage() {
  const user = await requireModule("EQUIPE");

  const pessoas = await db.user.findMany({
    include: { _count: { select: { demands: true } } },
    orderBy: [{ role: "asc" }, { name: "asc" }],
  });

  return (
    <>
      <PageHeader
        title="Equipe"
        subtitle="Quem tem acesso ao sistema e o que cada um pode ver."
        action={<LinkButton href="/equipe/nova">+ Adicionar pessoa</LinkButton>}
      />

      <div className="mb-6">
        <Table>
          <THead
            columns={["Pessoa", "E-mail", "Cargo", "Demandas", "Acesso"]}
          />
          <tbody>
            {pessoas.length === 0 && (
              <EmptyRow colSpan={5}>Nenhuma pessoa cadastrada.</EmptyRow>
            )}
            {pessoas.map((p) => (
              <TRow key={p.id}>
                <TCell>
                  <Link
                    href={`/equipe/${p.id}`}
                    className="font-medium text-slate-900 hover:text-marca-600"
                  >
                    {p.name}
                  </Link>
                  {p.id === user.id && (
                    <span className="ml-2 text-xs text-slate-400">(você)</span>
                  )}
                </TCell>
                <TCell className="text-slate-600">{p.email}</TCell>
                <TCell>
                  <Badge tone={p.role === "ADMIN" ? "laranja" : "cinza"}>
                    {ROLES[p.role as Role] ?? p.role}
                  </Badge>
                </TCell>
                <TCell className="text-slate-600">{p._count.demands}</TCell>
                <TCell>
                  <Badge tone={p.active ? "verde" : "vermelho"}>
                    {p.active ? "Liberado" : "Bloqueado"}
                  </Badge>
                </TCell>
              </TRow>
            ))}
          </tbody>
        </Table>
      </div>

      <Card>
        <h2 className="mb-1 font-semibold text-slate-900">
          O que cada cargo enxerga
        </h2>
        <p className="mb-4 text-sm text-slate-500">
          Só o administrador vê financeiro, contratos, clientes, relatórios e
          esta tela de equipe.
        </p>
        <ul className="space-y-2 text-sm">
          {Object.entries(ROLES).map(([cargo, nome]) => (
            <li key={cargo} className="flex flex-wrap gap-2">
              <span className="w-40 shrink-0 font-medium text-slate-700">
                {nome}
              </span>
              <span className="text-slate-500">
                {ROLE_MODULES[cargo as Role]
                  .map((m) => MODULES[m].label)
                  .join(", ")}
              </span>
            </li>
          ))}
        </ul>
      </Card>
    </>
  );
}
