/**
 * Conversa com a API do Cora.
 *
 * O Cora exige mTLS: o servidor deles so aceita a conexao se ela apresentar
 * o certificado + a chave privada que a Alyson baixou no painel. Alem disso,
 * cada requisicao leva um token OAuth (com validade curta), que a gente pega
 * no /token e reaproveita ate expirar.
 *
 * Todos os valores sensiveis vem de variaveis de ambiente (Netlify).
 * Nada de certificado ou chave dentro do repositorio.
 */

import { Agent, fetch as undiciFetch } from "undici";

const BASE_URL =
  process.env.CORA_BASE_URL ??
  "https://matls-clients.api.cora.com.br"; // producao (mTLS)

const CLIENT_ID = process.env.CORA_CLIENT_ID ?? "";
const CERT_PEM = process.env.CORA_CERT_PEM ?? "";
const KEY_PEM = process.env.CORA_KEY_PEM ?? "";

// A conexao mTLS vive uma vez por instancia — reaproveita a mesma para nao
// pagar o custo do handshake em toda chamada.
let agenteCache: Agent | null = null;
function agente(): Agent {
  if (agenteCache) return agenteCache;
  if (!CERT_PEM || !KEY_PEM) {
    throw new Error(
      "Cora nao configurado: faltam CORA_CERT_PEM e/ou CORA_KEY_PEM nas variaveis de ambiente.",
    );
  }
  agenteCache = new Agent({
    connect: {
      cert: CERT_PEM,
      key: KEY_PEM,
    },
  });
  return agenteCache;
}

// Token OAuth em cache. Expira em cerca de 1h; renovamos com uma folga.
type TokenCache = { token: string; expiraEm: number };
let tokenCache: TokenCache | null = null;

async function obterToken(): Promise<string> {
  if (tokenCache && Date.now() < tokenCache.expiraEm - 60_000) {
    return tokenCache.token;
  }
  if (!CLIENT_ID) {
    throw new Error(
      "Cora nao configurado: falta CORA_CLIENT_ID nas variaveis de ambiente.",
    );
  }

  const corpo = new URLSearchParams({
    grant_type: "client_credentials",
    client_id: CLIENT_ID,
  });

  const resposta = await undiciFetch(`${BASE_URL}/token`, {
    method: "POST",
    headers: { "content-type": "application/x-www-form-urlencoded" },
    body: corpo.toString(),
    dispatcher: agente(),
  });

  if (!resposta.ok) {
    const texto = await resposta.text();
    throw new Error(
      `Cora /token respondeu ${resposta.status}: ${texto.slice(0, 200)}`,
    );
  }

  const json = (await resposta.json()) as {
    access_token: string;
    expires_in?: number;
  };
  const validadeSegundos = json.expires_in ?? 3600;
  tokenCache = {
    token: json.access_token,
    expiraEm: Date.now() + validadeSegundos * 1000,
  };
  return json.access_token;
}

/** Um lancamento vindo do extrato, ja normalizado para o formato interno. */
export type LancamentoCora = {
  /** Identificador unico do lancamento no Cora (usado para nao importar duas vezes). */
  id: string;
  /** Data do lancamento (ISO). */
  data: Date;
  /** Valor em reais (sempre positivo). */
  valor: number;
  /** Se saiu ("DEBITO") ou entrou ("CREDITO") na conta. */
  tipo: "DEBITO" | "CREDITO";
  /** Descricao curta que aparece no extrato. */
  descricao: string;
  /** Nome de quem pagou ou recebeu, quando o Cora informa. */
  contraparte: string | null;
};

/**
 * Adapta um lancamento cru do Cora para o formato interno.
 *
 * Se em algum momento o Cora renomear campos, ou se a resposta chegar num
 * envelope diferente, este e o unico lugar a mexer.
 */
