import { excluirCobranca, salvarCobranca } from "@/app/actions/financeiro";
import { dateInput } from "@/lib/format";
import { Button, Card, Field, Input, LinkButton, Select } from "./ui";

type CobrancaEditavel = {
  id: string;
  description: string;
  clientId: string | null;
  amount: number;
  dueDate: Date;
  status: string;
};

/** Formulario de conta a receber (criar e editar). */
export function FormularioCobranca({
  cobranca,
  clientes,
}: {
  cobranca?: CobrancaEditavel;
  clientes: { id: string; name: string }[];
}) {
  return (
    <div className="space-y-4">
      <Card>
        <form action={salvarCobranca} className="space-y-4">
          {cobranca && <input type="hidden" name="id" value={cobranca.id} />}

          <Field label="Do que se trata a cobrança?">
            <Input
              name="description"
              defaultValue={cobranca?.description}
              placeholder="Ex.: Mensalidade de agosto"
              required
            />
          </Field>

          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Cliente">
              <Select
                name="clientId"
                defaultValue={cobranca?.clientId ?? ""}
                placeholder="Sem cliente"
                options={clientes.map((c) => ({ value: c.id, label: c.name }))}
              />
            </Field>

            <Field label="Valor (R$)">
              <Input
                name="amount"
                type="number"
                step="0.01"
                min={0}
                defaultValue={cobranca?.amount ?? ""}
                placeholder="0,00"
                required
              />
            </Field>

            <Field label="Vence em">
              <Input
                name="dueDate"
                type="date"
                defaultValue={dateInput(cobranca?.dueDate ?? new Date())}
                required
              />
            </Field>

            <Field label="Situação">
              <Select
                name="status"
                defaultValue={cobranca?.status ?? "PENDENTE"}
                options={[
                  { value: "PENDENTE", label: "Ainda não recebi" },
                  { value: "RECEBIDO", label: "Já recebi" },
                ]}
              />
            </Field>
          </div>

          <div className="flex gap-2 pt-2">
            <Button type="submit">
              {cobranca ? "Salvar alterações" : "Lançar cobrança"}
            </Button>
            <LinkButton href="/financeiro/receber" variant="secundario">
              Cancelar
            </LinkButton>
          </div>
        </form>
      </Card>

      {cobranca && (
        <Card>
          <p className="mb-3 text-sm text-slate-500">
            Excluir apaga esta cobrança do financeiro. Isso não pode ser
            desfeito.
          </p>
          <form action={excluirCobranca}>
            <input type="hidden" name="id" value={cobranca.id} />
            <Button type="submit" variant="perigo">
              Excluir cobrança
            </Button>
          </form>
        </Card>
      )}
    </div>
  );
}
