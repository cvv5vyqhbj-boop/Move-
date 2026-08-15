import { SignJWT, jwtVerify } from "jose";
import type { Role } from "./constants";

// Este arquivo nao usa banco nem bcrypt de proposito: ele tambem roda no
// middleware, que e executado num ambiente mais restrito.

export const SESSION_COOKIE = "move_sessao";

const SESSION_DAYS = 7;

export type SessionUser = {
  id: string;
  name: string;
  email: string;
  role: Role;
};

function secret() {
  const value = process.env.SESSION_SECRET;
  if (!value) throw new Error("Falta definir SESSION_SECRET no arquivo .env");
  return new TextEncoder().encode(value);
}

export async function createSessionToken(user: SessionUser) {
  return new SignJWT({ ...user })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(`${SESSION_DAYS}d`)
    .sign(secret());
}

export async function readSessionToken(
  token: string | undefined,
): Promise<SessionUser | null> {
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, secret());
    return {
      id: payload.id as string,
      name: payload.name as string,
      email: payload.email as string,
      role: payload.role as Role,
    };
  } catch {
    return null;
  }
}

export const SESSION_MAX_AGE = SESSION_DAYS * 24 * 60 * 60;
