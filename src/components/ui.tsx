import Link from "next/link";
import { clsx } from "clsx";
import type { ReactNode } from "react";

// Pecas visuais reaproveitadas por todas as telas.
// Uma so definicao de cada coisa, para o sistema inteiro ficar com a mesma cara.

export function PageHeader({
  title,
  subtitle,
  action,
}: {
  title: string;
  subtitle?: string;
  action?: ReactNode;
}) {
  return (
    <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-slate-900">
          {title}
        </h1>
        {subtitle && (
          <p className="mt-1 text-sm text-slate-500">{subtitle}</p>
        )}
      </div>
      {action}
    </div>
  );
}

export function Card({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={clsx(
        "rounded-2xl border border-slate-200/80 bg-white p-6 shadow-[0_1px_2px_rgba(15,23,42,0.04)]",
        className,
      )}
    >
      {children}
    </div>
  );
}

/** Numero grande com rotulo. Usado nos resumos do topo das telas. */
export function Stat({
  label,
  value,
  hint,
  tone = "neutro",
}: {
  label: string;
  value: string;
  hint?: string;
  tone?: "neutro" | "positivo" | "negativo" | "atencao";
}) {
  const tones = {
    neutro: "text-slate-900",
    positivo: "text-emerald-600",
    negativo: "text-rose-600",
    atencao: "text-amber-600",
  };
  return (
    <Card className="p-5">
      <p className="text-sm text-slate-500">{label}</p>
      <p className={clsx("mt-1 text-2xl font-semibold tracking-tight", tones[tone])}>
        {value}
      </p>
      {hint && <p className="mt-1 text-xs text-slate-400">{hint}</p>}
    </Card>
  );
}

const BADGE_TONES = {
  cinza: "bg-slate-100 text-slate-700",
  laranja: "bg-marca-100 text-marca-700",
  verde: "bg-emerald-100 text-emerald-700",
  vermelho: "bg-rose-100 text-rose-700",
  amarelo: "bg-amber-100 text-amber-700",
  azul: "bg-sky-100 text-sky-700",
  roxo: "bg-violet-100 text-violet-700",
} as const;

export type BadgeTone = keyof typeof BADGE_TONES;

export function Badge({
  children,
  tone = "cinza",
}: {
  children: ReactNode;
  tone?: BadgeTone;
}) {
  return (
    <span
      className={clsx(
        "inline-block rounded-full px-2 py-0.5 text-xs font-medium whitespace-nowrap",
        BADGE_TONES[tone],
      )}
    >
      {children}
    </span>
  );
}

export function Button({
  children,
  variant = "principal",
  className,
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "principal" | "secundario" | "perigo";
}) {
  const variants = {
    principal:
      "bg-marca-500 text-white shadow-sm hover:bg-marca-600 active:bg-marca-700",
    secundario:
      "border border-slate-300 bg-white text-slate-700 hover:border-slate-400 hover:bg-slate-50",
    perigo:
      "border border-rose-200 bg-white text-rose-600 hover:border-rose-300 hover:bg-rose-50",
  };
  return (
    <button
      {...props}
      className={clsx(
        "inline-flex cursor-pointer items-center justify-center rounded-lg px-4 py-2.5 text-sm font-medium transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-marca-300 focus-visible:ring-offset-1 disabled:cursor-not-allowed disabled:opacity-50",
        variants[variant],
        className,
      )}
    >
      {children}
    </button>
  );
}

export function LinkButton({
  href,
  children,
  variant = "principal",
}: {
  href: string;
  children: ReactNode;
  variant?: "principal" | "secundario";
}) {
  const variants = {
    principal:
      "bg-marca-500 text-white shadow-sm hover:bg-marca-600 active:bg-marca-700",
    secundario:
      "border border-slate-300 bg-white text-slate-700 hover:border-slate-400 hover:bg-slate-50",
  };
  return (
    <Link
      href={href}
      className={clsx(
        "inline-flex items-center justify-center rounded-lg px-4 py-2.5 text-sm font-medium transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-marca-300 focus-visible:ring-offset-1",
        variants[variant],
      )}
    >
      {children}
    </Link>
  );
}

// --- Tabela --------------------------------------------------------------

export function Table({ children }: { children: ReactNode }) {
  return (
    <div className="overflow-x-auto rounded-2xl border border-slate-200/80 bg-white shadow-[0_1px_2px_rgba(15,23,42,0.04)]">
      <table className="w-full text-sm">{children}</table>
    </div>
  );
}

