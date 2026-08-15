import { ROLE_AREA } from "./constants";
import type { SessionUser } from "./session";

/**
 * O que cada pessoa enxerga em demandas e no kanban.
 *
 * Administrador ve tudo. As demais pessoas veem as demandas da area delas
 * (ex.: o editor ve edicao de video) mais qualquer demanda atribuida a elas.
 */
export function filtroDeVisibilidade(user: SessionUser) {
  const area = ROLE_AREA[user.role];
  if (!area) return {}; // administrador
  return { OR: [{ area }, { assigneeId: user.id }] };
}
