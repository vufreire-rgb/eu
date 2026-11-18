"use client";

import { ArrowLeft, Printer, Save, SearchX } from "lucide-react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useEffect, useState, Suspense } from "react";
import { Empty, Field } from "@/components/ui";
import { CATEGORY_BY_ID, OFICIO_WATERMARK } from "@/lib/constants";
import { useStore } from "@/lib/store";
import { fmtLong } from "@/lib/utils";

interface Form { destinatario: string; secretaria: string; assunto: string; descricao: string; providencias: string; data: string; identificacao: string }

function Inner() {
  const id = useSearchParams().get("id") ?? "";
  const { data, tenant, saveOficio, toast, ready } = useStore();
  const r = data.requests.find((x) => x.id === id);
  const existing = data.oficios.find((o) => o.requestId === id);
  const [f, setF] = useState<Form | null>(null);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (!r || f) return;
    if (existing) { setF({ destinatario: existing.destinatario, secretaria: existing.secretaria, assunto: existing.assunto, descricao: existing.descricao, providencias: existing.providencias, data: existing.data, identificacao: existing.identificacao }); return; }
    const c = CATEGORY_BY_ID[r.categoria];
    setF({
      destinatario: `Ilmo(a). Sr(a). Secretário(a) — ${c.secretaria}`,
      secretaria: c.secretaria,
      assunto: `Solicitação de providências — ${c.label} — ${r.rua}, ${r.numero}, ${r.bairro}`,
      descricao: `Foi registrada neste gabinete, por meio do canal digital de atendimento (protocolo ${r.protocolo}), solicitação de munícipe relatando o seguinte: “${r.descricao}”\n\nLocal informado: ${r.rua}, ${r.numero}, bairro ${r.bairro}, ${tenant.municipio}/${tenant.uf}.`,
      providencias: "Diante do exposto, solicito, no âmbito da competência desse órgão, a avaliação da situação relatada e, se cabível, a adoção das providências necessárias, bem como informações sobre o andamento e o prazo estimado para o retorno a este gabinete, a fim de que o munícipe possa ser devidamente informado.",
      data: new Date().toISOString().slice(0, 10),
      identificacao: `${tenant.cargo} ${tenant.parlamentar}\nCâmara Municipal de ${tenant.municipio}`,
    });
  }, [r, existing, f, tenant]);

  if (!ready) return null;
  if (!r || !f) return <Empty icon={SearchX} title="Solicitação não encontrada" text="Não foi possível carregar os dados do ofício." action={<Link href="/gabinete/solicitacoes" className="btn-primary">Voltar</Link>} />;

  const set = (k: keyof Form) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => { setF({ ...f, [k]: e.target.value }); setSaved(false); };
  const save = () => {
    if (!f.destinatario.trim() || !f.assunto.trim() || !f.providencias.trim()) { toast("error", "Preencha destinatário, assunto e solicitação de providências."); return null; }
    const o = saveOficio({ ...f, requestId: r.id, id: existing?.id });
    setSaved(true);
    toast("success", `Ofício ${o.numero} salvo e anexado à solicitação.`);
    return o;
  };
  const print = () => { if (save()) setTimeout(() => window.print(), 150); };
  const numero = existing?.numero ?? `${String(data.oficios.length + 1).padStart(3, "0")}/${new Date().getFullYear()}-GAB`;

  return (
    <div>
      <div className="no-print mb-4 flex flex-wrap items-center justify-between gap-2">
        <Link href={`/gabinete/solicitacoes/detalhe?id=${r.id}`} className="inline-flex items-center gap-1 text-sm font-medium text-slate-500 hover:text-navy"><ArrowLeft size={16} /> Solicitação {r.protocolo}</Link>
        <div className="flex gap-2">
          <button className="btn-ghost btn-sm" onClick={save} data-testid="oficio-salvar"><Save size={15} /> {saved ? "Salvo" : "Salvar ofício"}</button>
          <button className="btn-primary btn-sm" onClick={print} data-testid="oficio-imprimir"><Printer size={15} /> Imprimir / salvar PDF</button>
        </div>
      </div>
      <div className="grid gap-5 lg:grid-cols-[minmax(0,380px)_minmax(0,1fr)]">
        <div className="card no-print space-y-3.5 self-start p-5">
          <h1 className="font-bold">Editar ofício</h1>
          <Field label="Destinatário"><input className="input" value={f.destinatario} onChange={set("destinatario")} data-testid="of-dest" /></Field>
          <Field label="Secretaria responsável"><input className="input" value={f.secretaria} onChange={set("secretaria")} /></Field>
          <Field label="Assunto"><input className="input" value={f.assunto} onChange={set("assunto")} /></Field>
          <Field label="Descrição da demanda"><textarea className="input min-h-[120px]" value={f.descricao} onChange={set("descricao")} /></Field>
          <Field label="Solicitação de providências"><textarea className="input min-h-[110px]" value={f.providencias} onChange={set("providencias")} /></Field>
          <Field label="Data"><input type="date" className="input" value={f.data} onChange={set("data")} /></Field>
          <Field label="Identificação parlamentar"><textarea className="input min-h-[64px]" value={f.identificacao} onChange={set("identificacao")} /></Field>
          <p className="text-xs text-slate-400">Os dados pessoais do cidadão não são incluídos no ofício.</p>
        </div>

        <div className="min-w-0 overflow-x-auto">
          <article className="print-area relative mx-auto min-h-[900px] w-full max-w-[794px] overflow-hidden bg-white p-8 shadow-pop sm:p-14" aria-label="Pré-visualização do ofício" data-testid="oficio-preview">
            <div aria-hidden className="pointer-events-none absolute inset-0 flex items-center justify-center">
              <span className="-rotate-[30deg] whitespace-nowrap text-center text-[28px] font-extrabold leading-tight tracking-wide text-slate-300/40 sm:text-[34px]">{OFICIO_WATERMARK}</span>
            </div>
            <div className="relative">
              <p className="mb-6 border border-red-300 bg-red-50 px-3 py-1.5 text-center text-[11px] font-bold tracking-wide text-red-700">{OFICIO_WATERMARK}</p>
              <header className="border-b-2 border-navy pb-4 text-center">
                <p className="text-sm font-bold uppercase tracking-widest">Câmara Municipal de {tenant.municipio}</p>
                <p className="text-xs uppercase tracking-wide text-slate-600">Gabinete {tenant.cargo === "Vereadora" ? "da Vereadora" : "do Vereador"} {tenant.parlamentar}</p>
              </header>
              <p className="mt-6 text-sm font-semibold">Ofício nº {numero}</p>
              <p className="text-right text-sm">{tenant.municipio}, {fmtLong(f.data)}.</p>
              <p className="mt-6 whitespace-pre-wrap text-sm font-semibold">{f.destinatario}</p>
              <p className="text-sm text-slate-600">{f.secretaria}</p>
              <p className="mt-6 text-sm"><b>Assunto:</b> {f.assunto}</p>
              <p className="mt-6 text-sm">Senhor(a) Secretário(a),</p>
              <p className="mt-4 whitespace-pre-wrap text-justify text-sm leading-relaxed">{f.descricao}</p>
              <p className="mt-4 whitespace-pre-wrap text-justify text-sm leading-relaxed">{f.providencias}</p>
              <p className="mt-4 text-justify text-sm leading-relaxed">Este ofício constitui encaminhamento parlamentar, nos termos da atuação fiscalizatória e representativa do mandato, não implicando execução direta de obras ou serviços pelo gabinete.</p>
              <p className="mt-4 text-sm">Atenciosamente,</p>
              <p className="mt-14 whitespace-pre-wrap text-sm font-semibold">{f.identificacao}</p>
              <footer className="mt-16 border-t border-slate-300 pt-3 text-center text-[10px] text-slate-500">Protocolo de origem: {r.protocolo} · Documento gerado pelo Gabinete Digital (protótipo)<br /><b>{OFICIO_WATERMARK}</b></footer>
            </div>
          </article>
        </div>
      </div>
    </div>
  );
}

export default function OficioPage() {
  return <Suspense><Inner /></Suspense>;
}
