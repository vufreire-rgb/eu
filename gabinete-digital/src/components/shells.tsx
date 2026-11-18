"use client";

import {
  Bell, BarChart3, FileText, Home, Inbox, LayoutDashboard, Map as MapIcon, Megaphone, Menu, Plus, ScrollText, Settings2, ShieldCheck, Users, X, Building, Landmark, type LucideIcon,
} from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState, type ReactNode } from "react";
import { ROLE_META } from "@/lib/constants";
import { useStore } from "@/lib/store";
import type { Role } from "@/lib/types";
import { cn } from "@/lib/utils";
import { Logo } from "./brand";
import { DemoBar, RoleSwitcher } from "./role-switcher";
import { LoadingScreen } from "./ui";

function Guard({ allow, children }: { allow: Role[]; children: ReactNode }) {
  const { ready, session, setRole } = useStore();
  const router = useRouter();
  if (!ready) return <LoadingScreen />;
  if (!allow.includes(session.role)) {
    const target = allow[0];
    return (
      <div className="mx-auto flex min-h-[60dvh] max-w-md flex-col items-center justify-center p-6 text-center">
        <span className="mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-brand-50 text-brand"><ShieldCheck /></span>
        <h1 className="text-lg font-bold">Área restrita ao perfil {ROLE_META[target].label}</h1>
        <p className="mt-1 text-sm text-slate-500">Seu perfil atual é “{ROLE_META[session.role].label}”. Alterne o perfil para continuar a demonstração.</p>
        <button className="btn-primary mt-5" onClick={() => { setRole(target); router.refresh(); }}>Entrar como {ROLE_META[target].label}</button>
        <Link href="/" className="mt-2 text-sm font-medium text-brand">Voltar ao início</Link>
      </div>
    );
  }
  return <>{children}</>;
}

/* ---------------- CIDADÃO ---------------- */
export function CitizenShell({ children }: { children: ReactNode }) {
  const { data, session } = useStore();
  const path = usePathname();
  const unread = data.notifications.filter((n) => n.citizenId === session.citizenId && !n.lida).length;
  const items: { href: string; label: string; icon: LucideIcon; badge?: number }[] = [
    { href: "/cidadao", label: "Início", icon: Home },
    { href: "/cidadao/solicitacoes", label: "Solicitações", icon: Inbox },
    { href: "/cidadao/mandato", label: "Mandato", icon: Landmark },
    { href: "/cidadao/notificacoes", label: "Alertas", icon: Bell, badge: unread },
  ];
  const active = (h: string) => (h === "/cidadao" ? path === h : path.startsWith(h));
  return (
    <div className="min-h-dvh">
      <DemoBar />
      <header className="no-print sticky top-0 z-40 border-b border-slate-200/70 bg-white/90 backdrop-blur">
        <div className="mx-auto flex max-w-5xl items-center justify-between gap-3 px-4 py-3">
          <Logo href="/cidadao" />
          <nav className="hidden items-center gap-1 md:flex" aria-label="Principal">
            {items.map((i) => (
              <Link key={i.href} href={i.href} className={cn("relative flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-medium transition", active(i.href) ? "bg-brand-50 text-brand" : "text-slate-600 hover:bg-slate-100")}>
                <i.icon size={16} /> {i.label}
                {!!i.badge && <span className="rounded-full bg-red-500 px-1.5 text-[10px] font-bold text-white">{i.badge}</span>}
              </Link>
            ))}
            <Link href="/cidadao/nova" className="btn-primary btn-sm ml-2"><Plus size={16} /> Nova solicitação</Link>
          </nav>
          <Link href="/cidadao/notificacoes" aria-label={`Notificações${unread ? `: ${unread} não lidas` : ""}`} className="relative rounded-xl p-2 text-slate-600 hover:bg-slate-100 md:hidden">
            <Bell size={20} />
            {unread > 0 && <span data-testid="bell-badge" className="absolute right-0.5 top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-bold text-white">{unread}</span>}
          </Link>
        </div>
      </header>
      <Guard allow={["cidadao"]}>
        <main id="conteudo" className="mx-auto max-w-5xl px-4 pb-28 pt-5 md:pb-12">{children}</main>
      </Guard>
      <nav aria-label="Navegação inferior" className="no-print safe-bottom fixed inset-x-0 bottom-0 z-40 border-t border-slate-200 bg-white/95 backdrop-blur md:hidden">
        <ul className="mx-auto grid max-w-md grid-cols-5 items-end px-2 pt-1.5">
          {[items[0], items[1]].map((i) => <NavItem key={i.href} {...i} on={active(i.href)} />)}
          <li className="flex justify-center">
            <Link href="/cidadao/nova" aria-label="Nova solicitação" className="-mt-5 flex h-14 w-14 items-center justify-center rounded-full bg-brand text-white shadow-pop ring-4 ring-surface transition active:scale-95"><Plus size={26} /></Link>
          </li>
          {[items[2], items[3]].map((i) => <NavItem key={i.href} {...i} on={active(i.href)} />)}
        </ul>
      </nav>
    </div>
  );
}

