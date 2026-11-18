"use client";

import { Bell, CheckCheck } from "lucide-react";
import Link from "next/link";
import { Empty, PageHeader } from "@/components/ui";
import { useStore } from "@/lib/store";
import { cn, timeAgo } from "@/lib/utils";

export default function Notifications() {
  const { data, session, markRead, toast } = useStore();
  const list = data.notifications.filter((n) => n.citizenId === session.citizenId).sort((a, b) => +new Date(b.em) - +new Date(a.em));
  const unread = list.filter((n) => !n.lida).length;
  return (
    <div className="mx-auto max-w-2xl">
      <PageHeader title="Notificações" subtitle={unread ? `${unread} não lidas` : "Tudo em dia"} actions={unread > 0 && <button className="btn-ghost btn-sm" onClick={() => { markRead(session.citizenId); toast("success", "Notificações marcadas como lidas."); }}><CheckCheck size={15} /> Marcar todas como lidas</button>} />
      {list.length === 0 ? <Empty icon={Bell} title="Sem notificações" text="Quando o gabinete atualizar uma solicitação, você será avisado aqui." /> : (
        <ul className="space-y-2.5" data-testid="notifications">
          {list.map((n) => (
            <li key={n.id}>
              <Link href={`/cidadao/solicitacoes/detalhe?id=${n.requestId}`} onClick={() => markRead(session.citizenId, n.id)} className={cn("card flex gap-3 p-4 transition hover:shadow-pop", !n.lida && "border-brand/30 bg-brand-50/50")}>
                <span className={cn("mt-1.5 h-2 w-2 shrink-0 rounded-full", n.lida ? "bg-transparent" : "bg-brand")} aria-label={n.lida ? "Lida" : "Não lida"} />
                <span className="min-w-0 flex-1"><span className="block text-sm font-semibold">{n.titulo}</span><span className="mt-0.5 block text-sm text-slate-600">{n.texto}</span></span>
                <span className="shrink-0 text-xs text-slate-400">{timeAgo(n.em)}</span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
