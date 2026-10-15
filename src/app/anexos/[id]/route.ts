import { NextResponse } from "next/server";
import { requireModule } from "@/lib/auth";
import { db } from "@/lib/db";
import { filtroDeVisibilidade } from "@/lib/demandas";
import { arquivosConfigurados, PASTA, storage } from "@/lib/arquivos";

/**
 * Abre um arquivo enviado numa demanda.
 *
 * A pasta no Supabase e privada: aqui o sistema confere quem esta pedindo e
 * gera um link que vale so 1 minuto. Quem nao esta logado nao abre.
 */
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const user = await requireModule("DEMANDAS");
  const { id } = await params;

  const anexo = await db.attachment.findFirst({
    where: { id, demand: filtroDeVisibilidade(user) },
  });
  if (!anexo?.path || !arquivosConfigurados()) {
    return new NextResponse("Arquivo não encontrado.", { status: 404 });
  }

  // ?baixar=1 salva no computador; sem isso, abre no navegador (PDF, imagem).
  const baixar = new URL(request.url).searchParams.has("baixar");
  const { data, error } = await storage()
    .from(PASTA)
    .createSignedUrl(anexo.path, 60, baixar ? { download: anexo.title } : {});

  if (error || !data) {
    return new NextResponse("Não foi possível abrir o arquivo.", { status: 500 });
  }
  return NextResponse.redirect(data.signedUrl);
}
