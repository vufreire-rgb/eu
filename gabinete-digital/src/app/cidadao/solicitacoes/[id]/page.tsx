"use client";

import { ArrowLeft, MapPin, Hash } from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect } from "react";
import { CategoryIcon } from "@/components/category";
import { Conversation, LegalNote, PhotoGrid, Timeline } from "@/components/request-parts";
import { Empty, StatusBadge } from "@/components/ui";
import { CATEGORY_BY_ID, STATUS_META } from "@/lib/constants";
import { useStore } from "@/lib/store";
import { fmtDate, fmtDateTime } from "@/lib/utils";
import { SearchX } from "lucide-react";

export default function CitizenRequestDetail() {
  const { id } = useParams<{ id: string }>();
  const { data, session, citizenMessage, markRead, toast } = useStore();
  const r = data.requests.find((x) => x.id === id && x.citizenId === session.citizenId);

  useEffect(() => {
    if (r) data.notifications.filter((n) => n.requestId === r.id && !n.lida).forEach((n) => markRead(session.citizenId, n.id));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [r?.id, data.notifications.length]);

  if (!r) return <Empty icon={SearchX} title="Solicitação não encontrada" text="Ela pode pertencer a outro perfil de cidadão." action={<Link href="/cidadao/solicitacoes" className="btn-primary">Minhas solicitações</Link>} />;
  const cat = CATEGORY_BY_ID[r.categoria];
  // observações internas e histórico interno nunca são exibidos aqui

  return (
    <div className="mx-auto max-w-3xl space-y-5">
      <Link href="/cidadao/solicitacoes" className="inline-flex items-center gap-1 text-sm font-medium text-slate-500 hover:text-navy"><ArrowLeft size={16} /> Solicitações</Link>
      <section className="card p-5">
        <div className="flex items-start gap-3">
          <CategoryIcon id={r.categoria} size={22} />
          <div className="min-w-0 flex-1">
            <h1 className="text-lg font-bold leading-tight">{cat.label}</h1>
            <p className="mt-0.5 flex items-center gap-1 text-xs text-slate-500"><Hash size={12} /> <span data-testid="protocolo">{r.protocolo}</span> · {fmtDate(r.criadoEm)}</p>
          </div>
          <StatusBadge status={r.status} short />
        </div>
        <p className="mt-3 flex items-start gap-1.5 text-sm text-slate-600"><MapPin size={15} className="mt-0.5 shrink-0 text-slate-400" /> {r.rua}, {r.numero} — {r.bairro}</p>
        <p className="mt-3 text-sm">{r.descricao}</p>
        {r.fotos.length > 0 && <div className="mt-4"><PhotoGrid photos={r.fotos} /></div>}
        <div className="mt-4 rounded-xl bg-slate-50 p-3 text-sm" data-testid="status-hint">
          <p className="font-semibold">{STATUS_META[r.status].label}</p>
          <p className="text-slate-600">{STATUS_META[r.status].hint}</p>
          {r.prazo && <p className="mt-1 text-xs text-slate-500">Prazo informado pelo órgão: {fmtDate(r.prazo)} (estimativa, sem garantia de execução)</p>}
        </div>
      </section>

      <section className="card p-5">
        <h2 className="mb-4 font-bold">Acompanhamento</h2>
        <Timeline items={r.timeline} />
      </section>

      <section className="card p-5">
        <h2 className="mb-3 font-bold">Mensagens com o gabinete</h2>
        <Conversation messages={r.mensagens} me="cidadao" label="Mensagem complementar" placeholder="Escreva uma informação complementar…" onSend={(t) => { citizenMessage(r.id, t); toast("success", "Mensagem enviada ao gabinete."); }} />
      </section>

      <LegalNote />
      <p className="text-center text-[11px] text-slate-400">Última atualização: {fmtDateTime(r.atualizadoEm)}</p>
    </div>
  );
}
