import { revalidatePath } from "next/cache";
import { avisarMudanca } from "./eventos";

/**
 * Chamada depois de toda gravacao no banco.
 *
 * Faz as duas coisas: descarta os dados guardados em cache (para quem salvou ja
 * ver o resultado) e avisa os outros navegadores abertos (para eles atualizarem
 * sozinhos, sem F5).
 *
 * O aviso aos outros nao e esperado de proposito: quem salvou nao deve ficar
 * travado por causa disso.
 */
export function atualizarTudo() {
  revalidatePath("/", "layout");
  void avisarMudanca();
}
