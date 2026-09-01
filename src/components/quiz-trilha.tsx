"use client";

import { useState } from "react";
import { useFormStatus } from "react-dom";
import { ArrowLeft, Check } from "lucide-react";
import { responderQuiz } from "@/app/actions/cursos";
import { PERGUNTAS } from "@/lib/quiz";

/**
 * O quiz de entrada, uma pergunta por vez.
 *
 * Escolher ja avanca: sem botao "próxima", sem formulario gigante rolando na
 * tela. As respostas ficam guardadas aqui e so vao para o servidor no fim, de
 * uma vez, por um formulario comum - se o JavaScript falhar no meio, ninguem
 * perde nada pela metade.
 */
export function QuizTrilha({ jaRespondeu }: { jaRespondeu: boolean }) {
  const [respostas, setRespostas] = useState<Record<string, string>>({});
  const [passo, setPasso] = useState(0);

  const pergunta = PERGUNTAS[passo];
  const acabou = passo >= PERGUNTAS.length;
  const percent = Math.round((passo / PERGUNTAS.length) * 100);

  function responder(opcaoId: string) {
    setRespostas((atual) => ({ ...atual, [pergunta.id]: opcaoId }));
    setPasso((p) => p + 1);
  }

  return (
    <div className="mx-auto max-w-2xl px-5 py-10 md:px-8 md:py-16">
      <div className="mb-8">
        <div className="h-1 w-full overflow-hidden rounded-full bg-white/10">
          <div
            className="h-1 rounded-full bg-[#f26522] transition-all duration-300"
            style={{ width: `${Math.max(percent, 4)}%` }}
          />
        </div>
        <p className="mt-2 text-xs text-white/40">
          {acabou
            ? "Fim das perguntas"
            : `Pergunta ${passo + 1} de ${PERGUNTAS.length}`}
        </p>
      </div>

      {!acabou && (
        <div>
          <h2 className="text-2xl leading-tight font-semibold tracking-tight text-white md:text-3xl">
            {pergunta.pergunta}
          </h2>
          {pergunta.ajuda && (
            <p className="mt-2 text-sm text-white/50">{pergunta.ajuda}</p>
          )}

          <div className="mt-6 space-y-2">
            {pergunta.opcoes.map((opcao) => (
              <button
                key={opcao.id}
                type="button"
                onClick={() => responder(opcao.id)}
                className="flex w-full cursor-pointer items-center justify-between gap-3 rounded-xl border border-white/10 bg-white/[0.04] px-4 py-3.5 text-left text-sm text-white/90 transition hover:border-[#f26522]/60 hover:bg-white/[0.08]"
              >
                <span>{opcao.texto}</span>
                <span className="shrink-0 text-white/25">→</span>
              </button>
            ))}
          </div>

          {passo > 0 && (
            <button
              type="button"
              onClick={() => setPasso((p) => p - 1)}
              className="mt-6 inline-flex cursor-pointer items-center gap-2 text-xs text-white/45 transition hover:text-white"
            >
              <ArrowLeft size={14} />
              Voltar uma pergunta
            </button>
          )}
        </div>
      )}

      {acabou && (
        <form action={responderQuiz}>
          {Object.entries(respostas).map(([perguntaId, opcaoId]) => (
            <input
              key={perguntaId}
              type="hidden"
              name={`p_${perguntaId}`}
              value={opcaoId}
            />
          ))}

          <h2 className="text-2xl leading-tight font-semibold tracking-tight text-white md:text-3xl">
            Pronto. Agora a vitrine para de ser genérica.
          </h2>
          <p className="mt-3 text-sm leading-relaxed text-white/60">
            Com as suas respostas, o sistema define a trilha que faz sentido
            agora e o ponto exato em que você entra em cada curso. O que estiver
            abaixo do seu repertório continua acessível, só deixa de ser o
            caminho principal.
          </p>

          <div className="mt-7 flex flex-wrap items-center gap-3">
            <Enviar />
            <button
              type="button"
              onClick={() => setPasso(PERGUNTAS.length - 1)}
              className="cursor-pointer rounded-lg px-4 py-2.5 text-sm text-white/50 transition hover:text-white"
            >
              Revisar a última resposta
            </button>
          </div>

          {jaRespondeu && (
            <p className="mt-6 text-xs text-white/35">
              Isto substitui o resultado anterior. Seu progresso nas aulas
              continua intacto.
            </p>
          )}
        </form>
      )}
    </div>
  );
}

function Enviar() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="inline-flex cursor-pointer items-center gap-2 rounded-lg bg-white px-5 py-2.5 text-sm font-semibold text-slate-900 transition hover:bg-white/85 disabled:opacity-60"
    >
      <Check size={16} />
      {pending ? "Montando sua vitrine…" : "Ver minha trilha"}
    </button>
  );
}
