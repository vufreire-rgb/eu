"use client";

import { Check, ChevronRight, Info, Send } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { CATEGORY_BY_ID, STATUS_META } from "@/lib/constants";
import type { Message, RequestItem, TimelineEntry } from "@/lib/types";
import { cn, fmtDateTime, timeAgo } from "@/lib/utils";
import { CategoryIcon } from "./category";
import { StatusBadge } from "./ui";

export function RequestCard({ r, href, extra }: { r: RequestItem; href: string; extra?: React.ReactNode }) {
  return (
    <Link href={href} className="card group flex items-center gap-3 p-3.5 transition hover:-translate-y-0.5 hover:shadow-pop" data-testid="request-card">
      <CategoryIcon id={r.categoria} />
      <span className="min-w-0 flex-1">
        <span className="flex flex-wrap items-center gap-x-2 gap-y-1">
          <span className="truncate text-sm font-semibold">{CATEGORY_BY_ID[r.categoria].label}</span>
          <StatusBadge status={r.status} short />
        </span>
        <span className="mt-0.5 block truncate text-xs text-slate-500">{r.protocolo} · {r.rua}, {r.bairro}</span>
        <span className="block text-[11px] text-slate-400">Atualizada há {timeAgo(r.atualizadoEm)}</span>
        {extra}
      </span>
      <ChevronRight size={18} className="shrink-0 text-slate-300 transition group-hover:translate-x-0.5 group-hover:text-brand" />
    </Link>
  );
}

export function Timeline({ items }: { items: TimelineEntry[] }) {
  const list = [...items].sort((a, b) => +new Date(a.em) - +new Date(b.em));
  return (
    <ol className="relative space-y-5" aria-label="Linha do tempo">
      {list.map((t, i) => {
        const last = i === list.length - 1;
        const done = t.status === "concluida";
        return (
          <li key={t.id} className="relative flex gap-3.5">
            {!last && <span className="absolute left-[11px] top-6 h-[calc(100%+4px)] w-px bg-slate-200" aria-hidden />}
            <span className={cn("relative z-10 mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full ring-4 ring-white", done ? "bg-ok text-white" : last ? "bg-brand text-white" : "bg-slate-200 text-slate-500")}>
              {done || !last ? <Check size={13} /> : <span className="h-2 w-2 animate-pulse rounded-full bg-white" />}
            </span>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-semibold">{STATUS_META[t.status].label}</p>
              <p className="text-xs text-slate-400">{fmtDateTime(t.em)}</p>
              <p className="mt-1 text-sm text-slate-600">{t.descricao}</p>
            </div>
          </li>
        );
      })}
    </ol>
  );
}

export function Conversation({
  messages, me, onSend, placeholder, label,
}: { messages: Message[]; me: "cidadao" | "gabinete"; onSend: (t: string) => void; placeholder: string; label: string }) {
  const [text, setText] = useState("");
  const [err, setErr] = useState("");
  const send = () => {
    if (text.trim().length < 2) { setErr("Escreva uma mensagem antes de enviar."); return; }
    onSend(text.trim());
    setText("");
    setErr("");
  };
  return (
    <div>
      <div className="space-y-2.5" aria-live="polite" data-testid="conversation">
        {messages.length === 0 && <p className="rounded-xl bg-slate-50 p-3 text-center text-sm text-slate-500">Nenhuma mensagem ainda.</p>}
        {messages.map((m) => {
          const mine = m.autor === me;
          return (
            <div key={m.id} className={cn("flex", mine ? "justify-end" : "justify-start")}>
              <div className={cn("max-w-[85%] rounded-2xl px-3.5 py-2.5 text-sm", mine ? "rounded-br-md bg-brand text-white" : "rounded-bl-md bg-slate-100 text-navy")}>
                <p className={cn("mb-0.5 text-[11px] font-semibold", mine ? "text-white/75" : "text-slate-500")}>{m.autorNome}</p>
                <p className="whitespace-pre-wrap">{m.texto}</p>
                <p className={cn("mt-1 text-[10px]", mine ? "text-white/60" : "text-slate-400")}>{fmtDateTime(m.em)}</p>
              </div>
            </div>
          );
        })}
      </div>
      <div className="mt-3 flex items-end gap-2">
        <label className="flex-1">
          <span className="sr-only">{label}</span>
          <textarea value={text} onChange={(e) => { setText(e.target.value); setErr(""); }} rows={2} placeholder={placeholder} className="input resize-none" data-testid="message-input" />
        </label>
        <button className="btn-primary h-[44px] w-[44px] shrink-0 p-0" onClick={send} aria-label="Enviar mensagem" data-testid="message-send"><Send size={18} /></button>
      </div>
      {err && <p role="alert" className="mt-1 text-xs text-red-600">{err}</p>}
    </div>
  );
}

export function PhotoGrid({ photos }: { photos: string[] }) {
  const [big, setBig] = useState<string | null>(null);
  if (!photos.length) return <p className="text-sm text-slate-400">Nenhuma foto anexada.</p>;
  return (
    <>
      <div className="grid grid-cols-3 gap-2">
        {photos.map((p, i) => (
          <button key={i} onClick={() => setBig(p)} className="overflow-hidden rounded-xl border border-slate-100" aria-label={`Ampliar foto ${i + 1}`}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={p} alt={`Foto ${i + 1} da solicitação`} className="aspect-square w-full object-cover transition hover:scale-105" />
          </button>
        ))}
      </div>
      {big && (
        <div className="fixed inset-0 z-[80] flex items-center justify-center bg-navy/80 p-4" onClick={() => setBig(null)} role="dialog" aria-label="Foto ampliada">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={big} alt="Foto ampliada" className="max-h-full max-w-full animate-pop rounded-2xl" />
        </div>
      )}
    </>
  );
}

export function LegalNote({ className }: { className?: string }) {
  return (
    <p className={cn("flex gap-2 rounded-xl bg-brand-50 p-3 text-xs leading-relaxed text-navy-600", className)}>
      <Info size={15} className="mt-0.5 shrink-0 text-brand" />
      <span>O gabinete realiza o <b>encaminhamento parlamentar</b> aos órgãos competentes. A execução de obras e serviços é atribuição do Poder Executivo municipal; o gabinete não garante prazo ou atendimento.</span>
    </p>
  );
}
