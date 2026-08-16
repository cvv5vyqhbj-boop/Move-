/**
 * Aviso de "alguem mudou alguma coisa".
 *
 * Quando qualquer pessoa salva algo, todos os navegadores com o sistema aberto
 * precisam saber, para atualizarem a tela sozinhos.
 *
 * Como o sistema roda em pedacinhos separados na Netlify (cada acesso pode cair
 * numa maquina diferente), o aviso nao pode ficar guardado na memoria de um
 * servidor. Ele passa pelo Supabase, que fala com todos os navegadores de uma
 * vez.
 *
 * Se o Supabase nao estiver configurado, nada quebra: o navegador procura
 * novidades sozinho a cada poucos segundos (ver atualizacao-automatica.tsx).
 */

export const CANAL = "move-atualizacoes";
export const EVENTO = "mudou";

export function tempoRealConfigurado() {
  return Boolean(
    process.env.NEXT_PUBLIC_SUPABASE_URL &&
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  );
}

/**
 * Avisa todos os navegadores conectados que os dados mudaram.
 *
 * Usa a API de transmissao do Supabase por HTTP — sem biblioteca extra e sem
 * segurar conexao aberta, que e o que a Netlify nao permite.
 */
export async function avisarMudanca() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const chave = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !chave) return;

  try {
    await fetch(`${url}/realtime/v1/api/broadcast`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        apikey: chave,
        Authorization: `Bearer ${chave}`,
      },
      body: JSON.stringify({
        messages: [{ topic: CANAL, event: EVENTO, payload: {} }],
      }),
      // Nao vale a pena travar quem salvou por causa do aviso aos outros.
      signal: AbortSignal.timeout(3000),
    });
  } catch {
    // Se o aviso falhar, as telas ainda atualizam pela verificação periódica.
  }
}
