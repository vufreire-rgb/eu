"use client";

import { Clock, Mail, MapPin, Phone, Send } from "lucide-react";
import { useState } from "react";
import { Field, PageHeader, Spinner } from "@/components/ui";
import { useStore } from "@/lib/store";

export default function Contato() {
  const { tenant, toast } = useStore();
  const [nome, setNome] = useState("");
  const [msg, setMsg] = useState("");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");
  const send = async () => {
    if (nome.trim().length < 2 || msg.trim().length < 10) { setErr("Informe seu nome e uma mensagem com ao menos 10 caracteres."); return; }
    setErr(""); setBusy(true);
    await new Promise((r) => setTimeout(r, 700));
    setBusy(false); setNome(""); setMsg("");
    toast("success", "Mensagem enviada ao gabinete (simulação).");
  };
  return (
    <div className="mx-auto max-w-2xl">
      <PageHeader title="Contato com o gabinete" subtitle={`${tenant.cargo} ${tenant.parlamentar} · ${tenant.municipio}/${tenant.uf}`} />
      <div className="card mb-4 divide-y divide-slate-100">
        {[[Phone, "Telefone", "(12) 0000-0000 (fictício)"], [Mail, "E-mail", "contato@demo.gabinetedigital.app"], [MapPin, "Endereço", "Câmara Municipal — gabinete (endereço ilustrativo)"], [Clock, "Atendimento", "Segunda a sexta, 9h às 17h"]].map(([I, k, v]) => {
          const Ic = I as typeof Phone;
          return <div key={k as string} className="flex items-center gap-3 p-4"><span className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-50 text-brand"><Ic size={18} /></span><div><p className="text-xs font-semibold uppercase tracking-wide text-slate-500">{k as string}</p><p className="text-sm">{v as string}</p></div></div>;
        })}
      </div>
      <div className="card space-y-4 p-5">
        <h2 className="font-bold">Enviar mensagem</h2>
        <Field label="Seu nome"><input className="input" value={nome} onChange={(e) => setNome(e.target.value)} /></Field>
        <Field label="Mensagem"><textarea className="input min-h-[110px]" value={msg} onChange={(e) => setMsg(e.target.value)} /></Field>
        {err && <p role="alert" className="text-sm text-red-600">{err}</p>}
        <button className="btn-primary w-full" onClick={send} disabled={busy}>{busy ? <><Spinner /> Enviando…</> : <><Send size={16} /> Enviar</>}</button>
        <p className="text-xs text-slate-400">Para solicitações com acompanhamento por protocolo, use “Nova solicitação”.</p>
      </div>
    </div>
  );
}
