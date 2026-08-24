"use server";

import { requireModule } from "@/lib/auth";
import { sincronizarComCora } from "@/lib/cora-sync";

/**
 * Chamado pelo botao "Sincronizar com o Cora" no financeiro.
 * So o administrador pode disparar (ja e o unico que ve financeiro).
 */
export async function sincronizarCoraAgora(): Promise<{
  ok: boolean;
  entradas?: number;
  saidas?: number;
  erro?: string;
}> {
  await requireModule("FINANCEIRO");
  try {
    const r = await sincronizarComCora();
    return { ok: true, entradas: r.entradas, saidas: r.saidas };
  } catch (e) {
    const mensagem = e instanceof Error ? e.message : String(e);
    return { ok: false, erro: mensagem };
  }
}
