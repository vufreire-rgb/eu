"use client";

import { CalendarDays, FileText, Landmark, MapPin, Megaphone, Newspaper, ScrollText, Search } from "lucide-react";
import { useSearchParams } from "next/navigation";
import { Suspense, useState } from "react";
import { Empty, PageHeader } from "@/components/ui";
import { POST_TYPES } from "@/lib/constants";
import { useStore } from "@/lib/store";
import type { PostType } from "@/lib/types";
import { cn, fmtLong } from "@/lib/utils";

const TABS: { id: PostType; icon: typeof Newspaper }[] = [
  { id: "noticia", icon: Newspaper }, { id: "projeto", icon: Landmark }, { id: "agenda", icon: CalendarDays }, { id: "informativo", icon: Megaphone }, { id: "relatorio", icon: ScrollText },
];

function Content() {
  const { data } = useStore();
  const qp = useSearchParams().get("aba") as PostType | null;
  const [tab, setTab] = useState<PostType>(qp && qp in POST_TYPES ? qp : "noticia");
  const [q, setQ] = useState("");
  const [open, setOpen] = useState<string | null>(null);
  const list = data.posts
    .filter((p) => p.publicado && p.tipo === tab && (p.titulo + p.resumo).toLowerCase().includes(q.toLowerCase()))
    .sort((a, b) => (tab === "agenda" ? a.data.localeCompare(b.data) : b.data.localeCompare(a.data)));
  return (
    <>
      <PageHeader title="Mandato" subtitle="Informações institucionais do gabinete" />
      <div className="-mx-4 mb-4 flex gap-2 overflow-x-auto px-4 pb-1" role="tablist">
        {TABS.map((t) => (
          <button key={t.id} role="tab" aria-selected={tab === t.id} onClick={() => { setTab(t.id); setOpen(null); }} className={cn("flex shrink-0 items-center gap-1.5 rounded-full px-3.5 py-2 text-sm font-medium transition", tab === t.id ? "bg-navy text-white" : "bg-white text-slate-600 ring-1 ring-slate-200")}>
            <t.icon size={15} /> {POST_TYPES[t.id]}
          </button>
        ))}
      </div>
      <div className="relative mb-4">
        <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
        <input className="input pl-10" placeholder="Buscar…" value={q} onChange={(e) => setQ(e.target.value)} aria-label="Buscar publicações" />
      </div>
      {list.length === 0 ? <Empty icon={FileText} title="Nenhuma publicação" text="Não há conteúdo nesta seção no momento." /> : (
        <div className="grid gap-3 md:grid-cols-2">
          {list.map((p) => (
            <article key={p.id} className="card p-5">
              <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500">
                <span className="chip bg-brand-50 text-brand">{p.numero ?? POST_TYPES[p.tipo]}</span>{fmtLong(p.data)}{p.hora && ` · ${p.hora}`}
              </div>
              <h2 className="mt-2 font-bold leading-snug">{p.titulo}</h2>
              {p.situacao && <p className="mt-1 text-xs font-semibold text-ok-700">{p.situacao}</p>}
              {p.local && <p className="mt-1 flex items-center gap-1 text-xs text-slate-500"><MapPin size={13} /> {p.local}</p>}
              <p className="mt-2 text-sm text-slate-600">{open === p.id ? p.corpo : p.resumo}</p>
              <button onClick={() => setOpen(open === p.id ? null : p.id)} className="mt-2 text-sm font-medium text-brand">{open === p.id ? "Mostrar menos" : "Ler mais"}</button>
            </article>
          ))}
        </div>
      )}
      <p className="mt-6 text-center text-[11px] text-slate-400">Conteúdo de caráter informativo e institucional. Conteúdo demonstrativo e fictício.</p>
    </>
  );
}

export default function Mandato() {
  return <Suspense><Content /></Suspense>;
}
