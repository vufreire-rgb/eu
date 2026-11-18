"use client";

import { ArrowLeft, Building2, CalendarClock, EyeOff, FileText, Hash, History, Lock, MapPin, Phone, SearchX, Send, UserRound, Paperclip } from "lucide-react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useState, Suspense } from "react";
import { CategoryIcon } from "@/components/category";
import { CityMap } from "@/components/city-map";
import { Conversation, PhotoGrid, Timeline } from "@/components/request-parts";
import { Avatar, Empty, Field, Modal, PriorityBadge, StatusBadge } from "@/components/ui";
import { CATEGORIES, CATEGORY_BY_ID, PRIORITY_META, STATUS_META, STATUS_ORDER } from "@/lib/constants";
import { useStore } from "@/lib/store";
import type { Permission, Priority, Status } from "@/lib/types";
import { cn, fmtDate, fmtDateTime } from "@/lib/utils";

type Tab = "conversa" | "linha" | "historico" | "notas";

function Inner() {
  const id = useSearchParams().get("id") ?? "";
  const router = useRouter();
  const { data, session, actorName, changeStatus, assign, setPriority, addNote, reply, addForwarding, patchRequest, toast } = useStore();
  const r = data.requests.find((x) => x.id === id);
  const [tab, setTab] = useState<Tab>("conversa");
  const [statusOpen, setStatusOpen] = useState(false);
  const [fwdOpen, setFwdOpen] = useState(false);
  const [st, setSt] = useState<Status>("em_analise");
  const [stDesc, setStDesc] = useState("");
  const [stPrazo, setStPrazo] = useState("");
  const [fOrg, setFOrg] = useState("");
  const [fDesc, setFDesc] = useState("");
  const [fPrazo, setFPrazo] = useState("");
  const [note, setNote] = useState("");

  if (!r) return <Empty icon={SearchX} title="Solicitação não encontrada" text="O protocolo informado não existe neste gabinete." action={<Link href="/gabinete/solicitacoes" className="btn-primary">Ver solicitações</Link>} />;

  const me = data.staff.find((s) => s.id === session.staffId);
  const can = (p: Permission) => session.role === "vereadora" || !!me?.permissoes.includes(p);
  const citizen = data.citizens.find((c) => c.id === r.citizenId);
  const resp = data.staff.find((s) => s.id === r.responsavelId);
  const cat = CATEGORY_BY_ID[r.categoria];
  const oficios = data.oficios.filter((o) => o.requestId === r.id);

  const openStatus = () => { setSt(r.status === "recebida" ? "em_analise" : r.status); setStDesc(""); setStPrazo(r.prazo ?? ""); setStatusOpen(true); };
  const applyStatus = () => {
    changeStatus(r.id, st, stDesc, stPrazo || null);
    setStatusOpen(false);
    toast("success", `Status atualizado: ${STATUS_META[st].label}. O cidadão foi notificado.`);
  };
  const applyFwd = () => {
    if (!fOrg.trim() || fDesc.trim().length < 5) { toast("error", "Informe o órgão e a descrição do encaminhamento."); return; }
    addForwarding(r.id, fOrg.trim(), fDesc.trim(), fPrazo || undefined);
    setFwdOpen(false); setFDesc(""); setFPrazo("");
    toast("success", "Encaminhamento registrado.");
  };

  const tabs: { id: Tab; label: string; icon: typeof Send }[] = [
    { id: "conversa", label: "Conversa", icon: Send }, { id: "linha", label: "Linha do tempo", icon: CalendarClock },
    { id: "historico", label: "Histórico interno", icon: History }, { id: "notas", label: "Observações internas", icon: Lock },
  ];

  return (
    <div className="space-y-5">
      <button onClick={() => router.back()} className="inline-flex items-center gap-1 text-sm font-medium text-slate-500 hover:text-navy"><ArrowLeft size={16} /> Voltar</button>

      <section className="card p-5">
        <div className="flex flex-wrap items-start gap-3">
          <CategoryIcon id={r.categoria} size={22} />
          <div className="min-w-0 flex-1">
            <h1 className="text-xl font-bold leading-tight">{cat.label}</h1>
            <p className="flex items-center gap-1 text-sm text-slate-500"><Hash size={13} /><span data-testid="protocolo">{r.protocolo}</span> · criada em {fmtDateTime(r.criadoEm)}</p>
          </div>
          <div className="flex items-center gap-2"><StatusBadge status={r.status} short /><PriorityBadge p={r.prioridade} /></div>
        </div>
        <div className="mt-4 flex flex-wrap gap-2">
          <button className="btn-primary btn-sm" onClick={openStatus} data-testid="btn-status"><CalendarClock size={15} /> Atualizar status</button>
          <button className="btn-ghost btn-sm" disabled={!can("encaminhar")} onClick={() => { setFOrg(r.orgao); setFDesc(""); setFwdOpen(true); }} data-testid="btn-encaminhar"><Send size={15} /> Registrar encaminhamento</button>
          <Link href={can("gerar_oficio") ? `/gabinete/oficio?id=${r.id}` : "#"} aria-disabled={!can("gerar_oficio")} className={cn("btn-dark btn-sm", !can("gerar_oficio") && "pointer-events-none opacity-50")} data-testid="btn-oficio"><FileText size={15} /> Gerar ofício</Link>
          <button className="btn-ghost btn-sm" onClick={() => setTab("conversa")}>Responder</button>
        </div>
      </section>

      <div className="grid gap-5 lg:grid-cols-3">
        <div className="space-y-5 lg:col-span-2">
          <section className="card p-5">
            <h2 className="mb-2 font-bold">Descrição</h2>
            <p className="text-sm text-slate-700">{r.descricao}</p>
            <h3 className="mb-2 mt-5 text-sm font-bold">Fotografias</h3>
            <PhotoGrid photos={r.fotos} />
            <h3 className="mb-2 mt-5 text-sm font-bold">Localização</h3>
            <p className="mb-2 flex items-center gap-1.5 text-sm text-slate-600"><MapPin size={14} /> {r.rua}, {r.numero} — {r.bairro}</p>
            <CityMap markers={[{ id: r.id, x: r.mapa.x, y: r.mapa.y, categoria: r.categoria, label: r.protocolo }]} showLabels={false} pin={r.mapa} />
          </section>

          <section className="card p-5">
            <div role="tablist" className="-mx-1 mb-4 flex gap-1 overflow-x-auto pb-1">
              {tabs.map((t) => (
                <button key={t.id} role="tab" aria-selected={tab === t.id} data-testid={`tab-${t.id}`} onClick={() => setTab(t.id)} className={cn("flex shrink-0 items-center gap-1.5 rounded-xl px-3 py-2 text-sm font-medium transition", tab === t.id ? "bg-navy text-white" : "text-slate-600 hover:bg-slate-100")}>
                  <t.icon size={14} /> {t.label}
                </button>
              ))}
            </div>
            {tab === "conversa" && (
              <Conversation messages={r.mensagens} me="gabinete" label="Resposta ao cidadão" placeholder="Responder ao cidadão (visível para ele)…"
                onSend={(t) => { if (!can("responder")) { toast("error", "Seu perfil não possui permissão para responder."); return; } reply(r.id, t); toast("success", "Resposta enviada ao cidadão."); }} />
            )}
            {tab === "linha" && <><p className="mb-3 text-xs text-slate-500">Visível ao cidadão.</p><Timeline items={r.timeline} /></>}
            {tab === "historico" && (
              <ul className="space-y-3">
                {[...r.historico].reverse().map((h) => (
                  <li key={h.id} className="flex gap-3 text-sm"><span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-slate-300" /><span><span className="block">{h.texto}</span><span className="text-xs text-slate-400">{h.autorNome} · {fmtDateTime(h.em)}</span></span></li>
                ))}
              </ul>
            )}
            {tab === "notas" && (
              <div>
                <p className="mb-3 flex items-center gap-2 rounded-xl bg-amber-50 p-3 text-xs font-medium text-amber-800"><EyeOff size={15} /> Observações internas nunca são exibidas ao cidadão.</p>
                <ul className="mb-3 space-y-2">
                  {r.notasInternas.length === 0 && <li className="text-sm text-slate-400">Nenhuma observação.</li>}
                  {r.notasInternas.map((n) => <li key={n.id} className="rounded-xl bg-amber-50/60 p-3 text-sm" data-testid="nota"><p>{n.texto}</p><p className="mt-1 text-xs text-slate-500">{n.autorNome} · {fmtDateTime(n.em)}</p></li>)}
                </ul>
                <textarea className="input min-h-[80px]" value={note} onChange={(e) => setNote(e.target.value)} placeholder="Adicionar observação interna…" aria-label="Observação interna" data-testid="nota-input" />
                <button className="btn-dark btn-sm mt-2" data-testid="nota-add" onClick={() => { if (note.trim().length < 3) { toast("error", "Escreva a observação."); return; } addNote(r.id, note.trim()); setNote(""); toast("success", "Observação interna salva."); }}>Adicionar observação</button>
              </div>
            )}
          </section>
        </div>

        <aside className="space-y-5">
          <section className="card space-y-4 p-5">
            <h2 className="font-bold">Gestão</h2>
            <Field label="Prioridade">
              <select className="input" value={r.prioridade} onChange={(e) => { setPriority(r.id, e.target.value as Priority); toast("success", "Prioridade atualizada."); }} data-testid="prioridade">
                {(Object.keys(PRIORITY_META) as Priority[]).map((p) => <option key={p} value={p}>{PRIORITY_META[p].label}</option>)}
              </select>
            </Field>
            <Field label="Assessor responsável">
              <select className="input" value={r.responsavelId ?? ""} onChange={(e) => { assign(r.id, e.target.value || null); toast("success", e.target.value ? "Solicitação atribuída." : "Responsável removido."); }} data-testid="responsavel">
                <option value="">Sem responsável</option>
                {data.staff.filter((s) => s.ativo).map((s) => <option key={s.id} value={s.id}>{s.nome}</option>)}
              </select>
            </Field>
            <Field label="Categoria">
              <select className="input" value={r.categoria} onChange={(e) => { patchRequest(r.id, { categoria: e.target.value as never, orgao: CATEGORY_BY_ID[e.target.value as keyof typeof CATEGORY_BY_ID].orgao }, `Categoria alterada para ${CATEGORY_BY_ID[e.target.value as keyof typeof CATEGORY_BY_ID].label}.`); }}>
                {CATEGORIES.map((c) => <option key={c.id} value={c.id}>{c.label}</option>)}
              </select>
            </Field>
            {resp && <p className="flex items-center gap-2 text-xs text-slate-500"><Avatar name={resp.nome} color={resp.cor} size={24} /> {resp.nome} · {resp.cargo}</p>}
          </section>

          <section className="card space-y-3 p-5 text-sm">
            <h2 className="font-bold">Cidadão (fictício)</h2>
            <p className="flex items-center gap-2"><UserRound size={15} className="text-slate-400" />{citizen?.nome}</p>
            <p className="flex items-center gap-2"><Phone size={15} className="text-slate-400" />{citizen?.telefone}</p>
            <p className="flex items-center gap-2"><MapPin size={15} className="text-slate-400" />Mora em {citizen?.bairro}</p>
            <p className="text-[11px] text-slate-400">Sem CPF, título de eleitor ou preferência política.</p>
          </section>

          <section className="card space-y-3 p-5 text-sm">
            <h2 className="font-bold">Encaminhamento</h2>
            <p className="flex items-center gap-2"><Building2 size={15} className="text-slate-400" />{r.orgao}</p>
            <p className="flex items-center gap-2"><CalendarClock size={15} className="text-slate-400" />Prazo informado: {r.prazo ? fmtDate(r.prazo) : "—"}</p>
            {r.encaminhamentos.map((e) => <p key={e.id} className="rounded-xl bg-slate-50 p-2.5 text-xs text-slate-600">{e.descricao}<br /><span className="text-slate-400">{fmtDateTime(e.em)}</span></p>)}
          </section>

          <section className="card space-y-2 p-5 text-sm">
            <h2 className="font-bold">Documentos</h2>
            {r.documentos.length === 0 && <p className="text-slate-400">Nenhum documento.</p>}
            {r.documentos.map((d) => (
              <Link key={d.id} href={`/gabinete/oficio?id=${r.id}`} className="flex items-center gap-2 rounded-xl bg-slate-50 p-2.5 hover:bg-slate-100"><Paperclip size={14} className="text-slate-400" /><span className="flex-1 truncate">{d.nome}</span><span className="text-[11px] text-slate-400">{fmtDate(d.em)}</span></Link>
            ))}
            {oficios.length > 0 && <p className="text-[11px] text-slate-400">{oficios.length} ofício(s) gerado(s)</p>}
          </section>
        </aside>
      </div>

      <Modal open={statusOpen} onClose={() => setStatusOpen(false)} title="Atualizar status">
        <div className="space-y-4">
          <Field label="Novo status">
            <select className="input" value={st} onChange={(e) => setSt(e.target.value as Status)} data-testid="novo-status">
              {STATUS_ORDER.map((s) => <option key={s} value={s}>{STATUS_META[s].label}</option>)}
            </select>
          </Field>
          <Field label="Descrição da atualização (visível ao cidadão)" hint="Deixe em branco para usar o texto padrão do status.">
            <textarea className="input min-h-[90px]" value={stDesc} onChange={(e) => setStDesc(e.target.value)} data-testid="status-desc" />
          </Field>
          <Field label="Prazo estimado ou informado pelo órgão"><input type="date" className="input" value={stPrazo} onChange={(e) => setStPrazo(e.target.value)} /></Field>
          <p className="text-xs text-slate-500">Autor: {actorName}. O cidadão receberá uma notificação.</p>
          <button className="btn-primary w-full" onClick={applyStatus} data-testid="status-confirm">Confirmar atualização</button>
        </div>
      </Modal>

      <Modal open={fwdOpen} onClose={() => setFwdOpen(false)} title="Registrar encaminhamento">
        <div className="space-y-4">
          <Field label="Órgão municipal"><input className="input" value={fOrg} onChange={(e) => setFOrg(e.target.value)} /></Field>
          <Field label="Descrição"><textarea className="input min-h-[90px]" value={fDesc} onChange={(e) => setFDesc(e.target.value)} placeholder="Ex.: Ofício enviado solicitando avaliação técnica…" /></Field>
          <Field label="Prazo informado pelo órgão (opcional)"><input type="date" className="input" value={fPrazo} onChange={(e) => setFPrazo(e.target.value)} /></Field>
          <button className="btn-primary w-full" onClick={applyFwd}>Registrar</button>
        </div>
      </Modal>
    </div>
  );
}

export default function StaffRequestDetail() {
  return <Suspense><Inner /></Suspense>;
}
