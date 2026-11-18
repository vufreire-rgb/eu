"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { CATEGORY_BY_ID, STATUS_META } from "./constants";
import { DATA_KEY, DEFAULT_SESSION, localRepository as repo } from "./repository";
import { buildSeed, makeProtocol } from "./seed";
import type {
  AppData, CategoryId, Oficio, Post, Priority, RequestItem, Role, Session, Staff, Status, Tenant,
} from "./types";
import { uid } from "./utils";

export interface Toast { id: string; kind: "success" | "error" | "info"; text: string }

export interface NewRequestInput {
  categoria: CategoryId; bairro: string; rua: string; numero: string;
  mapa: { x: number; y: number }; descricao: string; fotos: string[];
}

interface Store {
  ready: boolean;
  data: AppData;
  session: Session;
  tenant: Tenant;
  actorName: string;
  toasts: Toast[];
  toast: (kind: Toast["kind"], text: string) => void;
  dismissToast: (id: string) => void;
  setRole: (r: Role) => void;
  setCitizen: (id: string) => void;
  setStaff: (id: string) => void;
  resetDemo: () => void;
  createRequest: (i: NewRequestInput) => RequestItem;
  citizenMessage: (reqId: string, texto: string) => void;
  patchRequest: (reqId: string, patch: Partial<RequestItem>, historico?: string) => void;
  changeStatus: (reqId: string, status: Status, descricao: string, prazo?: string | null) => void;
  assign: (reqId: string, staffId: string | null) => void;
  setPriority: (reqId: string, p: Priority) => void;
  addNote: (reqId: string, texto: string) => void;
  reply: (reqId: string, texto: string) => void;
  addForwarding: (reqId: string, orgao: string, descricao: string, prazo?: string) => void;
  saveOficio: (o: Omit<Oficio, "id" | "criadoEm" | "tenantId" | "numero"> & { id?: string }) => Oficio;
  markRead: (citizenId: string, id?: string) => void;
  savePost: (p: Omit<Post, "id" | "tenantId"> & { id?: string }) => void;
  deletePost: (id: string) => void;
  saveStaff: (s: Omit<Staff, "id" | "tenantId"> & { id?: string }) => void;
  createTenant: (t: Omit<Tenant, "id" | "criadoEm" | "usuarios" | "solicitacoes" | "assinatura">) => Tenant;
  updateTenant: (id: string, patch: Partial<Tenant>) => void;
}

const Ctx = createContext<Store | null>(null);

export function useStore() {
  const c = useContext(Ctx);
  if (!c) throw new Error("useStore fora do provider");
  return c;
}

const now = () => new Date().toISOString();

