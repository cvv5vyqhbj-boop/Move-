/**
 * Confere as variáveis antes de publicar.
 *
 * Sem isso, faltar uma variável dá um erro técnico difícil de entender no
 * meio do log da Netlify. Aqui a mensagem diz exatamente o que falta e onde
 * resolver.
 */

import { existsSync, readFileSync } from "node:fs";

// Na Netlify as variáveis chegam prontas. No computador, elas moram no .env —
// então lemos o arquivo aqui, senão a conferência acusaria falta à toa.
if (existsSync(".env")) {
  for (const linha of readFileSync(".env", "utf8").split("\n")) {
    const acerto = linha.match(/^\s*([A-Z_][A-Z0-9_]*)\s*=\s*(.*)\s*$/);
    if (!acerto) continue;
    const [, nome, bruto] = acerto;
    if (process.env[nome]) continue; // o que já veio de fora manda
    process.env[nome] = bruto.trim().replace(/^["']|["']$/g, "");
  }
}

const OBRIGATORIAS = [
  {
    nome: "DATABASE_URL",
    onde: 'Supabase > botão "Connect" > Transaction pooler (porta 6543)',
  },
  {
    nome: "DIRECT_URL",
    onde: 'Supabase > botão "Connect" > Direct connection (porta 5432)',
  },
  {
    nome: "SESSION_SECRET",
    onde: "você mesma gera, com: openssl rand -hex 32",
  },
];

const faltando = OBRIGATORIAS.filter((v) => !process.env[v.nome]);

// Erro clássico: copiar o endereço e esquecer de trocar a senha.
const comSenhaNaoTrocada = ["DATABASE_URL", "DIRECT_URL"].filter((nome) =>
  (process.env[nome] ?? "").includes("[YOUR-PASSWORD]"),
);

if (faltando.length > 0 || comSenhaNaoTrocada.length > 0) {
  console.error("\n" + "=".repeat(64));
  console.error("   A publicação parou: falta configurar o sistema");
  console.error("=".repeat(64) + "\n");

  if (faltando.length > 0) {
    console.error("Estas variáveis não foram cadastradas:\n");
    for (const v of faltando) {
      console.error(`  ${v.nome}`);
      console.error(`      onde pegar: ${v.onde}\n`);
    }
  }

  if (comSenhaNaoTrocada.length > 0) {
    console.error("Estas ainda estão com [YOUR-PASSWORD] sem trocar:\n");
    for (const nome of comSenhaNaoTrocada) {
      console.error(`  ${nome}`);
    }
    console.error(
      "\n      Troque [YOUR-PASSWORD] pela senha do banco que você criou",
    );
    console.error("      no Supabase. Os colchetes saem junto.\n");
  }

  console.error("-".repeat(64));
  console.error("Na Netlify: Site configuration > Environment variables");
  console.error("Depois de cadastrar: Deploys > Trigger deploy > Deploy site");
  console.error("Passo a passo completo: COMO-PUBLICAR-NA-INTERNET.md");
  console.error("-".repeat(64) + "\n");

  process.exit(1);
}

console.log("Configuração conferida. Seguindo com a publicação.");
