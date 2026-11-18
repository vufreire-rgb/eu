import type { CategoryId, Priority, Status } from "./types";

export const STATUS_ORDER: Status[] = [
  "recebida",
  "em_analise",
  "encaminhada",
  "aguardando_retorno",
  "em_acompanhamento",
  "concluida",
  "arquivada",
];

export const STATUS_META: Record<Status, { label: string; hint: string; tone: string; dot: string }> = {
  recebida: { label: "Recebida", hint: "Sua solicitação foi registrada no gabinete.", tone: "bg-slate-100 text-slate-700", dot: "bg-slate-400" },
  em_analise: { label: "Em análise", hint: "A equipe do gabinete está avaliando o caso.", tone: "bg-amber-50 text-amber-700", dot: "bg-amber-500" },
  encaminhada: { label: "Encaminhada ao órgão responsável", hint: "O gabinete enviou um ofício ao órgão municipal competente. A execução é de responsabilidade do Poder Executivo.", tone: "bg-brand-50 text-brand-600", dot: "bg-brand" },
  aguardando_retorno: { label: "Aguardando retorno", hint: "Aguardando manifestação do órgão responsável.", tone: "bg-violet-50 text-violet-700", dot: "bg-violet-500" },
  em_acompanhamento: { label: "Em acompanhamento", hint: "O gabinete acompanha as providências informadas pelo órgão.", tone: "bg-cyan-50 text-cyan-700", dot: "bg-cyan-500" },
  concluida: { label: "Concluída", hint: "O órgão informou a conclusão das providências.", tone: "bg-ok-50 text-ok-700", dot: "bg-ok" },
  arquivada: { label: "Arquivada", hint: "Atendimento encerrado sem providências adicionais.", tone: "bg-zinc-100 text-zinc-600", dot: "bg-zinc-400" },
};

export const STATUS_COLOR: Record<Status, string> = {
  recebida: "#94a3b8",
  em_analise: "#f59e0b",
  encaminhada: "#2563EB",
  aguardando_retorno: "#8b5cf6",
  em_acompanhamento: "#06b6d4",
  concluida: "#16a34a",
  arquivada: "#a1a1aa",
};

export const PRIORITY_META: Record<Priority, { label: string; tone: string }> = {
  baixa: { label: "Baixa", tone: "bg-slate-100 text-slate-600" },
  media: { label: "Média", tone: "bg-sky-50 text-sky-700" },
  alta: { label: "Alta", tone: "bg-orange-50 text-orange-700" },
  urgente: { label: "Urgente", tone: "bg-red-50 text-red-700" },
};

export const CATEGORIES: { id: CategoryId; label: string; color: string; orgao: string; secretaria: string }[] = [
  { id: "iluminacao", label: "Iluminação pública", color: "#f59e0b", orgao: "Secretaria de Serviços Públicos", secretaria: "Secretaria Municipal de Serviços Públicos" },
  { id: "pavimentacao", label: "Pavimentação", color: "#64748b", orgao: "Secretaria de Obras", secretaria: "Secretaria Municipal de Obras" },
  { id: "saude", label: "Saúde", color: "#ef4444", orgao: "Secretaria de Saúde", secretaria: "Secretaria Municipal de Saúde" },
  { id: "educacao", label: "Educação", color: "#8b5cf6", orgao: "Secretaria de Educação", secretaria: "Secretaria Municipal de Educação" },
  { id: "seguranca", label: "Segurança", color: "#0f172a", orgao: "Secretaria de Segurança e Trânsito", secretaria: "Secretaria Municipal de Segurança" },
  { id: "transporte", label: "Transporte público", color: "#2563EB", orgao: "Secretaria de Mobilidade", secretaria: "Secretaria Municipal de Mobilidade Urbana" },
  { id: "limpeza", label: "Limpeza urbana", color: "#16a34a", orgao: "Secretaria de Serviços Públicos", secretaria: "Secretaria Municipal de Serviços Públicos" },
  { id: "meio_ambiente", label: "Meio ambiente", color: "#0d9488", orgao: "Secretaria de Meio Ambiente", secretaria: "Secretaria Municipal de Meio Ambiente" },
  { id: "acessibilidade", label: "Acessibilidade", color: "#ec4899", orgao: "Secretaria de Obras", secretaria: "Secretaria Municipal de Obras" },
  { id: "outros", label: "Outros", color: "#78716c", orgao: "Gabinete do Prefeito", secretaria: "Gabinete do Prefeito" },
];

export const CATEGORY_BY_ID = Object.fromEntries(CATEGORIES.map((c) => [c.id, c])) as Record<CategoryId, (typeof CATEGORIES)[number]>;

/** Bairros fictícios para o município demonstrativo; x/y em % do mapa ilustrativo. */
export const BAIRROS: { nome: string; x: number; y: number }[] = [
  { nome: "Centro", x: 50, y: 50 },
  { nome: "Independência", x: 36, y: 64 },
  { nome: "Jardim das Nações", x: 62, y: 38 },
  { nome: "Chácara Silvestre", x: 74, y: 56 },
  { nome: "Vila São José", x: 44, y: 34 },
  { nome: "Parque Aeroporto", x: 24, y: 40 },
  { nome: "Esplanada Santa Terezinha", x: 58, y: 70 },
  { nome: "Barranco", x: 30, y: 80 },
  { nome: "Cidade Jardim", x: 80, y: 30 },
  { nome: "Quiririm", x: 86, y: 70 },
  { nome: "Parque São Cristóvão", x: 18, y: 62 },
  { nome: "Gurilândia", x: 66, y: 84 },
];

export const MUNICIPIO = "Taubaté";
export const DEMO_TAG = "AMBIENTE DE DEMONSTRAÇÃO";
export const OFICIO_WATERMARK = "MODELO DEMONSTRATIVO — SEM VALIDADE OFICIAL";

export const ROLE_META = {
  cidadao: { label: "Cidadão", desc: "Envie e acompanhe solicitações", home: "/cidadao" },
  assessor: { label: "Assessor parlamentar", desc: "Atenda e encaminhe demandas", home: "/gabinete" },
  vereadora: { label: "Vereadora", desc: "Visão completa do mandato", home: "/gabinete" },
  admin: { label: "Administrador da plataforma", desc: "Gestão SaaS multi-gabinete", home: "/plataforma" },
} as const;

export const POST_TYPES = {
  noticia: "Notícia",
  projeto: "Projeto de lei",
  agenda: "Agenda pública",
  informativo: "Informativo",
  relatorio: "Relatório de atividades",
} as const;
