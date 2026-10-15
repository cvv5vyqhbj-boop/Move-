import { createClient } from "@supabase/supabase-js";

/**
 * Arquivos enviados nas demandas (PDF, imagem, planilha...).
 *
 * Ficam no Storage do Supabase, numa pasta privada: so abre quem esta logado
 * no sistema, por um link que vale poucos minutos.
 *
 * O arquivo vai direto do navegador para o Supabase. Ele nao passa pelo
 * servidor da Netlify, que recusaria arquivos grandes.
 *
 * Precisa de SUPABASE_SERVICE_ROLE_KEY. Sem ela, a demanda continua aceitando
 * links normalmente — so o botao de enviar arquivo avisa que falta configurar.
 */

export const PASTA = "anexos";

/** Limite por arquivo. O plano gratis do Supabase aceita ate 50 MB. */
export const TAMANHO_MAXIMO = 50 * 1024 * 1024;

export function arquivosConfigurados() {
  return Boolean(
    process.env.NEXT_PUBLIC_SUPABASE_URL &&
      process.env.SUPABASE_SERVICE_ROLE_KEY,
  );
}

/** Acesso de administrador ao Storage. So roda no servidor. */
export function storage() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const chave = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !chave) throw new Error("Falta configurar SUPABASE_SERVICE_ROLE_KEY");
  return createClient(url, chave, { auth: { persistSession: false } }).storage;
}

let pastaConferida = false;

/** Cria a pasta privada na primeira vez que alguem envia um arquivo. */
export async function garantirPasta() {
  if (pastaConferida) return;
  const s = storage();
  const { data } = await s.getBucket(PASTA);
  if (!data) {
    const { error } = await s.createBucket(PASTA, {
      public: false,
      fileSizeLimit: TAMANHO_MAXIMO,
    });
    // Duas pessoas enviando ao mesmo tempo: a outra ja criou, tudo certo.
    if (error && !/already exists/i.test(error.message)) throw error;
  }
  pastaConferida = true;
}

/** Nome seguro para guardar: sem acento, espaco ou barra. */
export function nomeSeguro(nome: string) {
  const limpo = nome
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-zA-Z0-9._-]+/g, "-")
    .replace(/^-+|-+$/g, "");
  return limpo.slice(-100) || "arquivo";
}

/** "820 KB", "3,4 MB" */
export function tamanhoLegivel(bytes: number) {
  if (bytes < 1024 * 1024) return `${Math.max(1, Math.round(bytes / 1024))} KB`;
  return `${(bytes / 1024 / 1024).toLocaleString("pt-BR", {
    maximumFractionDigits: 1,
  })} MB`;
}
