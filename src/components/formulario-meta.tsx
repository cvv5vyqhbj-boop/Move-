import { excluirMeta, salvarMeta } from "@/app/actions/metas";
import { AREAS, GOAL_SCOPE, MONTHS } from "@/lib/constants";
import { Button, Card, Field, Input, LinkButton, Select, Textarea } from "./ui";

type MetaEditavel = {
  id: string;
  title: string;
  description: string | null;
  scope: string;
  ownerId: string | null;
  area: string | null;
  month: number;
  year: number;
  targetValue: number;
  currentValue: number;
  unit: string;
};

export function FormularioMeta({
  meta,
  pessoas,
}: {
  meta?: MetaEditavel;
  pessoas: { id: string; name: string }[];
}) {
  const hoje = new Date();

  return (
    <div className="space-y-4">
      <Card>
        <form action={salvarMeta} className="space-y-4">
          {meta && <input type="hidden" name="id" value={meta.id} />}

          <Field label="Qual é a meta?">
            <Input
              name="title"
              defaultValue={meta?.title}
              placeholder="Ex.: Entregar 40 vídeos editados"
              required
            />
          </Field>

          <Field label="Detalhes" hint="Opcional. Como essa meta é medida.">
            <Textarea
              name="description"
              rows={2}
              defaultValue={meta?.description ?? ""}
            />
          </Field>

          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="De quem é a meta">
              <Select
                name="scope"
                defaultValue={meta?.scope ?? "PESSOAL"}
                options={Object.entries(GOAL_SCOPE).map(([value, label]) => ({
                  value,
                  label,
                }))}
              />
            </Field>

            <Field label="Pessoa responsável" hint="Só para metas pessoais.">
              <Select
                name="ownerId"
                defaultValue={meta?.ownerId ?? ""}
                placeholder="Ninguém específico"
                options={pessoas.map((p) => ({ value: p.id, label: p.name }))}
              />
            </Field>

            <Field label="Área">
              <Select
                name="area"
                defaultValue={meta?.area ?? ""}
                placeholder="Todas as áreas"
                options={Object.entries(AREAS).map(([value, label]) => ({
                  value,
                  label,
                }))}
              />
            </Field>

            <Field label="Como medir">
              <Select
                name="unit"
                defaultValue={meta?.unit ?? "un"}
                options={[
                  { value: "un", label: "Quantidade" },
                  { value: "R$", label: "Dinheiro (R$)" },
                  { value: "%", label: "Porcentagem (%)" },
                ]}
              />
            </Field>

            <Field label="Objetivo (número a alcançar)">
              <Input
                name="targetValue"
                type="number"
                step="any"
                min={0}
                defaultValue={meta?.targetValue ?? 10}
                required
              />
            </Field>

            <Field label="Quanto já foi feito">
              <Input
                name="currentValue"
                type="number"
                step="any"
                min={0}
                defaultValue={meta?.currentValue ?? 0}
              />
            </Field>

            <Field label="Mês">
              <Select
                name="month"
                defaultValue={String(meta?.month ?? hoje.getMonth() + 1)}
                options={MONTHS.map((label, i) => ({
                  value: String(i + 1),
                  label,
                }))}
              />
            </Field>

            <Field label="Ano">
              <Input
                name="year"
                type="number"
                defaultValue={meta?.year ?? hoje.getFullYear()}
              />
            </Field>
          </div>

          <div className="flex gap-2 pt-2">
            <Button type="submit">
              {meta ? "Salvar alterações" : "Criar meta"}
            </Button>
            <LinkButton href="/metas" variant="secundario">
              Cancelar
            </LinkButton>
          </div>
        </form>
      </Card>

      {meta && (
        <Card>
          <p className="mb-3 text-sm text-slate-500">
            Excluir apaga a meta do sistema. Isso não pode ser desfeito.
          </p>
          <form action={excluirMeta}>
            <input type="hidden" name="id" value={meta.id} />
            <Button type="submit" variant="perigo">
              Excluir meta
            </Button>
          </form>
        </Card>
      )}
    </div>
  );
}
