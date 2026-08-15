import { MONTHS } from "./constants";

/** R$ 1.500,00 */
export function money(value: number): string {
  return value.toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  });
}

/** 15/08/2026 */
export function date(value: Date | string | null | undefined): string {
  if (!value) return "—";
  return new Date(value).toLocaleDateString("pt-BR", { timeZone: "UTC" });
}

/** Para preencher campos <input type="date"> */
export function dateInput(value: Date | string | null | undefined): string {
  if (!value) return "";
  return new Date(value).toISOString().slice(0, 10);
}

/** "Agosto de 2026" */
export function monthLabel(month: number, year: number): string {
  return `${MONTHS[month - 1]} de ${year}`;
}

/** "2 anos e 3 meses" - usado para mostrar ha quanto tempo o cliente esta com a gente. */
export function timeSince(start: Date | string): string {
  const from = new Date(start);
  const now = new Date();
  let months =
    (now.getFullYear() - from.getFullYear()) * 12 +
    (now.getMonth() - from.getMonth());
  if (now.getDate() < from.getDate()) months--;
  if (months < 0) months = 0;

  const years = Math.floor(months / 12);
  const rest = months % 12;

  const parts: string[] = [];
  if (years > 0) parts.push(`${years} ${years === 1 ? "ano" : "anos"}`);
  if (rest > 0) parts.push(`${rest} ${rest === 1 ? "mês" : "meses"}`);
  if (parts.length === 0) return "menos de 1 mês";
  return parts.join(" e ");
}

/** Quantos dias faltam (negativo = atrasado). */
export function daysUntil(value: Date | string): number {
  const target = new Date(value);
  const today = new Date();
  target.setHours(0, 0, 0, 0);
  today.setHours(0, 0, 0, 0);
  return Math.round((target.getTime() - today.getTime()) / 86400000);
}

/** "Vence hoje", "Atrasado 3 dias", "Faltam 5 dias" */
export function dueLabel(value: Date | string): string {
  const days = daysUntil(value);
  if (days === 0) return "Vence hoje";
  if (days < 0) return `Atrasado ${-days} ${-days === 1 ? "dia" : "dias"}`;
  if (days === 1) return "Vence amanhã";
  return `Faltam ${days} dias`;
}
