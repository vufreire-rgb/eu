"use client";

import { Bell, CalendarDays, ChevronRight, FileText, MessageCircle, Newspaper, Plus } from "lucide-react";
import Link from "next/link";
import { CategoryIcon } from "@/components/category";
import { Avatar, Empty, StatusBadge } from "@/components/ui";
import { RequestCard } from "@/components/request-parts";
import { CATEGORY_BY_ID } from "@/lib/constants";
import { avatarDataUri } from "@/lib/seed";
import { useStore } from "@/lib/store";
import { fmtDate, timeAgo } from "@/lib/utils";

export default function CitizenHome() {
  const { data, session, tenant } = useStore();
  const me = data.citizens.find((c) => c.id === session.citizenId);
  const mine = data.requests.filter((r) => r.citizenId === session.citizenId).slice(0, 3);
  const recent = data.requests.filter((r) => r.citizenId !== session.citizenId).slice(0, 5);
  const posts = data.posts.filter((p) => p.publicado);
  const news = posts.filter((p) => p.tipo === "noticia").sort((a, b) => b.data.localeCompare(a.data)).slice(0, 3);
  const laws = posts.filter((p) => p.tipo === "projeto").sort((a, b) => b.data.localeCompare(a.data)).slice(0, 3);
  const today = new Date().toISOString().slice(0, 10);
  const agenda = posts.filter((p) => p.tipo === "agenda" && p.data >= today).sort((a, b) => a.data.localeCompare(b.data)).slice(0, 3);
  const unread = data.notifications.filter((n) => n.citizenId === session.citizenId && !n.lida).length;

  return (
    <div className="space-y-7">
      <section className="relative overflow-hidden rounded-3xl bg-navy p-5 text-white shadow-card sm:p-7">
        <div className="flex items-center gap-4">
          <Avatar src={tenant.foto ?? avatarDataUri(tenant.parlamentar, tenant.corPrimaria)} name={tenant.parlamentar} size={64} />
          <div>
            <p className="text-xs font-medium text-white/60">{tenant.cargo} · {tenant.municipio}/{tenant.uf}</p>
            <p className="text-lg font-bold">{tenant.parlamentar}</p>
          </div>
        </div>
        <h1 className="mt-5 text-2xl font-bold leading-snug tracking-tight sm:text-3xl">Olá, {me?.nome.split(" ")[0] ?? "cidadão"}. Como podemos ajudar?</h1>
        <p className="mt-1.5 max-w-lg text-sm text-white/70">Registre uma solicitação, acompanhe cada etapa e converse com o gabinete. Nós encaminhamos ao órgão competente e informamos o retorno.</p>
        <div className="mt-5 flex flex-wrap gap-2">
          <Link href="/cidadao/nova" data-testid="cta-nova" className="btn bg-white text-navy shadow-sm hover:bg-slate-100"><Plus size={18} /> Nova solicitação</Link>
          <Link href="/cidadao/notificacoes" className="btn bg-white/10 text-white hover:bg-white/20"><Bell size={17} /> {unread ? `${unread} ${unread === 1 ? "nova notificação" : "novas notificações"}` : "Notificações"}</Link>
        </div>
      </section>

      <section>
        <SectionTitle title="Minhas solicitações" href="/cidadao/solicitacoes" />
        {mine.length ? <div className="grid gap-2.5 md:grid-cols-3">{mine.map((r) => <RequestCard key={r.id} r={r} href={`/cidadao/solicitacoes/${r.id}`} />)}</div>
          : <Empty icon={FileText} title="Você ainda não registrou solicitações" text="Toque em “Nova solicitação” para começar." action={<Link href="/cidadao/nova" className="btn-primary">Nova solicitação</Link>} />}
      </section>

      <section>
        <SectionTitle title="Demandas recentes no município" />
        <div className="card divide-y divide-slate-100">
          {recent.map((r) => (
            <div key={r.id} className="flex items-center gap-3 p-3.5">
              <CategoryIcon id={r.categoria} size={16} />
              <div className="min-w-0 flex-1"><p className="truncate text-sm font-medium">{CATEGORY_BY_ID[r.categoria].label}</p><p className="text-xs text-slate-500">{r.bairro} · há {timeAgo(r.criadoEm)}</p></div>
              <StatusBadge status={r.status} short />
            </div>
          ))}
        </div>
        <p className="mt-1.5 text-[11px] text-slate-400">Informações anonimizadas: sem nome, protocolo ou endereço completo.</p>
      </section>

      <div className="grid gap-7 lg:grid-cols-2">
        <section>
          <SectionTitle title="Agenda pública" href="/cidadao/mandato?aba=agenda" />
          <div className="space-y-2.5">
            {agenda.map((a) => (
              <div key={a.id} className="card flex items-center gap-3 p-3.5">
                <span className="flex h-12 w-12 shrink-0 flex-col items-center justify-center rounded-xl bg-brand-50 text-brand"><CalendarDays size={16} /><span className="text-[10px] font-bold">{fmtDate(a.data).slice(0, 6)}</span></span>
                <div className="min-w-0"><p className="truncate text-sm font-semibold">{a.titulo}</p><p className="truncate text-xs text-slate-500">{a.hora} · {a.local}</p></div>
              </div>
            ))}
          </div>
        </section>
        <section>
          <SectionTitle title="Projetos de lei" href="/cidadao/mandato?aba=projeto" />
          <div className="space-y-2.5">
            {laws.map((p) => (
              <div key={p.id} className="card p-3.5"><p className="text-xs font-semibold text-brand">{p.numero}</p><p className="text-sm font-semibold">{p.titulo}</p><p className="text-xs text-slate-500">{p.situacao}</p></div>
            ))}
          </div>
        </section>
      </div>

      <section>
        <SectionTitle title="Notícias do mandato" href="/cidadao/mandato?aba=noticia" />
        <div className="grid gap-2.5 md:grid-cols-3">
          {news.map((n) => (
            <Link key={n.id} href="/cidadao/mandato?aba=noticia" className="card p-4 transition hover:shadow-pop">
              <Newspaper size={18} className="text-brand" />
              <p className="mt-2 text-sm font-semibold leading-snug">{n.titulo}</p>
              <p className="mt-1 line-clamp-2 text-xs text-slate-500">{n.resumo}</p>
              <p className="mt-2 text-[11px] text-slate-400">{fmtDate(n.data)}</p>
            </Link>
          ))}
        </div>
      </section>

      <Link href="/cidadao/contato" className="card flex items-center gap-3 p-4 transition hover:shadow-pop">
        <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-brand-50 text-brand"><MessageCircle size={20} /></span>
        <span className="flex-1"><span className="block text-sm font-semibold">Contato com o gabinete</span><span className="block text-xs text-slate-500">Telefone, endereço, horários e formulário de mensagem</span></span>
        <ChevronRight className="text-slate-300" />
      </Link>
    </div>
  );
}

function SectionTitle({ title, href }: { title: string; href?: string }) {
  return (
    <div className="mb-3 flex items-center justify-between">
      <h2 className="text-base font-bold">{title}</h2>
      {href && <Link href={href} className="flex items-center text-sm font-medium text-brand">Ver todos <ChevronRight size={16} /></Link>}
    </div>
  );
}
