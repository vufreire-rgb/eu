"use client";

import { Building2, ChevronDown, ShieldCheck, UserRound, Users, Check } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { ROLE_META } from "@/lib/constants";
import { useStore } from "@/lib/store";
import type { Role } from "@/lib/types";
import { cn } from "@/lib/utils";

const ICONS = { cidadao: UserRound, assessor: Users, vereadora: Building2, admin: ShieldCheck };

export function RoleSwitcher({ tone = "dark" }: { tone?: "dark" | "light" }) {
  const { session, setRole, toast } = useStore();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const router = useRouter();

  useEffect(() => {
    const h = (e: MouseEvent) => ref.current && !ref.current.contains(e.target as Node) && setOpen(false);
    const k = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    document.addEventListener("mousedown", h);
    document.addEventListener("keydown", k);
    return () => { document.removeEventListener("mousedown", h); document.removeEventListener("keydown", k); };
  }, []);

  const Cur = ICONS[session.role];
  const pick = (r: Role) => {
    setRole(r);
    setOpen(false);
    toast("info", `Perfil alterado para: ${ROLE_META[r].label}`);
    router.push(ROLE_META[r].home);
  };

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen((o) => !o)}
        aria-haspopup="menu"
        aria-expanded={open}
        data-testid="role-switcher"
        className={cn("flex min-h-[36px] items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold transition", tone === "dark" ? "bg-white/10 text-white hover:bg-white/20" : "bg-slate-100 text-navy hover:bg-slate-200")}
      >
        <Cur size={14} />
        <span className="max-w-[120px] truncate">{ROLE_META[session.role].label}</span>
        <ChevronDown size={14} className={cn("transition", open && "rotate-180")} />
      </button>
      {open && (
        <div role="menu" className="absolute right-0 top-full z-[80] mt-2 w-72 animate-pop rounded-2xl border border-slate-100 bg-white p-1.5 text-navy shadow-pop">
          <p className="px-3 pb-1 pt-2 text-[11px] font-semibold uppercase tracking-wide text-slate-400">Alternar perfil (simulado)</p>
          {(Object.keys(ROLE_META) as Role[]).map((r) => {
            const I = ICONS[r];
            return (
              <button key={r} role="menuitem" data-testid={`role-${r}`} onClick={() => pick(r)} className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left hover:bg-slate-50">
                <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand-50 text-brand"><I size={17} /></span>
                <span className="flex-1">
                  <span className="block text-sm font-semibold">{ROLE_META[r].label}</span>
                  <span className="block text-xs text-slate-500">{ROLE_META[r].desc}</span>
                </span>
                {session.role === r && <Check size={16} className="text-brand" />}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

export function DemoBar() {
  return (
    <div className="no-print flex items-center justify-between gap-3 bg-navy px-4 py-1.5 text-[11px] text-white/80">
      <span className="flex items-center gap-1.5 font-semibold tracking-wide"><span className="h-1.5 w-1.5 animate-pulse rounded-full bg-amber-400" /> AMBIENTE DE DEMONSTRAÇÃO <span className="hidden font-normal sm:inline">· dados fictícios, sem validade oficial</span></span>
      <RoleSwitcher />
    </div>
  );
}
