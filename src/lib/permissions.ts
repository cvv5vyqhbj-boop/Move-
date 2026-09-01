import type { Role } from "./constants";

/**
 * Quem ve o que.
 *
 * Regra da Move: so o Administrador ve dinheiro, contratos, relatorios e a
 * equipe. Todo mundo do time ve as proprias demandas, o kanban, as metas do mes
 * e o calendario de prazos.
 */

export const MODULES = {
  PAINEL: { label: "Painel", path: "/" },
  DEMANDAS: { label: "Demandas", path: "/demandas" },
  KANBAN: { label: "Kanban", path: "/kanban" },
  METAS: { label: "Metas do mês", path: "/metas" },
  CURSOS: { label: "Cursos", path: "/cursos" },
  CURSOS_ADMIN: { label: "Gerenciar cursos", path: "/cursos/gerenciar" },
  CALENDARIO: { label: "Calendário", path: "/calendario" },
  CLIENTES: { label: "Clientes", path: "/clientes" },
  CONTRATOS: { label: "Contratos", path: "/contratos" },
  FINANCEIRO: { label: "Financeiro", path: "/financeiro" },
  RELATORIOS: { label: "Relatórios", path: "/relatorios" },
  EQUIPE: { label: "Equipe", path: "/equipe" },
} as const;

export type Module = keyof typeof MODULES;

/** Modulos que qualquer pessoa da equipe acessa. */
const DA_EQUIPE: Module[] = [
  "PAINEL",
  "DEMANDAS",
  "KANBAN",
  "METAS",
  "CALENDARIO",
  "CURSOS",
];

/** Modulos restritos a quem administra a agencia. */
const SO_ADMIN: Module[] = [
  "CURSOS_ADMIN",
  "CLIENTES",
  "CONTRATOS",
  "FINANCEIRO",
  "RELATORIOS",
  "EQUIPE",
];

export const ROLE_MODULES: Record<Role, Module[]> = {
  ADMIN: [...DA_EQUIPE, ...SO_ADMIN],
  EDICAO: DA_EQUIPE,
  SOCIAL: DA_EQUIPE,
  TRAFEGO: DA_EQUIPE,
  DESIGN: DA_EQUIPE,
  COPY: DA_EQUIPE,
  FILMAGEM: DA_EQUIPE,
};

/** Pode acessar o modulo? Usado no menu, no middleware e nas acoes. */
export function can(role: Role, module: Module): boolean {
  return ROLE_MODULES[role]?.includes(module) ?? false;
}

/**
 * Descobre a qual modulo uma rota pertence (a mais especifica vence).
 *
 * E por isso que "/cursos/gerenciar" cai em CURSOS_ADMIN e nao em CURSOS:
 * o caminho mais longo que casa e o que manda.
 */
export function moduleForPath(pathname: string): Module | null {
  let found: Module | null = null;
  let longest = -1;
  for (const [key, { path }] of Object.entries(MODULES)) {
    const matches = path === "/" ? pathname === "/" : pathname.startsWith(path);
    if (matches && path.length > longest) {
      longest = path.length;
      found = key as Module;
    }
  }
  return found;
}
