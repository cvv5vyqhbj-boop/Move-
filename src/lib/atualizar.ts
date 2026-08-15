import { revalidatePath } from "next/cache";
import { avisarMudanca } from "./eventos";

/**
 * Chamada depois de toda gravacao no banco.
 *
 * Faz as duas coisas: descarta os dados guardados em cache (para quem salvou ja
 * ver o resultado) e avisa os outros navegadores abertos (para eles atualizarem
 * sozinhos, sem F5).
 */
export function atualizarTudo() {
  revalidatePath("/", "layout");
  avisarMudanca();
}
