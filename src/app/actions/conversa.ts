"use server";

import { db } from "@/lib/db";
import { requireModule } from "@/lib/auth";
import { atualizarTudo } from "@/lib/atualizar";
import { filtroDeVisibilidade } from "@/lib/demandas";
import {
  arquivosConfigurados,
  garantirPasta,
  nomeSeguro,
  PASTA,
  storage,
  TAMANHO_MAXIMO,
} from "@/lib/arquivos";

/** So deixa comentar e anexar em demanda que a pessoa realmente pode ver. */
async function demandaPermitida(demandId: string) {
  const user = await requireModule("DEMANDAS");
  const demanda = await db.demand.findFirst({
    where: { id: demandId, ...filtroDeVisibilidade(user) },
    select: { id: true },
  });
  return demanda ? user : null;
}

export async function comentar(dados: FormData) {
  const demandId = String(dados.get("demandId") ?? "");
  const texto = String(dados.get("text") ?? "").trim();
  if (!texto) return;

  const user = await demandaPermitida(demandId);
  if (!user) return;

  await db.comment.create({
    data: { demandId, authorId: user.id, text: texto },
  });

  atualizarTudo();
}

export async function apagarComentario(dados: FormData) {
  const id = String(dados.get("id") ?? "");
  const user = await requireModule("DEMANDAS");

  const comentario = await db.comment.findUnique({ where: { id } });
  if (!comentario) return;

  // Cada um apaga o que escreveu. O administrador apaga qualquer um.
  if (user.role !== "ADMIN" && comentario.authorId !== user.id) return;

  await db.comment.delete({ where: { id } });
  atualizarTudo();
}

export async function adicionarLink(dados: FormData) {
  const demandId = String(dados.get("demandId") ?? "");
  const title = String(dados.get("title") ?? "").trim();
  let url = String(dados.get("url") ?? "").trim();
  if (!url) return;

  // Aceita o endereço colado sem "https://".
  if (!/^https?:\/\//i.test(url)) url = `https://${url}`;

  const user = await demandaPermitida(demandId);
  if (!user) return;

  await db.attachment.create({
    data: { demandId, title: title || url, url },
  });

  atualizarTudo();
}

export async function apagarLink(dados: FormData) {
  const id = String(dados.get("id") ?? "");
  await requireModule("DEMANDAS");
  if (!id) return;

  const anexo = await db.attachment.delete({ where: { id } });

  // Se era arquivo enviado, apaga tambem do Storage para nao ocupar espaco.
  if (anexo.path && arquivosConfigurados()) {
    await storage().from(PASTA).remove([anexo.path]);
  }
  atualizarTudo();
}

/**
 * Primeiro passo do envio de arquivo: o servidor confere a permissao e devolve
 * uma autorizacao de uso unico. Com ela, o navegador manda o arquivo direto
 * para o Supabase.
 */
export async function prepararEnvioDeArquivo(
  demandId: string,
  nome: string,
  tamanho: number,
): Promise<{ path: string; token: string } | { erro: string }> {
  if (!arquivosConfigurados()) {
    return { erro: "O envio de arquivos ainda não foi configurado no sistema." };
  }
  if (tamanho > TAMANHO_MAXIMO) {
    return { erro: "Arquivo grande demais. O limite é 50 MB." };
  }

  const user = await demandaPermitida(demandId);
  if (!user) return { erro: "Você não tem acesso a esta demanda." };

  await garantirPasta();

  // A pasta da demanda + um prefixo aleatorio: dois arquivos com o mesmo nome
  // nao se sobrescrevem.
  const path = `${demandId}/${crypto.randomUUID().slice(0, 8)}-${nomeSeguro(nome)}`;
  const { data, error } = await storage()
    .from(PASTA)
    .createSignedUploadUrl(path);
  if (error || !data) {
    console.error("Falha ao preparar envio:", error);
    return { erro: "Não foi possível enviar agora. Tente de novo." };
  }

  return { path, token: data.token };
}

/** Segundo passo: depois que o arquivo chegou no Supabase, guarda na demanda. */
export async function registrarArquivo(
  demandId: string,
  path: string,
  nome: string,
  tamanho: number,
  tipo: string,
) {
  const user = await demandaPermitida(demandId);
  if (!user) return;

  // So aceita arquivo guardado na pasta desta propria demanda.
  if (!path.startsWith(`${demandId}/`)) return;

  await db.attachment.create({
    data: {
      demandId,
      title: nome.trim() || "Arquivo",
      path,
      size: Math.round(tamanho),
      mimeType: tipo || null,
    },
  });

  atualizarTudo();
}
