import Link from "next/link";

export const metadata = { title: "Política de privacidade (demonstrativa)" };

const S = [
  ["Natureza desta política", "Esta é uma política de privacidade demonstrativa, criada para ilustrar como a plataforma tratará dados em produção. O protótipo não coleta dados reais: todas as informações exibidas são fictícias e permanecem apenas no navegador do usuário (localStorage)."],
  ["Dados tratados", "Nome, bairro, contato opcional, descrição da solicitação, localização aproximada e fotografias enviadas voluntariamente. A plataforma não solicita CPF, título de eleitor, preferência política ou qualquer dado sensível."],
  ["Finalidade", "Registrar, encaminhar e acompanhar solicitações dirigidas ao gabinete parlamentar e informar o cidadão sobre o andamento. Não há uso para campanha eleitoral, perfilamento político ou pedido de voto."],
  ["Base legal e compartilhamento", "Em produção, o tratamento observará a Lei Geral de Proteção de Dados (Lei 13.709/2018). Dados poderão ser compartilhados com órgãos municipais apenas na medida necessária ao encaminhamento, em ofícios que não identifiquem o cidadão sem necessidade."],
  ["Papel do gabinete", "O gabinete realiza encaminhamento parlamentar. Não executa obras ou serviços municipais e não garante o atendimento das solicitações pela prefeitura."],
  ["Seus direitos", "Acesso, correção, anonimização, portabilidade e exclusão dos dados, mediante solicitação ao encarregado de dados do gabinete (a ser definido em produção)."],
  ["Retenção e segurança", "Em produção: prazos definidos de retenção, criptografia em trânsito e em repouso, controle de acesso por perfil e isolamento de dados entre gabinetes."],
  ["Restaurar dados do protótipo", "Na tela inicial é possível restaurar os dados demonstrativos a qualquer momento. Limpar os dados do site no navegador também remove todo o conteúdo."],
] as const;

export default function Privacidade() {
  return (
    <div className="min-h-dvh">
      <div className="bg-navy px-4 py-1.5 text-center text-[11px] font-semibold tracking-wide text-white/80">AMBIENTE DE DEMONSTRAÇÃO</div>
      <main id="conteudo" className="mx-auto max-w-2xl px-4 py-10">
        <Link href="/" className="text-sm font-medium text-brand">← Início</Link>
        <h1 className="mt-3 text-3xl font-bold tracking-tight">Política de privacidade</h1>
        <p className="mt-1 text-sm text-slate-500">Documento demonstrativo — sem validade jurídica.</p>
        <div className="mt-6 space-y-3">
          {S.map(([t, d], i) => (
            <section key={t} className="card p-5"><h2 className="font-bold">{i + 1}. {t}</h2><p className="mt-1.5 text-sm leading-relaxed text-slate-600">{d}</p></section>
          ))}
        </div>
      </main>
    </div>
  );
}
