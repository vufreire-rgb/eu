"use client";

import { Building2, CheckCircle2, ImagePlus, Plus, X } from "lucide-react";
import Link from "next/link";
import { useRef, useState } from "react";
import { Avatar, Field, PageHeader, Spinner } from "@/components/ui";
import { avatarDataUri } from "@/lib/seed";
import { useStore } from "@/lib/store";
import type { Tenant } from "@/lib/types";
import { compressImage } from "@/lib/utils";

const PRESETS = [["#2563EB", "#14283F"], ["#0d9488", "#0f2f2c"], ["#7c3aed", "#2e1a5a"], ["#dc2626", "#3b1212"], ["#d97706", "#3a2406"]];

export default function NovoGabinete() {
  const { createTenant, toast } = useStore();
  const [nome, setNome] = useState("");
  const [cargo, setCargo] = useState("Vereador");
  const [municipio, setMunicipio] = useState("");
  const [uf, setUf] = useState("SP");
  const [plano, setPlano] = useState<Tenant["plano"]>("Essencial");
  const [c1, setC1] = useState("#2563EB");
  const [c2, setC2] = useState("#14283F");
  const [foto, setFoto] = useState<string | undefined>();
  const [logo, setLogo] = useState<string | undefined>();
  const [equipe, setEquipe] = useState<string[]>([]);
  const [novo, setNovo] = useState("");
  const [err, setErr] = useState("");
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState<Tenant | null>(null);
  const fRef = useRef<HTMLInputElement>(null);
  const lRef = useRef<HTMLInputElement>(null);

  const load = async (f: File | undefined, set: (s: string) => void) => {
    if (!f) return;
    try { set(await compressImage(f, 320)); } catch (e) { toast("error", e instanceof Error ? e.message : "Imagem inválida."); }
  };
  const submit = async () => {
    if (nome.trim().length < 3 || municipio.trim().length < 2) { setErr("Informe o nome do parlamentar e o município."); return; }
    setErr(""); setBusy(true);
    await new Promise((r) => setTimeout(r, 900));
    const t = createTenant({ parlamentar: nome.trim(), cargo, municipio: municipio.trim(), uf, plano, corPrimaria: c1, corSecundaria: c2, foto, logo, equipe });
    setBusy(false); setDone(t);
    toast("success", `Gabinete de ${t.municipio} criado (simulação).`);
  };

  if (done) {
    return (
      <div className="mx-auto max-w-md animate-pop py-10 text-center" data-testid="tenant-ok">
        <span className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-ok-50 text-ok"><CheckCircle2 size={36} /></span>
        <h1 className="mt-4 text-2xl font-bold">Gabinete criado</h1>
        <p className="mt-1 text-sm text-slate-500">{done.cargo} {done.parlamentar} · {done.municipio}/{done.uf} — período de teste simulado, com dados isolados por tenant_id.</p>
        <div className="mt-6 flex flex-col gap-2"><Link href="/plataforma/gabinetes" className="btn-primary">Ver gabinetes</Link><button className="btn-ghost" onClick={() => { setDone(null); setNome(""); setMunicipio(""); setEquipe([]); setFoto(undefined); setLogo(undefined); }}>Criar outro</button></div>
      </div>
    );
  }

  return (
    <>
      <PageHeader title="Novo gabinete" subtitle="Simulação de onboarding de um novo parlamentar — nenhum dado real é gravado" />
      <div className="grid gap-5 lg:grid-cols-5">
        <div className="card space-y-4 p-5 lg:col-span-3">
          <div className="grid gap-3 sm:grid-cols-3">
            <div className="sm:col-span-2"><Field label="Nome do parlamentar"><input className="input" value={nome} onChange={(e) => setNome(e.target.value)} placeholder="Nome fictício" data-testid="t-nome" /></Field></div>
            <Field label="Cargo"><select className="input" value={cargo} onChange={(e) => setCargo(e.target.value)}><option>Vereador</option><option>Vereadora</option></select></Field>
          </div>
          <div className="grid gap-3 sm:grid-cols-3">
            <div className="sm:col-span-2"><Field label="Município"><input className="input" value={municipio} onChange={(e) => setMunicipio(e.target.value)} data-testid="t-mun" /></Field></div>
            <Field label="UF"><input className="input" maxLength={2} value={uf} onChange={(e) => setUf(e.target.value.toUpperCase())} /></Field>
          </div>
          <Field label="Plano (simulado)"><select className="input" value={plano} onChange={(e) => setPlano(e.target.value as Tenant["plano"])}><option>Essencial</option><option>Profissional</option><option>Premium</option></select></Field>
          <div className="grid grid-cols-2 gap-3">
            <div><span className="label">Fotografia</span><input ref={fRef} type="file" accept="image/*" hidden onChange={(e) => load(e.target.files?.[0], setFoto)} aria-label="Enviar fotografia" /><button className="btn-ghost w-full" onClick={() => fRef.current?.click()}><ImagePlus size={16} /> {foto ? "Trocar" : "Enviar foto"}</button></div>
            <div><span className="label">Logotipo</span><input ref={lRef} type="file" accept="image/*" hidden onChange={(e) => load(e.target.files?.[0], setLogo)} aria-label="Enviar logotipo" /><button className="btn-ghost w-full" onClick={() => lRef.current?.click()}><ImagePlus size={16} /> {logo ? "Trocar" : "Enviar logo"}</button></div>
          </div>
          <div>
            <span className="label">Cores da identidade</span>
            <div className="flex flex-wrap items-center gap-2">
              {PRESETS.map(([a, b]) => <button key={a} aria-label={`Paleta ${a}`} onClick={() => { setC1(a); setC2(b); }} className="flex overflow-hidden rounded-full ring-2 ring-white outline outline-1 outline-slate-200"><i className="h-8 w-8" style={{ background: a }} /><i className="h-8 w-4" style={{ background: b }} /></button>)}
              <label className="flex items-center gap-1.5 text-xs"><input type="color" value={c1} onChange={(e) => setC1(e.target.value)} aria-label="Cor primária" className="h-8 w-8 rounded" /> primária</label>
              <label className="flex items-center gap-1.5 text-xs"><input type="color" value={c2} onChange={(e) => setC2(e.target.value)} aria-label="Cor secundária" className="h-8 w-8 rounded" /> secundária</label>
            </div>
          </div>
          <div>
            <span className="label">Equipe inicial</span>
            <div className="flex gap-2"><input className="input" value={novo} onChange={(e) => setNovo(e.target.value)} placeholder="Nome do assessor" onKeyDown={(e) => { if (e.key === "Enter" && novo.trim()) { setEquipe([...equipe, novo.trim()]); setNovo(""); } }} /><button className="btn-dark" aria-label="Adicionar assessor" onClick={() => { if (novo.trim()) { setEquipe([...equipe, novo.trim()]); setNovo(""); } }}><Plus size={16} /></button></div>
            <div className="mt-2 flex flex-wrap gap-2">{equipe.map((e, i) => <span key={i} className="chip bg-slate-100 text-slate-700">{e}<button aria-label={`Remover ${e}`} onClick={() => setEquipe(equipe.filter((_, k) => k !== i))}><X size={12} /></button></span>)}</div>
          </div>
          {err && <p role="alert" className="text-sm text-red-600">{err}</p>}
          <button className="btn-primary w-full" onClick={submit} disabled={busy} data-testid="t-criar">{busy ? <><Spinner /> Criando…</> : "Criar gabinete (simulação)"}</button>
        </div>

        <aside className="lg:col-span-2">
          <div className="card sticky top-20 overflow-hidden">
            <p className="px-5 pt-4 text-xs font-semibold uppercase tracking-wide text-slate-500">Pré-visualização</p>
            <div className="m-4 rounded-2xl p-5 text-white" style={{ background: c2 }}>
              <div className="flex items-center gap-3">
                <Avatar src={foto ?? avatarDataUri(nome || "Novo Gabinete", c1)} name={nome || "Novo"} size={56} />
                <div><p className="text-xs text-white/60">{cargo} · {municipio || "Município"}/{uf}</p><p className="font-bold">{nome || "Nome do parlamentar"}</p></div>
              </div>
              <div className="mt-4 flex items-center gap-2"><span className="flex h-9 w-9 items-center justify-center overflow-hidden rounded-xl bg-white/15">{/* eslint-disable-next-line @next/next/no-img-element */}{logo ? <img src={logo} alt="" className="h-6 w-6 object-contain" /> : <Building2 size={18} />}</span><span className="rounded-xl px-4 py-2 text-sm font-semibold" style={{ background: c1 }}>Nova solicitação</span></div>
            </div>
            <p className="px-5 pb-4 text-xs text-slate-400">Arquitetura multi-gabinete: dados isolados por tenant_id.</p>
          </div>
        </aside>
      </div>
    </>
  );
}
