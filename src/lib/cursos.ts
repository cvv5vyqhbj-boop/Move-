import { db } from "./db";
import { NIVEL_ORDEM, TRILHAS, type Nivel, type TrilhaSlug } from "./constants";
import { ordemDoNivel } from "./quiz";

/**
 * As regras dos cursos em um lugar so: o que a vitrine mostra, quanto cada
 * pessoa ja assistiu e - a parte que importa - por onde ela deve comecar.
 */

// --- Video ---------------------------------------------------------------

/**
 * Converte o link que a pessoa colou no endereco que toca dentro da tela.
 * Aceita YouTube (normal, curto e shorts) e Vimeo. Qualquer outra coisa
 * volta null, e a tela oferece abrir o link em outra aba.
 */
export function embedDoVideo(url: string | null | undefined): string | null {
  if (!url) return null;

  let endereco: URL;
  try {
    endereco = new URL(url.trim());
  } catch {
    return null;
  }
  if (endereco.protocol !== "https:" && endereco.protocol !== "http:") return null;

  const host = endereco.hostname.replace(/^www\./, "");

  if (host === "youtu.be") {
    const id = endereco.pathname.slice(1);
    return id ? `https://www.youtube.com/embed/${id}` : null;
  }

  if (host === "youtube.com" || host === "m.youtube.com") {
    const id =
      endereco.searchParams.get("v") ??
      endereco.pathname.match(/^\/(?:embed|shorts|live)\/([^/]+)/)?.[1];
    return id ? `https://www.youtube.com/embed/${id}` : null;
  }

  if (host === "vimeo.com") {
    const id = endereco.pathname.split("/").filter(Boolean)[0];
    return id && /^\d+$/.test(id) ? `https://player.vimeo.com/video/${id}` : null;
  }

  if (host === "player.vimeo.com") return endereco.toString();

  return null;
}

// --- Tipos que as telas usam ---------------------------------------------

export type AulaNaTela = {
  id: string;
  title: string;
  description: string | null;
  videoUrl: string | null;
  materialUrl: string | null;
  durationMin: number;
  order: number;
  concluida: boolean;
};

export type ModuloNaTela = {
  id: string;
  title: string;
  description: string | null;
  level: string;
  order: number;
  aulas: AulaNaTela[];
};

export type CursoNaVitrine = {
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
  trilhas: string[]; // slugs
  totalAulas: number;
  concluidas: number;
  minutos: number;
};

export type CursoCompleto = CursoNaVitrine & { modulos: ModuloNaTela[] };

const INCLUDE_CURSO = {
  tracks: { include: { track: true }, orderBy: { order: "asc" } },
  modules: {
    orderBy: { order: "asc" },
    include: { lessons: { orderBy: { order: "asc" } } },
  },
} as const;

/** Monta o formato que as telas esperam, ja com o progresso da pessoa. */
function montarCurso(
  curso: Awaited<ReturnType<typeof buscarCursosCru>>[number],
  concluidas: Set<string>,
): CursoCompleto {
  const modulos: ModuloNaTela[] = curso.modules.map((m) => ({
    id: m.id,
    title: m.title,
    description: m.description,
    level: m.level,
    order: m.order,
    aulas: m.lessons.map((a) => ({
      id: a.id,
      title: a.title,
      description: a.description,
      videoUrl: a.videoUrl,
      materialUrl: a.materialUrl,
      durationMin: a.durationMin,
      order: a.order,
      concluida: concluidas.has(a.id),
    })),
  }));

  const aulas = modulos.flatMap((m) => m.aulas);

  return {
    id: curso.id,
    slug: curso.slug,
    title: curso.title,
    subtitle: curso.subtitle,
    description: curso.description,
    level: curso.level,
    area: curso.area,
    cover: curso.cover,
    featured: curso.featured,
    published: curso.published,
    trilhas: curso.tracks.map((t) => t.track.slug),
    totalAulas: aulas.length,
    concluidas: aulas.filter((a) => a.concluida).length,
    minutos: aulas.reduce((soma, a) => soma + a.durationMin, 0),
    modulos,
  };
}

