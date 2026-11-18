"use client";

import { Check, AlertCircle, Info, X, type LucideIcon } from "lucide-react";
import { useEffect, type ReactNode } from "react";
import { PRIORITY_META, STATUS_META } from "@/lib/constants";
import type { Priority, Status } from "@/lib/types";
import { cn } from "@/lib/utils";
import { useStore } from "@/lib/store";

export function StatusBadge({ status, short }: { status: Status; short?: boolean }) {
  const m = STATUS_META[status];
  return (
    <span className={cn("chip", m.tone)}>
      <span className={cn("h-1.5 w-1.5 rounded-full", m.dot)} />
      {short && status === "encaminhada" ? "Encaminhada" : m.label}
    </span>
  );
}

export function PriorityBadge({ p }: { p: Priority }) {
  return <span className={cn("chip", PRIORITY_META[p].tone)}>{PRIORITY_META[p].label}</span>;
}

export function Avatar({ src, name, size = 40, color = "#14283F" }: { src?: string; name: string; size?: number; color?: string }) {
  const ini = name.split(" ").filter(Boolean).slice(0, 2).map((s) => s[0]).join("").toUpperCase();
  // eslint-disable-next-line @next/next/no-img-element
  if (src) return <img src={src} alt={name} width={size} height={size} className="rounded-full object-cover" style={{ width: size, height: size }} />;
  return (
    <span aria-hidden className="inline-flex shrink-0 items-center justify-center rounded-full font-semibold text-white" style={{ width: size, height: size, background: color, fontSize: size * 0.38 }}>
      {ini}
    </span>
  );
}

export function PageHeader({ title, subtitle, actions, back }: { title: string; subtitle?: string; actions?: ReactNode; back?: ReactNode }) {
  return (
    <div className="mb-5 flex flex-wrap items-end justify-between gap-3">
      <div className="min-w-0">
        {back}
        <h1 className="text-2xl font-bold tracking-tight sm:text-[28px]">{title}</h1>
        {subtitle && <p className="mt-1 text-sm text-slate-500">{subtitle}</p>}
      </div>
      {actions && <div className="flex flex-wrap items-center gap-2">{actions}</div>}
    </div>
  );
}

export function Empty({ icon: Icon, title, text, action }: { icon: LucideIcon; title: string; text: string; action?: ReactNode }) {
  return (
    <div className="card flex flex-col items-center px-6 py-12 text-center">
      <span className="mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-brand-50 text-brand"><Icon size={22} /></span>
      <p className="font-semibold">{title}</p>
      <p className="mt-1 max-w-sm text-sm text-slate-500">{text}</p>
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}

export function Modal({ open, onClose, title, children, wide }: { open: boolean; onClose: () => void; title: string; children: ReactNode; wide?: boolean }) {
  useEffect(() => {
    if (!open) return;
    const h = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", h);
    document.body.style.overflow = "hidden";
    return () => { window.removeEventListener("keydown", h); document.body.style.overflow = ""; };
  }, [open, onClose]);
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-[70] flex items-end justify-center sm:items-center sm:p-4" role="dialog" aria-modal="true" aria-label={title}>
      <button aria-label="Fechar" className="absolute inset-0 bg-navy/50 backdrop-blur-[2px]" onClick={onClose} />
      <div className={cn("relative z-10 max-h-[92dvh] w-full animate-pop overflow-y-auto rounded-t-3xl bg-white p-5 shadow-pop sm:rounded-3xl sm:p-6", wide ? "sm:max-w-2xl" : "sm:max-w-md")}>
        <div className="mb-4 flex items-start justify-between gap-3">
          <h2 className="text-lg font-bold">{title}</h2>
          <button onClick={onClose} aria-label="Fechar janela" className="rounded-lg p-1.5 text-slate-500 hover:bg-slate-100"><X size={18} /></button>
        </div>
        {children}
      </div>
    </div>
  );
}

export function Toasts() {
  const { toasts, dismissToast } = useStore();
  return (
    <div className="pointer-events-none fixed inset-x-0 top-3 z-[90] flex flex-col items-center gap-2 px-4" aria-live="polite" role="status">
      {toasts.map((t) => {
        const Icon = t.kind === "success" ? Check : t.kind === "error" ? AlertCircle : Info;
        const tone = t.kind === "success" ? "bg-ok text-white" : t.kind === "error" ? "bg-red-600 text-white" : "bg-navy text-white";
        return (
          <button key={t.id} onClick={() => dismissToast(t.id)} className={cn("pointer-events-auto flex max-w-md animate-pop items-center gap-2.5 rounded-2xl px-4 py-3 text-left text-sm font-medium shadow-pop", tone)}>
            <Icon size={18} className="shrink-0" /> {t.text}
          </button>
        );
      })}
    </div>
  );
}

export function Skeleton({ className }: { className?: string }) {
  return <div className={cn("skeleton", className)} aria-hidden />;
}

export function LoadingScreen() {
  return (
    <div className="mx-auto w-full max-w-3xl space-y-4 p-4" aria-busy="true" aria-label="Carregando">
      <Skeleton className="h-8 w-48" />
      <Skeleton className="h-40 w-full" />
      <div className="grid grid-cols-2 gap-3"><Skeleton className="h-24" /><Skeleton className="h-24" /></div>
      <Skeleton className="h-32 w-full" />
    </div>
  );
}

export function Spinner({ className }: { className?: string }) {
  return <span className={cn("inline-block h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent", className)} aria-hidden />;
}

export function Field({ label, children, hint }: { label: string; children: ReactNode; hint?: string }) {
  return (
    <label className="block">
      <span className="label">{label}</span>
      {children}
      {hint && <span className="mt-1 block text-xs text-slate-400">{hint}</span>}
    </label>
  );
}

export function Stat({ label, value, icon: Icon, tone = "text-brand bg-brand-50", sub }: { label: string; value: ReactNode; icon: LucideIcon; tone?: string; sub?: string }) {
  return (
    <div className="card p-4">
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold uppercase tracking-wide text-slate-500">{label}</span>
        <span className={cn("flex h-8 w-8 items-center justify-center rounded-xl", tone)}><Icon size={16} /></span>
      </div>
      <p className="mt-2 text-2xl font-bold tracking-tight">{value}</p>
      {sub && <p className="text-xs text-slate-400">{sub}</p>}
    </div>
  );
}
