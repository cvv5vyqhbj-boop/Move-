"use server";

import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { requireModule } from "@/lib/auth";
import { atualizarTudo } from "@/lib/atualizar";
import { garantirTrilhas } from "@/lib/cursos";
import { calcularResultado } from "@/lib/quiz";
import { NIVEIS, TRILHAS, type Nivel } from "@/lib/constants";

// --- Quiz ----------------------------------------------------------------

/**
 * Recebe as respostas, calcula trilha e nivel e guarda o resultado.
 *
 * Guardamos tambem as respostas cruas: se um dia o calculo mudar, da para
 * recalcular sem pedir para todo mundo responder de novo.
 */
export async function responderQuiz(dados: FormData) {
  const user = await requireModule("CURSOS");
  await garantirTrilhas();

  const respostas: Record<string, string> = {};
  for (const [campo, valor] of dados.entries()) {
    if (campo.startsWith("p_")) respostas[campo.slice(2)] = String(valor);
  }

  const { trilha, nivel, pontos } = calcularResultado(respostas);
  const track = await db.track.findUnique({ where: { slug: trilha } });

  const valores = {
    trackId: track?.id ?? null,
    level: nivel,
    answers: JSON.stringify(respostas),
    scores: JSON.stringify(pontos),
  };

  await db.quizResult.upsert({
    where: { userId: user.id },
    create: { userId: user.id, ...valores },
    update: valores,
  });

  atualizarTudo();
  redirect("/cursos?resultado=1");
}

/** Apaga o resultado e manda a pessoa responder de novo. */
export async function refazerQuiz() {
  const user = await requireModule("CURSOS");
  await db.quizResult.deleteMany({ where: { userId: user.id } });
  atualizarTudo();
  redirect("/cursos/quiz");
}

/** Troca a trilha na mao, sem refazer o quiz inteiro. */
export async function trocarTrilha(dados: FormData) {
  const user = await requireModule("CURSOS");
  const slug = String(dados.get("slug") ?? "");
  if (!(slug in TRILHAS)) return;

  await garantirTrilhas();
  const track = await db.track.findUnique({ where: { slug } });
  if (!track) return;

  await db.quizResult.upsert({
    where: { userId: user.id },
    create: { userId: user.id, trackId: track.id, level: "INICIANTE" },
    update: { trackId: track.id },
  });

  atualizarTudo();
  redirect("/cursos");
}

/** Ajusta so o nivel de entrada (quem achou que o quiz pegou leve demais). */
export async function trocarNivel(dados: FormData) {
  const user = await requireModule("CURSOS");
  const nivel = String(dados.get("nivel") ?? "");
  if (!(nivel in NIVEIS)) return;

  await db.quizResult.updateMany({
    where: { userId: user.id },
    data: { level: nivel as Nivel },
  });
  atualizarTudo();
}

// --- Progresso de quem assiste -------------------------------------------

/** Marca ou desmarca uma aula. Cada pessoa mexe so no proprio progresso. */
export async function marcarAula(dados: FormData) {
  const user = await requireModule("CURSOS");
  const lessonId = String(dados.get("lessonId") ?? "");
  const concluida = String(dados.get("concluida") ?? "") === "sim";
  if (!lessonId) return;

  const aula = await db.lesson.findUnique({ where: { id: lessonId } });
  if (!aula) return;

  await db.lessonProgress.upsert({
    where: { userId_lessonId: { userId: user.id, lessonId } },
    create: { userId: user.id, lessonId, completed: concluida },
    update: { completed: concluida },
  });
  atualizarTudo();
}

// --- Gerenciar cursos (so administrador) ---------------------------------

function paraEndereco(texto: string) {
  return texto
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 60);
}

/** Endereco unico: se "posicionamento" ja existe, vira "posicionamento-2". */
async function enderecoLivre(base: string, ignorarId?: string) {
  const raiz = base || "curso";
  let tentativa = raiz;
  let n = 2;
  for (;;) {
    const existe = await db.course.findUnique({ where: { slug: tentativa } });
    if (!existe || existe.id === ignorarId) return tentativa;
    tentativa = `${raiz}-${n++}`;
  }
}

