import { excluirCliente, salvarCliente } from "@/app/actions/clientes";
import { CLIENT_STATUS } from "@/lib/constants";
import { dateInput } from "@/lib/format";
import { Button, Card, Field, Input, LinkButton, Select, Textarea } from "./ui";

type ClienteEditavel = {
  id: string;
  name: string;
  company: string | null;
  contactName: string | null;
  email: string | null;
  phone: string | null;
  startDate: Date;
  status: string;
  notes: string | null;
};

export function FormularioCliente({ cliente }: { cliente?: ClienteEditavel }) {
  return (
    <div className="space-y-4">
      <Card>
        <form action={salvarCliente} className="space-y-4">
          {cliente && <input type="hidden" name="id" value={cliente.id} />}

          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Nome do cliente">
              <Input
                name="name"
                defaultValue={cliente?.name}
                placeholder="Como vocês chamam o cliente"
                required
              />
            </Field>

            <Field label="Empresa" hint="Razão social, se houver.">
              <Input name="company" defaultValue={cliente?.company ?? ""} />
            </Field>

            <Field label="Pessoa de contato">
              <Input
                name="contactName"
                defaultValue={cliente?.contactName ?? ""}
                placeholder="Com quem vocês falam"
              />
            </Field>

            <Field label="Telefone / WhatsApp">
              <Input name="phone" defaultValue={cliente?.phone ?? ""} />
            </Field>

            <Field label="E-mail">
              <Input
                name="email"
                type="email"
                defaultValue={cliente?.email ?? ""}
              />
            </Field>

            <Field label="Cliente desde" hint="Usado para calcular o tempo de casa.">
              <Input
                name="startDate"
                type="date"
                defaultValue={dateInput(cliente?.startDate ?? new Date())}
                required
              />
            </Field>

            <Field label="Situação">
              <Select
                name="status"
                defaultValue={cliente?.status ?? "ATIVO"}
                options={Object.entries(CLIENT_STATUS).map(([value, label]) => ({
                  value,
                  label,
                }))}
              />
            </Field>
          </div>

          <Field label="Observações" hint="O que a equipe precisa lembrar sobre esse cliente.">
            <Textarea name="notes" rows={3} defaultValue={cliente?.notes ?? ""} />
          </Field>

          <div className="flex gap-2 pt-2">
            <Button type="submit">
              {cliente ? "Salvar alterações" : "Cadastrar cliente"}
            </Button>
            <LinkButton href="/clientes" variant="secundario">
              Cancelar
            </LinkButton>
          </div>
        </form>
      </Card>

      {cliente && (
        <Card>
          <p className="mb-3 text-sm text-slate-500">
            Excluir apaga o cliente e os contratos dele. As demandas ficam, mas
            sem cliente. Isso não pode ser desfeito.
          </p>
          <form action={excluirCliente}>
            <input type="hidden" name="id" value={cliente.id} />
            <Button type="submit" variant="perigo">
              Excluir cliente
            </Button>
          </form>
        </Card>
      )}
    </div>
  );
}
