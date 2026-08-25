"use client";

import { useEffect, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { clsx } from "clsx";
import { GripVertical, MessageSquare } from "lucide-react";
import {
  DndContext,
  PointerSensor,
  TouchSensor,
  useDraggable,
  useDroppable,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import { STATUS, STATUS_ORDER, type Area, type DemandStatus } from "@/lib/constants";
import { moverDemanda } from "@/app/actions/demandas";
import { EtiquetaArea, EtiquetaPrioridade } from "./etiquetas";
import { date } from "@/lib/format";

export type CardDemanda = {
  id: string;
  title: string;
  status: string;
  area: string;
  priority: string;
  dueDate: Date | null;
  internalDueDate: Date | null;
  clienteNome: string;
  responsavelNome: string;
  comentarios: number;
  /** True quando a demanda esta atribuida a quem esta vendo o quadro. */
  minha: boolean;
};

// A cor da faixa e do fundo do card espelha a etiqueta da area.
const AREA_ACCENT: Record<Area, { bar: string; ring: string }> = {
  EDICAO: { bar: "bg-violet-500", ring: "hover:border-violet-300" },
  SOCIAL: { bar: "bg-sky-500", ring: "hover:border-sky-300" },
  TRAFEGO: { bar: "bg-marca-500", ring: "hover:border-marca-300" },
  DESIGN: { bar: "bg-amber-500", ring: "hover:border-amber-300" },
  COPY: { bar: "bg-emerald-500", ring: "hover:border-emerald-300" },
  FILMAGEM: { bar: "bg-slate-500", ring: "hover:border-slate-400" },
};

function Card({ demanda }: { demanda: CardDemanda }) {
  const router = useRouter();
  const { attributes, listeners, setNodeRef, transform, isDragging } =
    useDraggable({ id: demanda.id });

  const hoje = new Date(new Date().toDateString());
  const atrasadaCliente =
    demanda.dueDate &&
    demanda.status !== "CONCLUIDO" &&
    new Date(demanda.dueDate) < hoje;
  const atrasadaInterna =
    demanda.internalDueDate &&
    demanda.status !== "CONCLUIDO" &&
    new Date(demanda.internalDueDate) < hoje;

  const accent =
    AREA_ACCENT[demanda.area as Area] ?? AREA_ACCENT.FILMAGEM;

  return (
    <div
      ref={setNodeRef}
      style={
        transform
          ? { transform: `translate3d(${transform.x}px, ${transform.y}px, 0)` }
          : undefined
      }
      className={clsx(
        // "select-none" evita que apertar e segurar no iPad/Safari
        // dispare a selecao de texto no lugar do arraste.
        "group relative select-none overflow-hidden rounded-xl border shadow-sm transition",
        // Card "meu": borda laranja + fundo levemente tingido para saltar aos olhos.
        demanda.minha
          ? "border-marca-400 bg-marca-50/40 ring-1 ring-marca-200"
          : "border-slate-200 bg-white",
        !demanda.minha && accent.ring,
        isDragging
          ? "opacity-60 shadow-lg"
          : "cursor-pointer hover:-translate-y-0.5 hover:shadow-md",
      )}
      role="button"
      tabIndex={0}
      onClick={() => router.push(`/demandas/${demanda.id}`)}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          router.push(`/demandas/${demanda.id}`);
        }
      }}
    >
      {/* Faixa lateral colorida por area. */}
      <span
        className={clsx("absolute inset-y-0 left-0 w-1", accent.bar)}
        aria-hidden
      />

      <div className="flex items-start gap-2 py-3 pr-2 pl-4">
        <div className="min-w-0 flex-1">
          <p className="text-sm font-medium text-slate-900">{demanda.title}</p>
          <p className="mt-0.5 truncate text-xs text-slate-500">
            {demanda.clienteNome}
          </p>

          <div className="mt-2 flex flex-wrap gap-1">
            <EtiquetaArea area={demanda.area} />
            <EtiquetaPrioridade priority={demanda.priority} />
          </div>

          <div className="mt-2 flex items-center justify-between text-xs text-slate-500">
            <span className="flex items-center gap-1.5">
              <span className="truncate">{demanda.responsavelNome}</span>
              {demanda.comentarios > 0 && (
                <span
                  className="flex items-center gap-0.5 text-slate-400"
                  title="Comentários"
                >
                  <MessageSquare size={11} />
                  {demanda.comentarios}
                </span>
              )}
            </span>
            {(demanda.dueDate || demanda.internalDueDate) && (
              <span className="flex flex-col items-end gap-0.5">
                {demanda.internalDueDate && (
                  <span
                    className={clsx(
                      "text-[11px]",
                      atrasadaInterna ? "text-rose-600" : "text-slate-400",
                    )}
                    title="Prazo interno"
                  >
                    interno {date(demanda.internalDueDate)}
                  </span>
                )}
                {demanda.dueDate && (
                  <span
                    className={clsx(
                      atrasadaCliente ? "text-rose-600" : "text-slate-500",
                    )}
                    title="Prazo com o cliente"
                  >
                    cliente {date(demanda.dueDate)}
                  </span>
                )}
              </span>
            )}
          </div>
        </div>

        {/*
         * Alca de arrastar: separada do card para nao competir com o clique.
         *
         * - No computador (hover:): a alca fica invisivel e aparece so ao passar
         *   o mouse — visual mais limpo.
         * - No celular/iPad (sem hover): fica sempre visivel, senao a pessoa
         *   nao teria como saber onde arrastar.
         * - "touch-action-none" avisa ao navegador para NAO tentar rolar nem
         *   selecionar texto quando o dedo toca aqui — ele delega ao dnd-kit.
         */}
        <button
          type="button"
          {...listeners}
          {...attributes}
          aria-label="Arrastar"
          onClick={(e) => e.stopPropagation()}
          className="mt-0.5 shrink-0 touch-none cursor-grab rounded p-1 text-slate-400 transition hover:bg-slate-100 hover:text-slate-500 active:cursor-grabbing md:opacity-0 md:group-hover:opacity-100"
        >
          <GripVertical size={16} />
        </button>
      </div>
    </div>
  );
}