export async function salvarCurso(dados: FormData) {
  await requireModule("CURSOS_ADMIN");
  await garantirTrilhas();

  const id = String(dados.get("id") ?? "");
  const title = String(dados.get("title") ?? "").trim();
  if (!title) return;

  const slugPedido = String(dados.get("slug") ?? "").trim();
  const slug = await enderecoLivre(
    paraEndereco(slugPedido || title),
    id || undefined,
  );

  const valores = {
    title,
    slug,
    subtitle: String(dados.get("subtitle") ?? "").trim() || null,
    description: String(dados.get("description") ?? "").trim() || null,
    level: String(dados.get("level") ?? "INICIANTE"),
    area: String(dados.get("area") ?? "") || null,
    cover: String(dados.get("cover") ?? "laranja"),
    featured: dados.get("featured") === "on",
    published: dados.get("published") === "on",
    order: Number(dados.get("order") ?? 0),
  };

  const trilhas = dados
    .getAll("trilhas")
    .map(String)
    .filter((s) => s in TRILHAS);

  const tracks = await db.track.findMany({ where: { slug: { in: trilhas } } });
  const vinculos = tracks.map((t, i) => ({ trackId: t.id, order: i }));

  // Um destaque so na vitrine: marcar este apaga o anterior.
  if (valores.featured) {
    await db.course.updateMany({
      where: { featured: true, ...(id ? { NOT: { id } } : {}) },
      data: { featured: false },
    });
  }

  const curso = id
    ? await db.course.update({
        where: { id },
        data: { ...valores, tracks: { deleteMany: {}, create: vinculos } },
      })
    : await db.course.create({
        data: { ...valores, tracks: { create: vinculos } },
      });

  atualizarTudo();
  redirect(`/cursos/gerenciar/${curso.id}`);
}

export async function excluirCurso(dados: FormData) {
  await requireModule("CURSOS_ADMIN");
  const id = String(dados.get("id") ?? "");
  if (id) await db.course.delete({ where: { id } });
  atualizarTudo();
  redirect("/cursos/gerenciar");
}

export async function salvarModulo(dados: FormData) {
  await requireModule("CURSOS_ADMIN");

  const id = String(dados.get("id") ?? "");
  const courseId = String(dados.get("courseId") ?? "");
  const title = String(dados.get("title") ?? "").trim();
  if (!title || (!id && !courseId)) return;

  const valores = {
    title,
    description: String(dados.get("description") ?? "").trim() || null,
    level: String(dados.get("level") ?? "INICIANTE"),
    order: Number(dados.get("order") ?? 0),
  };

  if (id) {
    await db.courseModule.update({ where: { id }, data: valores });
  } else {
    await db.courseModule.create({ data: { ...valores, courseId } });
  }
  atualizarTudo();
}

export async function excluirModulo(dados: FormData) {
  await requireModule("CURSOS_ADMIN");
  const id = String(dados.get("id") ?? "");
  if (id) await db.courseModule.delete({ where: { id } });
  atualizarTudo();
}

export async function salvarAula(dados: FormData) {
  await requireModule("CURSOS_ADMIN");

  const id = String(dados.get("id") ?? "");
  const moduleId = String(dados.get("moduleId") ?? "");
  const title = String(dados.get("title") ?? "").trim();
  if (!title || (!id && !moduleId)) return;

  const valores = {
    title,
    description: String(dados.get("description") ?? "").trim() || null,
    videoUrl: String(dados.get("videoUrl") ?? "").trim() || null,
    materialUrl: String(dados.get("materialUrl") ?? "").trim() || null,
    durationMin: Number(dados.get("durationMin") ?? 0),
    order: Number(dados.get("order") ?? 0),
  };

  if (id) {
    await db.lesson.update({ where: { id }, data: valores });
  } else {
    await db.lesson.create({ data: { ...valores, moduleId } });
  }
  atualizarTudo();
}

export async function excluirAula(dados: FormData) {
  await requireModule("CURSOS_ADMIN");
  const id = String(dados.get("id") ?? "");
  if (id) await db.lesson.delete({ where: { id } });
  atualizarTudo();
}