function buscarCursosCru(where: Record<string, unknown>) {
  return db.course.findMany({
    where,
    include: INCLUDE_CURSO,
    orderBy: [{ order: "asc" }, { title: "asc" }],
  });
}

/** Aulas que esta pessoa ja marcou como vistas. */
async function aulasConcluidas(userId: string): Promise<Set<string>> {
  const feitas = await db.lessonProgress.findMany({
    where: { userId, completed: true },
    select: { lessonId: true },
  });
  return new Set(feitas.map((f) => f.lessonId));
}

/** Todos os cursos publicados, com o progresso de quem esta olhando. */
export async function listarCursos(
  userId: string,
  incluirRascunhos = false,
): Promise<CursoCompleto[]> {
  const [cursos, concluidas] = await Promise.all([
    buscarCursosCru(incluirRascunhos ? {} : { published: true }),
    aulasConcluidas(userId),
  ]);
  return cursos.map((c) => montarCurso(c, concluidas));
}

/** Um curso pelo endereco. Devolve null se nao existir ou nao estar publicado. */
export async function buscarCurso(
  slug: string,
  userId: string,
  incluirRascunhos = false,
): Promise<CursoCompleto | null> {
  const [cursos, concluidas] = await Promise.all([
    buscarCursosCru(incluirRascunhos ? { slug } : { slug, published: true }),
    aulasConcluidas(userId),
  ]);
  const curso = cursos[0];
  return curso ? montarCurso(curso, concluidas) : null;
}

// --- Por onde comecar ----------------------------------------------------

export type PontoDeEntrada = {
  aula: AulaNaTela;
  modulo: ModuloNaTela;
  /** Por que esta aula: usado no texto do botao e na explicacao. */
  motivo: "continuar" | "quiz" | "inicio" | "revisao";
};

/**
 * A resposta de "por onde eu começo neste curso".
 *
 * Ordem das regras:
 *   1. Se ja assistiu alguma coisa, continua na primeira aula em aberto.
 *   2. Se nunca assistiu, entra no primeiro modulo do nivel dela - e o que o
 *      quiz decide. Quem ja pratica nao precisa rever o basico.
 *   3. Se todo modulo do curso e mais basico que a pessoa, entra no ultimo
 *      (marcado como revisao). Se acabou tudo, volta a primeira aula.
 */
export function ondeComecar(
  curso: CursoCompleto,
  nivelDaPessoa: Nivel | string | null,
): PontoDeEntrada | null {
  const comAulas = curso.modulos.filter((m) => m.aulas.length > 0);
  if (comAulas.length === 0) return null;

  const emAberto = (m: ModuloNaTela) => m.aulas.find((a) => !a.concluida);

  if (curso.concluidas > 0) {
    for (const modulo of comAulas) {
      const aula = emAberto(modulo);
      if (aula) return { aula, modulo, motivo: "continuar" };
    }
    // Curso inteiro concluido: oferece rever do comeco.
    return { aula: comAulas[0].aulas[0], modulo: comAulas[0], motivo: "revisao" };
  }

  if (nivelDaPessoa) {
    const alvo = ordemDoNivel(String(nivelDaPessoa));
    const noNivel = comAulas.find((m) => ordemDoNivel(m.level) >= alvo);
    if (noNivel) {
      const primeiro = comAulas[0].id === noNivel.id;
      return {
        aula: noNivel.aulas[0],
        modulo: noNivel,
        motivo: primeiro ? "inicio" : "quiz",
      };
    }
    // Curso inteiro abaixo do nivel dela: entra no ultimo modulo. Se o curso
    // so tem um, nao ha decisao nenhuma a anunciar - e simplesmente o comeco.
    const ultimo = comAulas[comAulas.length - 1];
    return {
      aula: ultimo.aulas[0],
      modulo: ultimo,
      motivo: ultimo.id === comAulas[0].id ? "inicio" : "quiz",
    };
  }

  return { aula: comAulas[0].aulas[0], modulo: comAulas[0], motivo: "inicio" };
}

/**
 * Este modulo esta abaixo do nivel da pessoa?
 * A tela usa para marcar "revisão opcional" em vez de esconder: ninguem fica
 * sem acesso a nada, so deixa de ser o caminho principal.
 */
