"use client";

import { Building2, CreditCard, Inbox, MapPinned, Users } from "lucide-react";
import Link from "next/link";
import { PageHeader, Stat } from "@/components/ui";
import { useStore } from "@/lib/store";
import { cn } from "@/lib/utils";
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

const PRICE = { Essencial: 297, Profissional: 597, Premium: 1197 } as const;
const SUB_TONE = { ativa: "bg-ok-50 text-ok-700", teste: "bg-amber-50 text-amber-700", inadimplente: "bg-red-50 text-red-700", cancelada: "bg-slate-100 text-slate-500" } as const;

export default function PlatformHome() {
  const { data } = useStore();
  const t = data.tenants;
  const mrr = t.filter((x) => x.assinatura === "ativa").reduce((s, x) => s + PRICE[x.plano], 0);
  const chart = t.map((x) => ({ nome: x.municipio, v: x.solicitacoes }));
  return (
    <>
      <PageHeader title="Visão geral da plataforma" subtitle="Administração SaaS · dados e planos simulados — sem cobrança real" actions={<Link href="/plataforma/novo" className="btn-primary btn-sm">Novo gabinete</Link>} />
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-5">
        <Stat label="Gabinetes" value={t.length} icon={Building2} />
        <Stat label="Municípios" value={new Set(t.map((x) => x.municipio)).size} icon={MapPinned} tone="bg-cyan-50 text-cyan-600" />
        <Stat label="Usuários" value={t.reduce((s, x) => s + x.usuarios, 0)} icon={Users} tone="bg-violet-50 text-violet-600" />
        <Stat label="Solicitações" value={t.reduce((s, x) => s + x.solicitacoes, 0)} icon={Inbox} tone="bg-amber-50 text-amber-600" />
        <Stat label="Receita mensal (simulada)" value={`R$ ${mrr.toLocaleString("pt-BR")}`} icon={CreditCard} tone="bg-ok-50 text-ok" />
      </div>
      <div className="mt-5 grid gap-4 lg:grid-cols-5">
        <section className="card p-5 lg:col-span-3">
          <h2 className="font-bold">Volume de solicitações por gabinete</h2>
          <div className="mt-3 h-56" role="img" aria-label="Gráfico de barras: solicitações por gabinete">
            <ResponsiveContainer><BarChart data={chart} margin={{ left: -20 }}><CartesianGrid stroke="#eef2f7" vertical={false} /><XAxis dataKey="nome" tickLine={false} axisLine={false} fontSize={11} /><YAxis tickLine={false} axisLine={false} fontSize={12} /><Tooltip contentStyle={{ borderRadius: 12, fontSize: 12 }} cursor={{ fill: "#f4f6f9" }} /><Bar dataKey="v" name="Solicitações" fill="#2563EB" radius={[8, 8, 0, 0]} /></BarChart></ResponsiveContainer>
          </div>
        </section>
        <section className="card p-5 lg:col-span-2">
          <h2 className="mb-3 font-bold">Assinaturas</h2>
          <ul className="space-y-2.5">
            {t.map((x) => (
              <li key={x.id} className="flex items-center gap-3 text-sm"><span className="h-8 w-8 shrink-0 rounded-xl" style={{ background: x.corPrimaria }} /><span className="min-w-0 flex-1"><span className="block truncate font-semibold">{x.cargo} {x.parlamentar}</span><span className="text-xs text-slate-500">{x.municipio}/{x.uf} · {x.plano}</span></span><span className={cn("chip capitalize", SUB_TONE[x.assinatura])}>{x.assinatura}</span></li>
            ))}
          </ul>
          <Link href="/plataforma/gabinetes" className="mt-4 block text-sm font-medium text-brand">Gerenciar gabinetes →</Link>
        </section>
      </div>
    </>
  );
}
