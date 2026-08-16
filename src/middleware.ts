import { NextResponse, type NextRequest } from "next/server";
import { can, moduleForPath } from "@/lib/permissions";
import { readSessionToken, SESSION_COOKIE } from "@/lib/session";

/**
 * Primeira barreira: bloqueia a rota antes mesmo da pagina carregar.
 * As paginas e acoes checam de novo com requireModule().
 */
export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const user = await readSessionToken(request.cookies.get(SESSION_COOKIE)?.value);

  if (pathname === "/entrar") {
    if (user) return NextResponse.redirect(new URL("/", request.url));
    return NextResponse.next();
  }

  if (!user) {
    return NextResponse.redirect(new URL("/entrar", request.url));
  }

  const module = moduleForPath(pathname);
  if (module && !can(user.role, module)) {
    return NextResponse.redirect(new URL("/sem-acesso", request.url));
  }

  return NextResponse.next();
}

export const config = {
  // Roda em tudo, menos arquivos estaticos, a API, a pagina de aviso e a tela
  // de primeiro acesso (que se protege sozinha: so funciona com o banco vazio).
  matcher: [
    "/((?!api|_next/static|_next/image|favicon.ico|sem-acesso|primeiro-acesso).*)",
  ],
};
