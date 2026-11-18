import { BAIRROS, CATEGORIES, CATEGORY_BY_ID } from "./constants";
import type {
  AppData, CategoryId, Citizen, HistoryEntry, Message, Post, Priority, RequestItem, Staff, Status, Tenant, TimelineEntry,
} from "./types";

export const DATA_VERSION = 1;
export const TENANT_ID = "gab-taubate";
export const DEFAULT_CITIZEN_ID = "cid-1";

function rng(seed: number) {
  return () => {
    seed |= 0; seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function placeholderPhoto(cat: CategoryId, label = "Foto ilustrativa"): string {
  const c = CATEGORY_BY_ID[cat].color;
  const svg = `<svg xmlns='http://www.w3.org/2000/svg' width='480' height='320'><rect width='480' height='320' fill='${c}' opacity='.14'/><rect x='0' y='220' width='480' height='100' fill='${c}' opacity='.22'/><circle cx='240' cy='130' r='46' fill='${c}' opacity='.55'/><text x='240' y='268' font-family='sans-serif' font-size='18' text-anchor='middle' fill='#14283F'>${label}</text></svg>`;
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}

export function avatarDataUri(name: string, color = "#14283F"): string {
  const ini = name.split(" ").filter(Boolean).slice(0, 2).map((s) => s[0]).join("").toUpperCase();
  const svg = `<svg xmlns='http://www.w3.org/2000/svg' width='160' height='160'><rect width='160' height='160' fill='${color}'/><text x='80' y='102' font-family='sans-serif' font-size='64' font-weight='600' text-anchor='middle' fill='white'>${ini}</text></svg>`;
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}

const FIRST = ["Mariana","Carlos","Aline","Roberto","Fernanda","Paulo","Luciana","Marcelo","Patrícia","André","Camila","Eduardo","Sandra","Rodrigo","Vanessa","Gustavo","Renata","Leandro","Cláudia","Felipe","Bianca","Sérgio","Tatiane","Diego","Elaine","Henrique","Priscila","Vitor","Simone","Márcio","Daniela","Lucas","Adriana","Fábio","Monique","Rogério","Larissa","Júlio","Cristina","Alexandre","Natália","Wagner","Isabela","Ricardo","Jéssica","Antônio","Débora","Bruno","Raquel","Otávio"];
const LAST = ["Costa","Souza","Oliveira","Ferreira","Almeida","Ribeiro","Carvalho","Pereira","Gomes","Martins","Barbosa","Rocha","Dias","Teixeira","Moura","Cardoso","Araújo","Nascimento","Lopes","Monteiro"];
const RUAS = ["Rua das Palmeiras","Rua Santa Clara","Avenida Brasil","Rua dos Ipês","Rua São Pedro","Avenida das Acácias","Rua Tiradentes","Rua Boa Vista","Rua das Orquídeas","Rua Sete de Setembro","Avenida Independência","Rua do Comércio","Rua Primavera","Rua Dom Pedro","Rua das Hortênsias","Rua Esperança"];

const DESC: Record<CategoryId, string[]> = {
  iluminacao: ["O poste em frente ao número indicado está com a lâmpada queimada há mais de duas semanas, deixando a rua escura à noite.","Várias luminárias apagadas no trecho da rua, causando sensação de insegurança para quem volta do trabalho.","Lâmpada piscando constantemente e poste inclinado próximo à praça."],
  pavimentacao: ["Buraco grande no meio da via, causando risco a motociclistas e danos aos veículos.","Asfalto afundando após as chuvas, formando uma cratera que aumenta a cada semana.","Calçada quebrada e com raízes expostas, dificultando a passagem de pedestres."],
  saude: ["Dificuldade de agendar consulta na unidade básica do bairro; a fila começa de madrugada.","Falta de medicamento de uso contínuo na farmácia da unidade de saúde.","Solicito informações sobre o agendamento de exame que aguardo há meses."],
  educacao: ["Falta de vagas na creche municipal próxima à minha residência.","Transporte escolar com atrasos frequentes, prejudicando a entrada dos alunos.","Pátio da escola com infiltrações e telhado danificado."],
  seguranca: ["Aumento de ocorrências de furto na região; solicito reforço da ronda e da iluminação.","Cruzamento sem sinalização, com acidentes frequentes.","Terreno abandonado servindo de ponto de uso irregular, preocupando os moradores."],
  transporte: ["Ônibus da linha do bairro passa com grande atraso e em número insuficiente nos horários de pico.","Ponto de ônibus sem cobertura nem assento, expondo os usuários ao sol e à chuva.","Solicito revisão do itinerário da linha para atender a nova área residencial."],
  limpeza: ["Entulho acumulado na esquina há vários dias, atraindo animais e mau cheiro.","Coleta de lixo não passou nas últimas semanas na rua.","Mato alto em terreno público, favorecendo a proliferação de insetos."],
  meio_ambiente: ["Árvore de grande porte com risco de queda sobre a calçada e a fiação.","Descarte irregular de resíduos próximo ao córrego.","Nascente com sinais de assoreamento e acúmulo de lixo."],
  acessibilidade: ["Ausência de rampa de acesso na calçada em frente à unidade de saúde.","Piso tátil danificado na travessia principal, dificultando a locomoção de pessoas com deficiência visual.","Semáforo sem sinal sonoro em cruzamento de grande movimento."],
  outros: ["Gostaria de sugerir a criação de um espaço de convivência para idosos no bairro.","Solicito informações sobre as atividades culturais abertas à população.","Sugestão de melhoria para a sinalização turística do centro."],
};

const STEP_TEXT: Record<Status, string> = {
  recebida: "Solicitação recebida pelo gabinete. Protocolo gerado.",
  em_analise: "A equipe do gabinete iniciou a análise da solicitação.",
  encaminhada: "Ofício parlamentar encaminhado ao órgão municipal responsável, solicitando providências.",
  aguardando_retorno: "Aguardando manifestação do órgão responsável.",
  em_acompanhamento: "O gabinete acompanha as providências informadas pelo órgão.",
  concluida: "O órgão municipal informou a conclusão das providências.",
  arquivada: "Atendimento encerrado: a demanda foi arquivada após orientação ao cidadão.",
};

const PATHS: Record<Status, Status[]> = {
  recebida: ["recebida"],
  em_analise: ["recebida", "em_analise"],
  encaminhada: ["recebida", "em_analise", "encaminhada"],
  aguardando_retorno: ["recebida", "em_analise", "encaminhada", "aguardando_retorno"],
  em_acompanhamento: ["recebida", "em_analise", "encaminhada", "aguardando_retorno", "em_acompanhamento"],
  concluida: ["recebida", "em_analise", "encaminhada", "aguardando_retorno", "concluida"],
  arquivada: ["recebida", "em_analise", "arquivada"],
};

const HOUR = 3600_000, DAY = 24 * HOUR;
const iso = (t: number) => new Date(t).toISOString();

export function makeProtocol(dateIso: string, n: number) {
  return `GD-${new Date(dateIso).getFullYear()}-${String(n).padStart(6, "0")}`;
}

export function buildStaff(): Staff[] {
  const all = ["responder", "encaminhar", "gerar_oficio", "publicar", "gerir_equipe"] as const;
  return [
    { id: "ass-1", tenantId: TENANT_ID, nome: "Rafael Moreira", cargo: "Chefe de gabinete", email: "rafael@demo.gabinetedigital.app", cor: "#2563EB", ativo: true, permissoes: [...all] },
    { id: "ass-2", tenantId: TENANT_ID, nome: "Juliana Prado", cargo: "Atendimento ao cidadão", email: "juliana@demo.gabinetedigital.app", cor: "#0d9488", ativo: true, permissoes: ["responder", "encaminhar", "gerar_oficio"] },
    { id: "ass-3", tenantId: TENANT_ID, nome: "Thiago Nogueira", cargo: "Assessor de infraestrutura", email: "thiago@demo.gabinetedigital.app", cor: "#f59e0b", ativo: true, permissoes: ["responder", "encaminhar", "gerar_oficio"] },
    { id: "ass-4", tenantId: TENANT_ID, nome: "Beatriz Lima", cargo: "Assessora de comunicação", email: "beatriz@demo.gabinetedigital.app", cor: "#8b5cf6", ativo: true, permissoes: ["responder", "publicar"] },
  ];
}

export function buildTenants(now: number): Tenant[] {
  return [
    { id: TENANT_ID, parlamentar: "Helena Duarte", cargo: "Vereadora", municipio: "Taubaté", uf: "SP", plano: "Profissional", assinatura: "ativa", usuarios: 54, solicitacoes: 80, corPrimaria: "#2563EB", corSecundaria: "#14283F", equipe: ["ass-1", "ass-2", "ass-3", "ass-4"], criadoEm: iso(now - 200 * DAY) },
    { id: "gab-pinda", parlamentar: "Ricardo Almeida", cargo: "Vereador", municipio: "Pindamonhangaba", uf: "SP", plano: "Essencial", assinatura: "teste", usuarios: 21, solicitacoes: 34, corPrimaria: "#0d9488", corSecundaria: "#0f2f2c", equipe: [], criadoEm: iso(now - 40 * DAY) },
    { id: "gab-sjc", parlamentar: "Camila Torres", cargo: "Vereadora", municipio: "São José dos Campos", uf: "SP", plano: "Premium", assinatura: "ativa", usuarios: 132, solicitacoes: 412, corPrimaria: "#7c3aed", corSecundaria: "#2e1a5a", equipe: [], criadoEm: iso(now - 320 * DAY) },
  ];
}

function buildPosts(now: number): Post[] {
  const d = (n: number) => iso(now - n * DAY).slice(0, 10);
  const fut = (n: number) => iso(now + n * DAY).slice(0, 10);
  const t = TENANT_ID;
  const posts: Post[] = [
    { id: "n1", tenantId: t, tipo: "noticia", titulo: "Gabinete amplia canal digital de atendimento à população", resumo: "Solicitações agora podem ser registradas e acompanhadas pelo celular.", corpo: "O gabinete passa a contar com um canal digital para o recebimento de solicitações. Cada pedido recebe um número de protocolo e pode ser acompanhado em linha do tempo. Lembramos que o gabinete atua no encaminhamento parlamentar aos órgãos competentes; a execução dos serviços é de responsabilidade do Poder Executivo.", data: d(2), publicado: true },
    { id: "n2", tenantId: t, tipo: "noticia", titulo: "Ofício solicita revisão da iluminação em corredores de grande circulação", resumo: "Documento reúne pedidos registrados por moradores de diferentes bairros.", corpo: "Com base nas solicitações recebidas, o gabinete encaminhou ofício à secretaria competente pedindo avaliação da iluminação em vias de grande circulação. O retorno do órgão será divulgado neste espaço.", data: d(6), publicado: true },
    { id: "n3", tenantId: t, tipo: "noticia", titulo: "Audiência pública debate mobilidade e transporte coletivo", resumo: "Encontro reuniu usuários, trabalhadores do setor e representantes do poder público.", corpo: "A audiência pública na Câmara Municipal recebeu contribuições de usuários do transporte coletivo sobre frequência de linhas, pontos de parada e acessibilidade. As sugestões serão sistematizadas em relatório.", data: d(11), publicado: true },
    { id: "n4", tenantId: t, tipo: "noticia", titulo: "Visita técnica avalia condições de unidade básica de saúde", resumo: "A equipe registrou demandas de moradores e as encaminhou à secretaria.", corpo: "Durante visita técnica, a equipe do gabinete registrou demandas relativas a agendamento de consultas e acessibilidade, encaminhando os apontamentos à Secretaria Municipal de Saúde.", data: d(15), publicado: true },
    { id: "n5", tenantId: t, tipo: "noticia", titulo: "Gabinete participa de debate sobre acessibilidade urbana", resumo: "Rampas, pisos táteis e travessias seguras estiveram em pauta.", corpo: "Em reunião com entidades de pessoas com deficiência, o gabinete ouviu relatos sobre barreiras na cidade e se comprometeu a encaminhar os apontamentos aos órgãos competentes.", data: d(20), publicado: true },
    { id: "n6", tenantId: t, tipo: "noticia", titulo: "Balanço mensal: 80 solicitações recebidas pelo canal digital", resumo: "Iluminação e pavimentação concentram a maior parte dos pedidos.", corpo: "O balanço (dados demonstrativos) mostra concentração de pedidos em iluminação pública e pavimentação, com tempo médio de resposta inicial abaixo de dois dias.", data: d(27), publicado: true },
    { id: "n7", tenantId: t, tipo: "noticia", titulo: "Oficina orienta moradores sobre como acompanhar serviços públicos", resumo: "Atividade apresentou os canais oficiais de atendimento do município.", corpo: "A oficina explicou como registrar demandas, acompanhar protocolos e quais canais oficiais o município disponibiliza.", data: d(34), publicado: true },
    { id: "n8", tenantId: t, tipo: "noticia", titulo: "Moradores apresentam demandas de limpeza urbana em reunião comunitária", resumo: "Pedidos foram registrados e encaminhados à secretaria responsável.", corpo: "Em reunião comunitária, moradores relataram acúmulo de entulho e falhas na coleta. Os registros foram formalizados no sistema de protocolo.", data: d(41), publicado: true },
    { id: "n9", tenantId: t, tipo: "noticia", titulo: "Gabinete recebe representantes de associação de bairro", resumo: "Encontro tratou de drenagem, calçadas e transporte.", corpo: "A associação apresentou um levantamento de pontos críticos do bairro. As demandas foram cadastradas para acompanhamento.", data: d(49), publicado: true },
    { id: "n10", tenantId: t, tipo: "noticia", titulo: "Seminário sobre educação infantil reúne profissionais da rede", resumo: "Debate abordou oferta de vagas e infraestrutura de creches.", corpo: "O seminário reuniu profissionais da educação para discutir a oferta de vagas e a infraestrutura das unidades. Os resultados subsidiarão ofícios aos órgãos competentes.", data: d(58), publicado: true },
    { id: "p1", tenantId: t, tipo: "projeto", numero: "PL 012/2026", titulo: "Institui o Programa Municipal de Acessibilidade em Calçadas", resumo: "Estabelece diretrizes para adequação de calçadas e travessias.", corpo: "Projeto de lei fictício, para fins de demonstração, que estabelece diretrizes para rampas, pisos táteis e travessias acessíveis em vias públicas.", situacao: "Em tramitação — Comissão de Justiça", data: d(18), publicado: true },
    { id: "p2", tenantId: t, tipo: "projeto", numero: "PL 019/2026", titulo: "Dispõe sobre a transparência na manutenção da iluminação pública", resumo: "Prevê a divulgação periódica de prazos e ordens de serviço.", corpo: "Projeto fictício que prevê a divulgação periódica, em portal público, de ordens de serviço de iluminação pública e respectivos prazos.", situacao: "Em tramitação — Comissão de Obras", data: d(45), publicado: true },
    { id: "p3", tenantId: t, tipo: "projeto", numero: "PL 027/2026", titulo: "Cria o selo Escola Acessível na rede municipal", resumo: "Reconhece unidades que cumprem critérios de acessibilidade.", corpo: "Projeto fictício que institui selo de reconhecimento a unidades de ensino que atendam a critérios de acessibilidade física e comunicacional.", situacao: "Aprovado em primeira discussão", data: d(70), publicado: true },
    { id: "p4", tenantId: t, tipo: "projeto", numero: "PL 031/2026", titulo: "Institui a Semana Municipal de Educação Ambiental", resumo: "Atividades educativas em escolas e espaços públicos.", corpo: "Projeto fictício que cria semana anual dedicada à educação ambiental, com atividades em escolas e espaços públicos.", situacao: "Aprovado", data: d(110), publicado: true },
    { id: "p5", tenantId: t, tipo: "projeto", numero: "PL 038/2026", titulo: "Dispõe sobre abrigos e cobertura em pontos de ônibus", resumo: "Define padrões mínimos de conforto e segurança para usuários.", corpo: "Projeto fictício que define padrões mínimos de cobertura, assento e iluminação em pontos de parada do transporte coletivo.", situacao: "Protocolado", data: d(4), publicado: true },
    { id: "a1", tenantId: t, tipo: "agenda", titulo: "Sessão ordinária da Câmara Municipal", resumo: "Sessão aberta ao público.", corpo: "Acompanhe a sessão presencialmente ou pela transmissão oficial da Câmara.", data: fut(2), hora: "18:00", local: "Câmara Municipal — Plenário", publicado: true },
    { id: "a2", tenantId: t, tipo: "agenda", titulo: "Atendimento público no gabinete", resumo: "Atendimento com agendamento prévio pelo canal digital.", corpo: "Atendimento presencial para orientação sobre protocolos e encaminhamentos.", data: fut(4), hora: "14:00", local: "Gabinete — Câmara Municipal", publicado: true },
    { id: "a3", tenantId: t, tipo: "agenda", titulo: "Audiência pública sobre acessibilidade urbana", resumo: "Participação aberta à comunidade.", corpo: "Debate sobre barreiras de acessibilidade na cidade, com participação de entidades.", data: fut(9), hora: "19:00", local: "Auditório Municipal", publicado: true },
    { id: "a4", tenantId: t, tipo: "agenda", titulo: "Reunião com associação de moradores", resumo: "Escuta de demandas comunitárias.", corpo: "Reunião para ouvir demandas e orientar sobre o fluxo de encaminhamento.", data: fut(14), hora: "10:00", local: "Associação do bairro Independência", publicado: true },
    { id: "i1", tenantId: t, tipo: "informativo", titulo: "Como funciona o encaminhamento parlamentar", resumo: "Entenda o papel do gabinete e dos órgãos municipais.", corpo: "O gabinete recebe sua solicitação, avalia e, quando cabível, encaminha por ofício ao órgão competente. A execução de obras e serviços é atribuição do Poder Executivo; o gabinete acompanha e informa as respostas recebidas, sem garantir prazo ou atendimento.", data: d(8), publicado: true },
    { id: "i2", tenantId: t, tipo: "informativo", titulo: "Canais oficiais de atendimento do município", resumo: "Lista de canais para serviços urgentes.", corpo: "Em emergências, utilize os canais oficiais (192 SAMU, 193 Bombeiros, 190 Polícia Militar). Este canal não substitui o atendimento de urgência.", data: d(30), publicado: true },
    { id: "r1", tenantId: t, tipo: "relatorio", titulo: "Relatório de atividades — 1º semestre", resumo: "Síntese das atividades parlamentares e do atendimento ao cidadão.", corpo: "Relatório demonstrativo: 80 solicitações recebidas, 41 encaminhadas por ofício, 9 audiências e reuniões realizadas e 5 projetos de lei apresentados.", data: d(60), publicado: true },
    { id: "r2", tenantId: t, tipo: "relatorio", titulo: "Relatório de atividades — mês anterior", resumo: "Resumo mensal dos atendimentos e encaminhamentos.", corpo: "Relatório demonstrativo com indicadores de atendimento, tempo médio de resposta inicial e principais temas.", data: d(12), publicado: true },
  ];
  return posts;
}

export function buildSeed(now = Date.now()): AppData {
  const r = rng(20260);
  const pick = <T,>(a: T[]) => a[Math.floor(r() * a.length)];

  const citizens: Citizen[] = Array.from({ length: 50 }, (_, i) => {
    const nome = `${FIRST[i]} ${LAST[(i * 7) % LAST.length]}`;
    const b = BAIRROS[i % BAIRROS.length].nome;
    return { id: `cid-${i + 1}`, tenantId: TENANT_ID, nome, bairro: b, email: `cidadao${i + 1}@exemplo.demo`, telefone: `(12) 9${String(1000 + i * 37).padStart(4, "0")}-${String(2000 + i * 53).slice(-4)}`, criadoEm: iso(now - (30 + i * 3) * DAY) };
  });
  const staff = buildStaff();

  const catWeights: CategoryId[] = ["iluminacao","iluminacao","iluminacao","iluminacao","iluminacao","pavimentacao","pavimentacao","pavimentacao","pavimentacao","saude","saude","saude","educacao","educacao","seguranca","seguranca","transporte","transporte","limpeza","limpeza","limpeza","meio_ambiente","acessibilidade","acessibilidade","outros"];
  const statusWeights: Status[] = ["recebida","recebida","recebida","em_analise","em_analise","em_analise","encaminhada","encaminhada","encaminhada","encaminhada","aguardando_retorno","aguardando_retorno","aguardando_retorno","em_acompanhamento","em_acompanhamento","concluida","concluida","concluida","concluida","concluida","concluida","arquivada"];
  const prios: Priority[] = ["baixa", "media", "media", "media", "alta", "alta", "urgente"];

  const requests: RequestItem[] = [];
  for (let i = 0; i < 80; i++) {
    const cat = pick(catWeights);
    const status = statusWeights[Math.floor(r() * statusWeights.length)];
    // distribui as datas em ~8 meses; mais recentes → status iniciais
    const ageDays = status === "recebida" ? 0.2 + r() * 6 : status === "em_analise" ? 2 + r() * 12 : 6 + r() * 215;
    const created = now - ageDays * DAY;
    const b = BAIRROS[Math.floor(r() * BAIRROS.length)];
    const mapa = { x: Math.min(96, Math.max(4, b.x + (r() - 0.5) * 12)), y: Math.min(96, Math.max(4, b.y + (r() - 0.5) * 12)) };
    const citizenId = i < 4 ? DEFAULT_CITIZEN_ID : `cid-${1 + Math.floor(r() * 50)}`;
    const rua = pick(RUAS);
    const path = PATHS[status];
    const span = Math.min(now - created, (3 + r() * 35) * DAY);
    const timeline: TimelineEntry[] = path.map((s, k) => ({
      id: `tl-${i}-${k}`,
      status: s,
      descricao: STEP_TEXT[s],
      em: iso(created + (span * 0.85 * k) / Math.max(1, path.length - 1 || 1) + (k === 0 ? 0 : 2 * HOUR)),
    }));
    if (path.length === 1) timeline[0].em = iso(created);
    const resp = status === "recebida" ? null : staff[Math.floor(r() * 3)].id;
    const orgao = CATEGORY_BY_ID[cat].orgao;
    const forwarded = path.includes("encaminhada");
    const encEm = timeline.find((t) => t.status === "encaminhada")?.em;
    const protoDate = iso(created);
    const mensagens: Message[] = [];
    const historico: HistoryEntry[] = [{ id: `h-${i}-0`, texto: "Solicitação registrada pelo cidadão.", autorNome: "Sistema", em: iso(created) }];
    if (resp) historico.push({ id: `h-${i}-1`, texto: `Atribuída a ${staff.find((s) => s.id === resp)!.nome}.`, autorNome: "Sistema", em: iso(created + 3 * HOUR) });
    if (status !== "recebida" && r() > 0.45) {
      mensagens.push({ id: `m-${i}-1`, autor: "gabinete", autorNome: "Gabinete", texto: "Olá! Recebemos sua solicitação e ela está sendo analisada pela nossa equipe. Voltaremos a atualizar este protocolo.", em: iso(created + 5 * HOUR) });
      if (r() > 0.6) mensagens.push({ id: `m-${i}-2`, autor: "cidadao", autorNome: citizens.find((c) => c.id === citizenId)!.nome, texto: "Obrigado pelo retorno! Fico no aguardo.", em: iso(created + 9 * HOUR) });
    }
    requests.push({
      id: `req-${i + 1}`,
      tenantId: TENANT_ID,
      protocolo: makeProtocol(protoDate, 1000 + i),
      citizenId,
      categoria: cat,
      bairro: b.nome,
      rua,
      numero: String(Math.floor(r() * 900) + 10),
      mapa,
      descricao: pick(DESC[cat]),
      fotos: r() > 0.65 ? [placeholderPhoto(cat)] : [],
      status,
      prioridade: pick(prios),
      responsavelId: resp,
      orgao,
      prazo: forwarded ? iso(new Date(encEm!).getTime() + 30 * DAY).slice(0, 10) : null,
      criadoEm: iso(created),
      atualizadoEm: timeline[timeline.length - 1].em,
      timeline,
      mensagens,
      notasInternas: r() > 0.7 ? [{ id: `ni-${i}`, autorNome: staff[0].nome, texto: "Verificar se já existe pedido semelhante na mesma rua antes de enviar o ofício.", em: iso(created + DAY) }] : [],
      encaminhamentos: forwarded ? [{ id: `f-${i}`, orgao, descricao: `Ofício parlamentar encaminhado à ${CATEGORY_BY_ID[cat].secretaria}.`, em: encEm!, prazo: iso(new Date(encEm!).getTime() + 30 * DAY).slice(0, 10) }] : [],
      documentos: forwarded ? [{ id: `d-${i}`, nome: `Ofício — ${makeProtocol(protoDate, 1000 + i)}`, tipo: "oficio", em: encEm! }] : [],
      historico,
    });
  }
  requests.sort((a, b) => +new Date(b.criadoEm) - +new Date(a.criadoEm));

  const notifications = requests
    .filter((q) => q.citizenId === DEFAULT_CITIZEN_ID && q.timeline.length > 1)
    .flatMap((q, k) => {
      const last = q.timeline[q.timeline.length - 1];
      return [{ id: `nt-${q.id}`, tenantId: TENANT_ID, citizenId: DEFAULT_CITIZEN_ID, requestId: q.id, titulo: `Atualização no protocolo ${q.protocolo}`, texto: `Novo status: ${last.descricao}`, em: last.em, lida: k > 0 }];
    });

  return {
    version: DATA_VERSION,
    tenants: buildTenants(now),
    activeTenantId: TENANT_ID,
    citizens,
    staff,
    requests,
    notifications,
    posts: buildPosts(now),
    oficios: [],
  };
}

export { CATEGORIES };
