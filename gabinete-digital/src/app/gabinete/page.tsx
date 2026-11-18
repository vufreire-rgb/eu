"use client";

import { CheckCircle2, Clock, Inbox, PercentCircle, Send, Timer, TrendingUp, Hourglass } from "lucide-react";
import { useMemo } from "react";
import { Bar, BarChart, CartesianGrid, Cell, Line, LineChart, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { PageHeader, Stat } from "@/components/ui";
import { CATEGORIES } from "@/lib/constants";
import { useStore } from "@/lib/store";

const MONTHS = ["jan", "fev", "mar", "abr", "mai", "jun", "jul", "ago", "set", "out", "nov", "dez"];

export default function Dashboard() {
  const { data, tenant } = useStore();
  const m = useMemo(() => {
    const rs = data.requests;
    const now = Date.now();
    const novas = rs.filter((r) => r.status === "recebida" || now - +new Date(r.criadoEm) < 7 * 86400000).length;
    const pend = rs.filter((r) => ["recebida", "em_analise", "aguardando_retorno"].includes(r.status)).length;
    const enc = rs.filter((r) => ["encaminhada", "aguardando_retorno", "em_acompanhamento"].includes(r.status)).length;
    const conc = rs.filter((r) => r.status === "concluida").length;
    const done = rs.filter((r) => r.status === "concluida");
    const avg = done.length ? done.reduce((s, r) => s + (+new Date(r.atualizadoEm) - +new Date(r.criadoEm)), 0) / done.length / 86400000 : 0;
    const bairro = Object.entries(rs.reduce<Record<string, number>>((a, r) => ((a[r.bairro] = (a[r.bairro] ?? 0) + 1), a), {})).map(([nome, v]) => ({ nome, v })).sort((a, b) => b.v - a.v).slice(0, 8);
    const cat = CATEGORIES.map((c) => ({ nome: c.label, v: rs.filter((r) => r.categoria === c.id).length, color: c.color })).filter((c) => c.v).sort((a, b) => b.v - a.v);
    const evo = Array.from({ length: 8 }, (_, i) => {
      const d = new Date(); d.setMonth(d.getMonth() - (7 - i), 1);
      const key = `${d.getFullYear()}-${d.getMonth()}`;
      const inM = (iso: string) => { const x = new Date(iso); return `${x.getFullYear()}-${x.getMonth()}` === key; };
      return { mes: MONTHS[d.getMonth()], recebidas: rs.filter((r) => inM(r.criadoEm)).length, concluidas: rs.filter((r) => r.status === "concluida" && inM(r.atualizadoEm)).length };
    });
    return { total: rs.length, novas, pend, enc, conc, avg, taxa: rs.length ? Math.round((conc / rs.length) * 100) : 0, bairro, cat, evo };
  }, [data.requests]);

  const tip = { contentStyle: { borderRadius: 12, border: "1px solid #e2e8f0", fontSize: 12, boxShadow: "0 8px 24px rgba(20,40,63,.12)" } };

  return (
    <>
      <PageHeader title="Painel do gabinete" subtitle={`${tenant.cargo} ${tenant.parlamentar} · ${tenant.municipio}/${tenant.uf} — indicadores demonstrativos`} />
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4" data-testid="kpis">
        <Stat label="Total" value={m.total} icon={Inbox} />
        <Stat label="Novas" value={m.novas} icon={TrendingUp} tone="bg-amber-50 text-amber-600" sub="últimos 7 dias ou não lidas" />
        <Stat label="Pendentes" value={m.pend} icon={Hourglass} tone="bg-violet-50 text-violet-600" />
        <Stat label="Encaminhadas" value={m.enc} icon={Send} />
        <Stat label="Concluídas" value={m.conc} icon={CheckCircle2} tone="bg-ok-50 text-ok" />
        <Stat label="Tempo médio" value={`${m.avg.toFixed(0)} dias`} icon={Timer} tone="bg-cyan-50 text-cyan-600" sub="das concluídas" />
        <Stat label="Taxa de conclusão" value={`${m.taxa}%`} icon={PercentCircle} tone="bg-ok-50 text-ok" />
        <Stat label="Resposta inicial" value="< 2 dias" icon={Clock} tone="bg-slate-100 text-slate-600" sub="simulado" />
      </div>

      <div className="mt-5 grid gap-4 lg:grid-cols-3">
        <section className="card p-5 lg:col-span-2">
          <h2 className="mb-1 font-bold">Evolução mensal dos atendimentos</h2>
          <p className="mb-3 text-xs text-slate-500">Solicitações recebidas e concluídas por mês</p>
          <div className="h-64" role="img" aria-label="Gráfico de linhas: evolução mensal">
            <ResponsiveContainer>
              <LineChart data={m.evo} margin={{ left: -20, right: 8, top: 8 }}>
                <CartesianGrid stroke="#eef2f7" vertical={false} />
                <XAxis dataKey="mes" tickLine={false} axisLine={false} fontSize={12} />
                <YAxis tickLine={false} axisLine={false} fontSize={12} allowDecimals={false} />
                <Tooltip {...tip} />
                <Line type="monotone" dataKey="recebidas" name="Recebidas" stroke="#2563EB" strokeWidth={2.5} dot={{ r: 3 }} activeDot={{ r: 5 }} />
                <Line type="monotone" dataKey="concluidas" name="Concluídas" stroke="#16a34a" strokeWidth={2.5} dot={{ r: 3 }} activeDot={{ r: 5 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-2 flex gap-4 text-xs text-slate-500"><span className="flex items-center gap-1.5"><i className="h-2 w-2 rounded-full bg-brand" /> Recebidas</span><span className="flex items-center gap-1.5"><i className="h-2 w-2 rounded-full bg-ok" /> Concluídas</span></div>
        </section>

        <section className="card p-5">
          <h2 className="mb-1 font-bold">Demandas por categoria</h2>
          <p className="mb-2 text-xs text-slate-500">Distribuição do total</p>
          <div className="h-48" role="img" aria-label="Gráfico de rosca por categoria">
            <ResponsiveContainer>
              <PieChart>
                <Pie data={m.cat} dataKey="v" nameKey="nome" innerRadius={48} outerRadius={78} paddingAngle={2} stroke="none">
                  {m.cat.map((c) => <Cell key={c.nome} fill={c.color} />)}
                </Pie>
                <Tooltip {...tip} />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <ul className="mt-2 grid grid-cols-1 gap-y-1 text-xs min-[420px]:grid-cols-2 gap-x-3">
            {m.cat.slice(0, 6).map((c) => <li key={c.nome} className="flex min-w-0 items-center gap-1.5"><i className="block h-2 w-2 shrink-0 rounded-full" style={{ background: c.color }} /><span className="truncate">{c.nome}</span> <b>{c.v}</b></li>)}
          </ul>
        </section>

        <section className="card p-5 lg:col-span-3">
          <h2 className="mb-1 font-bold">Demandas por bairro</h2>
          <p className="mb-3 text-xs text-slate-500">Os 8 bairros com mais solicitações</p>
          <div className="h-64" role="img" aria-label="Gráfico de barras por bairro">
            <ResponsiveContainer>
              <BarChart data={m.bairro} margin={{ left: -20, right: 8 }}>
                <CartesianGrid stroke="#eef2f7" vertical={false} />
                <XAxis dataKey="nome" tickLine={false} axisLine={false} fontSize={11} interval={0} tickFormatter={(v: string) => (v.length > 11 ? v.slice(0, 10) + "…" : v)} />
                <YAxis tickLine={false} axisLine={false} fontSize={12} allowDecimals={false} />
                <Tooltip {...tip} cursor={{ fill: "#f4f6f9" }} />
                <Bar dataKey="v" name="Solicitações" fill="#2563EB" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </section>
      </div>
    </>
  );
}
