"use client";

import { Inbox, Plus } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { Empty, PageHeader } from "@/components/ui";
import { RequestCard } from "@/components/request-parts";
import { STATUS_META } from "@/lib/constants";
import { useStore } from "@/lib/store";
import type { Status } from "@/lib/types";
import { cn } from "@/lib/utils";

export default function MyRequests() {
  const { data, session } = useStore();
  const [f, setF] = useState<Status | "todas">("todas");
  const mine = data.requests.filter((r) => r.citizenId === session.citizenId);
  const list = mine.filter((r) => f === "todas" || r.status === f);
  const present = Array.from(new Set(mine.map((r) => r.status)));
  return (
    <>
      <PageHeader title="Minhas solicitações" subtitle={`${mine.length} registradas`} actions={<Link href="/cidadao/nova" className="btn-primary btn-sm"><Plus size={16} /> Nova</Link>} />
      <div className="-mx-4 mb-4 flex gap-2 overflow-x-auto px-4 pb-1" role="tablist" aria-label="Filtrar por status">
        {(["todas", ...present] as (Status | "todas")[]).map((s) => (
          <button key={s} role="tab" aria-selected={f === s} onClick={() => setF(s)} className={cn("shrink-0 rounded-full px-3.5 py-1.5 text-sm font-medium transition", f === s ? "bg-navy text-white" : "bg-white text-slate-600 ring-1 ring-slate-200 hover:bg-slate-50")}>
            {s === "todas" ? "Todas" : STATUS_META[s].label.replace(" ao órgão responsável", "")}
          </button>
        ))}
      </div>
      {list.length ? <div className="grid gap-2.5 md:grid-cols-2">{list.map((r) => <RequestCard key={r.id} r={r} href={`/cidadao/solicitacoes/detalhe?id=${r.id}`} />)}</div>
        : <Empty icon={Inbox} title="Nada por aqui" text="Nenhuma solicitação neste filtro." />}
    </>
  );
}
