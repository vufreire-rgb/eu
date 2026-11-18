import { Database, KeyRound, Layers, ShieldCheck } from "lucide-react";
import { PageHeader } from "@/components/ui";

const BLOCKS = [
  [Layers, "Multi-tenant por coluna", "Todas as tabelas possuem tenant_id. Um gabinete = um tenant. A camada de acesso (DataRepository) sempre filtra por tenant."],
  [ShieldCheck, "Isolamento (RLS)", "No Supabase, políticas Row Level Security restringem leitura e escrita ao tenant do usuário autenticado (claim no JWT)."],
  [KeyRound, "Perfis e permissões", "Cidadão, assessor, parlamentar e administrador da plataforma. Permissões granulares por assessor (responder, encaminhar, ofício, publicar, gerir equipe)."],
  [Database, "Preparação para Supabase", "supabase/schema.sql traz o modelo relacional; src/lib/repository.ts define a interface a ser implementada por um adaptador Supabase."],
] as const;

export default function Arch() {
  return (
    <>
      <PageHeader title="Arquitetura conceitual" subtitle="Como o protótipo evolui para um SaaS multi-gabinete" />
      <div className="grid gap-3 md:grid-cols-2">
        {BLOCKS.map(([I, t, d]) => <section key={t} className="card p-5"><span className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-50 text-brand"><I size={20} /></span><h2 className="mt-3 font-bold">{t}</h2><p className="mt-1 text-sm text-slate-600">{d}</p></section>)}
      </div>
      <p className="mt-4 text-xs text-slate-400">Detalhes completos em ARQUITETURA.md e supabase/schema.sql. Nenhuma cobrança real é implementada nesta etapa.</p>
    </>
  );
}
