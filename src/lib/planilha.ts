/**
 * Monta um arquivo de planilha (CSV) que abre direto no Excel em português.
 *
 * Dois detalhes que fazem o Excel brasileiro abrir certo:
 * - separador ponto e vírgula, não vírgula;
 * - o "BOM" no começo, para os acentos não virarem símbolos.
 */
export function montarPlanilha(
  colunas: string[],
  linhas: (string | number)[][],
): string {
  const celula = (valor: string | number) => {
    if (typeof valor === "number") {
      // O Excel em português espera vírgula como separador decimal.
      return valor.toFixed(2).replace(".", ",");
    }
    const texto = String(valor ?? "");
    return /[";\n]/.test(texto) ? `"${texto.replace(/"/g, '""')}"` : texto;
  };

  const conteudo = [colunas, ...linhas]
    .map((linha) => linha.map(celula).join(";"))
    .join("\r\n");

  return "﻿" + conteudo;
}

/** Resposta pronta para o navegador baixar o arquivo. */
export function respostaDePlanilha(nomeDoArquivo: string, conteudo: string) {
  return new Response(conteudo, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="${nomeDoArquivo}"`,
    },
  });
}

/** 15-08-2026, para usar no nome do arquivo. */
export function hojeParaArquivo() {
  return new Date().toLocaleDateString("pt-BR").replace(/\//g, "-");
}
