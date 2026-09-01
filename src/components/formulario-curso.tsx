import { excluirCurso, salvarCurso } from "@/app/actions/cursos";
import { AREAS, CAPAS, NIVEIS, TRILHAS, type TrilhaSlug } from "@/lib/constants";
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

type CursoEditavel = {
  id: string;
  slug: string;
  title: string;
  subtitle: string | null;
  description: string | null;
  level: string;
  area: string | null;
  cover: string;
  featured: boolean;
  published: boolean;
  order: number;
  trilhas: string[];
};

export function FormularioCurso({ curso }: { curso?: CursoEditavel }) {
  const trilhasMarcadas = new Set(curso?.trilhas ?? ["posicionamento"]);

  return (
    <div className="space-y-4">
      <Card>
        <form action={salvarCurso} className="space-y-6">
          {curso && <input type="hidden" name="id" value={curso.id} />}

          <FormSection title="O curso">
            <div className="space-y-4">
              <Field label="Nome do curso">
                <Input
                  name="title"
                  defaultValue={curso?.title}
                  placeholder="Ex.: Posicionamento na prática"
                  required
                />
              </Field>

              <Field
                label="Chamada"
                hint="Uma linha que aparece embaixo do nome, na vitrine."
              >
                <Input
                  name="subtitle"
                  defaultValue={curso?.subtitle ?? ""}
                  placeholder="Ex.: Por que o mercado escolhe quem escolhe primeiro."
                />
              </Field>

              <Field label="Descrição" hint="O que a pessoa sai sabendo fazer.">
                <Textarea
                  name="description"
                  rows={3}
                  defaultValue={curso?.description ?? ""}
                />
              </Field>
            </div>
          </FormSection>

          <FormSection
            title="Trilhas"
            subtitle="Em quais caminhos este curso aparece. Pode marcar mais de um."
          >
            <div className="grid gap-2 sm:grid-cols-2">
              {(Object.keys(TRILHAS) as TrilhaSlug[]).map((slug) => (
                <label
                  key={slug}
                  className="flex cursor-pointer items-start gap-2.5 rounded-lg border border-slate-200 px-3 py-2.5 hover:border-slate-300"
                >
                  <input
                    type="checkbox"
                    name="trilhas"
                    value={slug}
                    defaultChecked={trilhasMarcadas.has(slug)}
                    className="mt-0.5 h-4 w-4 accent-[#f26522]"
                  />
                  <span>
                    <span className="block text-sm font-medium text-slate-800">
                      {TRILHAS[slug].name}
                    </span>
                    <span className="block text-xs text-slate-500">
                      {TRILHAS[slug].tagline}
                    </span>
                  </span>
                </label>
              ))}
            </div>
          </FormSection>

          <FormSection title="Como ele aparece">
            <div className="grid gap-4 sm:grid-cols-2">
              <Field
                label="Nível do curso"
                hint="Usado na fileira “No seu nível”."
              >
                <Select
                  name="level"
                  defaultValue={curso?.level ?? "INICIANTE"}
                  options={Object.entries(NIVEIS).map(([value, label]) => ({
                    value,
                    label,
                  }))}
                />
              </Field>

              <Field label="Área da agência" hint="Opcional.">
                <Select
                  name="area"
                  defaultValue={curso?.area ?? ""}
                  placeholder="Nenhuma em especial"
                  options={Object.entries(AREAS).map(([value, label]) => ({
                    value,
                    label,
                  }))}
                />
              </Field>

              <Field label="Cor da capa">
                <Select
                  name="cover"
                  defaultValue={curso?.cover ?? "laranja"}
                  options={Object.keys(CAPAS).map((value) => ({
                    value,
                    label: value[0].toUpperCase() + value.slice(1),
                  }))}
                />
              </Field>

              <Field
                label="Ordem na vitrine"
                hint="Menor número aparece primeiro."
              >
                <Input
                  name="order"
                  type="number"
                  defaultValue={curso?.order ?? 0}
                />
              </Field>

              <Field
                label="Endereço do curso"
                hint="Opcional. Vazio: gerado a partir do nome."
              >
                <Input
                  name="slug"
                  defaultValue={curso?.slug ?? ""}
                  placeholder="posicionamento-na-pratica"
                />
              </Field>
            </div>

            <div className="mt-4 space-y-2">
              <label className="flex cursor-pointer items-center gap-2.5 text-sm text-slate-700">
                <input
                  type="checkbox"
                  name="published"
                  defaultChecked={curso?.published ?? true}
                  className="h-4 w-4 accent-[#f26522]"
                />
                Publicado — a equipe vê na vitrine
              </label>
              <label className="flex cursor-pointer items-center gap-2.5 text-sm text-slate-700">
                <input
                  type="checkbox"
                  name="featured"
                  defaultChecked={curso?.featured ?? false}
                  className="h-4 w-4 accent-[#f26522]"
                />
                Destaque grande do topo (só um curso por vez)
              </label>
            </div>
          </FormSection>

          <div className="flex gap-2 pt-2">
            <Button type="submit">
              {curso ? "Salvar alterações" : "Criar curso"}
            </Button>
            <LinkButton href="/cursos/gerenciar" variant="secundario">
              Cancelar
            </LinkButton>
          </div>
        </form>
      </Card>

      {curso && (
        <Card>
          <p className="mb-3 text-sm text-slate-500">
            Excluir apaga o curso, os módulos, as aulas e o progresso de quem
            assistiu. Isso não pode ser desfeito.
          </p>
          <form action={excluirCurso}>
            <input type="hidden" name="id" value={curso.id} />
            <Button type="submit" variant="perigo">
              Excluir curso
            </Button>
          </form>
        </Card>
      )}
    </div>
  );
}
