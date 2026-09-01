import { requireModule } from "@/lib/auth";
import { db } from "@/lib/db";
import { garantirTrilhas } from "@/lib/cursos";
import { TOTAL_PERGUNTAS } from "@/lib/quiz";
import { QuizTrilha } from "@/components/quiz-trilha";

export const metadata = { title: "Por onde você começa — Move" };

export default async function QuizPage() {
  const user = await requireModule("CURSOS");
  await garantirTrilhas();

  const anterior = await db.quizResult.findUnique({
    where: { userId: user.id },
    select: { id: true },
  });

  return (
    <div className="-m-5 min-h-[calc(100vh-3.5rem)] bg-[#0a0a0f] md:-m-8">
      <header className="border-b border-white/10 px-5 pt-10 pb-8 md:px-8 md:pt-14">
        <div className="mx-auto max-w-2xl">
          <p className="text-[11px] font-semibold tracking-[0.18em] text-[#f26522] uppercase">
            Cursos da Move
          </p>
          <h1 className="mt-2 text-3xl leading-tight font-bold tracking-tight text-white md:text-4xl">
            Assistir tudo não é estudar.
          </h1>
          <p className="mt-3 max-w-xl text-sm leading-relaxed text-white/60">
            {TOTAL_PERGUNTAS} perguntas, dois minutos. Elas separam duas coisas
            que costumam ser tratadas como uma só: a direção que você precisa
            seguir e o ponto de onde você já sai. O resultado define sua trilha e
            o módulo em que você entra em cada curso.
          </p>
        </div>
      </header>

      <QuizTrilha jaRespondeu={Boolean(anterior)} />
    </div>
  );
}
