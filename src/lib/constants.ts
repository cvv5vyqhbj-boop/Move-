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
