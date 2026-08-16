/**
 * Cria o primeiro administrador do sistema.
 *
 * Chamado pelo instalar.command, que pergunta nome, e-mail e senha e passa por
 * aqui. Se o e-mail já existir, troca a senha em vez de dar erro — então este
 * script também serve para recuperar o acesso, se a senha for esquecida.
 *
 * Uso direto: ADMIN_NOME="..." ADMIN_EMAIL="..." ADMIN_SENHA="..." npm run criar-admin
 */
import bcrypt from "bcryptjs";
import { db } from "../src/lib/db";

async function main() {
  const nome = (process.env.ADMIN_NOME ?? "").trim();
  const email = (process.env.ADMIN_EMAIL ?? "").trim().toLowerCase();
  const senha = process.env.ADMIN_SENHA ?? "";

  if (!nome || !email || !senha) {
    console.error("Faltou o nome, o e-mail ou a senha.");
    process.exit(1);
  }

  if (senha.length < 6) {
    console.error("A senha precisa ter pelo menos 6 letras ou números.");
    process.exit(1);
  }

  const passwordHash = await bcrypt.hash(senha, 10);

  const jaExiste = await db.user.findUnique({ where: { email } });

  await db.user.upsert({
    where: { email },
    update: { name: nome, passwordHash, role: "ADMIN", active: true },
    create: { name: nome, email, passwordHash, role: "ADMIN", active: true },
  });

  console.log(
    jaExiste
      ? `Senha de ${email} atualizada. O acesso continua sendo de administrador.`
      : `Administrador criado: ${email}`,
  );

  await db.$disconnect();
}

main().catch(async (erro) => {
  console.error("Não consegui criar o administrador:", erro.message);
  await db.$disconnect();
  process.exit(1);
});
