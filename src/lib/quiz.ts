import { NIVEL_ORDEM, TRILHAS, type Nivel, type TrilhaSlug } from "./constants";

/**
 * O quiz de entrada dos cursos.
 *
 * Ele responde duas perguntas diferentes, e por isso tem dois tipos de questao:
 *
 *   1. DIRECAO - para onde essa pessoa precisa ir. Cada opcao soma pontos em
 *      uma ou mais trilhas; a trilha com mais pontos vence.
 *   2. PONTO DE PARTIDA - de onde ela sai. Cada opcao vale de 0 a 2 pontos de
 *      repertorio; a soma vira o nivel, que decide por qual modulo do curso a
 *      pessoa entra (o resto fica marcado como revisao, nao como obrigacao).
 *
 * As perguntas ficam aqui, no codigo, de proposito: sao poucas, mudam pouco e
 * assim ninguem precisa mexer no banco para ajustar uma palavra.
 */

export type OpcaoQuiz = {
  id: string;
  texto: string;
  /** Pontos por trilha. So nas perguntas de direcao. */
  trilhas?: Partial<Record<TrilhaSlug, number>>;
  /** Pontos de repertorio, de 0 a 2. So nas perguntas de ponto de partida. */
  nivel?: number;
};

export type PerguntaQuiz = {
  id: string;
  pergunta: string;
  ajuda?: string;
  opcoes: OpcaoQuiz[];
};

export const PERGUNTAS: PerguntaQuiz[] = [
  {
    id: "encontro",
    pergunta: "Quando alguém encontra sua marca hoje, o que acontece?",
    ajuda: "Responda pelo que acontece de verdade, não pelo que deveria.",
    opcoes: [
      {
        id: "a",
        texto: "Entende o que eu faço. Não entende por que eu.",
        trilhas: { posicionamento: 3 },
      },
      {
        id: "b",
        texto: "Vê conteúdo, mas o conteúdo não vira conversa.",
        trilhas: { conteudo: 3 },
      },
      {
        id: "c",
        texto: "Chega por anúncio, e cada clique custa mais caro que o anterior.",
        trilhas: { trafego: 3 },
      },
      {
        id: "d",
        texto: "Vê um material bem feito que poderia ser de qualquer um.",
        trilhas: { audiovisual: 3 },
      },
      {
        id: "e",
        texto: "Quase não encontra. A operação come o tempo da comunicação.",
        trilhas: { gestao: 3 },
      },
    ],
  },
  {
    id: "noventa-dias",
    pergunta: "Se desse para resolver uma coisa só nos próximos 90 dias, qual seria?",
    opcoes: [
      {
        id: "a",
        texto: "Ser lembrado por algo específico, não por estar sempre presente.",
        trilhas: { posicionamento: 3, conteudo: 1 },
      },
      {
        id: "b",
        texto: "Ter o que dizer toda semana sem repetir o mesmo assunto.",
        trilhas: { conteudo: 3, posicionamento: 1 },
      },
      {
        id: "c",
        texto: "Vender com alguma previsibilidade, não por sorte do mês.",
        trilhas: { trafego: 3, gestao: 1 },
      },
      {
        id: "d",
        texto: "Ter uma imagem à altura do preço que eu cobro.",
        trilhas: { audiovisual: 3, posicionamento: 1 },
      },
      {
        id: "e",
        texto: "Sair do improviso: processo, prazo e preço no lugar.",
        trilhas: { gestao: 3 },
      },
    ],
  },
  {
    id: "trava",
    pergunta: "Onde o trabalho trava com mais frequência?",
    opcoes: [
      {
        id: "a",
        texto: "Na direção. Decidimos rápido e sem critério.",
        trilhas: { posicionamento: 3 },
      },
      {
        id: "b",
        texto: "No texto. A ideia é boa, a escrita não sustenta.",
        trilhas: { conteudo: 3 },
      },
      {
        id: "c",
        texto: "No número. A campanha roda, o resultado não fecha.",
        trilhas: { trafego: 3 },
      },
      {
        id: "d",
        texto: "Na produção. Gravar, editar, aprovar, atrasar.",
        trilhas: { audiovisual: 3 },
      },
      {
        id: "e",
        texto: "No combinado. Escopo aberto, prazo elástico, margem apertada.",
        trilhas: { gestao: 3 },
      },
    ],
  },
  {
    id: "interesse",
    pergunta: "Que tipo de aula você assistiria até o fim, sem acelerar?",
    opcoes: [
      {
        id: "a",
        texto: "Um raciocínio sobre percepção, mercado e diferenciação.",
        trilhas: { posicionamento: 2 },
      },
      {
        id: "b",
        texto: "Uma análise de narrativa, roteiro e escrita.",
        trilhas: { conteudo: 2 },
      },
      {
        id: "c",
        texto: "Uma campanha aberta do começo ao fim, com os números na tela.",
        trilhas: { trafego: 2 },
      },
      {
        id: "d",
        texto: "Direção de câmera, luz e montagem.",
        trilhas: { audiovisual: 2 },
      },
      {
        id: "e",
        texto: "Como uma operação criativa se organiza e cobra.",
        trilhas: { gestao: 2 },
      },
    ],
  },
  {
    id: "um-ano",
    pergunta: "Daqui a um ano, o que você quer que o mercado diga a seu respeito?",
    opcoes: [
      { id: "a", texto: "“Tem posição.”", trilhas: { posicionamento: 2 } },
      { id: "b", texto: "“Tem o que dizer.”", trilhas: { conteudo: 2 } },
      { id: "c", texto: "“Vende bem.”", trilhas: { trafego: 2 } },
      { id: "d", texto: "“Tem estética própria.”", trilhas: { audiovisual: 2 } },
      { id: "e", texto: "“É bem tocado por dentro.”", trilhas: { gestao: 2 } },
    ],
  },
  {
    id: "tempo",
    pergunta: "Há quanto tempo você faz isso na prática?",
    ajuda: "Daqui em diante, as respostas definem por onde você entra no curso.",
    opcoes: [
      { id: "a", texto: "Estou começando agora.", nivel: 0 },
      { id: "b", texto: "Entre um e três anos.", nivel: 1 },
      { id: "c", texto: "Mais de três anos.", nivel: 2 },
    ],
  },
  {
    id: "decisao",
    pergunta: "Como você decide o que publicar ou produzir na semana?",
    opcoes: [
      { id: "a", texto: "No que aparecer na hora.", nivel: 0 },
      { id: "b", texto: "Tenho um calendário e sigo.", nivel: 1 },
      {
        id: "c",
        texto: "Parto de uma estratégia escrita, com objetivo por peça.",
        nivel: 2,
      },
    ],
  },
  {
    id: "medicao",
    pergunta: "E o que você faz com o que já testou?",
    opcoes: [
      { id: "a", texto: "Ainda testei pouco para tirar conclusão.", nivel: 0 },
      { id: "b", texto: "Olho os números de vez em quando.", nivel: 1 },
      {
        id: "c",
        texto: "Meço, comparo e corto o que não sustenta o resultado.",
        nivel: 2,
      },
    ],
  },
];

