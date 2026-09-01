import Link from "next/link";
import { redirect } from "next/navigation";
import { requireModule } from "@/lib/auth";
import { NIVEIS, TRILHAS, type TrilhaSlug } from "@/lib/constants";
import {
  garantirTrilhas,
  listarCursos,
  ondeComecar,
  ordenarParaPessoa,
  trilhaDaPessoa,
  type CursoCompleto,
} from "@/lib/cursos";
import { BarraTrilha } from "@/components/barra-trilha";
import { DestaqueCurso } from "@/components/destaque-curso";
import { LinhaVitrine, type LinhaDaVitrine } from "@/components/vitrine-cursos";

export const metadata = { title: "Cursos — Move" };

export default async function CursosPage({
  searchParams,
}: {
  searchParams: Promise<{ resultado?: string }>;
}) {
  const user = await requireModule("CURSOS");
  const { resultado } = await searchParams;

  await garantirTrilhas();

  // Sem quiz, sem vitrine: a primeira coisa que a pessoa faz aqui e descobrir
  // a direcao dela. Depois disso a tela nunca mais pergunta.
  const trilha = await trilhaDaPessoa(user.id);
  if (!trilha) redirect("/cursos/quiz");

  const cursos = await listarCursos(user.id);

  if (cursos.length === 0) {
    return (
      <Moldura>
        <BarraTrilha trilha={trilha} />
        <div className="px-5 py-24 text-center md:px-8">
          <p className="text-lg font-semibold text-white">
            A vitrine ainda está vazia.
          </p>
          <p className="mx-auto mt-2 max-w-md text-sm text-white/60">
            {user.role === "ADMIN"
              ? "Cadastre o primeiro curso, divida em módulos e cole os links das aulas."
              : "Assim que a Move publicar o primeiro curso, ele aparece aqui."}
          </p>
          {user.role === "ADMIN" && (
            <Link
              href="/cursos/gerenciar/novo"
              className="mt-6 inline-flex rounded-lg bg-white px-5 py-2.5 text-sm font-semibold text-slate-900 transition hover:bg-white/85"
            >
              Criar o primeiro curso
            </Link>
          )}
        </div>
      </Moldura>
    );
  }

  // A fileira da trilha ja sai na ordem que faz sentido para esta pessoa.
  const daTrilha = ordenarParaPessoa(
    cursos.filter((c) => c.trilhas.includes(trilha.slug)),
    trilha.nivel,
  );
  const emAndamento = cursos.filter(
    (c) => c.concluidas > 0 && c.concluidas < c.totalAulas,
  );

  // O destaque do topo e a indicacao do quiz: o primeiro dessa mesma ordem.
  // Sem curso na trilha, cai no destaque da casa.
  const destaque: CursoCompleto =
    daTrilha[0] ?? cursos.find((c) => c.featured) ?? cursos[0];

  const entrada = ondeComecar(destaque, trilha.nivel);
  const naTrilhaDele = destaque.trilhas.includes(trilha.slug);

  const outrasTrilhas = (Object.keys(TRILHAS) as TrilhaSlug[])
    .filter((slug) => slug !== trilha.slug)
    .map((slug) => ({
      titulo: TRILHAS[slug].name,
      subtitulo: TRILHAS[slug].tagline,
      cursos: ordenarParaPessoa(
        cursos.filter((c) => c.trilhas.includes(slug)),
        trilha.nivel,
      ),
    }));

  const linhas: LinhaDaVitrine[] = [
    {
      titulo: "Continuar assistindo",
      subtitulo: "Você começou e não terminou.",
      cursos: emAndamento,
    },
    {
      titulo: `Sua trilha: ${trilha.name}`,
      subtitulo: trilha.description ?? undefined,
      cursos: daTrilha,
      etiqueta: "Comece por aqui",
    },
    {
      titulo: `No seu nível: ${NIVEIS[trilha.nivel]}`,
      subtitulo: "Cursos calibrados para o ponto em que você está.",
      cursos: cursos.filter(
        (c) => c.level === trilha.nivel && !c.trilhas.includes(trilha.slug),
      ),
    },
    ...outrasTrilhas,
    { titulo: "Tudo o que a Move publicou", cursos },
  ];

  return (
    <Moldura>
      <BarraTrilha trilha={trilha} />

      {resultado && (
        <div className="border-b border-[#f26522]/30 bg-[#f26522]/15 px-5 py-3 text-sm text-white md:px-8">
          Quiz respondido. Sua direção é{" "}
          <strong className="font-semibold">{trilha.name}</strong>, com entrada
          no nível{" "}
          <strong className="font-semibold">
            {NIVEIS[trilha.nivel].toLowerCase()}
          </strong>
          . A vitrine abaixo já está montada nessa ordem.
        </div>
      )}

      <DestaqueCurso
        curso={destaque}
        entrada={entrada}
        chamada={naTrilhaDele ? "Indicado pelo seu quiz" : "Destaque da Move"}
      />

      <div className="relative z-10 -mt-14 space-y-8 pb-16">
        {linhas.map((linha, i) => (
          <LinhaVitrine key={`${linha.titulo}-${i}`} linha={linha} />
        ))}
      </div>
    </Moldura>
  );
}

/**
 * A vitrine é a única tela escura do sistema, de propósito: catálogo de vídeo
 * se lê melhor no escuro, e o contraste separa "estudar" de "trabalhar".
 * As cores aqui são fixas, então ela fica igual nos dois temas.
 */
function Moldura({ children }: { children: React.ReactNode }) {
  return (
    <div className="-m-5 overflow-hidden rounded-none bg-[#0a0a0f] md:-m-8">
      {children}
    </div>
  );
}
