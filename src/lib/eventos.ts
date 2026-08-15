/**
 * Aviso de "alguem mudou alguma coisa".
 *
 * Quando qualquer pessoa salva algo, o servidor avisa todos os navegadores que
 * estao com o sistema aberto, e eles recarregam os dados na hora. E por isso que
 * uma demanda movida no kanban aparece na tela dos outros sem precisar dar F5.
 */

type Ouvinte = () => void;

// Guardado no globalThis para sobreviver as recargas do modo de desenvolvimento.
const global = globalThis as unknown as { ouvintesMove?: Set<Ouvinte> };
const ouvintes = (global.ouvintesMove ??= new Set<Ouvinte>());

/** Registra um navegador para receber avisos. Devolve como cancelar. */
export function ouvirMudancas(ouvinte: Ouvinte) {
  ouvintes.add(ouvinte);
  return () => ouvintes.delete(ouvinte);
}

/** Avisa todos os navegadores conectados que os dados mudaram. */
export function avisarMudanca() {
  for (const ouvinte of ouvintes) {
    try {
      ouvinte();
    } catch {
      // Um navegador que caiu nao pode atrapalhar os outros.
    }
  }
}
