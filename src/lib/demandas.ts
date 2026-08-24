import type { SessionUser } from "./session";

/**
 * O que cada pessoa enxerga em demandas e no kanban.
 *
 * Regra atual da Move: TODO MUNDO ve todas as demandas (para acompanhar o que
 * o resto do time esta fazendo, sem duvidas de "onde estao os outros"). O
 * controle de acesso por cargo continua valendo — mas so entra em Financeiro,
 * Clientes, Contratos, Relatorios e Equipe, que seguem so para o admin.
 *
 * Este helper existe para o resto do codigo continuar chamando "filtroDeVisibilidade"
 * sem precisar saber que hoje ele nao filtra nada.
 */
// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function filtroDeVisibilidade(_user: SessionUser) {
  return {};
}
