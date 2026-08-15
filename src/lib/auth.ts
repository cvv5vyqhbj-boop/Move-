import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { can, type Module } from "./permissions";
import { readSessionToken, SESSION_COOKIE, type SessionUser } from "./session";

/** Quem esta logado agora (ou null). */
export async function getUser(): Promise<SessionUser | null> {
  const token = (await cookies()).get(SESSION_COOKIE)?.value;
  return readSessionToken(token);
}

/** Exige alguem logado. Sem login, volta para a tela de entrada. */
export async function requireUser(): Promise<SessionUser> {
  const user = await getUser();
  if (!user) redirect("/entrar");
  return user;
}

/**
 * Exige login E permissao no modulo. Toda pagina e toda acao que grava dados
 * passa por aqui - e a barreira que vale, mesmo que alguem digite a rota na mao.
 */
export async function requireModule(module: Module): Promise<SessionUser> {
  const user = await requireUser();
  if (!can(user.role, module)) redirect("/sem-acesso");
  return user;
}
