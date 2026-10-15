/**
 * E-mail avisando a pessoa que chegou demanda para ela.
 *
 * O envio passa pelo Resend (resend.com), que tem plano gratis e funciona por
 * HTTP — sem biblioteca extra e sem servidor de e-mail proprio.
 *
 * Se RESEND_API_KEY nao estiver configurada, nada quebra: a demanda e salva
 * normalmente, so o e-mail nao sai.
 */

type Demanda = {
  id: string;
  title: string;
  description: string | null;
  dueDate: Date | null;
  clienteNome: string | null;
};

type Pessoa = { name: string; email: string };

export function emailConfigurado() {
  return Boolean(process.env.RESEND_API_KEY);
}

/** Endereco do sistema, para o botao "Abrir demanda" do e-mail. */
function enderecoDoSistema() {
  // A Netlify preenche URL sozinha com o endereco publicado.
  const url = process.env.SITE_URL || process.env.URL || "http://localhost:3000";
  return url.replace(/\/$/, "");
}

function escapar(texto: string) {
  return texto
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function montarEmail(pessoa: Pessoa, demanda: Demanda, quemCriou: string) {
  const link = `${enderecoDoSistema()}/demandas/${demanda.id}`;
  const prazo = demanda.dueDate
    ? new Date(demanda.dueDate).toLocaleDateString("pt-BR", { timeZone: "UTC" })
    : null;
  const primeiroNome = pessoa.name.split(" ")[0];

  const linhas = [
    demanda.clienteNome ? `<b>Cliente:</b> ${escapar(demanda.clienteNome)}` : null,
    prazo ? `<b>Prazo com o cliente:</b> ${prazo}` : null,
    `<b>Quem colocou você:</b> ${escapar(quemCriou)}`,
  ].filter(Boolean);

  const html = `
<div style="font-family:Arial,sans-serif;max-width:520px;color:#0f172a">
  <p>Oi, ${escapar(primeiroNome)}!</p>
  <p>Tem demanda nova para você no sistema da Move:</p>
  <h2 style="margin:16px 0 8px">${escapar(demanda.title)}</h2>
  <p style="line-height:1.6">${linhas.join("<br>")}</p>
  ${
    demanda.description
      ? `<p style="white-space:pre-line;color:#475569">${escapar(demanda.description)}</p>`
      : ""
  }
  <p style="margin:24px 0">
    <a href="${link}" style="background:#f97316;color:#fff;padding:10px 18px;border-radius:8px;text-decoration:none">Abrir demanda</a>
  </p>
</div>`;

  const texto = [
    `Oi, ${primeiroNome}!`,
    "",
    "Tem demanda nova para você no sistema da Move:",
    demanda.title,
    demanda.clienteNome ? `Cliente: ${demanda.clienteNome}` : "",
    prazo ? `Prazo com o cliente: ${prazo}` : "",
    `Quem colocou você: ${quemCriou}`,
    "",
    `Abrir: ${link}`,
  ]
    .filter((l, i, todas) => l !== "" || todas[i - 1] !== "")
    .join("\n");

  return { html, texto };
}

/**
 * Manda um e-mail para cada pessoa que acabou de entrar na demanda.
 * Nunca derruba quem salvou: se o envio falhar, so fica registrado no log.
 */
export async function avisarPorEmail(
  pessoas: Pessoa[],
  demanda: Demanda,
  quemCriou: string,
) {
  const chave = process.env.RESEND_API_KEY;
  if (!chave || pessoas.length === 0) return;

  const remetente =
    process.env.EMAIL_REMETENTE || "Sistema Move <onboarding@resend.dev>";

  await Promise.all(
    pessoas.map(async (pessoa) => {
      const { html, texto } = montarEmail(pessoa, demanda, quemCriou);
      try {
        const resposta = await fetch("https://api.resend.com/emails", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${chave}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            from: remetente,
            to: pessoa.email,
            subject: `Nova demanda: ${demanda.title}`,
            html,
            text: texto,
          }),
          signal: AbortSignal.timeout(5000),
        });
        if (!resposta.ok) {
          console.error(
            `E-mail para ${pessoa.email} nao saiu:`,
            resposta.status,
            await resposta.text(),
          );
        }
      } catch (erro) {
        console.error(`E-mail para ${pessoa.email} nao saiu:`, erro);
      }
    }),
  );
}
