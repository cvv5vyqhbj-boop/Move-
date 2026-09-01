// Vocabulario do sistema em um lugar so.
// Todo texto que aparece na tela sai daqui, para a linguagem ficar igual em tudo.

export const AREAS = {
  EDICAO: "Edição de vídeo",
  SOCIAL: "Social media",
  TRAFEGO: "Tráfego pago",
  DESIGN: "Design",
  COPY: "Copywriting",
  FILMAGEM: "Filmagem",
} as const;

export type Area = keyof typeof AREAS;

export const ROLES = {
  ADMIN: "Administrador",
  EDICAO: "Editor de vídeo",
  SOCIAL: "Social media",
  TRAFEGO: "Gestor de tráfego",
  DESIGN: "Designer",
  COPY: "Copywriter",
  FILMAGEM: "Filmmaker",
} as const;

export type Role = keyof typeof ROLES;

/** Area que cada cargo enxerga por padrao nas demandas. Admin ve todas. */
export const ROLE_AREA: Record<Role, Area | null> = {
  ADMIN: null,
  EDICAO: "EDICAO",
  SOCIAL: "SOCIAL",
  TRAFEGO: "TRAFEGO",
  DESIGN: "DESIGN",
  COPY: "COPY",
  FILMAGEM: "FILMAGEM",
};

/** Colunas do kanban, na ordem em que aparecem. */
export const STATUS = {
  BACKLOG: "Ideias",
  A_FAZER: "A fazer",
  EM_ANDAMENTO: "Fazendo",
  REVISAO: "Em revisão",
  CONCLUIDO: "Pronto",
} as const;

export type DemandStatus = keyof typeof STATUS;

export const STATUS_ORDER = Object.keys(STATUS) as DemandStatus[];

export const PRIORITIES = {
  BAIXA: "Baixa",
  MEDIA: "Média",
  ALTA: "Alta",
} as const;

export type Priority = keyof typeof PRIORITIES;

export const CLIENT_STATUS = {
  ATIVO: "Ativo",
  PAUSADO: "Pausado",
  ENCERRADO: "Encerrado",
} as const;

export const CONTRACT_STATUS = {
  ATIVO: "Ativo",
  ENCERRADO: "Encerrado",
} as const;

/** Tipos de compromisso que dá para marcar direto no calendário. */
export const AGENDA_TIPOS = {
  GRAVACAO: "Gravação",
  POST: "Post / publicação",
  REUNIAO: "Reunião",
  ENTREGA: "Entrega ao cliente",
  OUTRO: "Outro",
} as const;

export type AgendaTipo = keyof typeof AGENDA_TIPOS;

export const GOAL_SCOPE = {
  PESSOAL: "Pessoal",
  EQUIPE: "Equipe",
  AGENCIA: "Agência",
} as const;

export const MONTHS = [
  "Janeiro",
  "Fevereiro",
  "Março",
  "Abril",
  "Maio",
  "Junho",
  "Julho",
  "Agosto",
  "Setembro",
  "Outubro",
  "Novembro",
  "Dezembro",
];

// --- Cursos da Move ------------------------------------------------------

/**
 * Trilhas de estudo. O slug e o que liga o quiz ao banco: o quiz pontua slugs,
 * o banco guarda a trilha da pessoa. Mexer aqui muda os dois lados de uma vez.
 */
export const TRILHAS = {
  posicionamento: {
    name: "Posicionamento e marca",
    tagline: "Quem parece igual compete igual.",
    description:
      "Como uma marca ocupa espaço na cabeça de alguém antes de disputar preço.",
  },
  conteudo: {
    name: "Conteúdo e narrativa",
    tagline: "O problema não é aparecer. É ser lembrado.",
    description:
      "Narrativa, roteiro e escrita para que volume de publicação vire percepção acumulada.",
  },
  trafego: {
    name: "Tráfego e aquisição",
    tagline: "Atenção é ativo. Sem direção, vira aluguel caro.",
    description:
      "Campanha, oferta e leitura de número: o que fazer quando o clique chega e a venda não.",
  },
  audiovisual: {
    name: "Audiovisual e direção",
    tagline: "Estética sem direção é decoração.",
    description:
      "Direção, câmera, edição e design a serviço da mensagem, não do enfeite.",
  },
  gestao: {
    name: "Gestão e comercial",
    tagline: "Nada cresce parado.",
    description:
      "Processo, precificação e comercial: a estrutura que sustenta o que a comunicação abre.",
  },
} as const;

export type TrilhaSlug = keyof typeof TRILHAS;

/**
 * Nivel de quem assiste e de cada modulo do curso.
 *
 * O quiz devolve o nivel da pessoa; cada modulo tem o seu. Comparar os dois e
 * o que responde "por onde eu começo neste curso".
 */
export const NIVEIS = {
  INICIANTE: "Base",
  INTERMEDIARIO: "Prática",
  AVANCADO: "Avançado",
} as const;

export type Nivel = keyof typeof NIVEIS;

/** Do mais basico ao mais avancado. Usado para comparar nivel de modulo. */
export const NIVEL_ORDEM: Nivel[] = ["INICIANTE", "INTERMEDIARIO", "AVANCADO"];

/** Capas da vitrine. Sem imagem: a cor e a identidade do curso. */
export const CAPAS = {
  laranja: "from-[#f26522] to-[#7c2d12]",
  grafite: "from-[#334155] to-[#0b1220]",
  vinho: "from-[#9f1239] to-[#3b0a1d]",
  oceano: "from-[#0369a1] to-[#082f49]",
  floresta: "from-[#047857] to-[#052e21]",
  violeta: "from-[#6d28d9] to-[#2e1065]",
} as const;

export type Capa = keyof typeof CAPAS;
