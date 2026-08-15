import { getUser } from "@/lib/auth";
import { ouvirMudancas } from "@/lib/eventos";

// Conexao que fica aberta enquanto a pessoa usa o sistema. O servidor manda um
// aviso por ela toda vez que alguem grava alguma coisa.
export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const user = await getUser();
  if (!user) return new Response("Precisa estar logado.", { status: 401 });

  const texto = new TextEncoder();
  let encerrar: (() => void) | undefined;

  const fluxo = new ReadableStream({
    start(controle) {
      const enviar = (linha: string) => {
        try {
          controle.enqueue(texto.encode(linha));
        } catch {
          encerrar?.();
        }
      };

      enviar(": conectado\n\n");

      const pararDeOuvir = ouvirMudancas(() => enviar("data: mudou\n\n"));

      // Sinal de vida, para a conexao nao ser derrubada por inatividade.
      const batida = setInterval(() => enviar(": ping\n\n"), 25000);

      encerrar = () => {
        pararDeOuvir();
        clearInterval(batida);
        try {
          controle.close();
        } catch {
          // Ja estava fechado.
        }
      };

      request.signal.addEventListener("abort", () => encerrar?.());
    },
    cancel() {
      encerrar?.();
    },
  });

  return new Response(fluxo, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive",
      // Impede que servidores intermediarios segurem a resposta.
      "X-Accel-Buffering": "no",
    },
  });
}
