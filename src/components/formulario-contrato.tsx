import { excluirContrato, salvarContrato } from "@/app/actions/clientes";
import { CONTRACT_STATUS } from "@/lib/constants";
import { dateInput } from "@/lib/format";
import {
  Button,
  Card,
  Field,
  FormSection,
  Input,
  LinkButton,
  Select,
  Textarea,
} from "./ui";

type ContratoEditavel = {
  id: string;
  clientId: string;
  title: string;
  monthlyValue: number;
  startDate: Date;
  endDate: Date | null;
  status: string;
  pdfUrl: string | null;
  notes: string | null;
};

export function FormularioContrato({
  contrato,
  clientes,
}: {
  contrato?: ContratoEditavel;
  clientes: { id: string; name: string }[];
}) {
  return (
    <div className="space-y-4">
      <Card>
        <form action={salvarContrato} className="space-y-8">
          {contrato && <input type="hidden" name="id" value={contrato.id} />}

          <FormSection
            title="Do que se trata"
            subtitle="Cliente, escopo e valor combinados."
          >
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Cliente">
                <Select
                  name="clientId"
                  defaultValue={contrato?.clientId ?? ""}
                  placeholder="Escolha o cliente"
                  options={clientes.map((c) => ({ value: c.id, label: c.name }))}
                  required
                />
              </Field>

              <Field label="O que está contratado">
                <Input
                  name="title"
                  defaultValue={contrato?.title}
                  placeholder="Ex.: Social media + edição de vídeo"
                  required
                />
              </Field>

              <Field label="Valor por mês (R$)">
                <Input
                  name="monthlyValue"
                  type="number"
                  step="0.01"
                  min={0}
                  defaultValue={contrato?.monthlyValue ?? ""}
                  placeholder="0,00"
                  inputMode="decimal"
                  required
                />
              </Field>

              <Field label="Situação">
                <Select
                  name="status"
                  defaultValue={contrato?.status ?? "ATIVO"}
                  options={Object.entries(CONTRACT_STATUS).map(
                    ([value, label]) => ({ value, label }),
                  )}
                />
              </Field>
            </div>
          </FormSection>

          <FormSection
            title="Prazo"
            subtitle="Quando começa e quando termina."
          >
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Início do contrato">
                <Input
                  name="startDate"
                  type="date"
                  defaultValue={dateInput(contrato?.startDate ?? new Date())}
                  required
                />
              </Field>

              <Field
                label="Fim do contrato"
                hint="Deixe vazio se não tem prazo para acabar."
              >
                <Input
                  name="endDate"
                  type="date"
                  defaultValue={dateInput(contrato?.endDate)}
                />
              </Field>
            </div>
          </FormSection>

          <FormSection
            title="Contrato assinado"
            subtitle="Cole o link do PDF (Google Drive, Docs, Dropbox…). Suba o arquivo no Drive e cole aqui o link de visualização."
          >
            <Field label="Link do contrato (PDF)">
              <Input
                name="pdfUrl"
                type="url"
                inputMode="url"
                defaultValue={contrato?.pdfUrl ?? ""}
                placeholder="https://drive.google.com/…"
              />
            </Field>
          </FormSection>

          <FormSection title="Observações">
            <Field label="Notas">
              <Textarea
                name="notes"
                rows={4}
                defaultValue={contrato?.notes ?? ""}
                placeholder="Combinados, reajustes, condições de pagamento."
              />
            </Field>
          </FormSection>

          <div className="flex flex-wrap gap-2 border-t border-slate-100 pt-5">
            <Button type="submit">
              {contrato ? "Salvar alterações" : "Criar contrato"}
            </Button>
            <LinkButton href="/contratos" variant="secundario">
              Cancelar
            </LinkButton>
          </div>
        </form>
      </Card>

      {contrato && (
        <Card>
          <p className="mb-3 text-sm text-slate-500">
            Excluir apaga o contrato. As cobranças já lançadas continuam no
            financeiro. Isso não pode ser desfeito.
          </p>
          <form action={excluirContrato}>
            <input type="hidden" name="id" value={contrato.id} />
            <Button type="submit" variant="perigo">
              Excluir contrato
            </Button>
          </form>
        </Card>
      )}
    </div>
  );
}
