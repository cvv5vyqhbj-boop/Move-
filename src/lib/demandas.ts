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
/** "Ana", "Ana, Bruno e Carla" — o responsavel primeiro, depois quem mais esta. */
export function nomesNoChamado(
  responsavel: { name: string } | null,
  participantes: { name: string }[],
) {
  const nomes = [responsavel, ...participantes]
    .filter((p): p is { name: string } => !!p)
    .map((p) => p.name.split(" ")[0]);
  if (nomes.length === 0) return "Sem responsável";
  if (nomes.length === 1) return responsavel?.name ?? nomes[0];
  return `${nomes.slice(0, -1).join(", ")} e ${nomes.at(-1)}`;
}

/** Demandas em que a pessoa esta: como responsavel ou como participante. */
export function demandasDaPessoa(userId: string) {
  return {
    OR: [{ assigneeId: userId }, { participants: { some: { id: userId } } }],
  };
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function filtroDeVisibilidade(_user: SessionUser) {
  return {};
}
