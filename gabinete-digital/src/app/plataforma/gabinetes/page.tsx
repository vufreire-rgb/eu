"use client";

import { Building2 } from "lucide-react";
import Link from "next/link";
import { PageHeader } from "@/components/ui";
import { useStore } from "@/lib/store";
import { cn, fmtDate } from "@/lib/utils";
import type { Tenant } from "@/lib/types";

const TONE = { ativa: "bg-ok-50 text-ok-700", teste: "bg-amber-50 text-amber-700", inadimplente: "bg-red-50 text-red-700", cancelada: "bg-slate-100 text-slate-500" } as const;
const PRICE = { Essencial: 297, Profissional: 597, Premium: 1197 } as const;

export default function Gabinetes() {
  const { data, updateTenant, toast } = useStore();
  return (
    <>
      <PageHeader title="Gabinetes cadastrados" subtitle="Cada gabinete possui dados isolados (tenant_id). Planos e assinaturas são simulados." actions={<Link href="/plataforma/novo" className="btn-primary btn-sm">Novo gabinete</Link>} />
      <div className="grid gap-3 md:grid-cols-2" data-testid="tenants">
        {data.tenants.map((t) => (
          <section key={t.id} className="card p-5">
            <div className="flex items-center gap-3">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <span className="flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-2xl text-white" style={{ background: t.corPrimaria }}>{t.logo ? <img src={t.logo} alt="" className="h-9 w-9 object-contain" /> : <Building2 size={22} />}</span>
              <div className="min-w-0 flex-1"><p className="truncate font-semibold">{t.cargo} {t.parlamentar}</p><p className="text-xs text-slate-500">{t.municipio}/{t.uf} · desde {fmtDate(t.criadoEm)}</p></div>
              <span className={cn("chip capitalize", TONE[t.assinatura])}>{t.assinatura}</span>
            </div>
            <div className="mt-4 grid grid-cols-3 gap-2 text-center">
              {[["Usuários", t.usuarios], ["Solicitações", t.solicitacoes], ["Mensalidade", `R$ ${PRICE[t.plano]}`]].map(([k, v]) => <div key={k as string} className="rounded-xl bg-slate-50 p-2"><p className="text-base font-bold">{v}</p><p className="text-[11px] text-slate-500">{k}</p></div>)}
            </div>
            <div className="mt-4 grid grid-cols-2 gap-2">
              <label><span className="label">Plano</span><select className="input" value={t.plano} onChange={(e) => { updateTenant(t.id, { plano: e.target.value as Tenant["plano"] }); toast("success", "Plano atualizado (simulado)."); }}>{Object.keys(PRICE).map((p) => <option key={p}>{p}</option>)}</select></label>
              <label><span className="label">Assinatura</span><select className="input" value={t.assinatura} onChange={(e) => { updateTenant(t.id, { assinatura: e.target.value as Tenant["assinatura"] }); toast("success", "Status da assinatura atualizado (simulado)."); }}>{Object.keys(TONE).map((p) => <option key={p}>{p}</option>)}</select></label>
            </div>
            <p className="mt-3 text-[11px] text-slate-400">Isolamento: todos os registros deste gabinete carregam tenant_id = <code>{t.id}</code>.</p>
          </section>
        ))}
      </div>
    </>
  );
}
