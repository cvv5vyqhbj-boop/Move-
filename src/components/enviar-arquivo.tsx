"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@supabase/supabase-js";
import { Paperclip } from "lucide-react";
import {
  prepararEnvioDeArquivo,
  registrarArquivo,
} from "@/app/actions/conversa";

const PASTA = "anexos";
const LIMITE_MB = 50;

/**
 * Botao "Anexar arquivo" da demanda. Aceita varios de uma vez.
 *
 * O arquivo vai direto do navegador para o Supabase (ver lib/arquivos.ts);
 * o servidor so autoriza antes e registra depois.
 */
export function EnviarArquivo({ demandId }: { demandId: string }) {
  const router = useRouter();
  const campo = useRef<HTMLInputElement>(null);
  const [enviando, setEnviando] = useState<string | null>(null);
  const [erro, setErro] = useState<string | null>(null);

  async function enviar(arquivos: FileList | null) {
    if (!arquivos || arquivos.length === 0) return;
    setErro(null);

    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const chave = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    if (!url || !chave) {
      setErro("O envio de arquivos ainda não foi configurado no sistema.");
      return;
    }
    const supabase = createClient(url, chave, {
      auth: { persistSession: false },
    });

    try {
      for (const arquivo of Array.from(arquivos)) {
        if (arquivo.size > LIMITE_MB * 1024 * 1024) {
          setErro(`"${arquivo.name}" passa de ${LIMITE_MB} MB.`);
          continue;
        }
        setEnviando(arquivo.name);

        const autorizacao = await prepararEnvioDeArquivo(
          demandId,
          arquivo.name,
          arquivo.size,
        );
        if ("erro" in autorizacao) {
          setErro(autorizacao.erro);
          continue;
        }

        const { error } = await supabase.storage
          .from(PASTA)
          .uploadToSignedUrl(autorizacao.path, autorizacao.token, arquivo, {
            contentType: arquivo.type || undefined,
          });
        if (error) {
          setErro(`Não deu para enviar "${arquivo.name}". Tente de novo.`);
          continue;
        }

        await registrarArquivo(
          demandId,
          autorizacao.path,
          arquivo.name,
          arquivo.size,
          arquivo.type,
        );
      }
    } finally {
      setEnviando(null);
      if (campo.current) campo.current.value = "";
      router.refresh();
    }
  }

  return (
    <div className="mt-3">
      <label
        className={`inline-flex cursor-pointer items-center gap-2 rounded-lg border border-dashed border-slate-300 px-4 py-2.5 text-sm font-medium text-slate-700 hover:border-marca-400 hover:bg-marca-50/40 ${
          enviando ? "pointer-events-none opacity-60" : ""
        }`}
      >
        {enviando ? (
          <span
            aria-hidden
            className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-current border-r-transparent"
          />
        ) : (
          <Paperclip size={15} />
        )}
        <span className="max-w-60 truncate">
          {enviando ? `Enviando ${enviando}…` : "Anexar arquivo (PDF, imagem…)"}
        </span>
        <input
          ref={campo}
          type="file"
          multiple
          className="sr-only"
          disabled={!!enviando}
          onChange={(e) => enviar(e.target.files)}
        />
      </label>
      <p className="mt-1.5 text-xs text-slate-500">Até {LIMITE_MB} MB por arquivo.</p>
      {erro && <p className="mt-1 text-sm text-rose-600">{erro}</p>}
    </div>
  );
}
