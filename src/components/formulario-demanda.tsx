import { salvarDemanda, excluirDemanda } from "@/app/actions/demandas";
import { AREAS, PRIORITIES, STATUS } from "@/lib/constants";
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

type Demanda = {
  id: string;
  title: string;
  description: string | null;
  clientId: string | null;
  area: string;
  assigneeId: string | null;
  status: string;
  priority: string;
  internalDueDate: Date | null;
  dueDate: Date | null;
  participants: { id: string }[];
};

/** Mesmo formulario para criar e para editar uma demanda. */
export function FormularioDemanda({
  demanda,
  clientes,
  pessoas,
}: {
  demanda?: Demanda;
  clientes: { id: string; name: string }[];
  pessoas: { id: string; name: string }[];
}) {
  const opcoes = (obj: Record<string, string>) =>
    Object.entries(obj).map(([value, label]) => ({ value, label }));
  const participantes = new Set(demanda?.participants.map((p) => p.id));

  return (
    <div className="space-y-4">
      <Card>
        <form action={salvarDemanda} className="space-y-8">
          {demanda && <input type="hidden" name="id" value={demanda.id} />}

          <FormSection
            title="O que precisa ser feito"
            subtitle="Título curto e detalhes para quem for executar."
          >
            <div className="space-y-4">
              <Field label="Título">
                <Input
                  name="title"
                  defaultValue={demanda?.title}
                  placeholder="Ex.: Editar 4 Reels da semana"
                  required
                />
              </Field>

              <Field
                label="Detalhes"
                hint="Opcional. Combinados, links, referências."
              >
                <Textarea
                  name="description"
                  rows={4}
                  defaultValue={demanda?.description ?? ""}
                  placeholder="Escreva aqui o que a pessoa precisa saber para fazer."
                />
              </Field>
            </div>
          </FormSection>

          <FormSection
            title="Para quem e quem faz"
            subtitle="Cliente, área, responsável e quem mais está no chamado. Quem entra recebe um e-mail avisando."
          >
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Cliente">
                <Select
                  name="clientId"
                  defaultValue={demanda?.clientId ?? ""}
                  placeholder="Sem cliente (interno)"
                  options={clientes.map((c) => ({ value: c.id, label: c.name }))}
                />
              </Field>

              <Field label="Área">
                <Select
                  name="area"
                  defaultValue={demanda?.area ?? "EDICAO"}
                  options={opcoes(AREAS)}
                />
              </Field>

              <Field label="Quem vai fazer">
                <Select
                  name="assigneeId"
                  defaultValue={demanda?.assigneeId ?? ""}
                  placeholder="Ainda não definido"
                  options={pessoas.map((p) => ({ value: p.id, label: p.name }))}
                />
              </Field>

              {/* Nao usa <Field> porque ele e um <label>, e aqui ja tem um por pessoa. */}
              <div className="sm:col-span-2">
                <span className="mb-1.5 block text-sm font-medium text-slate-700">
                  Também no chamado
                </span>
                <div className="grid gap-1.5 rounded-lg border border-slate-200 p-3 sm:grid-cols-2">
                  {pessoas.map((p) => (
                    <label
                      key={p.id}
                      className="flex cursor-pointer items-center gap-2 text-sm text-slate-700"
                    >
                      <input
                        type="checkbox"
                        name="participantIds"
                        value={p.id}
                        defaultChecked={participantes.has(p.id)}
                        className="h-4 w-4 accent-marca-600"
                      />
                      {p.name}
                    </label>
                  ))}
                </div>
                <span className="mt-1.5 block text-xs leading-relaxed text-slate-500">
                  Marque quem mais participa desta demanda.
                </span>
              </div>
            </div>
          </FormSection>

          <FormSection
            title="Prazos"
            subtitle="O prazo interno serve para a equipe se organizar antes do prazo combinado com o cliente."
          >
            <div className="grid gap-4 sm:grid-cols-2">
              <Field
                label="Prazo interno da equipe"
                hint="Data-alvo para ficar pronto internamente."
              >
                <Input
                  name="internalDueDate"
                  type="date"
                  defaultValue={dateInput(demanda?.internalDueDate)}
                />
              </Field>

              <Field
                label="Prazo com o cliente"
                hint="Data que foi combinada com o cliente para receber."
              >
                <Input
                  name="dueDate"
                  type="date"
                  defaultValue={dateInput(demanda?.dueDate)}
                />
              </Field>
            </div>
          </FormSection>

          <FormSection
            title="Situação"
            subtitle="Como está agora e a prioridade dela."
          >
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Situação">
                <Select
                  name="status"
                  defaultValue={demanda?.status ?? "A_FAZER"}
                  options={opcoes(STATUS)}
                />
              </Field>

              <Field label="Prioridade">
                <Select
                  name="priority"
                  defaultValue={demanda?.priority ?? "MEDIA"}
                  options={opcoes(PRIORITIES)}
                />
              </Field>
            </div>
          </FormSection>

          <div className="flex flex-wrap gap-2 border-t border-slate-100 pt-5">
            <Button type="submit">
              {demanda ? "Salvar alterações" : "Criar demanda"}
            </Button>
            <LinkButton href="/demandas" variant="secundario">
              Cancelar
            </LinkButton>
          </div>
        </form>
      </Card>

      {demanda && (
        <Card>
          <p className="mb-3 text-sm text-slate-500">
            Excluir apaga a demanda para todo mundo. Isso não pode ser desfeito.
          </p>
          <form action={excluirDemanda}>
            <input type="hidden" name="id" value={demanda.id} />
            <Button type="submit" variant="perigo">
              Excluir demanda
            </Button>
          </form>
        </Card>
      )}
    </div>
  );
}