export function StoreProvider({ children }: { children: ReactNode }) {
  const [ready, setReady] = useState(false);
  const [data, setData] = useState<AppData>(() => buildSeed());
  const [session, setSession] = useState<Session>(DEFAULT_SESSION);
  const [toasts, setToasts] = useState<Toast[]>([]);
  const skipSave = useRef(true);

  const toast = useCallback((kind: Toast["kind"], text: string) => {
    const id = uid("t");
    setToasts((t) => [...t, { id, kind, text }]);
    setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), 4200);
  }, []);
  const dismissToast = useCallback((id: string) => setToasts((t) => t.filter((x) => x.id !== id)), []);

  // hidratação
  useEffect(() => {
    const t = setTimeout(() => {
      let d = repo.load();
      if (!d) d = repo.reset();
      setData(d);
      setSession(repo.loadSession() ?? DEFAULT_SESSION);
      setReady(true);
    }, 350);
    return () => clearTimeout(t);
  }, []);

  // persistência
  useEffect(() => {
    if (!ready) return;
    if (skipSave.current) { skipSave.current = false; return; }
    const r = repo.save(data);
    if (!r.ok) toast("error", "Não foi possível salvar: armazenamento local cheio. Use imagens menores ou restaure os dados.");
  }, [data, ready, toast]);

  // sincroniza abas
  useEffect(() => {
    const onStorage = (e: StorageEvent) => {
      if (e.key === DATA_KEY && e.newValue) {
        try { skipSave.current = true; setData(JSON.parse(e.newValue)); } catch { /* ignora */ }
      }
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  const update = useCallback((fn: (d: AppData) => AppData) => setData((d) => fn(d)), []);

  const tenant = data.tenants.find((t) => t.id === data.activeTenantId) ?? data.tenants[0];
  const actorName = useMemo(() => {
    if (session.role === "vereadora") return `${tenant.cargo} ${tenant.parlamentar}`;
    if (session.role === "assessor") return data.staff.find((s) => s.id === session.staffId)?.nome ?? "Assessor";
    if (session.role === "admin") return "Administração";
    return "Cidadão";
  }, [session, tenant, data.staff]);

  const persistSession = (s: Session) => { setSession(s); repo.saveSession(s); };

  const mapReq = (d: AppData, id: string, fn: (r: RequestItem) => RequestItem): AppData => ({
    ...d, requests: d.requests.map((r) => (r.id === id ? { ...fn(r), atualizadoEm: now() } : r)),
  });

  const notify = (d: AppData, r: RequestItem, titulo: string, texto: string): AppData => ({
    ...d,
    notifications: [{ id: uid("nt"), tenantId: r.tenantId, citizenId: r.citizenId, requestId: r.id, titulo, texto, em: now(), lida: false }, ...d.notifications],
  });

  const value: Store = {
    ready, data, session, tenant, actorName, toasts, toast, dismissToast,
    setRole: (role) => persistSession({ ...session, role }),
    setCitizen: (citizenId) => persistSession({ ...session, citizenId }),
    setStaff: (staffId) => persistSession({ ...session, staffId }),
    resetDemo: () => { skipSave.current = true; const d = repo.reset(); setData(d); persistSession(DEFAULT_SESSION); toast("success", "Dados demonstrativos restaurados."); },

    createRequest: (i) => {
      const t = now();
      let created!: RequestItem;
      update((d) => {
        const max = d.requests.reduce((m, r) => Math.max(m, parseInt(r.protocolo.split("-")[2], 10) || 0), 1000);
        created = {
          id: uid("req"), tenantId: d.activeTenantId, protocolo: makeProtocol(t, max + 1), citizenId: session.citizenId,
          ...i, status: "recebida", prioridade: "media", responsavelId: null,
          orgao: CATEGORY_BY_ID[i.categoria].orgao, prazo: null, criadoEm: t, atualizadoEm: t,
          timeline: [{ id: uid("tl"), status: "recebida", descricao: "Solicitação recebida pelo gabinete. Protocolo gerado.", em: t }],
          mensagens: [], notasInternas: [], encaminhamentos: [], documentos: [],
          historico: [{ id: uid("h"), texto: "Solicitação registrada pelo cidadão.", autorNome: "Sistema", em: t }],
        };
        const withReq = { ...d, requests: [created, ...d.requests] };
        return notify(withReq, created, `Solicitação registrada · ${created.protocolo}`, "Recebemos sua solicitação. Você será notificado a cada atualização.");
      });
      return created;
    },

    citizenMessage: (reqId, texto) => {
      const name = data.citizens.find((c) => c.id === session.citizenId)?.nome ?? "Cidadão";
      update((d) => mapReq(d, reqId, (r) => ({ ...r, novaMensagemCidadao: true, mensagens: [...r.mensagens, { id: uid("m"), autor: "cidadao", autorNome: name, texto, em: now() }] })));
    },

    patchRequest: (reqId, patch, historico) =>
      update((d) => mapReq(d, reqId, (r) => ({ ...r, ...patch, historico: historico ? [...r.historico, { id: uid("h"), texto: historico, autorNome: actorName, em: now() }] : r.historico }))),

    changeStatus: (reqId, status, descricao, prazo) =>
      update((d) => {
        const req = d.requests.find((r) => r.id === reqId);
        if (!req) return d;
        const text = descricao.trim() || STATUS_META[status].hint;
        const next = mapReq(d, reqId, (r) => ({
          ...r, status, prazo: prazo === undefined ? r.prazo : prazo,
          timeline: [...r.timeline, { id: uid("tl"), status, descricao: text, em: now() }],
          historico: [...r.historico, { id: uid("h"), texto: `Status alterado para “${STATUS_META[status].label}”.`, autorNome: actorName, em: now() }],
        }));
        return notify(next, req, `Atualização no protocolo ${req.protocolo}`, `Novo status: ${STATUS_META[status].label}. ${text}`);
      }),

    assign: (reqId, staffId) =>
      update((d) => {
        const nome = staffId ? d.staff.find((s) => s.id === staffId)?.nome : null;
        return mapReq(d, reqId, (r) => ({
          ...r, responsavelId: staffId,
          historico: [...r.historico, { id: uid("h"), texto: nome ? `Atribuída a ${nome}.` : "Responsável removido.", autorNome: actorName, em: now() }],
        }));
      }),

    setPriority: (reqId, p) =>
      update((d) => mapReq(d, reqId, (r) => ({ ...r, prioridade: p, historico: [...r.historico, { id: uid("h"), texto: `Prioridade definida como ${p}.`, autorNome: actorName, em: now() }] }))),

    addNote: (reqId, texto) =>
      update((d) => mapReq(d, reqId, (r) => ({ ...r, notasInternas: [...r.notasInternas, { id: uid("ni"), autorNome: actorName, texto, em: now() }] }))),

    reply: (reqId, texto) =>
      update((d) => {
        const req = d.requests.find((r) => r.id === reqId);
        if (!req) return d;
        const next = mapReq(d, reqId, (r) => ({
          ...r, novaMensagemCidadao: false,
          mensagens: [...r.mensagens, { id: uid("m"), autor: "gabinete", autorNome: "Gabinete", texto, em: now() }],
          historico: [...r.historico, { id: uid("h"), texto: "Resposta enviada ao cidadão.", autorNome: actorName, em: now() }],
        }));
        return notify(next, req, `Nova resposta no protocolo ${req.protocolo}`, texto.length > 110 ? texto.slice(0, 110) + "…" : texto);
      }),

    addForwarding: (reqId, orgao, descricao, prazo) =>
      update((d) => mapReq(d, reqId, (r) => ({
        ...r, orgao, prazo: prazo || r.prazo,
        encaminhamentos: [...r.encaminhamentos, { id: uid("f"), orgao, descricao, em: now(), prazo }],
        historico: [...r.historico, { id: uid("h"), texto: `Encaminhamento registrado ao órgão: ${orgao}.`, autorNome: actorName, em: now() }],
      }))),

    saveOficio: (o) => {
      let saved!: Oficio;
      update((d) => {
        const existing = o.id ? d.oficios.find((x) => x.id === o.id) : undefined;
        const seq = d.oficios.length + 1;
        saved = existing
          ? { ...existing, ...o, id: existing.id }
          : { ...o, id: uid("of"), tenantId: d.activeTenantId, criadoEm: now(), numero: `${String(seq).padStart(3, "0")}/${new Date().getFullYear()}-GAB` };
        const oficios = existing ? d.oficios.map((x) => (x.id === saved.id ? saved : x)) : [saved, ...d.oficios];
        const req = d.requests.find((r) => r.id === o.requestId);
        if (!req) return { ...d, oficios };
        const hasDoc = req.documentos.some((x) => x.oficioId === saved.id);
        return mapReq({ ...d, oficios }, req.id, (r) => ({
          ...r,
          documentos: hasDoc ? r.documentos : [...r.documentos, { id: uid("d"), nome: `Ofício ${saved.numero}`, tipo: "oficio", em: now(), oficioId: saved.id }],
          historico: [...r.historico, { id: uid("h"), texto: `Ofício ${saved.numero} ${existing ? "atualizado" : "gerado"}.`, autorNome: actorName, em: now() }],
        }));
      });
      return saved;
    },

    markRead: (citizenId, id) =>
      update((d) => ({ ...d, notifications: d.notifications.map((n) => (n.citizenId === citizenId && (!id || n.id === id) ? { ...n, lida: true } : n)) })),

    savePost: (p) =>
      update((d) => {
        if (p.id) return { ...d, posts: d.posts.map((x) => (x.id === p.id ? { ...x, ...p, id: x.id } : x)) };
        return { ...d, posts: [{ ...p, id: uid("post"), tenantId: d.activeTenantId }, ...d.posts] };
      }),
    deletePost: (id) => update((d) => ({ ...d, posts: d.posts.filter((p) => p.id !== id) })),

    saveStaff: (s) =>
      update((d) => {
        if (s.id) return { ...d, staff: d.staff.map((x) => (x.id === s.id ? { ...x, ...s, id: x.id } : x)) };
        return { ...d, staff: [...d.staff, { ...s, id: uid("ass"), tenantId: d.activeTenantId }] };
      }),

    createTenant: (t) => {
      const created: Tenant = { ...t, id: uid("gab"), criadoEm: now(), usuarios: t.equipe.length + 1, solicitacoes: 0, assinatura: "teste" };
      update((d) => ({ ...d, tenants: [...d.tenants, created] }));
      return created;
    },
    updateTenant: (id, patch) => update((d) => ({ ...d, tenants: d.tenants.map((t) => (t.id === id ? { ...t, ...patch } : t)) })),
  };

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}
