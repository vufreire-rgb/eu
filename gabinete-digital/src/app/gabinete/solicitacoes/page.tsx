"use client";

import { AlertCircle, Columns3, GripVertical, MessageSquare, Search, Table2, X } from "lucide-react";
import Link from "next/link";
import { useMemo, useState } from "react";
import { CategoryIcon } from "@/components/category";
import { Empty, PageHeader, PriorityBadge, StatusBadge } from "@/components/ui";
import { BAIRROS, CATEGORIES, CATEGORY_BY_ID, STATUS_META, STATUS_ORDER } from "@/lib/constants";
import { useStore } from "@/lib/store";
import type { RequestItem, Status } from "@/lib/types";
import { cn, fmtDate, timeAgo } from "@/lib/utils";

const PERIODS = [["todos", "Todo o período"], ["7", "Últimos 7 dias"], ["30", "Últimos 30 dias"], ["90", "Últimos 90 dias"]] as const;

export default function Requests() {
  const { data, changeStatus, toast } = useStore();
  const [view, setView] = useState<"tabela" | "kanban">("tabela");
  const [q, setQ] = useState("");
  const [st, setSt] = useState("");
  const [bairro, setBairro] = useState("");
  const [cat, setCat] = useState("");
  const [per, setPer] = useState("todos");
  const [resp, setResp] = useState("");
  const [drag, setDrag] = useState<string | null>(null);
  const [over, setOver] = useState<Status | null>(null);

  const citizen = (id: string) => data.citizens.find((c) => c.id === id);
  const staff = (id: string | null) => data.staff.find((s) => s.id === id);

  const list = useMemo(() => {
    const now = Date.now();
    const t = q.trim().toLowerCase();
    return data.requests.filter((r) => {
      if (st && r.status !== st) return false;
      if (bairro && r.bairro !== bairro) return false;
      if (cat && r.categoria !== cat) return false;
      if (resp && (resp === "none" ? r.responsavelId : r.responsavelId !== resp)) return false;
      if (per !== "todos" && now - +new Date(r.criadoEm) > Number(per) * 86400000) return false;
      if (t) {
        const hay = `${r.protocolo} ${r.bairro} ${r.rua} ${r.descricao} ${citizen(r.citizenId)?.nome ?? ""} ${CATEGORY_BY_ID[r.categoria].label}`.toLowerCase();
        if (!hay.includes(t)) return false;
      }
      return true;
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data.requests, q, st, bairro, cat, per, resp]);

  const filtered = !!(q || st || bairro || cat || resp || per !== "todos");
  const clear = () => { setQ(""); setSt(""); setBairro(""); setCat(""); setPer("todos"); setResp(""); };
  const move = (r: RequestItem, to: Status) => {
    if (r.status === to) return;
    changeStatus(r.id, to, "");
    toast("success", `${r.protocolo} → ${STATUS_META[to].label}`);
  };

  return (
    <>
      <PageHeader
        title="Solicitações"
        subtitle={`${list.length} de ${data.requests.length} solicitações`}
        actions={
          <div className="flex rounded-xl bg-white p-1 ring-1 ring-slate-200" role="tablist" aria-label="Visualização">
            {([["tabela", Table2, "Tabela"], ["kanban", Columns3, "Kanban"]] as const).map(([v, I, l]) => (
              <button key={v} role="tab" aria-selected={view === v} data-testid={`view-${v}`} onClick={() => setView(v)} className={cn("flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-medium transition", view === v ? "bg-navy text-white" : "text-slate-600")}><I size={15} /> {l}</button>
            ))}
          </div>
        }
      />

      <div className="card mb-4 space-y-3 p-3.5">
        <div className="relative">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input className="input pl-10" placeholder="Pesquisar por protocolo, cidadão, rua, descrição…" value={q} onChange={(e) => setQ(e.target.value)} aria-label="Pesquisar solicitações" data-testid="search" />
        </div>
        <div className="grid grid-cols-2 gap-2 lg:grid-cols-5">
          <select className="input" value={st} onChange={(e) => setSt(e.target.value)} aria-label="Filtrar por status"><option value="">Todos os status</option>{STATUS_ORDER.map((s) => <option key={s} value={s}>{STATUS_META[s].label}</option>)}</select>
          <select className="input" value={bairro} onChange={(e) => setBairro(e.target.value)} aria-label="Filtrar por bairro"><option value="">Todos os bairros</option>{BAIRROS.map((b) => <option key={b.nome}>{b.nome}</option>)}</select>
          <select className="input" value={cat} onChange={(e) => setCat(e.target.value)} aria-label="Filtrar por categoria"><option value="">Todas as categorias</option>{CATEGORIES.map((c) => <option key={c.id} value={c.id}>{c.label}</option>)}</select>
          <select className="input" value={per} onChange={(e) => setPer(e.target.value)} aria-label="Filtrar por período">{PERIODS.map(([v, l]) => <option key={v} value={v}>{l}</option>)}</select>
          <select className="input" value={resp} onChange={(e) => setResp(e.target.value)} aria-label="Filtrar por responsável"><option value="">Todos os responsáveis</option><option value="none">Sem responsável</option>{data.staff.map((s) => <option key={s.id} value={s.id}>{s.nome}</option>)}</select>
        </div>
        {filtered && <button onClick={clear} className="flex items-center gap-1 text-sm font-medium text-brand"><X size={14} /> Limpar filtros</button>}
      </div>

      {list.length === 0 ? <Empty icon={AlertCircle} title="Nenhuma solicitação encontrada" text="Ajuste os filtros ou a pesquisa." action={<button className="btn-primary" onClick={clear}>Limpar filtros</button>} /> : view === "tabela" ? (
        <div className="card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[820px] text-left text-sm" data-testid="tabela">
              <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500"><tr>{["Protocolo", "Categoria", "Bairro", "Status", "Prioridade", "Responsável", "Criada"].map((h) => <th key={h} className="px-4 py-3 font-semibold">{h}</th>)}</tr></thead>
              <tbody className="divide-y divide-slate-100">
                {list.slice(0, 100).map((r) => (
                  <tr key={r.id} className="transition hover:bg-slate-50/70">
                    <td className="px-4 py-3"><Link href={`/gabinete/solicitacoes/detalhe?id=${r.id}`} className="font-semibold text-brand hover:underline" data-testid="row-link">{r.protocolo}</Link>{r.novaMensagemCidadao && <MessageSquare size={13} className="ml-1.5 inline text-amber-500" aria-label="Nova mensagem do cidadão" />}<div className="text-xs text-slate-400">{citizen(r.citizenId)?.nome}</div></td>
                    <td className="px-4 py-3"><span className="flex items-center gap-2"><CategoryIcon id={r.categoria} size={14} />{CATEGORY_BY_ID[r.categoria].label}</span></td>
                    <td className="px-4 py-3 text-slate-600">{r.bairro}</td>
                    <td className="px-4 py-3"><StatusBadge status={r.status} short /></td>
                    <td className="px-4 py-3"><PriorityBadge p={r.prioridade} /></td>
                    <td className="px-4 py-3 text-slate-600">{staff(r.responsavelId)?.nome ?? <span className="text-slate-400">—</span>}</td>
                    <td className="px-4 py-3 text-slate-500">{fmtDate(r.criadoEm)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {list.length > 100 && <p className="border-t border-slate-100 p-3 text-center text-xs text-slate-400">Exibindo as 100 mais recentes. Refine os filtros.</p>}
        </div>
      ) : (
        <div className="-mx-4 flex gap-3 overflow-x-auto px-4 pb-4 sm:mx-0 sm:px-0" data-testid="kanban">
          {STATUS_ORDER.map((s) => {
            const col = list.filter((r) => r.status === s);
            return (
              <div
                key={s}
                onDragOver={(e) => { e.preventDefault(); setOver(s); }}
                onDragLeave={() => setOver(null)}
                onDrop={() => { const r = data.requests.find((x) => x.id === drag); if (r) move(r, s); setDrag(null); setOver(null); }}
                className={cn("w-72 shrink-0 rounded-2xl bg-slate-100/80 p-2.5 transition", over === s && "bg-brand-50 ring-2 ring-brand/30")}
              >
                <div className="mb-2 flex items-center justify-between px-1.5"><span className="flex items-center gap-2 text-sm font-semibold"><i className={cn("h-2 w-2 rounded-full", STATUS_META[s].dot)} />{STATUS_META[s].label.replace(" ao órgão responsável", "")}</span><span className="rounded-full bg-white px-2 text-xs font-bold text-slate-500">{col.length}</span></div>
                <div className="max-h-[68dvh] space-y-2 overflow-y-auto pr-0.5">
                  {col.slice(0, 30).map((r) => (
                    <div key={r.id} draggable onDragStart={() => setDrag(r.id)} onDragEnd={() => { setDrag(null); setOver(null); }} className={cn("card cursor-grab p-3 active:cursor-grabbing", drag === r.id && "opacity-40")} data-testid="kanban-card">
                      <div className="flex items-start gap-2">
                        <CategoryIcon id={r.categoria} size={14} />
                        <div className="min-w-0 flex-1">
                          <Link href={`/gabinete/solicitacoes/detalhe?id=${r.id}`} className="block truncate text-sm font-semibold hover:text-brand">{CATEGORY_BY_ID[r.categoria].label}</Link>
                          <p className="truncate text-xs text-slate-500">{r.protocolo} · {r.bairro}</p>
                        </div>
                        <GripVertical size={14} className="mt-0.5 text-slate-300" aria-hidden />
                      </div>
                      <div className="mt-2 flex items-center justify-between"><PriorityBadge p={r.prioridade} /><span className="text-[11px] text-slate-400">{timeAgo(r.atualizadoEm)}</span></div>
                      <select aria-label={`Mover ${r.protocolo}`} value={r.status} onChange={(e) => move(r, e.target.value as Status)} className="mt-2 w-full rounded-lg border border-slate-200 bg-white px-2 py-1.5 text-xs">
                        {STATUS_ORDER.map((x) => <option key={x} value={x}>{STATUS_META[x].label}</option>)}
                      </select>
                    </div>
                  ))}
                  {col.length === 0 && <p className="rounded-xl border border-dashed border-slate-300 p-4 text-center text-xs text-slate-400">Solte aqui</p>}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </>
  );
}