export type ResultadoQuiz = {
  trilha: TrilhaSlug;
  nivel: Nivel;
  /** Pontuacao de cada trilha, para mostrar a segunda opcao a quem quiser. */
  pontos: Record<TrilhaSlug, number>;
};

const TRILHA_SLUGS = Object.keys(TRILHAS) as TrilhaSlug[];

/**
 * Transforma as respostas em trilha e nivel.
 *
 * Respostas faltando nao quebram nada: quem nao respondeu simplesmente nao
 * pontua. Empate entre trilhas fica com a primeira da lista, que e a de
 * posicionamento - a base de todas as outras.
 */
export function calcularResultado(
  respostas: Record<string, string>,
): ResultadoQuiz {
  const pontos = Object.fromEntries(
    TRILHA_SLUGS.map((s) => [s, 0]),
  ) as Record<TrilhaSlug, number>;
  let repertorio = 0;

  for (const pergunta of PERGUNTAS) {
    const escolhida = pergunta.opcoes.find(
      (o) => o.id === respostas[pergunta.id],
    );
    if (!escolhida) continue;

    for (const [slug, peso] of Object.entries(escolhida.trilhas ?? {})) {
      pontos[slug as TrilhaSlug] += peso ?? 0;
    }
    repertorio += escolhida.nivel ?? 0;
  }

  const trilha = TRILHA_SLUGS.reduce((melhor, atual) =>
    pontos[atual] > pontos[melhor] ? atual : melhor,
  );

  // 0 a 6 pontos de repertorio: ate 2 comeca do zero, 5 ou mais pula a base.
  const nivel: Nivel =
    repertorio >= 5
      ? "AVANCADO"
      : repertorio >= 3
        ? "INTERMEDIARIO"
        : "INICIANTE";

  return { trilha, nivel, pontos };
}

/** Quantas perguntas de direcao existem (usado so no texto da tela). */
export const TOTAL_PERGUNTAS = PERGUNTAS.length;

/** Posicao de um nivel na escala. Maior = mais avancado. */
export function ordemDoNivel(nivel: string): number {
  const i = NIVEL_ORDEM.indexOf(nivel as Nivel);
  return i === -1 ? 0 : i;
}
