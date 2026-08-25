"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { clsx } from "clsx";
import { Plus, Trash2, X } from "lucide-react";
import { AGENDA_TIPOS, type AgendaTipo } from "@/lib/constants";
import { excluirAgenda, salvarAgenda } from "@/app/actions/agenda";
import { Button, Field, Input, Select, Textarea } from "./ui";

const DIAS_DA_SEMANA = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];

/** Compromisso marcado no calendário (o que a pessoa cria clicando no dia). */
export type ItemAgenda = {
  id: string;
  title: string;
  type: string;
  time: string | null;
  notes: string | null;
  clienteNome: string | null;
};

/** O que já vinha de outros lugares: prazos de demanda e vencimentos. */
export type ItemDoSistema = {
  texto: string;
  tipo: "demanda" | "receber" | "pagar";
  link: string;
};

export type DiaDoMes = {
  dia: number;
  agenda: ItemAgenda[];
  sistema: ItemDoSistema[];
};

// Uma cor por tipo de compromisso, igual em todo o calendário.
const CORES_AGENDA: Record<AgendaTipo, string> = {
  GRAVACAO: "bg-violet-100 text-violet-700",
  POST: "bg-sky-100 text-sky-700",
  REUNIAO: "bg-amber-100 text-amber-700",
  ENTREGA: "bg-emerald-100 text-emerald-700",
  OUTRO: "bg-slate-100 text-slate-600",
};

const CORES_SISTEMA = {
  demanda: "bg-marca-50 text-marca-700",
  receber: "bg-emerald-50 text-emerald-700",
  pagar: "bg-rose-50 text-rose-700",
};

function corDoTipo(tipo: string) {
  return CORES_AGENDA[tipo as AgendaTipo] ?? CORES_AGENDA.OUTRO;
}

/** "2026-08-25" — formato que o <input type="date"> entende. */
function isoDoDia(ano: number, mes: number, dia: number) {
  return `${ano}-${String(mes).padStart(2, "0")}-${String(dia).padStart(2, "0")}`;
}

