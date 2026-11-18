"use client";

import { FileText } from "lucide-react";
import Link from "next/link";
import { Empty, PageHeader } from "@/components/ui";
import { useStore } from "@/lib/store";
import { fmtDateTime } from "@/lib/utils";

export default function Oficios() {
  const { data } = useStore();
  const withDocs = data.requests.filter((r) => r.documentos.length > 0).slice(0, 15);
  return (
    <>
      <PageHeader title="Ofícios" subtitle="Documentos gerados a partir das solicitações — modelo demonstrativo" />
      {data.oficios.length > 0 && (
        <div className="card mb-5 divide-y divide-slate-100">
          {data.oficios.map((o) => {
            const r = data.requests.find((x) => x.id === o.requestId);
            return (
              <Link key={o.id} href={`/gabinete/oficio/${o.requestId}`} className="flex items-center gap-3 p-4 hover:bg-slate-50" data-testid="oficio-item">
                <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-50 text-brand"><FileText size={18} /></span>
                <span className="min-w-0 flex-1"><span className="block truncate text-sm font-semibold">Ofício {o.numero} — {o.assunto}</span><span className="block text-xs text-slate-500">{r?.protocolo} · {fmtDateTime(o.criadoEm)}</span></span>
              </Link>
            );
          })}
        </div>
      )}
      {data.oficios.length === 0 && <Empty icon={FileText} title="Nenhum ofício gerado ainda" text="Abra uma solicitação e use “Gerar ofício” para criar o primeiro." action={<Link href="/gabinete/solicitacoes" className="btn-primary">Ver solicitações</Link>} />}
      {withDocs.length > 0 && (
        <>
          <h2 className="mb-2 mt-6 font-bold">Solicitações com ofício registrado</h2>
          <div className="card divide-y divide-slate-100">
            {withDocs.map((r) => <Link key={r.id} href={`/gabinete/oficio/${r.id}`} className="flex items-center justify-between p-3.5 text-sm hover:bg-slate-50"><span>{r.documentos[0].nome}</span><span className="text-xs text-brand">Abrir modelo</span></Link>)}
          </div>
        </>
      )}
    </>
  );
}