export function ehRevisao(nivelDoModulo: string, nivelDaPessoa: string | null) {
  if (!nivelDaPessoa) return false;
  return ordemDoNivel(nivelDoModulo) < ordemDoNivel(nivelDaPessoa);
}

/** Aula seguinte dentro do curso, atravessando os modulos. */
export function proximaAula(
  curso: CursoCompleto,
  aulaId: string,
): { aula: AulaNaTela; modulo: ModuloNaTela } | null {
  const fila = curso.modulos.flatMap((m) =>
    m.aulas.map((a) => ({ aula: a, modulo: m })),
  );
  const atual = fila.findIndex((i) => i.aula.id === aulaId);
  if (atual === -1 || atual + 1 >= fila.length) return null;
  return fila[atual + 1];
}

/**
 * Ordena os cursos de uma trilha pelo que faz mais sentido para esta pessoa.
 *
 * Tres criterios, nesta ordem:
 *   1. o que ela ainda nao terminou vem antes do que ja acabou;
 *   2. curso do nivel dela vem antes;
 *   3. curso mais especifico vem antes. Um curso que serve a cinco trilhas fala
 *      com todo mundo; um que serve so a dela fala com ela. Sem isso, o curso
 *      de base ocuparia o topo de todas as trilhas e a indicacao nao diria nada.
 *
 * Empate mantem a ordem definida pelo administrador.
 */
export function ordenarParaPessoa<T extends CursoNaVitrine>(
  cursos: T[],
  nivel: Nivel | string | null,
): T[] {
  const inacabado = (c: T) => (c.concluidas < c.totalAulas ? 0 : 1);
  const doNivel = (c: T) => (nivel && c.level === nivel ? 0 : 1);

  return [...cursos].sort(
    (a, b) =>
      inacabado(a) - inacabado(b) ||
      doNivel(a) - doNivel(b) ||
      a.trilhas.length - b.trilhas.length,
  );
}

// --- Numeros e textos ----------------------------------------------------

export function percentual(concluidas: number, total: number): number {
  if (total === 0) return 0;
  return Math.round((concluidas / total) * 100);
}

/** "1 h 20 min", "45 min", "—" */
export function duracao(minutos: number): string {
  if (!minutos) return "—";
  const h = Math.floor(minutos / 60);
  const m = minutos % 60;
  if (h === 0) return `${m} min`;
  if (m === 0) return `${h} h`;
  return `${h} h ${m} min`;
}

// --- Quiz da pessoa ------------------------------------------------------

export type TrilhaDaPessoa = {
  slug: TrilhaSlug;
  name: string;
  tagline: string | null;
  description: string | null;
  nivel: Nivel;
};

/** O resultado do quiz de quem esta logado (ou null, se ainda nao fez). */
export async function trilhaDaPessoa(
  userId: string,
): Promise<TrilhaDaPessoa | null> {
  const resultado = await db.quizResult.findUnique({
    where: { userId },
    include: { track: true },
  });
  if (!resultado?.track) return null;

  return {
    slug: resultado.track.slug as TrilhaSlug,
    name: resultado.track.name,
    tagline: resultado.track.tagline,
    description: resultado.track.description,
    nivel: (NIVEL_ORDEM.includes(resultado.level as Nivel)
      ? resultado.level
      : "INICIANTE") as Nivel,
  };
}

/**
 * Garante que as cinco trilhas existam no banco.
 *
 * O quiz pontua slugs que moram no codigo; o resultado aponta para uma linha
 * da tabela. Chamando isto antes de gravar, o sistema funciona num banco
 * recem-criado, sem depender de ninguem ter rodado o seed.
 */
export async function garantirTrilhas() {
  const slugs = Object.keys(TRILHAS) as TrilhaSlug[];
  await Promise.all(
    slugs.map((slug, i) =>
      db.track.upsert({
        where: { slug },
        create: { slug, ...TRILHAS[slug], order: i },
        update: { ...TRILHAS[slug], order: i },
      }),
    ),
  );
}

/** As trilhas do banco, na ordem, com quantos cursos cada uma tem. */
export async function listarTrilhas() {
  return db.track.findMany({
    orderBy: { order: "asc" },
    include: { _count: { select: { courses: true } } },
  });
}
