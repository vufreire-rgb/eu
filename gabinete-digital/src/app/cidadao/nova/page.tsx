"use client";

import { ArrowLeft, ArrowRight, Camera, Check, CheckCircle2, ImagePlus, MapPin, Send, Trash2 } from "lucide-react";
import Link from "next/link";
import { useRef, useState } from "react";
import { CATEGORY_ICON } from "@/components/category";
import { CityMap } from "@/components/city-map";
import { LegalNote } from "@/components/request-parts";
import { Field, Spinner } from "@/components/ui";
import { BAIRROS, CATEGORIES, CATEGORY_BY_ID } from "@/lib/constants";
import { useStore } from "@/lib/store";
import type { CategoryId, RequestItem } from "@/lib/types";
import { cn, compressImage } from "@/lib/utils";

const STEPS = ["Categoria", "Local", "Descrição", "Fotos", "Revisão"];

export default function NewRequest() {
  const { createRequest, toast } = useStore();
  const [step, setStep] = useState(0);
  const [cat, setCat] = useState<CategoryId | null>(null);
  const [bairro, setBairro] = useState("");
  const [rua, setRua] = useState("");
  const [numero, setNumero] = useState("");
  const [pin, setPin] = useState<{ x: number; y: number } | null>(null);
  const [desc, setDesc] = useState("");
  const [fotos, setFotos] = useState<string[]>([]);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState<RequestItem | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const validate = (s: number) => {
    const e: Record<string, string> = {};
    if (s === 0 && !cat) e.cat = "Selecione uma categoria para continuar.";
    if (s === 1) {
      if (!bairro) e.bairro = "Informe o bairro.";
      if (rua.trim().length < 3) e.rua = "Informe a rua ou avenida.";
    }
    if (s === 2 && desc.trim().length < 15) e.desc = "Descreva o problema com pelo menos 15 caracteres.";
    setErrors(e);
    return Object.keys(e).length === 0;
  };
  const next = () => validate(step) && setStep((s) => s + 1);

  const addFiles = async (files: FileList | null) => {
    if (!files) return;
    const room = 3 - fotos.length;
    if (room <= 0) { toast("error", "Máximo de 3 fotos."); return; }
    try {
      const out: string[] = [];
      for (const f of Array.from(files).slice(0, room)) {
        if (!f.type.startsWith("image/")) { toast("error", `“${f.name}” não é uma imagem.`); continue; }
        out.push(await compressImage(f));
      }
      setFotos((p) => [...p, ...out]);
    } catch (e) {
      toast("error", e instanceof Error ? e.message : "Falha ao carregar a imagem.");
    }
    if (fileRef.current) fileRef.current.value = "";
  };

  const submit = async () => {
    if (!cat) return;
    setBusy(true);
    await new Promise((r) => setTimeout(r, 900));
    const b = BAIRROS.find((x) => x.nome === bairro);
    const mapa = pin ?? { x: (b?.x ?? 50) + 0, y: (b?.y ?? 50) + 0 };
    const r = createRequest({ categoria: cat, bairro, rua: rua.trim(), numero: numero.trim() || "s/n", mapa, descricao: desc.trim(), fotos });
    setBusy(false);
    setDone(r);
    toast("success", `Solicitação enviada! Protocolo ${r.protocolo}`);
  };

  if (done) {
    return (
      <div className="mx-auto max-w-md animate-pop py-8 text-center" data-testid="confirmacao">
        <span className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-ok-50 text-ok"><CheckCircle2 size={44} /></span>
        <h1 className="mt-5 text-2xl font-bold">Solicitação enviada</h1>
        <p className="mt-1 text-sm text-slate-500">Guarde o número do seu protocolo para acompanhar o andamento.</p>
        <div className="card mx-auto mt-5 p-5">
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Protocolo</p>
          <p className="mt-1 text-2xl font-bold tracking-wider text-brand" data-testid="novo-protocolo">{done.protocolo}</p>
          <p className="mt-2 text-sm text-slate-500">{CATEGORY_BY_ID[done.categoria].label} · {done.bairro}</p>
        </div>
        <LegalNote className="mt-4 text-left" />
        <div className="mt-6 flex flex-col gap-2">
          <Link href={`/cidadao/solicitacoes/${done.id}`} className="btn-primary" data-testid="ver-solicitacao">Acompanhar solicitação</Link>
          <Link href="/cidadao" className="btn-ghost">Voltar ao início</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl">
      <div className="mb-5">
        <Link href="/cidadao" className="mb-3 inline-flex items-center gap-1 text-sm font-medium text-slate-500 hover:text-navy"><ArrowLeft size={16} /> Cancelar</Link>
        <h1 className="text-2xl font-bold tracking-tight">Nova solicitação</h1>
        <ol className="mt-4 flex items-center gap-1.5" aria-label="Etapas">
          {STEPS.map((s, i) => (
            <li key={s} className="flex flex-1 flex-col gap-1.5" aria-current={i === step ? "step" : undefined}>
              <span className={cn("h-1.5 rounded-full transition-all", i <= step ? "bg-brand" : "bg-slate-200")} />
              <span className={cn("hidden text-[11px] font-medium sm:block", i === step ? "text-brand" : "text-slate-400")}>{s}</span>
            </li>
          ))}
        </ol>
        <p className="mt-2 text-xs font-medium text-slate-500 sm:hidden">Etapa {step + 1} de 5 · {STEPS[step]}</p>
      </div>

      <div className="card animate-fade-up p-5 sm:p-6" key={step}>
        {step === 0 && (
          <div>
            <h2 className="text-lg font-bold">Qual é o assunto?</h2>
            <p className="mb-4 text-sm text-slate-500">Escolha a categoria que melhor descreve sua solicitação.</p>
            <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-3" role="radiogroup" aria-label="Categoria">
              {CATEGORIES.map((c) => {
                const I = CATEGORY_ICON[c.id];
                const on = cat === c.id;
                return (
                  <button key={c.id} role="radio" aria-checked={on} data-testid={`cat-${c.id}`} onClick={() => { setCat(c.id); setErrors({}); }} className={cn("relative flex flex-col items-start gap-2 rounded-2xl border p-3.5 text-left transition active:scale-[.98]", on ? "border-brand bg-brand-50 ring-2 ring-brand/20" : "border-slate-200 hover:border-slate-300")}>
                    <span className="flex h-9 w-9 items-center justify-center rounded-xl" style={{ background: c.color + "1f", color: c.color }}><I size={19} /></span>
                    <span className="text-sm font-semibold leading-tight">{c.label}</span>
                    {on && <Check size={16} className="absolute right-3 top-3 text-brand" />}
                  </button>
                );
              })}
            </div>
            {errors.cat && <p role="alert" className="mt-3 text-sm text-red-600">{errors.cat}</p>}
          </div>
        )}

        {step === 1 && (
          <div className="space-y-4">
            <div><h2 className="text-lg font-bold">Onde fica?</h2><p className="text-sm text-slate-500">Toque no mapa ilustrativo ou preencha o endereço.</p></div>
            <CityMap pin={pin} showLabels onPick={(p) => { setPin({ x: p.x, y: p.y }); setBairro(p.bairro); setErrors((e) => ({ ...e, bairro: "" })); }} />
            <p className="flex items-center gap-1.5 text-xs text-slate-500"><MapPin size={13} /> {pin ? `Ponto marcado próximo a ${bairro}.` : "Nenhum ponto marcado (opcional)."} Localização simulada.</p>
            <Field label="Bairro">
              <select className="input" value={bairro} onChange={(e) => setBairro(e.target.value)} data-testid="bairro">
                <option value="">Selecione…</option>
                {BAIRROS.map((b) => <option key={b.nome}>{b.nome}</option>)}
              </select>
              {errors.bairro && <span role="alert" className="mt-1 block text-xs text-red-600">{errors.bairro}</span>}
            </Field>
            <div className="grid grid-cols-3 gap-3">
              <div className="col-span-2"><Field label="Rua / Avenida"><input className="input" value={rua} onChange={(e) => setRua(e.target.value)} placeholder="Ex.: Rua das Palmeiras" data-testid="rua" />{errors.rua && <span role="alert" className="mt-1 block text-xs text-red-600">{errors.rua}</span>}</Field></div>
              <Field label="Número"><input className="input" value={numero} onChange={(e) => setNumero(e.target.value)} placeholder="Ref." inputMode="numeric" data-testid="numero" /></Field>
            </div>
          </div>
        )}

        {step === 2 && (
          <div>
            <h2 className="text-lg font-bold">Descreva o problema</h2>
            <p className="mb-4 text-sm text-slate-500">Quanto mais detalhes, melhor o encaminhamento. Não informe CPF, título de eleitor ou dados sensíveis.</p>
            <Field label="Descrição">
              <textarea className="input min-h-[140px]" value={desc} onChange={(e) => setDesc(e.target.value)} maxLength={800} placeholder="Ex.: O poste em frente ao número 120 está com a lâmpada queimada há duas semanas…" data-testid="descricao" />
              <span className="mt-1 flex justify-between text-xs text-slate-400"><span>{errors.desc && <span role="alert" className="text-red-600">{errors.desc}</span>}</span><span>{desc.length}/800</span></span>
            </Field>
            <p className="mt-3 rounded-xl bg-amber-50 p-3 text-xs text-amber-800">Em caso de emergência, ligue 192 (SAMU), 193 (Bombeiros) ou 190 (Polícia Militar). Este canal não substitui o atendimento de urgência.</p>
          </div>
        )}

        {step === 3 && (
          <div>
            <h2 className="text-lg font-bold">Adicionar fotos</h2>
            <p className="mb-4 text-sm text-slate-500">Opcional. Até 3 imagens do problema (evite fotografar rostos).</p>
            <input ref={fileRef} type="file" accept="image/*" multiple hidden onChange={(e) => addFiles(e.target.files)} data-testid="file-input" aria-label="Selecionar fotos" />
            <div className="grid grid-cols-3 gap-2.5">
              {fotos.map((f, i) => (
                <div key={i} className="group relative overflow-hidden rounded-2xl border border-slate-200">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={f} alt={`Prévia da foto ${i + 1}`} className="aspect-square w-full object-cover" data-testid="foto-preview" />
                  <button onClick={() => setFotos((p) => p.filter((_, k) => k !== i))} aria-label={`Remover foto ${i + 1}`} className="absolute right-1.5 top-1.5 rounded-full bg-navy/80 p-1.5 text-white"><Trash2 size={13} /></button>
                </div>
              ))}
              {fotos.length < 3 && (
                <button onClick={() => fileRef.current?.click()} className="flex aspect-square flex-col items-center justify-center gap-1.5 rounded-2xl border-2 border-dashed border-slate-300 text-slate-500 transition hover:border-brand hover:text-brand" data-testid="add-foto">
                  {fotos.length === 0 ? <Camera size={24} /> : <ImagePlus size={24} />}
                  <span className="text-xs font-medium">Adicionar</span>
                </button>
              )}
            </div>
          </div>
        )}

        {step === 4 && cat && (
          <div>
            <h2 className="text-lg font-bold">Revise e envie</h2>
            <p className="mb-4 text-sm text-slate-500">Confira as informações antes de registrar.</p>
            <dl className="divide-y divide-slate-100 text-sm">
              {[["Categoria", CATEGORY_BY_ID[cat].label], ["Local", `${rua}${numero ? `, ${numero}` : ""} — ${bairro}`], ["Mapa", pin ? "Ponto marcado (simulado)" : "Não marcado"], ["Descrição", desc]].map(([k, v]) => (
                <div key={k} className="flex flex-col gap-0.5 py-2.5 sm:flex-row sm:gap-4"><dt className="w-24 shrink-0 text-xs font-semibold uppercase tracking-wide text-slate-500">{k}</dt><dd className="flex-1">{v}</dd></div>
              ))}
            </dl>
            {fotos.length > 0 && <div className="mt-2 grid grid-cols-3 gap-2">{/* eslint-disable-next-line @next/next/no-img-element */}{fotos.map((f, i) => <img key={i} src={f} alt={`Foto ${i + 1}`} className="aspect-square rounded-xl object-cover" />)}</div>}
            <LegalNote className="mt-4" />
          </div>
        )}
      </div>

      <div className="sticky bottom-24 mt-5 flex gap-3 md:static">
        {step > 0 && <button className="btn-ghost flex-1 bg-white" onClick={() => setStep((s) => s - 1)} disabled={busy}><ArrowLeft size={17} /> Voltar</button>}
        {step < 4 ? (
          <button className="btn-primary flex-1" onClick={next} data-testid="next">Continuar <ArrowRight size={17} /></button>
        ) : (
          <button className="btn-primary flex-1" onClick={submit} disabled={busy} data-testid="enviar">{busy ? <><Spinner /> Enviando…</> : <><Send size={17} /> Enviar solicitação</>}</button>
        )}
      </div>
    </div>
  );
}
