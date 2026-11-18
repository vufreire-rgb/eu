# Arquitetura — Gabinete Digital

## Princípios
1. **Multi-tenant por coluna**: cada gabinete é um `tenant`; toda entidade (`citizens`, `staff`, `requests`, `notifications`, `posts`, `oficios`) possui `tenantId`.
2. **Acesso a dados atrás de uma interface** (`src/lib/repository.ts`): hoje `localStorage`; amanhã um adaptador Supabase sem alterar telas.
3. **Estado e regras de negócio** em `src/lib/store.tsx` (criação de protocolo, linha do tempo pública vs. histórico/observações internas, notificações).
4. **Separação de visibilidade**: `timeline`/`mensagens` são públicas ao cidadão; `notasInternas` e `historico` só existem na UI do gabinete.

## Perfis
| Perfil | Escopo |
|---|---|
| Cidadão | Apenas as próprias solicitações/notificações do tenant |
| Assessor | Solicitações do tenant, conforme permissões granulares |
| Vereadora (parlamentar) | Tudo do próprio tenant |
| Admin da plataforma | Metadados de tenants/assinaturas; **sem** acesso ao conteúdo das solicitações |

## Caminho para Supabase
- `supabase/schema.sql`: tabelas, enums, índices e políticas RLS baseadas em `tenant_id` e `role` no JWT (`app_metadata`).
- Autenticação: Supabase Auth (e-mail/OTP para cidadão; e-mail+senha para equipe), claim `tenant_id`/`role` via hook.
- Storage: bucket por tenant para fotos e ofícios (path `tenant_id/...`), URLs assinadas.
- Realtime: canal `requests` filtrado por `tenant_id` para notificações.
- Implementar `SupabaseRepository implements DataRepository`, trocar a instância exportada e tornar as ações do store assíncronas.

## Isolamento
RLS como barreira primária (nunca confiar em filtros do cliente); chaves de serviço apenas em rotas de servidor; auditoria (`request_history`) imutável; retenção e exclusão por tenant (LGPD).
