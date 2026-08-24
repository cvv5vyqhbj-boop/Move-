/**
 * Sincronizacao automatica com o Cora.
 *
 * A Netlify chama esta funcao no ritmo definido em netlify.toml — hoje,
 * de hora em hora. Ela puxa o extrato desde a ultima sincronizacao e
 * grava as entradas/saidas novas no banco.
 *
 * Se o Cora nao estiver configurado (variaveis de ambiente vazias), a funcao
 * simplesmente retorna 200 sem fazer nada — assim ela pode ficar habilitada
 * antes mesmo da Alyson cadastrar as credenciais.
 */

import type { Config } from "@netlify/functions";
import { sincronizarComCora } from "../../src/lib/cora-sync";
import { coraConfigurado } from "../../src/lib/cora";

export default async () => {
  if (!coraConfigurado()) {
    return new Response("cora nao configurado, pulando", { status: 200 });
  }
  try {
    const r = await sincronizarComCora();
    return Response.json({ ok: true, ...r });
  } catch (e) {
    const mensagem = e instanceof Error ? e.message : String(e);
    console.error("[cora] erro na sincronizacao agendada:", mensagem);
    return new Response(`erro: ${mensagem}`, { status: 500 });
  }
};

export const config: Config = {
  // A cada hora, no minuto zero. UTC. Ajustar aqui se quiser mais/menos.
  schedule: "0 * * * *",
};
