export type Role = "cidadao" | "assessor" | "vereadora" | "admin";

export type Status =
  | "recebida"
  | "em_analise"
  | "encaminhada"
  | "aguardando_retorno"
  | "em_acompanhamento"
  | "concluida"
  | "arquivada";

export type Priority = "baixa" | "media" | "alta" | "urgente";

export type CategoryId =
  | "iluminacao"
  | "pavimentacao"
  | "saude"
  | "educacao"
  | "seguranca"
  | "transporte"
  | "limpeza"
  | "meio_ambiente"
  | "acessibilidade"
  | "outros";

/** Todos os registros carregam tenantId: base para o isolamento multi-gabinete. */
export interface Tenant {
  id: string;
  parlamentar: string;
  cargo: string;
  municipio: string;
  uf: string;
  plano: "Essencial" | "Profissional" | "Premium";
  assinatura: "ativa" | "teste" | "inadimplente" | "cancelada";
  usuarios: number;
  solicitacoes: number;
  corPrimaria: string;
  corSecundaria: string;
  logo?: string;
  foto?: string;
  equipe: string[];
  criadoEm: string;
}

export interface Citizen {
  id: string;
  tenantId: string;
  nome: string;
  bairro: string;
  email: string;
  telefone: string;
  criadoEm: string;
}

export interface Staff {
  id: string;
  tenantId: string;
  nome: string;
  cargo: string;
  email: string;
  cor: string;
  ativo: boolean;
  permissoes: Permission[];
}

export type Permission = "responder" | "encaminhar" | "gerar_oficio" | "publicar" | "gerir_equipe";

export interface TimelineEntry {
  id: string;
  status: Status;
  descricao: string;
  em: string;
}

export interface Message {
  id: string;
  autor: "cidadao" | "gabinete";
  autorNome: string;
  texto: string;
  em: string;
}

export interface InternalNote {
  id: string;
  autorNome: string;
  texto: string;
  em: string;
}

export interface Forwarding {
  id: string;
  orgao: string;
  descricao: string;
  em: string;
  prazo?: string;
}

export interface DocumentRef {
  id: string;
  nome: string;
  tipo: "oficio" | "anexo";
  em: string;
  oficioId?: string;
}

export interface HistoryEntry {
  id: string;
  texto: string;
  autorNome: string;
  em: string;
}

export interface RequestItem {
  id: string;
  tenantId: string;
  protocolo: string;
  citizenId: string;
  categoria: CategoryId;
  bairro: string;
  rua: string;
  numero: string;
  mapa: { x: number; y: number };
  descricao: string;
  fotos: string[];
  status: Status;
  prioridade: Priority;
  responsavelId: string | null;
  orgao: string;
  prazo: string | null;
  criadoEm: string;
  atualizadoEm: string;
  timeline: TimelineEntry[];
  mensagens: Message[];
  notasInternas: InternalNote[];
  encaminhamentos: Forwarding[];
  documentos: DocumentRef[];
  historico: HistoryEntry[];
  /** true quando o cidadão enviou mensagem não lida pelo gabinete */
  novaMensagemCidadao?: boolean;
}

export interface Notification {
  id: string;
  tenantId: string;
  citizenId: string;
  requestId: string;
  titulo: string;
  texto: string;
  em: string;
  lida: boolean;
}

export type PostType = "noticia" | "projeto" | "agenda" | "informativo" | "relatorio";

export interface Post {
  id: string;
  tenantId: string;
  tipo: PostType;
  titulo: string;
  resumo: string;
  corpo: string;
  data: string;
  /** projetos de lei */
  numero?: string;
  situacao?: string;
  /** agenda */
  local?: string;
  hora?: string;
  publicado: boolean;
}

export interface Oficio {
  id: string;
  tenantId: string;
  requestId: string;
  destinatario: string;
  secretaria: string;
  assunto: string;
  descricao: string;
  providencias: string;
  data: string;
  identificacao: string;
  numero: string;
  criadoEm: string;
}

export interface AppData {
  version: number;
  tenants: Tenant[];
  activeTenantId: string;
  citizens: Citizen[];
  staff: Staff[];
  requests: RequestItem[];
  notifications: Notification[];
  posts: Post[];
  oficios: Oficio[];
}

export interface Session {
  role: Role;
  citizenId: string;
  staffId: string;
}
