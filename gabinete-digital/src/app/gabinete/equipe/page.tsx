"use client";

import { Plus, Shuffle, UserCog } from "lucide-react";
import { useState } from "react";
import { Avatar, Field, Modal, PageHeader } from "@/components/ui";
import { useStore } from "@/lib/store";
import type { Permission, Staff } from "@/lib/types";

const PERMS: [Permission, string][] = [["responder", "Responder ao cidadão"], ["encaminhar", "Registrar encaminhamentos"], ["gerar_oficio", "Gerar ofícios"], ["publicar", "Publicar conteúdo"], ["gerir_equipe", "Gerir equipe"]];
const COLORS = ["#2563EB", "#0d9488", "#f59e0b", "#8b5cf6", "#ec4899", "#16a34a"];
type Draft = Omit<Staff, "id" | "tenantId"> & { id?: string };

export default function Equipe() {
  const { data, saveStaff, assign, toast } = useStore();
  const [edit, setEdit] = useState<Draft | null>(null);
  const [err, setErr] = useState("");

  const rows = data.staff.map((s) => {
    const mine = data.requests.filter((r) => r.responsavelId === s.id);
    const done = mine.filter((r) => r.status === "concluida").length;
    const open = mine.filter((r) => !["concluida", "arquivada"].includes(r.status)).length;
    return { s, total: mine.length, done, open, rate: mine.length ? Math.round((done / mine.length) * 100) : 0 };
  });
  const max = Math.max(1, ...rows.map((r) => r.total));

  const distribute = () => {
    const active = data.staff.filter((s) => s.ativo);
    if (!active.length) { toast("error", "Nenhum assessor ativo."); return; }
    const load: Record<string, number> = Object.fromEntries(active.map((s) => [s.id, data.requests.filter((r) => r.responsavelId === s.id && !["concluida", "arquivada"].includes(r.status)).length]));
    const pending = data.requests.filter((r) => !r.responsavelId && !["concluida", "arquivada"].includes(r.status));
    pending.forEach((r) => { const id = Object.keys(load).sort((a, b) => load[a] - load[b])[0]; load[id]++; assign(r.id, id); });
    toast(pending.length ? "success" : "info", pending.length ? `${pending.length} demandas distribuídas de forma equilibrada.` : "Não há demandas sem responsável.");
  };

  const save = () => {
    if (!edit) return;
    if (edit.nome.trim().length < 3 || !/^\S+@\S+\.\S+$/.test(edit.email)) { setErr("Informe nome e um e-mail válido."); return; }
    saveStaff(edit);
    toast("success", edit.id ? "Assessor atualizado." : "Assessor cadastrado.");
    setEdit(null); setErr("");
  };

  return (
    <>
      <PageHeader title="Equipe" subtitle="Assessores, permissões e produtividade" actions={<>
        <button className="btn-ghost btn-sm" onClick={distribute} data-testid="distribuir"><Shuffle size={15} /> Distribuir demandas</button>
        <button className="btn-primary btn-sm" onClick={() => { setEdit({ nome: "", cargo: "Assessor parlamentar", email: "", cor: COLORS[data.staff.length % COLORS.length], ativo: true, permissoes: ["responder"] }); setErr(""); }} data-testid="novo-assessor"><Plus size={16} /> Novo assessor</button></>} />
      <div className="grid gap-3 md:grid-cols-2">
        {rows.map(({ s, total, done, open, rate }) => (
          <section key={s.id} className="card p-5" data-testid="assessor">
            <div className="flex items-center gap-3">
              <Avatar name={s.nome} color={s.cor} size={44} />
              <div className="min-w-0 flex-1"><p className="truncate font-semibold">{s.nome}</p><p className="truncate text-xs text-slate-500">{s.cargo} · {s.email}</p></div>
              <span className={`chip ${s.ativo ? "bg-ok-50 text-ok-700" : "bg-slate-100 text-slate-500"}`}>{s.ativo ? "Ativo" : "Inativo"}</span>
              <button aria-label={`Editar ${s.nome}`} onClick={() => { setEdit({ ...s }); setErr(""); }} className="rounded-lg p-2 text-slate-500 hover:bg-slate-100"><UserCog size={17} /></button>
            </div>
            <div className="mt-4 grid grid-cols-3 gap-2 text-center">
              {[["Atendimentos", total], ["Em aberto", open], ["Concluídos", done]].map(([k, v]) => <div key={k as string} className="rounded-xl bg-slate-50 p-2"><p className="text-lg font-bold">{v}</p><p className="text-[11px] text-slate-500">{k}</p></div>)}
            </div>
            <div className="mt-3"><div className="mb-1 flex justify-between text-xs text-slate-500"><span>Carga</span><span>Conclusão {rate}%</span></div><div className="h-1.5 rounded-full bg-slate-100"><div className="h-full rounded-full bg-brand transition-all" style={{ width: `${(total / max) * 100}%` }} /></div></div>
            <p className="mt-3 text-[11px] text-slate-400">Permissões: {s.permissoes.map((p) => PERMS.find((x) => x[0] === p)?.[1]).join(" · ") || "nenhuma"}</p>
          </section>
        ))}
      </div>

      <Modal open={!!edit} onClose={() => setEdit(null)} title={edit?.id ? "Editar assessor" : "Novo assessor"}>
        {edit && (
          <div className="space-y-4">
            <Field label="Nome"><input className="input" value={edit.nome} onChange={(e) => setEdit({ ...edit, nome: e.target.value })} data-testid="as-nome" /></Field>
            <Field label="Cargo"><input className="input" value={edit.cargo} onChange={(e) => setEdit({ ...edit, cargo: e.target.value })} /></Field>
            <Field label="E-mail"><input className="input" type="email" value={edit.email} onChange={(e) => setEdit({ ...edit, email: e.target.value })} data-testid="as-email" /></Field>
            <fieldset><legend className="label">Permissões</legend>
              {PERMS.map(([k, l]) => <label key={k} className="flex items-center gap-2 py-1 text-sm"><input type="checkbox" className="h-4 w-4 accent-brand" checked={edit.permissoes.includes(k)} onChange={(e) => setEdit({ ...edit, permissoes: e.target.checked ? [...edit.permissoes, k] : edit.permissoes.filter((x) => x !== k) })} />{l}</label>)}
            </fieldset>
            <label className="flex items-center gap-2 text-sm"><input type="checkbox" className="h-4 w-4 accent-brand" checked={edit.ativo} onChange={(e) => setEdit({ ...edit, ativo: e.target.checked })} /> Assessor ativo</label>
            {err && <p role="alert" className="text-sm text-red-600">{err}</p>}
            <button className="btn-primary w-full" onClick={save} data-testid="as-salvar">Salvar</button>
          </div>
        )}
      </Modal>
    </>
  );
}
