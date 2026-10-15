import nodemailer from "nodemailer";

/**
 * E-mail avisando a pessoa que chegou demanda para ela.
 *
 * Jeito principal: sai pelo Gmail da Move (contatomoveofc@gmail.com), com uma
 * "senha de app" do Google — GMAIL_USER e GMAIL_APP_PASSWORD. O Gmail gratis
 * manda ate ~500 e-mails por dia, de sobra para a equipe.
 *
 * Alternativa: Resend (resend.com), se um dia a Move tiver dominio proprio —
 * RESEND_API_KEY e EMAIL_REMETENTE.
 *
 * Sem nenhum dos dois configurado, nada quebra: a demanda e salva
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

function gmailConfigurado() {
  return Boolean(process.env.GMAIL_USER && process.env.GMAIL_APP_PASSWORD);
}

export function emailConfigurado() {
  return gmailConfigurado() || Boolean(process.env.RESEND_API_KEY);
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

type Mensagem = { para: string; assunto: string; html: string; texto: string };

async function enviarPeloGmail(mensagens: Mensagem[]) {
  const usuario = process.env.GMAIL_USER!;
  const transporte = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: usuario,
      // O Google mostra a senha de app com espacos ("abcd efgh ..."); tanto faz.
      pass: process.env.GMAIL_APP_PASSWORD!.replace(/\s/g, ""),
    },
    connectionTimeout: 5000,
    greetingTimeout: 5000,
    socketTimeout: 8000,
  });
  const remetente = `Sistema Move <${usuario}>`;

  await Promise.all(
    mensagens.map(async (m) => {
      try {
        await transporte.sendMail({
          from: remetente,
          to: m.para,
          subject: m.assunto,
          html: m.html,
          text: m.texto,
        });
      } catch (erro) {
        console.error(`E-mail para ${m.para} nao saiu:`, erro);
      }
    }),
  );
}

async function enviarPeloResend(mensagens: Mensagem[]) {
  const chave = process.env.RESEND_API_KEY!;
  const remetente =
    process.env.EMAIL_REMETENTE || "Sistema Move <onboarding@resend.dev>";

  await Promise.all(
    mensagens.map(async (m) => {
      try {
        const resposta = await fetch("https://api.resend.com/emails", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${chave}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            from: remetente,
            to: m.para,
            subject: m.assunto,
            html: m.html,
            text: m.texto,
          }),
          signal: AbortSignal.timeout(5000),
        });
        if (!resposta.ok) {
          console.error(
            `E-mail para ${m.para} nao saiu:`,
            resposta.status,
            await resposta.text(),
          );
        }
      } catch (erro) {
        console.error(`E-mail para ${m.para} nao saiu:`, erro);
      }
    }),
  );
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
  if (!emailConfigurado() || pessoas.length === 0) return;

  const mensagens = pessoas.map((pessoa) => ({
    para: pessoa.email,
    assunto: `Nova demanda: ${demanda.title}`,
    ...montarEmail(pessoa, demanda, quemCriou),
  }));

  if (gmailConfigurado()) await enviarPeloGmail(mensagens);
  else await enviarPeloResend(mensagens);
}
