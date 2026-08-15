"use client";

import { useEffect, useState, useTransition } from "react";
import Link from "next/link";
import { clsx } from "clsx";
import {
  DndContext,
  PointerSensor,
  useDraggable,
  useDroppable,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import { STATUS, STATUS_ORDER, type DemandStatus } from "@/lib/constants";
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
  clienteNome: string;
  responsavelNome: string;
};

function Card({ demanda }: { demanda: CardDemanda }) {
  const { attributes, listeners, setNodeRef, transform, isDragging } =
    useDraggable({ id: demanda.id });

  const atrasada =
    demanda.dueDate &&
    demanda.status !== "CONCLUIDO" &&
    new Date(demanda.dueDate) < new Date(new Date().toDateString());

  return (
    <div
      ref={setNodeRef}
      style={
        transform
          ? { transform: `translate3d(${transform.x}px, ${transform.y}px, 0)` }
          : undefined
      }
      className={clsx(
        "rounded-lg border border-slate-200 bg-white p-3 shadow-sm",
        isDragging && "opacity-60 shadow-md",
      )}
    >
      <div
        {...listeners}
        {...attributes}
        className="cursor-grab active:cursor-grabbing"
      >
        <p className="text-sm font-medium text-slate-900">{demanda.title}</p>
        <p className="mt-1 text-xs text-slate-500">{demanda.clienteNome}</p>

        <div className="mt-2 flex flex-wrap gap-1">
          <EtiquetaArea area={demanda.area} />
          <EtiquetaPrioridade priority={demanda.priority} />
        </div>

        <div className="mt-2 flex items-center justify-between text-xs">
          <span className="text-slate-400">{demanda.responsavelNome}</span>
          {demanda.dueDate && (
            <span className={atrasada ? "text-rose-600" : "text-slate-400"}>
              {date(demanda.dueDate)}
            </span>
          )}
        </div>
      </div>

      <Link
        href={`/demandas/${demanda.id}`}
        className="mt-2 inline-block text-xs text-marca-600 hover:underline"
      >
        Abrir
      </Link>
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

  // Exige um pequeno arrasto antes de comecar, para o clique no link continuar funcionando.
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
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
