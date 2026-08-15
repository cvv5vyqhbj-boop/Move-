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
        <h1 className="text-2xl font-semibold text-slate-900">{title}</h1>
        {subtitle && <p className="mt-1 text-sm text-slate-500">{subtitle}</p>}
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
        "rounded-xl border border-slate-200 bg-white p-5 shadow-sm",
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
    <Card>
      <p className="text-sm text-slate-500">{label}</p>
      <p className={clsx("mt-1 text-2xl font-semibold", tones[tone])}>{value}</p>
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
    principal: "bg-marca-500 text-white hover:bg-marca-600",
    secundario:
      "border border-slate-300 bg-white text-slate-700 hover:bg-slate-50",
    perigo: "border border-rose-200 bg-white text-rose-600 hover:bg-rose-50",
  };
  return (
    <button
      {...props}
      className={clsx(
        "cursor-pointer rounded-lg px-4 py-2 text-sm font-medium transition disabled:cursor-not-allowed disabled:opacity-50",
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
    principal: "bg-marca-500 text-white hover:bg-marca-600",
    secundario:
      "border border-slate-300 bg-white text-slate-700 hover:bg-slate-50",
  };
  return (
    <Link
      href={href}
      className={clsx(
        "inline-block rounded-lg px-4 py-2 text-sm font-medium transition",
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
    <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white shadow-sm">
      <table className="w-full text-sm">{children}</table>
    </div>
  );
}

export function THead({ columns }: { columns: string[] }) {
  return (
    <thead className="border-b border-slate-200 bg-slate-50 text-left text-xs uppercase tracking-wide text-slate-500">
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
    <tr className="border-b border-slate-100 last:border-0 hover:bg-slate-50">
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
  "w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 outline-none focus:border-marca-500 focus:ring-2 focus:ring-marca-100";

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
      <span className="mb-1 block text-sm font-medium text-slate-700">
        {label}
      </span>
      {children}
      {hint && <span className="mt-1 block text-xs text-slate-400">{hint}</span>}
    </label>
  );
}

export function Input(props: React.InputHTMLAttributes<HTMLInputElement>) {
  return <input {...props} className={clsx(CAMPO, props.className)} />;
}

export function Textarea(
  props: React.TextareaHTMLAttributes<HTMLTextAreaElement>,
) {
  return <textarea {...props} className={clsx(CAMPO, props.className)} />;
}

export function Select({
  options,
  placeholder,
  ...props
}: React.SelectHTMLAttributes<HTMLSelectElement> & {
  options: { value: string; label: string }[];
  placeholder?: string;
}) {
  return (
    <select {...props} className={clsx(CAMPO, props.className)}>
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
    <div className="h-2 w-full rounded-full bg-slate-100">
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
