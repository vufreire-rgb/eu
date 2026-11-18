"use client";

import { Building2, ChevronRight, Landmark, RotateCcw, ShieldCheck, UserRound, Users, Lock, FileText, Map as MapIcon, BellRing } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ROLE_META } from "@/lib/constants";
import { useStore } from "@/lib/store";
import type { Role } from "@/lib/types";
import { LoadingScreen } from "@/components/ui";

const ICONS = { cidadao: UserRound, assessor: Users, vereadora: Building2, admin: ShieldCheck };
const ROTEIRO = [
  "Perfil Cidadão → Nova solicitação (Iluminação pública) com foto",
  "Receba o protocolo e confirme o envio",
  "Alterne para Vereadora → abra a solicitação recém-criada",
  "Atribua a um assessor e gere o ofício",
  "Mude o status para “Encaminhada ao órgão responsável” e responda",
  "Volte ao Cidadão: resposta, novo status e notificação",
];

export default function Home() {
  const { ready, setRole, resetDemo, tenant, data } = useStore();
  const router = useRouter();
  if (!ready) return <LoadingScreen />;
  const go = (r: Role) => { setRole(r); router.push(ROLE_META[r].home); };

  return (
    <div className="min-h-dvh">
      <div className="bg-navy px-4 py-1.5 text-center text-[11px] font-semibold tracking-wide text-white/80">AMBIENTE DE DEMONSTRAÇÃO · dados fictícios · sem validade oficial</div>
      <main id="conteudo" className="mx-auto max-w-5xl px-4 pb-16 pt-10 sm:pt-16">
        <div className="animate-fade-up">
          <div className="mb-5 flex items-center gap-3">
            <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-navy text-white shadow-card"><Landmark /></span>
            <div>
              <p className="text-xl font-bold tracking-tight">Gabinete Digital</p>
              <p className="text-sm text-slate-500">Atendimento parlamentar · {tenant.municipio}/{tenant.uf}</p>
            </div>
          </div>
          <h1 className="max-w-2xl text-3xl font-bold leading-tight tracking-tight sm:text-5xl">O canal direto entre a população e o gabinete.</h1>
          <p className="mt-4 max-w-xl text-base text-slate-600">Solicitações com protocolo, acompanhamento em linha do tempo, ofícios e transparência do mandato — em um só lugar. Escolha um perfil para explorar a demonstração.</p>
        </div>

        <div className="mt-8 grid gap-3 sm:grid-cols-2" role="list">
          {(Object.keys(ROLE_META) as Role[]).map((r, i) => {
            const I = ICONS[r];
            return (
              <button key={r} role="listitem" data-testid={`enter-${r}`} onClick={() => go(r)} style={{ animationDelay: `${i * 60}ms` }} className="card group flex animate-fade-up items-center gap-4 p-4 text-left transition hover:-translate-y-0.5 hover:shadow-pop">
                <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-brand-50 text-brand transition group-hover:bg-brand group-hover:text-white"><I size={22} /></span>
                <span className="min-w-0 flex-1">
                  <span className="block font-semibold">{ROLE_META[r].label}</span>
                  <span className="block text-sm text-slate-500">{ROLE_META[r].desc}</span>
                </span>
                <ChevronRight className="text-slate-300 transition group-hover:translate-x-0.5 group-hover:text-brand" />
              </button>
            );
          })}
        </div>

        <div className="mt-8 grid gap-4 lg:grid-cols-3">
          <section className="card p-5 lg:col-span-2">
            <h2 className="font-semibold">Roteiro sugerido de demonstração</h2>
            <ol className="mt-3 space-y-2.5">
              {ROTEIRO.map((t, i) => (
                <li key={i} className="flex gap-3 text-sm text-slate-600">
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-brand-50 text-xs font-bold text-brand">{i + 1}</span>{t}
                </li>
              ))}
            </ol>
          </section>
          <section className="card space-y-3 p-5 text-sm text-slate-600">
            <h2 className="font-semibold text-navy">Dados do protótipo</h2>
            <p>{data.requests.length} solicitações · {data.citizens.length} cidadãos · {data.staff.length} assessores · {data.tenants.length} gabinetes fictícios.</p>
            <button className="btn-ghost btn-sm w-full" onClick={resetDemo} data-testid="reset-demo"><RotateCcw size={15} /> Restaurar dados demonstrativos</button>
            <Link href="/privacidade" className="flex items-center gap-2 font-medium text-brand"><Lock size={15} /> Política de privacidade (demonstrativa)</Link>
          </section>
        </div>

        <div className="mt-8 grid gap-3 sm:grid-cols-3">
          {[{ i: FileText, t: "Ofícios automáticos", d: "Modelo preenchido a partir da solicitação." }, { i: MapIcon, t: "Mapa de demandas", d: "Regiões com maior concentração de problemas." }, { i: BellRing, t: "Notificações", d: "O cidadão acompanha cada providência." }].map(({ i: I, t, d }) => (
            <div key={t} className="flex items-start gap-3 rounded-2xl p-3"><I className="mt-0.5 shrink-0 text-brand" size={20} /><p className="text-sm"><b>{t}</b><br /><span className="text-slate-500">{d}</span></p></div>
          ))}
        </div>
        <p className="mt-10 text-xs text-slate-400">O Gabinete Digital é um canal de atendimento parlamentar. Não é órgão executor de serviços municipais e não garante o atendimento das solicitações pela prefeitura.</p>
      </main>
    </div>
  );
}
