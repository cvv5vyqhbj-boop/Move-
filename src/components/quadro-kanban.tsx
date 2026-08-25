"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { clsx } from "clsx";
import { GripVertical, MessageSquare } from "lucide-react";
import {
  DndContext,
  DragOverlay,
  MouseSensor,
  TouchSensor,
  closestCorners,
  useDraggable,
  useDroppable,
  useSensor,
  useSensors,
  type DragEndEvent,
  type DragStartEvent,
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

/**
 * O desenho do card, sem nada de arrastar.
 *
 * Fica separado porque ele e usado em dois lugares: no lugar dele dentro da
 * coluna, e no "card flutuante" que segue o dedo durante o arraste.
 */
function CartaoVisual({
  demanda,
  alca,
  flutuando,
}: {
  demanda: CardDemanda;
  /** A alcinha de arrastar. O card flutuante nao precisa dela. */
  alca?: React.ReactNode;
  flutuando?: boolean;
}) {
  const hoje = new Date(new Date().toDateString());
  const atrasadaCliente =
    demanda.dueDate &&
    demanda.status !== "CONCLUIDO" &&
    new Date(demanda.dueDate) < hoje;
  const atrasadaInterna =
    demanda.internalDueDate &&
    demanda.status !== "CONCLUIDO" &&
    new Date(demanda.internalDueDate) < hoje;

  const accent = AREA_ACCENT[demanda.area as Area] ?? AREA_ACCENT.FILMAGEM;

  return (
    <div
      className={clsx(
        // "select-none" evita que apertar e segurar no iPad/Safari
        // dispare a selecao de texto no lugar do arraste.
        "group relative select-none overflow-hidden rounded-xl border",
        demanda.minha
          ? "border-marca-400 bg-marca-50/40 ring-1 ring-marca-200"
          : "border-slate-200 bg-white",
        flutuando
          ? "rotate-1 scale-[1.03] cursor-grabbing shadow-2xl"
          : clsx(
              "shadow-sm transition",
              !demanda.minha && accent.ring,
              "hover:-translate-y-0.5 hover:shadow-md",
            ),
      )}
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

        {alca}
      </div>
    </div>
  );
}

function Card({ demanda }: { demanda: CardDemanda }) {
  const router = useRouter();
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
    id: demanda.id,
  });

  /*
   * O CARD INTEIRO arrasta — nao so uma alcinha.
   *
   * A alcinha de 44px parecia suficiente, mas no iPad ela vira uma armadilha:
   * a tela util tem ~840px e cada coluna 288px, entao a partir da terceira
   * coluna a alcinha do card cai FORA da tela e o dedo simplesmente nao
   * alcanca. Era essa a causa do "so funciona de vez em quando".
   *
   * Com o card inteiro arrastavel nao existe alvo pequeno para acertar:
   *   - toque parado / clique  -> abre a demanda (a ativacao e por distancia)
   *   - arrastar de lado       -> move de coluna
   *
   * "touch-pan-y" e o detalhe que faz os dois conviverem: o Safari continua
   * dono do movimento vertical (rolar a pagina segue funcionando com o dedo
   * em cima do card), e o horizontal fica para o dnd-kit.
   */
  const grip = (
    <span
      aria-hidden
      className="-mt-0.5 shrink-0 text-slate-300 transition com-mouse:opacity-0 com-mouse:group-hover:opacity-100"
    >
      <GripVertical size={18} />
    </span>
  );

  return (
    <div
      ref={setNodeRef}
      {...listeners}
      {...attributes}
      className={clsx(
        "cursor-grab touch-pan-y active:cursor-grabbing",
        // Enquanto arrasta, o card original fica de "fantasma" no lugar dele —
        // quem segue o dedo e o card flutuante (DragOverlay).
        isDragging && "opacity-40",
      )}
      role="button"
      tabIndex={0}
      aria-label={`${demanda.title}. Toque para abrir, arraste para mudar de coluna.`}
      onClick={() => router.push(`/demandas/${demanda.id}`)}
      onKeyDown={(e) => {
        if (e.key === "Enter") {
          e.preventDefault();
          router.push(`/demandas/${demanda.id}`);
        }
      }}
    >
      <CartaoVisual demanda={demanda} alca={grip} />
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
      data-coluna={status}
      className={clsx(
        // Colunas mais estreitas em telas menores: no iPad deitado cabem três
        // por vez em vez de duas e meia, então sobra menos arraste "às cegas"
        // para fora da tela.
        "flex w-64 shrink-0 flex-col rounded-xl border p-3 transition lg:w-72",
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
  const [arrastandoId, setArrastandoId] = useState<string | null>(null);
  const [, iniciar] = useTransition();

  // "Assinatura" leve das demandas: id + coluna. Se a assinatura nao mudou,
  // nao vale a pena refazer o estado local — evita o "pisca" que o array novo
  // do servidor causava em toda renderizacao.
  const assinatura = inicial.map((d) => `${d.id}:${d.status}`).join("|");
  const assinaturaAtual = useRef(assinatura);

  // Enquanto o usuario esta arrastando um card, seguramos as atualizacoes do
  // servidor. Assim o card nao "volta ao lugar" no meio do movimento.
  const arrastando = useRef(false);

  useEffect(() => {
    if (arrastando.current) return;
    if (assinatura === assinaturaAtual.current) return;
    assinaturaAtual.current = assinatura;
    setDemandas(inicial);
    // Depende so da assinatura: mudou de verdade, atualiza; nao mudou,
    // ignora — mesmo que o servidor mande um array novo por referencia.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [assinatura]);

  /*
   * Um sensor para cada tipo de entrada, sem sobreposicao.
   *
   * Usamos MouseSensor (so mouse) em vez de PointerSensor porque o
   * PointerSensor tambem responde a toque — no iPad os dois sensores
   * disputavam o mesmo gesto e o arraste so pegava de vez em quando.
   *
   * Nos dois casos a ativacao e por DISTANCIA, nao por tempo: assim que o
   * dedo (ou o mouse) anda alguns pixels a partir da alca, o arraste comeca.
   * Nada de esperar. Antes usavamos {delay, tolerance} no toque, e ali o
   * "tolerance" CANCELA o arraste se o dedo se mexer durante a espera — o
   * que acontecia quase sempre, porque a mao ja sai puxando.
   *
   * A alca tem "touch-none", entao o Safari nao tenta rolar a pagina a
   * partir dela e entrega o gesto inteiro para o dnd-kit.
   */
  const sensors = useSensors(
    useSensor(MouseSensor, { activationConstraint: { distance: 5 } }),
    useSensor(TouchSensor, { activationConstraint: { distance: 8 } }),
  );

  function aoComecar(evento: DragStartEvent) {
    arrastando.current = true;
    setArrastandoId(String(evento.active.id));
  }

  function aoCancelar() {
    arrastando.current = false;
    setArrastandoId(null);
  }

  function aoSoltar(evento: DragEndEvent) {
    arrastando.current = false;
    setArrastandoId(null);
    const novoStatus = evento.over?.id as DemandStatus | undefined;
    const id = String(evento.active.id);
    if (!novoStatus) return;

    const atual = demandas.find((d) => d.id === id);
    if (!atual || atual.status === novoStatus) return;

    // Move na tela na hora e grava no banco em seguida. Adiantamos a
    // "assinatura" para o efeito de sincronizacao com o servidor nao voltar
    // atras assim que a resposta chegar.
    const nova = demandas.map((d) =>
      d.id === id ? { ...d, status: novoStatus } : d,
    );
    setDemandas(nova);
    assinaturaAtual.current = nova.map((d) => `${d.id}:${d.status}`).join("|");

    iniciar(() => {
      moverDemanda(id, novoStatus);
    });
  }

  const emArrasto = arrastandoId
    ? demandas.find((d) => d.id === arrastandoId)
    : null;

  return (
    <DndContext
      sensors={sensors}
      // "closestCorners" acerta a coluna mesmo quando o card so encosta nela.
      // O padrao exige sobreposicao de area, o que no iPad (tela estreita,
      // colunas largas) fazia o card voltar sozinho para o lugar.
      collisionDetection={closestCorners}
      /*
       * Rolagem automatica ao arrastar para a beirada — e assim que se leva um
       * card para uma coluna que esta fora da tela.
       *
       * O padrao do dnd-kit e rapido demais para telas estreitas: no celular,
       * onde cabe so uma coluna, ele disparava e passava direto do destino.
       * Aqui a rolagem so comeca bem perto da borda (10%) e anda devagar, para
       * dar tempo de ver a coluna certa chegar e soltar nela.
       */
      autoScroll={{
        threshold: { x: 0.1, y: 0 },
        acceleration: 4,
      }}
      onDragStart={aoComecar}
      onDragCancel={aoCancelar}
      onDragEnd={aoSoltar}
    >
      <div className="flex gap-4 overflow-x-auto pb-4">
        {STATUS_ORDER.map((status) => (
          <Coluna
            key={status}
            status={status}
            demandas={demandas.filter((d) => d.status === status)}
          />
        ))}
      </div>

      {/*
       * O card que segue o dedo. Fica num nivel acima de tudo, entao nao e
       * cortado pela coluna nem passa por baixo das outras — que era o que
       * acontecia quando o card era so deslocado no lugar dele.
       */}
      <DragOverlay dropAnimation={{ duration: 180, easing: "ease-out" }}>
        {emArrasto ? (
          <div className="w-64 lg:w-72">
            <CartaoVisual demanda={emArrasto} flutuando />
          </div>
        ) : null}
      </DragOverlay>
    </DndContext>
  );
}
