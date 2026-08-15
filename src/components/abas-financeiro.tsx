"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { clsx } from "clsx";

const ABAS = [
  { href: "/financeiro", label: "Resumo" },
  { href: "/financeiro/receber", label: "A receber" },
  { href: "/financeiro/pagar", label: "A pagar" },
];

export function AbasFinanceiro() {
  const pathname = usePathname();

  return (
    <div className="mb-6 flex gap-1 rounded-lg border border-slate-200 bg-white p-1">
      {ABAS.map((aba) => {
        const ativa = pathname === aba.href;
        return (
          <Link
            key={aba.href}
            href={aba.href}
            className={clsx(
              "flex-1 rounded-md px-3 py-2 text-center text-sm font-medium transition",
              ativa
                ? "bg-marca-500 text-white"
                : "text-slate-600 hover:bg-slate-50",
            )}
          >
            {aba.label}
          </Link>
        );
      })}
    </div>
  );
}