function NavItem({ href, label, icon: Icon, on, badge }: { href: string; label: string; icon: LucideIcon; on: boolean; badge?: number }) {
  return (
    <li>
      <Link href={href} aria-current={on ? "page" : undefined} className={cn("relative flex min-h-[52px] flex-col items-center justify-center gap-0.5 rounded-xl text-[11px] font-medium transition", on ? "text-brand" : "text-slate-500")}>
        <Icon size={21} strokeWidth={on ? 2.4 : 1.9} />
        {label}
        {!!badge && <span className="absolute right-3 top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-bold text-white">{badge}</span>}
      </Link>
    </li>
  );
}

/* ---------------- GABINETE ---------------- */
export function StaffShell({ children }: { children: ReactNode }) {
  const { session, data, setStaff } = useStore();
  const path = usePathname();
  const [open, setOpen] = useState(false);
  const me = data.staff.find((s) => s.id === session.staffId);
  const isVer = session.role === "vereadora";
  const nav: { href: string; label: string; icon: LucideIcon; show: boolean }[] = [
    { href: "/gabinete", label: "Painel", icon: LayoutDashboard, show: true },
    { href: "/gabinete/solicitacoes", label: "Solicitações", icon: Inbox, show: true },
    { href: "/gabinete/mapa", label: "Mapa de demandas", icon: MapIcon, show: true },
    { href: "/gabinete/oficios", label: "Ofícios", icon: FileText, show: true },
    { href: "/gabinete/comunicacao", label: "Comunicação", icon: Megaphone, show: isVer || !!me?.permissoes.includes("publicar") },
    { href: "/gabinete/equipe", label: "Equipe", icon: Users, show: isVer || !!me?.permissoes.includes("gerir_equipe") },
  ];
  const items = nav.filter((n) => n.show);
  const active = (h: string) => (h === "/gabinete" ? path === h : path.startsWith(h));
  const Links = ({ onClick }: { onClick?: () => void }) => (
    <ul className="space-y-1">
      {items.map((i) => (
        <li key={i.href}>
          <Link href={i.href} onClick={onClick} aria-current={active(i.href) ? "page" : undefined} className={cn("flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition", active(i.href) ? "bg-white/12 text-white" : "text-white/65 hover:bg-white/8 hover:text-white")}>
            <i.icon size={18} /> {i.label}
          </Link>
        </li>
      ))}
    </ul>
  );
  return (
    <div className="min-h-dvh">
      <DemoBar />
      <div className="flex">
        <aside className="no-print sticky top-0 hidden h-dvh w-64 shrink-0 flex-col bg-navy p-4 lg:flex">
          <div className="mb-6 mt-2"><Logo href="/gabinete" dark /></div>
          <Links />
          <div className="mt-auto rounded-2xl bg-white/8 p-3 text-xs text-white/70">
            <p className="font-semibold text-white">{isVer ? "Vereadora" : me?.nome}</p>
            <p>{isVer ? "Acesso completo ao mandato" : me?.cargo}</p>
          </div>
        </aside>
        <div className="min-w-0 flex-1">
          <header className="no-print sticky top-0 z-40 flex items-center justify-between gap-3 border-b border-slate-200/70 bg-white/90 px-4 py-2.5 backdrop-blur lg:hidden">
            <Logo href="/gabinete" />
            <button aria-label="Abrir menu" onClick={() => setOpen(true)} className="rounded-xl p-2 text-navy hover:bg-slate-100"><Menu size={22} /></button>
          </header>
          {open && (
            <div className="fixed inset-0 z-[75] lg:hidden">
              <button aria-label="Fechar menu" className="absolute inset-0 bg-navy/50" onClick={() => setOpen(false)} />
              <div className="absolute inset-y-0 left-0 w-72 animate-slide-in bg-navy p-4">
                <div className="mb-5 flex items-center justify-between"><Logo href="/gabinete" dark /><button aria-label="Fechar" onClick={() => setOpen(false)} className="text-white/70"><X size={20} /></button></div>
                <Links onClick={() => setOpen(false)} />
              </div>
            </div>
          )}
          <Guard allow={["assessor", "vereadora"]}>
            {session.role === "assessor" && (
              <div className="no-print flex items-center gap-2 border-b border-slate-200 bg-white px-4 py-2 text-xs text-slate-600">
                Atuando como
                <select aria-label="Assessor simulado" className="rounded-lg border border-slate-200 bg-white px-2 py-1 text-xs font-semibold" value={session.staffId} onChange={(e) => setStaff(e.target.value)}>
                  {data.staff.filter((s) => s.ativo).map((s) => <option key={s.id} value={s.id}>{s.nome}</option>)}
                </select>
              </div>
            )}
            <main id="conteudo" className="mx-auto max-w-6xl px-4 pb-12 pt-6 sm:px-6">{children}</main>
          </Guard>
        </div>
      </div>
    </div>
  );
}

