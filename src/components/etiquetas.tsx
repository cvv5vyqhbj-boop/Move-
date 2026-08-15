import { Badge, type BadgeTone } from "./ui";
import {
  AREAS,
  CLIENT_STATUS,
  PRIORITIES,
  STATUS,
  type Area,
  type DemandStatus,
  type Priority,
} from "@/lib/constants";

// Etiquetas coloridas: a mesma cor significa a mesma coisa no sistema inteiro.

const AREA_TONE: Record<Area, BadgeTone> = {
  EDICAO: "roxo",
  SOCIAL: "azul",
  TRAFEGO: "laranja",
  DESIGN: "amarelo",
  COPY: "verde",
  FILMAGEM: "cinza",
};

const STATUS_TONE: Record<DemandStatus, BadgeTone> = {
  BACKLOG: "cinza",
  A_FAZER: "azul",
  EM_ANDAMENTO: "laranja",
  REVISAO: "amarelo",
  CONCLUIDO: "verde",
};

const PRIORITY_TONE: Record<Priority, BadgeTone> = {
  BAIXA: "cinza",
  MEDIA: "azul",
  ALTA: "vermelho",
};

const CLIENT_TONE: Record<keyof typeof CLIENT_STATUS, BadgeTone> = {
  ATIVO: "verde",
  PAUSADO: "amarelo",
  ENCERRADO: "cinza",
};

export function EtiquetaArea({ area }: { area: string }) {
  const key = area as Area;
  return <Badge tone={AREA_TONE[key] ?? "cinza"}>{AREAS[key] ?? area}</Badge>;
}

export function EtiquetaStatus({ status }: { status: string }) {
  const key = status as DemandStatus;
  return <Badge tone={STATUS_TONE[key] ?? "cinza"}>{STATUS[key] ?? status}</Badge>;
}

export function EtiquetaPrioridade({ priority }: { priority: string }) {
  const key = priority as Priority;
  return (
    <Badge tone={PRIORITY_TONE[key] ?? "cinza"}>
      {PRIORITIES[key] ?? priority}
    </Badge>
  );
}

export function EtiquetaCliente({ status }: { status: string }) {
  const key = status as keyof typeof CLIENT_STATUS;
  return (
    <Badge tone={CLIENT_TONE[key] ?? "cinza"}>
      {CLIENT_STATUS[key] ?? status}
    </Badge>
  );
}

/** Etiqueta de pagamento: pendente/atrasado/pago. */
export function EtiquetaPagamento({
  status,
  dueDate,
  pagoLabel = "Pago",
}: {
  status: string;
  dueDate: Date | string;
  pagoLabel?: string;
}) {
  if (status !== "PENDENTE") return <Badge tone="verde">{pagoLabel}</Badge>;
  const atrasado = new Date(dueDate) < new Date(new Date().toDateString());
  return atrasado ? (
    <Badge tone="vermelho">Atrasado</Badge>
  ) : (
    <Badge tone="amarelo">Em aberto</Badge>
  );
}