export function CalendarioMes({
  ano,
  mes,
  dias,
  clientes,
  hojeDia,
  ehMesAtual,
}: {
  ano: number;
  mes: number;
  dias: DiaDoMes[];
  clientes: { id: string; name: string }[];
  hojeDia: number;
  ehMesAtual: boolean;
}) {
  // Qual dia está aberto na janelinha. null = nenhuma janela aberta.
  const [diaAberto, setDiaAberto] = useState<number | null>(null);
  const [criando, setCriando] = useState(false);

  // Esc fecha a janela — atalho que todo mundo espera.
  useEffect(() => {
    if (diaAberto === null) return;
    const aoTeclar = (e: KeyboardEvent) => {
      if (e.key === "Escape") setDiaAberto(null);
    };
    document.addEventListener("keydown", aoTeclar);
    return () => document.removeEventListener("keydown", aoTeclar);
  }, [diaAberto]);

  // Trava a rolagem do fundo enquanto a janela está aberta.
  useEffect(() => {
    if (diaAberto === null) return;
    const anterior = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = anterior;
    };
  }, [diaAberto]);

  function abrir(dia: number) {
    setDiaAberto(dia);
    // Se o dia está vazio, já abre o formulário — menos um clique.
    const d = dias.find((x) => x.dia === dia);
    setCriando(!d || (d.agenda.length === 0 && d.sistema.length === 0));
  }

  // Monta as células do mês, começando no domingo.
  const primeiroDia = new Date(ano, mes - 1, 1);
  const diasNoMes = new Date(ano, mes, 0).getDate();
  const vazias = primeiroDia.getDay();
  const celulas: (number | null)[] = [
    ...Array<null>(vazias).fill(null),
    ...Array.from({ length: diasNoMes }, (_, i) => i + 1),
  ];
  while (celulas.length % 7 !== 0) celulas.push(null);

  const dadosDoDia = (dia: number) =>
    dias.find((d) => d.dia === dia) ?? { dia, agenda: [], sistema: [] };

  const aberto = diaAberto !== null ? dadosDoDia(diaAberto) : null;

  return (
    <>
      <div className="grid grid-cols-7 gap-1 text-center text-xs font-medium text-slate-400">
        {DIAS_DA_SEMANA.map((d) => (
          <div key={d} className="pb-2">
            {d}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-1">
        {celulas.map((dia, i) => {
          if (!dia) {
            return <div key={i} className="min-h-24 rounded-lg" />;
          }

          const d = dadosDoDia(dia);
          const ehHoje = ehMesAtual && dia === hojeDia;
          const total = d.agenda.length + d.sistema.length;

          return (
            <button
              key={i}
              type="button"
              onClick={() => abrir(dia)}
              title={
                total === 0
                  ? "Clique para marcar algo neste dia"
                  : `${total} ${total === 1 ? "item" : "itens"} — clique para ver`
              }
              className={clsx(
                "group min-h-24 rounded-lg border p-1.5 text-left transition",
                "hover:border-marca-400 hover:bg-marca-50/40 focus:outline-none focus-visible:ring-2 focus-visible:ring-marca-300",
                ehHoje
                  ? "border-marca-500 bg-marca-50/40"
                  : "border-slate-200 bg-white",
              )}
            >
              <span className="flex items-center justify-between">
                <span
                  className={clsx(
                    "text-xs font-medium",
                    ehHoje ? "text-marca-700" : "text-slate-400",
                  )}
                >
                  {dia}
                </span>
                <Plus
                  size={12}
                  className="text-slate-300 opacity-0 transition group-hover:opacity-100"
                  aria-hidden
                />
              </span>

              <span className="mt-1 block space-y-1">
                {d.agenda.slice(0, 2).map((a) => (
                  <span
                    key={a.id}
                    className={clsx(
                      "block truncate rounded px-1.5 py-1 text-[11px] leading-tight",
                      corDoTipo(a.type),
                    )}
                  >
                    {a.time ? `${a.time} ` : ""}
                    {a.title}
                  </span>
                ))}
                {d.sistema.slice(0, 3 - Math.min(d.agenda.length, 2)).map((s, j) => (
                  <span
                    key={j}
                    className={clsx(
                      "block truncate rounded px-1.5 py-1 text-[11px] leading-tight",
                      CORES_SISTEMA[s.tipo],
                    )}
                  >
                    {s.texto}
                  </span>
                ))}
                {total > 3 && (
                  <span className="block px-1.5 text-[11px] text-slate-400">
                    +{total - 3} mais
                  </span>
                )}
              </span>
            </button>
          );
        })}
      </div>

      {/* --- Janelinha do dia ------------------------------------------- */}
      {aberto && diaAberto !== null && (
        <div
          className="fixed inset-0 z-50 flex items-end justify-center bg-slate-900/50 p-0 sm:items-center sm:p-4"
          onClick={() => setDiaAberto(null)}
        >
          <div
            className="max-h-[85vh] w-full overflow-y-auto rounded-t-2xl border border-slate-200 bg-white p-5 shadow-xl sm:max-w-lg sm:rounded-2xl"
            onClick={(e) => e.stopPropagation()}
            role="dialog"
            aria-modal="true"
          >
            <div className="mb-4 flex items-start justify-between gap-4">
              <div>
                <h3 className="text-lg font-semibold text-slate-900">
                  Dia {diaAberto}
                </h3>
                <p className="text-sm text-slate-500">
                  {aberto.agenda.length + aberto.sistema.length === 0
                    ? "Nada marcado ainda."
                    : "O que está marcado para este dia."}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setDiaAberto(null)}
                aria-label="Fechar"
                className="cursor-pointer rounded-lg p-1 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
              >
                <X size={20} />
              </button>
            </div>

            {/* Compromissos marcados aqui (dá para apagar) */}
            {aberto.agenda.length > 0 && (
              <ul className="mb-4 space-y-2">
                {aberto.agenda.map((a) => (
                  <li
                    key={a.id}
                    className="flex items-start justify-between gap-3 rounded-lg border border-slate-200 p-3"
                  >
                    <div className="min-w-0">
                      <p className="flex flex-wrap items-center gap-2 text-sm font-medium text-slate-900">
                        <span
                          className={clsx(
                            "rounded-full px-2 py-0.5 text-xs font-medium",
                            corDoTipo(a.type),
                          )}
                        >
                          {AGENDA_TIPOS[a.type as AgendaTipo] ?? "Outro"}
                        </span>
                        {a.time && (
                          <span className="text-xs text-slate-500">{a.time}</span>
                        )}
                      </p>
                      <p className="mt-1 text-sm text-slate-800">{a.title}</p>
                      {a.clienteNome && (
                        <p className="text-xs text-slate-500">{a.clienteNome}</p>
                      )}
                      {a.notes && (
                        <p className="mt-1 text-xs whitespace-pre-line text-slate-500">
                          {a.notes}
                        </p>
                      )}
                    </div>
                    <form action={excluirAgenda}>
                      <input type="hidden" name="id" value={a.id} />
                      <button
                        type="submit"
                        title="Apagar"
                        className="cursor-pointer rounded p-1 text-slate-300 transition hover:bg-rose-50 hover:text-rose-600"
                      >
                        <Trash2 size={15} />
                      </button>
                    </form>
                  </li>
                ))}
              </ul>
            )}

            {/* Prazos e vencimentos que vieram de outras telas (só leitura) */}
            {aberto.sistema.length > 0 && (
              <div className="mb-4">
                <p className="mb-2 text-xs font-medium tracking-wide text-slate-400 uppercase">
                  Vindo de outras telas
                </p>
                <ul className="space-y-1">
                  {aberto.sistema.map((s, j) => (
                    <li key={j}>
                      <Link
                        href={s.link}
                        className={clsx(
                          "block truncate rounded px-2 py-1.5 text-sm",
                          CORES_SISTEMA[s.tipo],
                        )}
                      >
                        {s.texto}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Formulário para marcar algo novo */}
            {criando ? (
              <form
                // Salva e fecha a janelinha. Sem isso a pessoa marca a
                // gravacao e a janela fica aberta, parecendo que nao salvou.
                action={async (dados) => {
                  await salvarAgenda(dados);
                  setDiaAberto(null);
                }}
                className="space-y-3 border-t border-slate-100 pt-4"
              >
                <input
                  type="hidden"
                  name="date"
                  value={isoDoDia(ano, mes, diaAberto)}
                />

                <Field label="O que vai acontecer?">
                  <Input
                    name="title"
                    placeholder="Ex.: Gravação com o cliente X"
                    required
                    autoFocus
                  />
                </Field>

                <div className="grid gap-3 sm:grid-cols-2">
                  <Field label="Tipo">
                    <Select
                      name="type"
                      defaultValue="GRAVACAO"
                      options={Object.entries(AGENDA_TIPOS).map(
                        ([value, label]) => ({ value, label }),
                      )}
                    />
                  </Field>

                  <Field label="Hora" hint="Opcional.">
                    <Input name="time" type="time" />
                  </Field>
                </div>

                <Field label="Cliente" hint="Opcional.">
                  <Select
                    name="clientId"
                    defaultValue=""
                    placeholder="Sem cliente (interno)"
                    options={clientes.map((c) => ({
                      value: c.id,
                      label: c.name,
                    }))}
                  />
                </Field>

                <Field label="Observações" hint="Opcional.">
                  <Textarea
                    name="notes"
                    rows={2}
                    placeholder="Local, equipamento, quem vai…"
                  />
                </Field>

                <div className="flex flex-wrap gap-2 pt-1">
                  <Button type="submit" textoPendente="Marcando…">
                    Marcar no dia {diaAberto}
                  </Button>
                  <Button
                    type="button"
                    variant="secundario"
                    onClick={() => setDiaAberto(null)}
                  >
                    Fechar
                  </Button>
                </div>
              </form>
            ) : (
              <div className="border-t border-slate-100 pt-4">
                <Button
                  type="button"
                  variant="secundario"
                  onClick={() => setCriando(true)}
                >
                  + Marcar algo neste dia
                </Button>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}
