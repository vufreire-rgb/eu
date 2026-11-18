"use client";

import { Flame, Info } from "lucide-react";
import Link from "next/link";
import { useMemo, useState } from "react";
import { CityMap } from "@/components/city-map";
import { CategoryIcon } from "@/components/category";
import { PageHeader, StatusBadge } from "@/components/ui";
import { BAIRROS, CATEGORIES, CATEGORY_BY_ID, STATUS_META, STATUS_ORDER } from "@/lib/constants";
import { useStore } from "@/lib/store";
import { cn } from "@/lib/utils";

export default function MapPage() {
  const { data } = useStore();
  const [cat, setCat] = useState("");
  const [st, setSt] = useState("");
  const [heat, setHeat] = useState(true);
  const [sel, setSel] = useState<string | null>(null);

  const list = useMemo(() => data.requests.filter((r) => (!cat || r.categoria === cat) && (!st || r.status === st)), [data.requests, cat, st]);
  const rank = useMemo(() => {
    const c = BAIRROS.map((b) => ({ nome: b.nome, v: list.filter((r) => r.bairro === b.nome).length })).sort((a, b) => b.v - a.v);
    const max = Math.max(1, c[0]?.v ?? 1);
    return c.map((x) => ({ ...x, pct: (x.v / max) * 100 }));
  }, [list]);
  const selected = data.requests.find((r) => r.id === sel);

  return (
    <>
      <PageHeader title="Mapa de demandas" subtitle="Taubaté-SP · distribuição geográfica das solicitações" />
      <p className="mb-4 flex items-start gap-2 rounded-xl bg-amber-50 p-3 text-xs font-medium text-amber-800"><Info size={15} className="mt-0.5 shrink-0" /> Mapa ilustrativo: localizações e ocorrências são simuladas, sem relação com endereços reais.</p>
      <div className="grid gap-4 lg:grid-cols-3">
        <section className="card p-3.5 lg:col-span-2">
          <div className="mb-3 grid grid-cols-2 gap-2 sm:grid-cols-3">
            <select className="input" value={cat} onChange={(e) => { setCat(e.target.value); setSel(null); }} aria-label="Categoria"><option value="">Todas as categorias</option>{CATEGORIES.map((c) => <option key={c.id} value={c.id}>{c.label}</option>)}</select>
            <select className="input" value={st} onChange={(e) => { setSt(e.target.value); setSel(null); }} aria-label="Status"><option value="">Todos os status</option>{STATUS_ORDER.map((s) => <option key={s} value={s}>{STATUS_META[s].label}</option>)}</select>
            <button onClick={() => setHeat((h) => !h)} aria-pressed={heat} className={cn("btn-ghost col-span-2 sm:col-span-1", heat && "border-red-200 bg-red-50 text-red-700")}><Flame size={16} /> Concentração</button>
          </div>
          <CityMap heat={heat} markers={list.map((r) => ({ id: r.id, x: r.mapa.x, y: r.mapa.y, categoria: r.categoria, label: `${r.protocolo} · ${CATEGORY_BY_ID[r.categoria].label} · ${r.bairro}` }))} onSelect={setSel} />
          <div className="mt-3 grid grid-cols-2 gap-x-3 gap-y-1.5 text-[11px] text-slate-600 sm:grid-cols-5">
            {CATEGORIES.map((c) => <span key={c.id} className="flex min-w-0 items-center gap-1.5"><i className="block h-2 w-2 shrink-0 rounded-full" style={{ background: c.color }} /><span className="truncate">{c.label}</span></span>)}
          </div>
          {selected && (
            <Link href={`/gabinete/solicitacoes/detalhe?id=${selected.id}`} className="mt-3 flex animate-pop items-center gap-3 rounded-xl bg-slate-50 p-3 hover:bg-slate-100">
              <CategoryIcon id={selected.categoria} size={16} />
              <span className="min-w-0 flex-1"><span className="block truncate text-sm font-semibold">{selected.protocolo} · {selected.rua}</span><span className="text-xs text-slate-500">{selected.bairro}</span></span>
              <StatusBadge status={selected.status} short />
            </Link>
          )}
        </section>
        <section className="card p-5">
          <h2 className="font-bold">Concentração por bairro</h2>
          <p className="mb-3 text-xs text-slate-500">{list.length} solicitações no filtro</p>
          <ul className="space-y-2.5" data-testid="rank">
            {rank.map((b, i) => (
              <li key={b.nome}>
                <div className="mb-1 flex justify-between text-xs"><span className={cn("font-medium", i < 3 && "text-navy")}>{b.nome}</span><b>{b.v}</b></div>
                <div className="h-1.5 overflow-hidden rounded-full bg-slate-100"><div className={cn("h-full rounded-full transition-all", i < 3 ? "bg-red-500" : "bg-brand")} style={{ width: `${b.pct}%` }} /></div>
              </li>
            ))}
          </ul>
        </section>
      </div>
    </>
  );
}
