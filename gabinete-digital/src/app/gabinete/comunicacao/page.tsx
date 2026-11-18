"use client";

import { CalendarDays, Edit3, Eye, EyeOff, Landmark, Megaphone, Newspaper, Plus, ScrollText, Trash2 } from "lucide-react";
import { useState } from "react";
import { Empty, Field, Modal, PageHeader } from "@/components/ui";
import { POST_TYPES } from "@/lib/constants";
import { useStore } from "@/lib/store";
import type { Post, PostType } from "@/lib/types";
import { cn, fmtDate } from "@/lib/utils";

const ICON = { noticia: Newspaper, projeto: Landmark, agenda: CalendarDays, informativo: Megaphone, relatorio: ScrollText };
const BLOCK = /(vote em|peço (o )?seu voto|peco (o )?seu voto|pedido de voto|campanha eleitoral|candidat[oa] a |reeleição|reeleicao|número \d{2,5}\b)/i;

type Draft = Omit<Post, "id" | "tenantId"> & { id?: string };
const blank = (tipo: PostType = "noticia"): Draft => ({ tipo, titulo: "", resumo: "", corpo: "", data: new Date().toISOString().slice(0, 10), publicado: true, numero: "", situacao: "", local: "", hora: "" });

export default function Comunicacao() {
  const { data, savePost, deletePost, toast } = useStore();
  const [filter, setFilter] = useState<PostType | "todos">("todos");
  const [edit, setEdit] = useState<Draft | null>(null);
  const [del, setDel] = useState<Post | null>(null);
  const [err, setErr] = useState("");
  const list = data.posts.filter((p) => filter === "todos" || p.tipo === filter).sort((a, b) => b.data.localeCompare(a.data));

  const submit = () => {
    if (!edit) return;
    if (edit.titulo.trim().length < 5 || edit.resumo.trim().length < 5 || edit.corpo.trim().length < 10) { setErr("Preencha título, resumo e conteúdo."); return; }
    if (BLOCK.test(`${edit.titulo} ${edit.resumo} ${edit.corpo}`)) { setErr("O conteúdo parece conter propaganda ou pedido de voto. A plataforma admite apenas conteúdo informativo e institucional."); return; }
    savePost(edit);
    toast("success", edit.id ? "Publicação atualizada." : "Publicação criada e disponível ao cidadão.");
    setEdit(null); setErr("");
  };
  const set = <K extends keyof Draft>(k: K, v: Draft[K]) => setEdit((e) => (e ? { ...e, [k]: v } : e));

  return (
    <>
      <PageHeader title="Comunicação do mandato" subtitle="Notícias, projetos de lei, agenda, informativos e relatórios" actions={<button className="btn-primary btn-sm" data-testid="nova-pub" onClick={() => { setEdit(blank()); setErr(""); }}><Plus size={16} /> Nova publicação</button>} />
      <p className="mb-4 rounded-xl bg-brand-50 p-3 text-xs text-navy-600">Conteúdo de caráter informativo e institucional. É vedada a publicação de propaganda eleitoral ou pedido de voto.</p>
      <div className="-mx-4 mb-4 flex gap-2 overflow-x-auto px-4 pb-1 sm:mx-0 sm:px-0">
        {(["todos", ...Object.keys(POST_TYPES)] as (PostType | "todos")[]).map((t) => (
          <button key={t} onClick={() => setFilter(t)} className={cn("shrink-0 rounded-full px-3.5 py-1.5 text-sm font-medium", filter === t ? "bg-navy text-white" : "bg-white text-slate-600 ring-1 ring-slate-200")}>{t === "todos" ? "Todos" : POST_TYPES[t]}</button>
        ))}
      </div>
      {list.length === 0 ? <Empty icon={Newspaper} title="Nenhuma publicação" text="Crie a primeira publicação." /> : (
        <div className="card divide-y divide-slate-100" data-testid="posts">
          {list.map((p) => {
            const I = ICON[p.tipo];
            return (
              <div key={p.id} className="flex items-center gap-3 p-4">
                <span className="hidden h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-brand-50 text-brand sm:flex"><I size={18} /></span>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold">{p.titulo}</p>
                  <p className="text-xs text-slate-500">{POST_TYPES[p.tipo]}{p.numero && ` · ${p.numero}`} · {fmtDate(p.data)} · {p.publicado ? <span className="text-ok-700">Publicado</span> : "Rascunho"}</p>
                </div>
                <button className="rounded-lg p-2 text-slate-500 hover:bg-slate-100" aria-label={p.publicado ? "Despublicar" : "Publicar"} onClick={() => { savePost({ ...p, publicado: !p.publicado }); toast("success", p.publicado ? "Publicação ocultada do cidadão." : "Publicação visível ao cidadão."); }}>{p.publicado ? <Eye size={17} /> : <EyeOff size={17} />}</button>
                <button className="rounded-lg p-2 text-slate-500 hover:bg-slate-100" aria-label={`Editar ${p.titulo}`} onClick={() => { setEdit({ ...p }); setErr(""); }}><Edit3 size={17} /></button>
                <button className="rounded-lg p-2 text-red-500 hover:bg-red-50" aria-label={`Excluir ${p.titulo}`} onClick={() => setDel(p)}><Trash2 size={17} /></button>
              </div>
            );
          })}
        </div>
      )}

      <Modal open={!!edit} onClose={() => setEdit(null)} title={edit?.id ? "Editar publicação" : "Nova publicação"} wide>
        {edit && (
          <div className="space-y-4">
            <div className="grid gap-3 sm:grid-cols-2">
              <Field label="Tipo"><select className="input" value={edit.tipo} onChange={(e) => set("tipo", e.target.value as PostType)} data-testid="pub-tipo">{Object.entries(POST_TYPES).map(([k, v]) => <option key={k} value={k}>{v}</option>)}</select></Field>
              <Field label="Data"><input type="date" className="input" value={edit.data} onChange={(e) => set("data", e.target.value)} /></Field>
            </div>
            <Field label="Título"><input className="input" value={edit.titulo} onChange={(e) => set("titulo", e.target.value)} data-testid="pub-titulo" /></Field>
            <Field label="Resumo"><input className="input" value={edit.resumo} onChange={(e) => set("resumo", e.target.value)} data-testid="pub-resumo" /></Field>
            <Field label="Conteúdo"><textarea className="input min-h-[110px]" value={edit.corpo} onChange={(e) => set("corpo", e.target.value)} data-testid="pub-corpo" /></Field>
            {edit.tipo === "projeto" && <div className="grid gap-3 sm:grid-cols-2"><Field label="Número"><input className="input" value={edit.numero ?? ""} onChange={(e) => set("numero", e.target.value)} placeholder="PL 000/2026" /></Field><Field label="Situação"><input className="input" value={edit.situacao ?? ""} onChange={(e) => set("situacao", e.target.value)} /></Field></div>}
            {edit.tipo === "agenda" && <div className="grid gap-3 sm:grid-cols-2"><Field label="Horário"><input type="time" className="input" value={edit.hora ?? ""} onChange={(e) => set("hora", e.target.value)} /></Field><Field label="Local"><input className="input" value={edit.local ?? ""} onChange={(e) => set("local", e.target.value)} /></Field></div>}
            <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={edit.publicado} onChange={(e) => set("publicado", e.target.checked)} className="h-4 w-4 accent-brand" /> Publicar na área do cidadão</label>
            {err && <p role="alert" className="rounded-xl bg-red-50 p-3 text-sm text-red-700">{err}</p>}
            <button className="btn-primary w-full" onClick={submit} data-testid="pub-salvar">Salvar publicação</button>
          </div>
        )}
      </Modal>

      <Modal open={!!del} onClose={() => setDel(null)} title="Excluir publicação?">
        <p className="text-sm text-slate-600">“{del?.titulo}” será removida do painel e da área do cidadão.</p>
        <div className="mt-5 flex gap-2"><button className="btn-ghost flex-1" onClick={() => setDel(null)}>Cancelar</button><button className="btn flex-1 bg-red-600 text-white hover:bg-red-700" data-testid="pub-excluir" onClick={() => { if (del) deletePost(del.id); setDel(null); toast("success", "Publicação excluída."); }}>Excluir</button></div>
      </Modal>
    </>
  );
}
