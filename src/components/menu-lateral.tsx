"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { clsx } from "clsx";
import {
  BarChart3,
  CalendarDays,
  ClipboardList,
  FileText,
  LayoutDashboard,
  LogOut,
  Menu,
  Target,
  Kanban,
  Users,
  UsersRound,
  Wallet,
  X,
} from "lucide-react";
import { MODULES, type Module } from "@/lib/permissions";
import { ROLES, type Role } from "@/lib/constants";
import { sair } from "@/app/actions/auth";
import { TrocaTema } from "./troca-tema";

const ICONS: Record<Module, typeof LayoutDashboard> = {
  PAINEL: LayoutDashboard,
  DEMANDAS: ClipboardList,
  KANBAN: Kanban,
  METAS: Target,
  CALENDARIO: CalendarDays,
  CLIENTES: Users,
  CONTRATOS: FileText,
  FINANCEIRO: Wallet,
  RELATORIOS: BarChart3,
  EQUIPE: UsersRound,
};

export function MenuLateral({
  modules,
  nome,
  cargo,
  sino,
}: {
  modules: Module[];
  nome: string;
  cargo: Role;
  sino?: React.ReactNode;
}) {
  const pathname = usePathname();
  const [aberto, setAberto] = useState(false);

  const conteudo = (
    <div className="flex h-full flex-col">
      <div className="px-5 py-6">
        <p className="text-2xl font-bold tracking-tight text-slate-900">move</p>
        <p className="text-xs text-slate-400">Sistema da agência</p>
      </div>

      <nav className="flex-1 space-y-1 px-3">
        {modules.map((key) => {
          const { label, path } = MODULES[key];
          const Icon = ICONS[key];
          const ativo =
            path === "/" ? pathname === "/" : pathname.startsWith(path);
          return (
            <Link
              key={key}
              href={path}
              onClick={() => setAberto(false)}
              className={clsx(
                "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition",
                ativo
                  ? "bg-marca-50 text-marca-700"
                  : "text-slate-600 hover:bg-slate-100",
              )}
            >
              <Icon size={18} strokeWidth={2} />
              {label}
            </Link>
          );
        })}
      </nav>

      <div className="border-t border-slate-200 p-4">
        <Link
          href="/minha-conta"
          onClick={() => setAberto(false)}
          className="block hover:text-marca-600"
        >
          <p className="truncate text-sm font-medium text-slate-800">{nome}</p>
          <p className="text-xs text-slate-500">{ROLES[cargo]}</p>
        </Link>
        <div className="mt-3 space-y-1">
          <TrocaTema />
          <form action={sair}>
            <button
              type="submit"
              className="flex cursor-pointer items-center gap-2 rounded-lg px-2 py-1.5 text-sm text-slate-500 transition hover:bg-slate-100 hover:text-rose-600"
            >
              <LogOut size={16} />
              Sair
            </button>
          </form>
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Barra do topo, aparece so no celular */}
      <div className="flex items-center justify-between border-b border-slate-200 bg-white px-4 py-3 md:hidden">
        <p className="text-xl font-bold text-slate-900">move</p>
        <div className="flex items-center gap-1">
          {sino}
          <button
            onClick={() => setAberto(true)}
            className="cursor-pointer p-2 text-slate-600"
            aria-label="Abrir menu"
          >
            <Menu size={22} />
          </button>
        </div>
      </div>

      {/* Menu fixo no computador */}
      <aside className="hidden w-60 shrink-0 border-r border-slate-200 bg-white md:block">
        {conteudo}
      </aside>

      {/* Menu deslizante no celular */}
      {aberto && (
        <div className="fixed inset-0 z-50 md:hidden">
          <div
            className="absolute inset-0 bg-slate-900/40"
            onClick={() => setAberto(false)}
          />
          <div className="absolute top-0 left-0 h-full w-64 bg-white shadow-xl">
            <button
              onClick={() => setAberto(false)}
              className="absolute top-5 right-4 cursor-pointer text-slate-400"
              aria-label="Fechar menu"
            >
              <X size={20} />
            </button>
            {conteudo}
          </div>
        </div>
      )}
    </>
  );
}