export function THead({ columns }: { columns: string[] }) {
  return (
    <thead className="border-b border-slate-200 bg-slate-50/60 text-left text-xs uppercase tracking-wide text-slate-500">
      <tr>
        {columns.map((c) => (
          <th key={c} className="px-4 py-3 font-medium whitespace-nowrap">
            {c}
          </th>
        ))}
      </tr>
    </thead>
  );
}

export function TRow({ children }: { children: ReactNode }) {
  return (
    <tr className="border-b border-slate-100 last:border-0 hover:bg-slate-50/70">
      {children}
    </tr>
  );
}

export function TCell({
  children,
  className,
}: {
  children?: ReactNode;
  className?: string;
}) {
  return <td className={clsx("px-4 py-3 align-middle", className)}>{children}</td>;
}

/** Linha unica explicando que ainda nao ha nada aqui. */
export function EmptyRow({
  colSpan,
  children,
}: {
  colSpan: number;
  children: ReactNode;
}) {
  return (
    <tr>
      <td colSpan={colSpan} className="px-4 py-10 text-center text-slate-500">
        {children}
      </td>
    </tr>
  );
}

export function EmptyState({ children }: { children: ReactNode }) {
  return (
    <Card className="text-center text-slate-500">
      <p className="py-6">{children}</p>
    </Card>
  );
}

// --- Formulario ----------------------------------------------------------

const CAMPO =
  "w-full rounded-lg border border-slate-300 bg-white px-3.5 py-2.5 text-sm text-slate-900 shadow-[0_1px_0_rgba(15,23,42,0.02)] outline-none transition-colors placeholder:text-slate-400 hover:border-slate-400 focus:border-marca-500 focus:ring-4 focus:ring-marca-100 disabled:cursor-not-allowed disabled:bg-slate-50 disabled:text-slate-400";

/** Agrupa campos relacionados de um formulario, com titulo e subtitulo. */
export function FormSection({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle?: string;
  children: ReactNode;
}) {
  return (
    <section className="space-y-4">
      <header>
        <h3 className="text-sm font-semibold tracking-tight text-slate-900">
          {title}
        </h3>
        {subtitle && (
          <p className="mt-0.5 text-xs text-slate-500">{subtitle}</p>
        )}
      </header>
      <div>{children}</div>
    </section>
  );
}

export function Field({
  label,
  hint,
  children,
}: {
  label: string;
  hint?: string;
  children: ReactNode;
}) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-sm font-medium text-slate-700">
        {label}
      </span>
      {children}
      {hint && (
        <span className="mt-1.5 block text-xs leading-relaxed text-slate-500">
          {hint}
        </span>
      )}
    </label>
  );
}

export function Input(props: React.InputHTMLAttributes<HTMLInputElement>) {
  return <input {...props} className={clsx(CAMPO, props.className)} />;
}

export function Textarea(
  props: React.TextareaHTMLAttributes<HTMLTextAreaElement>,
) {
  return <textarea {...props} className={clsx(CAMPO, "leading-relaxed", props.className)} />;
}

export function Select({
  options,
  placeholder,
  ...props
}: React.SelectHTMLAttributes<HTMLSelectElement> & {
  options: { value: string; label: string }[];
  placeholder?: string;
}) {
  // Setinha desenhada em SVG inline, sem asset externo.
  const seta =
    "appearance-none bg-[url('data:image/svg+xml;utf8,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 20 20%22 fill=%22%2364748b%22><path fill-rule=%22evenodd%22 d=%22M5.23 7.21a.75.75 0 011.06.02L10 11.06l3.71-3.83a.75.75 0 111.08 1.04l-4.25 4.39a.75.75 0 01-1.08 0L5.21 8.27a.75.75 0 01.02-1.06z%22 clip-rule=%22evenodd%22/></svg>')] bg-[length:1.1rem] bg-[right_0.75rem_center] bg-no-repeat pr-10";
  return (
    <select {...props} className={clsx(CAMPO, seta, props.className)}>
      {placeholder && <option value="">{placeholder}</option>}
      {options.map((o) => (
        <option key={o.value} value={o.value}>
          {o.label}
        </option>
      ))}
    </select>
  );
}

/** Barra de progresso usada nas metas. */
export function Progress({ percent }: { percent: number }) {
  const p = Math.max(0, Math.min(100, Math.round(percent)));
  return (
    <div className="h-2 w-full overflow-hidden rounded-full bg-slate-100">
      <div
        className={clsx(
          "h-2 rounded-full transition-all",
          p >= 100 ? "bg-emerald-500" : "bg-marca-500",
        )}
        style={{ width: `${p}%` }}
      />
    </div>
  );
}
