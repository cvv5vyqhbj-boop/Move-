import {
  excluirAula,
  excluirModulo,
  salvarAula,
  salvarModulo,
} from "@/app/actions/cursos";
import { NIVEIS } from "@/lib/constants";
import type { ModuloNaTela } from "@/lib/cursos";
import { Badge, Button, Card, Field, Input, Select, Textarea } from "./ui";

/**
 * Montagem do conteudo do curso: modulos e aulas.
 *
 * Cada bloco e um formulario comum que grava sozinho. Isso deixa a tela longa,
 * mas evita o pior cenario numa tela de conteudo: preencher dez campos e
 * perder tudo porque um deles nao passou.
 *
 * O nivel do modulo e o campo que importa mais aqui: e ele que o quiz usa para
 * dizer a cada pessoa por onde entrar.
 */
export function EditorModulos({
  courseId,
  modulos,
}: {
  courseId: string;
  modulos: ModuloNaTela[];
}) {
  const opcoesNivel = Object.entries(NIVEIS).map(([value, label]) => ({
    value,
    label,
  }));

  return (
    <div className="space-y-4">
      {modulos.map((modulo) => (
        <Card key={modulo.id}>
          <form action={salvarModulo} className="space-y-4">
            <input type="hidden" name="id" value={modulo.id} />

            <div className="flex flex-wrap items-center justify-between gap-2">
              <h3 className="text-sm font-semibold tracking-tight text-slate-900">
                Módulo {modulo.order + 1}
              </h3>
              <Badge tone={modulo.level === "INICIANTE" ? "cinza" : "laranja"}>
                {NIVEIS[modulo.level as keyof typeof NIVEIS] ?? modulo.level}
              </Badge>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Título do módulo">
                <Input name="title" defaultValue={modulo.title} required />
              </Field>
              <Field
                label="Nível deste módulo"
                hint="Quem está acima disso entra depois dele."
              >
                <Select
                  name="level"
                  defaultValue={modulo.level}
                  options={opcoesNivel}
                />
              </Field>
              <Field label="Descrição">
                <Input
                  name="description"
                  defaultValue={modulo.description ?? ""}
                />
              </Field>
              <Field label="Ordem">
                <Input name="order" type="number" defaultValue={modulo.order} />
              </Field>
            </div>

            <div className="flex gap-2">
              <Button type="submit" variant="secundario">
                Salvar módulo
              </Button>
            </div>
          </form>

          <div className="mt-5 border-t border-slate-200 pt-4">
            <p className="mb-2 text-xs font-semibold tracking-wide text-slate-500 uppercase">
              Aulas
            </p>

            <div className="space-y-2">
              {modulo.aulas.map((aula, i) => (
                <details
                  key={aula.id}
                  className="rounded-lg border border-slate-200"
                >
                  <summary className="flex cursor-pointer items-center gap-2 px-3 py-2.5 text-sm text-slate-700">
                    <span className="text-slate-400">{i + 1}.</span>
                    <span className="flex-1 truncate">{aula.title}</span>
                    {!aula.videoUrl && <Badge tone="amarelo">sem vídeo</Badge>}
                    <span className="text-xs text-slate-400">
                      {aula.durationMin ? `${aula.durationMin} min` : ""}
                    </span>
                  </summary>

                  <div className="space-y-4 border-t border-slate-200 p-4">
                    <form action={salvarAula} className="space-y-4">
                      <input type="hidden" name="id" value={aula.id} />
                      <CamposDaAula aula={aula} />
                      <Button type="submit" variant="secundario">
                        Salvar aula
                      </Button>
                    </form>

                    <form action={excluirAula}>
                      <input type="hidden" name="id" value={aula.id} />
                      <Button type="submit" variant="perigo">
                        Excluir aula
                      </Button>
                    </form>
                  </div>
                </details>
              ))}

              {modulo.aulas.length === 0 && (
                <p className="py-2 text-sm text-slate-500">
                  Nenhuma aula neste módulo ainda.
                </p>
              )}
            </div>

            <details className="mt-3">
              <summary className="cursor-pointer text-sm font-medium text-marca-600">
                + Adicionar aula neste módulo
              </summary>
              <form
                action={salvarAula}
                className="mt-3 space-y-4 rounded-lg border border-slate-200 p-4"
              >
                <input type="hidden" name="moduleId" value={modulo.id} />
                <CamposDaAula ordemSugerida={modulo.aulas.length} />
                <Button type="submit">Adicionar aula</Button>
              </form>
            </details>
          </div>

          <div className="mt-4 border-t border-slate-200 pt-4">
            <form action={excluirModulo}>
              <input type="hidden" name="id" value={modulo.id} />
              <Button type="submit" variant="perigo">
                Excluir módulo e suas aulas
              </Button>
            </form>
          </div>
        </Card>
      ))}

      <Card>
        <form action={salvarModulo} className="space-y-4">
          <input type="hidden" name="courseId" value={courseId} />
          <h3 className="text-sm font-semibold tracking-tight text-slate-900">
            Novo módulo
          </h3>

          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Título do módulo">
              <Input
                name="title"
                placeholder="Ex.: A base: percepção antes de oferta"
                required
              />
            </Field>
            <Field
              label="Nível deste módulo"
              hint="É por aqui que o quiz decide o ponto de entrada de cada pessoa."
            >
              <Select
                name="level"
                defaultValue="INICIANTE"
                options={opcoesNivel}
              />
            </Field>
            <Field label="Descrição">
              <Input name="description" />
            </Field>
            <Field label="Ordem">
              <Input name="order" type="number" defaultValue={modulos.length} />
            </Field>
          </div>

          <Button type="submit">Adicionar módulo</Button>
        </form>
      </Card>
    </div>
  );
}

function CamposDaAula({
  aula,
  ordemSugerida,
}: {
  aula?: ModuloNaTela["aulas"][number];
  ordemSugerida?: number;
}) {
  return (
    <>
      <Field label="Título da aula">
        <Input name="title" defaultValue={aula?.title} required />
      </Field>

      <Field
        label="Link do vídeo"
        hint="YouTube ou Vimeo. O vídeo toca dentro do sistema."
      >
        <Input
          name="videoUrl"
          defaultValue={aula?.videoUrl ?? ""}
          placeholder="https://www.youtube.com/watch?v=..."
        />
      </Field>

      <Field label="Sobre a aula">
        <Textarea name="description" rows={2} defaultValue={aula?.description ?? ""} />
      </Field>

      <div className="grid gap-4 sm:grid-cols-3">
        <Field label="Duração (min)">
          <Input
            name="durationMin"
            type="number"
            min={0}
            defaultValue={aula?.durationMin ?? 0}
          />
        </Field>
        <Field label="Ordem">
          <Input
            name="order"
            type="number"
            defaultValue={aula?.order ?? ordemSugerida ?? 0}
          />
        </Field>
        <Field label="Material de apoio" hint="Link do PDF ou Drive.">
          <Input name="materialUrl" defaultValue={aula?.materialUrl ?? ""} />
        </Field>
      </div>
    </>
  );
}
