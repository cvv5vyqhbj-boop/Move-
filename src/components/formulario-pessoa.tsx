import { excluirPessoa, salvarPessoa } from "@/app/actions/equipe";
import { ROLES } from "@/lib/constants";
import { ROLE_MODULES, MODULES } from "@/lib/permissions";
import {
  Button,
  Card,
  Field,
  FormSection,
  Input,
  LinkButton,
  Select,
} from "./ui";

type PessoaEditavel = {
  id: string;
  name: string;
  email: string;
  role: string;
  active: boolean;
};

export function FormularioPessoa({
  pessoa,
  ehVoce,
}: {
  pessoa?: PessoaEditavel;
  ehVoce?: boolean;
}) {
  return (
    <div className="space-y-4">
      <Card>
        <form action={salvarPessoa} className="space-y-8">
          {pessoa && <input type="hidden" name="id" value={pessoa.id} />}

          <FormSection
            title="Quem é"
            subtitle="Nome e e-mail que a pessoa usa para entrar."
          >
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Nome">
                <Input name="name" defaultValue={pessoa?.name} required />
              </Field>

              <Field
                label="E-mail"
                hint="É com ele que a pessoa entra no sistema."
              >
                <Input
                  name="email"
                  type="email"
                  defaultValue={pessoa?.email}
                  placeholder="nome@move.com"
                  required
                />
              </Field>
            </div>
          </FormSection>

          <FormSection
            title="Acesso"
            subtitle="Cargo (define o que ela pode ver) e se pode entrar."
          >
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Cargo">
                <Select
                  name="role"
                  defaultValue={pessoa?.role ?? "EDICAO"}
                  options={Object.entries(ROLES).map(([value, label]) => ({
                    value,
                    label,
                  }))}
                />
              </Field>

              <Field label="Situação">
                <Select
                  name="active"
                  defaultValue={pessoa?.active === false ? "0" : "1"}
                  options={[
                    { value: "1", label: "Pode entrar no sistema" },
                    { value: "0", label: "Acesso bloqueado" },
                  ]}
                />
              </Field>
            </div>
          </FormSection>

          <FormSection title="Senha">
            <Field
              label={pessoa ? "Nova senha" : "Senha inicial"}
              hint={
                pessoa
                  ? "Deixe vazio para manter a senha atual."
                  : "Se deixar vazio, a senha será move123."
              }
            >
              <Input name="senha" type="password" placeholder="••••••" />
            </Field>
          </FormSection>

          <div className="flex flex-wrap gap-2 border-t border-slate-100 pt-5">
            <Button type="submit">
              {pessoa ? "Salvar alterações" : "Adicionar à equipe"}
            </Button>
            <LinkButton href="/equipe" variant="secundario">
              Cancelar
            </LinkButton>
          </div>
        </form>
      </Card>

      <Card>
        <h2 className="mb-3 font-semibold text-slate-900">
          O que cada cargo enxerga
        </h2>
        <ul className="space-y-2 text-sm">
          {Object.entries(ROLES).map(([cargo, nome]) => (
            <li key={cargo} className="flex flex-wrap gap-2">
              <span className="w-40 shrink-0 font-medium text-slate-700">
                {nome}
              </span>
              <span className="text-slate-500">
                {ROLE_MODULES[cargo as keyof typeof ROLES]
                  .map((m) => MODULES[m].label)
                  .join(", ")}
              </span>
            </li>
          ))}
        </ul>
      </Card>

      {pessoa && !ehVoce && (
        <Card>
          <p className="mb-3 text-sm text-slate-500">
            Excluir remove a pessoa do sistema. As demandas dela ficam, mas sem
            responsável. Isso não pode ser desfeito.
          </p>
          <form action={excluirPessoa}>
            <input type="hidden" name="id" value={pessoa.id} />
            <Button type="submit" variant="perigo">
              Excluir pessoa
            </Button>
          </form>
        </Card>
      )}
    </div>
  );
}
