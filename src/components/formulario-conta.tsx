import { excluirConta, salvarConta } from "@/app/actions/financeiro";
import { dateInput } from "@/lib/format";
import { Button, Card, Field, Input, LinkButton, Select } from "./ui";

type ContaEditavel = {
  id: string;
  description: string;
  supplier: string | null;
  category: string | null;
  amount: number;
  dueDate: Date;
  status: string;
};

/** Formulario de conta a pagar (criar e editar). */
export function FormularioConta({ conta }: { conta?: ContaEditavel }) {
  return (
    <div className="space-y-4">
      <Card>
        <form action={salvarConta} className="space-y-4">
          {conta && <input type="hidden" name="id" value={conta.id} />}

          <Field label="O que é essa conta?">
            <Input
              name="description"
              defaultValue={conta?.description}
              placeholder="Ex.: Aluguel do estúdio"
              required
            />
          </Field>

          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Para quem se paga">
              <Input
                name="supplier"
                defaultValue={conta?.supplier ?? ""}
                placeholder="Fornecedor, pessoa ou empresa"
              />
            </Field>

            <Field label="Tipo de gasto">
              <Input
                name="category"
                defaultValue={conta?.category ?? ""}
                placeholder="Ex.: Software, Equipe, Impostos"
              />
            </Field>

            <Field label="Valor (R$)">
              <Input
                name="amount"
                type="number"
                step="0.01"
                min={0}
                defaultValue={conta?.amount ?? ""}
                placeholder="0,00"
                required
              />
            </Field>

            <Field label="Vence em">
              <Input
                name="dueDate"
                type="date"
                defaultValue={dateInput(conta?.dueDate ?? new Date())}
                required
              />
            </Field>

            <Field label="Situação">
              <Select
                name="status"
                defaultValue={conta?.status ?? "PENDENTE"}
                options={[
                  { value: "PENDENTE", label: "Ainda não paguei" },
                  { value: "PAGO", label: "Já está paga" },
                ]}
              />
            </Field>
          </div>

          <div className="flex gap-2 pt-2">
            <Button type="submit">
              {conta ? "Salvar alterações" : "Lançar conta"}
            </Button>
            <LinkButton href="/financeiro/pagar" variant="secundario">
              Cancelar
            </LinkButton>
          </div>
        </form>
      </Card>

      {conta && (
        <Card>
          <p className="mb-3 text-sm text-slate-500">
            Excluir apaga esta conta do financeiro. Isso não pode ser desfeito.
          </p>
          <form action={excluirConta}>
            <input type="hidden" name="id" value={conta.id} />
            <Button type="submit" variant="perigo">
              Excluir conta
            </Button>
          </form>
        </Card>
      )}
    </div>
  );
}