/* ---------------- PLATAFORMA ---------------- */
export function PlatformShell({ children }: { children: ReactNode }) {
  const path = usePathname();
  const items = [
    { href: "/plataforma", label: "Visão geral", icon: BarChart3 },
    { href: "/plataforma/gabinetes", label: "Gabinetes", icon: Building },
    { href: "/plataforma/novo", label: "Novo gabinete", icon: Plus },
    { href: "/plataforma/arquitetura", label: "Arquitetura", icon: Settings2 },
  ];
  return (
    <div className="min-h-dvh">
      <DemoBar />
      <header className="no-print sticky top-0 z-40 border-b border-slate-200/70 bg-white/90 backdrop-blur">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-2 px-4 py-2.5">
          <Link href="/plataforma" className="flex items-center gap-2.5 font-bold"><span className="flex h-9 w-9 items-center justify-center rounded-xl bg-navy text-white"><ScrollText size={18} /></span> Gabinete Digital <span className="chip bg-brand-50 text-brand">Plataforma</span></Link>
          <nav className="flex gap-1 overflow-x-auto" aria-label="Plataforma">
            {items.map((i) => {
              const on = i.href === "/plataforma" ? path === i.href : path.startsWith(i.href);
              return <Link key={i.href} href={i.href} className={cn("flex shrink-0 items-center gap-1.5 rounded-xl px-3 py-2 text-sm font-medium", on ? "bg-brand-50 text-brand" : "text-slate-600 hover:bg-slate-100")}><i.icon size={15} /> {i.label}</Link>;
            })}
          </nav>
        </div>
      </header>
      <Guard allow={["admin"]}>
        <main id="conteudo" className="mx-auto max-w-6xl px-4 pb-12 pt-6 sm:px-6">{children}</main>
      </Guard>
    </div>
  );
}

export { RoleSwitcher };