function adaptarLancamento(cru: Record<string, unknown>): LancamentoCora | null {
  // A API costuma trazer estes campos, com pequenas variacoes de nome entre
  // versoes. Aceitamos os aliases mais comuns.
  const id =
    (cru.id as string | undefined) ??
    (cru.entryId as string | undefined) ??
    (cru.transactionId as string | undefined);

  const dataStr =
    (cru.date as string | undefined) ??
    (cru.transactionDate as string | undefined) ??
    (cru.createdAt as string | undefined);

  const valorBruto =
    (cru.amount as number | string | undefined) ??
    (cru.value as number | string | undefined);

  const tipoStr = String(
    (cru.transactionType as string | undefined) ??
      (cru.type as string | undefined) ??
      (cru.direction as string | undefined) ??
      "",
  ).toUpperCase();

  const descricao =
    (cru.description as string | undefined) ??
    (cru.title as string | undefined) ??
    (cru.name as string | undefined) ??
    "Lançamento";

  const contraparte =
    ((cru.counterparty as { name?: string } | undefined) ?? {}).name ??
    ((cru.recipient as { name?: string } | undefined) ?? {}).name ??
    ((cru.payer as { name?: string } | undefined) ?? {}).name ??
    null;

  if (!id || !dataStr || valorBruto == null) return null;

  const valorNumero = Number(valorBruto);
  const tipo: "DEBITO" | "CREDITO" =
    tipoStr.includes("DEBIT") || tipoStr === "OUT" || valorNumero < 0
      ? "DEBITO"
      : "CREDITO";

  return {
    id,
    data: new Date(dataStr),
    valor: Math.abs(valorNumero),
    tipo,
    descricao: descricao.trim() || "Lançamento",
    contraparte,
  };
}

/**
 * Traz os lancamentos do extrato entre duas datas (inclusivo).
 *
 * Faz paginacao ate acabar; a API costuma limitar a 100 itens por pagina.
 */
export async function buscarExtrato(
  inicio: Date,
  fim: Date,
): Promise<LancamentoCora[]> {
  const token = await obterToken();
  const lancamentos: LancamentoCora[] = [];

  // Formato yyyy-mm-dd (a API aceita).
  const fmt = (d: Date) => d.toISOString().slice(0, 10);

  let pagina = 1;
  const porPagina = 100;

  while (true) {
    const url = new URL(`${BASE_URL}/v2/accounts/statement`);
    url.searchParams.set("start-date", fmt(inicio));
    url.searchParams.set("end-date", fmt(fim));
    url.searchParams.set("page", String(pagina));
    url.searchParams.set("perPage", String(porPagina));

    const resposta = await undiciFetch(url.toString(), {
      method: "GET",
      headers: {
        authorization: `Bearer ${token}`,
        accept: "application/json",
      },
      dispatcher: agente(),
    });

    if (!resposta.ok) {
      const texto = await resposta.text();
      throw new Error(
        `Cora extrato respondeu ${resposta.status}: ${texto.slice(0, 200)}`,
      );
    }

    // A resposta pode vir como array direto ou dentro de {items, data, entries}.
    const json = (await resposta.json()) as unknown;
    const itens: Record<string, unknown>[] = Array.isArray(json)
      ? (json as Record<string, unknown>[])
      : (((json as Record<string, unknown>).items ??
          (json as Record<string, unknown>).data ??
          (json as Record<string, unknown>).entries ??
          []) as Record<string, unknown>[]);

    if (itens.length === 0) break;

    for (const cru of itens) {
      const l = adaptarLancamento(cru);
      if (l) lancamentos.push(l);
    }

    if (itens.length < porPagina) break;
    pagina += 1;
    if (pagina > 50) break; // parede de seguranca para nao ficar em loop
  }

  return lancamentos;
}

/** Diz se a integracao com o Cora esta configurada (todas as 3 variaveis). */
export function coraConfigurado(): boolean {
  return Boolean(CLIENT_ID && CERT_PEM && KEY_PEM);
}
