import Link from "next/link";
import { atualizarProgresso } from "@/app/actions/metas";
import { GOAL_SCOPE } from "@/lib/constants";
import { money } from "@/lib/format";
import { Badge, Button, Card, Input, Progress } from "./ui";

export type Meta = {
  id: string;
  title: string;
  description: string | null;
  scope: string;
  unit: string;
  targetValue: number;
  currentValue: number;
  owner: { name: string } | null;
};

/** Mostra o valor no formato certo: R$ 1.000,00, 80% ou 12. */
function valor(n: number, unit: string) {
  if (unit === "R$") return money(n);
  if (unit === "%") return `${Math.round(n)}%`;
  return String(n);
}

export function CartaoMeta({
  meta,
  podeEditar,
  podeGerenciar,
}: {
  meta: Meta;
  podeEditar: boolean;
  podeGerenciar: boolean;
}) {
  const percent = meta.targetValue
    ? (meta.currentValue / meta.targetValue) * 100
    : 0;
  const concluida = percent >= 100;

  return (
    <Card>
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="font-medium text-slate-900">{meta.title}</p>
          <p className="mt-0.5 text-xs text-slate-500">
            {GOAL_SCOPE[meta.scope as keyof typeof GOAL_SCOPE]}
            {meta.owner ? ` · ${meta.owner.name}` : ""}
          </p>
        </div>
        {concluida && <Badge tone="verde">Batida</Badge>}
      </div>

      {meta.description && (
        <p className="mt-2 text-sm text-slate-500">{meta.description}</p>
      )}

      <div className="mt-4">
        <div className="mb-1 flex items-baseline justify-between text-sm">
          <span className="font-semibold text-slate-900">
            {valor(meta.currentValue, meta.unit)}
          </span>
          <span className="text-slate-500">
            de {valor(meta.targetValue, meta.unit)}
          </span>
        </div>
        <Progress percent={percent} />
        <p className="mt-1 text-xs text-slate-400">
          {Math.round(percent)}% do objetivo
        </p>
      </div>

      {podeEditar && (
        <form action={atualizarProgresso} className="mt-4 flex items-end gap-2">
          <input type="hidden" name="id" value={meta.id} />
          <label className="flex-1">
            <span className="mb-1 block text-xs text-slate-500">
              Quanto já foi feito
            </span>
            <Input
              name="currentValue"
              type="number"
              step="any"
              min={0}
              defaultValue={meta.currentValue}
            />
          </label>
          <Button type="submit" variant="secundario">
            Atualizar
          </Button>
        </form>
      )}

      {podeGerenciar && (
        <Link
          href={`/metas/${meta.id}`}
          className="mt-3 inline-block text-xs text-marca-600 hover:underline"
        >
          Editar meta
        </Link>
      )}
    </Card>
  );
}