function Coluna({
  status,
  demandas,
}: {
  status: DemandStatus;
  demandas: CardDemanda[];
}) {
  const { setNodeRef, isOver } = useDroppable({ id: status });

  return (
    <div
      ref={setNodeRef}
      className={clsx(
        "flex w-72 shrink-0 flex-col rounded-xl border p-3 transition",
        isOver
          ? "border-marca-500 bg-marca-50"
          : "border-slate-200 bg-slate-100/60",
      )}
    >
      <div className="mb-3 flex items-center justify-between">
        <p className="text-sm font-semibold text-slate-700">{STATUS[status]}</p>
        <span className="rounded-full bg-white px-2 py-0.5 text-xs text-slate-500">
          {demandas.length}
        </span>
      </div>

      <div className="flex flex-1 flex-col gap-2">
        {demandas.length === 0 && (
          <p className="rounded-lg border border-dashed border-slate-300 px-3 py-6 text-center text-xs text-slate-400">
            Arraste um card para cá
          </p>
        )}
        {demandas.map((d) => (
          <Card key={d.id} demanda={d} />
        ))}
      </div>
    </div>
  );
}

export function QuadroKanban({ inicial }: { inicial: CardDemanda[] }) {
  const [demandas, setDemandas] = useState(inicial);
  const [, iniciar] = useTransition();

  // Quando alguem da equipe mexe no quadro, os dados novos chegam por aqui.
  useEffect(() => setDemandas(inicial), [inicial]);

  // No computador (mouse): exige um pequeno arrasto para o clique no card
  // continuar funcionando.
  // No celular/iPad (toque): exige um "toque parado" curto para nao brigar
  // com a rolagem da pagina nem selecionar texto ao encostar.
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(TouchSensor, {
      activationConstraint: { delay: 150, tolerance: 5 },
    }),
  );

  function aoSoltar(evento: DragEndEvent) {
    const novoStatus = evento.over?.id as DemandStatus | undefined;
    const id = String(evento.active.id);
    if (!novoStatus) return;

    const atual = demandas.find((d) => d.id === id);
    if (!atual || atual.status === novoStatus) return;

    // Move na tela na hora e grava no banco em seguida.
    setDemandas((lista) =>
      lista.map((d) => (d.id === id ? { ...d, status: novoStatus } : d)),
    );
    iniciar(() => {
      moverDemanda(id, novoStatus);
    });
  }

  return (
    <DndContext sensors={sensors} onDragEnd={aoSoltar}>
      <div className="flex gap-4 overflow-x-auto pb-4">
        {STATUS_ORDER.map((status) => (
          <Coluna
            key={status}
            status={status}
            demandas={demandas.filter((d) => d.status === status)}
          />
        ))}
      </div>
    </DndContext>
  );
}
